const input = document.getElementById("input");
const output = document.getElementById("output");
const promptElement = document.getElementById("prompt");
const MANIFEST_URL = "assets/manifest.json";

let filesystem = { type: "dir", children: {} };

let currentPath = ["/"];

const banner = `
<span class="title">Fuzellier Thomas</span><br>
<span class="sub-title"><p>ENSEA Engineer · Embedded Systems & Software Developer</p>
<p>📧 thomas.fuzellier@outlook.fr · 📞 +33 6 10 48 41 37</p>
<p>⚙️ Computer Science & Embedded Systems  | 📊 Data | 💻 Software development | 🧠 LLM | 🟢 Open to Work</p>
</span>`;

const help = `
<span class="available">Available commands:</span><br>

<span class="blue-color">ls</span> → list files & directories<br>
<span class="blue-color">cd [folder]</span> → navigate into a directory<br>
<span class="blue-color">cd ..</span> → go back<br>
<span class="blue-color">cat [file]</span> → cat file (txt or pdf)<br>
<span class="blue-color">pwd</span> → show current directory<br>
<span class="blue-color">clear</span> → clear terminal<br>

<span class="tip">💡 Tip: click on folders and files, or use the shortcuts below.</span><br>
`;

const COMMANDS = ["ls", "cd", "pwd", "clear", "help", "cat"];

/* ---------- Chargement du système de fichiers ---------- */

async function loadFilesystem() {
    try {
        const response = await fetch(MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) throw new Error(response.status);
        filesystem = { type: "dir", children: await response.json() };
    } catch (err) {
        print("<span class='orange-color'>Could not load the filesystem (assets/manifest.json).</span>");
        print("Run <span class='blue-color'>node scripts/build-manifest.js</span> then reload the page.");
    }
}

/* ---------- Affichage ---------- */

function showBootScreen() {
    output.innerHTML += banner + "<br><br>";
    output.innerHTML += help + "<br>";
    output.scrollTop = output.scrollHeight;
}

function print(text) {
    output.innerHTML += text + "<br>";
    output.scrollTop = output.scrollHeight;
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
        print("cd: no such directory" + "<br>");
    }
}

async function openFile(name) {
    if (!name) {
        print("cat: missing argument");
        return;
    }

    const node = nodeAt(resolvePath(name));

    if (!node) {
        print("File not found");
        return;
    }

    if (node.type === "dir") {
        print(`cat: ${name}: Is a directory`);
        return;
    }

    /* PDF */
    if (node.path.toLowerCase().endsWith(".pdf")) {
        window.open(node.path, "_blank");
        return;
    }

    /* TEXT */
    try {
        const response = await fetch(node.path);
        if (!response.ok) throw new Error(response.status);
        print(await response.text());
    } catch (err) {
        print("Error loading file");
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

/* ---------- Commandes ---------- */

async function handleCommand(cmd) {
    if (!cmd) return;

    print(`<span class="prompt">${promptElement.textContent}</span> ${cmd}`);

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
        case "help":
            print("Commands: <span class='blue-color'>ls</span>, <span class='blue-color'>cd</span>, <span class='blue-color'>pwd</span>, <span class='blue-color'>cat</span>, <span class='blue-color'>clear</span>");
            return;
    }

    print("Command not found : <span class='blue-color'>help</span> for all commands");
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

    bar.innerHTML = "";
    shortcuts.forEach(({ label, cmds, className }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        if (className) button.classList.add(className);
        button.addEventListener("click", () => runCommands(...cmds));
        bar.appendChild(button);
    });
}

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        runCommands(input.value.trim());
        input.value = "";
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