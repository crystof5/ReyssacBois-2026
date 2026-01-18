const fs = require("fs")
const path = require("path")

const { readLegacyArrayFromInitFile } = require("./legacy-extract")
const { parse } = require("csv-parse/sync")

/**
 * CSV "propre" (versionnable, réutilisable) :
 * - échappe correctement les guillemets, virgules, sauts de ligne
 * - n'exporte PAS les IDs numériques legacy
 * - reconstruit la hiérarchie via parent_slug (par slug)
 *
 * Format attendu:
 *   slug,name,description,parent_slug,imageUrl
 */

function toStr(v) {
  if (v === null || v === undefined) return ""
  // Normalise (Windows) + supprime espaces/retours inutiles en début/fin
  // → CSV plus "propre" et stable (sans inventer de contenu)
  return String(v).replace(/\r\n/g, "\n").trim()
}

function csvCell(v) {
  const s = toStr(v)
  // on quote dès qu'il y a un caractère "problématique" en CSV
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function csvRow(values) {
  return values.map(csvCell).join(",")
}

function pickLatestFileConfirmed(dir, prefix, suffix) {
  if (!fs.existsSync(dir)) return null
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(suffix))
    .sort() // le timestamp est dans le nom → tri lexicographique OK
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

function main() {
  // ✅ Source de vérité préférée: export DB (pipe-delimited)
  // fallback: init_categories.js (legacy)
  const scriptsDir = __dirname
  const exportPath = pickLatestFileConfirmed(scriptsDir, "categories_", ".csv")

  /** @type {Array<any>} */
  let legacyCategories
  let sourceLabel

  if (exportPath) {
    legacyCategories = readPipeCsv(exportPath)
    sourceLabel = path.basename(exportPath)
  } else {
    const legacyPath = path.join(__dirname, "init_categories.js")
    legacyCategories = readLegacyArrayFromInitFile(legacyPath, "categories")
    sourceLabel = "init_categories.js"
  }

  const byId = new Map()
  for (const c of legacyCategories) {
    if (c && typeof c.id !== "undefined") byId.set(Number(c.id), c)
  }

  // On ne conserve que les "vraies" catégories.
  // - export DB: type === "category"
  // - legacy init: is_item === 0
  let cats
  if (exportPath) {
    // Dans l'ancienne app, certains enregistrements type=product servent de "dossiers" (parents d'autres produits).
    // On les traite comme catégories pour pouvoir reconstruire une hiérarchie exploitable sans inventer de données.
    const parentIds = new Set(
      legacyCategories
        .map((r) => Number(r?.parentId || 0))
        .filter((id) => id && !Number.isNaN(id))
    )

    cats = legacyCategories.filter((c) => {
      const t = String(c?.type)
      if (t === "category") return true
      if (t === "product") return parentIds.has(Number(c?.id)) // nœud de regroupement
      return false
    })
  } else {
    cats = legacyCategories.filter((c) => Number(c?.is_item) === 0)
  }

  // Validation: unicité des slugs de catégories
  const seen = new Set()
  for (const c of cats) {
    if (!c?.slug) throw new Error("Catégorie sans slug (source legacy).")
    if (seen.has(c.slug)) throw new Error(`Slug de catégorie dupliqué: ${c.slug}`)
    seen.add(c.slug)
  }

  const rows = []
  rows.push(csvRow(["slug", "name", "description", "parent_slug", "imageUrl"]))

  const out = cats.map((c) => {
    const parentId = exportPath ? Number(c.parentId || 0) : Number(c.id_cat_parent || 0)
    let parentSlug = ""

    if (parentId !== 0) {
      const parent = byId.get(parentId)
      if (!parent) {
        throw new Error(`Parent introuvable pour category.slug=${c.slug} (id_cat_parent=${parentId})`)
      }
      if (exportPath) {
        // parent doit aussi être une "catégorie au sens logique" (category ou nœud de regroupement)
        // on ne refait pas tout le calcul parentIds ici: on accepte parent si son slug existe dans cats
        // (validation indirecte plus robuste face aux données legacy).
        if (!seen.has(parent.slug)) {
          throw new Error(
            `Parent invalide (non exporté comme catégorie) pour category.slug=${c.slug} (parent.slug=${parent.slug})`
          )
        }
      } else {
        if (Number(parent.is_item) !== 0) {
          throw new Error(
            `Parent invalide (is_item=1) pour category.slug=${c.slug} (parent.slug=${parent.slug})`
          )
        }
      }
      parentSlug = parent.slug
    }

    return {
      slug: toStr(c.slug),
      name: exportPath ? toStr(c.name) : toStr(c.nom),
      description: exportPath ? toStr(c.description) : toStr(c.descriptif),
      parent_slug: toStr(parentSlug),
      imageUrl: exportPath ? toStr(c.image) : toStr(c.path_img),
    }
  })

  // Tri stable → CSV versionnable (diffs propres)
  out.sort((a, b) => a.slug.localeCompare(b.slug, "fr"))

  for (const c of out) {
    rows.push(csvRow([c.slug, c.name, c.description, c.parent_slug, c.imageUrl]))
  }

  const outPath = path.join(__dirname, "../data/categories.csv")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, rows.join("\n"), "utf8")

  console.log(`✅ categories.csv généré (${out.length} catégories) depuis ${sourceLabel} → ${outPath}`)
}

main()
