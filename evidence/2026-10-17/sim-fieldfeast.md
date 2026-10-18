# sim-fieldfeast — the field-fight child of the opened gate (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-20261017T2015Z (arm sim-fieldfeast).
Steve DECIDED 2026-10-17 (decision batch, #441/#445 "Food deeds: open the
gate"): "Villagers' blows bank food deeds — the `_ps` gate (scholar-only)
opens." The TB child landed as sim-seatblow-open (SEATBLOW-OPEN,
game.js:34087-34140). The open finding from that run: villager field
fights (src/js/fieldFights.js — genuinely blow-by-blow off-screen per
Steve 2026-10-08, NOT outcome tables) carry OVERCHARGE parity but never
FEASTED, and cannot bank the food deed (noteFeastedCombatUse requires
inCombat()). This arm implements the field-fight hook.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14)
Written BEFORE the pilot sweep (criteria encoded in
scripts/analyze-fieldfeast-20261018.js, written before the sweep started;
no per-seed JSON peeked before the verdict).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (the feastscale wrapper
  = leadcourt/belongseek + r13 feast layer — the tablegate courtship
  substrate; base courtship where the scholar never banks — that's the
  point, this opens the table for courtship/diplomacy play). Policies:
  leadfeast / belongfeast (require('./feastscale')). ARMED = FIELDFEAST=1
  (gate open); CONTROL = FIELDFEAST unset (gate closed — the only delta is
  the env flag). Identical seeds per road, same tree, same process.
- SEEDS: 8 FRESH seeds 62111–62118 × {leadfeast, belongfeast} ×
  {armed, control} = 32 runs. Fresh = 0 `"seed": 6211X` hits across
  evidence/ + scripts/ (verified 2026-10-17; 61111–61118 were the
  seatblow-open seeds).
- HORIZON: 180d death-aware (matches the seatblow-open pilot; dead
  villages stop simulating, +10d tail max).
- PRIMARY (GO) — single conjunct: >= 4 armed field-fight deed-banking
  events total vs 0 control. A field-fight deed-banking event = a
  field-fight feasted strike that actually marks the deed (feastSurgeUsed
  false→true with feastSurgeBy starting 'v:' — or 'p' when the scholar is
  the field striker), counted by the read-only instrument. Control is
  expected ~0 — the banked channel doesn't exist there (the field-fight
  hook never sets the source; noteFeastedCombatUse's inCombat() gate holds).
- SECONDARY (measured, not binding): field-fight feasted/overcharged
  strike counts, per-villager deed shares (feastSurgeBy distribution —
  Steve's "are we measuring the right thing?" question; the metric was
  built on scholar-only attribution), TB villager feasted/overcharged
  blows (same instrument as sim-seatblow-open), foodDeeds holds,
  seat-earned/invitation/announced/arcIV, national, table, wins,
  median/max survival, scholar combat deaths, death-cause shares.
- GUARDRAILS (any miss = NO-GO per §14): national armed < control; wins
  armed < control; median survival armed < control−10d; any new death
  mode on armed; det-gate pair divergences > 0.
- COMPLETION: 32/32 runs complete; 0 instrument errors; RED→GREEN proof
  (scripts/test-fieldfeast-20261018.js: 5/5 RED gate-closed, 15/15 GREEN
  gate-open) BEFORE the sweep; det-gate 32/32 identical BEFORE the pilot
  verdict; §15 balanced panel (scripts/build-fieldfeast-panels-20261018.js)
  attached.
- CONVERGENCE verdict per run: converging | converged | parked | killed-at-pilot.

## Canon read
- docs/CANON.md: read. "Monster encounters are fought, not rolled"
  (untouched — the hook scales damage inside real blow-by-blow fights).
  Human skills ≠ alien abilities (untouched — villagers' blows are plain
  strikes). No silent actions (every uplift is narrated in the fight
  record, naming the striker). "If you don't know, it doesn't show"
  (untouched).
- No canon doc covers the feasted-buff source gate specifically; decision
  #441/#445 IS the canon here — implemented as decided, not invented.
- SENSE-TESTING LAW: fight transcripts read for the feasted blows (see
  Sense-test section below).

## The change (src/js/fieldFights.js + src/js/feastBuff.js)
FIELDFEAST=1 (default OFF — `process.env.FIELDFEAST === '1'`, the same
env-flag pattern as FIGHTOPEN/NODEWITNESS/CAPDRAW2; absent in the browser,
so the live game is unaffected until the flag ships).
- Per fight, the primary striker's (vid) multiplier is computed once from
  state reads only (no RNG — the det-gate stays byte-identical): feasted
  → feastedMult() (same number as the scholar's TB hook); else fuel parity
  through the striker's OWN belly — godpath villagerPowerMult (hunger ≤
  25, village not starving → ×1.25) for villagers, the scholar's own
  overcharge (kcal ≥ 75% cap → ×1.25) when the scholar is the field
  striker. Never the scholar's bank for a villager's blade.
- All three strike sites uplift: the ambush opening strike, the volley
  arrows, and the melee strike. The uplift lands on the fully-modified
  strike (after mirage/aim/haymaker/editor/audit/reunion/godpath
  modifiers — TB parity: the funnel sees the final number). A whiffed
  strike (0) carries nothing and banks nothing.
- Kind 'ally' (the fight's second pair of hands) stays out — its strikes
  never uplift, mirroring the TB hook (foreign allies weren't at the
  village feast and carry no hunger state).
- The first REAL feasted strike banks the food deed: the hook sets
  `_feastUseSource` to 'v:'+vid ('p' for the scholar striker) and calls
  noteFeastedCombatUse(). Overcharge never marks the deed (same rule as
  the TB hook). noteFeastedCombatUse's channel now accepts the field-fight
  source — a 'v:'/'p' source set by a real combat hook attests the combat
  context off-screen (field fights are real combat per Steve 2026-10-08).
  NOT a behavior-neutral attribution hack: the source IS the attribution
  (prog.feastSurgeBy — per-villager deed shares for Steve's measurement
  question), the channel is inert unless a combat hook sets it, and the
  TB path's inCombat() semantics are unchanged.
- Narration in the landed hook's voice, naming the striker:
  `FEASTED ×2.03: Sari's blow carries the feast.` /
  `OVERCHARGED ×1.25 (well-fed): Sari fights on a full belly.`
  (volley: "arrow carries the feast").

## Proof (scripts/test-fieldfeast-20261018.js)
Full-harness field-fight fixtures: real roster villager, weak monster,
armed devotion. RED gate-closed (5/5): no tags, no deed mark, fights
resolve. GREEN FIELDFEAST=1 (15/15): uplift lands on all strike sites,
narration names the striker, deed banks as 'v:<vid>', uplift math exact
on the first strike vs the identical-rng control re-run, overcharge via
the striker's own belly (×1.25), overcharge never marks, hungry villager
gets nothing, ally strikes never uplifted, scholar striker banks as 'p',
marking idempotent, zero-damage strikes never tagged.

## Sense-test (transcripts read)
Feasted field-fight record (hushwolf, 5 rounds, FIELDFEAST=1), read in full:
`R1: throat-lunge hits the person in their 40s, with grey-streaked hair for 7 (93 left)` /
`R1: the person in their 40s, with grey-streaked hair strikes for 12 (x1.2) (FEASTED ×2.03: the person in their 40s, with grey-streaked hair's blow carries the feast.) (78 left)` — repeated each round, the deed banking as `v:gen_acy2n9t`. The tag reads as a person fighting, in the landed hook's voice; every uplift is narrated (no silent actions). The clunky name ("the person in their 40s, with grey-streaked hair") is the existing NAME-AWARE firstRef convention for unknown villagers, not this change. Verdict: sensical — a villager's feasted blows read as their fight.

## Results
Pilot ran 2026-10-17/18 (~2h wall for 32 runs). Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit). 32/32 runs complete, 0 instrument errors.

| road | arm | holds | ffBank | ffFeast | ffOver | vBanked | tbVFeast | national | won | medSurv |
|---|---|---|---|---|---|---|---|---|---|---|
| leadfeast | armed | 7/8 | 0 | 79 | 74 | 1/8 | 5 | 6/8 | 0/8 | d153 |
| leadfeast | control | 7/8 | 0 | 0 | 0 | 1/8 | 8 | 6/8 | 0/8 | d133 |
| belongfeast | armed | 7/8 | 0 | 105 | 23 | 1/8 | 16 | 7/8 | 0/8 | d122 |
| belongfeast | control | 7/8 | 0 | 0 | 0 | 0/8 | 17 | 7/8 | 0/8 | d132 |

Aggregates: armed ffBankEvents 0/16 vs control 0/16; feasted field-fight strikes 184 vs 0; overcharged field-fight strikes 97 vs 0; TB villager feasted blows 21 vs 25; scholar feasted blows 345 vs 330; feastSurgeBy armed {p:12, v:aria_thompson:1, v:liam_davis:1, none:2}, control {p:13, v:meera_reddy:1, none:2}; holds 14/16 both; national 13/16 both; table (waiting) 13/16 both; won 0/16 both (SEATDRIVE=0 — no take-seat verb); scholar combat deaths 105 vs 92; max survival d182 both; median survival d128 vs d132.

**PRIMARY: NO-GO.** Armed ffBankEvents 0 < 4 (control 0, as expected — the channel doesn't exist there). Per §14 the miss binds, never re-scored. See metric review for why the threshold was mis-operationalized for a decision-implementation arm.

**GUARDRAILS:** national ok (13 vs 13); wins ok (0 vs 0); median survival ok (d128 vs d132, bound d122); new death mode FIRED literally ('Choir Toad' 3, 'the night' 1, 'Grief Counselor' 1, 'The Understudy' 1, 'Gavel' 1, 'thirst' 2 on armed, 0 on control) — INVESTIGATED, explained, not a real signal: all are pre-existing causes — 'thirst' is the dehydration pipeline (game.js:28719), the rest are monster-name kill attributions (Choir Toad, Grief Counselor in monsters.json; the Gavel/The Understudy likewise) — and the control arm carries its own symmetric set of 6 unique rare causes ('Big Big', 'The Loud Beast', 'The Callback', 'Night Court', 'The Loud Thing', 'the expedition'). Spread across 6 different armed runs (not clustered); no plausible causal path from "villager strikes ×2.03" to a new way to die. Sampling noise in rare named attributions, same class as sim-seatblow-open's phoenix-link artifact.

**§15 balanced panel** (evidence/2026-10-17/fieldfeast-panel.md, decision review_required): no_material_signal on national/table/wins/survival/community-loss; regression_watch on playerDeaths (leadfeast, delta +1.625, CI includes 0) and playerDeaths100Days — INVESTIGATED: the delta is driven by two seeds (s62111: 7v1, s62114: 13v6) where the ARMED run survived far longer (d182 vs d119, d182 vs d79) — longer runs accumulate more bearer deaths; the rate metric's CI includes 0 and belongfeast shows zero delta (56v56). Not a harm signal — if anything the armed villages lived longer on those seeds.

**Village assessment:** the villages that feasted fought visibly harder — 184 feasted + 97 overcharged field-fight strikes across 16 armed runs, zero on control. The deed-share ledger answers Steve's measurement question directly: villagers DO bank the food deed (v:aria_thompson, v:liam_davis via the landed TB hook; v:meera_reddy on control) — the metric was indeed built on scholar-only attribution, and the shares are now visible. What never happens on this substrate is a FIELD-FIGHT bank: the scholar's feastFightRoad coordination ("face it WHILE FEASTED so the deed marks" — competent.js) wins the first-use race in every buff window. The gate is open and the channel is live (proven in unit tests), but the policy starves it. Who thrived: villages reaching national d72-79 on both arms (13/16 each) — the scale wall, not the feast, remains the binding constraint. Nobody won (0/16 both — SEATDRIVE=0, no take-seat verb, same as sim-seatblow-open).

## Metric review
Per §14 — the PRIMARY threshold (≥4 field-fight deed-banking events) was mis-operationalized for a decision-implementation arm, the same way sim-seatblow-open's conjunct (2) was. The decision (#441/#445) is "open the gate" — the CAPABILITY (villagers' blows carry the feast and can bank the deed). The threshold instead measured a RACE the substrate's policy is explicitly designed to win for the scholar (feastFightRoad: "face it WHILE FEASTED so the deed marks", patrol budget 3 sweeps/day while the window is live). The mechanism is proven (184 feasted strikes, exact uplift math, deed banks as 'v:<vid>' in unit tests); the race outcome is substrate, not concept. Proposed revision for the NEXT run: primary = feasted field-fight strikes landed (mechanism walks through the gate) + deed-share distribution (Steve's measurement question) — not first-bank races against a policy built to win them. This revision applies to the next run only; this run's NO-GO stands as recorded.

## Coordinator recovery note (fleshout-20261018T0415Z, 2026-10-18)
The 0122Z run died mid-landing: tree sim-fieldfeast left with the killed
layer's game-code changes UNCOMMITTED (src/js/fieldFights.js,
src/js/feastBuff.js, docs/ONTOLOGY.md) + evidence/instruments untracked;
no lock, no claim file, heartbeat 51 min stale. Kill protocol executed by
coordinator: the three game-code files reverted to HEAD (zero trace),
proof INFO-SKIPped honestly (pre-kill 5/5 RED + 15/15 GREEN stands), kill
headers added to all 5 instrument scripts, evidence + instruments landed
in this commit. This run's verdict stands as recorded above: PRIMARY
NO-GO per binding §14.
