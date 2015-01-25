<html>
    <head>
        <title>Generator</title>
        <style>
            * {
                margin: 0px;
                padding: 0px;
            }
            body {
                background-color: #333;
                color: #EEE;
                text-align: center;
            }
            canvas {
                background-color: #999;
                margin: 0px auto;
            }
            pre {
                width: 25%;
                float: left;
            }
        </style>
    </head>
    <body>
        <div id="container">
            <canvas id="scene"></canvas>
        </div>
        <pre id="debug"></pre>
        <pre id="ascii"></pre>
        <pre id="master_ascii"></pre>
        <pre id="p1_ascii"></pre>
        <pre id="p2_ascii"></pre>
        <script src="//cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.11/seedrandom.min.js"></script>
        <script src="gen.js"></script>
        <script>

var debug = document.getElementById("debug");
var gen = new generator(Date());
var m = new gen.maze();
var ascii = m.getAscii();
var master_ascii = m.getMasterAscii();
var p1_ascii = m.getPlayer1Ascii();
var p2_ascii = m.getPlayer2Ascii();

// visual debug ascii
var container = document.getElementById("container");
var canvas = document.getElementById("scene");
var ctx = canvas.getContext("2d");
var ascii_container = document.getElementById("ascii");
var master_ascii_container = document.getElementById("master_ascii");
var p1_ascii_container = document.getElementById("p1_ascii");
var p2_ascii_container = document.getElementById("p2_ascii");
gen.initScene(container);
m.paint(ctx);
ascii_container.innerHTML = ascii;
master_ascii_container.innerHTML = master_ascii;
p1_ascii_container.innerHTML = p1_ascii;
p2_ascii_container.innerHTML = p2_ascii;
        </script>
    </body>
</html>
