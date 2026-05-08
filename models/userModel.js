// User model helpers.
// This file documents the safe user shape that leaves the Identity boundary.
// Controllers and services should not expose password hashes to the browser.
function toPublicUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        registrationDate: user.registrationDate
    };
}

module.exports = {
    toPublicUser
};
