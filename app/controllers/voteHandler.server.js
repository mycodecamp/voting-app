'use strict';

var Users = require('../models/users.js');
var Votes = require('../models/poll.js');

function VoteHandler () {

	this.getPolls = function (req, res) {
	  
    Votes.find(function (err, polls) {
      
      if (err) return res.sendStatus(500);
      
      res.render('index', {
        
        returnvalue: polls.map(function(poll){
          
          if(req.user && req.user.github.id == poll.author) {
            
            poll.isOwn = true;
            
          } else {
            
            poll.isOwn = false;
            
          };
          
          return poll;
        }),
         isLoggedIn: !!req.user
      });
    });
  }
  
  this.newPolls = function (req, res) {
      res.render('index', {showNewPoll:true,
         isLoggedIn: req.user ? true : false
      });
  };
  
  
  this.addPoll=function(req,res) {
    var options = Object.keys(req.body)
                  .filter( function(key) {
                          return key.startsWith('option');
                  })
                  .map( function(key) {
                      return {
                              name: req.body[key],
                              count: 0
                            };
                  });
    Votes.create({
      ques: req.body.question,
      author: req.user.github.id,
      votes: 0,
      options: options
    }, 
    function(err, poll) {
      if (err) return res.sendStatus(500);
      res.redirect(`/poll/${poll._id}`); 
    });
    
    
  }
  

  
  this.viewPoll = function(req, res) {
    Votes.findById(req.params.id, function(err, poll) {
      if (err) return res.sendStatus(404);
      var url = req.protocol + "://" + req.hostname + req.originalUrl;
      var optionNames = poll.options.map(function(option) {
        return `"${option.name}"`;
      });
      var data = poll.options.map(function(option) {
        return option.count;
      });
      res.render('viewpoll', {
        poll: poll,
        optionNames: optionNames,
        data: data,
        isLoggedIn: req.user ? true : false,
        twittermessage: `Vote for my poll, ${poll.name}: ${url} `
      });
    });
  }
  
  
  this.addOption = function(req, res) {
    if (req.body.optionName == "") {
      return res.redirect(`/poll/${req.params.id}`);
    };
    
    var newOption = {
      name: req.body.optionName,
      count: 0
    };
    
    Votes.update( {
      _id: req.params.id
    }, {
      $push: {
        options: newOption
      },
      $inc: {
        "votes": 1
      }
    }, function(err, raw) {
      if (err) return res.sendStatus(500);
      res.redirect(`/poll/${req.params.id}`);
    });
  }
  
   this.vote = function(req, res) {
    Votes.update( {
      _id: req.params.id,
      "options._id": req.body.optradio
    }, {
      $inc: {"options.$.count": 1, "votes": 1},
    }, function(err, raw) {
      if (err) return res.sendStatus(500);
      res.redirect(`/poll/${req.params.id}`);
    });
   
  }
  
  this.deletePoll = function (req, res) {
    var id = req.params.id;
    Votes.findById(id, function(err, poll) {
      if (err) return res.sendStatus(404);
      if (req.user.github.id != poll.author) return res.sendStatus(401);
      poll.remove();
      res.redirect('/');
    });
  }
  
  this.profile = function (req, res) {
    res.render('index',{
        gituser:req.user.github,
        isprofile:true,
         isLoggedIn: req.user ? true : false,
    });
    
  }
  
  
	
}

module.exports = VoteHandler;
