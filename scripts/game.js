
function generateBreads(name, interval) {
    return {
        interval_length: interval,
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

const bread_names = ["bread", "croissant", "danish"];


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
        const imgCollection = this.elem.getElementsByTagName('img');
        const img = imgCollection[0];

        if (this.type != null) {
            img.src = breads[this.type][this.state].src;
            img.alt = breads[this.type][this.state].alt;
        }
    }

    reset() {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this._setImg();

        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }


    }

    _incrementState() {
        if (this.burnt || !this.occupied) {
            return;
        }

        this.state++;

        if (this.state >= 3) {
            this.burnt = true;
            this.state = 3;
            this._notifyBurnt();
        }

        this._setImg();
    }

    _notifyBurnt() {
        clearInterval(this.interval);
        this.interval = null;

        const event = new Event("burnt");
        this.elem.dispatchEvent(event);
    }

    // Setters
    addItem(type) {
        if (this.occupied || this.burnt) {
            return;
        }

        this.occupied = true;
        this.state = 0;
        this.type = type;

        this._setImg();
        this.interval = setInterval(() => this._incrementState(), breads[this.type].interval_length);
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
        this.elems = {}
        this._setUpElems();
        this._setUpEvents();


        this.gameSquares = {};
        this.elems.squareElems.forEach(elem => this.gameSquares[elem.id] = new GameSquare(elem));
        this.occupiedSquaresSet = new Set();
        this.allSquaresSet = new Set();
        this.elems.squareElems.forEach(elem => this.allSquaresSet.add(elem.id));

        this.coins = 5;
        this.strikes = 0;
        this.failStrikes = Math.ceil(Object.keys(this.gameSquares).length / 2);
        this.elems.strikesMax.innerHTML = this.failStrikes;


        this._placeBreads();
    }


    _setUpElems() {

        this.elems.squareElems = Array.from(document.querySelectorAll(".square"));
        this.elems.strikesOut = document.getElementById("strikes-output");
        this.elems.strikesMax = document.getElementById("strikes-max");

    }

    _setUpEvents() {
        this.elems.squareElems.forEach(elem => elem.addEventListener('click', e => this._handleSquareClick(e)));
        this.elems.squareElems.forEach(elem => elem.addEventListener('burnt', e => this._handleBurnt()));
    }

    _handleSquareClick(e) {
        const id = e.target.closest(".square").id;
        console.log(id);

        const square = this.gameSquares[id];
        console.log(square)

        if (!square.isOccupied() || square.isBurnt()) {
            return;
        }
        // get the info from the square

        // Update score
        // display score
        // reset square

    }

    _handleBurnt() {
        console.log("Burnt!");
        this.strikes++;

        if (this.strikes >= this.failStrikes) {
            this._gameOver();
        }

        this.elems.strikesOut.innerHTML = this.strikes;

    }

    // At a random interval between min and max times, add a bread to a random square
    _placeBreads(min_time = 1000, max_time = 4000) {
        const randTime = Math.floor(Math.random() * (max_time - min_time + 1) + min_time);
        this.timeout = setTimeout(() => this._placeBreads(min_time, max_time), randTime);

        if (this.occupiedSquaresSet.size == Object.keys(this.gameSquares).length) {
            return;
        }

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

    _gameOver() {
        console.log("Game over!");
        clearTimeout(this.timeout);
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