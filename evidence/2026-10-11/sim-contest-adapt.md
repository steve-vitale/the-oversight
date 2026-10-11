# Contest/Show Adaptation — sim-contest-adapt (2026-10-11)

Steve 2026-10-11: implement ALL FOUR adaptation systems across contests AND
shows. Complaints: win rate still too high (94.7% after contest-fear), and
context never changes — one strategy wins every time.

## The four systems (one model: history is state)

All in `src/js/contests.js`, new "CONTEST ADAPTATION" section. State lives in
`state.cxAdapt` (dossier/heat/wear/boredom/showStale/rival). Every adaptation
is a deterministic function of recorded history — same history = same
adaptation, no hidden RNG, no save-scum. Adaptation changes the SITUATION
(banned moves, hotter beasts, entry costs, stipulations), never resolves by
fiat. Death still only via health→0/honest stakes. The player sees it
diegetically (the System announces), never raw numbers.

1. **DOSSIER** (Nemesis precedent): per-contest file. Wins recorded with the
   winning approach (choice index per phase, tracked in `contestChoose`).
   At 2+ wins the System says so ("The System has studied the tapes. Your
   favorite moves are... unavailable tonight.") and the most-used WINNING
   choice per phase is banned (never the last choice standing, never phase 0).
   Blood contests get a named champion rival (Manglejaw, The Quiet One, ...)
   fed your tapes; 3+ wins = rival-hot beast (+1 wave-hot in `_contestArena`,
   stacks with hardened).
2. **HEAT** (Heat/Ascension precedent): heat = clamp(wins − losses), 0–3,
   read from the existing codex record. Win +1, loss −1, death resets to 0.
   Heat ≥ 1 ALWAYS hardens (replaces the old 30%-on-repeat roll as the driver;
   heat 0 keeps the roll). Heat is announced legibly ("MAIN EVENT...").
   **Hardened blank fixed**: hardened now injects genuinely different
   phases/choices (bans + stipulation beats), not byte-identical replays.
3. **WEAR** (Darkest Dungeon precedent): blood appearances +2 blood wear,
   player shows +1 social wear; decay −1/week each in `contestTick`.
   Tiers: blood ≥ 6 → +2 trauma at the door ("The body keeps score...");
   blood ≥ 12 → +4 trauma + village-worry gossip; social ≥ 6 → camera-tired
   (+1 trauma on show pulls). Dominant strategy stays legal, gets expensive.
4. **AUDIENCE STIPULATIONS** (wrestling-booking precedent): boredom +1 per
   win, −2 per loss, −1/week. At boredom ≥ 2 + 2 wins the crowd votes:
   no_repeat / handicap / blind draw (deterministic rotation). Blind strips
   choice hints; handicap is an entry-cost beat phase. SHOWS get staleness
   twists instead of dossiers: 2+ airings → bespoke twists (WHY DO THEY EAT?
   mystery ingredient −150 kcal, Ask a Human hostile callers +2 trauma, ...)
   with real costs; generic twist for the rest.

## Measurement

**Headline metric** (`scripts/test-contest-adapt-repeat-20261011.js`):
memorized-line policy (replays winning indices) over 14 choice-based contests
× 5 repeats. Before: same line won every time. After:
- rep0: 14/14, rep1: 14/14 (fair for newcomers — dossier needs tapes, plural)
- rep2: 10/14, rep3: 10/14, rep4: 10/14
- early (reps 0–1): 100% → late (reps 3–4): 71.4%

**Mechanics** (`scripts/test-contest-adapt-20261011.js`): 27/27 × 3 seeds —
dossier records/bans/determinism, heat math (win+1/loss−1/died→0),
heat-always-hardens (20/20), hardened genuinely differs, wear
accumulates/bites/decays, stipulations deterministic, show twists with costs,
social wear, fresh-fairness, sense-read of all new copy (no placeholders,
System/audience voice).

**Regressions**: break-contests 50/50 ✓, contest-fear 21/21 ✓, r12 34/34 ✓,
r13 23/23 ✓, r14 38/38 ✓, r15 55/55 ✓, break-shows 63/64 (1 pre-existing
H5 source-grep failure, fails on pristine HEAD too — noted by contest-fear
worker).

## Design notes

- Bans gated on wins ≥ 2 (not 1): "The dossier needs tapes — plural. One win
  is a fluke; two is a file." Matches the fiction of the dossier lines.
- Villager heat: proven villagers (2+ wins) get hardened variant → existing
  1.2x beast-hotness in contestEngine applies. No new villager machinery.
- `_cxRecordOutcome` is idempotent per ac (`_adaptRecorded`); hooked into
  BOTH `_contestEnd` and `_contestDie` (separate end paths).
- Contest-fear systems untouched: death ledger, ×1.5 damage, blood weight
  all still green in their proof test.

## Blanks / follow-ups

- Rival is the cheap Nemesis (named champion + hotter beast + rematch line).
  A full stat-learning rival (adapts to YOUR build specifics) is future work.
- Wear's villager dialogue reaction is currently gossip + door lines; deeper
  conversation integration is a lever-3 (agency) follow-up.
- No sim-level "thinking twice" measurement yet (policy auto-participates) —
  a risk-aware policy variant would measure avoidance honestly.
