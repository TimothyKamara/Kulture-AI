
-- Destinations table
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cultural_significance TEXT,
  best_time_to_visit TEXT,
  image_url TEXT,
  rating FLOAT DEFAULT 4.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);

-- Cultural knowledge table
CREATE TABLE public.cultural_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('history', 'tradition', 'food', 'landmark', 'event')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cultural_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cultural knowledge is viewable by everyone" ON public.cultural_knowledge FOR SELECT USING (true);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'tour', 'transport')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  price_range TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);

-- User activity table
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('chat', 'trip_plan', 'quiz', 'recommendation', 'story')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert activity" ON public.user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own activity" ON public.user_activity FOR SELECT USING (true);
