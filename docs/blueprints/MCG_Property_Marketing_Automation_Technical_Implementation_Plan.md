# MCG Property Shoalhaven
## Marketing, Social Media & Reputation Automation
### Internal Technical Implementation Plan

**Project:** EL-MCG-002  
**Client:** MCG Property Shoalhaven  
**Implementation value:** A$5,740 fixed  
**Planned delivery:** approximately 4–6 weeks  
**Initial publishing channels:** Facebook + Instagram  
**Operating-cost target after handover:** approximately A$20–60/month, excluding optional Engine Labs support

---

# 1. Project objective

Build a supervised marketing automation system that allows MCG Property to:

- plan recurring marketing activity;
- generate useful social content from approved business/property information;
- create reusable visual content;
- approve, change or reject content through a simple messaging workflow;
- schedule and publish approved content;
- triage supported comments and enquiries;
- request and respond to customer reviews;
- monitor important local business listings;
- track marketing performance in a simple dashboard;
- receive a clear monthly performance summary;
- operate the finished system without technical knowledge.

The agreed scope is based on coordinated workflows covering strategy/content planning, content drafting, approval/publishing, community enquiries, reporting, reviews/reputation, local visibility and final integration/handover. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

Public-facing posts, replies and sensitive communications remain human-approved during rollout. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

---

# 2. Core design principle

The system will **not** operate as an unrestricted autonomous AI.

It will use:

**Artificial assistants for**
- idea generation;
- caption drafting;
- rewriting;
- content repurposing;
- enquiry classification;
- suggested replies;
- review-response drafting;
- summarisation;
- monthly observations.

**Deterministic automation for**
- permissions;
- workflow state;
- scheduling;
- channel selection;
- recipient/routing selection;
- approval enforcement;
- publishing;
- retries;
- duplicate prevention;
- data collection;
- UTM generation;
- audit logging.

**Humans for**
- final public-content approval;
- sensitive complaints;
- legal/financial/property claims;
- reputational matters;
- unusual customer situations;
- final campaign decisions.

The rule throughout the build is:

**AI may suggest. Code controls. MCG approves.**

---

# 3. Target architecture

```text
APPROVED BUSINESS SOURCES
│
├─ Property/listing information
├─ Brand assets
├─ Local/community information
├─ Market information
├─ Reviews
├─ Staff input
└─ Existing marketing material
        │
        ▼
CONTENT + MARKETING ENGINE
│
├─ Planner
├─ Drafting assistant
├─ Asset/template generator
├─ Brand/compliance checker
└─ Campaign organiser
        │
        ▼
APPROVAL QUEUE
        │
        ▼
Messaging approval
Y = approve
N = reject
C = change
        │
        ▼
PUBLISHING LAYER
├─ Facebook
└─ Instagram
        │
        ▼
ENGAGEMENT LAYER
├─ Comments/enquiries
├─ Reviews
└─ Escalations
        │
        ▼
DATA + REPORTING
├─ Channel metrics
├─ Website activity
├─ Review activity
├─ Enquiries
├─ Visibility checks
└─ Monthly dashboard/report
```

---

# 4. Technical stack

## Application

Default implementation:

- **TypeScript / Node.js** for workflow services and integrations;
- **PostgreSQL** for durable state;
- lightweight authenticated web dashboard;
- scheduled workers/background jobs;
- existing MCG/Engine Labs workflow hosting where suitable.

If an existing production repository already provides equivalent infrastructure, reuse it rather than rewriting working systems.

## Workflow queue

Prefer:

- existing queue infrastructure; otherwise
- a PostgreSQL-backed queue such as `pg-boss`.

Avoid adding Redis or another paid service unless there is a genuine need.

## AI/model layer

Use the already-configured model provider through a provider abstraction.

All model responses used programmatically must return validated structured data.

No model should directly hold publishing credentials or be capable of bypassing approval state.

## Publishing

Preferred hierarchy:

1. **Buffer API** as a simple cross-channel publishing adapter if it meets the final workflow requirements;
2. direct Meta integration where necessary;
3. approved native/manual fallback where a platform does not provide suitable API access.

Buffer's current API can create/schedule posts and work with connected channels through its GraphQL API. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

Direct Facebook Page publishing remains possible through Meta's API with the appropriate Page access token and Page-management permissions. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

---

# 5. Data model

At minimum create the following logical records.

## Content item

```text
id
content_type
content_pillar
title
source_refs
channels
caption
asset_refs
status
scheduled_at
published_at
current_version
created_by
created_at
updated_at
```

## Approval

```text
approval_id
content_id
draft_version
approver
decision
change_instruction
requested_at
decided_at
```

## Publication

```text
publication_id
content_id
channel
external_post_id
scheduled_at
published_at
status
error
```

## Enquiry

```text
id
channel
external_message_id
sender_reference
message
classification
priority
assigned_to
suggested_reply
status
created_at
```

## Review

```text
id
platform
external_review_id
rating
review_text
received_at
suggested_reply
approval_status
reply_status
```

## Visibility check

```text
id
platform
business_field
expected_value
observed_value
status
checked_at
```

## Metrics

```text
date
channel
posts
reach
impressions
engagement
clicks
enquiries
reviews
review_requests
website_sessions
tracked_conversions
```

## Audit event

Every important action should record:

```text
event
object_type
object_id
actor
timestamp
result
metadata
```

---

# 6. Content states

Every content item follows a controlled state machine.

```text
IDEA
 ↓
DRAFT
 ↓
READY_FOR_REVIEW
 ↓
AWAITING_APPROVAL
 ├─ N → REJECTED
 ├─ C → REVISION_REQUESTED → DRAFT
 └─ Y → APPROVED
           ↓
       SCHEDULED
           ↓
       PUBLISHING
           ↓
        PUBLISHED
```

Errors go to:

```text
FAILED
```

and require retry or manual review.

An approval applies to **one exact content version only**.

Changing the copy, image, scheduled time or factual information after approval automatically invalidates that approval.

---

# 7. Approval workflow

Use the simple approval mechanism demonstrated in the proposal.

Example:

```text
MCG CONTENT APPROVAL #C104

Facebook + Instagram
Schedule: Friday 10:00 am

NEW LISTING
12 Example Street, Nowra

[image preview]

Caption:
...

Reply:
Y = Approve
N = Reject
C = Change
```

Supported responses:

```text
Y C104

N C104

C C104 Make the caption shorter and remove the final sentence.
```

When only one approval is pending, shorthand Y/N/C may be allowed.

When multiple approvals are pending, an ID must be supplied or obtained from quoted-message metadata.

## Approval rules

- no public post without approval during rollout;
- duplicate `Y` cannot publish twice;
- changes invalidate old approvals;
- approval is logged;
- publishing failures do not silently retry indefinitely;
- sensitive content is always escalated.

---

# 8. Content system

The content engine will support the agreed MCG content pillars:

- property and market education;
- listings and property stories;
- Shoalhaven life;
- people and trust;
- community campaigns;
- home, design and culture. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

## Initial content types

### Property

- new listing;
- open home;
- auction;
- sold;
- property feature;
- architecture/design story;
- suburb/property spotlight.

### Reputation

- customer review;
- testimonial;
- successful sale/customer story;
- team/client milestone.

### Market

- market update;
- property education;
- first-home buyer information;
- investment education;
- interest-rate/news summary;
- market-statistic explainer.

Any financial, tax or legal claim requires a reliable source and human approval.

### Local/community

- Shoalhaven business feature;
- local event;
- community organisation;
- venue/food/lifestyle feature;
- charity/sponsorship;
- "I Love Nowra" style campaign;
- area guide.

### Brand/team

- agent profile;
- behind-the-scenes;
- new team member;
- company update;
- practical property advice.

---

# 9. Source-of-truth rules

Content must be generated from approved sources.

Priority:

```text
1. MCG internal/property data
2. Approved listing feed or MCG website
3. MCG-supplied facts/assets
4. Official/public authoritative sources
5. Human-provided information
```

Never fabricate:

- prices;
- property features;
- listing status;
- sale outcomes;
- inspection times;
- review text;
- statistics;
- market changes;
- client testimonials;
- agent quotes.

If factual information is missing:

```text
MISSING_SOURCE_DATA
```

and the item remains in draft.

---

# 10. Property/listing content source

Create a `ListingSourceAdapter`.

Supported future/available sources can include:

- Agentbox/Reapit direct feed;
- REAXML;
- MCG website;
- manually approved listing records.

The build must **not depend on Agentbox API availability** in order to complete the marketing system.

If REAXML/API access is operational, use it.

If it is not, MCG can provide listing URLs/details or use another approved source until the integration becomes available.

## Property imagery

Real listing posts must use **real, authorised listing photography**.

Do not generate fake AI property photographs and present them as actual MCG listings.

AI/generated imagery may be used for:

- abstract market graphics;
- educational backgrounds;
- generic community illustrations;
- decorative campaign elements;

where it cannot reasonably be mistaken for an actual property.

---

# 11. Visual asset system

Build reusable templates rather than generating every graphic from scratch.

Initial templates:

```text
NEW LISTING
SOLD
OPEN HOME
AUCTION
CUSTOMER REVIEW
MARKET UPDATE
LOCAL SPOTLIGHT
PROPERTY TIP
TEAM PROFILE
COMMUNITY EVENT
```

Each template should support configurable:

- image;
- title;
- subtitle;
- location;
- property features;
- price where appropriate;
- CTA;
- logo;
- typography;
- brand colours.

Preferred implementation:

```text
structured content
      ↓
HTML/SVG template
      ↓
image renderer
      ↓
1080×1080 / appropriate channel format
```

This keeps branding consistent and substantially reduces inference cost.

---

# 12. Community and enquiry triage

Where supported, collect relevant:

- Facebook comments;
- Instagram comments;
- direct enquiries/messages;
- website/social enquiries connected to the project.

Classify into:

```text
PROPERTY ENQUIRY
GENERAL QUESTION
SALES LEAD
SUPPORT
POSITIVE COMMENT
COMPLAINT
REPUTATIONAL RISK
SPAM
UNKNOWN
```

Then route:

```text
low-risk routine enquiry
→ draft response
→ approval

sales/property enquiry
→ responsible staff member

complaint/reputational issue
→ immediate human escalation

spam
→ no AI response
```

No sensitive complaint should receive an autonomous public reply.

---

# 13. Review and reputation workflow

## Review requests

Trigger only after an **MCG-approved customer milestone**.

Examples may include a completed sale or another agreed point in the client journey.

Flow:

```text
approved customer event
        ↓
review invitation
        ↓
Google review link
        ↓
review received
        ↓
system detects review
        ↓
draft response
        ↓
MCG approval
        ↓
reply
```

Do not perform review gating.

Do not selectively request reviews based on a predicted positive rating.

## Google integration

Google Business Profile APIs support reviews, posts, business information and performance data, but API access requires Google approval for the Cloud project. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

If approved:

```text
Google Business Profile API
→ review monitor
→ reply workflow
→ performance metrics
```

If not yet approved:

```text
Google native tools/manual monitoring
→ same internal approval workflow
```

Google requires client authorisation before responding to reviews on the client's behalf. [Original chat](chatgpt-conversation://6aad123e-6460-83ec-8e1b-719d3b944250)

---

# 14. Local visibility system

Create one canonical MCG identity record:

```text
business name
address
phone
website
opening hours
primary category
social links
```

At minimum monitor:

- Google Business Profile;
- other priority business directories nominated during Stage 1.

Each check produces:

```text
MATCH
MISMATCH
MISSING
REVIEW_REQUIRED
```

Dashboard example:

```text
Google Business Profile    ✓
Facebook                   ✓
Directory A                ⚠ phone mismatch
Directory B                ✓
Directory C                ✕ missing
```

Automatic correction is only performed where:

- an authorised API exists;
- MCG has granted permission;
- the change is within scope.

Otherwise create a correction task.

---

# 15. Reporting system

The dashboard must clearly separate:

## Activity

```text
posts
reach
impressions
engagement
clicks
```

from:

## Business signals

```text
enquiries
qualified leads
website actions
review activity
tracked conversions
```

and from:

## Confirmed business outcomes

where reliable attribution data exists.

Do not claim that reach or clicks equal revenue.

## Dashboard sections

### Overview

- posts this month;
- reach;
- engagement;
- enquiries;
- reviews.

### Content

- scheduled;
- awaiting approval;
- published;
- best performing.

### Enquiries

- received;
- routed;
- outstanding.

### Reputation

- reviews received;
- average rating where available;
- replies outstanding.

### Local visibility

- healthy;
- warnings;
- unresolved issues.

### Performance

- trends over time;
- best content themes;
- channel comparison;
- website traffic where connected.

---

# 16. Monthly report

Automatically prepare a concise monthly report containing:

```text
WHAT HAPPENED
WHAT WORKED
WHAT DIDN'T
WHAT GENERATED ENQUIRIES
WHAT NEEDS ATTENTION
WHAT TO TEST NEXT MONTH
```

No AI-generated conclusion should contradict the underlying metrics.

The model receives computed metrics, not raw unrestricted platform access.

---

# 17. UTM and attribution

Create consistent tracking links.

Example:

```text
utm_source=facebook
utm_medium=social
utm_campaign=listing_12_example_st
utm_content=market_update
```

Maintain campaign IDs internally.

This allows GA4/website data to distinguish traffic generated by specific posts and campaigns.

---

# 18. Security requirements

## Credentials

Never store credentials in:

- source code;
- prompts;
- Git;
- dashboard HTML;
- logs.

Use environment variables or server secrets.

## Access

Apply least privilege.

Separate:

```text
READ
WRITE
PUBLISH
ADMIN
```

where platforms support it.

## Client ownership

MCG retains administrative control over:

- Facebook;
- Instagram;
- Google Business Profile;
- analytics;
- email;
- other third-party accounts.

## AI isolation

Inbound comments/messages are untrusted data.

They cannot:

- modify system instructions;
- change credentials;
- approve posts;
- trigger arbitrary tools;
- bypass approval;
- cause publishing directly.

---

# 19. Reliability requirements

Every external action must be idempotent.

Prevent:

- duplicate posts;
- duplicate review replies;
- duplicate approval execution;
- repeated review requests;
- repeated message responses.

Store external IDs whenever possible.

## Retry policy

Retry safe transient failures with exponential backoff.

Do **not** blindly retry where duplicate publication is possible and the result is unknown.

Use:

```text
PUBLISH_UNKNOWN
```

and require reconciliation.

---

# 20. Kill switches

Implement runtime flags:

```text
AUTOMATION_ENABLED
CONTENT_GENERATION_ENABLED
PUBLISHING_ENABLED
COMMUNITY_REPLY_ENABLED
REVIEW_REQUESTS_ENABLED
REVIEW_REPLIES_ENABLED
```

`PUBLISHING_ENABLED=false` must stop all outgoing public posts immediately without requiring a deployment.

---

# 21. Milestone 1 — Strategy + baseline
## Payment: A$800
## Target: Week 1

### Build

- repository/environment audit;
- access inventory;
- channel inventory;
- brand/tone configuration;
- content-pillar configuration;
- approval-owner configuration;
- canonical MCG business profile;
- initial content calendar;
- idea library;
- baseline reporting dataset;
- dashboard skeleton;
- final integration map.

### MCG provides

- marketing goals;
- channel priorities;
- logo/brand assets;
- tone examples;
- campaign/event dates;
- key staff/approvers;
- account access as required.

### MCG does not need to provide

- code;
- server setup;
- databases;
- APIs;
- workflow logic;
- technical configuration.

### Acceptance

Demonstrate:

- agreed content pillars;
- monthly calendar;
- content idea library;
- baseline dashboard;
- documented access/integration map.

MCG accepts Stage 1 before Stage 2 proceeds.

---

# 22. Milestone 2 — Content workflow
## Payment: A$1,400
## Target: Week 2

### Build

- content data model;
- content-generation assistant;
- brand rules;
- factual-source controls;
- reusable caption templates;
- visual template renderer;
- image/asset library;
- revision/versioning;
- initial representative content.

### Required example outputs

At least one working example of:

- listing post;
- sold/review post;
- market update;
- local/community feature;
- educational/property advice post;
- team/brand post.

Also test:

- short-video script;
- carousel outline;
- reusable content brief.

### Acceptance

MCG can select an idea and receive:

```text
finished caption
+
visual asset
+
channel recommendation
+
source/fact record
```

ready for approval.

---

# 23. Milestone 3 — Approvals + publishing
## Payment: A$1,400
## Target: Week 3

### Build

- approval queue;
- messaging approval workflow;
- Y/N/C handling;
- draft-version locking;
- publishing adapter;
- Facebook connection;
- Instagram connection;
- schedule management;
- audit history;
- publication receipts;
- failure handling;
- kill switches.

### Test cases

- approve post;
- reject post;
- request change;
- revise then approve;
- approve same post twice;
- change approved post;
- publishing API failure;
- account permission failure;
- scheduled post cancellation.

### Acceptance

A test item must successfully travel:

```text
IDEA
→ DRAFT
→ MESSAGE APPROVAL
→ Y
→ SCHEDULED
→ PUBLISHED
→ DASHBOARD RECEIPT
```

on the agreed production/test channels.

---

# 24. Milestone 4 — Community + reputation
## Payment: A$1,200
## Target: Week 4

### Build

- supported social-message/comment ingestion;
- enquiry classifier;
- staff routing;
- response drafts;
- complaint escalation;
- review-request workflow;
- review monitoring;
- review-response drafting;
- Google/local visibility checker;
- issue queue.

### Required scenarios

Test:

```text
routine property enquiry
general question
positive comment
negative review
complaint
spam
unknown message
new Google review
listing/profile mismatch
```

### Acceptance

MCG can observe:

- an enquiry being classified and routed;
- a suggested response;
- a sensitive item being escalated;
- a review response being drafted for approval;
- a local-visibility issue appearing in the dashboard.

---

# 25. Milestone 5 — Dashboard + handover
## Payment: A$940
## Target: Week 5

### Build

- production dashboard;
- metric ingestion;
- UTM tracking;
- monthly reporting;
- workflow health information;
- simple settings;
- user roles;
- error notifications;
- final production testing;
- backup/recovery process;
- handover documentation.

### Dashboard design

MCG should see:

```text
Content
Approvals
Enquiries
Reviews
Performance
Visibility
```

not:

```text
queues
tokens
cron jobs
API payloads
database records
```

Technical diagnostics remain available only to Engine Labs/admin users.

### Acceptance

MCG staff must be able to:

1. see upcoming content;
2. approve/change/reject it;
3. see published posts;
4. see enquiries;
5. see review activity;
6. see performance;
7. understand visibility warnings;
8. use the system without developer assistance.

---

# 26. Week 6 — Delivery buffer

Week 6 is not intended as another scope stage.
Use only for:

- delayed third-party approvals;
- account-permission problems;
- production observation;
- final rectification;
- client scheduling delays.

Where external API access is unavailable, use the approved manual/native fallback rather than blocking the entire system.

---

# 27. Milestone acceptance process

No milestone is closed merely because the code exists.
Each milestone requires:

```text
BUILD
↓
ENGINE LABS TEST
↓
LIVE DEMONSTRATION
↓
MCG TEST/REVIEW
↓
FIX IN-SCOPE ISSUES
↓
MCG ACCEPTANCE
↓
NEXT STAGE
```

This is the primary project-risk control.

---

# 28. Project configuration

Before implementation progresses beyond initial setup, record these explicitly:
Maintain these in PROJECT_CONFIG.

---

# 29. Testing

### Workflow tests

Validate:

- state transitions;
- routing;
- approvals;
- duplicate prevention;
- UTM creation;
- template rendering;
- metric calculations.

### Integration tests

Validate:

- model provider;
- messaging;
- Buffer/Meta;
- Google where available;
- analytics;
- database;
- listing source.

### End-to-end tests

Run complete workflows using safe test content.

### Failure and edge-case tests

Test:

- malicious message content;
- prompt injection;
- missing source facts;
- duplicate events;
- expired tokens;
- invalid media;
- large images;
- unsupported post formats;
- multiple simultaneous approvals;
- API rate limiting.

---

# 30. Production readiness

Do not declare production-ready until:

- secrets are outside source control;
- database persistence is confirmed;
- backups exist;
- channel tokens work;
- approval enforcement works;
- duplicate protection works;
- publishing kill switch works;
- failure alerts work;
- dashboard authentication works;
- sensitive replies escalate;
- factual-source controls work;
- metrics are labelled correctly;
- sample posts have been approved;
- MCG has completed a supervised production test.

---

# 31. Monitoring and alerts

Track internally:

```text
last successful worker run
pending approvals
failed approvals
scheduled posts
failed posts
last successful publication
API authentication errors
review-monitor status
unresolved enquiries
dashboard ingestion status
visibility-check status
```

Notify administrator when:

- publishing fails;
- account connection expires;
- a scheduled post misses its window;
- workflow failures repeat;
- review integration stops;
- metrics stop updating.

---

# 32. Handover

Provide MCG:

### Staff guide

One-page/plain-English instructions covering:

- approving content;
- requesting changes;
- viewing schedule;
- reviewing enquiries;
- handling reviews;
- viewing reports.

### Administrator guide

- users;
- permissions;
- channels;
- settings;
- pause controls.

### Technical runbook

- architecture;
- environment;
- deployment;
- credentials locations;
- integrations;
- database;
- jobs;
- backups;
- error recovery;
- API renewal;
- incident response.

### Ownership and delivery

After final payment, MCG receives the agreed project-specific deliverables, while the contractual treatment of reusable Engine Labs methods/templates/code remains unchanged.

---

# 33. Operating costs and support

Expected base third-party operating cost:
approximately A$20–60/month
No new recurring service should be added without approval if it would materially exceed the agreed operating-cost expectation.
Optional Engine Labs support:
A$250/month — up to 2 hours
Additional approved work:
A$100/hour
Support is optional and is not required for MCG to operate the completed system.

---

# 34. Scope controls

Included:

- Facebook;
- Instagram;
- content planning;
- content drafting;
- reusable visual workflows;
- approvals;
- scheduling/publishing;
- community/enquiry triage where supported;
- review workflow;
- local visibility checks;
- dashboard;
- reporting;
- training/handover.

Not automatically included:

- additional social channels;
- full paid-ad campaign management;
- advertising spend;
- professional photography/video shoots;
- influencer/creator fees;
- broad directory syndication equivalent to every Birdeye network;
- new CRM development;
- unrelated website redevelopment;
- payment processing;
- appointment platform replacement;
- custom mobile apps;
- new integrations outside the accepted scope.

Any material expansion is treated as a written variation.

---

# 35. Definition of done

The project is complete when MCG has:

### Content

- an operating content calendar;
- approved content pillars;
- reusable post templates;
- working generation workflows.

### Publishing

- Facebook and Instagram connected;
- simple message approvals;
- working scheduling/publishing;
- audit history.

### Community

- supported incoming enquiries classified and routed;
- response suggestions;
- sensitive escalation.

### Reputation

- review-request workflow;
- review monitoring;
- suggested review responses;
- approval control.

### Visibility

- canonical business details;
- priority-directory checks;
- actionable discrepancy list.

### Reporting

- simple dashboard;
- monthly summary;
- meaningful distinction between activity, enquiries and confirmed outcomes.

### Handover

- MCG owns/controls its accounts;
- staff require no technical knowledge;
- operational documentation exists;
- production settings are documented;
- kill switches work;
- final acceptance has been recorded.

---

# 36. Implementation priorities

Whenever a technical choice conflicts with these priorities, use this order:

```text
1. Safety / client control
2. Accepted proposal scope
3. Reliability
4. Simplicity for MCG staff
5. Low ongoing cost
6. Automation depth
7. Developer convenience
```

The finished system should feel simple to MCG even if the implementation underneath is sophisticated.
