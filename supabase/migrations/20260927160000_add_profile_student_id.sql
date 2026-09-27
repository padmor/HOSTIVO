-- Persist the student identifier used by the accommodation application flow.
alter table public.profiles add column if not exists student_id text;

create unique index if not exists profiles_student_id_key
  on public.profiles (student_id)
  where student_id is not null;
