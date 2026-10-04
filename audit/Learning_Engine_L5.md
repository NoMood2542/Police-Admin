# Police Admin 69 — Checkpoint L5 Report

## Checkpoint
**L5 — Exam Readiness & 120+ Target Engine**

## Status
**COMPLETE**

## Goal
Turn real timed Full Mock evidence into an operational answer to: **"How close am I to 120/150, what is holding the score back, and what should I do next?"**

## New readiness model
- Target: **120/150 (80%)**
- Uses the most recent **up to 5 Full Mock results**
- Recency-weighted projected score
- Shows a score range based on observed mock-to-mock variation
- Reports evidence strength instead of pretending to know an exact probability of passing
- Tracks trend from earlier to latest recent Full Mock
- Counts recent 120+ hits

## Subject point-gap engine
Exam weights preserved:
- General Ability: 20
- Thai: 20
- IT/Computer: 40
- Saraban: 30
- Law: 25
- English: 15

For each subject the engine estimates current expected points from recent Full Mocks and compares them with an 80% subject target. It ranks the subjects with the largest recoverable point gaps first.

## Pace telemetry
Newly submitted tests now persist:
- `elapsedSec`
- `avgAnswerSec`
- `remainingSec`
- `completed`

For Full Mocks the readiness card reports completion time, time buffer against 180 minutes, average seconds/question, or unanswered-question risk.

Old saved histories remain usable for score projection; pace is shown as unavailable until a new Full Mock provides timing evidence.

## UX
Version: **UX v8.0 · L5 120+ READINESS**

Home now includes a **120+ Readiness** card showing:
- Projected score /150
- Margin from 120
- Variation range
- Recent mock mini-history
- Highest-value subject point gains
- Pace status
- Evidence strength
- Recommended next action

After submitting a Full Mock, the results page immediately shows an updated **120+ Readiness** summary.

## Readiness states
- No evidence → `รอ Baseline`
- One mock → baseline only / requires confirmation
- Below 112 projected → `ยังต้องเก็บแต้ม`
- 112–119 projected → `ใกล้ 120`
- 120+ projected but not stable → `ใกล้พร้อม · ต้องทำให้คงที่`
- Stronger repeat evidence → `พร้อมลุ้น 120+`

These are readiness labels, **not a claimed probability of passing the real recruitment exam**.

## Regression / validation
- Active exam question occurrences: **1,410**
- Question text/options/answer-key structural SHA before vs after: **MATCH**
- JavaScript syntax: **PASS** (`node --check`)
- Chromium mobile viewport 390×844 via `set_content`: **PASS**
- Initial runtime page/console errors: **0**
- Synthetic 3-Full-Mock history (110 → 117 → 121):
  - Projected: **116.6/150**
  - Readiness: **ใกล้ 120**
  - Range: **113.2–120.0**
  - Latest pace: **169 min**, 11 min buffer, ~68 sec/question
  - Point gaps correctly ranked by subject
- Synthetic 150/150 submitted Full Mock:
  - Stored elapsed time: **7,200 sec**
  - Avg pace: **48 sec/question**
  - Readiness result coach rendered: **PASS**

## Data compatibility
- Existing localStorage key is intentionally retained (`police69_pwa_v7`) so current progress is preserved.
- Learning metadata version bumped to **5**.

## Next checkpoint candidate
**L6 — Score Strategy / 120+ Recovery Planner**
Convert readiness gaps into a concrete short study prescription such as: “Need ~6 points: target IT +2.5, Saraban +2, General +1.5; do these drills before the next Full Mock.”