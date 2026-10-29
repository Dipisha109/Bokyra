
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
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173'

const pendingPayments = new Map()
const verifiedPayments = new Map()

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'BOKYRA payment server is running!' })
})

app.post('/api/khalti/initiate', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({
        error: 'Khalti secret key is not configured.',
      })
    }

    const amount = Number(req.body.amount)

    if (!Number.isSafeInteger(amount) || amount < 1000) {
      return res.status(400).json({
        error: 'Invalid amount. The minimum payment is NPR 10.',
      })
    }

    const orderId =
      typeof req.body.orderId === 'string' &&
      /^BKR-\d{6}$/.test(req.body.orderId)
        ? req.body.orderId
        : `BKR-${String(Date.now()).slice(-6)}`

    const response = await fetch(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: `${FRONTEND_URL}/payment-result`,
          website_url: FRONTEND_URL,
          amount,
          purchase_order_id: orderId,
          purchase_order_name: 'BOKYRA Sandbox Test Order',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Khalti initiation failed:', data)
      return res.status(502).json({
        error: 'Khalti could not initiate the payment.',
      })
    }

    if (!data.pidx || !data.payment_url) {
      return res.status(502).json({
        error: 'Khalti did not return a valid payment reference.',
      })
    }

    pendingPayments.set(data.pidx, { orderId, amount })

    console.log('Khalti payment saved:', {
      pidx: data.pidx,
      orderId,
      amount,
    })

    return res.json({
      payment_url: data.payment_url,
      pidx: data.pidx,
      order_id: orderId,
    })
  } catch (error) {
    console.error('Payment initiation error:', error.message)
    return res.status(500).json({
      error: 'Unable to connect to Khalti. Please try again.',
    })
  }
})

app.post('/api/khalti/verify', async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({
        error: 'Khalti secret key is not configured.',
      })
    }

    const { pidx, recoveryOrderId, recoveryAmount } = req.body

    if (typeof pidx !== 'string' || !pidx) {
      return res.status(400).json({
        error: 'A valid payment reference is required.',
      })
    }

    const previousResult = verifiedPayments.get(pidx)

    if (previousResult) {
      return res.json(previousResult)
    }

    const pendingPayment = pendingPayments.get(pidx)

    // Recovery values are only for this local demo when the server
    // restarted and lost its temporary pending payment record.
    const recoveryIsValid =
      !pendingPayment &&
      typeof recoveryOrderId === 'string' &&
      /^BKR-\d{6}$/.test(recoveryOrderId) &&
      Number.isSafeInteger(Number(recoveryAmount)) &&
      Number(recoveryAmount) >= 1000

    if (!pendingPayment && !recoveryIsValid) {
      return res.status(404).json({
        error:
          'Payment record is missing. Order details are required for recovery.',
      })
    }

    const expectedOrderId = pendingPayment
      ? pendingPayment.orderId
      : recoveryOrderId

    const expectedAmount = pendingPayment
      ? pendingPayment.amount
      : Number(recoveryAmount)

    console.log('Verifying Khalti payment:', {
      pidx,
      recordFound: Boolean(pendingPayment),
      orderId: expectedOrderId,
      expectedAmount,
    })

    const response = await fetch(
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

    const data = await response.json()

    console.log('Khalti lookup result:', {
      status: data.status,
      total_amount: data.total_amount,
      transaction_id: data.transaction_id,
    })

    if (!response.ok) {
      console.error('Khalti lookup failed:', data)
      return res.status(502).json({
        error: 'Khalti could not verify this payment reference.',
      })
    }

    if (data.status !== 'Completed') {
      return res.json({
        verified: false,
        status: data.status || 'Unknown',
        orderId: expectedOrderId,
      })
    }

    if (Number(data.total_amount) !== expectedAmount) {
      return res.status(409).json({
        verified: false,
        status: data.status,
        error:
          'The payment amount does not match the expected order total. The order needs manual review.',
      })
    }

    const result = {
      verified: true,
      status: data.status,
      orderId: expectedOrderId,
      amount: Number(data.total_amount),
      transactionId: data.transaction_id,
      recovered: !pendingPayment,
    }

    verifiedPayments.set(pidx, result)
    pendingPayments.delete(pidx)

    console.log('Khalti payment verified:', {
      orderId: result.orderId,
      recovered: result.recovered,
    })

    return res.json(result)
  } catch (error) {
    console.error('Payment verification error:', error.message)
    return res.status(500).json({
      error: 'Unable to verify payment. Please try again.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`BOKYRA server running at http://localhost:${PORT}`)
})
