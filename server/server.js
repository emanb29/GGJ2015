var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ggj');
var Game = mongoose.model('Game', new mongoose.Schema({
    x: {type: Number, default: 0},
    y: {type: Number, default: 0},
    players: {type: Number, default: 0},
    stamina: {type: Number, default: 0},
    activePlayer: {type: Boolean, default: false} // false => P1, true => P2
}));
Game.remove({}, function(){
    console.log('deleted games');
});
var app = require('express')();

app.get('/game/:sid', function(req, res){
    Game.findById(req.params.sid, function(err, record){
        res.send(record);
    });
});
app.post('/game/:sid', function(req, res){
    Game.findByIdAndUpdate(req.params.sid, req.body, function(err, record){
       res.send(record);
    });
});
app.delete('/game/:sid', function(req, res){ //call on window unload and window beforeunload, ignoring errors
    Game.findByIdAndRemove(req.params.sid, function(err){
        res.send(err);
    });
});
app.get('/game', function(req, res){
    Game.findOne({players: 1}, function(err, record){
        var game = record;
        if (!game){
            game = new Game();
        }
        game.players++;
        game.save();
        res.send(game.id);
    });
});

app.listen(3000);