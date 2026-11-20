-- Customer messages stay on the direct database connection. The Data API has no policy.
alter table enquiry enable row level security;
alter table review enable row level security;
alter table visibility_check enable row level security;
alter table content_item enable row level security;
alter table approval enable row level security;
alter table publication enable row level security;
alter table metric enable row level security;
alter table audit_event enable row level security;
alter table kill_switch enable row level security;

revoke all on table
  enquiry,
  review,
  visibility_check,
  content_item,
  approval,
  publication,
  metric,
  audit_event,
  kill_switch
from anon, authenticated;
