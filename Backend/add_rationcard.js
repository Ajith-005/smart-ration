// add_rationcard.js
// Usage: node add_rationcard.js <cardNumber> <holderName> <mobile> <familyMembers>
require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: node add_rationcard.js <cardNumber> <holderName> <mobile> <familyMembers>');
    process.exit(2);
  }
  const [cardNumber, holderName, mobile, familyMembersRaw] = args;
  const familyMembers = parseInt(familyMembersRaw, 10) || 1;

  try {
    await client.connect();
    const db = client.db('smartration');
    const coll = db.collection('rationcards');

    const existing = await coll.findOne({ cardNumber });
    if (existing) {
      console.log('Card already exists:', existing.cardNumber);
      console.log(existing);
      return process.exit(0);
    }

    const doc = {
      cardNumber,
      holderName,
      mobile,
      familyMembers,
      createdAt: new Date()
    };

    const r = await coll.insertOne(doc);
    console.log('Inserted ration card with id', r.insertedId.toString());
    console.log(doc);
    process.exit(0);
  } catch (err) {
    console.error('Failed to insert ration card', err);
    process.exit(1);
  } finally {
    try { await client.close(); } catch (e) {}
  }
}

main();
