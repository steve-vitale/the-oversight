# Journey crisis r186 — LANE B, leg 6 (ADOPTION of dead r182)

Run: oversight-playtest-loop-2, r186. Leg 6 (crisis). Base master 2f796d59b.
Rotation-b reads 6 at run start; this run writes 7 (succession next) at closeout.
Lock: playtest-loop-2.lock run_id loop2-2026-11-12T1355Z. Worktree slug
journey2-crisis (adopted, not re-registered — see below).

## Stale-lock recovery (LOUD)

The previous run, crisis r182 (lock loop2-2026-11-12T1155Z, created 11:55:42Z),
died mid-run. Its worktree heartbeat was 12:58:04Z; at this run's 13:55Z check
that is 57 minutes stale (>15-min rule) and the lock itself was ~2h old (>90-min
fallback). Per the loop rules the previous run is DEAD no matter how fresh the
lock looked. Lock deleted, "stale-lock recovery" noted, proceeded.

Held work inspected (Steve 2026-10-27: inspect held work, keep real work):
the r182 worktree held an uncommitted fix to src/js/convo-wants.js (45+/6-)
plus three untracked scripts (driver, analyzer, proof test) and a completed
3-seed pilot (seeds 14421-14423, JSONs + transcripts in goal hidden_files).
The branch tip f1e603219 was already an ancestor of master, so the held work
is a clean adoption, not a rebase tangle. The work is real: the fix is a
pool-picker for convoWantWarning (see U1/U2 below), the pilot is genuine
measurement. Adopted whole. Nothing released as scratch.

Registration note: worktree-register.sh refuses the already-registered slug,
so the existing registration was kept and heartbeated immediately
(heartbeat_at 2026-11-12T14:01:02Z, verified by read-back; hbloop r186 every
5 min for the whole run). The branch was rebased onto current master before
landing (tip was an ancestor, so the rebase is a fast-forward of the branch
pointer).

## Pre-registration (adopted from r182, with r186 additions)

r182's prereg stands (goal hidden_files/evidence/2026-11-12/
journey-crisis-r182-prereg.md): leg question "the 'a stranger' death cluster
— is it legible?", metrics A1-A7, U1/U2 warn-details, C1/C2/C2b/C3/C3b,
WRAP-CHECK, C7b, Q1/Q5/Q6/Q7 watches, S1-S5 supply. Panel: oracleV2, 150d
death-aware +10d tail, seeds 14421-14425 (fresh band, prereg-checked).

r186 ADDITIONS (adoption, recorded before any new scored seed):
- (E) ELIGIBILITY SAMPLER (record-only, driver): once per day boundary,
  sample the alien-playground gates — apEligible, apEncounterEligible,
  systemArrived, unlockedWave, player tile — plus apReadinessCheck
  {ready, score, reasons}. Pure reads; the 14422 probe proved byte-identical
  reproduction (deaths, sorties, sayLines 7945/7945, convos identical) before
  any panel file was overwritten. Pilot JSONs backed up to
  probe-r186-eligibility/backup-pre-readiness/ first; all 5 seeds re-ran with
  the enriched sampler and reproduced exactly (same check per seed).
- (F) ANALYZER SECTIONS: r182's analyzer shipped WITHOUT the STRANGER +
  RUINROAD sections its prereg promised, so the leg question had no printed
  verdict. Added in adoption (R182 STRANGER A1-A7, R182 RUINROAD S-arm,
  R186 ELIGIBILITY incl. readiness). The analyzer tolerates pre-r186 JSONs
  (eligibility null, armRan false).
- (G) RUINROAD CORRECTION: the pilot ran WITHOUT RUINROAD=1 (all skip
  counters 0, trips 0 — the arm never executed). Instrument-setup miss, not
  a game finding. Expansion seeds 14424-14425 ran WITH RUINROAD=1: the arm's
  first real execution. Pilot arm = not executed, reported as such.

## Panel (binding, 5 seeds)

Seeds 14421-14425, oracleV2, 150d. All five ended game-over (death-aware
horizon; no village survived to the horizon):

| seed | days | end | raids | gorge nights | sorties | convos |
|------|------|-----|-------|--------------|---------|--------|
| 14421 | 144 | game-over | 8 | 30 | 9 | 8 |
| 14422 | 72 | game-over | 5 | 16 | 7 | 7 |
| 14423 | 90 | game-over | 7 | 37 | 4 | 8 |
| 14424 | 123 | game-over | — | — | — | — |
| 14425 | 101 | game-over | — | — | — | — |

(raids/gorge/sorties/convos for 14424-14425 are in the analyzer output;
panel totals below are the binding numbers.)

Attempts 32, ok 14, refused 18, cleared (remaining 0) 2, deltaExact 14,
deltaBad []. D1 snapshots 32/32, delayed>=3 attempts 32/32. D2 clear rate
2/14. D3 drift unknown []. D5 deltaBad []. R59 TRUE early count 0.
R181 SOFTLOCK seeds 0. R154 missed-window corrected 8 (raw 8,
excluded-answered 0; was 5 on the 3-seed pilot). D4 convos 36, fabricHits 0.
WRAP unmarked 0 (36/36 marked). BENCH: refused 18, gateOneShort vs
supplyEmpty split in the analyzer output. Fight-1: broke-after-fight-1 5+,
all vFlee openers; cleared 4, openers mFlee 3 / vKill 1 — villagers mostly
flee the first monster they meet and the sortie breaks.

## A7 — the leg question: VACUOUS, with the mechanism decomposed

**0 alien kills on all 5 seeds. 0 stranger-fight deaths. 0 feed lines,
0 fear lines, 0 retaliation lines. A7 verdict: VACUOUS (no kills) — the
leg question cannot be judged on the crisis leg as played.**

This is not "the channel is rare". The eligibility sampler (530 day-boundary
samples) decomposes it exactly:

- The base gates OPEN early: systemArrived day 8-9, wave 2 unlocked day 8-18
  (day 8+ AND 5 wave-1 ledger kills — the villages kill enough wave-1
  monsters by day 8). apEligible true on 494/530 samples.
- encounterEligible true on **0/530 samples**. Never, on any seed.
- The wrapper gate is apReadinessCheck (score >= 100: party 25 each, threat
  capped at 100, day-30+ 25, system-integration 25, beam-resist 15 each).
  Readiness DID reach 100+: max scores 105-125, ready on 15 samples across
  the panel.
- **But every ready sample was a Haven day, and every away-from-Haven
  apEligible sample was unready.** The two gates never coincide:
  15 ready-days, all at Haven (safe tile → encounter-ineligible); 93
  apEligible away-days, all unready (score < 100). The bot plays solo
  (party 0 on every sample — the party component contributes 0 all run);
  readiness opens only on threat-rating spikes (15 → 100+ on post-fight
  days), and on those days the player is home at Haven.
- No alien ever activated: zero "has entered the game" feed lines in any
  seed. The endgame r185 seed 89708 cluster (4 alien kills d31-47) shows
  the channel works — under a play pattern that keeps a party together away
  from Haven. The crisis bot's home-based survival pattern never meets all
  three gates on the same day.

Plain words: the village never meets the thing that kills people in the
night, because the game only sends it when you are both strong enough AND
away from home — and a village fighting to survive comes home every night.
The "a stranger" cluster is an endgame-leg phenomenon, not a crisis-leg
one, under this play pattern. Whether that gating is right is a Steve
question, not a defect claim: the gates are doing what they were built to
do (readiness: "don't spawn alien players until the player has at least a
slight chance with a party"; safe tiles: villages are safe). The finding
is that the two gates are anti-correlated for home-based play, so the
playground is unreachable on this leg.

## RUINROAD arm: the mechanic works, the medicine doesn't come

- Pilot (14421-14423): arm never ran (RUINROAD env unset). Instrument miss,
  corrected in adoption.
- Expansion (14424-14425, RUINROAD=1): **151 forced ruin searches, 98+62
  trips, 0 bridges, 0 medicine acquisitions, 0 pharmacy deposits,
  0 medicine cures.** Searches returned 10 loot items (Futures Ledger,
  Canned corn, Machete, Memory Lantern x4, Oath Ring, Trail Rations Pouch).
  Medicine IS in these regions' ruin pools (med_antibiotics,
  med_antiparasitic in na_eastern_woodlands) — 0/151 is a rate outcome,
  not a structural absence (loot-hit rate ~6%, medicine a rare subset;
  0 medicine in 10 loot hits is plausible luck). The r181 regional-medicine
  fix is reachable in principle, but the panel shows the acquisition leg
  stays thin: even a player who searches a ruin every single day finds no
  medicine in 151 tries. No cure followed, on either channel
  (medicDutyCures.medicine 0 on all seeds; ability cures 3-15).
- Main panel supply (no arm): ruinSearches 0/1/0 — villagers essentially
  never search ruins on their own, as before.

## U1/U2 warn-details fix: ADOPTED, RED + GREEN verified

- The defect (succession r183, Naran d94): the second dlg:details on a
  warn_you want dry-replaced with "...Sorry, lost my train of thought."
  because convoWantWarning returned one of 3 fixed strings and the
  run-ledger no-repeat block refused the repeat.
- The fix (r182, adopted): convoWantWarning is now a pool-picker — the
  original 3 strings first (verbatim) plus recent-attack, known-monster
  (naming the actual monster), and generic variants, 9-10 total; shuffle,
  take the first variant convoWouldBlock would NOT refuse; null when every
  variant is blocked so the caller falls to its honest dry pool.
- RED verified in-run: with the fix temporarily reverted, the proof test
  fails exactly on the defect ("second warning is NOT run-ledger-blocked ::
  wouldBlock true"). Fix restored; GREEN 12/12
  (scripts/test-journey-crisis-r182-warn-details-20261112.js).
- [needs-eyes] on the commit: warning fiction changed (new lines).

## People check (C3): GO — 41 transcripts read in full

All driven conversations read end to end (28 pilot + 13 expansion files;
36 convos, fabricHits 0, WRAP unmarked 0). The villagers read as people:

- They grieve named dead: "Yuki is gone and the world just... continues."
  (Dmitri d111); "Since Deshawn died... I keep expecting to see Deshawn at
  the fire." (Elena d45); "We lost Hassan and Rukaya. I do the headcount
  without thinking. Then I think." (Nghia d106); "Joshua always took the
  burnt piece. Said someone had to. I take it now." (Hank d31).
- They keep secrets with stakes for others: "I wasn't a comic shop owner.
  I was a trail crew lead. If the wrong people know, it doesn't fall on me.
  It falls on them." (Caitlin d9); "I'm from Beirut, Lebanon. I keep my
  head down." (Yara d124); the candy bar, the photo of someone left behind.
- They name their parties and mean it: FINAL GIRLS CLUB, The Firetenders,
  The Company, APEX SNACKS — "It has a name, which means it can be lost."
- They teach monster knowledge: "That's Ugly-Eyes telling you it's about
  to move. It hunts at night — give the dark a wide berth." (Hank d50).
- Promises have consequences: a forage favor promised on d54 and never
  fulfilled is remembered on d77 — "You said you'd help with the pantry
  run. ...It's done now. Forget it." A declined wound favor closes the
  subject: "They won't raise it again." / "They won't ask twice."
- The double-confession guard fires correctly every time ("I confessed
  that already. I'm not confessing it twice for dramatic effect."). No
  Rafael "weren't there for that one" lines. No VoiceLine prefix stacking.
  No naming-stance wobble. Resume/"settled" lines fire on sittings that
  shared a real beat (Elena d20 resumes the protection thread; d29 settles
  "what's been happening"; d37 resumes grief "that was 8 days back" with
  the day count right).

Watch-level (not defects):
- Stock stall lines repeat across sittings: "Okay. That's — I need a minute.
  A long minute." (4x), "Anyway — where was I?" after silence (3x+),
  "Good talk. I feel like I know you a little better now." / "This was
  good. They mean it." (most sittings), "There's more, but that's for
  another fire." (agency:ask_field, 3x), "Don't tell the others. Everyone
  needs one place." (walk beat, 4x verbatim), "About grief — yeah, we never
  did get back to that." (grief-thread deflection, 2 villagers).
- The dry line "...Sorry, lost my train of thought." fired TWICE in 41
  transcripts: (1) 14421 d124, on a [confront:d_523ecni] pick — a
  non-sequitur right after a real confession on another thread; SAME CLASS
  as the warn-details defect, different surface (confront, not warning).
  Filed as a follow-up fix item, not fixed in this run (the confront
  machinery in truth.js needs a trace of which doubt id maps to what
  content; the warning-pool fix is the scoped adoption). (2) 14425 d99,
  on a [deflect_q] after Ella said "I'm not okay" — reads IN CHARACTER
  there (she was interrupted mid-confession and loses the thread), so the
  dry line is sometimes a graceful evasion and sometimes a non-sequitur.
- Driver artifacts, not game defects: Yara d118 runs 8 confronts in one
  sitting and breaks on the 16-turn driver cap; the driver asks
  "Why can't I do this now?" 3-4 times per favor sitting (the game answers
  with honest variants each time); the driver never walks to a partner's
  side of the Haven door, so favors stay promised and go stale.

## Village assessment (plain words)

Five villages, all dead by day 72-144. They were not starved out of
nothing — they fought: 14 sorties went out, 2 cleared everything in front
of them, and the villages killed wave-1 monsters in the first week (wave 2
unlocked by day 8-18 on every seed). But they mostly ran from what they
met: the first fight of a sortie ended with the villagers fleeing on most
attempts, and refused sorties (18) outnumbered successful ones (14) —
half for want of a fighter to spare, half because the pantry was empty.
By the end the villages were down to one or two living people and the
game called it. Nobody reached the table; nobody was ever offered a seat;
no alien ever walked into the game to meddle with them. The pantry
recovered on one seed (2985 kcal at the end) and hit zero on the others.
The dead are named in the record — Elena Weber (sickness), Renata
(starvation), Gabriel Flynn, Ishaan Joshi, Akos Laryea (wounds that
wouldn't close) — and the living mourned them by name in conversation.

What was missing: the alien players never showed up (see A7); no medicine
was ever found (see RUINROAD); favors were promised and left hanging
because the player never stood beside the asker; and no village lived
long enough to test whether the crisis leg bends or breaks a strong
village — all five broke.

## Verdicts

- REACHABLE: yes. Raids, gorge nights, sorties, favors, mourning, party
  naming, monster-knowledge teaching all fire on ordinary seeds.
- FUN: the conversations are the strongest part of the leg — grief,
  secrets, party names, promises with consequences. The fighting is the
  weak part: sorties mostly end in flight (vFlee dominates fight-1) and
  full clears are rare (2/14), so the crisis leg as played feels like
  enduring, not winning fights.
- WINNABLE: not on this leg as played — 5/5 game-over, no village near a
  seat, and the leg's own question (the stranger cluster) is unanswerable
  here because the alien channel never opens. That is consistent with
  "the game stays tricky" — but the winnability chain has to be judged on
  the endgame leg, where the kills actually happen.

## Metric review (§14)

- A7 as pre-registered is UNJUDGEABLE on the crisis leg: the metric needs
  kills, and the channel never fires under this policy. Proposed revision
  for the NEXT run: move the stranger-legibility question to the endgame
  leg (r185's 89708 cluster is the live example), or run the crisis leg
  under a party-carrying policy that keeps readiness >= 100 while away
  from Haven. Do NOT re-score A7 against a friendlier metric mid-run.
- S1-S5 (ruin-road arm): the arm now runs, but 0/151 searches leaves the
  medicine rate unconstrained. Next run: keep the arm on the expansion
  seeds and report the rate cumulatively; a 0/300 would start to look
  structural rather than luck.
- Q1 missed-window corrected 8 (was 5 on 3 seeds): watch, no bar change.
  Q6 gorge-after id-match watch stays at 0 (20th+ panel at zero — r181
  metric review: if zero through r190, the bar itself gets re-judged).
- The eligibility sampler fires at day boundaries, sometimes twice per
  game day (d31 sampled twice with different threat scores) — counts in
  the ELIGIBILITY section are samples, not days.

## Telemetry

telemetry-check vs crisis.json baseline (defendedFights): quiet — 5 files,
1 metric, no large deviations. Baseline NOT rolled forward (no regime
change; the check is a quiet confirmation, not a reseed).

## Gate / landing

Adopted in the main session (the 08:00 run timed out before closeout; its
hbloop was killed by exact PID and the worktree heartbeated by the adopter —
same pattern as the r181 adoption). The run's test-capable-bot edit had
duplicated the upkeep+feast block (second `const feast` → SyntaxError); the
adopter deleted the FIRST (pre-wrapper) copy, keeping the intended
wrapper-before-upkeep order. Proofs re-verified by the adopter on the
worktree tip:

- warn-details proof: **12/12** (scripts/test-journey-crisis-r182-warn-details-20261112.js).
- capable-bot: **42/42 with the fix** (log hidden_files/r182-capable-bot-fix.log)
  and **42/42 on the pre-fix base** (log hidden_files/r182-capable-bot-base2.log;
  the first base attempt timed out in the short-sims campaign subprocess
  under load with the food chain green throughout — transient, not a
  regression). The test file's NOTE claim ("passes with the fix and on the
  pre-fix base") now holds as verified by the adopter, not just as claimed.
- convoWantWarning null return is a designed contract: conversation.js
  (defect-8) falls to the honest dry admission when engageBeat returns null.

Rebased onto master 5c4361ccc at landing (eldergrammar a5b75cab8 +
bisect-r7-cut 5c4361ccc landed after the run's base f1e603219).

Gate: check.js --quick on the rebased tip — [PENDING; filled below when it lands].
