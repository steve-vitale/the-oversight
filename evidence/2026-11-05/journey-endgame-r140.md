# Journey endgame r140 — RUN NOTE (lane B, leg 4; closed out by main session)

Run scheduled 10:00 CST 2026-11-05; coordinator timed out before
closeout. This note was written by the main session from the run's
committed prereg, pilot/dark logs, per-seed JSON, Ruth diagnostic,
and re-runs of the three proof tests. Nothing here is re-scored
after the fact: bindings are judged as pre-registered.

## Pre-registration
See evidence/2026-11-05/journey-endgame-r140-prereg.md (committed
be77246a8). Substrate e5e6aa59b (includes the awayration2 pack fix).
Pilot seeds 89701/89702/89704/89705, r135-exact probe policy,
180d death-aware. Rotation-b read 4 at start; written to 5 at
closeout after the verified landing below.

## Pilot (4/4 seeds finished)
- 89701 (waves): village-LOST — scattered day 53, "On the third
  hungry day, people started walking", pantry 0, alive 3.
  r135 baseline on this seed: announced d90, sat d92, WON LESSER
  (feared/light). **FLIPPED win→scatter.** Peak living veterans
  1@d40, unlocked wave 4, best seat lesser. The transcript carries
  repeated STARVING lines (empty stomach, spiral started).
  Attribution-first (prereg rule): the named deltas, above all (g)
  away-ration packs sized to the meal's want — pack growth matches
  the new mechanism — with (d) the parting turn and (f) patient_aim
  as secondary candidates. Recorded as a same-run investigation
  item, NOT a road claim. The fix changed hunger outcomes on a
  travel-heavy seed exactly where the prereg said it might.
- 89702 (waves): WON LESSER (feared/light, final:pledge),
  announced d113, sat d133, alive 3. r135: no window, survived.
  Now reaches the window and sits. Standing peak 199.
- 89704 (forcedrift control): village-lost, wave 3, alive 6.
  r135: village-lost (no-successor d45). Same headline.
- 89705 (wavesnw): village-lost, wave 3, alive 4.
  r135: village-lost (scattering d110). Same headline.

Pilot tally: lesser wins 1/4 (89702), full seat 0/4, wave-5
unlocked 0/4, wave-5 faced 0/4. Primary bindings remain NO-GO
(closed road; ally-join fixed vs funnel flat) — the road reading
is unchanged, but the 89701 flip is a real headline difference
vs r135 and is carried as the investigation item above.

## Dark re-run (full, 7 variants, fresh evidence dir)
- S1-sitter-coda: PASS — v3 walk-out line names Amelia Moon
  (the sitter), not Bill Palmer. The r138 fix holds on the new
  substrate. Verified from the dark log (line 97).
- S2-dark-holds: GO — D1–D4/D6 hold; the single non-ok step is
  v1a-loss D2-twist-fired, which is the by-design kill-then-name
  curdle (curdle line present, horror hit 5), the one expected
  non-ok step per the prereg.
- v5-dayfloor withholds the win at day 1 (TABLE WAITS line
  present, table_won=0) — floor works; its ordering wart (final +
  coda play before the withholding) stays documented, not fixed.

## People check / Ruth diagnostic
Ruth (helpful AI) took 16/16 waits in the v1c trial walk while
Wolfgang, Dineo and Lena each struck 16/16. Diagnostic probe
(scripts/probe-ruth-wait-r140-20261105.js, read-only wrapper):
Ruth's distance to the foe never dropped below 2 (distMin 2,
distMax 3) — every adjacent tile blocked — and the old decide
had no fallback for a helpful villager who cannot close. She
waited silently. Raw data:
evidence/2026-11-05/perseed-endgame-r140-diag-ruth/ruth-decide.json.

## Fixes landed in this run (all with proof tests, all re-run by
## the main session during closeout)
- F1 fiDealt (src/js/sigW5.js): the finale's "total" was a
  triangular sum — the player's cumulative damage re-added every
  round (v1c "struck for 439 (1103 total)"). Now tracks the HP
  drop since the last finale turn, all sources, healing never
  subtracts. Proof test-fidealt-r140-20261105.js: PASS
  (card lines 100/100, 150/150, 175/175).
- F2 "You take" (src/js/finale-campaign.js fiTakesLine): the
  player is "You take N.", never "You takes N."; allies keep
  third-person "takes". Proof test-finale-skylines-r140-20261105.js:
  PASS (6 "You take" lines, 0 "You takes", 0 "(MOVE works.)").
  Closeout note: the plain walk stopped hitting the player after
  Fix A changed the fight's course, so the test now parks the
  player under an armed zone each round via the driver's policy
  hook; the four asserts are unchanged.
- F3 "(MOVE works.)" dropped from the sky-fall miss line
  (same file, same proof test).
- Fix A harry-when-stuck (src/js/engine/combat.js): a helpful
  villager who cannot close to strike at distance <= 3 throws a
  harry ([2,4], the brave branch's numbers) instead of waiting
  silently. Strikes still preferred whenever adjacency is
  reachable. Proof test-ruth-wait-r140-20261105.js: PASS
  (silent turns 0).

Held with reason (from the prereg's dark-read list): (d) kill-order
narration ("The Finale falls." before the killing strike line) —
combat-core change, not a playtest-loop fix; (f) V5 day-floor
ordering — needs the floor checked before the final resolves.
(g)/(h) judged acceptable in the prereg.

## Regression gate
node scripts/check.js --quick run in the worktree during closeout
(see goal hidden_files endgame-r140-checkquick-20261105.log):
281 passed, 9 failed in 1034s — identical to the r104 establishment
profile (281/9). The 9 are the standing families (measurement-proof-
update, measurement-workflow, mobile-combat-cadence, occupation-
panels, phone-frame-proof, establishment-r20-fixes) plus three 120s
load timeouts (trust-observer-neutrality, capable-bot, table-
endings), all of which pass standalone. NO new failures from this
run's three src files. Gate passed.

## Metric review
- The 89701 flip shows the pilot's matched-seed design working as
  intended: a real game change (away-ration packs) moved a real
  outcome on a travel-heavy seed. No metric change proposed.
- M1-guard's "voiced non-table path" clause: village-lost scatter
  is voiced (the scattering line), but it is a loss, not a window
  — the binding stays NO-GO on this panel, as reported.
- Carried open: telemetry baseline re-seed is a panel decision;
  SIT-DAY-DEATHS dedupe (r124) stays open; the "teeth fix" still
  stands on its proof test.

## Verdicts
- Reachable: yes — the table, the dark path, the trial fight and
  the lesser seat all fire on the pilot seeds.
- Fun: partial — the finale reads as people (dark walks cohere,
  no fabricated history), but the road stays closed and the
  89701 scatter on hunger is a hard, early end.
- Winnable: not yet — lesser seat 1/4, full seat 0/4, wave-5 0/4.
  The binding failure is still wave-4 kills + killer survival,
  not the table.

## Closeout
Coordinator timed out after the fixes were implemented but before
commit/note/merge/lock-delete. Main session verified the three
proof tests green, repaired the skylines test's walk premise
(Fix A interaction, asserts unchanged), ran the check gate,
committed, merged ff-only, released the tree and deleted the
Lane B lock. Rotation-b advanced 4→5 (social life next).
