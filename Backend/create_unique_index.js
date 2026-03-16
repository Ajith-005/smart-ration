const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function createIndex() {
  try {
    await client.connect();
    const db = client.db('smartration');
    const coll = db.collection('distributions');
    const idx = await coll.createIndex({ cardNumber: 1, month: 1 }, { unique: true, name: 'cardNumber_1_month_1' });
    console.log('Created index:', idx);
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    await client.close();
  }
}

createIndex();
