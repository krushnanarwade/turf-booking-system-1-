import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Turf, Slot, Booking, Payment, Review, Coupon, NotificationItem, User, AdminStats } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory / file-backed persistent store for dev database
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

interface DataStore {
  users: User[];
  turfs: Turf[];
  slots: Slot[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  coupons: Coupon[];
  notifications: NotificationItem[];
}

const initialTurfs: Turf[] = [
  {
    id: 'turf-1',
    owner_id: 'owner-1',
    owner_name: 'Apex Sports Infra',
    name: 'Champions Arena Box Cricket & Football',
    description: 'Premier FIFA-grade synthetic turf featuring heavy-duty shock absorption, high-power LED floodlights, professional netting, and comfortable dugout seating.',
    location: '102 Sports Complex Way, Bandra West',
    city: 'Mumbai',
    area: 'Bandra West',
    latitude: 19.0596,
    longitude: 72.8295,
    price_per_hour: 1200,
    weekend_price_per_hour: 1500,
    sport_types: ['Box Cricket', 'Football'],
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews_count: 128,
    amenities: ['Floodlights', 'Parking', 'Changing Room', 'Locker', 'Equipment Rental', 'Drinking Water', 'Cafeteria'],
    status: 'active',
    is_featured: true,
    opening_time: '06:00',
    closing_time: '23:00',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'turf-2',
    owner_id: 'owner-1',
    owner_name: 'Apex Sports Infra',
    name: 'Skyline Turf & Football Ground',
    description: 'Expansive 7-a-side lush green football arena located on a scenic rooftop with night stadium lighting and panoramic city skyline views.',
    location: '45 Tech Park Avenue, HSR Layout',
    city: 'Bangalore',
    area: 'HSR Layout',
    latitude: 12.9121,
    longitude: 77.6446,
    price_per_hour: 1600,
    weekend_price_per_hour: 2000,
    sport_types: ['Football', 'Cricket'],
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews_count: 94,
    amenities: ['Floodlights', 'Dugout', 'First Aid Kit', 'Shower Rooms', 'Free WiFi', 'Parking'],
    status: 'active',
    is_featured: true,
    opening_time: '05:00',
    closing_time: '23:30',
    created_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 'turf-3',
    owner_id: 'owner-2',
    owner_name: 'ProCourts Global',
    name: 'Smash Pro Badminton & Tennis Club',
    description: 'Indoor air-conditioned BWF-standard synthetic wooden courts with glare-free overhead LED illuminators and pro shop.',
    location: '88 Olympic Ring Road, Kothrud',
    city: 'Pune',
    area: 'Kothrud',
    latitude: 18.5074,
    longitude: 73.8077,
    price_per_hour: 800,
    weekend_price_per_hour: 1000,
    sport_types: ['Badminton', 'Tennis'],
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.7,
    reviews_count: 62,
    amenities: ['Air Conditioned', 'Pro Shop', 'Locker Room', 'Shower', 'Drinking Water'],
    status: 'active',
    is_featured: false,
    opening_time: '06:00',
    closing_time: '22:00',
    created_at: '2026-02-01T11:00:00Z'
  },
  {
    id: 'turf-4',
    owner_id: 'owner-2',
    owner_name: 'ProCourts Global',
    name: 'VolleyPro Beach Volleyball Arena',
    description: 'Clean washed quartz-sand beach volleyball court with floodlights, umpire chair, music system, and beachside spectator lounge.',
    location: '12 Coastal Boulevard, Jubilee Hills',
    city: 'Hyderabad',
    area: 'Jubilee Hills',
    latitude: 17.4319,
    longitude: 78.4072,
    price_per_hour: 950,
    weekend_price_per_hour: 1200,
    sport_types: ['Volleyball'],
    images: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.6,
    reviews_count: 38,
    amenities: ['Floodlights', 'Music System', 'Shower', 'Restroom', 'Snack Bar'],
    status: 'active',
    is_featured: false,
    opening_time: '07:00',
    closing_time: '22:00',
    created_at: '2026-02-10T14:00:00Z'
  },
  {
    id: 'turf-5',
    owner_id: 'owner-1',
    owner_name: 'Apex Sports Infra',
    name: 'Metro Box Cricket Hub',
    description: 'High-speed indoor box cricket stadium with spring-loaded bounce grass matting, electronic scoreboard, and video recording setup.',
    location: '204 Ring Road, Connaught Place',
    city: 'Delhi',
    area: 'Connaught Place',
    latitude: 28.6315,
    longitude: 77.2167,
    price_per_hour: 1350,
    weekend_price_per_hour: 1700,
    sport_types: ['Box Cricket', 'Cricket'],
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.85,
    reviews_count: 110,
    amenities: ['Scoreboard', 'Video Recording', 'Floodlights', 'Chilled Water', 'Parking'],
    status: 'active',
    is_featured: true,
    opening_time: '06:00',
    closing_time: '23:59',
    created_at: '2026-02-14T08:00:00Z'
  }
];

const initialUsers: User[] = [
  {
    id: 'usr-customer-1',
    fullname: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    preferredSports: ['Cricket', 'Football'],
    status: 'active',
    created_at: '2026-01-01T10:00:00Z'
  },
  {
    id: 'owner-1',
    fullname: 'David Miller (Apex Sports)',
    email: 'owner@turfhub.com',
    phone: '+91 98111 22233',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    preferredSports: ['Football', 'Box Cricket'],
    status: 'active',
    created_at: '2026-01-02T10:00:00Z'
  },
  {
    id: 'usr-admin-1',
    fullname: 'Platform Administrator',
    email: 'admin@turfhub.com',
    phone: '+91 90000 00000',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z'
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'c-1',
    code: 'TURF20',
    discount_percentage: 20,
    max_discount: 300,
    min_order_amount: 800,
    valid_until: '2026-12-31',
    is_active: true,
    description: 'Get 20% OFF up to ₹300 on any sports turf booking!'
  },
  {
    id: 'c-2',
    code: 'FIRSTGAME',
    discount_percentage: 30,
    max_discount: 500,
    min_order_amount: 1000,
    valid_until: '2026-12-31',
    is_active: true,
    description: 'Special 30% discount for first-time turf bookings.'
  },
  {
    id: 'c-3',
    code: 'WEEKEND15',
    discount_percentage: 15,
    max_discount: 400,
    min_order_amount: 1200,
    valid_until: '2026-12-31',
    is_active: true,
    description: 'Weekend celebration discount: 15% OFF!'
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    user_id: 'usr-customer-1',
    user_name: 'John Doe',
    user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    turf_id: 'turf-1',
    rating: 5,
    comment: 'Exceptional grass bounce and top-tier floodlights. Played a 10-over box cricket match under lights. Staff was very supportive!',
    created_at: '2026-03-01T18:30:00Z'
  },
  {
    id: 'rev-2',
    user_id: 'usr-customer-2',
    user_name: 'Rahul Sharma',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    turf_id: 'turf-1',
    rating: 4.5,
    comment: 'Super clean changing rooms and clean drinking water. Very easy parking access right next to Bandra West station.',
    created_at: '2026-03-05T20:10:00Z'
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'usr-customer-1',
    title: 'Welcome to TurfHub! ⚽🏏',
    message: 'Explore nearby sports turfs in your city and book your next match seamlessly.',
    type: 'system',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load store, initializing defaults:', err);
  }
  
  const initialStore: DataStore = {
    users: initialUsers,
    turfs: initialTurfs,
    slots: [],
    bookings: [
      {
        id: 'bk-1001',
        user_id: 'usr-customer-1',
        user_name: 'John Doe',
        user_email: 'john@example.com',
        user_phone: '+91 98765 43210',
        turf_id: 'turf-1',
        turf_name: 'Champions Arena Box Cricket & Football',
        turf_image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
        turf_location: '102 Sports Complex Way, Bandra West, Mumbai',
        slot_id: 'slot-sample-1',
        booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '18:00',
        end_time: '19:00',
        sport_type: 'Box Cricket',
        total_amount: 1152,
        discount_amount: 240,
        tax_amount: 192,
        booking_status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        qr_code: 'TH-BK-1001-CONFIRMED'
      }
    ],
    payments: [
      {
        id: 'pay-1001',
        booking_id: 'bk-1001',
        user_id: 'usr-customer-1',
        payment_gateway: 'razorpay',
        payment_id: 'pay_rzp_live_9988112233',
        order_id: 'order_rzp_776655',
        amount: 1152,
        currency: 'INR',
        payment_status: 'success',
        transaction_time: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    reviews: initialReviews,
    coupons: initialCoupons,
    notifications: initialNotifications
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2));
  } catch (err) {
    console.error('Failed to save store:', err);
  }
  return initialStore;
}

let store = loadDataStore();

function saveDataStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

// Generate time slots helper
function generateSlotsForTurfAndDate(turfId: string, dateStr: string): Slot[] {
  const existing = store.slots.filter(s => s.turf_id === turfId && s.date === dateStr);
  if (existing.length > 0) return existing;

  const turf = store.turfs.find(t => t.id === turfId);
  if (!turf) return [];

  const slots: Slot[] = [];
  const dateObj = new Date(dateStr);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const price = isWeekend && turf.weekend_price_per_hour ? turf.weekend_price_per_hour : turf.price_per_hour;

  // Generate hourly slots from 06:00 to 23:00
  const startHour = parseInt(turf.opening_time.split(':')[0], 10) || 6;
  const endHour = parseInt(turf.closing_time.split(':')[0], 10) || 23;

  for (let h = startHour; h < endHour; h++) {
    const sTime = `${h.toString().padStart(2, '0')}:00`;
    const eTime = `${(h + 1).toString().padStart(2, '0')}:00`;
    const slotId = `slot-${turfId}-${dateStr}-${sTime.replace(':', '')}`;

    // Check if booked in store
    const isBooked = store.bookings.some(
      b => b.turf_id === turfId && b.booking_date === dateStr && b.start_time === sTime && b.booking_status !== 'cancelled'
    );

    slots.push({
      id: slotId,
      turf_id: turfId,
      date: dateStr,
      start_time: sTime,
      end_time: eTime,
      price: price,
      status: isBooked ? 'booked' : 'available'
    });
  }

  store.slots.push(...slots);
  saveDataStore();
  return slots;
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Turf Booking API', timestamp: new Date() });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { fullname, email, password, phone, role } = req.body;
  if (!email || !fullname) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    fullname,
    email,
    phone: phone || '+91 98000 00000',
    role: role || 'customer',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullname)}`,
    status: 'active',
    created_at: new Date().toISOString()
  };

  store.users.push(newUser);
  saveDataStore();

  res.json({
    token: `jwt_mock_token_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account is suspended. Please contact administrator.' });
  }

  res.json({
    token: `jwt_mock_token_${user.id}_${Date.now()}`,
    user: user
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const emailQuery = req.query.email as string;
  const user = store.users.find(u => u.email === emailQuery) || store.users[0];
  res.json({ user });
});

app.put('/api/users/profile', (req, res) => {
  const { userId, fullname, phone, preferredSports, avatarUrl } = req.body;
  const user = store.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (fullname) user.fullname = fullname;
  if (phone) user.phone = phone;
  if (preferredSports) user.preferredSports = preferredSports;
  if (avatarUrl) user.avatarUrl = avatarUrl;

  saveDataStore();
  res.json({ user, message: 'Profile updated successfully' });
});

// Turf Routes
app.get('/api/turfs', (req, res) => {
  const { search, city, sport, minPrice, maxPrice, rating, featured } = req.query;
  let result = [...store.turfs].filter(t => t.status === 'active' || req.query.owner_id);

  if (req.query.owner_id) {
    result = store.turfs.filter(t => t.owner_id === req.query.owner_id);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      t => t.name.toLowerCase().includes(q) || t.area.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)
    );
  }

  if (city && city !== 'All') {
    result = result.filter(t => t.city.toLowerCase() === (city as string).toLowerCase());
  }

  if (sport && sport !== 'All') {
    result = result.filter(t => t.sport_types.includes(sport as any));
  }

  if (minPrice) {
    result = result.filter(t => t.price_per_hour >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(t => t.price_per_hour <= Number(maxPrice));
  }

  if (rating) {
    result = result.filter(t => t.rating >= Number(rating));
  }

  if (featured === 'true') {
    result = result.filter(t => t.is_featured);
  }

  res.json({ turfs: result, total: result.length });
});

app.get('/api/turfs/:id', (req, res) => {
  const turf = store.turfs.find(t => t.id === req.params.id);
  if (!turf) return res.status(404).json({ error: 'Turf not found' });

  const reviews = store.reviews.filter(r => r.turf_id === turf.id);
  res.json({ turf, reviews });
});

app.post('/api/turfs', (req, res) => {
  const turfData = req.body as Turf;
  if (!turfData.name || !turfData.city || !turfData.price_per_hour) {
    return res.status(400).json({ error: 'Name, city and price per hour are required' });
  }

  const newTurf: Turf = {
    ...turfData,
    id: `turf-${Date.now()}`,
    rating: 5.0,
    reviews_count: 0,
    status: turfData.status || 'active',
    created_at: new Date().toISOString()
  };

  store.turfs.push(newTurf);
  saveDataStore();
  res.status(201).json({ turf: newTurf, message: 'Turf created successfully' });
});

app.put('/api/turfs/:id', (req, res) => {
  const turfIndex = store.turfs.findIndex(t => t.id === req.params.id);
  if (turfIndex === -1) return res.status(404).json({ error: 'Turf not found' });

  store.turfs[turfIndex] = {
    ...store.turfs[turfIndex],
    ...req.body
  };

  saveDataStore();
  res.json({ turf: store.turfs[turfIndex], message: 'Turf updated successfully' });
});

app.delete('/api/turfs/:id', (req, res) => {
  store.turfs = store.turfs.filter(t => t.id !== req.params.id);
  saveDataStore();
  res.json({ message: 'Turf deleted successfully' });
});

// Slot Routes
app.get('/api/slots', (req, res) => {
  const { turf_id, date } = req.query;
  if (!turf_id || !date) {
    return res.status(400).json({ error: 'turf_id and date query parameters are required' });
  }

  const slots = generateSlotsForTurfAndDate(turf_id as string, date as string);
  res.json({ slots });
});

app.post('/api/slots/block', (req, res) => {
  const { slot_id, status } = req.body;
  const slot = store.slots.find(s => s.id === slot_id);
  if (slot) {
    slot.status = status; // 'blocked' or 'available'
    saveDataStore();
    return res.json({ slot, message: `Slot marked as ${status}` });
  }
  res.status(404).json({ error: 'Slot not found' });
});

// Booking Routes
app.get('/api/bookings', (req, res) => {
  const { user_id, owner_id } = req.query;
  let bookings = [...store.bookings];

  if (user_id) {
    bookings = bookings.filter(b => b.user_id === user_id);
  } else if (owner_id) {
    const ownerTurfIds = store.turfs.filter(t => t.owner_id === owner_id).map(t => t.id);
    bookings = bookings.filter(b => ownerTurfIds.includes(b.turf_id));
  }

  // Sort latest first
  bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ bookings });
});

app.post('/api/bookings', (req, res) => {
  const {
    user_id,
    user_name,
    user_email,
    user_phone,
    turf_id,
    slot_id,
    booking_date,
    coupon_code,
    payment_gateway
  } = req.body;

  const turf = store.turfs.find(t => t.id === turf_id);
  if (!turf) return res.status(404).json({ error: 'Turf not found' });

  let discount = 0;
  if (coupon_code) {
    const coupon = store.coupons.find(c => c.code.toUpperCase() === coupon_code.toUpperCase() && c.is_active);
    if (coupon) {
      discount = Math.min((turf.price_per_hour * coupon.discount_percentage) / 100, coupon.max_discount || 9999);
    }
  }

  const tax = Math.round((turf.price_per_hour - discount) * 0.18);
  const totalAmount = turf.price_per_hour - discount + tax;

  // Mark slot booked
  const slot = store.slots.find(s => s.id === slot_id);
  if (slot) slot.status = 'booked';

  const bookingId = `bk-${Date.now().toString().slice(-6)}`;
  const newBooking: Booking = {
    id: bookingId,
    user_id,
    user_name: user_name || 'Customer',
    user_email,
    user_phone,
    turf_id,
    turf_name: turf.name,
    turf_image: turf.images[0],
    turf_location: `${turf.location}, ${turf.city}`,
    slot_id,
    booking_date,
    start_time: slot ? slot.start_time : '18:00',
    end_time: slot ? slot.end_time : '19:00',
    sport_type: turf.sport_types[0],
    total_amount: totalAmount,
    discount_amount: discount,
    tax_amount: tax,
    booking_status: 'confirmed',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    qr_code: `TH-${bookingId.toUpperCase()}-CONFIRMED`
  };

  const paymentObj: Payment = {
    id: `pay-${Date.now()}`,
    booking_id: bookingId,
    user_id,
    payment_gateway: payment_gateway || 'razorpay',
    payment_id: `pay_${payment_gateway || 'rzp'}_${Date.now()}`,
    amount: totalAmount,
    currency: 'INR',
    payment_status: 'success',
    transaction_time: new Date().toISOString()
  };

  const notifObj: NotificationItem = {
    id: `notif-${Date.now()}`,
    user_id,
    title: 'Booking Confirmed! 🎉',
    message: `Your booking for ${turf.name} on ${booking_date} at ${newBooking.start_time} is confirmed.`,
    type: 'booking',
    is_read: false,
    created_at: new Date().toISOString()
  };

  store.bookings.push(newBooking);
  store.payments.push(paymentObj);
  store.notifications.push(notifObj);
  saveDataStore();

  res.status(201).json({
    booking: newBooking,
    payment: paymentObj,
    message: 'Booking created and paid successfully'
  });
});

app.put('/api/bookings/:id/cancel', (req, res) => {
  const booking = store.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  booking.booking_status = 'cancelled';
  booking.payment_status = 'refunded';

  // Free slot
  const slot = store.slots.find(s => s.id === booking.slot_id);
  if (slot) slot.status = 'available';

  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    user_id: booking.user_id,
    title: 'Booking Cancelled ℹ️',
    message: `Booking #${booking.id} for ${booking.turf_name} was cancelled. Refund processed.`,
    type: 'cancellation',
    is_read: false,
    created_at: new Date().toISOString()
  };
  store.notifications.push(notif);

  saveDataStore();
  res.json({ booking, message: 'Booking cancelled successfully' });
});

// Coupons Route
app.get('/api/coupons', (req, res) => {
  res.json({ coupons: store.coupons });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  const coupon = store.coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase() && c.is_active);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  if (amount && amount < coupon.min_order_amount) {
    return res.status(400).json({ error: `Minimum order amount for code ${coupon.code} is ₹${coupon.min_order_amount}` });
  }

  const discount = Math.min((amount * coupon.discount_percentage) / 100, coupon.max_discount || 9999);
  res.json({ coupon, discount });
});

// Review Routes
app.post('/api/reviews', (req, res) => {
  const { user_id, user_name, turf_id, rating, comment } = req.body;
  if (!turf_id || !rating) return res.status(400).json({ error: 'Turf and rating are required' });

  const newRev: Review = {
    id: `rev-${Date.now()}`,
    user_id,
    user_name: user_name || 'Customer',
    turf_id,
    rating: Number(rating),
    comment,
    created_at: new Date().toISOString()
  };

  store.reviews.push(newRev);

  // Recalculate turf rating
  const turf = store.turfs.find(t => t.id === turf_id);
  if (turf) {
    const turfRevs = store.reviews.filter(r => r.turf_id === turf_id);
    const avg = turfRevs.reduce((acc, r) => acc + r.rating, 0) / turfRevs.length;
    turf.rating = parseFloat(avg.toFixed(1));
    turf.reviews_count = turfRevs.length;
  }

  saveDataStore();
  res.status(201).json({ review: newRev, message: 'Review added successfully' });
});

app.delete('/api/reviews/:id', (req, res) => {
  store.reviews = store.reviews.filter(r => r.id !== req.params.id);
  saveDataStore();
  res.json({ message: 'Review deleted successfully' });
});

// Notifications Routes
app.get('/api/notifications', (req, res) => {
  const { user_id } = req.query;
  const notifs = store.notifications.filter(n => !user_id || n.user_id === user_id);
  res.json({ notifications: notifs });
});

app.put('/api/notifications/read', (req, res) => {
  const { user_id } = req.body;
  store.notifications.forEach(n => {
    if (!user_id || n.user_id === user_id) n.is_read = true;
  });
  saveDataStore();
  res.json({ message: 'Notifications marked as read' });
});

// Admin Analytics Routes
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = store.users.filter(u => u.role === 'customer').length;
  const totalOwners = store.users.filter(u => u.role === 'owner').length;
  const totalTurfs = store.turfs.length;
  const totalRevenue = store.payments.reduce((acc, p) => acc + (p.payment_status === 'success' ? p.amount : 0), 0);
  const activeBookings = store.bookings.filter(b => b.booking_status === 'confirmed').length;

  const stats: AdminStats = {
    totalUsers,
    totalOwners,
    totalTurfs,
    totalRevenue,
    activeBookings,
    revenueChart: [
      { month: 'Jan', amount: 45000 },
      { month: 'Feb', amount: 62000 },
      { month: 'Mar', amount: 84000 },
      { month: 'Apr', amount: 95000 },
      { month: 'May', amount: 112000 },
      { month: 'Jun', amount: 138000 }
    ],
    sportDistribution: [
      { name: 'Box Cricket', value: 40 },
      { name: 'Football', value: 32 },
      { name: 'Badminton', value: 15 },
      { name: 'Tennis', value: 8 },
      { name: 'Volleyball', value: 5 }
    ]
  };

  res.json(stats);
});

app.get('/api/admin/users', (req, res) => {
  res.json({ users: store.users });
});

app.put('/api/admin/users/:id/status', (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.status = req.body.status; // 'active' or 'suspended'
  saveDataStore();
  res.json({ user, message: `User status updated to ${user.status}` });
});

app.get('/api/admin/transactions', (req, res) => {
  res.json({ transactions: store.payments });
});

// Start Express Server + Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Turf Booking Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
