const dotenv = require('dotenv');
dotenv.load();

const config = require('./configuration'),
  firebase = require('firebase');
fbc = require('./firebase-cleaner')(config, firebase);
fbc.clean();