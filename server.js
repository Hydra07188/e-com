const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const checkoutRoutes = require('./routes/checkout');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
