/**
 * Generator class which contains cell and maze definitions and visual debugging methods
 * 
 * depends on //cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.11/seedrandom.min.js
 * 
 * usage:
 * var gen = new generator("seed");
 * var m = new gen.maze();
 * var ascii = m.getAscii();
 * var master_ascii = m.getMasterAscii();
 * var player1_ascii = m.getPlayer1Ascii();
 * var player2_ascii = m.getPlayer2Ascii();
 * 
 * @param any seed for random generator
 * 
 * ASCII CHART
 * 
 * There are 4 charts
 * Source chart which is waht the geerator builds and uses to create the other three charts for the game
 * The master chart is used by the game to determine if something is really there or not
 * The individual player charts are used for rendering the individual players scenes
 * 
 * Key for master and players: 
 *      # Wall 
 *      . Floor
 *      o Pit
 *      w Trap
 *      @ Start
 *      $ End
 *      
 *  Source key
 *      @ #FFF      start
 *      $ #FFF      end
 *      # #999      wall
 *      f #00C      p1 false wall
 *      g #006      p2 false wall
 *      . #333,#666 floor  #333 is used to visualze the solution
 *      o #0C0      p1 false pit
 *      p #060      p2 false pit
 *      w #300      both see pit
 *      e #C00      p1 sees trap
 *      r #600      p2 sees trap
 * 
 * @todo regenerate branches if collid with solution path
 * @todo place doors on solution path if nearboring a branch
 * @todo set traps on branch if neighboring a solution path
 * 
 */

// debug function to output to console and screen
// disable in prod
function log(msg){
//    console.log(msg);
//    if(debug){
//        debug.innerHTML += msg;
//    }
}

var generator = function(seed){
    Math.seedrandom(seed);
    
    var block_size = 16;
    var grid_width = Math.floor(Math.random() * 16) + 10;
    var grid_height = Math.floor(Math.random() * 16) + 10;
    var branches = grid_width * grid_height / 50 + 1;
    var ascii_source;
    var ascii_master;
    var ascii_player1;
    var ascii_player2;
    
    log("seed is " + seed + "\n");
    log("grid is " + grid_width + ", " + grid_height + "\n");
    
    // single cell
    var cell = function(r, c){
        this.r = r;
        this.c = c;
        this.end;
        this.start;
        this.value = 0;
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
                if(l && i === 1){
                    path[i].start = true;
                }
            }
            return path;
        };

        // generate solution path
        this.generate_solution_path = function(){
            // calculate starting and ending positions
            // cell 1 in first 20% and cell 2 in last 20%
            var cell_1 = Math.floor(Math.random() * grid_width * grid_height  * 0.01);
            var cell_2 = Math.floor(Math.random() * grid_width * grid_height  * 0.01 + grid_width * grid_height * 0.99);

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
            var end = this.getRandomPositionRelativeTo(start, 12);
            log("branch starting at " + start.r + ", " + start.c + "\n");
            log("branch ending at " + end.r + ", " + end.c + "\n");
            if(end){
                var branch = this.generatePath(start, end, true);
                end.end = true;
                for(var i = 0; i < branch.length; i++){
                    if(branch[i].value === 0){
                        branch[i].value = 2;
                    }
               }
            }
        };

        // get a random position relative to starting point
        // position can not be further away than max_distance
        this.getRandomPositionRelativeTo = function(start, max_distance){
            var to_far = true;
            var rand_cell;
            var diff_r, diff_c;
            var try_limit = 0;
            while(to_far){
                log("try " + try_limit);
                rand_cell = this.cells[Math.floor(Math.random() * this.cells.length - 1) +1];
                log("rand cell selected at " + rand_cell.r + ", " + rand_cell.c + "\n");
                diff_r = Math.abs(rand_cell.r - start.r);
                diff_c = Math.abs(rand_cell.c - start.c);
                if(diff_r + diff_c < max_distance && rand_cell.value === 0){
                    log("rand cell is not too far \n");
                    if(diff_r > 4 && diff_c > 4 ){
                        to_far = false;
                    }
                    log("rand cell is too close \n");
                }
                log("rand cell is too far \n");
                try_limit++;
                if(try_limit > 20){
                    to_far = false;
                }
            }
            return rand_cell;
        };

        // gets all 9 adjacent cells
        // usefull to calculate if safe for trap etc
        this.getAdjacentCells = function(cell, filter){
            var start_c = cell.c - 1;
            var end_c = cell.c + 1;
            var start_r = cell.r - 1;
            var end_r = cell.r + 1;
            if(start_c < 1) {
                start_c = 1;
            }
            if(end_c > grid_width){
                end_c = grid_width;
            }
            if(start_r < 1) {
                start_r = 1;
            }
            if(end_r > grid_height){
                end_r = grid_height;
            }
            var i, j;
            var neighboors = [];
            
            for(i = start_c; i <= end_c; i++){
                for(j = start_r; j <= end_r; j++){
                    var tmp_cell = this.getCellAtPosition(j, i);
                    if(tmp_cell !== undefined && (cell.c !== tmp_cell.c || cell.r !== tmp_cell.r) && tmp_cell.value !== filter){
                        neighboors.push(tmp_cell);
                    }
                }
            }
            return neighboors;
        };

        // sets false walls
        this.setFalseWalls = function(){
            for(var i = 0; i < grid_height * grid_width * 2; i++){
                var pos = Math.random() * this.cells.length -1;
                if(pos < 0){
                    pos = 0;
                }
                rand_cell = this.cells[Math.floor(pos)];
                if(rand_cell.value === 1){
                    var adjacent = this.getAdjacentCells(rand_cell, 0);
                    if(adjacent.length === 3){
                        if(this.getAdjacentCells(rand_cell).length === this.getAdjacentCells(rand_cell, "f").length 
                                && this.getAdjacentCells(rand_cell).length === this.getAdjacentCells(rand_cell, "g").length){
                            if(Math.random() * 100 > 20){
                                if(Math.random() * 100 > 50){
                                    rand_cell.value = "f";
                                } else {
                                    rand_cell.value = "g";
                                }
                            }
                        }
                    }
                }
            }
        };

        // sets traps
        this.setTraps = function(){
            var rand_cell;
            for(var i = 0; i < grid_height * grid_width / 10; i++){
                var pos = Math.random() * this.cells.length -1;
                if(pos < 0){
                    pos = 0;
                }
                rand_cell = this.cells[Math.floor(pos)];
                // if branch path it is ok
                if(rand_cell.value === 2){
                    rand_cell.value = "w";
                } else {
                    var adjacent = this.getAdjacentCells(rand_cell);
                    var count = 0;
                    for(var j = 0; j < adjacent.length; j++){
                        if(adjacent[j].value === 1 || adjacent[j].value === 2){
                            count++;
                        }
                    }
                    if(count > 6 && rand_cell.value === 2){
                        rand_cell.value = "w";
                    }
                }
                if(rand_cell.value === "w"){
                    if(Math.random() * 100 > 50){
                        if(Math.random() * 100 > 50){
                            rand_cell.value = "e";
                        } else {
                            rand_cell.value = "r";
                        }
                    }
                }
            }
        };

        // sets false traps
        this.setFalseTraps = function(){
            for(var i = 0; i < grid_height * grid_width / 5; i++){
                var pos = Math.random() * this.cells.length -1;
                if(pos < 0){
                    pos = 0;
                }
                rand_cell = this.cells[Math.floor(pos)];
                if(rand_cell.value !== 0 && Math.random() * 100 > 95){
                    if(rand_cell.value === 1 || rand_cell.value === 2){
                        if(Math.random() * 100 > 50){
                            rand_cell.value = "o";
                        } else {
                            rand_cell.value = "p";
                        }
                    }
                }
            }
        };

        // paint the maze for visualazation
        this.paint = function(ctx){
            var value;
            for(i = 0, c = 1; i < this.cells.length; i++, c++){
                value = this.cells[i].value;
                if(c === grid_width + 1){
                    c = 1;
                }
                r = Math.floor(i / grid_width + 1);
                switch(value){
                    case 1://solution
                        ctx.fillStyle = "#333";
                        ctx.fillStyle = "#666";
                        break;
                    case 2://branch
                        ctx.fillStyle = "#666";
                        break;
                    case "w":// trap both see pit
                        ctx.fillStyle = "#300";
                        break;
                    case "e":// trap p1 sees trap
                        ctx.fillStyle = "#C00";
                        break;
                    case "r":// trap p2 sees trap
                        ctx.fillStyle = "#600";
                        break;
                    case "f"://p1 false wall
                        ctx.fillStyle = "#00C";
                        break;
                    case "g":// p2 false wall
                        ctx.fillStyle = "#006";
                        break;
                    case "o":// p1 false trap
                        ctx.fillStyle = "#0F0";
                        break;
                    case "p":// p2 false trap
                        ctx.fillStyle = "#030";
                        break;
                    case "@":
                    case "$":
                        ctx.fillStyle = "#FFF";
                        break;
                    default://wall
                        ctx.fillStyle = "#999";
                        break;
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

        this.getMasterAscii = function(){
            var c = 1;
            var ascii = "";
            for(var i = 0; i < this.cells.length; i++, c++){
                if(c === grid_width + 1){
                    ascii += "\n";
                    c = 1;
                }
                switch (this.cells[i].value){
                    case '@': // #FFF      start
                        ascii += "@@";
                        break;
                    case '$': // #FFF      end
                        ascii += "$$";
                        break;
                    case 0: // #999      wall
                        ascii += "##";
                        break;
                    // floor and false hazards
                    case 'f': // #00C      p1 false wall
                    case 'g': // #006      p2 false wall
                    case 1: // #333,#666 floor
                    case 2:
                    case 'o': // #0C0      p1 false pit
                    case 'p': // #060      p2 false pit
                        ascii += "..";
                        break;
                    // real hazards
                    case 'e': // #C00      p1 sees trap
                    case 'r': // #600      p2 sees trap
                    case 'w': // #300      both see pit
                        ascii += "ww";
                        break;
                        
                }
            }
            return ascii;
        };
        
        this.getPlayer1Ascii = function(){
            var c = 1;
            var ascii = "";
            for(var i = 0; i < this.cells.length; i++, c++){
                if(c === grid_width + 1){
                    ascii += "\n";
                    c = 1;
                }
                switch (this.cells[i].value){
                    case '@': // #FFF      start
                        ascii += "@@";
                        break;
                    case '$': // #FFF      end
                        ascii += "$$";
                        break;
                    case 'f': // #00C      p1 false wall
                    case 0: // #999      wall
                        ascii += "##";
                        break;
                    // floor and false hazards
                    case 'g': // #006      p2 false wall
                    case 1: // #333,#666 floor
                    case 2:
                    case 'p': // #060      p2 false pit
                    case 'r': // #600      p2 sees trap
                        ascii += "..";
                        break;
                    case 'o': // #0C0      p1 false pit
                        ascii += "oo";
                        break;
                    // real hazards
                    case 'e': // #C00      p1 sees trap
                    case 'w': // #300      both see pit
                        ascii += "ww";
                        break;
                        
                }
            }
            return ascii;
        };
        
        this.getPlayer2Ascii = function(){
            var c = 1;
            var ascii = "";
            for(var i = 0; i < this.cells.length; i++, c++){
                if(c === grid_width + 1){
                    ascii += "\n";
                    c = 1;
                }
                switch (this.cells[i].value){
                    case '@': // #FFF      start
                        ascii += "@@";
                        break;
                    case '$': // #FFF      end
                        ascii += "$$";
                        break;
                    case 'g': // #006      p2 false wall
                    case 0: // #999      wall
                        ascii += "##";
                        break;
                    // floor and false hazards
                    case 'e': // #C00      p1 sees trap
                    case 'f': // #00C      p1 false wall
                    case 1: // #333,#666 floor
                    case 2:
                    case 'o': // #0C0      p1 false pit
                        ascii += "..";
                        break;
                    case 'p': // #060      p2 false pit
                        ascii += "oo";
                        break;
                    // real hazards
                    case 'r': // #600      p2 sees trap
                    case 'w': // #300      both see pit
                        ascii += "ww";
                        break;
                        
                }
            }
            return ascii;
        };

        // get shit done
        log("generating solution \n");
        this.generate_solution_path();
        for(var i = 0; i < branches; i++){
            log("generating a branch \n");
            this.generate_branch();
        }
        log("generating false walls");
        this.setFalseWalls();
        log("generating false traps");
        this.setFalseTraps();
        this.setFalseTraps();
        this.setFalseTraps();
        log("generating real traps");
        this.setTraps();
    };

    // init the canvas for visualazation
    this.initScene = function(container){
        canvas.width = grid_width * block_size;
        canvas.height = grid_height * block_size;
        container.setAttribute("style","width:" + grid_width * block_size + "px; height:" + grid_height * block_size + "px; margin: 20px auto;");
    };
};