# journey-scale r92 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-03T13:45CST (scheduled 13:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success (the run
completes its play + verdicts; a pilot-gate stop is not success, so the
rotation stays — as r90 showed).
**Base:** master@8703965a5 at branch creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold changes. The
seasoned bar (30 days + trust 40) is UNTOUCHED by Q2; Q2 adds a verb, not
a lower bar.
**Perception law (2026-10-28) stands** — all instruments read-only; the
pickers only press offered menu items, never engine state. The Q2b
tend-arm presses only the offered Haven-panel verb (tendLink), the same
way a player would.
**DELIVER OVER MEASURE (2026-11-01):** Q2 lands the carried r91
proposal (peer tending) if its fix gate holds; Q1 is a fresh continuity
quad, not a re-score of r91.

## Standing context (read before scoring)
- r91 (same day, earlier): quad 85091–85094, all regional, national 0/4.
  COVENANT road blocked by a hair in every seed (trusts 35/29/17/39 vs
  seasoned 40; 85094 one point + one day short). **Tended = 0 in all four
  seeds.** Scope honesty from r91: that zero is a bot-behavior fact, not
  a villager verdict — but code-read since r91 sharpens it into a game
  fact: tendLink (hierarchy.js) refuses every peer link, because it
  requires link.primary === HOME and peer links are formed with
  primary: null, subordinate: null (a/b shape). The Haven panel still
  shows peer links a "Send grain (1,500 kcal)" button (app.js renders
  every non-subordinate link with one), so a player pressing it on a
  covenant/trade link hears "There is no bond of ours to tend there."
  and nothing moves. The covenant road therefore has NO repeatable
  player tending verb — only +1/week passive covenant/trade ticks and
  occasional defense/crisis answers (+8/+6, event-gated). The LEAD road
  got its verb in the 2026-10-12 scale-wall fix; peers never did.
- r90 pilot 85081: five links, national one covenant tending short
  (third covenant peer trust 34 vs 40) — same shape, one run earlier.
- r66–r73 bands: lesser seat common (priced/waiting/announced, never
  sat), full seat 0, wave 5 reached 0, national 0–1/4.
- r91 method note carried: gossip-forcing (GOSSIP_FIRST) systematically
  leaves wants unengaged, so this run's people check runs UNFORCED
  (GOSSIP_FIRST=0) to observe want resolution. Gossip-exposure numbers
  are therefore NOT comparable to r91's forced band; that comparison
  is report-only, not scored.

## Leg questions (binding)
1. **SCALE CONTINUITY (fresh quad):** seeds 85101–85104, r91 instrument
   clone (labels/seeds/EVIDIR only) + fusionWatch, policy
   scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0, DAYCAP 180,
   death-aware stop (+10d tail max). TEND_PEER unset (base-policy
   parity with r91's courtship behavior).
   Pilot-first: seed 85101 runs first; if it CRASHES, STOP and report.
   Report per seed: census (end, day, pop, pantry, rank, seat, arc,
   maxWave, pilgrimages proposed/trips started, courtPoorDays),
   table-approach notes, duty counts. Judge REACHABLE / FUN /
   WINNABLE for the leg in plain words.
   Interesting-finding threshold: any seed reaching national; any
   completed pilgrimage with its funnel; any pellet install +
   succession with the voicing line present/absent.
2. **PEER TENDING (delivery, carried from r91):** extend tendLink to
   peer links (kind covenant/trade, a/b contains HOME, primary null)
   with the LEAD verb's exact pricing and cadence: 1,500 kcal from
   Haven's pantry → +8 trust via _trustGain, once per week per link
   (tendedWeek), refused during their mourning, partial-pantry
   partial gain, aid credit to the PEER's pantry (via _linkOther, not
   link.subordinate), ledger 'tended:<other>', link note. Panel fix
   (app.js, DOM-only): peer links render as equals ("League with X"
   / "Charter with X"), not "X bows to Haven". No gate, threshold,
   cap, or LEAD-behavior change. winPlanBondsTick is NOT extended
   (villager-side tending of peers is a follow-up, named, not
   smuggled in).
   Fix gate (ALL clauses must hold, else the change does not land):
   (a) proof test RED on base (peer tend refuses / returns 0) →
   GREEN with the fix, including once-per-week dedup, mourning
   choke, partial-pantry gain, and LEAD behavior unchanged;
   (b) Q2b panel confirmation (below) shows tends landing on a real
   run with the fix;
   (c) check.js --quick shows no NEW failure vs the r91-known set
   (6 known + cleared flakes/timeouts, each individually verified).
3. **Q2b PANEL CONFIRMATION (same driver, tend-arm):** seed 85101 ONLY,
   driver env TEND_PEER=1 (after the day's courtship step, press
   tendLink on each active peer link with trust < 40, pantry-gated
   at >12,000 kcal — the instrument presses the offered verb, nothing
   else). Run on FIXED code. Expected: tends > 0, peer trust climbs
   by tend amounts, ledger 'tended:' lines present. The base-code
   counterpart is the proof test's RED (tendLink refuses peers), not
   a second sim run — stated here so the absence of a base-code sim
   is a pre-registered method choice, not a gap found later.
   If Q2b shows 0 tends on fixed code, the fix does NOT land and the
   run reports why.
4. **PEOPLE CHECK (sense law — unforforced):** read full transcripts
   from the Q1 quad sittings. Conversations must have meaning: the
   NPC wants something, options engage or deflect it, endings
   resolve/plant/owe. No fabricated shared history, no filler loops,
   no static menus. Report wants engaged vs deflected, with the
   unforforced policy named as the reason resolution is observable
   this run.
5. **DUTY COUNTS (report-only, carried):** weapon-craft lines,
   deadfall-duty lines, wsplit eligible/attempts — the count
   continues, it does not re-argue the armed-gate classification.

## Metric review (to be filled at closeout)
- Q1's pilot gate, Q2's fix gate, and the Q2b method choice above bind
  this run. A miss is NO-GO, never re-scored mid-run.
- Carried, still open: the nomad.js road-wipe mantle voicing
  (follow-up to r91 Q2, not smuggled in); win-plan tending of peer
  links (follow-up to this run's Q2); the wave-4/5 breadth wall for
  the full seat (unchanged, not re-proven here).
