const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function list() {
  try {
    await client.connect();
    const db = client.db('smartration');
    const dists = await db.collection('distributions').find().toArray();
    if (!dists || dists.length === 0) {
      console.log('No distributions found');
      return;
    }
    console.log(`Found ${dists.length} distributions:\n`);
    dists.forEach(d => {
      console.log({
        id: d._id.toString(),
        cardNumber: d.cardNumber,
        month: d.month,
        issuedAt: d.issuedAt,
        completed: !!d.completed,
        productsCount: Array.isArray(d.products) ? d.products.length : 0
      });
    });
  } catch (err) {
    console.error('Error listing distributions:', err);
  } finally {
    await client.close();
  }
}

list();
