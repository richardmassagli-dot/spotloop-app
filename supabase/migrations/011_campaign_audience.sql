-- Kampagnen: Zielgruppe (Reaktivierung, Geburtstag) + RPC für Händler

alter table public.campaigns
  add column if not exists audience text,
  add column if not exists inactive_days int,
  add column if not exists recipient_count int default 0,
  add column if not exists birthday_scope text;

create or replace function public.merchant_campaign_audience(
  p_spot_id uuid,
  p_type text,
  p_inactive_days int default 30,
  p_birthday_scope text default 'today'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_merchant uuid := auth.uid();
  v_cutoff timestamptz;
  v_today text := to_char(now(), 'MM-DD');
  v_guests jsonb := '[]'::jsonb;
  v_row record;
  v_mmdd text;
  v_days int;
  v_count int := 0;
  v_i int;
  v_d date;
begin
  if v_merchant is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.spots s
    where s.id = p_spot_id and s.merchant_id = v_merchant
  ) then
    raise exception 'forbidden';
  end if;

  v_cutoff := now() - (coalesce(p_inactive_days, 30) || ' days')::interval;

  for v_row in
    select
      st.user_id,
      st.updated_at as last_visit,
      coalesce(u.raw_user_meta_data->>'name', 'Gast') as display_name,
      u.raw_user_meta_data->>'birthday' as birthday
    from public.stamps st
    join auth.users u on u.id = st.user_id
    where st.spot_id = p_spot_id
  loop
    v_days := greatest(0, extract(day from (now() - v_row.last_visit))::int);
    v_mmdd := null;
    if v_row.birthday is not null then
      if length(v_row.birthday) >= 10 then
        begin
          v_mmdd := to_char(v_row.birthday::date, 'MM-DD');
        exception when others then
          v_mmdd := right(v_row.birthday, 5);
        end;
      else
        v_mmdd := right(v_row.birthday, 5);
      end if;
    end if;

    if p_type = 'reactivation' and v_row.last_visit < v_cutoff then
      v_count := v_count + 1;
      v_guests := v_guests || jsonb_build_array(jsonb_build_object(
        'user_id', v_row.user_id,
        'name', v_row.display_name,
        'last_visit', v_row.last_visit,
        'days_inactive', v_days
      ));
    elsif p_type = 'birthday' and v_mmdd is not null then
      if p_birthday_scope = 'today' and v_mmdd = v_today then
        v_count := v_count + 1;
        v_guests := v_guests || jsonb_build_array(jsonb_build_object(
          'user_id', v_row.user_id,
          'name', v_row.display_name,
          'birthday', v_row.birthday,
          'last_visit', v_row.last_visit
        ));
      elsif p_birthday_scope = 'week' then
        for v_i in 0..6 loop
          v_d := (now() + (v_i || ' days')::interval)::date;
          if v_mmdd = to_char(v_d, 'MM-DD') then
            v_count := v_count + 1;
            v_guests := v_guests || jsonb_build_array(jsonb_build_object(
              'user_id', v_row.user_id,
              'name', v_row.display_name,
              'birthday', v_row.birthday,
              'last_visit', v_row.last_visit
            ));
            exit;
          end if;
        end loop;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'count', v_count,
    'guests', (
      select coalesce(jsonb_agg(elem), '[]'::jsonb)
      from (
        select elem
        from jsonb_array_elements(v_guests) as elem
        limit 12
      ) sub
    ),
    'inactive_days', p_inactive_days,
    'birthday_scope', p_birthday_scope
  );
end;
$$;

grant execute on function public.merchant_campaign_audience(uuid, text, int, text) to authenticated;
