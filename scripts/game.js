
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
    constructor(devMode = false, cheatMode = false) {
        this.elems = {}
        this._setUpElems();
        this._setUpEvents();

        // Set up object where key is id of element and value is the associated GameSquare object
        this.gameSquares = {};
        this.elems.squareElems.forEach(elem => this.gameSquares[elem.id] = new GameSquare(elem));

        this.occupiedSquaresSet = new Set();

        // Set up set of game square ids
        this.allSquaresSet = new Set();
        this.elems.squareElems.forEach(elem => this.allSquaresSet.add(elem.id));


        this.coins = 5;
        this.strikes = 0;
        // Calculate number of burnt breads for game over
        this.failStrikes = Math.ceil(Object.keys(this.gameSquares).length / 2);
        this.elems.strikesMax.innerHTML = this.failStrikes;

        // TODO: game screen and tutorial


    }

    _setUpElems() {
        this.elems.startScreen = document.getElementById("start-screen");
        this.elems.startBtn = document.getElementById("start-btn");
        this.elems.gameScreen = document.getElementById("game-screen");
        this.elems.squareElems = Array.from(document.querySelectorAll(".square"));
        this.elems.strikesOut = document.getElementById("strikes-output");
        this.elems.strikesMax = document.getElementById("strikes-max");
        this.elems.coinsOut = document.getElementById("coin-output");

    }

    _setUpEvents() {
        this.elems.startScreen.addEventListener('transitionend', () => { this._placeBreads(); }, { once: true });
        this.elems.startBtn.addEventListener('click', () => { this.elems.startScreen.classList.toggle("hidden"); });
        this.elems.squareElems.forEach(elem => elem.addEventListener('click', e => this._handleSquareClick(e)));
        this.elems.squareElems.forEach(elem => elem.addEventListener('burnt', e => this._handleBurnt()));

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
        this.coins += breads[type][state].value;
        this.occupiedSquaresSet.delete(id);
        square.reset();

        if (this.coins < 0) {
            this._gameOver("bankrupt");
            this.elems.coinsOut.innerHTML = 0;
            return;
        }

        this.elems.coinsOut.innerHTML = this.coins;

    }

    // Handle when the burnt event occurs on a game square
    _handleBurnt() {
        this.strikes++;

        if (this.strikes >= this.failStrikes) {
            this._gameOver("fired");
        }

        this.elems.strikesOut.innerHTML = this.strikes;

    }

    // At a random interval between min and max times, add a bread to a random square
    _placeBreads(min_time = 1000, max_time = 4000) {
        const randTime = Math.floor(Math.random() * (max_time - min_time + 1) + min_time);
        // TODO: Decrease interval as time goes on? (handle 0 case)
        this.timeout = setTimeout(() => this._placeBreads(min_time, max_time), randTime);

        if (this.occupiedSquaresSet.size == Object.keys(this.gameSquares).length) {
            return;
        }

        const bread_names = Object.keys(breads);
        const randSquare = this._randomSquare();
        const randItem = bread_names[Math.floor(Math.random() * bread_names.length)];

        this.gameSquares[randSquare].addItem(randItem);
        this.occupiedSquaresSet.add(randSquare);

    }

    // Picks a random unoccupied square
    _randomSquare() {
        const unoccupiedArr = Array.from(this.allSquaresSet.difference(this.occupiedSquaresSet));
        return unoccupiedArr[Math.floor(Math.random() * unoccupiedArr.length)];

    }

    _gameOver(type) {
        console.log("Game over!", type);

        for (let square in this.gameSquares) {
            this.gameSquares[square].stop();
        }
        clearTimeout(this.timeout);

        // TODO: Freeze interactions do game over screen.
    }

    _reset() {

    }

    _devmode() {
        // TODO: skip title screen?
    }
}


class Sounds {

}

let game = new Game();