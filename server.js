var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var mongoose = require('mongoose');
var hbs = require('hbs');

var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //把session存入数据库

var app = express();
app.set('view engine','hbs');

var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy;


var User = require('./modules/user').User;
var url = 'mongodb://root:799305728@ds163494.mlab.com:63494/doto';
mongoose.Promise = global.Promise;
mongoose.connect(url,  { useMongoClient: true });




hbs.registerPartials(__dirname + '/views/partials');




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname+'/public'));


app.use(cookieParser());





app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '123456',
    // store: new MongoStore({url:'mongodb://root:799305728@ds163494.mlab.com:63494/doto'})
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

passport.use(new LocalStrategy(
	{
		usernameField: 'name',
		passwordField: 'password',
  		 passReqToCallback: true
	},
  	function(req, name, password, done) {
  		
  		
  		User.findOne({ name: name},function(err, user){
  		    if(err) return done(err);

  		    if(!user){
  		        return done(null, false, req.flash('errors','没有找到用户'));
  		    }
  		    if(!user.comparePassword(password)){
  		        return done(null, false, req.flash('errors','密码错误'));
  		    }
  		    return done(null, user);
  		})
  	}
));

app.use(function(req, res, next){
	res.locals.success = req.flash('success');
	res.locals.errors = req.flash('errors');
	res.locals.isAuthenticated = req.isAuthenticated();
	next();
});


passport.serializeUser(function(user, done) {
	console.log(user);
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
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

app.get('/profile', checkLogin(), function(req, res){
	res.render('profile.hbs',{
		title: '个人页面'
	});

});

app.get('/login', function(req, res){
	res.render('login.hbs',{
		title: '登陆'
	});
});



app.post('/login', passport.authenticate('local',{
	successRedirect: '/profile',
	failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
	req.logout();
	req.session.destroy();
	res.redirect('/');
});



const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');



app.post('/signup',
	[
	  check('email')
	    .isEmail().withMessage('必须是邮箱')
	    .custom(value => {
	      return User.findUserByEmail(value).then(user => {
		      	if(user){
			        throw new Error('邮箱已注册');
		      	}else{
					return true;
		      	}
	      })
	    }),
	    check('password', '密码最少5位').isLength({ min: 5 }),
        check('repassword', '两次密码必须一样').exists().custom((value, { req }) => value === req.body.password)
	],
	function(req, res){
		var errors = validationResult(req);
		console.log(errors.mapped());
		if (Object.keys(errors.mapped()).length > 0) {
		  var validatErrors =  errors.mapped();
		  var err = [];
		  for (var key in validatErrors) {
		  	for (var k in validatErrors[key]) {
		  	      if(k == 'msg'){
		  	      	err.push(validatErrors[key][k])
		  	      }
		  	  }
		    }
			console.log('有错误');
			console.log(err);
		  
		   	req.flash('errors', err);
		  	return res.redirect('/signup');
		}
		console.log(5);
		var name = req.body.name;
		var email = req.body.email;
		var password = req.body.password;
		var repassword = req.body.repassword;
		
		var user = {
			name: name,
			email: email,
			password: password
		}
		var newUser = new User(user);
		newUser.save().then(function(user){
			req.flash('success','成功');
			req.login(user, function(err){
				console.log('session成功', user);
				if (err) { console.log(err); return next(err); }
				return res.redirect('/profile');
			})
		}).catch(function(err){
			console.log(err);
			req.flash('errors', err);
			return res.redirect('/signup');
		})
	
});



function checkLogin () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
		console.log(req.isAuthenticated());
	    if (!req.isAuthenticated()){
	    	res.redirect('/login')
	    }
	    next();
	}
}

function checkNotLogin () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
		console.log(req.isAuthenticated());
	    if (req.isAuthenticated()){
	    	return res.redirect('back')
	    }
	    next();
	}
}

app.listen(3000, function(){
	console.log('web app启动');
});
// nodemon server.js -e js,hbs