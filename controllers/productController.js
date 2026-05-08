const productService = require('../services/productService');

// Product Controller.
// Controllers only translate HTTP requests/responses. Product filtering rules
// live in ProductService and SQL lives in ProductRepository.
async function getProducts(req, res) {
    try {
        const products = await productService.getFilteredProducts(req.query.category);

        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error('Product Controller Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getProducts
};
