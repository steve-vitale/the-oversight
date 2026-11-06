# Journey endgame r144 — Lane B, leg 4 (2026-11-06 03:00 CST run)

Pilot: 4 seeds (89701 waves, 89702 waves, 89704 forcedrift control,
89705 wavesnw), 180d death-aware. Substrate: master `b5fb49607` EXACTLY.
Prereg: `journey-endgame-r144-prereg.md` (this dir). Analyzer output:
`journey-endgame-r144-analysis.txt`. Pilot log:
`journey-endgame-r144-pilot.log`. Per-seed corpora:
`perseed-endgame-r144/`. Dark re-verify:
`perseed-endgame-r144-dark/` + `journey-endgame-r144-dark.log`.

Run incidents: the coordinator timed out before closeout; this note was
written by the main session from the committed pilot + analysis + dark
re-run (dark probe re-run by the main session on the r144 substrate,
exit 0). Rotation-b read 4 at run start; bumped to 5 at closeout.
Lock `playtest-loop-2.lock` deleted at closeout (run verified dead:
heartbeat frozen at 09:51:59Z across re-checks, zero worker processes,
zero heartbeat-loop processes).

## Headlines (per seed)

- **89701 waves: village-LOST — scattered d78, pantry 0, alive 1.**
  Standing peak 135, uw=4. The scatter persists a third time
  (r140 d53, r143 d80, r144 d78). The 89701 flip investigation stays
  open; the away-ration attribution is still the leading hypothesis,
  still not proven.
- **89702 waves: village-LOST via WITHDRAWAL d90, alive 1.** Standing
  peak 199, uw=4. The table withdrew ("WE PRICED THE RUN. NO HUNGER
  ON THE RECORD…") and never offered again. This is the second
  withdrawn-table case (first: 99767 trickoff, 0130Z round) — the
  withdrawn-table steve-call (permanently gone, or re-offer on wave-5
  proof?) now has a second datapoint. See flip investigation below.
- **89704 forcedrift: village-LOST — scattered d48, alive 4.**
  Standing 0, uw=3. Control behaves as control.
- **89705 wavesnw: WON LESSER — announced d90, sat d90, feared/light,
  final:mercy, alive 1.** Standing peak 199, uw=4. Flipped the other
  way from r143 (village-lost scattered d99 → lesser win).

Tally: lesser 1/4, full 0/4, wave-5 unlocked 0/4, faced 0/4, wave-4
kills 0. Median survival: n/a (pilot of 4; villages lost d48–d143).

## 89702 flip investigation (vs r143 post-fix pilot)

Same seed, same probe policy, only game-code deltas (a)–(f) between
the substrates (see prereg). r143-postfix 89702: WON LESSER, announced
d90, sat d108, alive 7, census 12 fights, feast chain feasts 2 /
armed 2 / feastedDays 9 / surge d28 + d98, devotionChannels 88,
huntSorties 10. r144 89702: village-LOST via withdrawal d90, alive 1,
census 17 fights, feast chain feasts 2 / armed 0 / feastedDays 0 /
surge never, devotionChannels 118, huntSorties 3.

The withdrawal itself fired correctly and consistently: no feast or
surge on the record → "NO HUNGER ON THE RECORD" → the table
withdrew. The underlying cause is trajectory divergence on a single
seed: the feasts happened (2 in both runs) but in r144 none carried
the surge — armed feasts 2 → 0, feasted days 9 → 0. No single delta
is implicated by the evidence. Fix C already proved fight-outcome
changes re-roll whole trajectories (r143 pre→post-fix moved this same
seed's sat day d102 → d108 and its fight count 6 → 12), and deltas
(a)–(f) include fight-adjacent changes (Fix C, D-THING pocketed-thing
firing in the wild, enddaybeats gating on being at Haven). A
controlled bisect would be a new arm, not a closeout item. Recorded
as: single-seed trajectory divergence, mechanism unassigned, no
revert indicated — the withdrawal rule behaved as written on the
trajectory it was given.

## Fix B volume (prereg question 6)

"holds and watches" counts in pilot transcripts: 89701 **547×**
(r143 post-fix: 120×), 89702 17×, 89704 0, 89705 0 (r143 post-fix:
62× — its trajectory changed; it sat d90 with fewer fights). The
lines cluster in threes (three villagers waiting in a row, near
identical) — the same pattern as r143, worse on 89701. Verdict: the
follow-up is now concrete, not a feel note — varied hold lines OR a
once-per-fight cap. Queued as the next endgame build item (own proof
test + post-fix pilot; not built in this closeout).

## Dark re-verify (S1/S2 — GO)

Full dark probe re-run as r144 (7 variants, same policy, fresh dir
`perseed-endgame-r144-dark/`): **identical to r143** — v1a 26/27
(D2-twist-fired curdled, the expected by-design non-ok), v1b 23/23,
v1c 24/24, v2 18/18, v3 25/25, v4 20/20, v5 17/17.

- **S1-sitter-coda GO:** the v3 walk-out line names the sitter,
  Amelia Moon — not Bill Palmer.
- **S2-dark-holds GO:** D1–D4/D6 green on the new substrate.

## r143-fix verification in the wild (closeout greps)

Verified by the main session across ALL r144 pilot transcripts:

- **V-FixC UNMEASURED (not failed):** 0 harry lines in any pilot
  transcript, and the "cannot reach / out of reach / stuck" hits are
  all flavor text (fox movement, Living Wire counter advice, commune
  dialogue) — no finale fight with a stuck helper arose in this
  4-seed pilot, so the help-branch fallback had no case to fire on.
  Falls to the next endgame run.
- **V-FixB HOLDS:** waits narrate — 564 "holds and watches" + 62
  "waits." lines, zero silent turns observed. The volume follow-up
  above is the remaining item.
- **V-Gorge HOLDS:** 0 "gorges — 0 kcal gone" lines.

## People check

The sitting seed's finale reads as people: 89705 announced d90, sat
d90 lesser, walked feared/light, final:mercy — "Show mercy… the
audience weeps, and the galaxy learns that the feared one chose
gentleness." 89702's withdrawal is voiced in full, with the reason
on the record (no feast, no surge, pellet humming where the fire
should be). Deaths carry names and causes (Chloe Dubois d78 the
wild, Ines Duarte d105 the wild, Nora Wilson d107 eulogy,
Hongmei Yang d135 the arena). No fabricated shared history, no
filler loops in the sampled passages.

## Verdicts (from analysis)

GO: M1-guard 4/4, M2-census, M2c, M2d (13/13 classified), M2b
(6/7 causal, 1 day-window-only), M8-exit-canon, MFLEE-routed 2/2,
M13, M14, M5 (vacuous), M5b (vacuous), M10, M11, M12, M15, M16,
M17, KILL-ANATOMY 26/26, M18, M19, M20, M21, M22, REG-r35, REG-r37,
VETCONV 3/3, SECOND-VETERAN 3/3, FIRENARR 4/4, HURTRETURN 4/4,
FALLEN-ambush 4/4, LOSSKIND 3/3. NO-GO (expected road reading, not
pilot failures): M3-conversion 0 kills, M3b-peak 0, M4-wave5-or-full
0/3, W5-question (no uw=5 seed). **PRIMARY-BINDINGS NO-GO |
PRIMARY NO-GO | ALL NO-GO** — the road is closed; the pilot
bindings hold.

## Reachable / fun / winnable

- Reachable: partly — the lesser seat is reachable (89705, fourth
  pilot in a row with a lesser win on some seed); the full seat and
  wave 5 are not reached by any pilot seed.
- Fun: yes on the sitting seed (the mercy final lands); the
  scattering losses read as real defeats, not bugs.
- Winnable: not yet — full seat 0/4, wave-5 kills 0, no seed banks
  2 living wave-4 killers.

## build-smallfixes recovery (parallel, landed in this closeout)

[PENDING — filled after the rebase + gate + merge.]

## Gate

[PENDING — filled after the gate run.]

## Metric review

- The 89701 flip investigation (r140) stays open: third scatter in a
  row, same seed, different day. The away-ration hypothesis needs a
  discriminating test, not another observation.
- The withdrawn-table question now has TWO datapoints (99767, 89702):
  both villages stood at wave-5 proof with the table gone. The
  steve-call (permanently gone vs re-offer) is the open item — do not
  build either behavior until he picks.
- Fix B volume: the once-per-fight cap vs varied lines is a build
  choice for the next endgame run, not a metric change.
- SIT-DAY-DEATHS dedupe (r124 proposal) stays open: no sit-day death
  this run (89705 sat d90, no deaths that day).
- Telemetry baseline: NOT rolled on a quiet check (see telemetry
  section in the closeout note).

## Carry-forwards

- V-PocketSand + V-RaidDensity wild verification falls to the next
  endgame run (the smallfixes code was not in this pilot's substrate).
- V-FixC wild verification falls to the next endgame run (no case
  arose).
- Fix B volume build (varied hold lines or once-per-fight cap).
- 89701 flip investigation (third scatter).
- Withdrawn-table steve-call (second datapoint: 89702).
