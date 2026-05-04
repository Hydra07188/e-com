const dbPromise = require('../database');

exports.getFilteredProducts = async (categoryQuery) => {
    const db = await dbPromise;
    const category = categoryQuery ? categoryQuery.trim() : '';

    if (!category || category.toLowerCase() === 'all') {
        return db.all('SELECT * FROM products ORDER BY id ASC');
    }

    return db.all(
        'SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY id ASC',
        [category]
    );
};
