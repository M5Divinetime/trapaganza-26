import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase.js'

const TYPE_LABELS = { ga: 'General Admission', gold: 'Gold Sponsor', platinum: 'Platinum Sponsor' }
const TYPE_COLORS = { ga: '#D81E1E', gold: '#C0A050', platinum: '#D81E1E' }
const fmt = (n) => `$${Number(n).toFixed(2)}`

export default function Admin() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [compModal, setCompModal] = useState(false)
  const [comp, setComp]           = useState({ name: '', email: '', vrchat: '', type: 'ga', note: '' })

  // ── Fetch orders ────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  // ── Refund ──────────────────────────────────────────────────────
  const handleRefund = async (id) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', id)
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'refunded' } : o))
  }

  // ── Add comp ────────────────────────────────────────────────────
  const addComp = async () => {
    const newOrder = {
      order_number: `TSR-COMP-${Math.floor(Math.random() * 9000 + 1000)}`,
      name:    comp.name,
      email:   comp.email,
      vrchat:  comp.vrchat,
      type:    comp.type,
      qty:     1,
      total:   0,
      status:  'comp',
      note:    comp.note,
    }
    const { data, error } = await supabase.from('orders').insert([newOrder]).select()
    if (!error && data) setOrders(prev => [data[0], ...prev])
    setCompModal(false)
    setComp({ name: '', email: '', vrchat: '', type: 'ga', note: '' })
  }

  // ── Export CSV ──────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Order #', 'Name', 'Email', 'VRChat', 'Brand', 'Type', 'Qty', 'Total', 'Date', 'Status'],
      ...orders.map(o => [
        o.order_number || o.id, o.name, o.email,
        o.vrchat || '', o.brand || '',
        TYPE_LABELS[o.type] || o.type,
        o.qty, o.total,
        (o.created_at || '').slice(0, 10),
        o.status,
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'trapaganza-buyers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered   = filter === 'all' ? orders : orders.filter(o => o.type === filter)
  const confirmed  = orders.filter(o => o.status === 'confirmed')
  const gaTickets  = confirmed.filter(o => o.type === 'ga').reduce((s, o) => s + (o.qty || 0), 0)
  const goldCount  = confirmed.filter(o => o.type === 'gold').length
  const platCount  = confirmed.filter(o => o.type === 'platinum').length
  const totalRev   = confirmed.reduce((s, o) => s + (Number(o.total) || 0), 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <div className="border-b-2 border-[#D81E1E]" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <div className="text-[#D81E1E] text-xs uppercase tracking-widest font-bold">Trap Street Radio</div>
            <div className="text-[#F5F0ED] text-sm font-bold uppercase tracking-wider"
                 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
              TRAPAGANZA — Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchOrders}
                    className="text-xs uppercase tracking-widest text-[#555] hover:text-[#D81E1E] transition-colors">
              ↻ Refresh
            </button>
            <Link to="/" className="text-xs uppercase tracking-widest text-[#555] hover:text-[#D81E1E] transition-colors">
              ← Live Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Revenue',      value: fmt(totalRev),            color: '#D81E1E' },
            { label: 'GA Tickets Sold',    value: `${gaTickets}`,           color: '#F5F0ED' },
            { label: 'Gold Sponsors',      value: `${goldCount} / 10`,      color: '#C0A050' },
            { label: 'Platinum Sponsors',  value: `${platCount} / 5`,       color: '#D81E1E' },
          ].map(s => (
            <div key={s.label} className="border border-[#2a2a2a] p-5" style={{ backgroundColor: '#181818' }}>
              <p className="text-[#555] text-xs uppercase tracking-widest mb-2">{s.label}</p>
              <p className="font-bold text-3xl"
                 style={{ color: s.color, fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'ga', 'gold', 'platinum'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className="text-xs uppercase tracking-widest px-4 py-2 font-bold transition-all"
                      style={{
                        clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)',
                        backgroundColor: filter === f ? '#D81E1E' : '#181818',
                        color: filter === f ? '#fff' : '#888',
                        border: '1px solid #2a2a2a',
                      }}>
                {f === 'all' ? 'All Orders' : TYPE_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setCompModal(true)}
                    className="btn-angled btn-outline-white text-xs py-2 px-4 font-bold uppercase tracking-widest"
                    style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
              + Add Comp
            </button>
            <button onClick={exportCSV}
                    className="btn-angled btn-red text-xs py-2 px-4 font-bold uppercase tracking-widest"
                    style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#2a2a2a] overflow-x-auto" style={{ backgroundColor: '#181818' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#555]">
              <span className="inline-block w-5 h-5 border-2 border-[#D81E1E] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm uppercase tracking-widest">Loading orders...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[#555] text-sm uppercase tracking-widest">
              No orders yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]" style={{ backgroundColor: '#111' }}>
                  {['Order #', 'Name', 'Email', 'VRChat / Brand', 'Type', 'Qty', 'Total', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#555] font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-[#1a1a1a] transition-colors hover:bg-[#1f1f1f]">
                    <td className="px-4 py-3 font-bold text-xs" style={{ color: '#D81E1E' }}>
                      {o.order_number || o.id}
                    </td>
                    <td className="px-4 py-3 text-[#F5F0ED]">{o.name}</td>
                    <td className="px-4 py-3 text-[#888]">{o.email}</td>
                    <td className="px-4 py-3 text-[#888]">{o.vrchat || o.brand || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5"
                            style={{ color: TYPE_COLORS[o.type], border: `1px solid ${TYPE_COLORS[o.type]}` }}>
                        {TYPE_LABELS[o.type] || o.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#F5F0ED]">{o.qty}</td>
                    <td className="px-4 py-3 font-bold text-[#F5F0ED]">
                      {o.total === 0 ? 'COMP' : fmt(o.total)}
                    </td>
                    <td className="px-4 py-3 text-[#555]">{(o.created_at || '').slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase tracking-widest font-bold"
                            style={{ color: o.status === 'confirmed' ? '#4ade80' : o.status === 'refunded' ? '#888' : '#C0A050' }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.status === 'confirmed' && (
                        <button onClick={() => handleRefund(o.id)}
                                className="text-xs uppercase tracking-widest text-[#555] hover:text-[#D81E1E] transition-colors font-bold">
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-[#555] text-xs mt-3">{filtered.length} order{filtered.length !== 1 ? 's' : ''} shown</p>
      </div>

      {/* Comp modal */}
      {compModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
             onClick={e => { if (e.target === e.currentTarget) setCompModal(false) }}>
          <div className="w-full max-w-md border border-[#D81E1E] p-8" style={{ backgroundColor: '#181818' }}>
            <h3 className="text-[#F5F0ED] text-2xl mb-6"
                style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
              Add Comp Ticket
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { id: 'name',   label: 'Full Name',       placeholder: 'Artist or staff name' },
                { id: 'email',  label: 'Email',           placeholder: 'email@example.com' },
                { id: 'vrchat', label: 'VRChat Username', placeholder: 'Display name in VRChat' },
              ].map(f => (
                <div key={f.id} className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-[#888] font-bold">{f.label}</label>
                  <input value={comp[f.id]}
                         onChange={e => setComp(p => ({ ...p, [f.id]: e.target.value }))}
                         placeholder={f.placeholder}
                         className="bg-[#111] border border-[#2a2a2a] px-4 py-3 text-[#F5F0ED] text-sm outline-none"
                         style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                         onFocus={e => e.target.style.borderColor = '#D81E1E'}
                         onBlur={e  => e.target.style.borderColor = '#2a2a2a'} />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-[#888] font-bold">Ticket Type</label>
                <select value={comp.type} onChange={e => setComp(p => ({ ...p, type: e.target.value }))}
                        className="bg-[#111] border border-[#2a2a2a] px-4 py-3 text-[#F5F0ED] text-sm outline-none"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  <option value="ga">General Admission</option>
                  <option value="gold">Gold Sponsor</option>
                  <option value="platinum">Platinum Sponsor</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-[#888] font-bold">Note (optional)</label>
                <input value={comp.note}
                       onChange={e => setComp(p => ({ ...p, note: e.target.value }))}
                       placeholder="e.g. Headliner, Staff, Press"
                       className="bg-[#111] border border-[#2a2a2a] px-4 py-3 text-[#F5F0ED] text-sm outline-none"
                       style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                       onFocus={e => e.target.style.borderColor = '#D81E1E'}
                       onBlur={e  => e.target.style.borderColor = '#2a2a2a'} />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setCompModal(false)}
                      className="btn-angled btn-outline-white py-3 px-6 text-sm font-bold uppercase tracking-widest"
                      style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
                Cancel
              </button>
              <button onClick={addComp}
                      className="btn-angled btn-red flex-1 py-3 text-sm font-bold uppercase tracking-widest"
                      style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
                Add Comp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
