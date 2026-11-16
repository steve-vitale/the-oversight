# Journey — succession r224 (Lane B leg 7, 2026-11-16)

## Prereg (binding)
- **Leg question:** does the mantle pass cleanly when the bearer dies, and do the
  conversations around succession stay honest (no dry lines, no spliced recaps)?
- **Fix arm:** F4a (curious-question pick ledger-aware), F4b (recap lines never take
  a voice opener), F4c (seek_taken repeat-ack variants + dlg:help block guard).
  All proof-tested RED on unfixed code, GREEN on fixed code.
- **Seeds:** fresh band 34301–34304 (verified 0 hits in any prior prereg/evidence),
  smoke 33998. EARLY_KILL_DAY=40, POST_DAYS=70 (smoke 5/25).
- **Bars:** MANTLE-FINE PASS (0 flippedImmediate=false outside VILLAGE-OVER,
  0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips). DRY CENSUS binding
  under the any-hit-fails amendment. CAP-NC binding bar (r187 newcomer-channel).
  CONTROLS: smoke S_fixed vs S_pristine d7 Ashanti 10/2/33.

## Panel (all 5 seeds exit 0, analyzer exit 0)
- **MANTLE-FINE: FAIL — 1 lateFine row, adjudicated INSTRUMENT ARTIFACT (see below).**
  19 deaths observed, 0 flippedImmediate=false, 0 unexplained lat-1, 0 day-skips.
  The single row: seed 34303 d108 Elijah→Javier, dehydration, fineLatency=2, class
  GAME-LATE. The game's own wrap record says entryDay 108, returnDay 108,
  flippedImmediate=true — the flip happened synchronously inside the death. The
  sleep rolls prove it: the roll starting d109 already has Javier as bearerBefore;
  no sleep roll ever observed a dead Elijah holding the mantle. The lat=2 is
  produced by two instrument facts: (a) a 0-day sleep (108→108) left the day
  counter at 108 when the death was detected, and (b) mantle samples are tagged
  by the sleep's dayAfter, so the first post-death sample lands on d110. The
  analyzer's rollCover definition (dayBefore==entryDay && dayAfter==entryDay+1)
  misses the covering roll (109→110) by one day. No game defect: the mantle
  never sat on a dead bearer through a sleep. First MANTLE-FINE fail in 13
  panels; the failure is in the instrument's day arithmetic, not the game.
- **DRY CENSUS: FAIL — 1 other-class hit, filed as F5 (next fix item, NOT fixed
  this run per prereg).** Seed 34301 d105, Farid, pick `alive:want:ask_favor`,
  key `"No, really — it's handled. Thanks for asking, though."`, preRun:true.
  Root cause traced: the SETTLED FAVOR branch (conversation.js:7160, journey
  establishment r7 2026-10-12) returns that single fixed line with no variants
  and no ledger guard whenever a settled favor's want is asked about again. Same
  singleton class as F4c's seek_taken repeat-ack. In the sitting, Farid had just
  said "It's already handled" two turns earlier; the player asks again what he
  needs, and Farid blanks ("...Sorry, lost my train of thought.") at trust 90 —
  a visible seam. Fix shape (next run): variants via convoPickCycle (same class
  as F4c) and/or a WouldBlock guard falling to an honest alternative.
  **F4a/F4b/F4c all verified clean in the wild:** 0 curious-singleton hits,
  0 dlg:help hits, 0 deflect_q / dlg:doubt hits, 0 recap splices across 48
  "Still on" lines. The 11 honest fallbacks on 34303 are Finn's Korean lines
  falling back to the gesture narration ("They spread their hands, smiling —
  the words are missing, but the meaning lands anyway.") — the r81 nonverbal
  fallback working as designed, not dry lines.
- **CAP-NC: INSUFFICIENT-DATA** — bonded-by-deadline 2/2 eligible seeds (34301
  Arshdeep, 34304 Grace); denominator <3. bondedEver 4/4 probe-opened seeds.
  OPP: unbonded talk-requests 2 (Joaquín d57, Ursula d5 smoke — the standing
  one); FIRST-bearer bonds on undriven days 3; NPC-NPC new bonds 31; newcomer
  arrivals 12; selfReqDayEntries 0 (r133 purge holds).
- **CONTROLS: PASS on the binding fields.** Smoke S_fixed == S_pristine on the
  death record (d7 Heinrich→Ashanti, alive 10, fallen 2, newTrust 33) and on
  mantleFine — the fixes move nothing on succession mechanics. Downstream
  content (trust/pantry/deeds/bonds from ~d22 on) diverges by RNG cascade: the
  fixes change draw consumption in conversation sittings (F4b skipping voice
  picks, F4c adding cycle draws, F4a filtering pools), and the sim is chaotic
  after the first affected sitting. Attributed, not a regression. Smoke bar
  re-baselines to d7 Ashanti 10/2/33 (S_fixed).
- **WILD CHECK: PASS on landed fixes** — 0 fresh-favor phantom re-asks,
  0 agency-closer / warn_you / refusal dry hits, 0 dlg:help water_haul hits.
  The 1 census hit is a NEW surface (F5), not a regression.
- **F3 WILD CHECK: PASS** — 0 commit-refusal phrases in any opener, 0 anywhere
  in 74 transcripts. F3 verified in the wild.
- **F2 DESCRIPTIVE CHECK: PASS** — 0 resume-opener quotes of a favor-block
  direction; the 15 direction lines that fired were spoken in place as answers
  to "Why can't I do this now?" ("Your partner is inside the Haven hall. Go
  through the door to meet them." / "You need to be right next to them, same
  side of the Haven door, to help.") — the line doing its job.
- **C3c watch (r216): still UNMEASURED.** 7 "We never did finish talking about…"
  resume openers on the panel, all quoting real beats with labels matching the
  quoted content (wound care openers quote wound-care beats; "what's been
  happening" openers quote happening-beats). No favor-change ledger exists in
  the driver outputs to check resolution-then-stale-opener against, so the
  watch stays open — same limitation as r218.
- **Q10 (r216 follow-up): NO sighting.** 1 surface match (34304-dplus3-STRANGER-
  Ella: "We were just talking. Nothing important.") judged NOT a sighting: a
  trust-9 stranger deflecting a recap question after being doubted, about a
  conversation that genuinely held nothing — a characterful deflection, not a
  recap erasing real content. Stays filed, not promoted.
- **Day-skips: 0** — thirteenth straight panel at zero.

## Village assessment (plain words)
- **34301 — Earl hands the mantle to Thao on day 41** (trust 62, 11 alive,
  1 fallen). The mantle changed hands four more times (Thao→Wei d71, Wei→Megan
  d79, Megan→Esteban d82, Esteban→Temiloluwa d85) and the village still stood
  at day 111: 8 alive, pantry 17,273, 56 bonds. A village that absorbs five
  bearers and keeps eating.
- **34302 — Christian to Vera on day 41** (trust 56, 7 alive, 5 fallen — the
  hardest start). Six more deaths followed, the longest chain on the panel
  (contest, the wild, a stranger, the arena, betrayal, the wild again), and the
  village bled out: 1 alive at day 110, pantry 0, 94 bonds. The bonds kept
  forming even as the people died — the social fabric outlasted the bodies.
- **34303 — Isabella to Lucas on day 41** (trust 60, 11 alive, 1 fallen). Three
  more deaths (Lucas→Brigitte d100, Brigitte→Elijah d104, Elijah→Javier d108 —
  the instrument-artifact row). Ended day 111 with 9 alive, pantry 2,900,
  60 bonds. Survived, but thin: two of the three later deaths were dehydration
  — water pressure, not monsters, is the story here.
- **34304 — Emma to LaToya on day 41** (trust 54, 9 alive, 3 fallen). One more
  death (LaToya→Eli d60). Ended day 111 with 9 alive, pantry 28,755, 68 bonds.
  The comfortable village — food secure, stable.
- **33998 smoke — Heinrich to Ashanti on day 7** (trust 33, 10 alive, 2 fallen).
  Short window; ended day 32 with 10 alive, pantry 9,602.
- No village won, none ended. The mantle itself never failed: every death passed
  it on the same day, to a living successor, with the funeral beat firing every
  time (CARRIED pick-time rank 1, funeral INCALL true on all 5 seeds).

## People check (8 full transcripts)
Conversations read like people talking, not menus. Ella (34303 d+64, trust 91)
resumes a real thread with Lucas, names the grief still owed ("We still owe
grief a proper ending, too."), then answers "How am I doing?" with "You're
family now. Chosen family — the kind that actually counts. You fed me when I
was hungry." Lena (34302 d+64) remembers Aria through a small ritual ("Aria
always took the burnt piece. Said someone had to. I take it now."). Dmitri
(34304 d+64) quotes a vivid line back ("I keep my eyes down when I pass it.
Respect, maybe. Fear, probably. Both.") and talks about the table like weather
coming ("Like the air before a storm, but — bigger. Something's on its way.").
Strangers deflect in character (Ella at trust 9, doubted, brushes off the recap
question). The one bad beat on the panel is the F5 dry line in Farid's sitting
(trust 90): he answers "It's already handled," then blanks when asked again two
turns later. One seam in an otherwise coherent sitting — filed, not fixed here.

## Fixes landed this run (worktree, commit 73649767)
- F4a — curious-question pick is ledger-aware (convo-wants.js).
- F4b — recap lines never take a voice opener (conversation.js voiceLine
  RE-ANCHOR guard). Visible in the wild: 48 clean "Still on" recaps, 0 splices.
- F4c — seek_taken repeat-ack has 3 variants (convo-wants.js) + dlg:help block
  guard (convo-dialogue.js).
- Proof tests RED-then-GREEN for all three; r209/r218 regression tests GREEN.
- Next fix item (filed, not fixed): **F5 — settled-favor "it's handled"
  singleton** (conversation.js:7160; variants + WouldBlock guard).

## Telemetry
`telemetry-check.js` vs succession baseline: 2 LOUD lines, both the known
means-vs-sum artifact (checker sums across 5 files; baseline holds per-seed
means): deaths.bearer 7.6 → 19, census.fallen 14.3 → 35. Per-seed means are
3.8 and 7.0 — within seed-band variation for chain length (chains ran 2–7
this panel). **Baseline NOT rolled.**

## Gate
check.js --quick: **334 passed, 6 failed in 710s — GO.** The 6 failures are the
standing set, all present in r218's gate too (which ran 333/7): measurement-
proof-update + measurement-workflow (stale proofs); living-garden + one-person-
army (120s load timeouts); phone-frame-proof (staleness); ladder-bundle
(ambient-raid control). test-person-trust-20261108, failing in r218, passes
this run. **0 failures attributable to the F4a/F4b/F4c changes.**

## Metric review
- **MANTLE-FINE fineLatency (r187 bar): the instrument overstates latency when
  a 0-day sleep intervenes.** fineLatency = first-sample-day − entryDay, with
  samples tagged by the sleep's dayAfter. A death detected while the counter
  still reads the entry day (0-day sleep) followed by a sample tagged two days
  later reads as lat 2 even though the flip was synchronous and the next sleep
  already showed the new bearer. Proposed revision for the NEXT run: measure
  fineLatency against sleep rolls — the first roll whose bearerBefore is already
  the new bearer (or whose bearerAfter is) — and widen rollCover to accept a
  roll whose dayBefore is entryDay OR entryDay+1 when a 0-day sleep intervened.
  The bar's intent (mantle flips synchronously at every death) was met on all
  19 deaths; the bar as written counts a sampling-tag artifact as a game
  failure. Do NOT re-score this run against the revised metric mid-run — the
  FAIL stands on the record with this adjudication attached.
- **DRY CENSUS any-hit-fails:** working as intended — it caught a genuinely new
  dry surface (F5) rather than re-litigating the fixed classes. Keep.
- **Smoke re-baseline:** S_fixed is the new bar (d7 Ashanti 10/2/33). The
  downstream RNG cascade after a conversation-draw change is expected and was
  attributed this run; future runs should compare binding fields first (death +
  mantleFine) and treat downstream drift as cascade unless the binding fields
  move.

## Reachable / fun / winnable
- **Reachable:** yes — the mantle passes on every death, the funeral beat fires,
  successors keep living their lives (bonds, favors, grief, roles). The leg's
  content is all reachable in ordinary play.
- **Fun:** mostly — the late sittings are the best conversations on the panel
  (memory, grief, roles with real stakes). The F5 seam is the one moment the
  game stops feeling like people and starts feeling like a machine.
- **Winnable:** not judged here — no village won on this leg, and succession
  measures the handoff chain, not the win. The chain itself holds: 19 deaths,
  19 clean passes.

## Run bookkeeping
- Base master 2fd2dad1f; commit 73649767 (20 files: 3 src, 3 proof tests,
  r224 driver/analyzer/runner clones, prereg, pristine-smoke outputs).
- Index clobber struck on the fix commit (6th sighting) — repaired via the
  ls-tree pipe; commit verified correct, status empty after.
- Heartbeat loop died once mid-run (09:04→09:24 gap); the registry entry stayed
  active and the heartbeat landed on retry (lock contention with the reaper).
  Loop restarted 09:24:37Z (pid 9506).
- Rotation-b: 7 → 4. Lock: deleted at closeout.
- Merge: [PENDING]
