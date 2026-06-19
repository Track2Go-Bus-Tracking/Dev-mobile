-- Track2Go Mobile Extensions
-- Run in Supabase SQL Editor (same project as Admin Dashboard)

-- Profiles linked to Supabase Auth (mobile users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'conductor', 'admin', 'operator', 'viewer')),
  assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bus_arriving', 'delay', 'emergency', 'route_change', 'system', 'admin_message')),
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip history table
CREATE TABLE IF NOT EXISTS trip_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  passenger_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('completed', 'in_progress', 'cancelled'))
);

-- Bus schedules table
CREATE TABLE IF NOT EXISTS bus_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  route_name TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  terminal_name TEXT NOT NULL,
  bus_number TEXT,
  days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add operating hours to terminals if missing
ALTER TABLE terminals ADD COLUMN IF NOT EXISTS operating_hours TEXT DEFAULT '5:00 AM – 10:00 PM';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_history_driver_id ON trip_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_trip_history_bus_id ON trip_history(bus_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_history;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'passenger')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Passengers can read buses" ON buses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Passengers can read gps_logs" ON gps_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Passengers can read seat_status" ON seat_status
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Passengers can read passenger_counts" ON passenger_counts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Drivers can create emergency alerts" ON emergency_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('driver', 'conductor')
    )
  );

CREATE POLICY "Authenticated can read emergency alerts" ON emergency_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Drivers can read own trips" ON trip_history
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can create trips" ON trip_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('driver', 'conductor')
    )
  );

CREATE POLICY "Drivers can update own trips" ON trip_history
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());

-- Seed sample schedules
INSERT INTO bus_schedules (route_name, departure_time, arrival_time, terminal_name, bus_number) VALUES
  ('CDO → Manolo Fortich', '06:00', '07:30', 'CDO Central Terminal', 'BUS-001'),
  ('CDO → Manolo Fortich', '08:00', '09:30', 'CDO Central Terminal', 'BUS-002'),
  ('Manolo Fortich → CDO', '07:00', '08:30', 'Manolo Fortich Terminal', 'BUS-001')
ON CONFLICT DO NOTHING;
