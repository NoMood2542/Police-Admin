# Police Admin 69 — Checkpoint L2 Report

## Checkpoint
**L2 — Adaptive Weakness Drill**  
Build: **UX v7.7 · L2 ADAPTIVE DRILL**

## Scope implemented
- Generates a **10-question personalized weakness drill** from L1 learning history.
- Uses up to the top 3 weak topics detected from repeated misses, unresolved Error Book items, low accuracy, and slow response time.
- Mixes:
  - previously missed / unresolved questions, and
  - transfer questions from the same weak topic or subject.
- Penalizes questions used in the immediately previous adaptive drill when alternatives exist, reducing rote repetition.
- Shows target topic and source context on each adaptive question.
- Adaptive drills use practice-mode immediate feedback with the E1–E5 teaching explanations.
- Correct answers in an adaptive drill clear duplicate Error Book entries for the same stem; a new wrong answer leaves one canonical error entry.
- Adaptive session can be snapshotted and resumed with its generated 10-question set intact.
- Stores up to 30 adaptive drill summaries and the most recent drill stems for subsequent selection.
- Next Best Action / Improvement Engine / hero CTA can launch the adaptive drill directly when L1 has enough evidence.

## Selection behavior
Priority signals:
1. exact weak topic match;
2. weak subject match;
3. unresolved Error Book status;
4. repeated wrong answers;
5. slow average response (>90 s);
6. unseen transfer questions for concept generalization;
7. recent-drill penalty to avoid immediate memorization loops.

A single miss alone is still not enough to classify a topic as a persistent weakness.

## Regression / validation
- Active question occurrences: **1,410**
- Question / option / answer structural SHA before vs after: **MATCH**
- Question bank content changed: **0**
- JavaScript script blocks: **PASS (`node --check`)**
- Chromium 390×844 synthetic weakness run: **PASS**
- Generated adaptive set length: **10/10**
- Duplicate stems inside generated drill: **0**
- Duplicate adaptive keys inside drill: **0**
- Three-subject weakness seed produced a mixed drill across 3 subjects: **PASS**
- Immediate explanation feedback: **PASS**
- Adaptive custom session serialization: **PASS**
- Adaptive session resume contract: **PASS**
- Error lifecycle (correct clears duplicate stem errors; wrong leaves one canonical error): **PASS**
- Full 10-question adaptive completion records drill history + recent stems: **PASS**
- Browser console/page errors in tested flow: **0**

## Non-goals / limits
- L2 does not claim psychometric item calibration.
- Difficulty is not yet dynamically calibrated from population-level statistics.
- Topic selection is personalized to local browser history only; no server/account sync.

## Next checkpoint candidate
**L3 — Mastery Loop & Retest Gate**
- define per-topic mastery thresholds;
- require successful transfer/retest before declaring a weakness repaired;
- show “before → after” improvement and score recovery;
- schedule targeted retests rather than continuously drilling the same topic.