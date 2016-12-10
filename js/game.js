'use strict';


class Game {
    constructor() {
        // Create the canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 1000;
        this.canvas.height = 500;
        document.body.appendChild(this.canvas);

        this.bg;
        this.lastTime = 0;
        this.coinTime = 0;
        this.gameTime = 0;
        this.lastFire = Date.now();
        this.enemies = [];
        this.fireballs = [];
        this.explosions = [];
        this.coins = [];
        this.coinsCount = 1;
        this.offset = 0;
        this.score = 0;
        this.level = 1;
        this.velocity = 125;
        this.enemySpeed = 70;
        this.fireballSpeed = 500;
        this.isGameOver = false;
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.coinsEl = document.getElementById('coins');
        this.levelEl = document.getElementById('level');

        this.gameOverAudio = new Audio("sounds/main.mp3");
        this.gameOverAudio.loop = true;
        this.gameOverAudio.volume = .25;
        this.gameOverAudio.load();

        this.gameOverAudio.play();

        this.soundFire = new SoundPool(20);
        this.soundFire.init("fireball");
        this.soundCoin = new SoundPool(10);
        this.soundCoin.init("coin");
        this.soundWin = new SoundPool(1);
        this.soundWin.init("win");

        this.player = {
            pos: [50, this.canvas.height / 2],
            lives: 3,
            speed: 250,
            wasHurt: false,
            win: false,
            sprite: new Sprite('img/playerbig.png', [0, 0], [52.8, 56], 16, [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0])
        }


        //load resouces
        resources.load([
            'img/bg.png',
            'img/playerbig.png',
            'img/enemybig.png',
            'img/ball.png',
            'img/pinkexplosion.png',
            'img/coins.png',
            'img/playerHurts.png'
        ]);
        resources.onReady(this.init.bind(this));

    }

    init() {
        // console.log("Initializing....");
        this.bg = this.ctx.createPattern(resources.get('img/bg.png'), 'repeat-x');

        document.getElementById('play-again').addEventListener('click', this.reset.bind(this));


        this.reset();
        this.livesEl.innerHTML = this.player.lives;
        this.coinsEl.innerHTML = this.coinsCount;
        this.levelEl.innerHTML = this.level;
        this.lastTime = Date.now();
        this.coinTime = Date.now();
        this.main();

    }

    main() {
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000;

        this.update(dt);
        this.render();
        this.lastTime = now;
        requestAnimationFrame(this.main.bind(this));
    }

    render() {

        if (!this.isGameOver) {
            this.renderEntity(this.player);
        }

        this.renderEntities(this.enemies);
        this.renderEntities(this.fireballs);
        this.renderEntities(this.explosions);
        this.renderEntities(this.coins);
    }

    update(dt) {
        const translateX = this.velocity * dt;
        this.offset += translateX;
        this.gameTime += dt;

        this.handleInput(dt);
        this.updateEntities(dt, translateX);

        this.addEnemy();
        this.addCoin();

        this.checkCollisions();

        this.updateBackground(translateX);

        this.scoreEl.innerHTML = this.score;
    }

    addEnemy() {
        if (Math.random() < 0.02 * this.level) {
            this.enemies.push({
                pos: [this.canvas.width + this.offset, Math.random() * (this.canvas.height - 50)],
                sprite: new Sprite('img/enemybig.png', [0, 0], [45, 50], 16, [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0])
            });
        }
    }

    addCoin() {
        if (this.lastTime - this.coinTime > 10000) {
            this.coinTime = this.lastTime;
            this.coins.push({
                pos: [this.canvas.width + this.offset, Math.random() * (this.canvas.height - 50)],
                sprite: new Sprite('img/coins.png', [0, 0], [52, 50], 16, [0, 1, 2, 3, 4, 5, 6])
            });
        }
    }

    addFireball(x, y) {
        this.fireballs.push({
            pos: [x, y],
            dir: 'forward',
            sprite: new Sprite('img/ball.png', [0, 0], [31, 30], 16, [0, 1, 2, 3, 4])
        });
    }

    addExplosion(x, y) {
        // Add an explosion
        this.explosions.push({
            pos: [x, y],
            sprite: new Sprite('img/pinkexplosion.png', [0, 0], [37.16, 35],
                16, [0, 1, 2, 3, 4, 5],
                null,
                true)
        });
    }

    updateBackground(translateX) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.bg;
        this.ctx.rect(translateX, 0, this.canvas.width, this.canvas.height);
        this.ctx.fill();
        this.ctx.translate(-translateX, 0);
    }

    updateEntities(dt, translateX) {

        this.updatePlayer(dt, translateX);
        this.updateEnemies(dt);
        this.updateExplosions(dt);
        this.updateFireballs(dt);
        this.updateCoins(dt);

    }

    updateCoins(dt) {
        // Update all coins
        for (let i = 0; i < this.coins.length; i++) {
            this.coins[i].sprite.update(dt);
        }
    }

    updatePlayer(dt, translateX) {
        // Update the player sprite animation
        this.player.pos[0] += translateX;
        this.player.sprite.update(dt);
        if (this.player.wasHurt && this.player.sprite.done) {
            this.player.wasHurt = false;
            this.player.sprite = new Sprite('img/playerbig.png', [0, 0], [52.8, 56], 16, [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0]);
        }


    }

    updateEnemies(dt) {
        // Update all the enemies
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].pos[0] -= this.enemySpeed * dt;
            this.enemies[i].sprite.update(dt);

            // Remove if offscreen
            if (this.enemies[i].pos[0] + this.enemies[i].sprite.size[0] < this.offset) {
                this.enemies.splice(i, 1);
                i--;
            }
        }
    }

    updateExplosions(dt) {
        // Update all the explosions
        for (let i = 0; i < this.explosions.length; i++) {
            this.explosions[i].sprite.update(dt);

            // Remove if animation is done
            if (this.explosions[i].sprite.done) {
                this.explosions.splice(i, 1);
                i--;
            }
        }
    }

    updateFireballs(dt) {
        // Update all the fireballs
        for (let i = 0; i < this.fireballs.length; i++) {
            const fireball = this.fireballs[i];
            fireball.sprite.update(dt);
            fireball.pos[0] += this.fireballSpeed * dt;

            // Remove the fireball if it goes offscreen
            if (fireball.pos[1] < 0 || fireball.pos[1] > this.canvas.height ||
                fireball.pos[0] > this.canvas.width + this.offset) {
                this.fireballs.splice(i, 1);
                i--;
            }
        }
    }

    renderEntities(list) {
        for (let i = 0; i < list.length; i++) {
            this.renderEntity(list[i]);
        }
    }

    renderEntity(entity) {
        this.ctx.save();
        this.ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(this.ctx);
        this.ctx.restore();
    }

    handleInput(dt) {
        if (input.isDown('DOWN') || input.isDown('s')) {
            this.player.pos[1] += this.player.speed * dt;
            if (this.player.pos[1] > this.canvas.height - this.player.sprite.size[1]) {
                this.player.pos[1] = this.canvas.height - this.player.sprite.size[1];
            }
        }

        if (input.isDown('UP') || input.isDown('w')) {
            this.player.pos[1] -= this.player.speed * dt;
            if (this.player.pos[1] < 0) {
                this.player.pos[1] = 0;
            }
        }

        if (input.isDown('LEFT') || input.isDown('a')) {
            this.player.pos[0] -= this.player.speed * dt;
            if (this.player.pos[0] < this.offset) {
                this.player.pos[0] = this.offset;
            }
        }

        if (input.isDown('RIGHT') || input.isDown('d')) {
            this.player.pos[0] += this.player.speed * dt;
            if (this.player.pos[0] > this.offset + this.canvas.width - this.player.sprite.size[0]) {
                this.player.pos[0] = this.offset + this.canvas.width - this.player.sprite.size[0];
            }
        }

        if (input.isDown('SPACE') && !this.isGameOver && Date.now() - this.lastFire > 250) {
            const x = this.player.pos[0] + this.player.sprite.size[0] / 2;
            const y = this.player.pos[1] + this.player.sprite.size[1] / 4;

            this.addFireball(x, y);
            this.soundFire.get();
            this.lastFire = Date.now();
        }

    }



    gameOver() {
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('game-over-overlay').style.display = 'block';
            this.isGameOver = true;
        }
        // Reset game to original state
    reset() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-over-overlay').style.display = 'none';
        this.isGameOver = false;
        this.gameTime = 0;
        this.score = 0;
        this.player.lives = 3;
        this.livesEl.innerHTML = this.player.lives;
        this.enemies = [];
        this.fireballs = [];
        this.coins = [];
        this.level = 1;
        this.enemySpeed = 100;
        this.coinsCount = Math.pow(2, this.level);
        this.coinsEl.innerHTML = this.coinsCount;
        this.levelEl.innerHTML = this.level;
        this.player.pos = [this.offset + 50, this.canvas.height / 2];
    };

    resetNextLevel() {
        this.level++;
        for (let i = 0; i < this.enemies.length; i++) {
            this.addExplosion(this.enemies[i].pos[0], this.enemies[i].pos[1]);
        }
        this.enemies = [];
        this.fireballs = [];
        this.coins = [];
        this.soundWin.get();
        this.coinsCount = Math.pow(2, this.level);
        this.enemySpeed = 100 + 20 * this.level;
        this.coinsEl.innerHTML = this.coinsCount;
        this.levelEl.innerHTML = this.level;
    }

    // Collisions

    collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    }

    boxCollides(pos, size, pos2, size2) {
        return this.collides(pos[0], pos[1],
            pos[0] + size[0], pos[1] + size[1],
            pos2[0], pos2[1],
            pos2[0] + size2[0], pos2[1] + size2[1]);
    }

    checkCollisions() {
        // Run collision detection for all enemies and bullets
        for (let i = 0; i < this.enemies.length; i++) {
            const pos = this.enemies[i].pos;
            const size = this.enemies[i].sprite.size;

            for (let j = 0; j < this.fireballs.length; j++) {
                const pos2 = this.fireballs[j].pos;
                const size2 = this.fireballs[j].sprite.size;

                if (this.boxCollides(pos, size, pos2, size2)) {
                    // Remove the enemy
                    this.enemies.splice(i, 1);
                    i--;

                    // Add score
                    this.score += 100;

                    this.addExplosion(pos[0], pos[1]);

                    // Remove fireball and stop this iteration
                    this.fireballs.splice(j, 1);
                    break;
                }
            }

            if (this.boxCollides(pos, size, this.player.pos, this.player.sprite.size)) {
                this.player.lives--;
                this.player.wasHurt = true;
                this.player.sprite = new Sprite('img/playerHurts.png', [0, 0], [52.8, 56], 8, [0, 1, 2, 3, 2, 1], 'horizontal', true);
                this.livesEl.innerHTML = this.player.lives;
                this.addExplosion(pos[0], pos[1]);
                // Remove the enemy
                    this.enemies.splice(i, 1);
                    i--;
                if (!this.player.lives) {
                    this.gameOver();
                }
            }
        }

        for (let i = 0; i < this.coins.length; i++) {
            const pos = this.coins[i].pos;
            const size = this.coins[i].sprite.size;
            if (this.boxCollides(pos, size, this.player.pos, this.player.sprite.size)) {
                // Remove coin
                this.coins.splice(i, 1);
                i--;
                this.coinsCount--;
                this.soundCoin.get();
                this.coinsEl.innerHTML = this.coinsCount;
                if (this.coinsCount === 0) {
                    this.resetNextLevel();
                }
            }
        }
    }



}


// On load start the game.
window.addEventListener('load', () => new Game());
