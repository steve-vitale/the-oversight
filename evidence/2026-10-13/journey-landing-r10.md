# Journey landing r10 — favor acceptance + starvation pathway (2026-10-13)

Base: worktree `journey-landing-r10` @ f77c305e (post r9-fix). Harness:
`scripts/journey-landing-r10-20261013.js` (r9 template + FAVOR_ACCEPT knob,
EAT_FRAC policy knob, kept/broken line capture, fixed gossip-render
detection, vitals tracing, TRACE_DEATH wrapper). Seeded RNG before module
eval; window stub for eval, deleted before play; full src/js list in
index.html order minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js.
Favor pilot: FAVOR_ACCEPT=1, seeds 515/616/717 (+616/515 re-runs for line
capture). Starvation pilot: EAT_FRAC=0.10, seeds 818/919 (+919 TRACE_DEATH
re-run). Transcripts: /tmp/journey-landing-r10-transcript-*.txt; censuses:
`/tmp/journey-landing-r10-census-{515,616,717,818,919}.json`; logs:
`/tmp/journey-landing-r10-{favor,starve,trace,tracedeath,favor616,favor515}.log`.

## Run context: stale-lock recovery + dead run's r9 landed

This run's 04:45 CDT slot found the 03:45 slot's run dead: lock fresh
(08:43:30Z) but registry heartbeat 50 min stale, no node processes, no file
activity. Per the overlap guard: deleted the lock, noted recovery, proceeded.
The dead run had committed ef947bba (journey landing r9: gossip-ask ❓ fix +
tellbeast capitalization) but died before landing. Verified the diff +
evidence myself (WORKER INTEGRITY), rebased onto master (6f373a56, disjoint
files, clean), re-ran its proof test (5/5 GREEN), merged --ff-only as
f77c305e, released its tree as done-merged, removed tree + branch. r9's
4-seed competent run stands as this leg's competent baseline; r10 probes
r9's two open blanks instead of repeating it.

## Pre-registration (docs/MEASUREMENT.md §§9–12)

- **Question:** (a) FAVOR: when a competent player ACCEPTS villager favors
  (r9's picker deflected 8/8 — the promise→kept/broken machinery was
  untested in-sim), do kept/broken arcs fire with real consequences, and do
  the transcripts read like people? (b) STARVATION: when a distracted player
  runs thin (EAT_FRAC=0.10), does the starvation pathway fire coherently —
  autopsy with mechanism, succession after? (r9: 0 starvation deaths;
  seed-999's r7 day-11 player starvation with ~30k pantry unexplained.)
- **Interesting bar:** ≥1 kept or broken favor arc with consequence lines;
  ≥1 starvation death with coherent autopsy; or confirmed silence =
  documented blank. **Both bars crossed.**

## Favor probe: the machinery fires, and it has teeth

3 favors accepted (dlg:commit) → 3 promised → **2 kept, 1 broken**.
The r9 "harness always deflects" was purely the picker's doing — the game
offers `dlg:commit` and honors it.

**Kept (616, James + David — water hauls):** the competent policy's
workWater did the hauls; checkPromises fired the keeps:
- `James catches your eye across the fire. "haul water from the creek at first light with James" — done. You kept your word. That meant everything.`
- `David catches your eye across the fire. "haul water from the creek at first light with David" — done. You kept your word. That meant everything.`
The task is named concretely (favor.task), never the literal "favor".

**Broken (515, Lena — sickness help):** day-5 commit ("I'm achy and wrung
out, barely keeping food down… Someone who knows sickness — please." →
"I'll do it." → "Thank you. Just — thank you. I'll be here, resting.");
the policy never got a heal to her inside the 1–3-day favor deadline:
- `Lena doesn't say anything. But about "help Lena with their sickness — they're achy and wrung out, barely keeping food down" — silence. Promises rot. (-15 trust)`
Trust consequence applied, promise_broken remembered, journal entry
written. Commitments have teeth — the deadline is real.

**The asks read like people.** James (616-day11): "Water's almost gone —
2 liters. I need someone to haul water with me at first light. Two of us,
half the trips. Will you come?" → deepened: "Do the math with me: 2 liters,
12 people. That's not tomorrow's water." → commit: "Count me in." →
"Dawn, then. Bring something to carry — and thank you." David (616-day12,
next day, same village): "The cistern's nearly dry — 0 liters left. I can't
carry enough alone. First light, the creek, you and me?" — the village
genuinely running dry, two neighbors, two days, same honest need.

## Starvation probe: seed-999's mystery SOLVED

**Player starvation is the overnight calorie-resolution death, not pantry
famine.** Seed 919 (distracted, EAT_FRAC=0.10), traced with TRACE_DEATH:
- Day 8: original Bearer <redacted> (Li Graham) dies in combat → mantle passes to
  Linh Konate.
- Days 11–13: Linh runs at 0 personal kcal, wild, pack empty, never eats.
- Day 13 endDay: `S.calories.resolveDay` returns !ok → `playerDeath('starvation')`
  (game.js:26932) → mantle passes to a third Bearer; village continues to
  day 14 (pop 10, scholarAlive).
- Stack-verified: the death came through endDay→playerDeath, NOT the famine
  block. At death: pantry 14,150 kcal (3 stacks), victim villager-health 92.9.

**Why the pantry doesn't save you:** the player must EAT personally —
`takeFromPantry` is haven-gated ("The pantry is in the hall. Your hands are
not."), and an away player with an empty pack has nothing to eat. The
autopsy hook's `pantryEdible` field is a red herring for player deaths;
what matters is pack + location. Seed-999's day-11 starvation with ~30k
pantry was this same path: away, empty pack, 0 kcal overnight. Coherent,
honest, and working as designed — the PARITY rule ("villagers eat once; so
do you") cuts both ways.

**EAT_FRAC=0.10 behaves as designed:** seed 818 ran the whole fortnight at
~1000–1300 kcal (lean, never triggering the old 85% eat) with 12/12 alive.
Starvation death requires actually hitting 0 and staying there — the knob
creates a "runs lean" player, not a suicide.

**Villager starvation paths** (meal shortfall −8/day; bare-pantry famine
−4/day) are coherent in code and did not misfire. No villager starved in
any seed; the one starvation death was the player's, via the overnight
spiral.

## Village assessment (plain words)

**515 — Regina.** All 12 live. Pantry 47,250 → 53,619 (grew). Trust 9–90
(mean 33.7). Villagers kill monsters (ducks, hummice, mirrormoth — real
field fights). Lena's broken promise sits at −15 trust: the village
remembers what you didn't do.

**616 — Cameron.** All 12 live. Pantry 47,250 → 27,926. Trust 15–90 (mean
39.8) — the highest mean: two kept water promises pay. Eight monster kills
by villagers (lockpick_raccoon ×3, hummice, sunbasker, mirrormoth ×2,
understudy, giant_mosquito). The village fights for itself.

**717 — Michelle.** 10/12 live — two villagers die in combat day 10 (the
fortnight's cost). Pantry 47,250 → 26,860. Trust 9–90 (mean 37.2).

**818 — Logan (distracted).** All 12 live. Pantry 47,250 → 23,899. The
lean eater's village is fine — the policy still forages, hauls, delegates.

**919 — Li → Linh → ? (distracted).** Two Bearer <redacted> in 14 days (combat day 8,
starvation day 13); the village absorbs both and reaches day 14 at pop 10,
pantry 18,800. The village-as-protagonist holds under the worst the
fortnight offers.

## People check (SENSE-TESTING LAW)

Read full transcripts across all seeds. Verdict: **the village acts like
people** — favors, gossip, and grief all land.

- Favor arcs have want → engage/deflect → resolve/plant: Lena's sickness
  ask, James's and David's water asks (above).
- Gossip renders 26/26 on "heard anything?" asks (the r9 regex undercounted
  at 6/26 — harness bug, fixed): departures ("Marcus is back. Walked in
  like they'd never left."), defenses ("People need to stop whispering
  about David. They've done nothing wrong."), background sketches
  ("Jessica? A Wild food forager, back before. Solid person."), the stray
  dog that lets Marcus touch it. A couple of high-distortion mutations
  ("James sees in the dark. Not well — but better than you.") read
  unhinged — that's the telephone game at distortion 10, working as
  designed (social r9 proved the climb).
- 717-day8: after the gossip, the conversation deflates honestly — "Do you
  believe it?" → "That's the whole of it. Sorry." → "So." (looks at the
  fire) → "Anyway." (small smile) → "Talk later? I'm already thinking
  about three other things." The energy budget spending itself, in
  character. Not a bug.
- Lures 4/4 spoken, 4/4 declines acknowledged ("Fair enough. Rain check.").

## Harness/tooling fixes (this run)

1. **Gossip-render detection** (harness): r9's content-regex scored 20 of 26
   real renders as "quiet". Now: 2+ quoted segments after ask:gossip =
   render (the framing beat + the gossip). Measurement-only fix.
2. **`favor promised` log line** (harness): read `person(vid).favorTask`,
   a field that doesn't exist — always printed the literal "favor". Now
   reads the favor ledger / promise's favorTask (the game was correct all
   along).
3. **keptLines/brokenLines capture** (harness): the kept/broken narration is
   now quoted in MET output for the evidence note.
4. **EAT_FRAC knob** (`scripts/policies/competent.js`): eat trigger
   parameterized, default 0.85 = byte-identical behavior. Enables
   distracted-player probes.
5. **Per-villager vitals** in daySnapshot (health/away/hunger/dead) —
   starvation forensics.
6. **TRACE_DEATH=1** wrapper: registerDeath snapshots pantry/health/game-day
   + stack at fire time.

## Verdict: REACHABLE / FUN / WINNABLE

- **Reachable:** favors are offered to any player who talks (3 accepts in 3
  seeds with the accept knob; the ask flow is the normal conversation
  path). The starvation path is reachable by any player who stops eating —
  no checklist, just consequences.
- **Fun:** kept promises pay in the fiction ("catches your eye across the
  fire"); broken ones cost audibly. The fortnight has real stakes: two
  Bearer <redacted> in seed 919 and the village kept going.
- **Winnable:** 5/5 villages reach day 14 as going concerns; trust means
  33–40; pantries 19–54k; the information layer (gossip, naming, favors)
  fires throughout.

## Open questions / not completed

- The "no villager ever pushes for a feast" blank holds (villagerFeastPush=0
  again) — documenting, not fixing: feasts read as a player-initiated
  social technology, likely design.
- Favor keep-rates by kind (heal vs haul vs food) need a bigger sample;
  Lena's broken heal favor suggests heal-keeps are harder than haul-keeps
  for the competent policy — worth a targeted probe, not a fix.
- No game-code changes this run: everything probed worked as designed.
  All changes are harness/tooling.

## Files changed

- `scripts/journey-landing-r10-20261013.js` (new): r10 harness.
- `scripts/policies/competent.js` (modified): EAT_FRAC knob (default-stable).
- `evidence/2026-10-13/journey-landing-r10.md` (new): this note.
