// Database configuration boundary.
// Repositories import this file instead of importing database.js directly.
// If the monolith is split later, this is the cut line where each service can
// receive its own database connection or remote data source.
module.exports = require('../database');
