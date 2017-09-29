// this is the main entry to the app module
// this exports a function that contains the custom routes for the frontend
// the app is an express instantiated app and passed to the exported function as an argument.

module.exports = app => {
  'use strict';
  app.route('/api/data').get((req, res) => {
    res.json({ name: 'Danny Mcwaves' });
  });
};
