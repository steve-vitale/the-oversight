# Natural maker counter delivery trace

The prior 64-seed screen had five selected batches smoked and four shelved.
Seed 5 was the missing delivery. `scripts/maker-counter-trace.js` now replays
one seeded run using the same standard `sweep-compare` driver and policy. It
wraps actual cook/smoke/shelving and narration, recording existing state only;
it does not call fire, technique, detail or pantry helpers for observation.
The trace contains runtime/policy/tool source hashes and the source HEAD.

Command: `node scripts/maker-counter-trace.js --seed 5 --out
evidence/2026-10-15/maker-counter-trace-5.json`.

Final gameplay hash exactly matches the committed 64-seed after row:
`f97ee62b1469801ddd2229c33de374bf11f6cac5122464e1a6196defc3593a25`.
This remains true with the armory/pharmacy conservation repairs in the working
tree. The observer therefore reproduces the actual run, rather than creating
a similar-looking anecdote through a different driver or sampling schedule.

## What happened

On day 64, inside Haven, at 2,040 kcal and tick zero:

| Public action | Paid ticks | Actual result |
|---|---:|---|
| Cook counter Gray Squirrel | 32 | One 182-kcal portion cooked through |
| Smoke that portion | 16 | Novice learns preserving; 80% yield, 146 kcal, spoil day 79 |
| Put away finished food | 0 | Pantry full; portion stays on counter |

The real narration says: "The pantry is full (150,000 kcal cap) — Gray
Squirrel (smoked) stays on the counter. Expand storage to take more."
The pantry held 151,793 kcal before and after all three actions. The raw stored
capacity field in the snapshots is 120,000; the actual getter includes Haven's
capacity modifiers, reflected in the refusal's 150,000. The trace does not
establish why existing stores were already above the effective cap.

This was a valid capacity refusal, not lost food or an uncalled shelving
binding. Keep the real cost/capacity choice; no balance or storage grant is
justified by this single run. It still does not establish that the preservation
routine improves survival. The 64-seed result remains 20→21 wins and 51→53
bearer deaths, with only four exposed runs.

## Next access question

The same trace shows many hide/bone material entries accumulating on the prep
counter. Their presence is not proof that a player or maker can move them into
carried crafting stock or communal materials. Audit that public path next,
alongside naturally funded storage demand. Do not interpret missing ammunition
crafts as a magical recipe-ladder requirement before checking the material flow.
