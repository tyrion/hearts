// TODO: mi sa che si puo' trovare un modo per unire le sessioni di connect con quelle di socket.io

var mongo = require('./main').mongo,
    app = require('./reloader').app(module);

app.get('/', function(req, res) {
    mongo.collection('games').find().toArray(function(err, games) {
        var ctx = {}
        ctx.games = games;
        ctx.csrf = req.session._csrf;
        res.render('home.html', ctx);
    });
});

app.get('/play', function(req, res) {
    req.session.nick = req.query.nick;
    res.send("Hello "+ req.query.nick);
});
