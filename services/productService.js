const productRepository = require('../repositories/productRepository');

// Product Catalog Service boundary.
// Product business rules live here. This module is deliberately independent
// from Auth/User so guests can browse products even if Identity is unavailable.
exports.getFilteredProducts = async (categoryQuery) => {
    const category = categoryQuery ? categoryQuery.trim() : '';

    if (!category || category.toLowerCase() === 'all') {
        return productRepository.findAll();
    }

    return productRepository.findByCategory(category);
};
