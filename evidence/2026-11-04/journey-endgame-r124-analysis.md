# Journey endgame r124 — PILOT analysis (lane B, 2026-11-04 02:00 CST run)

Substrate r118 exactly; probe = r121 verbatim except renames +
evidence dir 2026-11-04/perseed-endgame-r124 + ONE new read-only
instrument (FIRENARR scan over the full SAY capture). Base master
33900dfaa. Pilot seeds 89701 (waves), 89702 (waves), 89704
(forcedrift control), 89705 (wavesnw). 180d, death-aware. PILOT
EXIT 0. Analyzer exit 1 solely on the road tallies (M3/M3b/M4/
W5-question) — the expected closed-road reading, same as r121;
every pre-registered pilot binding is GO (see below).

## Pilot table (r121 -> r124, matched seeds — IDENTICAL on every headline field)

| seed | r121 | r124 |
|---|---|---|
| 89701 waves | announced d140, sat d141, WON LESSER (feared/light, final:mercy), 16 fights (2 vKill, 10 talkDown, 1 vFlee, 1 mFlee, 2 otherEnd), uw4, standing 199, peakVet 1@d51 | IDENTICAL: announced d140, sat d141, WON LESSER (feared/light, final:mercy), 16 fights, same outcome list, uw4, standing 199, peakVet 1@d51, kills algorithm d50 + strike d113 |
| 89702 waves | announced d107, sat d107, WON LESSER (beloved/light, final:audience), 11 fights (2 vKill, 3 mFlee, 4 vFlee, 2 otherEnd), uw4, standing 199, peakVet 1@d78 | IDENTICAL: announced d107, sat d107, WON LESSER (beloved/light, final:audience), 11 fights, same outcome list, uw4, standing 199, peakVet 1@d78, kills eater d78 + eater d101 |
| 89704 forcedrift | village-lost/scattered d61, 0 fights, uw3, standing 25, 18 death channels | IDENTICAL outcome class: village-lost/scattered d61, 0 fights, uw3, standing 25, 18 death channels (16 unique vid+day; see metric review on channel double-counting) |
| 89705 wavesnw | announced d90, sat d104, WON LESSER (beloved/light, final:quiet), 16 fights (1 vKill, 12 mFlee, 2 vDie, 1 vFlee), uw4, standing 199, peakVet 1@d104, sit-day death Diana d104 (wild) | IDENTICAL: announced d90, sat d104, WON LESSER (beloved/light, final:quiet), 16 fights, same outcome list, uw4, standing 199, peakVet 1@d104, sit-day deaths Diana d104 (wild) + Scarlett d104 (combat) |

Road tally: uw5 0/3 waves seeds, wave-5 faces 0, full seats 0,
lesser wins 3/3 sitting seeds. Standing peaks 199/199/199 — never
200+. Full-seat gap uniform: w5 0/2 (veterans also short at 1/2 on
all three sitting seeds).

## Bindings (prereg, pilot-scaled — the judge)

- M1-guard: GO 4/4 (announced / honest-death on all four; pilot
  bar >=3/4 applied, r121's stale >=5/7 denominator retired).
- M2-census: GO — every fight outcome named, engine opens == census
  fights, 0 errors. M2c GO, M2d GO (23/23 uncommitted classified).
- MFLEE-routed-coverage: GO 16/16 — every mFlee carries gotAwayLines
  + closeSnapResult field, ALL gotAway-only. Zero monFled=true on
  any kind: NO monster-commitment violation.
- KILL-ANATOMY-coverage: GO 43/43 multi-turn fights.
- M5-voicing-canonical: GO via the newly applied vacuous rule —
  control dead before the window (89704 village-lost) with NO relay
  final in the block, so voicing is unmeasured, not failed (r121
  metric-review proposal, applied before this run's scoring).
- M10-fullseat-gap: GO 3/3, named w5 0/2.
- M11-standing-peak: GO 3/3 reported, 0 at 200+.
- FIRENARR-captured: GO 4/4 JSONs carry firenarr arrays; total
  lines = 4, ALL on the control seed (see findings).
- ROAD-TALLY (not gated): 0 uw5, 0 faces, 0 full seats. M3,
  M3b-peak, M4-wave5-or-full, W5-question NO-GO are the tally
  reading of the closed road, not pilot failures (same reading
  as r121; the analyzer's PRIMARY NO-GO is driven by those tally
  ids being in its primary list).

## Interesting findings

1. THE PILOT REPRODUCES r121 EXACTLY — and that IS the finding.
   Since r121, the only game changes are firenarr narration
   (de1271d6f, narration-only by spec), hierarchy crisis wording
   (def4f8f40, wording only), and a tbobsfeed lever plus its KILL
   revert (net src diff zero). A narration-only delta should
   change no outcome — and on these 4 matched seeds it changed
   none: same announce/sat days, same seats, same finals, same
   fight counts and outcome lists, same standing peaks, same
   veteran peaks. Stronger still: the three sitting seeds'
   announce-sliced transcripts are BYTE-IDENTICAL to r121's
   except the header line, and the control transcript differs
   ONLY by the 4 firenarr lines. The narration-only claim is
   confirmed on this pilot, not just asserted.
2. FIRENARR FIRES ONLY WHERE STORES ACTUALLY COLLAPSE — 0 lines on
   all three sitting seeds, 4 lines on the dying control (89704):
   E1 d26, F d38, ESC d39, E2 d47. The kind sequence is
   spec-consistent across stretches (E1, then a reset, then F
   with its one escalation ESC, then a reset, then E2-first).
   Sense-checked in transcript context: E1 and F each precede a
   night raid carrying off ~1,400–1,500 kcal (the warning lands
   the evening before more is taken); ESC follows on a
   fever/triage evening while the store is still falling; E2
   lands beside "Haven's pantry is empty. Day 1 of hunger" with
   Jorge starved and Benoit dead — "the shelves are nearly bare"
   is literally true. No firenarr line appears in any table or
   audit final (sitting seeds have none; the control never
   reaches a table). The zero on fed, feasting villages is the
   expected reading, not a miss: a thinning-store warning should
   stay silent while villages feast and surge. What this pilot
   does NOT show: firenarr on a village that thins but recovers
   (the warning-then-recovery arc) — that needs a thinning-but-
   surviving seed, named as the next firenarr question.
3. SIT-DAY DEATHS RECUR, EXACTLY: 89702 Nadia d107 (alien, sat
   day, as in r121) and 89705 Diana d104 (the wild, sat day) +
   Scarlett d104 (combat, sit day) — the same pattern class for
   the fourth/fifth instance. Narration is strong (see people
   check); the pattern itself remains a named watch, not a
   defect claim: the bearer repeatedly dies the day the village
   sits. Counting nuance found this run: the analyzer's sit-day
   list prints Scarlett twice because deathRecords records one
   death through two channels (tbVillagerFalls + registerDeath).
   One death, two channels — the sit-day table should dedupe by
   vid+day (see metric review).
4. 89705's DISSOLVE-HEAVY SHAPE PERSISTS UNCHANGED: 16 fights, 12
   mFlee (gotAway), 1 kill — the same shape r121 flagged. With
   outcomes byte-identical, this is now a twice-observed stable
   shape, not a one-run wobble. Diagnosis (not a fix) remains
   the next arm's question, per r121.
5. HIERARCHY WORDING UNOBSERVED HERE: no covenant-crisis line
   appears in any pilot transcript, so the "trust -10" naming
   change (def4f8f40) is neither confirmed nor contradicted by
   this pilot. The raid lines' "(Trust -10.)" suffix was already
   present in r121 (transcripts identical), so it is not the
   hierarchy change. A hierarchy-crisis seed is needed to
   observe that wording; this pilot does not supply one.

## Village assessment (plain words)

- 89701: nineteen deaths across the run (monsters, aliens,
  dehydration, contests, one wound that wouldn't close), but the
  village held together, banked one veteran (algorithm d50, then
  Ruby Callaghan's strike kill d113), feasted its way back from
  a d90 withdrawal, and sat at the lesser seat feared/light with
  a mercy final. Three people alive at the end, pantry 5,241
  kcal. What was missing: armor (3/4 fighters armored), weapons
  (3/6 armed), a second veteran, and any wave-5 face.
- 89702: thirteen death channels (twelve distinct deaths), two
  eater kills banked one veteran, sat the same day it was
  announced (d107) and won lesser beloved. The bearer Nadia died
  of alien causes ON sit day — the village won with its bearer
  dying at the door. Seven alive at the end. Missing: the second
  veteran and any wave-5 face.
- 89704 (control): eighteen death channels (sixteen distinct
  deaths: sickness 5, wounds 3, starvation 2, combat/ambush/
  wild/contest/stranger), zero fights, zero feasts, pantry 0,
  scattered d61 on the third hungry day ("Haven couldn't hold").
  A village that never got to fight at all — the control's story
  is attrition, not battle — and the only village firenarr spoke
  to, four times, as its store collapsed.
- 89705: fifteen death channels (fourteen distinct deaths), but
  the village feasted hard (3 feasts, 8/8 feast-surge feeds, 21
  feasted days) and fought often without finishing — twelve
  fights walked away from. Diana held the fire until sit day
  itself, died in the wild that day, and the mantle passed to
  Leo Martin, 16, trail crew lead, who sat the lesser seat
  beloved and spoke for the quiet ones. The sit-day influencer
  kill banked the first veteran on sit day itself — too late to
  pair. Missing: a second living veteran and any wave-5 face.

## People check (transcripts read, sense judgment)

PASS, on re-read of the key passages of the byte-identical 89705
transcript (the full transcript is identical to r121's except its
header, so r121's full-read judgment carries over to identical
text; this run re-read the succession, audit, and finale passages
rather than pretending a fresh full read of unchanged lines):
"The Codex turns a page on its own. Diana Osei is dead. You didn't
ask. It knew." / "The village stops. Somebody screams. Somebody
else starts digging." / Rafael: "You're not Diana... You'll have
to earn this face." / Leo arrives with his own kit (Bloodhound,
Echo Location, Berserker Rage, Lucky Rock, Trophy Room, Night
Eyes) — purpose-made, not blank — takes Diana's items ("Your
hands know what they did", +14 trauma), is spoken for at the
grave ("Diana trusted them. We saw it."), and the docket does not
cross the grave ("The village's quarrel was with Diana — and
Diana is dead") while the village still remembers. The audit
reads the run back honestly (lesser seat, waves 1–3 faced
21/12/9, 7 wave-4 fought, 9 contests, 4 crises) and the beloved
final speaks for the quiet ones. Firenarr lines in the control
transcript read as village speech, not ledger noise (see
finding 2). Texture notes carried from r121, not re-litigated:
ambient-line repetition ("Smell that? Something's different
here.", "You wait. The light changes.") is a content pass, not a
pilot fix.

## Blank filled or documented

DOCUMENTED (no game fix landed — gating freeze + root-cause-first):
(a) Firenarr in endgame: fires only on the collapsing control,
spec-consistent kind sequence, sensible in context; the
thinning-but-recovering arc is the named next question. (b)
89705's dissolve-heavy shape, now twice-observed stable. (c)
Sit-day-death pattern, recurring exactly, plus the channel
double-count nuance. (d) Hierarchy crisis wording unobserved in
this pilot. No src/js changed this run; probe + analyzer +
evidence only.

## Metric review (§14 — proposals for the NEXT run, not this run's scoring)

- SIT-DAY-DEATHS dedupe: deathRecords records one death through
  two channels (tbVillagerFalls + registerDeath). The sit-day
  table should dedupe by vid+day (and the analyzer's sit-day
  section should say so), or one death will keep reading as two.
- M5 vacuous rule worked: the r121 proposal (control-dead +
  zero relay finals = INFO/vacuous) judged this pilot cleanly
  instead of NO-GOing on an unmeasured control. Keep it.
- M1 pilot bar worked: >=3/4 in the analyzer replaced the stale
  >=5/7 print without any mid-run rescoring. Keep it.
- ROAD-TALLY in primaryIds: the analyzer's PRIMARY NO-GO is
  driven by M3b/M4/W5 tally ids sitting in its primary list even
  though the prereg judges them as tallies. Propose: either
  remove the tally ids from primaryIds (PRIMARY then judges only
  bindings) or print PRIMARY as bindings-only beside ALL. Do not
  re-score this run either way — its tally reading stands.
- FIRENARR sense bar for the next run: counts alone cannot judge
  firenarr (0 on a fed village is correct). The next firenarr
  question should be a thinning-but-surviving seed: does the
  warning fire, does the village recover, and does the line read
  true in context?

## Telemetry deviation check

- Command: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/endgame.json --current
  'evidence/2026-11-04/perseed-endgame-r124/endgame-r124-*.json'
  --metrics veterans.unlockedWave,won,peakLivingVeterans` (n=4).
- Result: QUIET, exit 0. Expected: r121 seeded exactly these keys
  (uw 15, won 3, peakVet 3) and r124 reproduces them exactly, so
  there is nothing to roll forward. Baseline NOT touched.

## Regression suite

- `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2` in the worktree →
  281 passed, 9 failed in 1335s (log
  journey-endgame-r124-checkquick.log). The 9 are the standing 6
  families from r121/r123 (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes) PLUS 3 extras: 2
  per-test TIMEOUTs at exactly 120s (trust-observer-neutrality,
  capable-bot) and measurement-cache-flags (3 failed assertions).
  This run changed no src/js, and the check ran concurrently
  with a sibling Lane A check.js (same start minute) plus
  sibling sims — the known concurrent-run artifact class.
  Re-run of the 3 extras ALONE, sequentially, after the sibling
  check finished: measurement-cache-flags 4/4 PASS,
  trust-observer-neutrality 6/6 PASS, capable-bot 40/0 PASS.
  Verdict: the 3 extras are contention/timeout artifacts, NOT
  regressions. No new failure blocks landing; the standing 6
  families are carried, not fixed, by this run.

## Run-start incidents carried (see prereg)

r123 closeout overlap (stale heartbeat + recent write = live
closeout, not a dead run — this run stood down until r123's owner
merged it, then took leg 4); registry-lock contention (~3 min);
r120 HELD WORK untouched (journey2-endgame tree dirty + gutted
src/js, needs main-session inspection).

## Verdicts

REACHABLE: yes — 3/3 sitting seeds reach the lesser seat and play
a full finale; the table, audit, and final choice all fire, and
the transcripts are unchanged from r121 except the new firenarr
lines on the control seed.
FUN: yes, with the carried caveat — the finales read well and the
withdrawal-then-recovery arc is a real story; the caveat is
89705's dissolve-heavy fights, now twice-observed, which make
the wild feel unfinished rather than dangerous.
WINNABLE: lesser yes; FULL no — the road is still closed on every
bar at once (uw5 0, faces 0, veterans 1/2, standing 199-capped),
exactly as in r121, as the narration-only delta predicts. Nothing
in this pilot moves the full seat, and no gate was touched.
