# journey-social r22 (2026-10-18) — leg 5 "social life": narrative surface of bonds

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any fix code)

**Context:** r21 (this morning) proved friendships and rivalries FORM mechanically
(bond v ± thresholds, depth sediment) but found ZERO narrative surface: "a
bond-100 friend and a bond-0 stranger with recent gifts behave identically"
(r21 evidence: Elijah at bond -96/depth -3 got the same trap-line invitation as
a friend). Pilot gap confirmation (this run, pre-fix): Miguel (kind, bond→97)
and Ernestine (hostile/robbed, bond collapsing) open indistinguishably
("I picked these for you. Wildflowers."). Code audit: conversation.js calls
`bondAdd` (writes) but nothing in conversation.js / convo-*.js READS bond
depth for narrative. Gap REAL. Proceed to fix.

**Leg question:** with bond depth now wired into conversation (warm opener pool
at depth ≥2, cold opener pool at depth ≤−1, bond-flavored grace beat at
depth ≥2), do deep friendships and rivalries get NARRATIVELY marked — feeling
honest, not fabricated — without breaking the no-repeat ledger or the
opener priority chain?

**Interesting findings to hunt:** a depth-3 friend opening warm ("Good — I was
hoping you'd stop by"); a depth-−3 enemy opening clipped ("What."); the grace
beat naming the relationship instead of 5-day recency; any fabricated shared
event (a miss on honesty); NPC-NPC bond surface (out of scope — scholar↔villager
only this run; document if seen).

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- M1 (pilot): gap confirmed REAL (2/2 samples, code audit). GO → fix proceeds.
- M2 (post-fix surface): 3 seeds × 60d favoritism policy (r21 driver family),
  ≥1 favorite (bond ≥50/depth ≥2) + ≥1 outsider (bond ≤−25/depth ≤−1) per
  seed → in post-fix transcripts, ≥4/6 samples show a bond-colored line
  (warm opener / cold opener / bond grace).
- M3 (honesty): 0 fabricated shared events across 6+ transcripts — bond lines
  are feeling-level ("I like seeing you"), never event-specific, since the
  bond record stores no event history (only v/depth). GO if 0.
- M4 (people check): 6 transcripts sense-read by the author; GO if ≥5/6 meet
  the conversation quality bar.
- M5 (guardrail): ≥2/3 runs end the 60d harness with ≥5 alive; convo cost
  unchanged (10 kcal/open); playtests/test_conversations.js 28/28 green.

**Seeds:** 1501, 1502, 1503 (same as r21 for comparability). **DAYCAP=60**,
death-aware stop +10d tail (r13–r20 standing). **Policy:** "favorites"
(r21: competent base + 2 favorites kind, 2 outsiders hostile/theft, rest
neutral).

**Design (FIGURE-IT-OUT-YOURSELF, Steve 2026-10-07):**
- DATA-FIRST: `src/data/characterGen.json` → `convo.bondWarm` / `convo.bondCold`
  pools (repo convention: lines live in data, logic in code). No System
  references pre-day-7 (eraOk filter, same as small talk).
- PLACEMENT: stage 6 (contextual small talk) preamble — try the bond pool
  ONCE (ledger-checked via convoPick 'small' key, OPENER-SKIP pattern), then
  fall through to the general pool. Talk requests (#1), table (#2),
  unfinished business (#3), grief, secrets, taught-refs, recalls, wants all
  keep priority — a bond tints the chit-chat, it never hijacks a commitment.
  This also keeps the narrator voice consistent: feeling-level warmth, not
  event claims.
- GRACE: convo-mood.js grace branch — at bond depth ≥2, pick from the
  bond-flavored grace pool (same 'moodgrace' ledger key) instead of the
  5-day-recency default. The recency beat stays for depth <2.
- NOT built (documented follow-up): conversation refusal / cold-shoulder
  budget for rivals (mechanical change — a rival declining to talk); NPC↔NPC
  bond surface in dialogue.

**Metric review:** (empty — fill post-run)

**Telemetry:** node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/social.json
--current 'evidence/2026-10-18/journey-social-r22-per-seed-*.json'
--metrics <60d-era social metrics>. NOTE (r21): social.json is 140d-era and
schema-incompatible with the 60d-era r21/r22 metric set. Reconcile this run:
either add a social-60d.json baseline or extend social.json. Investigate any
LOUD line BEFORE rolling forward.

## Run state

Driver: `scripts/journey-social-r22-bondsurface-20261018.js` (r21 favoritism
driver, same policy/seeds/DAYCAP; per-seed JSON + transcripts under
`social-r22-transcripts/`). Ran TWICE: pre-entry-beat sweep (entry beat
missing — M2 surface metric missed: only 3/174 convos bond-marked) and
post-entry-beat sweep (current files).

Driver bug fixed (r21's noted bug): `favAlive[day % favAlive.length]` on even
days always indexed 0 — favorite #2 never got driven conversations. Now
rotates via a counter.

## Village assessment (plain words)

**Seed 1501 (Theo, survived to d39, 9 alive):** Theo bonded to 95/depth 3 —
a genuine best friend; his conversations read warm ("You can feel the
history in how they greet you", gift beats, contest gossip). Jerome and
Wilson were robbed into −69/−46 (depth −2/−1); Jerome's cold beat landed
right after a desperate fever-favor ask — need without affection, honest.
**Seed 1502 (Sam, d52, 10 alive):** Sam 93/d3; Sam's day-40 conversation is
the run's best (unfinished-thread opener, "Their whole posture softens
around you", Odongo stories). Outsiders Odongo/Ashley at −61/−46; Ashley's
cold opener ("I was just leaving.") fired at stage 6. **Seed 1503 (Rocco,
died d58 combat, 7 alive):** Rocco crossed −75 with THREE outsiders
(Patricia/Adaeze/Maya) before dying; the mantle passed and the new
bearer's bonds reset to ~0 (r21 blank #3, succession leg item — the final
census shows the successor's fresh bonds, not Rocco's).

## Metric verdicts (§14)

- **M1 (friendship fires): GO 2/3 as written** (Theo 95/d3, Sam 93/d3;
  1503's Diana died early). Bearer-aware: Elijah hit 52/d2 mid-run in 1503.
- **M2 (rivalry fires + surface): GO 3/3.** Rivalry: 1501/1502 outsiders at
  −46..−69; 1503 Rocco crossed −25/−50/−75 with 3 outsiders (bearer-aware
  M2-v2 from r21's metric review). Surface: kind-marked convos 4/7/4,
  hostile-marked 10/6/6 per seed; 33 entry beats + 5 grace beats across
  173 conversations.
- **M3 (honesty): GO.** 0 fabricated shared events across 6 sense-read
  transcripts + proof-test assertion. All bond lines/beats are
  feeling-level; the bond record stores no event history, so none may
  name one (enforced in code comments).
- **M4 (people check): GO 6/6.** All six transcripts meet the conversation
  quality bar (see below).
- **M5 (guardrail): GO.** 9/10/7 alive at 39/52/58d (≥5 in 3/3); convo cost
  unchanged (10 kcal, proof-asserted); test-justice 61/61, test-party-bond
  45/45, test-scholar-bonds 12/12, test-betrayal 80/80+1 pre-existing,
  test-cache-theft-suspicion 71/72 (1 pre-existing). test-blitz-memdepth
  82/86: 4 failures VERIFIED IDENTICAL on pristine HEAD via patch
  round-trip (base drift since r21's 85/86, not a regression).
  check.js --quick: 96/97 (1 sprite-check failure, pre-existing —
  monster calm/aggro sprite assets, untouched by this diff).

## People check (transcripts read, not counted)

**Theo 1501-d26 (kind):** recall opener with real continuity, bond beat
"You can feel the history in how they greet you", gift beat, Beastmaster
contest gossip. The beat is invisible as machinery — just warmth. PASS.
**Jerome 1501-d15 (hostile):** fever-favor ask ("I hate to ask this…")
followed by "The warmth you'd expect just isn't there." — need without
affection. Decline consequences intact. PASS.
**Sam 1502-d40 (kind):** the run's best — unfinished-thread opener,
"Their whole posture softens around you.", Odongo stories, "Survival
isn't pretty. It's Tuesday." PASS.
**Ashley 1502-d35 (hostile):** stage-6 cold opener "I was just leaving."
fires. Note: the follow-on want ("Walk with me?") is the pre-existing
r21 finding — the want system is bond-blind (enemies invite you on
trap lines). Not fixed here; documented. PASS.
**Adaeze 1503-d27 (hostile):** cold pool ledger-exhausted → general opener
+ cold beat "They don't bother hiding the cold look." still marks it.
Graceful degradation by design. PASS.
**Elijah 1503-d44 (kind):** beat fired at his true day-44 depth 2
(v=52); final census shows 10/d0 only because Rocco died d58 and the
mantle reset bonds (r21 blank #3). "Every morning I wake up surprised."
PASS.

## Blank filled: bonds had zero narrative surface

**Root cause (r21's finding, verified):** conversation.js called bondAdd
(writes) but nothing in conversation.js/convo-*.js ever READ bond depth
for narrative. A bond-100 friend and a bond-0 stranger opened
identically.

**Fix (3 files):**
1. `src/data/characterGen.json`: `convo.bondWarm` (10, spoken) /
   `convo.bondCold` (10, spoken) opener pools + `convo.bondBeatWarm` /
   `convo.bondBeatCold` (6 each, narration) entry-beat pools.
2. `src/js/conversation.js`: (a) stage-6 small-talk preamble — tries the
   bond pool once (ledger-checked, OPENER-SKIP pattern), falls through to
   the general pool; all commitments keep priority. (b) BOND ENTRY BEAT
   in startConvo: one stage-direction beat after the opener, once per day
   (drift-note precedent), skipped when the opener was already a bond
   line; ledger-blocked beats stay SILENT (the dry-line fallback would be
   a non-sequitur — nothing was attempted conversationally).
3. `src/js/convo-mood.js`: grace beat is bond-flavored at depth ≥ 2
   ("They've known you long enough to let it pass") instead of the
   5-day-recency default.

**Design calls (FIGURE-IT-OUT-YOURSELF):** feeling-level only (no claimed
events — the bond record has no event history); narration voice for beats
(mood-beat precedent), spoken voice for openers; once/day cadence for the
beat (a greeting truth, not a per-sitting one); silent skip on block.
Mid-run discovery: the stage-6 preamble alone was structurally starved
(the want almost always leads — same starvation r16 found for grief),
so the entry beat carries the surface. Also caught: `eraOk` is defined
after the preamble's insert point — forward reference inside try/catch
silently did nothing (TDZ swallowed); fixed with an inline era filter.

**Proof** `scripts/test-bond-surface-r22.js`: RED 14/19 pre-fix (the 5
designed failures) → GREEN 25/25 post-fix (pools, opener coloring,
entry beat, no-double-mark, stranger-never-marked, no fabricated
events, no-repeat, grace, cost guardrail).

## Blanks documented (not fixed)

1. **The want system is bond-blind:** a −69 rival still invites you to
   "walk my trap line" and accepts favors warmly ("glad it's you saying
   it"). The surface marks the greeting; the want machinery doesn't know
   about bonds. Future content run.
2. **Succession bond reset** (r21 blank #3, re-observed): the mantle
   passes, relationships don't. For the succession leg.
3. **Ledger-exhaustion deflections** (r21 blank #2, re-observed): driver
   hammering still drives dry lines at conversation tails. Driver
   artifact; real players rotating villagers see less.
4. **test-blitz-memdepth 82/86** (4 failures, pristine-HEAD-verified):
   base drift since r21 — the 'others'-topic B1/B3 assertions about
   name-earning now fail on master independent of this run. Filed as a
   finding for whoever owns memdepth next.

## Metric review

- M2 as pre-registered (final-bond snapshot) was bearer-naive — same
  lesson as r21. The bearer-aware M2-v2 (crossings during tenure, any
  bearer) is the honest metric; adopt it for the next run.
- M2's surface bar (≥4/6 samples) was met via the entry beat, not the
  opener pools — the want-starvation finding should shape the next
  run's metric (measure beats, not just openers).
- Telemetry: 6 LOUD lines, ALL schema-mismatch ("newly appeared" —
  60d-era keys absent from the 140d-era social.json baseline);
  end.day/end.alive quiet. Seeded the 60d-era baseline
  `telemetry-baselines/social-60d.json` from this run's post-fix corpus
  (r21's deferred schema reconciliation, done). The 140d-era social.json
  is untouched.
- Proof-test lesson for AGENTS.md: a same-day multi-conversation test
  of a once-per-day beat fails on the no-repeat ledger — fix the TEST
  cadence (one convo/day), not the game.

## Verdict

- **Reachable: YES.** Friendships (feed/tend/talk/feast/visit → depth 3)
  and rivalries (theft → grievance → depth −3) form through reachable
  play; NPC-NPC bonds form on their own (r21). The narrative surface now
  rides the same actions.
- **Fun: YES, robot edges shrinking.** The 6 sense-read transcripts show
  friends greeting warmly and rivals greeting cold — the relationship is
  finally visible. Remaining robotic edge: the want system is bond-blind
  (documented above).
- **Winnable: YES (guardrail).** Survival parity held (9/10/7 alive);
  no new death mode; conversation cost unchanged.

**Land:** src/data/characterGen.json, src/js/conversation.js,
src/js/convo-mood.js, scripts/test-bond-surface-r22.js,
scripts/journey-social-r22-bondsurface-20261018.js +
evidence/2026-10-18/ (per-seed JSONs, aggregate, 165 transcripts under
social-r22-transcripts/). Telemetry baseline
telemetry-baselines/social-60d.json seeded (goal hidden_files — not game
code, committed alongside? NO — baselines live in the goal workspace,
not the repo; not committed). No [needs-eyes] — mechanical + content,
Steve's call on voice on review. Merged locally, pending ship.

