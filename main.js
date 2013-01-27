var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    cons = require('consolidate'),
    swig = require('swig'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;
    // redis = require('redis').createClient();

var mongo = new MongoClient(new Server("localhost", 27017));
mongo.open(function() {});
mongo = mongo.db('hearts');


exports.mongo = mongo;
exports.app = app;
exports.server = server;
exports.io = io;


app.use(express.logger());
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.session({secret: "Hearts è un gioco fantastico!"}));
app.use('/static', express.static(__dirname + '/static'));
app.use(express.csrf());

app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.disable('view cache');
app.disable('x-powered-by');

swig.init({ root: __dirname + '/templates', allowErrors: true, cache: false });
app.set('views', __dirname  + '/templates');

io.set('log level', 2);

io.sockets.on('connection', function(socket) {
    
    socket.on('join', function(data, fn) {
        var games = mongo.collection('games');
        games.findOne({id: parseInt(data.id)}, function(err, game) {
            if (game === null) return fn({error: "404 game not found"});
            if (game.players.length === 4) return fn({error: "605 orgia."});
            games.update(game, {$push: {players: data.user}}, function () {
                console.dir(arguments);
                fn('ok!!!!!!!!');
            });
        });
    });

    socket.emit('deck', shuffle(createDeck()));
});

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};


function createDeck() {
    var deck = [];
    for (var i = 1; i < 0xC; i++)
        deck.push(0x1F0A0+i, 0x1F0B0+i, 0x1F0C0+i, 0x1F0D0+i);

    deck.push(0x1F0AD, 0x1F0BD, 0x1F0CD, 0x1F0DD);
    deck.push(0x1F0AE, 0x1F0BE, 0x1F0CE, 0x1F0DE);
    return deck;
};
