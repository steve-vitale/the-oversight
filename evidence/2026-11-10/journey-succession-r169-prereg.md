# Journey succession r169 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r169 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r169 = next Lane B number after r168 crisis
(landed b5f3540d0). Base: master b5f3540d0 (journey-crisis r168).

## Standing state (why this run replays leg 7)

r166-succession LANDED on master (askfavor exhaustion fix f9ef1c0dd
[needs-eyes] + recovery 65e518f1b; gate 292/8 adjudicated GO, family
proofs 7/7; adopted 2026-11-09 ~23:52Z). r167 social life + r168
crisis landed since. This run answers the ONE carried owed item r166
explicitly left open: the Javier dlg:more dry (seed 34003, r165
panel) — "same defect class, no binding bar; next succession run
owns it and it needs a design call, not a knob."

## The carried blank: Javier dlg:more dry (pinned pre-play)

The wild case, from the committed record (no new play yet):
- Seed 34003 d71 Javier, successor-life d+30: after a secret
  ("I have been lying about my age") + buried bundle + promise,
  the player picks "Tell me more." (dlg:more) and hears
  "...Sorry, lost my train of thought." — a dry line as the answer
  to a heartfelt confidence, a non-sequitur: he had not lost his
  train of thought, he had finished.
- Mechanism pinned from the committed sayTrace
  (evidence/2026-11-09/journey-succession-r165-34003.stdout.json,
  the run's only fellBack entry): pick dlg:more, key
  '"I wish there was more to tell. That\'s it."' (variant 2 of the
  dlg:more dry pool), preSelf=false, preRun=TRUE, fellBack=true,
  returned the dry line. Sites: src/js/convo-dialogue.js:307
  (the dlg:more dry path), :875/:920 (sayLine wrappers).
- Chain: the thread (secret) has no follow-ups, so convoThreadBeat
  returns null and the dlg:more handler falls to its dry pool —
  `convoPickCycle(vid, 'dlg:more:dry', [3 closers])`. All 3 closers
  had already been spoken to Javier across sittings, so convoPick
  returned null and the cross-key reset freed the oldest variant;
  convoPick's run-ledger handling is a preference, not a filter
  ("small pools must not collapse"), so it returned the freed
  variant anyway even though it sat in the 48-entry run ledger.
  sayLine (opts `{tag:'endtopic'}`, structural:false) run-blocked
  it and dry-replaced it — and the dry line comes back TRUTHY, so
  the handler's `|| '"That\'s... pretty much all of it, honestly."`
  fallback never fires (the r166 lesson, same shape as Sofia).
- The dry line is honest when a CONTENT beat is blocked. As a
  thread wind-down closer it is dishonest: the villager is not
  forgetting, he is done.

## Design call (this run's call — Steve can overrule)

Thread wind-down closers are conversation GRAMMAR, not content —
the same class as the r17 structural beats (resume openers, recap
lines, thread-resume responses: "two villagers using the same
structural beat in one day is not parroting"). A villager saying
"That's the whole of it" after another villager said it earlier in
the day is not parroting; it is how people end a thread. The
dlg:more dry closer is therefore emitted with `{structural: true}`,
so sayLine skips the run-ledger block for it — exactly the r17
precedent. What does NOT change: the pool still cycles per
villager (convoPickCycle keep=2, so no immediate verbatim repeat);
the line still lands in the per-villager ledgers (structural beats
feed c.saidLines, just not the run ledger); the dry line itself
stays available for genuine content-beat blocks. The `||` fallback
literal rides the same sayLine call, so it is covered too.

Scope: the dlg:more dry path in src/js/convo-dialogue.js ONLY
(the observed miss). Same-class sites NOT touched this run:
convoThreadBeat's `exh` closers (conversation.js:3423 small-talk
opener, :3808 topic re-ask) and the base `more` choice (:6545)
— none dried on the r165 panel; the fresh panel's DRY CENSUS will
say whether they fire in the wild, and the design call above
already covers them for a future run.

## Question (r169)

Does the structural exemption on the dlg:more dry closer make the
Javier turn speak the honest closer instead of the dry line, without
changing any unblocked path — and do the carried regression bars
still hold on a fresh panel?

## Fix (landed this run, before the after-leg)

- src/js/convo-dialogue.js dlg:more dry path: sayLine opts gain
  `structural: true` (was `{tag:'endtopic'}` only). Comment cites
  the r17 precedent + the Javier case.
- Proof test scripts/test-journey-succession-r169-dlgmore-dry.js:
  dry-allblocked (all 3 closers poisoned in the run ledger + said
  to this villager: reply must be an honest closer, never a dry
  line), control (unblocked: reply is a closer from the pool, menu
  retires dlg:more). Verified RED on unfixed code and GREEN after.
- r146/r147/r151/r155/r157/r161/r166 proof tests re-run GREEN.

## After-leg (this run)

- Driver: scripts/journey-succession-r169-20261110.js = r166 driver
  with ONLY r166->r169 renames + EVID_DIR 2026-11-10. Analyzer:
  same rename.
- Seeds: FRESH BAND 34011–34018 (EARLY_KILL_DAY=40, POST_DAYS=70,
  panel config = r165) + smoke 33998 (EARLY_KILL_DAY=5,
  POST_DAYS=25, control: DeAndre trapline must still speak; the
  smoke seed is byte-identical across r161-before, r165 and r166 —
  deaths 1, alive 11, fallen 1, stage 3, mentions 2).
- Analyzer run on all seeds for the census + MANTLE-FINE lines.
- PEOPLE CHECK: read the d+14 transcripts (one per panel seed) in
  full + the Javier-analog transcript on any seed that dries.

## Seed-band freshness (local_seed_band_freshness)

- Searched every dated prereg under evidence/ (`*prereg*` files)
  for 34011–34018: only hits are code line references
  (`game.js:34018` in sim-grindfinish-b-prereg.md,
  `src/js/game.js ~34015` in sim-partydamage-b-prereg.md) — not
  seed reservations. No forbidden/contaminated band list names
  them.
- Recent succession bands (not reused): 33998 + 34001–34008
  (r165/r166), 33931–33938 (r161), 33803–33806 + 33912 (r161).
  Band 34011–34018 is FRESH.

## Bars (binding, §14)

- DRY CENSUS (binding, the failed bar's class): ZERO dry lines at
  dlg:more turns on the after-leg seeds. sayTrace must show no
  dlg:more fellBack.
- AGENCY-DRY / TEACH-DRY / OPENER-DRY (binding, carried): ZERO on
  the after-leg seeds.
- MANTLE-FINE (binding, carried from r165/r166): every observed
  bearer death flippedImmediate, fine latency <= 1 with roll cover.
- PROOF TESTS (binding): r146 + r147 + r151 + r155 + r157 + r161
  + r166 + r169 ALL GREEN on the final tip.
- GATE (binding): check.js --quick on the final tip; standing
  failures only, no new attributable failure; load timeouts re-run
  standalone.

## What would count as an interesting finding

- A dlg:more turn still drying after the fix (fix incomplete).
- A NEW dry appearing on the after-leg seeds, esp. an `exh`-path
  dry (the untouched same-class sites firing in the wild).
- The closer itself repeating verbatim back-to-back (cycle broken
  by the exemption — the keep=2 guard must hold).
- Any control changing (trapline line, CAP-NC, self-request).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r151 precedent:
per-seed means; the checker sums — LOUD lines on deaths.bearer /
census.fallen are the summation artifact unless per-seed means
move). Run on the r169 panel tele files.

## Metric review (to be filled after the after-leg)

- CAP-NC denominator: stays descriptive this run (r166: a decisive
  verdict needs a longer panel or a band with earlier arrivals).
  The r169 panel is the same length as r165 (POST_DAYS=70); no
  re-score, no new instrument — a longer/earlier-arrival panel is
  a future run's question, not this run's.
- The day-skip instrument correction stays open (r166: zero
  day-skips across 22 deaths / 10 seeds / ~580 sleeps, no
  deterministic staging path) — carried, not implemented.
