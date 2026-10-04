# Explanation Overhaul — Checkpoint E1 Audit

**Baseline:** UX v7.1  
**Scope:** Active study/test flows only (`sectionTests`, `diagnostic`, `fullMocks`)  
**Audit date:** 2026-10-04

## Inventory
- Full mocks: 8 × 150 = 1,200 question occurrences
- Section drills: 150
- Diagnostic: 60
- Active total: **1,410**
- Unique active stems: **1,350**
- Diagnostic duplicates of section/drill stems: **60**
- Legacy `DATA.mock` is embedded but not referenced by active `testDefs`.

## Automated triage (unique active stems)
- **P0 — Critical:** 191 (14.1%)
- **P1 — Weak:** 448 (33.2%)
- **P2 — Adequate:** 684 (50.7%)
- **P3 — Teaching-grade:** 27 (2.0%)

**Rewrite-required: 639 unique stems.**

## Rewrite priority by subject
1. IT/คอมพิวเตอร์ — 240
2. งานสารบรรณ — 108
3. ความสามารถทั่วไป — 94
4. กฎหมาย — 88
5. ภาษาไทย — 70
6. ภาษาอังกฤษ — 39

## Representative failures
`OS`, `void`, `tort`, `router`, `switch`, `scope`, `ทันที`, `คูณ 2`, `180/3`, `due date`.

## Rewrite contract
1. State **why the answer is correct**.
2. Give the **method/rule** when relevant.
3. Explain the **common trap/contrast** only when useful.
4. Add a **memory tip** only when reusable.
5. No orphan jargon.
6. No answer echo without reasoning.
7. Math must show enough work to reproduce the result.
8. Law/Saraban must state the controlling distinction.
9. English must state the grammar/vocabulary rule.
10. Thai must state the language principle.

## E2 scope
Rewrite the **639 P0/P1 unique stems first**, then run regression:
- A–D resolution intact
- answer keys unchanged unless separately evidenced
- no missing explanations
- no orphan-jargon explanations
- no accidental question/option changes
- JavaScript syntax PASS
- mobile answer-feedback rendering PASS

## Limitation
E1 is quality triage, not full factual re-verification of every legal/Saraban statement. Source verification belongs in the rewrite checkpoints when those explanations are touched.
