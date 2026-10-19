# sim-feastgap — lead-vs-belong deferral-5 divergence diagnostic (flesh-out loop, 2026-10-19, ARM sim-feastgap)

Run: fleshout-20261019T1415Z, arm sim-feastgap. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md (read first; no canon doc covers the deferral-5 gap itself — said so here,
not invented), docs/PRESERVATION.md (pantry flows relevance).

Named next from sim-windowsurvive (evidence/2026-10-19/sim-windowsurvive.md): the lead-vs-belong
deferral-5 gap. On the same pre-seat full win-side substrate, leadfeast reached deferral-5 on 8/8
seeds (first d57–d107), belongfeast only 2/8 (d74, d113). The window-death taxonomy is effectively
a leadfeast diagnostic. WHY the policy gap exists is unmeasured — this arm diagnoses it.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (DIAG-GO):** the divergence point + named mechanism is identified with day-exact
evidence on ≥12/16 runs AND 0 unexplained seed-pairs (every one of the 8 pairs gets a
divergence day + named mechanism with paired day-exact numbers: capped-standing trajectories,
component (war/diplomacy/plenty) decomposition, tribute/tend flows, pantry curves, readiness
legs at divergence). A pair is "unexplained" if no mechanism with day-exact numbers pins it.

**DIAGNOSTIC MISS:** divergence point unidentifiable or ≥1 pair unexplained or <12/16 runs
with day-exact mechanism evidence. A miss is NO-GO, never re-scored against a friendlier
bar mid-run (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; the honest surface for a
pre-seat scale question).

**Seeds:** 8 FRESH 64201–64208 (verified: zero filename hits in evidence/2026-10-19/ and
scripts/ on 2026-10-19; content-hit risk is the loop-known pantry-kcal artifact class —
filename check is the convention) × {leadfeast, belongfeast} = 16 runs, paired on identical
seeds.

**Substrate (this arm):** the pre-seat full win-side stack WITHOUT vetrel:
`withSeatDrive(withWinDefer(withReposition(TF base)))` on {leadfeast, belongfeast} tribfloor
bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (SEATDRIVE='0' → seatdrive pure delegation; REPOSITION
unset → inert; VETREL unset → companion-veteran channel OFF, the pure tribfloor divergence
surface; KILLDISC=1 → the read-only kill-discipline instrument is installed — it wraps
call-through only, DET-gated).

**Divergence definition (pre-registered):**
- The "door" (windowsurvive-identical): deferral(5) true ≥ 1 day, i.e. `standingDeferral(5)`
  reports `.deferred` — capped standing ≥ t5 while the wave-5 readiness bar is unmet.
  Also recorded: firstCapT5Day (capped total ≥ t5, readiness-met or not), firstDef4Day.
- Per seed-pair: divergenceDay = the first day on which the two policies' def5 trajectories
  separate for good: lead reaches the door while belong does not by run end (or vice versa);
  for pairs where both reach: divergenceDay = the day the door-day gap becomes unclosable
  (the later policy never reaches by end). The analyzer prints, per pair, day-exact paired
  series (cap trajectories ±7d, war/dip/plenty split, pantry, flows-to-date, readiness legs,
  w4 kills) so the mechanism is read from numbers, not prose.

**Mechanism frame (pre-registered measurement, mechanism name read from the numbers):**
on the divergence day, the analyzer computes per pair: cap gap (lead−belong), component
contributions (war/dip/plenty), pantry gap, cumulative flows (tribute paid out, tend paid,
tribute arrears), feasts fired, scholar deaths, raid deaths, readiness legs (armor/armed/
tricks/veterans, short list), w4 kills by source. The mechanism is NAMED by which of these
moves with the divergence (standing-gap vs survival-gap vs readiness-gap vs pantry-gap vs
mixed) — the name comes from the largest day-exact delta, not from expectation.

**Instrument:** scripts/probe-feastgap-20261019.js (daily deferral/window census +
vetwindow-identical death capture + call-through payTribute/tendLink/hostFeast flow
recording + KILLDISC read-only kill census; DET gate pins instrument-on vs instrument-off
byte-identical), scripts/analyze-feastgap-20261019.js (divergence pinning + corpus
summary), scripts/feastgap-transcripts-20261019.js (SAY-line probe around divergence days,
base-faithful), scripts/build-feastgap-panels.js (§15: leadfeast corpus before vs belongfeast
after through scripts/balance-panel.js — the panel is the instrument, the pre-registered
threshold is the judge), scripts/test-feastgap-20261019.js (proof: classifier-parity +
flow-recording + divergence-classification fixtures, SMOKE, DET, gate-off byte-identical —
65+ assertions).

**§15 panel compare:** before=leadfeast corpus, after=belongfeast corpus (same substrate,
paired seeds; observerDigest identical, flags identical). Compare `.md` attached at
evidence/2026-10-19/feastgap-panel-primary.md.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

16/16 runs swept, 0 bad files, 0 instrument errors. Substrate verified in every
per-seed JSON (`pre-seat-winside-novetrel`).

**Wall on this substrate (16 runs):** national 10/16, table 12/16, wins 0/16,
wave-4 11/16, wave-5 0/16, median survival 110d (max 182d).

**The door:** leadfeast 6/8, belongfeast 4/8 (windowsurvive on the vetrel stack
saw 8/8 vs 2/8; the gap persists without vetrel, narrowed by two belong
door-reaches via war standing).

### The divergence mechanism: M-SEASONED-LINK-DIPLOMACY

The t5 bar (200) is crossed through **diplomacy standing**: `villageStanding()`
pays +34 per *seasoned* link (standing.js:36 — 30+ days old, trust 40+,
participating in a regional+ polity), while *plenty is capped at 100* toward
the bar ("bread alone cannot buy the fifth draft", standing.js:67). A
plenty-only village can never cross 200.

- Lead's road proposes subordinates from day ~25 (3 active by d27–38), tends
  them to trust 100, and the three links season together: diplomacy jumps
  0 → **+102 on a single day** (d57–68), capped standing jumps 125–182 → 202–227.
- Belong's road holds one upward bond (trust 70–100 on most seeds — trust is
  NOT the blocker). The bond earns diplomacy only when it seasons *and* the
  foreign primary's polity is regional+: on 4/8 seeds it never seasons
  (dip = 0 the whole run, cap pinned at the 100 plenty ceiling); on 3/8 it
  seasons once (+34) and the door still needs war standing or a long plenty
  climb. Whether the blocker is link-age resets (the v3 consolidator switch
  re-courts, restarting the 30-day clock) or the primary's polity never
  reaching regional scale is NOT distinguished by this instrument — named
  next, instrument link age + polity fire count.

### Per-pair divergence (day-exact)

| seed | div day | kind | lead: dip lands / door | belong: dip / door | mechanism |
|---|---|---|---|---|---|
| 64201 | d74 | lead-door-only | dip 0→102 (first d57); door d74, cap 202 | dip 0 always; cap flat 100; died d86 | M-SEASONED-LINK-DIPLOMACY |
| 64202 | d81 | lead-door-only | dip 0→102 (first d57); door d81, cap 202 | dip 0; cap 100; pantry 400→0 d81–82, starvD=2, died d83 | M-SEASONED-LINK-DIPLOMACY + pantry collapse |
| 64203 | d87 | belong-door-only | died d69 (starvD=3) before links seasoned | war 75→100; door d87 via war | M-SURVIVAL (lead died before the dip engine fired) |
| 64204 | d76 | both-door | dip 102; door d76 | door d169 — 93d late; war 50, dip 0, reached via war+plenty | M-SEASONED-LINK-DIPLOMACY (lateness 93d) |
| 64205 | d63 | both-door | dip lands exactly d63 (cap 125→227) | 1 seasoned link: dip 34 (d64) + war 50 → 184; door d120 via plenty. 57d late | M-SEASONED-LINK-DIPLOMACY (partial: 1 link vs 3) |
| 64206 | — | neither-door | both villages died d22, trajectories identical | — | M-SURVIVAL-EARLY (shared early death) |
| 64207 | d68 | lead-door-only | dip 0→102 exactly d68 (cap 125→227) | dip 0; cap ≤100; survived to d150 — pure stall | M-SEASONED-LINK-DIPLOMACY (cleanest pair) |
| 64208 | d72 | both-door | dip 102; door d72 | dip 34 (d73) + war 25 → 159; door d95. 23d late | M-SEASONED-LINK-DIPLOMACY (partial) |

**Verdict: DIAG-GO.** 16/16 runs carry a pinned divergence day + named mechanism
with day-exact paired numbers (≥12/16 required); 0 unexplained pairs
(8/8 pinned). The gap is a standing-*composition* gap, not a food gap: both
roads keep pantries in the 8–60k range at divergence; the tribute/tend outflows
(lead tend 21–66k total, belong tribute 40–99k total) do not separate the
trajectories — diplomacy does. The §15 panel read (feastgap-panel-primary.md,
leadfeast corpus before vs belongfeast after, paired seeds): national −0.25,
scholar deaths +0.6/run, community loss +0.25 — the instrument confirms the
gap; the pre-registered DIAG-GO threshold is the judge.

Full corpus: evidence/2026-10-19/feastgap-corpus-summary.json (per-pair series
±7d around every divergence day: cap/war/dip/plenty, pantry, def5/def4,
readiness shorts, links, arrears).

## Village assessment

What the villages looked like: 16 villages on the pre-seat full win-side
stack without vetrel (leadfeast/belongfeast, 180d death-aware). They are not
starving villages — they are villages mid-climb, and the climb forks on
diplomacy. The lead villages become hubs: by ~day 30 three subordinate bonds
stand under one head (Stonebridge, Emberhold, The Red Table on s64201; The
Red Table, The Red Table II, Stonebridge on s64205), tribute grain arriving
inward ("Their fields, our fire"), the scholar sending grain outward in
return ("not tribute, the other way around. Someone's grandmother over there
will remember who fed her. (Trust +8.)"). On the divergence days the System
names the new threshold aloud: "The fifth draft stays in the wings. The
Producers want a village that can fight them."

The belong villages are rich and alive — and stuck. On s64207 the pantry
holds ~99 days of fresh on the divergence day; the village feasts for the
cameras, pays 5,120 kcal tribute to Thornfield without strain, and Haven
sits 1st of 6 in the standings. But its standing is bread standing: capped
at 100, 100 below the bar, and the bar does not move no matter how full the
bins get. It survives (to d150) and stalls.

Who thrived and who died and why: the scholar dies on both roads — 7–13
successions per run on the door pairs, the same field-combat grind the
windowsurvive taxonomy mapped (raid/wild channels). The divergence is not a
death gap; it is a standing-composition gap. Lead's door days: d63–81
(first dip d57–68, always the seasoned-link day). Belong's door days: d87
(via war, after lead died), d95 (partial dip + war), d120 (partial dip +
plenty), d169 (93 days late). On 64206 both villages died on day 22 with
byte-near-identical early trajectories — the seed's opener, not a policy
difference.

What was missing: seasoned diplomacy on the belong road. The upward bond
carries trust 70–100 (the policy pays its tribute) but seasons only when the
bond holds 30+ days under a consolidating primary — and the road's own verbs
(succession re-younging, the v3 consolidator switch re-courting) keep
restarting that clock.

## Sense-testing (SENSE-TESTING LAW)

Read: 6 base-faithful transcripts (sweep-base e374e9a3, death-day-exact vs
measured teles) — s64207 both policies (1,516 / 1,636 SAY lines, d61–75),
s64201 both (1,195 / 1,531, d67–81), s64205 both (1,708 / 1,515, d56–70).

**The mechanism reads aloud.** s64205 lead, d63 — the exact divergence day:
"📺 SYSTEM: '📡 The fifth draft stays in the wings. The Producers want a
village that can fight them — armor the village (0 of 4 fighters armored);
blood your fighters (0 of 2 veterans).'" The same day's ledger: "Tribute
from The Red Table arrives — 3,000 kcal of grain into the pantry. Their
fields, our fire." and the outward tends: "Haven sends 1,500 kcal of grain
to Stonebridge's fire — not tribute, the other way around. Someone's
grandmother over there will remember who fed her. (Trust +8.)" — the
diplomacy engine in the village's own words, the same day the cap jumps
125 → 227.

**The stall reads as a living village, not a broken one.** s64207 belong,
d68: "Willie checks the pantry before heading out — the shelves are full,
~99 days of fresh on hand… the pantry can't take more; the wild will keep."
d69: "With Haven grieving, Thornfield installs their own speaker at the
table — but the bond is young, and they're still deciding what Haven is.
The new speaker wants to talk before the tribute changes. Grief delays the
verdict." d71: "Thornfield's court summons Haven's speaker. SWEAR the oath
of the realm (a gift seals it), SERVE at their court (seven days of your
speaker's life), or WALK — break the link and stay a free fire, refusing the
scale itself with it." The same "bond is young" beat fires on s64201 d67.
The fiction *agrees with the instrument*: the upward bond is perpetually
young — every succession (~10 per run) re-youngs it, and the policy's own
re-courting restarts the 30-day clock. The village feasts, pays tribute,
stands 1st of 6 — and cannot season a bond. That is the stall, narrated.

**Blanks (robotic/static):** none new — the "bond is young" templating is
load-bearing here (it names the mechanism), and the death liturgy behaves
as windowsurvive documented.

## Metric review

The pre-registered bar (divergence point + mechanism, day-exact, ≥12/16 runs;
0 unexplained pairs) is met with margin: 16/16 runs pinned, 8/8 pairs
mechanism-named, 0 unexplained. No re-score (§14). The bar was honest and
the instrument cleared it.

**§14 honest metric doubts — for the NEXT run, not this one (DIAG-GO stands):**
1. **Seasoning-blocker unattributed.** Trust 70–100 on stall seeds rules out
   the trust leg, but link age and the primary's polity size are not in the
   census — the "why doesn't the bond season" split (age-reset vs
   unconsolidated primary) is named-next, not measured.
2. **belongfeast door definition.** Belong reached deferral-5 on 4/8 — but
   via war standing twice. The door is a standing bar, not a road verdict;
   a belong-specific reachability question ("can the road reach *its* door
   on its own terms") needs its own pre-registration.
3. **s64206's shared early death.** Both policies died d22 near-identically —
   counted as explained (M-SURVIVAL-EARLY) but it is a seed opener, not a
   policy finding; a future run could treat it as uninformative rather than
   explained.
4. **Base relativity.** The sweep measured worktree base e374e9a3 (master at
   run start). Sibling game-code landings move trajectories (the windowsurvive
   lesson) — re-sweep before sizing any lever on this substrate.
5. **The +34 vs +102 fiction check.** Lead's three seasoned links all read
   as Haven-primary subordinates in the transcripts; belong's +34 reads as
   the upward bond. The instrument doesn't name *which* link seasoned — the
   transcripts do. A future instrument should log link ids in the dip count.

## Named nexts

1. **sim-seasonblock — GO.** Attribute the seasoning blocker: instrument
   link age + primary-polity fire count per link per day, on belongfeast
   across the stall seeds (64201, 64202, 64207). Pre-register: the blocker
   named per bond (age-reset by succession / age-reset by v3 re-court /
   primary polity < 4 fires) with day-exact evidence. This is the
   belong-road lever surface the diagnosis points at: if the blocker is the
   v3 re-court, the policy's own switch is the stall; if it is succession
   churn, the seasoning rule needs a succession-aware form (steve-call
   sized — it changes the fiction of "the bond is young").
2. **steve-call candidate:** should a scholar succession re-young the
   upward bond? The beat says the bond is young "while the chair is empty"
   — currently the verdict *delays*; the instrument suggests it may also
   *reset*. A design ruling before any lever.
3. **belongfeast partial-dip levers** (lateness 23–93d on the 3 both-door
   pairs): the +34 comes through; a second seasoned link would cross the
   bar. Candidate policy-side arms: consolidate-on-one-primary (no
   re-court once trust ≥ 40), or the oath-seeking (swear early at the
   Binding beat instead of riding the consolidator).

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased.)
- belong upward bond seasoning blocker unattributed (age-reset vs polity scale) — the sim-seasonblock named next.

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 16/16 pinned,
0 unexplained) and hands the coordinator the named mechanism
(M-SEASONED-LINK-DIPLOMACY) plus the GO next arm (sim-seasonblock). The axis
stays converging: wins 0/16, wave-5 0/16 on this substrate; national 10/16
and table 12/16 — the standing directive's lift condition is met on measured
evidence on this pre-seat stack, but the lift remains a coordinator/Steve
call (as windowsurvive recorded).

## Files

- scripts/probe-feastgap-20261019.js — sweep probe (daily deferral census +
  vetwindow-identical death capture + call-through payTribute/tendLink/
  hostFeast flow recording + KILLDISC read-only kill census; DET/SMOKE/
  FIDELITY gates)
- scripts/analyze-feastgap-20261019.js — divergence pinning + corpus summary
- scripts/feastgap-transcripts-20261019.js — SAY-line probe around
  divergence days (sysSay restored; base-faithful)
- scripts/build-feastgap-panels.js — §15 panel compare (leadfeast corpus
  before vs belongfeast corpus after, paired seeds; pseudo-policy case
  identity documented)
- scripts/test-feastgap-20261019.js — proof: classifier parity (17),
  flow-recording fixtures (4), divergence fixtures (4), SMOKE, DET
  byte-identical, real-file checks — 31/31 pass
- evidence/2026-10-19/perseed-feastgap/{leadfeast,belongfeast}/s64201–s64208.json — 16 per-seed sweep JSONs (top-level won/national/table booleans; base e374e9a3)
- evidence/2026-10-19/feastgap-corpus-summary.json — corpus summary (analyzer output, per-pair ±7d series)
- evidence/2026-10-19/feastgap-panel-primary.md (+ .json, .json.gz) — §15 panel compare (attached)
- evidence/2026-10-19/feastgap-transcripts/{leadfeast,belongfeast}-s{64201,64205,64207}.txt — 6 divergence-window transcripts
- evidence/2026-10-19/sim-feastgap.md — this file
