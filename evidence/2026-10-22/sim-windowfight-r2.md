# sim-windowfight-r2 — post-invitation wave-5 deliberate fighting (DIAG)
run fleshout-20261022T0555Z, axis scale-onramp — flesh-out loop arm
base: f83b5d92c (master; tree sim-windowfight-r2 branched from master tip)

ADOPTED ARM: sim-windowfight (run fleshout-20261022T0019Z) died with its
worker 5h before this run (heartbeat 5h stale, no writes 3h). The orphan
left a design doc and two untested scripts; this arm adopts the design
with the corrections listed below, re-verified seeds, and its own proof.

## Question (backlog #748)
Wave-5 UNLOCK is not wave-5 REACH. Once the wave-5 door opens, can the
village actually FIGHT wave-5, or is the invitation decoration? This arm
is the window half: what happens AFTER an unlock — fights (by whom,
outcomes), deaths by mechanism in the window, window survival days, did
the unlock change the village's fate?

## Fresh context (sibling arm sim-wave5door-openers, LANDED 80e31e3db)
The sibling answered HOW the door opens: it is a LIVE-DEMAND door (1/12
unlocks — s65423 d109, peakRecord5Day==w5Day; the grandfather clause only
holds it open after). Their corpus (evidence/2026-10-22/
perseed-wave5door-openers/, seeds 65421–65432) is the door-half census.
This arm measures the window half on a DISJOINT seed set.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15)
- PRIMARY (DIAG-GO): 100% attribution of wave-4+/wave-5 engagements on
  all 16 runs (0 unexplained, 0 instrumentErrors), with:
  - the herald/titan channel split (backlog #749): the wave-4 tutorial
    titan's canon is "no solo fights — hard gate" (titans.js); herald
    solo-TB refusals live in the herald-titan channel, never in the
    unexplained bucket;
  - kill-time bearer <redacted> attribution (backlog #754): `by` resolved against the
    DAILY bearer <redacted> THE KILL'S DAY (sampled end-of-day in the policy wrapper),
    never the end-of-run Game.villagerId (succession churn misattributes);
  - the #757 post-win continuation hook (Game.over=false post-win, then
    runDays again; D2-proven deterministic; never fires on village-lost —
    death-aware end preserved);
  - death rows persisted per seed (backlog #760: winTrack{path,seat} +
    rank-at-end + maxRank + everNational).
- The unlock RATE is a MEASUREMENT, not a judged bar: if 0/16 unlock, the
  unlock-rate finding + wall numbers are the verdict (report-only on the
  window half, not a failure — DIAG, no lever killed).
- Window half (CONDITIONAL on ≥1 unlock): post-unlock window decomposition
  — was wave-5 content FOUGHT (fights, by whom, outcomes), deaths by
  mechanism in the window, window survival days, did the unlock change
  the village's fate? SENSE-TESTING on window transcripts
  (SENSE-TESTING LAW: the System's register — big brother + chilling
  benefactor — judged for meaning, coherence, relevance, not counts).
- Horizon: 180d death-aware (+10d tail max). The door opened ~d75–109 on
  measured substrates; seatdrive wins truncate ~d90–130 — hence the
  post-win hook, not a longer horizon.
- SEEDS: 65441–65448 × {leadfeast, belongfeast} = 16 runs. Seed
  verification (2026-10-22, recorded here): `find evidence -name
  "s<seed>.json"` across the whole workspace returned ZERO matches for
  65441–65448. The orphan's pre-reg seed list 65401–65408 is VOID —
  its "verified unused" claim was never established on disk (no
  s65401–65408 JSONs found anywhere; the claim is unreproducible, so a
  disjoint set is used). 65421–65432 are consumed by the landed sibling
  sim-wave5door-openers corpus.
- Substrate (pinned winning substrate): VCE.armedFor(base) via
  scripts/policies/vgearconfirm.js (VGEAR=1).
- Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  VGEAR=1 KILLDISC=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset.
  Sweep fails loud unless env matches exactly.
- §15: no before/after — diagnostic with no intervention and no control.
  The §15 det-gate (instrument on vs the landed r3 sweep, byte-identical
  day hashes) is the parity instrument.
- SECONDARY (report, don't judge): wall numbers
  (national/table/wins, wave-4/5 unlocks, median/max survival, exiled).
- Per-seed anchor check: every per-seed JSON must carry
  anchorCommit == f83b5d92c (the stale-base lesson: a DIAG claiming
  "current master" proves it per seed).

## Metric review
(none yet — filled at closeout if the metric proved wrong)

## Design (instrument-only; zero src/js; zero scripts/policies changes)
- scripts/sweep-windowfight-20261022.js — the orphan's sweep, adopted:
  landed r3 window layer + killdisc v2 (unmodified) + (a) daily bearerVid
  sampler (pure read in the policy wrapper — the #754 kill-time fix);
  (b) the #757 post-win continuation hook (the ONE documented engine
  mutation: Game.over=false post-win, then runDays again — POSTWIN-ALLOW);
  (c) end-of-run w5gates-lib gateVector + attribute (pure reads,
  post-run). Pure helpers (detectUnlockDays, channelOf, continuePostWin)
  exported for the proof test.
- scripts/analyze-windowfight-20261022.js — the orphan's analyzer,
  path-pointed at perseed-windowfight-r2/: herald vs wave-monster channel
  split, kill-time bearer <redacted> attribution, 100% attribution accounting,
  unlock rate, per-unlock window decomposition.
- scripts/test-windowfight-20261022.js — the proof the orphan never
  wrote: E0 shape; E1 det-gate (my sweep vs landed r3 sweep byte-identical
  40d on seed 65441); E2 RED→GREEN synthetic (unlock detection, herald
  split, post-win hook incl. never-fires-on-loss); E3 read-only scan
  (zero Math.random, zero Game.state writes, install/uninstall paired).

## Proof
`scripts/test-windowfight-20261022.js` — 39/39 GREEN (exit 0).
- E0: sweep module loads, pure helpers exported; clean-env spawn exits 2
  with SWEEP STOP (fail-loud gate works); analyzer runs clean on an empty
  corpus.
- E1 det-gate (§15 instrument-parity): my sweep vs the landed
  windowreach-r3 sweep, seed 65441, 40d, leadfeast — day-hash sequences
  byte-identical (firstDiff=-1), 0 instrumentErrors. The bearer <redacted>
  sampler (pure read) and the conditional post-win hook perturb nothing.
- E2 RED→GREEN synthetic: unlock-day detection (w4/w5 same-day, never-5,
  empty trace), herald vs wave-monster channel split, post-win hook
  (winDay/winPath/resume recorded; NEVER fires on village-lost). RED
  demonstrated: naive reference impls (w5 threshold = w4 threshold;
  herald unsplit) fail ≥2 assertions the real code passes.
- E3 read-only scan: zero Math.random draws in sweep/analyze/test; the
  only Game write is the documented POSTWIN-ALLOW `Game.over = false`;
  WI install/uninstall paired; no DOM requires.
- BUG CAUGHT BY THE PROOF GATE: the orphan's sweep script had a syntax
  error (missing closing brace for `if (require.main === module)` — the
  orphan could never have executed it). Fixed in the adopted file.

## Sweep
`scripts/sweep-windowfight-20261022.js` — 16/16 runs ok, 0 errors, 0
instrumentErrors. Per-seed JSONs under
evidence/2026-10-22/perseed-windowfight-r2/{leadfeast,belongfeast}/,
anchorCommit=f83b5d92cc32 on all 16 (verified programmatically).

INFRASTRUCTURE INCIDENT (recorded, not hidden): a /tmp wipe mid-run
killed the first sweep invocation after 5 runs (its log and the
background session died with it; the 5 per-seed JSONs were already on
disk in evidence/ and survived). The remaining 11 runs were resumed in
two invocations (belongfeast 65443–65448; leadfeast 65444–65448);
sweep-summary.json was merged programmatically from the 16 per-seed
JSONs. Lesson applied: no /tmp for anything the run depends on — the
transcript capture tooling lives in the goal's hidden_files.

## Results
- Unlock rate: wave-4 14/16, wave-5 **2/16** (measurement, not a judged
  bar). The two unlocks:
  - leadfeast/s65443: w4Day=70, w5Day=100, won d134 (feared/light/mercy),
    village-lost d146 (12 post-win days via the #757 hook).
  - belongfeast/s65445: w4Day=69, w5Day=84, won d90 (feared/light/mercy),
    SURVIVED to d181 (91 post-win days).
- PRIMARY (DIAG-GO): **256/256 wave-4+ engagements attributed, 0
  unexplained, 0 instrumentErrors — GO MET**, under the strict pre-reg
  rule (fight-id OR kill-join OR tb outcome; the analyzer's first draft
  had a tautology that counted everything — caught and fixed during the
  run, see below).
  - Herald-titan channel (#749): 157 engagements, **157/157 refused** —
    the wave-4 tutorial titan's "no solo fights" canon holds absolutely
    on this substrate; zero herald fights started.
  - Wave-monster channel: 99 engagements (97 with fight-id/kill/outcome;
    2 non-fight with explicit reasons — see below).
  - Two non-fight engagements root-caused (kill-discipline: the game is
    behaving; the census classifies, nothing killed):
    1. belongfeast/s65445 d90 `finale_opening`, started=false — the
       finale campaign's node gate refused it ("THE OPENING CREDITS will
       not roll until the crew is dead", finale-campaign.js). Designed,
       narrated refusal → `finale-node-gate-refused`.
    2. belongfeast/s65446 d70 `suburb` raid, started=false — the muster
       announcement beat; two started suburb raids with fight-ids
       followed on d71 (both lost) → `muster-announcement`.
- Kill-time bearer <redacted> (#754): 20 wave-4+ kills — 13 by the scholar-at-kill,
  7 by villagers, **1 phantom caught** (leadfeast/s65442 d83 Algorithm
  kill by jorge_silva: end-of-run vid said scholar, but the kill-day
  bearer <redacted> was owen_smith — exactly the misattribution class #754 was
  built to catch).
- Wave-5 engagements: 9 TB + 13 field fights; 3 wave-5 kills (2× Editor,
  1× finale_crew).

### Window 1 — leadfeast/s65443 (unlock d100 → win d134 → lost d146)
The village FOUGHT wave-5. Post-unlock: a d114 night raid (Herald +
Rerun + 2× Editor + Big Loud) gorged the pantry (~1,000 kcal/night for
3 nights); on d117 the player + Yara + Raisa fought The Editor in a
13-round TB brawl — Raisa died ("☠ Raisa falls. You carry the weight of
it. They died beside you."), the player struck for 275–288/round with a
Phase blade under FEASTED ×4.05, and The Editor fell ("The Editor
falls... 📺 +20 style — dropped the Editor!"). The second Editor fell
the same day to boris_kowalski's party; the Rerun was fought and lost.
The Spoiler was fought 3× (d132–134) and lost every time. The d134
table priced it all: "6 wave-4 and 4 wave-5 fought... THE HERALD came.
Named and located... They faced The Spoiler and lived to sit here."
Feared/light/mercy win. Nine days later the player died of DEHYDRATION
(d143) and the village was lost d146 — in the post-win window, not the
run that mattered. Verdict on #748 for this run: the invitation was NOT
decoration — wave-5 was fought, twice won, and priced at the table.

### Window 2 — belongfeast/s65445 (unlock d84 → win d90 → survived d181)
The opposite shape: win came 6 days after unlock, and the village lived
91 post-win days to the horizon. Wave-5 was FACED but never beaten:
finale_opening announced d90 (node-gate refused — crew still alive),
network_note fought d99 (lost), Editor fought d162 (lost), Rerun fled
d84 (105 damage taken in 2 rounds), Editor killed a villager d146.
0 wave-5 kills. The village survived anyway — maxRank GLOBAL,
everNational. 34 window deaths (24 combat, 5 player-combat, 3 monster,
1 dehydration, 1 starvation): the post-win world stays lethal. Verdict:
the door opened onto content the village could touch but not beat —
and it didn't need to. The win was already banked.

### The plain-word story
On the pinned winning substrate, the wave-5 door opens rarely (2/16)
and what waits behind it is real: multi-round boss fights with
telegraphed mechanics, a ledger that fills on kills, and a table that
reads your war path back to you. One village bloodied the Producers
and won; another bounced off them and won anyway. The unlock changed
both villages' stories — neither treated the invitation as decoration.

## Wall numbers (this corpus, n=16)
national 6/16 · everNational 12/16 · table 13/16 · won 8/16 ·
wave-4 unlock 14/16 · wave-5 unlock 2/16 · median survival 115d ·
max survival 181d · exiled 0 (structural: the harness emits
village-lost/over-other/survived; 'exiled' never occurs).

## Sense-testing (SENSE-TESTING LAW)
Both unlocks' window transcripts were re-run with narration on and read
in full (deterministic reruns reproduced w5Day exactly: 100 and 84).

- The unlock beat (both runs): a veteran kill ON CAMERA ("Oh — OH.
  Everybody saw that, right? Boris just put down The Algorithm... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name."), the wave
  bar fills, then: "📡 RATINGS ARE UP... the Producers have greenlit the
  fifth draft" / "You've gotten too big for the story. Ratings are
  GREAT, by the way — but you're threatening the narrative now. So the
  narrative is fighting back. Meet the PRODUCERS." / "(The sky clears
  its throat. The show is defending itself.)" Villagers react as people:
  Yara "Don't ever make them angry. That's all I'm saying."; Sari,
  "Same work. Sharper eyes. The show doesn't eat unless we feed it.";
  Naran, "We're the main event now. Somebody tell my agent." The
  System's register is exactly the canon: big brother + chilling
  benefactor, genuinely pleased to escalate.
- The Editor kill (s65443, d117): a 13-round brawl with telegraphed
  cutting-room mechanics ("the film strips show what is about to be
  cut: YOUR POSITION. (One round. Do something about it.)"),
  feast-powered strikes, a companion death with weight ("☠ Raisa falls.
  You carry the weight of it. They died beside you... The fire feels
  smaller tonight. 📖 The entry for Raisa is finished. 2 deeds recorded.
  No more pages."), and the System paying out ("📺 +20 style — dropped
  the Editor! ... the village has bloodied the Producers themselves.
  You're the show now."). Wave-5 is fought, not decorated.
- The Network Note loss (s65445, d99): visible memo mechanics
  ("THE HERO SHOULD BE MORE VULNERABLE", "THE WOLF SHOULD HAVE LASERS
  NOW" — telegraphed a round ahead, "Read the memo for exact terms"),
  companions fighting and patching ("Zoltan patches you up (+12 HP).
  'Hold still!'"), and the fight KILLED the player in round 5. What
  followed is the village-as-protagonist thesis working: "📖 The Codex
  turns a page on its own. George Scholz is dead... 🌟 MANTLE TRANSFER
  DETECTED... The Codex doesn't pause for grief... the mantle just...
  transfers." Hala Al-Sarhan wakes as the new bearer ("You wake up
  somebody else"), the village grieves AND politicizes ("With Haven
  grieving, Emberhold installs their own speaker at the table. Tribute
  rises to 8,438 kcal/week. Grief is leverage, and they know it."),
  and the village survives to d181. The System: "OH. Oh no. ...The
  gamblers are very quiet." then "(That is a lie. We noticed. The
  audience CRIED.)"
- The d134 table (s65443): "◈ THE AUDIT — the System reads your run
  back to you, and the galaxy listens... with 6 wave-4 and 4 wave-5
  fought... THE HERALD came. Named and located — the war council knew
  its face... They faced The Spoiler and lived to sit here." The
  feared/light/mercy path: "Show mercy... The most frightening thing
  you ever did." The wave-5 fights are priced into the run's value.
- One sour note (documented, not chased — outside this arm's axis):
  post-win, the transcript's looting beat reads "You take bandana from
  Yara. Your hands know what they did. (+14 trauma)" with no
  interlocutor and no social consequence in the lines — worth a
  findings-backlog line for the social loop.

## Blanks filled / documented
- FILLED: the orphan's missing proof test (E0–E3, 39/39 green), which
  caught a real syntax error that would have made the orphan's sweep
  unrunnable.
- FILLED: the analyzer's attribution tautology (every wave-monster
  engagement auto-attributed) — replaced with the strict pre-reg rule
  plus two root-caused non-fight categories (finale-node-gate-refused,
  muster-announcement).
- FILLED: the #754 kill-time bearer <redacted> now has its first caught phantom
  (leadfeast/s65442 d83).
- DOCUMENTED (findings backlog): post-win looting beat with no social
  consequence (above); the herald 157/157 refusal rate (canon holds —
  no action); the 'exiled' metric is structural-zero on this harness
  (endReasons are village-lost/over-other/survived).
- The #748 question is ANSWERED: wave-5 unlock → real fights → priced
  at the table. DIAG-GO.

## Metric review
The primary metric held: 100% attribution under the strict rule
(256/256, 0 unexplained, 0 instrumentErrors) — but the analyzer's
first draft did NOT implement the pre-reg's strict definition (it
counted every engagement via a tautological condition). Caught during
the run by an independent strict recount, fixed in the analyzer, and
the two genuinely non-fight engagements were root-caused to designed
game behavior (finale node-gate refusal; muster announcement beat).
No metric revision needed for the next run — but the lesson stands:
the analyzer must encode the pre-reg definition literally, and an
independent recount is worth the 30 seconds.

## Telemetry deviation check
`scripts/telemetry-check.js` vs the scale-wall baseline fired LOUD on
both policy dirs (table -62% leadfeast; national -92% belongfeast;
"wins disappeared" both). Verdict: EXPLAINED, no investigation —
(1) field-name artifact: this corpus records `won`, the baseline
reads `wins` (real: 8/16 won); (2) regime mismatch the baseline itself
forbids: the baseline is the winseat regime (16/16 wins by
construction), this corpus is the VGEAR pinned winning substrate.
Baseline NOT rolled forward (it belongs to another regime).
