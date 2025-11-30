# Supabase Setup Instructies

Deze gids helpt je om de database op te zetten in Supabase.

## Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Klik op **Start your project** (of **New Project** als je al een account hebt)
3. Maak een account aan of log in
4. Klik op **New Project**
5. Vul in:
   - **Name**: DaCapo Jaarplanner (of een andere naam)
   - **Database Password**: Kies een sterk wachtwoord (bewaar deze!)
   - **Region**: Europe West (Netherlands) - dichtstbij Nederland
   - **Pricing Plan**: Free (voldoende voor deze applicatie)
6. Klik op **Create new project**
7. Wacht 1-2 minuten tot het project is opgezet

## Stap 2: Database Migraties Uitvoeren

### Migratie 1: Schema & Tabellen

1. Klik in het linker menu op **SQL Editor**
2. Klik op de **New Query** knop (rechtsboven)
3. Open het bestand `supabase/migrations/001_initial_schema.sql` in VS Code
4. Kopieer de VOLLEDIGE inhoud (Ctrl+A, dan Ctrl+C)
5. Plak in de SQL Editor in Supabase
6. Klik op **Run** (of druk F5)
7. Als het goed is zie je onderaan: "Success. No rows returned"

Dit heeft de volgende tabellen aangemaakt:
- `users`
- `calendars`
- `events`
- `event_calendars`
- `approvals_log`

### Migratie 2: Seed Data

1. Klik opnieuw op **New Query**
2. Open het bestand `supabase/migrations/002_seed_data.sql` in VS Code
3. Kopieer de volledige inhoud
4. Plak in de SQL Editor
5. Klik op **Run**
6. Je zou moeten zien: "Success. No rows returned"

Dit heeft toegevoegd:
- 7 standaard kalenders (Algemeen, BB/KB OB, etc.)
- 3 test gebruikers
- 4 voorbeeld activiteiten voor testing

## Stap 3: Verifieer de Data

### Controleer Kalenders

1. Klik in het linker menu op **Table Editor**
2. Selecteer de tabel **calendars**
3. Je zou 7 rijen moeten zien met de verschillende kalenders

### Controleer Events

1. Selecteer de tabel **events**
2. Je zou 4 voorbeeld events moeten zien:
   - Herfstvakantie
   - Open Dag
   - Kerstvakantie
   - Toetsweek Periode 2

### Controleer Users

1. Selecteer de tabel **users**
2. Je zou 3 test gebruikers moeten zien

## Stap 4: API Keys Ophalen

1. Klik in het linker menu op **Settings** (tandwiel icoon)
2. Klik op **API**
3. Kopieer de volgende waarden:

   **Project URL**:
   ```
   https://jouwprojectnaam.supabase.co
   ```

   **anon public** (API Key):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...
   ```

4. Plak deze waarden in je `.env.local` bestand:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouwprojectnaam.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Stap 5: Test de Connectie

1. Start je development server: `npm run dev`
2. Open de browser naar `http://localhost:3000/planner`
3. Als alles goed is, zou je:
   - De 7 kalenders in de filters moeten zien
   - De 4 voorbeeld activiteiten in de planner moeten zien
   - Geen error messages moeten zien

## Problemen Oplossen

### "Kon kalenders niet laden"

- Controleer of je `.env.local` correct is ingesteld
- Herstart je development server (stop met Ctrl+C, dan `npm run dev`)
- Verifieer dat de migraties succesvol zijn uitgevoerd

### "relation does not exist"

Dit betekent dat de tabellen niet zijn aangemaakt:
- Ga terug naar SQL Editor
- Voer `001_initial_schema.sql` opnieuw uit
- Let op error messages in de output

### Geen data zichtbaar

- Controleer in Table Editor of de data daadwerkelijk in de database staat
- Voer `002_seed_data.sql` opnieuw uit als de tabellen leeg zijn

## Row Level Security (RLS)

⚠️ De huidige RLS policies zijn zeer permissief (allow all) voor development.

Voor productie moet je strengere policies instellen:

```sql
-- Voorbeeld: alleen goedgekeurde events tonen aan viewers
CREATE POLICY "Viewers kunnen goedgekeurde events zien"
  ON events FOR SELECT
  USING (status = 'goedgekeurd');

-- Admin kan alles
CREATE POLICY "Admin kan alles"
  ON events FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Backup

Het is verstandig om regelmatig een backup te maken:

1. Ga naar **Database** → **Backups** in Supabase
2. Klik op **Download** voor de laatste backup
3. Of gebruik de automatische dagelijkse backups (gratis plan)

## Volgende Stappen

Na succesvolle setup kun je:

1. De applicatie testen met de voorbeeld data
2. Nieuwe activiteiten indienen via het formulier
3. Als admin voorstellen goedkeuren/afwijzen
4. ICS exports testen

Veel succes! 🚀
