#!/usr/bin/env node
/*
 * Génère assets/manifest.json à partir du contenu du dossier assets/.
 *
 * Le navigateur ne peut pas lister le contenu d'un dossier sur un site statique :
 * ce script le fait à sa place (en local ou au build Vercel) et écrit un index
 * que js/terminal.js charge au démarrage.
 *
 * Règles :
 *  - chaque sous-dossier de assets/ devient un dossier du terminal ;
 *  - seuls les fichiers .txt et .pdf sont affichés (images, etc. ignorées) ;
 *  - tout fichier ou dossier dont le nom commence par "_" ou "." est caché
 *    (pratique pour des pièces jointes liées depuis un .txt, ex. _reports/).
 *
 * Usage : node scripts/build-manifest.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const OUTPUT = path.join(ASSETS_DIR, "manifest.json");
const VISIBLE_EXTENSIONS = [".txt", ".pdf"];

function isHidden(name) {
    return name.startsWith("_") || name.startsWith(".");
}

function walk(absDir) {
    const entries = fs.readdirSync(absDir, { withFileTypes: true })
        .filter(entry => !isHidden(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name));

    const node = {};

    for (const entry of entries) {
        const absPath = path.join(absDir, entry.name);

        if (entry.isDirectory()) {
            const children = walk(absPath);
            if (Object.keys(children).length > 0) {
                node[entry.name] = { type: "dir", children };
            }
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (!entry.isFile() || !VISIBLE_EXTENSIONS.includes(ext)) continue;

        node[entry.name] = {
            type: "file",
            path: path.relative(ROOT, absPath).split(path.sep).join("/")
        };
    }

    return node;
}

const tree = walk(ASSETS_DIR);
fs.writeFileSync(OUTPUT, JSON.stringify(tree, null, 2) + "\n");

let count = 0;
(function countFiles(node) {
    for (const item of Object.values(node)) {
        if (item.type === "dir") countFiles(item.children);
        else count++;
    }
})(tree);

console.log(`manifest.json généré : ${count} fichiers dans ${Object.keys(tree).length} dossiers.`);
