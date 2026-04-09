-- STEP 1) Conversations table (one user -> many chats)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations
add column if not exists pinned boolean not null default false;

create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_created_at_idx on public.conversations(created_at desc);
create index if not exists conversations_user_id_pinned_updated_idx
on public.conversations(user_id, pinned desc, updated_at desc);

-- STEP 2) Messages table (stores each turn: user_msg + ai_msg)
create table if not exists public.messages (
  id bigserial primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_msg text not null,
  ai_msg text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_idx on public.messages(user_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

-- STEP 3) Enable RLS (required for secure multi-user chat)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- STEP 4) RLS policies for conversations
drop policy if exists "Users can manage own conversations" on public.conversations;
create policy "Users can manage own conversations"
on public.conversations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- STEP 5) RLS policies for messages
drop policy if exists "Users can manage own messages" on public.messages;
create policy "Users can manage own messages"
on public.messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- STEP 6) Keep conversation.updated_at fresh whenever new message is inserted
create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_insert_touch_conversation on public.messages;
create trigger on_message_insert_touch_conversation
after insert on public.messages
for each row execute procedure public.touch_conversation_updated_at();

-- STEP 7) Optional helper view for sidebar previews
create or replace view public.chat_sidebar_previews as
select
  c.id as conversation_id,
  c.user_id,
  coalesce(nullif(c.title, ''), 'Untitled chat') as title,
  c.updated_at,
  m.user_msg as last_user_msg,
  m.ai_msg as last_ai_msg,
  m.created_at as last_message_at
from public.conversations c
left join lateral (
  select user_msg, ai_msg, created_at
  from public.messages
  where conversation_id = c.id
  order by created_at desc
  limit 1
) m on true;
