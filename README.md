# 🎅 Santa Video Generator API

A streamlined Node.js backend for generating personalized Santa videos with ElevenLabs voice synthesis, FFmpeg video processing, and Netopia payment integration.

## 🚀 Features

- **Voice Generation**: Generate personalized Santa greetings using ElevenLabs API
- **Template System**: Load video templates from JSON configuration
- **Script Management**: Predefined Santa dialogue options with customization
- **Video Generation**: Single endpoint to collect all user data and generate videos
- **Payment Integration**: Netopia payment processing
- **File Upload**: Handle photos (1-4) and optional Santa letters

## 📋 API Endpoints

### Voice Generation
- `POST /api/voice/generate-name` - Generate voice for child's name using ElevenLabs

### Templates
- `GET /api/templates` - Get all available video templates
- `GET /api/templates/:templateId` - Get specific template details
- `GET /api/templates/search` - Filter templates with query parameters
- `GET /api/templates/stats` - Get template statistics

### Scripts
- `GET /api/scripts` - Get all available script segments
- `GET /api/scripts/category/:category` - Get scripts by category
- `GET /api/scripts/categories` - Get available categories

### Video Generation (Main Endpoint)
- `POST /api/video/create` - Create personalized video with all user data

### Payment
- `POST /api/payment/create` - Create Netopia payment request
- `POST /api/payment/notification` - Handle payment notifications

### Health Check
- `GET /health` - Server health status

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v16+)
- FFmpeg installed and accessible
- ElevenLabs API key
- Netopia payment credentials

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` file with:
   - ElevenLabs API key and voice ID
   - Netopia payment credentials
   - Other configuration options

5. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 📝 API Usage Examples

### 1. Generate Voice for Name
```javascript
POST /api/voice/generate-name
Content-Type: application/json

{
  "name": "Emily"
}

// Response:
{
  "success": true,
  "audioUrl": "/uploads/audio/uuid.mp3",
  "name": "Emily",
  "text": "Ho ho ho! Hello Emily!",
  "audioId": "uuid"
}
```

### 2. Get Available Templates
```javascript
GET /api/templates

// Response:
{
  "success": true,
  "count": 3,
  "templates": [
    {
      "id": "classic-santa",
      "name": "Classic Santa",
      "description": "Traditional Santa video with workshop background",
      "price": 19.99,
      "duration": 120,
      "clips": [...]
    }
  ]
}
```

### 3. Get Script Categories
```javascript
GET /api/scripts/categories

// Response:
{
  "success": true,
  "categories": ["Praise", "Achievement", "Kindness", "Gifts", "Family", "Inspiration", "Goodbye"]
}
```

### 4. Create Personalized Video (Main Endpoint)
```javascript
POST /api/video/create
Content-Type: multipart/form-data

// Form Data:
childName: "Emily"
parentEmail: "parent@example.com"  // NEW: Required for sending video link
templateId: "classic-santa"
selectedScripts: ["praise-1", "achievement-1", "gifts-1"]
goodbyeScript: "goodbye-1"
photos: [file1, file2, file3] // 1-4 image files
letter: [file] // Optional PDF or image

// Response:
{
  "success": true,
  "message": "Video generated and sent to email successfully!",
  "data": {
    "videoId": "uuid",
    "videoUrl": "https://cloud-storage-url/video.mp4", // Cloud storage URL
    "childName": "Emily",
    "parentEmail": "parent@example.com",
    "template": { "id": "classic-santa", "name": "Classic Santa" },
    "scripts": [...],
    "photos": 3,
    "hasLetter": true,
    "emailSent": true,        // NEW: Email sent status
    "cloudStored": true,      // NEW: Cloud storage status
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Create Payment
```javascript
POST /api/payment/create
Content-Type: application/json

{
  "amount": 19.99,
  "orderId": "order_uuid"
}

// Response:
{
  "success": true,
  "paymentUrl": "https://netopia.payment.url"
}
```

# Santa Video Backend - Node.js

A complete backend system for generating personalized Santa videos for children. This application allows users to create custom Santa videos by uploading photos, selecting script segments, and processing payments.

## 🎯 Project Purpose

This backend powers a Santa video generation service that:
- Accepts child photos and custom messages
- Generates personalized AI voiceovers
- Creates custom videos with photo overlays and text
- Processes payments through Stripe
- Sends email notifications with download links

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼───────────────────────────────────────┐
│                EXPRESS.JS SERVER                            │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │   Routes    │ │  Middleware  │ │   Error Handling    │    │
│  └─────────────┘ └──────────────┘ └─────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    SERVICES                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │  Upload     │ │   Payment    │ │      Voice          │    │
│  │  Service    │ │   Service    │ │      Service        │    │
│  └─────────────┘ └──────────────┘ └─────────────────────┘    │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │  Template   │ │    Video     │ │      Email          │    │
│  │  Service    │ │   Service    │ │      Service        │    │
│  └─────────────┘ └──────────────┘ └─────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   STORAGE                                   │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │   MongoDB   │ │  File System │ │   External APIs     │    │
│  │ (Database)  │ │  (Uploads)   │ │ (Stripe, ElevenLabs)│    │
│  └─────────────┘ └──────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
santa-video-nodejs-backend/
├── index.js                 # Main server file
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── README.md               # Project documentation
├──
├── models/                  # MongoDB Schema Definitions
│   ├── Template.js         # Video templates
│   ├── Upload.js           # File upload metadata
│   ├── Video.js            # Generated videos
│   ├── Script.js           # Script segments & custom scripts
│   └── Order.js            # Order management
├──
├── services/                # Business Logic Layer
│   ├── uploadService.js    # File processing (Sharp, Multer)
│   ├── templateService.js  # Template management
│   ├── scriptService.js    # Script creation & management
│   ├── paymentService.js   # Stripe integration
│   ├── voiceService.js     # ElevenLabs AI voice generation
│   ├── videoService.js     # FFmpeg video processing
│   └── emailService.js     # Nodemailer email notifications
├──
├── routes/                  # API Endpoints
│   ├── templates.js        # Template CRUD operations
│   ├── upload.js           # File upload endpoints
│   ├── scripts.js          # Script management
│   ├── payment.js          # Payment processing
│   ├── voice.js            # Voice generation
│   ├── video.js            # Video operations
│   └── orders.js           # Order management
└──
└── uploads/                 # File Storage
    ├── photos/             # User uploaded photos
    ├── letters/            # Santa letters
    ├── audio/              # Generated voiceovers
    └── videos/             # Final generated videos
```

## 🔄 Application Flow

### 1. **Order Creation Flow**
```
User selects template → Uploads photos → Creates custom script → Places order
                                    ↓
                            Order stored in MongoDB
                                    ↓
                            Email confirmation sent
```

### 2. **Payment Processing Flow**
```
Payment intent created → User completes payment → Stripe webhook triggered
                                    ↓
                        Payment status updated in DB
                                    ↓
                        Video generation triggered
```

### 3. **Video Generation Flow**
```
Order retrieved → Voice generated → Video compiled → Email sent
                                    ↓
              (ElevenLabs API)  (FFmpeg)  (Nodemailer)
```

## 🛠️ Technology Stack

### **Core Framework**
- **Express.js** - Web application framework
- **Node.js** - Runtime environment
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### **File Processing**
- **Multer** - File upload middleware
- **Sharp** - Image processing library
- **FFmpeg** - Video processing

### **External Services**
- **Stripe** - Payment processing
- **ElevenLabs** - AI voice generation
- **Nodemailer** - Email service

### **Utilities**
- **Joi** - Input validation
- **UUID** - Unique identifier generation
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing

## 📋 API Endpoints

### **Templates** (`/api/templates`)
- `GET /` - List all templates
- `GET /:id` - Get template details

### **Upload** (`/api/upload`)
- `POST /photos` - Upload child photos
- `POST /letter` - Upload Santa letter
- `POST /photos/:id/edit` - Edit uploaded photo

### **Scripts** (`/api/scripts`)
- `GET /segments` - Get script segments
- `GET /goodbye` - Get goodbye messages
- `POST /create` - Create custom script

### **Voice** (`/api/voice`)
- `POST /preview` - Generate name preview
- `POST /generate` - Generate full voiceover
- `GET /voices` - List available voices

### **Payment** (`/api/payment`)
- `POST /create-intent` - Create payment intent
- `POST /webhook` - Stripe webhook handler
- `GET /status/:id` - Check payment status

### **Video** (`/api/video`)
- `GET /status/:orderId` - Get generation status
- `GET /download/:orderId` - Download video
- `POST /generate` - Start video generation

### **Orders** (`/api/orders`)
- `POST /create` - Create new order
- `GET /:orderId` - Get order details
- `PUT /:orderId` - Update order

## 🗄️ Database Models

### **Template**
```javascript
{
  name: String,
  description: String,
  previewUrl: String,
  videoUrl: String,
  thumbnail: String,
  duration: Number,
  category: ['christmas', 'birthday', 'general'],
  isPremium: Boolean,
  photoSlots: [{ x, y, width, height, rotation }],
  textSlots: [{ x, y, width, height, fontSize, color }]
}
```

### **Order**
```javascript
{
  orderId: String (unique),
  templateId: ObjectId (ref: Template),
  childName: String,
  email: String,
  photos: [{ uploadId, processedPath }],
  customScript: { scriptId, fullScript },
  voiceSettings: { voice, voiceoverPath },
  paymentIntentId: String,
  status: ['created', 'paid', 'processing', 'completed', 'failed'],
  amount: Number,
  videoPath: String,
  downloadUrl: String
}
```

### **Upload**
```javascript
{
  originalName: String,
  filename: String (unique),
  path: String,
  mimetype: String,
  size: Number,
  fileType: ['photo', 'letter', 'video', 'audio'],
  metadata: { width, height, duration, format },
  processed: Boolean
}
```

## ⚙️ Service Details

### **Upload Service**
- **Purpose**: Handle file uploads and image processing
- **Libraries**: Multer (uploads), Sharp (image processing)
- **Functions**:
  - Process and resize photos
  - Create thumbnails for letters
  - Apply image edits (crop, zoom, rotate)
  - Extract metadata

### **Template Service**
- **Purpose**: Manage video templates
- **Database**: MongoDB with Mongoose
- **Functions**:
  - CRUD operations for templates
  - Initialize default templates
  - Category-based filtering

### **Script Service**
- **Purpose**: Handle script creation and management
- **Database**: MongoDB collections for segments and messages
- **Functions**:
  - Manage script segments
  - Create personalized scripts
  - Calculate estimated duration

### **Payment Service**
- **Purpose**: Handle payments and transactions
- **Integration**: Stripe API
- **Functions**:
  - Create payment intents
  - Handle webhooks
  - Process refunds
  - Manage customer data

### **Voice Service**
- **Purpose**: Generate AI voiceovers
- **Integration**: ElevenLabs API
- **Functions**:
  - Generate name previews
  - Create full voiceovers
  - Manage audio files
  - Fallback for development

### **Video Service**
- **Purpose**: Generate final videos
- **Library**: FFmpeg
- **Functions**:
  - Compile video with overlays
  - Add audio tracks
  - Apply text overlays
  - Track generation progress

### **Email Service**
- **Purpose**: Send notifications
- **Library**: Nodemailer
- **Functions**:
  - Order confirmations
  - Video ready notifications
  - HTML email templates

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- FFmpeg installed
- Stripe account
- ElevenLabs account (optional)

### **Installation**

1. **Clone and install dependencies:**
```bash
cd santa-video-nodejs-backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

4. **Run the application:**
```bash
# Development
npm run dev

# Production
npm start
```

### **Environment Variables**

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/santa-video` |
| `STRIPE_SECRET_KEY` | Payment processing | `sk_test_...` |
| `ELEVENLABS_API_KEY` | Voice generation | `your-api-key` |
| `SMTP_USER` | Email service | `your-email@gmail.com` |
| `BASE_URL` | Application URL | `http://localhost:3000` |

## 🔧 Development Features

### **Automatic Initialization**
- Default templates loaded on startup
- Default script segments created
- Database indexes configured

### **Error Handling**
- Comprehensive error middleware
- Service-level error catching
- Detailed error logging

### **File Management**
- Automatic directory creation
- File cleanup utilities
- Storage optimization

### **Development Mode**
- Mock audio generation
- Fallback services
- Enhanced logging

## 📊 Monitoring & Health

### **Health Check Endpoint**
```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "Connected"
}
```

## 🔒 Security Considerations

- Input validation with Joi
- File type restrictions
- File size limits
- MongoDB injection protection
- CORS configuration
- Webhook signature verification

## 📝 Usage Examples

### **Create Order**
```javascript
POST /api/orders/create
{
  "templateId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "childName": "Emma",
  "email": "parent@example.com",
  "amount": 19.99
}
```

### **Upload Photos**
```javascript
POST /api/upload/photos
Content-Type: multipart/form-data
photos: [file1, file2, file3]
```

### **Generate Voice**
```javascript
POST /api/voice/generate
{
  "name": "Emma",
  "script": "Ho ho ho! Hello {name}!",
  "voice": "santa_voice"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for creating magical Christmas moments for children worldwide! 🎅🎄**
