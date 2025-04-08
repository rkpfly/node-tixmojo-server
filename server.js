/**
 * TixMojo Server with Enhanced Server-Side Rendering
 * Maximizing server-side rendering for optimal performance
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const logger = require('./middleware/logger');
const React = require('react');
const { renderToString } = require('react-dom/server');
// Using require.resolve to avoid ESM/CJS conflicts
let StaticRouter;
try {
  // For React Router v6
  const reactRouterDom = require('react-router-dom');
  StaticRouter = reactRouterDom.StaticRouter;
} catch (error) {
  console.log('Could not import StaticRouter:', error.message);
  // Mock StaticRouter for now
  StaticRouter = class StaticRouter {
    static render() { return ''; }
  };
}

// Load environment variables
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import validation utils and server-side services
const validationUtils = require('./utils/validationUtils');
const phoneService = require('./services/phoneService');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://*.tixmojo.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://accounts.google.com"]
    }
  }
})); // Security headers with CSP exceptions for SSR

// Configure CORS to allow access from all origins in development
// In production, you would specify exact origins for security
const corsOptions = {
  origin: true, // Allow all origins for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
};
app.use(cors(corsOptions)); // Enable CORS with options

app.use(express.json()); // Parse JSON requests
app.use(morgan('dev')); // HTTP request logger
app.use(logger); // Custom logger

// Static files (for client-side assets)
app.use(express.static(path.join(__dirname, '../dist'), {
  // Set caching headers for better performance
  maxAge: '1d',
  setHeaders: (res, path) => {
    // Immutable cache for assets that change with each build
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Phone Validation Endpoint (Server-side validation)
app.post('/api/validate-phone', (req, res) => {
  try {
    const { phone, countryCode } = req.body;
    
    if (!phone || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }
    
    // Sanitize input
    const cleanPhone = validationUtils.sanitizeInput(phone);
    const cleanCountry = validationUtils.sanitizeInput(countryCode);
    
    // Validate the phone number
    const isValid = phoneService.validatePhoneNumber(cleanPhone, cleanCountry);
    
    if (isValid) {
      const formattedPhone = phoneService.formatPhoneE164(cleanPhone, cleanCountry);
      return res.json({
        success: true,
        isValid: true,
        formatted: formattedPhone
      });
    } else {
      return res.json({
        success: true,
        isValid: false
      });
    }
  } catch (error) {
    console.error('Phone validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating phone number',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Country Data Endpoint (for country flags and codes)
app.get('/api/countries', (req, res) => {
  try {
    // Get country data from the phoneService
    const countries = phoneService.getSortedCountryOptions();
    
    // Add server cache headers (1 day)
    res.set('Cache-Control', 'public, max-age=86400');
    
    return res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching country data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Phone format example (for input placeholders)
app.get('/api/phone/format-example/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country code is required'
      });
    }
    
    // Get the example format, sanitize input first
    const cleanCountry = validationUtils.sanitizeInput(countryCode.toUpperCase());
    const example = phoneService.getPhoneExample(cleanCountry);
    
    // Add server cache headers (1 day)
    res.set('Cache-Control', 'public, max-age=86400');
    
    return res.json({
      success: true,
      example
    });
  } catch (error) {
    console.error('Error getting phone format example:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting phone format example',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * Server-Side Rendering (SSR) Implementation
 */

// Import React components for server-side rendering
let App;
try {
  // Note: This would be your actual App component, properly server-side adjusted
  // For now, we're using a simplified approach without loading full React components
  // App = require('../src/App').default;
} catch (error) {
  console.warn('SSR: Could not load App component:', error.message);
}

// Universal route handler for SSR - handles all non-API routes
app.get('*', (req, res, next) => {
  // Skip SSR for API routes
  if (req.url.startsWith('/api/') || req.url === '/health') {
    return next();
  }
  
  // Path to the index.html file
  const indexPath = path.resolve(__dirname, '../dist/index.html');
  
  // Check if index.html exists (fallback to client-side rendering if it doesn't)
  if (!fs.existsSync(indexPath)) {
    console.warn('SSR: index.html not found. Make sure to build the client first.');
    return res.status(500).send('Server error: Failed to load application.');
  }
  
  // Read the HTML file
  const html = fs.readFileSync(indexPath, 'utf8');
  
  try {
    // Fetch initial data based on the route
    const initialData = getInitialDataForRoute(req.url);
    
    // In a full implementation, we would render the React app here
    // For now, we'll create an enhanced HTML template with pre-rendered SEO data
    
    // Pre-render critical HTML for the route
    const criticalHtml = generateCriticalHtml(req.url, initialData);
    
    // Create the data script to inject into the HTML
    const dataScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`;
    
    // Insert pre-rendered content
    let renderedHtml = html
      .replace('</head>', `${generateMetaTags(initialData)}\n${dataScript}\n</head>`)
      .replace('<div id="root"></div>', `<div id="root">${criticalHtml}</div>`);
    
    // Add server timing headers for performance monitoring
    res.set('Server-Timing', `ssr;dur=${Date.now() - req.startTime}`);
    
    // Send the HTML response
    res.send(renderedHtml);
  } catch (error) {
    console.error('SSR Error:', error);
    // Fall back to client-side rendering if SSR fails
    res.send(html);
  }
});

/**
 * Get initial data for a route
 * This fetches data from APIs or database based on the route
 */
function getInitialDataForRoute(url) {
  // Example data for different routes
  const path = url.split('?')[0]; // Remove query parameters
  
  // Common data for all routes
  const commonData = {
    appName: 'TixMojo',
    serverTime: new Date().toISOString(),
    serverRendered: true
  };
  
  // Route-specific data
  if (path === '/' || path === '/home') {
    // Home page data (in a real implementation, we would fetch from the database)
    return {
      ...commonData,
      pageType: 'home',
      title: 'TixMojo - Find and Book Amazing Events',
      description: 'Discover top events, concerts, and shows in your area. TixMojo helps you find tickets for the best live entertainment experiences.',
      canonicalUrl: 'https://tixmojo.com/',
      // Pre-fetch events data for SSR (mock data for now)
      events: {
        popular: [], // This would be populated from database
        spotlight: [] // This would be populated from database
      }
    };
  } else if (path.startsWith('/events/')) {
    // Event details page - we would fetch the event data here
    const eventId = path.split('/')[2];
    return {
      ...commonData,
      pageType: 'eventDetails',
      eventId,
      title: 'Event Details - TixMojo',
      description: 'View details and book tickets for this event.',
      canonicalUrl: `https://tixmojo.com/events/${eventId}`,
      // Event data would be pre-fetched here
      event: null // This would be populated from database
    };
  } else if (path === '/login') {
    // Login page
    return {
      ...commonData,
      pageType: 'login',
      title: 'Login - TixMojo',
      description: 'Sign in to your TixMojo account.',
      canonicalUrl: 'https://tixmojo.com/login',
      noIndex: true // Don't index login pages
    };
  } else {
    // 404 page
    return {
      ...commonData,
      pageType: '404',
      title: 'Page Not Found - TixMojo',
      description: 'The page you were looking for could not be found.',
      noIndex: true,
      statusCode: 404
    };
  }
}

/**
 * Generate meta tags for SEO
 * @param {Object} data - The route data with SEO information
 * @returns {string} - HTML meta tags for SEO
 */
function generateMetaTags(data) {
  const title = validationUtils.sanitizeInput(data.title || 'TixMojo');
  const description = validationUtils.sanitizeInput(data.description || 'Find and book amazing events');
  const canonicalUrl = validationUtils.sanitizeInput(data.canonicalUrl || 'https://tixmojo.com/');
  
  let metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
  `;
  
  // Add no-index for pages that shouldn't be indexed
  if (data.noIndex) {
    metaTags += '<meta name="robots" content="noindex,nofollow" />';
  }
  
  // Add structured data for events
  if (data.pageType === 'eventDetails' && data.event) {
    const event = data.event;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': event.title,
      'startDate': event.startDate,
      'endDate': event.endDate,
      'location': {
        '@type': 'Place',
        'name': event.venue,
        'address': event.location
      },
      'image': event.image,
      'description': event.description,
      'offers': {
        '@type': 'Offer',
        'price': event.minPrice,
        'priceCurrency': event.currency || 'USD',
        'availability': 'https://schema.org/InStock',
        'url': canonicalUrl
      },
      'organizer': {
        '@type': 'Organization',
        'name': event.organizer?.name || 'TixMojo'
      }
    };
    
    metaTags += `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  }
  
  return metaTags;
}

/**
 * Generate critical HTML content for server-side rendering
 * @param {string} url - The current URL
 * @param {Object} data - The route data
 * @returns {string} - Critical HTML content
 */
function generateCriticalHtml(url, data) {
  // Simple placeholder HTML for specific routes
  // In a real implementation, we would use React's renderToString
  // with actual components
  
  let criticalHtml = '';
  
  if (App && false) { // Disabled until proper SSR setup
    try {
      // This would be your actual SSR rendering with React components
      const appHtml = renderToString(
        React.createElement(
          StaticRouter, 
          { location: url },
          React.createElement(App, { data })
        )
      );
      criticalHtml = appHtml;
    } catch (error) {
      console.error('Error rendering React component:', error);
      criticalHtml = `<div class="server-rendered-placeholder">Loading...</div>`;
    }
  } else {
    // Simplified SSR without React components
    if (data.pageType === '404') {
      criticalHtml = `
        <div class="server-rendered-content">
          <h1>Page Not Found</h1>
          <p>The page you were looking for could not be found.</p>
        </div>
      `;
    } else if (data.pageType === 'login') {
      criticalHtml = `
        <div class="server-rendered-content">
          <h1>Login to TixMojo</h1>
          <div class="login-placeholder">Loading login form...</div>
        </div>
      `;
    } else {
      criticalHtml = `
        <div class="server-rendered-content">
          <div class="loading-placeholder">Loading TixMojo...</div>
        </div>
      `;
    }
  }
  
  return criticalHtml;
}

// Add request timing middleware to measure SSR performance
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TixMojo server running on port ${PORT} with enhanced SSR enabled`);
  console.log(`API available at http://localhost:${PORT}/api`);
});