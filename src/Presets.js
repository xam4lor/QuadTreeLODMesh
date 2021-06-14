class Presets {
    static depth = 6; // MUST BE a multiple of 2

    constructor() {
        this.seq = 0b0000;
        // this.seq = 0b1111;

        if (Presets.depth % 2 == 0)
            this.generateGridTemplate(Presets.depth + 1);
        else
            console.err("Depth must be an even number.");
    }

    generateGridTemplate(res) {
        this.vertices = new Array(17);
        this.triangles = new Array(17);
        this.edgeVertices = new Array(17);
        this.edgeTriangles = new Array(17);

        for (let quadI = 0; quadI < 16; quadI++) { // 0b0000 - 0b1111
            let grid = this.generateGridWithIndex(quadI, res);
            this.vertices [quadI] = grid[0];
            this.triangles[quadI] = grid[1];
            this.edgeVertices[quadI] = grid[2];
            this.edgeTriangles[quadI] = grid[3];
        }
    }

    generateGridWithIndex(quadI, res) {
        let vertices = []; // dynamic list
        let triangles = []; // dynamic list
        let edgeVertices = []; // dynamic list
        let edgeTriangles = []; // dynamic list

        // Compute vertices and main triangles
        let indexTr = 0;
        for (let j = 0; j < res; j++) {
            for (let i = 0; i < res; i++) {
                // default size : 10x10
                let x = (res - 1) * i * 10 / (res - 1) / (res - 1);
                let y = (res - 1) * j * 10 / (res - 1) / (res - 1);
                let index = i + j * res;

                // Vertices
                vertices[index] = new Vector(x, y);

                // Triangles main center (for all triangle, replace by i,j < res-1)
                if (i < res - 2 && j < res - 2 && i > 0 && j > 0) {
                    // First triangle
                    triangles[indexTr + 0] = index + res; // up left
                    triangles[indexTr + 1] = index + 1; // down right
                    triangles[indexTr + 2] = index; // left down
                    indexTr += 3;

                    // Second triangle
                    triangles[indexTr + 0] = index + res; // up left
                    triangles[indexTr + 1] = index + 1 + res; // up right
                    triangles[indexTr + 2] = index + 1; // down right
                    indexTr += 3;
                }
            }
        }

        // Edge vertices
        let it = -1;
        for (let i = 0; i < 4 * (res + 2); i++) {
            if (i == 0) // edge top left
                edgeVertices[++it] = new Vector(-10 / (res - 1), 10 / (res - 1) * res);
            else if (i <= res) { // up
                if ((quadI & 0b1000) == 0b0000) { // 0xxx
                    let x = 10 / (res - 1) * (i - 1);
                    let y = 10 / (res - 1) * res;
                    edgeVertices[++it] = new Vector(x, y);
                }
                else if (i % 2 != 0) { // 1xxx
                    let x = 10 / (res - 1) * (i - 1);
                    let y = 10 / (res - 2) * res;
                    edgeVertices[++it] = new Vector(x, y);
                }
            }
            else if (i == res + 1) // edge top right
                edgeVertices[++it] = new Vector(10 / (res - 1) * res, 10 / (res - 1) * res);
            else if (i <= res + 1 + res) { // right
                if ((quadI & 0b0100) == 0b0000) { // x0xx
                    let x = 10 / (res - 1) * res;
                    let y = 10 / (res - 2) * res - 10 / (res - 1) * (i - res - 1 - res);
                    console.log((i - res - 1 - res));
                    edgeVertices[++it] = new Vector(x, y);
                }
                else if (i % 2 != 0) { // x1xx
                    // let x = 10 / (res - 1) * (i - 1);
                    // let y = 10 / (res - 2) * res;
                    // edgeVertices[++it] = new Vector(x, y);
                }
            }
        }


        // Compute border triangles based on quad index
        // Up - 1xxx
        for (let i = 0; i < res - 1; i++) {
            // First triangle
            if ((quadI & 0b1000) == 0b1000) {
                if (i % 2 == 0) {
                    triangles[indexTr + 0] = res * (res - 1) + i;
                    triangles[indexTr + 1] = res * (res - 1) + i + 2;
                    triangles[indexTr + 2] = res * (res - 1) + i - res + 1;
                    indexTr += 3;
                }
            }
            else {
                triangles[indexTr + 0] = res * (res - 1) + i;
                triangles[indexTr + 1] = res * (res - 1) + i + 1;
                if (i % 2 == 0)
                    triangles[indexTr + 2] = res * (res - 1) + i - res + 1;
                else
                    triangles[indexTr + 2] = res * (res - 1) + i - res;
                indexTr += 3;
            }

            // Second triangle
            if (i != 0 && i != res - 2) {
                if (i % 2 == 0)
                    triangles[indexTr + 0] = res * (res - 1) + i;
                else
                    triangles[indexTr + 0] = res * (res - 1) + i + 1;
                triangles[indexTr + 1] = res * (res - 1) + i - res + 1;
                triangles[indexTr + 2] = res * (res - 1) + i - res;
                indexTr += 3;
            }
        }


        // Right - x1xx
        for (let i = 0; i < res - 1; i++) {
            // First triangle
            if ((quadI & 0b0100) == 0b0100) { // x1xx
                if (i % 2 == 0) {
                    triangles[indexTr + 0] = (i + 1) * res + res - 2;
                    triangles[indexTr + 1] = (i + 1) * res + 2 * res - 1;
                    triangles[indexTr + 2] = i * res + res - 1;
                    indexTr += 3;
                }
            }
            else {
                if (i % 2 == 0)
                    triangles[indexTr + 0] = (i + 1) * res + res - 2;
                else
                    triangles[indexTr + 0] = i * res + res - 2;
                triangles[indexTr + 1] = (i + 1) * res + res - 1;
                triangles[indexTr + 2] = i * res + res - 1;
                indexTr += 3;
            }

            // Second triangle
            if (i != 0 && i != res - 2) {
                triangles[indexTr + 0] = (i + 1) * res + res - 2;
                if (i % 2 == 0)
                    triangles[indexTr + 1] = i * res + res - 1;
                else
                    triangles[indexTr + 1] = (i + 1) * res + res - 1;
                triangles[indexTr + 2] = i * res + res - 2;
                indexTr += 3;
            }
        }


        // Down - xx1x
        for (let i = 0; i < res - 1; i++) {
            // First triangle
            if ((quadI & 0b0010) == 0b0010) {
                if (i % 2 == 0) {
                    triangles[indexTr + 0] = i + res + 1;
                    triangles[indexTr + 1] = i + 2;
                    triangles[indexTr + 2] = i;
                    indexTr += 3;
                }
            }
            else {
                if (i % 2 == 0)
                    triangles[indexTr + 0] = i + res + 1;
                else
                    triangles[indexTr + 0] = i + res;
                triangles[indexTr + 1] = i + 1;
                triangles[indexTr + 2] = i;
                indexTr += 3;
            }

            // Second triangle
            if (i != 0 && i != res - 2) {
                triangles[indexTr + 0] = i + res;
                triangles[indexTr + 1] = i + res + 1;
                if (i % 2 == 0)
                    triangles[indexTr + 2] = i;
                else
                    triangles[indexTr + 2] = i + 1;
                indexTr += 3;
            }
        }


        // Left - xxx1
        for (let i = 0; i < res - 1; i++) {
            // First triangle
            if ((quadI & 0b0001) == 0b0001) {
                if (i % 2 == 0) {
                    triangles[indexTr + 0] = (i + 2) * res;
                    triangles[indexTr + 1] = (i + 1) * res + 1;
                    triangles[indexTr + 2] = i * res;
                    indexTr += 3;
                }
            }
            else {
                triangles[indexTr + 0] = (i + 1) * res;
                if (i % 2 == 0)
                    triangles[indexTr + 1] = (i + 1) * res + 1;
                else
                    triangles[indexTr + 1] = i * res + 1;
                triangles[indexTr + 2] = i * res;
                indexTr += 3;
            }

            // Second triangle
            if (i != 0 && i != res - 2) {
                triangles[indexTr + 0] = (i + 1) * res + 1;
                triangles[indexTr + 1] = i * res + 1;
                if (i % 2 == 0)
                    triangles[indexTr + 2] = i * res;
                else
                    triangles[indexTr + 2] = (i + 1) * res;
                indexTr += 3;
            }
        }

        return [vertices, triangles, edgeVertices, edgeTriangles]; // .toArray()
    }

    showGridWithSeq(seq) {
        this.seq = seq;
    }

    draw(drawer) {
        // Draw grid
        drawer
            .stroke(255)
            .strokeWeight(2)
            .fill(200, 200, 200, 0.7);
        let s = 8;
        let t = new Vector(7, 1);
        for (var i = 0; i < this.triangles[this.seq].length; i += 3) {
            drawer
                .beginShape()
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+0]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+0]].y * s / 10 + t.y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+1]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+1]].y * s / 10 + t.y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+2]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+2]].y * s / 10 + t.y)
                .endShape(CLOSE);
        }

        // Draw edges
        // drawer
        //     .stroke(255, 150, 150)
        //     .strokeWeight(2)
        //     .fill(100, 200, 100, 0.7);
        // for (var i = 0; i < this.edgeTriangles[this.seq].length; i += 3) {
        //     drawer
        //         .beginShape()
        //         .vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+0]].x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+0]].y)
        //         .vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+1]].x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+1]].y)
        //         .vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+2]].x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+2]].y)
        //         .endShape(CLOSE);
        // }
        // Draw edge vertices
        drawer
            .stroke(255, 150, 150)
            .strokeWeight(2)
            .fill(100, 200, 100, 0.7);
        for (var i = 0; i < this.edgeVertices[this.seq].length; i++) {
            drawer
                .point(this.edgeVertices[this.seq][i].x * s / 10 + t.x, this.edgeVertices[this.seq][i].y * s / 10 + t.y);
        }
    }
}
