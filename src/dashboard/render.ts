import { approvalMessage } from '../approval/message.ts'
import { memoryStore, type ApprovalDraft, type MemoryStore } from '../approval/queue.ts'
import { exampleDrafts } from '../content/examples.ts'
import { generatedSample } from '../content/generated-sample.ts'
import { brandLogoPath } from '../config/brand.ts'
import { projectConfig } from '../config/project-config.ts'
import { calendar } from '../baseline/calendar.ts'
import { ideas } from '../baseline/ideas.ts'
import { baselineMetrics } from '../baseline/metrics.ts'
import type { CommunityDesk } from '../community/desk.ts'
import { whatsappNotice } from '../community/intake.ts'
import type { ManualMetric } from '../metrics/record.ts'
import { monthlyReport } from '../metrics/report.ts'
import { trackingLink } from '../metrics/utm.ts'
import { escapeHtml } from './escape.ts'
import type { Enquiry } from './inbox.ts'

export { escapeHtml }

function channelLabel(channel: string): string {
  if (channel === 'facebook') return 'Facebook'
  if (channel === 'instagram') return 'Instagram'
  return channel
}

function list(values: readonly string[]): string {
  return `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`
}

function roleField(): string {
  return '<label>Role <select name="role"><option>READ</option><option>WRITE</option><option>PUBLISH</option><option>ADMIN</option></select></label>'
}

function trackingLines(item: ApprovalDraft): string {
  return (['facebook', 'instagram'] as const).map((channel) => {
    const link = trackingLink(projectConfig.website, {
      id: item.id,
      channel,
      pillar: projectConfig.contentPillars[0] ?? '',
    })
    return `<p><a href="${escapeHtml(link)}">${channelLabel(channel)} tracking link</a></p>`
  }).join('')
}

function approvable(item: ApprovalDraft): boolean {
  return !item.sample && item.missing !== 'MISSING_SOURCE_DATA'
}

function approvalSection(store: MemoryStore, notice: string | undefined): string {
  const items = [...store.items.values()].filter(approvable)
  const awaiting = items.filter((item) => item.status === 'AWAITING_APPROVAL')
  const sendable = items.filter((item) => item.status === 'APPROVED' || item.status === 'SCHEDULED')
  const messages = awaiting
    .map((item) => `<pre>${escapeHtml(approvalMessage(item))}</pre>${trackingLines(item)}`)
    .join('')
  const reply = awaiting.length === 0
    ? ''
    : `<form method="post" action="/approvals"><input type="hidden" name="action" value="decide"><label>Reply <input name="reply"></label> <button type="submit">Record reply</button></form>`
  const sends = sendable
    .map((item) => `<form method="post" action="/approvals"><input type="hidden" name="action" value="send"><input type="hidden" name="id" value="${escapeHtml(item.id)}"><button type="submit">Send ${escapeHtml(item.id)}</button></form>`)
    .join('')
  const empty = awaiting.length === 0 && sendable.length === 0 ? '<p>No posts are waiting for approval.</p>' : ''
  const note = notice === 'not-sent' ? '<p>This post was not sent.</p>' : ''
  return `${empty}${messages}${reply}${sends}<p>This page cannot send posts.</p>${note}${list(projectConfig.approvalOwners)}`
}

function enquirySection(items: readonly Enquiry[], notice: string | undefined): string {
  const note = notice === 'inbox-not-sent' ? '<p>Reply was not sent.</p>' : ''
  if (items.length === 0) return `${note}<p>No enquiries yet.</p>`
  return note + items.map((item) => {
    const reply = item.suggestedReply ? `<p>${escapeHtml(item.suggestedReply)}</p>` : '<p>No reply.</p>'
    const hold = item.status === 'draft' ? '<p>Held</p>' : item.status === 'escalated' ? '<p>Escalated</p>' : ''
    const staff = item.status === 'ignored' ? '' : `<p>${escapeHtml(whatsappNotice(item))}</p>`
    return `<p>${escapeHtml(item.channel)} · ${escapeHtml(item.person)}</p><p>${escapeHtml(item.text)}</p><p>${escapeHtml(item.classification)}</p>${hold}${reply}${staff}`
  }).join('')
}

function reviewSection(reviews: CommunityDesk['reviews']): string {
  const rows = reviews.map((review) => `<p>Draft reply. Not sent.</p><p>${escapeHtml(review.suggestedReply)}</p>`).join('')
  const empty = reviews.length === 0 ? '<p>No reviews yet.</p>' : ''
  return `${empty}${rows}<form method="post" action="/reviews">${roleField()} <label>Review <input name="text"></label> <button type="submit">Save draft</button></form>`
}

function visibilitySection(checks: CommunityDesk['checks']): string {
  const rows = checks.length === 0
    ? '<p>No visibility checks yet.</p>'
    : checks.map((check) => `<p>${escapeHtml(check.businessField)}: ${escapeHtml(check.status)}</p>`).join('')
  return `${rows}<form method="post" action="/visibility">${roleField()} <label>Field <input name="field"></label> <label>Observed <input name="observed"></label> <button type="submit">Check</button></form>`
}

function performanceSection(metrics: readonly ManualMetric[], enquiries: readonly Enquiry[]): string {
  const saved = new Map(metrics.map((row) => [row.channel, row]))
  const lines = baselineMetrics.map((row) => {
    const manual = saved.get(row.channel)
    if (!manual) return `${channelLabel(row.channel)}: no posts or reach yet`
    return `${channelLabel(row.channel)} ${manual.metricDate}: posts ${manual.posts}, reach ${manual.reach}, engagement ${manual.engagement}. Source manual.`
  })
  const intro = metrics.length === 0
    ? '<p>Facebook and Instagram are not connected, so these are not results.</p>'
    : ''
  return `${intro}${list(lines)}<h3>Monthly report</h3><pre>${escapeHtml(monthlyReport(metrics, enquiries))}</pre>`
}

export function renderDashboard(
  store: MemoryStore = memoryStore(),
  notice?: string,
  enquiries: readonly Enquiry[] = [],
  desk: CommunityDesk = { reviews: [], checks: [] },
  metrics: readonly ManualMetric[] = [],
): string {
  const logo = brandLogoPath('logo-wide.jpg')
  const website = projectConfig.website
  const profile: [string, string][] = [
    ['Address', escapeHtml(projectConfig.address)],
    ['Phone', `<a href="tel:${projectConfig.phone.replaceAll(' ', '')}">${escapeHtml(projectConfig.phone)}</a>`],
    ['Website', `<a href="${escapeHtml(website)}">${escapeHtml(website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`],
    ['Hours', escapeHtml(projectConfig.openingHours)],
    ['Category', escapeHtml(projectConfig.primaryCategory)],
  ]
  const schedule = calendar.length === 0
    ? '<p>No campaign dates. Marketing is ongoing.</p>'
    : list(calendar.map((slot) => `${slot.date} — ${slot.title}`))

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MCG Property marketing</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 0 auto; background: #f4f4f4; color: #111; line-height: 1.45; }
header { background: #000; color: #fff; padding: 1.25rem; }
header img { display: block; width: 14rem; height: auto; }
h1 { font-size: 1.5rem; margin: 0.8rem 0 0.2rem; }
header p { margin: 0; }
main { padding: 0.9rem; }
section { background: #fff; padding: 0.9rem 1rem 1rem; margin-bottom: 0.7rem; }
h2 { font-size: 1rem; margin: 0 0 0.45rem; }
figure { margin: 0 0 0.8rem; }
figure img { width: 100%; height: auto; background: #000; }
ul { margin: 0.2rem 0 0; padding-left: 1.1rem; }
a { color: inherit; }
pre { white-space: pre-wrap; font: inherit; margin: 0.4rem 0 0.8rem; }
form { margin: 0.6rem 0; }
</style>
</head>
<body>
<header>
<img src="${logo ?? ''}" alt="MCG Property">
<h1>Marketing</h1>
<p>${escapeHtml(projectConfig.marketingGoal)}</p>
<p>${projectConfig.channels.map(channelLabel).join(' and ')}</p>
</header>
<main>
<p>Preview. These are not live results.</p>
<section>
<h2>Business</h2>
<ul>${profile.map(([label, value]) => `<li>${escapeHtml(label)}: ${value}</li>`).join('')}</ul>
</section>
<section>
<h2>Content</h2>
<p>Pillars</p>
${list(projectConfig.contentPillars)}
${schedule}
<p>Example ideas</p>
${list(ideas.map((idea) => idea.title))}
</section>
<section>
<h2>Drafts</h2>
<figure>
<img src="${generatedSample.image}" alt="Sample property tip graphic">
<figcaption>${escapeHtml(`${generatedSample.title} — ${generatedSample.template}`)}</figcaption>
<p>${escapeHtml(generatedSample.caption)}</p>
<p>Sample graphic. This is not a photograph of a property.</p>
</figure>
${list(exampleDrafts.map((draft) => `${draft.title} — ${draft.template}`))}
</section>
<section>
<h2>Approvals</h2>
${approvalSection(store, notice)}
</section>
<section>
<h2>Enquiries</h2>
${enquirySection(enquiries, notice)}
</section>
<section>
<h2>Reviews</h2>
${reviewSection(desk.reviews)}
</section>
<section>
<h2>Visibility</h2>
${visibilitySection(desk.checks)}
</section>
<section>
<h2>Performance</h2>
${performanceSection(metrics, enquiries)}
</section>
</main>
</body>
</html>`
}

export function renderAdmin(
  audits: readonly { event: string; timestamp: string }[],
  switches: readonly { name: string; enabled: boolean }[],
): string {
  const notes = audits.length === 0
    ? '<p>No alerts.</p>'
    : `<ul>${audits.map((item) => `<li>${escapeHtml(item.event)} ${escapeHtml(item.timestamp)}</li>`).join('')}</ul>`
  const flags = `<ul>${switches.map((item) => `<li>${escapeHtml(item.name)}: ${item.enabled ? 'on' : 'off'}</li>`).join('')}</ul>`
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Admin</title></head>
<body>
<h1>Admin</h1>
<p>Worker stopped.</p>
<h2>Switches</h2>
${flags}
<h2>Alerts</h2>
${notes}
<form method="post" action="/metrics">
${roleField()}
<label>Date <input name="date"></label>
<label>Channel <select name="channel"><option>facebook</option><option>instagram</option></select></label>
<label>Posts <input name="posts"></label>
<label>Reach <input name="reach"></label>
<label>Impressions <input name="impressions"></label>
<label>Engagement <input name="engagement"></label>
<label>Clicks <input name="clicks"></label>
<label>Enquiries <input name="enquiries"></label>
<label>Reviews <input name="reviews"></label>
<label>Review requests <input name="review_requests"></label>
<label>Website sessions <input name="website_sessions"></label>
<label>Tracked conversions <input name="tracked_conversions"></label>
<button type="submit">Save figures</button>
</form>
</body>
</html>`
}
