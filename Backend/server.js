// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
let sendgrid = null;
try { sendgrid = require('@sendgrid/mail'); } catch (e) { /* optional */ }
const twilioLib = require('twilio');

const app = express();

// ─────────────────────────────────────────
// CORS — permanent, stable solution
// Allows: production Vercel URL + any localhost port (always, no NODE_ENV check)
// To add more origins, comma-separate them in FRONTEND_ORIGIN env var:
//   FRONTEND_ORIGIN=https://smart-ration-two.vercel.app,https://staging.vercel.app
// ─────────────────────────────────────────
const rawAllowed = process.env.FRONTEND_ORIGIN || 'https://smart-ration-two.vercel.app';
const ALLOWED_ORIGINS = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // No origin = curl / server-to-server / Postman — always allow
    if (!origin) return callback(null, true);
    // Allow any configured production origin
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Always allow localhost on any port — for local dev without NODE_ENV tricks
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight for all routes
app.options('*', cors());

app.use(express.json());

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const JWT_SECRET     = process.env.JWT_SECRET     || "change_this_secret";

// ─────────────────────────────────────────
// MongoDB
// ─────────────────────────────────────────
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
if (!process.env.MONGO_URL) console.warn("⚠️  MONGO_URL not set — using local fallback");

const client = new MongoClient(url);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("smartration");
    console.log("✅ MongoDB connected");
    // Ensure TTL index for OTPs
    await client.db('smartration').collection('otps')
      .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    console.log("✅ OTP TTL index ensured");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}
connectDB();

// ─────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    jwt.verify(auth.split(' ')[1], JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ─────────────────────────────────────────
// SMS helper (Twilio or console fallback)
// ─────────────────────────────────────────
async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_FROM;
  if (accountSid && authToken && from) {
    try {
      await twilioLib(accountSid, authToken).messages.create({ body, from, to });
      return { success: true };
    } catch (err) {
      console.error('Twilio error', err.message);
      if (process.env.TWILIO_FALLBACK === 'true') {
        console.log(`[SMS FALLBACK] to=${to}: ${body}`);
        return { success: true, fallback: true };
      }
      return { success: false, error: err };
    }
  }
  console.log(`[SMS LOG] to=${to}: ${body}`);
  return { success: true, fallback: true };
}

// ─────────────────────────────────────────
// ── ROUTES ──
// All routes MUST be defined before app.listen()
// ─────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Ration card search ──
app.get("/api/ration/search/:cardNumber", async (req, res) => {
  const { cardNumber } = req.params;
  if (!cardNumber) return res.status(400).json({ message: "Card number is required" });
  try {
    const card = await db.collection("rationcards").findOne({ cardNumber });
    if (!card) return res.status(404).json({ message: "Card not found" });
    const products = await db.collection("products").find().toArray();
    res.json({
      cardNumber: card.cardNumber,
      name: card.holderName,
      familyMembers: card.familyMembers,
      products: products.map(p => ({
        productName: p.name,
        unit: p.unit,
        quantity: p.fixed ? p.quantityPerPerson : p.quantityPerPerson * card.familyMembers
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Debug ──
app.get("/api/debug", async (req, res) => {
  try {
    const all = await db.collection("rationcards").find().toArray();
    res.json({ count: all.length, cards: all.map(c => c.cardNumber) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Check card ──
app.post("/api/check-card", async (req, res) => {
  const { cardNumber } = req.body;
  if (!cardNumber) return res.status(400).json({ message: "Card number is required" });
  try {
    const card = await db.collection("rationcards").findOne({ cardNumber });
    if (!card) return res.status(404).json({ message: "Card not found" });
    const products = await db.collection("products").find().toArray();
    res.json({
      cardNumber: card.cardNumber,
      holderName: card.holderName,
      familyMembers: card.familyMembers,
      products: products.map(p => ({
        name: p.name,
        unit: p.unit,
        quantity: p.fixed ? p.quantityPerPerson : p.quantityPerPerson * card.familyMembers
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Issue ration ──
app.post("/api/issue-ration", async (req, res) => {
  const rawCard  = req.body && req.body.cardNumber;
  const products = req.body && req.body.products;
  const cardNumber = typeof rawCard === 'string' ? rawCard.trim() : rawCard;
  if (!cardNumber || !Array.isArray(products) || products.length === 0)
    return res.status(400).json({ message: "Card number and products are required" });

  const month = new Date().toISOString().slice(0, 7);
  try {
    const insertResult = await db.collection("distributions").insertOne({
      cardNumber, month, products, issuedAt: new Date()
    });
    return res.json({ message: "Ration issued successfully", id: insertResult.insertedId.toString() });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Ration already issued for this month" });
    console.error('Issue-ration error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Distributions ──
app.get("/api/distributions", requireAdmin, async (req, res) => {
  try {
    const distributions = await db.collection("distributions").find().toArray();
    res.json(distributions.map(d => ({
      id: d._id.toString(),
      cardNumber: d.cardNumber,
      month: d.month,
      products: d.products,
      issuedAt: d.issuedAt,
      completed: !!d.completed
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch('/api/distributions/:id/complete', requireAdmin, async (req, res) => {
  try {
    const result = await db.collection('distributions').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { completed: true } },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Distribution not found' });
    const d = result.value;
    res.json({ id: d._id.toString(), cardNumber: d.cardNumber, month: d.month, completed: !!d.completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/distributions/:id/uncomplete', requireAdmin, async (req, res) => {
  try {
    const result = await db.collection('distributions').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { completed: false } },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Distribution not found' });
    const d = result.value;
    res.json({ id: d._id.toString(), cardNumber: d.cardNumber, month: d.month, completed: !!d.completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin login ──
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid admin credentials' });
});

// ── Products ──
app.get('/api/products', requireAdmin, async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    res.json(products.map(p => ({ id: p._id.toString(), ...p })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, unit, quantityPerPerson, fixed } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Product name is required' });
  try {
    const doc = { name, unit: unit || '', quantityPerPerson: Number(quantityPerPerson) || 0, fixed: !!fixed };
    const result = await db.collection('products').insertOne(doc);
    res.json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body || {} },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Product not found' });
    res.json({ id: result.value._id.toString(), ...result.value });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Shops ──
app.get('/api/shops', requireAdmin, async (req, res) => {
  try {
    const shops = await db.collection('shops').find().toArray();
    res.json(shops.map(s => ({ id: s._id.toString(), ...s })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/:id/shops', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let shops = await db.collection('shops').find({ 'inventory.productId': id }).toArray();
    if (!shops.length)
      shops = await db.collection('shops').find({ 'inventory.productId': new ObjectId(id) }).toArray();
    res.json(shops.map(s => ({ id: s._id.toString(), ...s })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/shops/:shopId/products/:productId', requireAdmin, async (req, res) => {
  try {
    const { shopId, productId } = req.params;
    const setObj = {};
    Object.keys(req.body || {}).forEach(k => { setObj[`inventory.$.${k}`] = req.body[k]; });
    const result = await db.collection('shops').findOneAndUpdate(
      { _id: new ObjectId(shopId), 'inventory.productId': productId },
      { $set: setObj },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ message: 'Shop or product not found' });
    res.json({ id: result.value._id.toString(), ...result.value });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Contact form ──
// Priority: SMTP → SendGrid → MongoDB fallback (form NEVER returns 500 due to missing email config)
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, topic, message } = req.body || {};
  if (!name || !email || !topic || !message)
    return res.status(400).json({ message: 'Missing required fields' });

  const SMTP_HOST  = process.env.SMTP_HOST;
  const SMTP_PORT  = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const SMTP_USER  = process.env.SMTP_USER;
  const SMTP_PASS  = process.env.SMTP_PASS;
  const MAIL_TO    = process.env.MAIL_TO || ADMIN_EMAIL;
  const htmlBody   = `<p><strong>Name:</strong> ${name}</p>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Phone:</strong> ${phone || '-'}</p>
                      <p><strong>Topic:</strong> ${topic}</p>
                      <hr/>
                      <p>${message.replace(/\n/g, '<br/>')}</p>`;
  const textBody   = `Name: ${name}\nEmail: ${email}\nPhone: ${phone||'-'}\nTopic: ${topic}\n\n${message}`;
  const subject    = `[Contact] ${topic} — ${name}`;

  // 1. Try SMTP
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      });
      await transporter.sendMail({ from: SMTP_USER, to: MAIL_TO, replyTo: email, subject, text: textBody, html: htmlBody });
      console.log('✅ Contact email sent via SMTP');
      return res.json({ message: 'Message sent' });
    } catch (err) {
      console.error('SMTP failed:', err.message);
      // fall through to MongoDB
    }
  }

  // 2. Try SendGrid
  if (process.env.SENDGRID_API_KEY && sendgrid) {
    try {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      await sendgrid.send({ to: MAIL_TO, from: SMTP_USER || `no-reply@${process.env.DOMAIN || 'localhost'}`, subject, text: textBody, html: htmlBody });
      console.log('✅ Contact email sent via SendGrid');
      return res.json({ message: 'Message sent' });
    } catch (err) {
      console.error('SendGrid failed:', err.message);
      // fall through to MongoDB
    }
  }

  // 3. MongoDB fallback — always succeeds so form is never broken
  try {
    await db.collection('contacts').insertOne({
      name, email, phone: phone || null, topic, message, submittedAt: new Date()
    });
    console.warn('⚠️  No email transport — contact saved to MongoDB (contacts collection)');
    return res.json({ message: 'Message received' });
  } catch (dbErr) {
    console.error('MongoDB contact save failed:', dbErr);
    return res.status(500).json({ message: 'Failed to process your message. Please try again.' });
  }
});

// ── OTP ──
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });
  try {
    const code     = Math.floor(100000 + Math.random() * 900000).toString();
    const now      = new Date();
    const expireAt = new Date(now.getTime() + 5 * 60 * 1000);
    await db.collection('otps').insertOne({ phone, code, createdAt: now, expireAt, used: false });
    const sent = await sendSms(phone, `Your verification code is ${code}. It expires in 5 minutes.`);
    if (!sent.success) return res.status(500).json({ message: 'Failed to send OTP' });
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { phone, code, cardNumber } = req.body || {};
  const force = req.body && (req.body.force === true || req.body.force === 'true' || req.body.force === '1');
  if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });
  try {
    const otp = await db.collection('otps').findOne({ phone, code, used: false });
    if (!otp) return res.status(400).json({ message: 'Invalid or expired code' });
    if (otp.expireAt < new Date()) return res.status(400).json({ message: 'Code expired' });
    await db.collection('otps').updateOne({ _id: otp._id }, { $set: { used: true } });

    if (cardNumber) {
      const card = await db.collection('rationcards').findOne({ cardNumber });
      if (!card) return res.status(404).json({ message: 'Card not found' });
      const lastN = (s) => (s || '').toString().replace(/\D/g, '').slice(-10);
      if (card.mobile && lastN(card.mobile) !== lastN(phone)) {
        if (!force) return res.status(400).json({ message: 'Phone does not match card records' });
        await db.collection('rationcards').updateOne({ _id: card._id }, { $set: { mobile: phone } });
      }
      if (!card.mobile)
        await db.collection('rationcards').updateOne({ _id: card._id }, { $set: { mobile: phone } });
    }

    await sendSms(phone, 'Verification successful. Your registration is complete.');
    res.json({ message: 'Verified' });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────
// START SERVER — always last
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));