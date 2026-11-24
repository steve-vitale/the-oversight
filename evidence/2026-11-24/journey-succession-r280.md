# Succession r280 — drift notes and mourning shapes fixed, matched replay clean

Lane B finisher run. Lock `playtest-loop-2-2026-11-24T11:45:33Z`.
Panel base master `5b2c949f4` (sim-scale-onramp-round-1115 record);
rebased to `031f2a938` (sim-bloodcluster-b landing) before the gate.
Panel 12:25:30–13:08:51Z Nov 24, 2026 (~43 min); 26 seeds exit 0;
analyzer exit 0. Fixes proven by proof tests on the rebased tip
`dfa171106`; proofs re-run after the rebase (see below).

This run built the two fixes the r279 panel filed, then replayed the
r279 matched band (seeds 34542–34565, EKD=40, POST_DAYS=70; control
34403; smoke 33998, EKD=5, POST_DAYS=25).

## Verdict table

| Bar | Verdict | Reading |
|---|---|---|
| DRY-CENSUS | **PASS** | dry hits 0 (binding 0, other 0); honest fallbacks 34; null silences 0 |
| MOURN-TEMPLATE | **PASS** | 151 servings; same-speaker repeats 0; village-window repeats 0; double-stage exemptions 0 |
| MOURN-EXHAUST | PASS | 0 exhausted-line servings in mourning sittings |
| REL-BOND | PASS | servings 12 (judged 12, held 12, unheld 0) |
| REL-VETERAN | PASS | servings 20 (judged 20, held 20, unheld 0; opener draws in both-veteran convos 74) |
| REL-WITNESS | **INSUFFICIENT-DATA** | servings 0 (judged 0; single-fresh witness draws 1, below the 3-draw floor) — expected per prereg |
| CAP-NC | PASS | bonded-by-deadline 8/9 eligible seeds |
| MANTLE-FINE | PASS | 83 deaths observed, 0 flippedImmediate=false, 0 fineLatency≥2, 0 fineLatency==1 unexplained, 1 held-briefly same-day cascade bearer, 0 day-skips |
| WITNESS-CENSUS | SUPPLY-PRESENT | 3 witnessed person corpses |
| WIT-SIT | STAGED-INSUFFICIENT | staged 7, fired 5 (single-fresh 3, multi-fresh 2); too few single-fresh draws to judge |
| HABIT-COLLISION | PASS | habit-for servings 1 (34550:Tom=braid grass while listening to plans); same-seed collisions 0 |
| CONTROLS (smoke 33998) | MATCH | relEnd 50, NPC-NPC bonds 15, handoff d6 Heinrich → Grace, relPost 33, relD14 47, mourning servings 0, selfId grace_obi — identical to the r279 re-baseline, no drift |
| MONSTER-WITNESS | PASS | monster corpses with witnesses 889/889 |
| SKIP-LEDGER | PASS | every witnessed corpse accounted for: 7 staged (5 fired, 2 !fired no-living-witness); 0 unscanned unexplained |

Both r279 FAILs are fixed on this panel, and both fixes engaged in
the wild (below).

## Fix 1 — drift notes no longer dry (DRY-CENSUS PASS)

The r279 hit: Benoit, seed 34547, d35 — "Benoit has an edge today —
something curdled." served through the repeat-ledgered `sayLine`
path while his drift stayed crossed across sittings, so the run
ledger blocked the shared drift sentence and the sitting fell back
to the spoken dry line.

Fix (`src/js/conversation.js`): a `stageDirection: true` opt on
`sayLine` — drift-note stage directions are exempt from the
self/run blocks and from the run-ledger feed, parallel to
`structural`; they still feed the per-sitting ledgers. The opener
serve and the held push both carry it; the goon chain gains an
`hb.stageDirection` branch and `goonExempt` extends to it.
`convoWouldBlock` is unchanged (stage-direction lines never reach
it, because self/runBlocked are false for them).

Proof test `scripts/test-journey-succession-r280-driftnote-stage.js`
(cases direct / held / control, seeds 5702/5703/5704): RED on base
(direct + held failed, control passed), GREEN on fix (direct 3/3,
held 5/5, control 3/3). Staging notes: `loadGame`/`setupGame` are
async and must be awaited; the drift note is keyed to the speaker's
true name, but `displayName` returns a descriptor until the opener
introduces them — the test reads the true name from `rosterChars`
(r267 pattern). The prereg claimed a held drift note "carries
`driftNote: true`" — no such marker existed in code (grep finds
only `convoDriftNote`); the actual sites are the opener serve in
`startConvo` and the goon serve in `convoTurn`.

Wild evidence: the bitterness drift sentence ("X has an edge today
— something curdled.") fired **23 times across 17 seeds**, 0 dried.
Benoit on 34547 specifically did not re-fire — replay divergence
(the note fired for other villagers instead) — so the panel evidence
for Fix 1 is the 23 servings with 0 dry hits, and the mechanism
proof is the proof test.

## Fix 2 — second sittings steer away from the first shape (MOURN-TEMPLATE PASS)

The r279 hits: two verbatim repeats, both at the d+3→d+8 window
edge — 34544 Tashi/Javier on Gabriela (owed-favor), 34549
Tebogo/Enrique on Claire (burnt-piece).

Fix (`src/js/convoTopics.js`): village-level shape memory
`state.village.mournShapesServed` (deadId → [unfilled template
strings]), with helpers `mournShapesFor` / `mournShapeServed` /
`mournShapeRecord`. The stage-1 fill-aware retry trigger now fires
when `convoWouldBlock(vid, composed)` OR the picked template is
already recorded for this dead person (single-name mourning only,
deadId present); the retry loop skips candidates already recorded
for this dead; the final template is tracked through stage 1 and
stage 2 (the stage-2 mourning carve-out now reuses the
already-resolved `mournEv`); after the final template is decided it
is recorded for the dead person. If no candidate passes, the
original pick returns unchanged (documented last-resort gap).

Proof test
`scripts/test-journey-succession-r280-mourn-shape-steer.js` (cases
steer / control / exhaustion, seeds 5802/5803/5804): RED on base
(steer failed — d+8 served the identical "I dreamed Helga was
still here..." template as d+3), GREEN on fix (steer 12/12 —
d+8 now serves "Since Helga died..."; control 11/11; exhaustion
11/11). Staging reproduces the r279 pair shape exactly: the dead is
a bearer (corpse dayDied 37 + lineage entry day 37, cause 'the
wild'); d+3 rides the fresh-corpse branch (grief=1, window ≤3
days); d+8 rides the mantle branch (grief decayed to 0 — with grief
still 1 the d+8 event is nameless and the mantle branch never
fires). The test floods the run ledger with 48 dummy chunks between
sittings to reproduce the wild 5-day eviction (without it the r267
retry masks the defect on base); speaker B's per-villager dedupe is
pre-populated with the 4 non-T1 templates so the pick must be T1 on
base.

Wild evidence — both r279 pairs are gone, read in full (see People
check):

- 34544, Gabriela — Tashi d+3: "Gabriela owed me a favor. I keep
  thinking about collecting. Stupid." (opener:owed-favor) /
  Javier d+8: "I dreamed Gabriela was still here. Woke up angry at
  the dream. Stupid." (opener:dreamed). Stan d+8 served
  opener:expect-fire — the d+8 sittings spread across shapes.
- 34549, Claire — Tebogo d+3: "Claire always took the burnt piece.
  Said someone had to. I take it now." (opener:burnt-piece) /
  Enrique d+8: "Since Claire died... I keep expecting to see Claire
  at the fire. Stupid." (opener:expect-fire). Jae d+8 served
  opener:vet-treeline.

## REL-WIT: the draw count still misses — same bottleneck, fourth panel

Sittings back at r267/r279 levels: **5 fired** (single-fresh 3,
multi-fresh 2). Language filter: **0 nonverbal-despite-filter**.
Skip ledger: 2 !fired, both `no-living-witness` (Wyatt 34545,
Carlos 34551); 0 `cap` skips. Unscanned: 0 unexplained.

But the REL-WIT draw floor is still missed: **1 draw** (floor 3).
Only one sitting met fired && freshPersonN==1 &&
latelyWitnessed — 34564, Diego on Wei (ambush, witnessed by Diego;
his "lately" event named Wei and the sitting named the staged
dead). The other two single-fresh sittings (34546 Elif on A, 34547
Arlo on Galym) fired but their lately events did not name the
staged dead (latelyDead=none). And on the one draw, the witness
variant still never served: Diego mourned Wei with the generic
shapes ("Since Wei died... I keep expecting to see Wei at the
fire"; "I keep turning over the last thing Wei said to me") but
never said he was there when it happened.

REL-WIT returns INSUFFICIENT-DATA for the fourth straight panel
(r267: 3 draws, 1 serving; r268: 1 draw, 0 servings; r279: 1 draw,
0 servings; r280: 1 draw, 0 servings) — the instrument question is
answered (staging works), the game question (will a witness ever
say "I saw it"?) is still unmeasured. Next run's staging design
must address the lately-naming step, not the sitting supply. This
run's fixes did not touch that path, and the prereg expected this
bar to stay insufficient-data.

## Village assessment (plain words)

Twenty-six villages, each played 110 days with the bearer killed on
day 40 (or earlier, where death came organically). The mantle passed
**83 times** and never stuck: every death found a living successor
the same day, including same-day cascade bearers. The villages
absorb loss and keep going: 55 newcomers arrived, villagers formed
87 new bonds with each other, and bonds grew after nearly every
death (relEnd beats relPost on 23 of 25 seeds with snapshots; the
other two flat). No village broke: 211 people alive at the end
(mean 8.12, min 5 on 34546); 23 of 24 panel seeds ran the full 70
post days, the last (34565) stopped at 69 with 8 alive. The dead
are mourned in their own words, mostly: 151 mourning servings,
bond and veteran variants firing only where the relationship held
(12/12, 20/20). The two cracks from r279 are closed — no villager
loses their train of thought where a mood should have shown, and
no sentence is repeated verbatim across the village. What is still
unproven is the witness story: four panels running, a villager who
watched someone die has still never said "I saw it" in the game's
own words.

## People check (transcripts read in full)

Six full transcripts: the two fixed MOURN-TEMPLATE pairs
(Tashi/Javier on Gabriela, Tebogo/Enrique on Claire), the judged
witness sitting (Diego on Wei, 34564), and a new-bearer mourning
sitting (Elif on Isaac, 34542). Plus the recap census (293 recap
picks) and the "settled" census (26 lines).

The conversations have wants, engage or deflect them, and end with
something resolved or owed. Diego opens with a real want (find
someone for the pantry run — "we're choosing who eats") and only
then, asked what's on his mind, grieves Wei. Elif teaches, asks to
join the party, and grieves Isaac in her own words ("Isaac is gone
and the world just... continues. That's the part I can't stand.").
The d+8 mourning lines read as different people grieving the same
dead differently — Javier dreams, Enrique expects to see her at the
fire — instead of the village sharing one mouth. The defect that
remains is the one the bar caught: Diego — who watched Wei die —
never gets to say he was there.

## Controls — smoke matches, no drift

Smoke 33998 vs the r279 re-baseline (handoff d6 Heinrich → Grace,
relPost bonds 33, relD14 47, relEnd 50, mourning servings 0,
NPC-NPC bonds 15, selfId grace_obi): every field matches exactly.
No re-baseline. The base moved between r279's base and this run's
panel base only by the bloodcluster landing (rebased after the
panel), and the smoke seed shows no drift from it.

## WILD CHECK

Carried proofs re-run GREEN on the rebased tip `dfa171106` (see
`evidence/2026-11-24/journey-succession-r280-proofs.log`): the two
r280 proofs (ALL PASS) plus r262 escalator-cap (GREEN), r254
multiwit (ALL GREEN), r232 relationship-mourning (ALL GREEN), r225
F5 harness (22 passed, 0 failed), r258 selfwit (ALL GREEN), r267
mourning-dry (ALL GREEN), r268 table-dry (ALL GREEN). Note: the
carried proof files carry date suffixes (e.g.
`test-journey-succession-r262-escalator-cap-20261121.js`); the
bare `test-journey-succession-r262-escalator-cap.js` name does not
exist and a run against it is a MODULE_NOT_FOUND, not a pass.
Analyzer DRY wild check: deflect_q 0, dlg:doubt 0, other-class 0.
No F4a/F4b/F4c/F5/F6/C3c/F2 regression observed in the panel
transcripts. C3d: 0 erasures — 293 recap picks; in the six
transcripts read in full every recap names the live thread
("Still on ..."), including resumed-thread recaps. F5 WILD
EXERCISE: 0 firings — 26 "settled" lines (16× wind-down "Good —
what's been happening / that question / your plan here / whether
you still sing / needing to be alone, settled. Feels better said
out loud."; 1× "Right. Forget it. ... No — that one's settled. I
just like saying it out loud."; 8× "There's still the matter of
the ambush/murder of X. Nobody's settled it." ambush/murder-case,
incl. 1× "Nobody's settled the ambush against me yet."; 1× "They
file it away — settled, and counted."), none settled-favor.
Rolling window r233+r245+r248+r254+r258+r263+r266+r267+r268+r279
+r280 stays 0.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-24/journey-succession-r280-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
— 2 LOUD lines, both explained, no real bug shown:

- deaths.bearer: baseline 7.6 → current 82 (n=26 files). The panel
  forces a bearer death on day 40 of every seed (EARLY_KILL_DAY=40)
  plus the scripted smoke death; 82 bearer deaths across 26 seeds
  is the forced chain doing its job (r279: 89, r268: 106, r267: 99,
  r266: 87). Per-file mean ≈ 3.15 — BELOW the baseline mean. The
  LOUD is the tool's sum-vs-mean mismatch (unresolved since r229),
  not drift.
- census.fallen: baseline 14.3 → 156. Same regime — forced chain +
  110-day panel horizon (r279: 171, r268: 179, r267: 193, r266:
  175). Per-file mean ≈ 6.0 — BELOW the baseline mean.
- census.alive (mean 8.12 vs baseline 3.8),
  census.integrationStage (3.0 = 3.0), week2.deadBearerMentions
  (quiet): no LOUD lines; the alive mean runs above the unforced
  baseline because forced-chain villages survive to day 110 —
  regime, same pattern as r266/r267/r268/r279.

Per the prereg rule (a forced-chain panel must NOT roll the unforced
baseline forward), **the baseline is NOT rolled**. The LOUD lines are
regime + tool mismatch, not drift.

## Reachable / fun / winnable

This run's variable was two game fixes, not an instrument: the
succession leg itself is reachable and holds up — the mantle passes
83 times without a hitch, villages survive losing their leader and
keep forming bonds, and the mourning conversations now read like
different people grieving the same dead differently. What is still
unproven is the witness story: four panels running, a villager who
watched someone die has never yet said "I saw it" in the game's
own words. The leg is fun to watch and the village endures; the
witness-variant serving is the piece still missing from the
succession story, and the next run's work is the lately-naming step,
not more sittings.

## Metric review (carried + filed)

- DRY-CENSUS: the r279 other-class hit is fixed — drift-note stage
  directions bypass the repeat ledger; 23 wild servings, 0 dry.
  The bar stands at 0.
- MOURN-TEMPLATE: the r279 village-window repeats are fixed —
  second sittings steer from the first shape; 151 servings, 0
  repeats. The bar stands at 0. The double-stage-pair exemption is
  still untested in the wild (0 double-staged deaths).
- REL-WIT: draws stay at 1 — the bottleneck is now the lately
  event naming the staged dead (2 of 3 single-fresh sittings had
  latelyDead=none), and then the witness-variant serving itself (0
  on the 1 draw). The 3-draw floor stands. Next run: address
  lately-naming, not sitting supply.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel (…+r280), stays 0.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Day-skip watch: thirty-first straight panel watch, 0 skips.
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). BOWCRAFT bisect for
  the 34362 drift stays open (not this run's). Outing-chain re-tune
  stays open (conversion 12.9%, r260).
- **Filed (carried):** the 40-entry corpse-census cap can hide
  witnessed corpses (r266: Sari, 34435); the census also
  undercounts ambush-witnessed deaths systematically (r267) — this
  panel: census counted 3 witnessed person corpses, the live scan
  found 7 (3 combat + 4 ambush). The census verdict stays a lower
  bound; the wit-sit live scan stays the backstop.
- **Filed (diagnostic, carried):** the witness-population map is
  corrected (r266) — ambush is a second witness path (bystander
  within 6 tiles). The `hurtVillager` fix proposal stays filed for
  Steve, NOT built (a game change to grief/gossip/murder gating,
  needs his call).
- **Filed (carried):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled line is
  run-blocked would dry the same way. No wild hit on this panel; fix
  only if a panel shows one.
- **Filed (carried):** mourning total pool exhaustion still dries by
  design (the stage-2 carve-out) — a larger single-name pool or a
  last-resort structural serve would close it; neither is built here.
- **Filed (this run, instrument):** carried proof files carry date
  suffixes; the bare `test-journey-succession-r262-escalator-cap.js`
  (and siblings) do not exist — a run against the bare name is a
  MODULE_NOT_FOUND crash, not a pass. Future runs must use the
  suffixed filenames.

## Gate

**335 passed, 9 failed in 1386s** — `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest2` on tip `dfa171106`,
13:31:54–13:55:02Z, log
`evidence/2026-11-24/journey-succession-r280-gate.log`. **0
attributable.**

- Standing known failures (3): measurement staleness pair
  (`test-measurement-proof-update.js`, `test-measurement-workflow.js`
  — proof freshness, refreshed by `balance-proof-update.js`, not this
  run) and phone-frame stale receipt
  (`test-phone-frame-proof.js` — 3 passed, 3 failed in-gate).
- Load flakes (6), all green standalone serialized on the same tip
  (`evidence/2026-11-24/journey-succession-r280-gate-standalone.log`,
  finished 14:03:24Z): 5 scripts hit check.js's 120s per-script
  timeout under load (living-garden 8/0, occupation-panels 25/0,
  one-person-army 7/0, trust-observer-neutrality 6/0, capable-bot
  40/0 standalone); `test-measurement-cache-flags.js`
  (0/4 in-gate, 4/4 standalone — same load-sensitive failure as
  r279's gate, same standalone pass).

No failure names this run's code or its panel: the two r280 proof
tests pass on the tip, and the panel ran clean. Fewer failures than
r279's gate (335/9 vs 333/11), same families.

## Adoption notes

- Phase 1 (r279 release): the 05:00 CST Lane B occurrence was
  confirmed dead by the finisher — registration pid 52614 gone, no
  journey2-4 registry entry, no heartbeat, journey2-4 dir only 7
  entries. Stale lock `playtest-loop-2-2026-11-24T11:00:00Z`
  deleted in the same call as its re-read (run_id matched).
  journey2-7 heartbeated, released (`worktree-release.sh
  journey2-7 merged`, exit 0), worktree removed + branch deleted
  (branch was `b7f77443c`); rotation-b stayed 4.
- Phase 2 (r280): fresh worktree journey2-7 registered (832s under
  load), base `5b2c949f4`; prereg + adoption logs staged from
  `hidden_files/r280-staging/`; heartbeat loop
  `journey2-7-hbloop-r280.sh` (setsid, 5-min beats, pid 15073)
  verified landing in the registry. One manual heartbeat failed
  ~12:22Z ("FAIL: registry lock held > 120s") and the immediate
  retry succeeded — the registry lock was held across a long
  registration (the ongoing jam), not a dead holder.
- Flap window 28 (10:45:20Z–~10:55:17Z) cleared before this run's
  registration; no flap window hit this run's writes. The panel ran
  clean, 26/26 seeds exit 0.
- Rebase: master moved past `5b2c949f4` during the run
  (sim-bloodcluster-b, tip `031f2a938`); the branch rebased cleanly
  (no stop-at-pick quirk) to `dfa171106`; both r280 proofs and all 7
  carried proofs re-run GREEN on the rebased tip.
- Rotation: 4 → 5 (to be written at closeout; verified after).
