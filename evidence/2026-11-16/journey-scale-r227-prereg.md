# journey-scale r227 — PRE-REGISTER (lane A, leg 3 SCALE, titan-muster lever: matched A/B panel on r223's band)

**Run id:** `playtest-loop-a-scale-r227-20261116T1720Z` (lock run_id
`loop-a-20261116T172016Z`).
**Run:** scheduled Mon 2026-11-16 10:45 CST (16:45 UTC); lock created
17:20Z (run started ~35 min late — worktree registration queued ~30 min
on the registry lock / slow `git worktree add` checkout on a loaded box;
the worktree is clean at a71857271, heartbeat landed immediately after
registration, hbloop `~/workspace/worktrees/journey-scale-hbloop-r227.sh`
(10-min cadence) launched 17:4xZ).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `a71857271` at prereg time.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 43%, lock absent (no stale-lock recovery), `git pull` already up
to date. Reap: ran clean (12/16 active; 10 dirty trees owned by
oversight-flesh-out-loop / oversight-playtest-loop-2 left alone per
reaper rules; `journey-scale-attr` stranded since Nov 10, untouched).
Worktree `journey-scale` registered ~17:39Z; heartbeat landed
immediately after registration.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster step is a POLICY change (the competent
player drives existing game verbs) — zero `src/js` change in this run.
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the r223-owed
lever (a driver-side muster step) and measures it on a matched panel —
a lever test with a real change in the player's repertoire, not a
re-proof.

## Standing context (read before scoring)

- **r223 scale (landed 2026-11-16, master 4b1800402):** national 0/4 on
  fresh seeds 135613–135616; survived 3/4; lived-days 559 vs 3-band
  rolling mean 476 (+17.4%, HOLD); lesser seat priced 4/4; **tribute
  DELIVERED 0/4 — never ready on any seed** (0 attempts; living
  veterans peak at 1 on every seed — the second living veteran never
  coexists with the first). Blockers: 135613 LEAD 2/3 seasoned (3rd
  sub 12d old); 135614 COLLAPSE d137; 135615 LEAD 2/3 (no 3rd sub
  exists); 135616 LEAD 1/3 seasoned. **The Herald finding:** the
  wave-4 titan lived at the treeline 76 days on 135614 (151 meetings,
  0 fights, 104 refusal lines — "muster 10 allied blades (you have
  0)"); the muster verbs exist ("sound the call", `titanCommitOwn`)
  but the competent policy never drives them; the sortie path is
  closed by the r219 driver HP gates. **Blank owed to this run:** a
  driver-side muster step with its own prereg and cost bar.
- **r226 deepening (landed 2026-11-16, master 47477d874):** independent
  confirmation — the Herald present on 8/8 seeds for 253 titan-days,
  **0 muster verbs panel-wide**, muster 0/10 on all 8 seeds, slain 0;
  HP trajectories 700→1 on two seeds (villagers maul it in field
  meetings and flee; it cannot be finished without a muster). The
  muster blank reproduces in deepening, earlier and longer.
- **What changed in the game since r223's base (4b1800402 →
  a71857271):** net `src/js` diff is **three files, dialogue-only**:
  `conversation.js` (+28), `convo-dialogue.js` (+38),
  `convo-wants.js` (+30) — the r225 stage-0 want fix, F5
  settled-favor, Lane B drift-note filter. No mechanics change. The
  r223 band is therefore a valid matched control source on this base.
- **Herald presence on the matched band (verified from r223's
  corpora before this prereg):** present on ALL FOUR seeds —
  135613: 56 days (d85–140, HP 700→1); 135614: 80 days (d61–137,
  HP 700→134); 135615: 73 days (d68–140, HP 700→350); 135616: 83
  days (d54–136, HP 700→1). Slain 0/4. Two seeds hold the Herald at
  **1 HP** — one mustered fight would finish it. The lever test is
  powered on every seed.
- **The wall (tracker, scale-onramp):** national 0/28 on the judged
  corpora (r223: 0/4); the binding gap is veterans / seasoned links,
  not survival. The wave-5 door needs 2 banked living veterans (r222
  read); r223's living-veteran peak of 1 is why it never opened.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary
  with ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG,
  COVENANT, TRADE, CONQUEST, or REFUSE. Ladder stage 3 (points) is
  NOT national. Q1 measures the polity (natgate `nat=true`), ladder
  stage secondary.
- **Titan canon:** NO canon doc covers titans/muster (r226's canon
  note). Mechanism grounded in `src/js/titans.js` +
  `src/data/titans.json`: Herald wave 4, minAllies 10, omen needs
  wave ≥4 AND scaleRank regional+, 0.10/day; stages 0→1 (≥4d, 35%/d)
  →2 located (≥9d after stage 1, 40%/d); unanswered it strikes
  every 5 days (pantry raid 2000–4000 kcal or allied strike trust −5)
  and does NOT drift off; `soundTitanCall` — allies answer 2 blades
  each (6 if trust ≥70 & opinion ≥10), refusals (trust <25 /
  opinion <−10 / arrears >0) cost trust −8; `titanCommitOwn` —
  two-tap, up to 3 Haven blades, 1000 kcal/day each, they leave the
  workforce and can die; `titanMusterReady` — allies + Haven ≥ 10;
  `titanWrapCombat` hard-refuses `startCombat` without a complete
  muster; `titanCallReadiness` — the faithful projection the war
  council shows (refusal-respecting); `state.titans.outcomes` — the
  engine's own per-engagement log (refused / fought → slain / fled).
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger
  scatter; sickness-without-a-healer collapse; "left someone behind"
  / "Okay. You don't have to have an answer." line-pool reuse;
  raise-talk closers formulaic ("All right — let's ask them." echo);
  "Don't tell the others. Everyone needs one place." thinking-spot
  line; nonverbal closing pool thin; sortie gates (min/sum HP caps)
  — gate call owed, not made; the sortie step stays INERT in both
  arms this run.

## Q1 (PRIMARY) — TITAN MUSTER LEVER: matched A/B panel

**Question:** when the competent policy sounds the call and commits
Haven's blades the moment a located titan's coalition is completable,
does the Herald die, and do wave-4 kills, living veterans, tribute
readiness, and national move — against the same seeds run without the
step?

**Arms (matched seeds 135613–135616, one seed per process):**
- **Arm A — control:** the r223 policy verbatim (no muster step, no
  sortie step). Replicates r223 on the new base; the dialogue-only
  diff since r223's base is the replication check.
- **Arm B — muster:** the r223 policy PLUS the muster step (see below).
  The step is the ONLY policy difference between the arms.

**The muster step (driver-side, policy only, no src/js change):**
called once per policy day, after the base daily, for each titan with
omen stage ≥2 and a live world monster (`state.titans.omens`,
`Game.worldMonsters()` by `titans.json` monster id):
- If the muster is already ready (`titanMusterReady`), record a
  `ready` row and do nothing — the meeting flow fights it (the
  driver's existing encounter handling already calls `startCombat`
  on Herald meetings; r223's capture carries 104 refusals).
- Else sit the war council ONCE per titan (the played beat, said
  aloud) and read the projection daily via `titanCallReadiness`
  (the same computation the council shows — a read, like
  `tableSeat()` / `polityOf()` elsewhere in the driver).
- Sound the call (`soundTitanCall`) ONLY when the projection
  completes the muster (`total >= need`): a hopeless call burns
  trust −8 per refusing link for blades that cannot finish the
  fight. When short, record a `held` row with the shortfall and
  re-check daily (trust grows, new links form).
- After the call, commit Haven's own (`titanCommitOwn`, two taps
  back-to-back in the same step — the real player taps twice; same
  effect) up to the 3-blade cap, then re-read readiness + blades.
- If a muster stands for a titan no longer present or slain, stand
  it down (`titanStandDown`) to stop upkeep; record it.
- Every titan-located day records exactly one musterWatch row
  (called / ready / held + reason); absence of a row IS the
  no-located-titan day. Verb wraps (r226 pattern: soundTitanCall /
  titanCommitOwn / titanWarCouncil / titanSelfDo) catch any call
  outside the step. The driver snapshots `state.titans` at seed end
  (omens, musters, slain, outcomes — the engine's own engagement
  log, `refused` / `fought` → `slain` / `fled`).

**Fidelity caveats (frozen here, read with the verdict):** the driver
sounds the call / commits from anywhere — in real play these are
camp self-bar verbs (the player must be at camp). The sim therefore
OVERSTATES the lever's availability: a null result here is a strong
null; a positive result still needs a discoverability read (would a
real player find and use the verbs?) before it is claimed as game
winnability. The step never outfits allies (no gear transfer) and
never touches the finale/nielsen titans' campaign gates.

**Interesting-finding rule (binding):** the run is informative iff
ANY of these holds:
(a) arm B slays ≥1 titan AND wave-4 kills (B) > (A) with the
muster-completed fights named (GO — the lever moves the veteran
link; the downstream question becomes tribute/national);
(b) 0 titans slain on B AND every B seed with a located titan
carries a named reason (projection never ready / call refused /
muster broke / fight lost) — NO-GO on the lever, reason named;
(c) a muster completes but the coalition fight is lost — the cost
is the finding (the lever fires and fails in combat).
INCOMPLETE iff the step never fires on a seed where a titan is
located (instrument failure — the verb wraps + musterWatch catch
it), or a corpus is corrupt. A wave-5 KILL on either arm overturns
the r207/r215/r219 "fought, never killed" shape. A titan slain on
arm A would overturn the r223/r226 blank itself (the control must
stay 0 for the A/B read to attribute to the step — if A slays one,
say so and judge the lever on the B−A difference, not on B alone).

**Cost bar (frozen — the price of the lever, judged with Q1):**
- lived-days (B) within ±25% of lived-days (A) — the same
  guardrail shape as Q2, arm-vs-arm.
- No village collapses on B that survived on A without an
  attributed cause (muster deaths named in the run note).
- Committed Haven blades who die are COUNTED (from the muster
  ledger joined to the death census) and reported against the kill
  gain — they are the price, not a hidden cost. Starvation deaths
  (B) ≤ (A) + 1 band-wide (the muster upkeep is 1000 kcal/day per
  blade — if the pantry pays for the muster with starvation, the
  bar catches it).

## Q2 — REGRESSION GUARDS (fail the run if any breaches, EITHER arm)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered per arm (the analyzer's classifier; exit 2 if an arm has no
  raise talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5, per arm.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0),
  per arm.
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines, per arm.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting, per arm.
- Lived-days (arm A) within ±25% of the **3-band rolling mean 476**
  ((r207 461 + r215 522 + r219 444)/3 = 475.67 → 476; guardrail 357–595)
  — the rolling window does NOT move this run (r223's band is the
  matched control source, not a new band to roll in; the next FRESH
  band rolls it). No alive/dead flip on arm A vs r223 without an
  attributed cause (the base diff is dialogue-only — a flip needs a
  mechanism read, not a shrug).
- Lesser seat priced ≥3/4 per arm.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events), per arm. Expected 0 daily accepts — the gap,
confirmed. Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks, on BOTH arms (the muster step must not change how
people talk — the council/call lines are the only new say-lines the
step may add; read them where they land). Bar: senseless 0 for the
raise-answer class (a spoken raise answered with the words that fit
what was said; no English YOU lines in a no-words sitting; no nod
loops past the answer). Re-check surfaces: the r214 plain parting,
the r211 quote fixes, the r209 deferred-ask ledger guard +
favor-block noBeat, the r208 lapsed-want thread, the r137
want-thread resume, the r218 commit-refusal noBeat, the r216
funeral-mend partial line, the r219 goon ask-tag fix, the r223
drift-note filter. **Stutter watch:** any seed-opener line of the
shape "About X — <the same X as a question>" is a live recurrence
of the Rufina stutter — record it with the want + seedNote.
**Muster-voice check (new):** the call / commit / council lines
must read as the village answering a threat, not as a menu — quote
one per seed where they land.

## Q5 — CENSUS (plain words)

Per-seed, per arm: who lived/died, what they knew (monster meat,
places, links), what was missing. Standard scale census fields
(ladder stage, lesser/full seat, national, deaths by cause, books
close). Spotter read: villagers with foodXp.spotter > 0 / spotter
skill ≥ 1 per seed — d90 FIRST (the binding read), end second.
Funeral-mend watch: any funeral/mourning shape change vs r223's
band. **W5-INSTANCE read:** per seed, per arm, the wave-5 shape
(ONE / SUCCESSIVE / MIXED / UNANSWERED) with the hp-trajectory
evidence behind it. **Sortie ledger:** the step is inert in both
arms — linger presence is read from the monster census, not the
sortie file.

## Panel

- **Seeds: MATCHED 135613–135616** (the r223 band, INTENTIONALLY
  reused — this is a paired A/B comparison, judged against the
  same-run control arm, not against the historical band; the r223
  corpora are a replication reference only). One seed per process
  (r183 adoption: driver multi-seed state leak). **Two arms (A/B),
  8 sims.**
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206/r207/r215/r219/r223)
  — NO chooser change in this run beyond the r207 secret:* ENGAGE
  addition (kept). The muster step is the only arm-B difference.
  The r226 agency lecture cap is NOT ported to the scale driver
  (it would move the control arm's fight counts vs r223 — the
  lecture wart stays a people-check observation this run).
- **Driver:** `scripts/journey-scale-r227-20261116.js` (r223 driver
  cloned: labels/seeds/EVIDIR only + MUSTER step + musterWatch
  ledger + titanEnd snapshot + verb wraps; sortie step inert in
  both arms; filenames arm-prefixed
  `journey-scale-r227-a|b-…`).
- **Analyzer:** `scripts/analyze-journey-scale-r227-20261116.js`
  (r223 analyzer cloned + MUSTER section: per-arm muster ledger
  summary, titan outcomes (refused/fought/slain/fled) per arm,
  A/B deltas for wave-4 kills / living veterans / tribute /
  national, cost-bar read; all guard sections run per arm).
- **Proof:** `scripts/test-journey-scale-r227-analyzer-20261116.js`
  — the real analyzer on synthetic corpora (r223's 70 assertions
  carried, renumbered + new muster cases: B slays a titan / B held
  short / B muster completes but fight lost / A slays (control
  overturn) / muster corpus missing / cost-bar breach).
  **Green before the panel runs.**
- **Pilot:** arm A seed 135613 first, then arm B seed 135613.
  Pilot gates: crash, census errors > 0, 0 census rows,
  reconciliation residual != 0, teleOnly > 0, 0 trustset rows by
  d60, 0 national-gate rows, or no vetbar rows by d60 → STOP and
  diagnose (INCOMPLETE, not a verdict). Muster pilot gates (arm B
  only): ≥1 musterWatch row on a titan-located day, titanEnd
  snapshot present, 0 verb-wrap errors.

## Seed freshness

135613–135616: the band is REUSED from r223 BY DESIGN (matched
panel). Verified before this prereg: 0 hits naming the band in any
dated prereg except r223's (`grep -rlE '135613|135614|135615|135616'
evidence/ --include='*prereg*'` — only
`evidence/2026-11-16/journey-scale-r223-prereg.md`), 0 hits in any
other .md note under evidence/ except r223's run note, and 0 hits
in `scripts/*.js` except r223's driver/analyzer/proof. No game
fixture seed is needed this run (the analyzer proof uses synthetic
corpora, no staged game).

## Telemetry decision (carried from r223, unchanged)

The per-run telemetry check uses `--metrics maxGameDay` only,
against the scale.json baseline (468), run PER ARM (control arm A
first — it should read close to r223's 559; muster arm B second).
The fight metrics stay dropped (r223's decision: band noise AND
refused-meeting counting on titan-heavy seeds — this band is the
proof of it). Baseline NOT rolled on a QUIET read; a LOUD line is
a same-run investigation item (explained vs real bug) BEFORE any
roll.

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (titan slain + A/B
  wave-4 kills with the muster fights named; cost bar as written).
- Q2: the guards as written, per arm (lived-days control stays 476
  — the rolling window does NOT move on a matched band).
- Q3/Q4/Q5: as written. Spotter: d90 read is the binding read
  (fourth live band). W5-INSTANCE: per seed per arm.
- Telemetry: maxGameDay only, per arm (decision above).
- Metric-change note for the next run: the ladder "fights" count
  conflates refused `startCombat` calls with real fights on
  titan-heavy seeds (r223's note) — the analyzer's MUSTER section
  now reads the engine's own `state.titans.outcomes` log, which
  splits refused vs fought authoritatively; if the outcomes log
  proves clean, the next run may re-admit a refused-split fight
  metric to the telemetry check.

## Metric review — closeout (filled 2026-11-16, adoption)

- Q1: NO-GO, honestly judged. The muster completed twice, slain 0, so
  the rule's NO-GO branch fired. The run note's metric review stands:
  the GO branch should have counted ENGINE-slain titans only (the
  outcomes log), since a field mauling (135613's Herald, killed by
  Nino Kapanadze d114) does not count as slain and nearly fooled the
  rule. Next prereg says so explicitly.
- Q2: guards held as written. Lived-days B 556 vs A 559 (−0.5%, inside
  ±25%); starvation 0 = 0; no B-only collapse (A 135614 collapsed,
  B survived). The committed-blade death (1, a contest) is inside the
  cost bar as written but under-counts the muster's trust/pantry cost —
  a future cost bar should include muster hunger days and trust
  movement while it stands.
- Q3/Q4/Q5: as written. Spotter thin (1–2 villagers with any spotter
  XP at d90/end). W5-INSTANCE: wave-5 entities on B 135614 (5/day max,
  17 days) and B 135616 (2/day, 10 days); one wave-5 kill, B 135616
  d136, scholar Ursula Weber vs the timeslot — first wave-5 kill on
  this band, NOT a lever effect (the muster never called on 135616).
- Telemetry: maxGameDay only per arm vs scale.json (468) — quiet both
  arms. Baseline NOT rolled.
- The ladder "fights" count note stands: refused meetings are
  conflated with real fights in the ladder count; the analyzer's
  MUSTER section reads the outcomes log, which splits them
  authoritatively. Next run may re-admit a refused-split fight metric.
