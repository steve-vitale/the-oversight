# sim-surpluskeep2-b — threshold-gated SURPLUSFEED CONFIRM (instrument-only DIAG)

Run: fleshout-loop-b, arm sim-surpluskeep2-b (the explicit named next of the
0730Z run's sim-surpluskeep-diag-b). DIAGNOSTIC — no lever, no landing,
instrument-only, ZERO src/js changes, zero policy edits (upkeepgate.js
untouched — it is inert). Worker tree: ~/workspace/worktrees/sim-surpluskeep2-b.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

- **Question**: the parent arm (sim-surpluskeep-diag-b) REJECTED the
  dose-proportional trim→upkeep-tax hypothesis twice (Pearson −0.521 here,
  −0.529 on the parent substrate) and fully exemplified (n=1, seed 8802
  leadfeast) the THRESHOLD-GATED mechanism: the SURPLUSFEED trim pushes the
  pantry through the POLICY's own absolute 20,000 tendLink gate → the policy
  stops tending (leadcourt.js:61 tends ONLY when pantryKcal > 20000) →
  subordinate trust erodes → no-break dissolution at the _linkSeasoned
  trust-40 bar. This arm confirms the threshold mechanism systematically.
- **Primary (DIAG mechanism confirm)**: pre-register gate-crossing weeks
  (weeks when a run's pantry crosses the 20,000 tendLink gate) + 4-week
  post-gate trust trajectories on PAIRED SURPLUSFEED on/off runs.
  Seeds 8801–8808 × {leadfeast, belongfeast} × {control, armed} = 32 runs,
  180d death-aware horizons (dead villages stop +10d tail max), env
  FEASTSCALE_R13=1/SEATDRIVE=0 both arms, SURPLUSFEED=1 armed side only,
  SAME base commit for both arms (26ef3caeb).
- **DIAG-GO bar** (all must hold):
  1. ≥4 gate-crossing events detected AND attributed (named cause each)
     across the corpus (armed leadfeast runs).
  2. Mean 4-week post-gate trust delta (armed minus paired control) ≤ −15,
     over paired-evaluable events (both arms have trust at the gate week
     and 4 weeks later).
  3. 100% of post-gate (8-week window) realm dissolutions attributed to a
     named cause.
  4. 0 unexplained events or dissolutions.
  - If <4 events: report-only **DIAG-insufficient-data** (NOT a failure).
- **Verdict classes**: DIAG-GO (mechanism confirmed; the named next is the
  SURPLUSFEED default-ON call — a coordinator/Steve decision, NOT this
  arm's), DIAG-insufficient-data (<4 events — report only), or NO-GO
  (mechanism not confirmed — say what remains).
- **Instrument proof** (pre-registered, scripts/test-surpluskeep2-b.js):
  (a) RED: pristine runs carry no gate/upkeep instrument state (armed+unset);
  (b) GREEN: gate sensor records a daily dawn pantry series; the PURE
  gate-crossing detector passes synthetic units (downward crossings, edge at
  exactly 20000, gaps never interpolated, recrossings); the 8802 exemplar
  end-to-end on current master (detector honesty on real data + trust
  trajectory extraction + paired control computable);
  (c) DET: instrumented vs pristine canonical projection byte-identical
  (all wraps RNG-clean — read-only, behavior-neutral);
  (d) REPEAT: same armed seed twice byte-identical (incl. gate series);
  (e) RED-EQUIV: instrumented vs pristine outcome fields, SURPLUSFEED unset.

### Brief corrections (code-grounded, NOT re-scoring)

1. The assignment brief says "pantry crosses the 20,000 tendLink gate
   **upward**" and "skips tend-weeks when the pantry is **above** 20k".
   Both are inverted vs the policy code: leadcourt.js:61 —
   `if (link.tendedWeek !== week && pantryKcal(Game) > 20000) { Game.tendLink(link.id); }`
   — tending fires ONLY when the pantry is ABOVE 20,000; at/below 20k the
   policy never calls tendLink, so tending is SKIPPED. The
   mechanism-relevant crossing is DOWNWARD (pantry falls from >20k to
   ≤20k → the gate closes → tending stops), exactly as the parent's 8802
   exemplar shows ("the pantry fell through the policy's 20,000 gate and
   tending STOPPED"). All detection in this arm uses the downward crossing.
2. **Mechanism eligibility** (refinement, documented here before the
   sweep): the threshold mechanism is "tending STOPS" — it requires an
   existing upkeep relationship (≥1 active Haven-primary link to tend at
   the gate week). A pre-court crossing (no tendable link) is
   mechanism-inert by construction: there is no tending to stop. Such
   events are detected and reported but do NOT count toward the ≥4 bar.
   (Prompted by the proof: on current master 8802 crosses at week 4,
   pre-court, with trust RISING 35→65 — courtship, not upkeep.)

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md covers the food ladder
  (cleaned→cooked→smoked→rendered→pemmican; "rot can't be smoked back into
  food") but contains NO SURPLUSFEED trim-governor canon — the trim
  governor is documented in scripts/policies/feastscale.js + the parent
  evidence, not invented here. Diagnostic: zero game code touched, zero
  policy layers built. The feast is the village's social engine;
  tribute/tendLink are the REALM's upkeep engine — real pantry kcal for
  trust, priced honestly.

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-surpluskeep2-b.js: **27/27 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED: pristine runs carry no gate/upkeep instrument state, armed and unset (2/2).
- GREEN: gate sensor records a daily dawn pantry series — non-empty, one
  entry per dawn, [int day, int kcal], non-negative, days non-decreasing
  (sleep may fire twice on one game day — found and handled, 5/5); the PURE
  detector passes 11 synthetic units (downsampling, duplicate-day dawns,
  downward crossings at the right week, edge 20001→20000 counts / 20000→20001
  doesn't, gaps never interpolated, recrossings).
- GREEN 8802 exemplar end-to-end on current master (26ef3caeb): 1 downward
  crossing detected (w4, 24352→13900), every detected crossing straddles the
  20k gate in the weekly series (detector honesty on real data), trust
  trajectory extracts, paired control computable. **The parent's full chain
  does NOT reproduce on this master**: the crossing is at WEEK 4 (pre-court;
  court sat d77), and 4-week post-gate mean polity trust RISES 35→37→47→56→65
  (courtship, not upkeep) — the realm held to the village's death at d132.
  The instrument correctly reports the crossing as mechanism-INELIGIBLE
  (no tendable link at the gate week). Substrate moved under the exemplar.
- DET: instrumented (upkeep probe + gate sensor + sfeed) vs pristine
  canonical projection byte-identical, 40d × 2 seeds armed (2/2) — all wraps
  RNG-clean, read-only, behavior-neutral.
- REPEAT: same armed seed twice byte-identical including the gate series (1/1).
- RED-EQUIV same-commit (8801/8802 × 60d, SURPLUSFEED unset): instrumented ≡
  pristine outcome fields — the gate instrument adds zero drift (2/2).

## Sweep results (32 runs, substrate 26ef3caeb — paired control+armed, same commit)

Wall numbers (paired, armed / control, n=16):
won 0/16 / 0/16, national (end-state) 8/16 / 5/16, national (ever-hit) 13/16 / 11/16,
table 13/16 / 14/16, wave-4 14/16 / 13/16, wave-5 0/16 / 0/16,
median 119.5d / 109.5d, max 180d / 167d, exiled 0/16 / 0/16.

The wall stands (zero wins, wave-5 0/32, pre-seat) — this diagnostic does not
attack the wall. Two belongfeast-armed villages survived to the 180d horizon
(8801, 8808); every other run ended village-lost.

### The substrate moved under the exemplar

The parent's 8802 mechanism exemplar does NOT reproduce on 26ef3caeb. On
current master, 8802-leadfeast-armed crosses the 20k gate at WEEK 4
(24,352→13,900 kcal) — pre-court (court sat d77) — and 4-week post-gate mean
polity trust RISES 35→65 (courtship, not upkeep). The realm held to the
village's death at d132. The parent's chain (pantry through the gate at ~d78
→ 9 skipped tend-weeks → trust 100→7 → no-break dissolution d124) required a
pantry that could sit at 10–20k for WEEKS while the village lived. That
regime is gone: on this substrate, post-court gate crossings coincide with
TERMINAL pantry collapse — the village dies within days of the crossing,
with trust still high (86–92) at the crossing. The crossing is a
death-marker, not an upkeep-starvation onset.

### Gate-crossing events (armed leadfeast, downward through 20k)

8 eligible events (≥1 active Haven-primary link at the gate week) + 2
ineligible pre-court crossings (detected, reported, not counted). 6
downward crossings also detected on CONTROL leadfeast runs — the gate is
crossed without the trim (trim-independent phenomenon).

Per-event ledger (armed; trust = mean polity trust w..w+4; pairedDelta =
armed minus paired control):

seed week(d) before→after armedTrust ctrlTrust pairedΔ attribution
8801 w17(d119) 34928→5631 [92,90,–,–,–] — — village-died-truncated (dead d131)
8802 w4(d28) 24352→13900 [35,37,47,56,65] [45,54,66,77,64] +10.0 trust-stable-or-rising (pre-court courtship)
8804 w4(d28) 20428→7200 [40,–,–,–,–] [35,34,22,19,13] — village-died-truncated (dead d33)
8805 w10(d70) 24192→850 [60,61,73,–,–] — — trust-stable-or-rising (dead d85)
8806 w4(d28) 29362→13700 [38,51,70,70,72] [42,55,56,60,69] +6.4 gate-recrossed-transient (back above w6)
8806 w10(d70) 21140→15944 [81,87,99,100,100] [80,100,100,92,91] +7.3 gate-recrossed-transient (back above w12)
8806 w21(d147) 61626→7113 [86,–,–,–,–] — — village-died-truncated (dead d150)
8808 w18(d126) 31128→0 [90,–,–,–,–] — — village-died-truncated (dead d127)

Ineligible: 8801 w2 (21750→16500, recrossed, pre-court), 8807 w1
(39430→17900, no tendable link, pre-court).

### Bar evaluation

1. **≥4 events attributed: 8/8 PASS** (all named; taxonomy completed with
   'trust-stable-or-rising' — see metric review).
2. **Mean 4-week post-gate trust delta (armed−control) ≤ −15: +7.9 FAIL**
   (n=3 pairedFull; wrong sign — trust ROSE relative to control post-gate).
3. **100% post-gate dissolution attribution: VACUOUS** — 0 post-gate
   dissolutions in 8 weeks after any event (the outcome the mechanism
   predicts did not occur once).
4. **0 unexplained: PASS** (after taxonomy completion).

**Verdict: NO-GO.** The mechanism's core prediction — trust erodes after
the pantry crosses the 20k gate — fails on the sign (+7.9 vs ≤ −15), and
its terminal prediction — no-break dissolution — never fires. The three
post-court crossings (8801 w17, 8806 w21, 8808 w18) are all
terminal-collapse markers: pantry crashes 31–62k → 0–7k in a week, the
village dies within 1–12 days, trust 86–92 at the crossing. There is no
sustained "lean pantry, living village, stopped tending, eroding trust"
regime on this substrate for the mechanism to inhabit.

Control-side check (trim-independent): control post-court crossings (8803
w20: trust 92→93 flat, realm held; 8806 w14: 91→75 mild decline, village
died, realm held; 8808 w11: 87→87 flat, village died, realm held) confirm
the gate itself does not produce the predicted dynamics either. The
mechanism is absent on this substrate, not merely trim-unmoved.

## Balanced panel (§15)

Ran the panel driver before/after on the 32-run design (8801–8808 ×
{leadfeast, belongfeast}, 180d, FEASTSCALE_R13=1/SEATDRIVE=0; SURPLUSFEED=1
on the after side only). Both panels are VALID (16 cases each, neutrality
proofs pass, no observer warnings).

The formal compare is **invalid by design**: `comparePanels` refuses with
"Unmatched flags" — SURPLUSFEED is discovered as a source-declared
simulation flag (feastscale.js reads process.env.SURPLUSFEED), so it enters
the panel identity when set; the before/after flag sets differ and the
comparator will not compare across a flag difference. (Refines the parent
arm's "inexpressible" note: the treatment IS in the case identity via flag
discovery — which is exactly why the comparator refuses, rather than
silently miscomparing.) The §15 instrument cannot express an env-var
treatment's before/after; the paired analysis above (identical seeds,
commit, instruments) is the before/after. Compare artifact attached:
evidence/2026-10-21/panel-surpluskeep2-b/compare.md (decision: invalid).

Descriptive panel metrics (NOT a formal compare — same seeds/policies,
shown for the record):
before→after: won 0.000→0.000, national 0.688→0.750, table 0.875→0.750,
survival30 0.188→0.313, survival60 0.063→0.250, communityLost 1.000→0.875,
playerDeaths 9.94→9.00 (n=16 each). No win movement; survival leans
armed-favorable on 16 cases but the paired corpus is the binding
comparison.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall-preseat.json
--current 'evidence/2026-10-21/perseed-surpluskeep2-b/flat/*.json'
--metrics national,table,won,exiled` → **quiet** (32 files, 4 metrics, no
large deviations). Baseline NOT rolled. The flat per-seed summaries live in
evidence/2026-10-21/perseed-surpluskeep2-b/flat/ (32 files).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read the full upkeep-narration corpus for the armed leadfeast runs (509
captured dissolve-regex lines across 8 seeds). The tending beats are voiced
and read well — "🌾 Haven sends 1,500 kcal of grain to Stonebridge's fire —
not tribute, the other way around. Someone's grandmother over there will
remember who fed her." The tribute-shortfall beats are voiced with the
arrears math — "🌾 Emberhold's tribute comes up thin — 600 of 4,000 kcal.
They sent everything the wagons could carry, and it wasn't enough." /
"🌾 Nothing comes from Stonebridge this week — their fields are as empty as
the wagons look. Hunger isn't defiance, but the ledger doesn't know the
difference." Nothing robotic; the village names rotate (Emberhold,
Stonebridge, Thornfield, Ashford).

The trust-crater path did not fire in this corpus (0 post-gate
dissolutions; trust flat/rising at every crossing), so there are no new
trust-crater beats to judge. **#751 (trust-erosion toward dissolution
unvoiced) stays open** — no new instances from this arm, no fix from this
arm (the sibling sim-trustdrift-voice-b arm owns the narration fix, not
this diagnostic). The gate-closing itself (tending stopping when the pantry
crosses 20k) remains unvoiced — the policy simply never calls tendLink —
which is the same blank the parent filed.

## Metric review (§14)

- **Brief correction (upward→downward)**: the assignment brief's "crosses
  the gate upward" is inverted vs leadcourt.js:61 (tending fires ONLY when
  pantryKcal > 20000). Corrected to the downward crossing BEFORE the sweep,
  documented in the pre-registration — a correction of the brief against the
  code, not a re-score.
- **Eligibility refinement**: the brief's "≥4 gate-crossing events" did not
  specify eligibility; the pre-registration (written before the sweep)
  requires ≥1 active Haven-primary link at the gate week, because the
  mechanism is "tending STOPS" and there must be tending to stop. Without
  this, pre-court crossings (trust in courtship, rising by construction)
  would have counted as mechanism events. 2 crossings were excluded as
  ineligible; the bar still counted 8.
- **Taxonomy completion ('trust-stable-or-rising')**: two events showed
  trust RISING post-gate (8802 w4: 35→65; 8805 w10: 60→73) — a clear,
  interpretable, mechanism-disconfirming outcome that the pre-registered
  taxonomy had no name for. Named during analysis; the verdict does not
  depend on it (bar 2 fails regardless at +7.9 vs ≤ −15). Not a re-score.
- **Bar 2's n=3 caveat**: the mean paired 4-week delta rests on 3
  pairedFull events, all pre-court (courtship phase). The 3 post-court
  events are all village-died-truncated (no 4-week data exists — the
  villages died within days). The bar fails on the sign, not on power, but
  the composition is stated plainly: the paired comparison never observes
  a post-court upkeep-phase trust trajectory because the villages don't
  survive one.
- **Bar 3 vacuous**: 0 post-gate dissolutions in 8 weeks after 8 events.
  Per the pre-registered verdict logic this is NO-GO (mechanism
  unconfirmed), not DIAG-GO — a dissolution mechanism cannot be confirmed
  without a dissolution. The <4-events DIAG-insufficient-data rule does not
  apply (n=8).
- **What would change this verdict**: a substrate (or seed set) where the
  pantry can sit below 20k for multiple weeks while the village lives —
  the sustained lean-pantry regime the parent's exemplar inhabited. On
  26ef3cae that regime does not occur on the lead road; the pantry falls
  through 20k only as the village starves. A future confirm should
  pre-screen for post-court sub-20k persistence before spending the sweep.

## Village assessment

**What the village looked like**: thirty-two villages on the same
FEASTSCALE_R13=1/SEATDRIVE=0 substrate, all grinding through the
100–150 day window. The lead road sits its court reliably (d77 on 7/8
armed seeds, d77–92 on 5/8 controls) and then holds the realm while the
village itself dies underneath it — 7/8 armed lead villages died with
nationalLive still true, the polity intact on a corpse. The belong road
reaches for the court (nationalDay set on 6/8 armed, 6/8 control) but
cannot keep it: end-state national is false on 7/8 armed and 8/8 control,
the losses trim-orthogonal (the parent's primary-realm-collapse shape).

**Who thrived**: 8801 and 8808 on belongfeast-armed lived to the full
180d horizon (end=survived) — the only two survivors in the corpus. Both
carried big trim loads (465k and 228k kcal) and paid heavy tribute
(168k/106k) without the realm surviving them. Survival and realm-holding
are decoupled here.

**Who died and why**: everyone else, village-lost between d33 and d168
(median 119.5 armed / 109.5 control). The deaths cluster in the
post-court 100–150d window on the lead road — the villages that learned
to tend their subordinates, paid 27–81k kcal in upkeep, held trust at
86–92, and then starved with full pantries of loyalty. The pantry
crashes that cross the 20k gate (8801 w17: 35k→6k; 8806 w21: 62k→7k;
8808 w18: 31k→0) are not "the trim leaned the pantry" — they are the
village's final week. 8804 (both arms, lead) never got started: dead at
d33/d68 pre-court, the 8807-class fork-artifact shape.

**What was missing**: a survivable lean-pantry regime. The mechanism this
arm hunted needs a village that can LIVE for weeks at 10–20k pantry while
tending stops and trust erodes. On this substrate that village does not
exist — below 20k the pantry is in free fall and the village with it.
The binding constraint on the scale wall here is not realm upkeep (the
lead realm holds to the death); it is whatever kills villages at
d100–150 with the court sitting and the pantry emptying.

**Blank filled**: the threshold-gated SURPLUSFEED→dissolution mechanism is
closed as NO-GO on current master with a complete causal account (not a
"we didn't see it" — we saw the crossings, measured the trust, and the
sign is wrong). **Blank documented**: the d100–150 village-death cluster
with intact realms is the wall's current shape on this substrate — filed
to the backlog (the deaths' proximate causes are outside this arm's
instrument; a death-cause census is the named next, not this arm's).

## Convergence state

**NO-GO — threshold-gated SURPLUSFEED→realm-dissolution mechanism NOT
confirmed on 26ef3caeb.** 8 eligible gate-crossing events detected and
attributed; mean 4-week post-gate trust delta (armed−control) = **+7.9**
(bar ≤ −15 — wrong sign, trust rises); 0 post-gate dissolutions (the
predicted outcome never fires); 0 unexplained. The parent's 8802 exemplar
does not reproduce on this master (crossing moved to week 4 pre-court,
trust rising). Post-court crossings are terminal-collapse markers (village
dies within days, trust 86–92), not upkeep-starvation onsets — the
sustained lean-pantry regime the mechanism needs does not occur on this
substrate. **DO NOT TOUCH src/js; no lever to land — instrument-only on a
landed governor.** The SURPLUSFEED default-ON call keeps its one complete
causal exemplar (parent, old substrate) against this systematic NO-GO (new
substrate) — a coordinator/Steve decision with both on the record.
food-economy stays converging; the wall is unmoved (wins 0/32, wave-5
0/32). Named nexts: (1) death-cause census for the d100–150 village-death
cluster with intact realms (backlog); (2) any future threshold-confirm
must pre-screen for post-court sub-20k pantry persistence before spending
the sweep.
