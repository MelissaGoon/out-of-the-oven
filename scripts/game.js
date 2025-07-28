
// Generate a bread object
function generateBreads(name, interval, raw_val, under_val, baked_val) {
    return {
        interval_length: interval,
        0: { src: `assets/${name}-0.png`, alt: `A raw ${name}`, value: raw_val },
        1: { src: `assets/${name}-1.png`, alt: `An undercooked ${name}`, value: under_val },
        2: { src: `assets/${name}-2.png`, alt: `A baked ${name}`, value: baked_val },
        3: { src: `assets/${name}-3.png`, alt: `A burnt ${name}` },
    };
}

const breads = {
    bread: generateBreads("bread", 3000, -2, 0, 3),
    croissant: generateBreads("croissant", 1000, -4, 1, 5),
    danish: generateBreads("danish", 2000, -3, 0, 4)
};

class GameSquare {
    constructor(elem) {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this.elem = elem;
        this.interval = null;
    }

    // Set image for square
    _setImg() {
        const imgCollection = this.elem.getElementsByTagName('img');
        const img = imgCollection[0];

        if (this.type != "") {
            img.src = breads[this.type][this.state].src;
            img.alt = breads[this.type][this.state].alt;
        } else {
            img.src = "";
            img.alt = "";
        }
    }

    // Progress the bread (if present and not burnt) to the next state.
    _incrementState() {
        if (this.burnt || !this.occupied) {
            return;
        }

        this.state++;

        // Trigger bounce animation when baked
        if (this.state == 2) {
            const imgCollection = this.elem.getElementsByTagName('img');
            const img = imgCollection[0];

            img.classList.add("bounce");
        }

        // Handle burnt
        if (this.state >= 3) {
            this.burnt = true;
            this.state = 3;
            this._notifyBurnt();
        }

        this._setImg();
    }

    // Dispatch burnt event, listened for by the game class and stop interval
    _notifyBurnt() {
        this.stop();
        const event = new Event("burnt");
        this.elem.dispatchEvent(event);
    }

    // Setters
    // Add a bread to the square
    addItem(type) {
        if (this.occupied || this.burnt) {
            return;
        }

        this.occupied = true;
        this.state = 0;
        this.type = type;

        this._setImg();

        // Set interval for bread to increase in state
        this.interval = setInterval(() => this._incrementState(), breads[this.type].interval_length);
    }

    // Reset the square to the empty state
    reset() {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this._setImg();

        const imgCollection = this.elem.getElementsByTagName('img');
        const img = imgCollection[0];
        img.classList.remove("bounce");

        this.stop()

    }

    // Stop bread state advancing
    stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }


    // Getters
    isOccupied() {
        return this.occupied;
    }

    isBurnt() {
        return this.burnt;
    }

    getState() {
        return this.state;
    }

    getType() {
        return this.type;
    }


}


class Game {
    constructor() {
        this.sounds = new Sounds();

        this.elems = {};
        this._setUpElems();
        this._setUpEvents();

        this._onStartScreenExit = () => { this._handleStartScreenExit(); };

        // Set up object where key is id of element and value is the associated GameSquare object
        this.gameSquares = {};
        this.elems.squareElems.forEach(elem => this.gameSquares[elem.id] = new GameSquare(elem));

        this.occupiedSquaresSet = new Set();

        // Set up set of game square ids
        this.allSquaresSet = new Set();
        this.elems.squareElems.forEach(elem => this.allSquaresSet.add(elem.id));

        // Game scores
        this.coins = 5;
        this.strikes = 0;

        // Calculate number of burnt breads for game over
        this.failStrikes = Math.ceil(Object.keys(this.gameSquares).length / 2);
        this.elems.strikesMax.innerHTML = this.failStrikes;

        // Min and max times in ms for bread placement
        this.minPlaceTime = 1000;
        this.maxPlaceTime = 4000;

        this.absoluteMinTime = 300;
        this.decreaseTimeStep = 0.99;


    }

    _setUpElems() {
        this.elems.startScreen = document.getElementById("start-screen");
        this.elems.startBtn = document.getElementById("start-btn");
        this.elems.tutorialBtn = document.getElementById("tutorial-btn");

        this.elems.tutorialPopup = document.getElementById("tutorial-popup");
        this.elems.tutorialCloseBtn = document.getElementById("close-btn-tutorial");
        this.elems.tutorialStartBtn = document.getElementById("tut-start-btn");

        this.elems.gameScreen = document.getElementById("game-screen");
        this.elems.squareElems = Array.from(document.querySelectorAll(".square"));
        this.elems.strikesOut = document.getElementById("strikes-output");
        this.elems.strikesMax = document.getElementById("strikes-max");
        this.elems.coinsOut = document.getElementById("coin-output");
        this.elems.resetBtn = document.getElementById("reset-btn");
        this.elems.quitBtnGame = document.getElementById("quit-btn-game");

        this.elems.gameOverPopup = document.getElementById("game-over-popup");
        this.elems.finalScoreOut = document.getElementById("final-score-out");
        this.elems.finalStrikesOut = document.getElementById("final-strikes-out");
        this.elems.finalStrikesMax = document.getElementById("final-strikes-max");
        this.elems.playAgainBtn = document.getElementById("play-again-btn");
        this.elems.quitBtnEnd = document.getElementById("quit-btn-end");

    }

    _setUpEvents() {
        // Start screen events
        this.elems.startBtn.addEventListener('click', () => {
            this.elems.startScreen.addEventListener('transitionend', this._onStartScreenExit);
            this.elems.startScreen.classList.toggle("hidden");
        });

        // Tutorial screen events
        this.elems.tutorialBtn.addEventListener('click', () => { this.elems.tutorialPopup.classList.toggle("hidden"); });
        this.elems.tutorialCloseBtn.addEventListener('click', () => { this.elems.tutorialPopup.classList.toggle("hidden"); });
        this.elems.tutorialStartBtn.addEventListener('click', () => {
            this.elems.startScreen.addEventListener('transitionend', this._onStartScreenExit);
            this.elems.tutorialPopup.classList.toggle("hidden");
            this.elems.startScreen.classList.toggle("hidden");
        });

        // Game screen events
        this.elems.squareElems.forEach(elem => elem.addEventListener('click', e => this._handleSquareClick(e)));
        this.elems.squareElems.forEach(elem => elem.addEventListener('burnt', e => this._handleBurnt()));
        this.elems.resetBtn.addEventListener("click", () => {
            this._reset();
            this._placeBreads();
        });
        this.elems.quitBtnGame.addEventListener("click", () => { this._gameOver(); });

        // Game over screen events
        this.elems.playAgainBtn.addEventListener("click", () => {
            this._reset();
            this.elems.gameOverPopup.classList.toggle("hidden");
            this.sounds.playMusic();
            this._placeBreads();
        });
        this.elems.quitBtnEnd.addEventListener("click", () => {
            this._reset();
            this.elems.gameOverPopup.classList.toggle("hidden");
            this.elems.startScreen.classList.toggle("hidden");
        });

    }

    // Place breads and remove the event listener so it won't be called if you exit back to the start screen
    _handleStartScreenExit() {
        this._placeBreads();
        this.sounds.playMusic();
        this.elems.startScreen.removeEventListener("transitionend", this._onStartScreenExit);
    }

    // Handle what happens when a square is clicked
    _handleSquareClick(e) {
        // Get the square that was clicked
        const id = e.target.closest(".square").id;
        const square = this.gameSquares[id];

        if (!square.isOccupied() || square.isBurnt()) {
            return;
        }

        const state = square.getState();
        const type = square.getType();

        // Use breads object to find the value of the bread clicked
        const value = breads[type][state].value;
        this.coins += value;

        // Play coin sound if coins gained
        if (value > 0) {
            this.sounds.coinSound();
        }

        // Reset square to empty
        this.occupiedSquaresSet.delete(id);
        square.reset();

        // Game over if you run out of coins
        if (this.coins <= 0) {
            this.coins = 0;
            this._gameOver();
            return;
        }

        this.elems.coinsOut.innerHTML = this.coins;

    }

    // Handle when the burnt event occurs on a game square
    _handleBurnt() {
        this.strikes++;
        this.sounds.burntSound();

        if (this.strikes >= this.failStrikes) {
            this._gameOver();
        }

        this.elems.strikesOut.innerHTML = this.strikes;

    }

    // At a random interval between min and max times, add a bread to a random square
    _placeBreads() {
        // Prevent timeouts overlapping
        if (this.timeout) {
            return;
        }

        const breadPlaceLoop = () => {
            // If full, wait and try again
            if (this.occupiedSquaresSet.size == Object.keys(this.gameSquares).length) {
                this.timeout = setTimeout(breadPlaceLoop, this.minPlaceTime);
                return;
            }

            const randTime = Math.floor(Math.random() * (this.maxPlaceTime - this.minPlaceTime + 1) + this.minPlaceTime);
            const bread_names = Object.keys(breads);
            const randSquare = this._randomSquare();
            const randItem = bread_names[Math.floor(Math.random() * bread_names.length)];

            this.gameSquares[randSquare].addItem(randItem);
            this.occupiedSquaresSet.add(randSquare);

            // Reduce the time between loops while above min time
            if (this.minPlaceTime > this.absoluteMinTime) {
                this.minPlaceTime = this.minPlaceTime * this.decreaseTimeStep;
                this.maxPlaceTime = this.maxPlaceTime * this.decreaseTimeStep;
            }

            this.timeout = setTimeout(breadPlaceLoop, randTime);

        }

        breadPlaceLoop();
    }

    // Return the id of a random unoccupied square
    _randomSquare() {
        // Create an array of unoccupied square ids through the difference between the occupied set and whole set
        const unoccupiedArr = Array.from(this.allSquaresSet.difference(this.occupiedSquaresSet));
        return unoccupiedArr[Math.floor(Math.random() * unoccupiedArr.length)];

    }

    // Handle game over
    _gameOver() {
        // Stop all state progressions
        for (let square in this.gameSquares) {
            this.gameSquares[square].stop();
        }

        // Stop placing new breads
        clearTimeout(this.timeout);
        this.timeout = null;

        // Display final scores
        this.elems.finalScoreOut.innerHTML = this.coins;
        this.elems.finalStrikesOut.innerHTML = this.strikes;
        this.elems.finalStrikesMax.innerHTML = this.failStrikes;

        this.elems.gameOverPopup.classList.toggle("hidden");
        this.sounds.stopMusic();
        this.sounds.gameOverSound()

    }

    // Resets all game states
    _reset() {
        // Stop placing new breads if you haven't already
        if (this.timeout != null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        // Reset game stats
        this.coins = 5;
        this.elems.coinsOut.innerHTML = this.coins;
        this.strikes = 0;
        this.elems.strikesOut.innerHTML = this.strikes;
        this.occupiedSquaresSet = new Set();

        this.minPlaceTime = 1000;
        this.maxPlaceTime = 4000;

        // Reset the state of all squares
        for (let square in this.gameSquares) {
            this.gameSquares[square].reset();
        }
    }

}


class Sounds {
    constructor() {
        this.coins = document.getElementById("coin-sfx");
        this.breadBurnt = document.getElementById("burnt-sfx");
        this.music = document.getElementById("music");
        this.gameOver = document.getElementById("game-over-sfx");

    }

    playMusic() {
        this._fadeInTrack(this.music);
    }

    stopMusic() {
        this._fadeOutTrack(this.music);
    }

    coinSound() {
        this.coins.play();
    }

    burntSound() {
        this.breadBurnt.play();
    }

    gameOverSound() {
        this.gameOver.play();
    }

    // Adapted from match-wars.start
    _fadeInTrack(track, fadeTime = 500) {
        track.volume = 0.0;
        track.loop = true;
        track.currentTime = 0;
        track.play();

        let volume = 0.0;
        const step = 1 / (fadeTime / 50);
        const interval = setInterval(() => {
            volume = Math.min(volume + step, 1);
            track.volume = volume;
            if (volume === 1) clearInterval(interval);
        }, 50);
    }


    // Adapted from match-wars.start
    _fadeOutTrack(track, fadeTime = 500) {
        let volume = track.volume;
        const step = volume / (fadeTime / 50);
        const interval = setInterval(() => {
            volume = Math.max(volume - step, 0);
            track.volume = volume;
            if (volume === 0) {
                track.pause();
                clearInterval(interval);
            }
        }, 50);
    }


}

let game = new Game();