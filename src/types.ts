export type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  preferredSports?: string[];
  status: 'active' | 'suspended';
  created_at: string;
}

export type SportType = 'Cricket' | 'Football' | 'Box Cricket' | 'Badminton' | 'Tennis' | 'Volleyball';

export interface Turf {
  id: string;
  owner_id: string;
  owner_name?: string;
  name: string;
  description: string;
  location: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  weekend_price_per_hour?: number;
  sport_types: SportType[];
  images: string[];
  rating: number;
  reviews_count: number;
  amenities: string[];
  status: 'active' | 'pending' | 'rejected';
  is_featured?: boolean;
  opening_time: string; // e.g., "06:00"
  closing_time: string; // e.g., "23:00"
  created_at: string;
}

export interface Slot {
  id: string;
  turf_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  price: number;
  status: 'available' | 'booked' | 'blocked';
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rejected';

export interface Booking {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  turf_id: string;
  turf_name: string;
  turf_image: string;
  turf_location: string;
  slot_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  sport_type: SportType;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  booking_status: BookingStatus;
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  qr_code?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  payment_gateway: 'razorpay' | 'stripe';
  payment_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  payment_status: 'success' | 'failed' | 'pending';
  transaction_time: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  turf_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  max_discount?: number;
  min_order_amount: number;
  valid_until: string;
  is_active: boolean;
  description: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'cancellation' | 'reminder' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalTurfs: number;
  totalRevenue: number;
  activeBookings: number;
  revenueChart: { month: string; amount: number }[];
  sportDistribution: { name: string; value: number }[];
}
