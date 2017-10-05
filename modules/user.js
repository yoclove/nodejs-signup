var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
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
		unique: true
	}
});

var User = mongoose.model('User', UserSchema);

module.exports = {
	User: User
}
