# Run fleshout-20261023T1115Z — axis scale-onramp (3 arms, all landed)

**Run:** fleshout-20261023T1115Z (oversight-flesh-out-loop), axis scale-onramp per STANDING DIRECTIVE.
Claim `hidden_files/lever-claims/fleshout-20261023T1115Z.json` written before any sims; deleted at closeout.
No stale-lock recovery (no lock at run start). Rotation index stays 3 (directive override).
**Convergence: converging (NOT converged).** Directive lift remains a Steve call.

## Arms (all policy/instrument-side; zero src/js across the run)

### Arm 1 — sim-armored15-confirm (commit 67bf346d9, merged ff-only)
Confirm of the sim-armorvillage-b pilot's armored15 secondary on FRESH seeds 68301–68308
(freshness verified: no evidence filenames, no `"seed": 6830x` fields).
32 configs: seeds 68301–68308 × {leadfeast,belongfeast} × {control,ARMORVILLAGE=1},
180d death-aware, ARMORYDRIVE=1 pinned both arms, FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1. Namespace armored15-confirm.
- **PRIMARY (binding): armored15 median-of-medians control 3 → armed 5 — PASS.** The
  pilot's exact +2 replicates on fresh seeds. Per-seed control [6,3,3,3,2,2,4,3],
  armed [7,3,6,4,5,2,7,3]; 7/16 pairs move up, 9 tie, 0 down.
- **ENGAGEMENT (binding):** deposits ≥2 on 8/8 armed seeds (1–40/config);
  equipped-from-structure ≥2 on 8/8 (3–39/config). Crafts 0/8 (informational —
  pilot root-caused to the starved materials inflow, unchanged; #835).
- **GUARDRAILS:** paired median survival diff +10d — PASS at the boundary (symmetric
  chaos tails −54…+77, the pilot's signature); **starvation 8 → 12 — FAIL vs the
  ≤10 bar by 2 events**; death-cause shares sane — PASS; no new death modes — PASS.
- **Mechanism autopsy (kill discipline, NOT a re-score):** excess concentrates in
  2/16 pairs on seeds that starve in control too (68306: control 3, armed 6);
  13/16 pairs are 0/negative; activity↔starvation r=0.149; armed lived +184 more
  village-days (+9.3% exposure — the absolute-count bar is denominator-blind);
  the policy has no food path. Pilot+confirm combined: control 20 vs armed 23 =
  rare-event noise. **Nothing is killed.** Metric review proposes starv/100
  village-days as the exposure-normalized guardrail for the next run.
- **Wall:** national 4/16→6/16 (final; ever 10/16→11/16), table 15/16 both, wins 0,
  wave4 16/16→15/16, **wave5 0/16→2/16**, median survival 122d→144d.
- Proof `scripts/test-armored15-confirm.js` 9/9 GREEN (re-run post-rebase on the new
  base). §15 panel invalid-by-contract for env-gated policy sweeps (byte-identical
  src between arms; primary not in the all23 contract set) — manual paired
  analysis attached (`armored15-confirm-paired-compare.md`), panel is the
  instrument only where the contract fits.
- Sense PASS: *"You hand Kurt the Warden's Cloak. Kurt pulls it on over their
  clothes, checking the straps — it fits."* Gift/deposit beats read as people.

### Arm 2 — sim-vetkill-autopsy (commit c0fbcf6e4, merged ff-only) — DIAG-GO
#837 named next (1): autopsy what kills the wave-4 killers (death-cause shares on
waveKillLog `by` vids). Instrument-only, zero src/js.
- **Fail-loud first:** `grep` over all 24 retained `perseed-w5door-b` JSONs found
  ZERO `waveKillLog` entries and `kills: []` everywhere — the killdisc wrapper
  missed wave-4 kills in w5door-b. Killer vids unrecoverable offline; ran a fresh
  16-config instrumented census instead (seeds 65511–65518 × {leadfeast,belongfeast}
  × armorydrive, 180d death-aware, anchor db7a0456), reading `state.waveKillLog`
  directly — the source the gate itself reads.
- **The autopsy table:** 15 wave-4+ kills, 10 killer vids, **8 of 10 died**:

  | cause class | n | share |
  |---|---|---|
  | other-combat (5 aid-crisis raids, 2 haven fights) | 7 | 87.5% |
  | other (raw cause `contest`) | 1 | 12.5% |
  | combat-vs-wave-4 / starvation / disease / wound | 0 | 0% |

- **The retention story:** killers die AFTER their kills, never in them. Zero
  same-day deaths, zero pyrrhic entries — every death landed 1–8 days after the
  last wave-4 kill (mean ~6d). The wave-4 fight is survived; attrition kills
  within a week. The defer5 gate's demand for 2 *living* veterans can't hold
  against that decay. **Never-formed dominates corpus-wide:** 10/16 configs
  produced ZERO wave-4 kills — formation is the bigger lever than retention.
- **The door isn't the wall anymore:** wave-5 opened in 2/16 (belong s65515/s65517)
  yet both villages died within ~2 weeks. Attrition outruns the gate.
- **Scholar never holds a wave-4 kill** (0/10) — the blooded-fighter fiction lands
  entirely on companions (filed to `sim-findings.md`).
- Proof 5/5 GREEN. Metric review: pre-registered DIAG-GO (≥90% in named classes +
  table + named nexts) — GO; 8/8 in named classes, zero silent, zero invented.
  The analyzer's strict non-catch-all rate is 7/8 (87.5%) — the one `other` is
  `contest`, proposed as its own named class next run. Sensor gap: death
  telemetry `wave` is null on raid/haven paths — combat-vs-wave-4 precision
  needs fightStarts retained + wave passed on those paths.

### Arm 3 — sim-doorcensus-armor (commits 0c20162f6 `[needs-eyes]`, c10c2bf6f, efe200caf, merged)
The tracker's named next "census re-run post-armorvillage". Re-ran the w5door
census on the SAME seeds 65511–65522, SAME substrate (FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1, base leadfeast, 180d, POSTWIN not
set): control = ARMORYDRIVE=1 (the census's armed env — also re-baselines drift),
armed = ARMORYDRIVE=1 + ARMORVILLAGE=1. Census instruments unmodified
(w5gates-lib, PURE release-path classifier); namespace doorcensus-armor.
- **PRIMARY (binding): doors armed 2/12 (s65515 d146, s65516 d137) vs control 0/12 —
  GO (bar armed ≥ control+2).** Control reproduces the census exactly (0/12) — no
  master drift on the door.
- **Which defer5 bar moved:** the r5 **armored** bar (4 fighters at worn P≥15).
  Released d80 (s65515) and d88 (s65516) on armed; never on the identical-seed
  controls (s65515 bound defer4, s65516 bound defer5 with armor null — the census's
  armor-short binding reproduced exactly). Both unlocks classify **live-demand**;
  all 24 runs attribute with 0 unexplained. With defer5 cleared, stand-raw (4/12)
  and defer4 (3/12) surface as the next bindings.
- **Wall:** national 8/12 both, table 8/12 both, wins 0, wave4 9/12 vs 8/12,
  **wave5 0 vs 2**, median survival 141d→179.5d, starvation 14→7, no new death
  modes, 0 instrument errors. The scale wall (national/table/wins) is untouched —
  only the door moved.
- Sense verdict: EARNED. Unlock transcript (armed, s65515): "The fifth draft stays
  in the wings — blood your fighters" → "RATINGS ARE UP... the Producers have
  greenlit the fifth draft" (d146), then The Herald/Network Note/Cancellation/
  Editor/Spoiler arrive; The Cancellation kills Khoan (d157); the village learns
  "Go off-script" (d170). Real consequences, System in character.
- Proof 15/15 GREEN.

## Run-level wall assessment (scale-onramp)
First run where the wave-5 door opens on measured, landed structure:
- The defer5gate DIAG named the gate bar-by-bar (0/16 co-satisfaction).
- This run the armor leg MOVED: armored15 3→5 confirmed on two independent seed
  corpora (pilot 67601–67608, confirm 68301–68308 — exact +2 both), and the door
  opened on two independent corpora (doorcensus 2/12 on census seeds 65511–65522;
  armored15-confirm 2/16 on fresh seeds 68301–68308). 4 doors on 56 armed configs
  vs 0/28 controls on identical seeds.
- The veterans binder is now attributed: killers die 1–8d after kills in later
  attritional combat (87.5%), never in the wave-4 fight; 10/16 configs never form
  a veteran at all. The coincidence trap's two legs have different fixes: armor
  fills via structure (proven); veterans needs formation (companion kill
  channel) + post-kill retention (the next lever, named).
- national/table/wins are UNMOVED by this run (wins structurally 0 on the
  SEATDRIVE=0 substrates). The scale wall stands; the wave-5 door does not.
- scale-onramp stays **converging (NOT converged)**. Directive lift remains a
  Steve call.

## Metric review
- armored15-confirm: §14 binds the guardrail miss (12 vs ≤10) — recorded as a
  mechanical NO-GO on that bar with the kill-discipline autopsy attached, NOT a
  kill and NOT a re-score. Primary confirmed on two corpora. Metric-review
  proposes starv/100 village-days as the exposure-normalized guardrail next run.
- vetkill-autopsy: DIAG-GO per pre-registered bar; sensor gap filed for the next
  instrument pass.
- doorcensus-armor: GO honored as pre-registered; `[needs-eyes]` on the commit
  (a door opening on sims is Steve-visible).
- Balanced panel: invalid-by-contract on both policy sweeps (env-gated,
  byte-identical src); manual paired analyses attached. Pre-registered bars are
  the judge.

## Telemetry deviation check
`telemetry-check.js` vs `scale-wall.json` on both new corpora → LOUD
(wins 16→0, both corpora) = REGIME artifacts (baseline is the winseat SEATDRIVE=1
full stack; both corpora are deliberately SEATDRIVE=0, wins structurally 0).
Investigated per both workers' reports; explained, not a bug. Baseline NOT
rolled forward.

## Incidents
- A sibling /tmp wipe killed the doorcensus armed sweep at 11/12 — per-seed JSONs
  were safe (worktree evidence dir, never /tmp); only s65522 re-ran. Sweep logs
  now go to the goal hidden_files dir (documented in evidence).
- safe-commit.sh index-clobber 3rd sighting (doorcensus: main index showed
  committed files staged-as-deleted on two consecutive commits) — repaired via
  the `--add --cacheinfo` recipe; AGENTS.md lesson updated with the pattern.
- Master moved 3× mid-run (journey lanes, scripts-only) — all arms rebased clean
  in-worktree per #793 (proofs re-run green post-rebase; substrate diffs empty).
- Loop B live throughout (sim-easingchannels-b, sim-depinteraction-b trees active
  at closeout) — zero file overlap by design (all my arms policy/instrument-side
  or evidence; disjoint namespaces).

## Landing record
- sim-vetkill-autopsy: c0fbcf6e4 (ff) — tree released, removed, branch deleted
- sim-doorcensus-armor: 0c20162f6 + c10c2bf6f + efe200caf (ff) — tree released,
  removed, branch deleted
- sim-armored15-confirm: 67bf346d9 (coordinator rebased in-worktree, proof 9/9
  re-run green, ff-merged) — tree released, removed, branch deleted
- Run evidence: this file. Main tree clean at closeout (67bf346d9).
- Claim deleted; lock deleted. "Merged locally, pending ship" — the ship loop
  owns version bumps, pushes, and live verification.
