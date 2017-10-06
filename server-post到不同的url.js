var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var mongoose = require('mongoose');
var hbs = require('hbs');

var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');


var User = require('./modules/user').User;
var url = 'mongodb://root:799305728@ds163494.mlab.com:63494/doto';
mongoose.Promise = global.Promise;
mongoose.connect(url,  { useMongoClient: true });


var app = express();
app.set('view engine','hbs');

hbs.registerPartials(__dirname + '/views/partials');


app.use(bodyParser());
app.use(express.static(__dirname+'/public'));


app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '123456',
    // store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());


app.get('/',function(req, res){
	res.render('index.hbs',{
		title: '首页'
	});
	// res.send('about.hbs');
});


app.get('/signup',function(req, res){
	res.render('signup.hbs',{
		title: '注册'
	});
	// res.send('about.hbs');
});
app.post('/register',function(req, res){
	var newUser = new User({
		name: req.body.name,
		email: req.body.email
	});
	newUser.save().then(function(doc){
	    res.render('signup.hbs',{
			title: '注册成功',
			doc: doc
	    });
		// res.send(doc);
	}).catch(function(err){
		res.send(err);
	})
   
})


app.listen(3000, function(){
	console.log('web app启动');
});
// nodemon server.js -e js,hbs