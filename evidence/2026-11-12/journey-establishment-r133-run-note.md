# Journey leg ESTABLISHMENT — r133 run note (2026-11-12, Lane A, adopted)

## Adoption (stale-lock recovery)
- This run (scheduled 02:45 CST) found the lock held by run
  `2026-11-12T04:01:32Z` (created 05:42:33Z) with NO registry entry for
  that run_id, and the `journey-establishment` tree heartbeat 67 min
  stale (07:36:44Z). Per the overlap guard: previous run DEAD, lock
  deleted, stale-lock recovery, proceeded. The r133 coordinator died
  mid-finalization (its heartbeat + flap-probe loops were SIGTERM'd by a
  runtime event ~05:41Z, per its prereg); the tree, branch, fix, and all
  panel evidence were intact. This run ADOPTED the held work (INSPECT
  HELD WORK): verified the fix, re-ran the analyzer + proof test + gate
  itself, and finalized the landing as this run's establishment leg.
- Rotation read `1` (establishment); write `1→2` at closeout.
- Base at adoption: local master `a0039d484` (branch base); master has
  since moved to `937f79040` (sim-repin-a). Rebase onto current master
  before merge (see below).
- Pre-flight: main tree clean, disk 39%. Second write flap was ACTIVE
  at 02:08 CST (08:08Z probe failed); probe passed at adoption
  (WRITE-OK, `git update-ref` round-trip in the worktree) — flap
  appears clear at finalization time; commit/merge steps re-probed.

## Leg question (r132's named next dial)
Cap the preserver grant at N units/day — does it stop the preserver
0→3 race without braking the entry rung? N=2 pinned by the r132
BEFORE-panel simulation. Fix: only the first 2 units of preserver XP
per villager per day count (`foodXpDay.preserverUnits`, reset on day
roll, keyed to the grant event inside `if (n > 0)`). Later batches
still preserve food; only specialist XP is capped. Butcher, cook,
builder untouched; rung 5/15/30 and askSpecialist (+1) unchanged. No
gate/price/threshold change (gating freeze stands).

## Panel (fresh band 2501–2516, 16 seeds, competent + withDelegate + HUNTSTAFF=2, 42d)
Analyzer: `scripts/analyze-journey-establishment-r133-20261112.py`
(full output `/tmp/r133-analyzer.txt` in the adopting run; panels in
`evidence/2026-11-12/journey-establishment-r133-{before,after}-seed*.json`).

- **Q1a PRESERVER PACE03 (AFTER): 0 (bar 0) — GO**
- **Q1b PRESERVER MOVES (AFTER): 11/16 (bar ≥6) — GO** (identical to
  r132 BEFORE: the entry rung is untouched)
- **Q1c BUTCHER UNTOUCHED: moves 6/16 vs control 6/16, pace03 0 — GO**
- **Q1d COOK/BUILDER: cook 16/16, builder 4/16, pace03 0 — GO**
- **Q1e SPOTTER: foodXp total 0 — GO**
- **CAP CHECK: AFTER max 2 granted preserver units/villager-day, 0 days
  over; BEFORE 157 villager-days over 2 (low bound; high 164) — GO**
- **BEFORE-VALIDITY: BEFORE preserver pace03 = 1 (seed 2513) — VALID**
- **Q1 verdict: GO.** The fix lands.
- Q2 invitations: answered 24/25 = 96% (bar ≥80%) — PASS (accept 21,
  decline 3, 1 unanswered spoken).
- Q3 null lines: 0 — PASS.
- M3 survival-42: 16/16 (bar 12). M4 pantry (0 starvation deaths):
  15/16 (bar 12).
- Proof test `scripts/test-journey-establishment-r133-preserver-unitcap.js`:
  **44/44 green** (re-run by the adopting run on the held fix).
- Gate: `node scripts/check.js --quick` — **335 passed, 5 failed in 854s**,
  identical set to r185's master run (phone-frame receipts staleness;
  2x 120s deed-attainment timeouts; balance-proof staleness;
  measurement-workflow 8/9). The balance-proof + workflow failures were
  verified directly as the stale-manifest state b7 already reproduced on
  master d98aae0f0 (`test-proofrefresh-b6`: 9 passed, 3 failed — validate
  "Proof source inputs are not current", measurement-workflow 8/9). Zero
  new failures from the fix; proof test 44/44.

## Village assessment (AFTER panel, plain words)
Sixteen villages ran the full 42 days; all 16 survived to day 42 and
none lost the village. 10–11 people alive at the end of a typical
village (seed 2501: 11 alive, pantry ~95k kcal; seed 2502: 10 alive,
~77k kcal). Pantries are fat by day 42 — food is not the binding
pressure in this window; the binding pressure is who learns what.
Practice moves everywhere: in seed 2501, 10 competence cells moved in
the first fortnight (wood/stone/mend/cook), 16 in the second, 13 in the
last — villagers genuinely get better at daily work by doing it.
Specialist ladders move early and then stall: 34 spec moves in d1–d14
across the panel, 24 in d14–d28, only 4 in d28–dEnd. The leg's story
is a fast first fortnight of learning, then routine. One hunter died
of a hunting wound (seed 2504, Juan, day 39) — the only
hunter-wound death on the panel; wounds still kill when no healer is
in camp. Healing happens: 220 healer rounds, 671 treat ticks, but only
2 treatment events changed an outcome (Deborah, seed 2501) — most
treating is tending, not curing, which matches the known medic-cure
gap. Wave 3 reached on the panel; no wave-4 kills in this window (not
the leg's question). Hunt-prep lessons: 3 lessons landed, 25 hunters
already held the skill, 43 prep rows found no teacher anywhere — the
teaching network is thin when the village's only skilled hunter is out
or dead.

## People check (16 AFTER convo transcripts, read in full)
Villagers read like people. Larry the dentist confesses he froze when
it mattered, is promised secrecy, teaches wild strawberry, then asks
"Do you believe in anything? Now, I mean. After everything." — and a
shared silence lands ("You say nothing. Neither do they, for a while —
and it's fine."). Helga, asked if she left someone behind, answers
"Yeah." A long quiet. "Me too." Saengkaew's taken son Aibek: the
pod-dream line lands with a real follow-through — the player promises
to ask the System about the pods, and she answers "You'd do that? Ask
it? ...Thank you. Really. Even asking is more than the silence." The
promise plants an owed action, not just a mood. Joyce, sick, still
invites the player to forage at dawn and sets the plan ("The ridge
above the creek, dawn. Bring a pack.") — no accept-then-back-out this
panel; the r132 instance does not recur. Invitations are answered 96%
of the time and the buried-cache reveal (food to the pantry) still
lands as a real consequence of accepting.

Standing watch — recurring canned lines (documented, NOT fixed in this
run: prereg scope is the grant path only; these are conversation-flow
defects for a later run):
- "Something in them almost softens — then doesn't. Not yet." — 11×
  (r132: 9×, still rising). Fires as a generic "go on" response, e.g.
  after a gossip line about Joyce humming at the beans, where nothing
  soft was happening.
- "They hear the warmth in it." — 11× (r132: 8×, rising). Same
  generic-goon-response pattern.
- Taken-kin pod-dream closing — 5× (Aibek the son, Heritier the
  brother, Mapula the sister). Details vary and the beat now resolves
  with an owed promise (Saengkaew), so it reads as a shared village
  preoccupation rather than a copy error — but the template is doing
  heavy lifting.
- "Take it for what it's worth." (gossip closer) — 4×, flat vs r132.
- "Sorry — I shouldn't load that on you. What's up?" (deflect pivot) —
  3× (r132: 4×).
- Gone this panel: field-teaching closer "Remember the leaf, the stem,
  the smell — that's the whole of it." (0×; the leaf/stem/smell
  teaching template persists in variants), stitched fragments ("Funny
  thing: Honest.", "I hum one note...") 0×, recap stutter 0×.

## Metric review
- The N=2 dial works exactly as the r132 simulation predicted: pace03
  0 on both the simulated bounds and the live panel, moves 11/16
  identical to control. The simulation method (fx-delta inversion,
  bounded both ways) is validated twice over now — trust it for the
  next dial.
- Q1c's control-relative bar (moves within 2 of BEFORE) was the right
  call: butcher moves 6/16 on both panels; the old ≥10 bar would have
  failed a healthy panel. Keep control-relative bars for ladder
  metrics; retire historical bands for them.
- The ladder stalls after d28 (4 moves in the last window vs 34 in the
  first). The unit cap does not cause it (BEFORE shows the same shape:
  5 moves d28–dEnd). Next establishment question, if the loop returns
  to the ladder: why does specialist learning stop after the second
  fortnight — is it pantry satiety, assignment saturation, or the rung
  math? The cap is not the lever for that.
- Q2's denominator fix (silence counts as unanswered) held: 25 offered,
  1 unanswered. No change needed.
- Metric review for the NEXT run: the "softens"/"warmth" canned
  goon-responses are now 11× each and rising — a conversation-flow
  question is owed (what should a "go on" actually do when the NPC has
  nothing soft or warm to offer?). Name it as the next people-check
  dial; do not fold it into a grant-path run.

## Telemetry
`telemetry-check.js` vs the r132 baseline (guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths, AFTER
panel 16 files): **quiet, no large deviations**. Baseline NOT rolled
forward: the AFTER panel is a fix-on panel on a fresh band, and the
baseline stays the r132 control until a future run decides otherwise.

## Landing
- Commit: `3d0032f2a` (original, on base a0039d484) — driver +
  analyzer + proof test + game.js fix + 32 panel JSONs + 32 convo
  transcripts + this run note (prereg was already committed by the
  r133 coordinator). Index-clobber struck on the safe-commit (all 70
  files staged-as-deleted); repaired via ls-tree -r + update-index
  --index-info, verified status + diff HEAD empty.
- Rebase onto master `fed635f1f` (bisect round-4 landings moved master
  during the run; first rebase attempt onto 937f79040 hit the
  documented stop-at-pick quirk — pick in both done and todo lists,
  tree clean — aborted and re-targeted onto the fresh SHA): new tip
  `6284f1ec1`, worktree clean. Proof re-run on the rebased tip 44/44.
  Gate re-run on the rebased tip: first attempt 332/8 (flaky — two extra
  120s timeouts under heavy parallel load, details lost to a piped
  tail); re-run with durable log 335/5 in 591s, the identical
  pre-existing set (measurement-proof-update, measurement-workflow,
  living-garden timeout, phone-frame receipts, one-person-army
  timeout) — see addendum.
- Rotation 1→2 written. Lock deleted.

## Addendum (adopting run, after rebase)
- Gate re-run #2 (durable log
  `goals/.../hidden_files/r134-gate2.log`): **335 passed, 5 failed** —
  `test-measurement-proof-update` (balance-proof staleness),
  `test-measurement-workflow` (8/9), `test-living-garden-deed-attainment`
  (120s timeout), `test-phone-frame-proof` (receipts stale),
  `test-one-person-army-deed-attainment` (120s timeout). Identical to
  the pre-rebase run and to r185's master run: zero new failures from
  the fix. The 332/8 first attempt was load flake (capable-bot and
  occupation-panels also timed out that run; both pass on re-run).
- Runtime restart mid-run wiped /tmp (gate log + hb loop lost); no work
  lost — worktree intact at 6284f1ec1, only the run-note edit
  uncommitted. Heartbeat + loop restarted; gate re-run written to a
  durable path.
- Master moved to 4a61100dd during the restart (Loop B 0730Z closeout:
  proofrefresh b7 + synergydisc-b landed) — second rebase owed before
  merge; see merge line below.
- Merge: [FILL at merge time].
- Measurement-proof refresh: still owed (no retained real
  observer-neutral panel exists; `balance-proof-update.js` validates
  and installs one, it does not generate one). This run lands src/js —
  the refresh stays owed with the reason, not silently deepened.
