# Portfolio Upgrade & Migration Strategy

 The "Append-Only" strategy is scalable for *stability* (nothing breaks), but it creates technical debt. This document outlines the **"Opt-in Upgrade Architecture"** which allows you to evolve the system without breaking old sites, while encouraging users to move to the newest standards.

---

## 🏗️ The System Architecture

To implement "Preview -> Upgrade -> Deploy", we need three core concepts:

### 1. The Migration Map (`migrations.ts`)
We need a central file that defines which blocks have newer versions available.

```typescript
// registry/migrations.ts
export const MIGRATIONS = {
  // Old ID  ->  New ID
  'HERO_MODERN': 'HERO_MODERN_V2',
  'SKILLS_GRID': 'SKILLS_GRID_ANIMATED_V3',
  'FOOTER_SIMPLE': 'FOOTER_WITH_NEWSLETTER'
};
```

### 2. The Upgrade Detector
When the `PortfolioBuilder` loads a user's portfolio, it should scan the `structuredContent` against the `MIGRATIONS` map.

**Logic:**
1.  Iterate through `userPortfolio.sections`.
2.  Check if `section.componentId` exists as a key in `MIGRATIONS`.
3.  If yes, flag `hasUpdates = true`.

### 3. The Upgrade UX (The "Preview" Flow)

Instead of silently changing things, we expose this to the user via the UI.

#### Step A: Notification
Display a banner or badge in the Builder:
> "🎉 Updates available for your Hero and Skills sections. [Review Updates]"

#### Step B: The Preview Mode
When the user clicks "Review Updates":
1.  **Fork the State:** Create a temporary copy of the portfolio data in memory.
2.  **Apply Transformations:**
    -   Swap the IDs: `HERO_MODERN` → `HERO_MODERN_V2`.
    -   **Data Migration:** If V2 requires new fields, apply a transformation function.
        ```typescript
        // transform.ts
        if (oldId === 'HERO_MODERN' && newId === 'HERO_MODERN_V2') {
           newContent.subtitle = oldContent.description.substring(0, 50); // Example logic
        }
        ```
3.  **Render:** Update the iframe with this new temporary state.
4.  **Compare:** Ideally, show a toggle "Original" vs "New Version".

#### Step C: Accept or Reject
-   **Reject:** Discard the temporary state. User keeps `HERO_MODERN` (V1). Logic: "If it ain't broke, don't fix it."
-   **Accept:**
    1.  Commit the ID swaps to the main `portfolioData`.
    2.  Save to backend.
    3.  Prompt user to **Redeploy** to make changes live.

---

## 📈 Scalability Analysis

### Why this IS scalable:
1.  **Safe Evolution:** You can completely rewrite the "Hero" concept 10 times (`HERO_V1` ... `HERO_V10`) without ever breaking the user who built their site in 2024.
2.  **User Agency:** Users hate when their live site changes without permission. This puts them in control.
3.  **Lazy Migration:** You don't need to run a massive database script to update 100,000 users. Migration happens *lazily* only when a user actively logs in and chooses to upgrade.

### Maintenance Cost:
-   You keep the code for old components (until you decide they are truly EOL).
-   You maintain the `migrations.ts` map.

## Implementation Checklist

To build this feature, you would:

- [ ] Create `registry/migrations.ts`.
- [ ] Add a `checkUpdates(sections)` function in `PortfolioBuilder`.
- [ ] Create an `UpgradeModal` component that handles the diff/preview logic.
- [ ] Implement the `transformData(oldId, newId, content)` utility for complex migrations.
