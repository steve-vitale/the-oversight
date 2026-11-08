# Journey crisis r155 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start (written by the r154-social
adoption closeout that precedes this run — see below); this run writes 7
(succession next) at closeout. Run r155 follows crisis r154 (landed
2026-11-07). Base: master d5223d14c (r154-social recap-cap fix in base).
Prereg: goal hidden_files/evidence/2026-11-08/journey-crisis-r155-prereg.md
(seeds 13801–13805, fresh band, verified). Policy oracleV2, 120d
death-aware +10d tail. PILOT seeds 13801–13803 only — the pilot gate did
NOT trigger expansion (see below), so the pilot IS the panel.
Determinism proof: re-run of 13801 byte-identical JSON + all 8
transcripts identical.

## ADOPTION (this run, before the leg)

This run adopted the timed-out r154-social closeout (lock
2026-11-08T07:00:12Z, no registry entry — stale-lock recovery; the 01:00
run was flap-blocked at 07:39Z): rebased journey2-social onto f5cf45250
(new tip d5223d14c), re-ran both r154 proofs green on the rebased tip,
merged ff-only to master, released the tree, rotation 5→6. The EPERM
flap blocked the first register attempt (checkout failed on the index
reset); the retry landed on the next write window. The r154-social fix
(recap press-count cap) is therefore IN this run's base — and the C3
read below is its first wild measurement: recap pressed at most twice
per conversation, cap never needed, no endless re-anchor.

## HEADLINE — recap-prefix stacking is root-caused, fixed, and proven

r154 filed #4 (minor, 2 sightings): the recap prefix collides with the
recap body — "Okay, but what about Still on that personal stuff." This
pilot graduates it: the collision recurs in 9/23 conversations, 11
instances, and once stacks THREE discourse markers ("Now then — As I
said — Still on that plant lesson."). The body "Still on X." is itself
a re-anchor; the r27/r31 reframe pool prefixes "As/Like I said —" onto
the full sentence, doubling the repetition marker. Worst instances:
- 13801 d47: "Like I said — Still on that taken person. — or so they tell me."
- 13802 d39: "Now then — As I said — Still on that plant lesson."
- 13803 d59: "As I said — Still on what they confided." (a confidence,
  treated as a topic label)
- 13801 d10/d30/d31/d46/d74, 13802 d39, 13803 d33: the plain form.

Fix (src/js/conversation.js, convoRecapLine): when the raw line has the
"Still on X." form, reframe around the topic label — "As I said — we're
still on X." / "X — that's still where we are." / "I've told you three
times now — we're still on X." Other bodies ("We started on...", "We
were talking about...") reframe unchanged — their prefix reads fine
because the body isn't itself a re-anchor. The voiceLine prefixes
("Now then —", "Between us —") that stack on top are left alone: the
filed defect is the reframe collision, and "Now then — as I said —"
reads as a person thinking aloud.
Proof (scripts/test-journey-crisis-r155-recap-prefix.js, 11/11):
RED on unfixed code (3 failures — the three defect-sensitive
assertions); GREEN on fixed code, including the two-thread and
single-log controls (unchanged). The r154 recap test still passes
(ALL PASS) — no regression in the recap machinery.
Panel re-run post-fix (all 3 seeds, per the prereg fix rule): the
post-fix panel JSONs are BYTE-IDENTICAL to the pilot JSONs — the fix
changes only conversation line text, zero trajectories. Post-fix
transcripts carry zero "I said — Still on" lines; the fixed form
("we're still on") appears in exactly the 9 conversations that had
the defect. NOTE: the re-run overwrote the pre-fix transcripts in the
evidence dir; the defect lines are quoted verbatim in this note (above)
and in the C3 section below.

## PANEL (3 seeds, oracleV2, 120d)

| seed | end | days | raids | gorge | sorties | convos | alive | pantry |
|------|-----|------|-------|-------|---------|--------|-------|--------|
| 13801 Seattle | game-over (scattered) | 101 | 6 | 13 | 3 | 8 | 1 | 0 |
| 13802 Boston | game-over (died out) | 62 | 4 | 0 | 0 | 7 | 0 | 500 |
| 13803 Austin | horizon | 120 | 10 | 39 | 6 | 8 | 1 | 1,607 |

Sorties: 9 attempts, 6 ok, 3 refused, 0 full clears (remaining 0).
Sortie fights: 10. Gorge: 52 nights, 55,821 kcal. Convos driven: 23,
fabricHits 0. Analyzer output: evidence/2026-11-08/
journey-crisis-r155-pilot-analysis.txt (== post-fix analysis: the
post-fix JSONs are byte-identical, so the pilot analysis stands).

## VILLAGE ASSESSMENT (plain words)

- 13801 Seattle scattered on day 101: pantry empty, fifth hungry day,
  "Haven couldn't hold. On the fifth hungry day, people started
  walking — in different directions. The scattering, again." One
  person left (Quinn). The village starved, then walked away.
- 13802 Boston died out by day 62: the last one, Nikolai, died in the
  wild on day 62 — "No one is left to pick up the Codex. The village
  dies out — quietly, the way villages do." Zero alive. The village
  was eaten and sickened (2 famine, 2 disease corpses among the 11).
- 13803 Austin reached the horizon with ONE person alive (Josephine)
  and a 1,607 kcal pantry: the lone-survivor horizon again (r154's
  Atlanta was the same shape). 25 corpses — the village bled for 120
  days and held by one person.

## VERDICTS (prereg bars, §14 binding)

- C1 (bend, not break) GO: both game-overs have named causes, none a
  siege-mechanic failure — 13801 famine scatter, 13802 died out
  ("No one is left to pick up the Codex"). Horizon 1/3. Softlock
  seeds 0.
- C2 (episodes fire + gates hold) GO: raids fired on all 3 seeds;
  fought resolutions present; D1 snapshots all delayed >= 3 attempts
  (9/9); deltaBad empty; D3 drift unknown = 0. MISSED-WINDOW
  corrected = 4, per-day = 4 (descriptive, below the >= 8
  instrument-look trigger).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fired or was refused with a recorded reason; no
  boundary-firable case unfired. (The 3 refusals are all on 13803
  at days 121–122, in the +10d tail, bench bare — the refusal IS the
  answer; the R126 rows now count them ok per the r155 revision.)
- BENCH (descriptive): 3 refused sorties; shape gate-one-short 1,
  supply-empty 2, availability-drain 0. Alive-bench subset (primary):
  0 refusals — the nodeAway question is UNTESTABLE this pilot (the
  bench was already dead when the refusals came). The r150/r154
  finding neither repeats nor fails; it waits for a panel with a
  living bench.
- C3 (people check) GO: all 23 driven transcripts read in full
  (below); fabricHits = 0; conversations meet the meaning bar. The
  recap-prefix defect graduated to a fix (above); the fix is proven
  and the panel re-run clean. No-repeat driver fix: zero unforced
  consecutive repeats in the judged panel. Naming-stance wobble: NO
  4th sighting (the naming DEBATE is the live topic — Static,
  Flashbulb Moth, Performance Review argued by the whole fire).
- WRAP-CHECK GO: 23 transcripts, 23 marked, unmarked = 0 (21
  engine-ended, 2 driver-cap breaks — both caps are long good
  conversations, 12 turns of distinct content, not loops).
- C7b (instrument) GO: corpse-cause tallies match the corpse record
  on all seeds; the NEW say-line cross-check works — buried dead
  found on all 3 seeds (Roberto; Alba Rossi; Michael Martin, Tanisha
  Luo), including a starvation burial (13802 Alba Rossi) and a
  dehydration burial (13803 Tanisha Luo) the corpse tallies miss.
  The candle record is partial (sayDeaths 10/6/11 vs corpseTotal
  13/11/25) — it catches buried dead; the corpses catch deaths the
  candle misses. Both directions now visible.
- Q1 no-words defects: UNTESTED — the pilot drove ZERO no-shared-
  words sittings (no nv: picks in 23 conversations), so the d52
  LOOP, SUBJECT-MENU ENGLISH, and SIGNING-NOD PAIR cannot recur
  here. Not answered, not refuted. The no-words rate across panels
  is ~8% of conversations (r154: 3/37); two more seeds would be a
  lottery ticket, and the pilot gate did not trigger — documented,
  not chased.
- Q2 multi-monster set clear: HOLDS — 3/4 multi-monster sets cleared
  (13803 d53/d63/d85, all 4-monster sets). r154's 8/12 is now a
  pattern across panels.
- Q4 fight-1 re-frame: PARTIAL — breaks (fightsFought==1) all opened
  on a death/flee (79/vFlee, 29/vFlee, 12/vDie) ✓. Clears opened on
  vKill at 85 and 46 ✓, but 13803 d85 opened on a MONSTER flee
  (mFlee, vTaken 9) and still ended ret.cleared — the "clears open
  on a vKill" half as literally written. See metric review: ret.cleared
  and remaining-0 clears are different things, and the frame must say
  which one it means. (Panel full clears: 0/6 — the fight-1 table's
  "cleared" is ret.cleared, not a set wipe.)
- Q5 W1 count: unchanged 66/4/4/1 (no same-set re-musters, no ok
  sorties or full clears after a refusal on the same set).
- Q8 G-ID watch: 11th panel at zero id-matched gorge-after-clear
  (0 id-matched, 0 returns; name-matched 1 for comparison). Watch
  stays open.
- Q10 sortie-leader death gap: RECURS (descriptive) — 13801 d93,
  leader Ava died mid-sortie (vDie); deathsDuring is empty for that
  sortie while the say lines record her death ("Ava faced Ugly-Eyes
  at the treeline... and didn't come back."). The muster-aware check
  passes (she was on the muster) but the record still misses the
  leader's death. Still open, still descriptive.
- Q11 recap-prefix stacking: ANSWERED (fixed + proven + panel
  re-run clean, above).

## C3 PEOPLE CHECK (23 transcripts, read in full)

All 23 meet the meaning bar except the recap-prefix defect (fixed
above). What works, seen repeatedly this panel: the debt system with
memory across days (Fatima d30 "You came through on the sickness...
I won't forget it." / "We're square." / "They file it away — unpaid,
and counted."; Darnell d32 the same shape); broken promises with teeth
(Aisha d33 "You said you'd help with this wound. ...It's done now.
Forget it." / "Debts unpaid just sit there."); teaching callbacks
across days (Nadia d74 "Burdock — I keep thinking about what you said.
I'm seeing it everywhere now."; Fatima d39 Lily of the Valley the
same); mourning grounded in REAL deaths (Yuki → Fatima d29/d30 "The
fire feels smaller without Yuki."; Omar → Nadia d47 "Omar always took
the burnt piece."; Mia → Aisha d70 "Mia owed me a favor. I keep
thinking about collecting."); confidences (Aisha d59 "I'm practicing
what I would say if I ever saw my family again. I haven't told
anyone." / "Don't tell the others. Everyone needs one place.");
the betrayal investigation playing out coherently (Yuki d16/d17:
site → witnesses → bribery → moot → VOTE GUILTY, "Counted.");
villager-initiated link ideas (Nadia d31 Emberhold, d56 Ashford);
the naming debate as a live village argument (Drum-Belly/"The Big
Beast", Static/"Big Loud", Flashbulb Moth/"Ugly-Eyes", Performance
Review — the whole fire arguing); gifts with real items (Nikolai d62
and Aisha d70 press an oiled tool into your hand); invites accepted
and declined with reasons (Nadia d74 "Someone should watch your
back."; Fatima "Alone's how I stay alive." twice, consistently).

FILED (not fixed here):
1. VoiceLine prefix stacking (mild, same family as the fix): "Now
   then — As I said — ..." (d39) and "Between us — Still on that
   taken person." (d40) — discourse prefixes from voiceLine stack
   on the reframe/body. Reads as a person thinking aloud; filed.
2. The requirements re-serve ("As I said — Move next to them...")
   fires on every second ask (d46, d29, d25) — reads fine for a
   repeated instruction; no change.
3. Q1 no-words trio stays FILED (untested this panel — see verdicts).
4. Naming-stance wobble watch stays open (no 4th sighting).

## REACHABLE / FUN / WINNABLE

Reachable: crises fire on all seeds, sorties answerable, conversations
rich and reachable. Fun: the conversation system is the star again —
debts with memory, broken promises with teeth, confidences, teaching
callbacks, the naming debate argued by the whole fire. Winnable: 1/3
reached the horizon; 0 wins (this leg judges crisis survival, not the
endgame). The village bends (scatter, deaths) but the crisis mechanics
hold — C1/C2/C2b all GO, and the one recurring defect in the panel got
fixed and proven in-run.

## METRIC REVIEW (§14 — for the NEXT run)

- Fight-1 threshold: the frame must say which "cleared" it means —
  ret.cleared (the sortie's lingerer set left the treeline) or
  remaining-0 (a set wipe). This panel: 0 remaining-0 clears but 3
  ret.cleared, one opening on a monster flee. Either define clears
  as ret.cleared and drop the vKill opener clause, or define clears
  as remaining-0 and judge on that (0/6 this panel — the question
  becomes whether anything clears at all).
- MISSED-WINDOW: the per-day count works (4 per-day = 4 per-object
  this panel — each miss on a different day, so the r154 case of one
  day reading as 4 did not recur). Keep reporting both.
- C7b: the candle cross-check works and is the right third record —
  but note the candle is PARTIAL (sayDeaths < corpseTotal on every
  seed: the village doesn't candle every death). The bar should be
  "buried list reported" rather than "tallies match" — the records
  disagree in coverage by design.
- R126: the ok-flag revision works (d121/d122 refusals with a
  recorded reason now count ok). Keep.
- BENCH: the alive-bench question needs a panel where the bench is
  alive at refusal time. A pilot with 0 alive-bench refusals says
  nothing about nodeAway — report "untestable" rather than "holds".
- Q1: the no-words rate (~8% of conversations) means a 3-seed pilot
  can easily drive zero no-words sittings. A future Q1 re-test should
  either run a targeted no-words driver (force no-shared-language
  sittings) or accept a 5-seed panel as the minimum Q1 instrument.

## INSTRUMENT / TELEMETRY

- Driver/analyzer: r154 verbatim EXCEPT r155 filenames/paths/seeds
  (13801–13805), ORIGINS Seattle/Boston/Austin/Chicago/Phoenix,
  EVID 2026-11-08, W1 carried count unchanged, PLUS the r154
  metric-review revisions: (a) per-DAY missed-window count; (b) C7b
  candle cross-check (say-line death record from the 🕯️ notices,
  monster names excluded via the seed's own sortie/gorge/linger
  data, Codex notices excluded — they fire for monsters too);
  (c) R126 ok:false rows count as ok with a recorded reason.
  Analyzer validated on r154's JSONs before the pilot: carried
  numbers reproduce exactly (attempts 24/18/6, missed-window
  corrected 7, per-day 3), C7b v3 finds Elif/Tashi buried on 13504.
  Determinism proof: 13801 re-run byte-identical JSON + identical
  transcripts.
- Telemetry: (check run at closeout — see below).
- R57 D3 death mismatch: 1 (Ava, 13801 d93 — the Q10 leader gap).
  R59 TRUE early count 0 (legacy 1 — 13803 d70, corpse artifact,
  correctly excluded). R58 refused-sortie book check clean;
  bloodied lines 0. R70 phoenix burns: 0 on all seeds. R88 tick-part
  sampler: no instrumentErrors on any seed. Drift duplicates 0.
  GORGE attribution: 52 nights, 55,821 kcal; single 44,
  single-unbooked 8, ambiguous 0.

## CLOSEOUT

- Fix commit: b779157b1 (branch journey2-crisis, base d5223d14c).
  Proof test-journey-crisis-r155-recap-prefix.js 11/11; RED 3 failures
  on unfixed code; r154 recap test still ALL PASS.
- Evidence commit: same commit (this note + 3 panel JSONs + pilot
  analysis; post-fix JSONs byte-identical to the pilot JSONs).
- Gate: check.js --quick 284 passed / 6 failed in 478s — EXACTLY the
  r118/r154 baseline (the 6 are the known pre-existing failures:
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes). Log: goal hidden_files/
  check-quick-r155-20261108.log. Exit 1 is the baseline behavior
  (any failure exits 1); no new failure.
- Telemetry: quiet — 3 files, 3 metrics, no large deviations
  (defendedFights/ playerFights/latelyDefenseCount vs crisis.json
  baseline; defendedFights total 54, inside the historical 3-seed
  range 43–143). Baseline NOT rolled.
- Merged ff-only to master at closeout; worktree released; lock
  deleted; rotation-b 6→7 (succession next). Merge SHA and adoption
  details: memory log 2026-11-08.
