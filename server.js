require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
  res.send('CodeVector Task API is running');
});

app.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { category, cursor } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    if (cursor) {
      const underscoreIndex = cursor.indexOf('_');
      const cursorDate = cursor.substring(0, underscoreIndex);
      const cursorId = cursor.substring(underscoreIndex + 1);
      
      filter.$or = [
        { created_at: { $lt: new Date(cursorDate) } },
        {
          created_at: new Date(cursorDate),
          _id: { $lt: cursorId }
        }
      ];
    }

    const products = await Product.find(filter)
      .sort({ created_at: -1, _id: -1 })
      .limit(limit);

    let nextCursor = null;
    if (products.length === limit) {
      const lastProduct = products[products.length - 1];
      nextCursor = `${lastProduct.created_at.toISOString()}_${lastProduct._id}`;
    }

    res.json({
      data: products,
      nextCursor: nextCursor
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 