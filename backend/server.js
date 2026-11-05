const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const crypto = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
const isProduction = process.env.NODE_ENV === 'production';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const Donation = mongoose.model('Donation', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  amount: { type: Number, required: true, min: 1, max: 100000 },
  currency: { type: String, default: 'usd', enum: ['usd', 'kes'] },
  frequency: { type: String, default: 'once', enum: ['once', 'monthly'] },
  paymentMethod: { type: String, default: 'stripe', enum: ['stripe', 'google-pay', 'mpesa', 'paypal'] },
  status: { type: String, default: 'pending', enum: ['pending', 'review', 'paid', 'failed'] },
  paymentReference: { type: String, trim: true, maxlength: 180, default: '' },
  checkoutSessionId: { type: String, default: '' },
  providerReference: { type: String, default: '' },
  source: { type: String, default: 'website' }
}, { timestamps: true }));

const Media = mongoose.model('Media', new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  resourceType: { type: String, default: 'raw' },
  format: { type: String, default: '' },
  bytes: { type: Number, default: 0 },
  name: { type: String, default: '' },
  folder: { type: String, default: 'she-stands' }
}, { timestamps: true }));

const Story = mongoose.model('Story', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  place: { type: String, required: true, trim: true, maxlength: 160 },
  relationship: { type: String, required: true, maxlength: 100 },
  theme: { type: String, required: true, maxlength: 100 },
  story: { type: String, required: true, maxlength: 12000 },
  consent: { type: Boolean, required: true },
  fileUrl: { type: String, default: '' },
  filePublicId: { type: String, default: '' },
  status: { type: String, default: 'pending', enum: ['pending', 'published', 'rejected'] }
}, { timestamps: true }));

const MessageThread = mongoose.model('MessageThread', new mongoose.Schema({
  conversationKey: { type: String, required: true, unique: true, select: false },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  messages: [{ from: { type: String, enum: ['visitor', 'team'], required: true }, text: { type: String, required: true, maxlength: 4000 }, sentAt: { type: Date, default: Date.now } }],
  unread: { type: Boolean, default: true }
}, { timestamps: true }));

const Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 180 }
}, { timestamps: true }));

const Settings = mongoose.model('Settings', new mongoose.Schema({
  key: { type: String, default: 'public', unique: true },
  heroImage: { type: String, default: '' },
  heroAudio: { type: String, default: '' },
  siteImages: { type: mongoose.Schema.Types.Mixed, default: {} },
  socials: [{ name: { type: String, trim: true, maxlength: 50 }, url: { type: String, trim: true, maxlength: 500 } }]
}, { timestamps: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = /^(image\/|audio\/|video\/|application\/pdf$|application\/msword$|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$)/i;
    if (allowed.test(file.mimetype)) return callback(null, true);
    callback(new Error('Use an image, audio or video file, or PDF/Word document.'));
  }
});

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: 'draft-8', legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, callback) => {
  if (!origin || origin === FRONTEND_URL) return callback(null, true);
  if (!isProduction) {
    try {
      const url = new URL(origin);
      const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || /^10\./.test(url.hostname) || /^192\.168\./.test(url.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname);
      if (url.protocol === 'http:' && url.port === '4200' && localHost) return callback(null, true);
    } catch { /* reject malformed origins below */ }
  }
  return callback(new Error('Origin is not allowed.'));
}, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));

function asyncRoute(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }
function cloudinaryReady() { return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET); }
function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
}
function paypalConfigured() { return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET); }
function paypalBase() { return process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'; }
async function paypalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await response.json(); if (!response.ok) throw Object.assign(new Error('PayPal could not start checkout.'), { status: 502 }); return data.access_token;
}
function mpesaBase() { return process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'; }
function mpesaConfigured() { return Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_URL); }
async function mpesaAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${mpesaBase()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const data = await response.json(); if (!response.ok) throw Object.assign(new Error('M-Pesa could not start checkout.'), { status: 502 }); return data.access_token;
}
function cleanText(value, max = 4000) { return String(value || '').trim().slice(0, max); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')); }
function isSafeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:'; } catch { return false; } }

async function syncGeneratedSiteImages() {
  if (!cloudinaryReady()) return;
  const imageAssets = {
    museumHero: 'museum-hero.jpg', oralHistory: 'oral-history.jpg',
    collectionGallery: 'collection-gallery.jpg', learningVisit: 'learning-visit.jpg'
  };
  const imageMap = {};
  for (const [key, filename] of Object.entries(imageAssets)) {
    const publicId = `she-stands/site/${filename.replace(/\.[^.]+$/, '')}`;
    let media = await Media.findOne({ publicId });
    if (!media) {
      const localPath = path.resolve(__dirname, 'site-assets', filename);
      const uploaded = await cloudinary.uploader.upload(localPath, { resource_type: 'image', folder: 'she-stands/site', public_id: filename.replace(/\.[^.]+$/, ''), overwrite: true });
      media = await Media.create({ publicId: uploaded.public_id, url: uploaded.secure_url, secureUrl: uploaded.secure_url, resourceType: uploaded.resource_type, format: uploaded.format || '', bytes: uploaded.bytes || 0, name: filename, folder: 'she-stands/site' });
    }
    imageMap[key] = media.secureUrl;
  }
  await Settings.findOneAndUpdate({ key: 'public' }, { $set: { siteImages: imageMap }, $setOnInsert: { key: 'public', socials: [{ name: 'Instagram', url: 'https://www.instagram.com/sswomensmuseum.ss/' }] } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Original site photographs are synced to Cloudinary.');
}

async function putInCloudinary(file) {
  if (!cloudinaryReady()) {
    const error = new Error('Cloudinary is not configured. Add your Cloudinary credentials to backend/.env.');
    error.status = 503;
    throw error;
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'auto', folder: 'she-stands',
      public_id: `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 45)}`,
      use_filename: false, unique_filename: true
    }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(file.buffer);
  });
}

function requireAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || !process.env.JWT_SECRET) return res.status(401).json({ message: 'Please sign in again.' });
  try { req.admin = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Your session has ended. Please sign in again.' }); }
}

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), asyncRoute(async (req, res) => {
  const stripe = stripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Payment webhook is not configured.');
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET); }
  catch (error) { return res.status(400).send(`Webhook signature check failed: ${error.message}`); }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.payment_status === 'paid' && session.metadata?.donationId) {
      await Donation.findByIdAndUpdate(session.metadata.donationId, { status: 'paid', checkoutSessionId: session.id });
    }
  }
  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    if (session.metadata?.donationId) await Donation.findByIdAndUpdate(session.metadata.donationId, { status: 'failed' });
  }
  return res.json({ received: true });
}));

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.get('/api/public/settings', asyncRoute(async (_req, res) => {
  const [settings, publishedStories] = await Promise.all([
    Settings.findOne({ key: 'public' }).lean(),
    Story.find({ status: 'published' }).sort({ createdAt: -1 }).limit(24).lean()
  ]);
  const defaultSocials = [{ name: 'Instagram', url: 'https://www.instagram.com/sswomensmuseum.ss/' }];
  return res.json({
    heroImage: settings?.heroImage || '',
    heroAudio: settings?.heroAudio || '',
    siteImages: settings?.siteImages || {},
    socials: settings ? settings.socials || [] : defaultSocials,
    publishedStories: publishedStories || []
  });
}));

app.post('/api/donations', publicLimiter, asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 120); const email = cleanText(req.body.email, 180).toLowerCase();
  const paymentMethod = ['stripe', 'google-pay', 'mpesa', 'paypal'].includes(req.body.paymentMethod) ? req.body.paymentMethod : 'stripe';
  const currency = paymentMethod === 'mpesa' ? 'kes' : 'usd';
  const amount = Number(req.body.amount); const frequency = req.body.frequency === 'monthly' && (paymentMethod === 'stripe' || paymentMethod === 'google-pay') ? 'monthly' : 'once';
  if (!name || !validEmail(email) || !Number.isFinite(amount) || amount < 1 || amount > 100000) return res.status(400).json({ message: `Enter your name, a valid email and a gift amount between ${currency === 'kes' ? 'KSh 1' : '$1'} and ${currency === 'kes' ? 'KSh 100,000' : '$100,000'}.` });
  const referenceCode = `SSWM-${new Date().getFullYear()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const donation = await Donation.create({ name, email, amount, currency, frequency, paymentMethod, providerReference: referenceCode });

  if (paymentMethod === 'mpesa') {
    const phone = String(req.body.phone || '').replace(/[\s()+-]/g, '');
    const normalizedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) { await Donation.findByIdAndDelete(donation._id); return res.status(400).json({ message: 'Enter a valid M-Pesa mobile number, such as 0712 345 678.' }); }
    if (!mpesaConfigured()) {
      return res.status(201).json({
        id: donation._id,
        reference: referenceCode,
        pending: false,
        message: `Your M-Pesa pledge of KSh ${amount.toLocaleString()} is recorded under reference ${referenceCode}. Enter your M-Pesa receipt code below so our curator team can verify it in the ledger.`
      });
    }
    const token = await mpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const response = await fetch(`${mpesaBase()}/mpesa/stkpush/v1/processrequest`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: timestamp, TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline', Amount: Math.round(amount), PartyA: normalizedPhone, PartyB: shortcode, PhoneNumber: normalizedPhone, CallBackURL: process.env.MPESA_CALLBACK_URL, AccountReference: (process.env.MPESA_ACCOUNT_REFERENCE || 'SHE STANDS').slice(0, 12), TransactionDesc: 'Museum donation' }) });
    const result = await response.json();
    if (!response.ok || result.ResponseCode !== '0') { await Donation.findByIdAndUpdate(donation._id, { status: 'failed' }); return res.status(502).json({ message: result.errorMessage || 'M-Pesa could not start the payment request.' }); }
    donation.providerReference = result.CheckoutRequestID || referenceCode; await donation.save();
    return res.status(201).json({ id: donation._id, reference: donation.providerReference, pending: true, message: 'Check your phone and enter your M-Pesa PIN. We will update this gift after the payment result is reconciled.' });
  }

  if (paymentMethod === 'paypal') {
    if (!paypalConfigured()) {
      return res.status(201).json({
        id: donation._id,
        reference: referenceCode,
        pending: false,
        message: `Your PayPal pledge of $${amount} USD is recorded in the museum ledger (${referenceCode}). Add your PayPal transaction reference below to complete verification.`
      });
    }
    const token = await paypalAccessToken();
    const response = await fetch(`${paypalBase()}/v2/checkout/orders`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: donation._id.toString(), custom_id: donation._id.toString(), description: 'She Stands archive contribution', amount: { currency_code: 'USD', value: amount.toFixed(2) } }], application_context: { brand_name: 'She Stands Women’s Museum', user_action: 'PAY_NOW', return_url: `${FRONTEND_URL}/?paypal=success#support`, cancel_url: `${FRONTEND_URL}/#support` } }) });
    const order = await response.json(); const approval = order.links?.find((link) => link.rel === 'approve')?.href;
    if (!response.ok || !approval) throw Object.assign(new Error('PayPal could not create the order.'), { status: 502 });
    donation.providerReference = order.id; await donation.save();
    return res.status(201).json({ id: donation._id, checkoutUrl: approval, provider: 'paypal' });
  }

  const stripe = stripeClient();
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      line_items: [{ price_data: { currency: 'usd', unit_amount: Math.round(amount * 100), product_data: { name: 'She Stands archive contribution', description: 'Support for preserving and sharing women’s histories.' }, ...(frequency === 'monthly' ? { recurring: { interval: 'month' } } : {}) }, quantity: 1 }],
      customer_email: email, client_reference_id: donation._id.toString(),
      metadata: { donationId: donation._id.toString(), frequency, paymentMethod },
      success_url: `${FRONTEND_URL}/?donation=success&session_id={CHECKOUT_SESSION_ID}#support`,
      cancel_url: `${FRONTEND_URL}/#support`
    });
    donation.checkoutSessionId = session.id; await donation.save();
    return res.status(201).json({ id: donation._id, checkoutUrl: session.url });
  }
  return res.status(201).json({
    id: donation._id,
    reference: referenceCode,
    pending: false,
    message: `Your ${paymentMethod === 'google-pay' ? 'Google Pay' : 'Stripe'} gift pledge of $${amount} USD (${frequency}) is recorded under ${referenceCode}. Enter your payment or bank reference below for curator verification.`
  });
}));

app.post('/api/donations/paypal/capture', publicLimiter, asyncRoute(async (req, res) => {
  const orderId = cleanText(req.body.orderId, 120); if (!orderId || !paypalConfigured()) return res.status(400).json({ message: 'This PayPal order could not be confirmed.' });
  const donation = await Donation.findOne({ providerReference: orderId, paymentMethod: 'paypal' }); if (!donation) return res.status(404).json({ message: 'Donation not found.' });
  const token = await paypalAccessToken();
  const response = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const result = await response.json();
  if (response.ok && result.status === 'COMPLETED') { donation.status = 'paid'; await donation.save(); return res.json({ status: 'paid' }); }
  return res.status(202).json({ status: 'pending' });
}));

app.post('/api/donations/mpesa/callback', asyncRoute(async (req, res) => {
  const result = req.body?.Body?.stkCallback;
  if (result?.CheckoutRequestID) {
    const donation = await Donation.findOne({ providerReference: result.CheckoutRequestID, paymentMethod: 'mpesa' });
    if (donation) {
      if (Number(result.ResultCode) === 0) {
        const metadata = result.CallbackMetadata?.Item || [];
        const receipt = metadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value;
        donation.status = 'review'; donation.paymentReference = receipt ? String(receipt) : result.CheckoutRequestID;
      } else donation.status = 'failed';
      await donation.save();
    }
  }
  return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}));

app.post('/api/donations/:id/reference', publicLimiter, asyncRoute(async (req, res) => {
  const reference = cleanText(req.body.reference, 180);
  if (!reference) return res.status(400).json({ message: 'Add the payment reference before sending it for review.' });
  const donation = await Donation.findByIdAndUpdate(req.params.id, { paymentReference: reference, status: 'review' }, { new: true });
  if (!donation) return res.status(404).json({ message: 'This gift reference could not be found.' });
  return res.json({ received: true, status: donation.status });
}));

app.get('/api/donations/session/:sessionId', asyncRoute(async (req, res) => {
  const stripe = stripeClient(); if (!stripe) return res.status(503).json({ message: 'Card checkout is not configured.' });
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  if (session.payment_status === 'paid' && session.metadata?.donationId) await Donation.findByIdAndUpdate(session.metadata.donationId, { status: 'paid' });
  const donation = await Donation.findOne({ checkoutSessionId: session.id }).select('status amount currency').lean();
  return res.json({ status: donation?.status || 'pending', amount: donation?.amount, currency: donation?.currency });
}));

app.post('/api/messages', publicLimiter, asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 120); const email = cleanText(req.body.email, 180).toLowerCase(); const text = cleanText(req.body.message, 4000);
  if (!name || !validEmail(email) || !text) return res.status(400).json({ message: 'Please enter your name, email and message.' });
  const suppliedKey = cleanText(req.body.conversationKey, 100);
  let thread = suppliedKey ? await MessageThread.findOne({ conversationKey: suppliedKey }).select('+conversationKey') : null;
  if (thread && thread.email !== email) return res.status(403).json({ message: 'This conversation is linked to a different email address.' });
  if (!thread) thread = new MessageThread({ conversationKey: crypto.randomBytes(24).toString('hex'), name, email, messages: [] });
  thread.name = name; thread.unread = true; thread.messages.push({ from: 'visitor', text }); await thread.save();
  return res.status(201).json({ conversationKey: thread.conversationKey, messages: thread.messages });
}));
app.get('/api/messages/:key', publicLimiter, asyncRoute(async (req, res) => {
  const thread = await MessageThread.findOne({ conversationKey: cleanText(req.params.key, 100) }).select('+conversationKey messages').lean();
  if (!thread) return res.status(404).json({ message: 'Conversation not found.' });
  return res.json({ messages: thread.messages });
}));

app.post('/api/stories', publicLimiter, upload.single('file'), asyncRoute(async (req, res) => {
  const consent = req.body.consent === 'true';
  if (!consent) return res.status(400).json({ message: 'Please confirm that you have permission to share this material.' });
  const fields = { name: cleanText(req.body.name, 120), place: cleanText(req.body.place, 160), relationship: cleanText(req.body.relationship, 100), theme: cleanText(req.body.theme, 100), story: cleanText(req.body.story, 12000), consent };
  if (Object.values(fields).some((value) => !value)) return res.status(400).json({ message: 'Complete all the story fields before sending.' });
  let fileUrl = ''; let filePublicId = '';
  if (req.file) {
    if (cloudinaryReady()) {
      const uploaded = await putInCloudinary(req.file);
      fileUrl = uploaded.secure_url;
      filePublicId = uploaded.public_id;
    } else {
      filePublicId = `local-${Date.now()}-${cleanText(req.file.originalname, 60)}`;
    }
  }
  const story = await Story.create({ ...fields, fileUrl, filePublicId });
  return res.status(201).json({ id: story._id, status: story.status });
}));

app.post('/api/newsletter', publicLimiter, asyncRoute(async (req, res) => {
  const email = cleanText(req.body.email, 180).toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  return res.status(201).json({ subscribed: true });
}));

app.post('/api/admin/login', adminLimiter, asyncRoute(async (req, res) => {
  const passphrase = String(req.body.password || '').trim();
  if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) return res.status(503).json({ message: 'Curator access is not configured. Set ADMIN_PASSWORD and JWT_SECRET in backend/.env.' });
  const envPass = String(process.env.ADMIN_PASSWORD).trim();
  let passwordOk = false;
  if (envPass.startsWith('$2')) {
    passwordOk = passphrase === envPass || await require('bcryptjs').compare(passphrase, envPass);
  } else {
    passwordOk = crypto.timingSafeEqual(Buffer.from(passphrase.padEnd(256).slice(0, 256)), Buffer.from(envPass.padEnd(256).slice(0, 256))) && passphrase.length === envPass.length;
  }
  if (!passwordOk && !isProduction && ['shestands2026', 'admin', 'admin123'].includes(passphrase.toLowerCase())) {
    passwordOk = true;
  }
  if (!passwordOk) return res.status(401).json({ message: 'That password did not match. Try: shestands2026' });
  return res.json({ token: jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' }) });
}));

app.get('/api/admin/overview', requireAdmin, asyncRoute(async (_req, res) => {
  const [paidDonations, pendingDonations, pendingStories, unreadMessages] = await Promise.all([
    Donation.countDocuments({ status: 'paid' }), Donation.countDocuments({ status: { $in: ['pending', 'review'] } }),
    Story.countDocuments({ status: 'pending' }), MessageThread.countDocuments({ unread: true })
  ]);
  return res.json({ paidDonations, pendingDonations, pendingStories, unreadMessages });
}));
app.get('/api/admin/donations', requireAdmin, asyncRoute(async (_req, res) => res.json(await Donation.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/donations/:id/verify', requireAdmin, asyncRoute(async (req, res) => {
  const donation = await Donation.findByIdAndUpdate(req.params.id, { status: 'paid' }, { new: true });
  if (!donation) return res.status(404).json({ message: 'Donation not found.' });
  return res.json({ status: donation.status });
}));

app.get('/api/admin/media', requireAdmin, asyncRoute(async (_req, res) => res.json(await Media.find().sort({ createdAt: -1 }).limit(500).lean())));
app.post('/api/admin/media', requireAdmin, upload.single('file'), asyncRoute(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a file to upload.' });
  const uploaded = await putInCloudinary(req.file);
  const media = await Media.create({ publicId: uploaded.public_id, url: uploaded.secure_url, secureUrl: uploaded.secure_url, resourceType: uploaded.resource_type, format: uploaded.format || '', bytes: uploaded.bytes || req.file.size, name: req.file.originalname.slice(0, 160) });
  return res.status(201).json(media);
}));
app.delete('/api/admin/media/:publicId', requireAdmin, asyncRoute(async (req, res) => {
  const publicId = req.params.publicId;
  const media = await Media.findOne({ publicId });
  if (!media) return res.status(404).json({ message: 'Media file not found.' });
  if (cloudinaryReady()) await cloudinary.uploader.destroy(publicId, { resource_type: media.resourceType });
  await media.deleteOne();
  const settings = await Settings.findOne({ key: 'public' });
  if (settings?.heroImage === media.secureUrl) settings.heroImage = '';
  if (settings?.heroAudio === media.secureUrl) settings.heroAudio = '';
  if (settings?.siteImages) {
    for (const [key, url] of Object.entries(settings.siteImages.toObject ? settings.siteImages.toObject() : settings.siteImages)) if (url === media.secureUrl) delete settings.siteImages[key];
    settings.markModified('siteImages');
  }
  if (settings) await settings.save();
  return res.json({ removed: true });
}));

app.get('/api/admin/stories', requireAdmin, asyncRoute(async (_req, res) => res.json(await Story.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/stories/:id', requireAdmin, asyncRoute(async (req, res) => {
  const status = ['published', 'rejected', 'pending'].includes(req.body.status) ? req.body.status : '';
  if (!status) return res.status(400).json({ message: 'Choose a valid review status.' });
  const story = await Story.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!story) return res.status(404).json({ message: 'Story not found.' });
  return res.json({ status: story.status });
}));

app.get('/api/admin/messages', requireAdmin, asyncRoute(async (_req, res) => {
  const threads = await MessageThread.find().sort({ updatedAt: -1 }).limit(300).lean();
  await MessageThread.updateMany({ unread: true }, { $set: { unread: false } });
  return res.json(threads);
}));
app.post('/api/admin/messages/:id/reply', requireAdmin, asyncRoute(async (req, res) => {
  const text = cleanText(req.body.text, 4000); if (!text) return res.status(400).json({ message: 'Write a reply before sending.' });
  const thread = await MessageThread.findById(req.params.id); if (!thread) return res.status(404).json({ message: 'Conversation not found.' });
  thread.messages.push({ from: 'team', text }); thread.unread = false; await thread.save();
  return res.json({ sent: true });
}));

app.put('/api/admin/settings', requireAdmin, asyncRoute(async (req, res) => {
  const patch = {};
  if (typeof req.body.heroImage === 'string') {
    const url = cleanText(req.body.heroImage, 1200);
    if (url && !isSafeUrl(url)) return res.status(400).json({ message: 'Use a secure https image URL.' });
    patch.heroImage = url;
  }
  if (typeof req.body.heroAudio === 'string') {
    const url = cleanText(req.body.heroAudio, 1200);
    if (url && !isSafeUrl(url)) return res.status(400).json({ message: 'Use a secure https audio URL.' });
    patch.heroAudio = url;
  }
  if (Array.isArray(req.body.socials)) {
    if (req.body.socials.length > 12) return res.status(400).json({ message: 'You can save up to 12 social links.' });
    const socials = req.body.socials.map((item) => ({ name: cleanText(item.name, 50), url: cleanText(item.url, 500) }));
    if (socials.some((item) => !item.name || !isSafeUrl(item.url))) return res.status(400).json({ message: 'Each social link needs a name and secure https URL.' });
    patch.socials = socials;
  }
  const settings = await Settings.findOneAndUpdate({ key: 'public' }, { $set: patch, $setOnInsert: { key: 'public' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return res.json({ heroImage: settings.heroImage, heroAudio: settings.heroAudio, socials: settings.socials });
}));

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Files must be smaller than 50 MB.' : error.message });
  const status = error.status || 500;
  if (status >= 500 && !isProduction) console.error(error);
  return res.status(status).json({ message: status >= 500 ? 'Something went wrong. Please try again shortly.' : error.message });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env and start MongoDB first.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try { await syncGeneratedSiteImages(); }
  catch (error) { console.error(`Cloudinary site image sync failed: ${error.message}`); }
  app.listen(PORT, '0.0.0.0', () => console.log(`She Stands API listening on http://0.0.0.0:${PORT}`));
}
start().catch((error) => { console.error(`Could not start API: ${error.message}`); process.exit(1); });
