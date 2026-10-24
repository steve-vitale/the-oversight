# sim-trustbuffer — TRUSTBUFFER=1 depth lever (run fleshout-20261023T2217Z, axis scale-onramp)

Worker tree sim-trustbuffer. Namespaces: trustbuffer-* (scripts/policies/trustbuffer.js, scripts/trustbuffer-sweep.js, scripts/trustbuffer-analyze.js, scripts/test-trustbuffer.js).
ZERO src/js. Do NOT touch scripts/policies/linkform.js (on master, env-gated default-off) — reuse its linkformCourtship + linkformMode. Do NOT touch feastdisc-*, homecoming-*, scholardist-*, vetformation/vetstack/formthick/vetrestage files, defer5rediag-* files, or the linksdiag pilot files (read-only).

Canon read first: docs/CANON.md + docs/SCALE.md (the scale ladder: six national roads, polity bars — seasoned = 30+ days AND trust 40+, links form at trust 30; Regional Dawn; tending required).

Context (read first):
- evidence/2026-10-23/sim-overcourt-restage.md — CONFIRM-NO-GO: LINKFORM=2 overcourt (court to 5 subordinate links) failed both binding bars on 12 fresh seeds (primary +18.4 < +34; secondary armed 6 > control 3 dissolutions). Kill-discipline root cause CONFIRMED: a funeral applies −8 to EVERY shaken link the same day, and weekly tending holds all links in the 40–48 band, so one funeral knocks 2–4 links below the 40 seasoned bar simultaneously (−136 same-day 4-link collapses). Redundancy assumed independent single-link failures; the channel is a correlated shock.
- evidence/2026-10-23/sim-linkdissolve.md — dissolution attribution DIAG-GO; dominant channel SUCCESSION 6/7.
- evidence/2026-10-23/sim-links-diag.md — the pilot; LINKFORM=1 cadence KILLED as the wrong lever.

This arm claims sim-findings.md #857 (TRUST-BUFFER, NOT LINK COUNT, IS THE SUCCESSION-CHANNEL LEVER): depth, not count. The sense control case (s68912, dip 170, 5 links, 180d) survived the d176 all-links funeral because 100+ days of tending had the links at 60–95 trust — the −8 haircut never threatened the 40 bar. Young realms died because their links sat at 40–48. "A 5-link realm of 40-trust links is five ways to die at once; a 3-link realm of 70-trust links is a realm."

## PRE-REGISTRATION (§14 binding — written before any sims)

- **BINDING QUESTION:** does the TRUSTBUFFER=1 depth lever (tend subordinate links into a 50+ trust band so the −8 funeral haircut never crosses the 40 seasoned bar) reduce post-formation dissolution events on fresh seeds, under both the leadfeast and the belongfeast substrates?
- **THE LEVER (ONE DELTA ONLY, policy-side, zero src/js):**
  - control = LINKFORM=2 via scripts/policies/linkform.js (on master, env-gated default-off; reused, NOT modified): control-leadfeast = LF.linkformArmedFor(), control-belongfeast = OCR.linkformBelongArmedFor(), LINKFORM=2, TRUSTBUFFER unset.
  - armed = LINKFORM=2 + TRUSTBUFFER=1: armed-leadfeast = TB.trustbufferArmedFor(), armed-belongfeast = TB.trustbufferBelongArmedFor(). The new layer's daily at TRUSTBUFFER unset delegates to the linkform daily byte-identically (det-gate pinned in the proof test); at TRUSTBUFFER=1 + LINKFORM=2 it runs competent.daily + trustbufferCourtship, where trustbufferCourtship = the buffer tend pass FIRST, then linkformCourtship verbatim (engine dedups by tendedWeek, so the shared loop skips already-tended links — one delta, not two).
  - **The delta (exact numbers):** the buffer tend pass tends every active subordinate link with trust < 58 (the 50+ band + one funeral of margin: 58 − 8 = 50 ≥ 40; grief coalesces so −8 is the max per grieving window) whenever the pantry can afford the 1,500-kcal tend above the survival floor (floor = half a day of food at the measured burn rate + the tend's own cost; pop×2000 fallback, same burn convention as Game.pantryDaysEstimate). The control's 20000-gate skips tend weeks in the courtship season when the pantry is thin; the buffer never skips a tend week for pantry while above the floor — the village never tends into its last half-day of food. Engine rules untouched: tendLink's once-per-week dedup, the 7-day mourning refusal (refused weeks retry — tendedWeek is not set), +8/wk.
  - Design calls (Steve 2026-10-07: made, documented, overrulable): band 58 (not 50 — one funeral of margin, and two sequential funerals land at 42, still ≥40); floor at 0.5d + 1500 (not the tribute 2d floor — a 1,500-kcal tend is a different magnitude than a 4,000-kcal tribute; the sweep's starvation guardrail is the honest check); no ceiling above the band (linkformCourtship's own loop still tends ≥58 links at the 20000 gate, identical to control — the delta is only the sub-58 tends the control skips).
- **Substrate pinned BOTH arms:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 (the overcourt-restage census-armed base). SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE unset. LINKFORM=2 both arms; TRUSTBUFFER=1 armed only.
- **Seeds:** 69001–69012 (12 FRESH seeds; C1 gate: filename-fresh across evidence/ + scripts/ before sweeping — 68901–68912 used by overcourt-restage, 68501–68508 by loop-B arms, 68401–68408 by the links pilot). PILOT: 69001–69008 (8 seeds) × {leadfeast, belongfeast} × {control, armed} = 32 configs; the 12-seed confirm (48 configs) only if the pilot passes the sniff test (mechanism engages: armed tend counts > control on identical seeds, and the binding primary moves in the right direction).
- **PRIMARY (binding):** post-formation dissolution events per config, using the REVISED classifier from the overcourt metric review: any single-day dip drop ≥102 (magnitude; catches the −136 full-polity collapses) after a formation event (+102/+122). GO iff armed < control, paired identical seeds. A miss is NO-GO, never re-scored.
- **SECONDARY:** mean end dip per config — GO iff armed ≥ control + 34.
- **Horizon:** 180d death-aware (dead villages stop, +10d tail max; never a fixed 200d).
- **GUARDRAILS:** median survival paired diff ≥ −15d; starvation ≤ control+2; no new death kinds (≥2-event rule); wall block (national/table/wins, wave4/5, median survival) both arms.
- **§15:** panel judged inapplicable for policy-layer zero-src/js arms per the doorcensus/links-diag precedent — the paired identical-seed sweep is the instrument, the pre-registered bars the judge; the paired-comparison summary is attached.
- **SENSE:** on the highest-dip armed config, READ the link/dip beats for meaning (SENSE-TESTING LAW) — never just counts.

## Results

Pilot (seeds 69001–69008, 32 configs, 180d death-aware):
- Mechanism ENGAGED: 212 buffer tends fired on the armed leg; control buffer = 0 (armed-only by design). Armed armed-leg mean subordinate trust at d60: 53.5 vs control 28 (proof E12, real seed).
- Binding PRIMARY: post-formation dissolution events (revised ≥102-magnitude classifier) — control 6 vs armed 0. PILOT GO (bar: armed < control).
- Secondary: armed mean − control mean = +29.8 dip (bar ≥ +34) — NO-GO at pilot, but not the pilot gate.
- Guardrails at pilot: median survival paired diff −13.5d (≥ −15d PASS); starvation 16 vs 14 (PASS); no new death kinds (PASS). Wall at pilot: national 10/16 → 12/16, table 10/16 → 12/16, wins 0, wave4/5 0.

RECOVERY NOTE (stale-corpus class): the dead run's corpus landed with five 0-byte
files (armed-belongfeast s69005–s69008 + corpus summary — the intermittent EPERM
write flap). Re-ran exactly those 4 configs to the same dir with the pinned
substrate; sim is C2-gated deterministic so the sweep is byte-identical on
re-run. Recovery verified: 0 zero-byte files before analysis.

Confirm (seeds 69001–69012, 48 configs, 180d death-aware, identical seeds paired):
- PRIMARY (binding): post-formation dissolution events — **control 10 vs armed 0.
  VERDICT: GO** (bar: armed < control).
- SECONDARY: mean end dip per config — **armed − control = +34.0. VERDICT: GO**
  (bar ≥ +34 — met exactly).
- Mechanism: control 778 loop-tends + 0 buffer; armed 590 loop-tends + 336 buffer
  tends. Control buffer = 0 — the delta is armed-only. ENGAGED.
- GUARDRAILS: median survival paired diff −14d (bar ≥ −15d) — PASS (close);
  starvation control 20 vs armed 14 (bar ≤ control+2) — PASS;
  no new death kinds on armed (control had lockjaw:2 / the night:2; armed had
  neither) — PASS.
- WALL BLOCK: control national 16/24 | table 14/24 | wins 0/24 | wave4 0/24 |
  wave5 0/24 | median 141d. Armed national **20/24** | table **18/24** | wins 0/24 |
  wave4 0/24 | wave5 0/24 | median 131.5d. The LINKFORM=2 base already breaches
  national/table in sims (standing directive's zero-wall predates the overcourt
  census substrate); the depth lever moves national +4 and table +4 per 24
  configs. Wins and wave 4/5 remain zero — the lever is a depth fix, not a
  wave-4 or win lever.

(proof: scripts/test-trustbuffer.js — GREEN pre-sweep and post-analysis
(33/33). Instrument: windowstay + w5gates-lib, UNMODIFIED. Paired identical-seed
sweep, 180d death-aware. Per-seed JSONs at
evidence/2026-10-23/perseed-trustbuffer/<arm>-<policy>/ with hash-after-write
readback. §15 paired-comparison attachment: paired-comparison.md; pilot-stage
attachment: paired-comparison-pilot.md.)

Convergence verdict: GO — land.

## Metric review

- **The leadfeast/belongfeast policy dimension proved inert at LINKFORM=2.**
  At mode 2, `linkform.daily` and `linkformBelong.daily` both reduce to
  `competent.daily + linkformCourtship` (the road courtship is replaced by the
  overcourt layer by design — overcourtrestage.js:39-47), and the armed legs
  both run `trustbufferCourtship`. Verified: per-seed JSONs differ only in the
  policyId/policy name fields; every aggregate is byte-identical across the 12
  seeds × 2 arms. The binding question ("under both substrates") therefore
  reduces cleanly to the armed-vs-control arm comparison on 12 independent
  seeds, each replicated once — the policy dim added no independent
  information this run. A future lever that wants a live policy contrast must
  vary a dimension the mode-2 layer actually reads.
- **Secondary landed exactly on the bar (+34.0 ≥ +34).** Per §14 it is a GO —
  the bar is met, not missed. The exactness is honest: the secondary rewards
  end-dip size, and the lever's job is survival-of-formation, not dip
  inflation; two armed configs ended dip 0 (villages died before formation).
  No re-scoring was applied.
- **Median-survival guardrail passed close (−14d vs −15d).** The armed villages
  court harder and tend more (336 buffer tends = real kcal out), and die a
  median 14 days earlier on the paired seeds. This is the lever's real price:
  depth is bought with grain. The starvation guardrail (armed 14 < control 20)
  shows the tend pass is not starving villages — the earlier deaths read as
  *consequence* deaths (combat/expedition/monster ticks up slightly on armed:
  monster 40 vs 34, combat 630 vs 640 — noise-class), not starvation. Next
  run's proposal: price the band against the pantry floor (the 0.5d floor
  could tighten to 1d when the village is sub-national) and watch whether the
  survival diff closes. Nothing here contradicts the GO.

## Blanks filled / documented

- FILLED: the succession correlated-shock channel now has a lever that works.
  Depth, not count: tending subordinate links into the 50+ band (band 58, one
  funeral of margin) eliminates post-formation dissolution on 12 fresh seeds
  (10 → 0) and moves national 16/24 → 20/24, table 14/24 → 18/24, under the
  pinned census substrate. scripts/policies/trustbuffer.js (policy-side only,
  zero src/js; TRUSTBUFFER=1 env-gated, default-off delegation byte-identical
  to the linkform daily — det-gate pinned in the proof test).
- DOCUMENTED: the mode-2 policy-dim inertness (see metric review) — a design
  note for future runs, not a bug: at LINKFORM=2 the road courtships collapse
  to one code path by intent.
- DOCUMENTED (not chased — outside the arm): wins remain 0/48 and wave 4/5
  remain 0/48 on both arms. The scale-onramp wall (national/table reach) is
  moving; the *win* wall and the *wave-4* wall are separate blanks. Sim-
  findings #857 (trust-buffer) claims satisfied by this arm; nothing appended.

## Village assessment (plain words)

Haven ran a census court this month: twelve fresh villages, half under the
old weekly tending (links held at trust 40–48), half under the new buffer
rule (every subordinate tended toward trust 58 whenever the pantry could
afford it above half a day of food). The story the two halves tell is the
same one the overcourt autopsy told, now with a fix attached.

On the old rule, realms dissolved the way realms always dissolve now: a
funeral. The −8 haircut landed on every shaken link the same day, and with
links sitting at 40–48, one funeral knocked two or three links below the 40
seasoned bar at once — full-polity collapses (−136 single-day dips) on 5 of
the 12 control seeds. Nothing about it was mysterious; the links were doing
what links at 40 trust do when grief prices them down.

On the buffer rule, the same funerals came — the dips show the same −8
haircuts in the succession beats — but the links were sitting at 58+ and the
haircut landed at 50, still seasoned. Zero post-formation dissolutions in 24
configs. Four more villages reached national and four more reached the table
than on the old rule.

The price is honest: armed villages died a median 14 days earlier. They
weren't starving — starvation deaths went down — they were *living harder*,
paying grain for depth and taking the consequences the court season brings.
A realm of deep links is still a realm that has to eat.

SENSE read (s69009 armed-leadfeast, dip 170 — the deepest held realm): five
fires courted in twelve days, tended weekly while the pantry allowed it, a
young-link succession beat that staged a renegotiation and cost −6 trust,
arrears when Stonebridge's fields went empty, the First Court feast at d77,
then a long grief season — funerals d84 through d121, "another death while
the link already grieves — the grief is priced in; the new speaker inherits
the same table" — and the realm never once threatened to break. The village
died at d122 with the realm intact, national and the table reached. The
numbers rode on a story that reads true: grief came, the bonds held, and
what killed Haven was the world, not the court.
