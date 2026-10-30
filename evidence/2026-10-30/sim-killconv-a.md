# sim-killconv-a — full-seat conversion through the kill-conversion / veterans-bar channel (MEASUREMENT ONLY)

Run: fleshout-20261030T1924Z, Loop A, axis scale-onramp.
Worktree branch: sim-killconv-a. Base anchor: see per-seed JSONs
(`anchorCommit` field; worktree HEAD at sweep time).
Pre-registration: evidence/2026-10-30/sim-killconv-a-prereg.md (written
BEFORE any sims; judged against it below).
Instrument: scripts/killconv-instrument-20261030.js (KILLCONV=1,
read-only, det-gate proven) + scripts/killconv-sweep-20261030.js +
scripts/killconv-analyze-20261030.js.
Proof: scripts/test-killconv-20261030.js — 17/17 green (det-gate on
60d leadfeast trajectory identical with/without instrument; static
read-only scan; fixtures; real-sweep gate byte-identical re-run).
Corpus: evidence/2026-10-30/perseed-killconv/leadfeast/s85101–s85116.json.
No game code changed. No [needs-eyes] (measurement only, nothing
player-facing). Panel (§15): NOT APPLICABLE — single-base measurement,
no before/after comparison exists in this arm; none fabricated.

## Verdict: DIAG-GO

Binding constraint, in order: **kill opportunity — by a landslide.**
Decomposition over all 16 bar-short seeds: OPPORTUNITY 16, SURVIVORSHIP 0,
ACCOUNTING 0, UNCLASSIFIED 0. The 2:1 leader rule in the prereg is met
16-to-0. The wave-5 veterans bar (2 living villagers with wave-4+
kills) was never reached on any seed, and no seed ever had two
wave-4+ killers at once — so killer survivorship and bar accounting
were never even tested. The wall sits at the kill itself.

## Wall numbers (fresh band, this base — no old bank quoted)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single policy
  stack: withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  200d death-aware cap; no seed hit the cap — every run ended by win
  or village loss by day 139, so the cap never bound).
- National: 7/16. Table reached: 12/16. Wins: 11/16 — ALL lesser seats:
  `deedGateOk` is false on all 16 seeds including all 11 wins, so the
  full seat is 0/16.
- Wave 4 unlocked: 9/16 (days 45–117). Wave 5 unlocked: 0/16.
- Wave-5 veterans bar reached: 0/16. Peak living wave-4+ killers: 0 on
  13 seeds, 1 on 3 seeds, 2 on none.
- Median survival: 113 game days. Max: 139. Deaths are combat-led
  (harness sampler: combat 165, villager combat 132, the wild 55,
  expedition 32 — cause labels overlap across rows, so shares are
  indicative, not a clean partition).

## The decomposition, in numbers

Wave-4+ kills credited vs wave-4+ kills that happened: the bar credits
one per DISTINCT LIVING killer. Across the band, 3 wave-4+ kills
happened, by 3 distinct killers, on 3 different seeds — each credited
exactly once while its killer lived (peakR5=1 on those seeds proves
the credit lands). Nothing was lost to accounting: no read mismatch
between end-of-run readiness and the living-killer count on any seed.

| Class | Seeds | What happened |
|---|---|---|
| OPPORTUNITY, wave 4 never unlocked | 7 | 85101, 85104, 85108, 85111, 85114, 85115, 85116 — the run ended (lesser win or village loss) before the wave-4 door opened at all. |
| OPPORTUNITY, wave 4 unlocked, zero wave-4 meetings | 3 | 85105, 85110, 85113 — door open (days 59/116/117) but zero wave-4 spawns before the run ended; all three won early via the lesser seat (days 90/122/118). The lesser-seat win arrives faster than wave-4 content can be engaged. |
| OPPORTUNITY, meetings but zero wave-4 kills | 3 | 85103 (1 field + 1 TB), 85106 (4 field + 7 TB), 85107 (1 field) — beasts met, none killed. |
| OPPORTUNITY, exactly one wave-4 kill | 3 | 85102, 85109, 85112 — one kill each, one killer each; the second kill never happened. (Classifier note: see metric review — a single kill is NOT distinct-killer collapse.) |

Kill economics of the wave-4 era, band totals:

- Started meetings: 63 (35 villager field fights + 28 scholar TB fights).
  Wave-4+ kills from those meetings: 3 (4.8% per meeting).
- Villager field fights: 0 kills in 35 — outcomes vFlee 24, vDie 7,
  evade 4, vKill 0. Villagers meeting a wave-4 beast in the wild
  NEVER kill it in this band; they flee, die, or evade.
- Scholar TB fights: 3 won in 28 started — and all 3 wins ARE the 3
  wave-4 kills (one each on 85102/85109/85112, the last via a companion
  killing blow). The only wave-4 kills in the band come from the
  scholar's fights, never from villagers alone.
- Wave-3 kills for contrast: 22 in the band, and the wave-4 bar
  (1 living wave-3+ killer) was reached on 11/16 seeds. Villages CAN
  kill wave-3 beasts; the cliff is specifically at wave 4.
- Base-wave pool: 14 wave-3 kills happened AFTER wave-4 unlock, and
  only 1 veteran wave-3 spawn appeared in the whole band. Base-wave
  counting (a veteran wave-3 kill logging w=3) is therefore NOT the
  constraint — there are essentially no veteran kills to miscount,
  and wave-3 kills credit toward the wave-4 bar exactly as designed.
- Survivorship footnote (not the binding class, but recorded): all 3
  wave-4 killers were dead by their run's end (living-at-end 0/3).
  Even the single earned credit does not survive — but since a second
  killer never existed, this changes no verdict. It does mean any
  future lever must produce TWO killers who both LIVE, not just two
  kills.
- Refused engagements (instrument note, not meetings): 40 startCombat
  calls produced no fight, 35 of them on s85106 — all 35 against the
  Herald (wave 4, aggression "heraldic": "It does not attack. It
  ARRIVES."). The driver hammered engage on an omen for 9 days
  (days 95–130) without a fight ever starting. These are correctly
  EXCLUDED from the 63 started meetings above. Appended to the
  findings backlog as an open item (adjacent to the claimed
  castMonster-titan-pool item, but distinct: startCombat refusal on a
  heraldic monster, not the cast pool).

## What the village looked like, in plain words

A competent village climbs fast, wins the lesser seat in about three
months, and never gets near the full seat. On the seeds that win, the
story ends around day 90–130 with the village seated at the lesser
table while wave-4 monsters are still mostly a rumor — sometimes the
door to wave 4 has only just opened, sometimes it never opened at
all. On the seeds that lose, the village meets wave-4 beasts and
cannot put one down: the scholar's fights are usually lost (25 of 28),
villagers in the wild run or die, and the village bleeds out by
day ~135. The wave-5 bar is not a bar the village fails; it is a bar
the village never gets to attempt, because the second wave-4 kill —
let alone two living wave-4 killers — does not exist in 16 seeds of
trying.

## Sense-testing (transcripts read, not just counted)

32 fight snapshots captured; one per outcome class read in full:

- tb-won (s85102 day 84, the Algorithm): a REAL fight with
  consequences. Companion Sarah strikes for 4 and 7, the beast bleeds
  and enrages ("it likes it. Louder, faster"), telegraphs are read and
  dodged, the scholar lands 111 and 113 with the Godslayer Spear while
  well-fed (OVERCHARGED), the Algorithm falls, style points land,
  Sarah reacts ("Remind me not to cross you"), the camp beat closes
  it. Sensical — and notably a scholar kill, not a villager kill.
- tb-lost (same seed, same beast, earlier fight): also real, and
  heavier — the scholar goes down, Ruby Callaghan dies, three
  villages press tribute down while the chair is empty, the mantle
  transfers to Dieter Knight with a new face, new skills, and a
  village that has to learn to trust him. Consequences propagate.
- ff-vFlee / ff-vDie / ff-evade: PARTIAL. The captured narration shows
  the approach ("It followed you. The Big Ugly is here.", "The
  Reunion watches Oliver — learning their moves") but NOT the
  blow-by-blow or the death itself — field fights resolve through the
  returned record, not through the spoken stream. Outcome classes are
  therefore record-truth, not narration-truth, for field fights. This
  is an instrument-coverage limit (see metric review), not evidence
  the fights didn't happen: the death causes and roster changes
  corroborate them.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. CLASSIFIER FIX (implemented in the analyzer, not a goalpost move):
   the first analyzer draft labeled single-kill seeds ACCOUNTING
   (distinct-collapse). That contradicts the prereg's own definition
   of accounting — "kills happened but were not credited" — because a
   single kill WAS credited (peakR5=1 proves it) and there is no
   collapse when only one kill exists. Fixed: ACCOUNTING now requires
   >=2 kills on 1 killer; a lone kill is OPPORTUNITY (the second kill
   never happened). The verdict is unchanged in direction and stronger
   (16-0 instead of 13-3); the fix is recorded here so the next run
   inherits the corrected rule.
2. Field-fight transcripts capture meeting + opening only, not the
   fight body. A future instrument should tap the field-fight record
   (rounds, wounds both ways — already captured) rather than the say
   stream for sense-reads of villager fights.
3. "Refused" TB attempts (startCombat with no fight) need their own
   class in future censuses: the Herald case shows a monster class
   that absorbs engagement attempts without fighting, which inflates
   naive meeting counts.
4. Death-cause shares from the harness sampler overlap (combat vs
   villager combat vs the wild) and are not a clean partition — do not
   quote them as shares without that caveat.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis now has a
measured answer for the kill-conversion channel — opportunity, 16/16.
The next work on this channel is a lever that creates wave-4 kill
opportunity (or a second killer surviving), not a bar-accounting fix:
no accounting fix can help a bar that has never seen two killers.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + instrument + sweep + analyzer + proof test +
  corpus (all committed on sim-killconv-a). No game-code change, so
  "measurement only, nothing game-changing to merge" in substance —
  but the corpus + instrument should land as the baseline for the
  next lever arm on this channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to the
  coordinator after landing, since the baseline roll-forward decision
  belongs to the run, not the arm.
- Findings-backlog append (herald startCombat refusal) is done in
  this run's goal-workspace write, not in the repo commit.
