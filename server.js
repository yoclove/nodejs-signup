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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname+'/public'));


app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '123456',
    // store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());

app.use(function(req, res, next){
	res.locals.success = req.flash('success');
	res.locals.errors = req.flash('errors');
	next();
});

app.get('/',function(req, res){
	res.render('index.hbs',{
		title: '首页'
	});
	// res.send('about.hbs');
});


app.get('/signup',function(req, res){
	res.render('signup.hbs',{
		title: '注册'/*,
		success: req.flash('success'),
		errors: req.flash('errors')*/
	});
	// res.send('about.hbs');
});

app.post('/signup',function(req, res){
	console.log(req.body);
	var newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		repassword: req.body.repassword
	});
	newUser.save().then(function(doc){
		console.log(3);
		// console.log(doc);
		req.flash('success','成功');
		return res.redirect('/signup');
	}).catch(function(err){
		console.log(4);
		// var key_val = err.message.match(/index\:\ [a-z_]+\.[a-z_]+\.\$([a-z_]+)\_[0-9a-z]{1,}\s+dup key[: {]+"(.+)"/).splice(1,3);
		// [ 'username', 'debjyoti1' ]
		// console.log(key_val);
		// var errMsg =  key_val[1] + '已经注册'; 
		// req.flash('errors', errMsg);
		req.flash('errors', err.message);
		return res.redirect('/signup');
	})
});


app.listen(3000, function(){
	console.log('web app启动');
});
// nodemon server.js -e js,hbs