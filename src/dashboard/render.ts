import { exampleDrafts } from '../content/examples.ts'
import { brandLogoPath } from '../config/brand.ts'
import { projectConfig } from '../config/project-config.ts'
import { calendar } from '../baseline/calendar.ts'
import { ideas } from '../baseline/ideas.ts'
import { baselineMetrics } from '../baseline/metrics.ts'
import { escapeHtml } from './escape.ts'

export { escapeHtml }

function channelLabel(channel: string): string {
  if (channel === 'facebook') return 'Facebook'
  if (channel === 'instagram') return 'Instagram'
  return channel
}

function list(values: readonly string[]): string {
  return `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`
}

export function renderDashboard(): string {
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
  const results = baselineMetrics
    .map((row) => `${channelLabel(row.channel)}: no posts or reach yet`)

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
ul { margin: 0.2rem 0 0; padding-left: 1.1rem; }
a { color: inherit; }
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
${list(exampleDrafts.map((draft) => `${draft.title} — ${draft.template}`))}
</section>
<section>
<h2>Approvals</h2>
<p>Approval is not open yet.</p>
${list(projectConfig.approvalOwners)}
</section>
<section>
<h2>Enquiries</h2>
<p>No enquiries yet.</p>
</section>
<section>
<h2>Reviews</h2>
<p>No reviews yet.</p>
</section>
<section>
<h2>Results</h2>
<p>Facebook and Instagram are not connected, so these are not results.</p>
${list(results)}
</section>
</main>
</body>
</html>`
}
