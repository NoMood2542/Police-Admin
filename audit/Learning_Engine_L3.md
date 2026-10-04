# Police Admin 69 — Checkpoint L3 Report

**Version:** UX v7.8 · L3 MASTERY LOOP  
**Checkpoint:** L3 — Mastery Loop & Retest Gate  
**Status:** COMPLETE

## Goal
Prevent the learning engine from marking a topic as mastered after one correct answer. A weak topic must accumulate repair evidence, then pass repeated transfer/retest gates before it can become `Mastered`.

## Mastery state machine
`repair → ready → confirming (Gate 1/2) → mastered`

A later wrong answer on a mastered topic reopens it:
`mastered → repair`

## Baseline trigger
A mastery baseline is created only when the topic has credible weakness evidence, such as:
- repeated wrong answers; or
- at least 2 unresolved errors; or
- at least 3 attempts with accuracy below 75%.

A single isolated miss does **not** create mastery failure status by itself.

## Ready-for-retest gate
A topic becomes `ready` only after post-baseline repair evidence reaches all of:
- at least 4 attempts after the baseline;
- at least 2 attempts coming from Adaptive Weakness Drill;
- at least 75% correct after the baseline.

## Mastery Retest
- Exact topic is preferred.
- Retest uses 4–6 unique transfer questions (6 when the pool allows it).
- A retest is offered only when at least 4 unique questions exist for that topic.
- Pass threshold = at least 83%, rounded up (e.g. 5/6).
- No unanswered questions are allowed for a pass.
- Gate 2 prioritizes questions that were not used in the previous gate; reuse is allowed only when the topic pool is too small.

## Two-gate rule
- Passing Gate 1 produces `ผ่าน Gate 1/2`, **not Mastered**.
- A second passing retest is required for `Mastered`.
- Failing either gate returns the topic to `repair` and resets post-baseline repair evidence.

## Before → after evidence
For every mastery topic the engine stores:
- baseline accuracy;
- latest retest accuracy;
- point improvement delta;
- gate history;
- pass streak;
- mastered/reopened timestamps.

The Improvement Engine shows this as `Baseline X% → Retest Y% (+Z จุด)`.

## UX integration
- Main `NEXT BEST ACTION` can now recommend Mastery Retest.
- Improvement Engine shows `Mastered` and `พร้อม Retest` counts.
- Topic chips support `พร้อม Retest`, `ผ่าน Gate 1/2`, and `Mastered`.
- Mastery result screen explicitly explains whether the user failed, passed Gate 1 only, or achieved Mastered.
- Mastery retest sessions are resumable through the existing session snapshot mechanism.

## Regression / validation
- Active question occurrences: **1,410**
- Question text changed: **0**
- Options changed: **0**
- Answer keys changed: **0**
- Structural SHA-256 before/after: **MATCH**
- JavaScript syntax: **PASS** (`node --check`)
- Chromium mobile viewport: **390×844 PASS**
- Console/page errors during synthetic mastery test: **0**

### Synthetic mastery-flow test
Representative topic: `กฎหมายประชาชน / ความผิดเกี่ยวกับทรัพย์` (50-question pool)

1. Weak baseline created.
2. 4 correct repair attempts from Adaptive Drill → `ready`.
3. Gate 1: **6/6** → `confirming`, pass streak 1.
4. Gate 2: **6/6**, **0 stem overlap** with Gate 1 → `mastered`, pass streak 2.
5. One later wrong attempt → automatically reopened to `repair`, pass streak reset to 0.

## Scope limitation
L3 implements mastery logic and regression protection. It does not claim that every granular topic has enough unique bank questions to support an exact-topic retest. Topics with fewer than 4 unique questions will remain in repair/adaptive practice rather than receiving a false mastery gate.