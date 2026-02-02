// initDB.js - Initialize MongoDB with sample data
const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

async function initDatabase() {
  try {
    await client.connect();
    const db = client.db("smartration");

    // Clear existing data
    await db.collection("rationcards").deleteMany({});
    await db.collection("products").deleteMany({});
    await db.collection("distributions").deleteMany({});

    // Insert sample ration cards
    const rationCards = [
      {
        cardNumber: "RC001",
        holderName: "John Doe",
        familyMembers: 4,
        address: "123 Main St, City",
        createdAt: new Date()
      },
      {
        cardNumber: "RC002",
        holderName: "Jane Smith",
        familyMembers: 3,
        address: "456 Oak Ave, City",
        createdAt: new Date()
      },
      {
        cardNumber: "RC003",
        holderName: "Robert Johnson",
        familyMembers: 5,
        address: "789 Pine Rd, City",
        createdAt: new Date()
      },
      {
        cardNumber: "RC004",
        holderName: "Maria Garcia",
        familyMembers: 2,
        address: "321 Elm St, City",
        createdAt: new Date()
      }
    ];

    // Insert sample products
    const products = [
      {
        name: "Rice",
        unit: "kg",
        quantityPerPerson: 5,
        fixed: false
      },
      {
        name: "Wheat Flour",
        unit: "kg",
        quantityPerPerson: 5,
        fixed: false
      },
      {
        name: "Sugar",
        unit: "kg",
        quantityPerPerson: 1,
        fixed: false
      },
      {
        name: "Salt",
        unit: "kg",
        quantityPerPerson: 0.5,
        fixed: false
      },
      {
        name: "Cooking Oil",
        unit: "litre",
        quantityPerPerson: 1,
        fixed: false
      },
      {
        name: "Kerosene",
        unit: "litre",
        quantityPerPerson: 1,
        fixed: true
      }
    ];

    const cardResult = await db.collection("rationcards").insertMany(rationCards);
    const productResult = await db.collection("products").insertMany(products);

    console.log("✅ Database initialized successfully!");
    console.log(`✅ Inserted ${cardResult.insertedCount} ration cards`);
    console.log(`✅ Inserted ${productResult.insertedCount} products`);
    console.log("\nSample Card Numbers: RC001, RC002, RC003, RC004");

  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await client.close();
  }
}

initDatabase();
