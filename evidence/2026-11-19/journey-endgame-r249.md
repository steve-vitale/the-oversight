# journey-endgame r249 — run note (adoption of the timed-out Lane B run)

Adoption of the scheduled Lane B endgame run r249 (10:58 CST Nov 19, 2026),
which hit its budget after playing Pass A, the smoke seed and Pass C, but
before analyzing Pass C or running Pass C-wide / Pass D. Everything below
verified from files/git by the adoption; the timed-out run's word was taken
for nothing. Worktree `~/workspace/worktrees/journey2-endgame`, branch
`journey2-endgame`, base master `1927a245e` (r249 prereg substrate). Prereg:
`evidence/2026-11-19/journey-endgame-r249-prereg.md` (head deltas
b76d65445→1927a245e; live deltas (a) counter-label fix, (b) F6/F5 fallback
fix, (c) maps-pool expansion, (d) F8 confide gate, (e) F2 titan refusal
counts, (f) #2593 ammo naming; env-gated (g) BOWOPEN/SPEARGATE, (h)
SENSEEXPED, (i) ALLYSLOT3 not in src/js, (j) PARTYSIZE4/FIGHTALLY2/etc.
gated).

## Adoption recovery

- Liveness: at adoption start (~16:57Z) the worktree heartbeat read
  16:53:10Z (fresh) but no r249 processes and no WT_RUN_ID coordinator
  were visible in `ps`. Re-checked at ~17:09Z: heartbeat stuck at
  16:53:10Z (>15 min stale), still no r249 processes, no coordinators.
  The timed-out coordinator had shut down without a final heartbeat.
  Adoption took over heartbeating (hbloop pid 158169, every 5 min) until
  session end. Lock `playtest-loop-2.lock` run_id `2026-11-19T15:55:44Z`.
- Flap: the 09:46Z write-refusal window had cleared by 17:07Z (watcher
  ALL-OK, write probe OK). No flap interference during the adoption.
- Pass C analyzer run by the adoption (the timed-out run never ran it):
  `evidence/2026-11-19/journey-endgame-r249-analyze-c.log` (416 lines).

## Headline: the matched band mostly reproduces r246; 89702 takes the full seat a third straight time

Pass A and C on seeds 89701–89705 diverge from r246 only where the prereg
said they might (dialogue/RNG-draw shifting from the live deltas). The
headline reproduction stands: **89702 takes the full seat at d101, deed
gate first OK d86 — identical seed and day to r243 and r246, the third
straight reproduction.** 4/5 Pass C seeds are bit-identical to r246
(89701, 89702, 89704, 89705 — same sat day, census, outcomes); only
89703 diverged (sat d92→d90, lost its one vKill, causalDeaths 1→0,
blockedArr 24→16; M25c buy d44→d42, pantry 20888→29059).

| pass | lesser | full | lost | won | kills | M23b | M25c bought | verdict |
|------|--------|------|------|-----|-------|------|-------------|---------|
| A    | 5/5    | 0/5  | 0/5 | 5/5 | 10 | 0/5 | n/a (disabled) | PRIMARY GO \| ALL GO |
| C    | 4/5    | 1/5 (89702 d101) | 0/5 | 5/5 | 9 | 1/5 (89702@d86) | 5/5 | PRIMARY GO \| ALL GO |
| C-wide | 6/8  | 0/8  | 2/8 (89821, 89826) | 6/8 | 7 | 0/8 | 8/8 | WIDE GO |
| D (FIGHTALLY2) | 5/6 | 1/6 (89705 d74) | 0/6 | 6/6 | 9 | 1/6 (89705@d73) | 6/6 | PRIMARY GO \| ALL GO |

Smoke 89706: lesser win d98 (r246: village-lost d69) — same seed, different
fate. Corpus purity 5/5 (A, C), 6/6 (D), 8/8 (C-wide). NOTICK deferrals 0
and trioCarry 0 on ALL FOUR passes — the instrument records clean zeros
again; the r243 instrument gap stays closed.

## Pass A (control; competent policy, no capstone)

PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. Lesser 5/5, sat days
89701 d90 (r246: d119), 89702 d90 (=), 89703 d107 (r246: d118),
89704 d105 (=), 89705 d104 (=). w4plusKills [2,5,2,0,1] = 10 vs r246
shared-5 [1,5,0,0,1] = 7. M23b 0/5. The two earlier sat days (89701,
89703) and the extra kills are the dialogue/RNG-draw shift the prereg
allowed for, not a lever effect — no live delta touches fight math.

## Pass C (CAPSTONE + BUYOUT + BUYOUT_EARLY)

PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. Lesser 4/5, **full 1/5
(89702 d101, firstFullSeatDay d87, deedGateFirstOk d86 — identical to
r243 and r246)**, lost 0/5, won 5/5, w4plusKills [2,3,1,1,2] = 9
(identical to r246 on the 5 shared seeds), M23b 1/5 (89702@d86
DELIVERED). M25c 5/5 bought early (d48/d18/d42/d39/d17 — all but 89703
identical to r246). M23-capstone 1/1 delivered, pricedFull 1/1.

## Pass C-wide (fresh band 89820–89827)

WIDE-VERDICT GO | M25c + purity. M25c 8/8 bought early (d84/d46/d51/
d51/d41/d42/d41/d56). Lesser 6/8 (d93/d90/d111/d90/d98/d91), full 0/8,
lost 2/8 (89821, 89826), kills 7 (r246 C-wide: 3), M23b 0/8. The 89821
loss is a buyout-starvation story worth naming: bought d46 with pantry
8521, spent 8121, left 400 kcal — then Kayden d55, Greta d61, Alejandra
Walsh d63, Ava d65 starved and the village collapsed. The early buyout
can eat a village that buys too lean. (r246 C-wide lost 1/8, 89817 d48
starvation collapse — same shape, different seed.)

## Pass D (FIGHTALLY2 — fourth sighting)

PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. Lesser 5/6, **full 1/6
(89705 d74 — a different seed takes the full seat than in Pass C)**,
lost 0/6, won 6/6, w4plusKills [1,4,1,0,3,0] = 9, M23b 1/6 (89705@d73
DELIVERED, feast_embassy). M25c 6/6 bought. **FIGHTALLY2 stays
env-gated OFF**: D kills 9 = C kills 9 on the same band, no uplift on
the binding number; the full seat moved seeds (89705 instead of 89702)
but the total did not move. Fourth sighting, same verdict as r243/r246.

## People check (full-seat transcript read in full)

89702 Pass C full-seat transcript (1,097 lines) read end to end. Same
script as r243/r246 beat for beat (Ruth dies d101 the day the village
sits; "Ruth is dead. that stranger did it." capitalization slip
persists; Samuel Grilo + Ruby Callaghan ascend; "Speak for the quiet
ones"). Real arcs underneath: Nikos's pantry-run promise rotting (-15
trust), Ruth testing Ghost Pipe, Samuel learning Portuguese, Onni
becoming camp healer. PASS.

Panel-wide watches (transcript greps, all passes): DRY 0, bare "..." 0,
SYSTEM "" 0, parrot 0, confide line 0 firings (F8 gate holds, vacuous),
"no arrows" 0 (vacuous for #2593), COUNTER "something" 0 (r246 fix
holds, vacuous — the 8 guarded mids never got counter-learned),
funeral-mend FIRED + voiced on 89703 Pass A (Ursula's feast — third
observation).

## Fix landed: double-"The" in narration (game.js + favor-outing.js)

The panel surfaced a real defect, twice over, in the wild:

1. **Villager scream_cheese** (`src/js/game.js`, `tbVillagerAbility`):
   the template composes `'The ' + mname(targets[0])`, but `mname()` is
   `encSubject()`, which ALWAYS returns "The X" (it composes the article
   itself; `encTheName` strips a leading article then re-adds "The ").
   Every single-target villager scream doubled the article: "The The Big
   Loud freezes. (stunned)" (89703 ×4; also "The The Static/Audit/Old
   Big/Loud-Eyes/Influencer" on other seeds). Fix: drop the hardcoded
   "The " in the singular branch (plural "The monsters freeze" stays).
2. **Waiting-outing dawn note** (`src/js/favor-outing.js:106`): the
   template composes `` `${first} and the ${short} wait:` `` but the
   favor shorts already carry "the" (`'the pantry run'`, `'the creek
   water run'` — `src/js/convo-wants.js:189,454`): "Nikos and the the
   pantry run wait" (89702 ×3: d91, d92, d101; also 89704 creek). Fix:
   strip a leading "the " from `short` in that one template only (other
   templates use `short` bare and read fine).

`food.js:1748` ("The ${mname} is food") is NOT a site — its `mname` is
`monsterNoun()`, which strips leading articles and lowercases.

Proof: `scripts/test-journey-endgame-r249-double-the-20261119.js` —
RED on unfixed code (scream line renders "The The Big Loud"), GREEN
14/14 after the fix (scream + pantry/creek/plain shorts, root-cause pin
on `encSubject`). Wild verification: 89703 Pass A and 89702 Pass C
re-run on fixed code into `perseed-endgame-r249-diag-fix-a/` and
`-diag-fix-c/` — **both JSONs byte-identical to the originals**
(RNG-neutral, trajectories unchanged) and the transcript diffs show
ONLY the fixed lines changing (4 scream lines on 89703, 3 pantry lines
on 89702). One residual grep hit for "the the" in the fixed 89703
transcript is a sentence boundary ("The drum doesn't care. The audience
loves the theater."), not a doubled article.

## Metric review (watches)

- M25c on C-wide bought 8/8 — the early buyout is now the default
  outcome on fresh bands too, and 89821 shows it can starve a village
  that buys lean (see C-wide). Not a bar failure; a design observation
  for the next buyout review.
- Pass D full seat moving seeds (89705 vs 89702) with the same kill
  total is noise under FIGHTALLY2, not an uplift signal — the lever
  decision stays OFF on the binding number.

## Telemetry baseline — peakVet adjudicated, file updated to 3

telemetry-check on Pass A (5 files, 4 metrics): **quiet** — uw 21 vs
baseline 22, won 5 vs 4, peakVet 4 vs 8, all within the 0.6 tolerance.
Per the prereg, uw/won are NOT rolled on a quiet read. peakVet is
adjudicated against the r246 re-baseline (3), NOT the stale file value
(8): r249 Pass A peakVet sum is 4 — the **fourth consecutive
observation in the 3–4 band** (r239: 4, r243: 3, r246: 3, r249: 4).
The file `hidden_files/telemetry-baselines/endgame.json` was updated
peakVet 8→3 (uw/won untouched) with the adjudication recorded here.
The stale 8 would have kept crying LOUD on 3-sums and quiet on 4-sums.

## Gate

`node scripts/check.js --quick` SOLO on the fixed tip:
**339 passed, 5 failed in 687s, 0 attributable.** All five adjudicated
with solo re-runs:

- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (measurement-proof staleness pair): fail with "Proof source inputs
  are not current" / "retained neutrality proof covers the current
  Game/controller/harness inputs". **Both fail identically on the
  UNFIXED base** (fix temporarily reverted, solo re-runs exit 1) —
  pre-existing staleness from earlier master changes, not from this
  fix. The proof refresh (`balance-proof-update.js`) is a separate
  maintenance step, not part of this run.
- `test-phone-frame-proof.js`: retained receipt stale vs index.html +
  data files (alienPlayers, foreignSpeech, regions, statusEffects,
  table-endings). **Fails identically on the unfixed base** — none of
  its inputs were touched by this fix. Pre-existing.
- `test-living-garden-deed-attainment.js` + `test-one-person-army-
  deed-attainment.js`: TIMEOUT at the 120s cap inside the parallel
  gate (7–9 seeds done in 120s). **Both PASS solo** (exit 0; garden
  ~334s, army ~226s) — cap artifacts, not failures. (A VM restart
  killed the first army solo run before it started — uptime 0 min;
  heartbeat re-established first, writes probed OK, run repeated
  from scratch per the restart lesson. No work lost.)

## Open / held

- The deed gate is still the wall: 89702's full seat reproduces a
  third time on the matched band, but the fresh C-wide band reaches no
  full seat (0/8) and no deed-gate OK (0/8) — same as r246.
- FIGHTALLY2 stays env-gated OFF (fourth sighting, no uplift).
- 89821's buyout-starvation loss: design observation for the next
  buyout review, not a lever change here.
- "Ruth is dead. that stranger did it." — capitalization slip persists
  in the full-seat script (third observation, cosmetic).

## Verdicts

- Reachable: YES (full seat reproduces a third time on the matched band).
- Fun: mostly (people check PASS; double-"The" narration defect found and fixed).
- Winnable: the matched band wins 5/5 (A) / 5/5 (C) / 6/6 (D); the
  fresh band wins 6/8 with 2 losses — the wall remains the deed gate
  after national, as in r243/r246.
