# journey-social r43 — THE VOICING THRESHOLD (2026-10-22, lane B, leg 5)

Leg question: r42's `mootFriendVoice` voicing (betrayal.js) fires when the
accused's staunchest acquit-voter has pairAffinity >= 20 — and it fired
ZERO times across 6 natural moots in r42's wild pilots. Is the threshold
miscalibrated, or were r42's moots just too thin (4 NPC-NPC moots on
3801/3803, 0 on 3802/3804)?

Queue-jump justification: r42 (landed 073bf4a85 / 864ac204f / 1f7543c3d)
left "firing-threshold calibration = next-run question". Rotation-b stays
5; the social leg's open question continues. The r42 note said 5→6, but r40/r41/r42
all kept playing social under the queue-jump rule, so the file still reads 5.

Policy: same r41/r42 substrate — warm-competent LAW-ABIDING (zero crimes),
2 convos/day rotating the roster (deep, kind picks, gossip forcing
GOSSIP_TARGET=3). Moot duty = VOTE ONLY, with-the-room; the driver NEVER
convenes — natural ticks must.

Instrument: scripts/journey-social-r42-20261022.js REUSED with
SEEDS=3901,3902,3903,3904 TAG=r43-pilot (r42-pilot naming preserved for the
old files; new files land in evidence/2026-10-22/social-r43-pilot-* and
journey-social-r43-pilot-s39xx.json). DAYCAP=140 to match the substrate.

Pre-registered metrics (a miss is NO-GO, never re-scored):
- M1 instrument: per-seed JSON + transcripts complete 4/4, affinity capture
  live, plot/case census no gaps >2d. GO/NO-GO.
- M2 calibration: collect bestAcquitAff = max pairAffinity(voter, accused)
  over acquit-voters for every NPC-NPC trial with >=1 acquit vote (widened
  from r42's >=4-voter gate; recorded as a metric revision). Distribution
  reported as p25/p50/p75/p90.
  - If threshold 20 would fire on <10% of trials AND some T in [10,15]
    would fire on >=25% → RECALIBRATE: set threshold to T (rounded clean,
    must still mean "a real friend": affinity 10 ≈ bond.v 20 or depth-5),
    update scripts/test-moot-friendship-voice-20261022.js threshold cases,
    proof green, commit. M2 GO on a successful, green, green-list-clean
    recalibration.
  - If threshold 20 fires on >=25% of trials → threshold STANDS; r42's
    0-fires = moot sparsity, documented. M2 GO.
  - Otherwise (e.g. thin moots again) → DOCUMENTED BLANK; M2 MISS.
- M3 people: if >=1 wild firing, sense-read ALL firings in transcript
  context — does the line read naturally mid-ceremony? If 0 wild firings,
  replay ONE natural trial from a pilot JSON through finishTrial to
  sense-read the prose once (labeled as a replay, not wild).
- M4 guardrail: >=3/4 runs end with >=5 alive and the village not scattered
  (carried from r42; survival attrition, not social-caused — see metric review).
- L2' standing: verbatim content-beat repeats within one convo = finding.
- F1 informational: affinity-term distribution (r42 pattern, carried).

What would count as an interesting finding:
- bestAcquitAff p50 < 10: the accused's friends DON'T acquit them — the
  friendship term is a whisper everywhere, voicing or no (Steve-call about
  whether the effect should be louder).
- Voicing fires >=2 wild: r42's 0 was pure sparsity — threshold keeps.
- bestAcquitAff distribution flat across seeds: the effect is
  player-vote-dominated, not affinity-driven, at natural scale.

Metric review (mandatory): r42's M4 (1/4 guardrail) failed on survival
attrition, not social mechanics; r42's M2(a) (4/6 verdict-margin alignment,
MISS) may reflect the same moot sparsity rather than a weak effect —
this run's calibration approach sidesteps the binary alignment gate and
measures the affinity distribution directly instead of re-scoring it.

## Results (appended post-run)

Pilot: seeds 3901-3904 x 140d, warm-competent law-abiding, natural moots
only. Driver = scripts/journey-social-r42-20261022.js with
SEEDS=3901,3902,3903,3904 TAG=r43-pilot.

- M1 (instrument): GO. Per-seed JSON + transcripts complete 4/4, affinity
  capture live, plot/case census no gaps >2d.
- M2 (calibration): GO — threshold STANDS. 6 NPC-NPC trials:
  bestAcquitAff = [11, no-acquit-votes, 31, 25, 25, 8]. Threshold 20 would
  fire on 3/6 (50%) — far above the pre-registered <10% bar for
  recalibration. All three firings were natural acquittals (s3903
  case_2/4/6). r42's 0-fires was moot sparsity (few trials where the
  accused's deep friends voted acquit), not a miscalibrated threshold.
- M3 (people): GO. 3 wild voicing firings, all sense-read in ceremony
  context: s3903 case_2 (Natalie -> Vikram, "2 for guilty. 6 against"),
  case_4 (Raul -> Eamon, "1 for guilty. 6 against"), case_6 (Raul -> Eamon,
  "1 for guilty. 5 against"). Each lands after the count, before the
  verdict beat — reads naturally as the room seeing who stands by whom.
  Minor polish note (documented, not fixed this run): Raul voices the
  identical line for Eamon in two trials 2 days apart — a 2nd variant
  would keep repeat trials from echoing.
- M4 (guardrail): NO-GO 0/4. 3901: d142 alive=4, village intact (fails the
  bar by 1). 3902: d136 villageLost, scholar dead. 3903: d111 villageLost,
  scholar dead. 3904: d125 villageLost, scattered, 1 alive. This matches
  r39 (2/4) and r42 (1/4) attrition under the same policy — three straight
  legs, 4/12 guardrail pass. See metric review.
- L2' standing: repeats flagged — betrayal dig-miss pool wrap (same
  signature as r42: 6 digs deep in one convo, 4-line pool cycles).
  Blank FILLED this run: pool 4 -> 8 distinct lines + honest cold-trail
  line past exhaustion, no wrap. Proof updated in the same commit
  (scripts/test-social-r7-fixes-20261012.js, 13/13 green; moot-friendship
  13/13 + probe 9/9 re-green).
- F1 informational: affinity-term felt (>=5) on 12/38 natural votes (32%)
  vs 6/39 (15%) in r42; max 24.0, median 2.8.
- F2 informational: no fabricated cases in this pilot.

### Metric review

- r42's M2(a) verdict-margin alignment (4/6, MISS): r43's direct
  measurement shows the friendship effect IS present (50% of trials would
  voice; probe 9/9 counterfactual 32.5pp). The alignment gate's miss was
  moot sparsity + binary verdicts, not a weak effect. The binary gate is
  the wrong instrument for a whisper-scale effect at this moot density.
- M4 attrition trend: 2/4 -> 1/4 -> 0/4 across r39/r42/r43 with the same
  warm-competent law-abiding policy. Not social-caused (no gossip/liar
  deaths; end states are villageLost/scholarDead/scattered). Candidate
  causes: base survival tuning brutal for this policy, or the competent
  policy's survival play. NOT a leg-5 problem to fix — flagging to the
  food-economy / lane-A lanes as a standing observation.
- Driver gap: per-seed JSON records deaths (name+day) without causes —
  death-cause census needs beats mining; noted for the next driver touch.

### Village assessment (plain words)

3901 is the thriving one: 4 alive at d142, village intact, deep bonds
(47) everywhere, avg trust 86.8 — a village that figured itself out and
is coasting. 3902 and 3903 collapsed with the scholar: villages that lose
their leader by d111-d136 dissolve rather than rally — the mantle didn't
hold them. 3904 scattered: people drifted apart after the crisis, one
soul left alone at d125 with trust at 70 but nobody to trust.

Socially the villages feel ALIVE: 66-101 bonds per run, 30-47 deep bonds,
gossip traveled (14-26 gossip convos/run), moots convened naturally on
real plots (theft, murder of Ines), and friendships visibly moved votes —
Natalie standing for Vikram, Raul standing for Eamon twice. The one
missing note: rivalries. Betrayal plots fired (1-3 cases/run) but the
bond ledger is all warmth; feuds/grudges don't surface as living
relationships the way friendships do.

### Reachable / fun / winnable (leg 5)

- REACHABLE: yes. Conversations, gossip, moots, favor promises, the
  friendship voicing — all fired in natural play with zero driver
  convening. A real player will reach every social surface.
- FUN: yes, with one caveat. The voicing landed as a genuine ceremony
  beat; gossip and plots drive real talk. Caveat: villages keep
  dissolving when the scholar dies mid-run (2 of 4) — the social fabric
  doesn't carry the run on its own, which undercuts the "village, not
  the individual" thesis.
- WINNABLE: neutral for this leg — social mechanics neither block nor
  carry the win. (M4 attrition is a survival-tuning question, not a
  social-gate question.)

Open for the next social run: voicing-variant polish (Raul echo), death
-cause instrumentation in the driver, and whether feuds/grudges should
be as living as friendships.
