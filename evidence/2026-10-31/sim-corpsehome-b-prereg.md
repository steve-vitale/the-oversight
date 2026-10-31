# sim-corpsehome-b — prereg (committed BEFORE any judged leg)

Run: Loop B, arm sim-corpsehome-b, axis food-economy. DIAG ONLY:
measurement, zero src/js changes, zero policy-default flips, zero
edits to any existing policy file or existing script. New files
only: this prereg, driver + splitter + analyzer + proof, evidence,
corpora, table. Nothing is merged by this worker (the coordinator
merges); report status: committed on branch, pending coordinator
merge, no ship.

Pinned game base: commit f536e3ad3 (this worktree's HEAD at prereg
time; the prereg adds only itself). Seeded trajectories are
base-pinned (sim-corpsemove-b §7): seed equality is not trajectory
equality across bases. EXPLICITLY NOT the diverged 15215
trajectory — sim-corpsemove-b proved 15215 no longer strands or
dies on the later base, so no leg here re-runs 15215 as a judged
trajectory (it may appear inside the search band only as one seed
among many, never as the bracket source unless it freshly dies
there, which corpsemove already showed it does not).

## Question (from sim-corpsemove-b §6–§7, claimed for this run)

Re-proof, on a FRESH bearer on current master, the corpse-home
mechanism sim-corpsemove-b named but could not re-prove: the
village brings its dead bearer home overnight via
Game.recoverBearer() (src/js/corpses.js, fired from Game.endDay()
in src/js/game.js, queued by ledger.js playerDeath into
village.pendingBurials { corpseId, villagerId, name, day }, due on
the first endDay where scholar.day > death day). Effect: c.node =
Haven (village px,py — 4,4 on the observed stack), c.mx = 4,
c.my = 4, c.recovered = true, c.deathKnown = true; items
unchanged, looted false; it is the ONLY corpse-node writer in the
codebase; the say line "That night, they bring <first> home..."

## Canon

docs/CANON.md read. No canon doc covers corpse recovery itself;
the mechanism is documented in code (src/js/corpses.js header rule
the_village_brings_its_bearer_home, journey-succession r9
2026-10-12) — stated here instead of inventing canon.

## Substrate (verbatim from sim-corpsemove-b)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1 ON leg, NO prototype policy.
Driver: scripts/corpsehome-trace-b.js, adapted from
scripts/corpsemove-trace-b.js with READ-ONLY additions in kind and
NO behavior change: the policy stack, env gates, and day loop are
the corpsemove substrate unchanged. New driver only: FULLCAPTURE
env (0 = search leg: gap lines and full-day transcripts omitted
to keep the wide band small; 1 = bracket leg: gap lines stored on
every morning and full day lines stored on every day, so any
death/move window carries its narration verbatim). No verb calls,
no state writes, no RNG draws beyond the base policy stack. No
file writes from the game-loaded process: the driver prints one
JSON line per seed to stdout; a foreground exec redirects stdout
to an evidence .jsonl and stderr to a log file, and an idle
process (scripts/split-corpsehome-b.js, new) splits the .jsonl
into per-seed corpus files. The .jsonl lives in evidence/ until
split, then is deleted. NEVER stage judged corpora in /tmp.

## Seeds and stages

- SEARCH LEG (judged search, FULLCAPTURE=0): seeds 15000–15059
  plus the corpsemove 8-seed band members outside that range
  (15091, 15211, 15220, 15221, 15337 — 15003 and 15009 already fall
  in 15000–15059), DAYS=60. Death-aware horizon: 60 days, longer
  than corpsemove's 30 because 0 of 8 bearers died in 30 days;
  dead villages stop simulating per the harness (no fixed-200d
  horizon is imposed). The search leg's job is census: find ANY
  seed where the bearer dies away from Haven (bearer id changes
  across mornings AND the dead bearer's corpse node is not Haven
  on the death morning).
- BRACKET LEG (judged bracket, FULLCAPTURE=1): the FIRST search
  seed (lowest seed number) meeting the search criterion, re-run
  alone with identical env except FULLCAPTURE=1 and the same
  DAYS=60. Deterministic re-run: same seed + same stack + same
  base reproduces the same trajectory, so the bracket leg's
  narration capture describes the same death. If the bracket leg
  diverges from the search leg's readings on the bracketing
  snapshots, that is a divergence failure, reported loudly, not
  judged.
- CONFIRM: none pre-spent. A second fresh bearer death with a
  matching bracket would strengthen the claim; it is proposed to
  the coordinator, NOT run inside this arm (diag scope: one
  mechanism, one bracket).

## DIAG-GO bar (binding)

DIAG-GO iff a fresh bracket covers death morning/evening through
Haven morning with ALL of: (a) bearer identity (scholar id + name)
on both sides of the overnight segment, and the corpse's
villagerId + name on both sides; (b) the node/mx/my readings on
both sides (away-from-Haven -> Haven 4,4 / mx 4 / my 4, or the
village px,py of that leg if it differs, stated explicitly);
(c) the mechanism traced to the recoverBearer arithmetic
(pendingBurials day, due endDay where scholar.day > death day,
recovered + deathKnown flags flipping on the move segment);
(d) items identical across the bracket and looted false
throughout; (e) the say line if present, quoted verbatim, or its
absence stated; (f) the corpsemove-discriminated candidates
excluded OR confirmed on THIS bracket: return-home routine /
daytime carrying, succession relocation, map recentering (other
corpses stable on the move segment).
OR (the corpsemove prereg's alternative): bracket + excluded
mechanisms + residue stated as an explicit unknown.
A table that merely re-shows "node changed" without the bracket
is NO-GO. Bearer-identity failure on the bracketing snapshots is
NO-GO. If no fresh death is found on the stated search band,
report the search width and claim NOTHING — a missing bracket is
not a failed mechanism.

## Sense-check (narrated vs silent)

Read the death-night transcript end to end (the bracket leg's gap
lines + full day lines for the death day, the due-day, and the
move morning): judge meaning, coherence, whether the homecoming
reads as the village acting rather than a teleport. Report the
say line verbatim if present. A move with no narration anywhere
is a narration gap (finding, NOT built — diag only).

## Metric review (carried, not changed mid-run)

Pre-registered metrics bind this run: bracket tightness (single
overnight segment), mechanism trace (file/function/caller/
condition), bearer identity on bracketing snapshots, items/looted
stability, narration presence verbatim. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts go
under "metric review" in the evidence file for the NEXT run.
§15 panel: NOT APPLICABLE, declared here — zero game-root
changes, so there is no before/after game delta for
scripts/balance-panel.js to compare. The before/after here is
morning vs evening snapshots on the same legs, and it is never
labeled a panel comparison.

## Wall numbers

NOT OBSERVABLE on this census — reported, never claimed. This
census measures one mechanism (corpse recovery) on 60-day legs,
not national/table/wins reachability; no wall numbers are
fabricated from it.
