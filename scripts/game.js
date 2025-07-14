const grid = [];

class GameSquare {
    constructor(elem) {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this.elem = elem;
    }

    _setImg() {

        // Stub: should set elem's innerHTML to an image elem based on state and type
        const img = new Image();
    }

    // Resets square back to default state
    reset() {
        this.occupied = false;
        this.burnt = false;
        this.state = 0;
        this.type = "";
        this._setImg();

    }

    // Increase state if not burnt or unoccupied
    incrementState() {
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

    // Update type if not burnt or occupied
    updateType(type) {
        if (this.occupied || this.burnt) {
            return;
        }

        this.occupied = true;
        this.state = 0;
        this.type = type;

        this._setImg();
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