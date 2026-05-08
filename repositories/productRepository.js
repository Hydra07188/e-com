const dbPromise = require('../config/database');

// Product Repository.
// All Product Catalog SQL belongs here. Product routes/controllers/services can
// keep working even if Identity/Auth is disabled because this repository has no
// dependency on user modules.
async function findAll() {
    const db = await dbPromise;
    return db.all('SELECT * FROM Products ORDER BY id ASC');
}

async function findByCategory(category) {
    const db = await dbPromise;
    return db.all(
        'SELECT * FROM Products WHERE LOWER(category) = LOWER(?) ORDER BY id ASC',
        [category]
    );
}

async function findById(id) {
    const db = await dbPromise;
    return db.get('SELECT id, title, price FROM Products WHERE id = ?', [id]);
}

module.exports = {
    findAll,
    findByCategory,
    findById
};
