'use strict';

// Load the module dependencies
let config = require('../config'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  cookieParser = require('cookie-parser'),
  passport = require('passport'),
  socketio = require('socket.io'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  spdy = require('spdy');

// Define the Socket.io configuration method
module.exports = function (app, db) {
  let server;
  if (config.secure && config.secure.ssl === true) {
    // Load SSL key and certificate
    let privateKey = fs.readFileSync(path.resolve(config.secure.privateKey), 'utf8');
    let certificate = fs.readFileSync(path.resolve(config.secure.certificate), 'utf8');

    let options = {
      key: privateKey, cert: certificate
    };

    // Create new HTTPS Server
    server = spdy.createServer(options, app);
  } else {
    let options = {
      key: fs.readFileSync(path.resolve(__dirname, '../sslcerts/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../sslcerts/cert.pem'))
    };
    // Create a new HTTP server
    server = spdy.createServer(options, app);
  }
  // Create a new Socket.io server
  let io = socketio.listen(server);

  // Create a MongoDB storage object
  let mongoStore = new MongoStore({
    db: db,
    collection: config.sessionCollection
  });

  // Intercept Socket.io's handshake request
  io.use(function (socket, next) {
    // Use the 'cookie-parser' module to parse the request cookies
    cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
      // Get the session id from the request cookies
      let sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessionKey] : undefined;

      if (!sessionId) return next(new Error('sessionId was not found in socket.request'), false);

      // Use the mongoStorage instance to get the Express session information
      mongoStore.get(sessionId, function (err, session) {
        if (err) return next(err, false);
        if (!session) return next(new Error('session was not found for ' + sessionId), false);

        // Set the Socket.io session information
        socket.request.session = session;

        // Use Passport to populate the user details
        passport.initialize()(socket.request, {}, function () {
          passport.session()(socket.request, {}, function () {
            if (socket.request.user) {
              next(null, true);
            } else {
              next(new Error('User is not authenticated'), false);
            }
          });
        });
      });
    });
  });

  // Add an event listener to the 'connection' event
  io.on('connection', function (socket) {
    config.files.server.sockets.forEach(function (socketConfiguration) {
      require(path.resolve(socketConfiguration))(io, socket);
    });
  });

  return server;
};
