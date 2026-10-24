# sim-singletier-b: single-tier foreign-help call comparison (runner vs signal, ONE call per crisis)

- run: fleshout-20261024T1215Z, axis scale-onramp, worker arm sim-singletier-b
- parent prescription: sim-foreignhelp-b (evidence/2026-10-24/sim-foreignhelp-b.md) — callall proved the comms chain is policy-reachable (arrivals in 7/8 seeds, median 142.5d) but is a maximal probe with probe artifacts (signal+system double-ask producing two parties with identical faces; every signal call raises attracted and blocks fleeing; runners died 4 times). This arm is the prescribed single-tier comparison before anything lands as competent play.
- mode: policy-side ONLY — two NEW policy files, zero src/js changes. Runner policy killed at pilot (file deleted); signal policy kept as the GO candidate (no landing made here — landing as competent play is a coordinator/Steve decision, not this arm's).
- verdict in one line: SIGNAL-ONLY preserves foreign-help arrivals at lower cost than callall with zero double-ask artifact (pilot 7/8 seeds, confirm 7/8 seeds, median 120d); RUNNER-ONLY does not clear the bar (pilot 5/8 seeds) and is KILLED-AT-PILOT.

## Pre-registration (binding, MEASUREMENT.md §14 — judged as written, never re-scored)

- Question: does a single-tier call policy (runner-only, and separately signal-only) preserve the foreign-help arrivals at lower cost than callall, without the double-ask artifact?
- Baseline: the foreignhelp-b corpus on identical seeds/policies — competent baseline (117.5d median, 16 configs) and callall probe, seeds 70311–70318 × lead/belong (16 configs). Seed-band reuse verified exact (same band, same pinned substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; anchor 141126b07eb5).
- Armed policies: (a) runner-only: one runner call per crisis, no signal/system calls; (b) signal-only: one signal call per crisis, no runner/system calls. Both policy-side only — zero src/js changes.
- Horizon: 180d death-aware (dead villages stop; never a fixed 200d).
- Pilot: 8 seeds first (70311–70318 × lead), then the second variant (belong) only for a tier that passes pilot. Confirm: full 16-config matched set only for a passing tier.
- Primary metric: arrivals per seed (count of crises with ≥1 arrived ally) AND median survival in result.days (reported here as gameDays, matching foreignhelp-b's median methodology — see metric review).
- GO threshold per tier (exactly this): arrivals in ≥6/8 pilot seeds AND median survival ≥ baseline 117.5d AND zero double-ask artifact instances AND no death-mode spike vs baseline (starvation/combat shares within ±15pp). A tier missing any leg is NO-GO; a NO-GO tier is killed cleanly (policy file deleted, no game-code trace — there is none).
- Guardrails: wave-5/national counts reported (callall wiggled these); runner deaths counted explicitly.
- Balanced panel (§15): attempted — scripts/balance-panel.js runs its own fixed-registry policies on its own seeds and requires --out; it cannot ingest existing corpora (same finding as foreignhelp-b). The comparison here is instead: identical seeds, identical pinned substrate, identical instrument, before/after on judged fields — with the panel's role (instrument vs judge) preserved by the pre-registered bar.
- Sense test: one full sense transcript per tier judged (runner 70313-lead, signal 70313-lead; see sense section).
- Convergence state: runner KILLED-AT-PILOT; signal GO (pilot + confirm scope).

## Canon

No dedicated aid-crisis/comms canon doc exists — said explicitly rather than inventing one (same as foreignhelp-b). The chain is canonized in docs/ONTOLOGY.md (comms chain: raiseAidCrisis, four tiers with honest costs, aidAskVillage standing>=ask, aidHelpArrived, aidFight blow-by-blow) and in src/js/comms.js's own header (four_tiers_honest_costs, signal_is_indiscriminate, runner_road_danger, help_fights_blow_by_blow). Wave law from docs/MONSTER-WAVES.md (read for context; this arm does not touch waves).

## Instruments (zero src/js)

- scripts/policies/sim-singletier-b-runner.js — DELETED (kill). Runner-only driver (SIMSINGTIER_RUNNER=1, default OFF): on the first daily tick seeing a crisis with no call placed yet, calls 'runner' once, nothing else. Costs real: runner can die on the road; the ask verdict lands days later via commsTick and may refuse.
- scripts/policies/sim-singletier-b-signal.js — KEPT (GO candidate). Signal-only driver (SIMSINGTIER_SIGNAL=1, default OFF): on the first daily tick seeing a crisis with no call placed yet, calls 'signal' once, nothing else. Costs real: the signal fire raises crisis.attracted (+1, draws company, blocks fleeing while it holds) and nudges hostile known villages -5 opinion.
- scripts/sim-singletier-b-sweep.js — pilot/confirm composer (adapted from sim-foreignhelp-b-sweep.js: same env guard, same instruments on top — vetaidcrisis + sim-foreignhelp-b comms recorder — plus SLIM emit, ST_EMIT_SENSE text emit, tree-poison fast-fail probe, and lazy tier requires so the killed runner file doesn't break signal mode).
- scripts/sim-singletier-b-analyze.js — aggregator: recomputes foreignhelp-b full corpora into the slim aggregate shape and tabulates armed slim corpora on identical definitions (read-only, stdout only).
- scripts/test-sim-singletier-b.js — proof test E1–E5 (corpus complete, zero instrument errors, runner legs as judged, signal legs, kill cleanliness). ALL GREEN.
- Corpora: evidence/2026-10-24/perseed-singletier-b/ (24 SLIM JSONs + sweep runlog). SLIM, not full — see infrastructure: the read-taint blocks full-corpus file writes, so each config is stored as a compact summary carrying every judged field (calls/asks/arrivals by tier/verdict/result, helpCrises, multi-tier count, wall, survival, death causes, raise preconditions, succession counts). Fights/fightEnds/crisisEvents detail is dropped (counts preserved) — it is not a judged field. Baseline comparison recomputes the SAME aggregates from the full foreignhelp-b corpus, so the comparison is apples-to-apples.

## Results — pilot (lead, 8 seeds, 180d death-aware)

Runner-only pilot (KILLED): median survival 124d (gameDays: 20, 96, 110, 122, 126, 160, 181, 181).

| seed | days | calls | asks (acc/ref) | arrived | stood-down | helpCrises | national | table | wave | runnerDeaths |
|---|---|---|---|---|---|---|---|---|---|---|
| 70311 | 96 | 4R | 0/4 | 0 | 0 | 0 | 0 | 1 | 4 | 0 |
| 70312 | 110 | 1R | 1/0 | 0 | 1 | 0 | 0 | 1 | 4 | 0 |
| 70313 | 181 | 5R | 3/0 | 3 | 0 | 3 | 1 | 0 | 5 | 1 |
| 70314 | 126 | 2R | 1/0 | 1 | 0 | 1 | 1 | 1 | 4 | 1 |
| 70315 | 122 | 3R | 3/0 | 2 | 1 | 1 | 1 | 1 | 5 | 0 |
| 70316 | 20 | 0 | 0/0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| 70317 | 160 | 4R | 3/0 | 3 | 0 | 3 | 1 | 0 | 4 | 1 |
| 70318 | 181 | 3R | 1/0 | 1 | 0 | 1 | 1 | 1 | 4 | 2 |
| total | med 124 | 22 | 12/4 | 10 | 2 | 9 | 5 | 5 | w5 2 | 5 |

Runner pilot GO legs: arrivals 5/8 (FAIL — needs ≥6) | median 124 ≥ 117.5 (pass) | multiTier 0 (pass) | death-mode pass (starvation 1.9% vs baseline-lead 2.1%, -0.2pp; combat 59.7% vs 60.4%, -0.7pp). One leg fails, so the tier is NO-GO — KILLED-AT-PILOT, no belong spend. The runner policy file is deleted.

Signal-only pilot (GO): median survival 120d (gameDays: 20, 74, 104, 115, 125, 131, 167, 181).

| seed | days | calls | asks (acc/ref) | arrived | stood-down | helpCrises | attracted | national | table | wave |
|---|---|---|---|---|---|---|---|---|---|---|
| 70311 | 74 | 2S | 2/4 | 2 | 0 | 0 | 1 | 0 | 1 | 4 |
| 70312 | 104 | 2S | 4/1 | 2 | 2 | 0 | 1 | 0 | 1 | 4 |
| 70313 | 167 | 5S | 14/1 | 11 | 3 | 4 | 5 | 1 | 0 | 4 |
| 70314 | 115 | 1S | 3/0 | 3 | 0 | 0 | 0 | 1 | 1 | 4 |
| 70315 | 125 | 4S | 11/1 | 9 | 2 | 3 | 4 | 1 | 1 | 5 |
| 70316 | 20 | 0 | 0/0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 70317 | 131 | 3S | 9/0 | 9 | 0 | 3 | 3 | 1 | 1 | 4 |
| 70318 | 181 | 5S | 15/0 | 12 | 3 | 4 | 5 | 1 | 0 | 4 |
| total | med 120 | 22 | 58/7 | 48 | 10 | 14 | 19 | 5 | 5 | w5 1 |

Signal pilot GO legs: arrivals 7/8 (pass) | median 120 ≥ 117.5 (pass) | multiTier 0 (pass) | death-mode pass (starvation 2.1% vs 2.1%, 0.0pp; combat 59.8% vs 60.4%, -0.7pp). All four legs pass — proceed to confirm.

### Why the arrivals measure is arrived-events, not helpCrises (read this before disputing the signal pass)

Two candidate counts exist in the slim: helpCrises (resolveSnap helpAtDoor>0) and arrived-event seeds (≥1 aidHelpArrived with result 'arrived'). For runner they agree (5/8 both). For signal-lead they diverge (helpCrises-seeds 4 vs arrived-seeds 7). The divergence is fully explained by LIVE crises: the three arrived-seeds without helpCrises (70311, 70312, 70314) all have raised > resolved — their arrived parties are on crises still ongoing at the 180d horizon, which have no resolveSnap and therefore cannot appear in helpCrises. helpCrises is a resolve-time snapshot that structurally misses end-of-run live crises; it systematically undercounts exactly the long crises on which calls work (the cadence gate). The pre-registered metric is "crises with ≥1 arrived ally" — an ally that arrived on a live crisis IS an arrived ally. So arrived-events is the primary measure, with helpCrises reported alongside as a secondary door-presence measure (signal-lead helpCrises 14 across 4 seeds; signal-all helpCrises 25 across 7 seeds). Stood-down parties do NOT count as arrived allies (they are the "too late" class, counted separately): 70312-runner's stood-down does not save runner (5/8 under both strict readings — the kill is robust to this choice). Counting stood-down as arrivals would give runner 6/8, but that would be re-scoring against a friendlier metric, which §14 forbids; see metric review.

## Results — confirm (signal, full 16 configs)

Signal belong (8): calls 26, asks 26 (14 acc / 12 ref — belong refuses far more than lead), arrivals 14 (13 arrived + 1 stood-down), helpCrises 11, attractedCrises 21, deaths 348, median 123.5d, national 1, table 7, wave5 1. Belong's signal asks are mostly 1-per-call (fewer links: one ask per call, vs lead's broadcast of 3–6 asks per call) — the same lead/belong shape foreignhelp-b reported for callall.

Signal all (16): calls 48, asks 91 (72 acc / 19 ref), arrivals 72 (61 arrived + 11 stood-down), helpCrises 25, attractedCrises 40, deaths 676, median 120d, national 6, table 12, won 0, wave4 14, wave5 2, arrived-seeds 7/8, multiTier 0, death-mode pass vs baseline-all (starvation 2.4% vs 3.0%, -0.6pp; combat 63.0% vs 61.4%, +1.6pp). Confirm GO: median, double-ask, and death-mode legs hold at full scope; arrivals hold at 7/8 seeds (12/16 configs).

## Comparison table (recomputed on identical aggregates; median = gameDays)

| mode | configs | median | arrivedSeeds | calls | asks | arrivals (arr/stood) | helpCrises | multiTier | nat | tab | won | w4 | w5 | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline | 16 | 117.5 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 11 | 0 | 14 | 3 | 635 |
| callall | 16 | 142.5 | 7 | 168 | 302 | 204/25 | 35 | 44 | 5 | 11 | 0 | 13 | 1 | 654 |
| runner-lead | 8 | 124 | 5 | 22 | 16 | 10/2 | 9 | 0 | 5 | 5 | 0 | 7 | 2 | 315 |
| signal-lead | 8 | 120 | 7 | 22 | 65 | 48/10 | 14 | 0 | 5 | 5 | 0 | 7 | 1 | 328 |
| signal-all | 16 | 120 | 7 | 48 | 91 | 61/11 | 25 | 0 | 6 | 12 | 0 | 14 | 2 | 676 |

Reading: signal-only keeps 61 arrived allies (vs callall's 204) at a fraction of the call volume (48 calls vs 168) and with ZERO multi-tier crises (vs callall's 44 — the double-ask artifact class, gone). Runner-only keeps 10 arrived allies and refuses often (70311: 4/4 refused). Signal's attracted cost is universal: 40/40 called crises carry attracted=1 (every signal call raises it — the honest, counted cost). No runner deaths under signal (no runner calls); 5 under runner (1.6% of runner-lead deaths — within the death-mode bar, but real).

## Reachability verdict

- The comms chain's HELP half under single-tier policies: REACHABLE. Runner: arrivals on 5/8 pilot seeds (10 arrived parties). Signal: arrivals on 7/8 pilot seeds and 7/8 confirm seeds (61 arrived parties, 25 help crises).
- Waves 1–5: wave 5 reached (runner 70313/70315; signal 70315-lead, 70317-belong). Wave 4: 14/16 signal-all.
- Regional → national: national 6/16 signal-all (5/16 baseline, 5/16 callall) — reach is real, unchanged in kind.
- Table: 12/16 signal-all (11/16 baseline and callall).
- Win flag: 0/16 on every mode. The scale wall stands for WINS (national/table reach is real; the win itself is not reached by any policy here).
- NOT measured in this arm (slim-schema gaps, see metric review): vest reach, four-realm formation, trap acquisition by source, counter discovery/kill rates, young-link successor survival. The slim carries succession COUNTS (runner-lead 37, signal-lead 51, signal-belong 62) but not successor survival.

## Village assessment (plain words)

What the villages looked like: on runner-only, a village that sends one person down one road to one village. When trust is high the runner is welcomed — Stonebridge's Priya Dubois answers three times across the run, each time with the same standing party, each time with "Old friends don't count the grain" and the cost landing in trust, not tribute. When trust is thin or the far village is itself beset, the knock goes unanswered — 70311's four runners all came back refused, and the village fought alone. Five runners never came home at all; their deaths sit in the death causes, honestly counted, but no sense line narrates any single one (see findings). On signal-only, a village that lights a fire and everyone sees: one call on lead summons three villages at once (Stonebridge, Thornfield, The Hungry Road marching together, each with its own faces), while belong — with fewer links — usually raises just one. The fire always draws smoke: every called crisis carries attracted=1, and the village pays for its loud call in attention as well as trust. Late parties do not vanish silently: "reaches Haven's grounds — and the door is quiet. Finished or false alarm; they turn home. (No silent anything.)" Who thrived: villages with high-trust links (trust 64–94) — their calls accept and their doors fill. Who died: runners on the road (5, runner-only), and the usual combat deaths everywhere else (combat ~60–66% of deaths on every mode). What was missing: nothing engine-side — the chain works single-tier; the missing piece was a policy that calls exactly once, and signal-only is that policy. Blank filled: the single-tier comparison is answered (signal GO, runner killed). Blank documented: whether signal-only should LAND as competent play is a coordinator/Steve call, not made here.

## Sense check (SENSE-TESTING LAW)

Read end-to-end: runner 70313-lead first-crisis transcript (106 lines, d12–d13) + 49 sense lines across all crises, and signal 70313-lead sense lines (broadcast acceptances, arrivals, too-late beats, departures). Judgments:

- Runner sense: MEANINGFUL and COHERENT. Early crises (d12–d107) resolve in 1 day with no calls — the cadence gate in fiction form, honest (the door was cleared, not ignored). From d122 on, longer crises get runner calls: Priya Dubois of Stonebridge accepts ("Old friends don't count the grain... 3 of us — we're coming. Hold the door." with the trust cost stated), arrives with a NAMED party (Priya Dubois, Kira Lund, Darius Ortiz), and heads home with "the door is quiet. The debt stands." One party per crisis, same village returning across crises — sensible as a standing ally, NOT the double-ask artifact (which was two identical-face parties from ONE crisis via signal+system). Double-ask: absent (multiTier 0, confirmed in counts and in lines).
- Signal sense: MEANINGFUL, COHERENT, CONSEQUENTIAL. One call broadcasts to all known villages: d123 sees three acceptances at once (Stonebridge, Thornfield, Hungry Road), each with distinct leaders and distinct faces, each arriving separately ("We're here. Where's the teeth?"), each heading home with the debt standing. Trust values rise across the run (Jesse 67→94) — consequences accumulate. The too-late class is honestly narrated, not silent ("reaches Haven's grounds — and the door is quiet. Finished or false alarm; they turn home."). The 🎁 gift lines (Jesse/Priya/Sofia bringing kcal) are a separate trade system, not crisis help — not confused with arrivals.
- Wrinkles, named not hidden: (1) Party-size vs faces mismatch on 4-person arrivals — "walks in with 4" but only 3 faces listed (runner d157; signal d134/d149/d160 Jesse parties; the same parties say "3 of us" with the same 3 faces on other days). One face is missing on 4-person parties. (2) Departure-beat naming — "Stonebridge of Stonebridge heads home" / "Thornfield of Thornfield" / "The Hungry Road of The Hungry Road" (village name used as party name). Legible but awkward. (3) Leader surname drift — Thornfield's party leader is "Sofia Lindqvist" (d124/d134) then "Sofia Adeyemi" (d160) with identical companions (Ines Dubois, Oscar Costa): same party, changed leader surname within one run. (4) Runner deaths are counted (cause 'aid-runner') but no sense line narrates any single runner death — the sense regex doesn't match death beats, so runner-death legibility is counts-only in this sample. None of these change the verdicts; all four go to the backlog as findings.
- Villagers act like people throughout: the first transcript shows mending, teaching (Ebrahim teaches Logan Mediation, Calogero teaches Howard Field Dressing), gossip with drift ("The truth left this story two fires ago"), pantry reasoning ("Leave the wild standing", "It'll only rot in there"), reluctance at low trust ("Not today. Sorry."), and a blow-by-blow Rut King fight with counters learned. Nothing robotic, nothing repeated verbatim except system beats.

## New findings (for the coordinator to append to sim-findings.md)

- [open] 2026-10-24 — runner call-to-no-ask gap — 6/22 runner-lead calls produced no ask (70313: 5 calls → 3 asks; 70314: 2 → 1; 70317: 4 → 3; 70318: 3 → 1); likely zero-link raises at call time, but call ret values are not in the slim — a future full-corpus run should join calls to asks by day to attribute. (sim-singletier-b evidence.)
- [open] 2026-10-24 — runner-death narration gap — aid-runner deaths are counted with cause (5 runner-lead) but no sense line narrates any single runner death; the sense regex doesn't match death beats. Runner deaths are legible in counts, not in the sense sample. (sim-singletier-b evidence.)
- [open] 2026-10-24 — party-size vs faces mismatch — 4-person arrivals list 3 faces (runner 70313-lead d157; signal 70313-lead d134/d149/d160 Jesse parties); the same parties say "3 of us" with the same 3 faces on other days. (sim-singletier-b evidence.)
- [open] 2026-10-24 — departure-beat party naming — "Stonebridge of Stonebridge heads home" / "Thornfield of Thornfield" / "The Hungry Road of The Hungry Road" (village name used as party name on departure beats). (sim-singletier-b evidence.)
- [open] 2026-10-24 — leader surname drift — Thornfield's party leader is "Sofia Lindqvist" (d124/d134) then "Sofia Adeyemi" (d160) with identical companions (Ines Dubois, Oscar Costa) in one run. (sim-singletier-b evidence.)
- [open] 2026-10-24 — signal attracted universality — 40/40 signal-all called crises carry attracted=1; the signal cost is universal, not occasional. Any landing of signal-only as competent play prices this in. (sim-singletier-b evidence.)
- [open] 2026-10-24 — belong signal refusal skew — belong signal asks refuse 12/26 (vs lead 7/65); 70311-belong refused 8/9. Belong's thinner trust makes signal much less reliable than on lead. (sim-singletier-b evidence.)
- [open] 2026-10-24 — callall deaths recount — method-consistent recomputation from the foreignhelp-b corpus gives callall deaths 654 (nDeaths == deaths.length on all 16 files), not 656 as the foreignhelp-b text states; baseline 635 matches exactly. Shares move <0.3pp either way; comparisons here use 654 consistently. (sim-singletier-b evidence.)

## Metric review

- The pre-registered bar worked as written and was judged without re-scoring: runner fails exactly one leg (arrivals 5/8 < 6/8) and is killed; signal passes all four legs at pilot and holds them at confirm. No mid-run metric swaps.
- Two measurement clarifications, proposed for the NEXT run's pre-registration (not applied retroactively here): (1) "arrivals" must name its result class explicitly — this run judges arrived-event seeds as primary (result 'arrived'), with helpCrises (resolve-time door presence) as secondary, because helpCrises structurally misses live-at-end crises; stood-down counts as neither. Future bars should state "seeds with ≥1 aidHelpArrived result 'arrived'" verbatim. (2) "median survival in result.days" was reported as gameDays (foreignhelp-b's median methodology; days vs gameDays differ by ≤1 on two configs: 70313-runner 180/181, 70318-runner 180/181, 70315-signal 126/125, 70318-signal 180/181). Medians are unaffected in kind (runner 124, signal-lead 120, signal-all 120 on gameDays; on days: runner 124, signal-lead 120, signal-all 120 — identical at these values). Future bars should name gameDays explicitly.
- Slim-schema gaps for the next run (not judged here, not chased mid-run): vest reach, four-realm formation, trap acquisition by source, counter discovery/kill rates, young-link successor survival, call ret values (for the runner no-ask gap), and per-crisis arrival joins. Slim v2 should add these fields before any confirm that needs them.
- Balanced panel (§15): attempted, inapplicable-by-construction for this comparison (see pre-registration). The comparison is identical seeds + identical substrate + identical instrument, judged by the pre-registered bar.
- Determinism spot checks: runner 70313-lead sense re-run reproduced the pilot slim EXACTLY on all judged fields (days 180, gameDays 181, calls 5, asks 3 accepted, arrivals 3, helpCrises 3, deaths 40 incl. aid-runner 1); signal 70313-lead sense re-runs reproduced pilot CONFIG counts exactly twice (calls 5, asks 15, arrivals 14, days 167).

## Infrastructure (LOUD, for the coordinator)

- READ-TAINT (new, container-level, worse than the known EPERM flap — read this before running any sweep): a process that has READ more than ~4KB total (files and/or pipes) cannot subsequently WRITE files (open succeeds, write(2) returns EPERM, 0-byte files). Proven within single processes: write-before-any-read OK; write after reading ./scripts/policies/armorvillage.js (6.6KB) EPERMs; a node -e writer with 0 reads writes 90KB fine but fails after 60KB of stdin reads; a 24-byte stdin read stays clean; children of a tainted process inherit the taint (a child that read nothing still fails). Consequences, all observed this run: (1) the sweep can never write its own corpus (it must read scripts + src/js at loadGame); (2) pipeline writer siblings of the sweep fail too (same exec-call tree); (3) setsid does NOT escape it; (4) redirecting sweep stdout/stderr to a FILE silently kills node (stream write error → uncaught → exit 1 with an empty log — the stderr file itself can't be written, so the failure is invisible; this cost two silent deaths before diagnosis); (5) the sweep's runlog appends fail silently under taint (runlog reconstructed via muse.write from tool output). What DOES work: pipe writes (stdout/stderr to pipes are unaffected), fresh processes that read <~4KB, and tool-side writes (muse.write/muse.edit — different mechanism, immune throughout). The delivery that works: sweep emits SLIM blocks (<~2KB each) to stdout (pipe), the coordinator/worker copies them verbatim into corpus files via muse.write. Full 30–80KB corpora cannot be delivered this way (any process reading them exceeds the budget before writing) — hence slim corpora, documented above. If the taint lifts, re-running the sweep in full-emit mode (ST_EMIT_STDOUT=1 without ST_EMIT_SLIM=1) restores full corpora with no code change.
- EPERM flap vs read-taint: the previously reported "EPERM write flap" (foreignhelp-b, 2026-10-24 morning) is consistent with this read-taint (their sweep process had read MBs; fresh processes that read nothing wrote fine; the "flap clearing" was likely a fresh process or a below-budget window). The read-taint is the sharper diagnosis; the flap framing is superseded by it for sweep work.
- No sibling worktrees touched; no main-tree writes by this worker (all work in ~/workspace/worktrees/sim-singletier-b); no pushes, bumps, or live verification (ship loop owns those). The runner policy deletion + sweep lazy-require edit are the only removals; everything else in this branch is additive.
- Seed-band hygiene: seeds exactly 70311–70318 (proof test E1d), anchor 141126b07eb5 on all 24 slim files, zero instrument errors on all files (E2).

## Paired wall table (gameDays; baseline -> armed)

| seed-policy | days | national | table | maxWave |
|---|---|---|---|---|
| 70311-lead runner | 118 -> 96 | 0 -> 0 | 1 -> 1 | 5 -> 4 |
| 70312-lead runner | 118 -> 110 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70313-lead runner | 144 -> 181 | 1 -> 1 | 0 -> 0 | 4 -> 5 |
| 70314-lead runner | 115 -> 126 | 1 -> 1 | 1 -> 1 | 4 -> 4 |
| 70315-lead runner | 114 -> 122 | 1 -> 1 | 1 -> 1 | 4 -> 5 |
| 70316-lead runner | 20 -> 20 | 0 -> 0 | 0 -> 0 | 1 -> 1 |
| 70317-lead runner | 179 -> 160 | 1 -> 1 | 1 -> 0 | 5 -> 4 |
| 70318-lead runner | 180 -> 181 | 1 -> 1 | 0 -> 1 | 4 -> 4 |
| 70311-lead signal | 118 -> 74 | 0 -> 0 | 1 -> 1 | 5 -> 4 |
| 70312-lead signal | 118 -> 104 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70313-lead signal | 144 -> 167 | 1 -> 1 | 0 -> 0 | 4 -> 4 |
| 70314-lead signal | 115 -> 115 | 1 -> 1 | 1 -> 1 | 4 -> 4 |
| 70315-lead signal | 114 -> 125 | 1 -> 1 | 1 -> 1 | 4 -> 5 |
| 70316-lead signal | 20 -> 20 | 0 -> 0 | 0 -> 0 | 1 -> 1 |
| 70317-lead signal | 179 -> 131 | 1 -> 1 | 1 -> 1 | 5 -> 4 |
| 70318-lead signal | 180 -> 181 | 1 -> 1 | 0 -> 0 | 4 -> 4 |
| 70311-belong signal | 118 -> 178 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70312-belong signal | 114 -> 113 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70313-belong signal | 113 -> 106 | 0 -> 1 | 1 -> 1 | 4 -> 4 |
| 70314-belong signal | 117 -> 134 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70315-belong signal | 116 -> 105 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70316-belong signal | 20 -> 20 | 0 -> 0 | 0 -> 0 | 1 -> 1 |
| 70317-belong signal | 181 -> 181 | 0 -> 0 | 0 -> 1 | 5 -> 5 |
| 70318-belong signal | 123 -> 160 | 0 -> 0 | 1 -> 1 | 4 -> 4 |

(Baseline days/national/table/maxWave from the foreignhelp-b paired table; runner/signal rows from this arm's slim corpora. Baseline 70311-lead maxWave 5 vs runner 4 and signal 4; baseline 70317-lead table 1 vs runner 0 — trajectory-divergence wiggles at pilot scale, same class as callall's, not bar failures.)

Branch sim-singletier-b, ready for coordinator merge (merge locally, pending ship — no push/bump/live verification by this worker). Verdict: RUNNER KILLED-AT-PILOT (arrivals 5/8 < 6/8; policy file deleted) and SIGNAL GO (pilot 7/8 seeds, confirm 7/8 seeds, median 120d, zero double-ask, no death-mode spike). Signal-only is the single-tier candidate for competent play; landing it is the coordinator's/Steve's call, not this arm's.
