# Journey leg: DEEPENING (days 40–80) R103 — "DO VILLAGERS INITIATE BONDS, AND ARE PROMISES EVER NAMED?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r103 plays deepening, writes 2->3
at closeout. Base: master 82bddc68e at worktree creation (includes the
r102 stale-goal-line fix c498e05ff). Policy: competent (r102 driver
lineage, unchanged policy wraps). Seeds: fresh 94201–94204 (fresh-band
check: r102 used 94101–94104, r100 93901–93904, r95 93801–93804; no
942xx band in evidence). Horizon: DAYCAP=100, death-aware stop.
Smoke seed 94200 (outside the main band) x DAYCAP=45 proves the r103
driver before the main run; smoke outputs deleted after the check.

Context: two standing items converge on this window. (1) Steve
2026-11-04 22:32 CST: villagers initiate bonds on their own — link
proposals and bond formation generally, perception-gated (only with
people they have actually seen, heard, or learned about, never from a
roster). The 2026-11-04 linkseek finding was 0 propose verbs by
villagers. No journey-leg panel has yet measured villager-initiated
bond proposals in the wild. (2) r102 metric review: r100 + r102
revisited-alive promise threads total 5, all SILENT, 0 NAMED — the
floor for judging P-KEEP as a verdict is now met. This run judges it.

This run does NOT re-judge villager goals (r102: G-ASSIGN/G-STEER/
G-STICK all MET), standing trace (r102: quiet), betrayal sittings
(r94/r95/r102), beast-trick teaching (r92), or the standing/scale
two-rulers finding (r93). Those are carried as context only. No game
change is pre-committed: if initiation reads as present, the
instrument result is the finding; if it reads as absent, the blank
is documented, not redesigned on the spot — except a small,
voice-only fix of the r102 class, if one presents with a proof test.

## Question 1: villager-initiated bonds (V-INIT, primary)

Sources: (a) every sitting transcript on convo days 45/60/80 (same
sitting rule as r102: up to 3 full sittings per convo day, stop after
the first betrayal sitting, plus revisit sittings); (b) a code read
of proposeLink / proposeCovenant / proposeTrade call sites; (c) the
driver's per-seed capture notes for propose events (bot = player-side,
counted separately as P-LINK, never as villager initiation).

Definitions (fixed before scoring):
- V-INIT-BOND: a sitting in which the NPC's opening want, or a THEM
  line in the sitting, proposes a bond: joining a party, a joint
  outing, a visit, a village link, a covenant, or a trade pact —
  initiated by the NPC, not offered as a player menu choice
  (invite_party / dlg:invite in the offered menu are player-side
  options and do NOT count). Betrayal invitations are counted
  separately as B-INIT (known present from r102) and do NOT count
  toward V-INIT-BOND.
- P-LINK: bot (competent-policy) proposeLink events in capture —
  player-side, reported for contrast only.
- Engine check: proposeLink/proposeCovenant/proposeTrade call sites
  outside app.js UI bindings and the sim driver. If none exist, NPCs
  cannot initiate village links by construction — that is the
  finding, stated plainly, not a bug claim about a missing feature
  the engine never had.

INTERESTING if V-INIT-BOND >= 1 anywhere in the panel (villagers do
initiate bonds in this window) OR if V-INIT-BOND = 0 across the whole
panel (the linkseek blank reproduced in the wild in the deepening
window — a documented blank against Steve's 2026-11-04 ruling, with
the engine check naming whether it is construction or behavior).

## Question 2: promise-keeping verdict (P-KEEP, primary, verdict now)

Same scan as r100/r102 (analyzer carried): a promise thread opens
when a sitting ends with `want final: resolution=promised`. Later
sittings with the SAME villager are scanned on THEM lines only for
debt/promise wording. Classification: NAMED if any later THEM line
mentions it; SILENT if a later sitting exists but never mentions it;
DEAD if the villager died after the thread day; NO-LATER-SITTING if
no later sitting exists. Only revisited-alive threads (NAMED or
SILENT) judge the verdict.

Verdict: PRESENT if NAMED >= 1 in the fresh panel (promise memory
exists in the deepening window); ABSENT if NAMED = 0 across all
revisited-alive threads (promise memory absent here — the r100/r102
shape reproduced on fresh seeds). No re-scoring: threads are counted
exactly as the carried analyzer classifies them.

## Carried context (reported, not re-judged)

- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r102: 0). Any senseless sitting is read and
  named, not just counted.
- D-THING (descriptive): sittings ending in a declined invitation
  that leaves a pocketed thing, and whether any later sitting
  revisits that thing (r95 open item, still open in r102).
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — descriptive only, not a winnability verdict (fresh
  seeds, small panel).
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the r102 driver fork keeps the goalSnap
  instrument intact (removing it risks breaking a proven driver), and
  the goal question is closed for this window, so no goal verdict is
  re-judged from them. The driver keeps all other r102
  instruments (standing trace, deed log, census, capture, sittings).

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
