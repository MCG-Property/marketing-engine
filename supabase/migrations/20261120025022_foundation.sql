-- shortcut: copy of db/migrations/001_foundation.sql so the CLI can push it. Edit that file, then copy it here.
-- Phase 0 logical records from the EL-MCG-002 blueprint.
-- Text ids are supplied by the application. No extension is required.

create table content_item (
  id text primary key,
  content_type text not null,
  content_pillar text not null,
  title text not null,
  source_refs jsonb not null default '[]'::jsonb,
  channels jsonb not null default '[]'::jsonb,
  caption text,
  asset_refs jsonb not null default '[]'::jsonb,
  status text not null default 'IDEA',
  scheduled_at timestamptz,
  published_at timestamptz,
  current_version integer not null default 1 check (current_version > 0),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_item_status_ck check (status in (
    'IDEA',
    'DRAFT',
    'READY_FOR_REVIEW',
    'AWAITING_APPROVAL',
    'REJECTED',
    'REVISION_REQUESTED',
    'APPROVED',
    'SCHEDULED',
    'PUBLISHING',
    'PUBLISHED',
    'FAILED',
    'PUBLISH_UNKNOWN'
  ))
);

create table approval (
  approval_id text primary key,
  content_id text not null references content_item (id),
  draft_version integer not null check (draft_version > 0),
  approver text not null,
  decision text not null,
  change_instruction text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  -- Set when a later content version voids this Y. Application code is the writer.
  voided_at timestamptz,
  constraint approval_decision_ck check (decision in ('Y', 'N', 'C'))
);

create unique index approval_one_live_yes
  on approval (content_id, draft_version)
  where decision = 'Y' and voided_at is null;

create table publication (
  publication_id text primary key,
  content_id text not null references content_item (id),
  channel text not null,
  external_post_id text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null,
  error text,
  idempotency_key text not null,
  constraint publication_idempotency_uq unique (idempotency_key)
);

create unique index publication_external_post_uidx
  on publication (channel, external_post_id)
  where external_post_id is not null;

create table enquiry (
  id text primary key,
  channel text not null,
  external_message_id text,
  sender_reference text,
  message text not null,
  classification text not null,
  priority text,
  assigned_to text,
  suggested_reply text,
  status text not null,
  created_at timestamptz not null default now(),
  constraint enquiry_classification_ck check (classification in (
    'PROPERTY_ENQUIRY',
    'GENERAL_QUESTION',
    'SALES_LEAD',
    'SUPPORT',
    'POSITIVE_COMMENT',
    'COMPLAINT',
    'REPUTATIONAL_RISK',
    'SPAM',
    'UNKNOWN'
  ))
);

create unique index enquiry_external_uidx
  on enquiry (channel, external_message_id)
  where external_message_id is not null;

create table review (
  id text primary key,
  platform text not null,
  external_review_id text,
  rating integer,
  review_text text,
  received_at timestamptz,
  suggested_reply text,
  approval_status text not null,
  reply_status text not null
);

create unique index review_external_uidx
  on review (platform, external_review_id)
  where external_review_id is not null;

create table visibility_check (
  id text primary key,
  platform text not null,
  business_field text not null,
  expected_value text,
  observed_value text,
  status text not null,
  checked_at timestamptz not null,
  constraint visibility_check_status_ck check (status in (
    'MATCH',
    'MISMATCH',
    'MISSING',
    'REVIEW_REQUIRED'
  ))
);

create table metric (
  metric_date date not null,
  channel text not null,
  posts integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  engagement integer not null default 0,
  clicks integer not null default 0,
  enquiries integer not null default 0,
  reviews integer not null default 0,
  review_requests integer not null default 0,
  website_sessions integer not null default 0,
  tracked_conversions integer not null default 0,
  primary key (metric_date, channel)
);

create table audit_event (
  id text primary key,
  event text not null,
  object_type text not null,
  object_id text not null,
  actor text not null,
  timestamp timestamptz not null,
  result text not null,
  metadata jsonb not null default '{}'::jsonb
);

-- Runtime flags. Updated in the database so publishing can stop without a deploy.
create table kill_switch (
  name text primary key,
  enabled boolean not null,
  constraint kill_switch_name_ck check (name in (
    'AUTOMATION_ENABLED',
    'CONTENT_GENERATION_ENABLED',
    'PUBLISHING_ENABLED',
    'COMMUNITY_REPLY_ENABLED',
    'REVIEW_REQUESTS_ENABLED',
    'REVIEW_REPLIES_ENABLED'
  ))
);

insert into kill_switch (name, enabled) values
  ('AUTOMATION_ENABLED', false),
  ('CONTENT_GENERATION_ENABLED', false),
  ('PUBLISHING_ENABLED', false),
  ('COMMUNITY_REPLY_ENABLED', false),
  ('REVIEW_REQUESTS_ENABLED', false),
  ('REVIEW_REPLIES_ENABLED', false);
