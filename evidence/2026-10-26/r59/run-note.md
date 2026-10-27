# Journey social r59 — THE DISPLACEMENT-FIX RUN (lane B, 2026-10-26)

Leg 5 (social life), cycle r59. Follows r58 (residual split v3:
unexplained 0/1147; the mechanism named: `partyConvoChoices`
splices the party item at index 1 of a full subject menu and
trims to MAXC=7 from the end, cutting 'ask:others' —
displacedParty 1008/1147, all in-party).

Rotation-b read 5 at run start and IS advanced to 6 by this run:
r58's metric review named r59 as the displacement-fix arm, and
this run carries it — the r57→r58→r59 arc closes here. (r58's
hold rationale was that r57 had named r58's question before r58
ran; no open question names r60 for leg 5.)

## PRE-REGISTER (written before any r59 seed ran — see prereg.md)

**Design call (made by this run, FIGURE-IT-OUT-YOURSELF):**
party business outranking village talk is the wrong priority
when the menu is full. 'ask:others' is how the village
remembers each other — the social leg's core verb, converting
at 55.6% when offered in r58 — and the party item is a one-tap
management action reachable any other turn. The fix (one verb,
not all topic asks, keeping the funnel measurement clean):
when the party trim displaces from a full menu, it skips
'ask:others' (and 'leave'); if every displaceable row is
protected, the menu keeps one extra row rather than losing
the verb.

**Leg questions:** (Q1) on matched seeds 5401-5404, does the
fix cut the displacedParty share of the same-pick +
inBuilt=false residual to near zero? (Q2) does linger
conversion hold? (Q3) do party functions survive?

**Arms:** FIX arm only (all linger, seeded-speaker steering
ON, constant, excluded from the natural funnel, as r56-r58).
Control = r58's recorded per-seed JSONs (matched seeds, same
policy, same driver). Villages diverge from r58's turn-for-turn
after the first protected menu (menu change -> different picks
-> different RNG path), so the comparison is SHARE-level, NOT
turn-identity. That divergence is expected, not a regression
signal by itself.

**Bindings:** F1 displacedParty share of the residual < 10%
(r58: 87.9%); R2 linger conversion >= 25% (r58: 55.6%); M1
deep2 >= 10/seed; M3 pooled late TP >= 40%; M4 same-speaker
knack = 0/seed; M5 5 sense-reads, 0 fabricated-history flags,
<= 1 weak; M6 report-only; P1 party items survive
(party_name/party_role offered counts > 0 + proof test);
NO-REGRESSION check.js --quick at the standing profile
(278 passed / 9 failed); smoke gate before full seeds.

## The fix (src/js/party-formal.js, partyConvoChoices)

Before: while trimming to MAXC, the victim was the last row
(or second-to-last when 'leave' was last) — 'ask:others'
included. After: the victim scan walks down from the end
skipping 'leave' AND 'ask:others'; it stops at index 1
(the spliced party item) if nothing displaceable remains,
leaving one extra row instead of cutting the verb. In
practice the menu still lands at MAXC=7 (only one verb is
protected, so a full menu always has displaceable rows);
the break is a safety valve, and reactive menus already
vary MAXC, so one extra row is display-safe. One mobile
screen is unaffected: normal menus stay at 7 rows.

## Proof test (scripts/test-party-others-trim-20261026.js)

State setup only (unlock flags + real party membership); the
method under test runs fully, unstubbed. Cases: r58's verbatim
16-item menu (others at index 5, unnamed party) — party item
at index 1, others survives, leave last, length 7; named-party
party_role variant; short-menu append; degenerate
all-protected trim (verb survives at one extra row);
non-party villager untouched. Demonstrated in order: HEAD
code = 3 FAILURES (all three ask:others assertions);
fixed code = ALL PASS; fix restored via cp backup (no
checkout-as-restore, per the 2026-10-23 trap lesson) and
re-verified ALL PASS.

## Full-run results (4 seeds, full horizon, death-aware)

| seed | days | alive | deep2 | unsteered | no-offer | offered | picked | late picks | lingerPicks | knackSame | condRate |
|------|------|-------|-------|-----------|----------|---------|--------|------------|-------------|-----------|----------|
| 5401 | 142 | 6 | 31 | 414 | 54 | 360 | 262 | 110 | 262 | 0 | 88.0% |
| 5402 | 142 | 8 | 21 | 414 | 24 | 388 | 294 | 112 | 294 | 0 | 85.7% |
| 5403 | 141 | 6 | 25 | 414 | 41 | 369 | 276 | 109 | 276 | 0 | 89.5% |
| 5404 | 141 | 9 | 28 | 414 | 33 | 378 | 269 | 97 | 269 | 0 | 96.2% |
| POOLED | | 29 | 105 | 1656 | 152 | 1495 | 1101 | 428 | 1101 | 0 | 89.7% |

r58 control pooled: 29 alive, 101 deep2, 1487 unsteered,
794 no-offer, 685 offered, 381 picked, 81 late picks,
linger conversion 55.6%. r59: no-offer rate 9.2% (r58:
53.4%), conversion 73.6% (r58: 55.6%), late picks 428
(r58: 81). The fix did not just stop displacement — party
members are frequent conversation partners (they travel with
you), so unblocking 'others' for them roughly doubled offers
and tripled picks. Main-menu offers stay marginal (pooled
main 12 vs subject 1490; late picks by menu: main 2,
subject 426).

### F1 DISPLACED PARTY: PASS — 0/390 (0.0%)

Pooled residual (same-pick probes, inBuilt=false; full
census): 390 total (r58: 1147 — the probe population itself
shrank, because probes ARE no-offer turns and offers now
land). Split: threadGuard 151 (38.7%), gated 239 (61.3%),
displacedParty 0, displacedOther 0, v3unexplained 0. The
residual is now entirely the two known-correct mechanisms
(thread guard, topic gating) — no displacement, no mystery.
Trace coverage 1.0 on all four seeds (201/155/248/163
probes traced).

### R2 CONVERSION: PASS — 73.6% (r58: 55.6%, bar >= 25%)

Attribution exact: lingerPicks == picked on all four seeds.

### M1 formation: GO — 31/21/25/28, all >= 10
### M3-cond: GO — pooled late TP 689/768 = 89.7% (>= 40%)
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells 6/1/3/4, circulation only)
### M5 people: GO on flags (0), PASS on floor (1 weak at the <= 1 limit)
- 0 fabricated-history flags across all 5 reads.
- Strong: s5401-bondy-1-Valeria d6 (Taking opener,
  Ivy deflection "Some doors stay closed," "Ivy was a
  journalist, before," "Give Ivy time. We're all still
  becoming whoever we are now" — the r58-strong convo
  reprised before divergence, warm resolving close);
  s5402-seeded-d20-Autumn (dated trail grievance
  "Francisco. — yesterday — Some doors stay closed. I
  still haven't forgiven them," plus a real exchange:
  "Do you believe in anything? Now, I mean. After
  everything." / "That's not naive. That's load-bearing.
  Hold onto it.").
- Medium-strong: s5403-late-d100-Caleb (trap-line outing
  open — "Caleb's hand finds your sleeve. You leave
  together, faster than you came" — contest gossip,
  honest-empty "My brain's buffering on that one,"
  resolving close "This was good." They mean it.);
  s5404-late-d100-Ava (ridge outing — "It's quiet at
  the ridge. Ava doesn't say much. Sometimes that's the
  whole point." — "Caleb? A Firefighter, back before.
  Solid person." grounded person-knowledge, warm close
  "Rest when you can. We'll talk again soon.").
- Weak (1): s5401-late-d100-Aria — gossip convo, coherent
  and honest ("People are saying things. About you. ...
  I'd watch how you act around the fire," "Ivy headed
  out for water"), but the ending fizzles ("Hm. Never
  mind — go on.") after the stall beat + recap.
- Measured wart (r58 asked for per-conversation frequency,
  not per-read noting): the stall beat ("lost my train
  of thought") appears in ALL FIVE reads, once each —
  5/5 conversations, exactly once per convo. It is the
  most frequent wart in the read set, now measured
  rather than re-noted. The recap loop it triggers is
  partly driver persistence (the driver re-asks after
  the stall), as r58 noted.
- Known pattern, not a flag: contest gossip names multiple
  winners per show (Caleb: Tashi AND you won The
  Auction; Ava: Ursula AND you won Hardened The Pit) —
  the r44/r58 multi-winner seeding, consistent across
  runs, not fabricated history.
### M6 guardrail (report-only): villages alive at horizon
(6/8/6/9). No scatters, no arena-wipe. 5402 reaches the
full 142d horizon with 8 alive where r58's 5402 stopped
at 90d with 3 — villages diverged after the first
protected menu, so survival is NOT claimed as a fix
effect; the funnel shares are the comparison.
### P1 party items survive: GO
- party_name in delivered menus on 376/767 probes pooled
  (78/64/160/74 per seed); inParty probes 377. The party
  item is offered more, not less, after the fix.
- party_role 0 in funnel data: no run names a party
  (the driver never picks party_name), so the role item
  never surfaces in play — covered mechanically by
  proof-test case 2 (party_role spliced, others
  survives), not by funnel data. Naming a party in a
  future run would exercise it live.

## Village assessment (plain words)

Four villages, same warm player, talking about each other
far more than before — because the offer now lands. Seed
5401's six kept 31 deep friendships and talked about each
other 262 times without being steered; 5402's eight, 294
times; 5403's six, 276 times; 5404's nine, 269 times. The
talk itself is the village remembering: who still hasn't
forgiven whom on the trail, who was a journalist before,
who was a firefighter before, who won what on the cameras.
What changed since r58 is one small priority: when a
traveling companion's menu runs long, the party-naming
button no longer eats the ask-about-others question. The
remaining no-offer surface (152/1656 unsteered turns) is
mechanisms working as designed — the conversation is
already on the 'others' thread, or 'others' isn't an
askable topic at all — not a gap.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' converts at 73.6% when weighed and
  offered (r58: 55.6%). The no-offer surface fell from
  53.4% to 9.2% of unsteered turns, and the remaining
  share is fully explained (thread guard + gating).
- **Fun:** the transcripts are the evidence — Valeria's
  journalist Ivy, Autumn's load-bearing belief, Caleb's
  trap-line hand on a sleeve, Ava's quiet ridge. The fun
  tax is the once-per-conversation stall beat, now
  measured at 5/5.
- **Winnable:** not this leg's question; 4/4 villages kept
  social fabric intact to their horizons (M1/M3/M4 all GO).

## Metric review (§14)

- F1: PASS (displacedParty 0/390 = 0.0% < 10%; r58's 87.9%
  bar is the comparison, not a re-score — the bar was
  preregistered here before seeds ran).
- R2: PASS (73.6% >= 25%; up from r58's 55.6% — the fix
  moved the metric, the metric was not moved).
- M1/M3/M4: GO. M5: GO on flags (0), PASS on floor (1 weak
  at the limit). M6: report-only.
- P1: GO (party_name 376 probes; party_role via proof
  test, funnel-absent because no party is named in
  these runs — noted, not hidden).
- r58's T1/T2 bars retired per prereg (trace question
  answered; r59 judges the fix). No bar was re-scored
  mid-run.
- Proposed revision for a FUTURE run (not r60's job
  unless it takes leg 5): the stall beat is now measured
  at 1.0 per conversation in the read set; a run that
  wants to reduce it should pre-register a stall-rate bar
  (e.g. stalls per conversation < 0.5) and a mechanism
  (stall cooldown? recap without stall?). This run only
  measures it.

## Telemetry

Deviation check vs telemetry-baselines/social.json
(r59-telemetry.log, metrics l3.bonds, l3.deep2, dryRate —
r57's exact metric set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 105, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates
  (same practice as r54-r58: baseline NOT rolled).
  l3.bonds and dryRate quiet.

## Regressions

- check.js --quick on the r59 tree (run by recovery, before
  ONTOLOGY.md restore): 276 passed / 11 failed in 960s, vs
  the standing profile 278/9. UNRESOLVED as a landing gate.
  Only the last 2 failures were observed (test-parity-20261014
  gear, test-establishment-r20-fixes — BOTH standing failures);
  the full failure list was lost (output piped to tail -25 —
  never pipe check.js output). The 2 extra failures vs standing
  are unidentified; prime suspects are the ONTOLOGY.md
  truncation that was live mid-run (since restored
  byte-identical to HEAD, see Infra notes) and/or the
  120s-per-script-timeout-under-load class. Do NOT land r59
  on the 276/11 result unexplained: after rebase, re-run
  check.js --quick with FULL output saved to
  hidden_files/journey2-social-r59-checkquick3.log and
  identify every failure against the standing 278/9 before
  merging.

## Files landed (1 src/js fix + tooling + evidence)

- `src/js/party-formal.js` (partyConvoChoices: trim victims
  skip 'ask:others' + 'leave'; safety-valve break)
- `scripts/test-party-others-trim-20261026.js` (proof test:
  HEAD-red 3 failures, fixed-green ALL PASS)
- `scripts/journey-social-r59-20261026.js` (driver: r58 fork,
  all-linger, build-trace wraps incl. delivered/full ids +
  inParty, full probe census)
- `scripts/analyze-journey-social-r59-funnel-20261026.js`
  (residual split v3, same classes as r58)
- `evidence/2026-10-26/r59/` (prereg, 4 per-seed JSONs incl.
  full probe lists + trace records, r59-verdicts.json,
  r59-funnel-analysis.json, r59-telemetry.log, summaries,
  transcripts incl. all 5 M5 reads, run-note.md)

## Infra notes (for the next run)

- Heartbeat loop: 9-min nohup loop with logging (goal
  hidden_files journey2-social-r59-heartbeat.log); beats
  landed at 00:04:18, 00:13:18, 00:23:18 UTC — one beat
  ~1 min late (registry-write flap class), never near
  the 15-min staleness line. Verified by registry read
  each time, per the r58 lesson.
- exec sessions that launch background node jobs hang the
  session (r58 lesson, reconfirmed twice this run: driver
  launcher + heartbeat launcher) — check progress via
  fresh execs reading the log files, not via the launcher
  session.
- Driver log: goal hidden_files
  journey2-social-r59-driver.log (smoke PASS 29/29 traced
  + 4 SEED lines + DONE r59, 0 lost to EPERM flap on all
  flushes).
- Rotation-b ADVANCED 5 -> 6 by this run (crisis next).
  The r57→r58→r59 arc is closed.
