class Sprite {
    constructor(url, pos, size, speed = 0, frames, dir = 'horizontal', once) {
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir;
        this.once = once;
        this.done = false;
    }

    update(dt) {
        this._index += this.speed * dt;
    }

    render(ctx) {
        let frame;
        let x = this.pos[0];
        let y = this.pos[1];

        if (this.speed > 0) {
            var max = this.frames.length;
            var idx = Math.floor(this._index);
            frame = this.frames[idx % max];

            if (this.once && idx >= max) {
                this.done = true;
                return;
            }
        } else {
            frame = 0;
        }

        if (this.dir == 'vertical') {
            y += frame * this.size[1];
        } else {
            x += frame * this.size[0];
        }

        ctx.drawImage(resources.get(this.url),
            x, y,
            this.size[0], this.size[1],
            0, 0,
            this.size[0], this.size[1]);
    }

}
