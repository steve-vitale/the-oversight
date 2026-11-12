# sim-finalvoice-b — PRE-REGISTRATION (Loop B, 2026-11-11 18:30 CST run)

Arm: fix sim-findings #2252 + #2253 (r182 endgame voice).
Worktree: ~/workspace/worktrees/sim-finalvoice-b. Substrate: local master at
run start (aedf7f699; batch-ship bump c136d851d-20261111-232432).
No canon doc covers the refrain rotation or the war-path bar-read
suppression directly; the area canon is docs/TABLE.md (audit prices the
run aloud; a full seat has nothing missing) and docs/SYSTEM-VOICE.md
(System voice bible). No new canon invented.

## Findings (sim-findings.md, 2026-11-11, r182 endgame)
- #2252 HELD-ITEM REFRAIN REPEATS VERBATIM: "Your gifts are not mastered
  — but they are lived-in, and they are with you. The feast was the weapon."
  prints after EVERY held item, 3-4x per finale transcript.
- #2253 WAR-PATH WAVE-5-BAR LINE ON FULL SEATS: the war-path "Even now the
  wave-5 bar reads: blood your fighters (1 of 2 veterans)" line prints on
  full-seat audits too (89702 pass B), where the seat is already priced.

## Fix design (voicing only — no gate, price, deed, or readiness change)
- #2252 (src/js/progression.js, channelSentiment): rotate the arming
  refrain's closing clause through 4 deterministic variants keyed by a
  per-run arming counter on progState (no RNG — same house shape as the
  spoil-mutter rotation, test-main67 A-2). First arming keeps the canonical
  line verbatim; later armings vary the tail. Both lanes vary:
  devotion keeps the test-bound core "Your gifts are not mastered — but
  they are lived-in" on every item (test-main67 A-1 requires it per item,
  plus FEASTED terms); mastery keeps "The feast was the weapon" (A-1b).
  The full sentence never repeats verbatim twice in a row.
- #2253 (src/js/table.js, tableDeedRecords/tableDeedLines): the audit's
  already-computed seat is passed in by tableScene; when it is a full
  seat, the readiness-bar bits are suppressed (the war record — kills,
  engagements, titans — still voices). Bare calls with no seat keep the
  legacy bar voicing. tableDeedRecords stays a pure render: it does NOT
  call tableSeat() itself (deedState() would CREATE pg.deeds — a state
  write; see the existing purity comment in the engagements block).

## Primary metric + GO thresholds (judge the run against these)
On a finale transcript (fresh short finale probe, scripts/test-finalvoice-20261111.js —
fixture-driven: 4 keepsakes channeled in devotion + mastery lanes; full-seat
audit fixture with an unready wave-5 bar):
(a) the held-item refrain's FULL sentence prints verbatim at most 1x per
    finale transcript (varied lines allowed);
(b) the war-path wave-5-bar line is absent from priced-full-seat audits
    (bars still present on lesser/none seats with unready bars);
(c) existing endgame tests green with no regressions attributable to this
    change: scripts/godpath/test-main67-beat-identity.js,
    scripts/test-tabledeed-20261021.js, scripts/test-warpath-twice-20261023.js,
    scripts/test-feast-tooltip-once-r162.js, node scripts/check.js --quick.
GO = (a) AND (b) AND (c). A miss is NO-GO, never re-scored mid-run.

## Horizon / seeds / policies
- Fixture probe: deterministic, no sim seeds consumed (loadGame seed 7 /
  424242 fixtures, same as the existing beat-identity / tabledeed tests).
- Sim smoke band (scale-wall numbers only; the change is voicing-only, so
  no before/after panel is owed — the panel would measure noise):
  probe-endgame-r182-20261111.js, pass-A config (no CAPSTONE/BUYOUT),
  120d, 4 FRESH seeds: 89901, 89902, 89903, 89904.
  EVIDDIR evidence/2026-11-11/perseed-finalvoice-b.
- Seed-band freshness: grep of evidence/*/sim-*-prereg.md + journey-endgame
  preregs for 89801-89804 before the band runs (see below); a named band
  is used even with no corpus behind it.

## Seed-band freshness check (2026-11-11, before the smoke band)
- Searched: `grep -rn "8980[1-4]" evidence/*/sim-*-prereg.md
  evidence/2026-11-11/journey-endgame-r182-prereg.md
  evidence/2026-11-11/journey-endgame-r178-prereg.md` plus the r182/r178
  probe scripts' PLAN maps (89701-89713 used there).
- Result: COLLISION — 89801-89808 were used by sim-togrescreen-b
  (evidence/2026-11-04/sim-togrescreen-b-prereg.md:44,69-71). Band moved
  to 89901-89904; re-searched (`grep -rn "8990[1-4]" evidence/
  --include="*prereg.md"` + probe-endgame-r182 script): NO HITS.
  Band 89901-89904 is FRESH as of 2026-11-11 18:40 CST.

## DESIGN REVISION (2026-11-11 ~19:35 CST, before landing — recorded here,
## GO thresholds unchanged)
First implementation was a pure 4-way rotation. The live smoke band
showed why that is not enough: on the r182 transcripts the refrain fired
27–60x per announce-sliced finale (100% verbatim); rotation cuts the
verbatim share to ~25% but the canonical line still recurs every 4th
arming (89902: 31 verbatim in 126; 89904: 57 in 225) — on a multi-day
finale slice the GO "at most 1x per finale transcript" would still fail.
Revised to rotation + CAP: each lane's canonical closing prints once per
run; later armings rotate the other three variants. The first hearing
stays the canonical line; afterwards the gifts answer back differently.
The fixture probe (V1/V2) is unchanged in shape — it still expects the
full sentence at most 1x across 4 armings, now exactly 1x. The smoke
band is re-run on the capped code.

## Scale-wall numbers (reported every run)
national / table / wins, wave 4-5 unlocks, median survival — from the
smoke band's per-seed JSON (seat, won, unlockedWave, satDay, alive).

## Metric review
(To be filled after the run: did the metric judge the right thing?)
