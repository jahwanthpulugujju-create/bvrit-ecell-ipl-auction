-- Fix: Reconcile teams table schema with app expectations
-- Run this in Supabase Dashboard > SQL Editor

-- Fix old columns that have NOT NULL constraints the app doesn't satisfy
ALTER TABLE public.teams ALTER COLUMN short_name SET DEFAULT '';
ALTER TABLE public.teams ALTER COLUMN short_name DROP NOT NULL;

-- Make logo nullable if it exists (app doesn't send it)
ALTER TABLE public.teams ALTER COLUMN logo DROP NOT NULL;

-- Add city column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';

-- Add slug column if missing (used as URL identifier)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';

-- Add initial_purse column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS initial_purse INTEGER NOT NULL DEFAULT 12000;

-- Add purse column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS purse INTEGER NOT NULL DEFAULT 12000;

-- Add rtm_remaining column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS rtm_remaining INTEGER NOT NULL DEFAULT 2;

-- Add updated_at column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add is_active column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add password_hash column if missing (old schema may have it already)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- Add color column if missing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#00d4ff';
