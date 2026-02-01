# Component Registry Lifecycle & Compatibility Guide

This document outlines the workflows for managing the SeeqMe AI Component Registry. Following these guidelines ensures that user portfolios created today will continue to function correctly in the future, even as we evolve our design system.

##  Philosophy: "Append-Only" Architecture

The most important rule of the registry is: **Never delete a component that has been released to production.**

Users' portfolios store **references** (IDs) to these components. If `HERO_MODERN` is deleted from the codebase, any user who built their portfolio with `HERO_MODERN` will see that section vanish next time they open the editor.

---

## 1. Adding New Blocks

When introducing a new design (e.g., a new Project Gallery):

1.  **Create the Component:** Add the function in `projects.ts` (or appropriate file).
    ```typescript
    export const PROJ_GALLERY_V2 = (content: any) => { ... }
    ```
2.  **Register the ID:** Add it to the `Registry` object in `index.ts`.
    ```typescript
    export const Registry = {
      // ...
      PROJ_GALLERY_V2: ProjectRegistry.PROJ_GALLERY_V2,
    }
    ```
3.  **Update Templates (Optional):** If this is a superior version, update the `templates/*.ts` files to use `PROJ_GALLERY_V2` by default. New users will get the new block; old users stay on the old one.

---

## 2. Modifying Existing Blocks (Versioning)

If you need to change a block's design or functionality:

### Scenario A: Minor tweak (Non-Breaking)
*Example: Changing padding, font size, or adding an *optional* field.*
- **Action:** Direct edit.
- **Requirement:** Ensure robustness. If you add a new variable `content.subtitle`, acts defensively: `content.subtitle || ''`.

### Scenario B: Major Overhaul (Breaking)
*Example: Changing the HTML structure entirely, removing fields, or requiring new mandatory data.*
- **Action:** **Do Not Overedit.** Create a new version.
    1.  **Clone** the existing component function.
    2.  **Rename** the new one: `HERO_MODERN_V2`.
    3.  **Register** the new V2 component.
    4.  **Mark Original as Legacy:** (Optional) Add a comment `@deprecated` to the old function but **leave the code code intact.**

---

## 3. Deprecation Workflow

When a block is no longer efficient or branding has changed:

1.  **Soft Deprecation:**
    -   Keep the code in `registry/`.
    -   Ensure it is still exported in `Registry`.
    -   **Remove it from the "Block Selector" UI** (in `PortfolioBuilder` or `TemplateSelector`). This prevents *new* users from choosing it, but keeps it working for *existing* users.

2.  **Hard Removal (Extreme Caution):**
    -   Only do this if the component has a security vulnerability.
    -   If removed, you **must** implement a migration strategy (e.g., a script that runs on user login to auto-swap `HERO_V1` ID with `HERO_V2` in their JSON data).

---

## 4. Data Compatibility (Defensive Rendering)

Users might have data from 6 months ago. Your component code must handle missing fields gracefully.

**❌ Bad:**
```typescript
// Crashing if 'tags' is undefined
return `<div>${content.tags.map(t => `<span>${t}</span>`).join('')}</div>`;
```

**✅ Good:**
```typescript
// Fallback to empty array
const tags = content.tags || []; 
return `<div>${tags.map(t => `<span>${t}</span>`).join('')}</div>`;
```

**✅ Good:**
```typescript
// Fallback text
<h2>${content.title || 'Default Title'}</h2>
```

---

## 5. Template Updates

Templates (`templates/engineering/index.ts`) determine the *starting point* for new users.

-   **Updating a Template:** You can change `HERO_MODERN` to `HERO_MODERN_V2` in a template file at any time.
-   **Impact:**
    -   **New Users:** Will start with V2.
    -   **Existing Users:** Are unaffected (their JSON already saved `HERO_MODERN`).

## Summary

| Action | Safe? | Procedure |
| :--- | :--- | :--- |
| **Add New Block** | ✅ Yes | Add to Registry. |
| **Update Stylings** | ⚠️ Check | Ensure CSS classes exist. |
| **Add Optional Prop** | ✅ Yes | Use `||` fallbacks. |
| **Rename Component Function** | ❌ NO | Breaks ID lookup. Use alias if needed. |
| **Delete Component** | ❌ NO | Breaks existing portfolios. |
| **Update Template Defaults** | ✅ Yes | Affects new users only. |
