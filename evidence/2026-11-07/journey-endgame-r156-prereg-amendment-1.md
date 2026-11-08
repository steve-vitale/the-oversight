# Journey endgame r156 — PREREG AMENDMENT 1 (post-fix re-run + refusal-variety fix)

Adopted by the main session after the 18:00 CST Lane B worker timed out
mid-post-fix-pilot (2/5 seeds done, no verification performed). The worker's
artifacts were all present and verified before this amendment was written:
prereg, pre-fix pilot (5/5), pre-fix analysis, dark re-verify, fix +
RED/GREEN proof test. The main session completed the remaining work; nothing
was re-scored and no bar was moved.

## The fix (same-run investigation item from the pre-fix pilot)

Pre-fix pilot transcripts showed party-invitation refusals repeating one
identical line verbatim every time a villager declined — a stuck-record
read. V-WAITVARIETY covers hold lines, not refusals, so this was a gap
in the same family: a refusal that always says the same words stops
reading as a person deciding and starts reading as a recording.

Fix: `src/js/party.js` (+31/−4). Each refusal branch — lowtrust,
cautious, busy — now carries 3 distinct lines, picked deterministically
per villager+day (same villager refusing the same invite on the same day
repeats the same line, so the refusal stays stable inside a day), and
spoken aloud (say == returned message). Proof:
`scripts/test-endgame-r156-refusal-variety.js` — 15 passed, 0 failed,
standalone (re-run by the main session during adoption).

## Post-fix re-run (matched, same seeds, same probe policy)

The post-fix pilot re-ran all 5 preregistered seeds with the fix applied,
into `evidence/2026-11-07/perseed-endgame-r156-postfix/`. It ran in three
invocations, all with the same env: the worker's first two seeds (89701,
89702), then the main session's 89703, then 89704–89705 with RELAYGREY=1
added — the forcedrift plan requires it (SWEEP STOP on the first attempt
without it; the worker's original pilot invocation had it set). The split
is immaterial: per-seed outputs are independent and the env is otherwise
identical.

Result — the fix is trajectory-neutral and visibly working:
- All 5 per-seed JSON summaries are BYTE-IDENTICAL pre-fix vs post-fix
  (`cmp` clean on all five). No outcome, seat, wave, kill, or standing
  number moved.
- Transcripts differ ONLY in refusal lines: 89701: 10 lines, 89702: 2,
  89703: 4, 89704: 0, 89705: 0. Same villager, same branch, different
  words on different days (e.g. Raj: "Out there? With YOU leading?
  ...Let me think about it." → "Out there? I'd rather not die today,
  thanks."). No other transcript line changed.
- Postfix analysis (`scripts/analyze-endgame-r156-postfix-20261107.js`,
  analyzer verbatim except input dir) is BYTE-IDENTICAL to the pre-fix
  analysis: PRIMARY-BINDINGS NO-GO on exactly M3/M3b/M4 — the expected
  closed-road reading per the prereg's ROAD-TALLY note, not a pilot
  failure. Everything else GO.

## Verdict on the fix

Verified in the wild: refusal variety present, trajectories unchanged,
analysis unchanged. The fix LANDS with this run. No bar was touched; no
re-scoring. The refusal-variety check becomes a standing wild-verification
item for future endgame pilots (V-REFUSALVARIETY): refusals in pilot
transcripts must show within-branch variety, not one repeated line.
