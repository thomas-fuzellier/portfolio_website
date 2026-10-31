const SnakeGame = (() => {
    const COLS = 20;
    const ROWS = 14;
    const START_SPEED = 140;
    const MIN_SPEED = 65;
    const BEST_KEY = "portfolio-snake-best";

    const COLORS = {
        grid: "#161b22",
        border: "#30363d",
        body: "#3FB950",
        head: "#00ff22",
        food: "#ffe600",
        text: "#919191",
        dead: "#f88d00"
    };

    const DIRECTIONS = {
        up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
        left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
    };

    // Flèches, WASD (QWERTY) et ZQSD (AZERTY)
    const KEYS = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        z: "up", q: "left"
    };

    function loadBest() {
        try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (err) { return 0; }
    }

    function saveBest(score) {
        try { localStorage.setItem(BEST_KEY, String(score)); } catch (err) { }
    }

    function start(container, texts) {
        return new Promise(resolve => {
            const touch = window.matchMedia("(pointer: coarse)").matches;

            const wrapper = document.createElement("div");
            wrapper.className = "snake";
            wrapper.innerHTML = `
                <div class="snake-hud"><span class="snake-score"></span><span class="snake-best"></span></div>
                <canvas class="snake-canvas" aria-label="Snake"></canvas>
                <div class="snake-help">${touch ? texts.helpTouch : texts.helpKeys}</div>
                ${touch ? `<div class="snake-pad">
                    <button data-dir="up">▲</button>
                    <button data-dir="left">◀</button><button data-dir="pause">❚❚</button><button data-dir="right">▶</button>
                    <button data-dir="down">▼</button>
                    <button data-dir="quit" class="snake-quit">${texts.quit}</button>
                </div>` : ""}`;
            container.appendChild(wrapper);

            const canvas = wrapper.querySelector("canvas");
            const ctx = canvas.getContext("2d");
            const scoreEl = wrapper.querySelector(".snake-score");
            const bestEl = wrapper.querySelector(".snake-best");

            // Taille du plateau : cases carrées, adaptées à la largeur disponible
            const cell = Math.max(12, Math.min(20, Math.floor((container.clientWidth - 40) / COLS)));
            const ratio = window.devicePixelRatio || 1;
            canvas.width = COLS * cell * ratio;
            canvas.height = ROWS * cell * ratio;
            canvas.style.width = `${COLS * cell}px`;
            canvas.style.height = `${ROWS * cell}px`;
            ctx.scale(ratio, ratio);

            let snake, direction, queue, food, score, best = loadBest();
            let state = "ready";   // ready | playing | paused | over
            let timer = null;

            function reset() {
                const y = Math.floor(ROWS / 2);
                snake = [{ x: 6, y }, { x: 5, y }, { x: 4, y }];
                direction = DIRECTIONS.right;
                queue = [];
                score = 0;
                placeFood();
                updateHud();
            }

            function placeFood() {
                const free = [];
                for (let x = 0; x < COLS; x++) {
                    for (let y = 0; y < ROWS; y++) {
                        if (!snake.some(p => p.x === x && p.y === y)) free.push({ x, y });
                    }
                }
                food = free[Math.floor(Math.random() * free.length)];
            }

            function updateHud() {
                scoreEl.textContent = `${texts.score}: ${score}`;
                bestEl.textContent = `${texts.best}: ${best}`;
            }

            function speed() {
                return Math.max(MIN_SPEED, START_SPEED - score * 4);
            }

            function turn(name) {
                const next = DIRECTIONS[name];
                const last = queue.length ? queue[queue.length - 1] : direction;
                // Pas de demi-tour sur soi-même ; on garde au plus 2 virages en attente
                if (next.x === -last.x && next.y === -last.y) return;
                if (next === last || queue.length >= 2) return;
                queue.push(next);
            }

            function step() {
                if (queue.length) direction = queue.shift();

                const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
                const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
                const eating = head.x === food.x && head.y === food.y;
                const body = eating ? snake : snake.slice(0, -1);
                const hitSelf = body.some(p => p.x === head.x && p.y === head.y);

                if (hitWall || hitSelf) {
                    gameOver();
                    return;
                }

                snake.unshift(head);
                if (eating) {
                    score++;
                    if (snake.length === COLS * ROWS) { gameOver(true); return; }
                    placeFood();
                    updateHud();
                } else {
                    snake.pop();
                }

                draw();
                timer = setTimeout(step, speed());
            }

            function play() {
                if (state === "over") reset();
                state = "playing";
                clearTimeout(timer);
                draw();
                timer = setTimeout(step, speed());
            }

            function pause() {
                if (state !== "playing") return;
                state = "paused";
                clearTimeout(timer);
                draw();
            }

            function gameOver(won = false) {
                state = "over";
                clearTimeout(timer);
                if (score > best) {
                    best = score;
                    saveBest(best);
                }
                updateHud();
                draw(won ? texts.won : texts.gameOver);
            }

            function roundRect(x, y, w, h, r) {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.fill();
            }

            function draw(message) {
                const w = COLS * cell;
                const h = ROWS * cell;

                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, w, h);

                // Petits points de grille
                ctx.fillStyle = COLORS.grid;
                for (let x = 0; x < COLS; x++) {
                    for (let y = 0; y < ROWS; y++) {
                        ctx.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
                    }
                }

                // Nourriture
                ctx.fillStyle = COLORS.food;
                ctx.beginPath();
                ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * 0.32, 0, Math.PI * 2);
                ctx.fill();

                // Serpent
                snake.forEach((p, i) => {
                    ctx.fillStyle = state === "over" ? COLORS.dead : (i === 0 ? COLORS.head : COLORS.body);
                    roundRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2, cell * 0.25);
                });

                // Yeux sur la tête
                const head = snake[0];
                ctx.fillStyle = "#000";
                const ex = direction.y !== 0 ? [0.3, 0.7] : [0.5, 0.5];
                const ey = direction.x !== 0 ? [0.3, 0.7] : [0.5, 0.5];
                const ox = direction.x * 0.15, oy = direction.y * 0.15;
                for (let k = 0; k < 2; k++) {
                    ctx.fillRect((head.x + ex[k] + ox) * cell - 1.5, (head.y + ey[k] + oy) * cell - 1.5, 3, 3);
                }

                // Cadre
                ctx.strokeStyle = state === "over" ? COLORS.dead : COLORS.border;
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, w - 2, h - 2);

                // Message au centre
                const text = message
                    || (state === "ready" ? texts.start : state === "paused" ? texts.paused : null);
                if (text) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(0, h / 2 - cell * 1.4, w, cell * 2.8);
                    ctx.fillStyle = state === "over" ? COLORS.dead : COLORS.head;
                    ctx.font = `bold ${Math.round(cell * 0.8)}px monospace`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(text, w / 2, h / 2 - cell * 0.35);
                    ctx.fillStyle = COLORS.text;
                    ctx.font = `${Math.round(cell * 0.55)}px monospace`;
                    ctx.fillText(state === "over" ? texts.again : texts.startHint, w / 2, h / 2 + cell * 0.6);
                }
            }

            function quit() {
                clearTimeout(timer);
                document.removeEventListener("keydown", onKey, true);
                wrapper.classList.add("snake-ended");
                wrapper.querySelector(".snake-help").textContent =
                    `${texts.ended} ${texts.score}: ${score} · ${texts.best}: ${best}`;
                const pad = wrapper.querySelector(".snake-pad");
                if (pad) pad.remove();
                resolve(score);
            }

            function onKey(e) {
                const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

                if (key === "Escape" || key === "x") {
                    e.preventDefault(); e.stopPropagation();
                    quit();
                    return;
                }

                if (key === " " || key === "p") {
                    e.preventDefault(); e.stopPropagation();
                    if (state === "playing") pause(); else play();
                    return;
                }

                if (key === "Enter" || key === "r") {
                    e.preventDefault(); e.stopPropagation();
                    if (state !== "playing") play();
                    return;
                }

                if (KEYS[key]) {
                    e.preventDefault(); e.stopPropagation();
                    turn(KEYS[key]);
                    if (state === "ready" || state === "paused") play();
                }
            }

            // Mobile : glisser sur le plateau ou utiliser les boutons
            let touchStart = null;
            canvas.addEventListener("touchstart", e => {
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }, { passive: true });
            canvas.addEventListener("touchend", e => {
                if (!touchStart) return;
                const dx = e.changedTouches[0].clientX - touchStart.x;
                const dy = e.changedTouches[0].clientY - touchStart.y;
                touchStart = null;

                if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
                    if (state !== "playing") play();
                    return;
                }
                turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
                if (state !== "playing" && state !== "over") play();
            });
            canvas.addEventListener("click", () => {
                if (!touch && state !== "playing") play();
            });

            wrapper.querySelectorAll(".snake-pad button").forEach(button => {
                button.addEventListener("click", () => {
                    const action = button.dataset.dir;
                    if (action === "quit") return quit();
                    if (action === "pause") return state === "playing" ? pause() : play();
                    turn(action);
                    if (state !== "playing" && state !== "over") play();
                    if (state === "over") play();
                });
            });

            document.addEventListener("keydown", onKey, true);

            reset();
            draw();
            wrapper.scrollIntoView({ block: "end" });
        });
    }

    return { start };
})();