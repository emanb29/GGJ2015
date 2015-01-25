/**
 * Generator class which contains cell and maze definitions and visual debugging methods
 * 
 * depends on //cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.11/seedrandom.min.js
 * 
 * usage:
 * var gen = new generator("seed");
 * var m = new gen.maze();
 * var ascii = m.getAscii();
 * 
 * @param any seed for random generator
 */

var generator = function(seed){
    Math.seedrandom(seed);
    
    var block_size = 16;
    var grid_width = Math.floor(Math.random() * 16) + 8;
    var grid_height = Math.floor(Math.random() * 16) + 8;
    var branches = grid_width * grid_height / 100 + 1;
    
    // single cell
    var cell = function(r, c){
        this.r = r;
        this.c = c;
        this.value = 0;

        function paint(ctx){
            if(value === 1){
                ctx.fillStyle = "#333";
            } else if(value === 2){
                ctx.fillStyle = "#000";
            } else {
                ctx.fillStyle = "#999";
            }
            ctx.fillRect(this.c * block_size - block_size, this.r * block_size - block_size, this.c * block_size, this.r * block_size);
        }
    };
    
    // maze
    this.maze = function(){
        // array of cells
        this.cells = [];
        // start position
        this.start = 0;
        // end position
        this.end = 0;
        // prefer left -1 or right 1
        this.horizontal;
        // prefer up -1 or down 1
        this.verticle;
        // preference horizontal, verticle
        this.direction;
        // path. contains cell positions from start to end
        this.solution_path = [];
        // branches array or paths
        this.branches = [];

        // populate maze with empty cells
        var i, r, c;
        for( i = 0, r = 1, c = 1; i < grid_width * grid_height; i++, c++){
            // set column
            if(c === grid_width + 1){
                c = 1;
            }
            // set row
            r = Math.floor(i / grid_width + 1);
            this.cells[i] = new cell(r, c);
        }

        // set the preferenced direction to go lr, up
        this.setPreference = function(start, end){
            // preference left or right
            if(start.c < end.c){
                this.horizontal = 1;
            } else if (start.c > end.c) {
                this.horizontal = -1;
            } else {
                this.horizontal = 0;
            }

            // preference up or down
            if(start.r < end.r){
                this.verticle = 1;
            } else if (start.r > end.r) {
                this.verticle = -1;
            } else {
                this.verticle = 0;
            }
        };

        // take the current cell and move towards the end cell
        this.next = function(start, end, l){
            var r, c;
            // l path
            if(l === true){
                if(this.direction === undefined){
                    if(Math.abs(start.c - end.c) < Math.abs(start.r - end.r)){
                        this.direction = "verticle";
                    } else {
                        this.direction = "horizontal";
                    }
                }
                if(start.c === end.c && start.r === end.r){
                    return;
                }
                if(start.c === end.c){
                    this.direction = "verticle";
                }
                if(start.r === end.r){
                    this.direction = "horizontal";
                }

                if(this.direction === "horizontal"){
                    if(start.c > end.c){
                        c = start.c -1;
                        r = start.r;
                    } else {
                        c = start.c +1;
                        r = start.r;
                    }
                } else if(this.direction === "verticle"){
                    if(start.r > end.r){
                        r = start.r -1;
                        c = start.c;
                    } else {
                        r = start.r +1;
                        c = start.c;
                    }
                }
            } else {
                // random path
                this.setPreference(start, end);
                var hv = Math.random() * 100;
                if(hv <= 50){ // lr
                    if(this.horizontal === 1){
                        c = start.c + 1;
                        r = start.r;
                    } else {
                        c = start.c - 1;
                        r = start.r;
                    }
                } else { // hv
                    if(this.verticle === 1){
                        r = start.r + 1;
                        c = start.c;
                    } else {
                        r = start.r - 1;
                        c = start.c;
                    }
                }
            }

            // fix if off grid
            if(c > grid_width){
                c = grid_width;
            } else if(c === 0){
                c = 1;
            }
            if(r > grid_height){
                r = grid_height;
            } else if (r === 0){
                r = 1;
            }

            return this.getCellAtPosition(r, c);
        };

        // get the cell at row column position
        this.getCellAtPosition = function(r, c){
            for(var i =0; i < this.cells.length; i++){
                if(this.cells[i].r === r && this.cells[i].c === c){
                    return this.cells[i];
                }
            }
        };

        // generate a path from start to end
        // prefers to only go in the right direction
        this.generatePath = function(start, end, l){        
            var path = [];
            path[0] = start;
            for (var i = 0; i < 500; i++){
                if(path[i] === end){
                    break;
                }
                path[i+1] = this.next(path[i], end, l);
            }
            return path;
        };

        // generate solution path
        this.generate_solution_path = function(){
            // calculate starting and ending positions
            // cell 1 in first 20% and cell 2 in last 20%
            var cell_1 = Math.floor(Math.random() * grid_width * grid_height  * 0.05);
            var cell_2 = Math.floor(Math.random() * grid_width * grid_height  * 0.05 + grid_width * grid_height * 0.95);

            // randomize which cell is start/end
            var start, end;
            if(Math.random() * 100 <= 50){
                start = this.cells[cell_1];
                end = this.cells[cell_2];
            } else {
                start = this.cells[cell_2];
                end = this.cells[cell_1];
            }

            this.solution_path = this.generatePath(start, end);

            for(var i = 0; i < this.solution_path.length; i++){
                this.solution_path[i].value = 1;
            }
            this.solution_path[0].value = "@";
            this.solution_path[this.solution_path.length -1].value = "$";
        };

        // generate a branch off the solution path
        this.generate_branch = function(){
            // get random point in solution path
            var start = this.solution_path[Math.floor(Math.random() * (this.solution_path.length -1))];
            var end = this.getRandomPositionRelativeTo(start, 8);
            var branch = this.generatePath(start, end, true);
            for(var i = 0; i < branch.length; i++){
                if(branch[i].value !== "@" && branch[i].value !== "$"){
                    branch[i].value = 2;
                }
            }
        };

        // get a random position relative to starting point
        // position can not be further away than max_distance
        this.getRandomPositionRelativeTo = function(start, max_distance){
            var to_far = true;
            var rand_cell;
            var diff_r, diff_c;
            while(to_far){
                rand_cell = this.cells[Math.floor(Math.random() * this.cells.length - 1) +1];
                diff_r = Math.abs(rand_cell.r - start.r);
                diff_c = Math.abs(rand_cell.c - start.c);
                if(diff_r + diff_c < max_distance && rand_cell.value === 0){
                    to_far = false;
                }
            }
            return rand_cell;
        };

        // paint the maze for visualazation
        this.paint = function(ctx){
            for(i = 0, c = 1; i < this.cells.length; i++, c++){
                if(c === grid_width + 1){
                    c = 1;
                }
                r = Math.floor(i / grid_width + 1);
                if(this.cells[i].value === 1){
                    ctx.fillStyle = "#333";
                } else if (this.cells[i].value === 2){
                    ctx.fillStyle = "#666";
                } else {
                    ctx.fillStyle = "#999";
                }
                ctx.fillRect(c * block_size - block_size, r * block_size - block_size, c * block_size, r * block_size);
            }
        };

        // create ascii chart
        this.getAscii = function(){
            var c = 1;
            var ascii = "";
            for(var i = 0; i < this.cells.length; i++, c++){
                if(c === grid_width + 1){
                    ascii += "\n";
                    c = 1;
                }
                switch (this.cells[i].value){
                    case 0:
                        ascii += "##";// wall
                        break;
                    case 1:
                    case 2:
                        ascii += "..";// floor
                        break;
                    default:
                        ascii += this.cells[i].value + "" + this.cells[i].value;
                }
            }
            return ascii;
        };

        // get shit done
        this.generate_solution_path();
        for(var i = 0; i < branches; i++){
            this.generate_branch();
        }
    };

    // init the canvas for visualazation
    this.initScene = function(container){
        canvas.width = grid_width * block_size;
        canvas.height = grid_height * block_size;
        container.setAttribute("style","width:" + grid_width * block_size + "px; height:" + grid_height * block_size + "px; margin: 20px auto;");
    };
};

//// generate ascii
//var gen = new generator("ggj 2015");
//var m = new gen.maze();
//var ascii = m.getAscii();
//console.log(ascii);
//
//// visual debug ascii
//var container = document.getElementById("container");
//var canvas = document.getElementById("scene");
//var ctx = canvas.getContext("2d");
//var ascii_container = document.getElementById("ascii");
//gen.initScene(container);
//m.paint(ctx);
//ascii_container.innerHTML = ascii;