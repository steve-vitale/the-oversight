# sim-riskdeath-b — prereg (BINDING)

**Arm:** sim-riskdeath-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1930Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (1) from the 2026-11-08 1830Z review — "the risk-aware death-cause read on the healed leg" · **Branch:** sim-riskdeath-b, cut at master `6680d7924` · **Corpus:** the committed flippanel panels, evidence/2026-11-08/panel-flippanel-b/{before,after}/panel.json.gz — NO new sweep, NO new panel build.

## The question

WHY does cautious (risk-aware) play die more on the healed code? The real §15 panels (sim-flippanel-b, NO-GO) show, on the frozen band 53001–53008, 150d, endpoints collapsed `cf22937b8` vs healed `c9fea16ee`: risk-aware playerDeaths per run 5.375 → 6.875 (+1.5/run, `regression_signal`, paired 95% interval 0.375 to 3, excludes 0); villageDeaths per run 59.75 → 64 (+4.25, `regression_watch`). Under capable the same healed code kills slightly FEWER (player 17 → 16, village 475 → 428). The mechanism is unexamined. This arm names the cause.

## Method step 1 — verdict: panel-only analysis, no new sweep

The existing panel rows DO carry per-death cause data: every row has `row.deaths`, a `kind:cause → count` map from `registerDeath` (corpses.js), and the map sums reproduce BOTH panel metrics on all 32 rows (verified before this prereg: `player:`-key sums equal `metrics.playerDeaths`, all-value sums equal `metrics.villageDeaths`, 0 mismatches). Cause data is therefore present — per the task brief, no new sweep is run. The judged work is an analyzer over the committed panels only (`scripts/analyze-riskdeath-b.js`, new, scripts/-only).

## Cause-string inventory + label registration (read before this prereg to build the family table; no paired per-seed computation was run before this prereg)

26 distinct raw keys across both panels. Kinds are `player` (bearer/scholar deaths), `villager`/`person` (villager and non-roster-person deaths), `monster` (monster deaths — KILLS, not human deaths; see the r21 trap below). The following labels are REGISTERED here, per the 53007 arm's open registration gap (sim-53007-a: "dehydration" plausibly thirst-family; "Ad Break" / "The Eulogy" unidentified):

- `dehydration` → **thirst family** (registered, as the 53007 arm proposed). Appears as `player:dehydration` 1× per capable leg, 0× risk-aware.
- `lockjaw` → **sickness family** (named disease — tetanus; a disease, not a wound). Appears as `player:lockjaw` 1× per capable leg, 0× risk-aware.
- `the night` → **OTHER, never bucketed** (the 53007 classifier carries it as OTHER). 1× capable-before, 1× capable-after, 0× risk-aware.
- `the phoenix link`, `Big-Eyes`, `Buffering`, `Sweeps Week`, `The Moderator` → **OTHER** (show/event-named causes; mechanism unidentified, never silently bucketed).
- `alien` / `alien_beam` → **alien family** (person kind). `person:alien` appears 1× (risk-aware after).
- `Ad Break` / `The Eulogy` → **do NOT appear in either panel** (0 occurrences). The 53007 finding stands for doorwalk corpora only; nothing to register here.
- `the expedition` (player cause) → **violent family** (53007 VIOLENT set member `expedition`).
- `the arena`, `contest`, `a stranger`, `the wild` → **violent family** (53007 VIOLENT members).
- `sickness`, `starvation` → **attrition family**; `thirst` → **thirst family**; `a wound that wouldn't close` → **wound family** (53007 ATTRITION set, split so wound is separately visible).
- `monster` (villager/person cause: died TO a monster), `ambush`, `combat` → **violent family**.
- `monster:*` (any cause: `combat`, `expedition`, `villager combat`) → **monster-kill family** (a rise is villagers killing more monsters, NOT humans dying).

## The r21 trap (binding on the read)

`villageDeaths` sums ALL `row.deaths` values INCLUDING `monster:*` kills (balance-panel.js `deathMetrics`, ruling 753). A rise in `villageDeaths` can therefore be a rise in monster kills. The villageDeaths read MUST decompose into monster-kills vs human deaths (kinds `player`+`villager`+`person`) before any sentence about "the village dying more" is written. Likewise never read cause without kind (death-census.js, r21: `monster:villager combat` is a villager KILLING a monster, not villagers fighting each other).

## Primary metric + GO bar (binding)

- **Primary metric:** the cause (or pre-registered cause family) accounting for the paired +12 player deaths over 8 risk-aware seeds (5.375 → 6.875/run, +1.5/run).
- **DIAG-GO iff** one named cause OR one pre-registered family accounts for ≥2/3 of the paired +12 player-death increase (i.e. ≥8 of 12) **with its paired per-seed 95% t-interval (7 df) excluding 0** — OR likewise explains the +34 village-death increase (+4.25/run: ≥23 of 34, paired interval excluding 0).
- **DIAG-NO-GO** if no cause/family explains ≥2/3 of either increase with an excluding-0 interval.
- The named-cause candidate is judged by the analyzer's paired computation, which is run ONLY after this prereg is committed. The cause-string inventory above discloses the vocabulary; it does not pre-compute the verdict (per-seed deltas and intervals are the judged computation).
- The `violent` family on risk-aware player deaths is NOT a discriminating test: all 43 before-leg and all 55 after-leg risk-aware player deaths are violent-family by the table above, so the family trivially covers 12/12. The discriminating tests are the NAMED cause (`the wild`) for player deaths and the monster-kill family for villageDeaths. The verdict must name a cause that discriminates, not a family that covers everything.

## Secondary (report, don't judge)

- Per-seed cause tables (both policies × both legs, all 32 rows, raw keys + families).
- Day-of-death distribution: NOT in the panels per cause (rows carry no per-death day records). Best available: bearer-change days from `samples[].bearer` (each bearer change implies a player death that day) and living-NPC drops from `samples[].livingNpcs` (net human deaths per day, joins aside) — reported as a coarse proxy, labeled as such.
- First-bearer vs non-bearer split: first-bearer survival through d30/d60 from the panel rows (compare.md already publishes capable 0.875 → 0.5 d30 `regression_signal`; risk-aware d30 0.875 → 0.875 flat, d60 0 → 0.1429 `insufficient`) — the analyzer re-derives these from the rows rather than trusting the compare text, and splits each row's player deaths into first-bearer (≤1) vs successor (remainder).
- Wall numbers (national / table / wins, wave 4–5 unlocks, median survival) from the panel rows, both legs — carried over from sim-flippanel-b, re-derived by the analyzer, not re-typed.

## Sense-testing

Read at least one day-record per leg (panel-row sample series + pacing acts, plus one committed doorwalk day-record per leg from `perseed-healerctl-collapse-b/` / `perseed-healerctl-healed-b/`) and quote the deaths in plain words in the evidence. Judge meaning and coherence, never just counts.

## Proof

`scripts/test-riskdeath-b.js` proves: the analyzer's per-leg, per-policy totals reproduce the committed compare's published totals (risk-aware player 43 → 55, village 478 → 512; capable player 17 → 16, village 475 → 428); the analyzer's paired player-death delta reproduces the compare's +1.5/run with an interval matching the compare's 0.375–3 within rounding; deterministic fixtures (a synthetic 8-seed panel pair with a known planted cause) yield the known verdict; the panel re-read equals the recorded verdict. Green on the branch tip.

## Metric review (pre-registered note)

- The 2/3-share + excluding-0-interval bar is the honest shape of "the cause": a cause that owns the increase on totals but is smeared across seeds with an interval covering 0 is a lead, not a finding. If the bar fails on totals that look concentrated, the evidence says so and the next arm runs a recorder sweep for day-level causes.
- The panel has no per-death day records, so the day-of-death secondary is a proxy by construction. If the verdict hinges on WHEN deaths happen rather than WHAT kills, that is a recorder-sweep question for the next arm, not a re-score here.
- The `villageDeaths` metric's monster-kill contamination is a property of the panel contract (ruling 753), not of this arm. If the monster-kill family explains the villageDeaths increase, the finding is "the panel's village-death guardrail fired on kills, not deaths" — a metric note for the compare contract, not a game verdict.
