# Assessment 3 Lighthouse accessibility results

Date: 28 September 2026  
Lighthouse: `13.5.0`  
Browser engine reported by Lighthouse: `HeadlessChrome/153.0.0.0` through Microsoft Edge  
Mode: desktop, accessibility category, production build, populated disposable SQLite database

## Results

| Route and run | Accessibility score | Weighted audits | Result |
|---|---:|---:|---|
| Dashboard baseline | 96 | 24 passed, 1 failed | Contrast failure in warning and simulated-source labels |
| Dashboard final | 100 | 25 passed, 0 failed | No scored accessibility failures and no run warnings |
| Wordle final regression | 100 | 21 passed, 0 failed | No scored accessibility failures and no run warnings |

## Finding and response

The baseline dashboard failed the `color-contrast` audit in two Assessment 3 text treatments:

- `.dashboard-alert-label` used `#d97706` on `#f1f5f9`, producing `2.9:1` instead of the required `4.5:1`.
- `.dashboard-source--simulated` used `#ca8a04` on `#f1f5f9`, producing `2.68:1` instead of the required `4.5:1`.

The response was deliberately limited to readable text. Theme-aware `--warning-text` and `--accent-text` tokens now control those labels while the existing decorative amber accents remain unchanged.

| Text token | Theme | Foreground/background | Contrast |
|---|---|---|---:|
| Warning label | Light | `#92400e` / `#f1f5f9` | 6.47:1 |
| Simulated-source label | Light | `#854d0e` / `#f1f5f9` | 6.25:1 |
| Warning label | Dark | `#fbbf24` / `#334155` | 6.20:1 |
| Simulated-source label | Dark | `#fde047` / `#334155` | 7.85:1 |

The final dashboard score rose from `96` to `100`. This gives a direct design decision trace from measured evidence to a more legible interface without changing the completed Assessment 1/2 builder behavior. The unchanged Wordle route was also audited as the key builder route used in the video and scored `100`.

## Manual checks and limitations

Lighthouse listed ten items for manual verification: focusable controls, interactive affordance, logical tab order, visual/DOM order, focus traps, managed focus, landmarks, hidden off-screen content, custom-control labels, and custom-control roles. A score of 100 therefore means all scored automated audits passed; it does not prove complete accessibility or replace keyboard and assistive-technology testing.

The audit was performed on a local desktop production build with deterministic seeded data. Results describe this tested environment and are not a claim about every browser, viewport, or assistive technology.

## Raw evidence

The generated reports are intentionally ignored by Git and retained locally at:

- `lighthouse/raw-results/2026-09-28/dashboard-baseline.report.html`
- `lighthouse/raw-results/2026-09-28/dashboard-baseline.report.json`
- `lighthouse/raw-results/2026-09-28/dashboard-final.report.html`
- `lighthouse/raw-results/2026-09-28/dashboard-final.report.json`
- `lighthouse/raw-results/2026-09-28/wordle-final.report.html`
- `lighthouse/raw-results/2026-09-28/wordle-final.report.json`

Lighthouse wrote all six reports successfully. Its process then encountered a Windows permission error while removing the temporary Edge profile; the JSON reports themselves record zero run warnings.
