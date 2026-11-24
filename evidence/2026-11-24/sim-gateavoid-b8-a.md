# sim-gateavoid-b8-a — DIAG: what does a B8 meeting do to the holder's plan? (finding #2733)

Run fleshout-20261124T1115Z, Loop A, axis scale-onramp. Coordinator-run DIAG.
No game-code change, no new sims. Prereg:
`evidence/2026-11-24/sim-gateavoid-b8-a-prereg.md` (frozen 11:22Z, before
the census ran; freeze copy in goal hidden_files).

## 1. Question
B8 (`gate-avoid-plan-exists-no-retarget`, frozen taxonomy in
`scripts/analyze-retarget-a.js`): a gate-avoid meeting where the holder
already has a plan. The gate resets the plan's stage but never sets the
target. Is B8 a real formation wall (holders blocked by a missing or wrong
target), or dead meetings on plans that were never going anywhere?

## 2. Corpus (deliberate REUSE)
Retarget band 109411–109418, BOTH legs, 8 seeds each (16 total),
`evidence/2026-11-24/perseed-retarget-a-{ctl,arm}/`. Declared a replay in
the prereg — no fresh-seed claim, no new verdict on the retarget lever.
Policy: tableseat-nowait (layers off). Horizon 150d.

## 3. Instrument
`scripts/analyze-gateavoid-b8-a.js` (new, committed with this arm):
- Reuses the frozen analyzer (`analyzeSeed`) for the classified meeting
  rows; the taxonomy is untouched.
- Own trace per B8 meeting through the REST of the run (not the analyzer's
  7-day wave-4-only `seededLater`): first later planCensus row with a
  non-null target; first later v4departs launch; first later killCall by
  the holder; holder death; end-of-run state. Post-death launches/kills
  are ignored (defensive; none occur in this corpus).
- Bars: D1 100% attribution; D2 instrument green + B8 counts reproduce
  the retarget evidence; D3 a design-call recommendation with numbers.
- Proof: analyzer selftest 38/38; DIAG selftest 8/8 (trace buckets T1–T5,
  determinism T6, count reproduction T7, 0-untraced T8).
  `node scripts/analyze-gateavoid-b8-a.js --selftest` → 8 passed, 0 failed.
- Analysis: `evidence/2026-11-24/gateavoid-b8-a-analysis.json`.

## 4. Result — the meeting leaves no trace

Pooled 72 B8 meetings (ctl 36, arm 36; wave-4 71, wave-5 1 — every met
monster is kill-relevant). D2 check: wave-4 counts reproduce the retarget
evidence exactly (ctl 36 / arm 35; the arm leg's 36th meeting is the one
wave-5 meeting).

| Shape at the gate | n | Later launched on the met beast | Later launched on anything else | Died before any launch |
|---|---|---|---|---|
| targetless (planTarget null) | 38 | 0 | 25 | 13 |
| mistargeted (target ≠ met beast) | 34 | 0 | 28 | 5 |
| target-already-met | 0 | — | — | — |
| **Total** | **72** | **0** | **53** | **18** |

- **0/72** B8 meetings ever lead to the plan targeting OR launching on the
  beast that was met. Not once. (Targetless holders DO acquire a target
  later, 25/38 — but never the met one. Mistargeted holders never turn
  either.)
- **Every gate reason is 'outmatched' (72/72).** The party was judged too
  weak for the met beast at the meeting.
- The 53 later launches aim LOW: 34 at wave-3 targets, 18 targetless,
  only 3 at wave-4 and 2 at wave-5 (median 3 days after the meeting).
  Holders keep hunting; they just never hunt what they met.
- Only 1/72 met monsters was ever killed by its holder later — and that
  kill came through the player channel, not the plan (see §5).
- 18/72 holders died before any later launch (median 28 days after the
  meeting — they linger, then die).
- Concentration caveat: the 72 meetings come from 18 holders on 6 seeds;
  seed 109417 alone contributes 37 (one village's trio meeting the same
  wave-4 beasts for weeks). The 0/72 is a mechanism reading (the gate
  never sets the target — code, not sampling), but the rate's generality
  across villages is one seed's trio plus 17 other holders.

D1: 100% attributed, 0 unclassified, 0 untraced. D2: green, counts
reproduce. D3: recommendation in §6.

## 5. Sense-test — the story of seed 109417 (control), holder gen_1nrij6r
The holder's plan points at 'redactor' (wave 3) for the whole window
(days 110–125, party/hunt stages). Day 115 they meet 'algorithm'
(wave 4) at the gate — avoid, outmatched — and the plan stays on
redactor. They launch on redactor days 112 and 119. Day 123 they kill
'algorithm' — via the player channel (the scholar's involvement), not
the plan: the plan never points at algorithm at any point. A villager
met a wave-4 beast, kept hunting wave-3 redactor, and the wave-4 beast
died only because the player got involved. The plan remembers nothing
about the meeting. That is the blank, in one village.

## 6. Design-call recommendation — NO-GO on building gate-set-target
**Do not build the "gate sets the target" formation lever now.**

The mechanism is real — plans forget meetings entirely (0/72) — but the
outcome evidence points the wrong way:
1. The gate already judged every one of these parties outmatched for the
   met beast (72/72). Pointing them at it would send outmatched parties
   at wave-4 beasts.
2. The closest analog was already built and failed: the retarget lever
   (upward turns onto met beasts) produced launches without kills —
   wave-4 kills FELL 24 → 19, deaths ROSE 727 → 773 (sim-retarget-a,
   NO-GO at pilot). Gate-set-target is the same shape by a different
   route.
3. The one met-beast kill in 72 meetings came through the player, not
   the plan — plan involvement is not what kills wave-4 beasts.

The wall behind B8 is the wave-4 fight itself (finding #2538's open next
step, same conclusion as retarget §5): launched parties must WIN wave-4
fights. Pointing more outmatched parties at wave-4 beasts is the wrong
direction. The next arm should take the fight angle (why launched
parties lose wave-4 fights — party composition, gear, ability use), not
the plan's memory.

Documented as a blank, not a lever: plans forget meetings. A narrower
knowledge variant is left open for a future arm — the meeting could
teach the holder the beast's identity through the overheard channel
(departteach just proved name-teaching works there) — but that is a
knowledge arm, not a formation lever, and it is not built here.

Finding #2733 is ANSWERED by this DIAG (appended to sim-findings.md with
this verdict; the finding text itself was missing from sim-findings.md —
the 0915Z record cited it but it was never appended, so it is appended
here with the answer).

## 7. Wall numbers (reused corpora, reported never judged)
From the retarget evidence §7 (identical seeds, both legs): wins 0/0,
national 0/0, table 0/0, wave-5 reached 2/1 seeds, wave-4 reached 8/8,
median survival 150/150, villages lost 3/4, total deaths 727/773
(control/arm). The scale wall stands.

## 8. Metric review
- The B8 meetings' met monsters are ALL wave-4+ (71 wave-4, 1 wave-5) —
  the kill-relevance question answers cleanly: these are exactly the
  beasts the village needs to kill.
- The "launched-other" bucket mixes null-target (18) and wave-3 (34)
  launches; the wave-3 dominance is the key secondary signal — holders
  aim low after avoiding wave-4, they are not launch-blocked.
- The 7-day analyzer window (`seededLater`) would have missed most of
  this: launches land a median 3 days out but kills and deaths stretch
  to 28 days; the rest-of-run trace was the right instrument.
- Concentration: half the meetings sit on one seed's trio. A fresh-band
  re-measure could check generality, but the 0/72 is a code mechanism
  (the gate never sets the target), so a re-measure would re-prove the
  mechanism, not change the design call.

## 9. Closeout
- Game code: UNTOUCHED (DIAG only, zero src/js).
- New files: `scripts/analyze-gateavoid-b8-a.js` (+ selftest),
  `evidence/2026-11-24/sim-gateavoid-b8-a-prereg.md`,
  `evidence/2026-11-24/gateavoid-b8-a-analysis.json`, this evidence file.
- Finding #2733 appended to sim-findings.md as answered (NO-GO).
- Next blanks for the round (carried to the round record): (2) waiting
  matters on seat-unready bands (tracker blank #5); (4) holdspeak
  repetition firmer measurement; (5)+(6) calledName #2741 + overheard
  KNOWLEDGE.md #2742 — the last two are a worker arm if a registry slot
  frees; the wave-4 fight (#2538) is the recommended next arm after
  this round.
