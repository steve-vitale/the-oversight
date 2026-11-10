# Journey social life r167 — run note (Lane B, 2026-11-10)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5 and
writes 6 (crisis next) at closeout. Base: master 632ed6e23
(journey-deepening r124 landed 04:01Z). Seeds 43301–43304 (fresh band,
verified in prereg), DAY CAP 140, policy journey (socialite base + real
conversations). Driver scripts/journey-social-life-r167-20261110.js,
analyzer scripts/analyze-journey-social-r167-20261110.js, helpers
scripts/journey-social-r167-helpers.js, proof
scripts/test-journey-social-r167.js + test-journey-social-r167-narr.js
+ test-journey-social-r167-coach.js + test-journey-social-r167-coachrepeat.js
+ test-journey-social-r167-agree.js.

## Standing state at run start

- `git pull --ff-only` FAILED (diverging — local master ahead of origin;
  ship loop owns reconciliation; same standing state as r159/r163). No
  origin merge attempted; landing is local-master only.
- Main tree was DIRTY at 03:55Z (untracked sim-wave5face-b adoption
  leftovers) and CLEAN by 04:01Z after the adoption round landed
  (f403eaa7c) and r124 landed (632ed6e23). The run waited for the
  sibling landing before registering, per the body.
- No live Lane B run: no playtest-loop-2.lock at run start, no journey2
  entry in the registry, no journey2 worktree. The r166 succession
  closeout (rotation 7→4) and the leg-4 doorwalk adoption (rotation
  4→5, gate adjudication 344d7b8d7 in master) both completed before
  this run.
- Base movement since r163: r163's coach fix IN (5e190b6ef); r124's
  want-after-secret fix IN (facc9d60c — a conversation change, so the
  panel re-measures want threads and the react shape on the new base);
  r166's askfavor fix IN (f9ef1c0dd).

## PRE-REGISTERED VERDICTS (binding, §14)

- **M1 arming motive — GO.** 6 plots, 6 arms, ALL 6 grievance-linked
  at arming (grievanceTargetToLeader 34–60). 1 grievance-holder →
  later-leader case (Meera, 43302 plot_5, armed d15 after Tabitha
  ambushed her d14). 0 plots after d30. Cold-accomplice pattern
  holds (Carlos scores 25 ambition-only while Tabitha/Hartawan lead
  on grievance). The drought bound is RETIRED (r163) — not re-judged.
- **M2 villager-initiated bonds — ANSWERED (sixth datapoint).** 69
  villager-initiated proposals panel-wide, all 69 by villagers, 0 by
  the scholar: 32 person-kind (16 accepted, 3 refused, 1 expired, 12
  staged), 37 link-kind (14 accepted). Per-initiator person max 4
  (Meera, Hayden) — inside the amendment-5 cap of 8/90d. Mixed max 12
  (Hayden, link-heavy) — the mixed number is NOT the cap. End bonds
  67/68/72/78. Engine records the proposer: NO in end-bond records
  (bond records carry no initiator field — the analyzer's verdict
  line; the live bond_proposed capture is what proves initiation).
- **M3 invite refusal — REPORT.** Party (player-invited): 20 accept /
  6 decline. Lure (NPC-invited): 4 accept / 17 decline. Bond (NPC):
  5 accept / 3 decline. Invitations are sometimes taken, sometimes
  refused, by both sides — the ruled behavior is live.
- **M4 sense — GO.** 224 transcripts, 4 candidates printed, all four
  read as real people (see People check). React shape holds on the
  r124 base: agree=0, joke=0, silence=1482, dlg:react present;
  longest continuer run 4 (<5), so the 3-label 'more' pool suffices.
  The r124 want-after-secret fix did NOT change the react surface.
- **M5 survival guardrail — NOT MET (0/4 past d100).** d70, d67, d82,
  d75. Sequence now: 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4,
  0/4, 2/4, 0/4. Dark-channel verdicts are within-window only.
- **M6 gossip-position — GO (re-aligned gate definition).** 0
  naming-beat lines beyond radius-1 of Haven across the panel; 121
  debates kicked, 121 settled. Strict on-tile away total 53 — the
  known metric/gate definition discrepancy, reported, NOT a failure
  per prereg.
- **M7 dedupe — HOLDS (clarified wording).** 63 near-dup flags, ZERO
  verbatim same-beat repeats and ZERO fallback repeats. Families:
  recap reframes ("we're still on..." with varying prefixes),
  favor reframes (pantry/creek "I still need help" variants),
  landmark templates (different place, same frame), teaching
  templates (different plant, same frame), silence variants, and
  POOL-CYCLE foreign-agree flags (same core phrase, different nod
  suffix — see job B). Per the clarified M7 wording, pool-cycle
  flags are pool depth, NOT a fixed-pool failure. The Sigrun
  (Norwegian) flags pair DIFFERENT agree phrases flagged for the
  shared nod-suffix boilerplate — a detector artifact, not a repeat:
  the pool was working (4 distinct phrases cycling).
- **M8 counter-settle — CONFIRMED (see note).** 14 proposeLink calls,
  5 counters, 5 driver settles, 5 links formed, 0 blocked, 0 failed,
  pendingCounterEnd null on all 4 seeds — no counter re-raised. The
  analyzer labels it PARTIAL because 3 villager proposals followed
  link-forming settles on 43304 (Sofia d70/d72 to village_0/village_3,
  already linked d12/d13). Investigated, EXPLAINED, not a re-raise:
  the d13 village_0 link had dissolved by d72 (proposeLink's own
  guard proves it — it returned 'counter', not the already-linked
  refusal "There is already a link"), and Sofia's raise was a
  legitimate RE-LINK to a formerly-linked village (d72 settle formed
  a new link record, mgpspqxv933; the header documents
  debts_survive_the_break for exactly this path). The analyzer's
  "re-raise" heuristic conflates fresh villager re-proposals with
  counter re-raises — metric-review item, not a run failure.
- **M9 recap cap — HOLDS.** Panel max presses 5, total 148, 0 cap
  failures, 'recap' never offered after the 5th press.
- **M10 coach variation — FAILS.** NARR scan: 228 conversations, 2
  verbatim repeats, panelMaxSameNarr 2. Both are coach lines
  repeating inside one sitting: Xavier 43301 ("You know the
  counter-attack now — the anger IS the tell...") x2; Jesse 43302
  ("You've seen the smooth deflect before...") x2. Root cause found
  and FIXED this run (see Blanks filled). The r163 pool fix only
  deferred the repeat: drawTruthLine recycles a 2-variant pool after
  2 draws (A,B,A).
- **Q11 scattering capture — CONFIRMED.** All 4 seeds record
  scattered / hungryDays / aliveEnd: 43301 true/3/2, 43302 true/3/6,
  43303 true/3/1, 43304 false/1/0. THREE villages scattered with
  people alive (r163: 1/4) — the scattering path is common, and all
  three scattered villages sat at exactly hungryDays=3 (the
  pantry-empty threshold).

## VILLAGE ASSESSMENT (plain words)

Four villages, all lost, none past the table — but the social fabric
held to the end in every one.

- **43301 (Mia, d70):** 13 fallen. The wild took 6, the arena and
  contests 2 each, starvation 2, one each to sickness, thirst, and
  ambush — Yesenia, murdered d9 in Kelly's plot, the village trying
  the case and acquitting. The mantle passed 9 times in 70 days.
  Still, 42 full conversations (39 natural ends), 10 feasts, 2 moots,
  67 bonds standing at the end. The village scattered at d70 with 2
  alive after 3 hungry days.
- **43302 (Jose, d67):** 7 fallen, 6 of them to the wild. The feud
  village this time is Tabitha↔Meera: three plots in 15 days, two
  sprung (escaped, hurt), one expired. 63 conversations (59 natural),
  9 feasts, 2 moots. Scattered d67 with 6 alive after 3 hungry days.
- **43303 (Ava, d82):** 13 fallen, 12 to the wild — the wild simply
  ate this village. 9 successions, 53 conversations (46 natural),
  11 feasts, 2 moots. Scattered d82 with 1 alive after 3 hungry days.
- **43304 (Kavya, d75):** 20 fallen, the bloodiest: 12 wild, 2
  monster, and one each to betrayal, the night, the arena, thirst,
  starvation, combat. The mantle passed TWELVE times in 75 days.
  70 conversations (66 natural), 9 feasts, 0 moots. Starved to zero
  rather than scattering (hungryDays 1 at the end — the pantry gave
  out with the people, not before them).

What they knew: bonds everywhere (67–78 standing per village at end),
debates kicking and settling (121/121), rumors moving, plots arming on
real grievances. What was missing: moots fired in 3 of 4 villages this
time (6 total — better than r163's 1, still thin for a "heartbeat");
the table never appears — no village lived long enough or strong
enough; nobody's social life saved their village, which is honest:
talk doesn't stop the wild killing people. The wild killed 36 of 53.

## PEOPLE CHECK (M4 — full transcripts read)

- **Kelly (43301, friendship, 11 turns, natural end):** confesses
  "I wasn't a paramedic. I was a Fisherman. Someone I love needed
  the lie more than I needed the truth." The driver then presses the
  doubt probe FIVE times; Kelly refuses to re-confess with four
  distinct lines ("You're really going to make me say it again?",
  "I confessed that already.", "We went over this.", "I told you
  the truth. You can keep poking it, but it's told."). A real person
  getting tired of interrogation. PASSES.
- **Jesse (43302, friendship, 8 turns, natural end):** confesses
  stealing 1× Stone, then — after a deflect — "I don't actually want
  to belong somewhere. I want to be remembered. It's safer if people
  don't know." Two confessions in one sitting (a deed, then a desire),
  and he still refuses a third ("I confessed that already. I'm not
  confessing it twice for dramatic effect."). PASSES — but this is
  the DOUBLE-CONFESSION shape again (see Watch items).
- **Autumn (43303, talk-request, 11 turns, natural end):** "I wasn't
  a plumber. I was an appliance repair tech. I wanted an edge. You
  were new, you were listening, and I used it. I'm not proud of
  that." Refuses the re-press, then pivots to real village news —
  the seedlings Lena touched, the argument about what to call that
  thing, 4 people going hungry. PASSES.
- **Arlo (43304, talk-request, 10 turns, natural end):** "I told
  myself finders keepers. It wasn't finders keepers. I'm sorry."
  Then: "I wasn't a rail conductor. I was a farmer. You looked at me
  like I mattered, and I wanted to keep that. So I gave you someone
  worth looking at. That person isn't real." Two confessions in one
  sitting again — and then the sleep-shifts line ("I sleep in shifts
  now — two hours, up, listen, two more") with the Columbus, Ohio
  callback. PASSES as a person; the double confession is the wart.

Dropped threads (5 across 228 conversations, down from r163's 14/325):
3 have next sittings that open on NEW topics (the dropped thread does
not resurface — the r159 pattern persists); 2 have NO next sitting
(the village ended first). None replaced a promise. The landmark
follow-up dead end did not reproduce as a drop this run (landmark
lines appear as near-dup flags, not drops).

Doubt-probe re-offer: did NOT reproduce at r159 levels — the printed
top rows show dlg:doubt pressed once per conversation (max 1). The
re-offer headline (222/228 conversations, panelMax 12,
furniture-free 11) is still menu furniture (leave/silence 7–12×) plus
long-conversation continuers (teach 10, dlg:subject 10, recap 9,
favor-requirements 7) — the menu persisting while the player keeps
choosing continuers, not a loop defect.

## BLANKS FILLED THIS RUN (2 fixes, both proven live)

- **(1) M10 coach repeat — FIXED + PROVEN.** Root cause:
  `drawTruthLine` keeps per-game no-repeat per pool, but RESETS the
  used list on exhaustion, avoiding only the last-used index — so a
  2-variant pool cycles A,B,A within one sitting. The r163 fix gave
  the priorDeflect branch a 3-variant pool, but `coachDeflect` and
  `coachAttack` still hold 2 variants each, and a sitting pressing
  doubt 3+ times re-serves the same hint. Fix (src/js/truth.js
  `confrontWindup`): after drawing the coach line, if that exact
  coach text already appears as a narr beat in THIS sitting's
  transcript, suppress the coach beat instead of repeating the hint
  — vary while variants remain, say nothing once the sitting has
  heard them all. Proof scripts/test-journey-social-r167-coachrepeat.js
  RED→GREEN (3 presses in one live sitting: A,B,A before; A,B,none
  after; transcript holds exactly 2 distinct coach beats). Carried
  proofs still green (coach 3/3 distinct, narr ALL PASS, main PASS).
  Confirmation re-run (worst seeds 43301/43302, same driver):
  nVerbatimRepeats 0, panelMaxSameNarr 1 on both (panel: 2/2). The
  fix holds live. [needs-eyes] — the System now stays silent rather
  than repeating its hint on the 3rd+ doubt press; Steve should feel
  whether the silence reads as the System holding back or as a dead
  beat.
- **(2) No-words agree pools 4→8 — FIXED + PROVEN.** Long no-words
  sittings cycled their 4-phrase agree pools (panel: 7 foreign-phrase
  cycle repeats on 43303 — Wanjiru/Swahili and Dmitri/Russian, max
  2× each in one sitting; Sigrun drew 35 foreign lines and Tariq 32
  in one seed each). Fix (data only, src/data/foreignSpeech.json):
  every language's `agree` pool widens 4→8 with 4 new short
  agreement utterances (new English meanings: "I agree with you." /
  "That's true. Absolutely true." / "Well said. Exactly right." /
  "Yes, I feel the same way."). Proof
  scripts/test-journey-social-r167-agree.js ALL PASS (25 languages,
  8 entries each, all `t` distinct, every kw key appears in its `t`;
  RED shown on the pre-fix backup: pools were 4). Confirmation
  re-run (43303/43304): foreign-phrase cycle repeats 0 on both
  (43303 panel: 7). The pool now survives an 8-press sitting without
  recycling. Translation note: new phrases are short formulaic
  agreements in the existing pools' voice, reusing each pool's own
  vocabulary (e.g. Twi "Yiw"/"pɛpɛɛpɛ", Yoruba "Bẹ́ẹ̀ ni"/"Òótọ́");
  gendered adjectives were avoided by using verb forms (Russian
  "Соглашаюсь", Ukrainian "Погоджуюся", Arabic "أوافقك الرأي").
  One validation catch during the edit: the Twi kw key 'kaaɛ' did
  not appear in its `t` ("Wokae") — fixed to the pool's spelling
  "Wokaaɛ" before writing.

## WATCH ITEMS (documented, not fixed this run)

- DOUBLE CONFESSION (r163 open item 3 — now THREE datapoints):
  Sylvie (r163), Jesse + Arlo (r167). Two different secrets in one
  sitting — a deed then a desire (Jesse), a theft then an identity
  lie (Arlo). Each lands as its own beat and both transcripts pass;
  the question is whether a confessed villager should have one
  secret per sitting. Still a design call, not a defect fix — but
  with two fresh datapoints the next run can judge it as a pattern,
  not a one-off.
- MOOTS (r163 open item 2 — better, still thin): 6 moots across 4
  villages (2/2/2/0) vs r163's 1. The near-zero did NOT reproduce;
  moots fire in 3 of 4 villages. Still rare for a "heartbeat" (6 in
  ~294 village-days). No trigger investigation this run — the
  numbers moved on their own; leave the trigger alone.
- FACE-BEAT RECYCLE (same mechanism as the coach fix, unobserved):
  `accuseFace` also holds 3 variants and `drawTruthLine` recycles
  it on exhaustion; no verbatim face repeat appeared in this panel
  (NARR scan: 0 other repeats). If a face line ever repeats verbatim
  in one sitting, the same suppress-in-sitting guard applies.
- DROPPED THREADS NEVER RESURFACE (r159 pattern, persists): 5 drops;
  in all 3 cases with a next sitting, the next sitting opens on a
  new topic. The open-thread ledger carries pantry/creek asks across
  sittings (r163), but dropped threads themselves stay dropped.
- M8 ANALYZER HEURISTIC: the analyzer's "re-raises after a
  link-forming settle" counts fresh villager re-proposals to
  formerly-linked villages as re-raises. The prereg bar is about
  counter re-raises (none occurred). Next run: align the analyzer
  label with the prereg (fresh re-proposal vs counter re-raise), or
  the M8 verdict will read PARTIAL every time a village re-links.
- "The phoenix link (ash)" (r163 item 4) did not recur as a death
  cause this panel; nothing to add.

## METRIC REVIEW (§14)

- M7's clarified wording worked as intended: the 63 flags split
  cleanly into legitimate variety (recap/favor/landmark/teaching
  reframes), pool-cycle foreign-agree flags (counted as pool depth,
  fixed by job B), and one detector artifact (Sigrun: different
  phrases flagged for shared nod-suffix boilerplate). No verbatim
  repeat anywhere. The clarification stands.
- M8 was adjudicated CONFIRMED on its prereg bar (counter re-raises:
  0) against the analyzer's PARTIAL label — the label counts a
  different phenomenon (fresh villager re-proposals). See M8 note
  above; the analyzer wording is the fix, not the metric.
- M5's threshold is NOT MET (0/4) — the sequence is a standing
  survival fact, still reported, not re-scored.
- M10 FAILED on the panel and was FIXED in-run with proof +
  confirmation — the panel verdict stands as FAIL (no re-scoring);
  the fix is judged on its own proof test and confirmation re-run.
- No metric was re-scored mid-run. The drought bound stays RETIRED.
- Telemetry: 5 LOUD lines (l3.bonds/deepBonds/betrayalCases/
  mootsConvened/gossipConvos baseline → 0). EXPLAINED, prereg-known
  schema drift: the social driver never emits l3.* fields; end bonds
  are 67/68/72/78 in the JSONs. Baseline NOT rolled.

## REACHABLE / FUN / WINNABLE (leg 5)

- **Reachable: YES.** 224 real conversations across 4 villages;
  bonds, links, debates, confessions, plots, moots, feasts all fire
  in wild play. Only the table never appears — no village lives long
  enough.
- **Fun: YES.** The transcripts read as people — Kelly getting tired
  of being interrogated, Arlo handing over a person who isn't real,
  Autumn pivoting from confession to village news, the Tabitha↔Meera
  feud. The System now stays silent instead of repeating its hint,
  and no-words villagers have twice the agreement to give.
- **Winnable: UNCHANGED.** Social life is alive and working, but no
  village survived — 0/4 alive at end, 0/4 past d100. The social
  layer doesn't move survival; the win still runs through the
  winnability chain, which this leg doesn't touch.

## GATE (adoption closeout — r167 agent timed out mid-gate; this section filled by the adopting run)

`node scripts/check.js --quick` re-run by the adopter in the worktree:
log `evidence/2026-11-10/journey-social-life-r167-gate-adopt.log` —
**293 passed, 7 failed in 894s.**

Adjudication (baseline probe: the 7 failing tests re-run with r167's two
source changes stashed, i.e. pristine base 632ed6e23):

- **Caused by r167 (3):** test-measurement-proof-update,
  test-measurement-workflow, test-measurement-cache-flags — all PASS on
  the pristine base, all FAIL with r167's changes. Root cause: the
  retained neutrality proof's manifest covers all of `src/`, so the
  truth.js edit invalidates it. Prescribed fix in progress: fresh real
  neutral panel + `scripts/balance-proof-update.js` (see below).
- **Pre-existing on the base (4):** test-mobile-combat-cadence (2
  sub-failures), test-occupation-panels (real CLI workflow), test-phone-
  frame-proof (retained receipt stale vs ~90 source files — fails
  identically with and without r167's changes), test-establishment-
  r20-fixes-20261020 (racks-full next-day voice). NOT caused by this
  run; recorded, not fixed here. Phone-frame receipt refresh is a
  separate standing item (needs real 390×736/390×844 browser receipts;
  never hand-edit hashes).

Proof refresh (r167-caused failures): `node scripts/balance-panel.js
--root . --seeds 7 --policies capable,risk-aware,socialite,winseek
--days 150 --out .balance-neutral-new`, panel copied to
`evidence/2026-11-10/neutral-r167-adopt.json.gz`, then
`node scripts/balance-proof-update.js` rewrites
`scripts/balance-proof.json`. Panel log:
`evidence/2026-11-10/neutral-r167-adopt-panel.log`. The refresh was
run TWICE: once on the pre-rebase tree (proved the procedure), then
again after the rebase onto 91650a90f — the retained panel + proof are
the rebased-tree ones. Post-rebase re-run: all 3 measurement tests
PASS (proof-update, workflow, cache-flags) and all 5 r167 proof tests
PASS. Final gate state: 4 pre-existing base failures remain
(mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20); 0 failures caused by this run.

## ADOPTION RECORD (this run, oversight-playtest-loop-2, 2026-11-10 ~05:00Z)

- Stale-lock recovery: lock run_id 2026-11-10T03:55:44Z (r167) found;
  registry heartbeat for journey2-social was None and no process held
  the tree; last write was the gate log at 04:55:14Z (check.js killed
  mid-run when the r167 agent timed out). Adopted, not restarted:
  r167's play + fixes verified, not re-run (5/5 proof tests pass on
  adopter re-run; panel claims spot-checked against the raw JSONs —
  end bonds 67/68/72/78, end days 70/67/82/75, successions 9/12).
- Base moved during r167: master is now 91650a90f (r167 branched from
  632ed6e23). Branch rebased onto the explicit master SHA 91650a90f
  before landing — clean, no conflicts (master touched none of r167's
  files; 3 commits between bases). Rebased commits: fe8639bfb (r167
  work) + 2748c2134 (confirmation JSONs). Proof tests + measurement
  tests re-run post-rebase: 8/8 pass. Proof refresh regenerated on the
  rebased tree (commit 3).
- Rotation 5→6 written at closeout (crisis next).

## TELEMETRY

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/social.json --current
'evidence/2026-11-10/journey-social-life-r167-4330*.json' --metrics
l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
— 5 LOUD lines, all EXPLAINED schema drift (see Metric review).
Baseline NOT rolled.

## FILES (worktree journey2-social, branch journey2-social)

- src/js/truth.js — coach-repeat suppression in confrontWindup (job 1)
- src/data/foreignSpeech.json — agree pools 4→8, all 25 languages (job 2)
- scripts/journey-social-life-r167-20261110.js — driver (r163 verbatim +
  fresh seeds + r167 naming)
- scripts/analyze-journey-social-r167-20261110.js — analyzer (r163 verbatim)
- scripts/journey-social-r167-helpers.js — helpers (r163 verbatim)
- scripts/test-journey-social-r167.js — proof (r163 fixtures verbatim)
- scripts/test-journey-social-r167-narr.js — proof (r159 narr fix, carried)
- scripts/test-journey-social-r167-coach.js — proof (r163 coach fix, carried)
- scripts/test-journey-social-r167-coachrepeat.js — proof (job 1, RED→GREEN)
- scripts/test-journey-social-r167-agree.js — proof (job 2, ALL PASS)
- evidence/2026-11-10/journey-social-life-r167-prereg.md
- evidence/2026-11-10/journey-social-life-r167-{43301,43302,43303,43304}.json
- evidence/2026-11-10/journey-social-life-r167-analysis.txt
- evidence/2026-11-10/journey-social-life-r167-panel.log
- evidence/2026-11-10/confirm-coachfix/ — confirmation re-run JSONs (43301/43302)
- evidence/2026-11-10/confirm-agree/ — confirmation re-run JSONs (43303/43304)
- evidence/2026-11-10/journey-social-life-r167.md (this note)
