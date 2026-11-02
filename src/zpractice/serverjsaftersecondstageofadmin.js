
// const express = require('express') //express creates the server and its API routes.
// const cors = require('cors') //cors() allows your frontend development server to send requests to this backend.
// require('dotenv').config()

// const app = express()
// const PORT = process.env.PORT || 5000

// app.use(cors())
// app.use(express.json()) //express.json() lets the server read JSON data sent in requests.

// app.get('/', (req, res) => { //app.get('/') creates a test route that returns a message.
//   res.json({
//     message: 'BOKYRA payment server is running!',
//   })
// })

// app.listen(PORT, () => { //app.listen() starts the server on port 5000, unless another port is configured.
//   console.log(`BOKYRA server running at http://localhost:${PORT}`)
// })



// const express = require('express')
// const cors = require('cors')
// require('dotenv').config()

// const app = express()
// const PORT = process.env.PORT || 5000
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// app.use(cors({
//   origin: FRONTEND_URL,
// }))

// app.use(express.json())

// // Test whether the backend is running
// app.get('/', (req, res) => {
//   res.json({
//     message: 'BOKYRA payment server is running!',
//   })
// })

// // Start a Khalti Sandbox payment
// app.post('/api/khalti/initiate', async (req, res) => { //app.post('/api/khalti/initiate', ...) creates the backend route that the frontend will call.
//   try {
//     if (!process.env.KHALTI_SECRET_KEY) {
//       return res.status(500).json({
//         error: 'Khalti secret key is not configured.',
//       })
//     }

//     const orderId = `BOKYRA-${Date.now()}`

//     const khaltiResponse = await fetch( //fetch(...) sends a server-to-server request to Khalti's Sandbox API.
//       'https://dev.khalti.com/api/v2/epayment/initiate/',
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, //Authorization: Key ... authenticates the request using your private secret key.
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           return_url: `${FRONTEND_URL}/payment-result`,
//           website_url: FRONTEND_URL,
//           amount: 10000, //amount: 10000 means Rs. 100 in paisa.
//           purchase_order_id: orderId,
//           purchase_order_name: 'BOKYRA Sandbox Test Order',
//         }),
//       }
//     )

//     const data = await khaltiResponse.json()

//     if (!khaltiResponse.ok) {
//       console.error('Khalti initiation failed:', data)

//       return res.status(khaltiResponse.status).json({
//         error: 'Khalti could not initiate the payment.',
//         details: data,
//       })
//     }

//     return res.json({
//       payment_url: data.payment_url, //payment_url is the URL returned by Khalti where the customer will continue the payment.
//       pidx: data.pidx,
//       order_id: orderId,
//     })
//   } catch (error) { //The catch block handles connection or unexpected errors.
//     console.error('Payment initiation error:', error.message)

//     return res.status(500).json({
//       error: 'Unable to connect to Khalti. Please try again.',
//     })
//   }
// })

// app.listen(PORT, () => {
//   console.log(`BOKYRA server running at http://localhost:${PORT}`)
// })


const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const Database = require('better-sqlite3')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// The database file is created automatically in the server folder.
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
`)

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json({ limit: '1mb' }))

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
  if (!order || typeof order !== 'object') return 'Order details are required.'
  if (typeof order.orderId !== 'string' || !/^BKR-\d{6}$/.test(order.orderId)) return 'Invalid order number.'
  if (!order.customer || typeof order.customer !== 'object') return 'Customer details are required.'
  if (!Array.isArray(order.items) || order.items.length === 0) return 'An order must contain at least one item.'
  if (!Number.isFinite(Number(order.subtotal)) || Number(order.subtotal) < 0) return 'Invalid subtotal.'
  if (!Number.isFinite(Number(order.deliveryFee)) || Number(order.deliveryFee) < 0) return 'Invalid delivery fee.'
  if (!Number.isFinite(Number(order.total)) || Number(order.total) < 0) return 'Invalid order total.'
  return null
}

function insertOrder(order, paymentStatus, pidx = null) {
  const problem = validateOrder(order)
  if (problem) throw new Error(problem)

  const discount = Number(order.discount || 0)
  const existing = findOrderById.get(order.orderId)
  if (existing) return existing

  db.prepare(`
    INSERT INTO orders (
      order_id, customer_json, items_json, subtotal, delivery_fee, discount,
      total, payment_method, payment_status, order_status, khalti_pidx
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.orderId,
    JSON.stringify(order.customer),
    JSON.stringify(order.items),
    Number(order.subtotal),
    Number(order.deliveryFee),
    discount,
    Number(order.total),
    order.paymentMethod,
    paymentStatus,
    'pending',
    pidx
  )
  return findOrderById.get(order.orderId)
}

app.get('/', (req, res) => {
  res.json({ message: 'BOKYRA payment server is running!' })
})

// Create a persistent order for Cash on Delivery.
app.post('/api/orders', (req, res) => {
  try {
    const order = req.body.order
    const problem = validateOrder(order)
    if (problem) return res.status(400).json({ error: problem })
    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ error: 'This endpoint is for Cash on Delivery orders.' })
    }

    const existing = findOrderById.get(order.orderId)
    if (existing) return res.status(409).json({ error: 'This order number already exists.' })

    const row = insertOrder(order, 'pending')
    console.log('COD order saved to database:', row.order_id)
    return res.status(201).json({ success: true, order: publicOrder(row) })
  } catch (error) {
    console.error('Could not save COD order:', error.message)
    return res.status(500).json({ error: 'Could not save the order. Please try again.' })
  }
})

app.post('/api/khalti/initiate', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: 'Khalti secret key is not configured.' })
    }

    const order = req.body.order
    const problem = validateOrder(order)
    if (problem) return res.status(400).json({ error: problem })
    if (order.paymentMethod !== 'digital') {
      return res.status(400).json({ error: 'Invalid payment method for Khalti.' })
    }

    const existing = findOrderById.get(order.orderId)
    if (existing) return res.status(409).json({ error: 'This order number already exists. Please return to checkout.' })

    const amount = Math.round(Number(order.total) * 100)
    if (!Number.isSafeInteger(amount) || amount < 1000) {
      return res.status(400).json({ error: 'Invalid amount. The minimum payment is NPR 10.' })
    }

    const khaltiResponse = await fetch('https://dev.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: `${FRONTEND_URL}/payment-result`,
        website_url: FRONTEND_URL,
        amount,
        purchase_order_id: order.orderId,
        purchase_order_name: 'BOKYRA Sandbox Test Order',
      }),
    })

    const data = await khaltiResponse.json()
    if (!khaltiResponse.ok) {
      console.error('Khalti initiation failed:', data)
      return res.status(502).json({ error: 'Khalti could not initiate the payment.' })
    }
    if (!data.pidx || !data.payment_url) {
      return res.status(502).json({ error: 'Khalti did not return a valid payment reference.' })
    }

    insertOrder(order, 'initiated', data.pidx)
    console.log('Khalti order saved to database:', { orderId: order.orderId, pidx: data.pidx })
    return res.json({ payment_url: data.payment_url, pidx: data.pidx, order_id: order.orderId })
  } catch (error) {
    console.error('Payment initiation error:', error.message)
    return res.status(500).json({ error: error.message || 'Unable to start payment.' })
  }
})

app.post('/api/khalti/verify', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({ error: 'Khalti secret key is not configured.' })
    }

    const { pidx } = req.body
    if (typeof pidx !== 'string' || !pidx) {
      return res.status(400).json({ error: 'A valid payment reference is required.' })
    }

    const orderRow = findOrderByPidx.get(pidx)
    if (!orderRow) {
      return res.status(404).json({ error: 'No saved order matches this payment reference. Do not pay again; contact the store for review.' })
    }

    // An already verified payment can be safely returned without another lookup.
    if (orderRow.payment_status === 'paid' && orderRow.khalti_transaction_id) {
      return res.json({
        verified: true,
        status: 'Completed',
        orderId: orderRow.order_id,
        amount: Math.round(orderRow.total * 100),
        transactionId: orderRow.khalti_transaction_id,
      })
    }

    const khaltiResponse = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    })
    const data = await khaltiResponse.json()

    console.log('Khalti lookup result:', {
      orderId: orderRow.order_id,
      status: data.status,
      total_amount: data.total_amount,
    })

    if (!khaltiResponse.ok) {
      console.error('Khalti lookup failed:', data)
      return res.status(502).json({ error: 'Khalti could not verify this payment reference.' })
    }

    if (data.status !== 'Completed') {
      return res.json({ verified: false, status: data.status || 'Unknown', orderId: orderRow.order_id })
    }

    const expectedAmount = Math.round(orderRow.total * 100)
    if (Number(data.total_amount) !== expectedAmount) {
      return res.status(409).json({
        verified: false,
        status: data.status,
        error: 'The payment amount does not match the saved order. The order needs manual review.',
      })
    }

    db.prepare(`
      UPDATE orders
      SET payment_status = 'paid', khalti_transaction_id = ?, updated_at = datetime('now')
      WHERE order_id = ?
    `).run(data.transaction_id || null, orderRow.order_id)

    console.log('Payment verified and saved:', orderRow.order_id)
    return res.json({
      verified: true,
      status: data.status,
      orderId: orderRow.order_id,
      amount: Number(data.total_amount),
      transactionId: data.transaction_id,
    })
  } catch (error) {
    console.error('Payment verification error:', error.message)
    return res.status(500).json({ error: 'Unable to verify the payment. Please try again.' })
  }
})

// A small development-only read endpoint to confirm saved orders during setup.
// Admin authentication will be added before exposing admin routes in the next stage.
app.get('/api/dev/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  return res.json(rows.map(publicOrder))
})



// ---------------- ADMIN AUTHENTICATION ----------------
// Configure ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_TOKEN_SECRET in server/.env.
function createAdminToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  })).toString('base64url')
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
    return res.status(401).json({ error: 'Admin authentication required.' })
  }

  const [payloadPart, signaturePart, extra] = token.split('.')
  if (!payloadPart || !signaturePart || extra) {
    return res.status(401).json({ error: 'Invalid admin session.' })
  }

  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_TOKEN_SECRET)
    .update(payloadPart)
    .digest()
  const supplied = Buffer.from(signaturePart, 'base64url')
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ error: 'Invalid admin session.' })
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'))
    if (
      payload.username !== process.env.ADMIN_USERNAME ||
      !payload.expiresAt || payload.expiresAt < Date.now()
    ) {
      return res.status(401).json({ error: 'Admin session expired. Please sign in again.' })
    }
    req.admin = { username: payload.username }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid admin session.' })
  }
}

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

  const usernameMatches = typeof username === 'string' && username === configuredUsername
  const passwordMatches = typeof password === 'string' &&
    password.length === configuredPassword.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword))

  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({ error: 'Incorrect username or password.' })
  }

  return res.json({ token: createAdminToken(configuredUsername), username: configuredUsername })
})

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username })
})

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS paidSales,
      SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paidOrders
    FROM orders
  `).get()
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 8').all().map(publicOrder)
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

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const requestedStatus = String(req.query.status || '').toLowerCase()
  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  let rows
  if (requestedStatus && requestedStatus !== 'all') {
    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({ error: 'Invalid order status filter.' })
    }
    rows = db.prepare('SELECT * FROM orders WHERE order_status = ? ORDER BY id DESC').all(requestedStatus)
  } else {
    rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  }
  return res.json(rows.map(publicOrder))
})

app.patch('/api/admin/orders/:orderId/status', requireAdmin, (req, res) => {
  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const nextStatus = String(req.body.status || '').toLowerCase()
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ error: 'Invalid order status.' })
  }
  const existing = findOrderById.get(req.params.orderId)
  if (!existing) return res.status(404).json({ error: 'Order not found.' })
  db.prepare(`
    UPDATE orders SET order_status = ?, updated_at = datetime('now') WHERE order_id = ?
  `).run(nextStatus, req.params.orderId)
  return res.json({ success: true, order: publicOrder(findOrderById.get(req.params.orderId)) })
})


app.listen(PORT, () => {
  console.log(`BOKYRA server running at http://localhost:${PORT}`)
  console.log('SQLite database: server/bokyra.sqlite')
  console.log('Admin API available at /api/admin')
})
