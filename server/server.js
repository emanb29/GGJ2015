var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ggj');
var Game = mongoose.model('Game', new mongoose.Schema({
    players: {type: Number, default: 0},
    stamina: {type: Number, default: 0},
    p1state: {
        ready: {type: Boolean, default: false},
        x: {type: Number, default: 0},
        z: {type: Number, default: 0}
    },
    p2state: {
        ready: {type: Boolean, default: false},
        x: {type: Number, default: 0},
        z: {type: Number, default: 0}
    } // false => P1, true => P2
}));
Game.remove({}, function(){
    console.log('deleted games');
});
var app = require('express')();
app.all('/game/ready/:sid/:pid', function(req, res){
    var pid = req.params.pid;
    var updates = {  };
    if (pid == 1){
        record.p1state = {
            ready: true
        };
    } else {
        record.p2state = {
            ready: true
        };
    }
    Game.findByIdAndUpdate(req.params.sid, updates, function(err, record){
        if ((pid == 1 && record.p2state.ready == true) || (pid == 2 && record.p1state.ready == true)){
            res.send(true);
        } else {
            res.send(false);
        }
    });
});
app.get('/game/:sid/:pid', function(req, res){
    Game.findById(req.params.sid, function(err, record){
        if (req.params.pid == 1) {
            res.send(record.p2state);
        } else {
            res.send(record.p1state);
        }
    });
});
app.post('/game/:sid/:pid/:x/:z', function(req, res){
    var pid = req.params.pid;
    var updates = {};
    if (pid == 1){
        updates = {
            p2state: {
                x: req.params.x,
                z: req.params.z
            }
        }
    } else {
        updates = {
            p1state: {
                x: req.params.x,
                z: req.params.z
            }
        }
    }
    Game.findByIdAndUpdate(req.params.sid, updates, function(err, record){
        if (pid = 1) {
            res.send(record.p2state);
        } else {
            res.send(record.p1state);
        }
    });
});
app.delete('/game/:sid', function(req, res){ //call on window unload and window beforeunload, ignoring errors
    Game.findByIdAndRemove(req.params.sid, function(err){
        res.send(err);
    });
});
app.get('/game', function(req, res){
    //console.log('GET /game');

    Game.findOne({players: 1}, function(err, record){
        var game = record;
        var pid = 2;
        if (!game){
            game = new Game();
            pid = 1;
        }
        game.players++;
        game.save();
        res.send({sid: game.id, pid: pid});
    });
});

app.listen(80);