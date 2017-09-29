// this is the configuration for the app.
// and by the app i mean express. this includes adding middlewares, setups, handlers
// and configurations that cane be made to the express object.

let path = require('path'),
  config = require(path.resolve('./config/config'));

// this exports a function that has an argument of the express app. it returns nothing.
// just modifies express with app.use
module.exports = app => {
  'use strict';

};
