const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

const loginRouter = express.Router();

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const correctPassword = await bcrypt.compare(password, user.passwordHash);

      if (!correctPassword) {
        return done(null, false, { message: 'incorrect passsword.'});
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

loginRouter.get('/success', (request, response) => {
  console.log(request.user);
  response.send('Successful login!');
});

loginRouter.get('/failure', (request, response) => {
  response.send('Login failed!');
});

loginRouter.post('/',
  passport.authenticate('local', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    failureFlash: false,
  }));

module.exports = loginRouter;
