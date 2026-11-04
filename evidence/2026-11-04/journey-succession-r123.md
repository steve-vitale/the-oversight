# Journey succession r123 — Lane B, leg 7 (succession)

## Preregistration (written before play)
- Question: r119 left one calibration ask — is "0 new bonds in 14
  days" a succession finding, or just how slowly new bonds form
  game-wide? Plus the pick-time bar r119 proposed (score npcCalls
  rank, keep pre-rank reported), and a d+30 bond window.
- Instrument: r119 driver cloned with ONLY renames plus addition
  RELD30 (ledger cp-30 snapshot, same pattern as relD14).
  PICKCTX + PICKCTX2 retained verbatim (renamed). New standalone
  calibration analyzer (no r119 analyzer clone). POST_DAYS=70,
  EARLY_KILL_DAY=40, CONVO_DAYS [3,7,14,30,45,53,64].
- Pilot seeds: 33201, 33202 (forced-design SECOND=40, THIRD=20,
  FOURTH=10, FIFTH=10), 33203, 33204 (controls). Reserves 33205
  (forced-design), 33206 (control). Fresh band: exact `"seed":
  3320x` grep empty across prior succession stdout JSONs.
- Bars (binding, §14): PICK-TIME rank == 1 on every first handoff
  with npcCalls (no-npcCalls = NO-GO on instrument); CARRIED
  (DETECTOR chainDeaths == chainKnown, C1v3/m1 true, S1 boolean
  == !over, MG2v2 true, M1/M4 true, rolepick proof 3/3, keepsake
  flags); CALIBRATION / D+30 / SECOND-SCHOLAR / SELFHOOD
  reported, not scored. Skipped-seed rule adopted. Expansion
  trigger: ANY pick-time rank != 1, OR no scored same-bearer d+30
  bond window on the whole pilot.
- Forced-regime caveat (stated in advance): a forced kill that
  never fires makes the panel effectively organic — the note must
  say so, and telemetry verdicts must not cite a forced regime
  that did not happen.
- Mid-run corrections (appended, history untouched): (1) Analyzer
  bug found on the pilot seed and fixed before the panel analysis:
  a `<redacted>` token had leaked into the scholar filter in place
  of `===`, crashing the analyzer after the bond sections; the
  pilot seed was re-analyzed clean after the fix, and the panel
  analysis ran on the fixed analyzer. (2) DETECTOR formula aligned
  to r119's exactly (every recorded chain entry causeKnown); an
  empty chain passes vacuously and the analyzer now prints the
  vacuity instead of hiding it. (3) A three-seed launch failed
  instantly (EXIT=127) because bash does not treat an expanded
  variable as env-prefix assignments; re-launched with exported
  variables, all three EXIT=0. No seed ran twice; the failed
  launch wrote only empty stdout files, overwritten by the real
  runs.

## Headline
The calibration answers r119's question, and then some: successors
form zero new bonds in 14 days on 3/3 scored seeds — but so what,
because the villages around them form bonds just fine (8, 9, and 2
new pairs in the same windows), and the one time a successor
actually talks to a stranger, a bond follows. The successor's
social life is not frozen — old ties deepen 3–5 times per window,
the Codex grows under every bearer, and a stranger conversation
at day 30 leaves a real new bond by the end of the run. The pick
is sound at the moment it happens: pick-time rank 1 on 4/4
handoffs, including two more agency-bonus reorderings of the kind
r119 decomposed. One carried bar misses: the funeral arc stays
silent on an expedition death (33204), while burial and grief in
conversation both work — narrowed to a mechanism question, not
fixed on speculation.

## Q1 pick-legibility: bar PASS on 4/4, one-call property holds
- Pick-time (binding): 33201 rank 1 (pick-time trust 100),
  33202 rank 1 (90), 33203 rank 1 (54), 33204 rank 1 (86).
  Exactly ONE npcIds() call inside each death on all 4 handoffs;
  that call's trust-sorted list puts the successor first every
  time. 4/4 PASS.
- Pre-rank (reported, not scored): 33201 rank 4 (88 vs 90 top,
  gap -2) → pick-time 100 (+12 agency bonus, the maximum);
  33202 rank 1 (90, gap 33 — proof, bonus cannot reorder);
  33203 rank 1 (54, gap 13 — proof); 33204 rank 2 (74 vs 75,
  gap -1) → pick-time 86 (+12). Two more bonus reorderings,
  same mechanism as r119's 32203: the village picks its
  most-trusted member at the moment of death, and "trust" at
  that moment includes credit for work done.
- Dead-bonds at pick: 33202 depth 0/v 4; the other three none.
  The pick does not require a bond to the dead bearer — trust
  decides, as the code says.

## Q2 bond calibration: successor-specific zero, not a game-wide rate
- Scored seeds (first successor still bearer at relD14):
  33202: successor 9 → 9 bonds, 0 new, 0 lost, 5 deepened;
    non-successor pairs (both endpoints living at relPost)
    19 → 27, 8 NEW, 0 lost, 17 deepened.
  33203: successor 8 → 8, 0/0/3; non-successors 24 → 33,
    9 NEW, 0 lost, 22 deepened.
  33204: successor 9 → 9, 0/0/3; non-successors 13 → 15,
    2 NEW, 0 lost, 13 deepened.
  Contaminated (second handoff before d+14, honestly not
  scored): 33201 (Mabel held under 7 days).
- The new non-successor bonds are all depth-0 first-interaction
  records (v 2–14): Ethan↔Poulomi, Aki↔Jacob, Daniyar↔Isaac,
  Liam↔Sanne, and others — villagers meeting each other through
  ordinary village life while the successor's circle only
  tightens. This is the calibration r119 asked for, and it
  points AWAY from a game-wide slow rate: in the same villages
  over the same days, other pairs form bonds and the successor
  does not.
- Mechanism caveat, stated not hidden: the driver picks the
  successor's conversation partners as top-2-by-trust plus the
  strongest-bond partner — all familiars by construction. On
  33203/33204 every d+3/d+7/d+14 partner was already bonded at
  handoff. So "0 new" means "no new bonds under driven play
  with familiar partners," and the next question is whether
  stranger-talk forms bonds — answered below, not assumed.

## Q3 d+30 bonds: still zero for familiars; a stranger changes it
- Same-bearer d+30 windows: 33203: successor 8 → 8, 0 new, 0
  lost, 5 deepened; non-successors 24 → 36, 12 NEW (3 more in
  the d+14→d+30 segment). 33204: successor 9 → 9, 0/0/3;
  non-successors 13 → 15, 2 NEW (0 more in the segment, 15
  deepenings). 33202: no d+30 (village scattered d32).
- The stranger case: on 33203, Lena's d+30 conversation with
  Aki was the ONLY stranger conversation in any scored window
  (Aki not bonded at handoff; wound-help want, two plants
  taught both ways, invite eagerly accepted). By relEnd a
  Lena↔Aki bond exists (depth 0, v 4) — the only new successor
  bond anywhere in the panel, and it follows the only stranger
  conversation. The bond cannot be dated to the day (no
  snapshot between relD30 and relEnd), so the conversation is
  the best-supported cause, not a proven one — but "successors
  cannot form new bonds" is now refuted as a claim: they can,
  when they actually meet someone new.
- Design question carried (not a fix): villagers form bonds
  with each other autonomously, but the player character's new
  bonds arrive only through player-driven stranger-talk. Is
  that the intended path (seek people out, make friends), or
  should villagers also strike up bonds with the bearer on
  their own? Steve/builder call — the game works either way
  for a player who talks to strangers, and this run does not
  change the wiring on a guess.

## Q4 second-life scholarship: strong on every scored seed
- Same-bearer checkpoints only: 33202 Carolina d+7 +2 plants,
  d+14 +3 plants / +3 skills / +19 xp / abilities 1→2.
  33203 Lena d+7 +3, d+14 +5 / +3 / +20 xp, d+30 +9 / +7 /
  +46 xp / abilities 2→3. 33204 Fritz d+7 +1, d+14 +4 / +19 xp
  / abilities 2→3, d+30 +10 / +2 / +28 xp, d+35 +12 / +2 /
  +33 xp / abilities 2→4. 33201: no same-bearer checkpoint
  (Mabel held under 7 days) — honestly not scored.
- Successor person-deed counts: flat where recorded (33204
  4→4 through d+30; 33202/33203 noEntry at both snapshots —
  reported as noEntry, not zero). Deeds are the flat half;
  Codex growth is the moving half, as on r119.

## Q5 selfhood / people check: 25/25 transcripts sense-read — PASS
- Read in full: all first-successor-voice transcripts at
  d+3/d+7/d+14 on scored seeds (33202 ×6, 33203 ×8, 33204 ×7),
  plus 33201's d+3 ×3 (short window, not scored) and 33203's
  d+30 Aki stranger conversation. Method honesty (r119):
  YOU lines are driver menu picks, so selfhood is judged
  through what the successor DOES as player and how NPCs
  address them.
- Every successor teaches and learns: Carolina teaches
  Cattail, Greenbrier Shoots, American Ginseng; Lena teaches
  American Persimmon, Spicebush; Fritz teaches Pawpaw (twice
  over — Caroline is still thinking about it at d+14);
  successors learn Mugwort, Bracken Fiddlehead, European
  Elder, and more from NPCs. Every successor forms a party
  (naming "The Company" on all seeds — the driver picks the
  plain option every time, so the repeated name is a driver
  artifact, not a game default) and assigns scout with the
  handover lines in the transcript (the Caroline↔Nikos
  scout ping-pong across d+3/d+7/d+14 is the driver
  re-picking scout every convo, not a game loop — roles pass
  with consent lines, "Scout is yours now. Roles are
  promises. There's only one of each.").
- Grief is by name and beside the NPC's own want, never
  instead of it: "Since June died... I keep expecting to see
  June at the fire" (Pedro); "June owed me a favor. I keep
  thinking about collecting" (Rodolfo); "Silas always took
  the burnt piece. I take it now" (Elijah); "Jacob is gone
  and the world just... continues. That's the part I can't
  stand" (Caroline); coping tics ("I taste the water before
  the others drink. It doesn't bring anyone back. It just
  keeps my hands from shaking"). Commitments land on the
  SUCCESSOR personally: "Are you going to stay? With us.
  For real... We're better with you here. I mean that"
  (Liam to Fritz); "I'd follow you out past the treeline.
  Don't tell the others" (Miles to Carolina, r119 line class,
  still landing).
- NPCs want real things and refuse with character: haul help
  and forage outings with concrete places and honest gating
  ("Move next to your partner, on the same side of the Haven
  door"; "Your partner is inside the Haven hall. Go through
  the door"); wound care ("It's getting worse, not better.
  If it festers I'm no good to anyone"); theft confessed
  plainly (Jacob: "Yeah, I took 1× Stone. What are you going
  to do about it?"; Caroline: medicine from the stash, never
  confessed); invitations refused with character ("I work
  alone. Nothing personal. ...It's a little personal";
  "Not right now. I've got my own things to handle") and
  re-confession refused with escalation, not a loop (Nikos:
  "I confessed that already. I'm not confessing it twice for
  dramatic effect"). Language-barrier conversations work as
  people: Poulomi (Hindi-only) walks the successor through
  Hindi "patient as sunrise"; Abdellah (Arabic-only) shares
  "Food?", a burned farmhouse to show on the map, and a
  tired real smile. Resumed conversations quote the prior
  line and the gap honestly ("we left it mid-thought, 4 days
  back"). Endings resolve, plant, or owe. No fabricated
  shared history, no filler loops, no static menus found.
- Wrinkles noted, not fixed: (a) in 33204's Nikos d+3 naming
  beat, the line reads "then Liam grins" although the
  conversation is with Nikos — a small attribution wrinkle
  on a shared party beat. (b) Miles d+14 to Carolina:
  "They took you — The Confession, on the screens" reads as
  a reference to a past event involving Carolina that this
  instrument cannot audit (phase-A say lines are not in the
  JSON); it is noted as unverified, NOT claimed as
  fabricated. (c) "The Company" naming and scout ping-pong
  are driver artifacts (above), not game defects.

## Panel story (4 seeds; POST_DAYS=70, EARLY_KILL_DAY=40)
- FORCED-REGIME CORRECTION — the forced second kills never
  fired on either forced-design seed, so this panel is
  effectively 4 organic-chain seeds, and no telemetry verdict
  below cites a forced regime: 33201's village ended d61,
  before its d+40 second kill; 33202's village scattered d32,
  before its d+40 second kill. The SECOND=40 design is still
  what protected 33202's d+14 window from an early forced
  kill — but the "forced" label must not be claimed.
- 33201 (June → Mabel, scripted hushwolf d40): Mabel holds
  under 7 days, then an organic cascade Mabel→Rodolfo→Nelson
  … (8 chain deaths, keepsake lines all fired). Village died
  out d61, alive 0, pantry 28855 — fed but dead: the death
  toll, not hunger, ended it.
- 33202 (Silas → Carolina, organic d13): Carolina holds 19
  days (d+7/d+14 checkpoints hers, scholar +3/+3), then
  Carolina→Miles d30 (organic, "the wild"). Village scattered
  d32 on an empty pantry, alive 6, pantry 0 — hunger, not
  deaths, ended it. Trust climbed throughout (office 42→46,
  village mean 36.1→53.6).
- 33203 (Antonio → Lena, organic d8): Lena holds 55+ days
  (d+7/14/30 checkpoints hers, scholar +9/+7 by d+30), then
  Lena→Sophia d63, Sophia→Ava d67 (organic). Village
  survives to endDay 79, alive 7, pantry 11332 — the panel's
  full-window seed and its stranger-bond seed.
- 33204 (Jacob → Fritz, organic d23, cause "the
  expedition"): Fritz holds the whole window (d+7/14/30/35
  checkpoints his, scholar +12/+2 by d+35), no second
  handoff at all. Village survives to endDay 58, alive 8,
  pantry 10509. The m1 miss lives here (below).

## Village assessment (plain words)
Every village that lived past its first month passed the mantle
at least once, and every successor picked up the book and kept
writing in it: plants, skills, and experience all grew under
each new bearer, old friendships deepened, and the weeks after
each death still read like people grieving, teaching, and
committing — not systems reporting. Two villages fell: one to
the sheer death toll while fed (33201's eight-handoff cascade),
one to hunger scattering (33202, pantry empty at day 32); two
survive with seven and eight people. Nothing here blocks the
win path: successors are never blank, never placeholders on
knowledge, the pick is the village's most-trusted member at
the moment it counts, and the one social gap r119 left open
turns out to be a matter of meeting strangers, not a broken
bond system — talk to someone new and a bond follows. The one
open defect-shaped item is narrow: when the bearer dies out on
an expedition, the funeral arc goes quiet.

## Bars judged (pre-registered)
- PICK-TIME: PASS 4/4 (33201, 33202, 33203, 33204 all rank 1;
  one-call property holds on all 4). Expansion trigger (a)
  not fired.
- CALIBRATION / D+30 / SECOND-SCHOLAR / SELFHOOD: reported,
  not scored, per prereg. Bonds 0 new for successors on 3/3
  scored 14d windows and 2/2 scored 30d windows, vs 8/9/2 new
  non-successor pairs at 14d and 12/2 at 30d; scholar growth
  on every same-bearer checkpoint; selfhood PASS (25/25).
  Expansion trigger (b) not fired: two seeds yield scored
  same-bearer d+30 bond windows.
- CARRIED: DETECTOR chainDeaths == chainKnown — PASS on
  substance (33201 8/8, 33202 1/1, 33203 2/2 all causeKnown;
  33204 vacuous, no chain deaths because Fritz survived —
  printed as vacuous, not hidden). C1v3 (m1): NO-GO on 33204
  only (3/4) — see below; the miss stands, never re-scored.
  S1: PASS on all 4 under the corrected boolean reading
  (s1 == !over on all 4). MG2v2 true, M1/M4 true on all 4
  except m1 on 33204. Keepsake chain flags all true wherever
  recorded; inh vanished sets (33201: seed_packet, mixtape,
  winter_coat_button, daughters_drawing) all with
  keepsakeLineFired=true, source playerDeath-wrapper. PASS.
  Rolepick proof 3/3 on current master (run at smoke stage,
  before the panel). PASS.
- CARRIED MISS, narrowed (33204, m1=false): the funeral arc's
  say-line beats are all zero in the d+2 window (deathBeat 0,
  recoverHome 0, systemVoice 0, burialWindowSay 0) for a death
  whose fallen cause is "the expedition" — yet the corpse was
  found, respects paid, burial completed (driver scripted
  burial d+3: found=true respects=true bury=true), the fallen
  entry exists, and villagers grieve Jacob by name in
  conversation for weeks. The deathBeat pattern (/🕯️|is dead/)
  fires when a death becomes KNOWN (codex sync at attunement
  2, or party witness) — so the narrowed question is whether
  an expedition death's known-beat lands outside the d+2
  window, through a path the say log does not capture, or
  never. This run does NOT settle that: it would take a
  sayLog-dump re-run of 33204 or a code read of the
  expedition-death narration path, and no game change is made
  on speculation. Carried as an open item for a builder or
  combat-focused run (same class as r119's carried orphan
  aimed-shot dodge item). The m1 bar revision proposed for
  the NEXT run: if expedition deaths legitimately skip the
  home arc, the bar needs a cause-conditioned reading — a
  proposal, not this run's scoring.
- EXPANSION: not fired on either trigger. Panel stands at 4
  seeds; reserves 33205/33206 not run.

## Telemetry deviation check
- Command: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/succession.json
  --current 'evidence/2026-11-04/journey-succession-r123-tele-*.json'
  --metrics deaths.bearer,census.alive,census.fallen,
  census.integrationStage,week2.deadBearerMentions`
  (n=4 files).
- LOUD: deaths.bearer +200%: baseline 5 -> current 15 (sum;
  per-seed bearer deaths 9/2/3/1 — the 33201 cascade
  dominates). LOUD: census.fallen swung 290%: baseline 10 ->
  current 39 (sum). No LOUD lines on census.alive,
  census.integrationStage, or week2.deadBearerMentions.
- Verdict: NOT rolled forward. The panel is effectively
  organic (forced kills never fired), yet LOUD on exactly the
  death-toll metrics — same shape as r119, and the same
  unresolved fork: death-heavy seeds by chance (33201's
  8-handoff cascade in 21 days) versus the game genuinely
  getting deadlier since the baseline (the Nov 3 before/after
  question already named in the loops). This run cannot
  distinguish them — that needs a matched-seed before/after
  comparison, carried as an open item for the loops, not
  settled here. Baseline NOT rolled forward.

## Regression suite
- `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2` in the worktree →
  284 passed, 6 failed in 794s (log
  `journey-succession-r123-checkquick.log`). Run alone — no
  sibling jest active (the Lane A journey-landing check finished
  first: 284 passed, 6 failed in 914s, and this run waited for
  it rather than overlapping, avoiding r119's concurrent-run
  artifact class).
- The 6 failures are byte-identical in file + assertion to the
  sibling's 6 and to r119's standing families:
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes. No NEW failure. This run changed no
  src/js, so nothing here blocks landing. The 6 standing
  families are carried, not fixed, by this run.

## Metric review (§14 — proposals for the NEXT run, not this run's scoring)
- DETECTOR vacuity: keep r119's formula but always print the
  vacuity (done here) — and consider requiring chainN ≥ 1 for
  a substantive DETECTOR pass, with vacuous seeds reported as
  "no chain evidence (successor survived)" rather than
  counted as passes.
- m1/C1v3 scope: if expedition deaths legitimately skip the
  home funeral arc, the bar needs a cause-conditioned reading
  (home deaths vs away deaths scored separately). If they do
  not, 33204 is a real arc gap. Either way the next run
  should carry a sayLog-dump probe for expedition deaths
  instead of re-scoring m1 on the d+2 window alone.
- Bond instrument: the next succession run that touches bonds
  should drive at least one stranger conversation per seed
  early (a top-2-by-trust partner is a familiar by
  construction) — otherwise "0 new bonds" will keep
  re-appearing as an artifact of partner selection. The
  Lena↔Aki bond is the proof that stranger-talk is the
  variable that matters.
- Forced-regime wording: keep the r119/r123 caveat in every
  future prereg — a forced kill that never fires makes the
  panel effectively organic, and the note must say so.

## Closeout
- Commit 63efd7000 ("journey succession r123 (Lane B): bond
  calibration + pick-time bar panel, no game change", 54 files:
  r123 driver + calibration analyzer + prereg + run note +
  analyzer output + 4 stdout JSONs + 4 stderr logs + 4 tele
  JSONs + 34 transcripts + checkquick log). Safe-commit index
  clobber hit and repaired via HEAD-blob cacheinfo (status
  empty + diff HEAD empty verified; commit content verified:
  54 files, all r123).
- Lane A landed first (master moved def4f8f40 → 4a5c619ee,
  journey-landing r95, main tree clean throughout): branch
  rebased onto the new master cleanly (no conflicts — new
  files only), new tip dfa617e34. Proof re-runs post-rebase:
  rolepick 3/3 PASS; calibration analyzer re-run byte-identical
  to the pre-rebase output. Check.js (284/6, standing families
  only) was run on the pre-rebase base; the rebase adds no
  change to this run's files.
- Merged --ff-only into master (main tree, read-only except
  the merge); no bump, no push, no live check (ship loop owns
  those). Report: merged locally, pending ship.
- Worktree journey2-succession-r123 released and removed,
  branch deleted, final reap run, main tree verified clean.
- Rotation: journey-rotation-b.txt written 7 -> 4 and re-read
  to verify (next Lane B run plays endgame).
- Lock: this run's lock deleted only after the merge verified
  (verified it still carried this run's run_id first).
- Heartbeat loop stopped after release.
