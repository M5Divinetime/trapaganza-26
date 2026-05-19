import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

const TYPE_NAMES: Record<string, string> = {
  ga:       'Trapaganza Pass — General Admission',
  gold:     'Gold Sponsor Package',
  platinum: 'Platinum Sponsor Package',
}

serve(async (req) => {
  try {
    const body = await req.json()
    // Supabase DB webhook sends { type, table, record, old_record }
    const record = body.record ?? body

    if (!record?.email) {
      return new Response('No email in record', { status: 400 })
    }

    const firstName  = (record.name || '').split(' ')[0] || 'Friend'
    const ticketType = TYPE_NAMES[record.type] || record.type || 'Ticket'
    const isGA       = record.type === 'ga'
    const isSponsor  = record.type === 'gold' || record.type === 'platinum'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F0ED;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="border-bottom:3px solid #D81E1E;padding-bottom:24px;text-align:center;">
            <p style="margin:0 0 4px;color:#D81E1E;font-size:11px;letter-spacing:4px;text-transform:uppercase;">
              Trap Street Radio Presents
            </p>
            <h1 style="margin:0;font-size:72px;line-height:1;letter-spacing:-1px;font-weight:900;">
              <span style="color:#D81E1E;">TRAP</span><span style="color:#F5F0ED;">AGANZA</span>
            </h1>
            <p style="margin:8px 0 0;color:#888;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',monospace;">
              06.13.26 · 8:30 PM · VRChat
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 0 24px;">
            <p style="margin:0 0 8px;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Hey ${firstName},</p>
            <p style="margin:0;font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Your ticket is confirmed.<br/>
              <span style="color:#D81E1E;">See you in the world.</span>
            </p>
          </td>
        </tr>

        <!-- Order details -->
        <tr>
          <td style="background:#181818;border-left:3px solid #D81E1E;padding:24px 28px;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['EVENT',    'TRAPAGANZA'],
                ['DATE',     'June 13, 2026'],
                ['TIME',     '8:30 PM'],
                ['PLATFORM', 'VRChat'],
                ['TICKET',   ticketType],
                ['QTY',      String(record.qty ?? 1)],
                ['ORDER TOTAL', record.total === 0 ? 'COMP' : `$${Number(record.total).toFixed(2)}`],
                ['ORDER #',  record.order_number || '—'],
              ].map(([label, value]) => `
              <tr>
                <td style="color:#666;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:6px 0;width:140px;">${label}</td>
                <td style="color:#F5F0ED;font-size:13px;padding:6px 0;font-weight:600;">${value}</td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- GA message -->
        ${isGA ? `
        <tr>
          <td style="padding:28px 0 0;">
            <div style="border:1px solid #2a2a2a;padding:20px 24px;">
              <p style="margin:0 0 6px;color:#D81E1E;font-size:11px;letter-spacing:3px;text-transform:uppercase;">VRChat World Link</p>
              <p style="margin:0;color:#888;font-size:14px;line-height:1.6;">
                Your world entry link will be sent to this email before the event goes live.<br/>
                Make sure you're in VRChat before <strong style="color:#F5F0ED;">8:30 PM on June 13.</strong>
              </p>
            </div>
          </td>
        </tr>` : ''}

        <!-- Sponsor message -->
        ${isSponsor ? `
        <tr>
          <td style="padding:28px 0 0;">
            <div style="border:1px solid #C0A050;padding:20px 24px;">
              <p style="margin:0 0 6px;color:#C0A050;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Sponsor Next Steps</p>
              <p style="margin:0;color:#888;font-size:14px;line-height:1.6;">
                Our team will be in touch within <strong style="color:#F5F0ED;">48 hours</strong> to collect your logo and confirm your placement details.<br/>
                Questions? Reply directly to this email.
              </p>
            </div>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:40px 0 0;text-align:center;border-top:1px solid #222;margin-top:32px;">
            <p style="margin:0 0 4px;color:#D81E1E;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Trap Street Radio</p>
            <p style="margin:0;color:#444;font-size:11px;">© 2026 Trap Street Radio. All rights reserved.</p>
            <p style="margin:8px 0 0;color:#333;font-size:10px;text-transform:uppercase;letter-spacing:2px;">All sales are final — No refunds or exchanges.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'TRAPAGANZA <noreply@trapstreetradio.com>',
        to:      record.email,
        subject: `You're in — TRAPAGANZA 🔴 06.13.26`,
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
