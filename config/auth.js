const env = require('./env');

module.exports = {
    jwtSecret: env.jwtSecret,
    jwtExpiresIn: env.jwtExpiresIn,
    saltRounds: 10,
    passwordRule: /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/
};
