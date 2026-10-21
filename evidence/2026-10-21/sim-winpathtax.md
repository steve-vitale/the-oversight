# sim-winpathtax — win-path ladder taxonomy (backlog #754)

Run: fleshout-20261021T0915Z (coordinator run), arm sim-winpathtax
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero policy changes, zero new sims). Worker tree:
~/workspace/worktrees/sim-winpathtax. Backlog #754.

Question from sim-dissolvetax: belongfeast-s64905 WON the table (table=1,
won=1) with ever-national=0 — a win that never sat the court. Is that a
legitimate alternate climb (design intent) or a bypass (a blank to fix)?

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14-15)

Written here BEFORE the judged taxonomy run. (Honesty note: the brief
pre-registered the criteria below; exploratory JSON reads were used to
DESIGN the ladder classes and corpus loaders, and the final run that the
criteria judge is the one reported under "Taxonomy run" — criteria fixed
before that run, never re-scored.)

- **PRIMARY (DIAG-GO):** attribution completeness — 100% of wins across the
  three corpora classified with a rung ladder, 0 unexplained, 0
  instrumentErrors.
- **Honesty cross-check:** hand-verify ≥3 wins from raw per-seed JSON
  (recompute the ladder by hand); must match 3/3.
- **OUTPUT DELIVERABLE:** the taxonomy table (wins per ladder class, per
  corpus) PLUS the verdict on #754 — legitimate alternate climb or bypass —
  with the mechanism cited (file/area). If bypass, name the missing gate. If
  legitimate, say so with the design reasoning grounded in code reads.
  Either way, name the next lever or the next question.
- **Corpora (all on master, evidence/2026-10-21/):** perseed-dissolvetax/
  (16 runs: everNational + natEvents + dawn census), perseed-vgearconfirm/
  (64 runs: end-state national + winTrack{path,track,moral}, no ever-state),
  perseed-twovets/ (32 runs: same shape as vgearconfirm).
- **§15 note:** no before/after — diagnostic with no intervention (§15 panel
  is for lever before/after).

## Canon / engine grounding (NO canon doc covers the win-path ladder)

docs/CANON.md read first. **No canon doc covers the win-path ladder**
(national rungs, court, table seats) — per the brief, every mechanism claim
below is grounded in src/js reads, cited by file/area; nothing is invented.

- **The ladder** (hierarchy.js ~L89-92, header ontology): scaleRank() returns
  village/regional/national/global — "global implies national implies
  regional, never a skip". National is a polity: Haven reaches it SIX ways —
  LEAD (Haven primary of ≥3 seasoned subs), BELONG (subordinate in good
  standing: trust ≥50, arrears 0, link ≥14d, to a primary whose realm holds
  ≥4 fires), COVENANT (peer league ≥4 fires), TRADE (trade league ≥4),
  CONQUEST (led realm, all subs taken by force), REFUSE (a played, permanent
  refusal of the scale).
- **The full seat** (progression.js deedGateReady(), ~L613-657): waves faced
  5/5/4/3/2 distinct, 3+ contests survived, 3+ crises, integration stage ≥2,
  food-thesis deeds — and NO scale rung. The in-code STANDING comment
  (2026-10-13, Steve): "the separate scale rung is DROPPED — Standing
  (war/bonds/bread, standing.js) already measures what the scale rung
  measured, and the Feared path must be able to sit at the table without
  links." It also flags: "Scale is NOT added here (open design question)."
- **The lesser seat** (table.js tableSeat(), ~L90-94): waves 4/4/3, 2+
  contests, 2+ crises, stage ≥2, food-thesis deeds, and `scaleOk` =
  rank ∈ {regional, national, global}. NOT national — regional suffices.
  table.js also notes the asymmetry: "the lesser seat still needs regional+,
  an open asymmetry flagged 2026-10-14".
- **Feared's prereq** (src/js/table-feared.js, minSeat 'lesser'): a seat +
  might+killed ≥ 6 ledger. No link, no national requirement anywhere.
- **Relay** (docs/TABLE.md:82): lesser+ by deeds OR stage ≥ 3 "regardless of
  scale" — a second scale-free route by design.
- **docs/TABLE.md vs code:** TABLE.md's 2026-10-11 section says "The full
  seat keeps the national bar" — it PREDATES the 2026-10-13 STANDING change
  and was never updated. Doc-lag, not a gate bug (see findings).

Mechanism conclusion before the run: the court is not required by EITHER
seat. A win that skips national is within the written rules.

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-winpath-taxonomy-20261021.js: **37/37 GREEN**.
- RED: written before the instrument existed; run against the missing
  module — failed as designed ("Cannot find module .../winpath-taxonomy-20261021.js").
- GREEN: one forged win record per ladder class attributes correctly
  (lead, belong, covenant, trade, conquest, refuse, mixed-rungs,
  lead sat-then-lost, court-skipped, held-national, unheld-national, unwon,
  no-table — each with its honest reason); a forged unattributable record
  (won=1, table=1, no national evidence at all) lands in `unexplained` WITH
  the honest reason ("no national-state evidence at all"); contradictory
  records (ever-sat with no rung shape; won-without-table) also land in
  `unexplained` with reasons; determinism (same input → same output);
  vocabulary matches the brief; read-only static scan (no Math.random(,
  no Game.state/save writes — pure JSON analysis, no Game load needed).

## Taxonomy run (the judged run)

`node scripts/winpath-taxonomy-20261021.js` — exit 0.
112 runs, **92 wins, 0 unexplained, 0 instrumentErrors** → **DIAG-GO**.

### Taxonomy table (wins per ladder class, per corpus)

| ladder class | all | perseed-dissolvetax | perseed-vgearconfirm | perseed-twovets |
|---|---|---|---|---|
| lead (national-sat, held at win) | 5 | 5 | — | — |
| lead (national-sat, sat-then-lost) | 2 | 2 | — | — |
| belong (national-sat, held at win) | 6 | 6 | — | — |
| belong (national-sat, sat-then-lost) | 1 | 1 | — | — |
| covenant / trade / conquest / refuse | 0 | 0 | — | — |
| mixed-rungs | 0 | 0 | — | — |
| **court-skipped** | 1 | 1 (s64905) | — | — |
| held-national (end-state; rung unknown — corpus recorded end-state only) | 61 | — | 43 | 18 |
| unheld-national (end-state; ever-sat unknown — corpus cannot distinguish sat-then-lost from court-skipped) | 16 | — | 10 | 6 |
| unexplained | 0 | 0 | 0 | 0 |

Path mix (where recorded): 77/77 feared — field 41, combat 13, social 10,
craft 8, strange 5 — all light moral. The 15 dissolvetax wins carry no
winTrack (that corpus's instrument didn't record it).

Corpus profiles: dissolvetax 15/16 won (15/16 table); vgearconfirm 53/64 won
(56/64 table); twovets 24/32 won (25/32 table). Wave-5 across all three:
0/112 — the wave-5 door is still shut on the winning substrate.

## The #754 verdict: LEGITIMATE alternate climb — not a bypass

**s64905's court-skipped win is design intent, not a gap.** The mechanism,
all code-grounded:

1. **The full seat's deed gate deliberately dropped the scale rung**
   (progression.js, STANDING 2026-10-13, Steve-attributed): "the Feared path
   must be able to sit at the table without links." A court-skipped win was
   explicitly considered and allowed — the class this exact scenario was
   written for.
2. **The lesser seat only needs regional+, never national** (table.js
   scaleOk). s64905 (maxWave=3, wave4=0) CANNOT have held the full seat —
   deedGateReady requires w4≥3 distinct — so it won via the **lesser seat on
   the regional rung**: village → regional → table, court never staged.
   Also within the written rules.
3. **No path in play requires national.** Feared's prereq is seat + ledger
   (table-feared.js); relay can qualify on stage≥3 "regardless of scale"
   (docs/TABLE.md). The win flag gates on the table scene, and the table
   prices the run — it does not gate on the court.
4. **Corroboration from the corpus:** two more wins sat the court and then
   LOST the realm before winning — belongfeast-s64907 (belong, realm
   dissolved d92 on the arrears knife-edge, won d93) and leadfeast-s64908
   (lead, sub-drift d108, won d123). The table came anyway in both. The
   engine does not hold wins hostage to the realm — consistently, in three
   independent records.

**No missing gate.** There is nothing to fix in game code for #754.

### What IS open (steve-calls, not bugs)

- **The full seat's scale-freedom: Feared-only or all paths?** The STANDING
  comment justifies the drop for the Feared path ("the Feared path must be
  able to sit at the table without links") but the drop applies to ALL
  paths; progression.js flags it: "Scale is NOT added here (open design
  question)"; table.js flags the lesser/full asymmetry (2026-10-14). Steve's
  call.
- **TABLE.md doc-lag:** "The full seat keeps the national bar" (2026-10-11)
  contradicts the 2026-10-13 code. TABLE.md needs the update (finding
  appended below).

## Honesty cross-check (4 wins recomputed by hand from raw per-seed JSON)

1. **belongfeast-s64905 (court-skipped):** won=1, table=1, everNational=0,
   natEvents=[]; census: 0 nat-true dawns in 90 records. → court-skipped. MATCH.
2. **leadfeast-s64901 (lead):** won=1, everNational=1, natEvents=[{d:78,
   kind:'sat', shape:'lead'}]. → lead, held. MATCH.
3. **vgear-belongfeast-vgear-s64703 (held-national):** won=1, table=1,
   national=1, no ever-state key, winTrack.path='feared'. → held-national
   (rung unknown). MATCH.
4. **belongfeast-s64907 / leadfeast-s64908 (sat-then-lost):** natEvents show
   sat belong / sat lead; end-state national=0; won=1. → belong/lead with
   heldAtWin=false. MATCH.

4/4 ≥ 3/3 required.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

- **s64905's win beats are not in the corpus** — the dissolvetax instrument
  recorded no say-log or table-beat text. Said honestly: the verdict rests
  on the mechanism, not on a transcript I could read. (Instrument gap —
  future DIAG arms should record winTrack{path,seat} + the table audit beat.)
- **Proxy read — vgear-belongfeast-s64703** (lesser-seat feared win,
  vgearconfirm-transcripts): the win reads as earned, not slipped-through.
  The audit prices the run aloud: "◈ THE AUDIT — the System reads your run
  back to you, and the galaxy listens. A lesser seat — global standing,
  waves 1–3 faced (16/9/3), 10 contests survived, 5 crises weathered. The
  table does not rise. It prices." The feared challenge is played beat by
  beat ("Lead with the kill... the deer... The table goes very still"), the
  light road opens on the ledger ("The protected outnumber the killed; the
  food truth was shared"), and the ending resolves: "You won. Say it
  plainly: you won. The village endures. The table signed. ... and you
  earned it." A court-skipped win through the same seat machinery would
  carry the same pricing beats — the seat, not the court, is what the table
  reads.
- The two sat-then-lost wins (s64907, s64908) reinforce the reading: the
  table judges the run's deeds and standing, not the realm's current pulse.
  Losing the realm days before the win did not cheapen it in the engine's
  terms.

## Metric review (§14)

- PRIMARY (DIAG-GO): 92/92 wins classified, 0 unexplained, 0
  instrumentErrors — met exactly as pre-registered.
- Honesty cross-check: 4/4 (bar was 3/3) — met.
- Exploratory-design-reads caveat: the ladder classes and loaders were
  designed from corpus reads before the judged run; the binding criteria
  (from the brief) were fixed before that run and were not re-scored.
  No metric was revised mid-run.
- One instrument-design note for the next arm: for corpora without
  ever-state, `unheld-national` conflates sat-then-lost with court-skipped
  (16 wins). The classification is honest but coarse — the next DIAG should
  record ever-national in the vgear/twovets-family instruments.

## Convergence state

**DIAG-GO — instrument proven, #754 resolved as legitimate-alternate-climb.**
The taxonomy instrument is DIAG-ready (37/37 proof, 0 unexplained on real
wins, 4/4 hand-check). Substantively: the scale ladder's national rung is
OPTIONAL for the win flag by written design — the table seats on deeds
(full) or regional+ deeds (lesser); the court is a rung, not a gate. The
scale-onramp axis keeps its other half: wave-5 is 0/112 across these
corpora — the wall is the wave-5 door, not the court.

## Deliverable: the named next

1. **Steve-call (design, not code):** full-seat scale-freedom — Feared-only
   or all paths? Resolve by updating docs/TABLE.md's "The full seat keeps
   the national bar" (doc-lag) and recording his ruling on the in-code open
   question. No game-code change until he rules.
2. **Instrument gap (next DIAG, no game code):** record winTrack{path,seat}
   + regional flag + the table audit beat in future win-path corpora, and
   ever-national in the vgear/twovets-family instruments — so the next
   taxonomy can attribute seats and resolve the 16 ambiguous unheld-national
   wins.

Findings appended to hidden_files/sim-findings.md: #754 resolved
(legitimate alternate climb — no fix), TABLE.md doc-lag (steve-call), the
win-instrument gap (winTrack/seat/regional + ever-national recording).
