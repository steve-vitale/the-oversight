# sim-adoption-round-2115 — adoption of dead 1915Z arm sim-awaynaming-cap-a (NO-GO, KILLED) + tracker repairs for 1215Z and 1915Z

Run fleshout-20261105T2115Z, Loop A, axis food-economy (adoption scope only — no new arms planned on any axis, per the 1715Z adoption precedent). Coordinator evidence. Merged locally pending ship.

## Stale-lock recovery (run start)

Lock read before deletion, per the closeout rule: `fleshout-20261105T1915Z`, created 2026-11-05T19:17:00Z — 119 minutes old at run start (21:16Z). Its tree `sim-awaynaming-cap-a` heartbeat 20:21:24Z, 55 minutes stale (>15-min guard). Both the heartbeat rule and the 90-min fallback agree: the 1915Z run is DEAD. Claim retired to `.DEAD`, lock deleted, this run's lock + claim written. Loop B free at run start (1830Z landed as ee0b2c2cf, claim deleted). Scale-onramp untouched.

## What the dead run left

- Arm sim-enddaybeats-a LANDED on master before the coordinator died (prereg ce65b233e, instrument d0da37085, evidence 739fc057f, corpus 5d8715e80). No tracker review entry was written — repaired below.
- Arm sim-awaynaming-cap-a STRANDED: 7 commits on branch, tip beb907166 ("pilot after leg ... GO"), plus uncommitted confirm corpus (23 files), full-31 compare outputs, and panel-compare outputs in the worktree. Pilot GO (8 seeds, corrected (ii-b)); confirm already run by the dead worker.

## The other hand (LOUD, and a lesson about heartbeats)

While this run's adoption worker was verifying the stranded branch, ANOTHER hand committed the remaining work on that same branch: 528d1f4f4 (confirm corpus + full-31 compare), 5b113fe3a (after-panel + panel compare + evidence file), 1822248f0 (post-rebase note), then 8c5bcf095 (rebase-base correction + 10-commit list). It also rebased the branch twice — first onto ee0b2c2cf, then onto 2d72f104a (journey-crisis r129, which landed on master mid-run).

That hand was evidently the supposedly-dead 1915Z worker, still alive after its coordinator timed out: the tree heartbeat measures the COORDINATOR, not the worker, so a stale heartbeat proves the coordinator is gone, not that the work stopped. The recovery was still correct (the coordinator was dead, the claim was dead, and the branch was adoptable precisely because the work was finished) — but the next closeout should expect a timed-out coordinator's worker to keep committing, and should verify the branch tip before assuming it is frozen.

Verification, done independently by this run's adoption worker (not taken on trust): the committed compare/panel JSONs are byte-identical to fresh regenerations from the corpora; the compare re-run exits 1 (NO-GO, as required); the panel compare re-run is byte-identical, decision review_required, exit 2 by design; proof tests re-run green on the rebased tip (scripts/test-awaynaming-cap-a.js 39/39, scripts/test-gossip-position-r141.js 34/34). The adoption worker made zero commits and zero edits to the branch. The judged corpora/compare outputs are unchanged by the rebases.

## Verdict: NO-GO (prereg-bound) — arm KILLED, nothing merged

Judged strictly against evidence/2026-11-05/sim-awaynaming-cap-a-prereg.md (incl. Correction 1). A miss is NO-GO, never re-scored. Exactly one miss: guardrail (i). Arm evidence: evidence/2026-11-05/sim-awaynaming-cap-a.md (on the abandoned branch, commit 5b113fe3a — NOT on master; this file is the permanent record).

| Check | Result |
|---|---|
| Primary — stranded sleep burst events, after | 0 in 17 windows (before: 0 in 17). PASS |
| Primary — stranded settle lines, after | 0 (before: 0). PASS |
| Guardrail (i) — non-stranded sleep burst rate | after 7.9% (140/1767) vs before 11.6% (205/1767). Δ −3.68pp, band ±3pp. FAIL (misses by 0.68pp) |
| Guardrail (ii-a) — ledger conservation | said + stillHeld == kicked, per kind, all 31 seeds. 0 lines lost. PASS |
| Guardrail (ii-b) — held-volume (corrected queue-snapshot method) | lost == 0 on all 16 away stretches. PASS |
| Guardrail (ii-c) — reconciliation | exact on all 31 seeds, all kinds. PASS |
| Guardrail (iii-a) — det-gate ON vs OFF | identical (17021, 15003). PASS |
| Guardrail (iii-b) — trajectory identity | 31/31 identical. PASS |
| Relay loss recovered | word 4 / debate 4 / settle 0 (17010: 3+3; 17020: 1+1); my-gate lost 0/0/0 |
| Wall size | 13 lines, seed 17010, return day 13 (stranded days 9–12; 4 word + 4 debate + 5 settle, all daily phase; queue 13→0). Next: 15221 day 37, 9 daily lines (7 held + 2 same-day); 17016 day 13, 7 lines |
| Panel (§15) | decision review_required, every metric delta exactly 0 (coverage-driven, not a signal) |

## Why (i) failed — verified from the data, not assumed

Totals said per kind, counted independently from both corpora: before 703 word / 703 debate / 689 settle (grand 2095); after 707 / 707 / 689 (grand 2103). The +4/+4 is exactly the relay's 8 dropped lines recovered; settle totals identical. Phase split proves the move: sleep-phase word/debate 205→140 (−65), daily-phase 10→99 (+89), harness 488→468 (−20); settle sleep 553→544, daily 0→9. The sleep-rate drop is a phase move (sleep→daily delivery on return) — the fix's intended behavior. The after leg says MORE lines in total. Nothing was silenced; the ledger (ii-a) proves exact conservation.

Sense verdict (from the arm evidence, checked against the quoted lines): delivered wording reads true — framing line does the work, each line is a distinct beast's news, settles close the loop — but the 13-line wall on 17010 day 13 is a catch-up dump (four identical-framed "Back at the haven the argument starts" openings in a row). Honest price of losing nothing; installments/summarizing stays a design follow-up.

## Metric review

Guardrail (i) as written compares a natural+flush sleep rate against a natural rate, so on the relay substrate it is a phase-shift meter, not a silencing meter: the before-leg sleep rate (11.6%) includes 65 relay-flushed lines that the after leg deliberately delivers in daily phase on return, while total lines said actually rose (2103 vs 2095) and the ledger proves exact conservation. The prereg's Correction 1 anticipated this (pilot Δ −2.9pp, "a narrow miss would be a metric-design finding for the review section, not a silencing signal") — and the full panel missed by 0.68pp. Proposed revision for the NEXT run: judge silencing by the ledger — said_after == kicked, exact, per kind per seed — and keep the sleep-phase rate as a descriptive phase-shift report (or, if a sleep-rate band is kept, calibrate it against the natural rate, i.e. before-leg sleep events minus the flush volume). Do NOT re-judge this corpus under the revised metric; the next run re-runs its own corpus under the corrected prereg. The verdict here stands NO-GO under the prereg as written.

## Disposition (kill protocol)

Per the gossipfix / ffhold / ffnoflee precedent, a killed game-code arm leaves no trace: the branch sim-awaynaming-cap-a is released done-abandoned, worktree removed, branch deleted. The game-code change (fix commit ee787f220 on the branch, "[needs-eyes] ... UNCAPPED queue", rebased from c1521dbd1) never lands on master — verified: no awaynaming-cap-a commit is an ancestor of master, and `git log master --grep=awaynaming-cap-a` is empty. The fix's routing change vs the r141 relay (burst/settle bypass the relay's stale-opening filter; tale/witness stay relayed) is therefore NOT live; the relay behavior stands. Branch commits preserved as objects: 40de227e9 (prereg), 068aeba35 (instrument), aa6c81f57 (before leg), ee787f220 (fix), d139176cc (before-panel), 6f1736c0d (Correction 1), d2119a0bf (pilot GO), 528d1f4f4 (confirm + compare NO-GO), 5b113fe3a (panel + arm evidence), 1822248f0 + 8c5bcf095 (rebase notes). Tip at release: 8c5bcf095, base 2d72f104a.

sim-findings.md updated: the awayNaming-cap item (line 1782) carries the NO-GO outcome; the parent gossip-burst item (line 1767) carries a pointer. The burst is still ungated; the defect stands.

## Tracker repairs (this run)

Two missing review entries repaired in the tracker update accompanying this evidence:

- 1215Z (run fleshout-20261105T1215Z, food-economy): banksnap-a GO-RETAINED 14/14 (instrument-only, no src/js; the 8 "vanished" bank-added meals were a measuring mistake — food eaten before the old snapshot; commit 6b516a7ea) + pantryspoil-a GO — LAND (lever a338a0875, [needs-eyes], pantry spoil line now states the unit count; rebased and merged by the 1415Z adoption run). No coordinator evidence file and no tracker entry existed; both arms' evidence files are on master.
- 1915Z (run fleshout-20261105T1915Z, food-economy): enddaybeats-a INSUFFICIENT-DATA (power bar missed by 3: 17 stranded sleep windows across 5 seeds, need >= 20; evidence 739fc057f, corpus 5d8715e80). Ungated beats reach a stranded scholar at or ABOVE background — fragments 14/17 (82.4%) vs 46.6% non-stranded, pantry day-voice 15/17 (88.2%) vs 55.7%, raid call 2/17 (11.8%) vs 6.2%, overhear 1/17 (5.9%) vs 0.8%. Relay-gated burst/settle/witness/tale 0/17 (r141 relay holds; the killer-tale scope note's "no position gate" is out of date). "Other" enumeration on the same 17 windows: inter-village raid lines 3/17, moot summons 1/17, fireside confrontation 1/17, direct-address fireside chatter. Fix direction: gate/re-voice at the endDay delivery channel in one family arm (the tale is the model); next arm must re-prereg a per-beat power bar and extend the band to clear >= 20 stranded sleep windows.

## Wall numbers (carried, NOT re-measured)

Narration corpus; records no scale outcomes. Carried state from the 1041Z round (0915Z run, 24 distinct seeds): wins 0/24, national 0/24, table 0/24, wave-5 0/24, readiness-5-ready days 0/24.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current '<awaynaming-corpus-glob>' --metrics national,table,wins,exiled`: 3 LOUD lines (national 12→0, table 16→0, wins 16→0; n=31 files). All REGIME artifacts — the WINSEAT baseline's own _regime note forbids comparing a pre-seat / competent-only narration census corpus against it (wins structurally ~0 there). Baseline NOT rolled, no investigation item. Same class as the 1955Z/2115Z/2215Z/2315Z/0015Z/0205Z LOUD lines.

## Infrastructure

- Pre-flight: main tree clean, disk 28%. Reaper: active 7/16, removed nothing sibling-owned; 6 LOUD dirty-tree lines, all correctly refused (incl. this run's adopted tree, whose untracked files the dead worker's hand then committed).
- Master moved once under the run (journey-crisis r129, 2d72f104a, zero overlap with this run's files).
- No EPERM flap observed this run; all writes clean. No safe-commit index clobber on the coordinator commit (to be confirmed at commit time — see commit note).
- check.js --quick NOT re-run: zero src/js on master from this run (the killed fix never landed); standing 284/6 profile recorded by the 1830Z run the same day.
- Registry note: REGISTRY.json lists 37 trees but only 9 worktrees exist — stale entries accumulate; the reaper's active count (7/16) is the live number.

## Next blanks, in order

1. (food-economy) Re-register guardrail (i) as ledger-based silencing (metric review above) and re-run the same 31 seeds under the corrected prereg — fresh corpus, do NOT re-judge this one. The fix is proven working; only the meter was wrong.
2. (food-economy) Catch-up wall design follow-up: split a large catch-up across the return evening and next morning, or a summarizing delivery, against the verbatim 13-line wall on the same 31 seeds.
3. (scale-onramp, Loop B queue, untouched) refind confirm on fresh seeds (policy-only, pilot GO 4a065f050).
4. (scale-onramp, carried) a lever on the wild death channel for first killers; re-screen sigoff/gearoff/trickoff on a fresh seed set; flee-repair game-code port — STEVE CALL on scope.
5. (food-economy, carried) endDay family fix: gate/re-voice at the endDay delivery channel in one family arm, with a per-beat power bar clearing >= 20 stranded sleep windows.

food-economy stays converging (NOT converged): the awayNaming fix is proven working but KILLED on its prereg — the defect stands until the re-registered run lands it; the endDay family fix is still owed. scale-onramp stays converging (untouched; sibling Loop B). Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
