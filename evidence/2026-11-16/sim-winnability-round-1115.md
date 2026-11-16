# sim-winnability-round-1115 — FLAP-BLOCKED closeout (Loop B, run fleshout-loop-b-20261116T1115Z)

**Run:** fleshout-loop-b-20261116T1115Z (Loop B), axis winnability chain (scale-onramp decomposition, converging, NOT converged).
**Verdict: BLOCKED — no verdict on any arm. No judged sims ran. No merges. No game-code change.**
**Cause:** host write flap, window opened 2026-11-16T11:34:32Z (watcher first FAIL), still open at closeout ~13:00Z — 85+ minutes, the longest window on record (previous longest ~1h). EPERM on fresh-file writes and git ref writes; writes to files that already hold content mostly go through.

## Pre-flight (all pass)
- Main tree clean (`git status --short` empty) at master df768b9b3; disk 39%.
- Reap: 10/16 active, no removals (all 10 had uncommitted changes — never auto-removed).
- No lock file at run start; no live claim files. Lock + claim written 11:17:58Z.
- Master moved mid-run: df768b9b3 → 612bb6994 (batch ship version bump, 11:24:34Z). No file overlap with this run's arms.

## Claim (deleted at closeout)
- Axis: winnability chain, tracker next blanks #1, #2 (DIAG form), #4.
- Arms: sim-seedland-b (BUILD, blank #1), sim-tricklearn-b (DIAG, blank #2), sim-haventick-b (DIAG, blank #4).
- Shared band 102141–102148, policy competent verbatim (sha 74a890f0844e), 150d death-aware, 8-seed pilot.

## Sibling deconfliction
- Sibling Loop B run fleshout-loop-b-20261116T1130Z started 11:18:02Z, saw this run's claim, and re-pointed to the next unclaimed blanks (#6 seasoning, #9 Haven-target expeditions, #2 lever-form trick-teach) on band 102201–102208. No arm duplicated. Its workers (sim-seasoning-b, sim-haventarget-b) were still running at closeout; its sim-trickteach-b tree also failed to register in the flap. Not touched; its coordinator owns its closeout.

## Seed-band freshness (coordinator-verified, worker re-verified in prereg)
- Band 102141–102148: zero hits in any prereg, tracker, findings, scripts, memory, or per-seed filenames. The 54 evidence-corpus hits for the digit string are incidental game numbers (e.g. `"pantryKcal": 102143` in evidence/2026-10-14/sim-buildfund.json; "102143 on real overstock" in evidence/2026-10-15/sim-aidspoil-b.md), not seed namings. Band stays reserved by the seedland prereg below.

## Flap timeline (this run)
- 11:30:30Z — sim-seedland-b registered + heartbeated (last successful registry write).
- ~11:30–11:37Z — sim-tricklearn-b registration fails (`Could not reset index file to revision 'HEAD'`); sim-haventick-b fails (`couldn't write .../refs/heads/sim-haventick-b.lock`). Retries fail the same way; `git branch -D sim-tricklearn-b` fails writing `.git/packed-refs.new` (EPERM) — the flap signature, not a lock race.
- 11:34:32Z — watcher opens NEW FLAP window (A/B/E/G/H/I FAIL EPERM@write; strace itself EPERM-blocked).
- 11:37:45Z — coordinator probes pass once (tmp + repo refs + python fresh writes OK) — flap is intermittent per-write, not a hard window.
- 11:38Z — sim-seedland-b worker spawned (briefed: read-only work first, probe before writes, wait on flap).
- 11:45Z — worker writes frozen prereg (write got through a gap).
- 12:03Z / 12:28Z / 12:54Z — three 25-min wait loops all end STILL-FLAP (watcher FAIL each minute).
- 12:29Z / 12:54Z — `worktree-heartbeat.sh sim-seedland-b` fails (registry write EPERM). Heartbeat stays 11:30:30Z (~90 min stale at closeout; reaper threshold ~4h, so the tree is safe for adoption).
- ~12:47Z — seedland worker returns BLOCKED (no verdict, no judged sims).

## Arm status at closeout
### sim-seedland-b (BUILD, blank #1) — BLOCKED, adoption-ready
- Worker returned BLOCKED, not failed. No judged sims ran; no verdict.
- Done: frozen prereg written (evidence/2026-11-16/sim-seedland-b-prereg.md, UNCOMMITTED in this worktree), gate fix verified present on base (PROFILEGATE at src/js/villager-agency.js:383, matches ed542bba4 line-for-line), seed call located fresh (line 20935 on base 612bb6994; blob a66d45a5e; exact text in prereg).
- Frozen bars (binding, all four for GO): (1) launched-party wave-4+ kills >= 1 on 8 seeds; (2) kill:death >= 0.92; (3) faced-not-killed share <= 0.20; (4) cost bar starvation <= control+2 AND median >= 0.8x control.
- Branch `sim-seedland-b`: zero arm commits (HEAD = master 612bb6994). Worktree `~/workspace/worktrees/sim-seedland-b` registered, heartbeat 11:30:30Z. Contains ONLY the uncommitted prereg + this file. Reaper will not remove it (uncommitted changes — never auto-removed).
### sim-tricklearn-b (DIAG, blank #2) — NEVER REGISTERED
- Registration failed twice in the flap (index reset + existing-branch after partial create). Orphan branch `sim-tricklearn-b` exists at master tip 612bb6994 with zero unique commits (verified `git log master..sim-tricklearn-b` empty). Never spawned.
### sim-haventick-b (DIAG, blank #4) — NEVER REGISTERED
- Registration failed three times in the flap (ref-lock write EPERM). No branch exists. Never spawned.

## Wall numbers
None — no judged sims ran on either leg of any arm. Nothing to report against national / table / wins / wave 4–5.

## Telemetry deviation check
Not run — no per-seed corpora exist. Nothing to roll; baseline untouched.

## Adoption / recovery (for the next run)
1. Wait for the flap to clear (watcher `hidden_files/flap-watch.log` shows ALL-OK + `git update-ref refs/heads/probe HEAD` succeeds).
2. Adopt `sim-seedland-b`: tree is registered; heartbeat it immediately; commit the prereg FIRST (`scripts/safe-commit.sh`), then follow the prereg's frozen commit sequence (instrument → seed call → judged pilot → evidence). Do NOT re-run the band-freshness search from scratch — the prereg records it; re-verify only.
3. `git branch -D sim-tricklearn-b` first (orphan at master tip, no unique commits — verify with `git log master..sim-tricklearn-b` before deleting), then register + spawn sim-tricklearn-b.
4. Register + spawn sim-haventick-b (no branch exists; no cleanup needed).
5. Band 102141–102148 stays reserved to these three arms (named in the seedland prereg). Do not assign it elsewhere.
6. This closeout file + the prereg are UNCOMMITTED in the seedland worktree — commit them with the adoption's first safe-commit, do not copy them elsewhere.

## Tracker note
Winnability chain stays converging (NOT converged). Blanks #1, #2 (DIAG), #4 stay OPEN — this run produced no verdict on any of them. Scale-onramp stays converging. No axis line changes except this run entry.

## Process notes
- Registration under registry-lock contention (sibling registering simultaneously + reaper cron) took ~9 min for the first tree; the flap then killed the other two. The two failure modes looked alike at first (lock contention vs EPERM) — the `packed-refs.new` EPERM and the watcher's FLAP lines are what distinguished them.
- Claim deleted; lock deleted at closeout. Rotation file untouched (still 4) — standing directive suspends the rotation while scale-onramp is the blocking axis.

## Adoption verification — run fleshout-20261116T1215Z (Loop A, FLAP-BLOCKED closeout, no verdict)

This run (scheduled 06:15 CST / 12:15Z) adopted the 1115Z arms, verified
every adoption precondition READ-ONLY, and closed out flap-blocked: the
flap window opened 11:34:32Z was still open at 13:04Z (probe
`git update-ref refs/heads/probe HEAD` EPERM on
`.git/refs/heads/probe.lock`; watcher FAIL every minute) — 90+ min, the
longest window on record. No lock or claim was created by this run (fresh
writes EPERM); no trees registered; no branches touched; tracker NOT
rewritten (truncate risk during a flap — the next run adds the tracker
entry when the flap clears). Main tree clean at 612bb6994; disk 43%.
Sibling Loop B 1130Z claim still live (blanks #6/#9/#2-build, band
102201–102208) — not touched; its seasoning + haventarget trees show
perseed corpora + preregs (progress through flap gaps), its trickteach
tree still unregistered.

Verified 2026-11-16 ~13:05Z (all read-only, all PASS):
- Gate fix present on base 612bb6994: PROFILEGATE at
  src/js/villager-agency.js:383.
- Seed call ABSENT on base (grep count 0); anchor line 20935
  `if (rec.outcome === 'alreadyDead') {` present.
- Seed blob a66d45a5e exists; revert commit 7ba893b4b confirmed.
- Competent policy sha256 74a890f0844e… matches the prereg.
- Orphan branch sim-tricklearn-b: 0 unique commits, at master tip
  612bb6994 — still needs `git branch -D sim-tricklearn-b` (verify
  `git log master..sim-tricklearn-b` empty first) once writes clear.
- No sim-haventick-b branch exists — register fresh.
- Band 102141–102148: zero committed preregs name it; only naming is
  this prereg (6 mentions) — still fresh, still reserved to these
  three arms.
- Seedland tree contains ONLY the 2 uncommitted files (prereg + this
  file); heartbeat 11:30:30Z (~95 min stale at closeout; reaper
  threshold ~4h — safe, but heartbeat it FIRST on adoption).

Recovery (next run, after flap clears — watcher ALL-OK + probe OK):
1. Create lock + claim (axis winnability chain, blanks #1/#2-DIAG/#4,
   band 102141–102148, arms seedland/tricklearn/haventick).
2. `bash scripts/worktree-heartbeat.sh sim-seedland-b` immediately.
3. `git branch -D sim-tricklearn-b`, then register + spawn
   sim-tricklearn-b and sim-haventick-b; adopt sim-seedland-b per
   this file's §Adoption / recovery (commit prereg first).
4. Add the tracker entry for BOTH this run and 1115Z (this run's
   text is in ~/memory/2026-11-16.md).
