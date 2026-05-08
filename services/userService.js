const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const userRepository = require('../repositories/userRepository');
const { toPublicUser } = require('../models/userModel');

// Identity/Auth Service boundary.
// Business rules for login/register/profile live here. Routes and controllers
// do not hash passwords, sign JWTs, or know where users are stored.
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
    return jwt.sign(
        {
            sub: String(user.id),
            email: user.email
        },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
    );
}

async function register({ email, password, firstName }) {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const normalizedFirstName = firstName ? firstName.trim() : '';

    if (!normalizedFirstName || !normalizedEmail || !password) {
        const error = new Error('Name, email, and password are required.');
        error.statusCode = 400;
        throw error;
    }

    if (!isValidEmail(normalizedEmail)) {
        const error = new Error('Please enter a valid email address.');
        error.statusCode = 400;
        throw error;
    }

    if (!authConfig.passwordRule.test(password)) {
        const error = new Error('Password must be at least 8 characters and include one uppercase letter and one symbol.');
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    const existingJsonUser = userRepository.existsInAuthJson(normalizedEmail);

    if (existingUser || existingJsonUser) {
        const error = new Error('Email is already registered.');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, authConfig.saltRounds);
    const registrationDate = new Date().toISOString();

    userRepository.appendAuthJsonUser({
        username: normalizedEmail,
        password: passwordHash,
        firstName: normalizedFirstName,
        registrationDate
    });

    const user = await userRepository.createUser({
        email: normalizedEmail,
        passwordHash,
        firstName: normalizedFirstName,
        registrationDate
    });

    return {
        message: 'Registration successful',
        token: signToken(user),
        user: toPublicUser(user)
    };
}

async function login({ email, password }) {
    if (!email || !password) {
        const error = new Error('Email and password are required.');
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    if (!user || !await bcrypt.compare(password, user.password)) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    return {
        message: 'Login successful',
        token: signToken(user),
        user: toPublicUser(user)
    };
}

async function getProfile(userId) {
    const user = await userRepository.findPublicById(userId);

    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }

    return { user: toPublicUser(user) };
}

module.exports = {
    register,
    login,
    getProfile
};
