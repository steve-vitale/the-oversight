# Journey leg ESTABLISHMENT — r109 pre-registration (2026-11-07, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Leg question (fresh — named by r108's metric review, not re-proven)
r108's people check read 8 held convos in full. 7 passed; Ursula (1603,
mortician) was WEAK: a thin closed beat. Her opening is a resolved favor
("Never mind the food I needed — we got it handled"), the exchange runs
subject → deflect ("We went over this") → silence → goon and then the menu
offers nothing new to pick (only leave + already-visited navigation), so the
driver records "(no pick)" and the conversation fizzles with a generic
closing ("Go easy today, okay?"). The NPC wants nothing here and the ending
resolves nothing, plants nothing, owes nothing — against the conversation
quality bar (Steve 2026-10-11) and CONVERSATIONS.md's own rule that "an
exhausted topic offers a pivot or exit, rather than filler choices."

This run tests the repair: **a held conversation never stalls to a no-pick
menu**. When the substantive menu is exhausted (no unvisited content choice
remains) and the conversation is not winding down, the engine offers a
genuine pivot (an unvisited thread/subject the villager can actually speak
to, a rumor they hold, a task they need) — or, when the villager truly has
nothing to offer, queues the wind-down so the NPC signals a natural ending
("I should get back to it") instead of leaving a dead menu the player must
bail out of. The question is mechanism, not funnel: do held conversations
still stall to a no-pick menu?

Why this is not a re-proof (Steve 2026-11-01 rebuke; 2026-11-04 standing
rule): r108's hunt-staffing funnel verdict (HUNT-MIXED) and prep verdict
(PREP-PARTIAL) are NOT re-judged — both stay parked, and §12 says no
round-3 funnel panel. This run changes the QUESTION to the dialogue blank
r108 named. Funnel numbers are reported descriptively only; the verdict
turns on no-pick stalls in held conversations.

## Substrate (built and committed BEFORE any scored seed)
1. Driver `scripts/journey-establishment-r109-20261107.js` — r108 driver
   clone (same competent policy base, same 42-iteration horizon, same
   census, same telemetry dump, same five duty-use wraps, same lean trace,
   same ever-substrate capture, HUNTSTAFF=2 prep arm). ONLY driver changes:
   run tag / seed file names / EVID default (evidence/2026-11-07), and the
   PEOPLE CHECK changes:
   - 4 held convos per seed (first four living non-player villagers in
     roster order) instead of 2 — more stall samples (16 convos/panel).
   - Driver hygiene (r108 metric review): betrayal:* choices are NEVER
     picked while sampling (an accept/decline verdict is not a sampling
     pick); confront:* is last-resort (only when no other substantive
     choice remains) — the driver stops hammering confrontations.
   - Stall capture: each convo records `stall` (true when the loop ends
     with no pick while the conversation is still open) AND the full
     offered menu ids at the stall turn, so the fix is designed from
     observed menus, not assumed ones.
2. Analyzer `scripts/analyze-journey-establishment-r109-20261107.py` —
   r108 analyzer clone, re-pointed at r109 files, SEEDS = 1502, 1504,
   1603, 1604, plus: stall counts per seed (before vs after), convo
   quality read (full transcripts), and the Q2 prepLog split table.
3. Proof test `scripts/test-journey-establishment-r109-thinbeat.js` —
   thin-beat fix: a seeded-harness conversation driven to the exhausted
   state (the Ursula shape: resolved-favor opening, no want, all topics
   asked) → assert the menu offers a pivot or the wind-down queues (never
   a repeats+leave-only menu while open); assert the closing still lands;
   run on ≥3 seeds. Written BEFORE the fix (fails on the pre-fix engine),
   green after.

## Run order (binding — before/after on identical seeds, MEASUREMENT §1)
1. Substrate commits (prereg + driver + analyzer + proof test skeleton).
2. BEFORE-panel: the r109 driver on the pre-fix engine, 4 seeds × 42d.
   This panel IS the baseline; if it shows 0 stalls the defect did not
   reproduce on the matched panel and the run stops here (§14a:
   SUBSTRATE-MISSING — return with a corrected prereg, no fix).
3. The fixes (Q1 src/js/conversation.js + Q2 scripts/policies/huntstaff.js
   split), with both proof tests completed, in the worktree, uncommitted.
   The Q1 proof test is written before the Q1 fix (fails on the pre-fix
   engine); the Q2 proof test extends the r108 P1/P2/P2b checks the same
   way.
4. AFTER-panel: the SAME driver on the SAME 4 seeds, post-fix engine.
5. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — THIN-BEAT STALL (mechanism)
- Instrument: matched before/after panel (same driver, same 4 seeds,
  pre-fix vs post-fix engine). Stall = a held convo whose loop ends with
  no pick while the conversation is still open (menu offered only
  leave/bye/already-visited navigation).
- Bar (binding): GO if after-panel stalls = 0 AND before-panel stalls ≥ 1
  (defect reproduced pre-fix on the matched panel) AND the proof test is
  green on ≥3 seeds. NO-GO if stalls persist post-fix. If the
  before-panel shows 0 stalls: SUBSTRATE-MISSING, no fix, corrected
  prereg for the next run.
- Guardrails (binding, §14): M3 survival-42 (≥3/4 seeds alive at 42) and
  M4 pantry-guardrail (starvationDeaths 0 on ≥3/4 seeds) must hold on the
  after-panel; a GO met with a guardrail breached is NO-GO. Bars reused
  from r108. The before-panel is the investigation reference if a
  guardrail breaches (shared-RNG divergence vs the fix).

## Q2 SECONDARY — prepLog 'no-teacher' split (r108 metric-review instrument item)
- The prepLog's 'no-teacher' conflates three gates: no holder anywhere in
  the village / holder exists but away / holder not yet seeded (the skill
  is latent — a granting occupation is on the roster but nobody holds it
  yet). On 1504 vs 1603 the fix is different (recruit/teach a holder vs
  wait for one), so the instrument must tell them apart.
- Change: `scripts/policies/huntstaff.js` `prepFieldDressing` — when no
  at-home holder is found, classify with PURE reads only (no new state
  writes, so the det-gates still hold):
  - holder exists anywhere (living roster, `npcHasAbility` — a pure read
    of the skill/ability stores) but none at home → 'teacher-away'.
  - else a living roster member holds a field_dressing-granting
    occupation (Veterinarian / Mortician / Butcher — read from
    `Game.data.characterGen.occupations[].granted`, never hardcoded) →
    'teacher-unseeded'.
  - else → 'no-teacher-anywhere'.
  `kind` stays 'no-teacher' (analyzer backward compat); only `why`
  splits. The r108 proof test (`test-journey-establishment-r108-
  huntprep.js`) is updated in place: its two 'no-teacher' why assertions
  become the split values, plus three split fixture checks (away /
  unseeded / anywhere) — the instrument test stays one file. Its P2/P2b
  det-gates (gate-off == control, prep-off == ref-arm) re-run to prove
  the split changes no behavior. The r109 DRIVER's neutrality vs the
  r108 driver is proven by a det-gate inside the thinbeat proof test
  (r109 gate-off vs r108 gate-off, 5d seed 1502, on endDay / aliveEnd /
  guardrails.pantryKcal / lessons) and by the before-panel itself.
- Bar (binding): GO if every no-teacher row in the after-panel carries
  one of the three split values, with ≥1 row in at least two of the three
  classes across the panel (the split fires and discriminates), AND the
  extended r108 proof checks stay green. NO-GO if any row remains
  unclassified or a proof check regresses. 'teacher-away' may not occur
  on these 4 seeds — that is unexercised, not a failure; the bar is two
  of three classes.
- Scope guard: if the thin-beat work (Q1) runs long, Q2 drops to
  "documented, not built" — its design above is recorded for the next
  run, and the run note says so plainly. Q1 is the run; Q2 is the bonus.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 (r107/r108's four firing seeds —
deliberate matched reuse, not fresh). No new band: matched reuse IS the
design (before/after on identical seeds, MEASUREMENT §1). The freshness
rule applies to NEW bands; no new band is claimed here.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108's latest
behavior; the dialogue question is orthogonal to the hunt arm). The play
loop is byte-identical to r108's driver (only the people check + prepLog
why strings change), so the before-panel's funnel numbers should
reproduce r108's prep-arm numbers on the same seeds modulo base movement
(r108 ran on 12cac2ec7; this run's base is b690777cc — the commits since
are Loop B evidence/instrument + the measurement proof refresh; no src/js
behavior change is expected, and the before-panel itself is the control).

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master b690777cc at run start (verified by `git pull`, already up to
date). Worktree `journey-establishment`, branch `journey-establishment`.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
after-panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation.

## Metric review (carried from r108; for the NEXT run, not this one)
- M1 ladder: separate "teacher at home" from "teacher able to teach"
  (shared language) — Q2's split addresses the no-teacher side; the
  'words' side stays as-is (the lesson fails honestly on language).
- Same-animal held/notheld kcal ratio is the better frac instrument —
  descriptive only this run.
- Holder-since dating hole (Ursula gains field_dressing with no datable
  row) — not addressed this run; holdings snapshots per dawn remain a
  future instrument.
- Driver hygiene — addressed in this run's driver (betrayal never picked;
  confront last-resort).
- Ursula thin beat — Q1 of this run.
- "veteran kill" hype line fires for non-wave-4 kills (third sighting,
  Loop B arena/gauntlet) + accept lines repeat verbatim — narration pool
  work, NOT this run's scope (Loop B's arena/gauntlet axis owns it).
