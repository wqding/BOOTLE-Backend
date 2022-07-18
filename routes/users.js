const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({error: 'Please enter all fields'}).send()
  }

  User.findOne({ email: email }).then(user => {
    if (user) {
      res.status(400).json({error: 'Email already exists'}).send();
    } else {
      const newUser = new User({
        name,
        email,
        password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              res.status(200).json(user);
            })
            .catch(err => {
              console.log(err)
              res.status(400).json({error: err}).send();
            });
        });
      });
    }
  });
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', 
  (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) { 
      return res.status(300).send("not user"); 
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.status(400).send();
      }
      return res.status(200).json(user);
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).send();
});

module.exports = router;
