# sim-vetformation — COMPANION KILL-FORMATION (run fleshout-20261023T1215Z, axis scale-onramp)

Worker tree sim-vetformation. Arm: the FORMATION half of the veterans
coincidence trap. Policy-side layer, ZERO src/js changes. Namespaces:
vetformation-* scripts; `scripts/policies/vetformation.js` (VETFORMATION=1).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; the readiness gate's VETERANS bar = 2 living roster members
with wave-4+ kills in state.waveKillLog; VILLAGER XP LAW; the hold never
names the wave's title — knowledge-gate discipline). No canon doc covers
equipment — stated, not invented (same as the sibling arms).

## PRE-REGISTRATION (§14 binding — adopted verbatim from the brief at run start, before any sims)

- **BINDING QUESTION (vetkill-autopsy named next #2):** never-formed
  dominates 10/16 configs — formation > retention as the bigger lever.
  Does a threat-driven companion kill-formation (staging + finishing
  discipline) form more distinct wave-4+ killers?
- **PRIMARY (binding):** distinct wave-4+ killer vids (read
  state.waveKillLog DIRECTLY post-run, per the vetkill-autopsy method —
  the killdisc wrapper missed these) summed over 16 seed-policy pairs:
  armed(VETFORMATION=1) >= control + 3. A miss is NO-GO, never re-scored.
- **ENGAGEMENT:** >=6/8 seeds have >=1 armed wave-4 fight with >=2
  companions committed by the policy's staging (trace instrument proves
  it fired).
- **GUARDRAILS:** median survival paired diff >= -15d; starvation <=
  control+2; no new death kinds; report wall (national/table/wins,
  wave4/5, median survival) both arms.
- **SEEDS:** 68805-68810, 68812, 68814 x {leadfeast, belongfeast} x
  {control, armed} = 32 configs, 180d death-aware. (The brief's
  68501-68508 are taken by loop-B arms — spikechar-b, retagrot-b,
  sharelean-b; 68801-68802 by 2026-10-13/14 evidence. This set:
  filename-verified 2026-10-23, zero seed-use hits on the armorydrive
  pinned substrate or any scale-onramp corpus; the only hits are ancient
  different-substrate corpora — 68814 once in a 2026-10-15 raidassess
  file — or loop-B food-economy corpora. The paired design cancels
  seed-specific effects regardless.)
- **SUBSTRATE (pinned BOTH arms):** FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 — the
  richest measured door substrate, same as the autopsy corpus.
  control = AD.armedFor(base); armed = VF.formedFor(base).
- **METRIC REVIEW section mandatory** (below); §15 panel compare applies
  (panel is the instrument, the pre-registered bars are the judge).

## Design (scripts/policies/vetformation.js)

THE BIND (vetkill-autopsy): 10/16 configs never formed a veteran; the
defer5 bar needs 2 LIVING wave-4+ killers; the scholar holds 0/10 wave-4
kills. THE CHANNEL (feastdisc-confirm): 8/8 villager wave-4 kills on the
armorydrive substrate were TB via=companion — the TB fight with staged
companions is where formation happens.

Two legs, both policy-side, composing OUTSIDE armorydrive's armedFor:

1. **FORMATION (daily beat)** — threat-driven staging. When the staging
   window is live (wave-4 unlocked && the wave-5 veterans bar unmet —
   the same live reads as armorydrive/feastdiscipline) AND a wave-4+
   monster sits on a travel target (imminent — feastdiscipline's threat
   signal), the policy commits the formation at the haven: the best
   armed fighter as anchor PAIRED with the best armed non-veterans (a
   veteran's repeat kill forms nothing), up to 3 in party (armorydrive
   holds 2; the formation adds the third when the threat is real).
   Invites consent-based (Game.inviteToParty — personality/goals decide);
   NEVER dismisses. Non-suicidal: armed (weapon bonus > 0), hp >= 40%,
   trust >= 20. Voiced once per threat day — brave things, named
   companions, deterministic lines, wave title never named.
2. **FINISHING (fight wrapper)** — inside wave-4 TB fights (non-titan,
   the #749 muster-gated class excluded, same as splitclose), on the
   scholar's turn, when >=1 engaged companion is a non-veteran: the
   scholar softens above the yield band and HOLDS inside it
   (Game.tbPlayerWait) so engaged companions get kill-finishing priority
   on the weakened monster. Overshoot guard, hold cap 10, stall 2,
   companion-survival rescue (<40% HP ends the hold — no breakoff,
   finding #790), never round 1, scholar hp >= 50%. The hold serves the
   forming fighters only: all-veteran engagements get no hold.

The yield band is feasted-aware (the drivenofeast honesty rule),
inherited from the splitclose probe on the IDENTICAL substrate
(scripts/probe-splitclose-damage-20261022.js, ARMORYDRIVE=1,
SEATDRIVE=0): FEASTED p75 = 134 HP, SOBER p75 = 37 HP.

DESIGN CALLS (Steve 2026-10-07: figure it out yourself, document it):
1. The anchor is the best fighter EVEN IF already a veteran — the
   formation pairs WITH them, never sends forming fighters out alone.
2. Forming slots go to non-veterans first; a thin day fills with the
   next-best armed fighter rather than leaving the slot empty.
3. The finishing hold is formation-gated (non-veteran engaged required)
   — holding for a veteran's repeat kill risks the scholar for nothing.
4. The brave-beat voices the commit; the engine's own invite
   acceptance/refusal lines carry the personality; the existing
   companionKillBeat voices the kill. No new fiction systems.

## Proof (scripts/test-vetformation.js)

38 PASS, 0 FAIL (2026-10-23, post rescueStrikes-counter fix; first run was
37/38 — the counter only fired when breaking an active hold, not on the
first rescue turn; fixed, re-run green):
- E0 shape: formedFor/controlFor tag correctly, unknown base throws.
- E1 det-gate: VETFORMATION unset → formedFor byte-identical to
  AD.armedFor on 60d x {leadfeast, belongfeast} (ARMORYDRIVE=1 both).
- E2 env-gate: vfOn false/true on unset/1.
- E3 RED→GREEN fixtures: formation beat fires only with threat + window
  + haven + out-of-combat (one pass/day); anchor = best fighter even when
  veteran, forming slots = armed non-veterans; unarmed/hurt never
  committed; never dismisses; brave beat voiced once; fight wrapper holds
  inside the band for forming companions, no hold when all engaged are
  veterans, soften above band+est, rescue on bleeding companion, stall
  hands back the finish, gate-off pure delegation.
- E4 armed determinism 60d; D2 180d armed completes + deterministic
  re-run. D2 tele (belongfeast s4244): formationDays=33,
  formationCommits=5, w4Fights=9, w4FightsWithComp=8,
  w4FightsFormed2=6, softens=33, holds=0 — the staging engages (6/9
  fights with >=2 formed companions); the finishing hold never fired on
  this seed (overshoot guard scholarEst=412 keeps the scholar striking
  until the target is under 412 HP — the splitclose conservatism,
  inherited). The pilot measures hold rates across 32 configs.

## Sweep

32/32 configs complete (8 seeds 68805-68810, 68812, 68814 x
{leadfeast, belongfeast} x {control, armed}, 180d death-aware, pinned
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; anchor 5d18ac937cfe on all 32 —
the tracker's closeout commit, no base drift). Corpus:
evidence/2026-10-23/perseed-vetformation/{control,vetformation}/.

## Results (scripts/vetformation-analyze.js)

### PRIMARY (binding): distinct wave-4+ killer vids, waveKillLog direct — GO
- control: 6 distinct vids (10 wave-4+ kills, on 3/16 configs)
- armed (VETFORMATION=1): 10 distinct vids (13 wave-4+ kills, on 5/16 configs)
- Bar: armed >= control+3 = 9 → **GO** (10 >= 9).
- Non-scholar cut: 9 vs 6. The 10th armed vid is tashi_sherpa
  (s68808-lead, strike@d133, via=companion) — the mantle-holder at kill
  time (bearer=tashi_sherpa d133), i.e. the blooded-fighter fiction
  touched the scholar-role once via the TB companion path, not a fixed
  person. The autopsy's "scholar holds 0/10" stands for the fixed
  person; the role reading is 1/10.
- Per-pair: s68805-belong ctrl 2 vids; s68806 armed 1+1 (2 configs);
  s68808-lead armed 2; s68812-belong armed FOUR (gen_11got07,
  gen_g9xrttq, gen_ue03egu, omar_farouk — a real formation spread);
  s68812-lead armed 2. Control's kills concentrate on s68812
  (3+1 vids); armed spreads across 5 configs.

### ENGAGEMENT: 6/8 seeds — GO
Seeds with >=1 armed wave-4 fight with >=2 formation-committed
companions engaged (vfTele.w4FightsFormed2 >= 1): 68805, 68806, 68807,
68808, 68809, 68812 → 6/8. (68810, 68814: villages died d34-39, no
wave-4 window at all — 0 w4Fights both arms.) The trace instrument
fired: 44 wave-4 TB fights seen on armed, 28 with >=2 formed
companions engaged; formationCommits 26 invites-ok across the corpus.

### Finishing leg (reported)
The hold fired in the wild: 107 holds total (s68808-lead 84,
s68812-belong 11, s68806-lead 9, s68812-lead 3), 256 softens,
3 rescueStrikes, 1 stallFinish. The D2 proof seed's holds=0 was seed
luck, not a dead leg — the overshoot guard (scholarEst=412) is
conservative but the band does engage.

### GUARDRAILS: all PASS
- median survival paired diff: 0.0d (bar >= -15d)
- starvation: armed 12 vs control 15 (bar <= control+2)
- new death kinds on armed: none
- §15 panel (descriptive-by-construction, env-gated):
  decision=review_required; regression_watch flags are denominator
  noise — raw player deaths armed 92 vs control 95 (combat 85 vs 87);
  the per-100d rate ticks up only because armed runs are slightly
  shorter on average. No harm signal. Panel .md attached:
  evidence/2026-10-23/vetformation-panel-primary.md.

### SECONDARY (reported): damage-majority villager wave-4 kills — 7 vs 4
Armed: Jordan x3 (s68806), Ethel/Logan/Miguel (s68812). Control: 4.
The formation doesn't just credit more vids — the companions do the
majority of the damage on more kills.

### WALL (both arms)
- control: national 4/16, table 7/16, wins 0/16, wave4 11/16, wave5 1/16, median 125.5d, max 181d
- armed: national 5/16, table 6/16, wins 0/16, wave4 11/16, wave5 2/16, median 125d, max 181d
- The wall doesn't move on wins (structurally 0 on the SEATDRIVE=0
  substrate); national +1, wave5 +1 (2/16 doors: s68806-lead,
  s68812-lead armed — vs 1/16 control).

### Sensor observation (filed, not chased)
Byte-identical duplicate waveKillLog entries in 2/32 configs
(control/s68805-belong, armed/s68808-lead — symmetric, engine-level
double-write, likely recordWaveKill + recordPyrrhicKill on lost fights).
The veterans bar and this arm's primary both count DISTINCT vids, so
duplicates move neither. Filed to the findings backlog.

## Sense verdict (SENSE-TESTING LAW) — PASS

scripts/sense-vetformation.js replayed s68812-belong (VETFORMATION=1)
with live narration; transcript at
evidence/2026-10-23/sense-vetformation-68812-belong.txt.

The sense run caught a REAL bug in the first beat draft: it voiced the
AFFIRMED formation ("Omar, Logan, Ethel pick up their edges... Nobody
argues.") on days Ethel had just REFUSED the invite ("Not right now.
I've got my own things to handle.") — naming a refuser and claiming
nobody argued, in the same day's transcript. Fixed before the sweep
verdict: the beat now voices only when new blood actually commits,
names only committed companions, and drops "Nobody argues." on refusal
days. The proof re-ran 38/38 green with a byte-identical game digest
(the beat is narration-only).

Post-fix transcript reads:
- d64: Ethel joins ("...Fine. This had better be worth it."), Nino
  joins ("Finally. I was wondering when you'd see my value.") → "Omar,
  Ethel, Nino pick up their edges and fall in beside you. Nobody
  argues." The engine's invite lines carry the personality; the beat
  names the committed. Coherent.
- d103: Miguel and Maya join ("Alright. But I'm not carrying your
  stuff."), Vasyl REFUSES ("Not right now...") → "Miguel, Maya pick up
  their edges and fall in beside you." Vasyl not named, no false
  "nobody argues." The refusal is honored — people, not drones.
- d72/d79 kills: "Ethel strikes the Influencer. FEASTED ×2.03: Ethel's
  blow carries the feast. Ethel hits influencer for 41. The Influencer
  falls." → SYSTEM: "Oh — OH. Everybody saw that, right? Ethel just
  put down The Influencer... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name." Earned: visible blows, the feast multiplier the
  drivenofeast finding named, the village noticing on camera.

VERDICT: PASS. Companions read as people doing brave things — the
reluctant, the eager, the refuser, all voiced in their own register.
Both formation kills rode the FEASTED ×2.03 multiplier (the drive puts
edges in hands, the feast multiplies them — finding #794 again).

## Metric review (§14 — the bars held, with honest caveats)

- The primary bar (armed >= control+3) was set blind against an unknown
  control baseline; control came in at 6 distinct vids — the same scale
  as the vetkill-autopsy corpus (10 vids/16 configs). The bar was fair,
  not tuned to the data. GO at 10 vs 9 stands as measured, not re-scored.
- "Committed by the policy's staging" (engagement): the trace counts
  engaged companions present in the formation the policy affirmed on
  the latest threat day (ctx.vfFormationVids). armorydrive's 2 staged
  companions are typically inside that affirmed set — the formation beat
  doesn't re-invite them, it affirms them. The honest reading: the
  POLICY's formation (the 2-3 it commits to, by invite or affirmation)
  was in the fight. A stricter "only newly-invited" cut would undercount
  the mechanism (the 3rd companion is the marginal commit; the affirmed
  pair is the formation's core).
- Duplicate waveKillLog entries (2/32 configs, symmetric across arms):
  the veterans bar and the primary both count distinct vids — duplicates
  are verdict-neutral. If a future arm counts kill EVENTS, it must
  dedupe on (d, mid, by, via, trick) first.
- The scholar-role kill (tashi_sherpa, s68808-lead): the pre-registered
  primary counts vids, not roles — tashi counts once. The "scholar holds
  0/10" autopsy finding is about the fixed person; the mantle-holder
  bloodied themselves once here. Both readings reported, neither
  re-scored.
- §15 panel regression_watch (playerDeaths/100d): raw player deaths are
  DOWN on armed (92 vs 95); the rate ticks up on a shorter denominator.
  The guardrail that binds (median survival paired diff 0.0d) passes.
  No metric change proposed — but the NEXT formation arm should
  pre-register exposure-normalized mortality if it touches fight
  discipline again.
- No metric proved wrong this run. Nothing is re-scored; the bars above
  are the verdict.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-23/perseed-vetformation/<arm>/*.json'
--metrics national,table,wins,exiled` fired LOUD on both arms:
control: national 12→4, wins 16→0; armed: table 16→6, wins 16→0.

**Investigated — all EXPLAINED, no bug, baseline NOT rolled.** The
scale-wall.json baseline's own `_regime.note` says: "DO NOT compare
pre-seat / courtship / readiness substrates against this baseline —
wins are structurally ~0 there and telemetry-check will fire a spurious
LOUD 'wins disappeared'." This corpus is SEATDRIVE=0 (non-seat long
substrate, deliberate — the table win lands ~d90-134 and the run ENDS
before villagers blood themselves); the baseline is the winseat regime
(SEATDRIVE=1). All four LOUD lines are regime artifacts (+ n-mismatch
on national/table). Same verdict as every arm on this substrate
(vetkill-autopsy, feastdisc-confirm, armored15-confirm).

## Named nexts

1. **Retention is now the binding half.** Formation moved (10 vids vs 6,
   GO); the autopsy showed formed killers die within ~6d in attritional
   combat. The sibling retention arm owns the 5–8d post-kill window.
   The defer5 bar needs 2 LIVING veterans simultaneously — formation
   without retention still doesn't open the door.
2. **The finishing hold's yield band is conservative.** 107 holds fired,
   but the overshoot guard (scholarEst=412, probe max) keeps the scholar
   striking until the target is under 412 HP — on 850–1500 HP pools the
   scholar does most of the grinding. A formation-tuned band (or a
   companion-damage-aware est) could hand the finish to companions
   earlier. Named, not built — the current shape is GO as measured.
3. **Duplicate waveKillLog entries** (2/32 configs, engine double-write)
   — filed to the findings backlog; a future kill-EVENT metric must
   dedupe on (d, mid, by, via, trick).
4. **The scholar-role kill** (tashi_sherpa, s68808-lead): the blooded
   fiction touched the mantle-holder once. If the design wants the
   player-character to blood themselves deliberately, that's the
   scholar-veteran gap the autopsy filed — still open.

## Convergence note

- Axis scale-onramp: this arm closes the vetkill-autopsy named next #2
  (formation DIAG → formation lever). Formation is now a PROVEN lever:
  threat-driven kill-formation staging + finishing discipline forms
  significantly more distinct wave-4+ killers (10 vs 6, GO) with all
  guardrails passing. The veterans leg of the defer5 coincidence trap
  has a working formation half; the retention half is the sibling's.
- The scale wall stands (wins 0/32 both arms — structural on this
  substrate); the door moved (wave5 2/16 armed vs 1/16 control;
  national 5/16 vs 4/16).

## Instruments committed (namespace vetformation)

- scripts/policies/vetformation.js — the layer (VETFORMATION=1, default-off, zero src/js)
- scripts/test-vetformation.js — proof (E0 shape, E1 det-gate, E2 env-gate, E3 RED→GREEN fixtures, E4 determinism, D2 180d)
- scripts/vetformation-sweep.js — the 32-config census
- scripts/vetformation-analyze.js — the judge
- scripts/sense-vetformation.js — narration replay
- evidence/2026-10-23/perseed-vetformation/{control,vetformation}/ — the corpus (32 files)
- evidence/2026-10-23/sim-vetformation.md — this file
