# Lane A journey-landing r130 — coordinator (adoption) record

Adoption of the timed-out 15:45 CST run (run id
d624422a-c4dc-4bba-a3ff-520450a6758f). No re-play, no re-design.
Adoption completed 2026-11-14 ~00:10Z (Nov 13, ~18:10 CST).

## What the run found (from prereg + run note, verified on disk)

- Base master 6df2519b9; panel seeds 1142–1151 (r121 band, 10th run),
  DAYS=28, days 1–14 judged. Driver
  `scripts/journey-landing-r130-20261113.js` (r128 AFTER driver verbatim
  except OUTDIR/header). Corpora in goal hidden_files
  `evidence/2026-11-13/landing-r130-after/` (10 seeds) and
  `landing-r130-after-fix-1150/` (seed 1150 re-run with D3 fix).
- Reachable YES (10/10 alive d28, System d8 everywhere, fights/outing
  chains/practice/follow volunteers firing). Fun YES with caveats (D3 fix
  removes a real non-sequitur; heed loop is the remaining dull spot, one
  21-turn sitting per panel; garbled "themselves" label still shows until
  r129 lands). Winnable: leg 0 is the on-ramp, not the win; live village
  with moving practice (97 cells) and no stranded scholar — met.
- Q1-D2 (warn_you verbatim repeat): CLOSED, no fix. Pool audit pins the
  line in `convoWantWarning` (convo-wants.js), 9–10 variants with
  per-villager rotation cursor + no-repeat ledger; panel: 0 verbatim
  repeats across 104 transcripts / 2 warn_you sittings.
- Q1-D3 (ask:village "How are the injured doing?" answered with
  leadership tension): FIXED in-branch (see fix commit below). Root cause:
  `convoVillageLine` (conversation.js) composed grief/cheer/hunger/fear/
  heat bits and had NO injured bit. Fix leads with injured status — sick
  (`v.sick`) or low-health (`v.health < 100`, combat-wound pool)
  villagers count as hurt; nobody hurt + other news → "nobody's injured
  right now"; quiet day → temperament idle pool still answers. Scholar's
  own health never counts.
- Q1-HEED (warn_you heed-cycle filler loop): REPRODUCED, carried (design
  call). 1 sitting (1150 d6, Dauletkhan, warn_you stage 1): 21 turns,
  `[dlg:heed]` offered 12× and `[dlg:details]` 12×, neither ever taken,
  want stuck stage 1. Panel rate 1/104 sittings (1/2 warn_you sittings).
  R55 wind-down DOES surface (turn 20) — pacing, not mechanism, is the
  defect. No fix landed.
- Q2 PRACTICE/HUNT: GO. movedCells d1→d28 = 97, seedsWithMove 10/10,
  skill0→pos 46, practiceReps 2757, hunt reps 0 (13th panel, carried),
  kills 223.
- Q3 bindings: M1 ALIVE-D14 10/10; M2 SYSTEM CONTACT 10/10 (all
  systemDay=8); M3 FIGHT-LOG 0 unknown/mixed trigger (6 fights, 1
  zero-DMG no-strikes fight); M5 PEOPLE PASS; D1 garbled label "We never
  finished — themselves." 7 occurrences across 6 files (out of scope, NOT
  fixed — belongs to the r129 fix awaiting Steve); personal bridge 0
  repeats (104 sittings, 14 servings); small bridge 0 repeats; Q1 r126
  presshop farUnreached 1 (identical to r129 both sides); outingchain
  CHAIN-COMPLETES-FAR (asked 28, kept 6, deliver 2); commit-offer max
  per-seed never-offered 2 (1149 d13/d15); 1130-d6 amnesia 0; Miriam line
  0 "That's settled"; R66 starvation deaths 0; mantle latency vacuous.
  Topic-dwell want 147, servings 44. Follow volunteers 13 fires across
  8 seeds (trust 50–58).
- Telemetry: 3 LOUD lines, all EXPLAINED, baseline NOT rolled
  (landing.json SUPERSEDED; systemDay 33→80 and monsterKills 24→223 are
  panel-size scale artifacts; folTelemetry.fires 0→13 is follow-volunteer
  behavior firing). Metric-review proposal: re-seed landing-split.json
  from r129/r130 panels (10-seed totals + per-seed means); monsterKills
  needs per-seed-mean comparison.
- sim-findings.md updates verified on disk: HEED entry updated with r130
  rate (line 2296), D3 entry updated with fix + proof + in-the-wild
  result (line 2297), D2 closed by pool audit (line 2315; file 2315 lines).

## What the adoption verified

- Worktree `journey-landing-r130` (branch at 6df2519b9, zero commits):
  `M src/js/conversation.js` (D3 fix, 21 insertions, read in full — matches
  the run note) + 5 untracked files (prereg, run note, Q1 analyzer,
  driver, proof test). Corpora confirmed in goal hidden_files.
- Heartbeat done first; no stray check.js; run hbloop PID 7017 already
  dead at adoption start (re-verified dead at closeout — nothing killed).
- Proof test `scripts/test-journey-landing-r130-village-injured.js`:
  7/7 PASS on the fix (pre-rebase and again on the rebased tip).
- Zero-DMG invariant `scripts/test-landing-r115-zerodmg-invariant.js
  <landing-r130-after/>`: PASS, 6 fights, 0 violations (pre-rebase and
  on the rebased tip).
- Gate `node scripts/check.js --quick` re-run in full in the worktree:
  **330 passed, 10 failed in 816s** (exit 1). Log:
  `evidence/2026-11-13/journey-landing-r130-gate.log`.
  **Verdict: GO — 0 attributable.** Adjudication:
  - 4 flap EPERM (human-combat-parity, measurement-flags,
    measurement-source-text, measurement-cache-flags): gate log shows
    `code: 'EPERM', syscall: 'write'`; all green standalone in the
    clear window (69/0, 5/0, 4/0, 4/4). The gate ran through flap
    blips 23:19:45Z + 23:20:48Z and a VM replacement
    (boot 5623d281→577910a4); the write-flap resumed 23:29:05Z–~23:37Z.
    Standalone re-runs attempted during the flap produced 0-byte logs
    (redirect writes EPERM'd) and were discarded, not counted.
  - 2 load timeouts (living-garden, one-person-army deed attainment,
    exact check.js 120s): both exit 0 standalone.
  - occupation-panels: exit 0 standalone, 25 passed, 0 failed
    (gate failure environmental — writes during the flap/VM window).
  - Staleness trio (measurement-proof-update, measurement-workflow,
    phone-frame-proof): fail IDENTICALLY on master 249da4729 in
    read-only runs (proof-update: "Proof source inputs are not
    current"; workflow: 8 passed, 1 failed, same assertion;
    phone-frame: 3 passed, 3 failed, same three assertions) —
    pre-existing standing set; proof refresh round 12 owed.
  - No failure names conversation.js, convo-wants.js, or any dialogue
    test. The D3 fix touches only `convoVillageLine` dialogue text and
    cannot produce EPERM write refusals or 120s timeouts.
- Master moved twice during the adoption: 95dbf07f3 (briefed) →
  b5ae72cd4 (sim-transplant118) → 249da4729 (version bump
  b5ae72cd4-20261113-233744, batch ship) → ef1ba74eb (proofrefresh-b12
  closeout, NO-GO on leg (a) at the version-bump tip). Rebased onto the
  explicit SHA ef1ba74eb read fresh in the main tree immediately before
  rebasing. Rebase clean, no conflicts (r195's conversation.js hunks at
  ~2316/~5741, D3 fix at ~4033; version bump does not touch
  conversation.js). No stop-at-pick quirk.
- Commits (worktree's own safe-commit.sh; index clobber struck after
  BOTH commits and was repaired the documented way — `git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info`, verified
  status empty + diff HEAD empty + hash-object == HEAD blob):
  - 6fb94b57a → rebased 6ccdc325e: D3 fix + proof test [needs-eyes]
    (dialogue wording change — Steve's eyes on the feel).
  - a585ba655 → rebased 9d9fcb1af: prereg + run note (Gate section
    filled at adoption) + driver + analyzer + gate log + 7
    adjudication logs.
- Merge: `git merge --ff-only journey-landing-r130` in the main tree,
  exit 0. HEAD 9d9fcb1af; branch ancestor of HEAD verified; old master
  ef1ba74eb ancestor verified. 14 files, +8332 lines.
- Release: `worktree-release.sh journey-landing-r130 merged` ("released
  ... as done-merged"); `git worktree remove --force` + `git branch -d`
  (was 9d9fcb1af); worktree dir gone, no branch entry. Final
  `worktree-reap.sh` sweep run at closeout (see log /tmp/reap-r130.log
  — reaper output retained only in the adoption session, not committed).
- Rotation: brief said advance 0→1, but the file on disk read **2**
  (mtime 23:58:12Z, written by another run during this adoption;
  rotation-b likewise moved 6→7 at 23:28:57Z). Writing 1 would have
  regressed it. Advanced 2→3, verified with cat.
- Lock: the lock file at closeout held `2026-11-13T23:47:23Z` (twice) —
  NOT this run's run_id (d624422a-c4dc-4bba-a3ff-520450a6758f). A new
  live run took the lock at 23:47:23Z (after the 23:46:53Z VM
  replacement). The r130 lock is gone; the new lock was LEFT UNTOUCHED
  (deleting it would have killed a live run's lock — the Nov 10 lesson).
- Main tree verified clean (`git diff --stat HEAD` empty, `git status
  --short` empty) before this addendum. No bump, no push, no live
  verification (ship loop owns those).

## After this adoption

- Master HEAD at merge: 9d9fcb1af. Since then sim-transplant2 landed
  3 commits on top (63650b80d at addendum time); r130 commits remain
  ancestors. This addendum commits on top of 63650b80d.
- Carried (unchanged from the run note): HEED design call (sooner
  wind-down vs heed that lands); D1 garbled label (r129 fix awaiting
  Steve); proof refresh round 12 owed (incl. r195's src/js changes);
  metric-review proposals (landing-split.json re-seed; presshop
  farUnreached bar re-wording; M-PR1 judged against BEFORE shape);
  M23 metric revision owed (scholar+1 'veterans-short' refusals).
- Flap: window 23:29:05Z–~23:37Z (9 consecutive failed probes) + blips
  23:19:45Z, 23:20:48Z, 23:48:55Z–23:50:58Z; VM replacements
  e6e16cb5→5623d281 (~23:07–23:16Z) and 5623d281→577910a4 (~23:37–
  23:46Z). Clear from 23:52Z through closeout (ALL-OK 00:06:52Z,
  00:07:55Z). Watcher alive (pid 4435 on boot 577910a4).
- Notable during adoption (for the parent, not this leg): Steve ruled
  2026-11-13 18:00 CST on the medicine holderless levers — ALL FOUR
  (scholar-fetch, visiting healer, taught ruin-search, level-up healing
  offers); brief in goal hidden_files
  `medicine-holderless-levers-brief-2026-11-13.md`. Jessyca Fulton
  added to the people index (birthday Nov 18, relationship still
  unknown). proofrefresh-b12 landed with leg (a) NO-GO at the
  version-bump tip (2 version keys) — see ef1ba74eb.
