# sim-linkdissolve — dissolution attribution DIAG (run fleshout-20261023T1235Z, axis scale-onramp)

Worker tree sim-linkdissolve. Namespaces: linkdissolve-* (scripts/evidence).
ZERO src/js. ZERO scripts/policies changes. Instrument/evidence-only.

Canon read first: docs/CANON.md + docs/SCALE.md (the scale ladder: six
national roads; links form at trust 30, season at 30d+trust 40). The bars
(`_linkSeasoned`: 30+ days AND trust ≥40, conquered = season only;
`_linkRegionalPlus`: the link must sit in a regional-scale polity) read from
src/js/hierarchy.js + src/js/standing.js — code, not guesses.

## PRE-REGISTRATION (§14 binding — set before any sims)

- **BINDING QUESTION (backlog #853, the sim-links-diag named next):** 8
  dip-dissolution events (−102 steps) across the doorcensus-armor corpus
  show WHEN a polity dissolved but no link-level trace says WHICH link
  snapped or WHY. Attribute every dip-dissolution event in a fresh
  instrumented census to a NAMED channel: trust-decay (below the 40 bar, no
  break) vs link break (breakLink, with the how) vs succession (funeral-hour
  chaos) vs tribute-arrears.
- **DIAG-GO bar:** ≥90% of dip-dissolution events in the analyzed corpus
  attributed to NAMED channels (trust-decay / break / succession /
  tribute-arrears / other-named). A miss is insufficient-data, not a failure.
- **Instruments:** scripts/diag-linkdissolve.js (per-day link-history census:
  trust trajectory + status + arrears + the link's own _linkNote history
  tail, per game day, for every Haven-party link — broken links included,
  since broken links stay in the graph) + scripts/linkdissolve-analyze.js
  (dissolution detector + classifier) + scripts/test-linkdissolve.js (proof).
  Namespace linkdissolve-*.
- **If DIAG-GO:** name the dominant dissolution channel and state the lever
  it implies — but do NOT build the lever this run. The overcourt re-stage
  (LINKFORM=2, redundancy holds realms) with the metric review's mean-dip
  primary is the documented follow-up; left as a named next.
- **§15 balanced panel:** inapplicable — instrument-only, zero game-code
  changes (same class as the sim-links-diag PHASE 1 precedent). The
  instrument + pre-registered bar is the instrument; the ≥90% bar the judge.

## What was built

1. **scripts/diag-linkdissolve.js** — fresh census composer on the pinned
   doorcensus-armor substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
   WINDEFER=1 SEATDRIVE=0 KILLDISC=1; SUCCGRACE/SUCCPOLITY and all other
   experimental env UNSET so the plain seasoned bars apply; control =
   AD.armedFor('leadfeast')+ARMORYDRIVE=1, armed =
   AV.armedFor('leadfeast')+ARMORYDRIVE=1+ARMORVILLAGE=1). Seeds 65511–65522
   (the census set — the dissolution events are the target), 180d
   death-aware. Per game day (inside the wrapped policy.daily, after the
   policy acts): every Haven-party link's {trust, status, arrears,
   formedDay, conquered, tributeWk, history tail (last 6 entries, only on
   growth — deduped on histN)} + the day's villageStanding().links/.diplomacy
   scalar + scaleRank + nationalLive. Per-seed JSONs at
   evidence/2026-10-23/perseed-linkdissolve/{control,armed}/s<seed>.json
   (hash-after-write readback on every file — the write-denial class is
   real). Corpus: 24/24 configs, 0 errors.
2. **scripts/linkdissolve-analyze.js** — detection: any single-day dip
   (diplomacy POINTS) drop ≥34 (−34/−68/−102 — the dip is a polity step
   function). Attribution: re-derive each link's OWN seasoned bar per day
   (active && age≥30 && (conquered || trust≥40) — the standing.js
   _linkSeasoned(l, !!l.conquered) variant); the link(s) whose bar flips
   true→false on the dissolution day are the proximate cause; the link's
   own history (union of the sparse tails, deduped) names the channel:
   - **break/<how>** — status 'broken' on D; the 'broken' note names the
     how (succession | revolt | released | walked | seceded | gambit |
     severed).
   - **succession** — funeral-hour chaos: own succession notes within 14d
     with a single-day haircut ≥6 (the engine's haircut is exactly −8) or a
     tribute grab, OR a village-wide funeral stamped on any link's history
     on D−2..D (funerals shake every link; the census's sparse tails can
     miss the flipped link's own copy) with a ≥6 single-day drop. Notes
     AFTER D are exonerated — they cannot have caused the dissolution.
   - **tribute-arrears** — ≥2 'arrears' notes in the 21d before D with an
     arrears spike coupled to the trust crossing.
   - **trust-decay** — below the bar, still active, history shows drift
     (trustDriftWatch notes) or plain neglect.
   - **other-named** — none of the above; the history kinds present are
     named. Never anonymous.
3. **scripts/test-linkdissolve.js** — 29/29 GREEN: live-engine smoke
   (sim-harness loadGame, seeded; snapshotLinks well-formed on a real game;
   ownBar edge cases incl. conquered-season-only); synthetic fixtures each
   classify exactly (trust-decay, break (succession), succession,
   tribute-arrears, succession-funeralNear — the d180 shape); a flat-dip
   control produces no event; det-gate: identical input → byte-identical
   output on every fixture.

## Attribution table (7 dissolution events, 7/7 named)

| # | seed/arm | day | dip | channel | link (flipped) | evidence |
|---|---|---|---|---|---|---|
| 1 | s65518/armed | d118 | 102→0 | succession | Ashford | own succession note d118 ("pressed tribute down in Haven's chaos"); trust 44→36 (−8, the funeral haircut) |
| 2 | s65518/armed | d163 | 102→0 | succession | Ashford | same: d163 note, trust 46→38 (−8) |
| 3 | s65518/armed | d169 | 102→0 | trust-decay | Ashford | trust 42→37, drift notes d163 AND d169 (the trust-erosion warning fired twice); nearest funerals d163 (haircut already landed: 46→38) and d170 (after the dissolution — exonerated); arrears 0 |
| 4 | s65518/armed | d180 | 102→0 | succession | Thornfield (+village_3: 41→33) | village-wide funeral d179 (succession notes on Stonebridge/Ashford; Thornfield's own copy absent from the sparse tails); trust 49→36 (−13); arrears 13892 constant (background, not the trigger) |
| 5 | s65519/armed | d143 | 102→0 | succession | Stonebridge | own succession note d143; trust 44→36 (−8) |
| 6 | s65521/armed | d134 | 102→0 | succession | The Hungry Road II | succession notes d120/121/134 ("grief is priced in" — repeated funerals); trust 41→34 (−7) in the grief window |
| 7 | s65522/control | d149 | 102→0 | succession | Ashford (+The Hungry Road: 40→32) | succession notes d142,149; trust 43→25 (−18, compounding funerals); arrears 5638 constant (inherited, not the trigger) |

**Channel counts: succession 6/7, trust-decay 1/7, break 0/7, tribute-arrears 0/7.**

## DIAG verdict: DIAG-GO (7/7 ≥ 90% bar)

Every dip-dissolution event in the analyzed corpus attributes to a named
channel. The doorcensus's s65518 4× form/dissolve loop REPRODUCED on the new
anchor (d118/d163/d169/d180 here vs d96/118, d127/163, d167/169, d172/180
there — same seed, shifted days, same loop shape), confirming the instrument
captures the target phenomenon.

### Honesty notes

- The d169 Ashford −5 single-day drop has no engine-named cause in the
  trust-change inventory (funeral haircut is exactly −8; arrears −6;
  renegotiation −5 is player-initiated and unnoted here). The drift notes
  are observers, not causes. It is honestly the erosion path — the link was
  at 42 after a d163 funeral already took it 46→38, and it crossed the bar
  five days later with no funeral coupled. Residual −5 ambiguity documented,
  not resolved.
- Zero breakLink events in this corpus: every dissolution was a bar
  crossing (trust <40), never a status break. The break channel exists in
  the classifier (proven by fixture) but did not fire in the wild here.
- Tribute arrears appear as BACKGROUND in 2 events (Thornfield 13892,
  Ashford 5638) but were constant across the dissolution day — never the
  coupled trigger. The arrears classifier (proven by fixture) did not fire
  in the wild here.

## The dominant channel and the lever it implies

**Dominant channel: SUCCESSION (6/7).** The mechanism, measured: a speaker
death fires successionCrisis; every shaken link takes the −8 funeral haircut
and the subordinate "presses tribute down in Haven's chaos." A link sitting
at 41–46 trust — a HEALTHY, tended link — lands at 33–38, below the 40
seasoned bar. The 3-link LEAD polity needs all three links seasoned; one
funeral dissolves the whole realm in a single day (dip 102→0), because the
regional+ filter drops every link's points the moment the polity ceases to
exist. The polity step-function runs in reverse.

**Implied lever (NOT built this run):** redundancy — the overcourt re-stage
(LINKFORM=2: court to 5 subordinate links, tend all weekly) with the metric
review's revised primary (mean end dip per config, GO: armed ≥ baseline+34;
secondary: post-formation dissolution events, GO: armed < baseline). The
sim-links-diag pilot already proved the mechanism (0 dissolutions, dip
136–170 on overcourt vs 1 dissolution, flat 102 baseline); the bar was
wrong, not the lever. Named next: re-stage overcourt on fresh seeds with
the mean-dip primary.

## Wall numbers (this census corpus)

control: ever-national 10/12, configs with a dissolution 1/12, median 141d,
mean end dip 76.5. armed: ever-national 11/12, configs with a dissolution
3/12, median 179.5d, mean end dip 68.0. (Census is link-focused; no
table/win instrumentation — the doorcensus-armor corpus carries those.)

## Named nexts

1. **Overcourt re-stage** (the documented follow-up): LINKFORM=2 on fresh
   seeds, mean-dip primary per the sim-links-diag metric review. The
   succession-dominance finding strengthens the case: redundancy is the
   direct counter to funeral-hour single-link snaps.
2. **The d169 −5**: an engine-inventory gap — no named trust change explains
   a −5 single-day drop with no note. If a future instrument needs it,
   diff the trust-change call sites against the snapshot days.
3. **Break-channel wild data**: zero breakLink events here — the
   revolt/secede/walk paths' dissolution role is unmeasured. A conquest-road
   census would be the substrate that fires them.

## Blanks filled / documented

- FILLED (measured): the 8 (here 7) dissolution events' mechanism —
  backlog #853. 6/7 are funeral-hour succession chaos (the −8 haircut
  knocking a 41–46-trust link below the 40 bar, the polity step-function
  dissolving the realm the same day); 1/7 is trust erosion past the bar
  with the drift warning fired twice.
- FILLED (measured): no link ever *broke* in this corpus — dissolutions
  are bar crossings, not breaks; tribute arrears were background, not
  trigger.
- DOCUMENTED (named next): the overcourt re-stage with the mean-dip
  primary; the d169 −5 engine gap; break-channel wild data.

## METRIC REVIEW (§14 mandatory)

1. **DIAG-GO bar (≥90% named attribution):** MET at 7/7 (100%). The bar was
   the right instrument — it forced the classifier to name every event,
   which is what surfaced the d180 funeralNear case (a −13 drop with no
   own-link succession note would have been misread as erosion without the
   village-wide funeral check).
2. **Event count vs the doorcensus's 8:** this corpus produced 7
   dissolution events on the new anchor (520dbbd7a vs the census's
   db7a0456381d). The s65518 loop reproduced; the 8th event did not
   re-materialize on this anchor. The bar counts events in the ANALYZED
   corpus, so this is a corpus note, not a bar revision.
3. **Detection threshold (dip drop ≥34 points):** caught all full −102
   dissolutions; no partial −34/−68 steps occurred in this corpus. The
   sim-links-diag instrument note (classifier missing +34 seasonings) does
   not apply to the dissolution direction here.
4. **§15:** panel inapplicable — instrument-only, zero game-code changes
   (the sim-links-diag PHASE 1 precedent). The pre-registered ≥90% bar is
   the judge.
5. **No mid-run re-scoring:** the dip-vs-dipLinks unit bug (analyzer
   compared link counts against a 34-point threshold, finding 0 events) was
   an instrument defect, fixed before any verdict was read — the verdict
   was computed once, on the fixed instrument.

Proof: scripts/test-linkdissolve.js (29/29 GREEN). Instrument:
scripts/diag-linkdissolve.js. Analyzer: scripts/linkdissolve-analyze.js.
Attribution JSON: evidence/2026-10-23/linkdissolve-attribution.json.
Corpus: evidence/2026-10-23/perseed-linkdissolve/{control,armed}/ (24
configs). Sweep logs: evidence/2026-10-23/linkdissolve-sweep-{control,armed}.log.
