const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// load idea model
const User = require('../models/User');

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', (req, res) => {
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Password do not match' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters' });
  }
  if (!req.body.name) {
    errors.push({ text: 'Name is required' });
  }
  if (!req.body.email) {
    errors.push({ text: 'Email is required' });
  }
  if (!req.body.password) {
    errors.push({ text: 'Password is required' });
  }
  if (!req.body.password2) {
    errors.push({ text: 'Confirm Password is required' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2,
    });
  } else {
    const { name, email, password } = req.body;

    User.findOne({ email: email })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered');
          res.redirect('/users/register');
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

              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can login');
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;