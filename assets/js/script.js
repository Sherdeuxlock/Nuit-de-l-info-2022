/** @type {HTMLDivElement | null} */
const landingCard = document.getElementById("landingCard");

/** @type {HTMLDivElement | null} */
const boardCard = document.getElementById("boardCard");

/** @type {HTMLCanvasElement | null} */
const board = document.getElementById("board");

/** @type {string} */
let username;

/** @type {number} */
let question = 0;

/**
 * @typedef {{
 *  dimensions: [number, number],
 *  delay: number,
 *  walls: [number, number][],
 *  foods: [number, number][],
 *  snake: [number, number][],
 *  direction: "up" | "down" | "left" | "right",
 *  questions: {
 *    question: string,
 *    answers: string[],
 *    correctAnswer: number,
 *    explanation: string,
 *    link: string,
 *  }[],
 * }} Settings
 * @type {Settings}
 */
let settings = {
    dimensions: [24, 24],
    delay: 200,
    walls: [],
    foods: [],
    snake: [],
    direction: "left",
    questions: [],
};

/** @type {number} */
let score;

/** @type {boolean} */
let alive = false;

/** @type {boolean} */
let slowed = false;

const images = {
    head: {
        left: new Image(),
        right: new Image(),
        up: new Image(),
        down: new Image(),
    },
    body: {
        v: new Image(),
        h: new Image(),
        r: {
            lu: new Image(),
            ld: new Image(),
            ru: new Image(),
            rd: new Image(),
        },
    },
    tail: {
        left: new Image(),
        right: new Image(),
        up: new Image(),
        down: new Image(),
    },
    condom: new Image(),
};

/**
 * Sets up modals
 */
const setupModals = () => {
    const modals = document.getElementById("modals");

    if (modals) {
        const settingsmodal = modals.querySelector("div.modal.settings");
        const leaderboard = modals.querySelector("div.modal.leaderboard");
        const gameover = modals.querySelector("div.modal.gameover");
        const settingsTogglers = settingsmodal.querySelectorAll(".modal-close");
        const leaderboardTogglers = leaderboard.querySelectorAll(".modal-close");
        const gameoverTogglers = gameover.querySelectorAll(".modal-close");

        for (const toggler of settingsTogglers) toggler.addEventListener("click", () => setModalOpened("settings", false));
        for (const toggler of leaderboardTogglers) toggler.addEventListener("click", () => setModalOpened("leaderboard", false));
        for (const toggler of gameoverTogglers) toggler.addEventListener("click", () => setModalOpened("gameover", false));
    }
};

/**
 * Sets up images
 */
 const setupImages = () => {
    images.head.left.src = "/assets/images/snake_head_left.webp";
    images.head.right.src = "/assets/images/snake_head_right.webp";
    images.head.up.src = "/assets/images/snake_head_up.webp";
    images.head.down.src = "/assets/images/snake_head_down.webp";

    images.body.h.src = "/assets/images/snake_body_h.webp";
    images.body.v.src = "/assets/images/snake_body_v.webp";

    images.body.r.lu.src = "/assets/images/snake_body_r_leftup.webp";
    images.body.r.ld.src = "/assets/images/snake_body_r_leftdown.webp";
    images.body.r.ru.src = "/assets/images/snake_body_r_rightup.webp";
    images.body.r.rd.src = "/assets/images/snake_body_r_rightdown.webp";

    images.tail.left.src = "/assets/images/snake_tail_left.webp";
    images.tail.right.src = "/assets/images/snake_tail_right.webp";
    images.tail.up.src = "/assets/images/snake_tail_up.webp";
    images.tail.down.src = "/assets/images/snake_tail_down.webp";

    images.condom.src = "/assets/images/condom.webp";
}

/**
 * Toggles given model
 * @param {string} type 
 */
const toggleModal = (type) => {
    setModalOpened(type, "toggle");
};

/**
 * Changes modal state
 * @param {string} type
 * @param {boolean | "toggle"} isOpened
 */
const setModalOpened = (type, isOpened) => {
    /** @type {HTMLDivElement | null} */
    const modals = document.getElementById("modals");
    
    if (modals) {
        const modal = modals.querySelector("div.modal." + type);
        const togglers = document.querySelectorAll("button." + type);
        if (isOpened == "toggle") {
            modal.classList.toggle("active");
            togglers.forEach((toggler) => toggler.classList.toggle("active"));
        } else if (isOpened) {
            modal.classList.add("active");
            togglers.forEach((toggler) => toggler.classList.add("active"));
        } else {
            modal.classList.remove("active");
            togglers.forEach((toggler) => toggler.classList.remove("active"));
        }
    }
};

/**
 * Sets template interactions and initializes values
 */
const setupInteractions = () => {
    const settingsTogglers = document.querySelectorAll("button.settings");
    const leaderboardTogglers = document.querySelectorAll("button.leaderboard");
    const startTogglers = document.querySelectorAll("button.start");

    for (const toggler of settingsTogglers) toggler.addEventListener("click", () => setModalOpened("settings", "toggle"));
    for (const toggler of leaderboardTogglers) toggler.addEventListener("click", () => setModalOpened("leaderboard", "toggle"));
    for (const toggler of startTogglers) toggler.addEventListener("click", startGame);

    document.querySelectorAll('.increment-gridsize-x').forEach((element) => element.addEventListener("click", () => {
        settings.dimensions[0]++;
        setTemplateValues("gridsize-x");
    }));
    document.querySelectorAll('.decrement-gridsize-x').forEach((element) => element.addEventListener("click", () => {
        if (settings.dimensions[0] - 1 > 0) settings.dimensions[0]--;
        setTemplateValues("gridsize-x");
    }));
    document.querySelectorAll('.increment-gridsize-y').forEach((element) => element.addEventListener("click", () => {
        settings.dimensions[1]++;
        setTemplateValues("gridsize-y");
    }));
    document.querySelectorAll('.decrement-gridsize-y').forEach((element) => element.addEventListener("click", () => {
        if (settings.dimensions[1] - 1 > 0) settings.dimensions[1]--;
        setTemplateValues("gridsize-y");
    }));

    document.querySelectorAll('.delete-local-cache').forEach((element) => element.addEventListener("click", () => localStorage.clear()));

    window.addEventListener("resize", resizeBoard);

    window.addEventListener("keydown", (e) => {
        if (e.key == "ArrowDown") settings.direction = "down";
        else if (e.key == "ArrowUp") settings.direction = "up";
        else if (e.key == "ArrowLeft") settings.direction = "left";
        else if (e.key == "ArrowRight") settings.direction = "right";
    });
};

/**
 * Sets template values
 * @param {string=} type
 */
const setTemplateValues = (type = undefined) => {
    switch (type) {
        case undefined:
        case "gridsize-x":
            document.querySelectorAll(".value.value-gridsize-x").forEach((element) => element.textContent = settings.dimensions[0]);
            if (type) break;
        case "gridsize-y":
            document.querySelectorAll(".value.value-gridsize-y").forEach((element) => element.textContent = settings.dimensions[1]);
            if (type) break;
        case "leaderboard":
            document.querySelectorAll(".value.value-leaderboard").forEach((element) => {
                element.innerHTML = "";
                let storedLeaderboard = localStorage.getItem("leaderboard");

                if (storedLeaderboard) {
                    try {
                        storedLeaderboard = JSON.parse(storedLeaderboard);
                        for (const score of storedLeaderboard) {
                            const el = document.createElement("div");

                            const left = document.createElement("div");
                            const right = document.createElement("div");
                            left.classList.add("left");
                            right.classList.add("right");

                            el.append(left);
                            el.append(right);

                            const name = document.createElement("p");
                            name.textContent = score[0] || "Invité";
                            left.append(name);

                            const value = document.createElement("p");
                            value.textContent = score[1];
                            right.append(value);

                            element.append(el);
                        }
                    } catch (e) {
                        element.innerHTML = "";
                        console.error("Le classement n'a pas pu être chargé.");
                        console.error(e);
                    }
                } else {
                    const el = document.createElement("div");
                    const left = document.createElement("div");
                    left.classList.add("left");
                    el.append(left);
                    const status = document.createElement("p");
                    status.textContent = "Le classement est vide";
                    left.append(status);
                    element.append(el);
                }
            });
            if (type) break;
        case "username":
            document.querySelectorAll(".value.value-username").forEach((element) => element.textContent = username || "Invité");
            if (type) break;
        case "score":
            document.querySelectorAll(".value.value-score").forEach((element) => element.textContent = score);
            if (type) break;
        case "question-title":
            document.querySelectorAll(".value.value-question-title").forEach((element) => settings.questions.length >= 1 && (element.textContent = settings.questions[question].question));
            if (type) break;
        case "question-responses":
            document.querySelectorAll(".value.value-question-responses").forEach((element) => {
                element.innerHTML = "";
                if (settings.questions.length >= 1) for (let i = 0; i < settings.questions[question].answers.length; i++) {
                    let container = document.createElement("div");
                    let left = document.createElement("div");
                    let right = document.createElement("div");
                    left.classList.add("left");
                    right.classList.add("right");

                    let text = document.createElement("p");
                    text.textContent = settings.questions[question].answers[i];
                    left.append(text);

                    let button = document.createElement("button");
                    button.addEventListener("click", () => {
                        score++;
                        setModalOpened("question", false);
                        slowed = false;
                        question = (question + 1) % settings.questions.length;
                    });
                    button.textContent = "Valider";
                    right.append(button);

                    container.append(left);
                    container.append(right);
                    element.append();
                }
            });
            if (type) break;
    }
};

/**
 * Starts the game
 */
const startGame = () => {
    landingCard.classList.remove("active");
    boardCard.classList.add("active");

    score = 0;
    username = document.querySelector("input[name=nickname]").value;

    /** @type {HTMLInputElement} */
    const configuration = document.getElementById("configuration");

    if (configuration.files != null && configuration.files.length > 0) {
        let file = configuration.files[0];
        file.text().then((content) => {
            let parsedConfiguration = JSON.parse(content);
            settings = Object.assign({}, settings, parsedConfiguration);
        }).catch((e) => {
            console.error("La configuration n'a pas pu être chargée et restera celle par défaut.");
            console.error(e);
        });
    }

    if (settings.questions.length == 0) {
        fetch("/assets/json/questions.json").then(c => c.json()).then((data) => {
            resizeBoard();

            setTemplateValues("score");

            if (settings.foods.length == 0) settings.foods = [getEmptyCoord()];
            if (settings.snake.length == 0) settings.snake = [getEmptyCoord()];
            if (settings.snake.length == 1) settings.snake.push([settings.snake[0][0] + 1, [settings.snake[0][1]]]);
            alive = true;
            updateBoard();
        });
    } else {
        resizeBoard();

        setTemplateValues("score");

        if (settings.foods.length == 0) settings.foods = [getEmptyCoord()];
        if (settings.snake.length == 0) settings.snake = [getEmptyCoord()];
        if (settings.snake.length == 1) settings.snake.push([settings.snake[0][0] + 1, [settings.snake[0][1]]]);
        alive = true;
        updateBoard();
    }
};

/**
 * Resizes canvas to fit window size
 */
const resizeBoard = () => {
    let ratio = settings.dimensions[0] / settings.dimensions[1];
    board.height = Math.min(window.innerHeight - 100, (window.innerWidth - 20) / ratio);
    board.width = Math.min(window.innerWidth - 20, (window.innerHeight - 100) * ratio);
};

/**
 * Updates snake movements
 */
const updateMovements = () => {
    let headMod;
    let head;
    switch (settings.direction) {
        case "up":
            headMod = (settings.snake[0][1] - 1) % settings.dimensions[1];
            if (headMod < 0) headMod += settings.dimensions[1];
            head = [settings.snake[0][0], headMod];
            settings.snake = [head, ...settings.snake];
            settings.snake.pop();
            break;
        case "down":
            headMod = (settings.snake[0][1] + 1) % settings.dimensions[1];
            if (headMod < 0) headMod += settings.dimensions[1];
            head = [settings.snake[0][0], headMod];
            settings.snake = [head, ...settings.snake];
            settings.snake.pop();
            break;
        case "left":
            headMod = (settings.snake[0][0] - 1) % settings.dimensions[0];
            if (headMod < 0) headMod += settings.dimensions[0];
            head = [headMod, settings.snake[0][1]];
            settings.snake = [head, ...settings.snake];
            settings.snake.pop();
            break;
        case "right":
            headMod = (settings.snake[0][0] + 1) % settings.dimensions[0];
            if (headMod < 0) headMod += settings.dimensions[0];
            head = [headMod, settings.snake[0][1]];
            settings.snake = [head, ...settings.snake];
            settings.snake.pop();
            break;
    }
};

/**
 * Ends game
 */
const endGame = () => {
    alive = false;
    question = 0;
    boardCard.classList.remove("active");
    landingCard.classList.add("active");
    setTemplateValues("username");
    setTemplateValues("score");
    setModalOpened("gameover", true);
    let leaderboard = localStorage.getItem("leaderboard");
    if (leaderboard) {
        try {
            /** @type {[string, number][]} */
            let parsedLeaderboard = JSON.parse(leaderboard);
            if (score > parsedLeaderboard[Math.min(parsedLeaderboard.length, 10) - 1][1]) {
                for (let i = 0; i < Math.min(parsedLeaderboard.length, 10); i++) {
                    if (score > parsedLeaderboard[i][1]) {
                        parsedLeaderboard = [...parsedLeaderboard.slice(0, i), [username, score], ...parsedLeaderboard.slice(i, 10)];
                        break;
                    }
                }
            } else if (parsedLeaderboard.length < 10) {
                parsedLeaderboard.push([username, score]);
            }
            localStorage.setItem("leaderboard", JSON.stringify(parsedLeaderboard));
        } catch (e) {
            console.error("Le classement n'a pas pu être mis à jour");
            console.error(e);
        }
    } else {
        localStorage.setItem("leaderboard", JSON.stringify([[username, score]]));
    }
    setTemplateValues("leaderboard");
    settings = {
        dimensions: [24, 24],
        delay: 200,
        walls: [],
        foods: [],
        snake: [],
        direction: "left",
    };
}

/**
 * Gets random empty coordinates on board
 * @return Coordinates on board
 */
const getEmptyCoord = () => {
    let n_emptyTiles = settings.dimensions[0] * settings.dimensions[1];
    n_emptyTiles -= settings.walls.length;
    n_emptyTiles -= settings.foods.length;
    n_emptyTiles -= settings.snake.length;

    if(n_emptyTiles == 0) endGame();

    let counter = Math.floor(Math.random() * n_emptyTiles);

    for (let i = 0 ; i < settings.dimensions[0] ; i++) for (let j = 0; j < settings.dimensions[1]; j++) {
        if (checksAnyCollisions(i, j) == "none") {
            if (counter == 1) return [i, j];
            else counter--;
        }
    }
};

/**
 * Checks collision with the board components
 * @param {number} x 
 * @param {number} y 
 * @return The name of component who collides
 */
const checksAnyCollisions = (x, y) => {
    for (let wall in settings.walls) {
        if (wall[0] == x && wall[1] == y) {
            return "wall";
        } 
    }
    for(let sec in settings.snake){
        if (sec[0] == x && sec[1] == y) {
            return "snake";
        }
    }
    for(let food in settings.foods){
        if (food[0] == x && food[1] == y) {
            return "food";
        }
    }

    return "none";
}

/**
 * Checks collisions with snake head
 */
const checkCollisions = () => {
    for (const wall of settings.walls) {
        if (wall[0] == settings.snake[0][0] && wall[1] == settings.snake[0][1]) {
            endGame();
        }
    }

    for (let i = 1; i < settings.snake.length; i++) {
        if (settings.snake[i][0] == settings.snake[0][0] && settings.snake[i][1] == settings.snake[0][1]) {
            endGame();
        }
    }

    for (const food of settings.foods) {
        if (food[0] == settings.snake[0][0] && food[1] == settings.snake[0][1]) {
            settings.snake.push(settings.snake[settings.snake.length - 1]);
            let newPos = getEmptyCoord();
            food[0] = newPos[0];
            food[1] = newPos[1];
            setModalOpened("question", true);
            slowed = true;
            setTemplateValues("score");
        }
    }
};

/**
 * Updates board periodically
 */
const updateBoard = () => {
    updateMovements();
    checkCollisions();
    drawBoard();
    if (alive) setTimeout(updateBoard, Math.max(settings.delay - 2 * score, 10) * (slowed ? 5 : 1));
};

/**
 * Draws elements on board
 */
const drawBoard = () => {
    if (!board) return;
    const context = board.getContext("2d");

    let unit = board.width / settings.dimensions[0];

    context.clearRect(0, 0, board.width, board.height);
    
    for (const wall of settings.walls) {
        context.fillStyle = "#323232";
        context.fillRect(wall[0] * unit, wall[1] * unit, unit, unit);
    }

    for (const food of settings.foods) {
        context.drawImage(images.condom, food[0] * unit, food[1] * unit, unit, unit);
    }

    for (let i = 0; i < settings.snake.length; i++) {
        if (i == 0) {
            switch (settings.direction) {
                case "up":
                    context.drawImage(images.head.up, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    break;
                case "down":
                    context.drawImage(images.head.down, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    break;
                case "left":
                    context.drawImage(images.head.left, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    break;
                case "right":
                    context.drawImage(images.head.right, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    break;
            }
        } else if (i == settings.snake.length - 1) {
            let checker = settings.snake[i - 1];
            if (checker[0] == settings.snake[i][0] && checker[1] == settings.snake[i][1]) {
                checker = settings.snake[i - 2];
            }
            if (settings.snake[i][0] > settings.snake[i - 1][0]) {
                context.drawImage(images.tail.left, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            } else if (settings.snake[i][0] < settings.snake[i - 1][0]) {
                context.drawImage(images.tail.right, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            } else if (settings.snake[i][1] > settings.snake[i - 1][1]) {
                context.drawImage(images.tail.up, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            } else {
                context.drawImage(images.tail.down, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            }
        } else if (settings.snake[i][0] != settings.snake[i + 1][0] || settings.snake[i][1] != settings.snake[i + 1][1]) {
            if (settings.snake[i + 1][0] != settings.snake[i - 1][0] && settings.snake[i + 1][1] != settings.snake[i - 1][1]) {
                if (settings.snake[i + 1][0] > settings.snake[i][0] || settings.snake[i - 1][0] > settings.snake[i][0]) {
                    if (settings.snake[i + 1][1] > settings.snake[i][1] || settings.snake[i - 1][1] > settings.snake[i][1]) {
                        context.drawImage(images.body.r.rd, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    } else {
                        context.drawImage(images.body.r.ru, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    }
                } else {
                    if (settings.snake[i + 1][1] > settings.snake[i][1] || settings.snake[i - 1][1] > settings.snake[i][1]) {
                        context.drawImage(images.body.r.ld, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    } else {
                        context.drawImage(images.body.r.lu, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
                    }
                }
            } else if (settings.snake[i - 1][0] == settings.snake[i][0]) {
                context.drawImage(images.body.v, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            } else {
                context.drawImage(images.body.h, settings.snake[i][0] * unit, settings.snake[i][1] * unit, unit, unit);
            }
        }
    }
};

// Starts the application
(function() {
    setupModals();
    setupImages();
    setupInteractions();
    setTemplateValues();
})();