
// import { useEffect, useState } from 'react'
// import { Link, useNavigate, useSearchParams } from 'react-router-dom'
// import { useShop } from '../context/ShopContext'

// function PaymentResult() {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { clearCart } = useShop()

//   const pidx = searchParams.get('pidx')

//   const [message, setMessage] = useState('Verifying your payment...')
//   const [paymentStatus, setPaymentStatus] = useState('checking')

//   useEffect(() => {
//     let cancelled = false

//     async function verifyPayment() {
//       if (!pidx) {
//         setMessage('No payment reference was found in the return URL.')
//         setPaymentStatus('failed')
//         return
//       }

//       try {
//         // Read the saved order before contacting the backend.
//         const savedOrder = JSON.parse(
//           localStorage.getItem('bokyra_latest_order') || 'null'
//         )

//         if (
//           !savedOrder ||
//           savedOrder.khaltiPidx !== pidx ||
//           !savedOrder.orderId ||
//           !Number.isFinite(Number(savedOrder.total))
//         ) {
//           throw new Error(
//             'The saved BOKYRA order could not be matched to this payment. Please do not pay again.'
//           )
//         }

//         // Ask the backend to verify the payment directly with Khalti.
//         // Recovery details are used if the server lost its temporary record.
//         const response = await fetch(
//           'http://localhost:5000/api/khalti/verify',
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               pidx,
//               recoveryOrderId: savedOrder.orderId,
//               recoveryAmount: Math.round(Number(savedOrder.total) * 100),
//             }),
//           }
//         )

//         const data = await response.json()

//         if (!response.ok) {
//           throw new Error(
//             data.error || 'The payment could not be verified.'
//           )
//         }

//         if (cancelled) return

//         if (!data.verified) {
//           setMessage(
//             `Khalti has not confirmed a completed payment. Status: ${data.status || 'Unknown'}. Do not make another payment until the existing transaction has been checked.`
//           )
//           setPaymentStatus('failed')
//           return
//         }

//         // Match the verified backend result to the saved order.
//         if (
//           savedOrder.khaltiPidx !== pidx ||
//           savedOrder.orderId !== data.orderId ||
//           Number(data.amount) !== Math.round(Number(savedOrder.total) * 100)
//         ) {
//           setMessage(
//             'Khalti returned a payment result, but it did not match the saved BOKYRA order and amount. Please keep your payment reference and contact the store. Do not pay again.'
//           )
//           setPaymentStatus('review')
//           return
//         }

//         // Update the order only after backend verification succeeds.
//         savedOrder.paymentStatus = 'paid'
//         savedOrder.khaltiTransactionId = data.transactionId
//         savedOrder.paymentOrderId = data.orderId

//         localStorage.setItem(
//           'bokyra_latest_order',
//           JSON.stringify(savedOrder)
//         )

//         clearCart()

//         setMessage(
//           'Your Khalti Sandbox payment was verified successfully!'
//         )
//         setPaymentStatus('success')
//       } catch (error) {
//         if (cancelled) return

//         setMessage(
//           error.message ||
//             'Unable to verify the payment. Please try again.'
//         )
//         setPaymentStatus('failed')
//       }
//     }

//     verifyPayment()

//     return () => {
//       cancelled = true
//     }
//   }, [pidx, clearCart])

//   return (
//     <main
//       className="container"
//       style={{
//         padding: '80px 20px',
//         textAlign: 'center',
//       }}
//     >
//       <h1>
//         {paymentStatus === 'checking'
//           ? 'Checking Payment'
//           : paymentStatus === 'success'
//             ? 'Payment Successful!'
//             : paymentStatus === 'review'
//               ? 'Order Needs Review'
//               : 'Payment Not Confirmed'}
//       </h1>

//       <p role="status" style={{ margin: '20px 0' }}>
//         {message}
//       </p>

//       {paymentStatus === 'success' && (
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={() =>
//             navigate('/order-confirmation', { replace: true })
//           }
//         >
//           VIEW ORDER CONFIRMATION
//         </button>
//       )}

//       {paymentStatus === 'failed' && (
//         <Link to="/checkout" className="btn btn-primary">
//           RETURN TO CHECKOUT
//         </Link>
//       )}

//       {paymentStatus === 'review' && (
//         <Link to="/shop" className="btn btn-primary">
//           RETURN TO SHOP
//         </Link>
//       )}
//     </main>
//   )
// }

// export default PaymentResult


import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useShop()

  const pidx = searchParams.get('pidx')

  const [message, setMessage] = useState('Verifying your payment...')
  const [paymentStatus, setPaymentStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function verifyPayment() {
      if (!pidx) {
        setMessage('No payment reference was found in the return URL.')
        setPaymentStatus('failed')
        return
      }

      try {
        // Read the saved order before contacting the backend.
        const savedOrder = JSON.parse(
          localStorage.getItem('bokyra_latest_order') || 'null'
        )

        if (
          !savedOrder ||
          savedOrder.khaltiPidx !== pidx ||
          !savedOrder.orderId ||
          !Number.isFinite(Number(savedOrder.total))
        ) {
          throw new Error(
            'The saved BOKYRA order could not be matched to this payment. Please do not pay again.'
          )
        }

        // Ask the backend to verify the payment directly with Khalti.
        // Recovery details are used if the server lost its temporary record.
        const response = await fetch(
          'http://localhost:5000/api/khalti/verify',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pidx }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || 'The payment could not be verified.'
          )
        }

        if (cancelled) return

        if (!data.verified) {
          setMessage(
            `Khalti has not confirmed a completed payment. Status: ${data.status || 'Unknown'}. Do not make another payment until the existing transaction has been checked.`
          )
          setPaymentStatus('failed')
          return
        }

        // Match the verified backend result to the saved order.
        if (
          savedOrder.khaltiPidx !== pidx ||
          savedOrder.orderId !== data.orderId ||
          Number(data.amount) !== Math.round(Number(savedOrder.total) * 100)
        ) {
          setMessage(
            'Khalti returned a payment result, but it did not match the saved BOKYRA order and amount. Please keep your payment reference and contact the store. Do not pay again.'
          )
          setPaymentStatus('review')
          return
        }

        // Update the order only after backend verification succeeds.
        savedOrder.paymentStatus = 'paid'
        savedOrder.khaltiTransactionId = data.transactionId
        savedOrder.paymentOrderId = data.orderId

        localStorage.setItem(
          'bokyra_latest_order',
          JSON.stringify(savedOrder)
        )

        clearCart()

        setMessage(
          'Your Khalti Sandbox payment was verified successfully!'
        )
        setPaymentStatus('success')
      } catch (error) {
        if (cancelled) return

        setMessage(
          error.message ||
            'Unable to verify the payment. Please try again.'
        )
        setPaymentStatus('failed')
      }
    }

    verifyPayment()

    return () => {
      cancelled = true
    }
  }, [pidx, clearCart])

  return (
    <main
      className="container"
      style={{
        padding: '80px 20px',
        textAlign: 'center',
      }}
    >
      <h1>
        {paymentStatus === 'checking'
          ? 'Checking Payment'
          : paymentStatus === 'success'
            ? 'Payment Successful!'
            : paymentStatus === 'review'
              ? 'Order Needs Review'
              : 'Payment Not Confirmed'}
      </h1>

      <p role="status" style={{ margin: '20px 0' }}>
        {message}
      </p>

      {paymentStatus === 'success' && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate('/order-confirmation', { replace: true })
          }
        >
          VIEW ORDER CONFIRMATION
        </button>
      )}

      {paymentStatus === 'failed' && (
        <Link to="/checkout" className="btn btn-primary">
          RETURN TO CHECKOUT
        </Link>
      )}

      {paymentStatus === 'review' && (
        <Link to="/shop" className="btn btn-primary">
          RETURN TO SHOP
        </Link>
      )}
    </main>
  )
}

export default PaymentResult
