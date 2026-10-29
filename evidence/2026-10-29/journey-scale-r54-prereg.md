# journey-scale r54 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261029T1545Z (scheduled 15:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@30aeceb36 at worktree creation.
**No src/js change planned at pre-register time:** measurement first
(r51–r53 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context:** the seven villager-rationality items are pursued
elsewhere (fixall arms live); this run does not claim them.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before. The probe pins
one NPC (Joshua, gen_ywl213c on 85003) whom the quad run itself talks
to at day 90 — a conversation partner from the run's own transcripts,
not a roster feed.

## Standing context (read before scoring)
- r52 (base a6fa0710c): SCALE-BASE-MOVE-R52 DIVERGED, pinned to armor
  via a first-divergence stash fork. BARRIER-LINE-PIN CLOSED (no-attempt).
- r53 (base ca9a7569e): QUAD-PARTIAL — armor-era quad national 1/4
  (85004 at day 179, the wire), global 0/4; pre-armor quad was national
  3/4, global 3/4. Descriptive count only, NOT a causal armor verdict.
  SEEK-TAKEN-PIN: stage 0 is silent in the probed talk — want assigned
  but no path to the player in that conversation (not in the opening,
  not in the subject menu, under control or subject-first picker).
  TABLE-APPROACH SENSE: priced wait on both new seeds; pellet prices
  the run out of feast deeds (85004). PEOPLE: 3/4 read as people;
  wants live behind dlg:subject and the control picker never opens it.
- Base drift r53→r54 in src/js: ONLY sim-raidname-b (narration-only:
  raid-born naming at fight start, raidBorn flag, pending shadow;
  commit message says narration-only) + a version bump
  (version.json/sw.js/build.js, no game logic). Verified by reading
  the raidname diff: no Math.random draw, no spawn/damage/crisis/
  economy value touched. The extra say lines enter the capture but
  change no engine state.
- Code mechanism read BEFORE this prereg (not assumed from r53's
  framing — this corrects it): c.want is re-selected FRESH at every
  startConvo (conversation.js:5190, stage 0 each time). Stage 0 does
  NOT persist across days. A stage-0 want that never surfaces resolves
  'unestablished' at endConvo and is deliberately NOT seeded
  (convo-wants.js convoResolveWant, phantom-seed rule) — so there is
  no carry-over to the next conversation. Surfacing requires winning
  the opening (convoOpening priority: request → table → seed →
  resume → grief/secret/taughtref/recall → THE WANT → goal/small-talk
  fallbacks), or the stale-opener reframe when the fresh opener is
  ledger-blocked. And the subject menu offers NO want item at stage 0
  (convo-wants.js:1950: stage 0 returns []), which is why r53's probe
  found no want item there. Canon docs do NOT cover the stage-0 rule
  (docs/CONVERSATIONS.md has no stage-0/seed-expiry passage) — the
  rule lives in code comments; noted, not invented.
- r53's open thread this run takes up: "what moves a want from stage 0
  to stage 1" — reframed by the code read above: nothing carries it;
  each talk is a fresh lottery, and the question is whether a lost
  opening ever recovers inside the same conversation, and whether a
  re-picked want surfaces on a near-term retry.

## Leg questions (binding)
1. **QUAD-CURRENT-R54 (descriptive continuity):** the same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r53 driver, labels/EVIDIR
   only, PLUS the open-thread logging below (read-only lines in the
   transcript; no engine input changes).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars (day, over, pop, pantry, rank, nationalDay, globalDay,
   firstCourt, seat, arc, deaths, covenant trusts, maxWave,
   pilgrimages) per seed. EXPECTATION (falsifiable, from the diff
   read): scalars IDENTICAL to r53, captures differing only by
   raid-naming lines — because the only src/js delta is narration.
   If any scalar differs, run r52's first-divergence audit (capture
   diff, first differing line class) before any claim; do NOT call
   it noise and do NOT attribute it to armor or raidname without
   that audit.
2. **WANT-OPEN-THREAD-R54 (primary dialogue question):** for each of
   the quad's 8 talks (days 90/120 × 4 seeds), the driver logs:
   opening thread (convoGet.thread after startConvo), want id/stage
   at open, want stage + resolution at close, and the pre-talk seed
   (convoSeeds[vid] or none). Classify each talk: OPEN-SURFACED
   (thread 'want', stage ≥1 at open) / DISPLACED (other thread, stage
   0 at open) / SEED (fromSeed want) / other (name it).
   For DISPLACED talks, check whether the want surfaces later in the
   SAME conversation (stage moves 0→≥1 by close, or an alive:want
   menu item appears in any turn's choices).
   Verdict rule, decided BEFORE reading results: if ≥1 displaced talk
   surfaces its want later → LATER-PATH-EXISTS (name the path: menu
   item, thread settle, or other). If 0 of the displaced talks
   surface it → OPENING-ONLY (the opening is the want's only door in
   a conversation; a lost opening = a silent want for that talk).
   Either verdict refines r53's pin from "stage 0 is silent" to a
   mechanism; neither verdict is a game-change proposal by itself.
3. **SEED-CARRY-PROBE-R54 (probe-only, NOT part of the quad):** seed
   85003 only, control picker, extra talks with Joshua (gen_ywl213c)
   on days 91, 92, 93 after the standard day-90 talk (PROBE_VID /
   PROBE_DAYS env, inert before day 91, so the probe run matches the
   quad run through day 90). Same open-thread logging, plus the
   pre-talk seed dump each time.
   Verdict rule, decided BEFORE reading results:
   - If any day-91/92/93 talk opens with thread 'want' + seek_taken
     at stage ≥1 → RE-PICK-SURFACES (the fresh lottery, not a carry,
     moves it; report how many talks it took).
   - If seek_taken is re-picked but never surfaces across all 4 talks
     (d90 + d91 + d92 + d93) → LOTTERY-COLD (report 0/N with N = talks
     where seek_taken was the picked want).
   - If a seek_taken seed ever appears in a pre-talk dump →
     SEED-CARRY (contradicts the phantom-seed rule — investigate
     before any other claim).
   - The phantom-seed rule PREDICTS the day-91 pre-talk dump shows NO
     seek_taken seed from day 90. That prediction is checked
     explicitly, pass or fail.
   The probe's census is NOT judged (extra talks consume RNG after
   day 90 by design).
4. **PEOPLE CHECK (sense law — full transcripts read, not counted):**
   all 8 quad transcripts + 4 probe transcripts, judged on meaning:
   the NPC wants something, options engage or deflect it, endings
   resolve/plant/owe. No fabricated shared history, no filler loops,
   no static menus. Report per transcript, plain words.
5. **TABLE-APPROACH (standing, report-only):** seat/arc/waiting per
   seed from the want files, continuity with r53 Q3. No verdict bar.

## Instruments (all driver-only, read-only unless noted)
- r53 driver verbatim otherwise: census, trust/beat/gov/hunger/table
  watches, barrier instrument (standing pin re-confirm), armor dump.
- NEW open-thread logging in runConversation (transcript lines only):
  pre-talk seed + takenWantDay + convo count; open thread + want
  id/stage/fromSeed; close stage + resolution. No engine input.
- NEW probe env: PROBE_VID + PROBE_DAYS + PROBE_SEED (default 85003).
- NEW analyzer scripts/analyze-journey-scale-r54-20261029.js: reads
  the r54 transcripts and prints the per-talk classification table
  (want, thread, stage-open, stage-close, resolution, seed) + the
  quad census table. Deterministic read of evidence files only.

## Metric review (pre-registered, not mid-run)
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts).
- New metrics this run are classifications of transcript lines the
  driver already produced (thread, stage), not re-scores of prior
  verdicts. r52's DIVERGED, r52's barrier pin, r53's QUAD-PARTIAL and
  SEEK-TAKEN-PIN stand unless this run's fixed rules overturn them
  with evidence (the barrier pin overturns only on a logged barrier
  call; the seek-taken pin is REFINED by Q2/Q3, not re-scored).
- No metric will be re-scored mid-run. If the open-thread logging
  proves wrong (e.g. thread unreadable), that goes here as an
  instrument failure, not a verdict change.
