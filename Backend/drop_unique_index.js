const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function dropIndex() {
  try {
    await client.connect();
    const db = client.db('smartration');
    const coll = db.collection('distributions');
    const indexes = await coll.indexes();
    console.log('Current indexes:', indexes);

    // Common index name observed in this DB may be '{ "cardNumber": 1, "month": 1 }_1'
    const exactName = '{ "cardNumber": 1, "month": 1 }_1';
    if (indexes.some(i => i.name === exactName)) {
      await coll.dropIndex(exactName);
      console.log('Dropped index:', exactName);
    }

    // As a fallback, drop any index that enforces uniqueness on cardNumber+month
    for (const idx of indexes) {
      if (idx.unique && idx.key && idx.key.cardNumber && idx.key.month) {
        await coll.dropIndex(idx.name);
        console.log('Dropped unique index:', idx.name);
      }
    }

    console.log('Index cleanup complete');
  } catch (err) {
    console.error('Error dropping indexes:', err);
  } finally {
    await client.close();
  }
}

dropIndex();
