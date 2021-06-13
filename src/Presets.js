class Presets {
    static depth = 6; // MUST BE a multiple of 2

    constructor() {
        this.seq = 0b0000;

        if (Presets.depth % 2 == 0)
            this.generateGridTemplate(Presets.depth + 1);
        else
            console.err("Depth must be an even number.");
    }

    generateGridTemplate(res) {
        this.vertices = new Array(17);
        this.triangles = new Array(17);

        for (let quadI = 0; quadI < 16; quadI++) { // 0b0000 - 0b1111
            let grid = this.generateGridWithIndex(quadI, res);
            this.vertices [quadI] = grid[0];
            this.triangles[quadI] = grid[1];
        }
    }

    generateGridWithIndex(quadI, res) {
        let vertices = []; // dynamic list
        let triangles = []; // dynamic list

        // Compute vertices and main triangles
        let indexTr = 0;
        for (let j = 0; j < res; j++) {
            for (let i = 0; i < res; i++) {
                let x = 5 + 10 / (res - 1) * i;
                let y = 0 + 10 / (res - 1) * j;
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

        return [vertices, triangles]; // .toArray()
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
        for (var i = 0; i < this.triangles[this.seq].length; i += 3) {
            drawer
                .beginShape()
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+0]].x, this.vertices[this.seq][this.triangles[this.seq][i+0]].y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+1]].x, this.vertices[this.seq][this.triangles[this.seq][i+1]].y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+2]].x, this.vertices[this.seq][this.triangles[this.seq][i+2]].y)
                .endShape(CLOSE);
        }
    }
}
