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

    // Update square if not burnt
    update(type, state) {
        if (this.burnt) {
            return;
        }

        if (type == "") {
            this.reset();
            return;
        }

        if (state == 3) {
            burnt = true;
        }

        this.type = type;
        this.state = state;
        this.occupied = true;

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