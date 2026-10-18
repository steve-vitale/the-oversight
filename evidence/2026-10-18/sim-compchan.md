# sim-compchan — companion→veteran funnel census (2026-10-18)

Run: flesh-out loop arm sim-compchan (run_id fleshout-20261018T1715Z, loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (VETERANS/veteran vocabulary; design call #4 readiness gate).
DIAGNOSTIC — no lever, no game-code changes, no policy changes. New files: scripts/compchan-instrument-20261018.js (COMPCHAN=1, default OFF — unset means the wrappers are never installed; the proof test's det-gate pins non-perturbation), scripts/compchan-sweep-20261018.js, scripts/compchan-analyze-20261018.js, scripts/compchan-transcripts-20261018.js, scripts/test-compchan-20261018.js. ZERO src/js. ZERO scripts/policies changes.

LINEAGE: sim-vetstaff-a (2026-10-18, KILLED-AT-PILOT) — the base policy IS the veteran manufacturer (control: 13/16 ever-veteran, 23 villager wave-3 kills, median firstVet 90d, no staffing). This arm is the tracker's named next: INSTRUMENT what the base policy's organic companion combat is already doing — which companions blood, in which fight shapes — rather than adding more hunts. The 5th production attempt must come from the base mechanism, not another staffing variant.

## Substrate (census)

- policy: TF.leadfeast / TF.belongfeast — scripts/policies/tribfloor (the pure tribfloor base; NO vetstaff, NO vetblood, NO vetrel)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1 (exactly the vetstaff-a pre-seat substrate; VETSTAFF unset — the layer was deleted per kill protocol)
- seeds: 8 fresh (63101–63108 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep)
- horizon: 180d death-aware (dead villages stop simulating; runDays handles this)
- instrument: COMPCHAN=1 — read-only observation wraps on Game.recordWaveKill / Game.recordPyrrhicKill / Game.startCombat / Game.sleep (kill-time ctx capture; zero game-state writes, zero RNG draws)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**DIAG-GO (binding):** 100% attribution of the companion→veteran funnel on 16/16 runs:
- every wave-3+ waveKillLog entry attributed to {killer (keyed on `by` vs the kill-time scholar vid — NEVER `via`; mis-tagged via='player' companion kills counted), party-vs-independent (kill-time party roster), fight shape, mis-tag flag}
- every living wave-3+ killer reconciled against the engine's own waveCombatReadiness(4).veterans count (my bloodList size == engine count at end of run)
- every run's release-window segment attributed: window-open day (standing ≥ 100), firstVetDay, wave-4 unlock day, veteran in-window survival
- zero instrument errors on all 16 runs
- determinism: re-run of one named seed reproduces the kill set exactly

**No balanced panel (§15):** this is a one-arm diagnostic census, not a before/after lever comparison — the panel is the before/after instrument and there is no "after". The corpus summary + attribution table attach instead.

**Answers required:**
1. which companions blood (scholar companions — in-party at kill time — vs independent villagers?)
2. in which fight shapes (raid vs expedition vs wild vs haven-TB, plus the villager engine channels agency/sortie/patrol/contest)?
3. what share of w3 kills convert to ever-veteran (per-run and corpus)?
4. where the funnel leaks (dead killers, pre-window mortality, scholar-kill share, mis-tag rate, engagement→kill leak)?
5. the named next that is NOT another staffing variant.

**Why this diagnostic:** the staffing theory is 0-for-2 (vetblood yield never engaged; vetstaff adds no marginal production); protection is 0-for-3 (vetsurvive, compvet-protection, deferguard). The base policy's organic companion combat is the manufacturer. The 5th production attempt must come from understanding the base mechanism — this census is its map.

## Fight-shape taxonomy (kill-time ctx + engine via channel)

Adapted from the vetwindow death-channel taxonomy (sim-vetwindow, 2026-10-18), applied to kills:
- `raid` — ctx.aid (aid-crisis fights) or via='aid-crisis'
- `expedition` — ctx.onExped (scholar on expedition) or via='sortie' (havenGrowth mustered sorties)
- `wild` — via='wild', or scholar-TB in the wild (inTb && !atHaven && !onExped)
- `haven-TB` — scholar TB fight at haven (atHaven && inTb) — raid defense the scholar fights
- `agency` — via='agency' (villager field fights — real blow-by-blow, no scholar)
- `patrol` — via='patrol' (expected ~0 on courtship road — fieldfightsrc: patrols never fire)
- `contest` — via='contest'
- `unknown` — unattributed (must be 0 for DIAG-GO)

## Proof

`scripts/test-compchan-20261018.js` — **43/43 GREEN**:
- (a) DET-GATE: instrument installed vs not — per-day trajectory hashes (the repo's own `scripts/det-gate.js` dayHash standard) identical on stable seeds, both policies. NOTE: full-state byte comparison is invalid on this master — det-gate.js documents the known issue (2026-10-14, entropy-hunt r26): wall-clock timestamps (state.pacing.lastTs) and timestamp-based villager IDs leak into state, so two identical no-instrument runs already differ (proven by probe: first diff at state.pacing.lastTs). The gate therefore proves noinstr-vs-noinstr stability first, then judges the instrument — all green.
- (b) 14/14 classifier fixtures (every via × ctx → expected shape).
- (c) Wrap fixtures on a real harness game: 10 crafted kills covering all channels + the via='player' mis-tag + pyrrhic + unresolved killer + an in-party companion — kill-time ctx captured (scholarVid, party, aid/atHaven/inTb/onExped), zero 'unknown' shapes, zero instrument errors.
- (d) REAL-SWEEP GATE: a full 180d census run through the real sweep script — attributionComplete true, zero instrument errors, re-run byte-identical.

## Results

**DIAG-GO: MET — 16/16 runs, 0 errors, 16/16 attribution complete.**

16-run census complete (seeds 63101–63108 × {leadfeast, belongfeast}, 180d death-aware):

| metric | corpus |
|---|---|
| wave-3+ kills | 33 |
| companion kills (by ≠ kill-time scholar vid) | 1 (3.0%) |
| scholar kills | 32 (97.0%) |
| mis-tagged via='player' | 0 |
| shapes (all killers) | haven-TB 24, raid 8, wild 1; agency/sortie/patrol/contest 0 |
| via channels | player 32, companion 1 |
| living blooded companions at end | 0/16 runs |
| scholar-blooded at end | 0/16 runs |
| engine living veterans at end | 0/16 runs |
| runs hitting firstVetDay (transient) | 14/16 (median d84) |
| wave-4 unlocks | 12/16 |
| national / table / won | 9 / 14 / 0 |
| release window opened (standing ≥ 100) | 12/16; firstVet in-window 10/14 |
| TB engagements (w3+) | 393 → 33 kills (8.4% engagement→kill) |
| kill-time party non-empty | 0/33 kills |

### Answer 1 — which companions blood

Essentially none. The single companion kill in 16 runs: **Katarina**, d62, gavel, haven-TB, via='companion' (the tricktag tag working as designed) — and she was **not** in the kill-time party roster. The kill-time party roster was **empty on all 33 kills across all 16 runs**: the base policy never staffs a party (inviteToParty is a staffing-layer verb). Organic companion combat flows entirely through fight allies ("Katarina joins you!"), not the party roster. The "scholar companions (in-party) vs villagers" distinction collapses on the base policy — the in-party category is empty by construction.

### Answer 2 — in which fight shapes

All 33 kills: haven-TB 24, raid 8, wild 1. Zero kills in agency, sortie, patrol, contest channels on 16 runs — the villager-side engine channels produced no wave-3 kills at all. The one companion kill was haven-TB (raid defense at haven, fighting alongside the scholar).

### Answer 3 — what share of w3 kills convert to ever-veteran

**0% durable, ~transient-only.** 14/16 runs hit firstVetDay (the census saw veterans ≥ demand=1 mid-run — all from scholar kills), 12/16 unlocked wave 4 on the transient bar. But **0 living veterans at end of all 16 runs** — every produced veteran died before end of run. The conversion chain: 33 kills → 1 companion kill → 0 living blooded companions; 32 scholar kills → 0 living scholar veterans. The bar is met transiently and never held.

### Answer 4 — where the funnel leaks (ranked)

1. **Kill-securing (companion 3%).** Companions are present in the scholar's TB fights (the transcript shows Katarina dealing 45–51/hit — out-damaging the scholar's 41s) but land 1/33 killing blows. The scholar takes 97% of kills.
2. **Survival (100% veteran mortality).** Every blooded scholar died (up to 4 distinct scholar-killers per run — leadfeast-s63105: Rafael → gen_55051d5 → Onni → gen_sxan59u); the one blooded companion died too. 14/14 transient veterans dead by end of run.
3. **Engagement→kill (8.4%).** 393 wave-3 TB engagements → 33 kills. The competent policy's "fight only with advantage" discipline means most engagements end in flight, not kills — honest behavior, context not a bug.
4. **Non-leaks:** attribution 100% (zero unknown shapes, reconciliation exact on all 16 runs); mis-tag rate 0/33 (tricktag holds on this corpus); instrument errors 0.

### Answer 5 — the named next (NOT another staffing variant)

**Record correction + the kill-securing diagnostic.** (a) The tracker's "base policy is the veteran manufacturer" headline is wrong under kill-time keying (see below) — the correction ships with this evidence. (b) Next diagnostic: **companion damage-share vs kill-share in wave-3 TB fights** — instrument how much damage companions deal vs how many killing blows they land. The census proves companions fight (and hit hard); the leak is specifically kill-SECURING. If damage share is substantial, the 5th production attempt is a policy-side kill-discipline rule (scholar softens, doesn't execute — a targeting rule, not a staffing layer). If damage share is trivial, the production problem is companion combat capability (arming/leveling), a different lever. Either way the answer comes from the base mechanism, not another hunt-staffing variant.

## The keying correction (headline result)

**vetstaff-a's "23 villager wave-3 kills" were inflated by end-keying.** That instrument keyed `by` vs the END-of-run scholar vid. Any kill by a previous scholar (pre-succession) counts as a "villager kill." My instrument keys on the KILL-TIME scholar vid.

Re-key experiment (evidence/2026-10-18/perseed-compchan-rekey/, 4 runs on vetstaff-a's own seeds 58101/58103, same substrate):

| run | vetstaff-a control (end-keyed) | compchan (kill-time) |
|---|---|---|
| leadfeast-s58101 | w3=2, "villager"=1 | w3=2, companion=0, scholar=2 |
| belongfeast-s58101 | w3=1, "villager"=0 | w3=1, companion=0, scholar=1 |
| leadfeast-s58103 | w3=1, "villager"=1 | w3=1, companion=0, scholar=1 |
| belongfeast-s58103 | w3=2, "villager"=1 | w3=2, companion=1, scholar=1 |

Kill sets reproduce EXACTLY across anchors (w3 totals match; firstVetDay matches vetstaff-a to the day: 76/124/90/122) — the substrate didn't drift; only the attribution changes. 2 of the 3 sampled end-keyed "villager kills" were old-scholar kills: leadfeast-s58101's d76 chorus_line was Susan's kill (scholar at the time), followed by Elena's d110 congregation after succession — vetstaff-a counted Susan's as a villager kill.

Corrected headline: **the base policy does not manufacture companion veterans — it manufactures transient scholar-veterans who all die.** The "13/16 ever-veteran" control result stands as a transient-bar measurement, but its "23 villager kills" do not survive kill-time keying. The staffing theory was 0-for-2 against a control that was itself misread; the manufacturing question is sharper now, not softer: on the base policy, villagers essentially never land wave-3 killing blows (1/33 here).

## Village assessment (plain words)

The modal village: the scholar fights wave-3 monsters at haven and on raids from ~day 30–80, usually outnumbered, usually fleeing (393 engagements, 33 kills). When a kill lands, it's the scholar's — haven-TB raid defense, the scholar and whoever joined them against the Gavel or the Callback or the Redactor. The scholar bloods around day 84 (median), the wave-4 door creaks open (12/16), and then the scholar dies — in a raid, on expedition, of wounds — and a new villager takes the mantle, fights the same fights, bloods, and dies. Four mantles in one run (leadfeast-s63105). Nobody holds the veteran bar; the village reaches national (9/16) and the table (14/16) on the transient openings. The one companion who blooded — Katarina, d62, the Gavel, fighting shoulder-to-shoulder with the scholar while feverish at 8 HP — died too, unremembered by the bar. Median survival 162d. Nobody won (pre-seat regime: wins structurally 0).

Who thrived: the scholars who killed and lived long enough to see wave 4 (12/16 villages unlocked it). Who died: everyone who blooded — 14/14 transient veterans dead by end of run, scholars and the one companion alike. What was missing: not engagements (393), not kills (33) — but any DURABLE veteran, companion or scholar. The blank this diagnostic fills is the funnel map itself, plus the keying correction to the vetstaff-a record.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-18/compchan-transcripts/leadfeast-s63108.txt (d60–64 window around the d62 Gavel kill; the census kill reproduced exactly in the re-run — same day, monster, killer).

The d62 Gavel fight is the base policy's organic companion combat working: "⚔ GAVEL! Katarina joins you!" — no staffing, no invite, she just joins. She strikes for 45/51/45/49/45 (FEASTED ×2.03, "the feast was the weapon"); the scholar strikes for 41s with the Hardlight knife. The Gavel has a real personality and mechanics ("OBJECTION SUSTAINED", the verdict naming "Day 55: Kai Katz was brought home", "THE ACCUSED WILL RISE" with object/recess/confess options). Katarina lands the killing blow ("The Gavel falls" on her 45-hit) — the tricktag attribution (via='companion') matches the fiction exactly. Then the consequences cascade: the wave-4 unlock beat ("Say hello to the MIRROR DRAFT"), the village's genuine social reaction ("🔥 David, at the fire: 'It wears our faces? Then we don't trust faces after dark.'"), Katarina whooping, alien loot, the fire retelling. Coherent, consequential, collective.

Two notes: (1) Katarina was established d60–62 as feverish and hurting at 8 HP, resting — yet she fights at full strength (45–51/hit, out-damaging the scholar) with no fiction acknowledging her condition. Minor incoherence, filed as a finding. (2) The re-run's companion kill set MISMATCHED the census (2 vs 1) — the d62 kill reproduced exactly, but a second companion kill appeared elsewhere in the re-run. Likely the known contest-ID timestamp leak over 180d (det-gate.js known issue), not the instrument (det-gate pins the instrument clean on 60d stable seeds; the sweep re-run was byte-identical). Filed as a finding; the sense-test read covers the reproduced kill.

## Metric review (§14 — binding, never re-scored)

1. **DIAG-GO MET (16/16).** Every wave-3+ kill attributed (zero unknown shapes), every run reconciled against the engine's VETERANS count (reconcileDelta=0 on 16/16), zero instrument errors, 16/16 runs complete. Not re-scored against anything friendlier — the bar was attribution, and it's met.
2. **Reconciliation vacuity note.** When engV=0 (all 16 runs), reconcileDelta=0 is cheap — the real validation is the re-key experiment: kill sets and firstVetDay reproduce vetstaff-a's control EXACTLY on 4/4 sampled runs (w3 totals match; firstVet 76/124/90/122 to the day). The instrument is proven against an independent corpus, not just self-consistent.
3. **Balanced panel (§15) not run.** One-arm diagnostic census; the panel is the before/after instrument and there is no "after." Documented in the pre-registration, not skipped silently. Corpus summary + attribution table attach (evidence/2026-10-18/perseed-compchan/_corpus.json).
4. **Seeds.** 63101–63108, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 16/16 runs, 0 errors. The re-key runs reuse vetstaff-a's seeds deliberately (attribution comparison, not fresh measurement — documented).
5. **Transcript determinism.** The proof's re-run byte-identical covers the sweep (with COMPCHAN). The transcript probe (without COMPCHAN, 180d) diverged 2-vs-1 on companion kills — the census kill reproduced exactly; the extra kill is attributed to the known long-run timestamp-ID flakiness. Reported, not hidden; doesn't touch the DIAG-GO (which binds on the sweep corpus).
6. **Pre-registration honored.** The header was written before any sims; the funnel stages, taxonomy, and GO threshold are as pre-registered. No mid-run re-scoring.
7. **Repo check.js --quick (convention, not binding).** 95 passed, 2 failed — both unrelated to this arm (zero existing files changed; the worktree holds only 9 new untracked paths): (a) scripts/test-sprites-valid-20261014.js — missing monster sprites, documented pre-existing in sim-vetstaff-a's evidence; (b) scripts/test-capable-bot-20261014.js — TIMEOUT at 120.7s vs the 120s limit, a timing flake (failure count varied 1–2 across runs; a sibling loop was running check.js concurrently in another worktree). Neither touches the diagnostic; the arm's proof (43/43) is the binding green.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. End-keyed "villager kills" inflated by old-scholar kills (the keying correction — filed as a correction to the vetstaff-a record).
2. Kill-time party roster empty on all 33 kills — organic companion combat is all fight-allies; the party roster is a staffing-layer artifact.
3. Transcript re-run determinism mismatch over 180d (harness timestamp-ID flakiness).
4. Katarina fights at full strength while at 8 HP feverish (minor fiction incoherence).

## Convergence

**DIAG-GO.** The diagnostic met its binding bar on current master with a clean instrument (proof 43/43 GREEN, 16/16 attribution, 0 errors). The axis stays scale-onramp: the veteran question is now precisely mapped — the base policy manufactures transient scholar-veterans (14/16 runs) who all die (0/16 durable), companions land 3% of wave-3 kills, and the wave-4 door opens transiently (12/16) without anyone holding the bar. The vetstaff-a "base policy manufactures" headline is corrected. The 5th production attempt must come from the kill-securing diagnostic (named next above), not another staffing variant. No game change: zero src/js, zero scripts/policies — instruments + evidence only.

## Files

- scripts/compchan-instrument-20261018.js — the COMPCHAN instrument (read-only; proof 43/43)
- scripts/compchan-sweep-20261018.js — 16-run census sweep
- scripts/compchan-analyze-20261018.js — corpus aggregation + funnel table
- scripts/compchan-transcripts-20261018.js — sense-testing transcript probe
- scripts/test-compchan-20261018.js — proof: det-gate + attribution completeness (43/43 GREEN)
- evidence/2026-10-18/perseed-compchan/ — 16 per-seed JSONs + _summary.json + _corpus.json
- evidence/2026-10-18/perseed-compchan-rekey/ — 4 re-key runs on vetstaff-a seeds + _summary.json (the keying-correction experiment)
- evidence/2026-10-18/compchan-transcripts/leadfeast-s63108.txt — the d62 Gavel sense-test transcript
- evidence/2026-10-18/sim-compchan.md — this file
- ZERO src/js changes, ZERO scripts/policies changes
