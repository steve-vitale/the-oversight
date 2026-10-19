# sim-pithear-b — the pit_overhear dead letter (2026-10-19)

Loop-B food-economy CONTENT/VOICE arm, run fleshout-loop-b-20261019T0317Z.
Answers the sim-npctrap-b census named-next #2 (evidence/2026-10-19/sim-npctrap-b.md):
pit_overhear fired 0/16 — it needs a villager apprenticeship (fired 1/16,
need-gated) AND the scholar at haven at the chore-lesson return. The pit_teach
beat covers the same ground (6/16). Content question, not a bug: give the
apprentice chore-lesson an at-haven hook, or document the beat as vestigial.

## Canon read (BEFORE sims)

- docs/CANON.md: "If you don't know, it doesn't show"; human skills ≠ alien
  abilities (knowsPit is a human skill — the recount grants a *recipe* level,
  never a System slot); no silent actions (the recount is a said line, never
  a quiet grant); word of mouth is the canon pre-codex channel
  (docs/CANON.md change log; game.js:16205 "word of mouth is SLOW (Steve
  2026-10-05)").
- No hunting/traps canon doc exists (docs/ has no HUNTING.md or TRAPS.md —
  verified again 2026-10-19 by the census). The #556 bear-stalk canon
  steve-call is OUT OF SCOPE for this arm (untouched).
- The recount is canon-honest: it is word of mouth (villager → scholar at the
  fire), the same channel the pit apprenticeship itself uses. It does not
  invent a new knowledge source.

## The beat, sense-tested (BEFORE the hook — SENSE-TESTING LAW)

Three existing pit-lesson beats, read in full:

1. **teachChoreLine (pit)** — 📖 narrator voice, said at the lesson when the
   scholar is home: "📖 ${tnm} is showing ${lnm} the pit trap — the depth,
   the sharpened stakes at the bottom, where the game trail runs. 'Brush it
   over with leaves. And mark it well — your own pit will take you too.'"
   Sensical: names teacher and learner, describes the craft, the quoted
   warning has a voice. Good.
2. **pit_teach** (witnessed trapper return, trust 15+, once per teacher):
   "🪤 ${nm} catches you watching the pit line. '...Want to actually SEE
   one?' They walk you out to it — the depth, the sharpened stakes at the
   bottom, where the game trail runs. 'Brush it over with leaves. And mark
   it well — your own pit will take you too.' Your hands don't know it yet.
   Your eyes do." Sensical and distinct: invitational, direct address, the
   teacher's voice in quotes, closes on the hands/eyes couplet. Good.
3. **pit_overhear** (watched lesson — the dead letter): "🪤 You watch ${nm}
   walk someone through the pit trap — the depth, the sharpened stakes at the
   bottom, where the game trail runs. 'Brush it over with leaves. And mark it
   well — your own pit will take you too.' Your hands don't know it yet. Your
   eyes do."

Sense verdict on (3): as a *watched* beat it is a near-duplicate of (2) —
same quoted warning, same closing couplet — and worse, it fires on the SAME
tick immediately AFTER the teachChoreLine (1), which already narrated the
same lesson with the learner named. "📖 X is showing Y the pit trap — the
depth..." followed by "🪤 You watch X walk someone through the pit trap — the
depth..." reads as the same beat twice. The overhear's only non-redundant
content is the grant. This duplication is an out-of-arm-adjacent finding for
the backlog (the watched path is left as-is by this arm — minimal-change
rule; see findings).

The hook design answers the duplication directly: the recount fires LATER
(at the scholar's homecoming, never on the lesson tick) in a DIFFERENT voice
(the apprentice's excited parroting, not the 📖 narrator), so it can never
double-fire with the teachChoreLine. Its closing inverts the original
couplet honestly: "Your eyes never saw it. Your ears did."

## The hook (additive, conversation-beats only)

- **Marking** (src/js/villager-objectives.js, teach-chore block): when a
  landed pit apprenticeship finds the scholar AWAY from haven, the lesson is
  recorded on `scholar.missedPitLesson` {teacher, learner, day, need}.
  Gates are re-checked at the retelling, not here. One slot; the latest
  lesson wins.
- **Retelling** (src/js/villager-objectives.js: `pitLessonRecount()`,
  consumed by `Game.returnToVillage()` in the homecoming block, right after
  away-news, inside the non-estranged branch — exiles don't get the village's
  word of mouth): the apprentice catches the scholar by the fire and parrots
  what they were shown → pit_trap L1 via 'recounted', tele `pit_overhear`
  with `via:'recount'`. Same regard gate as the watched beat (trust 15+),
  only while scholar L0, only with the channel on. Never L2. If the
  apprentice died before the homecoming, the teacher tells it; if both are
  gone, the lesson dies with them (never granted unheard). Consumed once —
  no double-fire on later returns.
- The watched path is untouched.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- PRIMARY (binding): pit_overhear tele fires per side, armed vs control on
  identical seeds. GO: ≥ 4/16 armed vs 0/16 control (firing split watched /
  recounted in the instrument).
- HORIZON: 180d death-aware (dead villages stop; runDays endReason recorded).
- SEEDS: 9551–9558 (the brief named 6631–6638, but those were consumed by
  sim-spiralgate-b 2026-10-17 — verified by grep; 9551–9558 verified zero
  genuine hits in evidence/ + scripts/ before sims) × {leadfeast, belongfeast}
  = 16 pairs pilot. PILOT GATE: these 16 pairs before ANY confirm spend.
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 (explicit pre-seat), PITKNOWLEDGE
  unset (channel ON both sides) — same as the npctrap census. Env asserted up
  front in the sweep; tree/side contract asserted (hook present iff armed).
- GUARDRAILS: no new death mode (death-bucket corpus compared); median
  survival ≥ control−10d; every fired recount line sense-read from the
  transcript.
- INSTRUMENT: scripts/sweep-pithear-b.js (pit_lesson / missedPitLesson
  markings / pit_overhear by via / pit_teach / pit_trap grants by type /
  wall numbers / deaths). Proof: scripts/test-pithear-b.js (29 checks on the
  real code paths — marking via objTick, recount via returnToVillage, all
  gates, watched path intact).
- §15: before/after through the balanced panel (scripts/balance-panel.js),
  same seeds/policies/days; compare .md attached. The panel is the instrument,
  the pre-registered threshold is the judge.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Proof test

`node scripts/test-pithear-b.js` → ALL GREEN (29/29), run 2026-10-19 on the
armed tree before the pilot:

- Marking via the real objTick indoor-chore block (staged knowsPit teacher,
  hungry learner, scholar away): missedPitLesson marked with teacher+learner;
  apprenticeship recorded (topic pit).
- Recount via the real Game.returnToVillage(): pit_overhear tele with
  via:'recount'; pit_trap L1 granted via 'recounted'; the 🪤 line said in the
  apprentice's voice ("You missed it...", "Your eyes never saw it. Your ears
  did."); missedPitLesson consumed; no double-fire on the next return.
- Gates: trust<15 → no grant; scholar already L1 → no grant; channel off →
  no grant; learner dead → teacher tells it (line voiced by teacher); both
  dead → nothing granted.
- Watched path intact: pitLessonOverhear(teacher, true) still fires the
  watched beat (tele without via, grant 'witnessed'), sets no missedPitLesson.

## Proof test

`node scripts/test-pithear-b.js` → ALL GREEN (29/29), run 2026-10-19 on the
armed tree before the pilot (the script tested the now-reverted hook and is
not landed; its results are recorded here):

- Marking via the real objTick indoor-chore block (staged knowsPit teacher,
  hungry learner, scholar away): missedPitLesson marked with teacher+learner;
  apprenticeship recorded (topic pit).
- Recount via the real Game.returnToVillage(): pit_overhear tele with
  via:'recount'; pit_trap L1 granted via 'recounted'; the 🪤 line said in the
  apprentice's voice ("You missed it...", "Your eyes never saw it. Your ears
  did."); missedPitLesson consumed; no double-fire on the next return.
- Gates: trust<15 → no grant; scholar already L1 → no grant; channel off →
  no grant; learner dead → teacher tells it (line voiced by teacher); both
  dead → nothing granted.
- Watched path intact: pitLessonOverhear(teacher, true) still fires the
  watched beat (tele without via, grant 'witnessed'), sets no missedPitLesson.
- RNG audit: the hook consumes ZERO Math.random calls (firstRef,
  displayName, grantKnowledge verified RNG-free) — armed and control
  trajectories on identical seeds are bit-identical unless the hook fires.

## Sweep result — 16 pairs pilot (9551–9558 × {leadfeast, belongfeast})

Per-seed JSONs: `evidence/2026-10-19/perseed-pithear-b/`. Env asserted
(FEASTSCALE_R13=1, SEATDRIVE=0, PITKNOWLEDGE unset); tree/side contract
asserted in the sweep (hook present iff armed).

INFRASTRUCTURE NOTE: a service restart mid-run wiped /tmp (killing the first
armed sweep at 1/16 and the first after-panel at 1 case, and destroying their
logs). Per-seed JSONs live in the repo and survived; both jobs were re-run
to completion with logs in ~/workspace/pithear-b-scratch/ (outside /tmp).

| side | lessons | markings | overhears (w/r) | teaches | grants | median days |
|---|---|---|---|---|---|---|
| control | 0 | 0 | 0 (0/0) | 1 | taught:1, witnessed:3 | 133 |
| armed | 0 | 0 | 0 (0/0) | 1 | taught:1, witnessed:3 | 133 |

Wall (both sides identical): wins 0/16, national 9/16, table 13/16,
wave-4 11/16, wave-5 0/16.

Per-seed verification: all 16 armed/control pairs are BYTE-IDENTICAL except
the side label (full-JSON diff, 0/16 pairs differ) — the hook never fired, so
no trajectory diverged; death buckets, grants, wall numbers all identical.

**PRIMARY (binding, ≥4/16 armed overhears vs 0/16 control): 0/16 — MISSED.**
Per §14 the miss stands as recorded, never re-scored.

Guardrails: no new death mode (death-bucket corpus byte-identical both
sides); median survival diff 0d (≥ control−10d ✓); the recount line was
sense-tested in the staged proof (voice, craft parroting, no false
"watching" claim) — but it never fired in live sims, so no live transcript
exists. Reported honestly: staged-proven, not live-proven.

## Balanced panel (§15)

- before: `evidence/2026-10-19/panel-pithear-before/panel.json.gz` (control
  tree, 16 cases, exit 0)
- after: `evidence/2026-10-19/panel-pithear-after/panel.json.gz` (armed tree,
  16 cases + 1 cache reuse, exit 0)
- compare: `evidence/2026-10-19/pithear-compare.md` (+ .json)

Decision: **review_required** — solely from `usefulIntake` ("Nourishment /
physical food consumed") being `not_observed` on BOTH sides (instrument
coverage gap, not a behavioral difference). Every observed metric is
bit-identical before/after (all paired deltas 0, all no_material_signal):
wins 0/0, national 1.0/0.75, table 0.875/0.75, survival, deaths, NPC counts,
food/water/health samples — zero behavioral delta. The panel is the
instrument; the pre-registered threshold remains the judge.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json`
against the armed aggregate {national:9, table:13, won:0} → **quiet** (no
LOUD lines). Note: the check needs flat aggregate keys — per-seed JSONs nest
wall data, so the aggregate was built explicitly (same key shape as the
baseline); a direct glob run fires spurious LOUDs on the key mismatch (same
class as the census's wins/won mismatch).

## Metric review (mandatory)

- PRIMARY (binding, ≥4/16 armed overhears): MISSED 0/16. The miss is a
  **metric-design miss**, and the design error is instructive: the bar
  conflated two independent rates — the *apprenticeship rate* (pit_lesson
  teles: 0/16 here, 1/16 in the census — a mechanics-level, need-gated rarity:
  hungry-or-novice learner, trust 15+, 85%, once per learner) and the hook's
  *conversion rate* (apprenticeship-while-away → recount: 100% when the chain
  fires, proven 29/29 in the staged proof test). The hook controls only the
  second; the bar measured mostly the first. The pilot therefore measured the
  substrate's event rate, not the hook's efficacy — with 0 triggering events,
  the conversion question is 0/0 (undefined), answered only by the proof test.
- Proposed revision for the NEXT run (if a future arm touches the
  apprenticeship gate): bar the conversion rate directly — "of pit
  apprenticeships landing while the scholar is away, ≥75% produce a recount
  at the next homecoming" — on a substrate that generates ≥4 apprenticeships
  (or a staged harness, as the proof test does). Do not re-run this bar on
  the competent substrate; it will starve again.
- Scholar pit_trap acquisition (4/16 both sides: 1 taught + 3 witnessed) is
  unaffected — the hook added no grant path in practice.
- The recount line never fired live: its sense-test verdict rests on the
  staged proof, flagged as such. A future live firing should be transcript-
  read before the line is considered proven.

## Verdict: KILLED-AT-PILOT + vestigial-documented

The GO bar missed (0/16 vs ≥4/16) and §14 binds: NO-GO, never re-scored.
Per the arm's kill rule the layer is deleted zero-trace (game.js and
villager-objectives.js reverted to HEAD — the 64 added lines were exactly
the hook; verified by diff). Landed: the instrument
(scripts/sweep-pithear-b.js — tree/side-contracted, works on any tree),
the 32 per-seed JSONs, both panel.json.gz files, and the compare reports.

The deeper finding is the vestigial documentation the brief asked for as the
alternative: **the pit_overhear beat is a dead letter by mechanics, not by
accident.** Its trigger (a need-gated pit apprenticeship: 0/16 here, 1/16 in
the census) is canonically rare — "nobody studies [craft] on a full belly
for fun" is a design statement (trapline 2026-10-13, inherited by
pitknowledge), not a bug. No conversation-beat change can open the channel
without touching that gate, which is a mechanics redesign — out of scope for
a content arm. Additionally, the *watched* path duplicates the teachChoreLine
on the same tick (same lesson narrated twice — see the sense-test above).

**Recommendation (steve-call): doc-note, not deletion.** Keep the watched
pit_overhear code as a rare ambient (it fires ~0/16, costs nothing, harms
nothing); note it as vestigial-by-design in the findings backlog. Deleting
landed code that census instruments reference is a Steve-call. The recount
hook is proven, canon-honest, and zero-risk — if a future arm ever opens the
apprenticeship gate, the hook's design (marking + homecoming retelling, in
the apprentice's voice) is recorded here and in the proof-test results above,
ready to be re-implemented against the revised conversion metric.

## Village assessment (plain words)

The sixteen villages are the competent villages of the npctrap census, one
rung deeper in the ledger: trappers present, pits worked (the pit_teach beat
fired once, witnessed catches taught three scholars), but no villager ever
had both a hungry-or-novice learner and the moment to teach the pit while
anyone was listening. The knowledge moved the way it always moves in these
villages — a trapper showing the scholar directly (taught), or the scholar
watching a catch come off the line (witnessed). The apprentice-to-apprentice
chain the overhear was written for stayed theoretical: in 32 runs across two
censuses it happened once (Ethan → Thabo, d73, 9427-belongfeast), and the
scholar wasn't home. The blank this arm fills is the answer to the census's
content question: the overhear isn't broken, it's starved — and the watched
version, on the rare tick it could fire, would have repeated the lesson the
narrator just told. Documented, not forced.

## Wall numbers (report-only)

Armed = control (byte-identical pairs): national 9/16, table 13/16, wins
0/16, wave-4 11/16, wave-5 0/16, median survival 133d. TELEMETRY: quiet (see
above). Baseline NOT rolled.

## Convergence state

KILLED-AT-PILOT — food-economy axis stays **converging**. The census's
named-next #2 is answered: the pit_overhear channel is vestigial by
mechanics (0/32 across two censuses' triggering event); the recount hook is
proven but starved; no lever proposed, layer deleted.

## Named next / findings backlog

- (from the sense-test) The *watched* pit_overhear beat duplicates the
  teachChoreLine on the same tick (same lesson narrated twice: 📖 "X is
  showing Y the pit trap — the depth..." then 🪤 "You watch X walk someone
  through the pit trap — the depth..."). If the watched path is ever kept,
  it should fire INSTEAD of the chore line's pit variant, not after it —
  or be retired in favor of the recount. Out of this arm's minimal-change
  scope; noted for a future content pass. (steve-call adjacent: it touches
  player-facing dialogue duplication.)
- (metric) If a future arm opens the pit-apprenticeship gate (need-gating,
  teach-chore frequency), re-test the recount hook's *conversion rate*
  (proposed bar in metric review) — the hook design is recorded above and
  proven 29/29 in the staged proof.
