// the controller just as the name suggests contains exported functions and objects that controls the routes and
// the configurations. the functions could be requestHandlers, config middlewares.
// it should be any functionality you need that does not express need to depend on express and can be imported.

let path = require('path'),
  config = require(path.resolve('./config/config'));
