# ExtSignal Design System

The contract for how ExtSignal looks. If you are an agent or a developer adding UI to this
project, read this file first — it is the difference between a coherent product and a pile of
locally-reasonable decisions.

Everything here is implemented in `src/app/globals.css`. A live reference for every token,
component and state is at **`/design-system`** (development only — it 404s in a production build).

---

## 1. Visual philosophy

ExtSignal is a data tool people keep open all day next to a spreadsheet. That sets the rules:

- **Neutral by default.** The interface is greys and near-whites. Colour is information, not
  decoration.
- **Green is a signal, not a surface.** Brand green is spent on: the wordmark and brand mark,
  primary CTAs, selected state, focus rings, positive data, and hero metrics. Everything else is
  neutral.
- **Light mode first, dark mode equal.** Both themes are designed, not derived. Dark mode is a
  green-tinted near-black, never `#000`.
- **Density over airiness.** Tables and matrices are the product. Prefer a panel with hairline
  dividers over a grid of floating cards.
- **Quiet motion.** No gradients, no large radii, no glassmorphism, no celebratory animation.

Anti-goals, stated so they don't creep back in: purple "AI SaaS" gradients, hero sections, every
element in a card, saturated colour on every cell.

---

## 2. Brand colour

Emerald, slightly cool. Never a neon green.

| Role          | Light     | Dark      |
| ------------- | --------- | --------- |
| Primary       | `#10B981` | `#34D399` |
| Primary hover | `#059669` | `#6EE7B7` |
| Primary active| `#047857` | `#10B981` |
| Soft          | `#ECFDF5` | `#123329` |
| Soft hover    | `#D1FAE5` | `#174536` |
| Focus ring    | `#6EE7B7` | `#34D399` |

In light mode the primary button uses white text; in dark mode it uses a **dark green**
(`#06281D`), not white. A pale green filled with white text looks washed out and fails contrast.

---

## 3. Light palette

| Token              | Hex       | Used for                        |
| ------------------ | --------- | ------------------------------- |
| `background`       | `#F8FAF9` | Canvas                          |
| `card`             | `#FFFFFF` | Card, popover, input            |
| `sidebar`          | `#F5F7F6` | Sidebar                         |
| `secondary`        | `#F3F6F4` | Secondary surface, hover        |
| `muted`            | `#F3F6F4` | Muted surface, hover            |
| `border`           | `#E4E9E6` | Hairlines                       |
| `input`            | `#D5DDD9` | Stronger border, input outline  |
| `foreground`       | `#17201D` | Primary text                    |
| `muted-foreground` | `#66736E` | Secondary text, labels          |
| `primary`          | `#10B981` | Brand                           |
| `ring`             | `#6EE7B7` | Focus ring                      |
| `destructive`      | `#DC2626` | Danger                          |
| `warning`          | `#D97706` | Warning                         |
| `info`             | `#2563EB` | Info, NEW                       |

The design brief also lists a third text level (`#8E9995`). It is deliberately **not** a token:
it sits at roughly 3:1 on the canvas, which fails AA for body text, and in practice every place
that reached for it wanted either `foreground` or `muted-foreground`. Add it only if a genuine
tertiary level appears, and size it up when you do.

## 4. Dark palette

| Token              | Hex       | Used for                       |
| ------------------ | --------- | ------------------------------ |
| `background`       | `#0B1210` | Canvas — never `#000`          |
| `card`             | `#111A17` | Card                           |
| `sidebar`          | `#0E1714` | Sidebar                        |
| `popover`          | `#17211E` | Popover, dropdown, secondary   |
| `secondary`        | `#17211E` | Secondary surface              |
| `muted`            | `#17211E` | Muted surface                  |
| `border`           | `#27332F` | Hairlines                      |
| `input`            | `#31403A` | Stronger border, input outline |
| `foreground`       | `#F1F5F3` | Primary text                   |
| `muted-foreground` | `#9AA8A2` | Secondary text                 |
| `primary`          | `#34D399` | Brand                          |
| `ring`             | `#34D399` | Focus ring                     |
| `destructive`      | `#F87171` | Danger                         |
| `warning`          | `#FBBF24` | Warning                        |
| `info`             | `#60A5FA` | Info, NEW                      |

Dark surfaces climb in a deliberate ladder so panels stay separable without heavy borders:
canvas `#0B1210` → sidebar `#0E1714` → card `#111A17` → popover/secondary `#17211E`.

---

## 5. Semantic tokens

Use these class names. **Do not write hex values in components** — there are currently zero
hardcoded colours outside `globals.css` (verified by grep), and it should stay that way.

```
Surfaces   background  card  popover  secondary  muted  accent
Text       foreground  muted-foreground  card-foreground  popover-foreground
Lines      border  input  ring
Brand      primary  primary-foreground  primary-hover  primary-active
           primary-soft  primary-soft-hover
Status     destructive  destructive-foreground
           success  success-foreground  success-soft
           warning  warning-foreground  warning-soft
           info  info-foreground  info-soft
Ranking    ranking-top10  ranking-top30  ranking-top50  ranking-over50
           (each with a matching `-soft` background token)
           ranking-positive  ranking-negative
Charts     chart-1 .. chart-5   (raw CSS vars: var(--chart-N))
Sidebar    sidebar  sidebar-foreground  sidebar-primary  sidebar-primary-foreground
           sidebar-accent  sidebar-accent-foreground
           sidebar-selected  sidebar-selected-foreground
           sidebar-border  sidebar-ring
```

There is no `danger` token — `destructive` is the shadcn name for it. There is no
`ranking-new` either: NEW uses `info`.

Values are stored as `oklch()` so they behave consistently with shadcn. Each declaration carries
the source hex in a trailing comment, and that hex is the number to compare against the tables
above.

---

## 6. Buttons

| Variant       | Light                                              | Dark                                    |
| ------------- | -------------------------------------------------- | --------------------------------------- |
| `default`     | `#10B981` bg, white text, hover `#059669`          | `#34D399` bg, `#06281D` text, hover `#6EE7B7` |
| `outline`     | `bg-card` + `border-input`, hover `bg-secondary`   | same tokens, dark values                |
| `secondary`   | `bg-secondary`, neutral text                       | same                                    |
| `ghost`       | transparent, hover `bg-muted`                      | transparent, hover `bg-muted`           |
| `destructive` | `bg-destructive/10` + `text-destructive`           | `bg-destructive/20` + `text-destructive`|
| `link`        | `text-primary`, underline on hover                 | same                                    |

Rules:

- **One primary action per view.** That is the only saturated button on screen.
- Destructive actions are never green. `destructive` exists so you never hand-roll a red.
- Toolbar and range switches use `ghost` with an explicit `bg-background` for the active item
  (see `visibility-chart.tsx`).

---

## 7. Sidebar

ExtSignal is sidebar-first. Three distinct states, deliberately three different values:

| State    | Light     | Dark      |
| -------- | --------- | --------- |
| Selected background | `#ECFDF5` | `#123329` |
| Selected foreground | `#047857` | `#6EE7B7` |
| Hover background    | `#E9EFEC` | `#19241F` |
| Background          | `#F5F7F6` | `#0E1714` |
| Border              | `#E4E9E6` | `#27332F` |

The selected item is a **pale green wash with a deep green label and icon**, never a solid
saturated green block. `--sidebar-accent` is hover; `--sidebar-selected` is selected. The shadcn
`SidebarMenuButton` was patched to use them separately — if you add a new sidebar primitive, keep
that split.

The footer holds the account menu only. **Settings lives inside that menu, not as a sidebar row** —
it was moved deliberately, so don't add it back to the footer.

---

## 8. Tables

- Surface is `bg-card`. No zebra striping.
- Rows are separated by a hairline `border-b`; the last row drops it.
- Hover is `bg-muted/50` — barely visible by design.
- Numeric columns (`rank`, counts, percentages) use `tabular-nums` and right alignment.
- Identifiers, locale codes and ranks use `font-mono`.
- Selected rows use `bg-muted`.

The keyword × locale matrix is the most important table in the product, and it is the one place
where colour is allowed to fill the grid. It reads as a heat map: soft tints that let you find the
green without reading a single number. The tints stay in the pastel range on purpose — a saturated
fill on every cell would make the matrix louder than the data — see the next section.

---

## 9. Ranking colours

The matrix cell language. Defined in `src/lib/rankings.ts`, rendered by
`src/components/dashboard/rank-tag.tsx` — the matrix and the targets table share that component, so
the language can only diverge in one place.

| Band  | Light fg / bg         | Dark fg / bg          |
| ----- | --------------------- | --------------------- |
| 1–10  | `#036C4C` / `#A8EDCF` | `#A8F5D4` / `#1D6249` |
| 11–30 | `#48544F` / `#E3E9E7` | `#C3CEC9` / `#2E3835` |
| 31–50 | `#805404` / `#FADC8C` | `#F2D073` / `#4E3D13` |
| >50   | `#A81C1C` / `#F7BEBE` | `#F2A3A3` / `#4C2020` |

All eight pairs pass WCAG AA (≥ 4.5:1). None of them is a saturated fill.

The band boundaries follow the store's own pagination, which is what makes them mean something:
1–10 is page one, 11–30 is pages two and three, 31–50 is pages four and five, and past that the
listing is effectively invisible.

**Grey carries the widest range on purpose.** 11–30 is the "indexed but not winning" band and it is
the most common one in a real matrix. Painting it grey keeps those cells quiet so the green ones
find the eye on their own. An earlier iteration tinted every band green → orange → red and produced
a traffic-light grid where no single cell stood out.

**Hue carries the meaning, and there are no sub-shades inside a band.** An earlier proposal split
each hue into three shades (1–3 / 4–7 / 8–10 and so on). Rendering those side by side showed that
adjacent tints of one hue are not reliably distinguishable at cell size — the extra bands added
visual noise and no information. If you want more granularity, add a new **hue**, not a new shade.

### Cells with no rank

| State                     | Treatment                                                       |
| ------------------------- | --------------------------------------------------------------- |
| Ranked beyond the range   | The `>50` band; the label reads `>{checkedWithin}`               |
| Collection failed         | **Outlined**, not filled: `ring-warning` + `text-warning` + `!`  |
| Not collected yet         | A 16×3 px `bg-muted-foreground/45` bar                           |
| No tracking target at all | A 12×2 px `bg-border` bar                                        |

The two "no data" states are drawn as an **element, not a glyph**. A `·` or an em dash at low
opacity disappears at cell size; a bar has a predictable length and weight in any font.

Failure is outlined rather than filled on purpose: a failure is a *missing* conclusion, and a filled
cell would read as just another rank band. `>50` is a conclusion, `!` is not — keep them distinct.

The label is `>{checkedWithin}` rather than a hardcoded `>50`, so it stays truthful if the probe
ever collects a deeper range.

Movement: `text-ranking-positive` (`↑ +6`), `text-ranking-negative` (`↓ −3`), `text-info` (NEW).
Not rendered anywhere yet — no product surface compares two snapshots.

---

## 10. Charts

Green is the primary series, not the palette.

| Token       | Light     | Dark      | Meaning                       |
| ----------- | --------- | --------- | ----------------------------- |
| `--chart-1` | `#10B981` | `#34D399` | Own extension / primary metric |
| `--chart-2` | `#6366F1` | `#818CF8` | Competitor                    |
| `--chart-3` | `#0EA5E9` | `#38BDF8` | Series 3                      |
| `--chart-4` | `#F59E0B` | `#FBBF24` | Series 4                      |
| `--chart-5` | `#94A3B8` | `#94A3B8` | Neutral / historical baseline |

The rule that matters: **green always means "mine".** In a comparison chart the user's own
extension is `--chart-1` and every competitor gets a different hue. That builds the reading
"green = my extension" without a legend.

Charts go through `ChartContainer` from `@/components/ui/chart` with a `ChartConfig`; series
colours reference the CSS variables (`var(--chart-1)`) so they follow the theme.

---

## 11. Forms

- Input and textarea backgrounds are `bg-card`, so a field never dissolves into the canvas. In
  dark mode they use `dark:bg-input/30` to stay separable from the card behind them.
- Placeholder is `text-muted-foreground`.
- Focus is the brand ring: `focus-visible:border-ring` + `ring-ring/50`. Never a neutral focus.
- Invalid is `aria-invalid:border-destructive` + a destructive ring.
- Disabled drops to `disabled:bg-input/50` with `opacity-50`.
- **Selected state is brand green.** The locale chips in `add-targets-form.tsx` use
  `peer-checked:border-primary/45 peer-checked:bg-primary-soft peer-checked:text-primary-active`.
  Selection is one of the few places colour is spent.
- The switch in `locale-display-toggle.tsx` uses `bg-input` for the off track so it stays visible
  against a card, and `bg-primary` when on.

**Not yet installed:** `Select`, `RadioGroup`, `Combobox`, and the Radix `Checkbox`/`Switch`
primitives. The app currently uses native inputs with peer styling, which keeps forms working
without JS. When these are added they must follow the same rules — soft green selected state,
brand focus ring, `bg-card` surface.

---

## 12. Badges

Variants: `default`, `secondary`, `success`, `warning`, `info`, `destructive`, `outline`, `ghost`,
`link`. `destructive` is the "danger" variant.

Use them for status pills — `Top 10`, `NEW`, `Paused`, `Error`, `Active`. Never assemble a colour
combination inline; if a status has no variant, add one here first.

---

## 13. Light / dark mode

Implemented with `next-themes` in `src/components/theme-provider.tsx`:

- `attribute="class"` toggles `.dark` on `<html>`; `@custom-variant dark` in `globals.css` keys
  off it.
- Three options: **Light / Dark / System**, default `system`, persisted under the
  `extsignal-theme` key.
- An inline script applies the theme before first paint, so there is no flash. `<html>` carries
  `suppressHydrationWarning` because of this.
- The switcher lives in the account menu (`theme-menu.tsx`). Its trigger icon is static on
  purpose: reading the active theme in a server-rendered trigger causes a hydration mismatch.

Test both themes for anything you add. `pnpm dev`, then toggle in the account menu.

---

## 14. Accessibility

Measured with WCAG relative luminance on the shell pairs (AA body text ≥ 4.5, large text and
graphics ≥ 3.0):

| Pair                              | Light | Dark  |
| --------------------------------- | ----- | ----- |
| `foreground` / `background`       | 15.89 | 17.23 |
| `muted-foreground` / `background` | 4.72  | 7.67  |
| `muted-foreground` / `card`       | 4.95  | 7.18  |
| `muted-foreground` / `muted`      | 4.55  | 6.68  |
| `destructive` / `card`            | 4.83  | 6.41  |
| `info` / `info-soft`              | 4.75  | 6.16  |
| sidebar selected fg / bg          | 5.21  | 9.00  |
| `success` / `background`          | 3.59  | 9.86  |
| `warning` / `warning-soft`        | 3.07  | 9.49  |
| `primary-foreground` / `primary`  | 2.54  | 8.22  |

**Known issue — the light primary button.** White on `#10B981` is **2.54:1**, below AA even for
large text. This is the value the design brief specifies (`primary-foreground: #FFFFFF` in light),
so it is implemented as written rather than silently changed. It is the single weakest pair in the
system. Two options if it needs fixing:

1. Set the light `--primary-foreground` to a dark green (`#06281D`, as dark mode already does) —
   takes the pair to roughly 6:1.
2. Leave the CTA and accept the warning, which is common for emerald buttons in the wild.

Everything else in the table is AA or better. The green data colours (`success`, `ranking-*`) sit
in the 3–4.5 range by design: they are used for numbers and glyphs, not running prose.

Practical rules that fall out of this:

- Do not use `text-primary` for body copy on a light surface — it is a 2.42:1 pair. Use
  `text-success` (`#059669`) for green text, which is 3.59:1, and reserve `text-primary` for
  large numbers and icons.
- Never drop muted text below `--muted-foreground`. `text-muted-foreground/60` is the floor and
  only for "no data yet" placeholders.
- Focus is always visible: `ring-ring/50` at 3px plus `border-ring`. Do not remove focus styles.

---

## 15. Usage examples

```tsx
// Correct: semantic classes only
<div className="rounded-xl border bg-card">
  <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
    Keyword
  </div>
  <div className="px-4 py-3 text-sm">edit page</div>
</div>

// Selected state
<span className="border-primary/45 bg-primary-soft text-primary-active">
  en
</span>

// Positive delta next to a metric
<span className="text-ranking-positive">↑ +6</span>

// Wrong: a hex in a component. This is what the system exists to prevent.
<div className="bg-[#10B981] text-[#66736E]">
```

When the design needs something the tokens cannot express, add a token to `globals.css` with a
comment explaining the role, then document it here. Do not reach for an arbitrary value.

---

## 16. Current gaps

Honest state of the migration:

- `Select`, `RadioGroup`, `Combobox` and the Radix `Checkbox`/`Switch` are **not installed**; the
  app uses native controls with peer styling. Their rules are written above but untested.
- Movement deltas (`↑ +6`, `↓ −3`, `NEW`) have tokens and appear on `/design-system`, but no
  product surface renders them yet — the ranking history comparison is not built.
- `--ranking-positive` and `--success` currently hold identical values but are separate tokens
  because they are separate roles; they are expected to diverge.
- `/design-system` covers colours, type, buttons, badges, forms, surfaces, tables, overlays,
  ranking and charts. It does not yet demonstrate `Sheet`, `Tooltip`, `Tabs`, `Skeleton` or empty
  states — those are composed from the same tokens and were left out to keep the page navigable.
