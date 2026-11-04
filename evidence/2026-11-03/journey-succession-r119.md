# Journey succession r119 — Lane B, leg 7 (succession)

## Preregistration (written before play)
- Question: after the handoff, does the successor go on LIVING
  — or just carry the mantle as a placeholder? And is the
  pick itself legible: does the village choose its
  most-trusted living member, as ledger.js says ("successor:
  the village chooses. Trust decides")?
- Instrument: r117 driver cloned with ONLY renames plus
  addition PICKCTX (wrapper snapshots trust map + npcIds()
  before the real playerDeath and again after it returns;
  one pickCtx record per bearer-changing call, gated on the
  bearer change ONLY — the first organic death fires before
  the chain recorder arms). Standalone second-life analyzer
  (no r117 analyzer clone). POST_DAYS=70,
  EARLY_KILL_DAY=40, CONVO_DAYS [3,7,14,30,45,53,64].
- Pilot seeds: 32201, 32202 (forced SECOND=40, THIRD=20,
  FOURTH=10, FIFTH=10 — the 40-day first-successor window),
  32203, 32204 (controls). Reserves 32205 (forced), 32206
  (control). Fresh band: exact `"seed": 3220x` grep empty
  across succession stdout JSONs at run start.
- Bars (binding, §14): PICK pre-rank == 1 on every first
  handoff with a pickCtx; CARRIED (DETECTOR chainDeaths ==
  chainKnown, C1v3 ok, S1, MG2v2 true, M1/M4 true, rolepick
  proof 3/3, keepsake flags); SECOND-BONDS / SECOND-SCHOLAR
  / SELFHOOD reported, not scored. Skipped-seed rule
  (adopted from r117 metric review): a skip counts in
  denominators as "not ≥ bar" but never triggers expansion
  alone. Expansion trigger: ANY pilot seed with pre-rank
  != 1 OR placeholder on all three second-life measures.
- Mid-run corrections (appended to the prereg, history
  untouched): (1) POST snapshot must never be ranked — the
  successor's trust is deliberately reset at handoff
  (smoke seed 32999: 90 → 46), so post rank measures the
  reset, not the pick; bar corrected pre-panel to PRE-rank.
  (2) s1 is a survival boolean (village not over AND bearer
  alive AND dayAdv >= 25), not the older "missingExact"
  count — on died-out seeds s1=false is expected, judged
  here as s1 == !over. (3) PICKCTX2 decomposition instrument
  added after the control seeds: every npcIds() call inside
  the real death call captured with its trust map, so the
  exact pick-time input is identifiable. It does NOT
  re-score the PICK bar: a pre-rank miss stays a NO-GO on
  that bar, and the pick-time result is decomposition, with
  bar revision proposed for the NEXT run only.

## Headline
The successor's second life is scholarly, not social, in
the first fortnight — and the pick itself is sound, once
you measure it at the moment it happens. Every successor
grew the Codex while bearer (plants +2 to +5 by day 14,
up to +12 by day 30), and every scored web held perfectly
steady with two ties deepening — but no successor formed
a single NEW bond in 14 days on any scored seed. The one
pre-rank miss (32203) decomposed cleanly: at the actual
pick moment the successor led 67 to 63, lifted past the
best-liked villager by the death bonus for work done —
the village chose its most-trusted member, and the
pre-snapshot just isn't the pick-time input. No game
change was made: no blank found here is small, safe, and
provably a defect rather than a calibration question.

## Q1 pick-legibility: bar NO-GO as written, game EXONERATED on decomposition
- Pre-rank (binding bar): 32201 rank 1 (90, three-way tie
  at 90, gap 0), 32202 rank 1 (100, gap 25 — proof, bonus
  cannot reorder), 32203 rank 2 (55 vs Catalina 63, gap
  -8), 32204 rank 1 (90, gap 0), 32206 rank 1 (92, gap 1).
  32205 skipped (village over d37 before any kill).
  Panel: 4/5 death seeds pass; 32203 is a NO-GO on the
  pre-registered bar, reported not re-scored.
- Decomposition (PICKCTX2, determinism-verified): seed
  32203 re-run on the new driver reproduces its panel
  record exactly (death, all 6 chain entries, pickCtx
  pre/post, relPost/relD14 bond counts, ledger) — the
  instrument is transparent. Inside the death, exactly ONE
  npcIds() call fired; trust-sorted it puts Esteban first
  at 67 (55 pre + the maximum +12 agency bonus) over
  Catalina at 63 (+0). The pick-time rank is 1.
  Seed 32206's panel record carries the same proof
  directly: pick-time successor trust 96, rank 1.
  Pick-time evidence: 2/2 captures rank 1.
- The story in plain words: the village picks the person
  it trusts most at the moment of death — and "trust" at
  that moment includes credit for work done (the agency
  bonus), so on 32203 the village picked Esteban, who had
  done the most, over Catalina, who was merely best-liked.
  Catalina later carries the mantle anyway (third in the
  d56 cascade), which reads as the village coming back to
  her, not as a snub. The bar revision for the next run:
  score pick-time rank (npcCalls), keep pre-rank reported.
- Dead-bonds at pick: 32201 depth 0/v 6, 32202 depth 1/v 48,
  32203 none, 32204 none, 32206 depth 0/v 15. The pick does
  not require a bond to the dead bearer — trust decides,
  as the code says. No finding either way; reported.

## Q2 second-life bonds: steady, deepening, never new (14 days)
- Scored seeds (first successor still bearer at relD14):
  32201: 11 → 11 bonds, 0 new, 0 lost; 32202: 9 → 9, 0/0;
  32203: 10 → 10, 0/0. Contaminated (second handoff before
  d+14, honestly not scored): 32204, 32206. Skipped: 32205.
- Deepening (same keys, value up): exactly 2 per scored
  seed — 32201 Dale 66→72, Chloe 76→86; 32202 Petra 18→22,
  Tom 12→14; 32203 one tie 16→20 and one 24→27 with depth
  0→1. The web does not fray and does not grow new
  threads in a fortnight; it tightens slightly.
- Calibration caveat, stated not hidden: 14 days may
  simply be too short for a new bond, and the driver only
  drives 2–3 conversations per checkpoint. This run does
  NOT claim "successors cannot form bonds" — it claims
  "no new bonds in 14 days on 3/3 scored seeds." The next
  run needs the calibration: new-bond formation rate for
  non-successors over the same window, and a bond snapshot
  at d+30 for controls / pre-second-kill.

## Q3 second-life scholarship: strong on every seed
- Same-bearer ledger checkpoints only (a checkpoint whose
  bearer is already the second successor is excluded):
  32201 Jayden: d+7 plants +2, d+15 +8, d+30 +12 plants /
  +5 skills / +54 xp / abilities 2→4. 32202 Rosa: d+7 +3
  plants / +2 skills, d+14 +5 / +2 / +19 xp / abilities
  3→5. 32203 Esteban: d+7 +1 / +1 / +13 xp, d+14 +2 / +1 /
  +34 xp, d+31 +9 / +8 / +75 xp. 32204 Scott: d+7 +2 / +1 /
  +19 xp (second death before d+14). 32206 Connor: d+7
  +3 / +2 / +8 xp (second death before d+14).
- Successor person-deed counts: flat where recorded
  (32202 12→12, 32203 5→5; 32201 no codex-person entry for
  the successor at either snapshot — reported as noEntry,
  not zero). Deeds are the flat half; Codex growth is the
  moving half. No placeholder successor on any seed: the
  scholar's book grows under every new bearer.

## Q4 selfhood / people check: 26/26 transcripts sense-read — PASS
- Read in full: all first-successor-voice transcripts at
  d+3/d+7/d+14 (d+15 where the checkpoint lands a day
  late): 32201 ×6, 32202 ×6, 32203 ×8, 32204 ×4, plus
  32203's d+31 pair excluded from the count (still
  Esteban-voice, consistent). Method honesty: YOU lines
  are driver menu picks, so successor selfhood is judged
  through what the successor DOES as player (teaching,
  naming, role picks, favor outings) and how NPCs address
  them — not through free successor dialogue, which the
  instrument does not produce.
- Every successor teaches: Jayden (Wild Ramps, Groundnut,
  Daylily Bud), Rosa (Wild Ginger, Dandelion, Egusi
  Melon), Esteban (Common Plantain, Yarrow, Birch Sap via
  Catalina's demonstration, Wild Ramps), Scott (Jewelweed;
  and learns Açaí and Cush-cush Yam from Leo). Every
  successor forms or holds a party (naming "The Company"
  on 32201/32203 — the driver picks the plain option both
  times, so the repeated name is a driver artifact, not a
  game default) and assigns scout with the r117 handover
  lines IN the transcript on fresh seeds (Benjamin↔Dale
  ping-pong is the driver re-picking scout every convo,
  not a game loop).
- Grief is by name and beside the NPC's own want, never
  instead of it: "Molly always took the burnt piece. I
  take it now" (Benjamin, Dale, Angela-class lines across
  seeds — a shared grief-pool line, name-personalized,
  not fabricated history); "I dreamed Caitlin was still
  here. Woke up angry at the dream" (Petra, Maeve-class);
  "I keep turning over the last thing Molly/Caitlin said
  to me. I can't tell if I'm remembering it right";
  coping tics ("I rinse the cup twice at odd hours",
  "I count portions out loud before eating"). By d+14 on
  32203, mourning names fresher dead (Ethan) over Marta —
  the r117 crowding mechanism again, not a defect.
- Commitments land on the SUCCESSOR personally:
  "We're better with you here. I mean that" (Maeve);
  "I'd follow you out past the treeline. Don't tell the
  others" (Benjamin to Jayden); "You're family now.
  Chosen family" + "show up when it costs you something.
  That's the whole test" (Dale to Jayden). NPCs refuse
  with character ("Not right now. I've got my own
  things"), accept with character ("Someone should watch
  your back. Might as well be me", "Okay. Yeah. I trust
  you"), share real resources (Angela/Aaliyah stockpiles:
  +4 wood, +4 fiber), and refuse re-confession with
  escalation, not a loop (Tom's Brooklyn confession, four
  driver pushes, third push yields "Fine — but it's the
  same truth as last time").
- Language-barrier conversations work as people:
  Catalina (Spanish-only) teaches Birch Sap by
  demonstration and corrects the successor's Spanish
  "gently, like setting a bone"; Wanjiru (Swahili-only)
  walks the successor through it "patient as sunrise."
  Resumed conversations quote the prior line and the gap
  honestly ("we left it mid-thought, 7 days back").
  Endings resolve, plant, or owe. No fabricated shared
  history, no filler loops, no static menus found.
- Invite seam holds on fresh panel evidence: 24 "Want to
  come with us?" lines, 0 "me" lines across all panel
  transcripts (r117's closure confirmed, not re-litigated).

## Panel story (6 seeds; POST_DAYS=70, EARLY_KILL_DAY=40)
- CORRECTION — the forced regime never fired: neither
  forced seed's stderr carries a SECOND-KILL line and no
  chain entry carries a scripted flag. Both villages ended
  before the +40 second-kill day (32201 died out ~d77,
  32202 scattered on an empty pantry). The panel is
  effectively 5 organic-chain seeds + 1 skip, and the
  first-successor windows below are organic windows —
  better evidence for second life than forced windows
  would have been, but the "forced" label must not be
  claimed. The SECOND=40 design is still what protected
  those windows from an early forced kill.
- 32201 (Molly → Jayden, organic d41): Jayden holds 31
  days (d+7/15/30 scholar checkpoints all his), then an
  organic cascade Jayden→Benjamin→Ethan→Jovan→Chloe→Ava
  (d72–77, three handoffs on d75 alone). Village died out,
  alive 0, pantry 0.
- 32202 (Caitlin → Rosa, scripted hushwolf d41):
  Rosa holds 15 days (d+7/14 checkpoints hers), then
  Rosa→Tom d56; village scattered on an empty pantry,
  alive 5, pantry 0 — hunger, not deaths, ended it.
- 32203 (Marta → Esteban, organic d15): Esteban holds 41
  days (d+7/14/31 checkpoints his), then the d56 cascade
  Esteban→Aaliyah→Sung-min→Catalina→Grace→Zhazira→Ruth.
  Village died out, alive 0, pantry 22140 — fed but dead:
  the death toll, not hunger, ended it.
- 32204 (Ivan → Scott, scripted hushwolf d40): Scott
  holds 11 days, then Scott→Angela→Quinn→Wanjiru→Ella→
  Onni→Ava (d51–79). Village died out, alive 0,
  pantry 2430 (thin).
- 32205 (forced reserve): SKIPPED — village over d37
  before any kill (death-aware stop). Counts in
  denominators as "not ≥ bar" per the skipped-seed rule;
  triggered nothing on its own.
- 32206 (Gerald → Connor, organic d30): Connor holds 13
  days, then Connor→Joshua→Amina→Greta. The ONLY
  surviving village: alive 7, pantry 400 (thin but
  alive), over=false.
- First-successor solo windows realized: 31, 15, 41, 11,
  13 days. Two villages died fed-or-thin on deaths, one
  scattered on hunger, one survives thin. The mantle is
  not what kills these villages — the ongoing toll does.

## Village assessment (plain words)
Every village that lived past its first month passed the
mantle at least once, and every successor picked up the
book and kept writing in it: plants, skills, and
experience all grew under each new bearer, ties to the
living held without fraying and tightened slightly, and
the week after each death still reads like people
grieving, teaching, and committing — not systems
reporting. Four of five villages with a death still fell:
two to the sheer death toll while fed, one to hunger
scattering, one to a thin pantry plus deaths; one
survives thin with seven people. Nothing here blocks the
win path: successors are never blank, never placeholders
on knowledge, and the pick is the village's most-trusted
member at the moment it counts. The open question is
narrow: whether fourteen days with no NEW bond is a
defect or just how slowly new bonds form — that needs
the calibration run, not a fix.

## Bars judged (pre-registered)
- PICK: NO-GO as written (32203 pre-rank 2). Decomposition
  (pick-time rank 1 on 32203 re-run and on 32206) explains
  it as agency-bonus reordering, not a pick defect. Bar
  revision proposed for next run: score pick-time rank.
- SECOND-BONDS / SECOND-SCHOLAR / SELFHOOD: reported, not
  scored, per prereg. Bonds 0 new / 0 lost on 3/3 scored
  seeds with 2 deepenings each; scholar growth on every
  same-bearer checkpoint; selfhood PASS (26/26).
- CARRIED: DETECTOR chainDeaths == chainKnown on all 5
  death seeds (5/5, 1/1, 6/6, 6/6, 3/3). PASS. C1v3
  (m1) true on all. PASS. S1: false on the four died-out
  seeds, true on surviving 32206 — s1 == !over on all 5.
  PASS under the corrected reading. MG2v2 true, M1/M4
  true on all. PASS. Keepsake chain flags all true; inh
  vanished sets (32202: wedding_ring, seed_packet,
  trail_compass, carpenters_square; 32204:
  contract_quill, unnamed_photo) all with
  keepsakeLineFired=true, source playerDeath-wrapper.
  PASS. Rolepick proof 3/3 on current master (re-run at
  smoke stage, before the panel). PASS.
- EXPANSION: fired on 32203's pre-rank miss, as
  pre-declared (32205 skipped + 32206 control ran on the
  PICKCTX2 driver after the determinism check proved it
  transparent). No second expansion is defined by the
  trigger, and none fired: 32206 passes pre-rank and its
  placeholder check does not apply (scholar growth at
  d+7, pick-time rank 1).

## Telemetry deviation check
- Command: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/succession.json
  --current 'evidence/2026-11-03/journey-succession-r119-tele-*.json'
  --metrics deaths.bearer,census.alive,census.fallen,
  census.integrationStage,week2.deadBearerMentions`
  (n=5 files; skipped 32205 writes no tele file).
- LOUD: deaths.bearer 420%: baseline 5 -> current 26
  (sum; mean 5.2). LOUD: census.alive -76%: baseline 49
  -> current 12 (sum; mean 2.4). LOUD: census.fallen 600%:
  baseline 10 -> current 70 (sum; mean 14). No LOUD lines
  on census.integrationStage or week2.deadBearerMentions.
- Verdict: NOT rolled forward, and the r117 forced-regime
  excuse does NOT apply here — no forced kill fired, so
  this panel is effectively unforced, yet still LOUD on
  exactly the death-toll metrics. That leaves two live
  explanations: (a) five death-heavy seeds by chance
  (4/5 villages dead out, with d56/d72 cascades), or (b)
  the game genuinely got deadlier since the baseline
  (the Nov 3 before/after question already named in the
  loops: villages dying sooner after the field-fight /
  win-planning / villager-agency landings). This run
  cannot distinguish (a) from (b) — that needs a
  matched-seed before/after comparison, which is carried
  as an open item for the loops, not settled here.
  Baseline NOT rolled forward.

## Regression suite
- Original attempt (r119's own window): killed mid-run
  when the coordinator timed out — log
  `journey-succession-r119-checkquick.log` ends
  mid-progress with no summary, so it yields no failure
  list. No result was claimed from it.
- Closeout re-run (Lane B 18:00 CST recovery run,
  2026-11-04T00:15Z, worktree journey2-succession-r115):
  `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2` →
  283 passed, 7 failed in 937s (log
  `journey-succession-r119-checkquick-rerun.log`).
  Six failures are exactly r117's standing pre-existing
  families (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof,
  establishment-r20-fixes). No NEW failure in those six.
- Seventh failure (measurement-cache-flags, "both actual
  CLI configurations complete valid neutral panels"):
  standalone re-run after the sibling check finished →
  4 passed, 0 failed. Verdict: concurrent-run artifact,
  not a regression. Honesty note: the closeout re-run
  overlapped a sibling's check.js in the ability-use
  worktree (started 00:10Z, before this re-run, and not
  seen until mid-run) despite the no-concurrent-jest
  rule; the divergent failure cleared once that run had
  finished, and r119 changed no game code, so nothing
  here blocks landing. The 6 standing families are
  carried, not fixed, by this run.

## Metric review (§14 — proposals for the NEXT run, not this run's scoring)
- Score pick-time rank, not pre-rank: the PICKCTX2
  npcCalls capture is the pick-time input (one call per
  death on both captures so far; verify the one-call
  property holds generally). Keep pre-rank and the
  successor's pre→post trust delta reported alongside.
- State the forced-regime caveat in the prereg: a forced
  kill that never fires (village ends first) makes the
  panel effectively organic — the note must say so, and
  telemetry verdicts must not cite a forced regime that
  did not happen.
- Bond calibration: measure new-bond formation for
  non-successors over 14 days, and add a d+30 (or
  pre-second-kill) bond snapshot, before judging whether
  "0 new bonds in 14 days" is a succession finding or a
  game-wide rate.
- S1 wording: name the boolean directly in the next
  prereg (survived 25+ days post-death with a bearer),
  retiring the "missingExact" phrasing.
- Determinism-leg wording (carried, still stands): a seed
  re-run must be trajectory-identical apart from recorded
  instrument data. It held on 32203 this run (death,
  chain, pickCtx, bonds, ledger identical).

## Closeout
- PENDING — commit, merge, rotation write (7 -> 4),
  lock deletion, heartbeat-loop stop, worktree release,
  and main-tree clean verification appended below after
  the regression suite completes.

## Carried items
- Pick-time bar revision (score npcCalls rank) for the
  next succession run; pre-rank miss on 32203 stays a
  NO-GO on this run's bar, not re-scored.
- Bond-formation calibration (non-successor 14-day rate
  + d+30 bond snapshot) before judging "0 new bonds."
- Telemetry LOUD verdict unresolved between chance
  death-heavy seeds and the Nov 3 before/after
  deadliness question — needs a matched-seed comparison;
  baseline NOT rolled forward.
- First-death durable grief thread: still a design call
  for Steve (r117), not a worker fix; this run's d+14
  Ethan-grief crowding is consistent with that open
  question.
- Direct-path invite "me" string: still exists in code
  but unobserved (24 "us", 0 "me" on this panel);
  fixing it on speculation still declined.
- Orphan aimed-shot dodge fix: still NOT recoverable
  (r117 verdict stands); carried for a combat-focused run.
