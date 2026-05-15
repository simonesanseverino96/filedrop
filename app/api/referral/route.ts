import { NextResponse } from 'next/server'

// Placeholder endpoint — returns zeroes until the referrals table is added to Supabase.
// Required migration:
//   CREATE TABLE referrals (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
//     referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
//     code TEXT NOT NULL,
//     status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed
//     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
//   );
//   CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

export async function GET() {
  return NextResponse.json({ referrals: 0, pending: 0 })
}
