# Rafiq | رفيق — Male Reproductive Health Navigator

**Future Health Digital Innovation Challenge 2026 · Fertility · Challenge 01: Male Reproductive Health**
Prototype — clinical rules v1.0, draft pending medical sign-off. Not a diagnostic tool.

## What it does
Rafiq is a private, Arabic-first web app that gives men a low-friction front door to reproductive health. A short questionnaire (15–17 questions, ~5 minutes) is evaluated by a deterministic, clinician-authored rules engine that:

1. Stops immediately and shows emergency guidance for red flags (P0), or same-day assessment guidance (P1).
2. Identifies explainable risk signals (medical, urological, medication, lifestyle, occupational, family, fertility history).
3. Directs the user to the right next step on a five-level care ladder (P0 Emergency → P4 Information).
4. Produces a printable summary the user can choose to share with their doctor.

It never diagnoses, never calculates a fertility score, and never tells a user their fertility is normal.

## How it answers the six challenge outcomes
| Outcome | How Rafiq answers it |
|---|---|
| Earlier, explainable risk identification | 16 rules (CR-001 to CR-016); every signal shows the exact answer that triggered it, its rule ID and its care pathway. Screening and diagnosis are explicitly separated in every report. |
| Culturally trusted experience | Arabic-first, non-judgmental wording written by the clinical lead; no assumptions about family choices; “prefer not to answer” on every sensitive question; English toggle. |
| Lower-friction assessment | No app install, no account, no name; works on any phone browser in ~5 minutes. |
| Safe triage and referral | Strict priority hierarchy P0 > P1 > P2 > P3 > P4; emergency rules stop the questionnaire and cannot be overridden; all signals retained; clinical boundaries stated on every report. |
| Privacy by design | Zero data collection: answers live only in browser memory and are erased on reload. No server, no database, no analytics, no cookies, no storage. Sharing is user-controlled (print/save). |
| Demonstrable value | 28 automated validation cases (20 from the clinical catalogue + 8 negative cases) run live in the browser at `#tests`; full rule catalogue visible at `#rules`. |

## Architecture
- Single self-contained `index.html` (HTML + CSS + JS, no framework, no build step). Static hosting only.
- `engine.js` — pure-function rules engine `evaluate(answers) → result` (same code embedded in `index.html`). Output follows the JSON structure in catalogue section 9.2.
- `run_tests.js` — runs the validation suite in Node: `node run_tests.js`.
- **No AI/LLM in the decision path**, per catalogue section 9.1 (“The rule engine must not depend on an LLM to decide whether an emergency exists”) and 9.4 (“Clinical rules must not be modified by AI-generated content”).

## Assumptions and decisions made by the technical team (need clinical confirmation)
1. **CR-006 priority split:** diabetes, thyroid, hormonal/pituitary, cancer → P2; hypertension, obesity, other chronic → P3.
2. **CR-012:** P3 by default; raised to P2 when current sexual/urinary symptoms (Q12) are also reported.
3. **CR-014:** family history of testicular cancer → P3; known inherited reproductive/hormonal disorder → P2.
4. **CR-015:** added follow-up question **Q14-A** (duration of attempts), which the catalogue references but the questionnaire did not include. <6 months → P3; 6–12 months or unknown → P2 (clinical advice); >12 months → P2 (evaluate both partners).
5. **CR-016:** added follow-up **Q15-A** (“did a doctor say your semen analysis was abnormal?”) so the “abnormal semen analysis” trigger can fire; abnormal → P2, otherwise P3.
6. **Emergency numbers** shown: Saudi Arabia 997, UAE 998.
7. Short interface texts not in the catalogue (P3 next step, limitations paragraph, stop-screen notes) and all English translations were written by the technical team.

## Limitations
- Rules are a draft; no rule is approved for production until signed off by the medical lead (catalogue section 11).
- Validated only against the 28 defined test cases; not yet tested with real users or real clinical data.
- Self-reported answers; the tool cannot examine, test or verify.
- No measurement of completion, referral completion or user trust yet — this requires a pilot with consented analytics, which the current privacy-first build deliberately omits.
- Arabic text needs final language review.

## Roadmap after the challenge
Pilot with a partner clinic (consented, aggregate-only metrics); clinician view of the shared summary; optional booking hand-off; optional AI-assisted Q&A limited to approved educational content, kept outside the decision path.

## Clinical references
EAU Guidelines on Sexual and Reproductive Health (Male Infertility); AUA/ASRM Diagnosis and Treatment of Infertility in Men (2024); WHO Guideline for the Prevention, Diagnosis and Treatment of Infertility (2025); NHS Testicle pain; NHS Testicle lumps and swellings.
