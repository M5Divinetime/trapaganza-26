import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from './supabase.js'

// ─── Constants ───────────────────────────────────────────────────────────────
const TICKET_TYPES = [
  {
    id: 'ga',
    name: 'Trapaganza Pass',
    label: 'General Admission',
    price: 10,
    description: 'Full event access in VRChat. World entry link sent to your email on purchase.',
    limit: null,
    sold: 0,
    maxQty: 10,
    color: '#D81E1E',
    fields: ['vrchat'],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor Package',
    label: 'Gold Sponsorship',
    price: 50,
    description: 'Logo on event flyer + live shoutout during the event.',
    limit: 10,
    sold: 3,
    maxQty: 1,
    color: '#C0A050',
    fields: ['brand', 'logo'],
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor Package',
    label: 'Platinum Sponsorship',
    price: 100,
    description: 'Logo on event flyer, live shoutout, social media post, and world logo placement.',
    limit: 5,
    sold: 2,
    maxQty: 1,
    color: '#D81E1E',
    fields: ['brand', 'logo'],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `$${n.toFixed(2)}`
const spotsLeft = (t) => t.limit === null ? null : t.limit - t.sold
const isSoldOut = (t) => t.limit !== null && t.sold >= t.limit

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Select', 'Details', 'Payment', 'Confirmation']
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => {
        const active = i === step
        const done   = i < step
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  backgroundColor: done ? '#D81E1E' : active ? '#D81E1E' : '#222',
                  color: done || active ? '#fff' : '#555',
                  clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className="text-xs uppercase tracking-widest hidden sm:block"
                    style={{ color: active ? '#F5F0ED' : done ? '#D81E1E' : '#555' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-10 md:w-16 h-[2px] mb-5 transition-all duration-300"
                   style={{ backgroundColor: i < step ? '#D81E1E' : '#2a2a2a' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Step 1: Select Tickets ───────────────────────────────────────────────────
function StepSelect({ quantities, setQuantities, onNext }) {
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0)
  const hasAny = Object.values(quantities).some(q => q > 0)

  const setQty = (id, val) => {
    const t = TICKET_TYPES.find(x => x.id === id)
    const max = t.maxQty
    const v = Math.max(0, Math.min(max, val))
    setQuantities(prev => ({ ...prev, [id]: v }))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Cards */}
      <div className="flex-1 flex flex-col gap-4">
        {TICKET_TYPES.map(t => {
          const soldOut = isSoldOut(t)
          const left    = spotsLeft(t)
          const qty     = quantities[t.id] || 0
          return (
            <div key={t.id}
                 className="border border-[#2a2a2a] p-6 transition-all duration-200"
                 style={{
                   backgroundColor: '#181818',
                   borderTopColor: t.color,
                   borderTopWidth: '3px',
                   opacity: soldOut ? 0.5 : 1,
                 }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <span className="text-xs uppercase tracking-widest font-bold mb-1 block"
                        style={{ color: t.color }}>
                    {t.label}
                    {left !== null && !soldOut && (
                      <span className="ml-2 text-[#888]">· {left} spots left</span>
                    )}
                    {soldOut && <span className="ml-2 text-[#D81E1E]">· SOLD OUT</span>}
                  </span>
                  <h3 className="text-[#F5F0ED] text-xl mb-1"
                      style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
                    {t.name}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed">{t.description}</p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  <span className="font-bold text-2xl" style={{ color: t.color,
                         fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
                    {fmt(t.price)}
                  </span>
                  {!soldOut && (
                    t.maxQty > 1 ? (
                      <div className="flex items-center gap-0">
                        <button onClick={() => setQty(t.id, qty - 1)}
                                className="w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
                                style={{ backgroundColor: qty > 0 ? '#D81E1E' : '#2a2a2a', color: '#fff',
                                         clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }}>
                          −
                        </button>
                        <span className="w-10 text-center text-[#F5F0ED] font-bold text-lg">{qty}</span>
                        <button onClick={() => setQty(t.id, qty + 1)}
                                className="w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
                                style={{ backgroundColor: qty < t.maxQty ? '#D81E1E' : '#2a2a2a', color: '#fff',
                                         clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)' }}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setQty(t.id, qty === 1 ? 0 : 1)}
                        className="btn-angled text-xs px-4 py-2 font-bold uppercase tracking-widest transition-all"
                        style={{
                          backgroundColor: qty === 1 ? t.color : 'transparent',
                          color: qty === 1 ? '#fff' : t.color,
                          boxShadow: `inset 0 0 0 2px ${t.color}`,
                          clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
                        }}>
                        {qty === 1 ? '✓ Selected' : 'Select'}
                      </button>
                    )
                  )}
                </div>
              </div>
              {qty > 0 && t.maxQty > 1 && (
                <div className="mt-3 pt-3 border-t border-[#2a2a2a] text-right text-sm font-bold" style={{ color: t.color }}>
                  {qty} ticket{qty > 1 ? 's' : ''} = {fmt(t.price * qty)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Order summary sidebar */}
      <div className="lg:w-72 flex flex-col gap-4">
        <div className="border border-[#2a2a2a] p-6 sticky top-20" style={{ backgroundColor: '#181818' }}>
          <h4 className="text-[#F5F0ED] uppercase tracking-widest text-sm font-bold mb-4 border-b border-[#2a2a2a] pb-3">
            Order Summary
          </h4>
          {!hasAny && (
            <p className="text-[#555] text-sm italic mb-4">No tickets selected yet.</p>
          )}
          {TICKET_TYPES.filter(t => (quantities[t.id] || 0) > 0).map(t => (
            <div key={t.id} className="flex justify-between text-sm mb-2">
              <span className="text-[#ccc]">{t.name} × {quantities[t.id]}</span>
              <span className="text-[#F5F0ED] font-bold">{fmt(t.price * quantities[t.id])}</span>
            </div>
          ))}
          {hasAny && <div className="border-t border-[#2a2a2a] my-3" />}
          <div className="flex justify-between font-bold text-lg">
            <span className="text-[#F5F0ED] uppercase tracking-widest text-sm">Total</span>
            <span style={{ color: '#D81E1E', fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '24px' }}>
              {fmt(total)}
            </span>
          </div>
          <button
            onClick={onNext}
            disabled={!hasAny}
            className="btn-angled btn-red w-full mt-6 py-3 text-base font-bold uppercase tracking-widest"
            style={{ opacity: hasAny ? 1 : 0.4, cursor: hasAny ? 'pointer' : 'not-allowed',
                     clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
            Proceed to Checkout →
          </button>
          <p className="text-[#555] text-xs text-center mt-3 uppercase tracking-widest">All sales are final.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable field (must live outside any render fn to keep focus) ───────────
function DetailField({ id, label, type = 'text', placeholder = '', value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest text-[#888] font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(id, e.target.value)}
        placeholder={placeholder}
        className="bg-[#111] border px-4 py-3 text-[#F5F0ED] text-sm outline-none transition-all"
        style={{ borderColor: error ? '#D81E1E' : '#2a2a2a', fontFamily: 'Barlow Condensed, sans-serif' }}
        onFocus={e => e.target.style.borderColor = '#D81E1E'}
        onBlur={e  => e.target.style.borderColor = error ? '#D81E1E' : '#2a2a2a'}
      />
      {error && <span className="text-[#D81E1E] text-xs">{error}</span>}
    </div>
  )
}

// ─── Step 2: Your Details ─────────────────────────────────────────────────────
function StepDetails({ quantities, details, setDetails, onNext, onBack }) {
  const needsVR    = (quantities['ga']       || 0) > 0
  const needsBrand = (quantities['gold']     || 0) > 0 || (quantities['platinum'] || 0) > 0
  const [errors, setErrors] = useState({})

  const set = (k, v) => setDetails(prev => ({ ...prev, [k]: v }))

  const validate = () => {
    const e = {}
    if (!details.firstName?.trim()) e.firstName = 'Required'
    if (!details.lastName?.trim())  e.lastName  = 'Required'
    if (!details.email?.trim() || !/\S+@\S+\.\S+/.test(details.email)) e.email = 'Valid email required'
    if (details.email !== details.confirmEmail) e.confirmEmail = 'Emails do not match'
    if (needsVR    && !details.vrchat?.trim())  e.vrchat = 'Required'
    if (needsBrand && !details.brand?.trim())   e.brand  = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) onNext() }

  return (
    <div className="max-w-xl mx-auto">
      <div className="border border-[#2a2a2a] p-8" style={{ backgroundColor: '#181818' }}>
        <h3 className="text-[#F5F0ED] text-2xl mb-6"
            style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
          Your Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField id="firstName" label="First Name" placeholder="First" value={details.firstName || ''} onChange={set} error={errors.firstName} />
          <DetailField id="lastName"  label="Last Name"  placeholder="Last"  value={details.lastName  || ''} onChange={set} error={errors.lastName} />
          <div className="sm:col-span-2">
            <DetailField id="email"        label="Email Address" type="email" placeholder="you@example.com"     value={details.email        || ''} onChange={set} error={errors.email} />
          </div>
          <div className="sm:col-span-2">
            <DetailField id="confirmEmail" label="Confirm Email" type="email" placeholder="Confirm your email"  value={details.confirmEmail || ''} onChange={set} error={errors.confirmEmail} />
          </div>
          {needsVR && (
            <div className="sm:col-span-2">
              <DetailField id="vrchat" label="VRChat Username" placeholder="Your VRChat display name" value={details.vrchat || ''} onChange={set} error={errors.vrchat} />
            </div>
          )}
          {needsBrand && (
            <>
              <div className="sm:col-span-2">
                <DetailField id="brand" label="Brand / Company Name" placeholder="Your brand or company" value={details.brand || ''} onChange={set} error={errors.brand} />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-[#888] font-bold">Logo URL</label>
                <input
                  type="url"
                  value={details.logo || ''}
                  onChange={e => set('logo', e.target.value)}
                  placeholder="https://yourdomain.com/logo.png"
                  className="bg-[#111] border px-4 py-3 text-[#F5F0ED] text-sm outline-none"
                  style={{ borderColor: '#2a2a2a', fontFamily: 'Barlow Condensed, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#D81E1E'}
                  onBlur={e  => e.target.style.borderColor = '#2a2a2a'}
                />
                <span className="text-[#555] text-xs">Or email your logo to trapstreetradio@email.com after purchase.</span>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onBack}
                  className="btn-angled btn-outline-white py-3 px-6 text-sm font-bold uppercase tracking-widest"
                  style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
            ← Back
          </button>
          <button onClick={handleNext}
                  className="btn-angled btn-red flex-1 py-3 text-base font-bold uppercase tracking-widest"
                  style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
            Continue to Payment →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Payment ──────────────────────────────────────────────────────────
const BASE_URL = window.location.origin

const STRIPE_LINKS = {
  ga:       `https://buy.stripe.com/cNi3cv4sZ6hc5lIfim43S02?success_url=${BASE_URL}/tickets?payment=success&cancel_url=${BASE_URL}/tickets?payment=cancelled`,
  gold:     `https://buy.stripe.com/14AcN5gbH494g0m0ns43S03?success_url=${BASE_URL}/tickets?payment=success&cancel_url=${BASE_URL}/tickets?payment=cancelled`,
  platinum: `https://buy.stripe.com/3cI6oH0cJcFAbK6c6a43S04?success_url=${BASE_URL}/tickets?payment=success&cancel_url=${BASE_URL}/tickets?payment=cancelled`,
}

function StepPayment({ quantities, details, onBack }) {
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0)
  const [saving, setSaving] = useState(false)

  const handlePay = async () => {
    const hasGA       = (quantities['ga']       || 0) > 0
    const hasGold     = (quantities['gold']     || 0) > 0
    const hasPlatinum = (quantities['platinum'] || 0) > 0

    // Save pending order to Supabase before redirecting
    setSaving(true)
    try {
      const orderType = hasGA ? 'ga' : hasGold ? 'gold' : 'platinum'
      const qty       = TICKET_TYPES.reduce((s, t) => s + (quantities[t.id] || 0), 0)
      await supabase.from('orders').insert([{
        order_number: `TSR-${Math.floor(100000 + Math.random() * 900000)}`,
        name:    `${details.firstName || ''} ${details.lastName || ''}`.trim(),
        email:   details.email    || '',
        vrchat:  details.vrchat   || null,
        brand:   details.brand    || null,
        logo:    details.logo     || null,
        type:    orderType,
        qty,
        total,
        status: 'pending',
      }])
    } catch (e) {
      // Non-blocking — still redirect even if save fails
    }
    setSaving(false)

    if (hasGA       && !hasGold && !hasPlatinum) { window.location.href = STRIPE_LINKS.ga;       return }
    if (hasGold     && !hasGA  && !hasPlatinum)  { window.location.href = STRIPE_LINKS.gold;     return }
    if (hasPlatinum && !hasGA  && !hasGold)       { window.location.href = STRIPE_LINKS.platinum; return }
    window.location.href = STRIPE_LINKS.ga
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Order summary */}
      <div className="border border-[#2a2a2a] p-6 mb-4" style={{ backgroundColor: '#181818' }}>
        <h4 className="text-[#F5F0ED] text-sm uppercase tracking-widest font-bold mb-3 border-b border-[#2a2a2a] pb-2">
          Order Summary
        </h4>
        {TICKET_TYPES.filter(t => (quantities[t.id] || 0) > 0).map(t => (
          <div key={t.id} className="flex justify-between text-sm mb-2">
            <span className="text-[#ccc]">{t.name} × {quantities[t.id]}</span>
            <span className="text-[#F5F0ED] font-bold">{fmt(t.price * quantities[t.id])}</span>
          </div>
        ))}
        <div className="border-t border-[#2a2a2a] mt-3 pt-3 flex justify-between">
          <span className="text-[#888] text-sm uppercase tracking-widest">Total</span>
          <span className="font-bold text-2xl" style={{ color: '#D81E1E', fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Stripe redirect panel */}
      <div className="border border-[#2a2a2a] p-8" style={{ backgroundColor: '#181818' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#F5F0ED] text-2xl" style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
            Payment
          </h3>
          <span className="flex items-center gap-2 text-xs text-[#888] uppercase tracking-widest border border-[#2a2a2a] px-3 py-1">
            🔒 Secured by Stripe
          </span>
        </div>

        <p className="text-[#888] text-sm mb-4 leading-relaxed">
          You'll be taken to Stripe's secure checkout to complete your payment. Accepts credit/debit card, Apple Pay, and Google Pay.
        </p>
        <p className="text-[#D81E1E] text-xs uppercase tracking-widest font-bold mb-8 border border-[#D81E1E] px-4 py-2 inline-block">
          ⚠ All sales are final — No refunds or exchanges.
        </p>

        <div className="flex gap-4">
          <button onClick={onBack}
                  className="btn-angled btn-outline-white py-3 px-6 text-sm font-bold uppercase tracking-widest"
                  style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
            ← Back
          </button>
          <button onClick={handlePay} disabled={saving}
                  className="btn-angled btn-red flex-1 py-3 text-base font-bold uppercase tracking-widest transition-all"
                  style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : `Complete Purchase — ${fmt(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────
function StepConfirmation({ quantities, details }) {
  const total = TICKET_TYPES.reduce((s, t) => s + t.price * (quantities[t.id] || 0), 0)
  const orderNum = `TSR-${Math.floor(100000 + Math.random() * 900000)}`
  const caption = encodeURIComponent(
    'Just grabbed my ticket to TRAPAGANZA 🔴 May 23 on VRChat — Trap Street Radio is bringing the heat. 🎤 #Trapaganza #TrapStreetRadio #VRChat'
  )

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* YOU'RE IN */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.7s ease both' }}>
        <div className="text-[#D81E1E] text-xs uppercase tracking-widest font-bold mb-2">Order Confirmed</div>
        <h2 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(56px, 12vw, 96px)',
                     color: '#D81E1E', lineHeight: 1 }}>
          YOU'RE IN!
        </h2>
        <p className="text-[#888] mt-2 text-sm">
          A confirmation email has been sent to{' '}
          <span className="text-[#F5F0ED] font-bold">{details.email}</span>.
          Your VRChat world link will be included — check your inbox before the event.
        </p>
      </div>

      {/* Order details */}
      <div className="border border-[#2a2a2a] p-6 text-left mb-6" style={{ backgroundColor: '#181818' }}>
        <h4 className="text-[#F5F0ED] text-sm uppercase tracking-widest font-bold mb-4 border-b border-[#2a2a2a] pb-2">
          Order Details
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#888]">Name</span>
            <span className="text-[#F5F0ED]">{details.firstName} {details.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">Order #</span>
            <span className="text-[#F5F0ED] font-bold" style={{ color: '#D81E1E' }}>{orderNum}</span>
          </div>
          {TICKET_TYPES.filter(t => (quantities[t.id] || 0) > 0).map(t => (
            <div key={t.id} className="flex justify-between">
              <span className="text-[#888]">{t.name} × {quantities[t.id]}</span>
              <span className="text-[#F5F0ED] font-bold">{fmt(t.price * quantities[t.id])}</span>
            </div>
          ))}
          <div className="border-t border-[#2a2a2a] pt-2 flex justify-between">
            <span className="text-[#888] uppercase tracking-widest text-xs">Total Paid</span>
            <span className="font-bold text-xl" style={{ color: '#D81E1E', fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
              {fmt(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Event info */}
      <div className="text-[#888] uppercase tracking-widest text-sm mb-8 flex justify-center gap-3 flex-wrap">
        <span>06.13.26</span>
        <span className="text-[#D81E1E]">·</span>
        <span>8:30 PM</span>
        <span className="text-[#D81E1E]">·</span>
        <span>VRChat</span>
      </div>

      {/* Social share */}
      <div className="flex flex-col gap-3 items-center">
        <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Share the event</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a href={`https://www.instagram.com/?caption=${caption}`}
             target="_blank" rel="noopener noreferrer"
             className="btn-angled btn-outline-white text-sm py-2 px-5"
             style={{ clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            Share on Instagram
          </a>
          <a href={`https://www.tiktok.com/upload?caption=${caption}`}
             target="_blank" rel="noopener noreferrer"
             className="btn-angled btn-red text-sm py-2 px-5"
             style={{ clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            Share on TikTok
          </a>
        </div>
        <Link to="/"
              className="mt-6 text-xs uppercase tracking-widest text-[#555] hover:text-[#D81E1E] transition-colors">
          ← Back to TRAPAGANZA
        </Link>
      </div>
    </div>
  )
}

// ─── Main Tickets page ────────────────────────────────────────────────────────
export default function Tickets() {
  const [step, setStep]             = useState(0)
  const [quantities, setQuantities] = useState({ ga: 0, gold: 0, platinum: 0 })
  const [details, setDetails]       = useState({})
  const [searchParams]              = useSearchParams()

  // Detect Stripe return — ?payment=success or ?payment=cancelled
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      // Mark the most recent pending order as confirmed
      supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .then(() => {})
      setStep(3) // jump to confirmation
      window.scrollTo(0, 0)
    }
    if (payment === 'cancelled') {
      setStep(0) // back to select
    }
  }, [])

  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0) }
  const back = () => { setStep(s => s - 1); window.scrollTo(0, 0) }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <div className="border-b-2 border-[#D81E1E] sticky top-0 z-50"
           style={{ backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#888] hover:text-[#D81E1E] transition-colors text-sm uppercase tracking-widest font-bold">
            ← Back
          </Link>
          <div className="text-center">
            <div className="text-[#D81E1E] text-xs uppercase tracking-widest font-bold">Trap Street Radio</div>
            <div className="text-[#F5F0ED] text-sm font-bold uppercase tracking-wider"
                 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
              TRAPAGANZA
            </div>
          </div>
          <div className="text-[#555] text-xs uppercase tracking-widest hidden sm:block">06.13.26 · VRChat</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero bar */}
        {step < 4 && (
          <div className="text-center mb-10">
            <h1 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif',
                         fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1 }}>
              <span style={{ color: '#D81E1E' }}>GET YOUR</span>{' '}
              <span style={{ color: '#F5F0ED' }}>TICKETS</span>
            </h1>
            <p className="text-[#555] uppercase tracking-widest text-xs mt-2">06.13.26 · 8:30 PM · VRChat</p>
          </div>
        )}

        <StepBar step={step} />

        {step === 0 && <StepSelect quantities={quantities} setQuantities={setQuantities} onNext={next} />}
        {step === 1 && <StepDetails quantities={quantities} details={details} setDetails={setDetails} onNext={next} onBack={back} />}
        {step === 2 && <StepPayment quantities={quantities} details={details} onBack={back} />}
        {step === 3 && <StepConfirmation quantities={quantities} details={details} />}
      </div>
    </div>
  )
}
