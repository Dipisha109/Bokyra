
process.on('unhandledRejection', (reason) => {
  console.error('[BOKYRA] Unhandled promise rejection:', reason)
})

const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const Database = require('better-sqlite3')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ---------------- DATABASE ----------------

const db = new Database('bokyra.sqlite')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL UNIQUE,
    customer_json TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'pending',
    khalti_pidx TEXT UNIQUE,
    khalti_transaction_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL COLLATE NOCASE UNIQUE,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    minimum_subtotal REAL NOT NULL DEFAULT 0,
    expiry_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Safely add promo_code to an existing orders table.
// Existing order records are preserved.
const orderColumns = db.prepare('PRAGMA table_info(orders)').all()
if (!orderColumns.some((column) => column.name === 'promo_code')) {
  db.exec('ALTER TABLE orders ADD COLUMN promo_code TEXT')
}

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json({ limit: '1mb' }))

// ---------------- ORDER HELPERS ----------------

const findOrderById = db.prepare('SELECT * FROM orders WHERE order_id = ?')
const findOrderByPidx = db.prepare('SELECT * FROM orders WHERE khalti_pidx = ?')

function publicOrder(row) {
  if (!row) return null

  return {
    orderId: row.order_id,
    customer: JSON.parse(row.customer_json),
    items: JSON.parse(row.items_json),
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discount: row.discount,
    promoCode: row.promo_code || null,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    khaltiPidx: row.khalti_pidx,
    khaltiTransactionId: row.khalti_transaction_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function validateOrder(order) {
  if (!order || typeof order !== 'object') {
    return 'Order details are required.'
  }

  if (
    typeof order.orderId !== 'string' ||
    !/^BKR-\d{6}$/.test(order.orderId)
  ) {
    return 'Invalid order number.'
  }

  if (!order.customer || typeof order.customer !== 'object') {
    return 'Customer details are required.'
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return 'An order must contain at least one item.'
  }

  if (
    !Number.isFinite(Number(order.subtotal)) ||
    Number(order.subtotal) < 0
  ) {
    return 'Invalid subtotal.'
  }

  if (
    !Number.isFinite(Number(order.deliveryFee)) ||
    Number(order.deliveryFee) < 0
  ) {
    return 'Invalid delivery fee.'
  }

  if (
    !Number.isFinite(Number(order.total)) ||
    Number(order.total) < 0
  ) {
    return 'Invalid order total.'
  }

  return null
}

// ---------------- PROMOTION HELPERS ----------------

const findPromotionByCode = db.prepare(`
  SELECT * FROM promotions
  WHERE code = ? COLLATE NOCASE
`)

function validatePromotionInput(data) {
  if (!data || typeof data !== 'object') {
    return 'Promotion details are required.'
  }

  const code = String(data.code || '').trim().toUpperCase()

  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
    return 'Code must contain 3–20 letters, numbers, underscores, or hyphens.'
  }

  if (!['percentage', 'fixed'].includes(data.discountType)) {
    return 'Discount type must be percentage or fixed.'
  }

  const value = Number(data.discountValue)
  if (!Number.isFinite(value) || value <= 0) {
    return 'Discount value must be greater than zero.'
  }

  if (data.discountType === 'percentage' && value > 100) {
    return 'Percentage discount cannot exceed 100%.'
  }

  const minimumSubtotal = Number(data.minimumSubtotal ?? 0)
  if (!Number.isFinite(minimumSubtotal) || minimumSubtotal < 0) {
    return 'Minimum subtotal must be zero or greater.'
  }

  let expiryDate = null

  if (data.expiryDate) {
    expiryDate = String(data.expiryDate)

    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      return 'Expiry date must use YYYY-MM-DD format.'
    }

    const parsedDate = new Date(`${expiryDate}T00:00:00Z`)

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== expiryDate
    ) {
      return 'Please enter a valid expiry date.'
    }

    const today = new Date().toISOString().slice(0, 10)

    if (expiryDate < today) {
      return 'Expiry date cannot be in the past.'
    }
  }

  return {
    code,
    discountType: data.discountType,
    discountValue: value,
    minimumSubtotal,
    expiryDate,
  }
}

function getPromotionDiscount(code, subtotal) {
  if (!code) {
    return {
      valid: true,
      promoCode: null,
      discount: 0,
    }
  }

  const normalizedCode = String(code).trim().toUpperCase()

  if (!/^[A-Z0-9_-]{3,20}$/.test(normalizedCode)) {
    return {
      valid: false,
      error: 'Invalid promo code format.',
    }
  }

  const promotion = findPromotionByCode.get(normalizedCode)

  if (!promotion || !promotion.is_active) {
    return {
      valid: false,
      error: 'This promo code is invalid or inactive.',
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  if (promotion.expiry_date && promotion.expiry_date < today) {
    return {
      valid: false,
      error: 'This promo code has expired.',
    }
  }

  if (subtotal < promotion.minimum_subtotal) {
    return {
      valid: false,
      error: `Minimum order subtotal is NPR ${promotion.minimum_subtotal}.`,
    }
  }

  let discount = 0

  if (promotion.discount_type === 'percentage') {
    discount = subtotal * (promotion.discount_value / 100)
  } else {
    discount = promotion.discount_value
  }

  // A discount cannot exceed the subtotal.
  discount = Math.min(discount, subtotal)
  discount = Math.round((discount + Number.EPSILON) * 100) / 100

  return {
    valid: true,
    promoCode: promotion.code,
    discount,
    promotion: {
      code: promotion.code,
      discountType: promotion.discount_type,
      discountValue: promotion.discount_value,
    },
  }
}

// Recalculate the order on the server.
// The frontend's submitted discount and total are never trusted.
function calculateOrderPricing(order) {
  const subtotal = Number(order.subtotal)
  const deliveryFee = Number(order.deliveryFee)
  const requestedCode = String(order.promoCode || '').trim()

  const promotionResult = getPromotionDiscount(requestedCode, subtotal)

  if (!promotionResult.valid) {
    throw new Error(promotionResult.error)
  }

  const discount = promotionResult.discount
  const total = Math.max(0, subtotal + deliveryFee - discount)

  return {
    ...order,
    subtotal,
    deliveryFee,
    discount,
    promoCode: promotionResult.promoCode,
    total: Math.round((total + Number.EPSILON) * 100) / 100,
  }
}

// ---------------- ORDER INSERTION ----------------

function insertOrder(order, paymentStatus, pidx = null) {
  const problem = validateOrder(order)
  if (problem) throw new Error(problem)

  const existing = findOrderById.get(order.orderId)
  if (existing) throw new Error('This order number already exists.')

  db.prepare(`
    INSERT INTO orders (
      order_id,
      customer_json,
      items_json,
      subtotal,
      delivery_fee,
      discount,
      promo_code,
      total,
      payment_method,
      payment_status,
      order_status,
      khalti_pidx
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.orderId,
    JSON.stringify(order.customer),
    JSON.stringify(order.items),
    order.subtotal,
    order.deliveryFee,
    order.discount,
    order.promoCode,
    order.total,
    order.paymentMethod,
    paymentStatus,
    'pending',
    pidx
  )

  return findOrderById.get(order.orderId)
}

// ---------------- GENERAL ROUTES ----------------

app.get('/', (req, res) => {
  res.json({ message: 'BOKYRA payment server is running!' })
})

// ---------------- PUBLIC PROMOTION VALIDATION ----------------

app.post('/api/promotions/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body || {}

    const amount = Number(subtotal)

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Invalid subtotal.' })
    }

    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: 'Please enter a promo code.' })
    }

    const result = getPromotionDiscount(code, amount)

    if (!result.valid) {
      return res.status(400).json({ error: result.error })
    }

    return res.json({
      valid: true,
      promoCode: result.promoCode,
      discount: result.discount,
      promotion: result.promotion,
    })
  } catch (error) {
    console.error('Promotion validation error:', error.message)
    return res.status(500).json({ error: 'Could not validate promo code.' })
  }
})

// ---------------- CASH ON DELIVERY ----------------

app.post('/api/orders', (req, res) => {
  try {
    const originalOrder = req.body.order
    const problem = validateOrder(originalOrder)

    if (problem) {
      return res.status(400).json({ error: problem })
    }

    if (originalOrder.paymentMethod !== 'cod') {
      return res.status(400).json({
        error: 'This endpoint is for Cash on Delivery orders.',
      })
    }

    if (findOrderById.get(originalOrder.orderId)) {
      return res.status(409).json({
        error: 'This order number already exists.',
      })
    }

    const order = calculateOrderPricing(originalOrder)
    const row = insertOrder(order, 'pending')

    console.log('COD order saved to database:', row.order_id)

    return res.status(201).json({
      success: true,
      order: publicOrder(row),
    })
  } catch (error) {
    console.error('Could not save COD order:', error.message)

    return res.status(400).json({
      error: error.message || 'Could not save the order.',
    })
  }
})

// ---------------- KHALTI INITIATION ----------------

app.post('/api/khalti/initiate', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({
        error: 'Khalti secret key is not configured.',
      })
    }

    const originalOrder = req.body.order
    const problem = validateOrder(originalOrder)

    if (problem) {
      return res.status(400).json({ error: problem })
    }

    if (originalOrder.paymentMethod !== 'digital') {
      return res.status(400).json({
        error: 'Invalid payment method for Khalti.',
      })
    }

    if (findOrderById.get(originalOrder.orderId)) {
      return res.status(409).json({
        error: 'This order number already exists. Please return to checkout.',
      })
    }

    // Calculate the final amount on the backend.
    const order = calculateOrderPricing(originalOrder)
    const amount = Math.round(order.total * 100)

    if (!Number.isSafeInteger(amount) || amount < 1000) {
      return res.status(400).json({
        error: 'Invalid amount. The minimum payment is NPR 10.',
      })
    }

    const returnUrl = `${FRONTEND_URL}/payment-result`
    console.log('[Khalti] Initiating payment. Return URL:', returnUrl)
    console.log('[Khalti] Amount in paisa:', amount, '| Order:', order.orderId)

    const khaltiResponse = await fetch(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: returnUrl,
          website_url: FRONTEND_URL,
          amount,
          purchase_order_id: order.orderId,
          purchase_order_name: 'BOKYRA Bag Order',
        }),
      }
    )

    const data = await khaltiResponse.json()

    if (!khaltiResponse.ok) {
      console.error(
        '[Khalti] Initiation failed. HTTP', khaltiResponse.status,
        '| Body:', JSON.stringify(data)
      )
      const detail = data?.detail || data?.error_key || JSON.stringify(data)
      return res.status(502).json({
        error: `Khalti could not initiate the payment: ${detail}`,
      })
    }

    if (!data.pidx || !data.payment_url) {
      console.error('[Khalti] Initiation OK but missing pidx/payment_url:', data)
      return res.status(502).json({
        error: 'Khalti did not return a valid payment reference.',
      })
    }

    insertOrder(order, 'initiated', data.pidx)

    console.log('[Khalti] Order saved to database:', {
      orderId: order.orderId,
      pidx: data.pidx,
      amountNPR: order.total,
      amountPaisa: amount,
      promoCode: order.promoCode || 'none',
    })

    return res.json({
      payment_url: data.payment_url,
      pidx: data.pidx,
      order_id: order.orderId,
      order: {
        discount: order.discount,
        promoCode: order.promoCode,
        total: order.total,
      },
    })
  } catch (error) {
    console.error('[Khalti] Payment initiation exception:', error.message, error.stack)

    return res.status(500).json({
      error: error.message || 'Unable to start payment.',
    })
  }
})

// ---------------- KHALTI VERIFICATION ----------------

app.post('/api/khalti/verify', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({
        error: 'Khalti secret key is not configured.',
      })
    }

    const { pidx } = req.body

    if (typeof pidx !== 'string' || !pidx) {
      return res.status(400).json({
        error: 'A valid payment reference is required.',
      })
    }

    const orderRow = findOrderByPidx.get(pidx)

    if (!orderRow) {
      return res.status(404).json({
        error: 'No saved order matches this payment reference. Do not pay again; contact the store for review.',
      })
    }

    if (
      orderRow.payment_status === 'paid' &&
      orderRow.khalti_transaction_id
    ) {
      return res.json({
        verified: true,
        status: 'Completed',
        orderId: orderRow.order_id,
        amount: Math.round(orderRow.total * 100),
        transactionId: orderRow.khalti_transaction_id,
      })
    }

    console.log('[Khalti] Looking up pidx:', pidx, '| Order:', orderRow.order_id)

    const khaltiResponse = await fetch(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      }
    )

    const data = await khaltiResponse.json()

    console.log('[Khalti] Lookup result:', {
      orderId: orderRow.order_id,
      httpStatus: khaltiResponse.status,
      status: data.status,
      total_amount: data.total_amount,
    })

    if (!khaltiResponse.ok) {
      // Khalti itself returned 4xx/5xx — log the full body for diagnosis
      console.error(
        '[Khalti] Lookup failed. HTTP', khaltiResponse.status,
        '| Body:', JSON.stringify(data)
      )
      const detail = data?.detail || data?.error_key || JSON.stringify(data)
      return res.status(502).json({
        verified: false,
        status: 'LookupFailed',
        error: `Khalti lookup failed (HTTP ${khaltiResponse.status}): ${detail}`,
      })
    }

    if (data.status !== 'Completed') {
      console.log('[Khalti] Payment not completed. Status:', data.status, '| Order:', orderRow.order_id)
      return res.json({
        verified: false,
        status: data.status || 'Unknown',
        orderId: orderRow.order_id,
      })
    }

    const expectedAmount = Math.round(orderRow.total * 100)
    const receivedAmount = Number(data.total_amount)

    if (receivedAmount !== expectedAmount) {
      console.error(
        '[Khalti] Amount mismatch! Expected paisa:', expectedAmount,
        '| Received paisa:', receivedAmount,
        '| Order:', orderRow.order_id
      )
      return res.status(409).json({
        verified: false,
        status: data.status,
        error: `Payment amount mismatch (expected ${expectedAmount} paisa, got ${receivedAmount} paisa). Manual review required.`,
      })
    }

    db.prepare(`
      UPDATE orders
      SET
        payment_status = 'paid',
        order_status = 'processing',
        khalti_transaction_id = ?,
        updated_at = datetime('now')
      WHERE order_id = ?
    `).run(data.transaction_id || null, orderRow.order_id)

    console.log('[Khalti] Payment verified and order updated to processing:', orderRow.order_id)

    return res.json({
      verified: true,
      status: data.status,
      orderId: orderRow.order_id,
      amount: receivedAmount,
      transactionId: data.transaction_id,
    })
  } catch (error) {
    console.error('[Khalti] Verification exception:', error.message, error.stack)

    return res.status(500).json({
      error: 'Unable to verify the payment. Please try again or contact support.',
    })
  }
})

// ---------------- DEVELOPMENT ORDER ROUTE ----------------

app.get('/api/dev/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  return res.json(rows.map(publicOrder))
})

// ---------------- ADMIN AUTHENTICATION ----------------

function createAdminToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    })
  ).toString('base64url')

  const signature = crypto
    .createHmac('sha256', process.env.ADMIN_TOKEN_SECRET)
    .update(payload)
    .digest('base64url')

  return `${payload}.${signature}`
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!token || !process.env.ADMIN_TOKEN_SECRET) {
    return res.status(401).json({
      error: 'Admin authentication required.',
    })
  }

  const [payloadPart, signaturePart, extra] = token.split('.')

  if (!payloadPart || !signaturePart || extra) {
    return res.status(401).json({
      error: 'Invalid admin session.',
    })
  }

  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_TOKEN_SECRET)
    .update(payloadPart)
    .digest()

  const supplied = Buffer.from(signaturePart, 'base64url')

  if (
    supplied.length !== expected.length ||
    !crypto.timingSafeEqual(supplied, expected)
  ) {
    return res.status(401).json({
      error: 'Invalid admin session.',
    })
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf8')
    )

    if (
      payload.username !== process.env.ADMIN_USERNAME ||
      !payload.expiresAt ||
      payload.expiresAt < Date.now()
    ) {
      return res.status(401).json({
        error: 'Admin session expired. Please sign in again.',
      })
    }

    req.admin = { username: payload.username }
    return next()
  } catch {
    return res.status(401).json({
      error: 'Invalid admin session.',
    })
  }
}

// ---------------- ADMIN LOGIN ----------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {}

  const configuredUsername = process.env.ADMIN_USERNAME
  const configuredPassword = process.env.ADMIN_PASSWORD
  const tokenSecret = process.env.ADMIN_TOKEN_SECRET

  if (!configuredUsername || !configuredPassword || !tokenSecret) {
    return res.status(503).json({
      error: 'Admin login is not configured. Add ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_TOKEN_SECRET to server/.env.',
    })
  }

  const usernameMatches =
    typeof username === 'string' &&
    username === configuredUsername

  const passwordMatches =
    typeof password === 'string' &&
    password.length === configuredPassword.length &&
    crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(configuredPassword)
    )

  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({
      error: 'Incorrect username or password.',
    })
  }

  return res.json({
    token: createAdminToken(configuredUsername),
    username: configuredUsername,
  })
})

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username })
})

// ---------------- ADMIN DASHBOARD ----------------

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END),
        0
      ) AS paidSales,
      SUM(
        CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END
      ) AS pendingOrders,
      SUM(
        CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END
      ) AS deliveredOrders,
      SUM(
        CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END
      ) AS paidOrders
    FROM orders
  `).get()

  const recentOrders = db
    .prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 8')
    .all()
    .map(publicOrder)

  res.json({
    stats: {
      totalOrders: stats.totalOrders || 0,
      paidSales: stats.paidSales || 0,
      pendingOrders: stats.pendingOrders || 0,
      deliveredOrders: stats.deliveredOrders || 0,
      paidOrders: stats.paidOrders || 0,
    },
    recentOrders,
  })
})

// ---------------- ADMIN ORDER MANAGEMENT ----------------

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const requestedStatus = String(req.query.status || '').toLowerCase()

  const allowedStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]

  let rows

  if (requestedStatus && requestedStatus !== 'all') {
    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        error: 'Invalid order status filter.',
      })
    }

    rows = db.prepare(`
      SELECT * FROM orders
      WHERE order_status = ?
      ORDER BY id DESC
    `).all(requestedStatus)
  } else {
    rows = db.prepare(`
      SELECT * FROM orders ORDER BY id DESC
    `).all()
  }

  return res.json(rows.map(publicOrder))
})

app.patch('/api/admin/orders/:orderId/status', requireAdmin, (req, res) => {
  const allowedStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]

  const nextStatus = String(req.body.status || '').toLowerCase()

  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({
      error: 'Invalid order status.',
    })
  }

  const existing = findOrderById.get(req.params.orderId)

  if (!existing) {
    return res.status(404).json({
      error: 'Order not found.',
    })
  }

  db.prepare(`
    UPDATE orders
    SET order_status = ?, updated_at = datetime('now')
    WHERE order_id = ?
  `).run(nextStatus, req.params.orderId)

  return res.json({
    success: true,
    order: publicOrder(findOrderById.get(req.params.orderId)),
  })
})

// ---------------- ADMIN PROMOTION MANAGEMENT ----------------

// Get all promotions.
app.get('/api/admin/promotions', requireAdmin, (req, res) => {
  const promotions = db.prepare(`
    SELECT * FROM promotions ORDER BY id DESC
  `).all()

  return res.json(promotions)
})

// Create a promotion.
app.post('/api/admin/promotions', requireAdmin, (req, res) => {
  const result = validatePromotionInput(req.body)

  if (typeof result === 'string') {
    return res.status(400).json({ error: result })
  }

  try {
    const insert = db.prepare(`
      INSERT INTO promotions (
        code,
        discount_type,
        discount_value,
        minimum_subtotal,
        expiry_date,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, 1)
    `)

    const info = insert.run(
      result.code,
      result.discountType,
      result.discountValue,
      result.minimumSubtotal,
      result.expiryDate
    )

    const promotion = db.prepare(`
      SELECT * FROM promotions WHERE id = ?
    `).get(info.lastInsertRowid)

    return res.status(201).json({
      success: true,
      promotion,
    })
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'A promo code with this name already exists.',
      })
    }

    console.error('Could not create promotion:', error.message)

    return res.status(500).json({
      error: 'Could not create promotion.',
    })
  }
})

// Edit a promotion.
app.put('/api/admin/promotions/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Invalid promotion ID.',
    })
  }

  const existing = db.prepare(`
    SELECT * FROM promotions WHERE id = ?
  `).get(id)

  if (!existing) {
    return res.status(404).json({
      error: 'Promotion not found.',
    })
  }

  const result = validatePromotionInput(req.body)

  if (typeof result === 'string') {
    return res.status(400).json({ error: result })
  }

  try {
    db.prepare(`
      UPDATE promotions
      SET
        code = ?,
        discount_type = ?,
        discount_value = ?,
        minimum_subtotal = ?,
        expiry_date = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      result.code,
      result.discountType,
      result.discountValue,
      result.minimumSubtotal,
      result.expiryDate,
      id
    )

    const promotion = db.prepare(`
      SELECT * FROM promotions WHERE id = ?
    `).get(id)

    return res.json({
      success: true,
      promotion,
    })
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'A promo code with this name already exists.',
      })
    }

    console.error('Could not update promotion:', error.message)

    return res.status(500).json({
      error: 'Could not update promotion.',
    })
  }
})

// Enable or disable a promotion.
app.patch('/api/admin/promotions/:id/toggle', requireAdmin, (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Invalid promotion ID.',
    })
  }

  const existing = db.prepare(`
    SELECT * FROM promotions WHERE id = ?
  `).get(id)

  if (!existing) {
    return res.status(404).json({
      error: 'Promotion not found.',
    })
  }

  const nextStatus = existing.is_active ? 0 : 1

  db.prepare(`
    UPDATE promotions
    SET is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(nextStatus, id)

  const promotion = db.prepare(`
    SELECT * FROM promotions WHERE id = ?
  `).get(id)

  return res.json({
    success: true,
    promotion,
  })
})

// ---------------- START SERVER ----------------

app.listen(PORT, () => {
  console.log(`BOKYRA server running at http://localhost:${PORT}`)
  console.log('SQLite database: server/bokyra.sqlite')
  console.log('Admin API available at /api/admin')
})
