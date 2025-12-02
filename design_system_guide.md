# Design System Guide: Emerald Modern UI

Dit document beschrijft de exacte styling, kleuren en componenten die gebruikt worden in de Nieuwsbrief Generator applicatie. Gebruik deze gids om dezelfde "look and feel" te repliceren in andere applicaties.

## 1. Basis Configuratie (Tailwind CSS)

Zorg dat je `tailwind.config.js` de volgende extensies bevat voor kleuren, fonts en border-radius.

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        accent: '#95C11F', // DaCapo Green
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'], // Of 'SF Pro Display' indien beschikbaar
      },
      borderRadius: {
        '2xl': '1rem', // 16px - Standaard voor containers
        'full': '9999px', // Voor knoppen (pill-shape)
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0, 0, 0, 0.06)',
      }
    },
  },
};
```

## 2. Global CSS & Custom Utilities

Voeg deze classes toe aan je `index.css` of global CSS bestand. Dit definieert de basisstijl voor kaarten, knoppen en inputs.

```css
@layer components {
  /* 1. Containers (Glass Panel effect) */
  .glass-panel {
    @apply bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl transition-all duration-200;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .glass-panel:hover {
    @apply bg-white/90;
  }

  /* 2. Knoppen (Pill-shaped & Modern) */
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-white text-gray-900 border border-gray-200 transition duration-200 ease-in-out font-medium text-sm;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .btn:hover {
    @apply bg-gray-50 border-gray-300;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .btn:active {
    transform: translateY(0);
  }

  /* Primary Action Button (Emerald Green) */
  .btn-primary {
    @apply bg-emerald-600 text-white border-transparent;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
  }

  .btn-primary:hover {
    @apply bg-emerald-700;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
  }

  /* 3. Form Inputs */
  .input {
    @apply w-full px-3 h-10 rounded-2xl bg-white/90 border-2 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-400 transition-all duration-200;
  }
}

/* Body Background */
body {
  @apply bg-gradient-to-b from-[#f2f3f5] to-[#e8e8ea] bg-fixed text-gray-900 antialiased;
}
```

## 3. Component Patronen

Gebruik deze HTML/JSX structuren om de specifieke look te krijgen.

### A. De "Emerald Container" (Standaard Sectie)
Dit is de kenmerkende container stijl die gebruikt wordt voor headers, filters en content blokken.

```jsx
<div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-gray-300 shadow-sm">
  {/* Header Content */}
  <div className="flex items-center gap-4">
    {/* Icoon Container */}
    <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 p-3 rounded-2xl shadow-lg">
      <Icon size={28} className="text-white" strokeWidth={2} />
    </div>
    
    {/* Tekst */}
    <div className="flex-1">
      <h1 className="text-2xl font-display font-semibold text-gray-900">Titel</h1>
      <p className="text-gray-600 mt-1">Subtitel beschrijving</p>
    </div>
  </div>
</div>
```

### B. Navigatie Balk (Admin Stijl)
Horizontale lijst met pill-shaped knoppen.

```jsx
<div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-gray-300 shadow-sm">
  <h1 className="text-2xl font-display font-semibold text-gray-900 mb-4">Menu Titel</h1>
  
  <div className="flex flex-wrap items-center gap-3">
    {/* Navigatie Item */}
    <Link 
      to="/path" 
      className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white text-gray-700 border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-medium text-sm whitespace-nowrap shrink-0"
    >
      <Icon size={18} className="text-emerald-600" />
      <span>Label</span>
    </Link>

    {/* Actief Item */}
    <button className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-emerald-600 text-white border-emerald-600 transition-all duration-200 font-medium text-sm whitespace-nowrap shrink-0">
      <Icon size={18} className="text-white" />
      <span>Actief Label</span>
    </button>
  </div>
</div>
```

### C. Content Cards (Grid Items)
Voor lijsten met items (zoals nieuwsbrieven).

```jsx
<div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer">
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Item Titel</h3>
      <p className="text-xs text-gray-500">Beschrijving of datum</p>
    </div>
    
    {/* Actie Knoppen (Klein & Rond) */}
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
        <Icon size={18} className="text-emerald-600" />
      </button>
    </div>
  </div>
</div>
```

## 4. Kleurgebruik & Variaties

*   **Standaard (Emerald)**:
    *   Achtergrond: `from-emerald-50 to-green-50`
    *   Border: `border-emerald-200` (normaal), `border-emerald-400` (hover)
    *   Tekst: `text-emerald-700` (headers), `text-emerald-600` (iconen)
    *   Gradient Icoon: `from-emerald-500 via-emerald-600 to-green-600`

*   **Variatie (Purple - voor Ouders/Speciale secties)**:
    *   Achtergrond: `from-purple-50 to-purple-100`
    *   Border: `border-purple-200`
    *   Tekst: `text-purple-700`
    *   Hover: `hover:bg-purple-50`

## 5. Typografie Regels

*   **Headers**: `font-display font-semibold text-gray-900`
*   **Labels (Boven inputs)**: `text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase`
*   **Body Tekst**: `text-gray-600` of `text-gray-700` voor leesbaarheid
*   **Font Size**: Gebruik `text-sm` (14px) voor de meeste interface elementen en knoppen.

## 6. Iconen

Gebruik **Lucide React** iconen.
*   Standaard grootte in headers: `size={28}`
*   Standaard grootte in knoppen: `size={18}`
*   Stroke width: `strokeWidth={2}` voor headers, standaard voor de rest.
