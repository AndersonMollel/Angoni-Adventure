const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();


const { initDb } = require('./api/supabase');
const packagesRouter = require('./api/roots/packagesRouter');
const carsRouter = require('./api/roots/cars');
const bookingsRouter = require('./api/roots/booking');
const adminRouter = require('./api/roots/admin');
const paymentsRouter = require('./api/roots/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE CONFIGURATION
// =====================================================

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://angoniadventure.com',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200 // limit each IP to 200 requests per windowMs
});
app.use('/api/', limiter);

// =====================================================
// DATABASE CONNECTION (Supabase)
// =====================================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("FATAL ERROR: Environment variables are not loaded. Check your .env file.");
    process.exit(1);
}

console.log("Supabase client successfully initialized.");
// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Generate booking reference
function generateBookingReference() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ANG-${year}-${random}`;
}

// Send confirmation email
async function sendBookingConfirmation(bookingData) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: bookingData.lead_email,
        subject: `Booking Confirmation - ${bookingData.booking_reference}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0B3D2E; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">ANGONI Adventure</h1>
                    <p style="margin: 5px 0;">Luxury Made Affordable</p>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #0B3D2E;">Booking Confirmed!</h2>
                    <p>Dear ${bookingData.lead_first_name} ${bookingData.lead_last_name},</p>
                    <p>Thank you for booking with ANGONI Adventure. Your booking has been confirmed.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #D4AF37; margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingData.booking_reference}</p>
                        <p><strong>Service Type:</strong> ${bookingData.booking_type}</p>
                        <p><strong>Total Amount:</strong> $${bookingData.total_amount}</p>
                        <p><strong>Payment Status:</strong> ${bookingData.payment_status}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #D4AF37; margin-top: 0;">Contact Information</h3>
                        <p><strong>Phone:</strong> +255 784 282 123</p>
                        <p><strong>Email:</strong> info@angoniadventure.com</p>
                        <p><strong>WhatsApp:</strong> +255 784 282 123</p>
                    </div>
                    
                    <p style="color: #666;">If you have any questions, please don't hesitate to contact us.</p>
                    <p style="margin-top: 30px;">Best regards,<br><strong>ANGONI Adventure Team</strong></p>
                </div>
                <div style="background: #0B3D2E; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2025 ANGONI Adventure. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Track analytics
async function trackAnalytics(eventType, eventData, req) {
    try {
        await supabase.from('analytics').insert({
            event_type: eventType,
            event_data: eventData,
            page_url: req.headers.referer || '',
            user_ip: req.ip,
            user_agent: req.headers['user-agent'],
            session_id: req.headers['x-session-id'] || ''
        });
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// =====================================================
// API ROUTES - SAFARI PACKAGES
// =====================================================

// Get all packages
app.get('/api/packages', async (req, res) => {
    try {
        const { type, destination, min_price, max_price, featured } = req.query;
        
        let query = supabase
            .from('safari_packages')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (type) query = query.eq('type', type);
        if (destination) query = query.eq('destination', destination);
        if (min_price) query = query.gte('price', min_price);
        if (max_price) query = query.lte('price', max_price);
        if (featured === 'true') query = query.eq('featured', true);

        const { data, error } = await query;

        if (error) throw error;

        // Track analytics
        await trackAnalytics('packages_viewed', { count: data.length, filters: req.query }, req);

        res.json({ success: true, packages: data });
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single package
app.get('/api/packages/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('safari_packages')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        await trackAnalytics('package_viewed', { package_id: req.params.id, title: data.title }, req);

        res.json({ success: true, package: data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Package not found' });
    }
});

// Create package (Admin only)
app.post('/api/packages', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('safari_packages')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, package: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update package (Admin only)
app.put('/api/packages/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('safari_packages')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, package: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete package (Admin only)
app.delete('/api/packages/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('safari_packages')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// API ROUTES - VEHICLES
// =====================================================

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const { type, min_price, max_price, featured } = req.query;
        
        let query = supabase
            .from('vehicles')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (type) query = query.eq('type', type);
        if (min_price) query = query.gte('price_per_day', min_price);
        if (max_price) query = query.lte('price_per_day', max_price);
        if (featured === 'true') query = query.eq('featured', true);

        const { data, error } = await query;

        if (error) throw error;

        await trackAnalytics('vehicles_viewed', { count: data.length, filters: req.query }, req);

        res.json({ success: true, vehicles: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        await trackAnalytics('vehicle_viewed', { vehicle_id: req.params.id }, req);

        res.json({ success: true, vehicle: data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Vehicle not found' });
    }
});

// Create vehicle (Admin only)
app.post('/api/vehicles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, vehicle: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update vehicle (Admin only)
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, vehicle: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete vehicle (Admin only)
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// API ROUTES - SHUTTLE ROUTES
// =====================================================

// Get all shuttle routes
app.get('/api/shuttles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shuttle_routes')
            .select('*')
            .eq('status', 'active')
            .order('name');

        if (error) throw error;

        await trackAnalytics('shuttles_viewed', { count: data.length }, req);

        res.json({ success: true, shuttles: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// API ROUTES - BOOKINGS
// =====================================================

// Create booking
app.post('/api/bookings', async (req, res) => {
    try {
        // Generate booking reference
        const bookingReference = generateBookingReference();

        // Prepare booking data
        const bookingData = {
            ...req.body,
            booking_reference: bookingReference,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        };

        // Insert booking
        const { data, error } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();

        if (error) throw error;

        // Send confirmation email
        await sendBookingConfirmation(data);

        // Track analytics
        await trackAnalytics('booking_created', {
            booking_reference: bookingReference,
            booking_type: data.booking_type,
            total_amount: data.total_amount
        }, req);

        res.json({
            success: true,
            booking: data,
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all bookings (Admin only)
app.get('/api/bookings', async (req, res) => {
    try {
        const { status, booking_type, limit } = req.query;
        
        let query = supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (booking_type) query = query.eq('booking_type', booking_type);
        if (limit) query = query.limit(parseInt(limit));

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, bookings: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single booking
app.get('/api/bookings/:reference', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('booking_reference', req.params.reference)
            .single();

        if (error) throw error;

        res.json({ success: true, booking: data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Booking not found' });
    }
});

// Update booking (Admin only)
app.put('/api/bookings/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, booking: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// API ROUTES - PLAN MY TRIP
// =====================================================

// Create plan my trip request
app.post('/api/plan-trip', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plan_my_trip')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        // Send notification email to admin
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Plan My Trip Request',
            html: `
                <h2>New Trip Planning Request</h2>
                <p><strong>Name:</strong> ${req.body.full_name}</p>
                <p><strong>Email:</strong> ${req.body.email}</p>
                <p><strong>Phone:</strong> ${req.body.phone}</p>
                <p><strong>Destination:</strong> ${req.body.destination}</p>
                <p><strong>Dates:</strong> ${req.body.start_date} to ${req.body.end_date}</p>
            `
        });

        await trackAnalytics('plan_trip_request', { email: req.body.email }, req);

        res.json({ success: true, request: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all trip requests (Admin only)
app.get('/api/plan-trip', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plan_my_trip')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, requests: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// API ROUTES - DESTINATIONS
// =====================================================

// Get all destinations
app.get('/api/destinations', async (req, res) => {
    try {
        const { featured } = req.query;
        
        let query = supabase
            .from('destinations')
            .select('*')
            .eq('status', 'active');

        if (featured === 'true') query = query.eq('featured', true);

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, destinations: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Get dashboard stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Total bookings
        const { count: totalBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });

        // Total revenue
        const { data: revenueData } = await supabase
            .from('bookings')
            .select('total_amount')
            .eq('payment_status', 'paid');
        
        const totalRevenue = revenueData?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) || 0;

        // Total customers (unique emails)
        const { data: customersData } = await supabase
            .from('bookings')
            .select('lead_email');
        
        const totalCustomers = new Set(customersData?.map(b => b.lead_email)).size;

        // Active vehicles
        const { count: activeVehicles } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available');

        res.json({
            success: true,
            stats: {
                totalBookings,
                totalRevenue: Math.round(totalRevenue),
                totalCustomers,
                activeVehicles
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get analytics data
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const { event_type, days = 30 } = req.query;
        
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - parseInt(days));

        let query = supabase
            .from('analytics')
            .select('*')
            .gte('created_at', fromDate.toISOString())
            .order('created_at', { ascending: false });

        if (event_type) query = query.eq('event_type', event_type);

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, analytics: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Subscribe to newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .insert({ email })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ success: false, error: 'Email already subscribed' });
            }
            throw error;
        }

        await trackAnalytics('newsletter_subscribe', { email }, req);

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Submit contact message
app.post('/api/contact', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        // Send notification to admin
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Message: ${req.body.subject}`,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${req.body.name}</p>
                <p><strong>Email:</strong> ${req.body.email}</p>
                <p><strong>Phone:</strong> ${req.body.phone}</p>
                <p><strong>Subject:</strong> ${req.body.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${req.body.message}</p>
            `
        });

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({
        name: 'ANGONI Adventure API',
        version: '1.0.0',
        status: 'Running'
    });
});

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 ANGONI Adventure API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});

module.exports = app;
