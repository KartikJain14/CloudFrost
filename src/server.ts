import express from 'express';
import session from 'express-session';
import ejsLayouts from 'express-ejs-layouts';
import cors from 'cors';
import passport from './stratergies/googleStratergy';
import { connectDB } from './db/connection';
import { fetchNSRecord } from './services/cloudflareService';
import { apiRoutes, authRoutes, indexRoutes } from './routes';

// Connect to the database
connectDB();
fetchNSRecord(120); // Updates NS Records globally every 2 minutes

const server = express();
const PORT = process.env.PORT || 3000;
// Encryption key for session (prevents client from changing user data)
const SESSION_SECRET = process.env.SESSION_SECRET || 'seC8$rET@#@*Dgh4Kdl&Pa2'; 
// Session expiry time in hours
const SESSION_EXPIRY = process.env.SESSION_EXPIRY ? Number(process.env.SESSION_EXPIRY) * 60000 * 60 : 60000 * 60 * 48;
// The url of where the server will be hosted eg. https://cloudfrost.yeezus.live This is needed when you might host using tunnels.
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:' + PORT;
const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
};
server.use(cors(corsOptions));

// Helps to get the real IP address of the client by req.ip (required in case of reverse proxy servers like Nginx)
server.set('trust proxy', true)

// Set the view engine to ejs (helps to render dynamic content for frontend)
server.set('view engine', 'ejs');
server.set('views', './src/views');
server.use(ejsLayouts);

// Helps to parse the request body and send it back to the client
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Helps to serve static files like images, css, js etc.
// Eg. Store a file in public folder and access it at /file.png
server.use(express.static('public'));

// Session management and passport initialization for authentication and storing user after authentication
server.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SESSION_EXPIRY , signed: true, httpOnly: true },
}));
server.use(passport.initialize());
server.use(passport.session());

// Add routers for different routes
server.use('/', indexRoutes);
server.use('/api', apiRoutes);
server.use('/auth', authRoutes);

// Sends a 404 page if the route is not found
server.use((req, res) => {
  res.status(404).render('404');
});

// Start the server on the specified port
server.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});