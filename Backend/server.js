// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilioLib = require('twilio');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Admin credentials & JWT secret from env (with safe defaults)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// MongoDB connection
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
if (!process.env.MONGO_URL) {
  console.warn("MONGO_URL not set — using fallback:", url);
}
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

// ensure TTL index for otps collection (cleanup expired OTPs)
async function ensureOtpIndex() {
  try {
    const col = client.db('smartration').collection('otps');
    // expireAt field will be a Date; TTL index will remove docs after expireAt
    await col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✅ OTP TTL index ensured');
  } catch (err) {
    console.error('Failed to ensure OTP TTL index', err);
  }
}
ensureOtpIndex();

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
    // Try to insert directly and rely on the unique index to prevent duplicates.
    try {
      const insertResult = await db.collection("distributions").insertOne({
        cardNumber,
        month,
        products,
        issuedAt: new Date()
      });
      console.log('Ration issued', { id: insertResult.insertedId.toString(), cardNumber, month });
      return res.json({ message: "Ration issued successfully", id: insertResult.insertedId.toString() });
    } catch (insertErr) {
      if (insertErr && insertErr.code === 11000) {
        console.warn('Duplicate distribution prevented (11000) for', { cardNumber, month });
        return res.status(400).json({ message: "Ration already issued for this month" });
      }
      console.error('Insert error', insertErr && insertErr.stack ? insertErr.stack : insertErr);
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    console.error('Unexpected error in /api/issue-ration', err && err.stack ? err.stack : err);
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

// --- Admin: products and shops management ---
// Protected routes require valid admin JWT
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// List products
app.get('/api/products', requireAdmin, async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    res.json(products.map(p => ({ id: p._id.toString(), ...p })));
  } catch (err) {
    console.error('GET /api/products', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new product
app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, unit, quantityPerPerson, fixed } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Product name is required' });
  try {
    const doc = {
      name,
      unit: unit || '',
      quantityPerPerson: Number(quantityPerPerson) || 0,
      fixed: !!fixed
    };
    const result = await db.collection('products').insertOne(doc);
    res.json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    console.error('POST /api/products', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
app.patch('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  try {
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Product not found' });
    res.json({ id: result.value._id.toString(), ...result.value });
  } catch (err) {
    console.error('PATCH /api/products/:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List shops
app.get('/api/shops', requireAdmin, async (req, res) => {
  try {
    const shops = await db.collection('shops').find().toArray();
    res.json(shops.map(s => ({ id: s._id.toString(), ...s })));
  } catch (err) {
    console.error('GET /api/shops', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shops that carry a specific product and the product entry in each shop
app.get('/api/products/:id/shops', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Expect shops documents to have an `inventory` array with { productId, price, stock }
    const objId = new ObjectId(id);
    const shops = await db.collection('shops').find({ 'inventory.productId': id }).toArray();
    // Fallback: also try matching by ObjectId within inventory
    if (!shops.length) {
      const shops2 = await db.collection('shops').find({ 'inventory.productId': objId }).toArray();
      return res.json(shops2.map(s => ({ id: s._id.toString(), ...s })));
    }
    res.json(shops.map(s => ({ id: s._id.toString(), ...s })));
  } catch (err) {
    console.error('GET /api/products/:id/shops', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a product entry inside a shop's inventory
app.patch('/api/shops/:shopId/products/:productId', requireAdmin, async (req, res) => {
  const { shopId, productId } = req.params;
  const updates = req.body || {};
  try {
    // Build positional update for matching inventory item
    const filter = { _id: new ObjectId(shopId), 'inventory.productId': productId };
    const setObj = {};
    Object.keys(updates).forEach(k => { setObj[`inventory.$.${k}`] = updates[k]; });
    const result = await db.collection('shops').findOneAndUpdate(filter, { $set: setObj }, { returnDocument: 'after' });
    if (!result.value) return res.status(404).json({ message: 'Shop or product entry not found' });
    res.json({ id: result.value._id.toString(), ...result.value });
  } catch (err) {
    console.error('PATCH /api/shops/:shopId/products/:productId', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Contact form endpoint - sends an email to configured recipient using SMTP env vars
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, topic, message } = req.body || {};
  if (!name || !email || !topic || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const MAIL_TO = process.env.MAIL_TO || ADMIN_EMAIL;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS');
    return res.status(500).json({ message: 'Email transport not configured on server' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT || 587,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const mailOptions = {
      from: SMTP_USER,
      to: MAIL_TO,
      replyTo: email,
      subject: `[Contact] ${topic} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nTopic: ${topic}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || '-'}</p>
             <p><strong>Topic:</strong> ${topic}</p>
             <hr />
             <p>${message.replace(/\n/g, '<br/>')}</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error('Failed to send contact email', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Helper to send SMS via Twilio (if configured) or log as fallback
async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (accountSid && authToken && from) {
    try {
      const clientTw = twilioLib(accountSid, authToken);
      await clientTw.messages.create({ body, from, to });
      return { success: true };
    } catch (err) {
      console.error('Twilio send error', err);
      // If developer has explicitly enabled fallback, log and treat as success
      if (process.env.TWILIO_FALLBACK === 'true') {
        console.log('TWILIO_FALLBACK enabled — falling back to logging SMS instead of sending');
        console.log(`SMS to ${to}: ${body}`);
        return { success: true, fallback: true, error: err };
      }
      return { success: false, error: err };
    }
  }
  // fallback: log message
  console.log(`SMS to ${to}: ${body}`);
  return { success: true, fallback: true };
}

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to phone and store in otps collection
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });
  try {
    const code = generateOtp();
    const now = new Date();
    const expireAt = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes
    await db.collection('otps').insertOne({ phone, code, createdAt: now, expireAt, used: false });
    const sms = `Your verification code is ${code}. It expires in 5 minutes.`;
    const sent = await sendSms(phone, sms);
    if (!sent.success) return res.status(500).json({ message: 'Failed to send OTP' });
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('POST /api/send-otp', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and optionally register/update user/card
app.post('/api/verify-otp', async (req, res) => {
  const { phone, code, cardNumber } = req.body || {};
  // allow clients to explicitly force updating card mobile when they control the phone
  const rawForce = (req.body && req.body.force);
  const force = rawForce === true || rawForce === 'true' || rawForce === '1';
  if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });
  try {
    // find OTP
    const otp = await db.collection('otps').findOne({ phone, code, used: false });
    if (!otp) return res.status(400).json({ message: 'Invalid or expired code' });
    if (otp.expireAt && otp.expireAt < new Date()) return res.status(400).json({ message: 'Code expired' });
    // mark used
    await db.collection('otps').updateOne({ _id: otp._id }, { $set: { used: true } });

    // if cardNumber provided, link phone to rationcards if matching or empty
    if (cardNumber) {
      const card = await db.collection('rationcards').findOne({ cardNumber });
      if (!card) return res.status(404).json({ message: 'Card not found' });
      // if card.mobile exists and differs, reject
        // Normalize phone comparison: compare last 10 digits to allow different country code formats
        const digits = (s) => (s || '').toString().replace(/\D/g, '');
        const lastN = (s, n = 10) => { const d = digits(s); return d.slice(-n); };
        if (card.mobile) {
          if (lastN(card.mobile) !== lastN(phone)) {
            if (force) {
              // user proved control of the provided phone by verifying the OTP — update the card
              await db.collection('rationcards').updateOne({ _id: card._id }, { $set: { mobile: phone } });
              console.log('Card mobile updated via force verify', { cardNumber, phone });
            } else {
              return res.status(400).json({ message: 'Phone does not match card records' });
            }
          }
        }
      // update mobile if missing
      if (!card.mobile) {
        await db.collection('rationcards').updateOne({ _id: card._id }, { $set: { mobile: phone } });
      }
    }

    // send confirmation SMS
    await sendSms(phone, 'Verification successful. Your registration is complete.');
    res.json({ message: 'Verified' });
  } catch (err) {
    console.error('POST /api/verify-otp', err);
    res.status(500).json({ message: 'Server error' });
  }
});
