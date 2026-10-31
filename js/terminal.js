const input = document.getElementById("input");
const output = document.getElementById("output");
const promptElement = document.getElementById("prompt");
const MANIFEST_URL = "assets/manifest.json";

let filesystem = { type: "dir", children: {} };

let currentPath = ["/"];

const COMMANDS = ["ls", "cd", "pwd", "clear", "help", "cat", "tree", "whoami", "contact", "cv", "neofetch", "sudo", "lang"];

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
<span class="blue-color">cv en</span> / <span class="blue-color">cv fr</span> → open my CV (English / French)<br>
<span class="blue-color">whoami</span> · <span class="blue-color">contact</span> · <span class="blue-color">neofetch</span><br>
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
📄 CV: <span class="yellow-color clickable" data-cmd="cv en">English</span> · <span class="yellow-color clickable" data-cmd="cv fr">French</span>
`,
        manifestError: "<span class='orange-color'>Could not load the filesystem (assets/manifest.json).</span>",
        manifestHint: "Run <span class='blue-color'>node scripts/build-manifest.js</span> then reload the page.",
        noSuchDir: "cd: no such directory",
        missingArg: "cat: missing argument",
        fileNotFound: "File not found",
        isDirectory: name => `cat: ${name}: Is a directory`,
        loadError: "Error loading file",
        cvNotFound: "cv: CV not found in /about",
        cvUsage: "Usage: <span class='blue-color clickable' data-cmd='cv en'>cv en</span> (English) or <span class='blue-color clickable' data-cmd='cv fr'>cv fr</span> (French)",
        cvOther: other => `💡 Also available: <span class='yellow-color clickable' data-cmd='cv ${other}'>${other === "fr" ? "French CV" : "English CV"}</span>`,
        notFound: "Command not found : <span class='blue-color'>help</span> for all commands",
        langCurrent: "Current language: English. Use <span class='blue-color clickable' data-cmd='lang fr'>lang fr</span> for French.",
        langUnknown: "lang: unknown language. Available: <span class='blue-color'>en</span>, <span class='blue-color'>fr</span>",
        langSwitched: "🌐 Language set to English.",
        langButton: { label: "FR", title: "Version française", cmd: "lang fr" },
        secretsReadme: `<span class="green-color bold">🕵️ Well done, you found /secrets.</span>
Real engineers never stop at the first ls.

Your reward: a little game.
Run <span class="blue-color clickable" data-cmd="/secrets/snake">./snake</span> to play.
`,
        binaryFile: name => `cat: ${name}: binary file — try <span class="blue-color clickable" data-cmd="/secrets/snake">./${name}</span>`,
        snake: {
            score: "Score", best: "Best", quit: "Quit",
            start: "SNAKE", startHint: "press an arrow key to start",
            paused: "PAUSED", gameOver: "GAME OVER", won: "YOU WIN!",
            again: "Enter: play again · Esc: quit",
            helpKeys: "Arrows / WASD / ZQSD to move · Space: pause · Esc: quit",
            helpTouch: "Swipe on the board or use the buttons",
            ended: "Snake closed."
        }
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
<span class="blue-color">cv fr</span> / <span class="blue-color">cv en</span> → ouvrir mon CV (français / anglais)<br>
<span class="blue-color">whoami</span> · <span class="blue-color">contact</span> · <span class="blue-color">neofetch</span><br>
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
📄 CV : <span class="yellow-color clickable" data-cmd="cv fr">français</span> · <span class="yellow-color clickable" data-cmd="cv en">anglais</span>
`,
        manifestError: "<span class='orange-color'>Impossible de charger le système de fichiers (assets/manifest.json).</span>",
        manifestHint: "Lancez <span class='blue-color'>node scripts/build-manifest.js</span> puis rechargez la page.",
        noSuchDir: "cd: dossier introuvable",
        missingArg: "cat: argument manquant",
        fileNotFound: "Fichier introuvable",
        isDirectory: name => `cat: ${name}: est un dossier`,
        loadError: "Erreur lors du chargement du fichier",
        cvNotFound: "cv: CV introuvable dans /about",
        cvUsage: "Utilisation : <span class='blue-color clickable' data-cmd='cv fr'>cv fr</span> (français) ou <span class='blue-color clickable' data-cmd='cv en'>cv en</span> (anglais)",
        cvOther: other => `💡 Aussi disponible : <span class='yellow-color clickable' data-cmd='cv ${other}'>${other === "fr" ? "CV en français" : "CV en anglais"}</span>`,
        notFound: "Commande inconnue : <span class='blue-color'>help</span> pour la liste des commandes",
        langCurrent: "Langue actuelle : français. Tapez <span class='blue-color clickable' data-cmd='lang en'>lang en</span> pour l'anglais.",
        langUnknown: "lang: langue inconnue. Disponibles : <span class='blue-color'>en</span>, <span class='blue-color'>fr</span>",
        langSwitched: "🌐 Langue : français.",
        langButton: { label: "EN", title: "English version", cmd: "lang en" },
        secretsReadme: `<span class="green-color bold">🕵️ Bravo, vous avez trouvé /secrets.</span>
Un vrai ingénieur ne s'arrête jamais au premier ls.

Votre récompense : un petit jeu.
Tapez <span class="blue-color clickable" data-cmd="/secrets/snake">./snake</span> pour jouer.
`,
        binaryFile: name => `cat: ${name} : fichier binaire — essayez <span class="blue-color clickable" data-cmd="/secrets/snake">./${name}</span>`,
        snake: {
            score: "Score", best: "Record", quit: "Quitter",
            start: "SNAKE", startHint: "appuyez sur une flèche pour commencer",
            paused: "PAUSE", gameOver: "PERDU", won: "GAGNÉ !",
            again: "Entrée : rejouer · Échap : quitter",
            helpKeys: "Flèches / ZQSD / WASD pour bouger · Espace : pause · Échap : quitter",
            helpTouch: "Glissez sur le plateau ou utilisez les boutons",
            ended: "Snake fermé."
        }
    }
};

function loadLang() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (LANGS.includes(saved)) return saved;
    } catch (err) { }
    return DEFAULT_LANG;
}

const urlParams = new URLSearchParams(window.location.search);

let lang = LANGS.includes(urlParams.get("lang")) ? urlParams.get("lang") : loadLang();
document.documentElement.lang = lang;

function t(key) {
    return I18N[lang][key];
}

function updateUrl(openPath) {
    const params = new URLSearchParams();
    if (openPath) params.set("open", openPath);
    if (lang !== DEFAULT_LANG) params.set("lang", lang);

    const query = params.toString().replace(/%2F/g, "/");
    const url = window.location.pathname + (query ? "?" + query : "");

    if (url !== window.location.pathname + window.location.search) {
        history.pushState(null, "", url);
    }
}

function setLang(newLang) {
    lang = newLang;
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (err) {  }
}


async function loadFilesystem() {
    try {
        const response = await fetch(MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) throw new Error(response.status);
        filesystem = { type: "dir", children: await response.json() };
    } catch (err) {
        print(t("manifestError"));
        print(t("manifestHint"));
    }
    addSecrets();
}

// /secrets : absent de ls, tree et des raccourcis ; on y entre avec "cd secrets"
function addSecrets() {
    filesystem.children.secrets = {
        type: "dir",
        hidden: true,
        children: {
            "README.txt": { type: "text", content: () => t("secretsReadme") },
            "snake": { type: "exec", program: "snake" }
        }
    };
}

function visibleEntries(children) {
    return Object.entries(children).filter(([, item]) => !item.hidden);
}


function showBootScreen() {
    output.insertAdjacentHTML("beforeend",
        `<span class="compact-mobile">${t("banner")}<br><br>${t("help")}<br></span>`);
    output.scrollTop = output.scrollHeight;
}


function print(text) {
    output.insertAdjacentHTML("beforeend", text + "<br>");
    output.scrollTop = output.scrollHeight;
}


const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let finishTyping = null;


function printTyped(html, duration = 700) {
    const block = document.createElement("span");
    block.innerHTML = html;

    if (reducedMotion) {
        output.appendChild(block);
        print("");
        return Promise.resolve();
    }

    const media = block.querySelectorAll("iframe, img");
    media.forEach(el => el.style.visibility = "hidden");

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

function absolutePath(name) {
    return "/" + [...currentPath.slice(1), name].join("/");
}

function ls() {
    const node = getNode();
    let result = "";

    visibleEntries(node).forEach(([name, item]) => {
        if (item.type === "dir") {
            result += `<span class="dir clickable" data-cmd="cd ${absolutePath(name)}">📁 ${name}/</span><br>`;
        } else if (item.type === "exec") {
            result += `<span class="green-color bold clickable" data-cmd="${absolutePath(name)}">⚙️ ${name}*</span><br>`;
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

    const fullPath = resolvePath(name);
    const node = nodeAt(fullPath);

    if (!node) {
        print(t("fileNotFound"));
        return;
    }

    if (node.type === "dir") {
        print(t("isDirectory")(escapeHtml(name)));
        return;
    }

    if (node.type === "exec") {
        print(t("binaryFile")(escapeHtml(fullPath[fullPath.length - 1])));
        return;
    }

    if (node.type === "text") {
        await printTyped(node.content());
        return;
    }

    if (node.path.toLowerCase().endsWith(".pdf")) {
        window.open(node.path, "_blank");
        return;
    }

    const textPath = (node.translations && node.translations[lang]) || node.path;

    try {
        const response = await fetch(textPath);
        if (!response.ok) throw new Error(response.status);
        updateUrl("/" + fullPath.slice(1).join("/"));
        await printTyped(await response.text());
    } catch (err) {
        print(t("loadError"));
    }
}

function fuzzyMatch(input, target) {
    input = input.toLowerCase();
    target = target.toLowerCase();

    let i = 0;
    for (let c of target) {
        if (c === input[i]) i++;
    }
    return i === input.length;
}

function getMatches(value) {
    const parts = value.split(" ");
    const command = parts[0];
    const last = parts[parts.length - 1] || "";

    let options = [];

    if (parts.length === 1 && value.startsWith("./")) {
        options = Object.keys(getNode()).filter(name => getNode()[name].type === "exec").map(name => "./" + name);
    } else if (parts.length === 1) {
        options = COMMANDS;
    } else if (command === "cd") {
        options = visibleEntries(getNode()).filter(([, item]) => item.type === "dir").map(([name]) => name);
    } else if (command === "cat") {
        options = Object.keys(getNode());
    } else if (command === "lang" || command === "cv") {
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

let tabCycle = null;

function autocomplete(value, backwards = false) {
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

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function tree() {
    const lines = ["<span class='dir'>~</span>"];

    (function walk(node, prefix, path) {
        const entries = visibleEntries(node.children);
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

async function sudo(arg) {
    if (!/^hire[- ]?me$/i.test(arg)) {
        print(t("sudoDenied"));
        return;
    }

    await printTyped(t("sudoHire"), 1200);
}

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
    updateUrl(new URLSearchParams(window.location.search).get("open"));

    output.innerHTML = "";
    showBootScreen();
    print(t("langSwitched") + "\n");
}


const commandHistory = [];
let historyIndex = 0;     
let historyDraft = "";   

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

    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
}


async function runProgram(program) {
    if (program !== "snake" || typeof SnakeGame === "undefined") return;

    input.disabled = true;
    document.getElementById("shortcuts").classList.add("disabled");
    if (finishTyping) finishTyping();

    try {
        await SnakeGame.start(output, t("snake"));
    } finally {
        input.disabled = false;
        document.getElementById("shortcuts").classList.remove("disabled");
        print("");
        if (window.matchMedia("(pointer: fine)").matches) input.focus();
    }
}

async function handleCommand(cmd) {
    if (!cmd) return;

    addToHistory(cmd);
    print(`<span class="prompt">${promptElement.textContent}</span> ${escapeHtml(cmd)}`);

    const [command, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    // "./snake", "/secrets/snake"…
    if (command.includes("/")) {
        const node = nodeAt(resolvePath(command.replace(/^\.\//, "")));
        if (node && node.type === "exec") {
            await runProgram(node.program);
            return;
        }
        if (node && node.type === "dir") {
            print(`bash: ${escapeHtml(command)}: Is a directory`);
            return;
        }
    }

    switch (command) {
        case "clear":
            output.innerHTML = "";
            showBootScreen();
            updateUrl(null);
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
            const cvs = findCvs();
            const wanted = arg.toLowerCase();

            if (wanted && !LANGS.includes(wanted)) {
                print(t("cvUsage"));
                return;
            }

            const cv = wanted ? cvs[wanted] : findCv();
            if (!cv) {
                print(t("cvNotFound"));
                return;
            }

            await openFile(cv);

            // Sans argument : on rappelle que l'autre version existe
            const other = (wanted || (cv === cvs.en ? "en" : "fr")) === "en" ? "fr" : "en";
            if (!wanted && cvs[other]) print(t("cvOther")(other) + "\n");
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

let commandQueue = Promise.resolve();

function runCommands(...cmds) {
    cmds.forEach(cmd => {
        commandQueue = commandQueue.then(() => handleCommand(cmd));
    });

    if (window.matchMedia("(pointer: fine)").matches) input.focus();

    return commandQueue;
}

output.addEventListener("click", function(e) {
    if (finishTyping) finishTyping();

    const target = e.target.closest("[data-cmd]");
    if (target) runCommands(target.dataset.cmd);
});

// CV français : CV_xxx.pdf ; CV anglais : CV_xxx_en.pdf
function findCvs() {
    const about = filesystem.children.about;
    if (!about || about.type !== "dir") return {};
    const pdfs = Object.keys(about.children).filter(n => /^cv.*\.pdf$/i.test(n));
    const en = pdfs.find(n => /_en\.pdf$/i.test(n));
    const fr = pdfs.find(n => !/_en\.pdf$/i.test(n));
    return {
        fr: fr ? `/about/${fr}` : null,
        en: en ? `/about/${en}` : null
    };
}

function findCv(wanted) {
    const cvs = findCvs();
    return cvs[wanted] || cvs[lang] || cvs.fr || cvs.en || null;
}

function buildShortcuts() {
    const bar = document.getElementById("shortcuts");
    if (!bar) return;

    const shortcuts = Object.keys(filesystem.children)
        .filter(name => filesystem.children[name].type === "dir" && !filesystem.children[name].hidden)
        .map(name => ({ label: `${name}/`, cmds: [`cd /${name}`, "ls"] }));

    const cvs = findCvs();
    if (cvs.fr) shortcuts.push({ label: "CV (FR)", cmds: ["cv fr"], className: "cv" });
    if (cvs.en) shortcuts.push({ label: "CV (EN)", cmds: ["cv en"], className: "cv" });

    shortcuts.push({ label: "clear", cmds: ["clear"], className: "muted" });

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

document.getElementById("input-line").addEventListener("click", () => input.focus());

input.addEventListener("keydown", function(e) {
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

    if (e.key !== "Shift") tabCycle = null;
});

(async function init() {
    showBootScreen();
    updatePrompt();
    await loadFilesystem();
    buildShortcuts();

    const openPath = urlParams.get("open");
    if (openPath) runCommands(`cat ${openPath}`);
})();