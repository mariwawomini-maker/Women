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
const rawFrontendOrigins = String(process.env.FRONTEND_URL || 'http://localhost:4200')
  .split(',')
  .map((item) => item.trim().replace(/\/$/, ''))
  .filter(Boolean);
const PRIMARY_FRONTEND_URL = rawFrontendOrigins[0] || 'http://localhost:4200';
const isProduction = process.env.NODE_ENV === 'production';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const ROLE_DEFINITIONS = {
  administrator: {
    label: 'Museum Administrator',
    permissions: ['overview', 'donations', 'enquiries', 'content', 'stories', 'reflections', 'messages', 'media', 'audience', 'export', 'settings']
  },
  curator: {
    label: 'Curatorial & Collections Lead',
    permissions: ['overview', 'content', 'stories', 'reflections', 'messages', 'media', 'enquiries']
  },
  operations: {
    label: 'Operations & Visitor Desk',
    permissions: ['overview', 'donations', 'enquiries', 'messages', 'audience', 'export']
  }
};

const Donation = mongoose.model('Donation', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  amount: { type: Number, required: true, min: 1, max: 10000000 },
  currency: { type: String, default: 'usd', enum: ['usd', 'kes'] },
  frequency: { type: String, default: 'once', enum: ['once', 'monthly'] },
  paymentMethod: { type: String, default: 'stripe', enum: ['stripe', 'google-pay', 'mpesa', 'paypal'] },
  designation: { type: String, trim: true, maxlength: 120, default: 'General museum care' },
  dedication: { type: String, trim: true, maxlength: 240, default: '' },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
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
  email: { type: String, trim: true, lowercase: true, maxlength: 180 },
  place: { type: String, required: true, trim: true, maxlength: 160 },
  relationship: { type: String, required: true, maxlength: 100 },
  theme: { type: String, required: true, maxlength: 100 },
  interviewInterest: { type: String, enum: ['yes', 'no', 'unsure'], default: 'unsure' },
  story: { type: String, required: true, maxlength: 12000 },
  consent: { type: Boolean, required: true },
  fileUrl: { type: String, default: '' },
  filePublicId: { type: String, default: '' },
  contentNotice: { type: String, trim: true, maxlength: 400, default: '' },
  publicationCleared: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'published', 'rejected'] }
}, { timestamps: true }));

const Reflection = mongoose.model('Reflection', new mongoose.Schema({
  promptType: { type: String, enum: ['remembrance', 'community-wall', 'future-message'], default: 'community-wall' },
  honoureeName: { type: String, trim: true, maxlength: 140, default: '' },
  contributorName: { type: String, required: true, trim: true, maxlength: 120 },
  contributorEmail: { type: String, trim: true, lowercase: true, maxlength: 180, default: '' },
  place: { type: String, trim: true, maxlength: 120, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 2400 },
  consent: { type: Boolean, required: true },
  publicationCleared: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'published', 'rejected'] }
}, { timestamps: true }));

const ENQUIRY_TYPES = [
  'general', 'school-visit', 'group-tour', 'research', 'oral-history',
  'volunteer', 'partnership', 'media', 'donation', 'shop',
  'event-registration', 'membership', 'rights-correction', 'teacher-feedback'
];

const ENQUIRY_DEPARTMENTS = {
  general: 'Operations',
  'school-visit': 'Education',
  'group-tour': 'Operations',
  research: 'Research',
  'oral-history': 'Curatorial',
  volunteer: 'Operations',
  partnership: 'Management',
  media: 'Communications',
  donation: 'Management',
  shop: 'Operations',
  'event-registration': 'Communications',
  membership: 'Operations',
  'rights-correction': 'Curatorial',
  'teacher-feedback': 'Education'
};

const Enquiry = mongoose.model('Enquiry', new mongoose.Schema({
  formType: { type: String, required: true, enum: ENQUIRY_TYPES, index: true },
  department: { type: String, required: true, trim: true, maxlength: 60 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  phone: { type: String, trim: true, maxlength: 60, default: '' },
  organisation: { type: String, trim: true, maxlength: 180, default: '' },
  subject: { type: String, trim: true, maxlength: 180, default: '' },
  preferredDate: { type: String, trim: true, maxlength: 100, default: '' },
  participants: { type: String, trim: true, maxlength: 80, default: '' },
  ageGrade: { type: String, trim: true, maxlength: 100, default: '' },
  tourType: { type: String, trim: true, maxlength: 120, default: '' },
  learningObjectives: { type: String, trim: true, maxlength: 1500, default: '' },
  accessibilityNeeds: { type: String, trim: true, maxlength: 1000, default: '' },
  specialRequirements: { type: String, trim: true, maxlength: 1000, default: '' },
  interestArea: { type: String, trim: true, maxlength: 160, default: '' },
  relatedItem: { type: String, trim: true, maxlength: 180, default: '' },
  message: { type: String, trim: true, maxlength: 6000, default: '' },
  privacyConsent: { type: Boolean, required: true },
  status: { type: String, enum: ['new', 'in-review', 'confirmed', 'archived'], default: 'new', index: true },
  staffNotes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true }));

const MessageThread = mongoose.model('MessageThread', new mongoose.Schema({
  conversationKey: { type: String, required: true, unique: true, select: false },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  messages: [{ from: { type: String, enum: ['visitor', 'team'], required: true }, text: { type: String, required: true, maxlength: 4000 }, sentAt: { type: Date, default: Date.now } }],
  unread: { type: Boolean, default: true }
}, { timestamps: true }));

const Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 180 },
  name: { type: String, trim: true, maxlength: 120, default: '' },
  interests: [{ type: String, trim: true, maxlength: 60 }],
  consent: { type: Boolean, default: true }
}, { timestamps: true }));

const Settings = mongoose.model('Settings', new mongoose.Schema({
  key: { type: String, default: 'public', unique: true },
  heroImage: { type: String, default: '' },
  heroAudio: { type: String, default: '' },
  siteImages: { type: mongoose.Schema.Types.Mixed, default: {} },
  pageCopy: { type: mongoose.Schema.Types.Mixed, default: {} },
  socials: [{ name: { type: String, trim: true, maxlength: 50 }, url: { type: String, trim: true, maxlength: 500 } }]
}, { timestamps: true }));

const CONTENT_TYPES = [
  'exhibition', 'collection', 'heroine', 'oral-history', 'education',
  'research', 'event', 'shop', 'news', 'press', 'partner', 'team',
  'visit', 'document', 'timeline'
];

const ContentEntry = mongoose.model('ContentEntry', new mongoose.Schema({
  type: { type: String, required: true, enum: CONTENT_TYPES, index: true },
  subtype: { type: String, trim: true, maxlength: 80, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  summary: { type: String, trim: true, maxlength: 600, default: '' },
  body: { type: String, trim: true, maxlength: 12000, default: '' },
  date: { type: String, trim: true, maxlength: 100, default: '' },
  place: { type: String, trim: true, maxlength: 160, default: '' },
  attribution: { type: String, trim: true, maxlength: 240, default: '' },
  accessionNumber: { type: String, trim: true, maxlength: 100, default: '' },
  objectType: { type: String, trim: true, maxlength: 100, default: '' },
  materials: { type: String, trim: true, maxlength: 300, default: '' },
  dimensions: { type: String, trim: true, maxlength: 160, default: '' },
  communityContext: { type: String, trim: true, maxlength: 400, default: '' },
  acquisitionMethod: { type: String, trim: true, maxlength: 200, default: '' },
  donor: { type: String, trim: true, maxlength: 200, default: '' },
  condition: { type: String, trim: true, maxlength: 300, default: '' },
  storageLocation: { type: String, trim: true, maxlength: 200, default: '' },
  exhibitionHistory: { type: String, trim: true, maxlength: 600, default: '' },
  provenance: { type: String, trim: true, maxlength: 1000, default: '' },
  rights: { type: String, trim: true, maxlength: 600, default: '' },
  source: { type: String, trim: true, maxlength: 1000, default: '' },
  price: { type: String, trim: true, maxlength: 80, default: '' },
  availability: { type: String, trim: true, maxlength: 120, default: '' },
  maker: { type: String, trim: true, maxlength: 180, default: '' },
  eventTime: { type: String, trim: true, maxlength: 100, default: '' },
  audience: { type: String, trim: true, maxlength: 140, default: '' },
  capacity: { type: String, trim: true, maxlength: 80, default: '' },
  accessibility: { type: String, trim: true, maxlength: 400, default: '' },
  registrationRequired: { type: Boolean, default: false },
  transcript: { type: String, trim: true, maxlength: 12000, default: '' },
  contentNotice: { type: String, trim: true, maxlength: 400, default: '' },
  imageUrl: { type: String, trim: true, maxlength: 1200, default: '' },
  audioUrl: { type: String, trim: true, maxlength: 1200, default: '' },
  fileUrl: { type: String, trim: true, maxlength: 1200, default: '' },
  relatedIds: [{ type: String, trim: true, maxlength: 40 }],
  owner: { type: String, trim: true, maxlength: 100, default: '' },
  reviewDate: { type: String, trim: true, maxlength: 40, default: '' },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  cleared: { type: Boolean, default: false }
}, { timestamps: true }));

const ALLOWED_ANALYTICS_METRICS = new Set([
  'site_views', 'visit_info_views', 'exhibition_views', 'heroine_views',
  'collection_views', 'resource_downloads', 'donation_starts', 'donation_paid',
  'story_submissions', 'enquiries_submitted', 'newsletter_signups', 'reflections_submitted'
]);

const AnalyticsCounter = mongoose.model('AnalyticsCounter', new mongoose.Schema({
  metric: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  topItems: { type: mongoose.Schema.Types.Mixed, default: {} }
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

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false });
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 240, standardHeaders: 'draft-8', legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: 'draft-8', legacyHeaders: false });

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

function originAllowed(origin) {
  if (!origin) return true;
  if (rawFrontendOrigins.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    for (const allowed of rawFrontendOrigins) {
      try {
        const parsedAllowed = new URL(allowed);
        if (parsedAllowed.hostname.endsWith('.pages.dev') && parsed.protocol === 'https:' && parsed.hostname.endsWith(`.${parsedAllowed.hostname}`)) {
          return true;
        }
      } catch { /* ignore invalid allowed entry */ }
    }
    if (!isProduction) {
      const localHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || /^10\./.test(parsed.hostname) || /^192\.168\./.test(parsed.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname);
      if (parsed.protocol === 'http:' && (parsed.port === '4200' || parsed.port === '4000') && localHost) return true;
    }
  } catch { /* malformed origin */ }
  return false;
}

app.use(cors({
  origin: (origin, callback) => originAllowed(origin) ? callback(null, true) : callback(new Error('Origin is not allowed.')),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
function mpesaStkConfigured() { return Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_URL); }
function mpesaPaybillConfigured() { return Boolean(cleanText(process.env.MPESA_PAYBILL_NUMBER, 40)); }
function mpesaConfigured() { return mpesaStkConfigured() || mpesaPaybillConfigured(); }
async function mpesaAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${mpesaBase()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const data = await response.json(); if (!response.ok) throw Object.assign(new Error('M-Pesa could not start checkout.'), { status: 502 }); return data.access_token;
}

function cleanText(value, max = 4000) { return String(value || '').trim().slice(0, max); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')); }
function isSafeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:'; } catch { return false; } }
function checkHoneypot(body) { return !cleanText(body?._hp, 80); }

async function incrementAnalytics(metric, label = '') {
  if (!ALLOWED_ANALYTICS_METRICS.has(metric)) return;
  try {
    const update = { $inc: { count: 1 } };
    const safeLabel = cleanText(label, 90).replace(/[.$]/g, '');
    if (safeLabel) update.$inc[`topItems.${safeLabel}`] = 1;
    await AnalyticsCounter.updateOne({ metric }, update, { upsert: true });
  } catch { /* non-blocking analytics */ }
}

async function verifyPassword(passphrase, stored) {
  const envPass = String(stored || '').trim();
  if (!envPass) return false;
  if (envPass.startsWith('$2')) {
    return require('bcryptjs').compare(passphrase, envPass);
  }
  return crypto.timingSafeEqual(Buffer.from(passphrase.padEnd(256).slice(0, 256)), Buffer.from(envPass.padEnd(256).slice(0, 256))) && passphrase.length === envPass.length;
}

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
  const existing = await Settings.findOne({ key: 'public' }).lean();
  await Settings.findOneAndUpdate({ key: 'public' }, { $set: { siteImages: { ...imageMap, ...(existing?.siteImages || {}) } }, $setOnInsert: { key: 'public', socials: [] } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Original site photographs are synced to Cloudinary.');
}

async function putInCloudinary(file) {
  if (!cloudinaryReady()) {
    const error = new Error('File uploads are temporarily unavailable. Please try again later.');
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
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const roleKey = decoded.role === 'admin' ? 'administrator' : (ROLE_DEFINITIONS[decoded.role] ? decoded.role : 'administrator');
    req.admin = {
      role: roleKey,
      label: decoded.label || ROLE_DEFINITIONS[roleKey].label,
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : ROLE_DEFINITIONS[roleKey].permissions
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has ended. Please sign in again.' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (req.admin?.role === 'administrator' || req.admin?.permissions?.includes(permission)) return next();
    return res.status(403).json({ message: 'Your account role does not have permission for this section.' });
  };
}

function csvCell(value) {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  return /[",]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(rows, columns) {
  const header = columns.map(csvCell).join(',');
  const lines = rows.map((row) => columns.map((col) => csvCell(row[col])).join(','));
  return [header, ...lines].join('\r\n');
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
      await incrementAnalytics('donation_paid', session.metadata.paymentMethod || 'stripe');
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
  const [settings, publishedStories, publishedReflections] = await Promise.all([
    Settings.findOne({ key: 'public' }).lean(),
    Story.find({ status: 'published', publicationCleared: true }).select('name place theme story fileUrl contentNotice createdAt').sort({ createdAt: -1 }).limit(36).lean(),
    Reflection.find({ status: 'published', publicationCleared: true }).select('promptType honoureeName contributorName place message createdAt').sort({ createdAt: -1 }).limit(36).lean()
  ]);
  return res.json({
    heroImage: settings?.heroImage || '',
    heroAudio: settings?.heroAudio || '',
    siteImages: settings?.siteImages || {},
    pageCopy: settings?.pageCopy || {},
    socials: settings ? settings.socials || [] : [],
    publishedStories: publishedStories || [],
    publishedReflections: publishedReflections || []
  });
}));

app.get('/api/public/content', asyncRoute(async (_req, res) => {
  const entries = await ContentEntry.find({ status: 'published', cleared: true })
    .select('type subtype title summary body date place attribution accessionNumber objectType materials dimensions communityContext acquisitionMethod donor exhibitionHistory provenance rights source price availability maker eventTime audience capacity accessibility registrationRequired transcript contentNotice imageUrl audioUrl fileUrl relatedIds featured')
    .sort({ featured: -1, createdAt: -1 }).limit(300).lean();
  res.json(entries);
}));

app.get('/api/public/payment-options', (_req, res) => res.json({
  mpesa: mpesaConfigured(),
  mpesaMode: mpesaStkConfigured() ? 'stk' : mpesaPaybillConfigured() ? 'paybill' : 'unavailable',
  mpesaPaybill: mpesaPaybillConfigured() ? cleanText(process.env.MPESA_PAYBILL_NUMBER, 40) : '',
  mpesaAccountName: mpesaPaybillConfigured() ? cleanText(process.env.MPESA_ACCOUNT_NAME || process.env.MPESA_ACCOUNT_REFERENCE || 'SHE STANDS', 60) : '',
  paypal: paypalConfigured(),
  'google-pay': Boolean(stripeClient()),
  stripe: Boolean(stripeClient())
}));

app.post('/api/public/track', trackLimiter, asyncRoute(async (req, res) => {
  const metric = cleanText(req.body.metric, 60);
  const label = cleanText(req.body.label, 90);
  if (!ALLOWED_ANALYTICS_METRICS.has(metric)) return res.status(400).json({ ok: false });
  await incrementAnalytics(metric, label);
  return res.status(204).end();
}));

app.post('/api/donations', publicLimiter, asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to process request.' });
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 180).toLowerCase();
  const paymentMethod = ['stripe', 'google-pay', 'mpesa', 'paypal'].includes(req.body.paymentMethod) ? req.body.paymentMethod : 'stripe';
  const currency = paymentMethod === 'mpesa' ? 'kes' : 'usd';
  const amount = Number(req.body.amount);
  const maxAmount = currency === 'kes' ? 5000000 : 100000;
  const frequency = req.body.frequency === 'monthly' && (paymentMethod === 'stripe' || paymentMethod === 'google-pay') ? 'monthly' : 'once';
  const designation = cleanText(req.body.designation, 120) || 'General museum care';
  const dedication = cleanText(req.body.dedication, 240);
  const rawPhone = cleanText(req.body.phone, 40);

  if (!name || !validEmail(email) || !Number.isFinite(amount) || amount < 1 || amount > maxAmount) {
    return res.status(400).json({ message: `Enter your name, a valid email and a gift amount between ${currency === 'kes' ? 'KSh 1' : '$1'} and ${currency === 'kes' ? 'KSh 5,000,000' : '$100,000'}.` });
  }
  if ((paymentMethod === 'mpesa' && !mpesaConfigured()) || (paymentMethod === 'paypal' && !paypalConfigured()) || ((paymentMethod === 'stripe' || paymentMethod === 'google-pay') && !stripeClient())) {
    return res.status(503).json({ message: 'This payment method is currently awaiting live merchant credentials. Please choose another available method or send a donation enquiry.' });
  }

  const referenceCode = `SSWM-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const donation = await Donation.create({ name, email, amount, currency, frequency, paymentMethod, designation, dedication, phone: rawPhone, providerReference: referenceCode });
  await incrementAnalytics('donation_starts', paymentMethod);

  if (paymentMethod === 'mpesa') {
    const phone = String(rawPhone || '').replace(/[\s()+-]/g, '');
    const normalizedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      await Donation.findByIdAndDelete(donation._id);
      return res.status(400).json({ message: 'Enter a valid Kenyan M-Pesa mobile number, such as 0712 345 678 or 254712345678.' });
    }
    donation.phone = normalizedPhone;
    if (mpesaStkConfigured()) {
      const token = await mpesaAccessToken();
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
      const shortcode = process.env.MPESA_SHORTCODE;
      const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
      const response = await fetch(`${mpesaBase()}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          BusinessShortCode: shortcode, Password: password, Timestamp: timestamp,
          TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
          Amount: Math.round(amount), PartyA: normalizedPhone, PartyB: shortcode, PhoneNumber: normalizedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: (process.env.MPESA_ACCOUNT_REFERENCE || 'SHE STANDS').slice(0, 12),
          TransactionDesc: 'Museum donation'
        })
      });
      const result = await response.json();
      if (!response.ok || result.ResponseCode !== '0') {
        await Donation.findByIdAndUpdate(donation._id, { status: 'failed' });
        return res.status(502).json({ message: result.errorMessage || 'M-Pesa could not send the prompt to your phone.' });
      }
      donation.providerReference = result.CheckoutRequestID || referenceCode;
      await donation.save();
      return res.status(201).json({
        id: donation._id, reference: donation.providerReference, pending: true,
        message: 'An M-Pesa payment prompt has been sent to your phone. Enter your M-Pesa PIN to complete your gift. Your receipt will be reconciled by our finance desk.'
      });
    }
    await donation.save();
    return res.status(201).json({
      id: donation._id, reference: referenceCode, pending: false,
      paybill: cleanText(process.env.MPESA_PAYBILL_NUMBER, 40),
      accountName: cleanText(process.env.MPESA_ACCOUNT_NAME || process.env.MPESA_ACCOUNT_REFERENCE || 'SHE STANDS', 60),
      message: 'Complete the transfer via M-Pesa Paybill and enter your M-Pesa confirmation code below so our team can verify your gift.'
    });
  }

  if (paymentMethod === 'paypal') {
    const token = await paypalAccessToken();
    const response = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: donation._id.toString(),
          custom_id: donation._id.toString(),
          description: `She Stands Women’s Museum — ${designation}`,
          amount: { currency_code: 'USD', value: amount.toFixed(2) }
        }],
        application_context: {
          brand_name: 'She Stands Women’s Museum',
          user_action: 'PAY_NOW',
          return_url: `${PRIMARY_FRONTEND_URL}/donate/paypal?paypal=success`,
          cancel_url: `${PRIMARY_FRONTEND_URL}/donate/paypal?cancelled=1`
        }
      })
    });
    const order = await response.json();
    const approval = order.links?.find((link) => link.rel === 'approve')?.href;
    if (!response.ok || !approval) throw Object.assign(new Error('PayPal could not create the order.'), { status: 502 });
    donation.providerReference = order.id;
    await donation.save();
    return res.status(201).json({ id: donation._id, checkoutUrl: approval, provider: 'paypal' });
  }

  const stripe = stripeClient();
  if (stripe) {
    const routeSlug = paymentMethod === 'google-pay' ? 'google-pay' : 'card';
    const session = await stripe.checkout.sessions.create({
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `She Stands Women’s Museum — ${designation}`,
            description: dedication ? `Dedicated: ${dedication}` : 'Support for preserving and sharing South Sudanese women’s histories.'
          },
          ...(frequency === 'monthly' ? { recurring: { interval: 'month' } } : {})
        },
        quantity: 1
      }],
      customer_email: email,
      client_reference_id: donation._id.toString(),
      metadata: { donationId: donation._id.toString(), frequency, paymentMethod, designation },
      success_url: `${PRIMARY_FRONTEND_URL}/donate/${routeSlug}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PRIMARY_FRONTEND_URL}/donate/${routeSlug}?cancelled=1`
    });
    donation.checkoutSessionId = session.id;
    await donation.save();
    return res.status(201).json({ id: donation._id, checkoutUrl: session.url });
  }
  return res.status(503).json({ message: 'This payment method is temporarily unavailable.' });
}));

app.post('/api/donations/paypal/capture', publicLimiter, asyncRoute(async (req, res) => {
  const orderId = cleanText(req.body.orderId, 120);
  if (!orderId || !paypalConfigured()) return res.status(400).json({ message: 'This PayPal order could not be confirmed.' });
  const donation = await Donation.findOne({ providerReference: orderId, paymentMethod: 'paypal' });
  if (!donation) return res.status(404).json({ message: 'Donation not found.' });
  const token = await paypalAccessToken();
  const response = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const result = await response.json();
  if (response.ok && result.status === 'COMPLETED') {
    donation.status = 'paid';
    await donation.save();
    await incrementAnalytics('donation_paid', 'paypal');
    return res.json({ status: 'paid', amount: donation.amount, currency: donation.currency, designation: donation.designation });
  }
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
        donation.status = 'review';
        donation.paymentReference = receipt ? String(receipt) : result.CheckoutRequestID;
      } else {
        donation.status = 'failed';
      }
      await donation.save();
    }
  }
  return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}));

app.post('/api/donations/:id/reference', publicLimiter, asyncRoute(async (req, res) => {
  const reference = cleanText(req.body.reference, 180);
  if (!reference || !mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Add the payment reference before sending it for review.' });
  const donation = await Donation.findByIdAndUpdate(req.params.id, { paymentReference: reference, status: 'review' }, { new: true });
  if (!donation) return res.status(404).json({ message: 'This gift reference could not be found.' });
  return res.json({ received: true, status: donation.status });
}));

app.get('/api/donations/session/:sessionId', asyncRoute(async (req, res) => {
  const stripe = stripeClient();
  if (!stripe) return res.status(503).json({ message: 'Card checkout is not configured.' });
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  if (session.payment_status === 'paid' && session.metadata?.donationId) {
    await Donation.findByIdAndUpdate(session.metadata.donationId, { status: 'paid' });
  }
  const donation = await Donation.findOne({ checkoutSessionId: session.id }).select('status amount currency designation frequency').lean();
  return res.json({ status: donation?.status || 'pending', amount: donation?.amount, currency: donation?.currency, designation: donation?.designation, frequency: donation?.frequency });
}));

app.post('/api/enquiries', publicLimiter, asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to submit enquiry.' });
  const formType = ENQUIRY_TYPES.includes(req.body.formType) ? req.body.formType : 'general';
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 180).toLowerCase();
  const privacyConsent = req.body.privacyConsent === true || req.body.privacyConsent === 'true';
  if (!privacyConsent) return res.status(400).json({ message: 'Please confirm the privacy notice before submitting.' });
  if (!name || !validEmail(email)) return res.status(400).json({ message: 'Enter your name and a valid email address.' });
  const entry = await Enquiry.create({
    formType,
    department: ENQUIRY_DEPARTMENTS[formType] || 'Operations',
    name,
    email,
    phone: cleanText(req.body.phone, 60),
    organisation: cleanText(req.body.organisation, 180),
    subject: cleanText(req.body.subject, 180),
    preferredDate: cleanText(req.body.preferredDate, 100),
    participants: cleanText(req.body.participants, 80),
    ageGrade: cleanText(req.body.ageGrade, 100),
    tourType: cleanText(req.body.tourType, 120),
    learningObjectives: cleanText(req.body.learningObjectives, 1500),
    accessibilityNeeds: cleanText(req.body.accessibilityNeeds, 1000),
    specialRequirements: cleanText(req.body.specialRequirements, 1000),
    interestArea: cleanText(req.body.interestArea, 160),
    relatedItem: cleanText(req.body.relatedItem, 180),
    message: cleanText(req.body.message, 6000),
    privacyConsent: true
  });
  await incrementAnalytics('enquiries_submitted', formType);
  return res.status(201).json({ id: entry._id, department: entry.department, status: entry.status });
}));

app.post('/api/reflections', publicLimiter, asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to submit reflection.' });
  const consent = req.body.consent === true || req.body.consent === 'true';
  if (!consent) return res.status(400).json({ message: 'Please confirm permission for curatorial review before sharing.' });
  const contributorName = cleanText(req.body.contributorName, 120);
  const message = cleanText(req.body.message, 2400);
  const contributorEmail = cleanText(req.body.contributorEmail, 180).toLowerCase();
  if (!contributorName || !message) return res.status(400).json({ message: 'Please enter your name and reflection message.' });
  if (contributorEmail && !validEmail(contributorEmail)) return res.status(400).json({ message: 'Enter a valid email address or leave email blank.' });
  const promptType = ['remembrance', 'community-wall', 'future-message'].includes(req.body.promptType) ? req.body.promptType : 'community-wall';
  const reflection = await Reflection.create({
    promptType,
    honoureeName: cleanText(req.body.honoureeName, 140),
    contributorName,
    contributorEmail,
    place: cleanText(req.body.place, 120),
    message,
    consent: true
  });
  await incrementAnalytics('reflections_submitted', promptType);
  return res.status(201).json({ id: reflection._id, status: reflection.status });
}));

app.post('/api/messages', publicLimiter, asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to send message.' });
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 180).toLowerCase();
  const text = cleanText(req.body.message, 4000);
  if (!name || !validEmail(email) || !text) return res.status(400).json({ message: 'Please enter your name, email and message.' });
  const suppliedKey = cleanText(req.body.conversationKey, 100);
  let thread = suppliedKey ? await MessageThread.findOne({ conversationKey: suppliedKey }).select('+conversationKey') : null;
  if (thread && thread.email !== email) return res.status(403).json({ message: 'This conversation is linked to a different email address.' });
  if (!thread) thread = new MessageThread({ conversationKey: crypto.randomBytes(24).toString('hex'), name, email, messages: [] });
  thread.name = name;
  thread.unread = true;
  thread.messages.push({ from: 'visitor', text });
  await thread.save();
  return res.status(201).json({ conversationKey: thread.conversationKey, messages: thread.messages });
}));

app.get('/api/messages/:key', publicLimiter, asyncRoute(async (req, res) => {
  const thread = await MessageThread.findOne({ conversationKey: cleanText(req.params.key, 100) }).select('+conversationKey messages').lean();
  if (!thread) return res.status(404).json({ message: 'Conversation not found.' });
  return res.json({ messages: thread.messages });
}));

app.post('/api/stories', publicLimiter, upload.single('file'), asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to submit story.' });
  const consent = req.body.consent === 'true' || req.body.consent === true;
  if (!consent) return res.status(400).json({ message: 'Please confirm that you have permission to share this material.' });
  const fields = {
    name: cleanText(req.body.name, 120),
    email: cleanText(req.body.email, 180).toLowerCase(),
    place: cleanText(req.body.place, 160),
    relationship: cleanText(req.body.relationship, 100),
    theme: cleanText(req.body.theme, 100),
    interviewInterest: ['yes', 'no', 'unsure'].includes(req.body.interviewInterest) ? req.body.interviewInterest : 'unsure',
    story: cleanText(req.body.story, 12000),
    consent: true
  };
  if (!fields.name || !validEmail(fields.email) || !fields.place || !fields.relationship || !fields.theme || !fields.story) {
    return res.status(400).json({ message: 'Complete all required story fields, including a valid contact email.' });
  }
  let fileUrl = '';
  let filePublicId = '';
  if (req.file) {
    if (!cloudinaryReady()) return res.status(503).json({ message: 'File uploads are temporarily unavailable. Please submit the story without a file or try again later.' });
    const uploaded = await putInCloudinary(req.file);
    fileUrl = uploaded.secure_url;
    filePublicId = uploaded.public_id;
  }
  const story = await Story.create({ ...fields, fileUrl, filePublicId });
  await incrementAnalytics('story_submissions', fields.theme);
  return res.status(201).json({ id: story._id, status: story.status });
}));

app.post('/api/newsletter', publicLimiter, asyncRoute(async (req, res) => {
  if (!checkHoneypot(req.body)) return res.status(400).json({ message: 'Unable to process request.' });
  const email = cleanText(req.body.email, 180).toLowerCase();
  const name = cleanText(req.body.name, 120);
  const interests = Array.isArray(req.body.interests)
    ? req.body.interests.map((item) => cleanText(item, 60)).filter(Boolean).slice(0, 8)
    : [];
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  await Subscriber.updateOne(
    { email },
    { $set: { name, interests, consent: true }, $setOnInsert: { email } },
    { upsert: true }
  );
  await incrementAnalytics('newsletter_signups');
  return res.status(201).json({ subscribed: true });
}));

app.post('/api/newsletter/unsubscribe', publicLimiter, asyncRoute(async (req, res) => {
  const email = cleanText(req.body.email, 180).toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  await Subscriber.deleteOne({ email });
  return res.json({ received: true });
}));

app.post('/api/admin/login', adminLimiter, asyncRoute(async (req, res) => {
  const passphrase = String(req.body.password || '').trim();
  if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    return res.status(503).json({ message: 'Sign-in is unavailable. Please configure ADMIN_PASSWORD and JWT_SECRET on the server.' });
  }
  let matchedRole = '';
  if (await verifyPassword(passphrase, process.env.ADMIN_PASSWORD)) {
    matchedRole = 'administrator';
  } else if (process.env.CURATOR_PASSWORD && await verifyPassword(passphrase, process.env.CURATOR_PASSWORD)) {
    matchedRole = 'curator';
  } else if (process.env.OPERATIONS_PASSWORD && await verifyPassword(passphrase, process.env.OPERATIONS_PASSWORD)) {
    matchedRole = 'operations';
  }
  if (!matchedRole) return res.status(401).json({ message: 'That password did not match any active museum account.' });
  const def = ROLE_DEFINITIONS[matchedRole];
  const token = jwt.sign({ role: matchedRole, label: def.label, permissions: def.permissions }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token, role: matchedRole, label: def.label, permissions: def.permissions });
}));

app.get('/api/admin/me', requireAdmin, (req, res) => res.json(req.admin));

app.get('/api/admin/payment-status', requireAdmin, (_req, res) => res.json({
  stripe: {
    configured: Boolean(stripeClient()),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    missing: [
      ...(!process.env.STRIPE_SECRET_KEY ? ['STRIPE_SECRET_KEY'] : []),
      ...(!process.env.STRIPE_WEBHOOK_SECRET ? ['STRIPE_WEBHOOK_SECRET'] : [])
    ]
  },
  googlePay: {
    configured: Boolean(stripeClient()),
    note: 'Uses Stripe Checkout with Google Pay enabled in your Stripe Dashboard.'
  },
  paypal: {
    configured: paypalConfigured(),
    mode: paypalBase().includes('sandbox') ? 'sandbox' : 'live',
    missing: [
      ...(!process.env.PAYPAL_CLIENT_ID ? ['PAYPAL_CLIENT_ID'] : []),
      ...(!process.env.PAYPAL_CLIENT_SECRET ? ['PAYPAL_CLIENT_SECRET'] : [])
    ]
  },
  mpesa: {
    configured: mpesaConfigured(),
    stkConfigured: mpesaStkConfigured(),
    paybillConfigured: mpesaPaybillConfigured(),
    mode: process.env.MPESA_ENV === 'production' ? 'live' : 'sandbox',
    missing: [
      ...(!process.env.MPESA_CONSUMER_KEY ? ['MPESA_CONSUMER_KEY'] : []),
      ...(!process.env.MPESA_CONSUMER_SECRET ? ['MPESA_CONSUMER_SECRET'] : []),
      ...(!process.env.MPESA_SHORTCODE ? ['MPESA_SHORTCODE'] : []),
      ...(!process.env.MPESA_PASSKEY ? ['MPESA_PASSKEY'] : []),
      ...(!process.env.MPESA_CALLBACK_URL ? ['MPESA_CALLBACK_URL'] : [])
    ]
  },
  cloudinary: {
    configured: cloudinaryReady(),
    missing: [
      ...(!process.env.CLOUDINARY_CLOUD_NAME ? ['CLOUDINARY_CLOUD_NAME'] : []),
      ...(!process.env.CLOUDINARY_API_KEY ? ['CLOUDINARY_API_KEY'] : []),
      ...(!process.env.CLOUDINARY_API_SECRET ? ['CLOUDINARY_API_SECRET'] : [])
    ]
  },
  frontendOrigins: rawFrontendOrigins
}));

function contentPayload(input) {
  const type = cleanText(input.type, 40);
  const status = input.status === 'published' ? 'published' : 'draft';
  const title = cleanText(input.title, 180);
  if (!CONTENT_TYPES.includes(type) || !title) throw Object.assign(new Error('Choose a content type and enter a title.'), { status: 400 });
  const payload = {
    type,
    subtype: cleanText(input.subtype, 80),
    title,
    status,
    cleared: Boolean(input.cleared),
    featured: Boolean(input.featured),
    summary: cleanText(input.summary, 600),
    body: cleanText(input.body, 12000),
    date: cleanText(input.date, 100),
    place: cleanText(input.place, 160),
    attribution: cleanText(input.attribution, 240),
    accessionNumber: cleanText(input.accessionNumber, 100),
    objectType: cleanText(input.objectType, 100),
    materials: cleanText(input.materials, 300),
    dimensions: cleanText(input.dimensions, 160),
    communityContext: cleanText(input.communityContext, 400),
    acquisitionMethod: cleanText(input.acquisitionMethod, 200),
    donor: cleanText(input.donor, 200),
    condition: cleanText(input.condition, 300),
    storageLocation: cleanText(input.storageLocation, 200),
    exhibitionHistory: cleanText(input.exhibitionHistory, 600),
    provenance: cleanText(input.provenance, 1000),
    rights: cleanText(input.rights, 600),
    source: cleanText(input.source, 1000),
    price: cleanText(input.price, 80),
    availability: cleanText(input.availability, 120),
    maker: cleanText(input.maker, 180),
    eventTime: cleanText(input.eventTime, 100),
    audience: cleanText(input.audience, 140),
    capacity: cleanText(input.capacity, 80),
    accessibility: cleanText(input.accessibility, 400),
    registrationRequired: Boolean(input.registrationRequired),
    transcript: cleanText(input.transcript, 12000),
    contentNotice: cleanText(input.contentNotice, 400),
    relatedIds: Array.isArray(input.relatedIds) ? input.relatedIds.map((id) => cleanText(id, 40)).filter(Boolean).slice(0, 12) : [],
    owner: cleanText(input.owner, 100),
    reviewDate: cleanText(input.reviewDate, 40)
  };
  for (const field of ['imageUrl', 'audioUrl', 'fileUrl']) {
    payload[field] = cleanText(input[field], 1200);
    if (payload[field] && !isSafeUrl(payload[field])) throw Object.assign(new Error('Media links must use secure https URLs.'), { status: 400 });
  }
  if (status === 'published' && !payload.cleared) {
    throw Object.assign(new Error('Confirm accuracy, context, dignity, consent and rights before publishing.'), { status: 400 });
  }
  if (status === 'published' && type === 'collection' && (!payload.provenance || !payload.rights)) {
    throw Object.assign(new Error('Collection records need provenance and rights details before publishing.'), { status: 400 });
  }
  return payload;
}

app.get('/api/admin/content', requireAdmin, requirePermission('content'), asyncRoute(async (_req, res) => res.json(await ContentEntry.find().sort({ updatedAt: -1 }).limit(500).lean())));
app.post('/api/admin/content', requireAdmin, requirePermission('content'), asyncRoute(async (req, res) => res.status(201).json(await ContentEntry.create(contentPayload(req.body)))));
app.put('/api/admin/content/:id', requireAdmin, requirePermission('content'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid content record.' });
  const entry = await ContentEntry.findByIdAndUpdate(req.params.id, { $set: contentPayload(req.body) }, { new: true, runValidators: true });
  if (!entry) return res.status(404).json({ message: 'Content record not found.' });
  res.json(entry);
}));
app.delete('/api/admin/content/:id', requireAdmin, requirePermission('content'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid content record.' });
  const entry = await ContentEntry.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Content record not found.' });
  res.status(204).end();
}));

app.get('/api/admin/overview', requireAdmin, asyncRoute(async (_req, res) => {
  const [paidDonations, pendingDonations, pendingStories, pendingReflections, newEnquiries, unreadMessages, publishedContent, subscriberCount] = await Promise.all([
    Donation.countDocuments({ status: 'paid' }),
    Donation.countDocuments({ status: { $in: ['pending', 'review'] } }),
    Story.countDocuments({ status: 'pending' }),
    Reflection.countDocuments({ status: 'pending' }),
    Enquiry.countDocuments({ status: 'new' }),
    MessageThread.countDocuments({ unread: true }),
    ContentEntry.countDocuments({ status: 'published', cleared: true }),
    Subscriber.countDocuments()
  ]);
  return res.json({ paidDonations, pendingDonations, pendingStories, pendingReflections, newEnquiries, unreadMessages, publishedContent, subscriberCount });
}));

app.get('/api/admin/analytics', requireAdmin, asyncRoute(async (_req, res) => {
  const [counters, enquiriesByType, donationsByMethod] = await Promise.all([
    AnalyticsCounter.find().lean(),
    Enquiry.aggregate([{ $group: { _id: '$formType', count: { $sum: 1 } } }]),
    Donation.aggregate([{ $group: { _id: { method: '$paymentMethod', status: '$status', currency: '$currency' }, count: { $sum: 1 }, total: { $sum: '$amount' } } }])
  ]);
  const metrics = Object.fromEntries(counters.map((item) => [item.metric, { count: item.count, topItems: item.topItems || {} }]));
  return res.json({ metrics, enquiriesByType, donationsByMethod });
}));

app.get('/api/admin/donations', requireAdmin, requirePermission('donations'), asyncRoute(async (_req, res) => res.json(await Donation.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/donations/:id/verify', requireAdmin, requirePermission('donations'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid donation record.' });
  const donation = await Donation.findByIdAndUpdate(req.params.id, { status: 'paid' }, { new: true });
  if (!donation) return res.status(404).json({ message: 'Donation not found.' });
  await incrementAnalytics('donation_paid', donation.paymentMethod);
  return res.json({ status: donation.status });
}));

app.get('/api/admin/enquiries', requireAdmin, requirePermission('enquiries'), asyncRoute(async (_req, res) => res.json(await Enquiry.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/enquiries/:id', requireAdmin, requirePermission('enquiries'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid enquiry record.' });
  const patch = {};
  if (['new', 'in-review', 'confirmed', 'archived'].includes(req.body.status)) patch.status = req.body.status;
  if (typeof req.body.staffNotes === 'string') patch.staffNotes = cleanText(req.body.staffNotes, 2000);
  const entry = await Enquiry.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
  if (!entry) return res.status(404).json({ message: 'Enquiry not found.' });
  return res.json(entry);
}));
app.delete('/api/admin/enquiries/:id', requireAdmin, requirePermission('enquiries'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid enquiry record.' });
  const entry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Enquiry not found.' });
  return res.status(204).end();
}));

app.get('/api/admin/media', requireAdmin, requirePermission('media'), asyncRoute(async (_req, res) => res.json(await Media.find().sort({ createdAt: -1 }).limit(500).lean())));
app.post('/api/admin/media', requireAdmin, requirePermission('media'), upload.single('file'), asyncRoute(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a file to upload.' });
  const uploaded = await putInCloudinary(req.file);
  const media = await Media.create({ publicId: uploaded.public_id, url: uploaded.secure_url, secureUrl: uploaded.secure_url, resourceType: uploaded.resource_type, format: uploaded.format || '', bytes: uploaded.bytes || req.file.size, name: req.file.originalname.slice(0, 160) });
  return res.status(201).json(media);
}));
app.delete('/api/admin/media/:publicId', requireAdmin, requirePermission('media'), asyncRoute(async (req, res) => {
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

app.get('/api/admin/stories', requireAdmin, requirePermission('stories'), asyncRoute(async (_req, res) => res.json(await Story.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/stories/:id', requireAdmin, requirePermission('stories'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid story record.' });
  const status = ['published', 'rejected', 'pending'].includes(req.body.status) ? req.body.status : '';
  if (!status) return res.status(400).json({ message: 'Choose a valid review status.' });
  if (status === 'published' && req.body.publicationCleared !== true) return res.status(400).json({ message: 'Confirm identity, consent, rights and context before publishing.' });
  const patch = { status, publicationCleared: status === 'published' };
  if (typeof req.body.contentNotice === 'string') patch.contentNotice = cleanText(req.body.contentNotice, 400);
  const story = await Story.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!story) return res.status(404).json({ message: 'Story not found.' });
  return res.json({ status: story.status, contentNotice: story.contentNotice });
}));

app.get('/api/admin/reflections', requireAdmin, requirePermission('reflections'), asyncRoute(async (_req, res) => res.json(await Reflection.find().sort({ createdAt: -1 }).limit(500).lean())));
app.patch('/api/admin/reflections/:id', requireAdmin, requirePermission('reflections'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid reflection record.' });
  const status = ['published', 'rejected', 'pending'].includes(req.body.status) ? req.body.status : '';
  if (!status) return res.status(400).json({ message: 'Choose a valid review status.' });
  if (status === 'published' && req.body.publicationCleared !== true) return res.status(400).json({ message: 'Confirm ethical review and consent before publishing to the community wall.' });
  const entry = await Reflection.findByIdAndUpdate(req.params.id, { status, publicationCleared: status === 'published' }, { new: true });
  if (!entry) return res.status(404).json({ message: 'Reflection not found.' });
  return res.json({ status: entry.status });
}));
app.delete('/api/admin/reflections/:id', requireAdmin, requirePermission('reflections'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid reflection record.' });
  const entry = await Reflection.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Reflection not found.' });
  return res.status(204).end();
}));

app.get('/api/admin/messages', requireAdmin, requirePermission('messages'), asyncRoute(async (_req, res) => {
  const threads = await MessageThread.find().sort({ updatedAt: -1 }).limit(300).lean();
  await MessageThread.updateMany({ unread: true }, { $set: { unread: false } });
  return res.json(threads);
}));
app.post('/api/admin/messages/:id/reply', requireAdmin, requirePermission('messages'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid conversation.' });
  const text = cleanText(req.body.text, 4000);
  if (!text) return res.status(400).json({ message: 'Write a reply before sending.' });
  const thread = await MessageThread.findById(req.params.id);
  if (!thread) return res.status(404).json({ message: 'Conversation not found.' });
  thread.messages.push({ from: 'team', text });
  thread.unread = false;
  await thread.save();
  return res.json({ sent: true });
}));

app.get('/api/admin/subscribers', requireAdmin, requirePermission('audience'), asyncRoute(async (_req, res) => res.json(await Subscriber.find().sort({ createdAt: -1 }).limit(1000).lean())));
app.delete('/api/admin/subscribers/:id', requireAdmin, requirePermission('audience'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid subscriber.' });
  await Subscriber.findByIdAndDelete(req.params.id);
  return res.status(204).end();
}));

app.get('/api/admin/export', requireAdmin, requirePermission('export'), asyncRoute(async (req, res) => {
  const scope = cleanText(req.query.scope || 'all', 30);
  const format = cleanText(req.query.format || 'json', 10);
  const stamp = new Date().toISOString().slice(0, 10);

  if (scope === 'donations' && format === 'csv') {
    const rows = await Donation.find().sort({ createdAt: -1 }).lean();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="she-stands-donations-${stamp}.csv"`);
    return res.send(toCsv(rows, ['createdAt', 'name', 'email', 'paymentMethod', 'currency', 'amount', 'frequency', 'designation', 'dedication', 'status', 'paymentReference', 'providerReference']));
  }
  if (scope === 'enquiries' && format === 'csv') {
    const rows = await Enquiry.find().sort({ createdAt: -1 }).lean();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="she-stands-enquiries-${stamp}.csv"`);
    return res.send(toCsv(rows, ['createdAt', 'formType', 'department', 'status', 'name', 'email', 'phone', 'organisation', 'preferredDate', 'participants', 'ageGrade', 'tourType', 'interestArea', 'relatedItem', 'message', 'staffNotes']));
  }
  if (scope === 'subscribers' && format === 'csv') {
    const rows = (await Subscriber.find().sort({ createdAt: -1 }).lean()).map((s) => ({ ...s, interests: (s.interests || []).join('; ') }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="she-stands-subscribers-${stamp}.csv"`);
    return res.send(toCsv(rows, ['createdAt', 'name', 'email', 'interests', 'consent']));
  }
  if (scope === 'content' && format === 'csv') {
    const rows = await ContentEntry.find().sort({ updatedAt: -1 }).lean();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="she-stands-content-${stamp}.csv"`);
    return res.send(toCsv(rows, ['type', 'subtype', 'status', 'cleared', 'title', 'date', 'place', 'accessionNumber', 'attribution', 'provenance', 'rights', 'owner', 'reviewDate']));
  }

  const [settings, content, donations, enquiries, stories, reflections, subscribers, media] = await Promise.all([
    Settings.findOne({ key: 'public' }).lean(),
    ContentEntry.find().sort({ updatedAt: -1 }).lean(),
    Donation.find().sort({ createdAt: -1 }).lean(),
    Enquiry.find().sort({ createdAt: -1 }).lean(),
    Story.find().sort({ createdAt: -1 }).lean(),
    Reflection.find().sort({ createdAt: -1 }).lean(),
    Subscriber.find().sort({ createdAt: -1 }).lean(),
    Media.find().sort({ createdAt: -1 }).lean()
  ]);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="she-stands-backup-${stamp}.json"`);
  return res.json({ exportedAt: new Date().toISOString(), settings, content, donations, enquiries, stories, reflections, subscribers, media });
}));

const ALLOWED_PAGE_COPY_KEYS = new Set([
  'positioningLine', 'foundationNote', 'brandPromise', 'closingCta',
  'heroTitle', 'heroIntro', 'welcomeTitle', 'welcomeBody',
  'aboutTitle', 'aboutIntro', 'whyMuseum', 'mission', 'vision',
  'galleriesTitle', 'galleriesIntro', 'collectionsTitle', 'collectionsIntro',
  'heroinesTitle', 'heroinesIntro', 'storiesTitle', 'storiesIntro',
  'educationTitle', 'educationIntro', 'researchTitle', 'researchIntro',
  'eventsTitle', 'eventsIntro', 'visitTitle', 'visitIntro',
  'visitHours', 'admissionInfo', 'directions', 'guidedToursInfo',
  'accessibilityInfo', 'photographyRules', 'visitorConduct',
  'shopTitle', 'shopIntro', 'shopOrderingNote',
  'supportTitle', 'supportIntro', 'membershipTerms',
  'newsTitle', 'newsIntro', 'pressContact',
  'contactTitle', 'contactIntro', 'address', 'phone', 'email',
  'ethicalStatement', 'copyrightPolicy', 'privacyPolicy', 'termsOfUse'
]);

const ALLOWED_IMAGE_SLOTS = new Set([
  'homeFeature', 'gallery01', 'gallery02', 'gallery03', 'gallery04', 'gallery05',
  'collectionPhotographs', 'collectionObjects', 'collectionDocuments', 'collectionOralHistories',
  'learning', 'visit', 'oralHistory'
]);

app.put('/api/admin/settings', requireAdmin, asyncRoute(async (req, res) => {
  const canEditContent = req.admin.role === 'administrator' || req.admin.permissions.includes('content') || req.admin.permissions.includes('media');
  const canEditAudience = req.admin.role === 'administrator' || req.admin.permissions.includes('audience');
  const patch = {};
  if (req.body.pageCopy && typeof req.body.pageCopy === 'object' && !Array.isArray(req.body.pageCopy)) {
    if (!canEditContent) return res.status(403).json({ message: 'Your role cannot edit public page copy.' });
    const pageCopy = {};
    for (const [key, value] of Object.entries(req.body.pageCopy)) {
      if (!ALLOWED_PAGE_COPY_KEYS.has(key) || typeof value !== 'string') return res.status(400).json({ message: `Unsupported page text field: ${key}` });
      pageCopy[key] = cleanText(value, 2000);
    }
    patch.pageCopy = pageCopy;
  }
  if (req.body.siteImages && typeof req.body.siteImages === 'object' && !Array.isArray(req.body.siteImages)) {
    if (!canEditContent) return res.status(403).json({ message: 'Your role cannot update page images.' });
    const siteImages = {};
    for (const [key, value] of Object.entries(req.body.siteImages)) {
      if (!ALLOWED_IMAGE_SLOTS.has(key) || typeof value !== 'string') return res.status(400).json({ message: 'Choose a valid page image position.' });
      const url = cleanText(value, 1200);
      if (url && !isSafeUrl(url)) return res.status(400).json({ message: 'Use a secure https image URL.' });
      siteImages[key] = url;
    }
    patch.siteImages = siteImages;
  }
  if (typeof req.body.heroImage === 'string') {
    if (!canEditContent) return res.status(403).json({ message: 'Your role cannot update the hero image.' });
    const url = cleanText(req.body.heroImage, 1200);
    if (url && !isSafeUrl(url)) return res.status(400).json({ message: 'Use a secure https image URL.' });
    patch.heroImage = url;
  }
  if (typeof req.body.heroAudio === 'string') {
    if (!canEditContent) return res.status(403).json({ message: 'Your role cannot update oral history audio.' });
    const url = cleanText(req.body.heroAudio, 1200);
    if (url && !isSafeUrl(url)) return res.status(400).json({ message: 'Use a secure https audio URL.' });
    patch.heroAudio = url;
  }
  if (Array.isArray(req.body.socials)) {
    if (!canEditAudience) return res.status(403).json({ message: 'Your role cannot update social links.' });
    if (req.body.socials.length > 12) return res.status(400).json({ message: 'You can save up to 12 social links.' });
    const socials = req.body.socials.map((item) => ({ name: cleanText(item.name, 50), url: cleanText(item.url, 500) }));
    if (socials.some((item) => !item.name || !isSafeUrl(item.url))) return res.status(400).json({ message: 'Each social link needs a name and secure https URL.' });
    patch.socials = socials;
  }
  const settings = await Settings.findOneAndUpdate({ key: 'public' }, { $set: patch, $setOnInsert: { key: 'public' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return res.json({ heroImage: settings.heroImage, heroAudio: settings.heroAudio, siteImages: settings.siteImages, pageCopy: settings.pageCopy, socials: settings.socials });
}));

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Files must be smaller than 50 MB.' : error.message });
  const status = error.status || 500;
  if (status >= 500 && !isProduction) console.error(error);
  return res.status(status).json({ message: status >= 500 ? 'Something went wrong. Please try again shortly.' : error.message });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env and start MongoDB first.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
  try { await syncGeneratedSiteImages(); }
  catch (error) { console.error(`Cloudinary site image sync failed: ${error.message}`); }
  app.listen(PORT, '0.0.0.0', () => console.log(`She Stands API listening on http://0.0.0.0:${PORT}`));
}

start().catch((error) => { console.error(`Could not start API: ${error.message}`); process.exit(1); });
