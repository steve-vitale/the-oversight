# sim-feastdisc-reconfirm-b — independent 16-seed re-confirm of sim-feastdisc-confirm

Run: fleshout-loop-b-20261023T1930Z (loop B, second axis — confirm duty per
claims protocol). Independent re-confirm of the sibling's most recent landed
lever sim-feastdisc-confirm (commit d8c122a0c on master; pre-registration read
in full from evidence/2026-10-22/sim-feastdisc-confirm.md before writing this
header).

Canon note (task-mandated): feastdiscipline is a POLICY layer (threat-driven
armed-feast staging, FEASTDISC=1). No docs/*.md canon doc covers it — stated
here rather than inventing canon. docs/CANON.md read first.

Policy layer: scripts/policies/feastdiscipline.js (FEASTDISC=1, zero src/js,
READ-ONLY for this re-confirm — NOT modified). Sweep reuses the proven
confirm sweep scripts/sweep-feastdisc-confirm-20261022.js with
SEEDS/EVID env overrides (same measurement path, fresh seeds).

## PRE-REGISTRATION (§14 binding — written BEFORE the reconfirm sweep)

- Design: 16 FRESH seeds (66301-66316; zero filename hits across
  evidence/ + scripts/ and zero script-content hits per the C1 gate,
  2026-10-23; note the task-nominated 66201-66216 FAILED C1 — used by
  evidence/2026-10-22/perseed-huntfix-adopt-b-pilot-{armed,ctl} and
  scripts/test-deathcause-b.js. Excludes also 66021-66028 pilot,
  66111-66122 confirm, 66109/66110 test-deathcensus-b.js, 66101-66108
  evidence/2026-10-18/perseed-w5preseat) x {leadfeast, belongfeast} x
  {control, feastdisc} = 64 paired configs, 180d death-aware (dead villages
  stop simulating; the harness breaks on Game.over), on the same non-seat
  long substrate as the confirm: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1
  (VETREL/REPOSITION/VGEAR unset).
- control = AD.armedFor(base), ARMORYDRIVE=1 (proven baseline).
- feastdisc = FD.disciplinedFor(AD.armedFor(base)), ARMORYDRIVE=1 +
  FEASTDISC=1 (threat-driven armed-feast staging OUTSIDE the armorydrive
  stack). Zero src/js, zero policy changes.
- PRIMARY (binding): damage-majority (>=50% of the kill's fight damage from
  non-scholar sources, KILLDISC-attributed) armed wave-4 villager kills vs
  control — GO = armed >= control+2 AND >=4/16 armed seeds with a
  damage-majority villager wave-4 kill (25% seed bar preserved from the
  12-seed confirm's >=3/12). A miss is NO-GO — never re-scored (§14).
  Metric doubts go under "metric review" for the next run.
- SECONDARY (non-binding, reported): kill-time villager wave-4 kills,
  feasted-engagement rate, staged-feast volume, wall numbers
  (national/table/wins, wave-4/5 unlocks, median survival).
- GUARDRAILS (all binding): median survival >= control-10d (per-seed
  matched); no new death mode (>=2-event rule); starvation deaths <=
  control+3.
- KILL-FAST: if the layer stages zero feasts on the armed arm (mechanism
  never fires) — close as evidence, do not advance.
- Instruments: KILLDISC=1 v2 (read-only per-source tbDamage attribution on
  wave-3+ monsters + startCombat engagement census) + daily bearer
  <redacted> (kill-time attribution — the scholar is a role, not a
  person) + feast-staging census (read-only hostFeast / grantFeastBuff
  wraps) + feastdiscipline layer counters (FD.tele).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15 — env-gated levers make the automated compare invalid by
  construction (per sim-findings.md); both panels built, §15 status noted,
  manual paired-row comparison attached (the judging instrument).

## Proof gates (run BEFORE the sweep — scripts/test-feastdisc-reconfirm-20261023.js)

- C1 seed-freshness: all 16 seeds absent from evidence/ + scripts/
  FILENAMES and script CONTENT (filename criterion, digit-boundary —
  no substring-grep). Skip-set: the test itself.
- C2 sweep determinism: one fresh seed x {leadfeast} x
  {control, feastdisc}, 60d, same seed twice -> byte-identical sweep JSONs
  (spawns the REUSED confirm sweep to a /tmp evidence dir — also
  re-validates the reused sweep on the current substrate).
- C3 attribution units: kill-time + damage-majority attribution on
  synthetic waveKillLog/KILLDISC rows — RED->GREEN.
- C4 metric-computation sanity: paired-row diff aggregation on synthetic
  rows (median, guardrail checks, 16-seed GO arithmetic) — RED->GREEN.

RESULT: **ALL GREEN** (14 PASS, 0 FAIL), 2026-10-23, on current master
tip f22db66f5. Note: the task-nominated seed block 66201-66216 FAILED C1
(those seeds were used by the huntfix-adopt-b pilot corpus and
scripts/test-deathcause-b.js — the task's freshness assumption was
wrong); the gate did its job and the clean block 66301-66316 was chosen
and verified by /tmp/find-clean-block.js. Also fixed a C4 synthetic bug
in the gate itself (armedSeeds count mismatched the GO-arithmetic
assertion) before green. The sweep ran AFTER these gates.

## Reconfirm results (64 configs, 180d death-aware)

Control = AD.armedFor, armed = FD.disciplinedFor, both ARMORYDRIVE=1.
Per-seed corpus: evidence/2026-10-23/perseed-feastdisc-reconfirm-b/ (64 JSONs).
Analyzer: scripts/analyze-feastdisc-reconfirm-b.js (seed-agnostic).

### Primary (damage-majority villager wave-4 kills — binding): NO-GO

- Control: 4 damage-majority kills on 4/16 seeds:
  - s66303/leadfeast: Rosa d80 The Eulogy, share 0.55
  - s66304/leadfeast: Esmeralda d92 The Congregation, share 0.58
  - s66314/leadfeast: Desmond d95 The Suburb, share 0.50
  - s66313/belongfeast: Carmela d86 The Eulogy 0.57 + d93 The Influencer 0.56
- Armed: 4 damage-majority kills on 4/16 seeds:
  - s66301/belongfeast: Lindiwe d117 The Congregation, share 0.89
  - s66302/belongfeast: Ines d75 The Strike, share 0.71
  - s66307/leadfeast: Nora d94 The Congregation, share 0.76
  - s66308/belongfeast: Omar d98 The Influencer, share 0.55
- Verdict: 4 >= control+2 (6)? NO. 4/16 seeds >= 4/16? yes (exactly). **NO-GO.**
- Honest assessment vs the confirm's knife-edge: the confirm's GO was
  3 vs 1 on 12 seeds. On 16 fresh seeds the CONTROL base rate moved to
  4/16 (25%) — the armorydrive baseline itself manufactures companion-
  majority kills at this rate on this seed block. The +2 kill margin at
  12-16 seeds is dominated by base-rate variance, not by the layer.
  No inherited-conjunction caveat applies on either side this time:
  the armed and control dmgMaj seed sets are DISJOINT (no shared seed),
  and all 4 armed dmgMaj kills came from configs where the layer fired
  (fdStaged 2-11), so intent-to-treat == manufactured count for both arms.
- What the mechanism DOES still do (the shares): armed damage-majority
  kills land at HIGHER non-scholar shares (0.55, 0.71, 0.76, 0.89) than
  control's (0.50, 0.55, 0.56, 0.57, 0.58). When the conjunction fires,
  companions contribute more of the damage — the capability direction
  is right even where the count bar misses.

### Secondary (replicates the confirm's mechanism readings)

- Kill-time villager wave-4 kills: control 9 (8/32 configs) vs armed 13
  (11/32 configs) — the kill-credit lift replicates.
- Feasted-engagement rate: control 28/149 (18.8%) vs armed 60/136
  (44.1%) — the conjunction lift replicates (pilot 10%->38%, confirm
  19.8%->38.5%).
- Layer-staged feasts: 134 armed (tele.feastsStaged), 0 control —
  composition honesty holds (the layer never fires on control).
- Total feasts: 428 armed vs 316 control.
- Mean non-scholar damage share on armed kill-time villager kills: 0.50
  (n=13) — companions contribute HALF the damage on the kills they get
  credit for (confirm: 0.36). The scholar still closes some, but the
  companion contribution deepened.

### Guardrails: ALL PASS

- Median survival: 125.0d armed vs 128.5d control raw; paired per-seed
  matched median diff 0.0d (range -48..+94) — within the >= control-10d bar.
- Starvation deaths: 9 armed vs 10 control (<= control+3).
- No new death mode: every armed cause appears in control; no armed cause
  >=2 events absent from control. Top causes both arms: combat
  (850/847), villager combat (268/260), monster (70/63), expedition
  (39/38), sickness (17/18), ambush (14/14) — same shape.

### §15 balanced panel: built, noted, manually judged

- feastdisc-reconfirm-b-panel-primary-before/after.json.gz + .md built
  from the reconfirm corpora
  (scripts/build-feastdisc-reconfirm-b-panels.js).
- Panel decision: review_required. leadfeast playerDeaths100Days
  regression_watch (delta +2.19/run, ci [-0.99, 5.47]); belongfeast
  table, national, playerDeaths, npcHungry regression_watch — ALL CIs
  cross zero (descriptive noise, same class as the confirm's signal).
- §15 STATUS: the intervention is env-gated (FEASTDISC=1 on the armed
  arm only); per sim-findings.md the automated compare is invalid by
  construction — the manual paired-row comparison is the judging
  instrument (this section).

### Telemetry deviation check: LOUD lines, regime artifacts

node scripts/telemetry-check.js vs telemetry-baselines/scale-wall.json
fired 3 LOUD lines (national 12->28, table 16->55, wins 16->0). The
baseline's own _regime block answers them: it is the WINSEAT regime
(SEATDRIVE=1, ~100%-win suite); this run is the pre-seat substrate
(SEATDRIVE=0), where "wins are structurally ~0 there and telemetry-check
will fire a spurious LOUD 'wins disappeared'." All three LOUD lines are
regime artifacts, not deviations — interpreted, not investigated
further.

## Sense test (SENSE-TESTING LAW) — PASS (determinism MATCH)

scripts/sense-feastdisc-reconfirm-b.js re-ran the s66308/belongfeast
armed config mirroring the sweep's oneRun exactly + read-only Game.say
wrap. VERIFY-DETERMINISM: MATCH (sense timeline == corpus timeline) —
the same-instrument determinism the C2 gate pins.

What the narration shows (d88-112), and it is SENSIBLE:
- d88: Liam stages a feast (1,800 kcal, FEASTED x2.53, devotion x1.5,
  "Arc IV burns hotter"). A Big Ugly is drawn by the feast-smell — faced
  feasted. "FEASTED x2.53: Nina's blow carries the feast" repeated per
  blow — the feast-draw + feasted-companion mechanism in prose.
- d92: "The Audit falls." d97: The Elder Ugly-Eyes falls (counter
  learned, "Contradict the narration" — Hanane lived to tell it).
- d98: Nina and Omar, feasted, bring down RERUN x1 The Influencer —
  "Omar just put down The Influencer... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name." The kill row: by=Omar, share 0.55
  (556 scholar / 674 companion / 0 other). Then a SEPARATE d98 fight:
  The Gavel (an object-monster running a trial) — "Nina just put down
  Gavel... on CAMERA." The show televises both.
- d99: Omar and Nina tell the fire the story; "The story's already
  growing" / "picking up decorations as it travels" — gossip reacting
  to real events.
- d105: the player gains the Fusion Reactor ability — "You never need
  to eat again... But the hunger is gone, and with it the joy." The
  reactor then REFUSES feast buffs: "1.25x, always, is all there is."
  A player-build choice that opts OUT of the feast economy — noted for
  the backlog, not this arm's scope.
- d107-108: The Ugly Beast kills Hanane, then Omar, each in 1 round.
  "The village mourns." Trust -8 on Omar's death.
- d109/111: grief feasts — "The laughter stays low — somebody's seat
  is empty, and everybody sees it. For one evening, grief sits at the
  fire with them instead of standing over them."

Verdict: PASS. Deaths are mourned and storied, the show televises the
kills, the feast draws the threats and the companions land the killing
blows. Nothing robotic, nothing repeated-without-cause (the per-blow
"blow carries the feast" lines repeat per tick as the fight resolves —
the known narration cadence, not a bug in this arm's scope). The d88
feast-draw scavenger followed by a wave-4 kill the same window is
exactly the conjunction the arm claims.

## Village assessment (plain words)

Villages on both arms live ~125-129 days, reach national 14/32, sit the
table 27-28/32, unlock wave 5 on 1-2/32 — the scale-onramp shape does
not move between arms at 16-seed scale. Nobody starves for the fire
(9-10 starvation deaths across 64 configs); nobody dies a new kind of
death. The fire is busier on the armed arm: 428 feasts vs 316, 134 of
them staged by the threat-driven layer, and companions fight feasted
44% of engagements vs 19%. The companions who get kill credit carry
half the damage (mean share 0.50) — and when they take damage-majority
kills, the shares are decisive (0.71, 0.76, 0.89), not marginal.

The sense-run village (s66308/belongfeast) tells the human story: Nina
and Omar were the village's blades — feasted, televised, storied —
until the Ugly Beast took them both in a single night (d107-108). The
player took the Fusion Reactor on d105 and stopped eating from the
common fire entirely: a reactor ceiling as well as a floor. Cesar
confessed he was a tattoo artist, not a hunting guide, and the fire let
it land. The village died d124 with 1,530-kcal grief feasts still being
staged — the feast economy worked until the end; the fights were what
killed it. This is the same honest trade the pilot documented: a
busier fight calendar with the combat deaths that come with it.

## Metric review (§14)

The reconfirm PROVED the confirm's pre-registered bar is base-rate-
limited at this seed scale: control damage-majority seeds moved 1/12
(confirm) -> 4/16 (fresh block), and the armed arm's 4/16 matches it
exactly. Three revisions proposed for the NEXT run, none applied here:

1. The +2 kill margin at 12-16 seeds is dominated by base-rate noise
   (companion-majority kills are rare events, ~10-25% seed rate). Next
   run: either a larger seed budget (32+) for kill-count bars, or a
   paired sign-test per matched config alongside the absolute bar.
2. The mean non-scholar share on kill-time kills (0.50 armed vs the
   confirm's 0.36) and the manufactured damage-majority share
   distribution (0.55-0.89 armed vs 0.50-0.58 control) carry more signal
   than the 0.5 binary — keep reporting both as secondaries.
3. Intent-to-treat stood clean here (disjoint seed sets, all armed
   dmgMaj kills on fdStaged>0 configs) — keep the ITT note standard.

Per Steve's KILL DISCIPLINE: a missed bar is not a kill. The lever is
NOT shown wrong — the mechanism fires deterministically (134 staged
feasts), steers the conjunction (44.1% vs 18.8% feasted engagement),
and replicates the kill-credit lift (13 vs 9). What failed is the
kill-count GO bar against a noisier control base rate. The lever
stays; the bar needs revision.

## POST-REBASE RE-VERIFICATION (2026-10-23)

The reconfirm commit was rebased onto master e6d843ded before landing (5
sibling commits landed mid-run: journey-crisis r45, journey-deepening
r36+r37, sim-homecoming-diag-b, sim-scholardist-confirm-b x2). The delta
touches src/js/safetynets.js (cosmetic compound-crisis label only) and
scripts/policies/competent.js (stuck-flee fix behind
COMPETENT_EXIT_VERIFIED_FLEE=1, default-off; gate-off path verified
byte-identical in the diff — legacy pushed/barrierPushes behavior
preserved). Post-rebase determinism re-check on the new base: control
60d re-run byte-identical (CTRL-DET-OK), feastdisc 60d re-run
byte-identical (ARMED-DET-OK). The corpus verdict stands on its
pre-registered terms (both arms on one identical substrate at sweep
time); the new base is behavior-identical for this sweep's env.

## Convergence (scale-onramp axis)

converging — the feast leg of the veterans conjunction remains
policy-steerable at independent 16-seed scale (engagement lift,
staged volume, and kill-credit lift all replicate; guardrails all
pass), but the damage-majority kill-count bar did NOT separate from
the control base rate (NO-GO 4 vs 4, bar control+2). The scholar still
closes most fights; companions' majority kills are real when they
happen (shares 0.55-0.89) but rare on both arms. Not converged: the
companion-capability question needs the metric review's revision
(larger seed budget and/or paired sign-test) before the next evidence
pass. No new lever required; no lever killed.

## Files

- scripts/test-feastdisc-reconfirm-20261023.js — reconfirm proof gates (NEW)
- scripts/analyze-feastdisc-reconfirm-b.js — paired analyzer, seed-agnostic (NEW)
- scripts/build-feastdisc-reconfirm-b-panels.js — §15 panel builder, seed-agnostic (NEW)
- evidence/2026-10-23/perseed-feastdisc-reconfirm-b/ — reconfirm corpus (64 JSONs)
- evidence/2026-10-23/feastdisc-reconfirm-b-panel-primary.{json,md} + -before/-after.json.gz
- scripts/sweep-feastdisc-confirm-20261022.js — REUSED unchanged (SEEDS/EVID overrides)
- scripts/policies/feastdiscipline.js — the layer (FEASTDISC=1, zero src/js, UNCHANGED)
