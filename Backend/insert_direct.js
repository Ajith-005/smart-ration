const { MongoClient } = require('mongodb');
(async ()=>{
  const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(url);
  try{
    await client.connect();
    const db = client.db('smartration');
    const r = await db.collection('distributions').insertOne({cardNumber:'RC002',month:new Date().toISOString().slice(0,7),products:[{productName:'Rice',quantity:10,unit:'kg'}],issuedAt:new Date()});
    console.log('inserted', r.insertedId.toString());
  }catch(e){console.error(e)}finally{await client.close()}
})();
