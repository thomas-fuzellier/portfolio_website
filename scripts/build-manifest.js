const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const OUTPUT = path.join(ASSETS_DIR, "manifest.json");
const VISIBLE_EXTENSIONS = [".txt", ".pdf"];

/*
 * Traductions : "first_job.fr.txt" est la version française de "first_job.txt".
 * Elle n'apparaît pas comme un fichier à part : elle est rattachée au fichier
 * anglais dans "translations", et le terminal l'affiche quand la langue est "fr".
 */
const TRANSLATION_RE = /^(.+)\.([a-z]{2})(\.[a-z0-9]+)$/i;   // nom.fr.txt → nom, fr, .txt
const LANGUAGES = ["fr"];

function isHidden(name) {
    return name.startsWith("_") || name.startsWith(".");
}

function toWebPath(absPath) {
    return path.relative(ROOT, absPath).split(path.sep).join("/");
}

function walk(absDir) {
    const entries = fs.readdirSync(absDir, { withFileTypes: true })
        .filter(entry => !isHidden(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name));

    const node = {};
    const translations = [];

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

        const match = entry.name.match(TRANSLATION_RE);
        if (match && LANGUAGES.includes(match[2].toLowerCase())) {
            translations.push({ base: match[1] + match[3], lang: match[2].toLowerCase(), path: toWebPath(absPath) });
            continue;
        }

        node[entry.name] = { type: "file", path: toWebPath(absPath) };
    }

    // On rattache chaque traduction à son fichier d'origine
    for (const { base, lang, path: webPath } of translations) {
        if (!node[base]) {
            console.warn(`⚠ Traduction sans fichier d'origine : ${webPath} (attendu : ${base})`);
            continue;
        }
        node[base].translations = { ...node[base].translations, [lang]: webPath };
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