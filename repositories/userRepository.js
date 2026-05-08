const fs = require('fs');
const path = require('path');
const dbPromise = require('../config/database');

const AUTH_USER_FILE = path.join(__dirname, '..', 'auth_user.json');

// User Repository.
// This is the only layer that knows whether user data lives in SQLite, JSON, or
// later a remote Identity Service database. Services call this repository
// instead of writing SQL or fs logic directly.
function readAuthUsers() {
    if (!fs.existsSync(AUTH_USER_FILE)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(AUTH_USER_FILE, 'utf8'));
}

function writeAuthUsers(users) {
    fs.writeFileSync(AUTH_USER_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

async function findByEmail(email) {
    const db = await dbPromise;
    return db.get('SELECT * FROM Users WHERE email = ?', [email]);
}

async function findPublicById(id) {
    const db = await dbPromise;
    return db.get('SELECT id, email, firstName, registrationDate FROM Users WHERE id = ?', [id]);
}

async function createUser({ email, passwordHash, firstName, registrationDate }) {
    const db = await dbPromise;
    const result = await db.run(
        'INSERT INTO Users (email, password, firstName, registrationDate) VALUES (?, ?, ?, ?)',
        [email, passwordHash, firstName, registrationDate]
    );

    return findPublicById(result.lastID);
}

async function getOrCreateGuestUser({ email, firstName }) {
    const existingUser = await findByEmail(email);

    if (existingUser) {
        return existingUser.id;
    }

    const db = await dbPromise;
    const result = await db.run(
        'INSERT INTO Users (email, password, firstName, registrationDate) VALUES (?, ?, ?, ?)',
        [email, 'CHECKOUT_GUEST', firstName, new Date().toISOString()]
    );

    return result.lastID;
}

function existsInAuthJson(email) {
    return readAuthUsers().some((user) => user.username.toLowerCase() === email);
}

function appendAuthJsonUser(user) {
    const authUsers = readAuthUsers();
    authUsers.push(user);
    writeAuthUsers(authUsers);
}

module.exports = {
    findByEmail,
    findPublicById,
    createUser,
    getOrCreateGuestUser,
    existsInAuthJson,
    appendAuthJsonUser
};
