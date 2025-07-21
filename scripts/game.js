
function generateBreads(name, interval) {
    return {
        interval: interval,
        0: { src: `assets/${name}-0.png`, alt: `A raw ${name}` },
        1: { src: `assets/${name}-1.png`, alt: `An undercooked ${name}` },
        2: { src: `assets/${name}-2.png`, alt: `A baked ${name}` },
        3: { src: `assets/${name}-3.png`, alt: `A burnt ${name}` },
    };
}

const breads = {
    bread: generateBreads("bread", 3000),
    croissant: generateBreads("croissant", 1000),
    danish: generateBreads("danish", 2000)
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

    _setImg() {
        const img = new Image();

        if (type != null) {
            img.src = breads[this.type][this.state].src;
            img.alt = breads[this.type][this.state].alt;
        }

        this.elem.innerHTML = img;
    }

    reset() {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this._setImg();
        clearInterval(this.interval);
        this.interval = null;

    }

    _incrementState() {
        if (this.burnt || !this.occupied) {
            return;
        }

        this.state++;

        if (this.state >= 3) {
            burnt = true;
            this.state = 3;
            this._notifyBurnt();
        }

        this._setImg();
    }

    _notifyBurnt() {
        const event = new Event("burnt");
        this.elem.dispatchEvent(event);
    }

    addItem(type) {
        if (this.occupied || this.burnt) {
            return;
        }

        this.occupied = true;
        this.state = 0;
        this.type = type;

        this._setImg();
        this.interval = setInterval(function () { this._incrementState(); }, breads[this.type].interval);
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


}




class Game {
    constructor(devMode = false, cheatMode = false) {
        this._setUpElems();
        this._setUpEvents();

        this.occupiedSquares = new Set();
        this.gameSquares = {};
        this.elems.squareElems.forEach(elem => this.gameSquares[elem.id] = new GameSquare(elem));

        this.coins = 5;
        this.strikes = 0;
        this.failStrikes = Math.ceil(Object.keys(this.gameSquares).length / 2);
    }

    _setUpElems() {
        this.elems = {}
        this.elems.squareElems = Array.from(document.querySelectorAll(".square"));

    }

    _setUpEvents() {
        this.elems.squareElems.forEach(elem => elem.addEventListener('click', e => this._handleSquareClick(e)));
        this.elems.squareElems.forEach(elem => elem.addEventListener('burnt', e => this._handleBurnt()));

    }

    _handleSquareClick(e) {
        const id = e.target.closest(".square").id;
        console.log(id);

        const square = this.gameSquares[id];

        if (!square.isOccupied() || square.isBurnt()) {
            return;
        }
        // get the info from the square
        // Update score
        // reset square

    }

    _handleBurnt() {
        this.strikes++;

        if (this.strikes >= this.failStrikes) {
            this._gameOver();
        }

    }

    _placeBreads(min_time = 1000, max_time = 4000) {
        if (this.occupiedSquares.size == Object.keys(this.gameSquares).length) {
            return;
        }
        // At a random interval between min and max times, add a bread to a random square
        // Update occupied


    }

    _randomSquare() {
        // Pick a random unoccupied square

    }

    _gameOver() {
        console.log("Game over!");
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