# 🎨 Ejemplos de Exportación - Pigmenta Studio

## Paleta de Ejemplo: "Ocean Breeze"

**Colores Base:**
- Primary: `#0EA5E9` (Sky Blue)
- Accent: `#10B981` (Emerald Green)
- Text: `#1F2937` (Dark Gray)
- Background: `#F0F9FF` (Light Blue)

---

## 📄 Formato: CSS Variables

### Con Variaciones Habilitadas

```css
:root {
  /* Ocean Breeze */
  --primary-100: #7DD3FC;
  --primary-200: #38BDF8;
  --primary-300: #0EA5E9;
  --accent-100: #6EE7B7;
  --accent-200: #10B981;
  --text-100: #1F2937;
  --text-200: #6B7280;
  --bg-100: #F0F9FF;
  --bg-200: #E0F2FE;
  --bg-300: #BAE6FD;
}
```

### Sin Variaciones (Simplificado)

```css
:root {
  /* Ocean Breeze */
  --primary: #0EA5E9;
  --accent: #10B981;
  --text: #1F2937;
  --bg: #F0F9FF;
}
```

---

## 📄 Formato: SCSS Variables

### Con Variaciones Habilitadas

```scss
// Ocean Breeze
$primary-100: #7DD3FC;
$primary-200: #38BDF8;
$primary-300: #0EA5E9;
$accent-100: #6EE7B7;
$accent-200: #10B981;
$text-100: #1F2937;
$text-200: #6B7280;
$bg-100: #F0F9FF;
$bg-200: #E0F2FE;
$bg-300: #BAE6FD;
```

### Sin Variaciones

```scss
// Ocean Breeze
$primary: #0EA5E9;
$accent: #10B981;
$text: #1F2937;
$bg: #F0F9FF;
```

---

## 📄 Formato: Tailwind Config

### Con Variaciones Habilitadas

```javascript
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "100": "#7DD3FC",
          "200": "#38BDF8",
          "300": "#0EA5E9"
        },
        "accent": {
          "100": "#6EE7B7",
          "200": "#10B981"
        },
        "text": {
          "100": "#1F2937",
          "200": "#6B7280"
        },
        "bg": {
          "100": "#F0F9FF",
          "200": "#E0F2FE",
          "300": "#BAE6FD"
        }
      }
    }
  }
};
```

**Uso en HTML:**
```html
<div class="bg-bg-100 text-text-100">
  <h1 class="text-primary-300">Ocean Breeze</h1>
  <button class="bg-primary-300 hover:bg-primary-200 text-bg-100">
    Click Me
  </button>
  <span class="text-accent-200">Success!</span>
</div>
```

### Sin Variaciones

```javascript
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "primary": "#0EA5E9",
        "accent": "#10B981",
        "text": "#1F2937",
        "bg": "#F0F9FF"
      }
    }
  }
};
```

---

## 📄 Formato: HEX List

### Con Variaciones Habilitadas

```
# Ocean Breeze

# Primary Colors
primary-100: #7DD3FC
primary-200: #38BDF8
primary-300: #0EA5E9

# Accent Colors
accent-100: #6EE7B7
accent-200: #10B981

# Text Colors
text-100: #1F2937
text-200: #6B7280

# Background Colors
bg-100: #F0F9FF
bg-200: #E0F2FE
bg-300: #BAE6FD
```

### Sin Variaciones

```
# Ocean Breeze

Primary: #0EA5E9
Accent: #10B981
Text: #1F2937
Background: #F0F9FF
```

---

## 📄 Formato: JSON (Sin Cambios)

```json
{
  "name": "Ocean Breeze",
  "description": "A refreshing ocean-inspired color palette",
  "metadata": {
    "createdAt": "2025-01-15T10:30:00.000Z",
    "tags": ["ocean", "blue", "professional"],
    "author": "Pigmenta Studio"
  },
  "colors": {
    "background": {
      "name": "Ocean Breeze Background",
      "base": "#F0F9FF",
      "variations": {
        "200": "#E0F2FE",
        "300": "#BAE6FD"
      },
      "description": "Background color for Ocean Breeze"
    },
    "primary": {
      "name": "Ocean Breeze Primary",
      "base": "#0EA5E9",
      "variations": {
        "200": "#7DD3FC",
        "300": "#38BDF8"
      },
      "description": "Primary color for Ocean Breeze"
    },
    "accent": {
      "name": "Ocean Breeze Accent",
      "base": "#10B981",
      "variations": {
        "200": "#6EE7B7",
        "300": "#34D399"
      },
      "description": "Accent color for Ocean Breeze"
    },
    "text": {
      "name": "Ocean Breeze Text",
      "base": "#1F2937",
      "variations": {
        "200": "#6B7280",
        "300": "#4B5563"
      },
      "description": "Text color for Ocean Breeze"
    }
  }
}
```

---

## 🎯 Ejemplo Práctico: Implementación Completa

### HTML + CSS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ocean Breeze - Pigmenta Palette</title>
  <style>
    :root {
      /* Ocean Breeze - Exported from Pigmenta Studio */
      --primary-100: #7DD3FC;
      --primary-200: #38BDF8;
      --primary-300: #0EA5E9;
      --accent-100: #6EE7B7;
      --accent-200: #10B981;
      --text-100: #1F2937;
      --text-200: #6B7280;
      --bg-100: #F0F9FF;
      --bg-200: #E0F2FE;
      --bg-300: #BAE6FD;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: var(--bg-100);
      color: var(--text-100);
      margin: 0;
      padding: 20px;
    }

    .header {
      background-color: var(--primary-300);
      color: var(--bg-100);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .card {
      background-color: var(--bg-100);
      border: 2px solid var(--bg-300);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .card-title {
      color: var(--text-100);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .card-description {
      color: var(--text-200);
      font-size: 1rem;
    }

    .button-primary {
      background-color: var(--primary-300);
      color: var(--bg-100);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .button-primary:hover {
      background-color: var(--primary-200);
    }

    .button-primary:active {
      background-color: var(--primary-100);
    }

    .badge-success {
      background-color: var(--accent-100);
      color: var(--accent-200);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      display: inline-block;
    }

    .alert-info {
      background-color: var(--primary-100);
      border-left: 4px solid var(--primary-300);
      padding: 1rem;
      border-radius: 4px;
      color: var(--text-100);
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Ocean Breeze Design System</h1>
    <p>Built with Pigmenta Studio Color Palette</p>
  </header>

  <div class="card">
    <h2 class="card-title">Welcome to Ocean Breeze</h2>
    <p class="card-description">
      A refreshing color palette inspired by the ocean and sky.
    </p>
    <button class="button-primary">Get Started</button>
    <span class="badge-success">New</span>
  </div>

  <div class="alert-info">
    <strong>Info:</strong> This design uses semantic color variables for easy theming.
  </div>
</body>
</html>
```

---

## 🎨 Ejemplo con React + Tailwind

```jsx
// tailwind.config.js - Exported from Pigmenta Studio
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#7DD3FC",
          200: "#38BDF8",
          300: "#0EA5E9"
        },
        accent: {
          100: "#6EE7B7",
          200: "#10B981"
        },
        text: {
          100: "#1F2937",
          200: "#6B7280"
        },
        bg: {
          100: "#F0F9FF",
          200: "#E0F2FE",
          300: "#BAE6FD"
        }
      }
    }
  }
};

// Component.jsx
function OceanBreezeCard() {
  return (
    <div className="bg-bg-100 border-2 border-bg-300 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-text-100 mb-2">
        Ocean Breeze
      </h2>
      <p className="text-text-200 mb-4">
        A refreshing color palette for your next project
      </p>
      <button className="bg-primary-300 hover:bg-primary-200 active:bg-primary-100 text-bg-100 px-6 py-3 rounded-lg font-semibold transition-colors">
        Learn More
      </button>
      <span className="ml-3 bg-accent-100 text-accent-200 px-3 py-1 rounded-full text-sm font-semibold">
        New
      </span>
    </div>
  );
}
```

---

## 🔧 Ejemplo con SCSS

```scss
// _variables.scss - Exported from Pigmenta Studio
$primary-100: #7DD3FC;
$primary-200: #38BDF8;
$primary-300: #0EA5E9;
$accent-100: #6EE7B7;
$accent-200: #10B981;
$text-100: #1F2937;
$text-200: #6B7280;
$bg-100: #F0F9FF;
$bg-200: #E0F2FE;
$bg-300: #BAE6FD;

// main.scss
@import 'variables';

body {
  background-color: $bg-100;
  color: $text-100;
}

.header {
  background: linear-gradient(135deg, $primary-300, $primary-200);
  color: $bg-100;
  padding: 2rem;

  &__title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__subtitle {
    color: $primary-100;
  }
}

.button {
  &--primary {
    background-color: $primary-300;
    color: $bg-100;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;

    &:hover {
      background-color: $primary-200;
    }

    &:active {
      background-color: $primary-100;
    }
  }

  &--success {
    background-color: $accent-200;
    color: $bg-100;

    &:hover {
      background-color: $accent-100;
      color: $text-100;
    }
  }
}

.card {
  background-color: $bg-100;
  border: 2px solid $bg-300;
  box-shadow: 0 4px 6px rgba($text-100, 0.1);

  &__title {
    color: $text-100;
  }

  &__description {
    color: $text-200;
  }
}
```

---

## 📱 Nombres de Archivo Generados

Al exportar la paleta "Ocean Breeze", los archivos se generan con estos nombres:

- `ocean-breeze-palette.json`
- `ocean-breeze-palette.css`
- `ocean-breeze-palette.scss`
- `ocean-breeze-palette.js` (Tailwind)
- `ocean-breeze-palette.txt` (HEX)
- `ocean-breeze-palette.png` (cuando esté implementado)

---

**Generado por**: Pigmenta Studio
**Formato**: Semantic Color System v1.2.0
