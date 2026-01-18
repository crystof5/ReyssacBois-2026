const fs = require("fs")
const path = require("path")

const { readLegacyArrayFromInitFile } = require("./legacy-extract")
const { parse } = require("csv-parse/sync")

/**
 * CSV "propre" (versionnable, réutilisable) :
 * - échappement CSV robuste
 * - reconstruit les relations produit ↔ catégories via SLUGS
 * - n'exporte PAS les IDs numériques legacy
 *
 * Format attendu:
 *   slug,name,description,section,length,species,standard,categories
 *   categories = liste de slugs séparés par "|"
 */

function toStr(v) {
  if (v === null || v === undefined) return ""
  // Normalise (Windows) + supprime espaces/retours inutiles en début/fin
  // → CSV plus "propre" et stable (sans inventer de contenu)
  return String(v).replace(/\r\n/g, "\n").trim()
}

function csvCell(v) {
  const s = toStr(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function csvRow(values) {
  return values.map(csvCell).join(",")
}

function uniq(arr) {
  const out = []
  const seen = new Set()
  for (const v of arr) {
    if (!v) continue
    if (seen.has(v)) continue
    seen.add(v)
    out.push(v)
  }
  return out
}

function pickLatestFileConfirmed(dir, prefix, suffix) {
  if (!fs.existsSync(dir)) return null
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(suffix))
    .sort()
  if (!files.length) return null
  return path.join(dir, files[files.length - 1])
}

function readPipeCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8")
  return parse(raw, {
    columns: true,
    delimiter: "|",
    quote: '"',
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
  })
}

function safeJsonParse(s) {
  const str = toStr(s).trim()
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    // certains exports doublent les guillemets: {""k"":""v""}
    // on tente une normalisation minimale (sans inventer de données)
    try {
      return JSON.parse(str.replace(/""/g, '"'))
    } catch {
      return null
    }
  }
}

function normalizeComparable(s) {
  return toStr(s).trim().replace(/\r\n/g, "\n")
}

function sortPipeList(s) {
  const parts = toStr(s)
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
  const u = uniq(parts)
  u.sort((a, b) => a.localeCompare(b, "fr"))
  return u.join("|")
}

function main() {
  const scriptsDir = __dirname

  // ✅ Source de vérité préférée: exports DB
  // fallback: init_*.js (legacy)
  const exportCategoriesPath = pickLatestFileConfirmed(scriptsDir, "categories_", ".csv")
  const exportItemsPath = pickLatestFileConfirmed(scriptsDir, "items_", ".csv")

  /** @type {Array<any>} */
  let legacyCategories
  /** @type {Array<any>} */
  let legacyItems
  let usingExports = false
  let sourceLabel = "legacy init_*.js"

  if (exportCategoriesPath && exportItemsPath) {
    legacyCategories = readPipeCsv(exportCategoriesPath)
    legacyItems = readPipeCsv(exportItemsPath)
    usingExports = true
    sourceLabel = `${path.basename(exportCategoriesPath)} + ${path.basename(exportItemsPath)}`
  } else {
    const legacyCategoriesPath = path.join(__dirname, "init_categories.js")
    const legacyItemsPath = path.join(__dirname, "init_items.js")
    legacyCategories = readLegacyArrayFromInitFile(legacyCategoriesPath, "categories")
    legacyItems = readLegacyArrayFromInitFile(legacyItemsPath, "items")
  }

  // Optionnel: permet de résoudre des id_category absents de init_categories.js
  // sans modifier les fichiers legacy (utile si les IDs ont dérivé / données incomplètes).
  //
  // Format:
  // {
  //   "90": "volets",
  //   "93": "volets"
  // }
  //
  // Chaque valeur doit être un slug de catégorie EXISTANT (is_item=0) dans init_categories.js.
  const overridesPath = path.join(__dirname, "legacy-category-id-overrides.json")
  /** @type {Record<string, string>} */
  const idCategoryOverrides = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf8"))
    : {}

  // Optionnel: permet de résoudre les collisions de slug entre sources (ex: slug identique dans items et categories type=product).
  // Format recommandé (stable): clé = "<source>:<id>" → valeur = nouveau slug
  // Ex:
  // {
  //   "categories:54": "palapi-exotique",
  //   "items:43": "palapi-volets"
  // }
  const productSlugOverridesPath = path.join(__dirname, "product-slug-overrides.json")
  /** @type {Record<string, string>} */
  const productSlugOverrides = fs.existsSync(productSlugOverridesPath)
    ? JSON.parse(fs.readFileSync(productSlugOverridesPath, "utf8"))
    : {}

  // Index catégories legacy par id numérique → reconstruction hiérarchie
  const categoryById = new Map()
  for (const c of legacyCategories) {
    if (c && typeof c.id !== "undefined") categoryById.set(Number(c.id), c)
  }

  // Dans l'export DB, certains type=product servent de "dossiers" (parents d'autres produits).
  // On les considère comme des catégories logiques (cat nodes) pour reconstruire une hiérarchie.
  const exportParentIds = usingExports
    ? new Set(
        legacyCategories
          .map((r) => Number(r?.parentId || 0))
          .filter((id) => id && !Number.isNaN(id))
      )
    : new Set()

  function isCategoryNode(row) {
    if (!row) return false
    if (!usingExports) return Number(row.is_item) === 0
    const t = String(row.type)
    if (t === "category") return true
    if (t === "product") return exportParentIds.has(Number(row.id)) // nœud de regroupement
    return false
  }

  // Index des catégories "réelles" (is_item=0) par slug (pour overrides)
  const categoryBySlug = new Map()
  for (const c of legacyCategories) {
    if (!isCategoryNode(c)) continue
    if (!c?.slug) continue
    categoryBySlug.set(c.slug, c)
  }

  // Références id_category non résolues (pour rapport d'erreur exploitable)
  /** @type {Map<number, Array<{ productSlug: string, source: string }>>} */
  const missingCategoryRefs = new Map()

  function recordMissingCategory(categoryId, productSlug, source) {
    const id = Number(categoryId)
    if (!missingCategoryRefs.has(id)) missingCategoryRefs.set(id, [])
    missingCategoryRefs.get(id).push({ productSlug, source })
  }

  // Ensemble des slugs de "vraies" catégories (is_item=0) pour validation
  const validCategorySlugs = new Set(
    legacyCategories
      .filter((c) => isCategoryNode(c))
      .map((c) => c.slug)
      .filter(Boolean)
  )

  function categorySlugsFromCategoryId(categoryId, productSlug, source) {
    const idNum = Number(categoryId)

    // 1) Résolution directe via init_categories.js (id numérique)
    let start = categoryById.get(idNum)

    // 2) Fallback: override id -> slug (slug doit exister dans init_categories.js)
    if (!start) {
      const overrideSlug = idCategoryOverrides[String(idNum)]
      if (overrideSlug) {
        const bySlug = categoryBySlug.get(overrideSlug)
        if (bySlug) start = bySlug
      }
    }

    if (!start) {
      recordMissingCategory(categoryId, productSlug, source)
      return null
    }

    if (!isCategoryNode(start)) {
      // Cas réel observé dans les exports: items.id_category pointe parfois vers un enregistrement type=product
      // (ex: une "lame" spécifique) dont le parentId pointe vers la vraie catégorie (ex: volets).
      // On n'invente rien: on remonte simplement la chaîne parent jusqu'à une catégorie logique.
      if (usingExports && String(start.type) === "product") {
        const parentId = Number(start.parentId || 0)
        if (!parentId) {
          throw new Error(
            `Référence id_category vers un produit racine sans parent category (id=${categoryId}, slug=${start.slug})`
          )
        }
        return categorySlugsFromParentId(parentId, productSlug, source)
      }

      throw new Error(
        `Référence id_category vers une entrée qui n'est pas une catégorie logique (id=${categoryId}, slug=${start.slug})`
      )
    }

    // On inclut la catégorie directe + ses parents (utile pour filtrer au niveau racine)
    const slugs = []
    let cur = start
    while (cur) {
      if (isCategoryNode(cur) && cur.slug) slugs.push(cur.slug)

      const parentId = usingExports ? Number(cur.parentId || 0) : Number(cur.id_cat_parent || 0)
      if (!parentId) break
      cur = categoryById.get(parentId)
      if (!cur) throw new Error(`Chaîne parent cassée: parentId=${parentId} (depuis id=${categoryId})`)
    }
    return uniq(slugs)
  }

  function categorySlugsFromParentId(parentId, productSlug, source) {
    const pid = Number(parentId || 0)
    if (!pid) return []
    return categorySlugsFromCategoryId(pid, productSlug, source) || []
  }

  const products = []
  const droppedType = [] // on loggue pour visibilité
  const collisions = []

  // Merge helper (si même slug apparaît dans 2 sources)
  /** @type {Map<string, any>} */
  const byProductSlug = new Map()

  function upsertProduct(p) {
    const slug = toStr(p.slug)
    if (!slug) throw new Error("Produit sans slug (après normalisation)")

    const existing = byProductSlug.get(slug)
    if (!existing) {
      byProductSlug.set(slug, p)
      return
    }

    // Collision de slug entre 2 enregistrements distincts → nécessite un override explicite.
    // Par défaut, on N'ÉCHOUE PLUS: on garde le 1er et on ignore le 2e, en logguant la collision.
    // (Comme demandé: "au pire tu les ignore... et tu me fais un log")
    if (existing.__key && p.__key && existing.__key !== p.__key) {
      collisions.push({
        slug,
        kept: {
          key: existing.__key,
          source: existing.__source,
          id: existing.__key,
          name: toStr(existing.name),
          categories: toStr(existing.categories),
        },
        ignored: {
          key: p.__key,
          source: p.__source,
          id: p.__key,
          name: toStr(p.name),
          categories: toStr(p.categories),
        },
      })
      return
    }

    // merge conservatif: on complète les champs vides, on union les catégories,
    // et on échoue s'il y a un conflit réel.
    const fields = ["name", "description", "section", "length", "species", "standard"]
    for (const f of fields) {
      const a = normalizeComparable(existing[f])
      const b = normalizeComparable(p[f])
      if (!a && b) existing[f] = p[f]
      else if (a && b && a !== b) {
        throw new Error(
          `Conflit sur le produit slug=${slug} champ=${f}\n- sourceA: ${existing.__source}\n- sourceB: ${p.__source}`
        )
      }
    }

    const aCats = toStr(existing.categories)
    const bCats = toStr(p.categories)
    existing.categories = sortPipeList([aCats, bCats].filter(Boolean).join("|"))

    existing.__notes = uniq([...(existing.__notes || []), ...(p.__notes || [])])
  }

  // A) Produits legacy stockés dans init_categories.js (is_item=1)
  if (!usingExports) {
    for (const c of legacyCategories.filter((x) => Number(x?.is_item) === 1)) {
      if (!c?.slug) throw new Error("Produit legacy (is_item=1) sans slug dans init_categories.js")

    // NOTE: l'ancien modèle a un champ `type` qui n'existe pas dans la cible CSV demandée.
    // Pour ne pas perdre d'info, on l'ajoute à la description sous forme de note (sans inventer de données).
    let description = toStr(c.descriptif)
    if (c.type) {
      droppedType.push({ slug: c.slug, type: c.type, source: "init_categories.js" })
      description = description
        ? `${description}\n\n(Type: ${toStr(c.type)})`
        : `(Type: ${toStr(c.type)})`
    }

      upsertProduct({
        slug: toStr(c.slug),
        name: toStr(c.nom),
        description,
        section: toStr(c.section),
        length: toStr(c.longueur),
        species: toStr(c.essence),
        standard: toStr(c.norme),
        categories: sortPipeList(categorySlugsFromParentId(c.id_cat_parent, c.slug, "init_categories.js").join("|")),
        __source: "init_categories.js",
        __notes: c.type ? [`Type: ${toStr(c.type)}`] : [],
      })
    }
  }

  if (usingExports) {
    // A') Produits stockés dans categories export (type=product) MAIS uniquement les feuilles
    // (les nœuds de regroupement sont traités comme catégories dans categories.csv)
    for (const c of legacyCategories.filter((x) => String(x?.type) === "product" && !exportParentIds.has(Number(x?.id)))) {
      if (!c?.slug) throw new Error("Produit (type=product) sans slug dans categories export")

      const specs = safeJsonParse(c.specifications) || {}
      const notes = []
      if (specs.type) notes.push(`Type: ${toStr(specs.type)}`)

      const key = `categories:${toStr(c.id)}`
      const overriddenSlug = productSlugOverrides[key]

      upsertProduct({
        slug: overriddenSlug ? toStr(overriddenSlug) : toStr(c.slug),
        name: toStr(c.name),
        description: toStr(c.description),
        section: toStr(specs.section),
        length: toStr(specs.longueur),
        species: toStr(specs.essence),
        standard: toStr(specs.norme),
        categories: sortPipeList(
          // Ici on rattache à la "catégorie logique" la plus proche dans la chaîne parent (category ou nœud de regroupement)
          categorySlugsFromParentId(c.parentId, c.slug, "categories export (type=product)").join("|")
        ),
        __source: "categories export (type=product)",
        __notes: notes,
        __key: key,
      })
    }
  }

  // B) Produits stockés dans init_items.js (legacy) OU items export (DB)
  for (const it of legacyItems) {
    const slug = usingExports ? it.slug : it.slug
    if (!slug) throw new Error(usingExports ? "Item export sans slug" : "Item legacy sans slug dans init_items.js")

    const catId = usingExports ? it.id_category : it.id_category
    if (!catId) throw new Error(`Item sans id_category (slug=${slug})`)

    const notes = []
    if (it.type) {
      droppedType.push({ slug, type: it.type, source: usingExports ? "items export" : "init_items.js" })
      notes.push(`Type: ${toStr(it.type)}`)
    }

    const catSlugs = categorySlugsFromCategoryId(catId, slug, usingExports ? "items export" : "init_items.js")

    const key = usingExports ? `items:${toStr(it.id)}` : null
    const overriddenSlug = key ? productSlugOverrides[key] : null

    upsertProduct({
      slug: overriddenSlug ? toStr(overriddenSlug) : toStr(slug),
      name: toStr(usingExports ? it.nom : it.nom),
      description: toStr(it.descriptif),
      section: toStr(it.section),
      length: toStr(it.longueur),
      species: toStr(it.essence),
      standard: toStr(it.norme),
      categories: sortPipeList((catSlugs || []).join("|")),
      __source: usingExports ? "items export" : "init_items.js",
      __notes: notes,
      __key: key,
    })
  }

  // Si des id_category ne sont pas résolubles, on STOPPE: on ne peut pas reconstruire les relations sans inventer.
  if (missingCategoryRefs.size) {
    const lines = []
    const ids = Array.from(missingCategoryRefs.keys()).sort((a, b) => a - b)
    for (const id of ids) {
      const refs = missingCategoryRefs.get(id) || []
      const examples = refs.slice(0, 10).map((r) => `${r.productSlug} (${r.source})`).join(", ")
      lines.push(`- id_category=${id} référencé par: ${examples}${refs.length > 10 ? " …" : ""}`)
    }

    throw new Error(
      [
        "Catégories legacy introuvables pour certains produits.",
        "Pour respecter la contrainte 'ne pas inventer', il faut compléter la source de vérité:",
        "- soit ajouter les catégories manquantes (avec leurs id numériques) dans init_categories.js,",
        "- soit corriger les id_category dans init_items.js.",
        "",
        ...lines,
      ].join("\n")
    )
  }

  // Matérialise la liste après merge
  for (const p of byProductSlug.values()) {
    // Ajoute notes (type legacy etc) dans description (sans inventer)
    if (p.__notes && p.__notes.length) {
      const noteText = p.__notes.map((n) => `(${n})`).join(" ")
      p.description = normalizeComparable(p.description)
        ? `${normalizeComparable(p.description)}\n\n${noteText}`
        : noteText
    }
    products.push(p)
  }

  // Validation: toutes les catégories référencées existent (is_item=0)
  for (const p of products) {
    const slugs = toStr(p.categories).split("|").filter(Boolean)
    for (const s of slugs) {
      if (!validCategorySlugs.has(s)) {
        throw new Error(`Produit ${p.slug}: catégorie inconnue (ou is_item=1): ${s}`)
      }
    }
  }

  // Tri stable → CSV versionnable
  products.sort((a, b) => a.slug.localeCompare(b.slug, "fr"))

  const rows = []
  rows.push(csvRow(["slug", "name", "description", "section", "length", "species", "standard", "categories"]))

  for (const p of products) {
    rows.push(csvRow([
      p.slug,
      p.name,
      p.description,
      p.section,
      p.length,
      p.species,
      p.standard,
      p.categories,
    ]))
  }

  const outPath = path.join(__dirname, "../data/products.csv")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, rows.join("\n"), "utf8")

  console.log(`✅ products.csv généré (${products.length} produits) depuis ${sourceLabel} → ${outPath}`)
  if (droppedType.length) {
    console.log(
      `ℹ️ Note: ${droppedType.length} produits contenaient un champ legacy "type" (ajouté en note dans description).`
    )
  }
  if (collisions.length) {
    const collisionsPath = path.join(__dirname, "../data/products-collisions.json")
    fs.writeFileSync(collisionsPath, JSON.stringify(collisions, null, 2), "utf8")
    console.log(`⚠️ Collisions de slug: ${collisions.length} (ignorées). Détails → ${collisionsPath}`)
  }
}

main()
