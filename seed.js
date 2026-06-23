require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Product = require('./models/Product');

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Beauty', 'Grocery'];

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000; 

function generateProduct(index) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const price = parseFloat((Math.random() * 1000).toFixed(2));
  
  return {
    name: `Product ${index}`,
    category: category,
    price: price,
  };
} 

async function seedDatabase() {
  await connectDB();

  console.log('Clearing existing products...');
  await Product.deleteMany({});

  console.log(`Generating and inserting ${TOTAL_PRODUCTS} products...`);

  for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
    const batch = [];
    
    for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL_PRODUCTS; j++) {
      batch.push(generateProduct(i + j));
    }

    await Product.insertMany(batch);
    console.log(`Inserted ${i + batch.length} / ${TOTAL_PRODUCTS}`);
  }

  console.log('Seeding complete!');
  mongoose.connection.close();
}

seedDatabase(); 