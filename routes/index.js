const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');

const isUpdateRequired = (pastVal, currVal) => {
  // NOTE: pastVal is a number but currVal is a string, using == in js auto converts types

  if (pastVal == currVal) {
    return false;
  }

  if (pastVal == 0 || pastVal == null) {
    return true;
  }

  if (Math.abs(currVal - pastVal) / Math.abs(pastVal) >= 0.05) {
    return true;
  }
  return false;
};

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

    // NOTE: usr.stats.volume.at(-1).value is a number but volume is a string
    if (usr.stats.volume.length === 0 || isUpdateRequired(usr.stats.volume.at(-1).value, volume)) {
      console.log('Updating volume')
      usr.stats.volume.push({value: volume})
    }

    if (usr.stats.temperature.length === 0 || isUpdateRequired(usr.stats.temperature.at(-1).value, temperature)) {
      console.log('Updating temp')
      usr.stats.temperature.push({value: temperature})
    }

    if (usr.stats.battery.length === 0 || isUpdateRequired(usr.stats.battery.at(-1).value, battery)) {
      console.log('Updating battery')
      usr.stats.battery.push({value: battery})
    }

    usr.save().then(savedUsr => {
      return res.status(200).send('Succesfully updated.');
    });
  });
});

module.exports = router;
