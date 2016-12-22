var monk = require('monkii');
var scrypt = require('scrypt-for-humans');
var jwt = require('jsonwebtoken');

var key = 'THISISOURNOTVERYSECRETKEY';

var db = monk(process.env.MONGODB_URI || 'mongodb://localhost:27017/local');

var users = db.get('users');

var get = function (email) {
	return users.findOne({ email: email });
};

var login = function (email, password, done) {
	users.findOne({ email: email }).then(function (user) {
		checkHash(password, user.passwordHash, function (err) {
			if (err) return done(err);
			done(null, user);
		});
	}).catch((err) => {
		done(err);
	});
};

var signup = function (email, password, done) {
	createHash(password, function (err, hash) {
		users.insert({ email: email, passwordHash: hash }).then((user) => {
			done(null, user);
		}).catch((err) => {
			done(err);
		});
	});
}

function createHash (password, done) {
	scrypt.hash(password, {}, function (err, hash) {
		if (err) return done(err);
		done(null, hash);
	});
}

function checkHash (password, hash, done) {
	scrypt.verifyHash(password, hash, function (err, result) {
		if (err) return done(err);
		done(null);
	});
}

var createToken = function (user, done) {
	jwt.sign({ id: user.id, email: user.email }, key, {}, function (err, token) {
		if (err) return done(err);
		done(null, token);
	});
}

var getUser = function (token, done) {
	jwt.verify(token, key, function (err, decoded) {
		if (err) return done(err);
		done(null, decoded);
	});
}

module.exports = {
	get: get,
	login: login,
	signup: signup,
	createToken: createToken,
	getUser: getUser
};
