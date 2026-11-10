# journey-deepening r124 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `laneA-20261109T1945CST`, scheduled Mon 2026-11-09 19:45 CST (2026-11-10 01:45 UTC)
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing.
- **Base:** local master `74debf969` (Loop B 2330Z round: foodrung, standaccum, midfifth, vetfinish + gate 296/4 standing). Branch `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Policy:** competent (LISTEN). CONVO_DAYS [45, 60, 80].
- **Seeds:** fresh 44001–44008; smoke 44000. Freshness verified by the full check: 0 word-boundary .md mentions in evidence/ + docs/, 0 scripts, 0 filenames, 0 prereg hits, 0 seed-context patterns (`s4400x`, `seed 4400x`), 0 live processes. The two apparent hits are false positives: a case-cache hash filename containing `44004` (`68b33d2344004f36f...json`, not a seed file) and a pantry quantity `44000` in scripts/test-inflow-b.js (a value, not a seed). Rejected bands in the search, all used: 92101–92108 (r104), 92401 (r106), 92601 (r107), 92501/92701 (r110), 95001–95008 (ragerepress), 95101–95116 (cookbulk), 97101/97201 (heraldcontact), 97405 (heralddepart), 98601–98616 (hurthome-fix-c), 98000–98099 (mealday/doublenight). **Amendment A1 expands the panel to 16 seeds: +44009–44016, verified fresh by the same full check (0 prereg hits, 0 .md mentions).**
- **Horizon:** DAYCAP=100 (mid-game, waves 2–3; MEASUREMENT §10).

## Pre-flight notes (this run)

- `git pull --ff-only` fails (diverging branches) as usual: local master ahead ~318 / behind 156 vs origin/master (origin tip `a628aeaf3`, PR #121). No reconciliation, no merge of origin/master, no push — the ship loop / main session owns it. Steve's reconciliation direction still awaited (asked 2026-11-08 ~15:25 CST, do NOT re-ping). Work is based on local master `74debf969` only.
- Worktree registration took ~7.3 min (slow `git reset --hard` on the 87k-file tree under sibling contention); heartbeat loop running at 10-min cadence (PID recorded in the run note).
- The 17:45 CST Lane A occurrence stood down correctly on the overlap guard (r122 adoption live at the time); nothing to adopt from it.

## Q1 (PRIMARY) — WANT-AFTER-SECRET

r122 metric review named this the next blank in the secret thread: the confession is answered and the follow-up lands (POST-SECRET-RICH), but the villager's underlying want (`seek_taken` / `ask_favor`) still never surfaces by sitting end — WANT-OPEN 2/2 in both r122 panels. Question: with the r122 follow-up now in the engine, does the want surface in the sitting — established (want resolution leaves `none`/`unestablished`) or voiced in a post-answer line the people check can read?

- **Metric:** over ANSWERED secret sittings: `wantEstablished` (wantFinal resolution ≠ none/unestablished), `newlyEstablished` (wantStart unestablished → wantFinal established), plus the post-answer THEM lines read in full in the people check.
- **Verdicts:** SURFACES if ≥50% of answered secret sittings establish the want; STAYS-BURIED if 0 of ≥2 answered; MIXED otherwise; THIN-PROBE if <2 secret sittings fire (labelled plainly, no over-claim — the pool was 2 in r122).
- **Driver change:** the secret record gains `wantStart` (want id/stage/resolution at sitting start) and `secretMenu` + `confrontOnSecretMenu` (the menu offered on the turn the first `secret:` pick is made).

## Q2 (SECONDARY) — CONFRONT-ON-SECRET

The secret menu also offers a `confront:d_*` option alongside the secret answers (seen in both r122 secret transcripts, unjudged). Mechanism (verified in source before the run): truth.js wraps `convoChoices` and appends `confront:<doubtId>` before `leave` on ANY menu whenever the player holds an open doubt about the villager — the secret branch's five answers are no exception. The secret menu itself offers no confront; the doubt system adds it.

- **Wild count:** in the panel, how often does `confront:*` ride a secret menu (`confrontRides` / secret sittings)?
- **Forced probe (proof test):** stage a secret sitting with an open doubt planted (`addDoubt`), confirm the menu offers `confront:`, pick it, then ask: is the secret still answerable afterwards (menu offers `secret:` again, `secretAnswered` unset, thread still `secret`)? Read the confrontation and the aftermath in full.
- **Verdicts:** SECRET-SURVIVES (confession still answerable after the confrontation) / SECRET-DIES (confession lost — answered flag set, thread cleared, or sitting ended without an answer) / UNREACHED (confront never offered in the probe). Sense-read: does accusing someone mid-confession read as a real choice with consequences, or does it silently eat the confidence?

## Q3 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4 (first four ≥2/4), regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST watch (stranger gains + terminal-death clustering — design call stays with the main session), all-tracks read. PANEL VERDICTS read as before.

## Instrument — analyzer stem widening (r122 metric-review proposal)

The night and kept-secret families share no referencing stem with their own follow-up lines: the night follow-up ("The nights are still long…") carries no stem in the list, and the kept-secret follow-up ("I still keep it to myself…") neither — the existing `stash`/`rations`/`woods` stems match the secret TEXT, not the follow-up line the instrument reads. Widen `POSTSECRET_STEMS` with `'night'` (matches "nights are still long") and `'keep'` (matches "I still keep it to myself" and "I still keep the photo"). Analyzer-only change; verified by the proof test (new night + kept-secret cases; all existing cases still pass).

## Shape

prereg → analyzer proof test → smoke 44000 × DAYCAP=45 → 2-seed pilot → 8-seed panel (one seed per process) → analyzer verdicts → if WANT STAYS-BURIED with a mechanism, or CONFRONT eats the secret: fix + proof test + after-panel on same seeds → run note → gate → merge.

## Amendment A1 — panel expansion 8 → 16 seeds (recorded before judging, 2026-11-10 ~02:40Z)

The 8-seed panel drew SECRET-SILENT (0 openers in 52 convo-day openings; r122 drew 2/49 on the same denominator). The phenomenon is rare (~4% per opening: the secret hook's 20% roll only fires when no want/grief/question claims the opening first) and this panel drew the ~11% blank. The primary question (Q1) cannot be judged on 0 sittings, so the panel expands to 16 seeds with fresh band 44009–44016 (verified fresh by the same full check). This is a panel-size change recorded before any verdict is drawn, not a re-score: the 8-seed blank stays reported as-is, and Q1/Q2 verdicts will be judged on the full 16-seed panel. If the expansion still yields <2 answered secrets, Q1 stays THIN-PROBE/NO-ANSWERS.

## Metric review (to fill at closeout)

- Whether the Q1 bar (≥50% established) was the right shape for a 2-sitting pool, and whether "voiced" needs its own instrumented leg next run.
- Whether the stem widening changed any r122 verdict in re-analysis (it must not — it is a forward instrument fix, not a re-score).
