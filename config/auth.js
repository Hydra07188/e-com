// Auth configuration boundary.
// Keeping secrets and token settings here prevents route/controller files from
// depending on environment details, which makes the Identity service easier to
// extract into its own microservice later.
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'dev_only_change_this_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
    saltRounds: 10,
    passwordRule: /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/
};
