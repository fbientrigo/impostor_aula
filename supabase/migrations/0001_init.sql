-- Impostor Aula — initial schema, RLS, and seed data.
-- Run this in the Supabase SQL editor (or `supabase db` tooling).
--
-- Security model: RLS is enabled on every table with NO policies, so the anon
-- and authenticated roles can read/write nothing directly. All app access goes
-- through Next.js API routes using the service-role key (which bypasses RLS).
-- The browser only uses the anon key for Realtime *broadcast* channels, which
-- do not require table access.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists concepts (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,
  title         text not null,
  explanation   text not null,
  impostor_hint text,
  teacher_notes text,
  difficulty    text not null default 'basic'
                  check (difficulty in ('basic', 'intermediate', 'advanced')),
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table if not exists rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  status     text not null default 'lobby'
               check (status in ('lobby', 'card_reveal', 'discussion', 'voting', 'results')),
  concept_id uuid references concepts(id),
  settings   jsonb not null default '{}'::jsonb,
  host_token text not null,
  created_at timestamptz not null default now()
);

create table if not exists participants (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references rooms(id) on delete cascade,
  display_name   text not null,
  role           text not null default 'student'
                   check (role in ('student', 'impostor')),
  secret         text not null,
  has_seen_card  boolean not null default false,
  away_count     integer not null default 0,
  reloaded_count integer not null default 0,
  joined_at      timestamptz not null default now()
);

-- Case-insensitive unique display name per room (defense in depth alongside the
-- app-level check in src/lib/participants.ts).
create unique index if not exists participants_room_name_uniq
  on participants (room_id, lower(display_name));
create index if not exists participants_room_idx on participants (room_id);

create table if not exists votes (
  id                   uuid primary key default gen_random_uuid(),
  room_id              uuid not null references rooms(id) on delete cascade,
  voter_participant_id uuid not null references participants(id) on delete cascade,
  target_participant_id uuid not null references participants(id) on delete cascade,
  justification        text,
  created_at           timestamptz not null default now(),
  -- one vote per voter per room; the API upserts on this constraint.
  unique (room_id, voter_participant_id)
);
create index if not exists votes_room_idx on votes (room_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: enable everywhere, define NO policies (deny-by-default).
-- Service role bypasses RLS; anon/authenticated get nothing.
-- ---------------------------------------------------------------------------

alter table concepts     enable row level security;
alter table rooms        enable row level security;
alter table participants enable row level security;
alter table votes        enable row level security;

-- ---------------------------------------------------------------------------
-- Seed: health / medical-technology concept pack (Spanish).
-- ---------------------------------------------------------------------------

insert into concepts (category, title, explanation, impostor_hint, teacher_notes, difficulty, tags) values
  ('Monitoreo de signos vitales', 'Oxímetro de pulso',
   'Dispositivo no invasivo que mide la saturacion de oxigeno en sangre (SpO2) y la frecuencia cardiaca usando luz que atraviesa el dedo.',
   'Es un aparato pequeno que se pone en una parte del cuerpo y muestra numeros en una pantalla.',
   'Conecta con la importancia del SpO2 durante COVID-19 y las limitaciones en pieles oscuras o con esmalte de unas.',
   'basic', array['monitoreo','oxigeno','no invasivo']),

  ('Imagenologia', 'Resonancia magnetica',
   'Tecnica de imagen que usa campos magneticos intensos y ondas de radio para obtener imagenes detalladas de tejidos blandos sin radiacion ionizante.',
   'Sirve para ver el interior del cuerpo con gran detalle y no usa rayos X.',
   'Compara con la tomografia (TAC): cuando conviene cada una y por que no se permiten objetos metalicos.',
   'intermediate', array['imagen','diagnostico','sin radiacion']),

  ('Diagnostico cardiaco', 'Electrocardiograma',
   'Registro de la actividad electrica del corazon mediante electrodos en la piel; ayuda a detectar arritmias e infartos.',
   'Mide senales electricas del cuerpo y dibuja una linea con picos.',
   'Relaciona las ondas P-QRS-T con el ciclo cardiaco y discute el uso en urgencias.',
   'intermediate', array['corazon','senal electrica','diagnostico']),

  ('Salud digital', 'Telemedicina',
   'Prestacion de servicios de salud a distancia mediante tecnologias de comunicacion, como videoconsultas y monitoreo remoto.',
   'Permite atender pacientes sin que esten fisicamente en el mismo lugar.',
   'Debate ventajas de acceso rural y limites: examen fisico, privacidad y brecha digital.',
   'basic', array['remoto','comunicacion','acceso']),

  ('Dispositivos terapeuticos', 'Bomba de insulina',
   'Dispositivo portatil que administra insulina de forma continua y programada para personas con diabetes, reemplazando multiples inyecciones.',
   'Ayuda a controlar una enfermedad cronica entregando una sustancia de manera automatica.',
   'Conecta con sistemas de pancreas artificial y sensores continuos de glucosa.',
   'intermediate', array['diabetes','terapia','portatil']),

  ('Dispositivos implantables', 'Marcapasos',
   'Dispositivo implantable que envia impulsos electricos para regular un ritmo cardiaco demasiado lento.',
   'Va dentro del cuerpo y ayuda a que un organo mantenga su ritmo.',
   'Discute bateria, seguimiento remoto y precauciones con campos electromagneticos.',
   'advanced', array['implante','corazon','electrico']),

  ('Imagenologia', 'Ecografia',
   'Tecnica que usa ondas de ultrasonido para generar imagenes en tiempo real; comun en obstetricia y diagnostico abdominal.',
   'Usa sonido que no escuchamos para ver el interior del cuerpo en tiempo real.',
   'Explica por que es segura en el embarazo y como depende de la habilidad del operador.',
   'basic', array['ultrasonido','imagen','tiempo real']),

  ('Informatica en salud', 'Historia clinica electronica',
   'Registro digital de la informacion de salud de un paciente, accesible y compartible de forma segura entre profesionales.',
   'Guarda y organiza los datos de los pacientes en formato digital.',
   'Aborda interoperabilidad, privacidad de datos y consentimiento informado.',
   'basic', array['datos','registro','privacidad']),

  ('Salud digital', 'Wearables de salud',
   'Dispositivos vestibles, como relojes inteligentes, que monitorean parametros como pasos, frecuencia cardiaca y sueno.',
   'Se usan en el cuerpo todo el dia y miden la actividad de la persona.',
   'Discute exactitud de los datos, motivacion del paciente y uso clinico real.',
   'basic', array['vestible','monitoreo','prevencion']),

  ('Biotecnologia', 'Edicion genetica CRISPR',
   'Herramienta de biotecnologia que permite modificar secuencias del ADN con alta precision, con aplicaciones terapeuticas y de investigacion.',
   'Es una tecnologia que permite cambiar instrucciones biologicas de un organismo.',
   'Plantea el debate etico de editar genes y diferencias entre celulas somaticas y germinales.',
   'advanced', array['adn','genetica','etica']);
