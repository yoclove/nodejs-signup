var mongoose = require('mongoose');
var validator = require('validator');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;



var UserSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			isAsync:false,
			validator: validator.isEmail,
			message: '{VALUE} 不是正确的邮箱'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: [6, '密码至少6位']
	}/*,
	repassword: {
		type: String,
		required: true,
		minlength: [6, '密码至少6位'],
		validate: {
			isAsync:false,
			validator: function(v){
				return validator.equals(v, this.password)
			},
			message: '两次密码不一致'
		}
	}*/
});


UserSchema.pre('save', function(next){
	var user = this;
	if( user.isModified('password') ){
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.password, salt, function(err, hash){
				user.password = hash;
				next();
			})
		})
	}else{
		next();
	}
});


UserSchema.statics.findUserByEmail = function(email){
	var User = this;
	return User.findOne({
			'email': email
		});
}
UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}


/*UserSchema.post('save', function (doc) {
	var user = this;
	user.set('repassword', undefined, {strict: false} );
})*/
var User = mongoose.model('User', UserSchema);

module.exports = {
	User: User
}
