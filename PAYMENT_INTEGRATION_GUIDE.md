# Fizetési Integráció Útmutató

## PayPal Integráció

### 1. PayPal SDK Telepítése

```bash
npm install @paypal/checkout-server-sdk
npm install @paypal/react-paypal-js
```

### 2. Környezeti Változók (.env)

```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # vagy 'live' production esetén
```

### 3. PayPal API Route Létrehozása

Hozz létre egy fájlt: `app/api/payments/paypal/route.ts`

```typescript
import { NextResponse } from 'next/server'
import paypal from '@paypal/checkout-server-sdk'

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

const client = () => new paypal.core.PayPalHttpClient(environment())

export async function POST(request: Request) {
  const { orderId, amount } = await request.json()

  const requestBody = new paypal.orders.OrdersCreateRequest()
  requestBody.prefer('return=representation')
  requestBody.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'HUF',
        value: amount.toString()
      },
      description: `Order #${orderId}`
    }]
  })

  try {
    const order = await client().execute(requestBody)
    const approveLink = order.result.links.find((link: any) => link.rel === 'approve')

    return NextResponse.json({
      paypalUrl: approveLink?.href,
      paypalOrderId: order.result.id
    })
  } catch (error) {
    console.error('PayPal error:', error)
    return NextResponse.json({ error: 'PayPal payment failed' }, { status: 500 })
  }
}
```

### 4. Orders API Frissítése

A `app/api/orders/route.ts` fájlban:

```typescript
if (validatedData.paymentMethod === 'paypal') {
  // Create PayPal checkout
  const paypalRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/paypal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.orderNumber,
      amount: validatedData.totalAmount
    })
  })

  const paypalData = await paypalRes.json()
  responseData.paypalUrl = paypalData.paypalUrl

  // Save PayPal order ID
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: paypalData.paypalOrderId }
  })
}
```

### 5. PayPal Visszatérési Oldal

Hozz létre: `app/payment/success/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('token')

  useEffect(() => {
    // Capture the payment
    if (orderId) {
      fetch('/api/payments/paypal/capture', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }, [orderId])

  return (
    <div>
      <h1>Fizetés sikeres!</h1>
      <p>Köszönjük a vásárlást!</p>
    </div>
  )
}
```

---

## Revolut Integráció

### 1. Revolut Merchant API Beállítása

1. Regisztrálj a [Revolut Business](https://business.revolut.com/) oldalon
2. Engedélyezd a Merchant API-t
3. Szerezd meg az API kulcsokat

### 2. Környezeti Változók

```env
REVOLUT_API_KEY=your_api_key_here
REVOLUT_MODE=sandbox  # vagy 'live' production esetén
```

### 3. Revolut API Route

Hozz létre: `app/api/payments/revolut/route.ts`

```typescript
import { NextResponse } from 'next/server'

const REVOLUT_API_URL = process.env.REVOLUT_MODE === 'live'
  ? 'https://merchant.revolut.com/api/1.0'
  : 'https://sandbox-merchant.revolut.com/api/1.0'

export async function POST(request: Request) {
  const { orderId, amount, description } = await request.json()

  try {
    const response = await fetch(`${REVOLUT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Revolut uses cents
        currency: 'HUF',
        description: description || `Order #${orderId}`,
        merchant_order_ext_ref: orderId,
        customer_email: '', // Add customer email from session
      })
    })

    const data = await response.json()

    return NextResponse.json({
      revolutUrl: data.checkout_url,
      revolutOrderId: data.id
    })
  } catch (error) {
    console.error('Revolut error:', error)
    return NextResponse.json({ error: 'Revolut payment failed' }, { status: 500 })
  }
}
```

### 4. Orders API Frissítése Revolut-tal

```typescript
if (validatedData.paymentMethod === 'revolut') {
  const revolutRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/revolut`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.orderNumber,
      amount: validatedData.totalAmount,
      description: `Order ${order.orderNumber}`
    })
  })

  const revolutData = await revolutRes.json()
  responseData.revolutUrl = revolutData.revolutUrl

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: revolutData.revolutOrderId }
  })
}
```

### 5. Webhook Kezelés

Hozz létre: `app/api/webhooks/revolut/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()

  // Verify webhook signature
  const signature = request.headers.get('Revolut-Signature')
  // ... signature verification logic

  if (body.event === 'ORDER_COMPLETED') {
    await prisma.order.update({
      where: { paymentId: body.order_id },
      data: {
        paymentStatus: 'completed',
        status: 'processing'
      }
    })
  }

  return NextResponse.json({ received: true })
}
```

---

## Következő Lépések

1. **PayPal Developer Account**
   - Regisztrálj: https://developer.paypal.com/
   - Hozz létre sandbox app-ot
   - Másold ki a Client ID és Secret kulcsokat

2. **Revolut Business Account**
   - Regisztrálj: https://business.revolut.com/
   - Aktiváld a Merchant API-t
   - Generálj API kulcsot

3. **Tesztelés**
   - Használj sandbox/test módot
   - PayPal teszt kártyák: https://developer.paypal.com/tools/sandbox/card-testing/
   - Revolut teszt mód dokumentáció: https://developer.revolut.com/docs/merchant-api/#testing

4. **Production Deploy**
   - Válts át live környezetre
   - Frissítsd az API kulcsokat
   - Konfiguráld a webhook URL-eket
   - SSL tanúsítvány kötelező!

---

## Hasznos Linkek

- [PayPal API Dokumentáció](https://developer.paypal.com/api/rest/)
- [Revolut Merchant API](https://developer.revolut.com/docs/merchant-api/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Megjegyzés:** A jelenlegi implementáció már tartalmazza a fizetési módok választását és az utánvét opciót. A PayPal és Revolut integráció csak az API kulcsok beállítását és a fenti kód hozzáadását igényli.
