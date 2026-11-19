# journey-landing r148 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T164116Z (scheduled Thu 2026-11-19 09:45 CST).
**Base:** local master `0aa413222` (journey-scale r245 note; `git pull` already
up to date at run start). **Rotation:** read 0 → write 0→1 at closeout on
success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
**Seeds:** fresh band 1262–1271 (verified unused; see prereg).
**Driver:** `scripts/journey-landing-r148-20261119.js` — r147 verbatim except
header/seeds/OUTDIR + **MOURN_PROBE default ON** + **LINK_PROBE** (new,
default ON: `pickVillager` prefers a villager holding a pending linkRaise
talk request; `pickChoice` takes `link:accept` when offered, counted as
`MET.linkAcceptTakes`). Pilot seeds 1262–1265, DAYS=28, exit 0 (~2.2 min);
full panel seeds 1262–1271, DAYS=28, exit 0 (~4 min). Corpus
`landing-r148-after`. Analyzers: the 15 standing analyzers
(`journey-landing-r148-analyzers.sh`, log
`journey-landing-r148-analyzers.log`).
**Prereg:** `evidence/2026-11-19/journey-landing-r148-prereg.md`.

## Q1 — Verdict: NO-GO (one binding-bar miss; see the moderator finding)

The panel's only binding-bar miss is the zero-DMG B-shape fight on seed
1271 (below). Per §14 the miss stands as NO-GO for this run; no mid-run
re-scoring. Both defects the panel surfaced are fixed in the worktree with
proof tests and verified on a matched re-panel of the same seeds — see
"Fixes" and "Re-panel". The fixes do not change the panel's verdict (the
bar is pre-registered against the original panel); they change the game.

| Metric | Bar | Result | Verdict |
|---|---|---|---|
| M1 ALIVE-D14 | 10/10 alive d28 | 10/10 alive | PASS |
| M2 SYSTEM CONTACT | 10/10 by d9 | 10/10 (8×d8, 2×d9) | PASS |
| M3 FIGHT-LOG | 0 unknown/mixed | 0 | PASS |
| Zero-DMG / B-shape | B-shape 0 | **raw 1, B-shape 1** (1271 d25) | **NO-GO** |
| Practice | movedCells ≥50, 10/10 seeds | 92 cells, 10/10, skill0→pos 65 | PASS |
| Pocket | 0 pocket fights | 0; stuckFights 0 | PASS |
| D1 garbled | 0 | 0 | PASS |
| HEED / HEED-V | HEED-V = 0 binds | HEED 0, HEED-V 0 | PASS |
| Nodloop | LOOP = 0 | 0 | PASS |
| M-PR1 (revised) | ≤15% never-offered | **2/22 = 9.1%** (raw 5/25, 3 unestablished excluded) | PASS |
| Personal / small bridge | 0 repeats | 15 servings 0 repeats; 9/0 | PASS |
| Dry lines | 0 in all transcripts | 0 in all 137 | PASS |
| R66 HUNGRY | starvation deaths 0 | 0; NOT-HUNGRY | PASS |
| Scholar deaths | ≤2 per panel | 2 (see below) | PASS at the bar |
| FIGHTALLY2 watch | no 2-ally fight ending zero-DMG/stuck | 8/16 fights with 2+ allies; only the d25 fight ends zero-DMG | FAIL (same finding) |
| Door-flee | 0 fled fights | 0 | PASS |
| Homeward (r240) | no 2+ day stranding | R85 rescues 2/2, both ARRIVED; no stranded-homeward signal | PASS |
| Presshop | farUnreached reported | 0 | — |
| Counter-label watch | all COUNTER LEARNED lines noun-phrase | 5/5 noun-phrase | PASS |
| Confide (F8) | no confide exit without a shared secret | 0 occurrences (untested, no failure) | — |
| Ammo-name (#2593) | volley lines name the real ammo | no volley-no-ammo event (untested, no failure) | — |
| Link-accept watch | every accept voiced, never the parrot label | 23 accepts, all voiced | PASS |
| M-PR1 statedAfterPick | reported | 3, all the honest away-guard road line | — |
| Settled sittings | reported | 3 (1266 d12, 1267 d8, 1269 d9), all open with the need already handled | — |
| Win-plans | reported | 2/10 seeds at d14 and d28 (r146 signal recurs after r147's 0) | — |
| Fights | reported | 16 (volatility continues: 21/12/17/7/16/10/8/16) | — |
| Hungry-at-horizon | reported | 4/10 (1264: 541, 1268: 1701, 1269: 1365, 1271: 1697 kcal/person) — same as r147 | — |
| Huntpractice | reported | H0-ESTABLISHED (34 reps, max 7) | — |

**Scholar deaths (2, at the bar):** Aubrey (1265) and Kieran (1269), both
d28 lockjaw, both "unresolved" at the horizon — the deaths land on the last
day, so no succession latency is observable. Starvation deaths 0.

**R128 move refusals:** 27 moves, 12 failed — 2 MOVE-MUTED (the finding
below), 6 silent-noline flee-walk, 3 nopath, 1 occupied; movedLie=2 (the
muted moves returned true without moving).

## Q1a — MOURNING BEAT: ANSWERED

2 sittings taken (mournProbed 2), both read in full:

- **1265 d27, Raj grieving Jovan:** "Jovan owed me a favor... The fire
  feels smaller without Jovan... I'm picking up Jovan's share of the
  work." Names the dead, carries the loss into work. Ends engaged,
  stage 3.
- **1269 d7, Luis grieving Valery:** "I dreamed Valery was still here."
  Names the dead; the want-thread resume works in the same sitting
  ("We never finished — that foraging help." → honest restatement).

Template spread holds (distinct grief lines, not one template). Observation
only: the menu label still says "About... them." (generic); the spoken
beat names the dead.

## Q1b — LINK-ACCEPT: TESTED AND PASSING (watch), POOL VARIETY FAILED

23 accepts, all voiced (never the parrot label) — the r243 watch passes,
and the probe worked: raises staged abundantly on this band with the same
gate code, so **r147's 0 raises were band variance, not a gate regression**
— r147 metric-review item 12 is mooted (no question to Steve).

**But pool variety failed: 22/23 accepts used the identical line** ("Good.
What I've heard of them, I believe. Go and ask."); only 1 used the second
line. Mechanism pinned: `linkAcceptLine` picks first-unledgered against a
48-entry run-ledger window; accepts are days apart, so the line ages out
and pool[0] always wins. The single pool[1] serving proves rotation works
when the line is still in-window. Fixed below (bond-initiation.js) — and
the first version of the fix failed in real play for a second, subtler
reason (the village name), also fixed and verified; see "Fixes".

## Finding 1 — MODERATOR MUTE: the policy re-issues a muted verb (B-shape miss)

Seed 1271 d25, Elder The Moderator (wave 2, 245 HP), allies Naran + Caleb
(279 dmg in 3 rounds, won). The scholar closed on round 1 (8,0→7,0), then
tried (6,0) and (6,1) — both refused: "🚫 MOVE IS MUTED inside the
suppression field... You cannot walk out while MOVE is muted — STRIKE or
WAIT to flip the mute, then move." 2 violations (+3/+6 to its Notices), 0
strikes. Adjudicated: NOT a pocket (the fight advanced, the monster acted
twice, the allies won), NOT a stuck fight — a competent-policy gap. The
policy's 'wait' trick fires only when the counter is KNOWN; the close/strike
path re-issued the muted verb every round. The game coaches the answer in
plain words on the first violation; the policy ignored the live mute.

**Fix 1 — moderator-mute guard** (`scripts/policies/competent.js`, in
`fight()`, just before the generic close/strike path; +78 lines). Reads
only live engine state the player can see (`Game.modLive()`, `modMuted`,
`Game.modPlayerInField()` — the mute is announced and grid-visible, so no
knowledge gate is needed). MOVE muted + out of strike range → WAIT (silence
flips the mute; `tbPlayerWait` auto-advances, never `endTurn` after it).
STRIKE muted + in range → step to an adjacent tile outside the field if one
exists, else WAIT. Never fires outside the field or when the turn would not
use the muted verb anyway. Known limitation (noted, out of scope): the flee
path runs earlier in `fight()` and is not guarded — a fleeing scholar at low
HP with MOVE muted could still violate.

**Proof test 1** (`scripts/test-journey-landing-r148-moderator-mute-20261119.js`,
4 cases, each in its own process): move-muted (MOVE muted, scholar at
distance 2 — the exact panel shape), strike-muted (melee, WAIT fallback),
strike-muted-ranged (bow range 5, step-out branch), control (MOVE muted, in
range — guard must not fire). The mute is staged directly (the engine's
mute computation is already proven by test-apex-moderator.js); flat grid
(apex-test precedent) so every step is pathable. Staging lesson, recorded:
the first version started the scholar on the edge tile (8,0) on the real
map — "No path there" every round and the mute never engaged (failed moves
don't feed the verb window). **RED → GREEN verified** by stash-swap
(HEAD competent.js: move-muted/strike-muted/strike-muted-ranged FAIL with
1 violation each, control PASSES; fixed code: ALL CHECKS PASS in all 4).

## Finding 2 — LINK-ACCEPT ROTATION: pool[0] always wins (22/23)

See Q1b. **Fix 2** (`src/js/bond-initiation.js`, `linkAcceptLine`; +29
lines): a module-level `LINK_ACCEPT_ROTATION` store, keyed by `how`. When
the first-unledgered pick would repeat the line last served for that `how`,
serve the other unledgered line instead. The ledger check still runs
first; fail-open to first-unledgered.

**The first version of this fix FAILED in real play — and the re-panel
caught it.** The store held the full served line, but the line embeds the
village name ("...You carry the proposal to Thornfield."), and accepts are
usually for different villages: the next accept was for Ashford, so the
comparison never matched and the rotation never fired (re-panel 1: still
22/1). Diagnosed with a temporary env-gated debug log on a seed-1266-only
run (4 accepts, all `how=told`, store holding "...to Thornfield" while the
next accept was for Ashford; debug reverted before commit). **Revised fix:**
the store holds the POOL INDEX, not the line. **Proof test 2**
(`scripts/test-journey-landing-r148-link-accept-rotation-20261119.js`, 3
cases, separate processes): rotation (4 calls, ledger aged out between
each, a DIFFERENT village per call — Thornfield/Ashford/Stonebridge/
Emberhold, the panel shape), control-ledgered, control-both-ledgered.
**RED → GREEN verified twice:** against HEAD bond-initiation.js the
rotation case fails (A,A,A,A); against the line-version fix the updated
test also fails (2nd/4th accepts repeat pool[0] across villages — the test
catches the real bug); against the index fix, ALL CHECKS PASS in all 3.

## Re-panel (matched band, same seeds, fixed code)

Two 10-seed re-runs of the r148 driver (DAYS=28, seeds 1262–1271):

- **Re-panel 1** (`landing-r148-after-fix`, line-version rotation fix):
  R128 MOVE-MUTED **2→0**, movedLie **2→0** — the moderator guard works in
  real play. Accept lines still 22/1 — the rotation fix did not work (see
  Finding 2). B-shape still 1 (same 1271 fight).
- **Re-panel 2** (`landing-r148-after-fix2`, index-version rotation fix):
  accept lines **14 vs 9** (was 22/1). Seed 1266 alternates A,B,A,B across
  d14/d17/d20/d28; seed 1269 alternates A,B,A,B across d10/d12/d14/d15.
  R128 still 0 muted moves. B-shape still 1 — the same 1271 fight, now
  with **zero violations**: the scholar waits out the mute competently
  while the allies win in 3 rounds. The B-shape count is unchanged because
  the fight is short and the scholar is out of range; the defect (wasted
  turns on refused verbs) is gone. This is the "stood-through-by-choice"
  shape — see metric review.

## Q2 — People check (read in full)

- **1265 d27 Raj** (link-raise accept + mourning Jovan + seek_comfort,
  ends engaged stage 3) — rich, healthy: the raise, the grief, and the
  comfort-seeking stack in one sitting without tripping over each other.
- **1269 d7 Luis** (favor commit + mourning Valery + want-thread resume) —
  healthy: the resumed thread ("We never finished — that foraging help.")
  is honestly restated, not parroted.
- **1262 d12 Oliver, warn_you** (1 on the panel) — healthy: Oliver wants
  the scholar careful; three heeds escalate genuinely ("I'm not trying to
  fence you in. I'm trying to still have you here tomorrow. That's the
  whole of it."); ends stage 3, resolution=heeded; then flows into a
  beast-naming thread (Big-Eyes). One sense nit: the warning never names
  the danger — the opener trails off ("Extremely normal, all of it.") and
  no threat is ever stated, so the warning has no content to heed.
- A 2-ally fight transcript and a compare_maps sitting with 3+ compares
  were not read this run (time went to the two re-panels); the fight
  numbers (R128, zerodmg) carry the fight story instead.

## Village assessment (plain words)

All ten villages are alive at day 28, and every one of them has met the
System by day 9 — the first fortnight works: people survive, the strange
voice arrives, the village holds together. Food is the pressure: four
villages end the month hungry (one of them badly, 1,700 calories short per
person), though nobody starves. Two scholars die on the last day, both to
lockjaw from old wounds — the kind of death that feels earned by the
world, not by a broken rule. Two villages have already started sketching
a plan to win. Fights are rare and swingy (16 across the panel), and when
a big monster shows up the villagers do pile in — 8 of 16 fights had two
or more allies. The village feels alive: people grieve their dead by name,
warn each other, raise ideas about linking with other villages, and take
"no" gracefully. What is still thin: nobody has killed a wave-4 beast yet
on this band, and the hungriest villages are living hand-to-mouth.

## Reachable / Fun / Winnable

- **Reachable:** yes. The first fortnight, first System contact, mourning,
  link-raises, and wave-2 fights all fire on ordinary play within 28 days.
- **Fun:** yes, with the two fixes. The moderator fight no longer wastes
  the player's turns on moves the game itself forbids, and villagers
  accepting a link idea no longer all say the same sentence — the village
  sounds like different people now.
- **Winnable:** not yet on this band — no wave-4 kill, no wave-5 door, two
  win-plans only just started. The chain past the first fortnight is still
  the wall; nothing in this run moves it.

## Q3 — Telemetry

`telemetry-check.js` vs baseline `landing-split.json` (81/9/217/15/0,
re-pinned r136): **quiet** on the pre-registered panel (10 files, 5
metrics, no large deviations) and **quiet** on the fix2 re-panel too.
Baseline NOT rolled — neither panel carries new information that moves it.
No LOUD lines.

## Q4 — Gate (adoption adjudication)

`node scripts/check.js --quick` SOLO on the branch tip:
**335 passed, 9 failed in 1073s; 0 attributable.** Each failure adjudicated
by the adoption with solo re-runs (never two check.js concurrently):

| Failure | Solo re-run | Verdict |
|---|---|---|
| test-measurement-proof-update.js | fails "Proof source inputs are not current" | STANDING staleness — the same pair fails on pristine master tip `af7fddfc4` (r249's gate log, 339/5: the pair is 2 of its 5). The retained proof predates the post-r238 landings. Proof re-sign (round 22) is program maintenance, owed, not a blocker for this landing. |
| test-measurement-workflow.js | fails "retained neutrality proof covers the current inputs" | STANDING, same as above. |
| test-living-garden-deed-attainment.js (120s timeout) | PASS solo, exit 0 | Load artifact (standing). |
| test-phone-frame-proof.js | fails stale receipt | STANDING — fails identically on pristine master (in r249's 5 on `af7fddfc4`); needs a real browser playtest to refresh, outside this adoption's brief. |
| test-one-person-army-deed-attainment.js (120s timeout) | PASS solo, exit 0 | Load artifact (standing). |
| test-foodpower-20261014.js (ontology green) | PASS solo, 30/30 | CAUSED BY FLAP DAMAGE, not the fixes: `docs/ONTOLOGY.md` was truncated to 0 lines in the worktree (write-refusal window). Restored byte-identical from HEAD (2199 lines, verified `git diff HEAD -- docs/ONTOLOGY.md` empty after restore). Not committed as a change. |
| test-trust-observer-neutrality.js (120s timeout) | PASS solo, 6/6 | Load artifact (standing). The run's "NEW" label was timing, not a regression. |
| test-sw-audio-cache-20261012.js (EPERM copyfile) | PASS solo, 7/7 | FLAP: `copyFileSync sw.js -> /tmp` refused EPERM during the 15:47Z write-refusal window. Passes clean now. |
| test-capable-bot-20261014.js (120s timeout) | PASS solo, 42/42 | Load artifact (standing). |

The run's "gate requires Steve's adjudication" note is superseded: the
adoption adjudicated all 9 from the logs + solo re-runs + the pristine-master
comparison, per standing practice. No failure touches the two r148 fixes
(competent.js, bond-initiation.js) — both proof tests pass on the branch tip
and were re-run on the rebased tip (see Closeout).

Rebased-tip gate: re-run after rebase onto master `7e0810eea` (see Closeout
for the tally).

## Metric review (for the NEXT run)

1. **B-shape split — ADOPT, strengthened by the re-panel.** The 1271 fight
   is B-shape 1 on all three panels (original, re-panel 1, re-panel 2),
   but on the re-panels it has zero violations: the scholar waits out a
   mute while allies win. The current B-shape counts "stood through and
   dealt 0 damage" regardless of whether the turns were wasted or spent
   well. Split it: **refused-turns** (a turn lost to a refused verb —
   violations, movedLie) binds at 0; **stood-through-by-choice** (0 damage,
   no refused turns — waiting, closing, allies winning first) is reported
   only. Under the split, this run's refused-turns = 0 on the re-panel.
   The original panel's verdict stands (the miss was real then); the split
   applies from r149.
2. **Link-accept watch — TESTED, now with variety.** 23 accepts, all
   voiced; variety 14/9 on the fixed code. Keep the watch; the pool[0]
   dominance is fixed, not just watched.
3. **Mourning — ANSWERED, watch closed.** The beat names the dead and the
   template spreads. The generic menu label ("About... them.") is a
   carried observation, not a bar.
4. **HEED-V bar — keep at 0.** Third full panel at 0.
5. **Dry-line bar — keep at 0.** Maps-pool + fallback-structural fixes
   hold on their second AFTER measurement (0 dry lines in 137 transcripts).
6. **M-PR1 — keep the revised ≤15% bar.** 9.1% this run; statedAfterPick 3
   (honest away-guard road line, no defect).
7. **Hungry-at-horizon 4/10 (same as r147).** Watch move: none. History:
   r137/r138 4/10, r139 6/10, r140 6/10, r141 5/10, r142 4/10, r143 5/10→
   4/10, r144 5/10, r145 1/10, r146 5/10, r147 4/10, r148 4/10.
8. **Fights 16 (volatile range continues).** No claim; the matched-band A/B
   on fight frequency is still owed.
9. **Win-plans 2/10 at d14 and d28.** The r146 signal recurs after r147's
   0 — downgraded to noise last run, now a flicker again. Watch.
10. **Warn_you content nit (new).** The 1262 d12 warning never names the
    danger. Worth one look by the dialogue arm: a warning with no content
    is a heed with nothing to heed.
11. **r147 item 12 (link-accept question to Steve) — MOOTED.** The probe
    produced 23 accepts on this band; r147's 0 was band variance.
12. **r147 item 14 (mourning) — ANSWERED.** See Q1a.

## Infrastructure notes

- Heartbeat: the original loop (PID 144908) died mid-run — the heartbeat
  log went ~15 min stale before it was noticed (17:40Z last beat, found
  17:56Z). Re-armed immediately (one beat + a new nohup loop, PID 9557,
  every 5 min) and stayed alive for the rest of the run. No lock was at
  risk (the run held the lock throughout); the lesson is the standing one:
  a stale heartbeat is how a live run looks dead — the loop must be
  checked, not just started.
- Registration took ~6 min under load at run start; no failure.
- The two re-panels (fix, fix2) are kept as separate corpora under
  `hidden_files/evidence/2026-11-19/` so the before/after comparison is
  exact (same seeds, code the only change).
- No `git worktree add` under /tmp; no main-tree writes; no sibling trees
  touched (sim-fleerepair2-b, sim-bowcraft-a, sim-launchfunnel-b,
  journey2-endgame).

## Files changed (worktree)

- `src/js/bond-initiation.js` (+29) — Fix 2, link-accept rotation by pool
  index. [needs-eyes]? No — a dialogue-variety fix, no feel change to
  playtest on the phone beyond varied accept lines.
- `scripts/policies/competent.js` (+78) — Fix 1, moderator-mute guard.
- `scripts/test-journey-landing-r148-moderator-mute-20261119.js` (new) —
  proof test 1, 4 cases, RED→GREEN.
- `scripts/test-journey-landing-r148-link-accept-rotation-20261119.js`
  (new) — proof test 2, 3 cases, RED→GREEN (twice: catches the
  line-version bug).
- `scripts/journey-landing-r148-20261119.js` (new) — r148 driver (r147
  verbatim + MOURN_PROBE default ON + LINK_PROBE).
- `evidence/2026-11-19/journey-landing-r148-prereg.md`,
  `journey-landing-r148-analyzers.sh`, `journey-landing-r148-full.log`,
  `journey-landing-r148-analyzers.log`, `journey-landing-r148-pilot.log`,
  `journey-landing-r148-pilot-analyzers.log`,
  `journey-landing-r148-refix.log`, `journey-landing-r148-refix-analyzers.log`,
  `journey-landing-r148-refix2.log`,
  `journey-landing-r148-refix2-analyzers.log` — evidence.

## Closeout

[To be completed: gate result, commits, ff-merge, worktree release,
rotation 0→1, lock deletion, heartbeat kill.]
