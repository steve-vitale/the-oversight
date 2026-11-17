# sim-nondeathplan-b — BUILD NO-GO on the measured bars (fix built, proof-green)

Run: fleshout-loop-b-20261117T1130Z (Loop B), axis winnability chain,
arm sim-nondeathplan-b — BUILD: non-death plan cleanup in `win-plan.js`
(finding #2475, the follow-on to the just-landed deathcleanup).
Branch `sim-nondeathplan-b` (worktree `~/workspace/worktrees/sim-nondeathplan-b`).
Verdict: **BUILD NO-GO on the measured bars — but the fix is built,
proof-green (64/64), and ships direct on proof + code evidence.**
Bars 1 and 2(a) fail for the same reason: the band carries NO
non-death removals at all (0 of 93 removal calls in 8×150d competent
sims; the same zero on the deathcleanup band), so there was nothing
for the hook to clean and nothing for the control leg to reproduce.
Bars 2(b) (no ignition), 3 (cost), 4 (proof) and drift all pass;
the two legs are byte-identical trajectories. This is the outcome the
frozen prereg anticipated ("if the control leg shows ZERO lingering
entries, the verdict is NO-GO on bar 2(a)") — the build judgement
falls back to proof + code evidence, NOT a silent GO, and that
fallback is what is taken here: every removal path is hooked by
construction and fixture-proven per how (fled / splinter / exiled /
tribute / relay), the one bypass funnel is routed through the choke
point, the no-creation regression is proven, and the fix cannot
regress a sim it never fires in.

## Base + rebase

Base at arm start: master `3cb0782e5` (the brief's pin) — REBASED
clean onto local master `581a2551e` before any judged sim (the
brief's base check: master had moved; fast-forward, branch had no
commits; the 5 commits after 3cb0782e5 are evidence-only with zero
overlap in the target files). Note: local master `581a2551e` sits
ahead of origin/master `e390dff60` (merged locally, pending ship —
normal for this workflow). Proof re-run 64/64 on the final tip (see
§Proof).

## The fix, in plain words

A villager starts a win-plan (gear up, gather a party, walk out and
hunt the beasts the village needs dead). The villager LEAVES the
village alive — driven off, walked out, exiled, paid away, or named
for the relay. Until now the plan did not die with their leaving:
the deathcleanup fix hooks only death, so a leaver's plan lingered
in the census and their name stayed in living holders' parties.
The fix extends the same cleanup to every departure: the leaver's
own plan is deleted and their name is struck from every living
holder's party; a party/hunt plan left with nobody beside them falls
back to finding a new companion. It hooks at the one place every
departure passes through (the roster-removal choke point), plus the
one departure that bypassed it (a fled betrayer in a turn-based
fight, now routed through the choke point). A new counter,
`removalCleanups`, records when the cleanup actually cleans
something, so the fix is observable — it stayed at zero on this band
because no villager ever left alive.

## Removal-path inventory (found this arm)

- `removeVillager(vid, how)` (betrayal.js:1104) is the choke point
  for ALL departures. Non-death `how` values enumerated in this
  tree: `'fled'` (game.js:4406, bullied villager runs), `'splinter'`
  (game.js:5449, leadership loser walks out), `'exiled'`
  (game.js:31756 freeloader vote-out; betrayal.js:2220 trial
  sentence), `'tribute'` (table.js:206, two living wave-4 veterans
  paid away), `'relay'` (table-defiant.js:170/185, the relay's
  person named and taken). Generic passthroughs forward `how`
  unchanged (membership.js:201; comms.js:1196 is a pass-through
  wrap, not a bypass). The new hook is the `else` branch of the
  dead-mark block — it fires for every non-death `how` that reaches
  the end of the function, which is all of them (the only early
  return is the phoenix one, killed-only). The death branch is
  untouched.
- **BYPASS (found this arm):** `Game.tbEnd` (party.js:1438) — a
  fled betrayer in a turn-based betrayal fight was removed from the
  roster DIRECTLY (`v.roster = filter(...)`), bypassing
  `removeVillager` entirely: no exiles-ledger entry, no position /
  sick / doubt hygiene, no plan cleanup. Fixed by routing it
  through the choke point (`removeVillager(fled.villagerId,
  'fled')`); the `positions` / `v.party` / `v.followers` filters
  beside it stay, because removeVillager does not clean those.
  No `winPlan` literal was added to party.js, so the deathcleanup
  proof's static-reader allowlist stays green.
- NOT funnels (checked): `tbVillagerFalls` (death only);
  `registerDeath` (death record, fires before the phoenix
  decision — same non-hook ruling as deathcleanup);
  membership.js villageEats wrap (temporary roster filter for one
  meal call, restores after); game.js:2458/10311 (village
  creation/setup); betrayal.js:3472 (join — pushes, never removes);
  contests.js:6082 (inside `_cxKillContestant`, which also calls
  `removeVillager('killed')` — a death, already covered).
- Design detail, kept from the death method: the purge core is
  shared (`purgePartyRefs`), the entry delete in the leave method
  is spelled `delete v.winPlan[key]` (key === vid) with an
  explanatory comment — the deathcleanup proof pins exactly two
  `delete v.winPlan[vid]` spellings in win-plan.js (death method +
  table-active case), and a third would break it. The leave method
  uses the same non-creating read as the death method and never
  calls `stateOf()` on the no-plan path.

## Prereg + bars (frozen, evidence/2026-11-17/sim-nondeathplan-b-prereg.md)

Band 103241–103248 (fresh, verified at arm start), 150d, competent
verbatim (policy sha `df9b7dff4de4`), recorder ON both legs,
`NONDEATH_RECORDER=on` (new opt-in removals wrap in the deadplan
driver — records every `removeVillager` call {day, vid, how}; when
the env is unset no new code path executes, so the death leg is
byte-identical). GO iff all of bars 1–5 hold.

## Before / after (identical seeds, 8+8)

| Bar | Control (pre-fix) | Armed (post-fix) | Pass? |
| --- | --- | --- | --- |
| 1. Armed leg clean | — | lingering entry rows **0**, lingering party-ref rows **0**, BUT `removalCleanups` **0** (hook never fired — zero non-death removals) | NO |
| 2(a). Control reproduces defect | lingering entry rows **0**, party-ref rows **0** — **0 non-death removals on all 8 seeds** (93 wrap rows: 'killed' 90, 'ambushed' 3; derivation finds 0 bypass removals) | — | NO |
| 2(b). No ignition regression | no-plan seeds **3** | no-plan seeds **3** (Δ0, bar ±1), ignition suspects **0** | YES |
| 3. Cost bars (band totals) | deaths 570, median survival 143d, wave-4 kills 15 | deaths **570** (Δ0, cap +10%), median **143d** (Δ0, floor 114.4d), wave-4 kills **15** (Δ0, bar ±20%) | YES |
| Drift smoke (D3) | 7 seeds IDENTICAL; 103244 firstDivDay 138 = the doubled final-snapshot artifact (see §Drift), not a lever effect | | YES |
| Proof | `scripts/test-nondeathplan-b.js` **64/64** on the final tip (incl. D1 determinism + 150d live run: 0 lingering entries, 0 lingering party refs) | | YES |
| Panel (§15) | compare `review_required`, investigated: every judged metric delta 0 on 16/16 pairs, all 4 policies; panels verified as a genuine contrast (sourceDigests differ, both sourcesStable, neutrality 4/4) — no material signal | | PASS (on investigation, not the label) |

Per-seed: armed and control trajectories are byte-identical (the
full corpora differ only in run/leg/anchor labels and the new
`removalCleanups: 0` key in `winPlanStats`). All 16 per-seed files
parse; 0 instrument errors on both legs; validity clean. The fix
never executes in these sims, so the legs cannot differ — the
identical numbers are the finding, not a bug in the comparison.

Wall numbers (both legs identical — the scale wall is untouched by
a fix that never fires, as expected):

| | Control | Armed |
| --- | --- | --- |
| national by standing (≥200) | 2/8 | 2/8 |
| national by scaleRank | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave-4 reached | 8/8 | 8/8 |
| wave-5 reached | 2/8 | 2/8 |
| wave-4 kills | 15 | 15 |
| wave-5 kills | 3 | 3 |
| median survival | 143d | 143d |
| deaths | 570 | 570 |

Per-seed (control = armed on every row): 103241 survived 151d,
standing 199, wave 4, 77 deaths, plans yes; 103242 lost d112,
standing 199, wave 4, 59 deaths, NO plans (sleeping village);
103243 lost d140, standing 199, wave 4, 68 deaths, NO plans;
103244 lost d138, standing 340, wave 5, 92 deaths, plans yes;
103245 lost d114, standing 175, wave 4, 46 deaths, NO plans;
103246 survived 151d, standing 175, wave 4, 73 deaths, plans yes;
103247 survived 151d, standing 199, wave 4, 75 deaths, plans yes;
103248 lost d146, standing 375, wave 5, 80 deaths, plans yes.
Four seeds sit at exactly standing 199 — the known standing-199
stall (a deferral, not a cap), not a new observation. No-plan seeds
3/8 on both legs — the same sleeping villages, so the cleanup
ignited nothing.

## Sense-testing (mandatory, prereg §Sense-testing)

There is no leaver to tell a story about: zero non-death removals
on either leg means no villager ever left alive in these sims, so
no talk line on either leg could treat a removed villager as still
planning. Verified, not assumed: all 217 `vetSays` lines per leg
were scanned — 0 exile / splinter / fled / relay / tribute
mentions on either leg. The single line matching a "waiting"
pattern is a monster-description line, not a villager line:
103243 d121, both legs, "⚠ This one is different — scarred,
braced, waiting for your opening. A Scarred veteran." The defect
was silent in talk for the same reason the death defect was: plans
linger in data, never voiced — and here, nobody ever leaves for
the talk to be wrong about.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- The control leg did NOT reproduce the defect on this fresh band
  (bar 2(a)): 0 non-death removals of any kind, on all 8 seeds.
  The same zero shows on the deathcleanup band 103231–103238
  (derivation over its corpora: every roster disappearance is a
  death). Non-death removals are effectively unreachable under the
  competent policy in 150d: exile needs a freeloader vote or a
  moot sentence, splinter needs a lost leadership fight at trust
  ≤25 plus a 15% roll, fled needs the scholar to bully someone,
  tribute needs two living wave-4 veterans, relay needs the
  endgame table (0/8 reached it). A live observation needs a
  player-present run or a staged-removal fixture — not another
  competent band. Filed as a finding.
- No removal bypassed either hook site in a way the instrument
  could see: the derivation found 0 bypass removals (the party.js
  path never fired in these sims — no betrayer fled a TB fight —
  so its choke-point routing is fixture-proven only, by the
  static check + the `removeVillager('fled')` unit cases).
- The stage fallback (`hunt` → `party` on empty) did NOT fire on
  a removal in the armed leg (no removals). It DID fire visibly on
  deaths on this band — the deathcleanup fallback working as
  designed (see below) — which exercises the same shared
  `purgePartyRefs` core the leave method calls.
- `removalCleanups` fired for NO how in live sims (all zero).
  Per-how firing is fixture-proven only (proof 64/64: one
  `removeVillager(vid, how)` case per how).
- The ignition check (bar 2(b)) held: the same 3 sleeping villages
  on both legs (103242, 103243, 103245), 0 suspects. The cleanup
  creates nothing in a plan-less village (also proven in fixtures
  on a bare village object).
- 150d was the right horizon for the cost bars (they separate
  cleanly — identically, here) and long enough to show the
  removal rate is zero across full runs, not a short-window miss.
- Death-leg side note (NOT this arm's bars, but the analyzer
  reports it): the deadplan classifier reads COSTLY on this band
  (slotTotal 3) with zero lingering — all 3 instances are
  single-day death-day rows (catalina_reyes naming gen_8noj3cq,
  d114, died "the wild" d114; two holders naming katarina_novak,
  d65, died "the wild" d65). Each ref is gone the next day, and
  both 103247 holders fell back hunt→party on d66 exactly as the
  deathcleanup design intends. The classifier counts the death
  day's own census row (the daily snapshot precedes the death
  within the day), so a band can read COSTLY with zero lingering.
  Filed as a finding: future arms should read slot holder-days
  ≥2 (or exclude the death day) before calling a band COSTLY on
  the slot count alone.

## Balanced panel (per docs/MEASUREMENT.md §15)

PANEL COMPLETE (adoption run, 2026-11-17T14:49Z). At adoption the two
legs held 47/68 cases each (capable + risk-aware complete, socialite
13/17, winseek 0/17 — the dead run died mid-panel). The adoption
re-ran both panels on their original tips with `--par 2`, reusing the
47 cached cases each and computing the missing 21 jobs per leg:
before 64 cases / 47 cached, after 64 cases / 47 cached, both
`panel.json.gz` written. Base panel (`nondeathplan-panel-before`,
control src at instrument commit 6a240d9ae, registered worktree
sim-nondeathplan-panelbase) and lever panel
(`nondeathplan-panel-after`, armed src at 6eaa6b2d) ran with
`--n 16 --days 150` (4 policies × 16 seeds × 150d).
Compare command: `node scripts/balance-panel.js compare --before
evidence/2026-11-17/nondeathplan-panel-before/panel.json.gz --after
evidence/2026-11-17/nondeathplan-panel-after/panel.json.gz --out
evidence/2026-11-17/nondeathplan-b-panel`.

Decision: **review_required** — investigated, bar 5 judged PASS (see
below). The two panels are a genuine before/after contrast, verified
from the `.gz` metadata, not assumed: sourceDigests differ
(before `b43003ba…`, after `fe085f85…`), heads differ (before
6a240d9ae, after 6eaa6b2d), both `sourcesStable: true`, neutrality
proofs 4/4 match on both. Every judged metric on all four policies
reads paired delta exactly 0 on 16/16 pairs with 0-to-0 exploratory
intervals — table entry/sitting, national access, bearer survival,
player/village deaths, community loss, living NPCs, reserves,
hydration, HP, hunger, named-class access, tier-3+ gear. The
`review_required` label comes from the descriptive / insufficient /
not-observed rows (table win rate, corpse gear, bearer changes,
ability events, nourishment share, trap/snare/pit luck on thin
pairs), not from any moving metric: nothing moved, so there is no
material signal in either direction. This is the same judgement as
the deathcleanup panel (review_required, no material signal, bar
judged PASS on the investigation, not the label). The fix never
fires in panel sims either — consistent with the competent-band
finding that non-death removals do not occur under bot play — so a
zero-delta panel is the expected outcome, not a missing measurement.

## Drift (D3)

Seed 103244 reports firstDivDay 138 with firstLeverDay null. That
is NOT a trajectory divergence: the two legs' full corpora are
identical except for run/leg/anchor labels and the new
`removalCleanups: 0` key, and the day-138 daily snapshots match
across legs pairwise (control 138[0] == armed 138[0], control
138[1] == armed 138[1]). The cause is the driver's doubled
final-day snapshot (one in the daily loop, one after runDays —
the two differ within a leg) combined with the drift check's
`aByDay` map keeping only the last snapshot per day, so it
compares control's first 138 snapshot against armed's last 138
snapshot. The analyzer's per-seed note now says so (correction
commit 6eaa6b2d); driftClean holds.

## Proof

`scripts/test-nondeathplan-b.js` 64/64 on the final tip
(c554149ca + analyzer note fix 6eaa6b2d; adoption correction: the
party.js tbEnd catch now reports via `console.warn` instead of
swallowing silently, per the repo no-empty-catch rule — one line,
behavior-identical; proof re-run on the rebased tip is recorded in
the adoption addendum, evidence/2026-11-17/sim-winnability-round-1409.md): static (branch src diff exactly win-plan.js +
betrayal.js + party.js; leave method exists; the deathcleanup pins
still hold — delete-count 2, death bump line exact, death method
called exactly once in removeVillager, tbVillagerFalls intact,
registerDeath not a hook, staticReaderCheck clean, party.js routes
through the choke point with no `winPlan` literal); unit fixtures
(one `removeVillager(vid, how)` case per non-death how, each
deleting the plan + purging party refs + bumping `removalCleanups`
only; stage fallback; idempotency; standing-plan stage kept;
no-creation regression on bare/empty villages); live integration
(lethal `hurtVillager` bumps `deathCleanups` only;
`tbVillagerFalls` intact); D1 determinism (armed code twice, 60d,
seed 103241, identical full corpus); 150d live run (0 lingering
entries, 0 lingering party refs). The deathcleanup proof test was
NOT re-run as a gate here — its static checks are re-asserted
inside this proof (the pins section); a full re-run is coordinator
work if wanted. Two test bugs found and fixed during the run (a
porcelain-slice off-by-one in the src-diff check; the standing
fixture pair reusing surviving companions — seed 103241's fixture
village has 11 NPCs, not 12).

## Infrastructure

- WRITE FLAP: no flap observed this run (writes all clean).
- Safe-commit index clobber struck all three content commits
  (prereg, instrument, fix — staged-deleted + untracked ghosts,
  commits themselves correct) — repaired each time via
  `git ls-tree -r HEAD` + `git update-index --add --index-info`;
  status clean + diff HEAD empty afterwards. The analyzer-note
  commit did not clobber.
- Runtime restart interrupted the first panel-base worktree
  registration (~4 min in, still in the reap phase); verified no
  effect (no directory, no registry entry) and retried — the
  retry took ~12 min, almost all of it the register script's
  `worktree-reap.sh` phase (the known 9–14 min lock-holding
  scan). Registration itself was clean afterwards.
- `validate-ontology.js` regenerated `docs/ONTOLOGY.md` (the
  Provides line gains `winPlanOnVillagerLeave(vid)`) — included
  in the fix commit, as intended.
- Telemetry deviation check (adopter): **documented refusal** —
  `telemetry-check.js` refuses the recorder-corpus input (all 8 armed
  rows carry `anchorCommit`; recorder corpora are compared with
  sweep-compare tables, never against a run baseline). Baseline NOT
  rolled, per the prereg's instruction not to work around a refusal.

## Ship call

Direct fix, NO env gate — the frozen prereg's ship call, taken on
the fallback judgement (proof + code evidence, no regression
anywhere: paired legs byte-identical, no ignition, panel complete
with no material signal — see §Balanced panel). The fix changes no
behavior in any sim that produces no leaver, and the only behavior
it adds is the one the finding named.
Merged locally, pending ship (the batch ship loop owns version
bumps, pushes, live verification).

## Findings appended

- [open] 2026-11-17 — win-plan lifecycle — non-death removals
  never fire under the competent policy (sim-nondeathplan-b).
- [open] 2026-11-17 — measurement / deadplan classifier — slot
  count includes the death day's own census row
  (sim-nondeathplan-b).
- Finding #2475 (deathcleanup-b: non-death removals leave plans
  lingering) stays [open]: the fix for it is built (c554149ca)
  but measured NO-GO on bars 1+2a — it needs a live observation
  (player-present run or staged-removal fixture) before it can be
  called proven in play.

## Evidence artifacts

- Prereg: evidence/2026-11-17/sim-nondeathplan-b-prereg.md
- Analysis: evidence/2026-11-17/nondeathplan-b-analysis.json
- Corpora: evidence/2026-11-17/perseed-nondeathplan-b-{control,armed}/
  (8+8 valid JSON, 0 instrument errors)
- Panels: evidence/2026-11-17/nondeathplan-panel-{before,after}/
  (64 cases each), compare evidence/2026-11-17/nondeathplan-b-panel.md
  (decision review_required, investigated — no material signal;
  completed by the adoption run, 2026-11-17T14:49Z)
- Proof: scripts/test-nondeathplan-b.js (64/64 on final tip)
- Fix: src/js/win-plan.js + src/js/betrayal.js + src/js/party.js
  (+ docs/ONTOLOGY.md regenerated Provides line)
