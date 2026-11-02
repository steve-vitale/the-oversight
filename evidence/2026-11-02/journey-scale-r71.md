# journey-scale r71 — Lane A, leg 3 SCALE (2026-11-02)

**Run id:** laneA-scale-2026-11-02T06:45CST (scheduled 06:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@95ca9266d at branch creation (journey-deepening r85 tip).
**Pre-register:** evidence/2026-11-02/journey-scale-r71-prereg.md
(written and committed before any scored seed ran).
**Change set at closeout:** ZERO src/js, zero src/data. Tooling (r71
driver/analyzer, labels/seeds/EVIDIR only — diff verified, plus a
one-line seed-list fix in the analyzer, see below) + evidence + run
note only. Both fix gates stayed closed (see Q1, Q2). Gating freeze
honored; perception law honored (all instruments read-only; the
pickers only press offered menu items, never engine state).
**Scored measurement = the quad** (seeds 85051–85054,
WANT_SUBJECT=1 + GOSSIP_FIRST=1, DAYCAP 180, death-aware stop,
scalecourt-nogate unchanged).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 26%,
  `git pull` already up to date, worktree-reap ran (10/16 active —
  all dirty/held lane-B and build trees, correctly untouched).
- **Heartbeat:** manual heartbeat at registration verified landed in
  the registry, plus a 10-minute background heartbeat loop for the
  whole run (log at ~/workspace/worktrees/journey-scale-heartbeat.log).
  Registry freshness re-verified mid-run (12:51Z beat 5 minutes old
  at the 12:56Z check — never near the 15-minute threshold).
- **Registration was slow, not stuck:** worktree-register took ~5 min
  (git reset under heavy sibling load), same as r67/r68. No action.
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r66–r70: after the correct private-index commit (8a4f4bd82,
  3 files, +854), the worktree's main index showed all 3 files
  staged-as-deleted while the worktree files stood as untracked.
  Repaired via HEAD-blob cacheinfo, verified: `git status` clean,
  `git diff HEAD` empty, hash-object matches HEAD on all 3 files.
  The commit itself was correct.
- **Analyzer seed-list slip, caught before scoring:** the relabel sed
  replaced only the first seed of the analyzer's list, so the first
  analysis run scored 85051 + stale 85042–85044 (all zero). Caught
  because three seeds read 0 across the board; fixed the list to
  85051–85054 and re-ran. The scored numbers below are the corrected
  run. The driver itself was never affected (its SEEDS list was
  correct from the start).

## Verdicts (binding questions, answered)

### 1. SUBJECT_FIRST GOSSIP EXPOSURE: EXPOSURE ACHIEVED, 0 FALLBACK PAIRS — GATE STAYS CLOSED
Gossip analyzer on the band: **1 repeat pair, 0 fallback pairs**
across all 8 transcripts, with **3 ask:gossip picks** (85051 d120,
85053 d90, 85053 d120). Per the prereg's second branch, this is
non-reproduction WITH exposure: the r66 Henrique instance STANDS as
a single instance with a proven mechanism, and no gossip fix lands.
- **Subject-first works, partially.** The picker took dlg:subject at
  turn 0 in 6 of 8 sittings (all except 85052's two, where the
  turn-0 menu held no subject option at all — want menus only).
  Of those 6, 3 reached ask:gossip; the other 3 went to want/event
  menus (Nina's field-ask menu, Gerald's favor menu, Ferdinand's
  mourning menu) where gossip was never offered. So subject-first
  lifts exposure from r68's 0/7 and r70's 2/8 to 3/8 — real
  progress, still not every sitting. The remaining bottleneck is
  the same menu-routing cause r68 proved: after the subject menu,
  the sitting follows the chosen thread, and gossip is only one
  thread among several.
- **The 3 gossip chains are all varied, no repeat.** 85051 d120
  (Pavel back / Nathan off / Pavel bio / Nora bio), 85053 d90
  (Catalina out / Ines harmless / Ines foraging / Catalina back /
  Ethan foraging / stray dog lets Ines touch it), 85053 d120
  (Gauntlet win / player Gauntlet walk-out / Emma bio / Ines
  notice / Ernesto bio / Ruth bio). The fallback line never had
  to render twice because the walk-down kept finding fresh items.
- **The 1 repeat pair is NOT a gossip pair — it is a new, small,
  documented repeat class (not fixed this run, see below).**
  85054 d90 Nina (nonverbal sitting): the player nods twice and
  the NPC answers identically both times — "They answer at length.
  They nod back, slowly." Mechanism, proven by code read: the nod
  response is a single fixed narration (conversation.js:7642,
  `nod: 'They nod back, slowly.'`). Pressing nod twice yields it
  twice verbatim. This is coherent (a nod back is the honest reply
  to a nod) but thin; varying the nod-back narration is a polish
  proposal for a later run, NOT landed here — the prereg's Q1 gate
  covers gossip-fallback pairs only, and a post-hoc fix for a
  different repeat class would be re-scoping, per r67's precedent.

### 2. ACCEPT-THEN-ABORT: CLASS EXPLAINED, NOT A DEFECT — GATE STAYS CLOSED
**0 instances this band** (no invitation accept appears in any of
the 8 transcripts), so the class stays at 2 cumulative (r69 Brian
+ r70 Franz). But the mechanism is now PROVEN at code level, and it
reframes the class:
- The abort line exists in exactly one place (betrayal.js:525) and
  it is the **SICK outcome**: `acceptInvite` checks
  `village.sick[vid]` before resolving the invite, and a feverish
  inviter's body vetoes the walk honestly at accept time ("starts
  to stand, then sinks back down. 'Maybe not today. The fire's
  got me.'"). The code comment documents why: the r42 gates covered
  expedition departure and guard duty but not this path, and a
  feverish villager was transcript-verified walking the trap line
  (journey-crisis r46). The veto closed that hole.
- So the "vague abort that eats a yes" is actually a tracked-state
  veto: the inviter IS sick (sick[vid] is the consulted state),
  the accept IS banked (`hist.accepted++` runs before the sick
  check), and only the walk doesn't happen. The line names the
  fire-side rest, not the word "sick" — a wording-thinness note,
  not a senseless defect. Per the prereg, clause (a) fails: this
  is a designed honest veto, not a defect. **No fix lands; the
  class is reclassified from "fix proposal" to "explained
  behavior."** A future run could still propose naming the sickness
  outright, but that is wording polish, not a behavior fix.

### 3. TABLE-APPROACH + CENSUS (report-only)
| seed | end | day | pop | pantry | rank | seat | arc | waves w1/w2/w3/w4/w5 | contests | crises | pilg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 85051 | DEAD (village dies out) | 125 | 0/0 | 140 | regional | lesser (waiting, announced) | 4 | 19/11/7/3/0 | 10 | 3 | 47 |
| 85052 | ALIVE (day cap) | 181 | 8/8 | 25,645 | regional | none | 3 | 21/12/1/0/0 | 23 | 3 | 10 |
| 85053 | ALIVE (day cap) | 180 | 8/8 | 66,984 | regional | none | 3 | 23/9/7/0/0 | 18 | 4 | 7 |
| 85054 | ALIVE (day cap) | 180 | 8/8 | 3,703 | global | lesser (waiting, announced) | 4 | 13/10/6/3/0 | 18 | 4 | 9 |

- Lesser seat 2/4 (both priced, waiting, announced, none sat);
  full seat 0/4; wave 5 reached 0/4; national/global 1/4 (85054).
  The "priced but never sat" shape continues (r68, r70, now r71):
  85051 prices the lesser seat and then dies out at day 125;
  85054 prices it at global rank and waits out the cap.
- 85052/85053 never approach the table (seat none, arc 3) despite
  23 and 18 contests: 85052's food deeds are true but its wave
  breadth stops at w3:1 (no wave-4 faced); 85053's food deeds are
  false (its pellet honesty flicker fired — see below). Rank
  alone does not open the table, again.
- **Pellet-beat firing (report-only):** the pellet honesty flicker
  ("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE
  SHOULD BE") fired for 85053 and 85054, the two seeds whose
  food deeds are unbanked at the table approach. 85051 banked its
  food deeds (foodDeeds true) and priced the lesser seat despite
  holding a pellet — the r70 85042 rule reproduces: the pellet
  blocks NEW bearer feasts, it does not erase banked deeds. 85052
  never reached a table approach, so no beat could fire. The r70
  firing inconsistency is therefore NOT reproduced as an
  inconsistency here — every seed's beat state matches its deed
  state — but the fusionReactorOnline trace (r70 follow-up) is
  still queued, since this band does not name the transition.

### 4. DUTY COUNTS (report-only, continuity)
Quad totals: villager-days 2,583; knower-days 1,119; armed knowers
1,119 (all real weapons, 0 stick-only); weaponless days 0;
weaponless-knower days 0; eligible days 0; attempts (Cd advances)
0; unexplained non-attempts 0; stick-blocked days 0.
Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
TENTH consecutive 0/4 for both duties (r61–r71). The armed-gate
classification reproduces on fresh seeds and a moved base: the
duty's eligible population is structurally ~empty on the
competent scalecourt path, again.

### 5. PEOPLE CHECK (sense law — all 8 transcripts read in full)
7 of 8 fully real, 1 with the nod repeat (§1). No fabricated shared
history, no filler loops, no static menus.
- **85051 d90 Gerald (favor, wound):** real. Subject menu taken,
  then the want re-engaged honestly ("It's getting worse, not
  better... Just clean it out and wrap it tight"), commit lands
  ("Careful with it. And — thank you."). Real.
- **85051 d120 Nikos (favor, wound → gossip):** real. Subject menu
  deflects the wound load ("Sorry — I shouldn't load that on
  you"), then a varied 4-item gossip chain (see §1). Real.
- **85052 d90 Simone (curious, regret):** real. The player's regret
  answer is met ("Yeah. I think everyone's carrying one of
  those"), then Columbus, Ohio mornings — the same player-side
  answer line as r70's Shanice sitting, which is the player
  repeating themselves, not an NPC repeat. Real.
- **85052 d120 Simone (curious, theory):** real. Control-group
  theory, self-correcting ("Sorry, what was the question").
  Real.
- **85053 d90 Tanisha (favor → gossip):** real. Six distinct gossip
  items, no repeat (see §1). Real.
- **85053 d120 Tanisha (favor → gossip):** real. Same NPC as d90
  (convoCount 17) — continuity holds; Gauntlet items plus bios,
  no repeat. Real.
- **85054 d90 Nina (nonverbal):** real EXCEPT the nod repeat (§1).
  A Ukrainian-only speaker handled entirely through mime and
  field-asks (Autumn Crocus lesson, a spring that runs clear) —
  the nonverbal sitting works as designed; only the doubled
  nod-back is thin.
- **85054 d120 Ferdinand (company, mourning):** real. Grief exchange
  lands ("Dale is gone and the world just... continues"),
  writing as shaking-hands work, ends resolved ("We bury, we
  grieve, we keep going. There's no step four."). Real.

## Village assessment, in plain words
- **85051 — the village that priced the seat and then died.**
  Forty-seven pilgrimages, a lesser seat waiting — and the last
  villagers die out on day 125 with 140 kcal in the pantry. The
  climb does not protect against the food economy, and the table
  waits for no one.
- **85052 — the strong village with nowhere to climb.** Eight
  people, 25,645 kcal, 23 contests — and no seat, because it never
  faced a wave-4 monster. Breadth, not effort, is the bar it
  misses.
- **85053 — the rich village the table priced out.** 66,984 kcal,
  the band's biggest pantry, and no seat: the pellet hums where
  the fire should be, and the ledger still wants the food deeds.
  Wealth without the deeds is still regional.
- **85054 — the village at the top of the ladder, still waiting.**
  Global standing, a lesser seat offered — and the cap runs out
  with the seat untaken. Sitting is a commitment with no way back,
  so the sim does not auto-sit; the wait has a price, by design.

## BARRIER PIN (standing instrument)
Barrier-dump lines per seed: 85051: 4, 85052: 0, 85053: 0,
85054: 1 — all the SAME signature as r67/r68/r70: sleep()
refusing during an active fight via sayOncePerFight, with
inCombat=true, tbfight=true, over=false. The guard WORKING as
designed, not a guard-break. The pin stands in its r55 form; it
does not overturn.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes. Every seed reached regional; global appeared;
  the lesser seat was offered twice; courts, covenants,
  pilgrimages, and table omens all fired. The thin spots this run
  are conversational, not content absence: gossip still reaches
  only 3 of 8 sittings even with subject-first, and the nonverbal
  nod-back repeats verbatim.
- FUN: mostly. The conversations are genuinely good this band
  (Ferdinand on grief as step-less work, Tanisha's gossip chains,
  Nina's mime sitting), and the climb produces distinct village
  stories. The dull spots are the ones already named: the nod
  repeat, and the weapon-craft/deadfall duties never firing for a
  competent village (ten bands of zero).
- WINNABLE: not yet, and this band says exactly why. The full seat
  needs wave-4/5 breadth no seed here earned (best: 3 wave-4
  faced, 0 wave-5), and the lesser seat needs food deeds one seed
  never banked. The path exists — two seeds walked it to the
  lesser seat — but the full seat remains unwon across r66–r71,
  and wave 5 unfought in normal play.

## Metric review
- Census scalars unchanged from r51's list, plus fusion/ability
  columns (reads, not scores), plus the r61 end-state class and
  the weapon-craft-line and deadfall-duty-line counts. The gossip
  analyzer reports; it does not re-score any prior metric.
- No metric was re-scored mid-run. The prereg's Q1 verdict rule
  was applied as written: 3 gossip picks with 0 fallback pairs →
  gate closed, no gossip fix — even though the nod repeat is a
  new repeat class, it is not a fallback pair and the gate does
  not cover it. The Q2 verdict rule was applied as written: no
  instance fired this band, and the code-level mechanism proves
  the class is a designed sick veto, so clause (a) fails and no
  fix lands.
- Carried, still open: the nod-back variation polish proposal
  (§1); the fusionReactorOnline days 60–120 trace (r70 follow-up,
  still queued — this band's beat states all match deed states,
  so it did not reproduce as an inconsistency); the wave-4/5
  breadth wall for the full seat; r65 bank-trace finding; r63
  mantle-pass proof; r58 Irving-displacement, subject-menu,
  Boris nod-loop (note: the Boris nod-loop item is adjacent to
  this run's nod repeat but a different sitting shape — do not
  conflate them); r56 chooseAbility-unguarded note; r55 barrier
  pin form (guard confirmed working, not overturned); r67
  capable-bot section 7 test-maintenance item (untouched here).

## Telemetry deviation check (body step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-11-02/journey-scale-r71/journey-scale-r71-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 96472 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r68's verdict: the baseline is the
old-base quad's SUMS (all villages dead/scattered, empty
pantries); this quad's pantry sum is 140 + 25,645 + 66,984 +
3,703 = 96,472 across three cap-surviving villages and one dead
one. A cap-surviving village holding a pantry is not a telemetry
or game defect. (An initial run against scale.json instead of
scale-census.json produced five "newly appeared" lines for the
same reason — wrong baseline file, same explained class.)
The baseline is NOT rolled on this run's numbers.

## Tests
- `node --check` clean on the r71 driver and r71 analyzer (at
  creation and after the seed-list fix).
- Gossip analyzer proof: `node scripts/test-gossip-r67.js` — 11
  checks passed (instrument unchanged, still green).
- Goal-opener-deep proof (r67's fix): `node
  scripts/test-goal-opener-deep-r67.js` — 7 passed, 0 failed
  (r67's convoPick fix still green on this moved base).
- Gossip analyzer on the scored quad: 1 pair / 0 fallback (see
  §1); analyzer output saved at
  evidence/2026-11-02/journey-scale-r71-gossip.txt.
- `git diff <base> HEAD -- src/` is empty, so no quick-list test
  can regress from this run. Full `check.js --quick` NOT run this
  run, deliberately, per r68's precedent: zero src/js changes mean
  the suite would re-prove the base, not this change. The
  targeted proofs above + the empty src diff are the
  proportionate check. Recorded here so the next run can
  overrule it, not silently assumed.
- Suite side effect, checked not assumed: `git status` after the
  proof runs shows only this run's evidence paths untracked plus
  the new r71 scripts — no stray modifications, nothing to
  discard.

## Landing (filled at closeout)
