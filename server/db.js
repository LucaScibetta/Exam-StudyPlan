'use strict';

const sqlite = require('sqlite3');

// open the database
exports.db = new sqlite.Database('studyPlan.db', (err) => {
  if (err) throw err;
});