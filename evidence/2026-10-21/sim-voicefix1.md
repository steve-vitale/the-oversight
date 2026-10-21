# sim-voicefix1 — villager-voice blanks F9 + F13 (run fleshout-20261021T0146Z)

Axis: scale-onramp (standing directive) — this arm fills personhood-audit voice blanks from evidence/2026-10-21/sim-villagersense.md so villagers sound like people in long-run sims.
Scope: `src/js/conversation.js` ONLY (sibling loop has live game-code arms; zero file overlap guaranteed).

## Pre-registration
- Primary metrics: (F9) zero "— anyway."/"— comedy." stage-direction leaks inside quoted speech on statements; quick-pace and dry-humor mannerisms still voice in spoken form. (F13) the "Quick version — Short version:" doubled-filler template gone and unwirable.
- GO threshold: new proof tests GREEN + green-list `test-convo-seed-voice-20261011.js` GREEN (updated for the deliberate design change).
- Seeds: fixed seeds [7, 777, 424242, 90210, 1306, 1501, 20261021, 31337]; shared kit `scripts/godpath/lib.js`, Math.random seeded before eval, `Game.save` never stubbed.

## F9 — TONE-TAG LEAK IN SPOKEN DIALOGUE → GO (fixed, [needs-eyes])
Root cause (as filed): `convoSpeechMarkers` appended literal closers `' — anyway.'` (quick pace) and `' — comedy.'` (dry humor); the dismissal-closer filter (conversation.js:722-729) only stripped them on questions/favorHeads, so statements kept the stage direction inside the quote. Reproduced RED on master: `Game.voiceLine(quick, '"We covered twice the ground."')` → `"We covered twice the ground. — anyway."`, and dry → `"… — comedy."` (7/7 proof assertions failed pre-fix).

Design call (Steve 2026-10-07: make the call, document it, he can overrule): replace with natural spoken words instead of moving the tags outside the quote. A tag outside the quote (`"…" — comedy.`) would still read as a director's note; spoken words keep the villager's voice:
- quick pace: `', anyway.'` → comma-fold tucks it into the clause: `"We covered twice the ground, anyway."`
- dry humor: `' Ha.'` → flat deadpan utterance: `"We covered twice the ground. Ha."`

Before/after pairs (seeded, same villagers, same line):
| Villager (seed 7) | BEFORE | AFTER |
|---|---|---|
| quick-paced gen_c02sxrk | "We covered twice the ground. — anyway." | "We covered twice the ground, anyway." |
| dry-humor stan_kowalski | "We covered twice the ground. — comedy." | "We covered twice the ground. Ha." |
| quick, on a question | n/a (filtered) | "Will you help me clean it, anyway?" (natural spoken question-tag) |

Sense judgment: read aloud, both AFTER lines are things a person actually says — a quick talker's "anyway" tic, a dry person's flat "Ha." The wry register's genuine asides (" — or so they tell me.") are speakable and untouched. The dismissal-closer question filter still guards the remaining dash-led asides.

Feel change → commit message carries [needs-eyes].

## F13 — REDUNDANT EVASION TEMPLATE → already-fixed on master (pool removed)
`NPC: "Quick version — Short version: I don't know. Long version: also that, but slower."` was observed in 2026-10-16 transcripts (e.g. evidence/2026-10-16/social-r19-transcripts/grief-1306-competent-day11-James.txt:20) and older ("Fine — Short version:", "You know what — Short version:"). Verified on current master (2026-10-21): NOT reproducible. Commit 3329c74bf (2026-10-20, "Repair conversation intent") replaced the 'take' branch (`convoPick(vid, 'gq:open:take', GQ_TAKES)`) with a plain `'"Take your time."'` response, orphaning the entire `GQ_TAKES` evasion pool — no code path feeds it. Git archaeology: `git log -S GQ_TAKES` shows the single removal hunk. A grep of all reachable pools shows no live line starts with a "Short version:"-style self-opener, so the doubling class has no reachable instance.

Fill (builder move): deleted the orphaned `GQ_TAKES` const (conversation.js) with a comment recording its history, so the bad template can't be resurrected by a future wiring. This is dead-content removal, not a behavior change — no reachable line is affected.

## Proof results
- scripts/test-voicefix-f9-toneleak.js: RED 0/7 pre-fix (reproduced the leak) → GREEN 7/7 post-fix.
- scripts/test-voicefix-f13-evasion.js: GREEN 5/5 (pool gone, no code refs, no "Short version:" template, game loads, restless villager never doubles fillers).
- scripts/test-convo-seed-voice-20261011.js (green list, updated in the same commit per repo rules — the old assertions encoded the pre-fix stage-direction forms): 64 pass, 0 fail.
- node scripts/check.js --only convo (conversation-scoped regression net, 2026-10-21): 13 passed, 0 failed in 86s.
- node scripts/check-wired.js src/js/conversation.js: 132 functions, 0 unwired.
- Full node scripts/check.js --quick was started but its background session was dropped by the runtime before the result arrived (~30 min under heavy sibling load); the conversation-scoped net above plus the three voice suites above cover this change's blast radius (voice-only, no gameplay systems touched).

## Metric review
Pre-registered metrics all held; no re-scoring. F13 could not be RED-proven on live code because the bug class was already dead — documented honestly here instead of inventing a fix.

## Named nexts
- F6 (game.js monster-reaction blank) deliberately left for a run when game.js is not hot (sibling loop owns game.js this run).
- Sibling sweep candidate: any other dash-led stage-direction closers in pools (grep ` — ` open/close pools) — ' — or so they tell me.' is speakable, verified sensical in this run's samples.
