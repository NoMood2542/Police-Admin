# Police Admin 69 — Checkpoint L4 Report

## Checkpoint
**L4 — Retention / Forgetting Curve & Maintenance Gate**

## Status
**COMPLETE**

## Scope
Built on UX v7.8 / L3 without changing the exam bank, options, or answer keys.

## New retention loop
- Newly Mastered topics enter a maintenance schedule: **3 → 7 → 14 → 30 days**
- A due topic becomes **Maintenance Due** instead of staying permanently green
- Maintenance Retest uses **5 transfer questions** when the topic pool allows it
- Pass threshold: **80%** (4/5 for a 5-question gate)
- Passing advances the interval to the next spacing level
- After the 30-day level, maintenance continues on the 30-day interval
- Failing a maintenance gate reopens the topic to **Repair**
- One miss inside an otherwise-passing Maintenance Retest does **not** immediately destroy Mastery; the gate result controls the state
- A normal later mistake outside Maintenance Retest still reopens a Mastered topic, preserving L3 regression behavior

## Question selection
- Maintenance questions are selected from the same subject/topic
- Recent Mastery Retest and Maintenance stems are deprioritized
- Deterministic regression on a topic with a 50-question pool produced two 5-question gates with **0 overlap** in that test case.

## UX changes
- Version: **UX v7.9 · L4 RETENTION GATE**
- NEXT BEST ACTION can surface a due Retention Check
- Improvement Engine shows Maintenance Due count and retention status
- Review Queue surfaces Mastery topics whose retention check is due
- Retention sessions are resumable
- Result screen distinguishes retention pass vs return to Repair

## Regression
- Active question occurrences: **1,410**
- Question/options/answer structural SHA: **UNCHANGED**
- JavaScript syntax: **PASS**
- Chromium mobile initial render 390×844: **PASS**
- Console/page errors on initial render: **0**
- Maintenance resume snapshot schema: **PASS**
- 4/5 → PASS → Mastered retained → next interval 7 days
- 3/5 → FAIL → Repair

## Design note
This is a spaced-retention schedule, not a claim that memory follows one exact biological forgetting curve.
