
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

function ls() {
    const node = getNode();
    let result = "";

    Object.entries(node).forEach(([name, item]) => {
        if (item.type === "dir") {
            result += `<span class="dir">📁 ${name}/</span><br>`;
        } else {
            result += `<span class="file">📄 ${name}</span><br>`;
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

function autocomplete(value) {
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

    if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        return parts.join(" ");
    }

    return value;
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

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        handleCommand(input.value.trim());
        input.value = "";
    }

    if (e.key === "Tab") {
        e.preventDefault();
        input.value = autocomplete(input.value);
    }
});

/* ---------- Démarrage ---------- */

(async function init() {
    showBootScreen();
    updatePrompt();
    await loadFilesystem();
})();
