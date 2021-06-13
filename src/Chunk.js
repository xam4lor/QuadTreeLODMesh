class Chunk {
    constructor(simulator, bounds, depth, parent, hash) {
        this.simulator = simulator;
        this.bounds = bounds;
        this.depth = depth;
        this.parent = parent;
        this.hash = hash;

        this.selected = false;
        this.isANeighbor = false;

        if (this.parent != null && depth > 1)
            this.col = Math.round(this.parent.col * 0.8);
        else
            this.col = Math.round(Math.random() * 255);

        this.hasChildren = false;
        this.children = [];

        this.textDepthDisplay = new pSText(`${this.depth}`,
            Vector.add(this.bounds.pos, new Vector(this.bounds.dim/2, this.bounds.dim/2)),
            this.depth == 0 ? 5 : 5 / this.depth, "#FFFFFF"
        );
        this.textHashDisplay = new pSText(`${this.hash.toString(2)}`,
            Vector.add(this.bounds.pos, new Vector(this.bounds.dim/2, this.bounds.dim/2)),
            this.depth == 0 ? 5 : 5 / this.depth, "#FFFFFF"
        );

        this.dir = {
            LU : 0,
            RU : 1,
            LD : 2,
            RD : 3,
            U : 4,
            R : 5,
            D : 6,
            L : 7,
            HALT : 8
        };

        /*
        array = [
            [ // index 0 - Quadrant 0
                [ // index 0 - direction 0 - direction LU
                    0, // index 0 - Quadrant Index
                    3, // index 1 - Direction index (including halt = 8)
                ],
                ...
                [] // index i - direction i
            ],
            [] // index 1 - Quadrant 1
            [] // index 2 - Quadrant 2
            [] // index 3 - Quadrant 3
        ]
        */
        this.dirArray = [
            [ // Quadrant 0
                [0b11, this.dir.LU],[0b11, this.dir.U],[0b11, this.dir.L],[0b11, this.dir.HALT],
                [0b10, this.dir.U],[0b01, this.dir.HALT],[0b10, this.dir.HALT],[0b01, this.dir.L],
            ],
            [ // Quadrant 1
                [0b10, this.dir.U],[0b10, this.dir.RU],[0b10, this.dir.HALT],[0b10, this.dir.R],
                [0b11, this.dir.U],[0b00, this.dir.R],[0b11, this.dir.HALT],[0b00, this.dir.HALT],
            ],
            [ // Quadrant 2
                [0b01, this.dir.L],[0b01, this.dir.HALT],[0b01, this.dir.LD],[0b01, this.dir.D],
                [0b00, this.dir.HALT],[0b11, this.dir.HALT],[0b00, this.dir.D],[0b11, this.dir.L],
            ],
            [ // Quadrant 3
                [0b00, this.dir.HALT],[0b00, this.dir.R],[0b00, this.dir.D],[0b00, this.dir.RD],
                [0b01, this.dir.HALT],[0b10, this.dir.R],[0b01, this.dir.D],[0b10, this.dir.HALT],
            ]
        ];
    }

    subdivide() {
        if (this.hasChildren)
            return;

        let x = this.bounds.pos.x;
        let y = this.bounds.pos.y;
        let dim = this.bounds.dim / 2;

        this.hasChildren = true;

        // /!\ Should be in same order in array as their hash /!\
        // LD
        this.children[2] = new Chunk(this.simulator, new BoundingBox(x, y, dim), this.depth + 1, this, (this.hash << 2) + 2);
        // RD
        this.children[3] = new Chunk(this.simulator, new BoundingBox(x + dim, y, dim), this.depth + 1, this, (this.hash << 2) + 3);
        // LU
        this.children[0] = new Chunk(this.simulator, new BoundingBox(x, y + dim, dim), this.depth + 1, this, (this.hash << 2) + 0);
        // RU
        this.children[1] = new Chunk(this.simulator, new BoundingBox(x + dim, y + dim, dim), this.depth + 1, this, (this.hash << 2) + 1);
    }

    update(dt) {
        // Show selected
        this.selected = false;
        if (!this.hasChildren)
            this.selected = this.checkIfMouseHover();

        // Show neighbors
        if (this.selected) {
            let neighbors = this.calculateNeighbors();
            neighbors.forEach(el => {
                if (el != null)
                    el.isANeighbor = true
            });
        }

        // Update children
        this.children.forEach(el => el.update(dt));
    }

    calculateNeighbors() {
        // Calculate Hash
        let neighborsHash = [
            this.getHashForNeighbor(this.hash, this.dir.U),
            this.getHashForNeighbor(this.hash, this.dir.R),
            this.getHashForNeighbor(this.hash, this.dir.D),
            this.getHashForNeighbor(this.hash, this.dir.L)
        ];

        // Calculate neighbors depth (real use)
        let neighborLODStatus = []; // [Level (false, true, ... or true if unknown (out of the parent chunk))
        neighborsHash.forEach(
            el => el[1] == 0 ? neighborLODStatus.push(false) : neighborLODStatus.push(
                this.simulator.mainChunk.checkNeighborDepth(el[0], this.depth)
            )
        );
        // U, R, D, L
        let neighborsSeqBin = BinaryExtension.asBinarySequence(neighborLODStatus);
        this.simulator.presets.showGridWithSeq(neighborsSeqBin);

        // Calculate neighbors (for visualisation only)
        let neighbors = [];
        neighborsHash.forEach(
            el => el[1] == 0 ? neighbors.push(null) : neighbors.push(
                this.simulator.mainChunk.queryChunkWithHashAndDetail(el[0], this.depth)
            )
        );
        return neighbors;
    }

    getHashForNeighbor(hash, direction) {
        let neighborBit = hash | 0b0; // copy
        let dir = direction;
        let i = 0;
        while (hash != 0b1 && dir != this.dir.HALT) {
            // Get parent direction and quadrant
            let ansArr = this.dirArray[hash & 0b11][dir];

            // Clear using an AND and NOT mask, then OR to add new bits
            neighborBit = (neighborBit & ~(0b11 << i * 2)) | ansArr[0] << i * 2;

            // Compute values for nextLoop
            dir = ansArr[1];
            hash = hash >> 2;
            i++;
        }

        // [neighborBit, REASON (1 == HALT : 0 == NOT FOUND)]
        return [neighborBit, dir == this.dir.HALT ? 1 : 0];
    }

    queryChunkWithHashAndDetail(hash, detailLevel) {
        if (hash == this.hash)
            return this;

        if (this.hasChildren)
            return this.children[(hash >> (detailLevel - 1) * 2) & 0b11].queryChunkWithHashAndDetail(hash, detailLevel - 1);
        return this;
    }

    checkNeighborDepth(hash, detailLevel) {
        if (hash == this.hash)
            return false; // false = searched hash has same LOD (cause exist)

        if (this.hasChildren)
            return this.children[(hash >> (detailLevel - 1) * 2) & 0b11].checkNeighborDepth(hash, detailLevel - 1);

        // No children with searched LOD with searched hash (only parent exist)
        return true; // true = is a neighbor with higher LOD
    }




    forEach(fun) {
        fun(this);
        this.children.forEach(el => el.forEach(fun));
    }

    checkIfMouseHover() {
        let mX = _pSimulationInstance.mousePos.x;
        let mY = (_pSimulationInstance.mousePos.y + 3) * 2/3;

        if (
               mX > this.bounds.pos.x
            && mY > this.bounds.pos.y
            && mX < this.bounds.pos.x + this.bounds.dim
            && mY < this.bounds.pos.y + this.bounds.dim
        ) return true;
        return false;
    }

    randomSubdivide(proba, forDepth) {
        if (forDepth == this.depth && Math.random() < proba)
            this.subdivide();

        if (forDepth != this.depth)
             this.children.forEach(el => el.randomSubdivide(proba, forDepth));
    }

    draw(drawer) {
        let fac = 0.08;

        // Has no child
        if (!this.hasChildren) {
            drawer
                .fill(100, this.col, 100)
                .stroke(100, this.col + 20, 100)
                .strokeWeight(6 / this.depth);

            if (this.selected)
                drawer.fill(200, 100, 100);
            if (this.isANeighbor)
                drawer.fill(100, 100, 200);

            drawer.rect(
                this.bounds.pos.x + fac,
                this.bounds.pos.y + fac,
                this.bounds.dim - fac,
                this.bounds.dim - fac
            );

            if (!this.selected)
                this.textDepthDisplay.draw();

            return;
        }

        // Has children
        for (let i = 0; i < this.children.length; i++) {
            drawer
                .noFill()
                .stroke(100, this.col + 20, 100)
                .strokeWeight(6 / this.depth)
            this.children[i].draw(drawer);
        }
    }

    postDraw(drawer) {
        // Draw blue
        let fac = 0.08;
        if (this.hasChildren && this.isANeighbor)
            drawer.fill(100, 100, 220, 0.4).rect(
                this.bounds.pos.x + fac,
                this.bounds.pos.y + fac,
                this.bounds.dim - fac,
                this.bounds.dim - fac
            );

        // Draw hash
        // if (this.selected)
        //     this.textHashDisplay.draw();

        // Has children
        this.children.forEach(el => el.postDraw(drawer));
    }
}
