class Simulator {
    constructor() {
        this.maxDepth = 3;

        this.presets = new Presets();
        this.mainChunk = new Chunk(this, new BoundingBox(-5.5, 0, 10, 10), 0, null, 0b1);

        this.t = 0;
        this.curDepth = 0;
        this.drawStep = 0;
    }

    update(dt) {
        this.mainChunk.forEach(el => el.isANeighbor = false);
        this.mainChunk.update(dt);
        this.t += dt;

        if (this.drawStep == 0 && this.t / 1.8 > 1) {
            this.t = 0;
            this.drawStep++;
            this.mainChunk.subdivide();
        }

        if (this.drawStep == 1 && this.t / 2 > 1 && this.curDepth < this.maxDepth - 1) {
            this.t = 0;
            this.curDepth += 1;
            this.mainChunk.randomSubdivide(0.4, this.curDepth);
        }
    }

    draw(drawer) {
        this.mainChunk.draw(drawer);
        this.mainChunk.postDraw(drawer);
        this.presets.draw(drawer);
    }
}
