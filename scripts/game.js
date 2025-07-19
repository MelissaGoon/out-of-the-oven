
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
        }

        this._setImg();
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

}




class Game {
    constructor(devMode = false, cheatMode = false) {

    }

    _setUpElems() {

    }

    _setUpEvents() {

    }
}

class Score {

}

class Sounds {

}