# Police Admin 69 — Checkpoint L1 Report

## Checkpoint
**L1 — Learning/Improvement Engine Foundations**

Baseline: **UX v7.5 · E5 FINAL**  
Output: **UX v7.6 · L1 LEARNING ENGINE**

## What changed

1. **Attempt-level learning memory**
   - Tracks attempts, correct/wrong count, streak, repeated misses, last attempt, and test source per unique question stem.
   - Existing `state.answers` is bootstrapped once so older progress is not discarded.

2. **Topic weakness scoring**
   - Aggregates by subject + topic.
   - Uses accuracy, repeated mistakes, unresolved Error Book items, and response speed.
   - A single miss is labeled separately and does not automatically become the next recommended drill.

3. **Response-time tracking**
   - Tracks answer latency prospectively.
   - Reference pace: 72 sec/question; slow flag threshold: >90 sec/question.
   - Timing survives session resume.

4. **Adaptive next action**
   - Spaced Review remains highest priority when items are due.
   - Recommends a subject Section drill only when evidence indicates a real weakness (repeated wrong/unresolved cluster/multiple attempts with low accuracy).
   - Avoids overreacting to one isolated mistake.

5. **Improvement Engine UI**
   - New home dashboard card.
   - Shows total attempts, repeated-wrong question count, slow-question count, top weak topics, confidence/status, and next action.
   - Statuses include: `พลาดครั้งเดียว`, `ยังไม่แม่น`, `กำลังนิ่ง`, and `ต้องเก็บข้อมูลเพิ่ม`.

6. **Post-test coaching**
   - Result screen now identifies the weakest subject in that test and directs the learner back to the longitudinal Improvement Engine.

7. **Review double-grade fix**
   - Practice/Review questions are graded once at selection time.
   - Submitting a review no longer calls grading a second time and no longer advances spaced-review progress twice.

## Regression gates

- Active question occurrences: **1,410**
- Question/option/answer structural SHA before vs after: **MATCH**
- Question text changed: **0**
- Options changed: **0**
- Answer keys changed: **0**
- Missing explanation: **0**
- Missing memory tip: **0**
- JavaScript script blocks: **2 / syntax PASS**
- Learning core functions duplicated: **0**
- Review submit duplicate `gradeOne()` call: **0**

## Important behavior

L1 is intentionally conservative. One wrong answer is evidence, not a diagnosis. The engine promotes a topic to adaptive remediation only when there is repeated or clustered evidence.

## Scope boundary

L1 establishes measurement and recommendation foundations. It does **not** yet generate a custom mixed drill from the exact weak questions/topics. That belongs in L2 after L1 runtime evidence is stable.