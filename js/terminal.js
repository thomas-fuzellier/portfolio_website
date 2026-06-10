
const input = document.getElementById("input");
const output = document.getElementById("output");
const promptElement = document.getElementById("prompt");

const filesystem = {
    "/": {
        about: {
            "contact.txt": {},
            "CV_FUZELLIER_Thomas.pdf": {},
            "education.txt": {},
            "presentation.txt": {}
        },
        experiences: {
            "end-of-studies_engineering_internship.txt":{},
            "first_job.txt":{},
            "second_year_internship.txt":{}
        },
        projects: {
            "rubiks-cube_solver.txt": {},
            "portfolio_website.txt": {},
            "pokemon_game.txt": {}
        },
        skills: {
            "hard_skills.txt":{},
            "soft_skills.txt":{}
        }
    }
};

const fileContent = {

    "presentation.txt": "assets/about/presentation.txt",

    "CV_FUZELLIER_Thomas.pdf": "assets/about/CV_FUZELLIER_Thomas.pdf",

    "hard_skills.txt": "assets/skills/hard_skills.txt",

    "soft_skills.txt": "assets/skills/soft_skills.txt",

    "first_job.txt": "assets/experiences/first_job.txt",

    "end-of-studies_engineering_internship.txt": "assets/experiences/end-of-studies_engineering_internship.txt",

    "second_year_internship.txt": "assets/experiences/second_year_internship.txt",

    "pokemon_game.txt": "assets/projects/pokemon_game.txt",

    "rubiks-cube_solver.txt": "assets/projects/rubiks-cube_solver.txt",

    "portfolio_website.txt": "assets/projects/portfolio_website.txt",

    "contact.txt": "assets/about/contact.txt",

    "education.txt": "assets/about/education.txt"

};

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

function showBootScreen() {

    output.innerHTML += banner + "<br><br>";
    output.innerHTML += help + "<br>";

    output.scrollTop = output.scrollHeight;
}

function print(text) {
    output.innerHTML += text + "<br>";

    output.scrollTop = output.scrollHeight;
}

function normalize(str) {
    return str.toLowerCase();
}

function fuzzyMatch(input, target) {
    input = normalize(input);
    target = normalize(target);

    let i = 0;
    for (let c of target) {
        if (c === input[i]) i++;
    }
    return i === input.length;
}

function getPath() {
    if (currentPath.length === 1) return "~";
    return "/" + currentPath.slice(1).join("/");
}

function updatePrompt() {
    promptElement.textContent = `thomas@portfolio:${getPath()}$`;
}

function getNode() {
    let node = filesystem["/"];

    for (let i = 1; i < currentPath.length; i++) {
        node = node[currentPath[i]];
    }

    return node;
}

function ls() {

    const node = getNode();
    const items = Object.keys(node);

    let result = "";

    items.forEach(item => {

        if (item.includes(".pdf") || item.includes(".txt")) {
            result += `<span class="file">📄 ${item}</span><br>`;
        } else {
            result += `<span class="dir">📁 ${item}/</span><br>`;
        }

    });

    print(result);
}

function cd(folder) {

    if (!folder) {
        print("cd: missing argument" + "<br>");
        return;
    }

    const node = getNode();

    if (folder === "..") {
        if (currentPath.length > 1) currentPath.pop();
        updatePrompt();
        return;
    }

    if (node[folder] && !folder.includes(".")) {
        currentPath.push(folder);
        updatePrompt();
        print("")
    } else {
        print("cd: no such directory" + "<br>");
    }
}

function openFile(name) {

    const node = getNode();

    if (!node[name]) {
        print("File not found");
        return;
    }

    const content = fileContent[name];

    if (!content) {
        print("Cannot open file");
        return;
    }

    /* PDF */
    if (name.endsWith(".pdf")) {
        window.open(content, "_blank");
        return;
    }

    /* TEXT */
    print(content);
}

function getAllCommands() {
    return ["ls", "cd", "pwd", "clear", "help", "cat"];
}

function getCurrentFolders() {
    return Object.keys(getNode());
}

function autocomplete(value) {

    const parts = value.split(" ");
    const command = parts[0];
    const last = parts[parts.length - 1] || "";

    let options = [];

    /* -----------------------
       ROOT COMMANDS
    ------------------------ */
    if (parts.length === 1) {
        options = ["ls", "cd", "pwd", "clear", "help", "cat"];
    }

    /* -----------------------
       CD → folders ONLY
    ------------------------ */
    else if (command === "cd") {
        options = getCurrentFolders();
    }

    /* -----------------------
       OPEN → ALWAYS files + folders (GLOBAL FIX)
    ------------------------ */
    else if (command === "cat") {

        options = getCurrentFolders();
    }

    /* -----------------------
       SAFE MATCH
    ------------------------ */
    const normalizedLast = last.toLowerCase();

    let matches = options.filter(opt =>
        opt.toLowerCase().startsWith(normalizedLast)
    );

    /* -----------------------
       FALLBACK FUZZY
    ------------------------ */
    if (matches.length === 0) {
        matches = options.filter(opt =>
            fuzzyMatch(last, opt)
        );
    }

    /* -----------------------
       APPLY RESULT
    ------------------------ */
    if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        return parts.join(" ");
    }

    return value;
}

async function handleCommand(cmd) {

    if (!cmd) return;

    print(`<span class="prompt">${promptElement.textContent}</span> ${cmd}`);

    if (cmd === "clear") {
        output.innerHTML = "";
        showBootScreen();
        return;
    }

    if (cmd === "ls") {
        ls();
        return;
    }

    if (cmd === "pwd") {
        print(getPath());
        return;
    }

    if (cmd.startsWith("cd ")) {
        cd(cmd.split(" ")[1]);
        return;
    }

    if (cmd.startsWith("cat ")) {
        openFile(cmd.split(" ")[1]);
        return;
    }

    if (cmd === "help") {
        print("Commands: <span class='blue-color'>ls</span>, <span class='blue-color'>cd</span>, <span class='blue-color'>pwd</span>, <span class='blue-color'>cat</span>, <span class='blue-color'>clear</span>");
        return;
    }

    print("Command not found : <span class='blue-color'>help</span> for all commands");
}

async function openFile(name) {

    const node = getNode();

    if (!node[name]) {
        print("File not found");
        return;
    }

    const path = fileContent[name];

    if (!path) {
        print("Cannot open file");
        return;
    }

    /* PDF */
    if (name.endsWith(".pdf")) {
        window.open(path, "_blank");
        return;
    }

    /* TXT FILE → FETCH */
    try {
        const response = await fetch(path);
        const text = await response.text();

        print(text);

    } catch (err) {
        print("Error loading file");
    }
}

input.addEventListener("keydown", async function(e) {

    if (e.key === "Enter") {
        handleCommand(input.value.trim());
        input.value = "";
    }

    if (e.key === "Tab") {
        e.preventDefault();

        const val = input.value;
        input.value = autocomplete(val);
    }
});

showBootScreen();
updatePrompt();