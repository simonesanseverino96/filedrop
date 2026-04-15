import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const plan = session.metadata?.plan
      if (userId && plan) {
        await supabase.from('profiles').update({
          plan,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      const plan = sub.metadata?.plan
      if (userId) {
        await supabase.from('profiles').update({
          plan: sub.status === 'active' ? plan : 'free',
          subscription_status: sub.status,
          subscription_ends_at: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('profiles').update({
          plan: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', userId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (profile) {
        await supabase.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
