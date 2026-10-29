const input = document.getElementById("input");
const output = document.getElementById("output");
const promptElement = document.getElementById("prompt");
const MANIFEST_URL = "assets/manifest.json";

let filesystem = { type: "dir", children: {} };

let currentPath = ["/"];

const COMMANDS = ["ls", "cd", "pwd", "clear", "help", "cat", "tree", "whoami", "contact", "cv", "neofetch", "sudo", "lang"];

/* ---------- Langues : anglais (par défaut) et français ---------- */
/*
 * Tous les textes de l'interface sont ici, dans les deux langues.
 * Le contenu (expériences, projets…) est dans assets/ : "fichier.fr.txt" est
 * la version française de "fichier.txt" (si elle manque, on affiche l'anglais).
 */
const LANGS = ["en", "fr"];
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "portfolio-lang";

const I18N = {
    en: {
        banner: `
<span class="title">Fuzellier Thomas</span><br>
<span class="sub-title"><p>ENSEA Engineer · Embedded Systems & Software Developer</p>
<p>📧 thomas.fuzellier@outlook.fr · 📞 +33 6 10 48 41 37</p>
<p>⚙️ Computer Science & Embedded Systems  | 📊 Data | 💻 Software development | 🧠 LLM | 🟢 Open to opportunities</p>
</span>`,
        help: `
<span class="available">Available commands:</span><br>

<span class="blue-color">ls</span> → list files & directories<br>
<span class="blue-color">cd [folder]</span> → navigate into a directory<br>
<span class="blue-color">cd ..</span> → go back<br>
<span class="blue-color">cat [file]</span> → cat file (txt or pdf)<br>
<span class="blue-color">pwd</span> → show current directory<br>
<span class="blue-color">tree</span> → show the whole filesystem<br>
<span class="blue-color">whoami</span> · <span class="blue-color">contact</span> · <span class="blue-color">cv</span> · <span class="blue-color">neofetch</span><br>
<span class="blue-color">lang fr</span> → <span class="clickable blue-color" data-cmd="lang fr">version française</span><br>
<span class="blue-color">clear</span> → clear terminal<br>
<span class="blue-color">↑ / ↓</span> → command history · <span class="blue-color">TAB</span> → autocomplete<br>

<span class="tip">💡 Tip: click on folders and files, or use the shortcuts below.</span><br>
`,
        whoami: `<span class="white-color bold">Thomas Fuzellier</span>
ENSEA Engineer · Embedded Systems &amp; Software Developer
⚙️ Embedded Systems | 📊 Data | 💻 Software | 🧠 LLM
🟢 Open to opportunities

→ <span class="blue-color clickable" data-cmd="cat /about/presentation.txt">cat presentation.txt</span> · <span class="blue-color clickable" data-cmd="contact">contact</span> · <span class="blue-color clickable" data-cmd="cv">cv</span>`,
        neofetch: {
            os: "OS", shell: "Shell", role: "Role", school: "School", focus: "Focus",
            languages: "Languages", status: "Status",
            roleValue: "Embedded Systems &amp; Software Engineer",
            statusValue: "🟢 Open to opportunities"
        },
        sudoDenied: `<span class='orange-color'>Nice try 😉</span> — this incident will be reported.
Hint: try <span class='blue-color clickable' data-cmd='sudo hire-me'>sudo hire-me</span>
`,
        sudoHire: `[sudo] password for recruiter: ********
<span class="green-color">✔ Access granted.</span>

Initiating hiring protocol...
<span class="green-color">[████████████████] 100%</span>

<span class="white-color bold">Great choice! Let's talk 👇</span>
📧 <a href="mailto:thomas.fuzellier@outlook.fr" class="link">thomas.fuzellier@outlook.fr</a>
💼 <a href="https://www.linkedin.com/in/thomas-fuzellier/" target="_blank" class="link">linkedin.com/in/thomas-fuzellier</a>
📄 <span class="yellow-color clickable" data-cmd="cv">open my CV</span>
`,
        manifestError: "<span class='orange-color'>Could not load the filesystem (assets/manifest.json).</span>",
        manifestHint: "Run <span class='blue-color'>node scripts/build-manifest.js</span> then reload the page.",
        noSuchDir: "cd: no such directory",
        missingArg: "cat: missing argument",
        fileNotFound: "File not found",
        isDirectory: name => `cat: ${name}: Is a directory`,
        loadError: "Error loading file",
        cvNotFound: "cv: CV not found in /about",
        notFound: "Command not found : <span class='blue-color'>help</span> for all commands",
        langCurrent: "Current language: English. Use <span class='blue-color clickable' data-cmd='lang fr'>lang fr</span> for French.",
        langUnknown: "lang: unknown language. Available: <span class='blue-color'>en</span>, <span class='blue-color'>fr</span>",
        langSwitched: "🌐 Language set to English.",
        langButton: { label: "FR", title: "Version française", cmd: "lang fr" }
    },

    fr: {
        banner: `
<span class="title">Fuzellier Thomas</span><br>
<span class="sub-title"><p>Ingénieur ENSEA · Systèmes embarqués & développement logiciel</p>
<p>📧 thomas.fuzellier@outlook.fr · 📞 +33 6 10 48 41 37</p>
<p>⚙️ Informatique & systèmes embarqués  | 📊 Data | 💻 Développement logiciel | 🧠 LLM | 🟢 Ouvert aux opportunités</p>
</span>`,
        help: `
<span class="available">Commandes disponibles :</span><br>

<span class="blue-color">ls</span> → lister les fichiers et dossiers<br>
<span class="blue-color">cd [dossier]</span> → entrer dans un dossier<br>
<span class="blue-color">cd ..</span> → revenir en arrière<br>
<span class="blue-color">cat [fichier]</span> → afficher un fichier (txt ou pdf)<br>
<span class="blue-color">pwd</span> → afficher le dossier courant<br>
<span class="blue-color">tree</span> → afficher toute l'arborescence<br>
<span class="blue-color">whoami</span> · <span class="blue-color">contact</span> · <span class="blue-color">cv</span> · <span class="blue-color">neofetch</span><br>
<span class="blue-color">lang en</span> → <span class="clickable blue-color" data-cmd="lang en">English version</span><br>
<span class="blue-color">clear</span> → effacer le terminal<br>
<span class="blue-color">↑ / ↓</span> → historique des commandes · <span class="blue-color">TAB</span> → autocomplétion<br>

<span class="tip">💡 Astuce : cliquez sur les dossiers et les fichiers, ou utilisez les raccourcis ci-dessous.</span><br>
`,
        whoami: `<span class="white-color bold">Thomas Fuzellier</span>
Ingénieur ENSEA · Systèmes embarqués &amp; développement logiciel
⚙️ Systèmes embarqués | 📊 Data | 💻 Logiciel | 🧠 LLM
🟢 Ouvert aux opportunités

→ <span class="blue-color clickable" data-cmd="cat /about/presentation.txt">cat presentation.txt</span> · <span class="blue-color clickable" data-cmd="contact">contact</span> · <span class="blue-color clickable" data-cmd="cv">cv</span>`,
        neofetch: {
            os: "OS", shell: "Shell", role: "Poste", school: "École", focus: "Domaines",
            languages: "Langages", status: "Statut",
            roleValue: "Ingénieur systèmes embarqués &amp; logiciel",
            statusValue: "🟢 Ouvert aux opportunités"
        },
        sudoDenied: `<span class='orange-color'>Bien essayé 😉</span> — cet incident sera signalé.
Indice : essayez <span class='blue-color clickable' data-cmd='sudo hire-me'>sudo hire-me</span>
`,
        sudoHire: `[sudo] mot de passe pour recruteur : ********
<span class="green-color">✔ Accès autorisé.</span>

Lancement du protocole de recrutement...
<span class="green-color">[████████████████] 100%</span>

<span class="white-color bold">Excellent choix ! Parlons-en 👇</span>
📧 <a href="mailto:thomas.fuzellier@outlook.fr" class="link">thomas.fuzellier@outlook.fr</a>
💼 <a href="https://www.linkedin.com/in/thomas-fuzellier/" target="_blank" class="link">linkedin.com/in/thomas-fuzellier</a>
📄 <span class="yellow-color clickable" data-cmd="cv">ouvrir mon CV</span>
`,
        manifestError: "<span class='orange-color'>Impossible de charger le système de fichiers (assets/manifest.json).</span>",
        manifestHint: "Lancez <span class='blue-color'>node scripts/build-manifest.js</span> puis rechargez la page.",
        noSuchDir: "cd: dossier introuvable",
        missingArg: "cat: argument manquant",
        fileNotFound: "Fichier introuvable",
        isDirectory: name => `cat: ${name}: est un dossier`,
        loadError: "Erreur lors du chargement du fichier",
        cvNotFound: "cv: CV introuvable dans /about",
        notFound: "Commande inconnue : <span class='blue-color'>help</span> pour la liste des commandes",
        langCurrent: "Langue actuelle : français. Tapez <span class='blue-color clickable' data-cmd='lang en'>lang en</span> pour l'anglais.",
        langUnknown: "lang: langue inconnue. Disponibles : <span class='blue-color'>en</span>, <span class='blue-color'>fr</span>",
        langSwitched: "🌐 Langue : français.",
        langButton: { label: "EN", title: "English version", cmd: "lang en" }
    }
};

/* Langue enregistrée dans le navigateur (si possible), sinon anglais */
function loadLang() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (LANGS.includes(saved)) return saved;
    } catch (err) { /* stockage indisponible (navigation privée…) */ }
    return DEFAULT_LANG;
}

let lang = loadLang();
document.documentElement.lang = lang;

function t(key) {
    return I18N[lang][key];
}

function setLang(newLang) {
    lang = newLang;
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (err) { /* ignoré */ }
}

/* ---------- Chargement du système de fichiers ---------- */

async function loadFilesystem() {
    try {
        const response = await fetch(MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) throw new Error(response.status);
        filesystem = { type: "dir", children: await response.json() };
    } catch (err) {
        print(t("manifestError"));
        print(t("manifestHint"));
    }
}

/* ---------- Affichage ---------- */

function showBootScreen() {
    output.insertAdjacentHTML("beforeend",
        `<span class="compact-mobile">${t("banner")}<br><br>${t("help")}<br></span>`);
    output.scrollTop = output.scrollHeight;
}

/* insertAdjacentHTML ajoute à la fin sans re-générer tout le terminal :
   les animations (iframes) déjà affichées ne se rechargent pas à chaque commande. */
function print(text) {
    output.insertAdjacentHTML("beforeend", text + "<br>");
    output.scrollTop = output.scrollHeight;
}

/* ---------- Effet de frappe (sortie de cat) ---------- */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Appelée pour afficher immédiatement la fin du texte en cours de frappe */
let finishTyping = null;

/*
 * Affiche du HTML caractère par caractère, comme dans un vrai terminal.
 * La durée est fixe (~0,7 s) quelle que soit la longueur du texte.
 * Une touche ou un clic pendant la frappe affiche tout d'un coup.
 */
function printTyped(html, duration = 700) {
    const block = document.createElement("span");
    block.innerHTML = html;

    if (reducedMotion) {
        output.appendChild(block);
        print("");
        return Promise.resolve();
    }

    // Les animations et images n'apparaissent qu'une fois le texte écrit
    const media = block.querySelectorAll("iframe, img");
    media.forEach(el => el.style.visibility = "hidden");

    // On vide tous les noeuds texte, puis on les remplit petit à petit
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
        walker.currentNode.textContent = "";
    }

    output.appendChild(block);

    const total = nodes.reduce((sum, n) => sum + n.text.length, 0);
    const perFrame = Math.max(1, Math.ceil(total / (duration / 16)));

    return new Promise(resolve => {
        let nodeIndex = 0;
        let charIndex = 0;
        let done = false;

        function finish() {
            if (done) return;
            done = true;
            nodes.forEach(n => n.node.textContent = n.text);
            media.forEach(el => el.style.visibility = "");
            finishTyping = null;
            print("");
            resolve();
        }

        function frame() {
            if (done) return;
            let budget = perFrame;

            while (budget > 0 && nodeIndex < nodes.length) {
                const current = nodes[nodeIndex];
                const take = Math.min(budget, current.text.length - charIndex);
                charIndex += take;
                budget -= take;
                current.node.textContent = current.text.slice(0, charIndex);

                if (charIndex >= current.text.length) {
                    nodeIndex++;
                    charIndex = 0;
                }
            }

            output.scrollTop = output.scrollHeight;

            if (nodeIndex >= nodes.length) finish();
            else requestAnimationFrame(frame);
        }

        finishTyping = finish;
        requestAnimationFrame(frame);
    });
}

/* ---------- Navigation ---------- */

function getPath() {
    if (currentPath.length === 1) return "~";
    return "/" + currentPath.slice(1).join("/");
}

function updatePrompt() {
    promptElement.textContent = `thomas@portfolio:${getPath()}$`;
}

function nodeAt(pathArray) {
    let node = filesystem;

    for (let i = 1; i < pathArray.length; i++) {
        if (!node || node.type !== "dir") return null;
        node = node.children[pathArray[i]];
    }

    return node || null;
}

function getNode() {
    return nodeAt(currentPath).children;
}

/* Résout "projects", "projects/", "../skills", "~", "/" … en tableau de chemin */
function resolvePath(target) {
    let parts = target.startsWith("/") || target.startsWith("~")
        ? ["/"]
        : [...currentPath];

    target.replace(/^[~/]+/, "").split("/").forEach(segment => {
        if (!segment || segment === ".") return;
        if (segment === "..") {
            if (parts.length > 1) parts.pop();
            return;
        }
        parts.push(segment);
    });

    return parts;
}

/* Chemin absolu d'un élément du dossier courant, ex. "/projects/pokemon_game.txt" */
function absolutePath(name) {
    return "/" + [...currentPath.slice(1), name].join("/");
}

/* Chaque entrée affichée par ls est cliquable : cd pour un dossier, cat pour un fichier.
   On utilise le chemin absolu pour que le clic marche même après un cd ailleurs. */
function ls() {
    const node = getNode();
    let result = "";

    Object.entries(node).forEach(([name, item]) => {
        if (item.type === "dir") {
            result += `<span class="dir clickable" data-cmd="cd ${absolutePath(name)}">📁 ${name}/</span><br>`;
        } else {
            result += `<span class="file clickable" data-cmd="cat ${absolutePath(name)}">📄 ${name}</span><br>`;
        }
    });

    print(result);
}

function cd(folder) {
    if (!folder) {
        currentPath = ["/"];
        updatePrompt();
        return;
    }

    const newPath = resolvePath(folder);
    const node = nodeAt(newPath);

    if (node && node.type === "dir") {
        currentPath = newPath;
        updatePrompt();
        print("");
    } else {
        print(t("noSuchDir") + "<br>");
    }
}

async function openFile(name) {
    if (!name) {
        print(t("missingArg"));
        return;
    }

    const node = nodeAt(resolvePath(name));

    if (!node) {
        print(t("fileNotFound"));
        return;
    }

    if (node.type === "dir") {
        print(t("isDirectory")(escapeHtml(name)));
        return;
    }

    /* PDF */
    if (node.path.toLowerCase().endsWith(".pdf")) {
        window.open(node.path, "_blank");
        return;
    }

    /* TEXT : version traduite si elle existe ("fichier.fr.txt"), sinon l'original */
    const textPath = (node.translations && node.translations[lang]) || node.path;

    try {
        const response = await fetch(textPath);
        if (!response.ok) throw new Error(response.status);
        await printTyped(await response.text());
    } catch (err) {
        print(t("loadError"));
    }
}

/* ---------- Autocomplétion ---------- */

function fuzzyMatch(input, target) {
    input = input.toLowerCase();
    target = target.toLowerCase();

    let i = 0;
    for (let c of target) {
        if (c === input[i]) i++;
    }
    return i === input.length;
}

/* Liste des complétions possibles pour la saisie en cours */
function getMatches(value) {
    const parts = value.split(" ");
    const command = parts[0];
    const last = parts[parts.length - 1] || "";

    let options = [];

    if (parts.length === 1) {
        options = COMMANDS;
    } else if (command === "cd") {
        options = Object.keys(getNode()).filter(name => getNode()[name].type === "dir");
    } else if (command === "cat") {
        options = Object.keys(getNode());
    } else if (command === "lang") {
        options = LANGS;
    }

    const normalizedLast = last.toLowerCase();

    let matches = options.filter(opt =>
        opt.toLowerCase().startsWith(normalizedLast)
    );

    if (matches.length === 0) {
        matches = options.filter(opt => fuzzyMatch(last, opt));
    }

    return { parts, matches };
}

/*
 * Tab : complète la saisie.
 * S'il y a plusieurs correspondances, chaque nouvel appui sur Tab affiche
 * la suivante (Shift+Tab : la précédente), en boucle.
 */
let tabCycle = null; // { parts, matches, index, completed }

function autocomplete(value, backwards = false) {
    // Appui répété sur Tab : on passe à la correspondance suivante
    if (tabCycle && value === tabCycle.completed) {
        const count = tabCycle.matches.length;
        tabCycle.index = (tabCycle.index + (backwards ? -1 : 1) + count) % count;
    } else {
        const { parts, matches } = getMatches(value);
        if (matches.length === 0) {
            tabCycle = null;
            return value;
        }
        tabCycle = { parts, matches, index: backwards ? matches.length - 1 : 0 };
    }

    const parts = [...tabCycle.parts];
    parts[parts.length - 1] = tabCycle.matches[tabCycle.index];
    tabCycle.completed = parts.join(" ");

    // Une seule correspondance : rien à faire défiler
    if (tabCycle.matches.length === 1) tabCycle = null;

    return parts.join(" ");
}

/* ---------- Commandes supplémentaires ---------- */

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

/* tree : toute l'arborescence, avec des entrées cliquables comme dans ls */
function tree() {
    const lines = ["<span class='dir'>~</span>"];

    (function walk(node, prefix, path) {
        const entries = Object.entries(node.children);
        entries.forEach(([name, item], i) => {
            const last = i === entries.length - 1;
            const branch = prefix + (last ? "└── " : "├── ");
            const full = `${path}/${name}`;

            if (item.type === "dir") {
                lines.push(`${branch}<span class="dir clickable" data-cmd="cd ${full}">${name}/</span>`);
                walk(item, prefix + (last ? "    " : "│   "), full);
            } else {
                lines.push(`${branch}<span class="file clickable" data-cmd="cat ${full}">${name}</span>`);
            }
        });
    })(filesystem, "", "");

    print(lines.join("\n") + "\n");
}

/* neofetch : petite fiche système façon Linux, avec un logo ASCII (une puce) */
function neofetch() {
    const art = [
        "   ┌┬┬┬┬┐   ",
        " ──┤    ├── ",
        " ──┤ TF ├── ",
        " ──┤    ├── ",
        "   └┴┴┴┴┘   "
    ];

    const L = t("neofetch");
    const info = [
        "<span class='green-color bold'>thomas</span>@<span class='green-color bold'>portfolio</span>",
        "----------------",
        `<span class='blue-color'>${L.os}</span>: Portfolio Linux x86_64`,
        `<span class='blue-color'>${L.shell}</span>: terminal.js`,
        `<span class='blue-color'>${L.role}</span>: ${L.roleValue}`,
        `<span class='blue-color'>${L.school}</span>: ENSEA (2024)`,
        `<span class='blue-color'>${L.focus}</span>: Embedded · Data · LLM`,
        `<span class='blue-color'>${L.languages}</span>: C/C++ · Python · Java · JS`,
        `<span class='blue-color'>${L.status}</span>: ${L.statusValue}`,
        "",
        ["#ff5f56", "#f88d00", "#ffe600", "#3FB950", "#58A6FF", "#c678dd", "#919191"]
            .map(c => `<span style="color:${c}">███</span>`).join("")
    ];

    // Petit écran : le logo au-dessus des infos (côte à côte, les lignes se cassent)
    if (window.matchMedia("(max-width: 600px)").matches) {
        print(`<span class="green-color">${art.join("\n")}</span>\n\n${info.join("\n")}\n`);
        return;
    }

    const width = art[0].length;
    const lines = info.map((text, i) =>
        `<span class="green-color">${(art[i] || "").padEnd(width)}</span>  ${text}`
    );

    print(lines.join("\n") + "\n");
}

/* sudo : easter egg pour les recruteurs */
async function sudo(arg) {
    if (!/^hire[- ]?me$/i.test(arg)) {
        print(t("sudoDenied"));
        return;
    }

    await printTyped(t("sudoHire"), 1200);
}

/* lang : passer de l'anglais au français (et inversement) */
function changeLang(arg) {
    if (!arg) {
        print(t("langCurrent") + "\n");
        return;
    }

    const wanted = arg.toLowerCase();
    if (!LANGS.includes(wanted)) {
        print(t("langUnknown") + "\n");
        return;
    }

    setLang(wanted);
    buildShortcuts();

    // On repart d'un terminal propre, dans la nouvelle langue
    output.innerHTML = "";
    showBootScreen();
    print(t("langSwitched") + "\n");
}

/* ---------- Historique des commandes (↑ / ↓) ---------- */

const commandHistory = [];
let historyIndex = 0;     // position dans l'historique pendant la navigation
let historyDraft = "";    // saisie en cours, retrouvée en redescendant tout en bas

function addToHistory(cmd) {
    if (commandHistory[commandHistory.length - 1] !== cmd) commandHistory.push(cmd);
    historyIndex = commandHistory.length;
}

function browseHistory(direction) {
    if (commandHistory.length === 0) return;

    if (historyIndex === commandHistory.length) historyDraft = input.value;

    historyIndex = Math.min(commandHistory.length, Math.max(0, historyIndex + direction));
    input.value = historyIndex === commandHistory.length
        ? historyDraft
        : commandHistory[historyIndex];

    // Curseur à la fin de la ligne
    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
}

/* ---------- Commandes ---------- */

async function handleCommand(cmd) {
    if (!cmd) return;

    addToHistory(cmd);
    print(`<span class="prompt">${promptElement.textContent}</span> ${escapeHtml(cmd)}`);

    const [command, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    switch (command) {
        case "clear":
            output.innerHTML = "";
            showBootScreen();
            return;
        case "ls":
            ls();
            return;
        case "pwd":
            print(getPath());
            return;
        case "cd":
            cd(arg);
            return;
        case "cat":
            await openFile(arg);
            return;
        case "tree":
            tree();
            return;
        case "whoami":
            print(t("whoami") + "\n");
            return;
        case "contact":
            await openFile("/about/contact.txt");
            return;
        case "cv": {
            const cv = findCv();
            if (cv) await openFile(cv);
            else print(t("cvNotFound"));
            return;
        }
        case "neofetch":
            neofetch();
            return;
        case "sudo":
            await sudo(arg);
            return;
        case "lang":
            changeLang(arg);
            return;
        case "help":
            print(`<span class="compact-mobile">${t("help")}</span>`);
            return;
    }

    print(t("notFound"));
}

/* ---------- Commandes lancées au clic ---------- */

/* Les commandes sont exécutées l'une après l'autre, même si on clique vite */
let commandQueue = Promise.resolve();

function runCommands(...cmds) {
    cmds.forEach(cmd => {
        commandQueue = commandQueue.then(() => handleCommand(cmd));
    });

    // Sur ordinateur, on remet le curseur dans la ligne de saisie
    // (pas sur mobile, pour ne pas ouvrir le clavier à chaque clic)
    if (window.matchMedia("(pointer: fine)").matches) input.focus();

    return commandQueue;
}

/* Clic sur une entrée de ls (ou tout élément avec data-cmd) dans la sortie */
output.addEventListener("click", function(e) {
    // Un clic pendant l'effet de frappe affiche tout le texte d'un coup
    if (finishTyping) finishTyping();

    const target = e.target.closest("[data-cmd]");
    if (target) runCommands(target.dataset.cmd);
});

/* ---------- Raccourcis sous le terminal ---------- */

/* Dossier → cd + ls ; fichier → cat. Le CV est cherché dans about/ (premier PDF "CV…"). */
function findCv() {
    const about = filesystem.children.about;
    if (!about || about.type !== "dir") return null;
    const name = Object.keys(about.children).find(n => /^cv.*\.pdf$/i.test(n));
    return name ? `/about/${name}` : null;
}

function buildShortcuts() {
    const bar = document.getElementById("shortcuts");
    if (!bar) return;

    const shortcuts = Object.keys(filesystem.children)
        .filter(name => filesystem.children[name].type === "dir")
        .map(name => ({ label: `${name}/`, cmds: [`cd /${name}`, "ls"] }));

    const cv = findCv();
    if (cv) shortcuts.push({ label: "CV.pdf", cmds: [`cat ${cv}`], className: "cv" });

    shortcuts.push({ label: "clear", cmds: ["clear"], className: "muted" });

    // Bouton de langue : propose l'autre langue
    const langButton = t("langButton");
    shortcuts.push({ label: langButton.label, title: langButton.title, cmds: [langButton.cmd], className: "lang" });

    bar.innerHTML = "";
    shortcuts.forEach(({ label, title, cmds, className }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        if (title) button.title = title;
        if (className) button.classList.add(className);
        button.addEventListener("click", () => runCommands(...cmds));
        bar.appendChild(button);
    });
}

/* Toucher n'importe où sur la ligne de saisie ouvre le clavier (pratique sur mobile) */
document.getElementById("input-line").addEventListener("click", () => input.focus());

input.addEventListener("keydown", function(e) {
    // Une touche pendant l'effet de frappe affiche tout le texte d'un coup
    if (finishTyping) finishTyping();

    if (e.key === "Enter") {
        runCommands(input.value.trim());
        input.value = "";
        historyDraft = "";
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        browseHistory(e.key === "ArrowUp" ? -1 : 1);
        return;
    }

    if (e.key === "Tab") {
        e.preventDefault();
        input.value = autocomplete(input.value, e.shiftKey);
        return;
    }

    // Toute autre touche (sauf Shift seul) arrête le défilement des complétions
    if (e.key !== "Shift") tabCycle = null;
});

/* ---------- Démarrage ---------- */

(async function init() {
    showBootScreen();
    updatePrompt();
    await loadFilesystem();
    buildShortcuts();
})();