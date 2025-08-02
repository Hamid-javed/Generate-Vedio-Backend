# Netopia Payment Integration

This document describes the complete Netopia payment integration for the Santa Video Node.js backend.

## Overview

The payment system has been completely migrated from Stripe to Netopia, providing seamless payment processing for Romanian customers using RON currency.

## Features

- ✅ **Complete Stripe Removal**: All Stripe dependencies and references have been removed
- ✅ **Netopia Integration**: Full integration with Netopia payment gateway
- ✅ **Order Management**: Enhanced Order model with payment tracking
- ✅ **Webhook Handling**: Secure webhook processing with signature verification
- ✅ **Payment Status Tracking**: Real-time payment status updates
- ✅ **Refund Support**: Built-in refund processing capabilities
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Testing**: Complete test suite for all payment functionality

## Environment Configuration

### Required Environment Variables

```env
# Netopia Payment Configuration
NETOPIA_API_KEY=your_netopia_api_key_here
NETOPIA_SIGNATURE_KEY=your_netopia_signature_key_here
NETOPIA_ACCOUNT_ID=your_netopia_account_id_here

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# Payment Pricing (in RON)
BASE_VIDEO_PRICE=25.00
PHOTO_PRICE=5.00
LETTER_PRICE=10.00
```

### Setup Instructions

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Netopia credentials in the `.env` file

3. Ensure MongoDB is running and accessible

## API Endpoints

### Payment Intent Creation
```http
POST /api/payment/create-intent
Content-Type: application/json

{
  "amount": 40.00,
  "orderId": "video-id-123",
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "returnUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://secure.netopia-payments.com/payment/...",
  "transactionId": "santa_video-id-123_1641234567890",
  "orderId": "video-id-123",
  "amount": 40.00,
  "currency": "RON"
}
```

### Payment Status Check
```http
GET /api/payment/status/{orderId}
```

**Response:**
```json
{
  "success": true,
  "orderId": "video-id-123",
  "payment": {
    "status": "confirmed",
    "amount": 40.00,
    "currency": "RON",
    "transactionId": "santa_video-id-123_1641234567890",
    "paidAt": "2024-01-04T12:34:56.789Z",
    "provider": "netopia"
  }
}
```

### Webhook Endpoint
```http
POST /api/payment/webhook
Content-Type: application/json
X-Netopia-Signature: webhook_signature

{
  "orderID": "video-id-123",
  "status": "confirmed",
  "transactionId": "santa_video-id-123_1641234567890",
  "amount": 40.00,
  "currency": "RON"
}
```

### Refund Processing
```http
POST /api/payment/refund/{orderId}
Content-Type: application/json

{
  "reason": "Customer request"
}
```

## Payment States

The payment system tracks the following states:

- `pending` - Payment initiated but not completed
- `confirmed` - Payment successfully completed
- `cancelled` - Payment cancelled by user
- `failed` - Payment failed due to error
- `refunded` - Payment has been refunded

## Order Model Schema

```javascript
{
  // ... other order fields
  payment: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'failed', 'refunded'],
      default: 'pending'
    },
    provider: {
      type: String,
      default: 'netopia'
    },
    transactionId: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'RON'
    },
    paidAt: Date
  }
}
```

## Pricing Structure

The system automatically calculates pricing based on:

- **Base Video Price**: 25.00 RON (configurable via `BASE_VIDEO_PRICE`)
- **Photos**: 5.00 RON per photo (configurable via `PHOTO_PRICE`)
- **Letter Addition**: 10.00 RON (configurable via `LETTER_PRICE`)

## Security Features

### Webhook Security
- Signature verification using HMAC-SHA1
- Request validation and sanitization
- Duplicate webhook prevention

### Data Protection
- Sensitive payment data is not stored in plain text
- Transaction IDs are used for reference
- Environment variable protection for API keys

## Error Handling

The system provides comprehensive error handling with specific error codes:

- `MISSING_REQUIRED_FIELDS` - Required payment parameters missing
- `ORDER_NOT_FOUND` - Order doesn't exist in the system
- `PAYMENT_ALREADY_COMPLETED` - Attempting to pay for already paid order
- `PAYMENT_CREATION_FAILED` - Netopia payment creation failed
- `INVALID_PAYMENT_STATUS` - Invalid operation for current payment status

## Testing

### Running Tests
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run payment tests
npm test -- payment.test.js
```

### Test Coverage
- Payment intent creation
- Webhook processing
- Payment status checking
- Refund processing
- Complete payment flow integration
- Error scenarios and edge cases

## Monitoring and Logging

### Payment Events Logged
- Payment intent creation
- Successful payments
- Failed payments
- Webhook processing
- Refund requests

### Recommended Monitoring
- Track payment success/failure rates
- Monitor webhook delivery
- Alert on payment processing errors
- Track refund requests

## Migration from Stripe

### What was Removed
- All Stripe SDK dependencies
- Stripe-specific payment logic
- Stripe webhook handling
- Stripe environment variables

### What was Added
- Complete Netopia integration
- Enhanced order model with payment tracking
- Comprehensive webhook system
- Romanian-specific payment flows
- RON currency support

## Production Deployment

### Pre-deployment Checklist
- [ ] Netopia credentials configured
- [ ] Webhook URLs registered with Netopia
- [ ] SSL certificates in place
- [ ] Database migrations applied
- [ ] Payment testing completed
- [ ] Error monitoring configured

### Netopia Configuration
1. Register webhook URL: `https://yourdomain.com/api/payment/webhook`
2. Configure return URLs:
   - Success: `https://yourdomain.com/payment/success`
   - Cancel: `https://yourdomain.com/payment/cancel`
3. Set environment to production (`NODE_ENV=production`)

## Support and Troubleshooting

### Common Issues

**Payment creation fails**
- Check Netopia API key validity
- Verify order exists in database
- Check network connectivity to Netopia

**Webhooks not received**
- Verify webhook URL accessibility
- Check signature key configuration
- Review Netopia dashboard for delivery status

**Refunds not processing**
- Ensure order payment status is 'confirmed'
- Check transaction ID validity
- Verify refund permissions with Netopia

### Debug Mode
Set `NODE_ENV=development` to enable additional logging and use Netopia sandbox mode.

## API Documentation

For complete API documentation, see the generated docs or use tools like Postman with the provided collection.

---

## Contact

For technical support or questions about the payment integration, please contact the development team.
