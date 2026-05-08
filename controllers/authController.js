const userService = require('../services/userService');

// Auth Controller.
// Controllers only translate HTTP requests/responses. They do not contain SQL,
// hashing, JWT signing, or persistence logic.
async function register(req, res, next) {
    try {
        const result = await userService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const result = await userService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function me(req, res, next) {
    try {
        const result = await userService.getProfile(req.auth.sub);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    me
};
