'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var VoteHandler = require(path + '/app/controllers/voteHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	var voteHandler = new VoteHandler();
	
	app.route('/').get(voteHandler.getPolls);

	app.route('/newpoll')
		.get(isLoggedIn, voteHandler.newPolls)
		.post(isLoggedIn, voteHandler.addPoll);

	app.route('/login')
		.get(function (req, res) {
			res.render('index', {showlogin:true});
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});
		
		
	app.route('/poll/:id')
    	.get(voteHandler.viewPoll)
    	.post(isLoggedIn, voteHandler.addOption);
    	
    app.route('/polldelete/:id')
    	.get(isLoggedIn, voteHandler.deletePoll);
    	
    app.route('/vote/:id')
    	.post(voteHandler.vote);

	app.route('/profile')
		.get(isLoggedIn, voteHandler.profile);

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
