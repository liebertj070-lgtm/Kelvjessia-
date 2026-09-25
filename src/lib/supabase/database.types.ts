// Hand-authored to match supabase/schema.sql exactly. If the schema
// changes, update this file too (or generate it for real once the
// Supabase CLI is wired into this project: `supabase gen types
// typescript --project-id <id> > src/lib/supabase/database.types.ts`).

export type BookingRow = {
  id: string;
  user_id: string;
  reference: string;
  kind: "seat" | "package";
  destination_slug: string;
  direction: "outbound" | "return";
  from_city: string;
  to_city: string;
  seats: string[] | null;
  passengers: number | null;
  day: string | null;
  date: string | null;
  time: string | null;
  description: string | null;
  category: string | null;
  declared_value_naira: number | null;
  size_id: string | null;
  fragile: boolean | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  pickup_point: string | null;
  dropoff_point: string | null;
  amount_naira: number;
  paid_status: "paid" | "pickup" | "wallet";
  payment_method: string | null;
  bus_plate: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  trip_status: "scheduled" | "boarding" | "in_transit" | "delayed" | "arrived" | "cancelled";
  progress_percent: number;
  current_lat: number | null;
  current_lng: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  affiliate_id: string | null;
  default_pickup: string | null;
  role: "passenger" | "driver" | "dispatcher" | "admin";
  notify_trip_updates: boolean;
  notify_delivery_updates: boolean;
  notify_promotional: boolean;
  notify_sms: boolean;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  category: "trip" | "delivery" | "offer";
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
};

export type DestinationRow = {
  slug: string;
  city: string;
  fare_naira: number;
  package_fare_naira: number;
  duration_minutes: number;
  lat: number;
  lng: number;
};

export type BookingSeatRow = {
  id: number;
  booking_id: string;
  destination_slug: string;
  direction: "outbound" | "return";
  date: string;
  time: string;
  seat: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: BookingRow;
        Insert: Partial<BookingRow> &
          Pick<
            BookingRow,
            | "user_id"
            | "reference"
            | "kind"
            | "destination_slug"
            | "direction"
            | "from_city"
            | "to_city"
            | "amount_naira"
            | "paid_status"
            | "payment_method"
          >;
        Update: Partial<BookingRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Omit<NotificationRow, "id" | "created_at" | "read"> &
          Partial<Pick<NotificationRow, "read">>;
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
      destinations: {
        Row: DestinationRow;
        Insert: DestinationRow;
        Update: Partial<DestinationRow>;
        Relationships: [];
      };
      booking_seats: {
        Row: BookingSeatRow;
        Insert: Omit<BookingSeatRow, "id" | "created_at">;
        Update: Partial<BookingSeatRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_my_location: {
        Args: { p_booking_id: string; p_lat: number; p_lng: number };
        Returns: undefined;
      };
    };
  };
};
