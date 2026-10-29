const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const SITE = "https://fuzellier-portfolio-website.vercel.app";
const HTML_PAGES = ["index.html", "terminal.html"];

const START = "<!-- AUTO-GENERATED:START (scripts/build-seo.js) -->";
const END = "<!-- AUTO-GENERATED:END -->";

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodeEntities(text) {
    return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Texte brut d'un fichier .txt du terminal (sans balises, liens ni animations)
function readPlainLines(file) {
    const raw = fs.readFileSync(file, "utf8")
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
        .replace(/<a\b[\s\S]*?<\/a>/gi, "")
        .replace(/<\/span>[ \t]+(?=\S)/g, "</span> · ")     // "Entreprise · Lieu · Dates"
        .replace(/<[^>]+>/g, "");

    return decodeEntities(raw)
        .split(/\r?\n/)
        .map(line => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

// Fichiers .txt anglais d'un dossier (les traductions .fr.txt sont ignorées)
function englishTxtFiles(folder) {
    const dir = path.join(ASSETS_DIR, folder);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(name => name.endsWith(".txt") && !/\.[a-z]{2}\.txt$/i.test(name) && !name.startsWith("_"))
        .map(name => path.join(dir, name));
}

// Années de la ligne de dates ; "Present" compte comme l'année la plus récente
function yearsOf(text) {
    const years = (text.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
    if (/present|aujourd/i.test(text)) years.push(9999);
    return years.length ? years : [0];
}

// Titre, ligne de contexte (entreprise, lieu, dates), description et points clés
function parseEntry(file) {
    const lines = readPlainLines(file);
    const [title = "", meta = "", ...rest] = lines;
    const bullets = rest.filter(line => line.startsWith("-")).map(line => line.slice(1).trim());
    const description = rest.filter(line => !line.startsWith("-")).join(" ");
    const years = yearsOf(meta);

    return { title, meta, description, bullets, end: Math.max(...years), start: Math.min(...years) };
}

function entriesHtml(folder, heading) {
    const entries = englishTxtFiles(folder)
        .map(parseEntry)
        .filter(entry => entry.title)
        .sort((a, b) => b.end - a.end || b.start - a.start);

    if (entries.length === 0) return "";

    const items = entries.map(entry => {
        const bullets = entry.bullets.length
            ? `\n                <ul>\n${entry.bullets.map(b => `                    <li>${escapeHtml(b)}</li>`).join("\n")}\n                </ul>`
            : "";
        const description = entry.description ? ` ${escapeHtml(entry.description)}` : "";
        return `            <li><strong>${escapeHtml(entry.title)}</strong> – ${escapeHtml(entry.meta)}.${description}${bullets}\n            </li>`;
    });

    return `        <h2>${heading}</h2>\n        <ul>\n${items.join("\n")}\n        </ul>`;
}

// Compétences : "drwxr-xr-x Catégorie/" puis "-rw-r--r-- Compétence"
function skillsHtml() {
    const file = path.join(ASSETS_DIR, "skills", "hard_skills.txt");
    if (!fs.existsSync(file)) return "";

    const categories = [];
    for (const line of readPlainLines(file)) {
        if (line.startsWith("d")) {
            categories.push({ name: line.replace(/^\S+\s+/, "").replace(/\/$/, ""), items: [] });
        } else if (line.startsWith("-") && categories.length) {
            categories[categories.length - 1].items.push(line.replace(/^\S+\s+/, ""));
        }
    }

    if (categories.length === 0) return "";

    const items = categories.map(c => `            <li>${escapeHtml(c.name)}: ${escapeHtml(c.items.join(", "))}</li>`);
    return `        <h2>Skills</h2>\n        <ul>\n${items.join("\n")}\n        </ul>`;
}

function updateHtml(page, block) {
    const file = path.join(ROOT, page);
    let html = fs.readFileSync(file, "utf8");
    const nl = html.includes("\r\n") ? "\r\n" : "\n";
    html = html.replace(/\r\n/g, "\n");

    const start = html.indexOf(START);
    const end = html.indexOf(END);
    if (start === -1 || end === -1) {
        console.warn(`⚠ Marqueurs AUTO-GENERATED absents de ${page} : page non modifiée.`);
        return;
    }

    html = html.slice(0, start + START.length) + "\n" + block + "\n        " + html.slice(end);
    fs.writeFileSync(file, html.replace(/\n/g, nl));
}

function findCv() {
    const about = path.join(ASSETS_DIR, "about");
    if (!fs.existsSync(about)) return null;
    const name = fs.readdirSync(about).find(n => /^cv.*\.pdf$/i.test(n));
    return name ? `assets/about/${name}` : null;
}

function writeSitemap() {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        { loc: `${SITE}/`, priority: "1.0" },
        { loc: `${SITE}/terminal.html`, priority: "0.9" }
    ];
    const cv = findCv();
    if (cv) urls.push({ loc: `${SITE}/${cv}`, priority: "0.7" });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `    <url>
        <loc>${u.loc}</loc>
        <lastmod>${today}</lastmod>
        <priority>${u.priority}</priority>
    </url>`).join("\n")}
</urlset>
`;
    fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
}

const block = [
    entriesHtml("experiences", "Experience"),
    entriesHtml("projects", "Projects"),
    skillsHtml()
].filter(Boolean).join("\n\n");

HTML_PAGES.forEach(page => updateHtml(page, block));
writeSitemap();

console.log(`SEO : résumé mis à jour dans ${HTML_PAGES.join(", ")} + sitemap.xml régénéré.`);