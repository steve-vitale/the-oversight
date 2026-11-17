# Journey endgame r233 — Lane B, leg 4 (2026-11-17)

Leg 4 (endgame). Rotation-b read 4 at run start (succession r230 landed,
rotation 7→4). Substrate: master `7328a88fa` EXACTLY (worktree HEAD at run
start). No fix arm pre-filed. Probe: `scripts/probe-endgame-r233-20261117.js`
(r230 probe verbatim except renames, evidence dir, PLAN-map 89760–89767).
Analyzer: `scripts/analyze-endgame-r233-20261117.js` (r230 analyzer verbatim
except input dir, r230→r233). Pass B skipped by design (r230 pass B vacuous
NO-GO; the converting road is pass C). Dark probe skipped (no delta since
r211 touched the dark table). COMPETENT_PIN=r127 support in tree. No
A-frozen arm. M2b GREEN from r182, carried.

## Head deltas since r230 substrate (verified by git log + git diff)
(a) COMPANIONGUARD SHIPPED UNCONDITIONAL (sim-companionguard-b,
villager-agency.js + villager-brain.js): a companion call no longer
overwrites a villager's live expedition (skips them, burns no gear or
care, counter companionGuardSkips); the plan record lists only villagers
whose expedition actually exists after the call. LIVE in the browser and
in this panel. Bears DIRECTLY on party launches and therefore on wave-4
kills — the first game-code delta since r230 that can move the
winnability chain. Attribution first for any launch/kill headline
difference.
(b) Dialogue quality; RNG-draw shifting possible: F1 settled-ledger fix
(r231 establishment), C3d recap-live-want fix (r231 social), dlg:help
stage-0 offer (r230 establishment). All three bear on the F5
settled-favor question and the C3d watch.
(c) All other sim arms since r230 were ADDED then REVERTED or are
instrument / evidence only — net zero in game code. (d) Version bumps
only. No table/ladder/waves/monster change.

## Adoption note (this run was adopted in the main session)
The 04:00 CST coordinator timed out at 3600s after Pass A-live + the
companionGuard re-run launch. At adoption (05:00 CST): lock
`oversight-playtest-loop-2-20261117T095546Z` present, registry heartbeat
10:45:41Z (12 min old, hbloop pid 48130 GONE, re-run pid 57054 GONE, no
worker processes in the tree) — dead by the orphan test. Heartbeated the
tree myself immediately, then adopted. The re-run had been killed by the
04:53Z write-flap (FATAL EPERM writing 89704's JSON — 0 bytes on disk);
I completed it for seeds 89704–89706 (exit 0). Pass C-live + C-wide,
telemetry, gate, and this note were all run by the adoption. Master
moved twice during the adoption (deepening r232 `34bcb7b0b` → planignite
PILOT GO `9be3676d8` → ship bump `e390dff60`); the branch was rebased
onto `e390dff60` before landing.

## Pass A-live (CAPSTONE unset, BUYOUT unset) — PRIMARY GO | ALL GO
Matched re-run vs r230 pass A. Outdir `perseed-endgame-r233/` (re-run
output; v1 backed up at `perseed-endgame-r233-a-v1/`).

Per-seed (r230 pass-A baseline in parens):
- 89701 waves: ann90/sat91/lesser/feared/light, won, uw 5, w5max 2,
  FACED wave 5 (editor d81, timeslot d90), peakVet 2, standing peak 430,
  releaseSnap d79 ready (2 living veterans), ladder c55.
  (r230: sat d105, lesser, w5max 0, peakVet 1, uw 4, standing 199.)
- 89702 waves: ann90/sat90/lesser/feared/light, won, uw 4, w5max 0,
  peakVet 1, standing 199. (r230: FACED W5 w5max 4, uw 5, peakVet 2,
  standing 617, gate ok d65.)
- 89703 waves: ann90/sat90/lesser/beloved/light, won, uw 4, w5max 0,
  peakVet 1, standing 199. (r230: sat d102, lesser, w5max 0, peakVet 0.)
- 89704 forcedrift: ann90/sat90/lesser/relay/dark, won, uw 5, w5max 0,
  peakVet 2, standing 292, relay noticed 1 / crossed 1.
  (r230: FACED W5 w5max 1, uw 5, peakVet 2, standing 496; gate never ok.)
- 89705 wavesnw: ann90/sat99/lesser/beloved/light, won, uw 4, w5max 0,
  peakVet 0, standing 199. (r230: VILLAGE LOST d59.)
- 89706 wavesnw (smoke): ann90/sat100/lesser/beloved/light, won, uw 4.

Tally: lesser 6/6, full 0, lost 0/6. (r230: lesser 4/5, full 0/5,
lost 1/5.) M23b GATE-OK TALLY: 0/6 — no seed reached
deedGateReady().ok (r230 pass A: 1/5, 89702@d65). Note the split:
89701 faced wave 5 and released (rd5 ready d79) while its deed gate
never went ok (scale rank regional, not national) — the readiness
release opens wave 5; the deed gate needs more.
M1-guard 6/6, M2-census 3/3, M2c engine coverage 5/5, M2d gate-named
33/33, CORPUS-PURITY 6/6, M2b attribution, M8 exit canon, MFLEE routed
coverage 10/10, M3b peak, M4 wave5-or-full 1/5 (89701 OPEN), M13
release snapshot, M14 invite classification 5/5, M5 voicing, M6
guard-named-deferred 3/3, M10 fullseat-gap, M11 standing-peak (4 at
199, 1 at 430), M12 bar record, M15 feast census, M16 dusk census,
M17 surge mode, KILL-ANATOMY 48/48, M18 ghost-scan clean, M19
grant-log, M20 standing-trace (mech199 true everywhere), M21 audit
crosscheck, M22 feast-hold, REG-r35/r37, VETCONV, SECOND-VETERAN
coverage, FIRENARR/HURTRETURN captured, FALLEN-ambush, V-WAITVARIETY,
L-PEAK, M9 supply: 106 blocked arrivals (w4=50, w5=0, other/unmapped=56).

Headline differences vs r230 pass A (attribution first to deltas (a)+(b)):
wave-5 facing rotates — 89702 and 89704 lose it, 89701 gains it (a
matched seed unlocking wave 5 where r230 had uw 4); 89705 survives
(was lost d59); 89704's relay crosses (noticed 1, cross 1). No full
seat on pass A either round. The guard's own skip counts (Q7, below)
are small (9 total), so the rotation reads as a trajectory re-roll
from the dialogue deltas' RNG-draw shift plus the guard's launch
shaping — not a guard-driven kill swing. No same-run investigation
item rises to a road claim.

## Q7 COMPANIONGUARD watch (probe-side instrument, zero src/js)
`companionGuard` read-only end-of-run sample added to the probe
(`scripts/probe-endgame-r233-20261117.js` +7 lines, uncommitted at
adoption, committed with this run): `{skips, medicDutyBlocked}`.
Per seed: 89701 skips 0 / medic 34; 89702 skips 4 / medic 26; 89703
skips 0 / medic 35; 89704 skips 0 / medic 49; 89705 skips 5 / medic 53;
89706 skips 0 / medic 22. Totals: skips 9, medicDutyBlocked 219.
The guard itself rarely skips on this panel; medic-duty blocking is
the dominant companion-call blocker (219 calls). No plan record listed
a companion whose expedition never existed (the mirror gap stays
closed). Launches still form pairs/trios: vetFights 48/38/38/0/13/15
(pass A), party sizes 4–8 in the kill anatomy.
TRAJECTORY-NEUTRALITY (re-run vs v1, all 6 seeds): 89701–89705 all 82
common fields byte-identical; 89706 differs ONLY in `days` (120→180 —
the v1 file is the smoke run at DAYS=120, the re-run ran it at the
normal DAYS=180; every other field identical, so the trajectory is
identical through the longer horizon too). The instrument is neutral.

## Pass C-live (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY GO | ALL GO
Matched to r230 pass C. Outdir `perseed-endgame-r233-c/`.

- **89703 takes the FULL SEAT d90** (feast_embassy delivered d89, gate
  ok d89, pricedFull 1/1). The buy-out road converts again — on a NEW
  seed (r230's converter was 89704). 89703: ann90/sat90/full/beloved/
  light, uw 5, w5max 2, vetLiving 3, ladder c77, cap feast_embassy.
  No starvation deaths on the bought seed.
- 89702: lesser, uw 5, w5max 1 (faced wave 5 on pass C), vetLiving 3.
- 89705: lesser, uw 5, vetLiving 3. (Pass A had it uw 4.)
- 89701: lesser, uw 4, relay noticed 1 / cross 0. 89704: lesser, uw 4,
  relay noticed 1 / crossed 1. 89706: lesser, uw 4.
- M23b GATE-OK TALLY: 1/6 — 89703@d89/DELIVERED (r230 pass C: 1/5).
  M23-capstone: 1 eligible, delivered 1/1, pricedFull 1/1.
  M24 tribute: vacuous. M24b: vacuous.
- M25c-buyout-early: 6 bought — 89701 d41, 89702 d18, 89703 d41,
  89704 d38 (after 2 refused attempts d35/d36), 89705 d17, 89706 d30.
  0 skipped. (r230: 5/5 bought early.)
- ROAD-TALLY: full-seats earned 1, sat 1. No second full seat (Q3: no).
- Starvation watch (Q9): 89704 Nikos d24 — BEFORE the buy (d38), not
  buy-caused. No bought seed starved anyone after its purchase.

## Pass C-wide (STRETCH, fresh 89760–89767) — WIDE-VERDICT GO
Same CAPSTONE/BUYOUT env on 8 fresh seeds (band verified unused across
all journey + sim preregs). Outdir `perseed-endgame-r233-cwide/`.
- Lesser 8/8, full 0/8, wave 5 faced 0/8 (w5faces=0, w5:0 every seed).
  Q4 answered: the r230 finding holds (r230 C-wide: 1/8 faced, 0/8
  full; r233: 0/8 faced, 0/8 full).
- M25c: 8/8 bought (89760 d39, 89761 d90, 89762 d72 after 5 refusals,
  89763 d72, 89764 d39, 89765 d42, 89766 d44, 89767 d48). 0 skipped.
- Binding constraint everywhere: w5 (worst='w5' on all 8); holdKind
  defer5 on 5/8, below-bar on 2/8 (89761, 89766). rd5short: veterans
  on all 8 (plus weapons/armor on some). Peak veterans 0–2.
- Starvation: 89761 three deaths (Andiswa d30, Sari d33, Ava d34 —
  all before the d90 buy); 89762 two (Renee Scholz d11 pre-buy,
  Frieda Zamora d77 post-buy, but pantry 6,950 after the buy — not
  buy-caused). No other seed starved anyone.

## People check (transcripts, SENSE-TESTING LAW)
Read 89701 pass-A transcript in full (205 SAY lines) + greps across all
three passes' transcripts.
- 89701 reads like people: Afnan's pantry-run promise rots ("You said
  you'd help with the pantry run — and it never happened. Promises
  rot." −15 trust); Guadalupe waits at Haven this dawn for the pantry
  run; Afnan by the fire: "It eats while we deliberate. The Herald
  feeds on our stores and we're supposed to just... wait?"; Onni's
  parcel note ("That has Wren written all over it"). Consequences land
  (missed promise → trust loss, voiced). No robotic loops in the sample.
- Dry line ("…Sorry, lost my train of thought."): 0 hits across all
  three passes' transcripts.
- F5 settled-favor (Q5): VACUOUS on this panel — every "settled" hit is
  beast-naming ("It's settled. The village is calling it 'Big Loud.'").
  The branch stays reachable only on the succession leg (r230: fired 2×).
- C3d recap-live-want (Q6): VACUOUS — the endgame probe's transcripts
  carry no recap sittings at all (0 "Nothing important" recaps, 0 recap
  lines). The fix's live-want path never got a sitting here; the watch
  stays open for a panel with recap sittings (social leg).
- Funeral-mend (Q10): FIRED + voiced on C-wide — "Brooklyn's funeral
  feast: 7,500 kcal from the pantry, and every shaken fire is fed…
  (Trust mended — the −8 bought back with grain.)" No funeral-mend
  event on pass A or pass C this round.

## Village assessment (plain words)
Six matched villages, all alive at the table. Every one of them earned
the lesser seat; one (89703, on the buy-out road) took the full seat.
Wave 5 is the wall: only two matched seeds faced it on any pass, and
the eight fresh villages never even saw it — they all stall on veterans
(the readiness bar wants two living wave-4 veterans, and most villages
have zero or one). The villages that do face wave 5 get there by
banking veterans early (89701 released d79 with two living veterans).
Food is not the binding constraint on this leg — pantries run 10–40k
and feasts fire — but the buy-out road still asks a village to spend
~8,000 kcal while its people are hungry, and on the fresh band two
villages buried people to hunger before they ever bought. The table
itself works: it announces, it offers, it stays offered, and when a
village is ready it delivers. Reachable: yes, via the buy-out road.
Fun: the villages feel alive — promises rot, the Herald eats your
stores while you argue. Winnable: one full seat per matched panel, two
rounds running, both via buy-out — the war path (wave-5 kills → deed
gate → full seat) still has no full seat on this leg.

## Metric review (§14)
- M23b tally this run: pass A 0/6 (r230: 1/5), pass C 1/6 (r230: 1/5),
  C-wide n/a (wide verdict covers M25c + purity + starvation only).
  The pass-A 0/6 is not a binding miss (M23b is a tally, not a
  verdict) — but the split it exposes (wave-5 facing without deed-gate
  ok) is worth naming: readiness release and deed-gate readiness are
  different bars, and only the second prices the full seat.
- M25c buyout-early: HOLD — GO 6/6 matched, 8/8 fresh.
- CORPUS-PURITY: HOLD — GO on every pass.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held; 89762's five
  refused buy attempts on C-wide are the window working, not an
  over-attempt — each refusal is a distinct day, pantry-gated).
- Telemetry baseline: r188 baseline stands. Pass-A check QUIET (6
  files, 4 metrics, no large deviations). Baseline NOT rolled.

## Gate + telemetry
- `node scripts/check.js --quick` in the worktree: **329 passed,
  11 failed in 1515s, 0 attributable.** Failures: 5 standing
  (measurement-proof staleness pair, occupation-panels, phone-frame
  stale receipt, ladder-bundle) + 6 known load artifacts (exact 120s
  timeouts: living-garden, one-person-army, trust-observer-neutrality,
  synergy-stall, capable-bot; cache-flags 0/4 box-load). This run
  changed no src/js — probe instrumentation only — so nothing in the
  gate can be this run's.
- Telemetry: QUIET (see metric review). Baseline NOT rolled.

## Closeout
- Evidence committed via safe-commit.sh (probe instrumentation + all
  logs, analyzers, perseed corpora, this note, gate log).
- Rebased onto master `ed55adddd` (wideduty adoption deltas, landed
  mid-adoption; deathcleanup-b `1e74e1078` + ship bump `e390dff60`
  below it); all three analyzer verdicts re-run on the rebased tip
  `13eb08ac8` and reproduced exactly; ff-merged as `13eb08ac8`
  (66 files, +405,679).
- Worktree released, branch deleted, lock deleted (run_id verified
  `oversight-playtest-loop-2-20261117T095546Z`).
- Rotation-b: 4 → 5 (social life next).
- Merged locally, pending ship.
