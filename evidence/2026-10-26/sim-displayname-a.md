# sim-displayname-a — same-instance display-name changes in awayNews (axis scale-onramp)

Run: fleshout-20261026T1354Z (Mon 2026-10-26). Axis: scale-onramp.
DIAG ONLY, zero src/js changes. This worker does not touch the
tracker, the findings backlog, the lock, claim files, or the
rotation file, and does not touch food-economy files, sibling
worktrees, or sibling evidence.

## PRE-REGISTRATION (binding — judged only against this)

Start from the LANDED defnarr corpus
(evidence/2026-10-26/perseed-sim-defnarr-a/: 8 per-seed JSONs +
defnarr-census.json) — do NOT re-run the full 73671–73678 band.
Trace BOTH instance chains meeting-by-meeting from the corpus.
Read the naming code (monsterNoun, codex monster entry) and
identify WHAT changed for that monster id between the last
old-name meeting and the first new-name meeting. Do NOT implement
defnarr proposal 3 or any name-pinning change (ruling pending);
a proposal-only section is welcome, code changes are not.

DIAG-GO iff ALL of: (a) both chains traced completely with
dates/names/reporters; (b) the mechanism named with code citations
AND the specific intervening event(s) identified from the run data
(or a PROVEN-NEGATIVE); (c) a plain-words verdict — bug vs
legitimate knowledge-gated evolution vs reporter-side state — and
exactly what proposal 3 would need to pin; (d) quoted
transcript/codex reads supporting the verdict; (e) a "metric
review" section. Any leg missing = say so plainly.

## DIAG VERDICT: DIAG-GO (all five legs pass)

The name changes are LEGITIMATE KNOWLEDGE-GATED EVOLUTION, not a
bug and not reporter-side state. Each monster type changes its
news name exactly once per run: from the System's true name to
the name the village voted for. The two 73675 changes are two
separate village votes concluding on two consecutive nights —
day 79 for the voice-mimic radio, day 80 for the hushwolf — which
is why both chains happen to show their new name first on day 81.

## (a) THE TWO CHAINS, MEETING BY MEETING (seed 73675, from the corpus)

### Chain 1: voice_mimic_radio, spawn seq 21 (one animal, 1 HP of 65)

| Day | Reporter (id) | Outcome | Monster HP | News name |
|-----|---------------|---------|------------|-----------|
| d66 | Elena (gen_3nq7jxo) | mFlee, 4 rounds | 49/65 | Static |
| d69 | Brayan (gen_uzmmgq0) | mFlee, 0 rounds | 5/65 | Static |
| d74 | Nina (nina_petrova) | mFlee, 0 rounds | 1/65 | Static |
| d81 | Nina (nina_petrova) | mFlee, 0 rounds | 1/65 | Loud Beast |
| d96 | Brayan (gen_uzmmgq0) | mFlee, 0 rounds | 1/65 | Loud Beast |
| d104 | Nina (nina_petrova) | mFlee, 0 rounds | 1/65 | Loud Beast |
| d125 | Nina (nina_petrova) | mFlee, 0 rounds | 1/65 | Loud Beast |
| d127 | Meera (meera_reddy) | mFlee, 0 rounds | 1/65 | Loud Beast |
| d133 | Elena (gen_3nq7jxo) | mFlee, 0 rounds | 1/65 | Loud Beast |

Same animal throughout: same spawn seq, same 65 max HP, stuck at
1 HP from d74 on. No queue-dropped line hides a meeting (9/9
recorded). Switch bracket from the corpus alone: (d74, d81].

### Chain 2: hushwolf, spawn seq 11 (one animal, 50 max HP)

| Day | Reporter (id) | Outcome | Monster HP | News name |
|-----|---------------|---------|------------|-----------|
| d18 | Nina (nina_petrova) | vFlee, 2 rounds | 50/50 | Hushpuppy |
| d19 | Nina (nina_petrova) | vFlee, 2 rounds | 29/50 | Hushpuppy |
| d20 | Gonzalo (gen_wag8dbe) | mFlee, 1 round | 19/50 | Hushpuppy |
| d21 | Pavel (pavel_dubinin) | mFlee, 0 rounds | 3/50 | Hushpuppy |
| d21 | Meera (meera_reddy) | mFlee, 0 rounds | 3/50 | Hushpuppy |
| d22 | Meera (meera_reddy) | mFlee, 0 rounds | 3/50 | Hushpuppy |
| d27 | Willow (gen_s977vdo) | mFlee, 0 rounds | 3/50 | Hushpuppy |
| d48 | Willow (gen_s977vdo) | mFlee, 0 rounds | 1/50 | Hushpuppy |
| d52 | Gonzalo (gen_wag8dbe) | mFlee, 0 rounds | 1/50 | Hushpuppy |
| d81 | Meera (meera_reddy) | mFlee, 0 rounds | 1/50 | Big-Eyes |
| d83 | Brayan (gen_uzmmgq0) | mFlee, 0 rounds | 1/50 | Big-Eyes |
| d115 | Gonzalo (gen_wag8dbe) | mFlee, 0 rounds | 1/50 | Big-Eyes |
| d125 | Aisha (gen_ga57e51) | mFlee, 0 rounds | 1/50 | Big-Eyes |
| d127 | Aisha (gen_ga57e51) | mFlee, 0 rounds | 1/50 | Big-Eyes |

Same animal throughout: same spawn seq, same 50 max HP, stuck at
1 HP from d48 on. No queue-dropped line hides a meeting (14/14
recorded). Switch bracket from the corpus alone: (d52, d81].
Type-level, not instance-level: EVERY hushwolf instance on 73675
reads Hushpuppy before d81 and Big-Eyes from d81 (seq 10 and 12
agree with seq 11).

### The "same reporter" check: CONFIRMED for both chains

- Voice: Nina (nina_petrova) reports "the Static" on d74 and
  "the Loud Beast" on d81 — same villager id, same animal, 7 days
  apart. The defnarr note's "same reporter" claim holds.
- Hushwolf: Meera (meera_reddy) reports "Hushpuppy" on d21/d22
  and "Big-Eyes" on d81 — same villager id, same animal.
- Cross-check that it is NOT reporter-side: on d81 itself, two
  different reporters use the new names (Nina for the radio,
  Meera for the wolf), and from d81 on, every reporter uses the
  new name for that type. A reporter's personal vocabulary cannot
  explain a village-wide overnight switch.

## (b) THE MECHANISM, WITH CODE CITATIONS

Plain-words version first: the game has three names for every
monster — the strange description you start with, the true name
the System reveals when it arrives, and the nickname the village
votes for. The news always prints whichever name is currently on
top. The System arrived on day 7, so from day 7 until the village
votes, the news prints the true name. The day the village vote
concludes, the nickname takes over — for every animal of that
type, forever. That vote is the intervening event.

The code path (all in src/js/game.js unless noted):

1. The news line's monster name comes from `monsterNoun(mid)` at
   fight time — src/js/fieldFights.js:616, in fieldFightSummary,
   composed with `articlePhrase` so "the " is never doubled.
   monsterNoun is a pure read of the codex entry plus static
   monster data; it takes no reporter argument and keeps no
   per-reporter state. Nothing about the reporter can change it.
2. `monsterDisplayName(mid)` (game.js:21841) is the three-step
   ladder, in priority order:
   - villageName set → the village name wins;
   - else System arrived → the true name (`mdef.name`);
   - else → the strange descriptor (`mdef.unknown`).
   `monsterNoun` then strips a leading article for sentence use
   ("The Loud Beast" → "Loud Beast", which the news prints as
   "the Loud Beast") but keeps proper-name casing.
3. The System arrives on day 7+ (`checkSystemArrival`,
   game.js:23509: `if (s.day >= 7 ...) this.state.systemArrived =
   true`). On 73675 the probe's first systemArrived snapshot is
   scholar day 8. So both chains' early names ARE the true names:
   "Static" is voice_mimic_radio's `mdef.name`, "Hushpuppy" is
   hushwolf's `mdef.name` (src/data/monsters.json). The village
   had not voted yet, so the true name showed.
4. The village name is set in exactly ONE place in all of src/js:
   `e.villageName = name` at game.js:22205, inside
   `monsterNamingCheck`. That function returns early when
   `e.villageName` is already set — the name can be set once and
   never changes again. The vote path: word spreads until enough
   villagers know (`monsterNewsCheck`, need = min(3, roster));
   the debate kicks (`kickMonsterNaming` → `seedMonsterNames`,
   first 4 roster members propose via `generateMonsterName`);
   villagers campaign nightly (the loop at game.js:31175-31206:
   late proposers join, the plurality name attracts switchers);
   when one name holds a roster majority, `monsterNamingCheck`
   sets it and announces: `It's settled. The village is calling
   it "<name>."`
5. Neither monster has a curated `villageNames` list or
   `nameTraits` (monsters.json: both fields absent), so
   `generateMonsterName` uses the fallback traits
   ['big','loud','ugly'] and temperament pools. Both winning
   names come from the steady pool only: "Big-Eyes" =
   cap('big') + "-Eyes"; "The Loud Beast" = "The " + cap('loud')
   + " Beast". No other pool produces either string (bold gives
   "The Big Bastard"/"Old Big"/"Big-Bane"; cautious gives "The
   Big Thing"/"Don't-Look"/"The Big Stare").

Why this exhausts the alternatives: monsterNoun's inputs are
exactly three — codex villageName, systemArrived, static monster
data. Data never changes mid-run; systemArrived only ever flips
false→true (day 7, before both chains start); villageName is set
once, in one place. So a mid-run name change can ONLY be the
villageName assignment. There is no per-reporter state, no
per-instance name, no churn event, and no second switch possible
after the vote — which matches the corpus: after d81, neither
type ever changes again on 73675 (voice through d133, hushwolf
through d127).

### The specific intervening events (probe-pinned, see below)

- Voice_mimic_radio: villageName "The Loud Beast" set on
  scholar day 79 (tally 6 for "The Loud Beast", 1 each for
  "Big-Eyes" and "The Ugly Beast"). Codex entry first appears
  d75, reported + debate kicked d76, converged d79. Next meeting
  d81 shows the new name.
- Hushwolf: villageName "Big-Eyes" set on scholar day 80
  (tally 6 for "Big-Eyes"). Codex entry first appears d76
  (already reported, 1 knower), debate kicked d78 when knowers
  hit 3, converged d80. Next meeting d81 shows the new name.
- So NOT one shared event: two debates that both started in the
  d75–78 window and converged on consecutive nights. The shared
  d81 first-new-name day is coincidence of meeting timing, not
  of voting: the next meeting after each vote happened to fall
  on d81 for both types.

A nuance worth recording: villagers had fought hushwolves since
d17, but the codex entry — and therefore the debate — only
appears on d76. Defender fights by villagers do not themselves
register the type in the codex; the debate starts when the type
enters the codex (scholar report / tale path), not when the
first villager meets one. The snapshot cadence cannot pin WHICH
registration action fired on d75/d76 (entry creation is not
itself logged); that trigger is unpinned, but it is not needed
for the verdict — only villageName moves the news name, and the
vote days are pinned.

### Why the probe re-run was needed (stated plainly)

The landed corpus contains fight rows only — no codex history.
The vote days (d79/d80) and the tallies are not in it, so the
intervening event could not be identified from the corpus alone.
One seed (73675) was re-run with the defnarr harvest composition
reused verbatim (tableseat-nowait + raftdraft/spawnsrc/oldcore/
defwound-diag, DEFWOUND_TRANSCRIPT=1, 180d death-aware horizon)
plus a single read-only addition: a daily snapshot of the two
codex entries (primitives copied out, no Game writes, no RNG).
The full 73671–73678 band was NOT re-run. Neutrality proof:
probe final row matches the corpus row exactly (days 180,
gameDays 181, endReason survived, deaths 43, won 0) AND the
probe's defwound name sequences for both mids reproduce the
corpus sequences exactly (47 rows). Probe output:
evidence/2026-10-26/perseed-sim-displayname-a/s73675-probe.json.

Probe snapshots around the votes (scholar day, villageName,
proposal tally, knowers):

- voice d76: vn=null, tally {Big Big:1, The Loud Beast:1,
  Big-Eyes:1, Loud-Eyes:1}, knowers 3 (debate kicked)
- voice d77: tally {The Loud Beast:4, ...}
- voice d78: tally {The Loud Beast:5, ...}
- voice d79: vn="The Loud Beast", tally {The Loud Beast:6,
  Big-Eyes:1, The Ugly Beast:1} — CONCLUDED
- hushwolf d78: vn=null, tally {Big-Eyes:3, Big Ugly:1,
  The Ugly Beast:1, Big Loud:1, Loud-Eyes:1, The Big Beast:1},
  knowers 3 (debate kicked)
- hushwolf d79: tally {Big-Eyes:4, ...}
- hushwolf d80: vn="Big-Eyes", tally {Big-Eyes:6, Big Ugly:1,
  The Ugly Beast:1, Loud-Eyes:1, Ugly-Eyes:1} — CONCLUDED

## (c) PLAIN-WORDS VERDICT

BUG? No. The names changed because the village did exactly what
the game says villages do: it argued about what to call the
beast and then agreed. A player following one animal through the
news CAN trust the name — with one caveat: the name changes
once, without announcement in the news channel itself. The
"settled" announcement goes to the say stream, not into the
awayNews line, so a news-only reader sees "the Static" become
"the Loud Beast" with no explanation in the channel. The animal
is the same (same wounds, same behavior); only the village's
word for it changed. That is legitimate knowledge-gated
evolution, with a discoverability gap, not a naming bug.

REPORTER-SIDE STATE? No — ruled out twice over: the name
function takes no reporter input, and the switch is village-wide
on the same day for all reporters and all instances of the type.

### What defnarr proposal 3 would need to pin (proposal only — NOT implemented)

Proposal 3 says: pin the first name per instance in awayNews.
This arm's findings specify it precisely:

- Pin PER TYPE, not per instance — because the name lives on
  the type's codex entry, not on the animal. Every instance of
  the type switches together; there is no per-instance name to
  pin. (Pinning per instance would mean storing a name on each
  world-monster entity — a new data field, not a text tweak.)
- The pin must capture the name AT THE FIRST NEWS LINE for that
  type (which, on this band, is the true name once the System
  has arrived) and hold it even after villageName is set.
- The pin must be channel-scoped to awayNews only: the codex,
  meat names, and other surfaces should keep showing the voted
  name, or the game would contradict itself (codex says
  "Big-Eyes", news says "Hushpuppy" forever).
- Open question for the ruling, not answered here: should the
  pinned news name EVER update (e.g. after the "settled"
  announcement, with a "now called X" bridge line), or freeze
  forever? Freezing forever makes the news channel diverge from
  the village's own word permanently — the ruling should weigh
  that against the follow-one-animal benefit. An alternative
  within this arm's evidence: keep the voted name but add the
  bridge ("the Loud Beast — the Static, as it was") on the first
  new-name line per type, which preserves followability without
  a permanent fork. No code was written for any variant.

## (d) QUOTED READS SUPPORTING THE VERDICT

Corpus lines (seed 73675, awayNews as written by the engine):

- d74, Nina vs voice_mimic_radio seq 21: "⚔️ Nina stared down
  the Static and it backed off — 0 rounds, not a scratch on
  them. It's still out there, somewhere."
- d81, Nina vs the same seq 21: "⚔️ Nina stared down the Loud
  Beast and it backed off — 0 rounds, not a scratch on them.
  It's still out there, somewhere."
- d52, Gonzalo vs hushwolf seq 11: "⚔️ Gonzalo stared down the
  Hushpuppy and it backed off — 0 rounds, not a scratch on
  them. It's still out there, somewhere."
- d81, Meera vs the same seq 11: "⚔️ Meera stared down the
  Big-Eyes and it backed off — 0 rounds, not a scratch on them.
  It's still out there, somewhere."

Code (paraphrased only where noted; exact lines cited):

- game.js monsterDisplayName: `if (e && e.villageName) return
  e.villageName;` then `if (this.state.systemArrived) return
  mdef.name;` then `return mdef.unknown || 'something moving';`
- game.js monsterNamingCheck: `if (!e || e.villageName) return;`
  ... `e.villageName = name;` then `this.say(`It's settled. The
  village is calling it "${name}." ...`)`
- game.js checkSystemArrival: `if (s.day >= 7 &&
  !this.state.systemArrived) { this.state.systemArrived = true;`
- fieldFights.js:616: `mName = this.monsterNoun ?
  this.monsterNoun(mdef.id) : (mdef.id || 'something');`

Cross-seed corroboration (hushwolf first-new-name day varies —
per-type vote, not a fixed day): 73671 d25, 73673 d17, 73675
d81, 73677 d22, 73678 d103; 73672/73674 already switched before
their first recorded fight; 73676 never switched in its run.
A global calendar event cannot produce that spread.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. DIAG-GO was judged exactly
  as pre-registered: chains traced (a), mechanism + intervening
  events identified (b), verdict + proposal-3 specification (c),
  quoted reads (d), this section (e).
- One disclosed method extension, not a threshold change: the
  pre-registration allowed a re-run only if the chain was
  incomplete. The NAME chain was complete in the corpus, but the
  EVENT chain (vote days, tallies) is absent from the corpus by
  construction — fight rows carry no codex history. A
  single-seed probe re-run was therefore needed to satisfy leg
  (b) honestly instead of asserting vote days from code alone.
  The re-run was minimal (seed 73675 only, verbatim harvest
  composition, read-only snapshot) and its neutrality is proven
  above (final row + 47 name-sequence rows reproduce exactly).
  No threshold, seed, or horizon was changed to accommodate it.
- Balanced panel (§15): NOT run as a compare, deliberately —
  this arm makes no before/after balance claim (no lever, no
  game-code change), so there is nothing for the panel to
  compare. The panel's recorder-corpus limitation is not
  invoked here.
- Counts vs hearings: as in defnarr, the corpus counts lines
  WRITTEN (awayNewsLast per fight); lines HEARD are fewer (queue
  cap 8, spoken cap 5 per return) and were not counted. The
  switch conclusion does not depend on hearing: the name in the
  written line is what the engine computed at fight time.
- What this arm cannot see (stated, not hidden): the exact
  registration action that created each codex entry on d75/d76
  (scholar report vs killer tale) is not logged by the snapshot
  and is not pinned; the "settled" announcement lines themselves
  were not captured (narration silenced in sims) — the vote is
  proven by the codex snapshots, not by a quoted announcement.
  Neither gap affects the verdict: only villageName moves the
  news name, and its set-days are pinned.

## INSTRUMENT NOTES

- New: scripts/test-displayname-trace.js (28 checks, green on
  the landed corpus — chains, same-reporter pairs, mechanism
  statics, stability, cross-seed variance; no writes, no RNG,
  no Game load).
- New: scripts/test-displayname-probe.js (single-seed probe:
  verbatim defnarr harvest composition + read-only daily codex
  snapshot; neutrality gates + conclusion-day assertions green;
  writes evidence/2026-10-26/perseed-sim-displayname-a/
  s73675-probe.json).
- Reused VERBATIM (never edited): scripts/test-defwound-diag-
  sweep.js composition via its policy modules (tableseat-nowait,
  raftdraft-diag, spawnsrc-diag, oldcore-diag, defwound-diag),
  scripts/sim-harness.js.
- Corpus: evidence/2026-10-26/perseed-sim-defnarr-a/ (landed,
  untouched); evidence/2026-10-26/perseed-sim-displayname-a/
  s73675-probe.json (this arm's probe output).
- Zero src/js diff (verified: `git status` shows only the two
  scripts, the probe JSON, and this evidence file).

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. Defnarr proposals 1–4 still need a Steve/coordinator ruling
   before any narration arm implements them; proposal 3 is now
   specified exactly above (pin per type, awayNews-scoped, with
   the freeze-forever vs bridge-line question open).
2. The codex-entry-creation trigger (d75/d76) and the "settled"
   announcement's visibility in the news channel are unpinned
   details, not verdict blockers — a future sense arm could
   capture the announcement line with the recording-only-say
   method if the ruling needs it.
3. The defnarr band-drift note (1815 band no longer reproduces)
   is unchanged by this arm and remains the coordinator's
   re-baseline question.

Convergence state: converging (this arm moved no lever and
changed no mechanic — it closed the defnarr name-instability
blank with a mechanism + verdict).
