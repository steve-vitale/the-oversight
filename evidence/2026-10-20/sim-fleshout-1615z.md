# flesh-out loop run fleshout-20261020T1615Z — coordinator summary (axis scale-onramp)

Run: fleshout-20261020T1615Z. Axis: scale-onramp (blocking, STANDING DIRECTIVE in force).
Claim: hidden_files/lever-claims/fleshout-20261020T1615Z.json (written before any sims, deleted at closeout).
Lock: created 16:16Z, deleted at closeout. Lock/registry run_id agreement via WT_RUN_ID.

## Arms (3, all landed)

### Arm A — sim-vgearjudge2: villagergear pilot judged GO, confirm report-only NO-GO
Adopted the dead duplicate instance's tree (sim-villagergear-judge, heartbeat 75min stale, no file writes since 15:01:49Z — dead per the file-write-freshness rule; adoption recorded in registry).
- Verified the duplicate's uncommitted verdict draft independently against the committed 32-run corpus; corrected two errors: (1) the kill re-identification — the d61 Tariq kill is mid='strike', not The Understudy (the broadcast killbeat misattributes; filed as named next), (2) the judgment attribution (duplicate's run_id, not 1415Z), (3) a sloppy substrate-env line edit.
- PILOT (seeds 64001–64008 × {leadfeast,belongfeast} × {control,vgear}, w5doormeasure substrate): PRIMARY GO — 3/8 armed seeds with a wave-4 kill via=villager (d61 Tariq + d71 Aurora on s64006 leadfeast, d83 Nina on s64008 leadfeast, d103 Dante on s64002 belongfeast; all via=companion) vs 0/8 control. All 5 guardrails green. Secondary: w5vetsMax ≥ 2 on 3/16 armed vs 0/16 control. Sense PASS (Tariq/Aurora fight reads as a fight; layer's own beats silent — #699 named next: visible arming beats). Landed c7a4d6ac5.
- CONFIRM (8 new seeds 64015–64022 × {leadfeast,belongfeast} × {control,vgear}, same bar): NO-GO — 1/8 armed (s64022 belongfeast, d153 Luis via=companion vs The Strike) vs 0/8 control. Guardrail misses: starvation 7→11, new death modes ('experiment' 2 events, 'the phoenix link' 7 events — game-side causes the policy cannot produce). §15 panels: both review_required. Per §14 the confirm is REPORT ONLY — the pilot GO verdict stands on its own set. Combined 16 armed seeds: 4/16 with villager wave-4 kills vs 0/16 control. Proof re-run 27/27 GREEN post-rebase incl. fresh D2. Landed 4d4d9198c. Layer stays default-OFF (VGEAR=1), zero src/js.
- Verdict: the channel is proven (villagers CAN be made wave-4 killers through engine-honest channels), the rate is modest (~25%, not the pilot's ~38%).

### Arm B — sim-emptydraft: #692 empty-draft DIAGNOSTIC, GO
Instrument-only (zero src/js): read-only census wrap on havenRaidTick. 16 runs (64001–64008 × {leadfeast,belongfeast}, 180d, pre-seat+windefer substrate, FEASTSCALE_R13=1/SEATDRIVE=0).
- 201 raid-nights; 43 zero-defender (21.4%); 828 raiders, 30.9% unmet. 100% attribution, 0 unexplained (pre-registered GO gate met).
- Drain 1 (46.5%): the engine's DAILY MUSTER (shelterMusterCheck, 2026-10-17) runs in progDaily BEFORE havenRaidTick — sheltered villagers are excluded from the raid draft by design ("outlast it, not feed it"). All sheltered slots carried reason='muster' with a live shelterMustered episode and a wave-4+ threat at the treeline. Two working-as-designed systems compose into the empty draft.
- Drain 2 (46.5%): autonomous away rhythms (water runs dominant, visit, forage, expedition, explore, traps, haul, leave) — NPC duty rhythms the policy cannot touch (the raidgarrison diagnosis verbatim).
- Wounded negligible (0.10/night); the palisade does NOT prevent the empty draft. Sense PASS on 2 zero-defender windows in the raidgarrison transcripts.
- Proof RED→GREEN + DET 4/4 byte-identical, re-verified post-rebase with the full substrate env (the bare-env exit-2 is the module-load substrate gate, not a failure). Landed c893b6cb1 (scripts + evidence + 16 census JSONs).
- steve-call filed in sim-findings.md: the named lever is an engine-side departure/muster discipline (draft-aware muster / raid-ripe departure gate) — the muster discipline is Steve's design, needs his ruling before any arm is built.

### Arm C — sim-sanctitygate: verification arm — the fix was already on master
The assigned game-code fix (gate monsterTurn()'s stance/contact block + reengageWaitingMonsters on tableActive()) was found ALREADY LANDED on master as 7024fd22b (journey-scale r10, 2026-10-20 ~02:43 UTC, before this run). The worker verified the landed fix line-by-line against the brief: (1) monsterTurn contact block gated AFTER the glasswing trap trigger (player's device stays live); (2) both reengageWaitingMonsters callers gated (hall-door exit holds the stash with a spoken line; treelineAmbush returns false); (3) untouched: trial (table-feared.js:158), contests, player paths, the lingerer treeline re-pinning in havenGrowth.js (siege persists; only mid-finale engagement gated). Independent verification: proof scripts/test-table-sanctity-gate-20261020.js 11/11 GREEN (reverse-apply → RED 6 failures → re-apply → GREEN, no trace); static audit refreshed for the +19 line drift (0 uncovered ambient sites, PASS, re-verified post-rebase); check.js --quick 253/4 parity with the landed commit's own run. No new game code; landed b535eeca0 + 6c81160c3 (script refresh + evidence). No [needs-eyes] (no feel/combat change by this run). Scale-onramp "table approach" beat: ambient-router gap closed; the wave-5 window-survival wall itself remains open.

## Wall numbers (this run's corpora, w5doormeasure substrate)
- villagergear pilot set (32 runs): national 6→6, table 14→12, wins 0→0, wave-5 0 armed (2 armed runs reached wave 5: s64006 d163? — s64006 + s64008; 0/16 control), median survival 154→158d.
- villagergear confirm set (32 runs): national 8→9, table 11→12, wins 0→0, wave-5 1 armed (s64022) vs 0 control, median 134→144d.
- emptydraft census set (16 runs, control-side regime): national baseline per the preseat baseline note — census was raid-focused, not wall-focused.
- Wave-5 remains 0 on every control; the armed arm reaches wave-5 on 3 runs across both sets but never holds it.

## TELEMETRY DEVIATION CHECK
- villagergear confirm armed corpus (16 files, 4 metrics): QUIET vs scale-wall-preseat baseline.
- villagergear confirm control corpus: 1 LOUD (national 21→8, -62%) — investigated: REGIME ARTIFACT. The baseline is the pre-seat FULL WIN STACK (TRIBFLOOR/SUCCGRACE/RAIDDENSITY/WINPURSUIT/WINDEFER/NODEWITNESS/VETREL=1); this run's corpora are the w5doormeasure substrate (VETREL=1 unset) — the documented 2230Z artifact. The armed side is quiet; the control side fires the same LOUD. No layer deviation. Baseline NOT rolled.
- (The body's literal `wins` metric key was corrected to `won` — the documented spurious-LOUD trap.)

## Convergence
scale-onramp stays converging: (1) the veteran channel's policy-side answer now has its first proven instrument — the villagergear layer fills the 2-living-veterans w5 readiness bar through engine-honest channels (pilot GO, confirm report-only NO-GO, combined 4/16 vs 0/16); (2) the raid posture avenue's autopsy is now complete — #692 attributed 100% (shelter muster 46.5% + away rhythms 46.5%), the remaining lever is an engine-side departure/muster discipline (steve-call); (3) the table-approach beat is closed — the ambient-router sanctity gap the audit attributed is fixed on master (7024fd22b). The wave-5 window remains the binding wall (0/16 on every control; armed wave-5 reaches are holds of 0). Directive lift remains a Steve call.

## Metric review (§14)
- The confirm's same-bar NO-GO (1/8) does not re-score the pilot GO (3/8) — pre-registered, honored.
- The pilot's primary counts killing blows (rare, noisy); the worker's metric note stands: companion wave-4 damage-share floor would be a steadier primary for future arming levers (proposed for the next run, not applied here).
- No metric revisions proposed for this run's instruments.

## Findings appended to sim-findings.md
- steve-call: engine-side departure/muster discipline (draft-aware muster / raid-ripe departure gate) — the empty-draft lever needs Steve's ruling.
- killbeat misattribution (broadcast names The Understudy; kill log mid='strike') — named next.
- #692 marked answered (100% attribution); #699 visible-arming-beats remains open.

## Infra
- git EPERM flap QUIET all run (all registrations/rebases/merges went through; registrations fast this run).
- worktree-register.sh stale-branch check: both new trees branched from current master (verified rev-parse).
- Pipe-mask lesson applied: proof exit codes captured without pipes (caught the env-gate exit-2 honestly).
- Loop B live on food-economy (its retagrot-b3 arm landed GO 116e80090 mid-run; pitjoin-b killed cb53b1584) — zero file overlap, not touched. Playtest-loop trees active — not touched.
- Ship loop active: version bump 699c56ba8 landed mid-run (their lane; no interference).
- Main tree clean at closeout. Registry clean (all three trees released/removed, branches deleted).
