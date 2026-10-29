# Journey succession r70 — EXPANSION BAND + ANALYZER EAGER FIX (lane B, leg 7)

Base master 583d09c05. Rotation-b 7 → 4 (endgame next).
Instrument: r67 driver verbatim → r70 + r67 analyzer verbatim → r70 with
the 3 BACKSTABBER eager-accept cores added to YES (r67's metric-review
note, now built). Zero src/js changes. Pre-registration:
evidence/2026-10-29/journey-succession-r70-prereg.md. Expansion seeds
26133 (chain-forced, SECOND_KILL_DPLUS=20) and 26136 (control);
competent policy, POST_DAYS=45, EARLY_KILL_DAY=40. Zero src/js delta
since r67's merge, so the pilot-reproduction expectation held: r67's
picture survives intact on the two seeds that had never run under
SAYTRACE, and the r56 band (26131–26136) is now fully covered.

## Binding verdicts (§14)

- EXPAND-TRACE: SAME-CLASS. 1 sibling deflection on expansion seeds,
  1/1 joined, RUN-BLOCK: sayLine fellBack, preRun=true, preSelf=false,
  diegeticAct=false, structural=false, SAYLINE-INTERNAL pool draw at
  conversation.js:974 — the invite pre-fix shape exactly, now on a
  sixth seed. 0 SELF-BLOCK, 0 DLG-DIRECT, 0 UNJOINED.
- EXPAND-INVITE: GO — seam stays closed. 10 invite outcomes: 10 spoken,
  0 deflected, 0 other. The new YES table classifies one of them
  automatically (Teresa, 26136 d+3, eager-accept) — live proof of the
  analyzer fix on fresh corpora, not just the r67 recheck.
- EXPAND-CHAIN: GO — no wipe. 26133 carries a full second handoff
  (lin + mo + relPre2 + relPost2); second-successor bonds survived 9/9.
  First-successor phantom bonds at end on the forced seed: 8 — the same
  compounding pattern r67 reported (r64: 14, r67: 15 across two forced
  seeds), not a new class.
- ANALYZER-EAGER: GO. Recheck over r67's corpora moves EXACTLY 1 outcome
  (Carlos 26135 d+3) from OTHER → SPOKEN-accept: pooled 25/25 spoken,
  0 deflected, 0 other (was 24 spoken + 1 OTHER); sibling count
  unchanged at 5, trace join unchanged at 5/5. Proof test
  scripts/test-journey-succession-r70-eager-yes.js green.
- PEOPLE CHECK: GO — all 22 expansion transcripts read in full.
  0 fabrication flags. Three checked-not-flagged items below.

## The expansion deflection, in full

26133 d+3 Ornella (successor-life, convo day 12): the transcript OPENS
with the dry line — her French opener
«Hé... tu parles français ? Non ? ...merde.» was run-blocked because
the same line sat in the run ledger (spoken earlier in the window, not
in this convo). Two nuances for the Steve-call record:
(a) the ledger eats repeated OPENERS, not just closers/brush-offs —
neither Steve-call option as framed in r67 covers this cleanly:
widening the exemption to teach/favor would not touch a successor-life
opener, and per-villager variants would have to vary openers too;
(b) the dry line itself speaks English ("...Sorry, lost my train of
thought.") from a French-only villager — one beat where the
language-barrier frame breaks, then the convo recovers completely
(gesture exchange, she teaches the player a word, warm close). The loss
is one beat, never the thread — same as r67's five.

## Village assessment (plain words)

- 26133: Nicole died in the wild on day 9; Vivian took the mantle, then
  Hank on day 29 (scripted second handoff). Ends with 9 alive and a
  THIN pantry (7,615 kcal) — alive, not comfortable, unlike r67's four
  fat pantries. Office trust 32 → 51, village mean to 65.3. Successor
  class own-life (kept her own gear, plants, skills — not blank/reset).
- 26136: Carmen died on day 8; Ashley took the mantle and held it.
  Ends with 8 alive and 26,399 kcal. Office trust 22 → 90, village mean
  to 84.6, the strongest climb of this run. Norman starved on day 26 —
  the mid-window death the ledger records, and the grief for him is real
  (see below).
- First deaths were organic on 2/2 expansion seeds (days 9, 8) — the
  day-40 scripted mature kill staged on 0/2, the same aspiration r64
  and r67 found. The leg is carried by organic deaths, which is why the
  pilot still exercises real handoffs. Full r56 band now: 6/6 organic
  first deaths, 0 staged.

## People check (22/22 transcripts read)

NPCs want concrete things: a forage partner tomorrow at a named patch
(Norman: sweet manioc past the treeline, "another day like today and
we're choosing who eats"), fever help with an honest door-side gate
(Teresa d+3), a thinking place kept secret (Norman, Carl), a stockpile
gift (+4 wood, +4 fiber, Carl d+45). Teach turns that land teach real
items (Dandelion, Groundnut ×3, Murkcap). Endings resolve, plant, or
owe: a buried-truth confession (Teresa: "I'm not from Denver. I'm from
Columbus, Ohio" — the same trap texture as r67's Carlos), grief that
names the dead.
Checked, not flags:
- Thabo (26136 d+30): "Since Norman died..." — VERIFIED REAL: Norman
  starved day 26, before this day-38 convo. Grief by name, correctly timed.
- Hank (26133 d+14): "They took Somchai — Duel, on the screens" and
  Carl (d+45): "The Blood Tithe. They just... took Ornella. Came back
  like nothing happened." — event takings with returns, not deaths:
  both named villagers are alive and talking later in the same run
  (Somchai d+14, Ornella d+45). Stock event-language, not a fabrication.
- Teresa (26136 d+7): "Never mind the sickness I'm fighting — we got it
  handled" after begging for fever help at d+3 — the recovery-claim
  pattern r67 named for Imani, not a contradiction.
- Teresa d+3 is the run's second eager-accept backstabber (after r67's
  Carlos): she accepts "a little too quickly," then confesses the false
  origin at d+7. The trap texture holds across both runs.

## The Steve-call input, updated (no fix made here)

r67 framed the call as (a) extend the exemption to teach/favor vs
(b) vary the shared lines. r70 adds: the class is wider than teach/
favor — repeated openers (Ornella's French opener) deflect too, and the
dry line breaks the language frame for one beat when it does. Option
(a) as framed would not cover openers; option (b) would have to vary
openers as well as closers/brush-offs. The exemption question is still
Steve's; this run only widens the evidence. The analyzer gap from r67
is CLOSED (eager lines in YES, proven twice: recheck + fresh corpora).

## Drift vs r67 (same driver, new master, new seeds)

No matched-seed comparison is possible (new seeds); the comparison is
band-level: invite spoken 10/10 (r67 pilot 25/25 with the fix, 24/25
without), sibling deflections 1 on 2 seeds (r67: 5 on 4 seeds — the rate
moves with which villagers talk, the mechanism does not), chain bonds
9/9 (r67: 19/19). Inheritance class own-life on 2/2 (r67's headline
class held). 26133's thin pantry (7,615) is the first thin ending in
the succession series — a watch, not a verdict item: the village lived.

## Metric review (§14)

- TRACE-CLASS judged on joined turn shapes, not counts, as in r67.
  Join rate 1/1 on expansion seeds.
- The eager OTHER case is no longer hand-judged: the YES extension was
  pre-registered, proof-tested, and rechecked against r67's corpora
  BEFORE judging r70 (exactly-1-movement bar met).
- The day-40 scripted kill is again 0/2 staged; per r64/r67 metric
  review, future preregs should keep calling it "mature window" rather
  than "staged" — this prereg carried the r67 regime labels verbatim
  and the aspiration recurs unchanged.
- Opportunity-0 rule not triggered: 1 sibling deflection found, so the
  trace verdict is SAME-CLASS on evidence, not by absence.

## Telemetry deviation check (Steve 2026-10-13)

- Command: node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/succession.json --current
  'evidence/2026-10-29/journey-succession-r70-tele-*.json' --metrics
  deaths.bearer,census.alive,census.fallen,census.integrationStage,
  week2.deadBearerMentions
- LOUD lines (2), both EXPLAINED as seed-count shape artifacts,
  baseline NOT rolled — same stale-baseline class as r64/r67:
  1. "census.alive swung -65%: baseline 49 -> current 17 (n=2 files)"
     — the baseline is a multi-seed band sum; per-seed means are 49/5
     ≈ 9.8 (or /6 ≈ 8.2) vs current 8.5 — in line, not a die-off.
  2. "census.integrationStage swung -60%: baseline 15 -> current 6"
     — per-seed 15/5 = 3 vs current 3 — identical per seed.
  deaths.bearer is QUIET (5 vs 5). week2.deadBearerMentions sums higher
  in raw terms (8 vs 3) but the tool did not flag it, and no per-seed
  comparison is valid against this stale baseline — noted for the
  baseline owner, not judged as a deviation.
- The succession baseline stays stale against the r55+ instrument;
  re-seeding needs a regime note by its owner, not a silent roll.

## Regression

- node scripts/check.js --only succession
  --cacheDirectory=/tmp/jest-cache-playtest2: 11 passed, 0 failed in 49s
  (same succession set as r67).
- Proof test scripts/test-journey-succession-r70-eager-yes.js run
  directly, ALL PASS (3 eager accept, 4 standard accept, 4 decline,
  2 deflect, old-table OTHER confirmed).

## Files (this commit)

- scripts/journey-succession-r70-20261029.js (r67 driver verbatim)
- scripts/analyze-journey-succession-r70-20261029.js (r67 analyzer +
  YES eager cores)
- scripts/analyze-journey-succession-r70-eager-recheck-20261029.js
  (r67-corpus recheck, read-only)
- scripts/test-journey-succession-r70-eager-yes.js (proof)
- evidence/2026-10-29/journey-succession-r70-prereg.md
- evidence/2026-10-29/journey-succession-r70.md (this note)
- evidence/2026-10-29/journey-succession-r70-analyzer.txt
- evidence/2026-10-29/journey-succession-r70-eager-recheck.txt
- evidence/2026-10-29/journey-succession-r70-{26133,26136}.stdout.json
  + .stderr.log + -tele-*.json + 22 transcripts
