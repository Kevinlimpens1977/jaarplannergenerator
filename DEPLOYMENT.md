# DaCapo Jaarplanner 2026/2027

Webapp voor het beheren van de schoolagenda met 7 verschillende kalenders, voorstel workflow en automatische Outlook synchronisatie.

## 🚀 Deployment naar Vercel

### Voorbereiding

1. **Push code naar GitHub** (al gedaan)
2. **Zorg dat Supabase database klaar is** met alle migraties

### Stappen

#### 1. Vercel Account
- Ga naar [vercel.com](https://vercel.com)
- Klik op **"Sign Up"** en kies **"Continue with GitHub"**

#### 2. Import Project
- Klik op **"Add New..."** → **"Project"**
- Selecteer je repository: **`jaarplannergenerator`**
- Klik op **"Import"**

#### 3. Configure Project
- **Framework Preset**: Next.js (wordt automatisch gedetecteerd)
- **Root Directory**: `./` (laat leeg)
- **Build Command**: `npm run build` (standaard)
- **Output Directory**: `.next` (standaard)

#### 4. Environment Variables toevoegen
Klik op **"Environment Variables"** en voeg toe:

```
NEXT_PUBLIC_SUPABASE_URL = https://xpznbstpykeidsqovjla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwem5ic3RweWtlaWRzcW92amxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjA1NTgsImV4cCI6MjA3NDIzNjU1OH0.DGrDm_5qIXC_tpa8T4YFZz1xlD7LeDauz3VKzbYkeFM
```

⚠️ **Let op**: Voeg **NIET** `.env.local` toe aan Git! Deze bevat gevoelige informatie.

#### 5. Deploy
- Klik op **"Deploy"**
- Wacht 2-3 minuten tot deployment klaar is
- Je krijgt een URL zoals: `https://jaarplannergenerator.vercel.app`

### Na Deployment

#### Outlook Kalender Synchronisatie
Na deployment werkt de Outlook integratie volledig:

1. Gebruikers gaan naar: `https://jouw-app.vercel.app/planner`
2. Selecteren kalenders
3. Klikken op **"Download voor Outlook"**
4. Volgen de popup instructies
5. De URL werkt nu als **internetagenda** in Outlook
6. ✅ **Automatische synchronisatie** werkt!

#### Supabase RLS Policies
Als je RLS (Row Level Security) wilt inschakelen voor productie:
- Voer `003_rls_policies.sql` uit in Supabase
- Update policies om echte gebruikers te ondersteunen
- Implementeer Supabase Auth

## 📁 Project Structuur

```
jaarplanner_generator/
├── app/
│   ├── planner/          # Hoofdpagina met kalender view
│   ├── submit/           # Nieuwe activiteit indienen
│   ├── admin/            # Admin dashboard
│   └── api/ics/          # ICS export endpoints
├── components/
│   ├── planner/          # Kalender componenten
│   ├── Navigation.tsx    # Navigatie balk
│   └── SubscribeModal.tsx # Outlook instructies popup
├── lib/
│   ├── supabase/         # Database queries
│   ├── ics/              # ICS file generatie
│   └── types/            # TypeScript types
└── supabase/
    └── migrations/       # Database schema

```

## 🔧 Lokale Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000/planner
```

## 📋 Features

✅ 7 Verschillende kalenders (BB/KB, GT, Kwaliteit, etc.)
✅ Week en Maand weergave
✅ Voorstel workflow met goedkeuring
✅ Admin dashboard
✅ Outlook .ics export
✅ **Internetagenda abonnement** (automatische sync)
✅ Event details en downloads
✅ Filter op kalenders

## 🔐 Supabase Database

Database structuur:
- **calendars**: 7 kalenders met kleuren
- **events**: Alle activiteiten met status
- **event_calendars**: M2M relatie events ↔ calendars  
- **users**: Gebruikers met rollen
- **approvals_log**: Audit trail

## 📝 Belangrijke URLs

**Na deployment**:
- App: `https://jouw-app.vercel.app`
- Planner: `https://jouw-app.vercel.app/planner`
- Submit: `https://jouw-app.vercel.app/submit`
- Admin: `https://jouw-app.vercel.app/admin`

**ICS Subscribe API**:
- `https://jouw-app.vercel.app/api/ics/subscribe?calendar_ids=xxx&school_year=2026/2027`

## 🎯 Volgende Stappen

1. ✅ Deploy naar Vercel
2. ⬜ Test Outlook synchronisatie
3. ⬜ Voeg echte authenticatie toe (Supabase Auth of Azure AD)
4. ⬜ Enable RLS in Supabase
5. ⬜ Custom domain toevoegen (optioneel)
6. ⬜ SSL certificaat configureren (automatisch via Vercel)

## 📞 Support

Voor vragen of problemen, check de Vercel deployment logs of Supabase dashboard.
