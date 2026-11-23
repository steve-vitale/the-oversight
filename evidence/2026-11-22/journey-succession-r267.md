# Journey succession r267 — Lane B, leg 7 (succession) — RUN NOTE

Run: `playtest-loop-2-20261122T1700Z`. Panel 23:24:44Z–23:51:38Z Nov 22, 2026.
Base: master `52b71428f` at registration. Closeout by finisher (the 17:00
CST occurrence timed out before closeout; the panel, proof tests, and
adjudication below were verified from the files, not taken on report).
Rotation-b read 7 at run start; this run writes 4 at closeout.

## Pre-registered question + bars

r266 ended with two FAILs, both mourning-class: DRY-CENSUS (2 dry hits on
pick `alive:event:mourning`, Asep 34426 d94, Ursula 34436 d91 — the pick
chose an unfilled template, `t2fill` baked the dead's name in after it,
`convoPick`'s run-ledger preference could not see the filled line was
run-blocked, `sayLine` dried it) and MOURN-TEMPLATE (1 village-window
repeat, Ava/Finn, opener:expect-fire, Hilda). REL-WIT was
INSUFFICIENT-DATA (0 single-fresh draws). This run's variable under test
is the fill-aware retry in `topic2Ask` (see The fix). Staging stays
WIT-SIT v2 deliberately, so r266→r267 is a clean before/after on the
same instrument; post-phase-only staging stays filed for r268. Stated
before play: REL-WIT would very likely return INSUFFICIENT-DATA again.

Bars (binding, §14, carried from r266): DRY CENSUS 0 dry hits any class;
MOURN-TEMPLATE 0 repeats (amended r263, double-stage-pair exemption
untested); SUPPLY ≥1 witnessed person corpse = SUPPLY-PRESENT;
MONSTER-WITNESS ≥90%; STAGE ≥1 staged wit-sit fires; REL-WIT PASS = ≥1
judged witness-variant serving with rel.witnessed true AND 0 where not
witnessed, <3 single-fresh draws = INSUFFICIENT-DATA, wrong-dead serving
= fabrication FAIL LOUDLY; REL-BOND; REL-VET (≥10 opener draws arm a);
MOURN-EXHAUST 0; MANTLE-FINE 0 flippedImmediate=false outside
VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0
day-skips; WILD CHECK 0 regressions on F4a/F4b/F4c/F5/F6/C3c/F2/C3d +
landed-fix surfaces; C3d WILD HOLD 0 erasures; F5 WILD EXERCISE
descriptive; CONTROLS smoke 33998 snapshot matches r266.

## Panel

- Driver `scripts/journey-succession-r267-20261122.js` (r266 driver,
  rename-only fork), analyzer `scripts/analyze-journey-succession-r267-20261122.js`
  (same), runner `scripts/run-journey-succession-r267-panel.sh`.
- Fresh band 34494–34517 (24 seeds, EARLY_KILL_DAY=40, POST_DAYS=70) +
  positive control 34403 (same config, replay) + smoke 33998
  (EARLY_KILL_DAY=5, POST_DAYS=25). Band verified fresh before play
  (word-boundary grep, 0 seed-uses; first-choice band 34446–34469
  abandoned over a 34456 collision in sim-optb preregs).
- All 26 seeds exit=0. Panel complete 23:51:35Z, analyzer exit=0.
  (`evidence/2026-11-22/journey-succession-r267-panel.log`).

## Results — adjudication per bar

| Bar | Verdict | Number |
|---|---|---|
| DRY CENSUS (binding, THE fix bar) | **FAIL** | 1 dry hit, other-class (non-mourning); 0 binding-class |
| MOURN-TEMPLATE (binding) | **PASS** | 173 servings, 0 same-speaker repeats, 0 village-window repeats, 0 double-stage exemptions |
| MOURN-EXHAUST (binding) | **PASS** | 0 exhausted-line servings |
| SUPPLY (binding) | **SUPPLY-PRESENT** | 2 witnessed person corpses in the census; a 3rd caught only by the live wit-sit scan (see below) |
| MONSTER-WITNESS (binding, instrument) | **PASS** | 868/868 = 100% (independently aggregated from the per-seed JSONs; r266: 875/875) |
| STAGE (binding) | **PASS** | 5/5 staged sittings fired |
| REL-WITNESS (binding) | **PASS** | 1 judged serving, held, witnessed=true; 3 single-fresh draws (floor met exactly) — first wild witness serving ever |
| REL-BOND (binding) | **PASS** | 12/12 held, 0 unheld |
| REL-VETERAN (binding) | **PASS** | 19/19 held, 0 unheld; 85 opener draws in both-veteran convos |
| MANTLE-FINE (binding) | **PASS** | 99 deaths; 0 flippedImmediate=false, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips |
| WILD CHECK (binding) | **PASS** | five carried proofs re-run GREEN on the rebased tip (see below); no regression observed in the panel transcripts |
| C3d WILD HOLD (binding) | **PASS** | 0 erasures in the transcripts read |
| F5 WILD EXERCISE (descriptive) | 0 firings | 19 "settled" lines, all ambush-case or wind-down, none settled-favor; rolling window r233+r245+r248+r254+r258+r263+r266+r267 stays 0 |
| CONTROLS (binding) | **PASS** | smoke 33998 matches r266 exactly (see below) |
| CAP-NC (descriptive) | PASS | bonded-by-deadline 4/4 eligible seeds |
| POSITIVE CONTROL (descriptive) | 0 witnessed | replay divergence, not instrument failure |
| HABIT-COLLISION | **PASS** | 0 same-seed collisions (4 habit-for servings) |

relOpp totals (26 seeds): bondConvos 54, vetConvos 162, witConvos 5,
mourningConvos 220. Mourning servings 173 (r266: 150). Honest fallbacks
81 (Elif 5 on 34494, Natalia 7 on 34499, Sanne 21 on 34500, Ines 18 on
34503, Demiana 3 on 34507, Ines 1 on 34498 — "They spread their
hands..." pick=null, not dry hits). Null-return silences 0. r192 wild
check: deflect_q 0, dlg:doubt 0, other-class 1 (the 34512 hit).

MOURN-TEMPLATE shape counts (173): opener:vet-treeline 12,
opener:bond-knew 4, next:name-right 9, opener:burnt-piece 16,
opener:owed-favor 21, opener:world-continues 20, next:fire-smaller 14,
cope:last-words 18, opener:expect-fire 21, opener:dreamed 14,
opener:vet-club 7, cope:bond-habit 1, next:bond-knew-things 1,
part:bond-watch 2, part:pick-up-share 2, opener:bond-person 4,
opener:wit-saw 1, part:habit-for 6.

## REL-WITNESS PASS — the first wild witness serving

The prereg's expected outcome was INSUFFICIENT-DATA. The panel beat it:
3 single-fresh draws (the floor is 3), and one of them served.

- Seed 34505 d+7, Brayden, shape `opener:wit-saw`, dead = the ambush
  stranger ("the woman in her 30s, with a nervous tic", Nadia Khoury),
  bondV=4, witnessed=true, judged held. See People check for the
  transcript read.
- The other two single-fresh draws served nothing (34506 Monique/Liam,
  34511 Kavya/Stan — both ambush, both named the staged dead in the
  lately line, no witness variant). That is the standing shape: the
  variant fires rarely even when the sitting is staged right.

WIT-SIT: staged 5, fired 5 (single-fresh 3, multi-fresh 2;
no-living-witness 0); lately named the staged dead on 4/5 fired
sittings; witness-variant servings on 1 sitting; double-staged deaths
0. Sittings: 34505 d+7 (dead A, ambush, Brayden, freshPersonN=1,
witness serving `opener:wit-saw`); 34506 d+16 (Liam, ambush, Monique,
freshPersonN=1, named, no serving); 34511 d+26 (Stan, ambush, Kavya,
freshPersonN=2, named, no serving); 34517 d+65 (Olivia, combat,
Ethan/Devon/Sophia, freshPersonN=1, named, no serving); 34517 d+68
(Ethan, combat, Emma/Sophia, freshPersonN=2, named, no serving).

## SUPPLY-PRESENT — and the census missed one

The analyzer's WITNESS-CENSUS verdict is SUPPLY-PRESENT (2 witnessed
person corpses). Independent aggregation from the 26 per-seed stdout
JSONs confirms the census count exactly: 2 witnessed of 159 person
corpses, both on seed 34517 (Olivia d+65 and Ethan d+68, both combat,
both witnessed by the fighters beside them). MONSTER-WITNESS 868/868 =
100% confirms the census reader is sound on monsters.

But the census is a lower bound, and this panel proves it again — with
a new shape. The 34505 ambush death (Nadia Khoury, a stranger, seen
go down by Brayden) is NOT in the corpse census at all: seed 34505's
census lists 19 person corpses and none with cause ambush, while the
wit-sit live scan staged the death and the witness variant served on
it. Across the panel, the live scan staged 3 ambush deaths but only 1
ambush-caused person corpse appears anywhere in the census. The
40-entry cap is one cause (most seeds sit exactly at 40 entries); the
deeper cause is that ambush deaths usually never enter the census.
Supply is present either way (2 census + 1 live-scan-only = 3 witnessed
person deaths), and the REL-WITNESS serving is real. Filed: the census
undercounts ambush-witnessed deaths systematically, not just by cap;
the wit-sit live scan stays the backstop and the census count stays a
lower bound (r266's Sari finding, same family, now with the ambush
shape attached).

Per-seed witnessed person corpses (census): 34517: 2; every other fresh
seed: 0; 34403: 0; 33998: 0. Causes of the 2: combat, combat. No
third witness path appeared (nothing outside combat/ambush).

## The one FAIL: the 34512 table-event dry hit (pool exhaustion, not a missed ack)

DRY-CENSUS fails on exactly one hit panel-wide: seed 34512 d86, Lokman,
pick `alive:event:table`, key "They say the table's coming. For us. I
keep thinking about what we'd even bring to it.", returned "...Sorry,
lost my train of thought." (`fellBack=true`, sites
conversation.js:8290:19, conversation.js:9453:23,
convo-dialogue.js:1204:21). It is the prereg's flagged interesting
case — a dry hit on a NON-mourning topic, where the retry is generic.

Investigation (sayTrace + convoLines + all 34512 transcripts + the
code). Verdict: **pool exhaustion — the documented last-resort gap,
not a missed ack block.** The chain, verified step by step:

1. The `alive:event:table` waiting-phase pool has exactly **2**
   candidates: the table line, and "Have you felt it? Like the air
   before a storm, but — bigger. Something's on its way."
2. Both were served plain on d71 (Yuliana served the table line,
   Nino served the alternate). Plain servings ledger their content:
   `sayLine` blocks on the first chunk, and with no ack prefix the
   first chunk IS the content line.
3. At d86, Lokman asked the table topic for the first time
   (`c.t2snap` empty for him on this topic), so his pick carried **no
   ack** — the missed-ack hypothesis is ruled out: the retry's guard
   saw the bare table line, and `convoWouldBlock` correctly returned
   true (the d71 entry was still inside the 48-entry run-ledger
   window; the dry hit itself proves `sayLine` blocked it).
4. The retry tried the only alternate. It was blocked too — same d71
   plain serving, same window. No candidate passed, so the retry
   returned the original line unchanged, exactly as designed, and
   `sayLine` dried it.
5. Why d71 could serve lines first served on d55: the d55 servings
   carried ack prefixes ("You asked me that before..." / "Last time
   things were different..."), and the ledger keys the FIRST chunk —
   so d55 ledgered only the ack chunks, not the content. d71's plain
   servings ledgered the content, exhausting the 2-line pool for d86.
   Riley served the alternate again on d86 with the third ack variant
   ("Huh. I answered that once..."), which passed precisely because
   its first chunk was a fresh ack.

The retry worked as designed; the pool is too small for a third
serving across a 70-day post-phase. The mourning pool (5 generic
templates + relationship variants) never exhausted — 0 mourning dry
hits in 173 servings, vs r266's 2 in 150. The fix bar is therefore
split: the mourning defect is fixed (proof test + wild 0), the
table-event dry is the same exhaustion shape the prereg filed for
mourning, now observed on a 2-candidate pool. Follow-up filed (not
built here): the retry should also try ack-prefixed alternates when
the bare pool is exhausted — an ack-prefixed line passes `sayLine`
because only its first chunk is checked — or small pools need more
candidates. A dry hit on a mourning follow-up (`topic2Beat`) did NOT
appear; that gap stays filed.

## The fix

Fill-aware retry in `topic2Ask` (`src/js/convoTopics.js`, the only
source change). After the pick + fill (+ change-ack prepend), if the
composed line `convoWouldBlock`s, try the other candidates from the
same pool: fill each, take the first whose composed line would NOT
block, and record the replacement in `c.said['t2:'+topic]` so the
per-villager dedupe sees the line actually served. If NO candidate
passes, return the original line unchanged (the last-resort
pool-exhaustion gap, honest and documented). Scope is `topic2Ask`
only; `topic2Beat` follow-ups untouched (filed). NOT built: the
`structuralTurn=true` exemption for `alive:event` (would trade dry
deflections for verbatim repeats and fight the MOURN-TEMPLATE bar).

Proof test `scripts/test-journey-succession-r267-mourning-dry.js` —
**29 PASS, 0 FAIL, ALL GREEN** (re-run by the finisher on the
worktree tip, on the first rebased tip `93b7f628d`, and again on the
merged tip `0b3993e80` at closeout — green every time):
collision serves the clean 'burnt-piece' line with no dry anywhere in
the transcript; control serves honestly with no change to unblocked
paths; all-blocked dries exactly as on base with no wrong-dead line
(the documented gap, not claimed fixed). The test ran RED before the
fix in-run (collision drew poisoned, `sayLine` blocked, no retry).

## People check (transcripts read in full)

Four sittings, judged as people. Verdict: **PASS** — the only defect
is the single dry line in Lokman's sitting, root-caused above.

- **34505 d+7 WIT, Brayden (trust 47)** — the first wild witness
  serving. He opens trading knowledge, talks about protecting the
  group and sleeping lighter, then, asked how he's holding up
  "about... them": "I saw the woman in her 30s, with a nervous tic go
  down. I did what I could. It wasn't enough, and I carry that now."
  He names her by the feature he knows because she is a stranger —
  that is the honest form, not a fabrication. The rest holds together:
  a plant lesson, a comfortable quiet, a wry exit ("I should go
  before I say something sincere.").
- **34512 d+45, Lokman (trust 93)** — the dry-hit sitting. A real
  conversation with one stumble: a betrayal confession, an
  expedition, a plant lesson, then YOU ask about the table and he
  loses his train of thought mid-sentence, recovers ("Can I ask you
  something else?"), talks about wanting a home, takes the Scout
  role. The dry line reads as a man blanking, not a broken machine —
  but it IS a defect: the player asked a straight question and got a
  deflection. Pool exhaustion, filed above.
- **34499 d+30, Ivy (trust 90)** — mourning Aria, bond depth 3,
  bondV 82. "We both stood at the treeline. Aria held it. I keep
  replaying my part, looking for the step I missed." Then the
  bond-habit follow-up: "I retie every loose knot in passing the way
  Aria used to, when they were the one keeping me steady. It doesn't
  work the same. I do it anyway." And: "Aria knew things about me
  nobody else does. That's gone now, and I keep catching myself
  about to tell them something." The Scout role passes from Liam to
  her mid-sitting, with his assent. Genuinely mournful, specific,
  non-generic.
- **34498 d+45, Maeve (trust 99)** — mourning Kwame, bondV 100,
  depth 3. She opens distracted ("Have you — sorry. I keep thinking
  about them."), asks for help hauling water ("Water's almost gone —
  0 liters"), then the ack + burnt-piece line serves cleanly: "You
  asked me that before. It's a different question now." "Kwame
  always took the burnt piece. Said someone had to. I take it now."
  "I'd follow you out past the treeline. Don't tell the others —
  they'd want to come too." A widow taking up her dead husband's
  habit, in her own words.

## Controls — smoke matches r266 exactly

Smoke 33998 deterministic fields match r266's smoke run exactly:
handoff d6 Heinrich → Grace (scripted); relPost bonds 33; relD14 45;
relEnd 47; mourning servings 0; NPC-NPC bonds 12; selfId grace_obi;
pick rank 1; funeral INCALL true; selfReq 0. No base drift since r266.

Positive control 34403 (replay, known supply on the r262 trajectory):
0 witnessed person corpses — replay divergence, not instrument failure
(MONSTER-WITNESS 100% is the binding instrument check). relPost bonds
42, relD14 45, relEnd 45, selfId carlos_diaz, pick rank 1, funeral
INCALL true. Two mourning servings (Eric d+64 opener:bond-person for
Carlos; Eric d+7 opener:expect-fire for Duc).

CAP-NC: bonded-by-deadline 4/4 eligible seeds; descriptive bondedEver
15/17 probe-opened seeds; selfReqDayEntries total 0 (r133 purge check,
expect 0). OPP totals: unbonded talk-requests 4; FIRST-bearer new bonds
on undriven days 16; NPC-NPC new bonds 165; newcomer arrivals 74;
FIRST-bearer new bonds 4 vs pre-existing 15.

## WILD CHECK

Five carried proofs re-run GREEN on the first rebased tip `93b7f628d`
and again on the merged tip `0b3993e80` at closeout: r262
escalator-cap GREEN, r254 multiwit ALL GREEN, r232
relationship-mourning ALL GREEN, r225 F5 harness 22 passed / 0 failed,
r258 selfwit ALL GREEN. No F4a/F4b/F4c/F5/F6/C3c/F2/C3d
regression observed in the panel transcripts. C3d: 0 erasures in the
transcripts read (the recap opener engages; the "still on what you
miss most" shape is intact in the sittings read). F5 WILD EXERCISE: 0
firings by the r248 convention — the 19 "settled" lines in convoLines
are the ambush-case line ("Nobody's settled it") and the generic
wind-down line ("...settled. Feels better said out loud."), not
settled-favor servings. Rolling window r233+r245+r248+r254+r258+r263
+r266+r267 stays 0; the r225 harness (22/22) remains the binding proof.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-22/journey-succession-r267-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
— 2 LOUD lines, both forced-chain regime, investigated, no real bug
shown (same two lines as r266, same cause):

- deaths.bearer: baseline 7.6 → current 99 (n=26 files). The panel
  forces a bearer death on day 40 of every seed (EARLY_KILL_DAY=40)
  plus the scripted smoke death; 99 bearer deaths across 26 seeds is
  the forced chain doing its job (r266: 87).
- census.fallen: baseline 14.3 → 193. Same regime — forced chain +
  110-day panel horizon (r266: 175).
- census.alive, census.integrationStage, week2.deadBearerMentions:
  quiet.

Per the prereg rule (a forced-chain panel must NOT roll the unforced
baseline forward), **the baseline is NOT rolled**. The LOUD lines are
regime, not drift. (The tool sums across files while the baseline is a
per-seed mean — the sum-vs-mean mismatch is unresolved since r229;
the r266 investigation reached the same conclusion.)

## Reachable / fun / winnable

This run's lever is a conversation-feel fix, not a winnability lever:
it removes a class of deflection (mourning answers that dried at
emission) so villagers mourning the dead answer honestly instead of
losing their train of thought. The mourning defect is fixed in proof
and in the wild (0 in 173). The remaining dry is a 2-candidate pool
running out, not a new winnability wall. No deed-gate or win-price
change; nothing here moves the veteran/standing chain. The REL-WIT
PASS matters for the succession screen's credibility: a villager who
saw someone die can now say so in the wild, once, honestly.

## Metric review (carried + filed)

- REL-WIT: **PASS for the first time in the wild** (1 judged serving,
  3 single-fresh draws, floor met exactly). The 3-draw floor stands.
  Post-phase-only staging stays FILED for r268 — with the variant now
  proven to fire in the wild, the next panel should stage post-phase
  only on single-fresh seeds to raise the draw count, or the floor
  needs revisiting. WIT-SIT v2 did its job; the instrument question
  is now draw volume, not whether the variant can fire.
- MOURN-TEMPLATE double-stage-pair exemption: still untested in the
  wild (0 double-stage pairs sharing a shape). Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel (r233+r245+r248+r254+r258+r263+r266+r267, still 0).
- **Filed (this run):** table-pool exhaustion — the fill-aware retry
  needs a next step when the bare pool is exhausted: try
  ack-prefixed alternates (only the first chunk is ledger-checked, so
  a fresh ack passes `sayLine`), or grow small pools. The 2-candidate
  `alive:event:table` waiting pool dried on its third serving.
- **Filed (this run, instrument):** the corpse census undercounts
  ambush-witnessed deaths systematically — 3 ambush deaths staged by
  the live scan, 1 ambush-caused person corpse in the census. The
  census count stays a lower bound; the wit-sit live scan stays the
  backstop.
- **Filed (carried):** `topic2Beat` follow-ups share the
  template-vs-filled gap — no wild hit this panel; fix only if one
  appears.
- **Filed (carried):** total pool exhaustion (all mourning templates
  run-blocked) still dries — the retry's last resort is the original
  line, unchanged. A larger single-name pool or a last-resort
  structural serve would close it; neither is built here.
- REL-WITNESS note: the 34505 serving named a stranger by
  description, not by name — the witness variant's honest form for
  unwitnessed-name deaths. No fabrication: the serving named the
  latest dead, witnessed true.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). Day-skip watch:
  twenty-eighth straight panel watch, 0 skips. BOWCRAFT bisect for
  the 34362 drift stays open (not this run's). Outing-chain re-tune
  stays open (conversion 12.9%, r260).
- **Filed (diagnostic, carried):** the witness-population map is
  corrected (r266) — ambush is a second witness path (bystander
  within 6 tiles). The `hurtVillager` fix proposal stays filed for
  Steve, NOT built (a game change to grief/gossip/murder gating,
  needs his call).

## Adoption notes

- The fix is one function (`topic2Ask`), conversation-feel —
  commit carries `[needs-eyes]`.
- The DRY-CENSUS FAIL is a pool-exhaustion dry on a non-mourning
  topic, root-caused above with the follow-up filed. It does not
  indict the retry: the retry ran, found nothing passable, and
  no-op'd as designed. Landing the fix is still correct — the
  mourning defect it was built for is 0 in 173 wild servings plus
  GREEN in proof.
- The 34512 dry-hit transcript is the evidence for the follow-up:
  keep it attached to the filed item (retry + ack-prefixed
  alternates), don't re-litigate the retry itself.

## Gate

Serialized adoption gate on the merged tip `0b3993e80`:
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r267-gate`
— **338 passed, 6 failed in 665s**, log
`evidence/2026-11-22/journey-succession-r267-gate.log`. The gate ran
behind the Lane A scale r251 gate (serialized; the r251 gate ran
00:22–00:33Z, ours 00:33:32–00:44:37Z). The 6 failures are all standing
pre-existing families or flap artifacts, **0 attributable to this run**:

- test-measurement-proof-update.js — "Proof source inputs are not
  current" (measurement-proof staleness, first of the pair).
- test-measurement-workflow.js — exit 1 (staleness pair, second).
- test-living-garden-deed-attainment.js — 120.2s timeout
  (deed-attainment 120s timeouts under load).
- test-one-person-army-deed-attainment.js — 120.2s timeout (same
  family).
- test-phone-frame-proof.js — stale receipt (phone-frame stale receipt
  family).
- test-deathcleanup-instrument-20261117.js — `EPERM: operation not
  permitted, write` at writeSeed: the write flap (window 10, onset
  00:44:40Z per the flap watcher) started mid-gate and refused the
  test's seed-file write. Re-run standalone by the finisher after
  writes cleared: **PASS, exit 0**. Flap artifact, not a code failure.

vs r266's baseline gate (338/6): the same count, a different sixth —
test-measurement-cache-flags.js passed this time; the flap's EPERM
took its place. No failure touches any file this run changed (the
only src change is the `topic2Ask` retry in `src/js/convoTopics.js`,
proven by the r267 proof test + five carried proofs, all GREEN on the
merged tip). Occupation-panels (85s, slow but passed) did not fail.

Closeout: merged `0b3993e80` (two commits: the panel+fix
`970fc5524`, the note proof re-runs `0b3993e80`). Rotation-b 7→4
(verified by read-back). Worktree release and lock delete (last)
follow at closeout; the finisher's report carries the closeout
record.
