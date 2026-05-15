-- Run this in your Supabase Dashboard → SQL Editor

-- 1. Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT 'F1_Fan',
  handle TEXT NOT NULL DEFAULT '@F1_Fan',
  avatar_url TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to READ messages (public chat)
CREATE POLICY "Anyone can read messages"
  ON public.messages
  FOR SELECT
  USING (true);

-- 4. Allow authenticated users to INSERT their own messages
CREATE POLICY "Authenticated users can insert messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Enable Realtime on the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
