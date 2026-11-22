# sim-gunlife-a — TRACE ONE GRANTED GUN'S LIFE (finding #2667)

- Arm: sim-gunlife-a, Loop A run fleshout-20261122T0815Z, DIAG/trace arm (no lever, no contrast leg).
- Axis: scale-onramp · Finding #2667 (CONTEST GUNS NEVER FIRE EITHER).
- Base: worktree HEAD `01ff4956f` at band time (prereg `622a0ff20` +
  tracer + proof test `01ff4956f`); branch `sim-gunlife-a`. REBASED
  before the judged band onto master `1417fb148` (crossvoice merge) —
  see §6; no judged run before the rebase. No game-code change in
  this arm.
- Prereg: `evidence/2026-11-22/sim-gunlife-a-prereg.md` (content frozen
  ~04:30 UTC, committed `622a0ff20` — rebased hash of `f0635aa1a` —
  before any judged run).
- Instrument: `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from the
  killloot16 arm; new tracer `scripts/analyze-gunlife-a.js` + proof
  test `scripts/test-gunlife-a.js` (see §6 for the tracer fix).
- Horizon: 150d death-aware. Seeds: 107321–107328 (8, fresh — zero hits
  in the prereg/evidence grep). Policy: competent (verbatim). Single
  ctl leg (KILLBUNDLE unset — this arm traces the gun, not the bundle).
  Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## Verdict: GO — the trace names why contest guns never fire, on 7 of 8 grants

The mechanism is the lead gate, not the ammo and not the hold. A
searcaster fires only when its holder LEADS a wave-4+ fight with the
gun equipped and cells on hand. On this band, 4 of 8 grant-traces are
`equipped-never-led-wave4+`: the holder carries the gun equipped for
29–65 days with cells and never leads a wave-4+ fight while holding
it. Two more traces share the band's single fired volley (one gun,
two grants, 2 shots, 1 hit, 68 damage — §3), one grant arrived on
the last day and never got equipped, and one gun vanished off its
holder's corpse with no event (the single untraced grant — the
tracer names the vanish but its rows don't tile past it, §6). The
CELLGATE hold is visible and working as designed — 12 held volleys
below wave 4 — but it is not the mechanism: holders DO lead fights
below wave 4 with the gun held. They just never lead a wave-4+
fight while holding it. The next question is one level up: why the
gun's holder is never the one leading the wave-4+ fights — party
formation, not the gun.

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (killlootbundle proof 12/12 + analyzer selftest 17/17; gunlife proof test 100% + tracer selftest 100%; 0 instrument errors on all 8 files) | all must hold | proof 12/12, selftest 17/17, test-gunlife-a 11/11, tracer selftest 25/25, all re-run on the rebased base before the band; 0 errors on 8/8 seed files | ✅ |
| 2. Grant coverage (100% of contest searcaster grants traced; 0 unclassified sources; total arrivals counted) | all must hold | 8/8 grants appear as traces; 0 grant-event mismatches on all 8 seeds; total arrivals 8 (8 contest + 0 kill-loot searcasters) | ✅ |
| 3. GO (≥ 80% of grants traced to a named mechanism with per-grant dated rows, AND the mechanism behind 0 volleys named) | all must hold for GO | 7/8 traced (87.5%); mechanism counts: equipped-never-led-wave4+ 4, fired 2, never-equipped 1, unexplained-vanish 1; the 0-volley mechanism named (§3) | ✅ |
| 4. NO-GO rule (> 20% unattributed, or recorder blind) | frozen | 1/8 unattributed (the vanish — mechanism named, rows incomplete, §6); recorder sees holder/equip/fight state on 7/8 | ✅ (no NO-GO) |

Zero-grant rule not triggered: 8 grants arrived (killloot16 rate
~15/16 seeds predicted ~7).

## 1. Per-seed table (analyzer + leg logs)

| Seed | Days | End | Wave | Standing | Grants | Kill-loot sear | Sear volleys | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107321 | 150 | survived | 4 | 199 | 3 | 0 | 0 | 105 |
| 107322 | 150 | survived | 4 | 199 | 0 | 0 | 0 | 86 |
| 107323 | 150 | survived | 5 | 665 | 4 | 0 | 1 | 173 |
| 107324 | 131 | village-lost | 5 | 425 | 0 | 0 | 0 | 109 |
| 107325 | 150 | survived | 4 | 199 | 0 | 0 | 0 | 101 |
| 107326 | 150 | survived | 5 | 495 | 1 | 0 | 0 | 90 |
| 107327 | 108 | village-lost | 4 | 199 | 0 | 0 | 0 | 163 |
| 107328 | 150 | village-lost | 5 | 375 | 0 | 0 | 0 | 94 |

Totals: 8 grants, 0 kill-loot searcasters, 1 searcaster volley (2
shots, 1 hit, 68 damage), 921 deaths, 2 starvation deaths, 0
instrument errors. (Analyzer `days` reads 151 on survived seeds vs
the driver's 150; same 1-day quirk as killloot16/killrate. No bar
turns on it.) Grants are thin and lumpy: 5 of 8 seeds saw zero
grants; seed 107323 alone carried half the band's grants (4).

## 2. Per-grant life table (the judged deliverable)

| Grant | Day | Holder | Mechanism | Eq days (w/ cells) | W4+ fights led | Volley attempts (fired/held/dry) | Holder death | Final disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s107321-seq4 | 74 | gen_wog0qul | equipped-never-led-wave4+ | 29 (27) | 0 | 0 / 1 / 0 | d104 | corpse (dead holder) |
| s107321-seq18 | 113 | sigrun_eiriksdottir | equipped-never-led-wave4+ | 37 (37) | 0 | 0 / 9 / 0 | — | equipped, cells 4 |
| s107321-seq22 | 144 | sigrun_eiriksdottir | equipped-never-led-wave4+ | 37 (37) | 0 | 0 / 9 / 0 | — | equipped, cells 4 |
| s107323-seq17 | 72 | gen_c0j2d8m | unexplained-vanish | 0 (0) | 0 | 0 / 0 / 0 | d72 | vanished-from-census |
| s107323-seq18 | 72 | chen_wei | fired | 37 (21) | 5 | 1 / 2 / 4 | d116 | corpse (hannah_kim) |
| s107323-seq25 | 102 | hannah_kim | fired | 8 (0) | 5 | 1 / 0 / 4 | d111 | corpse (hannah_kim) |
| s107323-seq37 | 150 | yuki_mori | never-equipped | 0 (0) | 0 | 0 / 0 / 0 | — | carried |
| s107326-seq16 | 85 | gen_joga8nx | equipped-never-led-wave4+ | 65 (65) | 0 | 0 / 0 / 0 | — | equipped, cells 2 |

Notes on the table: seq18 + seq22 (sigrun) are one shared stock —
two grants to the same holder, one traced life, counted twice by
design (prereg §6). seq18 + seq25 (chen_wei / hannah_kim) share
ONE physical volley — the gun changed hands twice before firing
(§3); both traces count it because the trace follows the gun
across holders. The `fired` rows' 5 wave-4+ fights are the same 5
fights seen from the two grants' windows. The vanish grant's rows
are incomplete (§6) — its mechanism is named but it does not count
as traced.

## 3. The mechanism — why 0 volleys (nearly) happen

**The lead gate.** The opening volley belongs to the LEAD fighter's
own ranged kit only — allies get no volley. A gun fires only when
its holder leads a wave-4+ fight with the gun equipped and cells on
hand. Four of eight traces never clear the first of those three
gates:

- **sigrun_eiriksdottir (107321, two grants, one stock):** equipped
  37 straight days with cells (2, then 4 after the second grant),
  led 9 fights — every one below wave 4, every volley CELLGATE-held
  (3 on day 122, 3 on day 131, 3 on day 144, all wave 1–2). She
  fights; she just never leads a wave-4+ fight. Still equipped at
  the horizon with 4 cells.
- **gen_wog0qul (107321):** equipped 29 days (27 with cells), led
  exactly one fight in that time — day 96 vs a wave-2 union_rep,
  CELLGATE-held. Transferred to the scholar day 102 (unattributed —
  no event logs the move), died day 104, the gun came back to his
  corpse the same day and sat there to the horizon.
- **gen_joga8nx (107326):** equipped 65 straight days with cells
  and led NO fight at all — not below wave 4, not anywhere. The gun
  is worn and never pointed at anything.

**The CELLGATE hold is exonerated.** 12 held volleys on this band
(9 sigrun + 1 gen_wog0qul + 2 chen_wei), all below wave 4, all with
ammo left. The hold fires exactly as designed — it holds the gun
below wave 4. It cannot be the reason no wave-4+ volley happens,
because the holders who never fire also never reach a wave-4+ lead:
the hold is never even asked the wave-4 question.

**The one gun that did fire.** Chen_wei won an exchange contest on
day 72, equipped the gun 21 days with cells, led 2 wave-1 fights
(both CELLGATE-held). Day 94 the gun moved to the scholar
(unattributed transfer — no event), day 102 to hannah_kim
(unattributed again). Hannah had won her own gauntlet the same day
(seq25) — two grants converging on one holder on one day. She
equipped the gun day 103 and led a wave-4 fight against an Eater
the same day: 2 shots, 1 hit, 68 damage, both cells spent. Then 4
more wave-4/5 gun fights (days 103, 108, 109, 111) — all dry, 0
shots, 0 ammo. She died day 111, the gun on her corpse. This is the
killrate shape exactly: a contest gun fires once, spends its 2
cells, and is a paperweight for the rest of its life — except here
the firing took two transfers and 31 days to arrive at, and the
holder who fired it wasn't the one who won it.

**The vanish.** gen_c0j2d8m won an exchange on day 72 and died the
same day. The gun sat on his corpse 33 days (days 72–104), then
the world total fell 2 → 1 with no event on day 105 — the gun left
the census. The named hypothesis is the corpse cap (40 corpses,
oldest stage-4 culled items-and-all; corpsecap-a measured the same
shape): the corpse was 33 days old when the gun vanished. Not
asserted — the census carries no cull event — but it is the only
in-model cause that removes a corpse gun silently. The tracer names
the vanish; its rows don't tile past it (§6).

**The horizon artifact.** yuki_mori won a duel on day 150, the
last day. Carried, never equipped, run over. `never-equipped` is
the honest label for a grant with no days to live in.

**What this does NOT answer.** Why the gun's holder is never the
one leading wave-4+ fights. The trace stops at the gun's level:
holders lead below-wave-4 fights (sigrun 9, chen 2, gen_wog0qul 1)
or no fights (gen_joga8nx 0), and the wave-4+ leads go to someone
else — the launch parties' lead selection, not the gun. That is the
next arm's question, not this one's: the mechanism behind 0
volleys is named, and it lives one level up from the gun.

## 4. Wall numbers

| Metric | This band (8 seeds) |
| --- | --- |
| Wins | 0/8 |
| National | 0/8 |
| Table | not instrumented by this driver (recorded, never faked) |
| Wave 5 unlocks | 4/8 |
| Wave 4 unlocks | 8/8 |
| Median survival | 150d (analyzer gameDays; driver-days median 150d) |
| Max survival | 150d |
| Villages lost | 3/8 |

The scale wall still binds — regional is the ceiling on all 8 seeds
(standing 199–665), no national, no wins — but the wall is not this
arm's question; the numbers are reported because the standing
directive requires them every run.

## 5. Sense-test — Hannah's gun, read from the record

No transcript lines are captured by this driver (same as killrate) —
the sense-test reads the volley and fight records, and the
narration templates the merged code pins. Hannah Kim wins a
gauntlet on day 102 and takes a searcaster with 2 cells. The next
day she leads a wave-4 fight against an Eater and the gun finally
goes off: the fight opens at range with 2 shots, one lands for 68
damage, and the gun is dry. She leads four more wave-4 and wave-5
fights over the next eight days — an Eater, a spoiler, a
cancellation — and every time the trigger clicks on nothing. She
dies on day 111, the day of the last dry fight, and the gun stays
on her corpse to the horizon. It reads as a person carrying a gun:
one real shot, then a paperweight she keeps carrying into fights
that need it. The same record also shows the other side of the
coin: Sigrun carries a loaded gun for 37 days, leads nine fights,
and the gun never speaks once — not because it is broken, but
because every fight she leads is below the wave the gun is allowed
to open on.

## 6. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof 12/12, selftest 17/17,
  `test-gunlife-a.js` 11/11, tracer selftest 25/25 — all re-run on
  the rebased base `1417fb148` before the judged band. Green.
- **Rebase before the band (adoption, master moved).** The prereg
  base was `67a87d1b5`; master moved to `1417fb148` before any
  judged run, so the branch rebased (1/1 clean, no quirk). Scope
  verified: the range touches the gunlife arm's files nowhere
  except `src/js/fieldFights.js` (the crossvoice narration fix —
  log strings only; `rec.volley` structure, shots, ammo spend, hit
  chance and damage untouched, verified by reading the diff), plus
  killrate/crossvoice/r249/r266 evidence and scripts. The
  killlootbundle driver/analyzer/test scripts are untouched. The
  judged band's trajectories therefore cannot differ on the new
  base — the band ran on the rebased tip (`01ff4956f`, anchor on
  all 8 files).
- **Tracer fix before the band (adoption).** The worker's handoff
  named a `prevHolderState` clobber in `scripts/analyze-gunlife-a.js`
  and the selftest failed 19/20 on it. The fix, in the `st`-branch
  transfer path: after a transfer, the previous-day state is now
  the NEW holder's state (`nst.count`), not the old holder's
  (`st.count`) — the old code masked a follow-on transfer whenever
  the counts differed. A degenerate-range guard was added to the
  same block (never push a `{from: day, to: day-1}` state). The
  selftest's fixture-6 expectation was also corrected: equipped
  days are 3, not 4 (bob equipped day 4 + scholar days 5–6; day 3
  is carried — the worker miscounted). A regression fixture
  (fixture 8: two-gun stock, transfer to an already-armed holder,
  then a second transfer the next day) proves the fix: the old code
  fails it (2 checks), the fixed code passes all 25. The proof test
  `scripts/test-gunlife-a.js` (11/11) was written by the adoption
  as prereg bar 1 requires. All committed as `01ff4956f` before the
  band.
- **Leg-2 launch failure (NOT judged).** The first launch's second
  leg ran from `/home/hatch` (the `cd` had applied to the
  backgrounded first leg's subshell only) and died instantly with
  `MODULE_NOT_FOUND`. It was relaunched from the worktree with an
  explicit subshell `cd`; leg 1 was unaffected and no judged
  numbers came from the failed launch. Both legs then ran to
  completion, exit 0, ~4 minutes total (prereg estimate ~20 min).
- **Vanish tiling gap (instrument, pre-existing).** The vanish
  path does not close the state tiling: after the day-105 vanish,
  the trace has no state for days 105–150, so `rowsComplete` is
  false and the grant counts as untraced even though its mechanism
  is named. The selftest's fixture 7 has the same shape (vanish on
  the last day, rows incomplete) but never asserted `rowsComplete`,
  so the gap passed the frozen selftest. The instrument was NOT
  changed after the judged band — the verdict passes at 7/8
  regardless — but a future arm should fix the tracer (terminal
  `vanished` state range) and re-run the analysis on this same
  corpus: the analysis is deterministic on the corpus, no new band
  needed.
- **RUN / OUTDIR:** `RUN=killlootbundle-a` unchanged (analyzer
  hardcodes it); fresh OUTDIR `perseed-gunlife-a-ctl`. Driver
  hardcodes `evidence/2026-11-21/<OUTDIR>` — corpus under
  2026-11-21, evidence under 2026-11-22. Recorded, not moved.
- **Band launch (judged):** 2 detached processes, 4 seeds each,
  both exit 0; 8/8 files landed on disk, anchor `01ff4956f` on all
  8. Heartbeat re-established after the restart.
- **Index clobber (known class).** After the instrument commit the
  main index showed the two committed files staged-as-deleted;
  repaired with the `git ls-tree -r HEAD -- scripts/ |
  git update-index --add --index-info` pipe, verified empty status
  + empty diff HEAD + hash-object match.

## 7. Findings (for the coordinator to append to sim-findings.md)

- [answered] 2026-11-22 — items / supply — CONTEST GUNS NEVER FIRE
  EITHER (finding #2667): ANSWERED by sim-gunlife-a (Loop A run
  fleshout-20261122T0815Z, evidence/2026-11-22/sim-gunlife-a.md,
  verdict GO, 8 grants traced): the mechanism is the LEAD gate —
  the volley belongs to the lead fighter only, and in 4 of 8 traces
  the holder carries the gun equipped for 29–65 days with cells and
  never leads a wave-4+ fight while holding it. The CELLGATE hold is
  exonerated (12 held volleys below wave 4, working as designed).
  One gun did fire (2 shots, 1 hit, 68 dmg vs a wave-4 Eater) after
  two unattributed transfers, then went dry for 4 more wave-4/5
  fights. The next question is one level up — why the gun's holder
  is never the wave-4+ lead (party formation) — and a lever follows
  from that answer, not from this trace.
- [open] 2026-11-22 — items / instrument — VANISHED-GUN TRACE
  DOESN'T TILE: the gunlife tracer names a vanish (total falls with
  no event) but records no state for the days after it, so the
  grant's rows don't tile to the last census day and it counts as
  untraced (sim-gunlife-a, 1/8 grants; the selftest's vanish
  fixture never asserted rowsComplete, so the gap passed frozen).
  Next step: fix the tracer with a terminal `vanished` state range
  and re-run the analysis on the 107321–107328 corpus (deterministic
  — no new band needed); the verdict stands at 7/8 either way.

## 8. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg content ~04:30,
  committed `622a0ff20`, judged band launched after): all four bars
  pass; bar 3 passes at 7/8 against the 80% floor, with the
  single miss being the vanish grant whose mechanism IS named but
  whose rows don't tile. No bar was re-scored. The zero-grant rule
  never fired (8 grants).
- **The `fired` count double-counts one volley by design.** Two
  grant-traces classify `fired` from a single 2-shot volley,
  because the trace follows the gun across holders (chen_wei →
  scholar → hannah_kim) and hannah's own grant lands on the same
  holder the same day. The mechanism counts read as "2 of 8
  grant-traces fired", not "2 volleys fired" — the leg-level count
  (1 volley) is the physical one, and §3 says so. A future tracer
  revision could deduplicate volleys across overlapping traces, but
  the frozen instrument counts traces, and the evidence reports
  both numbers.
- **The band is grant-lumpy (5/8 seeds, 0 grants).** At the
  killloot16 rate (~1/seed) an 8-seed band expects ~7 grants and
  got 8 — but concentrated on one seed. The mechanism split (4
  equipped-never-led, 2 fired, 1 never-equipped, 1 vanish) rests
  on 8 traces; a wider band would firm the shares, not the
  mechanism — the lead-gate explanation is code-derived (§2 of the
  prereg) and the traces confirm it in every column.

## Files

- Prereg: `evidence/2026-11-22/sim-gunlife-a-prereg.md`
  (`622a0ff20`)
- Evidence: `evidence/2026-11-22/sim-gunlife-a.md` (this file)
- Tracer: `scripts/analyze-gunlife-a.js` (selftest 25/25)
  (`01ff4956f`)
- Proof test: `scripts/test-gunlife-a.js` (11/11) (`01ff4956f`)
- Analysis: `evidence/2026-11-22/gunlife-a-analysis.json`
- Corpus: `evidence/2026-11-21/perseed-gunlife-a-ctl/` (8 files,
  anchor `01ff4956f`)
- Leg log: `evidence/2026-11-22/gunlife-a-legs-ctl.log` (8 judged
  summary lines, both legs, exit 0; the two detached legs' logs
  concatenated — the failed first leg-2 launch wrote to the same
  file before the relaunch overwrote it, so the log holds only the
  successful run; the failure is recorded in §6).

## Run identity

- **Base:** worktree HEAD `01ff4956f` (master `1417fb148` + prereg
  `622a0ff20` + tracer/proof `01ff4956f`); branch `sim-gunlife-a`.
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-gunlife-a.js` → 11/11;
  `node scripts/analyze-gunlife-a.js --selftest` → 25/25 (all on
  01ff4956f).
- **Band (judged):** 2 detached processes, 4 seeds each:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl
  OUTDIR=perseed-gunlife-a-ctl SEEDS=107321,107322,107323,107324 |
  107325,107326,107327,107328 RUN=killlootbundle-a
  node scripts/killlootbundle-driver-a.js`. 8/8 legs complete, 0
  instrument errors, both processes exit 0.
- **Analysis (judged):** `node scripts/analyze-gunlife-a.js --dir
  evidence/2026-11-21/perseed-gunlife-a-ctl --out
  evidence/2026-11-22/gunlife-a-analysis.json` → exit 0, verdict
  GO, 8 grants, 7 traced.
