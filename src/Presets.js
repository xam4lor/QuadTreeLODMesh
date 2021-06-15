class Presets {
    static depth = 8; // MUST BE a multiple of 2

    constructor() {
        // this.seq = 0b0000;
        this.seq = 0b1111;

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
        this.indexEdgesVertices = new Array(17);
        this.indexVertices = new Array(17);

        for (let quadI = 0; quadI < 16; quadI++) { // 0b0000 - 0b1111
            let grid = this.generateGridWithIndex(quadI, res);
            this.vertices [quadI] = grid[0];
            this.triangles[quadI] = grid[1];
            this.edgeVertices[quadI] = grid[2];
            this.edgeTriangles[quadI] = grid[3];
            this.indexEdgesVertices[quadI] = grid[4];
            this.indexVertices[quadI] = grid[5];
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
                let x = i * 10 / (res - 1);
                let y = j * 10 / (res - 1);
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
        let itForBlocks = [0, res + 1, 2 * (res + 1), 3 * (res + 1)];
        for (let i = 0; i < 4 * (res + 1); i++) {
            if (i == 0) { // edge top left
                if ((quadI & 0b1000) == 0b1000 || (quadI & 0b0001) == 0b0001)
                    edgeVertices[itForBlocks[0]] = new Vector(-10 / (res - 1)*2, 10 / (res - 1) * (res+1));
                else
                    edgeVertices[itForBlocks[0]] = new Vector(-10 / (res - 1), 10 / (res - 1) * res);
                it++;
            }
            else if (i <= res) { // up
                if ((quadI & 0b1000) == 0b0000) { // 0xxx
                    let x = 10 / (res - 1) * (i - 1);
                    let y = 10 / (res - 1) * res;
                    edgeVertices[++it] = new Vector(x, y);
                }
                else if (i % 2 != 0) { // 1xxx
                    let x = 10 / (res - 1) * (i - 1);
                    let y = 10 / (res - 1) * (res + 1);
                    edgeVertices[++it] = new Vector(x, y);
                }
            }
            else if (i == res + 1) { // edge top right
                if ((quadI & 0b1000) == 0b1000 || (quadI & 0b0101) == 0b0100)
                    edgeVertices[itForBlocks[1]] = new Vector(10 / (res - 1) * (res+1), 10 / (res - 1) * (res+1));
                else
                    edgeVertices[itForBlocks[1]] = new Vector(10 / (res - 1) * res, 10 / (res - 1) * res);
                it = 0;
            }
            else if (i <= 2 * res + 1) { // right
                if ((quadI & 0b0100) == 0b0000) { // x0xx
                    let x = 10 / (res - 1) * res;
                    let y = -10 / (res - 1) * (i - (2 * res + 1));
                    edgeVertices[++it + itForBlocks[1]] = new Vector(x, y);
                }
                else if (i % 2 != 0) { // x1xx
                    let x = 10 / (res - 1) * (res + 1);
                    let y = -10 / (res - 1) * (i - (2 * res + 1));
                    edgeVertices[++it + itForBlocks[1]] = new Vector(x, y);
                }
            }
            else if (i == 2 * (res + 1)) { // edge bottom right
                if ((quadI & 0b0100) == 0b0100 || (quadI & 0b0010) == 0b0010)
                    edgeVertices[itForBlocks[2]] = new Vector(10 / (res - 1) * (res+1), -10 / (res - 1)*2);
                else
                    edgeVertices[itForBlocks[2]] = new Vector(10 / (res - 1) * res, -10 / (res - 1));
                it = 0;
            }
            else if (i <= 3 * res + 2) { // down
                if ((quadI & 0b0010) != 0b0010) { // xx0x
                    let x = -10 / (res - 1) * (i - 3 * res - 2);
                    let y = -10 / (res - 1);
                    edgeVertices[++it + itForBlocks[2]] = new Vector(x, y);
                }
                else if (i % 2 != 0) { // xx1x
                    let x = -10 / (res - 1) * (i - 3 * res - 2);
                    let y = -10 / (res - 1) * 2;
                    edgeVertices[++it + itForBlocks[2]] = new Vector(x, y);
                }
            }
            else if (i == 3 * (res + 1)) { // edge top left
                if ((quadI & 0b0010) == 0b0010 || (quadI & 0b0001) == 0b0001)
                    edgeVertices[itForBlocks[3]] = new Vector(-10 / (res - 1) * 2, -10 / (res - 1) * 2);
                else
                    edgeVertices[itForBlocks[3]] = new Vector(-10 / (res - 1), -10 / (res - 1));
                it = 0;
            }
            else { // left
                if ((quadI & 0b0001) != 0b0001) { // xxx0
                    let x = -10 / (res - 1);
                    let y = 10 / (res - 1) * (i - 3 * res - 4);
                    edgeVertices[++it + itForBlocks[3]] = new Vector(x, y);
                }
                else if ((i - 1) % 2 == 0) {
                    let x = -10 / (res - 1) * 2;
                    let y = 10 / (res - 1) * (i - 3 * res - 4);
                    edgeVertices[++it + itForBlocks[3]] = new Vector(x, y);
                }
            }
        }


        // Compute border triangles based on quad index
        let it1 = -1;
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

            // Edge triangles (+ 1 if it is in edgeTriangles[] array)
            if ((quadI & 0b1000) == 0b1000) {
                if (i % 2 == 0) {
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = -(res * res - res + i);
                    else
                        edgeTriangles[++it1] = i/2 + 2;
                    edgeTriangles[++it1] = -(res * res - res + i + 2);
                    edgeTriangles[++it1] = i/2 + 2 + 1;

                    edgeTriangles[++it1] = i/2 + 2;
                    edgeTriangles[++it1] = -(res * res - res + i);
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = i/2 + 3;
                    else
                        edgeTriangles[++it1] = -(res * res - res + i + 2);
                }
            }
            else {
                edgeTriangles[++it1] = i + 2 + 1;
                edgeTriangles[++it1] = i + 2;
                if (i % 2 == 0)
                    edgeTriangles[++it1] = -(res * res - res + i);
                else
                    edgeTriangles[++it1] = -(res * res - res + i + 1);

                edgeTriangles[++it1] = -(res * res - res + i + 1);
                if (i % 2 == 0)
                    edgeTriangles[++it1] = i + 3;
                else
                    edgeTriangles[++it1] = i + 2;
                edgeTriangles[++it1] = -(res * res - res + i);
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

            // Edge triangles
            if ((quadI & 0b0100) == 0b0100) {
                if (i % 2 == 0) {
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = -(res * res - 1 - i * res);
                    else
                        edgeTriangles[++it1] = -(res * res - 1 - (i + 2) * res);
                    edgeTriangles[++it1] = itForBlocks[1] + i / 2 + 2;
                    edgeTriangles[++it1] = itForBlocks[1] + i / 2 + 3;

                    edgeTriangles[++it1] = -(res * res - 1 - i * res);
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = itForBlocks[1] + (i + 2) / 2 + 2;
                    else
                        edgeTriangles[++it1] = itForBlocks[1] + i / 2 + 2;
                    edgeTriangles[++it1] = -(res * res - 1 - (i + 2) * res);
                }
            }
            else {
                if (i % 2 == 0)
                    edgeTriangles[++it1] = -(res * res - 1 - i * res);
                else
                    edgeTriangles[++it1] = -(res * res - 1 - (i + 1) * res);
                edgeTriangles[++it1] = itForBlocks[1] + i + 2;
                edgeTriangles[++it1] = itForBlocks[1] + i + 3;

                if (i % 2 == 0)
                    edgeTriangles[++it1] = itForBlocks[1] + i + 3;
                else
                    edgeTriangles[++it1] = itForBlocks[1] + i + 2;
                edgeTriangles[++it1] = -(res * res - 1 - (i + 1) * res);
                edgeTriangles[++it1] = -(res * res - 1 - i * res);
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

            // Edge triangles
            if ((quadI & 0b0010) == 0b0010) {
                if (i % 2 == 0) {
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = -(res - i - 1);
                    else
                        edgeTriangles[++it1] = -(res - i - 3);
                    edgeTriangles[++it1] = itForBlocks[2] + i / 2 + 2;
                    edgeTriangles[++it1] = itForBlocks[2] + i / 2 + 3;

                    if (i % 4 == 0)
                        edgeTriangles[++it1] = itForBlocks[2] + i / 2 + 3;
                    else
                        edgeTriangles[++it1] = itForBlocks[2] + i / 2 + 2;
                    edgeTriangles[++it1] = -(res - i - 3);
                    edgeTriangles[++it1] = -(res - i - 1);
                }
            }
            else {
                if (i % 2 == 0)
                    edgeTriangles[++it1] = -(res - i - 1);
                else
                    edgeTriangles[++it1] = -(res - i - 2);
                edgeTriangles[++it1] = itForBlocks[2] + i + 2;
                edgeTriangles[++it1] = itForBlocks[2] + i + 3;

                if (i % 2 == 0)
                    edgeTriangles[++it1] = itForBlocks[2] + i + 3;
                else
                    edgeTriangles[++it1] = itForBlocks[2] + i + 2;
                edgeTriangles[++it1] = -(res - i - 2);
                edgeTriangles[++it1] = -(res - i - 1);
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

            // Edge triangles
            if ((quadI & 0b0001) == 0b0001) {
                if (i % 2 == 0) {
                    if (i % 4 == 0)
                        edgeTriangles[++it1] = -((i + 2) * res);
                    else
                        edgeTriangles[++it1] = -(i * res);
                    edgeTriangles[++it1] = itForBlocks[3] + i / 2 + 2;
                    edgeTriangles[++it1] = itForBlocks[3] + i / 2 + 3;

                    if (i % 4 == 0)
                        edgeTriangles[++it1] = itForBlocks[3] + i / 2 + 2;
                    else
                        edgeTriangles[++it1] = itForBlocks[3] + i / 2 + 3;
                    edgeTriangles[++it1] = -((i + 2) * res);
                    edgeTriangles[++it1] = -(i * res);
                }
            }
            else {
                if (i % 2 == 0)
                    edgeTriangles[++it1] = -(i * res);
                else
                    edgeTriangles[++it1] = -((i + 1) * res);
                edgeTriangles[++it1] = itForBlocks[3] + i + 2;
                edgeTriangles[++it1] = itForBlocks[3] + i + 3;

                if (i % 2 == 0)
                    edgeTriangles[++it1] = itForBlocks[3] + i + 3;
                else
                    edgeTriangles[++it1] = itForBlocks[3] + i + 2;
                edgeTriangles[++it1] = -((i + 1) * res);
                edgeTriangles[++it1] = -(i * res);
            }
        }


        // Edge corners
        // Top right
        // edgeTriangles[++it1] = 0 + 1;
        // edgeTriangles[++it1] = -(res * (res - 1));
        // edgeTriangles[++it1] = 1 + 1;
        //
        // edgeTriangles[++it1] = -(res * (res - 1));
        // edgeTriangles[++it1] = 0 + 1;
        // if ((quadI & 0b0001) == 0b0001)
        //     edgeTriangles[++it1] = itForBlocks[3] + res - 2;
        // else
        //     edgeTriangles[++it1] = itForBlocks[3] + res + 1;





        let indexEdgesVertices = [];
        for (let i = 0; i < edgeVertices.length; i++) {
            if (edgeVertices[i] != null && edgeVertices[i] != undefined) {
                indexEdgesVertices.push(new pSText(`${i + ""}`,
                    new Vector(edgeVertices[i].x * 6 / 10 + 7, edgeVertices[i].y * 6 / 10 + 2),
                    2, "#FFFFFF"
                ));
            }
        }
        let indexVertices = [];
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i] != null && vertices[i] != undefined) {
                indexVertices.push(new pSText(`${i + ""}`,
                    new Vector(vertices[i].x * 6 / 10 + 7, vertices[i].y * 6 / 10 + 2),
                    2, "#FFFFFF"
                ));
            }
        }

        return [vertices, triangles, edgeVertices, edgeTriangles, indexEdgesVertices, indexVertices]; // .toArray()
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
        let s = 6;
        let t = new Vector(7, 2);
        for (var i = 0; i < this.triangles[this.seq].length; i += 3) {
            drawer
                .beginShape()
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+0]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+0]].y * s / 10 + t.y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+1]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+1]].y * s / 10 + t.y)
                .vertex(this.vertices[this.seq][this.triangles[this.seq][i+2]].x * s / 10 + t.x, this.vertices[this.seq][this.triangles[this.seq][i+2]].y * s / 10 + t.y)
                .endShape(CLOSE);
        }

        // Draw edges
        drawer
            .stroke(255, 150, 150)
            .strokeWeight(2)
            .fill(100, 200, 100, 0.7);
        for (var i = 0; i < this.edgeTriangles[this.seq].length; i += 3) {
            drawer.beginShape();

            if (this.edgeTriangles[this.seq][i+0] > 0)
                drawer.vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+0]-1].x * s / 10 + t.x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+0]-1].y * s / 10 + t.y);
            else
                drawer.vertex(this.vertices[this.seq][-this.edgeTriangles[this.seq][i+0]].x * s / 10 + t.x, this.vertices[this.seq][-this.edgeTriangles[this.seq][i+0]].y * s / 10 + t.y);

            if (this.edgeTriangles[this.seq][i+1] > 0)
                drawer.vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+1]-1].x * s / 10 + t.x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+1]-1].y * s / 10 + t.y);
            else
                drawer.vertex(this.vertices[this.seq][-this.edgeTriangles[this.seq][i+1]].x * s / 10 + t.x, this.vertices[this.seq][-this.edgeTriangles[this.seq][i+1]].y * s / 10 + t.y);

            if (this.edgeTriangles[this.seq][i+2] > 0)
                drawer.vertex(this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+2]-1].x * s / 10 + t.x, this.edgeVertices[this.seq][this.edgeTriangles[this.seq][i+2]-1].y * s / 10 + t.y);
            else
                drawer.vertex(this.vertices[this.seq][-this.edgeTriangles[this.seq][i+2]].x * s / 10 + t.x, this.vertices[this.seq][-this.edgeTriangles[this.seq][i+2]].y * s / 10 + t.y);

            drawer.endShape(CLOSE);
        }
        // Draw edge vertices
        drawer
            .stroke(255, 150, 150)
            .strokeWeight(2)
            .fill(100, 200, 100, 0.7);
        for (let i = 0; i < this.edgeVertices[this.seq].length; i++) {
            if (this.edgeVertices[this.seq][i] != null && this.edgeVertices[this.seq][i] != undefined)
                drawer.ellipse(this.edgeVertices[this.seq][i].x * s / 10 + t.x, this.edgeVertices[this.seq][i].y * s / 10 + t.y, 10, 10, true);
        }
        for (let i = 0; i < this.indexEdgesVertices[this.seq].length; i++) {
            this.indexEdgesVertices[this.seq][i].draw();
        }
        for (let i = 0; i < this.indexVertices[this.seq].length; i++) {
            this.indexVertices[this.seq][i].draw();
        }
    }
}
