# 🦁 ANGONI Adventure

> Luxury Made Affordable - Premium Safari Tours & Car Hire Across East Africa

A comprehensive tourism and car hire booking platform serving Tanzania, Kenya, Uganda, Rwanda, and Zanzibar.

## 🌍 Overview

ANGONI Adventure is a full-stack web application providing:
- **Safari Tour Packages** - Wildlife safaris, mountain trekking, cultural tours
- **Car Hire Services** - Self-drive, chauffeur-driven, airport transfers
- **Shuttle Services** - Intercity transport, group shuttles
- **Guest Booking** - No registration required
- **Multi-Currency Support** - USD, TZS, KES, EUR, GBP
- **Real-time Availability** - Live vehicle and package availability

## ✨ Key Features

### For Customers
- 🔍 **Advanced Search & Filters** - Find perfect safari or vehicle
- 📱 **Mobile-First Design** - Seamless experience on all devices
- 💳 **Multiple Payment Options** - Paystack, Flutterwave, Stripe
- 📧 **Instant Confirmation** - Email & WhatsApp notifications
- 🎯 **Custom Packages** - Build your own safari
- ⭐ **Reviews & Ratings** - Authentic customer testimonials

### For Admins
- 📊 **Dashboard** - Manage bookings, packages, vehicles
- 🚗 **Fleet Management** - Track vehicles, maintenance, availability
- 📈 **Analytics** - Revenue, bookings, popular destinations
- 👥 **Customer Management** - View and contact customers
- 📝 **Content Management** - Update packages, prices, images

## 🛠 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling + mobile-first
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **Node.js** v18+ - Runtime environment
- **Express.js** v4 - Web framework
- **Supabase** - PostgreSQL database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **WhatsApp Business API** - Notifications

### Integrations
- **Paystack** - East Africa payments
- **Flutterwave** - Multi-country payments
- **Stripe** - International payments
- **Twilio** - SMS notifications
- **Google Maps** - Location services

## 📁 Project Structure

```
angoni-adventure/
│
├── frontend/                 # Frontend files
│   ├── index.html           # Homepage
│   ├── packages.html        # All packages
│   ├── specialtour.html     # Featured tours
│   ├── hireshuttle.html     # Car hire & shuttle
│   ├── booking.html         # Booking form
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css     # Styles
│   │   └── js/
│   │       ├── config.js    # Configuration
│   │       ├── api.js       # API client
│   │       └── main.js      # App logic
│   └── images/
│
├── backend/                  # Backend files
│   ├── server.js            # Main server
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Helper functions
│   └── logs/                # Log files
│
├── database/
│   └── schema.sql           # Database schema
│
├── docs/
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── API.md               # API documentation
│
├── .env.example             # Environment template
├── package.json             # Dependencies
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+
```

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/angoni-adventure/platform.git
cd platform
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**3. Setup Frontend**
```bash
cd ../frontend
# Use any HTTP server
npx http-server -p 8080
```

**4. Access Application**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- API Health: `http://localhost:3000/health`

## 📝 Environment Variables

Create `.env` file in backend directory:

```env
# Required
NODE_ENV=development
PORT=3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# Optional but recommended
EMAIL_USER=info@angoniadventure.com
EMAIL_PASSWORD=your-password
WHATSAPP_ACCESS_TOKEN=your-token
PAYSTACK_SECRET_KEY=your-key
```

See `.env.example` for complete list.

## 🗄 Database Setup

**1. Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy URL and keys

**2. Run Schema**
```sql
-- Execute database/schema.sql in Supabase SQL Editor
```

**3. Verify Tables**
Check these tables exist:
- `packages`
- `cars`
- `bookings`
- `destinations`
- `testimonials`

## 🔌 API Endpoints

### Packages
```
GET    /api/packages              # All packages
GET    /api/packages/featured     # Featured packages
GET    /api/packages/:slug        # Single package
```

### Cars
```
GET    /api/cars                  # All vehicles
GET    /api/cars/featured         # Featured vehicles
GET    /api/cars/:id              # Single vehicle
POST   /api/cars/check-availability
```

### Bookings
```
POST   /api/bookings              # Create booking
GET    /api/bookings/:id          # Get booking
```

### Search
```
GET    /api/search/quick          # Quick search
```

### Other
```
POST   /api/newsletter/subscribe  # Newsletter
POST   /api/contact               # Contact form
POST   /api/quote                 # Quote request
GET    /api/testimonials          # Reviews
```

See [API.md](docs/API.md) for detailed documentation.

## 🧪 Testing

```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Deploy on Vercel
# Connect GitHub repo
# Set root directory to 'frontend'
# Deploy
```

### Backend (Railway)
```bash
# Connect Railway to GitHub
# Set root directory to 'backend'
# Add environment variables
# Deploy
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed guide.

## 🔐 Security

- ✅ HTTPS enforced
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ SQL injection protected
- ✅ XSS protection
- ✅ Environment variables secured
- ✅ Row-level security (RLS)
- ✅ Input validation

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Support

Fully responsive design:
- Mobile-first approach
- Touch-friendly interfaces
- Optimized images
- Fast loading times

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Team

- **Project Manager**: Anderson Mollel
- **Lead Developer**: KGI Software Solutions
- **UI/UX Designer**: Design Team
- **DevOps**: Infrastructure Team


## 🙏 Acknowledgments

- Safari operators across East Africa
- Supabase team for excellent database platform
- Open source community
- Early adopters and testers

## 📊 Project Status

- ✅ **Phase 1**: Core functionality (Complete)
- ✅ **Phase 2**: Payment integration (Complete)
- 🚧 **Phase 3**: Mobile app (In Progress)
- 📅 **Phase 4**: AI recommendations (Planned)
**Made with ❤️ in Tanzania 🇹🇿 for East Africa 🌍**

*Last Updated: December 2024*
