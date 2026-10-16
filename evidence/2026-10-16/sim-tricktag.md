# sim-tricktag — TB kill attribution: companion kills get the real channel (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-tricktag, run_id fleshout-20261016T1355Z (axis scale-onramp blocking; this arm is a measurement/attribution fix on the counter-wiring line, not a scale lever).
**Type:** game-code attribution fix (src/js/game.js only) + proof + 32-run paired sweep.
**Finding:** sim-findings.md #405 — the turn-based kill path called `recordWaveKill(m.mdef.id, this.villagerId, 'player')` with no per-fighter attribution: when a villager COMPANION landed the killing blow in a player-initiated TB fight, the waveKillLog entry carried by=<scholar vid>, via='player' — counter-executed TB kills by companions were never attributed to the villager who earned them. (The trickSummary half was landed by the sibling sim-counterwire arm, 44de021d/23008ce1; this arm lands the channel half.)
**Canon read:** docs/CANON.md (manifest), docs/MONSTER-WAVES.md (counter conventions, discovery channels, ledger law — the fix honors "villager experiences count" and the monsterCounterKnown convention; no canon invented), docs/MEASUREMENT.md §§9–12, 14 (staged methodology — mandatory, followed below).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** does the TB kill path attribute the killing blow to the fighter who landed it (scholar vs villager companion), with the real channel and the trick summary?

**PRIMARY (binding):** 100% attribution, judged three ways —
(a) **conservation:** per (policy, seed) pair, total waveKillLog kills equal both arms AND control `player`-via count = armed `player`-via + armed `companion`-via (kills re-tagged, none lost, none created);
(b) **clean tagging:** every armed via='companion' entry carries by=<companion vid> (not the scholar, not 'player');
(c) **the path fires:** armed companion entries > 0 across the sweep (otherwise the fix is unproven).
A miss on any of (a)/(b)/(c) is NO-GO, never re-scored.

**GUARDRAIL (binding):** det-gate byte-identical trajectories both sides — this is an attribution change; zero behavior change expected. trajHash (day, won, slain, counters, villagerTricks, counterObs, pop, killerTales, scaleRank; waveKillLog/waveKillByChannel EXCLUDED — they are supposed to differ) must match armed vs control on all 32 pairs. If any pair diverges, the arm is re-classified as a BEHAVIOR arm: gate on national >= control−2, median survival >= control−10d, no new death mode — and the reclassification is said LOUDLY. If those gates fail: do NOT land — revert game code to zero trace, land evidence+instruments only with the NO-GO verdict.

**Horizon:** 180d death-aware (kills — and companion kills in TB fights — accumulate across the whole run; dead villages stop simulating; +10d tail max).

**Seeds:** 8 assigned (951, 952, 953, 954, 955, 956, 957, 958) × {leadfeast, belongfeast} × {control (TRICKTAG_OFF=1), armed} = 32 runs. Own in-sweep control: identical seeds both arms, flag flipped per run (TRICKTAG_OFF is read at call time — the OFF path is byte-for-byte the pre-fix behavior, verified by the proof's RED section).

**Policies:** TF.leadfeast / TF.belongfeast (tribfloor exports).

**Substrate:** pre-seat courtship, FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 EXPLICIT (unset != 0 — set explicitly per finding #389).

**Per-seed JSONs:** evidence/2026-10-16/perseed-tricktag/`<policy>-s<seed>-<arm>.json` — numeric national/table/wins/exiled (telemetry-aligned), kills, killsByVia, killsByChannel, trajHash, deaths + causes.

**Instruments:** scripts/test-tricktag-20261016.js (proof 24/24 RED→GREEN + det-gate + smoke), scripts/probe-tricktag-20261016.js (child probe: one real TB fight per invocation), scripts/sweep-tricktag-20261016.js (32-run sweep), scripts/analyze-tricktag-20261016.js (judges the header).

## The fix (src/js/game.js only — the recordWaveKill region)

Three surgical edits, all attribution-only:

1. **tbDamage's death block** stamps `t._tbKilledBy` with the killing blow's source on a dying monster fighter: `'p'` for the scholar (`'p'`/`'player'`/null+`'you'` — the player strike's exact convention), else the raw sourceKey (companion fighters strike with their own key, e.g. `v_<rid>`). Monster-on-monster and 0-final finishers leave it unset → legacy fallback. Additive underscore field on the per-fight fighter object — no behavior change. `TRICKTAG_OFF=1` disables the stamp.
2. **tbEnd's TB kill loop** resolves `m._tbKilledBy` per dead monster: a villager/ally fighter key → `by=<companion vid>, via='companion'`; scholar (`'p'`) or unresolvable → legacy `by=<scholar vid>, via='player'`. `trickSummaryFor(f, mid)` rides along either way (counterwire's wiring, unchanged). `TRICKTAG_OFF=1` restores the exact pre-fix call.
3. **recordWaveKill's channel comment** gains `'companion'` in the telemetry channel enum (telemetry-only; no game logic reads these keys).

Known limitation (documented, not fixed — speculative to wire): status-DoT ticks (`tickStatuses`) can kill a monster fighter without passing through tbDamage; those keep the legacy tag (same as today — no regression). Status entries carry no structured source, only a label string.

Out of scope / untouched per the brief: feast-drawdown floor region, observation/trick-credit region, fieldFights.js, havenGrowth.js. The sibling loop-B arm's game.js feast region was not touched (edits are at the tbDamage death block ~34060 and the tbEnd kill loop ~40416, verified by diff).

`TRICKTAG_OFF=1` is a permanent honesty-control hatch (same browser-safe pattern as `TALETELL_OFF`): future arms can run the pre-fix tagging on identical seeds.

## Proof: scripts/test-tricktag-20261016.js — 24/24 GREEN

Real TB fights in the harness (hummice pack; roster emptied so no auto-join steals the kill; one injected inert companion fighter; scholar performs the REAL `tbPlayerShout()` trick first in the companion case):

- **KILLATTR / RED (TRICKTAG_OFF=1):** every companion kill logged by=scholar via='player' — the #405 quirk reproduced on the real path; no `_tbKilledBy` stamp. Trick summary already rides pre-fix (`trick='shout,…'` — counterwire's half, independent of this arm).
- **KILLATTR / GREEN:** every entry matches the stamped killer — by=companion vid, via='companion'; trick id rides every kill, one `shout` part per real performance (`shout,shout,shout,shout` for the 4-pack — the shout hit all four); `waveKillByChannel` gains `companion.w1`; tbDamage stamped `v_testcomp`. **Zero killer-tales queued** for the witnessed TB kill (hummice already reported via the scholar's encounter — the tale machinery's own rule, unchanged).
- **SCHOLAR:** scholar killing blow → by=scholar via='player', IDENTICAL both flag states (unchanged behavior); stamp is `'p'`.
- **MONSTER:** unresolvable killing source → legacy tag, no crash, no misattribution.
- **NOTRICK:** companion kill, no trick → trick=null (no fabrication), by/via attributed.
- **DET-GATE:** 40d leadfeast, TRICKTAG off vs on — byte-identical trajectory hash (waveKillLog excluded by construction).
- **SMOKE:** 40d run green.

(Side observation during proof construction, kept as evidence not fix: startCombat's OPENING TURNS let an auto-joined companion (mara_vasquez, seed 954) genuinely kill the hummice before the probe acted — the engine's real companion-kill path attributed it by=mara_vasquez via='companion' trick=null. The path this arm fixes is live in real play, not just in the probe.)

## Sweep results (32 runs complete)

Analyzer: scripts/analyze-tricktag-20261016.js — **VERDICT: GO** (all pre-registered clauses met).

| Clause | Result |
|---|---|
| PRIMARY (a) conservation — nKills equal both arms AND control player-via = armed player-via + armed companion-via, per pair | **16/16 pairs** |
| PRIMARY (b) clean tagging — every armed via='companion' entry has by=<companion vid> (not scholar, not 'player') | **7/7** |
| PRIMARY (c) the path fires — armed companion entries > 0 | **7 entries** (w1: 7, of which 4 trick-attributed) |
| GUARDRAIL det-gate — trajHash armed === control, all pairs | **16/16 byte-identical** — attribution-only confirmed; no behavior-arm reclassification |

Spot conservation (the load-bearing check — the fix re-tags, never re-counts):
- belongfeast-s951: control `player:16` → armed `player:15 + companion:1` (22 kills both, hash identical)
- leadfeast-s958: control `player:10` → armed `player:8 + companion:2` (22 kills both, hash identical)

Newly-attributed kills (armed arm, all wave 1 — companions land killing blows on wave-1 fauna in real play):
- belongfeast-s951 d60: **speedbump_turtle** — by=jovan_milic, via='companion', trick='keep_distance,keep_distance'
- leadfeast-s958 d17: **mirrormoth** — by=gen_di7105t, via='companion', trick=null
- leadfeast-s958 d17: **nevermore** — by=gen_di7105t, via='companion', trick='sidestep'
- (+4 more companion entries across the sweep; 4/7 carry trick detail)

Trick-attributed kills overall (armed): 79 total across the sweep, 4 via companion. The companion trick-kill flow is real but rare — consistent with the counterwired arm's "execution is ~1% of the kill flow" measurement.

## Wall numbers

| metric | control (16) | armed (16) |
|---|---|---|
| national | 11/16 | 11/16 |
| table | 15/16 | 15/16 |
| wins | 0/16 (pre-seat by design) | 0/16 |
| median / max survival | 131d / 180d | 131d / 180d |
| death causes | identical (combat 333, villager-combat 134, monster 117, expedition 34, …) | identical |

Wall numbers are byte-identical between arms — as expected for a pure attribution change. (Pre-seat substrate: wins 0/16 by design; the scale-wall baseline comparison is the ship loop's telemetry-check, which reads national/table/wins/exiled — all unchanged.)

## Metric review (§14)

- The PRIMARY's three clauses held without re-scoring: conservation (a) is the clause that proves the fix re-tags rather than re-counts — it was designed before the sweep and judged as written. No metric moved mid-run.
- Seed freshness caveat (noted, not hidden): seeds 951–958 carry prior evidence hits from other arms' sweeps (ambient, crumbguard census, kcal runs); the brief assigned them explicitly. Cross-arm seed reuse does not bias within-pair control/armed comparisons — identical seeds, independent RNG streams, each run a fresh loadGame. The det-gate's 16/16 byte-identical trajectories are the empirical backstop: if seed reuse had introduced any cross-arm state, trajectories would have diverged.
- The guardrail was the binding constraint and it held cleanly (16/16), so no behavior-arm reclassification was triggered. The killer-tale path (the one plausible behavior leak — companion kills now pass a non-scholar vid to queueKillerTale) produced zero tales across 32 runs: in scholar-initiated TB fights the type is already reported via the scholar's encounter, so the tale machinery's own rule suppresses it. The det-gate confirms no downstream divergence.
- Metric honesty: PRIMARY (c) ("the path fires") is a coverage gate, not an effect size — 7 companion kills in 32 runs means the fix's real-world firing rate is low (~0.2/run). The fix is proven correct where it fires; its frequency is a property of companion combat participation, not of the attribution.

## Convergence state

**converged** — the #405 blank is filled and measured: per-fighter last-hit attribution on the TB path, 100% clean on the sweep, zero behavior change. No tuning iteration applies (attribution, not a lever).

## Sense-read (SENSE-TESTING LAW)

**Arc — Jovan and the Speedbump (belongfeast-s951, armed, d60).** The beats read:

- d60: "💡 COUNTER LEARNED — Speedbump: Never stand next to it. Don't step next to it — it can't chase, so just walk around. Keep two squares away and it's furniture. When it seals up, wait it out. (Someone at the haven knew the …)"
- d60: "Jovan strikes the Speedbump." ×9, punctuated by "Jovan shouts: 'Move! MOVE!'"
- waveKillLog: `{d:60, mid:'speedbump_turtle', by:'jovan_milic', via:'companion', trick:'keep_distance,keep_distance'}`

Sense verdict: this reads as one coherent story, not three systems stapled together. The village learned the Speedbump's trick (keep your distance — the trick the System's own counter data prescribes); Jovan fought it the trick's way, at range, striking again and again while shouting the line the trick implies; and the log attributes the kill to Jovan with the trick that shaped the fight. Before this fix, that same kill would have read by=<scholar> via='player' — erasing Jovan from his own kill. The fiction (a villager executing the village's learned trick) and the telemetry (by/via/trick) now agree. The nevermore entry (gen_di7105t, trick='sidestep') reads the same way: someone dodged the dive and finished it.

## Blank-fill record

- FILLED (fixed): finding #405 — TB-path companion kills now carry by=<companion vid>, via='companion', with the trick summary riding along. The counterwire arm's open blank ("per-fighter last-hit attribution in TB (companion-killer quirk) remains an open blank") is closed.
- DOCUMENTED (not fixed): status-DoT tick kills keep the legacy tag (no structured source on status entries — wiring it would be speculative).
- DOCUMENTED (not fixed — out of scope): the finding's secondary phrase "the fieldfightsrc channel tagging inherits the quirk" maps to no code symbol in src/js (grep-confirmed); if it names a real system it lives outside the recordWaveKill region (possibly the observation/trick-credit region, which this brief forbade touching). Left as a documented blank.
- DOCUMENTED (pre-existing, not mine): `scripts/test-table-trial-fire-20261012.js` fails in check.js --quick (`Game.tableTrialResume is not a function` — the function exists nowhere in src/js; the failure predates this arm, cf. aeda28d1 "2 pre-existing fails, same as HEAD"). Not touched — out of arm scope.

## Named next

1. **DoT-tick kill attribution** (the documented limitation): `tickStatuses` can kill a monster fighter without passing through tbDamage — those kills keep the legacy tag. Wiring it needs a structured source on status entries (currently only a label string). Small, well-bounded follow-up if the trick game ever needs complete kill attribution.
2. **Companion trick-execution frequency**: 4 trick-attributed companion kills in 32 runs — the attribution is now honest, but the underlying execution rate (~1% of the kill flow per the counterwired arm) is the real lever. That's a counter-wiring arm's question, not this one's.
