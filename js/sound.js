class SoundPool {
    constructor(maxSize) {
        this.size = maxSize;
        this.pool = [];
        this.currSound = 0;
    }

    init(object) {
        if (object == "fireball") {
            for (let i = 0; i < this.size; i++) {
                // Initalize the sound
                const fireball = new Audio("sounds/fireball.wav");
                fireball.volume = .12;
                fireball.load();
                this.pool[i] = fireball;
            }
        } else if (object == "coin") {
            for (let i = 0; i < this.size; i++) {
                const explosion = new Audio("sounds/coin.wav");
                explosion.volume = .1;
                explosion.load();
                this.pool[i] = explosion;
            }
        } else if (object == "win") {
            for (let i = 0; i < this.size; i++) {
                const explosion = new Audio("sounds/fireball.wav");
                explosion.volume = .1;
                explosion.load();
                this.pool[i] = explosion;
            }
        }
    }

    get() {
        if (this.pool[this.currSound].currentTime == 0 || this.pool[this.currSound].ended) {
            this.pool[this.currSound].play();
        }
        this.currSound = (this.currSound + 1) % this.size;
    }

}
