## airwallex

Airwallex Nodejs SDK

### Install

```sh
$ npm i airwallex --save
```

### Usage

```js
const Airwallex = require('airwallex')
const airwallexClient = new Airwallex({
  clientId: 'xxx', // CLIENT ID
  clientSecret: 'xxx', // API KEY
  environment: 'sandbox' // sandbox|production
})

;(async () => {
  const balanceRes = await airwallexClient.execute({
    method: 'get',
    url: '/api/v1/balances/current'
  })
  /*
  [
    {
      available_amount: 100,
      currency: 'USD',
      pending_amount: 0,
      reserved_amount: 0,
      total_amount: 100
    },
    ...
  ]
   */
  console.log(balanceRes)

  const createPaymentIntentRes = await airwallexClient.execute({
    method: 'post',
    url: '/api/v1/pa/payment_intents/create',
    body: {
      amount: 0.99,
      currency: 'USD',
      merchant_order_id: '1',
      request_id: '64d280f6-4852-44d2-9572-5f19ed2c0a11'
    }
  })
  /*
  {
    id: 'int_hkpdpqj9rgnwvaqu8a2',
    request_id: '64d280f6-4852-44d2-9572-5f19ed2c0a11',
    amount: 0.99,
    currency: 'USD',
    merchant_order_id: '1',
    status: 'REQUIRES_PAYMENT_METHOD',
    captured_amount: 0,
    created_at: '2023-08-19T04:50:17+0000',
    updated_at: '2023-08-19T04:50:17+0000',
    available_payment_method_types: [ 'card', 'googlepay', 'applepay' ],
    client_secret: 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTI0MjA2MTcsImV4cCI6MTY5MjQyNDIxNywidHlwZSI6ImNsaWVudC1zZWNyZXQiLCJwYWRjIjoiSEsiLCJhY2NvdW50X2lkIjoiN2YzMWY2NjctNzNlNi00NWRkLTg0NzMtODY1MzhmNWNjYzViIiwiaW50ZW50X2lkIjoiaW50X2hrcGRwcWo5cmdud3ZhcXU4YTIiLJJidXNpbmVzc19uYW1ljjoiQmlnZ20gQ28uLCBMaW1pdGVkIn0.oZgtLFrT4Lm1vb9UR0TmLhaMW__6C17kErfFcoOC-rU',
    base_amount: 0.99
  }
   */
  console.log(createPaymentIntentRes)
})().catch(console.error)
```
