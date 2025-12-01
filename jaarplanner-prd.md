# DaCapo Jaarplanner – Product Requirements Document (PRD)

## 1. Overzicht

De DaCapo Jaarplanner is een interne webapp voor medewerkers van DaCapo College.
De app vervangt de huidige Excel-jaarplanner, startend vanaf schooljaar 2025/2026, en maakt het mogelijk om:

- Eén centrale digitale jaarplanner te tonen.
- Meerdere parallelle "deelplanners" (kalenders) te beheren:
  - DaCapo Algemeen
  - BB/KB Onderbouw
  - GT Onderbouw
  - BB/KB Bovenbouw MLN
  - BB/BK Bovenbouw HVK
  - GT Bovenbouw
  - Kwaliteitskalender
- Activiteiten door medewerkers te laten voorstellen.
- Activiteiten door teamleiders/admins te laten goedkeuren.
- Activiteiten (individueel of in bulk) naar de eigen Outlook-agenda te exporteren via `.ics`.

## 2. Doelgroepen

- **Docent / Onderwijsondersteuner**
  - Wil snel relevante activiteiten zien (voor zijn/haar afdeling/niveau).
  - Wil deze activiteiten in zijn/haar Outlook-agenda zetten.

- **Teamleider / Coördinator (Approver)**
  - Wil voorstellen van collega's kunnen beoordelen.
  - Wil deelplanningen voor eigen afdeling beheren.

- **Schoolleiding / Management**
  - Wil overzicht over alle kalenders en activiteiten.

- **Backoffice / Planning**
  - Wil kunnen exporteren naar Excel/PDF.
  - Wil kalenderdata eenvoudig beheren.

## 3. Belangrijkste Use Cases

1. **Jaarplanner bekijken**
   - Gebruiker logt in en ziet standaard het huidige schooljaar (bijv. 2025/2026).
   - Kan wisselen tussen schooljaren (2025/2026, 2026/2027, 2027/2028).
   - Kan week voor week bladeren.
   - Kan filteren op kalenders en type activiteit.

2. **Activiteit-detail bekijken**
   - Gebruiker klikt op een activiteit en ziet details:
     - Titel, beschrijving
     - Datums/tijden
     - Kalenders
     - Doelgroep, locatie
     - Status (concept/ingediend/goedgekeurd/afgewezen)

3. **Activiteit naar Outlook exporteren**
   - Gebruiker downloadt een `.ics` bestand voor:
     - Eén activiteit.
     - Een selectie van activiteiten.
     - Alle activiteiten binnen de huidige filter/view.

4. **Activiteit voorstellen (Contributor)**
   - Gebruiker vult een formulier in voor een nieuwe activiteit.
   - Kiest:
     - Titel, beschrijving
     - Startdatum, einddatum
     - Tijden of "hele dag"
     - Schooljaar
     - Kalenders waarop dit geldt (Algemeen, BB/KB OB, etc.).
   - Activiteit wordt opgeslagen met status `ingediend`.

5. **Voorstellen beoordelen (Approver/Admin)**
   - Teamleider/Admin ziet een lijst met ingediende activiteiten.
   - Kan details bekijken en:
     - Goedkeuren → status `goedgekeurd` → zichtbaar in planner.
     - Afwijzen → status `afgewezen` → niet zichtbaar, wel gelogd.

6. **Kalender beheren (Admin)**
   - Admin kan:
     - Activiteiten bewerken en verwijderen.
     - Activiteiten kopiëren naar andere datums/schooljaren.
     - Meerdaagse projecten aanmaken (bijv. toetsweek, vakantieweek).

## 4. Plannerweergave

### 4.1 Structuur

- Weergave in **week-format**:
  - Weeknummer (bijv. Week 33, Week 34, …).
  - Rijen per dag (Ma–Zo).
- Voor elke dag worden activiteiten getoond per kalender:
  - Elke kalender heeft een eigen kleur.
  - Activiteiten worden weergegeven als "chips" of "tags" met:
    - Titel (korte omschrijving).
    - Eventueel icon voor categorie (bv. toetsweek, vakantie).

### 4.2 Filters

- Filterbalk boven de planner met:
  - Schooljaar selectie (2025/2026, 2026/2027, 2027/2028).
  - Een lijst met kalenders (checkboxen):
    - DaCapo Algemeen
    - BB/KB Onderbouw
    - GT Onderbouw
    - BB/KB Bovenbouw MLN
    - BB/BK Bovenbouw HVK
    - GT Bovenbouw
    - Kwaliteitskalender
  - Optioneel: categorie-filter (vakantie, toetsweek, ouderavond, kwaliteitsactiviteit, etc.).

### 4.3 Navigatie

- Knoppen "Vorige week" en "Volgende week".
- "Ga naar datum" input (date picker).
- De planner moet zonder scrollen in de lengte goed bruikbaar zijn, maar mag horizontale of beperkte verticale scroll hebben als dat nodig is.

## 5. Rollen & Rechten

- **Viewer**
  - Kan jaarplanner bekijken.
  - Kan activiteiten exporteren naar .ics (Outlook).
- **Contributor**
  - Alles van Viewer.
  - Kan nieuwe activiteiten indienen (status `ingediend`).
- **Approver (Teamleider)**
  - Alles van Contributor.
  - Kan ingediende activiteiten goedkeuren/afwijzen binnen zijn/haar kalenders.
- **Admin**
  - Volledige rechten:
    - Beheer van alle activiteiten.
    - Beheer van kalenders.
    - Toewijzen van rollen.

## 6. Data Model

### 6.1 Tabel: users

- `id` (uuid, pk)
- `name` (text)
- `email` (text, uniek)
- `role` (enum: viewer | contributor | approver | admin)
- `department` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 6.2 Tabel: calendars

- `id` (uuid, pk)
- `name` (text)
- `code` (text, uniek)
  - Voorbeelden:
    - ALG (DaCapo Algemeen)
    - BBKB_OB
    - GT_OB
    - BBKB_BB_MLN
    - BBBK_BB_HVK
    - GT_BB
    - KWAL (Kwaliteitskalender)
- `color` (text, hex)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 6.3 Tabel: events

- `id` (uuid, pk)
- `title` (text)
- `description` (text)
- `school_year` (text, bijv. "2026/2027")
- `start_datetime` (timestamptz)
- `end_datetime` (timestamptz)
- `all_day` (boolean)
- `category` (text, bijv. "vakantie", "toetsweek", "ouderavond", "kwaliteitsactiviteit")
- `location` (text)
- `audience` (text) – vrije tekst, later uit te breiden naar aparte tabel
- `status` (enum: concept | ingediend | goedgekeurd | afgewezen)
- `created_by` (uuid, fk -> users.id, nullable)
- `approved_by` (uuid, fk -> users.id, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 6.4 Tabel: event_calendars

- `id` (uuid, pk)
- `event_id` (uuid, fk -> events.id)
- `calendar_id` (uuid, fk -> calendars.id)
- Unieke combinatie `(event_id, calendar_id)`.

### 6.5 Tabel: approvals_log

- `id` (uuid, pk)
- `event_id` (uuid, fk -> events.id)
- `approver_id` (uuid, fk -> users.id)
- `action` (text: "goedgekeurd" of "afgewezen")
- `comment` (text, nullable)
- `created_at` (timestamptz)

## 7. Pagina's & Routes

### 7.1 `/login`

- Basale login functionaliteit (voor nu eventueel mock).
- Na login → redirect naar `/planner`.

### 7.2 `/planner`

- Standaardweergave van het huidige schooljaar (2025/2026).
- Filters en weeknavigatie.
- Dagkolommen met activiteiten als gekleurde chips per kalender.
- Klik op activiteit → naar detail.

### 7.3 `/events/[id]`

- Detailpagina van één activiteit.
- Toon alle velden.
- Knop "Download .ics" voor Outlook.

### 7.4 `/submit`

- Formulier voor nieuwe activiteit (Contributor en hoger).
- Na indienen:
  - Opslaan in `events` met status `ingediend`.
  - Koppelen aan kalenders via `event_calendars`.

### 7.5 `/admin`

- Overzicht voor Approver en Admin:
  - Link naar `/admin/proposals`
  - Link naar `/admin/events`

### 7.6 `/admin/proposals`

- Lijst met alle `events` met status `ingediend`.
- Acties:
  - Goedkeuren → status `goedgekeurd`, log in `approvals_log`.
  - Afwijzen → status `afgewezen`, log in `approvals_log`.

### 7.7 `/admin/events`

- Overzicht van alle events met filters (schooljaar, kalender, categorie).
- Acties:
  - Bewerken, verwijderen.
  - Kopiëren naar andere datum/schooljaar.
- Extra UI voor meerdaagse projecten:
  - Checkbox "meerdaags".
  - Startdatum + einddatum.

## 8. Outlook / ICS Integratie

- Implementatie via `.ics`-bestanden:

  - **Single event export**:
    - Vanuit `/events/[id]`: download .ics met één event.

  - **Multiple event export (selectie)**:
    - Gebruiker selecteert events op plannerpagina.
    - API endpoint die een .ics met meerdere events genereert.

  - **Export huidige view**:
    - Op plannerpagina: knop "Exporteer deze view".
    - Neemt filters (schooljaar, kalenders, categorie) als input.

## 9. Niet-functionele eisen

- **Performance**
  - Planner moet vlot laden, ook voor een volledig schooljaar.
- **Security**
  - Basis-auth aanwezig; later uitbreidbaar naar SSO (schoolaccount/Azure AD).
- **Auditability**
  - Aanpassingen aan events worden gelogd in `approvals_log` (voor voorstellen).
- **Responsiveness**
  - Goed bruikbaar op laptop en tablet.
  - Vereenvoudigde weergave op mobiel (minder kolommen, focus op dag/week).

## 10. Samenvatting

Dit PRD beschrijft een centrale jaarplanner-webapp met:

- Meerdere deelplanners (kalenders) parallel, zoals in de huidige Excel-structuur.
- Een voorstel- en goedkeuringsflow voor nieuwe activiteiten.
- Exportmogelijkheden naar Outlook via `.ics`.
- Een admin-dashboard voor beheer en kwaliteitsbewaking.

De implementatie in Next.js + Supabase moet deze functionaliteit robuust en uitbreidbaar neerzetten, met ondersteuning voor schooljaren 25/26, 26/27 en 27/28, en zodat toekomstige jaren eenvoudig kunnen worden toegevoegd.