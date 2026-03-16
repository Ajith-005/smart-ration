const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function dedupeAndIndex() {
  try {
    await client.connect();
    const db = client.db('smartration');
    const coll = db.collection('distributions');

    console.log('Searching for duplicate cardNumber+month groups...');
    const groups = await coll.aggregate([
      { $group: { _id: { cardNumber: '$cardNumber', month: '$month' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log('Found', groups.length, 'duplicate groups');

    for (const g of groups) {
      const { cardNumber, month } = g._id;
      const docs = await coll.find({ cardNumber, month }).sort({ issuedAt: 1 }).toArray();
      // keep first (earliest), remove the rest
      const keep = docs.shift();
      const removeIds = docs.map(d => d._id);
      if (removeIds.length > 0) {
        const res = await coll.deleteMany({ _id: { $in: removeIds } });
        console.log(`Removed ${res.deletedCount} duplicate(s) for`, cardNumber, month);
      }
    }

    console.log('Creating unique index on { cardNumber:1, month:1 }');
    const idx = await coll.createIndex({ cardNumber: 1, month: 1 }, { unique: true, name: 'cardNumber_1_month_1' });
    console.log('Index created:', idx);
  } catch (err) {
    console.error('Error during dedupe/index:', err);
  } finally {
    await client.close();
  }
}

dedupeAndIndex();
