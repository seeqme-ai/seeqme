# 🎨 SeeqMe Template & Registry System

Welcome to the SeeqMe design system. This repository uses a **hybrid rendering engine** that combines the reliability of code with the flexibility of generative AI.

## 🏗️ Architecture Overview

The system is split into two distinct parts:

| Feature | **Templates** (`templates/`) | **Registry** (`registry/`) |
| :--- | :--- | :--- |
| **Philosophy** | "Dream it" (Generative) | "Build it" (Deterministic) |
| **Format** | JSON Manifest + Raw HTML Strings | Pure TypeScript Functions |
| **Rendering** | Regex-based Engine (`{{handlebars}}`) | JavaScript Execution |
| **Use Case** | AI generating new, unique layouts | displaying complex, interactive components |

---

## 🧩 Part 1: The Registry (Blocks)

The **Registry** is a collection of pre-built, high-quality React-like components written in pure TypeScript functions. These are used when we need guaranteed reliability (e.g., complex pricing tables, interactive graphs).

### 📁 Location
Messages are located in `seeqme/registry/`.
*   `heroes.ts`
*   `projects.ts`
*   `stats.ts`
*   ...and so on.

### ⚡ How to Create a New Block

1.  **Open the relevant file** (e.g., `registry/heroes.ts`) or create a new one.
2.  **Export a constant function** that accepts a `content` object and returns a template literal string.

```typescript
// registry/heroes.ts

export const HERO_MY_NEW_STYLE = (content: any) => `
  <section class="py-20 bg-slate-900 text-white">
    <div class="container mx-auto">
      <h1 class="text-6xl font-bold">${content.title || 'Default Title'}</h1>
      <p class="text-xl">${content.bio}</p>
      
      ${content.image ? `
        <img src="${content.image}" class="rounded-xl shadow-lg" />
      ` : ''}
    </div>
  </section>
`;
```

3.  **Register it** in `registry/index.ts`:

```typescript
// registry/index.ts
import { HERO_MY_NEW_STYLE } from './heroes';

export const Registry = {
  // ... existing
  HERO_MY_NEW_STYLE, // Add your new block here
};
```

4.  **Usage**: The AI can now request this block by setting `componentId: 'HERO_MY_NEW_STYLE'` in a section manifest.

---

## 🎨 Part 2: The Template System

**Templates** are "Manifests" that define an entire portfolio's structure. They rely on the **Generative Engine** to render HTML strings with placeholders.

### 📁 Location
Templates are organized by style/archetype in `seeqme/templates/`.
*   `modern/`
*   `creative/`
*   `engineering/`

### 📝 How to Create a New Template

1.  **Create a new file** (e.g., `templates/creative/art_gallery.ts`).
2.  **Define the Manifest**:

```typescript
import { Manifest } from "@/types";

export const ART_GALLERY_TEMPLATE: Manifest = {
    metadata: {
        version: '1.0',
        niche: 'Creative',
    },
    // 1. GLOBAL DESIGN SYSTEM
    globalConfig: {
        theme: 'dark', // 'dark' or 'light'
        colorPalette: {
            primary: '#ff00ff',
            secondary: '#00ffff',
            background: '#000000',
            surface: '#111111',
            text: '#ffffff',
            heading: '#ffffff',
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Inter',
            monoFont: 'JetBrains Mono',
        },
    },
    // 2. SECTIONS
    sections: [
        {
            id: 'hero',
            type: 'hero',
            componentId: 'GEN_TEMPLATE', // <--- IMPORTANT: Tells engine to use 'template' string
            template: `
                <section class="h-screen flex items-center justify-center bg-[var(--bg)]">
                    <h1 class="text-9xl font-[var(--heading)] text-[var(--primary)]">
                        {{username}}
                    </h1>
                     <div class="grid grid-cols-3">
                        {{#each galleryImages}}
                           <img src="{{this}}" class="w-full h-auto" />
                        {{/each}}
                    </div>
                </section>
            `,
            content: {
                username: 'The Artist',
                galleryImages: ['img1.jpg', 'img2.jpg', 'img3.jpg']
            }
        }
    ]
};
```

3.  **Register it** (optional, but good for discovery) in `templates/index.ts` if you want it to appear in the main template list.

### 🛠️ Template Syntax Guide

The Generative Engine supports standard Handlebars-like syntax:

| Syntax | Description | Example |
| :--- | :--- | :--- |
| `{{key}}` | **Variable Replacement** | `<h1>{{title}}</h1>` |
| `{{{key}}}` | **Raw HTML** (no escape) | `<div>{{{richText}}}</div>` |
| `{{#if key}}...{{/if}}` | **Conditional** | `{{#if image}}<img src="{{image}}" />{{/if}}` |
| `{{#each list}}...{{/each}}` | **Loop** | `{{#each skills}}<li>{{this}}</li>{{/each}}` |
| `{{this}}` | **Current Item** (in loop) | Used inside `{{#each}}` for strings |
| `{{#each items}}...{{name}}...{{/each}}` | **Object Loop** | Access properties of objects in a list |

---

## 🏆 Best Practices

1.  **Use CSS Variables**: In Templates, always use the variables defined in `globalConfig` to ensure theming works:
    *   `var(--primary)`
    *   `var(--bg)`, `var(--surface)`
    *   `var(--text)`, `var(--heading)`

2.  **Tailwind CSS**: The system is built for Tailwind.
    *   Use `md:`, `lg:` prefixes for responsiveness.
    *   Use arbitrary values `w-[500px]` sparingly; prefer standard classes.
    *   Use `group` and `group-hover` for interactive card effects.

3.  **Images**:
    *   Always provide defensive styling for images (e.g., `object-cover`, `w-full`, `h-full`) to prevent layout shifts.
    *   Use `aspect-ratio` classes (e.g., `aspect-video`) to reserve space.

4.  **Error Handling**:
    *   The engine is robust, but avoid deep nesting of loops if possible.
    *   Ensure your `content` JSON matches the keys used in `template`.
