// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Admin credentials & JWT secret from env (with safe defaults)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// MongoDB connection
const url = process.env.MONGO_URL;
const client = new MongoClient(url);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("smartration");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Exit if DB connection fails
  }
}
connectDB();

// Routes

// Search ration card by card number (GET endpoint for frontend)
app.get("/api/ration/search/:cardNumber", async (req, res) => {
  const { cardNumber } = req.params;
  if (!cardNumber) return res.status(400).json({ message: "Card number is required" });

  try {
    const card = await db.collection("rationcards").findOne({ cardNumber });
    if (!card) return res.status(404).json({ message: "Card not found" });

    const products = await db.collection("products").find().toArray();

    const calculatedProducts = products.map(p => ({
      productName: p.name,
      unit: p.unit,
      quantity: p.fixed ? p.quantityPerPerson : p.quantityPerPerson * card.familyMembers
    }));

    res.json({
      cardNumber: card.cardNumber,
      name: card.holderName,
      familyMembers: card.familyMembers,
      products: calculatedProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Check ration card and get products
app.post("/api/check-card", async (req, res) => {
  const { cardNumber } = req.body;
  if (!cardNumber) return res.status(400).json({ message: "Card number is required" });

  try {
    const card = await db.collection("rationcards").findOne({ cardNumber });
    if (!card) return res.status(404).json({ message: "Card not found" });

    const products = await db.collection("products").find().toArray();

    const calculatedProducts = products.map(p => ({
      name: p.name,
      unit: p.unit,
      quantity: p.fixed ? p.quantityPerPerson : p.quantityPerPerson * card.familyMembers
    }));

    res.json({
      cardNumber: card.cardNumber,
      holderName: card.holderName,
      familyMembers: card.familyMembers,
      products: calculatedProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Issue ration for a card
app.post("/api/issue-ration", async (req, res) => {
  const rawCard = req.body && req.body.cardNumber;
  const products = req.body && req.body.products;
  const cardNumber = typeof rawCard === 'string' ? rawCard.trim() : rawCard;

  if (!cardNumber || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Card number and products are required" });
  }

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM format

  // Log incoming request for debugging duplicate issues
  console.log('Issue-ration request', { cardNumber, productsLength: Array.isArray(products) ? products.length : 0, month, typeofCard: typeof cardNumber });

  try {
    // Check if ration already issued for this month
    const existing = await db.collection("distributions").findOne({ cardNumber: { $eq: cardNumber }, month });
    if (existing) {
      return res.status(400).json({ message: "Ration already issued for this month" });
    }

    try {
      const insertResult = await db.collection("distributions").insertOne({
        cardNumber,
        month,
        products,
        issuedAt: new Date()
      });
      console.log('Ration issued', { id: insertResult.insertedId.toString(), cardNumber, month });
      res.json({ message: "Ration issued successfully", id: insertResult.insertedId.toString() });
    } catch (insertErr) {
      // Handle race-condition duplicate-key (unique index) gracefully
      if (insertErr && insertErr.code === 11000) {
        console.warn('Duplicate distribution prevented (11000) for', { cardNumber, month });
        return res.status(400).json({ message: "Ration already issued for this month" });
      }
      throw insertErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all issued rations (optional, for admin use)
app.get("/api/distributions", async (req, res) => {
  // Protected: require valid admin JWT in Authorization header
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const distributions = await db.collection("distributions").find().toArray();
    const out = distributions.map(d => ({
      id: d._id.toString(),
      cardNumber: d.cardNumber,
      month: d.month,
      products: d.products,
      issuedAt: d.issuedAt,
      completed: !!d.completed
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a distribution as completed (collection confirmed)
app.patch('/api/distributions/:id/complete', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    const result = await db.collection('distributions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { completed: true } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ message: 'Distribution not found' });

    const d = result.value;
    res.json({ id: d._id.toString(), cardNumber: d.cardNumber, month: d.month, products: d.products, issuedAt: d.issuedAt, completed: !!d.completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unmark a distribution as completed (restore if marked by mistake)
app.patch('/api/distributions/:id/uncomplete', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Invalid id' });

  try {
    const result = await db.collection('distributions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { completed: false } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ message: 'Distribution not found' });

    const d = result.value;
    console.log('Distribution unmarked completed', { id: d._id.toString(), cardNumber: d.cardNumber, month: d.month });
    res.json({ id: d._id.toString(), cardNumber: d.cardNumber, month: d.month, completed: !!d.completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login endpoint - returns a JWT on success
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  // In a real app, check hashed passwords in DB. Here we compare to env-configured creds.
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid admin credentials' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
