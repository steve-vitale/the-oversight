# journey-deepening r125 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `laneA-20261110T0645CST`, scheduled Tue 2026-11-10 06:45 CST (2026-11-10 12:45 UTC)
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `7c2591d1f` (journey-establishment r127: grant-rate dial NO-GO, reverted; gate 294/6 standing). Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-10T12:57:38Z` (created by this run; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** PID 19225, 10-min cadence — script `~/workspace/worktrees/journey-deepening-hbloop-r125.sh`.
- **Policy:** competent (LISTEN). CONVO_DAYS [45, 60, 80].
- **Seeds:** fresh 45001–45016; smoke 45000. Freshness verified by the full check: 0 word-boundary .md mentions in evidence/ + docs/, 0 scripts, 0 filenames, 0 seed-context patterns (`s4500x`, `seed 4500x`), 0 live processes. False positives, all different seeds: `s4501` files (seed 4501) and `s64501` (seed 64501) match the substring `4501`, not seeds 45001–45016. Rejected bands in the search, all used: 44001–44016 (r124), 92101–92108 (r104), 92401 (r106), 92601 (r107), 92501/92701 (r110), 95001–95008 (ragerepress), 95101–95116 (cookbulk), 97101/97201 (heraldcontact), 97405 (heralddepart), 98601–98616 (hurthome-fix-c), 98000–98099 (mealday/doublenight).
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10).

## Pre-flight notes (this run)

- `git pull --ff-only` fails (diverging branches) as usual: local master ahead ~412 / behind 156 vs origin/master (origin tip `a628aeaf3`, PR #121). No reconciliation, no merge of origin/master, no push — the ship loop / main session owns it. **Standing change this morning (Steve ~05:11 CST): "Please get things reconciled and merged. Yes change it."** — a reconcile coordinator is LIVE (`reconcile-divergence` worktree in today's reap); it owns the divergence, not this run. Work is based on local master `7c2591d1f` only. Master may move during this run (reconcile landing); rebase onto the explicit SHA before merging, as r124/r127 did.
- Worktree registration took ~15.8 min (slow `git reset --hard` on the 87k-file tree under sibling contention; Lane B registered journey2-endgame concurrently). Heartbeat loop running at 10-min cadence (PID recorded above).

## Q1 (PRIMARY) — SECRET-LINE VARIETY

r124 people check, recorded not fixed: the promise answer line is ONE fixed sentence, identical in 5/6 answered secret sittings ("Thank you. ...I needed someone to know, and I needed it to stop there."); the teach-plant frame repeats verbatim with only the plant swapped (3× in Jordan's sitting: "This one — X. Leaf, stem, smell. You won't forget it now."). CONVERSATIONS.md promises "No repeats, ever" via `convoPick` — but both lines bypass it (direct `done(...)` / direct `lineText`), so the ledger never sees them. Question: in answered secret sittings, does the promise answer line repeat verbatim across sittings, and does the teach frame repeat within a sitting?

- **Metric (driver records `answerLine` = the THEM line on the answer turn, and `teachLines` = THEM lines on `teach` picks):** over ANSWERED secret sittings: distinct answer lines / answered; max repeat count of any single answer line; per sitting: distinct teach frames / teach picks; max same-frame count in one sitting. Teach frames are normalized by blanking the plant name against the known frame patterns (old frame + any new variants the fix adds) — exact-text dedupe cannot see the frame repeat because the plant differs each time.
- **Verdicts:** REPETITIVE if max-repeat of one answer line ≥3 across answered sittings, OR any sitting repeats one teach frame ≥3 times; VARIED if max-repeat ≤2 AND no sitting repeats a teach frame ≥3 times, with ≥2 answered secrets; THIN-PROBE if <2 answered secrets; MIXED otherwise.
- **Fix (if REPETITIVE with the mechanism above):** variant pools per secret-answer kind routed through `convoPick` (promise / comfort / offer / silence — literacy offer line stays, it is already specific), and teach-plant frame variants through `convoPick` (plant name stays in the line; the FRAME varies). Proof test RED→GREEN; after-panel on the secret-bearing seeds re-run on the fixed engine. The answer line is the turn==answerTurn line, not a post-answer line, so the POSTSECRET refRate instrument is untouched; teachPicks counting is untouched.
- **Driver change:** secret record gains `answerLine` and `teachLines`. **Analyzer change:** new `summarizeSecretVariety` + frame-normalization patterns + `Q1-VARIETY PANEL` line. Proof test for the analyzer (old + new frame lines, answer-line counting).

## Q2 (SECONDARY) — WANT-OUTCOME SPLIT

r124 metric review: "established" counts any non-none resolution including deflected/unresolved — a want that surfaces and is refused counts the same as one that is promised. Question: when a surfaced want is established after a secret, does it actually LAND (promised/stated) or merely surface (deflected/unresolved)?

- **Metric:** over ESTABLISHED wants in answered secret sittings (wantFinal resolution): promised/stated vs deflected/unresolved counts. No driver change — wantFinal already recorded.
- **Verdicts:** LANDS if ≥50% of established wants resolve promised/stated; SURFACES-ONLY if established >0 but 0 promised/stated; THIN-PROBE if <2 answered secrets; MIXED otherwise.
- **Analyzer change:** `summarizeWantAfterSecret` gains the resolution breakdown + `Q1-WANT-OUTCOME` counts on its panel line.

## Q3 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4 (first four ≥2/4), regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST watch (stranger gains + terminal-death clustering — design call stays with the main session), all-tracks read. PANEL VERDICTS read as before.

## Shape

prereg → analyzer proof test → smoke 45000 × DAYCAP=45 → 2-seed pilot → 16-seed panel (r124 lesson: secret rate ~4%/opening, an 8-seed panel can draw a blank — pre-register 16 from the start) → analyzer verdicts → if REPETITIVE with a mechanism, or the split shows SURFACES-ONLY with a mechanism: fix + proof test + after-panel on same seeds → run note → gate → merge.

## Metric review (to fill at closeout)

- Whether the Q1 bar (max-repeat ≥3) was the right shape, and whether cross-seed repetition (different processes, no shared run ledger) should count the same as within-seed repetition.
- Whether the Q2 split changes the r124 SURFACES verdict reading (5/6 established — how many actually landed?).
- Whether the frame-normalization patterns survived the fix's new variants, or needed extending in the after-panel.
