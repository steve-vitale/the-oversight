# sim-curiousw4-a — curious-default escalation for wave 4 (Loop A 20261103T0518Z, axis scale-onramp)

## Prereg summary (binds this run; full text: scripts/curiousw4-prereg-20261103.md)

- Question: does escalating the curious default for wave 4 convert
  the wave-4 deed gap into wave-4 deeds? This arm is the curious-
  escalation ONLY — not bundled with feast-draw rates or sortie
  changes, and it does not repeat patrols or sortie answers.
- Grounding (verified before the prereg was written): the baseline
  curious default is competent.js's ASK ABOUT BEAST TRICKS block
  (once per day, gated by counterTeachable()). That channel can NEVER
  teach a wave-4 trick — counterTeachable() iterates only types with
  a `counter` field, and ALL wave 3–5 types carry none (verified
  against src/data/monsters.json). Wave-4 trick knowledge lives only
  in villagerTrickDefs() + _trickObservation() (two survived
  encounters per type). The closest grounded policy-side knob is
  therefore escalation from ASKING at the fire to EXPERIMENTING in
  the fight: in a player turn-based fight with a live wave-4 beast,
  press the fight's OWN enabled signature verbs (sigW4CombatButtons,
  the capable.js-proven pattern) instead of the baseline's generic
  strike that turn. Baseline competent.js never presses any sigW4
  verb (zero references) — the buttons were UI-only for this stack.
- Primary metric: distinct wave-4 monsters fought per seed (deed
  feed, fought-by-name, never offered-name). Judged quantity: number
  of pilot seeds with >= 1 distinct wave-4 fought, variant minus
  baseline, on identical seeds.
- GO iff BOTH: (a) delta >= +2 seeds, AND (b) cost bar clean: (1)
  starvation deaths variant <= baseline + 2; (2) fighter-attributed
  arm deaths (scholar deaths inside a sig-pressed fight, driver
  tele-wrap keyed to sig-pressed fight ids, NOT day-joined) <= 2
  across the pilot; (3) median survival variant >= 0.8x baseline.
  Anything else = KILLED.
- Horizon: 180d death-aware cap. Seeds: 98501–98508. Baseline:
  closecommit stack verbatim (leadfeast + windefer + seatdrive +
  fullseat-diag + titanroute + musterclose + mustergap), mode herald,
  env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1. Variant: baseline + scripts/policies/
  curiousw4.js (`withCuriousW4`, fight-only override, no RNG).
- Comparison instrument: the identical-seed driver table (not the
  balanced panel — POLICY_REGISTRY in scripts/sweep-compare.js
  contains neither the closecommit stack nor the curiousw4 wrapper,
  and editing the observer mid-comparison would change the
  instrument; stated in the prereg before any sim, not discovered
  after).

## Seed freshness (verified before any judged sim)

Exact-token grep over tracked scripts/ + evidence/: no prior judged
sim-seed use of 98501–98508. The only scripts/ hit is
scripts/sortie-prereg-20261103.md, which names 98501–98508 solely as
its own conditional fallback band that was never triggered (that arm
ran 98401–98408). Evidence/ hits (113 files) are the known
false-positive class, sampled and inspected: pantry-kcal values
(cumTakes 98506, pantryFreshAfter 98506/98508) and float fragments
(940298508 inside a longer decimal) — never a seed field, SEEDS
list, seed filename, or seed mention. A seed-field pattern check
(`"seed": 9850x`, `s9850x`, `98501-98508`) returned zero files. The
band stands; the fallback (98601–98608) was not needed.

## Before/after numbers (identical seeds 98501–98508; full table: curiousw4-compare.md)

- Seeds with >=1 wave-4 fought: baseline 5/8, variant 5/8. Delta **0**.
- Total distinct wave-4 kinds (descriptive, NOT judged): baseline 16,
  variant 17.
- Per-seed w4 counts, baseline → variant: 98501: 0 → 0; 98502: 2 → 4;
  98503: 0 → 0; 98504: 3 → 3; 98505: 0 → 0; 98506: 1 → 1; 98507: 5 → 5;
  98508: 5 → 4.
- Cost bar: (1) starvation deaths baseline 3 → variant 3 (PASS, bar
  baseline+2); (2) fighter-attributed deaths in variant = **8**
  (98502: 1, 98504: 2, 98507: 2, 98508: 3) — FAIL, bar <= 2;
  (3) median survival 90d → 92.5d (PASS, bar 0.8x).
- Availability: sig verbs fired on 4/8 variant seeds (24 uses total:
  Out-entertain 8, Contradict 5, Poison meal 4, Leave 2, Meet demand 2,
  Tank 2, Refuse 1). Zero-sig seeds have byte-identical trajectories
  to baseline — the layer is inert without a wave-4 player fight,
  which is the control working.
- Descriptive gains (NOT judged): wave-4 kills 1 → 4 (player 1 → 3,
  companion 0 → 1); wave-4 tricks known at run end baseline
  {eulogy, herald, suburb} → variant {eulogy, herald, strike} — the
  Strike trick is newly learned (98502), the Suburb trick is lost to
  a trajectory shift; tableDone/won 4/8 → 5/8 (98504 flips from
  village-lost at day 149 to a win at day 139).
- Proof test scripts/test-curiousw4-a.js PASSED before the pilot
  (17 forbidden-token checks + stub-Game determinism: priority order,
  per-fight caps, disabled buttons never pressed, wave-3 fights
  untouched, low-HP gate on Suburb Rest, zero random calls). Per the
  kill protocol the proof test is DELETED with the policy at
  closeout (see below) — its passing result is recorded here, not
  lost.

## Verdict: KILLED

Leg (a) fails (delta 0, needs +2) and cost leg (b2) fails (8, needs
<= 2). Legs (b1) and (b3) pass. A miss is NO-GO; the 98502 gain
(2 → 4 wave-4 kinds), the +1 total kinds, the kill gain, the Strike
trick, and the table gain are NOT re-scored as a pass.
Per the prereg kill protocol: the policy file
(scripts/policies/curiousw4.js) and the proof test
(scripts/test-curiousw4-a.js) are DELETED at closeout. Kept: prereg,
driver, per-seed JSONs, this evidence file, and curiousw4-compare.md.
No game-code change was ever made, so there is nothing to revert in
src/.

## Sense-test (read transcripts, judged for meaning — SENSE-TESTING LAW)

Read: per-seed sigLines for variant 98502 (d67–95), 98508 (d64–95),
98504 (d112–138); full says in /tmp (kept, not in repo).

1. The sig verbs read as real, costly choices, not free wins. Leaving
   the Suburb: "You walk past the last streetlight and don't look
   back. Behind you, the suburb exhales — a whole zip code sighing.
   (ESCAPED. Routed, no loot, no mortgage.)" Then the honest
   observation beat: "You lived to tell it — The Suburb's moves are
   burned into your memory. (1/2 — one more survived encounter and
   you'll have its trick.)" The curiosity loop the prereg named is
   visible in prose: survive, remember, come back knowing more.
2. Meeting the Strike's demand is a genuine non-violent resolution,
   not a skip: the rat posts a readable demand list, the scholar
   meets one, "the rat deflates to a normal (house-sized, still
   alarming) rat and leaves." The village pays in stillness and a
   tool, not blood — and the deed still records, because the fight
   was faced.
3. Tanking the Algorithm is honest about its limits: "You tank on
   purpose — a weak, boring, utterly unengaging turn. The Algorithm's
   thumbnails glitch... Its predictions go soft for 2 rounds." Then
   it still hits for 42, 53, 41. The trick softens the fight; it does
   not trivialize it. Same shape for the Eulogy: contradictions cross
   lines out and count verses down ("5 verses remain... 2
   contradictions — at 3, you can rewrite the ending"), while the
   scholar still takes 28/26/31. A phone player reading this would
   understand exactly what the verb bought and what it cost.
4. One attribution wrinkle, stated plainly: the 8 attributed deaths
   all carry cause "the wild" with the scholar's villager id — these
   are scholar deaths inside sig-pressed fights, but fight membership
   is not causation. The scholar dies often in this band anyway
   (38 baseline scholar deaths across the pilot, succession
   continuing the run), so some of the 8 would likely have died in
   the same fights under baseline tactics. The leg fails as written
   regardless, and leg (a) fails independently, so this review does
   not rescue the verdict — but the next run should not read "8
   deaths in sig fights" as "8 deaths caused by sig verbs."

## Village assessment (plain words)

Picture eight villages on the same competent playbook. None becomes
national; half take a seat and win by about day 90, the rest die
between day 29 and day 149. Wave 4 unlocks in six of eight villages
but wave 5 never appears anywhere, and no village ever fights a
wave-5 monster. When the scholar does meet a Mirror Draft monster
face to face and tries its offered trick — leaving the suburb,
meeting the strike's demand, tanking the algorithm, contradicting
the eulogy — the tricks work as advertised and read beautifully,
and one village even learns the Strike's trick for good. But the
deed list barely moves: one village gains two new wave-4 kinds,
another loses one as its whole story shifts, and the rest stand
still. Pressing the offered tricks is not a broken button — it
fires, it costs, it teaches — it is a better way to fight the
monsters that already arrive, not a way to make new kinds arrive.
The wall itself is unchanged by this arm: national 0/8, wave-5 0/8,
in both arms.

## Wall numbers (pilot)

- National / table / wins: baseline 0 / 4 / 4; variant 0 / 5 / 5
  (table = tableDone, seat taken; national = rank national/global).
- Wave 4–5 unlocks: wave 4: 6/8 both; wave 5: 0/8 both.
- Wave 4–5 fought: wave 4: 5/8 seeds both; wave 5: 0/8 both.
- Median survival: baseline 90d, variant 92.5d (max 149d / 142d).
  Caveat: win-ending runs (~day 90–95) and village-loss runs
  (day 29–149) mix here, so this is days-to-end, not days-to-death;
  the 180d death-aware cap never bound.

## Required metrics (as far as this pilot band supports them)

- Win rate: baseline 4/8, variant 5/8 (won flag; see the national
  caveat above — these wins are not national-scale wins).
- Vesting / national reach: national 0/8 both; vesting is not a field
  in this driver's output and is not claimed.
- Arc reach: not recorded by this driver (no arc field) — not claimed.
- Wave reach: wave 1–2 all seeds; wave 3: 7/8 both; wave 4 unlocked
  6/8, fought 5/8; wave 5 unlocked 0/8, fought 0/8.
- Four-realm formation, trap acquisition by source, counter
  discovery / counter-kill rate beyond the wave-4 trick sets above,
  young-link succession survival, tier-2 reach: not instrumented in
  this driver — not claimed. Wave-4 trick sets at run end are
  reported descriptively above; wave-4 kills by path: baseline 1
  (player), variant 4 (player 3, companion 1).
- Median / max survival: 90d / 149d baseline; 92.5d / 142d variant.
- Death-cause shares: see curiousw4-compare.md (baseline 333 deaths,
  variant 334; villager combat ~52%, combat ~19%, the wild ~9%;
  starvation 3 → 3; scholar deaths 38 → 34; sig-fight scholar deaths
  8 in variant).

## Metric review (for the NEXT run — never re-scored in this one)

1. Cost leg (b2) as written joins scholar deaths to sig-pressed
   fights BY FIGHT IDENTITY, which is stricter than the sortie-b
   day-join but still not causation: a scholar who dies inside a
   sig-pressed fight is counted even when the sig verb was not the
   killing factor (the fight itself, and the scholar's baseline
   death rate of 38/pilot, are the confounders). The leg still fails
   on the descriptive total too (variant scholar deaths 34, not a
   clean number to set a bar from), so this review does not rescue
   the verdict — but the next run should define the cost bar as
   deaths the layer can actually cause (e.g. scholar deaths in the
   same fight AFTER a sig press, with a baseline matched-fight
   comparison), or drop (b2) for a fight-tactics layer in favor of
   the starvation + survival legs.
2. The judged quantity (seeds with >=1 wave-4 fought) is coarse on a
   band where baseline already sits at 5/8: a +2-seed move needs
   converting two of the three zero seeds, and two of those three
   (98501, 98505) never unlock wave 4 at all — no fight-layer policy
   could have moved them. The next run should either pre-screen for
   wave-4 unlock or judge on unlocked seeds only.
3. The prereg's claim that turn-based fight deaths read generic
   'combat' was wrong for scholar deaths: all 8 attributed deaths
   carry cause "the wild". The attribution mechanism (fight id +
   player flag) is unaffected, but a future prereg should not assert
   a cause value it has not sampled.
4. The literal curious-escalation finding stands and should be
   recorded as a closed blank, not re-tested: askAbout beasttricks
   cannot teach wave-4 tricks (no `counter` field on any wave 3–5
   type), and the fight-verb escalation of that curiosity is now
   measured — it improves how wave-4 fights play, not how many
   wave-4 kinds are faced. The remaining scale-onramp question is
   arrival (why two seeds never unlock wave 4; why unlocked seeds
   still sit at 5/8 fought), not curiosity.
5. Balanced-panel limitation stands as preregistered (see prereg
   summary). No panel compare is attached; the identical-seed driver
   table is the comparison.

## Reachability verdict (content in this arm's area)

- Wave-4 signature verbs in player fights: REACHABLE — 24 presses
  across 7 verb kinds on 4/8 seeds, all with honest narration and
  costs.
- Wave-4 tricks via survived encounters: REACHABLE — baseline already
  banks eulogy/herald/suburb tricks; the variant newly banks the
  Strike trick on 98502.
- Wave-4 deeds via curiosity escalation: NOT moved by this arm
  (delta 0 on the judged seed count; total kinds +1 descriptive).
- Wave 5, national scale, full-seat climb: NOT reached by this arm
  (0/8 wave-5, national 0/8 both arms, unchanged).

## Infrastructure notes (for the coordinator, not the verdict)

- A host EPERM flap blocked git object writes and /tmp writes for
  much of this run (first safe-commit attempts failed with
  "sha1 file '/tmp/idx-safecommit-*.lock' write error" and later
  "unable to write loose object file"). Plain worktree writes flapped
  OK/EPERM across seconds. The flap passed at ~06:03 UTC, when the
  prereg commit (67e6ed342) and tools commit (bdd725c81) landed via
  the ORIGINAL scripts/safe-commit.sh. A temporary copy of the script
  with only the index path moved (~/workspace/safe-commit-cw4.sh)
  was created during the flap, never succeeded, and is deleted at
  closeout — no commit in this run used it.
- After BOTH safe-commit.sh commits, the known index-clobber
  appeared (committed files shown as staged-deleted though
  byte-identical to HEAD). Repaired both times with
  `git update-index --add --cacheinfo` from HEAD blobs; verified
  `git status` clean (apart from intended untracked files),
  `git diff HEAD` empty, `git diff --cached` empty, hashes match.
  The commits themselves were correct throughout.
- The driver now prints its per-seed summary BEFORE writing the
  JSON and retries file writes for ~2 minutes (EPERM-flap hardening
  from a smoke run whose data was lost to a single failed write).
  That change is in the committed driver (bdd725c81).
- The worktree heartbeat landed after the flap passed
  (worktree-heartbeat.sh sim-curiousw4-a). An earlier heartbeat
  attempt failed with a registry PermissionError during the flap.

## Files

- Prereg / driver / policy (policy deleted at closeout per kill
  protocol): scripts/curiousw4-prereg-20261103.md,
  scripts/curiousw4-driver-20261103.js, scripts/policies/curiousw4.js
  (DELETED).
- Proof test (passed, then DELETED per kill protocol):
  scripts/test-curiousw4-a.js.
- Compare: evidence/2026-11-03/curiousw4-compare.md.
- Per-seed JSONs: evidence/2026-11-03/perseed-curiousw4-a/ (16 files,
  RUN=cpilot; smoke files from validation were deleted before the
  pilot and are not in this set).
- Evidence: evidence/2026-11-03/sim-curiousw4-a.md (this file).
