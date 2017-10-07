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
		title: '注册',
		name: req.session.name,
		email: req.session.email
		/*,
		success: req.flash('success'),
		errors: req.flash('errors')*/
	});
	
	req.session.name = null;
	req.session.email = null;
	// res.send('about.hbs');
});



app.post('/signup',function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var repassword = req.body.repassword;
	
	var errMsg = [];
	
	if (!(name.length >= 6 && name.length <= 10)) {
    	errMsg.push('名字请限制在 6-10 个字符');
	}
	if (password.length < 6) {
    	errMsg.push('密码至少 6 个字符');
	}
	if (password !== repassword) {
    	errMsg.push('两次输入密码不一致');
   	}
   	if(errMsg.length > 0){
	   	req.flash('errors', errMsg);
	   	req.session.name = name;
	   	req.session.email = email;
	   	return res.redirect('/signup');
   	}
	
	var user = {
		name: name,
		email: email,
		password: password
	}
	
	var newUser = new User(user);
	newUser.save().then(function(doc){
		req.flash('success','成功');
		return res.redirect('/signup');
	}).catch(function(err){
		
		if (err.code === 11000) {
			var key_val = err.message.match(/index\:\ [a-z_]+\.[a-z_]+\.\$([a-z_]+)\_[0-9a-z]{1,}\s+dup key[: {]+"(.+)"/).splice(1,3);
			var errMsg =  key_val[1] + '已经注册'; 
		}else{
			var errMsg = err.message; 
		}
		req.flash('errors', errMsg);
		return res.redirect('/signup',{
	   		name: name,
	   		email: email
	   	});
	})
});


app.listen(3000, function(){
	console.log('web app启动');
});
// nodemon server.js -e js,hbs