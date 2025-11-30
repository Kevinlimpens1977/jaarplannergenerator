# DaCapo Jaarplanner 26/27

Een moderne webapplicatie voor het beheren van de jaarplanning van DaCapo College voor schooljaar 2026/2027.

## 📋 Functionaliteiten

- **Jaarplanner weergave**: Weekoverzicht met 7 parallelle kalenders (deelplanners)
- **Activiteiten workflow**: Medewerkers dienen activiteiten in → Teamleiders/Admins keuren goed/af
- **Outlook integratie**: Export activiteiten naar .ics bestand (single, selectie, volledige view)
- **Admin dashboard**: Goedkeuren/afwijzen van voorstellen en beheer van alle activiteiten
- **Filtering**: Filter op kalenders, schooljaar en datum
- **Responsive design**: Werkt op laptop, tablet en mobiel

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Taal**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Datum handling**: date-fns

## 📦 Installatie

### Vereisten

- Node.js 18+ en npm
- Een Supabase account en project
- Git (optioneel)

### Stap 1: Dependencies installeren

```bash
npm install
```

### Stap 2: Supabase project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account aan
2. Maak een nieuw project aan
3. Wacht tot het project klaar is met initialiseren

### Stap 3: Database migraties uitvoeren

1. Open de Supabase dashboard van je project
2. Ga naar **SQL Editor** in het linker menu
3. Klik op **New Query**
4. Kopieer de inhoud van `supabase/migrations/001_initial_schema.sql` en voer uit
5. Klik opnieuw op **New Query**
6. Kopieer de inhoud van `supabase/migrations/002_seed_data.sql` en voer uit

Dit creëert alle benodigde tabellen en voegt standaard kalenders en testdata toe.

### Stap 4: Environment variabelen instellen

1. Kopieer `.env.local.example` naar `.env.local`:

```bash
copy .env.local.example .env.local
```

2. Open `.env.local` en vul je Supabase credentials in:
   - Ga naar je Supabase project dashboard
   - Klik op **Settings** → **API**
   - Kopieer de **Project URL** naar `NEXT_PUBLIC_SUPABASE_URL`
   - Kopieer de **anon/public key** naar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Je `.env.local` zou er zo uit moeten zien:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stap 5: Development server starten

```bash
npm run dev
```

De applicatie draait nu op [http://localhost:3000](http://localhost:3000)

## 🚀 Productie deployment

### Vercel (aanbevolen)

1. Push je code naar GitHub
2. Ga naar [vercel.com](https://vercel.com)
3. Importeer je GitHub repository
4. Voeg de environment variabelen toe in Vercel dashboard
5. Deploy!

Vercel detecteert automatisch Next.js en configureert alles correct.

## 📊 Database Schema

### Tabellen

- **users**: Gebruikers met rollen (viewer, contributor, approver, admin)
- **calendars**: 7 standaard kalenders (Algemeen, BB/KB OB, GT OB, etc.)
- **events**: Activiteiten met status (concept, ingediend, goedgekeurd, afgewezen)
- **event_calendars**: Koppeltabel voor many-to-many relatie events ↔ calendars
- **approvals_log**: Audit log voor goedkeuringen/afwijzingen

### Standaard Kalenders

| Code | Naam | Kleur |
|------|------|-------|
| ALG | DaCapo Algemeen | Blauw |
| BBKB_OB | BB/KB Onderbouw | Groen |
| GT_OB | GT Onderbouw | Oranje |
| BBKB_BB_MLN | BB/KB Bovenbouw MLN | Paars |
| BBBK_BB_HVK | BB/BK Bovenbouw HVK | Rood |
| GT_BB | GT Bovenbouw | Roze |
| KWAL | Kwaliteitskalender | Cyaan |

## 🎯 Gebruikersrollen

- **Viewer**: Kan jaarplanner bekijken en activiteiten exporteren
- **Contributor**: Alles van Viewer + nieuwe activiteiten indienen
- **Approver (Teamleider)**: Alles van Contributor + voorstellen goedkeuren/afwijzen
- **Admin**: Volledige rechten + beheer van alle activiteiten

## 📱 Gebruik

### Als Medewerker (Contributor)

1. Ga naar **Jaarplanner** om activiteiten te bekijken
2. Gebruik filters om relevante kalenders te selecteren
3. Klik op **Nieuwe activiteit** om een voorstel in te dienen
4. Je voorstel krijgt status "ingediend" en moet goedgekeurd worden

### Als Teamleider/Admin (Approver)

1. Ga naar **Admin** → **Voorstellen beoordelen**
2. Bekijk ingediende activiteiten
3. Voeg optioneel een opmerking toe
4. Klik op **Goedkeuren** of **Afwijzen**
5. Goedgekeurde activiteiten verschijnen in de planner

### Outlook Export

- **Enkele activiteit**: Klik op activiteit → **Download .ics**
- **Huidige view**: Klik op **Exporteer huidige view** in de planner
- Open het .ics bestand en het wordt toegevoegd aan je Outlook agenda

## 🔧 Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📁 Project Structuur

```
jaarplanner_generator/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── ics/              # ICS export endpoints
│   ├── planner/              # Hoofdweergave jaarplanner
│   ├── submit/               # Formulier nieuwe activiteit
│   ├── admin/                # Admin dashboard
│   │   ├── proposals/        # Goedkeuringsflow
│   │   └── events/           # Beheer activiteiten
│   └── events/[id]/          # Detail pagina activiteit
├── components/               # React componenten
│   ├── planner/              # Planner-specifieke componenten
│   └── Navigation.tsx        # Hoofdnavigatie
├── lib/                      # Utilities & helpers
│   ├── supabase/             # Supabase client & queries
│   ├── ics/                  # ICS generator
│   ├── types/                # TypeScript types
│   └── utils/                # Date utilities
├── supabase/                 # Database migraties
│   └── migrations/
├── .env.local.example        # Environment variabelen voorbeeld
├── package.json              # Dependencies
└── README.md                 # Deze file
```

## 🔐 Authenticatie

⚠️ **Belangrijk**: De huidige implementatie gebruikt een mock-authenticatie voor development.

Voor productie moet je echte authenticatie implementeren:

1. **Supabase Auth**: Gebruik Supabase's ingebouwde auth (aanbevolen)
2. **Azure AD**: Integreer met schoolaccount/Microsoft 365
3. **Custom auth**: Bouw je eigen authenticatie systeem

De code is voorbereid om eenvoudig uit te breiden met echte auth.

## 🚧 Toekomstige Uitbreidingen

Functionaliteit die nog toegevoegd kan worden:

- [ ] Activiteiten bewerken (edit functie in admin)
- [ ] Activiteiten kopiëren naar andere datums/schooljaren
- [ ] Meerdaagse projecten in bulk aanmaken
- [ ] Excel/PDF export van de planner
- [ ] E-mail notificaties bij goedkeuring/afwijzing
- [ ] Historische weergave (vorige schooljaren)
- [ ] Recurring events (herhalende activiteiten)
- [ ] Drag & drop voor datum wijzigingen
- [ ] Gebruikersbeheer (rollen toewijzen via UI)

## 🐛 Troubleshooting

### Fout: "Kon kalenders niet laden"

- Controleer of je `.env.local` correct is ingesteld
- Verifieer dat je Supabase project actief is
- Controleer of de migraties correct zijn uitgevoerd

### Geen activiteiten zichtbaar in planner

- Controleer of je minimaal één kalender hebt geselecteerd
- Verifieer dat er goedgekeurde activiteiten in de database staan
- Probeer een andere week te selecteren

### ICS download werkt niet

- Controleer of de activiteit goedgekeurde status heeft
- Kijk in de browser console voor error messages
- Verifieer dat de API routes correct zijn gedeployed

## 📞 Support

Voor vragen of problemen:

1. Raadpleeg eerst deze README
2. Bekijk de code comments in de bestanden
3. Check de Supabase dashboard voor database issues
4. Contacteer de ontwikkelaar

## 📄 Licentie

Dit project is ontwikkeld voor DaCapo College.

---

**Versie**: 1.0.0  
**Laatste update**: November 2024  
**Schooljaar**: 2026/2027
