const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');

router.post('/settings/display', ensureAuthenticated, (req, res) => {
  const { email, mode } = req.body;

  User.findOneAndUpdate({email: email}, {settings: {displayMode: mode}}, {new: true}, (err, usr) => {
    if (err) return res.send(500, {error: err});
    return res.status(200).send('Succesfully updated.');
  });
});

router.post('/stats', ensureAuthenticated, (req, res) => {
  const { email, volume, temperature, battery } = req.body;

  User.findOne({email: email}, (err, usr) => {
    if (err) return res.send(500, {error: err});
    
    usr.stats.temperature.push({value: temperature})
    usr.stats.battery.push({value: battery})
    usr.stats.volume.push({value: volume})
    usr.save().then(savedUsr => {
      return res.status(200).send('Succesfully updated.');
    });
  });
});

module.exports = router;
