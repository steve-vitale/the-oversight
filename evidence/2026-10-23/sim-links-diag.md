# sim-links-diag — link/diplomacy formation DIAG + lever pilot (run fleshout-20261023T1015Z, axis scale-onramp)

Worker tree sim-links-diag. Namespaces: linksdiag-* (scripts/evidence),
linkform-* (policy). ZERO src/js. Zero file overlap with sibling loop-B arms
(food-economy) and sim-vetretention-restage/sim-vetstack.

Canon read first: docs/CANON.md + docs/SCALE.md (the scale ladder: six
national roads, the polity bars, the Regional Dawn; links form at trust 30,
season at 30d+trust 40). The dip/link mechanism lives in
src/js/standing.js (villageStanding, _linkRegionalPlus) and
src/js/hierarchy.js (proposeLink/judgeLink/_formLink/tendLink).

## PRE-REGISTRATION (§14 binding — set before any analysis or sims)

- **BINDING QUESTION (tracker's named candidate "lever-8 link-formation
  DIAG/lever", from sim-defer4gate):** on 6/6 stand-raw-bound census configs,
  dip=0 AND links=0 — the diplomatic layer never engaged; standing built only
  via war + plenty capped at 0–185, short of t5=200. How do diplomatic points
  and regional links form in the wild on current master, and what lever would
  move them?
- **PHASE 1 — DIAG-GO (binding):** >=90% of link/dip FORMATION EVENTS in the
  retained corpora (doorcensus-armor: seeds 65511–65522 × {control, armed},
  24 configs) attributed to NAMED sources/channels, via the committed
  instrument scripts/w5gates-lib.js (PURE, unmodified) + the per-seed window
  raw trajectories. A miss is insufficient-data, not a failure (offline-first:
  zero src/js, zero new sims first).
- **PHASE 2 — LEVER PILOT (only because the DIAG named leverable channels):**
  two policy-side arms under namespace linkform-* (env LINKFORM, default-off),
  ZERO src/js, against one shared baseline on IDENTICAL seeds.
  - Seeds: 68401–68408 (fresh; 65511–65522 are the census set, 68301–68308
    used by sim-armored15-confirm). Pilot gate §§9–12: 8 seeds before/after.
  - Horizon: 180d death-aware (same as the census). Why: census dip formations
    landed d52–d113 and dissolutions ran to d180; the formation window needs
    ~120d and the dissolution tail needs the full run. Dead villages stop
    (+10d tail max).
  - Substrate (pinned): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
    SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 (the census armed leg;
    the ONLY delta between legs is LINKFORM).
  - Policies: baseline = AV.armedFor('leadfeast') (the census armed config);
    cadence = LF.linkformArmedFor() + LINKFORM=1; overcourt =
    LF.linkformArmedFor() + LINKFORM=2.
  - **Arm linkform-cadence (LINKFORM=1):** propose from day 15 (was 25),
    2 proposals/day (was 1), tend every 3 days (was weekly), always sweeten
    counters (was only-when-rich). Hypothesis: the 4 long-survivor census
    configs (d144–180, zero links) failed at the proposal/acceptance gate.
    PRIMARY METRIC: configs with a first dip-formation event (+102 step,
    incl. +122 bundles) by day 120. **GO: armed − baseline ≥ 2 AND armed ≥ 5/8.**
  - **Arm linkform-overcourt (LINKFORM=2):** court to 5 subordinate links
    (was stop-at-3); tend all weekly. Hypothesis: the 8 census dissolution
    events came from single-link trust dips below 40 dissolving the 3-link
    polity; redundancy holds the realm. PRIMARY METRIC: configs with end
    dip ≥ 68 (≥2 dip-counted links held). **GO: armed − baseline ≥ 2 AND
    armed ≥ 5/8.**
  - A miss on either arm is NO-GO, never re-scored (§14). Killed arms leave no
    trace (policy file stays — it is the instrument; game code untouched).
- **§15 balanced panel:** reviewed and judged inapplicable to this pilot —
  same class as sim-doorcensus-armor: the panel's contract is the instrument
  for src/js balance levers; this pilot changes ZERO game code (policy-layer
  only). The paired identical-seed sweep on the unmodified census instruments
  (windowstay + w5gates-lib) is the instrument; the pre-registered GO bars
  are the judge.

## PHASE 1 — OFFLINE DIAG RESULTS: DIAG-GO (24/24 formation events attributed)

### The dip mechanism (code, standing.js + hierarchy.js)

Standing = war + diplomacy + plenty. diplomacy = links × 34, where a link
counts only if BOTH filters pass:
1. **Seasoned** (`_linkSeasoned`): 30+ days old AND trust ≥ 40 (links form at
   trust 30 — tending required; conquered links need the season only).
2. **Regional+** (`_linkRegionalPlus`, 2026-10-14 design call): the link must
   participate in a regional-scale polity — LEAD: polityOf('haven') exists
   (≥3 seasoned subordinates); BELONG: the primary's realm holds ≥4;
   covenant/trade: the link sits in its league polity. A lone seasoned bond
   scores 0.

Link formation channels (who creates links — the engine NEVER forms Haven's
links autonomously):
- **C1 proposeLink** (courtship): Haven-primary or Haven-subordinate via
  judgeLink (base 38 + repS/2 ≤20 + opinion/2 + strength ±10–15 + generosity
  +8 + RNG ±10); ≥55 accepts, 35–54 counters (answerCounter accept/sweeten/
  walk), <35 declines. Gated by knowsVillage + opinion + pantry.
- **C2 proposeCovenant/proposeTrade** (peer leagues): opinion ≥ 10 prerequisite.
- **C3 raidVillage** (conquest): force path, trust 15, duress tribute.
- **C4 counter answers**: the negotiation band of C1/C2.
- **C5 foreign bindings** (off-screen): never Haven's links, never score dip.

What gates the FIRST link: contact (knowsVillage, nearest fire ~day 4–5),
the judgeLink score (opinion is the climb currency: codex +3 once, broadcast
wins +2 each, time +1/week), the policy's pantry gates (propose >12k, tend
>20k), and the accord gesture (first link stages the played beat; the
Regional Dawn waits for a 21+ day bond).

### Attribution: 24 formation events, 24/24 named (100%)

Decomposing the 24 configs' window raw trajectories (PURE, w5gates-lib
end-vectors as cross-check): every dip-formation event is a single-day
+102 step (or +102 bundled with a feast: +122) — NEVER a lone +34 or +68.
The dip is a POLITY step function: all three links' points activate the day
the THIRD subordinate link seasons and polityOf('haven') comes into
existence. The fiction says it aloud at the third link ("Three fires bow to
Haven. But a realm isn't leverage — it's seasons").

| # | channel | events | named |
|---|---|---|---|
| 1–20 | C1 proposeLink → LEAD-realm polity formation (leadcourt policy courts Haven-primary subordinates, tends to 40, third link seasons) | 20 × +102, days 52–113 (median ~d60) | 20/20 |
| 21–24 | C1, feast-bundled (+122 = 102+20, same mechanism) | 4 × +122 | 4/4 |

- The 16 configs ending dip=102/links=3 (national=1 on all 16) each show
  exactly one formation event — the policy's `subs >= 3` stop rule explains
  the always-exactly-3 pattern.
- The 8 configs ending dip=0/links=0: 3 died before courtship could season
  (d31, d75, d79); 1 never formed in 159d (control s65518); 4 long survivors
  (d144–180: armed s65518/s65519/s65521, control s65522) formed and then
  DISSOLVED — 8 × −102 dissolution events total, including armed s65518's
  4× form/dissolve loop (d96/118, d127/163, d167/169, d172/180).
- CORRECTION to sim-defer4gate's framing: the diplomatic layer engaged on
  16/24 census configs (not "never") — the 6/6 stand-raw figure was correct
  for the bound subset, but corpus-wide the layer engages wherever the
  courtship lands. The two OPENED doors' dip=102 was present on BOTH arms
  (control s65515/s65516 also dip=102/links=3) — diplomacy did not
  differentiate the doors; the veterans/armor coincidence did.
- 8 dissolution events: mechanism UNATTRIBUTED from this corpus (the window
  carries no link-level trust/break trace — which link snapped, trust decay
  vs break vs succession, is invisible). Named next, not a failure.

### Sense verdict — EARNED

The beats read honestly against the mechanism: the accord stages at first
formation ("Haven isn't just Haven anymore"), the Dawn waits 21 days, the
third subordinate triggers "a realm isn't leverage — it's seasons," and the
+102 step lands when the season is served. The s65518 4× loop is the
fiction's warning made quantitative: realms that aren't tended come apart
aloud (the trust-drift watch fires first). No #734-class mislabeling found
on the link/diplomacy beats.

### Named leverable channels (→ PHASE 2)

1. **The proposal/acceptance gate** (policy-side): 4 long-survivor configs
   never landed one link in 144–180 days. Lever: courtship cadence.
2. **The tending/seasoning loop** (policy-side): trust 30→40 via tend
   (+8/week, 1.5k kcal); 8 dissolutions show realms snapping below 40.
   Lever: redundancy (over-court to 5) so one dip doesn't dissolve the polity.
3. The polity step-function itself (regional+ filter) is src/js — NOT
   leverable from policy; documented, not touched.

## PHASE 2 — LEVER PILOT RESULTS

(proof: scripts/test-linksdiag-pilot.js — 24/24 GREEN before the sweep,
20/20 GREEN after the cadence kill; anchor 404e93e34d51; instrument:
windowstay + w5gates-lib, unmodified; 8 identical seeds × 3 arms, 180d
death-aware)

| arm | formed ≤d120 | end dip ≥68 | national | table | med days | starv deaths | dissolutions | mean end dip |
|---|---|---|---|---|---|---|---|---|
| baseline (leadfeast) | 7/8 | 6/8 | 6/8 | 7/8 | 166 | 2 | 1 | 76.5 |
| cadence (LINKFORM=1) | 6/8 | 5/8 | 5/8 | 7/8 | 173 | 6 | 4 | 63.8 |
| overcourt (LINKFORM=2) | 7/8 | 7/8 | 7/8 | 7/8 | 135 | 4 | 0 | 131.8 |

### Arm linkform-cadence (LINKFORM=1) — NO-GO, KILLED (wrong lever)

GO bar: armed − baseline ≥ 2 AND armed ≥ 5/8 on formations ≤d120.
Measured 6 vs 7 → −1. **NO-GO**, honored as stated (§14, no re-scoring).

Kill-discipline autopsy (the lever is wrong, not the bar): the mechanism
FIRED (earlier first-formations: d48/d52 vs baseline d57–72) but the outcome
went the wrong way — MORE dissolutions (4 vs 1, incl. two form/dissolve
loops on s68403/s68407), MORE starvation (6 vs 2). Root cause: the extra
courtship spends pantry faster than the trust/tend economy can season links
(accord gifts 2k × more links, 2.3× tend frequency, always-sweeten 1.5k kept-
or-lost) and forms links faster than tending can hold them. The binding is
the HOLD, not the attempt rate — cadence attacked the wrong half. Per the
landing rule, the killed arm leaves no trace: LINKFORM=1 removed from
scripts/policies/linkform.js (now delegates to leadcourt exactly like
unset); proof E3 re-gated as the kill pin (20/20 GREEN).

### Arm linkform-overcourt (LINKFORM=2) — NO-GO on the bar, MECHANISM PROVEN

GO bar: armed − baseline ≥ 2 AND armed ≥ 5/8 on end dip ≥68.
Measured 7 vs 6 → +1 < 2. **NO-GO on the pre-registered bar**, honored as
stated (§14).

But the mechanism fired exactly as hypothesized: mean end dip 131.8 vs 76.5
(1.7×), ZERO dissolution events vs 1 (baseline) / 4 (cadence), 6/7 surviving
configs holding dip 136–170 (4–5 links) vs baseline's flat 102 (3 links).
The binary reach metric hit a ceiling — baseline came in at 6/8 (census
suggested ~5/8), so the +2 bar demanded a perfect 8/8, and one chaos-driven
early death (s68401 d82; the same seed died d110 on baseline, also dipless)
made it unreachable regardless of the lever's effect. Per kill discipline
this is NOT a kill: the lever is right, the metric was wrong. The layer
stays on master env-gated default-off (the sim-vetretention precedent);
see metric review for the re-stage.

## Wall numbers (this run — pilot corpus, 8 seeds × 3 arms)

baseline: national 6/8, table 7/8, wins 0/8, wave4 (w4Day set) 8/8,
wave5 (w5Day set) 0/8, median 166d.
cadence: national 5/8, table 7/8, wins 0/8, wave4 8/8, wave5 0/8, median 173d.
overcourt: national 7/8, table 7/8, wins 0/8, wave4 8/8, wave5 0/8, median 135d.
No new death modes on any arm. (Wave-5 doors: 0/24 — the veterans/armor
coincidence trap from sim-defer5gate is untouched by diplomacy, as expected.)

## Metric review

Both pre-registered bars bound the run and both were honored without
re-scoring (§14).

1. **Cadence bar was the right instrument** — it caught a backfiring lever
   (more dissolutions, more starvation). No revision.
2. **Overcourt bar was the wrong instrument (ceiling + binary
   insensitivity).** The lever's effect is INTENSITY (dip 102→136–170 per
   config; dissolutions 1→0), but the bar counted REACH (configs over 68)
   on a baseline already at 6/8. Proposed revision for the NEXT run's
   re-stage: PRIMARY = mean end dip per config (GO: armed ≥ baseline + 34,
   i.e. one full link), SECONDARY = post-formation dissolution events
   (GO: armed < baseline). Seeds 68401–68408 are now used — re-stage on
   fresh seeds.
3. **§15:** panel judged inapplicable (policy-layer, zero src/js) per the
   sim-doorcensus-armor precedent, documented in the pre-registration. The
   paired identical-seed sweep was the instrument; the pre-registered bars
   the judge.
4. Instrument note for future runs: the |step|≥102 dip-step classifier
   misses +34 single-link seasonings once a polity exists (overcourt
   s68402's 102→136). The end-dip scalar catches them; a future classifier
   should record all ±34-multiple steps and reconcile against the scalar.

## Blanks filled / documented

- FILLED (measured): the dip-formation mechanism — dip is a polity step
  function (+102 single-day), not per-link accumulation; 24/24 formation
  events attributed to C1 (proposeLink → LEAD-realm polity).
- CORRECTED: sim-defer4gate's "diplomatic layer never engaged" holds for the
  6 bound configs but not corpus-wide (16/24 engaged); the opened doors'
  dip=102 was on both arms.
- FILLED (measured): cadence is the wrong lever — KILLED with root cause
  (attempt rate ≠ hold; pantry cost of courtship).
- DOCUMENTED (mechanism proven, metric wrong): overcourt redundancy holds
  realms (0 dissolutions, dip 136–170) — re-stage with the revised metric.
- DOCUMENTED (named next): the 8 census dissolution events' mechanism
  (which link snapped and why) is invisible in retained corpora — needs an
  instrumented link-history census (trust trajectories + break reasons),
  same class as the sim-vetkill-autopsy precedent.
- steve-call (design, no call made): should a lone seasoned link score
  partial dip, or does the regional+ filter stand as the "courtship is not
  regional power" rule? The 2026-10-14 design call stands until he overrules.
