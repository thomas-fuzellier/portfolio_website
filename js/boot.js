const bootText = document.getElementById("boot-text");

const continueMessage = document.getElementById("continue-message");

const lines = [
    "Initializing T. Fuzellier system...",
    "",

    "Loading engineering profile...",
    "Parsing academic background...",
    "",

    "System personality check...",
    "Loading projects database...",
    "",

    "Calibrating system domains...",
    "Connecting to core system...",
    "",

    "Don't search for /secrets here...",

    // Texte orange (HTML directement dans la chaîne)
    "<span class='orange-color'>You're here totally for the love of the game.</span>",

    "",

    // Dernière ligne avec une image + texte vert
    "<img src='assets/etoile.png' class='star-icon'><span class='green-color'>thomas.fuzellier portfolio system v1.0</span> - ready."
];

let index = 0;

const totalBlocks = 16;

let barEl = null;

function printLine() {

    if (index >= lines.length) {

        showContinue();
        return;
    }

    const line = lines[index];

    bootText.innerHTML += line + "<br>";

    const loadingPoints = [
        "Parsing academic background...",
        "Connecting to core system...",
        "Loading projects database..."
    ];

    if (loadingPoints.includes(line)) {

        setTimeout(() => {

            showLoadingBar(() => {

                index++;

                setTimeout(printLine, 200);

            });

        }, 300);

        return;
    }

    index++;

    setTimeout(printLine, 200);
}

function showLoadingBar(callback) {

    barEl = document.createElement("div");

    barEl.className = "loading-bar";

    barEl.innerHTML = "[";

    const totalBlocks = 16;

    for (let i = 0; i < totalBlocks; i++) {

        barEl.innerHTML += `<span class="block">█</span>`;
    }

    barEl.innerHTML += "]";

    bootText.appendChild(barEl);

    const blocks = barEl.querySelectorAll(".block");

    let current = 0;

    function fill() {

        if (current < blocks.length) {

            blocks[current].classList.add("active");

            current++;

            setTimeout(fill, 100);

        } else {

            const done = document.createElement("div");

            done.innerHTML =
                "<span class='green-color'>[ OK ]</span>";

            bootText.appendChild(done);

            setTimeout(callback, 300);
        }
    }

    fill();
}

function showContinue() {

    continueMessage.innerHTML =
        "Press <span class='enter-key'>Enter</span> to continue...";

    continueMessage.classList.remove("hidden");
}

printLine();

document.addEventListener("keydown", (e) => {

    if (
        e.key === "Enter" &&
        !continueMessage.classList.contains("hidden")
    ) {

        window.location.href = "terminal.html";
    }
});