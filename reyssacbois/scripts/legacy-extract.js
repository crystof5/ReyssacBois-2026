const fs = require("fs")
const path = require("path")
const vm = require("vm")

/**
 * Extrait un tableau JS (array literal) déclaré dans un fichier legacy du style :
 *   const categories = [ ... ];
 *   const items = [ ... ];
 *
 * Objectif: récupérer la SOURCE DE VÉRITÉ métier sans exécuter le code Sequelize.
 *
 * - Ne fait AUCUN require() du fichier cible.
 * - Ne touche pas à Prisma / DB.
 * - Supporte les strings, commentaires, apostrophes échappées, et `new Date("...")`.
 */

function findArrayDeclarationStartIndex(source, varName) {
  // tolère const / let / var + espaces
  const re = new RegExp(`\\b(?:const|let|var)\\s+${varName}\\s*=\\s*\\[`, "m")
  const match = re.exec(source)
  if (!match) return -1
  // match[0] se termine par '['
  return match.index + match[0].lastIndexOf("[")
}

function findMatchingClosingBracket(source, openBracketIndex) {
  let depth = 0

  let inSingle = false
  let inDouble = false
  let inTemplate = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = openBracketIndex; i < source.length; i++) {
    const ch = source[i]
    const next = source[i + 1]

    if (inLineComment) {
      if (ch === "\n") inLineComment = false
      continue
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inSingle) {
      if (ch === "\\") {
        i++ // skip escaped char
        continue
      }
      if (ch === "'") inSingle = false
      continue
    }

    if (inDouble) {
      if (ch === "\\") {
        i++
        continue
      }
      if (ch === '"') inDouble = false
      continue
    }

    if (inTemplate) {
      if (ch === "\\") {
        i++
        continue
      }
      if (ch === "`") inTemplate = false
      continue
    }

    // hors string/comment
    if (ch === "/" && next === "/") {
      inLineComment = true
      i++
      continue
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true
      i++
      continue
    }
    if (ch === "'") {
      inSingle = true
      continue
    }
    if (ch === '"') {
      inDouble = true
      continue
    }
    if (ch === "`") {
      inTemplate = true
      continue
    }

    if (ch === "[") {
      depth++
      continue
    }
    if (ch === "]") {
      depth--
      if (depth === 0) return i
      continue
    }
  }

  throw new Error("Impossible de trouver la fin du tableau (brackets non équilibrés).")
}

function evalArrayLiteral(arrayLiteral, fileLabel) {
  // Le tableau contient `new Date(...)` → on autorise Date uniquement.
  // On ne fournit PAS require / process / etc.
  const context = vm.createContext({ Date })
  try {
    return vm.runInContext(`(${arrayLiteral})`, context, { filename: fileLabel })
  } catch (err) {
    const msg = err && err.message ? err.message : String(err)
    throw new Error(`Échec d'évaluation du tableau extrait depuis ${fileLabel}: ${msg}`)
  }
}

function readLegacyArrayFromInitFile(filePath, varName) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  const source = fs.readFileSync(abs, "utf8")

  const openIdx = findArrayDeclarationStartIndex(source, varName)
  if (openIdx === -1) {
    throw new Error(`Déclaration introuvable: ${varName} = [ ... ] dans ${filePath}`)
  }

  const closeIdx = findMatchingClosingBracket(source, openIdx)
  const arrayLiteral = source.slice(openIdx, closeIdx + 1)
  const value = evalArrayLiteral(arrayLiteral, filePath)

  if (!Array.isArray(value)) {
    throw new Error(`${filePath}: ${varName} extrait mais ce n'est pas un Array.`)
  }

  return value
}

module.exports = {
  readLegacyArrayFromInitFile,
}


