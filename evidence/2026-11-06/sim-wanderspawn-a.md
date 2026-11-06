# sim-wanderspawn-a — the wanderer-spawn 20-HP fix, built and proven (BUILD-GO)

**Arm:** sim-wanderspawn-a (run fleshout-20261106T1515Z, Loop A, axis
scale-onramp / winnability chain) · **Build + before/after, one src/js
change, no gate/price/deed change.** Policy
`scripts/policies/competent-stageally-a.js` used verbatim.
**Verdict: GO** — the proof test is RED pre-fix (12 failures) and GREEN
post-fix (21/21), the d149 1-round-kill shape is gone on the fixed leg,
and no new death mode appeared.
**Seeds:** 53001–53008 REUSED (the committed stageally-confirm band —
deliberate reuse for a before/after on identical seeds, not a fresh
band) · **Horizon:** 150d death-aware · **Corpus (before):**
`evidence/2026-11-06/perseed-wanderspawn-a-before/` (8 files) ·
**Corpus (after):** `evidence/2026-11-06/perseed-wanderspawn-a-after/`
(8 files) · **Prereg:**
`evidence/2026-11-06/sim-wanderspawn-a-prereg.md` (committed 585f10255
before any judged sim) · **Proof:**
`scripts/test-wanderspawn-20261106.js` 21/21 green post-fix, 9/21
pre-fix.

**The one-line result, plainly:** monsters born from a bare `{id}`
— wanderer contacts, traps, finale campaign nodes — used to enter the
world at 20 hit points no matter what species they were. Now they are
born at their real strength: a Congregation at 900, the Finale itself
at 1800. The one-round "kill" of a wave-4 beast on seed 53006 is gone,
because the beast is no longer born crippled.

## The bug (from sim-congtrace-a DIAG-GO)

`spawnWorldMonster` (game.js:20271) looked up the monster's real
numbers only when given a plain name (a string). Three live callers
hand it a bare `{id}` object instead, so the lookup never fired and
`baseHp` fell back to the `|| 20` default:

| Caller | Call | Born at (before) | Born at (after) |
|---|---|---|---|
| Wanderer contact (game.js:24384) | `{id, veteran}` | 20/20 | 900/900 (Congregation def hp [900,1100]) |
| Trap (game.js:23565) | `{id}` | 20/20 | 18/18 (glasswing def hp [18,26]) |
| Finale crew (finale-campaign.js:73) | `{id}` + `{titan:true}` | 20/20 | 700/700 (def hp [700,900]) |
| Finale opening (finale-campaign.js:359) | `{id}` + `{titan:true}` | 20/20 | 900/900 (def hp [900,1100]) |
| Finale heart (finale-campaign.js:359) | `{id}` + `{titan:true}` | 20/20 | 1800/1800 (def hp [1800,2200]) |
| Debug button (app.js:20012) | `{id}` | 20/20 | def HP (manual-only, healed by the same fix) |

Two more born-crippled dimensions the same shape carried, also fixed:
a bare-`{id}` spawn ignored the def's `size` (a size-2 Congregation
spawned size 1; the Finale size 3 spawned size 1), and the wanderer
call passes `veteran` inside the object, which `spawnWorldMonster`
read only from `opts` — a veteran wanderer monster spawned
non-veteran, losing its +50% hardening at fight build.

Proven safe (unchanged behavior, covered by proof-test controls):
string ids, full-def callers (`maintainWorldMonsters`, tile-entry
spawn), the fled-monster recovery (explicit `hp`/`maxHp` preserved),
`opts.hp` overrides, and the titan/network spawns that already pass
strings (`titanPlace` passes `def.monster`, a string;
`networkSummon` passes `n.monster`, a string).

**Finale verdict: YES, the finale spawns share the bug** — proven by
code path, not guessed: `finale_crew` / `finale_opening` / `finale`
all have defs with hp in `src/data/monsters.json`, all three finale
spawns pass bare `{id}`, and `tbWorldHpFor` lifts the world monster's
HP into the fight for wave-4+ non-veterans with a matching id, titans
explicitly not special-cased — so a campaign node entered its fight at
20 HP. The central fix heals them; no `finale-campaign.js` edit was
needed.

## The fix (one place, all callers healed)

In `spawnWorldMonster` only (game.js ~20271, 19 insertions / 2
deletions — `git diff` verified before committing: no other file, no
competence/practice/table/pyrrhic region touched):

```js
if (!full.hp) {
  const def = (this.data.monsters || []).find(m => m.id === id) || {};
  if (def.hp) full = Object.assign({}, def, full);
}
```

When the caller object carries no `hp`, the missing def fields are
filled from the data def; caller-supplied fields always win
(`Object.assign` order), so explicit-hp and full-def callers are
untouched, and an unknown id still falls back to 20 (no crash). And:

```js
veteran: !!(opts.veteran || (mdef && mdef.veteran)),
```

No `finale-campaign.js`, `app.js`, or call-site edit was needed — the
central fix heals every bare-`{id}` caller at once. No gate, price,
deed, or readyDemand change. No `[needs-eyes]` — nothing about feel,
combat UI, or what the player sees changes except that monsters now
have the strength their species was always supposed to have.

## Proof (RED pre-fix, GREEN post-fix)

`scripts/test-wanderspawn-20261106.js` — harness-loaded game,
`spawnWorldMonster` called in every bare-`{id}` caller shape plus the
safe shapes as no-regression controls, plus a sim-level leg (stageally
driver, seed 53006 staged, 150d, to /tmp):

- **Pre-fix: 9 passed, 12 failed.** Every bare-`{id}` HP check failed
  at 20 (Congregation 20 not 900, finale_crew 20 not 700, finale 20
  not 1800, glasswing 20 not 18, hushwolf 20 not 50); size checks
  failed (Congregation size 1 not 2, Finale size 1 not 3); the
  veteran flag was dropped; and the driver leg reproduced the d149
  shape exactly (150d survived, standing 175, 2 wave-4 kills, the
  1-round solo Congregation win at seq 16). All controls passed.
- **Post-fix: 21 passed, 0 failed.** Every spawn carries its def HP
  (hp[0]); sizes correct; veteran flag survives; all controls still
  pass; and the 53006 driver leg holds no 1-round solo wave-4+ win.

## Before / after on the committed band (53001–53008, staged, 150d)

**Before** (pre-fix; `perseed-wanderspawn-a-before/`):

| Seed | Days | End | Standing | Scale | Max wave | W4 kills | 1-round solo W4 wins |
|---|---|---|---|---|---|---|---|
| 53001 | 51 | village-lost | 125 | village | 4 | 0 | 0 |
| 53002 | 150 | survived | 195 | village | 4 | 0 | 0 |
| 53003 | 82 | village-lost | 25 | village | 3 | 0 | 0 |
| 53004 | 84 | village-lost | 155 | village | 4 | 1 (d79 eulogy) | 0 |
| 53005 | 90 | village-lost | 190 | village | 4 | 0 | 0 |
| 53006 | 150 | survived | 175 | village | 4 | 2 (d89 strike, d149 congregation) | **1 (d149 congregation)** |
| 53007 | 38 | village-lost | 0 | village | 3 | 0 | 0 |
| 53008 | 112 | village-lost | 120 | village | 4 | 0 | 0 |

Before totals: median survival 87d, wins 0, national 0, table 0,
wave-5 faced 0, wave-4 kills 3, 1-round solo wave-4 wins 1 (the d149
shape, and only that one on the whole band).

**After** (post-fix; `perseed-wanderspawn-a-after/`):

| 53001 | 92 | village-lost | 125 | village | 4 | 0 | 0 |
| 53002 | 150 | survived | 195 | village | 4 | 0 | 0 |
| 53003 | 82 | village-lost | 25 | village | 3 | 0 | 0 |
| 53004 | 84 | village-lost | 155 | village | 4 | 1 (d79 eulogy) | 0 |
| 53005 | 99 | village-lost | 65 | village | 3 | 0 | 0 |
| 53006 | 90 | village-lost | 150 | village | 4 | 0 | 0 |
| 53007 | 38 | village-lost | 0 | village | 3 | 0 | 0 |
| 53008 | 117 | village-lost | 145 | village | 4 | 0 | 0 |

After totals: median survival 91d, wins 0, national 0, table 0,
wave-5 faced 0, wave-4 kills 1, 1-round solo wave-4 wins 0.

**Trajectory shift, reported plainly:** a 900-HP beast where a 20-HP
one stood changes fights, and the band moved with it — five seeds move and three sit still. Seed 53006
is the swing: 150d survived before, 90d village-lost after — and the
Congregation never even arrives (0 mentions in the whole after corpus,
vs 6 before); the village dies to a run of wave-4 Reunion losses from
day 81, the scholar falling four times in nine days, so the d89 Strike
kill is gone too, not just the d149 one. Seed 53001 lives longer (51d →
92d) and seed 53008 a little longer (112d → 117d, standing 120 → 145),
while seed 53005 lives longer but weaker (90d → 99d, standing 190 → 65,
max wave 4 → 3, never reaching wave 4 at all). Seeds 53002, 53003,
53004 and 53007 are unchanged to the day and the standing point —
including 53004, which keeps its genuine d79 Eulogy kill (3 rounds,
solo) exactly as before. Median survival actually rose, 87d → 91d,
because 53001's +41 days outweigh 53006's −60.
That is expected (prereg): the fix removes a spurious kill, so wall
numbers may dip, and a dip is correctness, not a failed lever. The
d89 Strike kill (entered 750/1000, genuine) is the honest baseline
for what a wave-4 kill looks like on this band; the d149 Congregation
kill was never one.

## Wall numbers

| | Before (53001–53008) | After (53001–53008) |
|---|---|---|
| National | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave 4–5 unlocks | wave 4 on 6/8, wave 5 on 0/8 | wave 4 on 5/8, wave 5 on 0/8 |
| Median survival | 87d | 91d |
| Wave-4 kills | 3 (1 spurious) | 1 (genuine) |

The wall is unchanged in shape: no village reaches national, the
table, or a win on this band before or after — the fix removes a
spurious kill, it does not open the scale on-ramp. That was never its
job.

## Village assessment (plain words)

Before the fix, the world quietly lied: the most dangerous beasts in
the game could be born as weak as a sick deer, wander for months, and
fold to a single swing — and the record books counted it as a triumph.
One village's whole claim to wave-4 strength rested on that lie. After
the fix, the world tells the truth: a Congregation that walks up to
your fire has 900 hit points, and if your village cannot answer that,
it dies learning it — seed 53006's village, which survived 150 days
before, died at day 90 after, its whole late arc rewritten (the
Congregation never arrives; wave-4 Reunions cut the scholar down four
times in nine days instead). That is a harsher world, and an honest one. The
villages themselves are unchanged — same people, same routines, same
fights — only the monsters stopped being born broken.

## Sense-test read

No new transcript lines were introduced by this fix (no narration
changed), so there is no new dialogue to judge. The sense finding is
the one the fix removes: a wave-4 kill that passed in the captured
transcript without a single line naming the beast (congtrace-a) now
cannot happen that way — a real Congregation fight is a multi-round
affair with rally lines, wounds, and consequences, or a death. The
next arm that traces a wave-4 kill on this band should find a fight
worth narrating.

## Metric review

Pre-registered metrics bind this run (prereg 585f10255). Primary:
zero wave-4+ spawns at 20 HP in the reproduction probe, plus the d149
1-round-kill shape gone on the fixed leg. **Both met:** the proof test
is GREEN post-fix on every bare-`{id}` shape (wanderer, trap, all
three finale nodes, debug button), and the after leg holds
zero 1-round solo wave-4+ wins. No metric was swapped,
re-cut, or re-thresholded. Guards: no new death mode (all after-leg
ends are `village-lost`/`survived`, the same set as before);
`check.js --quick`: 276 passed, 14 failed (exit 1) — NOT a regression
from this fix: 13 of the 14 fail identically on the sibling
journey2-endgame branch, which carries no wanderspawn change, and the
14th (`test-throttlefeast-20261014.js`) passes standalone (17 pass, 0
fail in 94s; its parallel-run 120s timeout was box load from three
concurrent check.js runs). The measurement-proof failures are the
expected staleness signal any Game-input change produces — the
neutrality proof needs a refresh via
`scripts/balance-proof-update.js` as follow-up maintenance, not part of
this arm. No spawn, combat, or wave test failed.
- The prereg's fallback (band-wide census if trajectory shift removes
  the Congregation from 53006 entirely) was TRIGGERED — the Congregation
  never reaches 53006 on the after leg (0 mentions in the whole after
  corpus, vs 6 before), so the shape check fell back to the band-wide
  census: zero 1-round solo wave-4+ wins across all 8 seeds, and the
  only wave-4 kill anywhere on the after leg is the d79 Eulogy on 53004
  (3 rounds, solo, identical to before the fix — a real fight, not a
  spawn artifact). The corpus records no per-fight entry HP, so the
  entry-HP half of the census rests on the proof test (21/21: every
  bare-`{id}` shape spawns at def HP), which is the decisive check per
  the prereg.
- The wall-number dip the prereg warned about is real but small and
  honest: wave-4 kills 3 → 1 (the two removed kills are the spurious
  d149 Congregation and the d89 Strike, which never happens on the
  shifted trajectory — the village dies at day 90 before it can fight
  it); median survival 87d → 91d (rose, not dipped); national/table/wins
  0 → 0; wave-4 reach 6/8 → 5/8 (53005 never reaches wave 4 after). No
  wall number was re-scored; the dip is the fix removing a kill that was
  never real, reported as designed in the prereg.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE — its `compare` mode takes
  panel.json.gz pairs (`--before/--after/--out`), not per-seed recorder
  corpora; this arm's judged corpora are per-seed recorder JSONs and no
  panel files were produced for either leg, so no compare `.md` is
  fabricated. Before/after comparison here is the identical-seed corpus
  table above (same driver, same seeds, same policy, same horizon).
- `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-06/perseed-wanderspawn-a-after/*.json' --metrics
  national,table,wins,exiled`: REFUSED, recorded not rolled forward —
  the tool refused the recorder corpus ("all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs"),
  so no baseline was updated and there are no LOUD lines to report. The
  after-leg wall numbers (national 0, table 0, wins 0) are unchanged
  from the before leg, so there is no deviation to investigate.

## What this arm does NOT claim

- Not a scale fix: national/table/wins stay 0 on this band. The
  on-ramp is still the blocking axis.
- Not a claim that every past wave-4 kill was spurious: the d89 Strike
  kill on 53006 entered at 750/1000 (genuine), and the d79 Eulogy on
  53004 was a field-worn entry. Only the d149 Congregation is proven
  spawn-crippled. The congtrace next blank (2) — a census of 20-HP
  entries across the per-seed corpora — is still open, and this fix
  stops the contamination going forward; it does not rewrite history.
- Not a claim about the 159-round Congregation rout (53001, backlog):
  a different seed, a different shape, untouched here.
- Not a finale-campaign playtest: the finale nodes now spawn at def
  HP by code path + proof test, but no sim on this band reaches a
  finale campaign, so the campaign-node fight at full HP is proven in
  the harness, not in a live campaign.

## Next blanks (for the loop, not this arm)

1. **20-HP census (congtrace blank 2, still open):** count entry HP <
   100 on wave-4+ traces across the per-seed corpora to size how many
   recorded wave-4 kills were spawn-crippled. The fix stops new
   contamination; the census sizes the old.
2. **Finale campaign at full HP:** a sim that actually reaches a
   finale campaign node now faces a 700/900/1800-HP node instead of a
   20-HP one — the campaign's difficulty was never measured honestly.
   Worth a dedicated arm when a run reaches the campaign.
3. **The wall itself:** wave-4 kills in the wild remain the binding
   link (3 on this band before, of which 1 was spurious). The next
   lever has to go after where killers actually die, out in the wild.

## Proof and commits

- Proof `scripts/test-wanderspawn-20261106.js`: 9/21 pre-fix (RED),
  21/21 post-fix (GREEN), including the 53006 driver leg both ways.
- Prereg committed 585f10255 before any judged sim (rebased onto
  master 5ba7f167f after the judged sims; the prereg commit re-hashed
  a01fb86da → 585f10255, and the corpora's `anchorCommit` fields still
  read a01fb86da19f — the pre-rebase hash recorded at sim time, not a
  mismatch). The safe-commit
  index clobber hit on the prereg commit (file shown staged-as-deleted
  after a correct commit); repaired with the HEAD-blob cacheinfo,
  verified `git status` empty + `git diff HEAD` empty.
- Fix + proof test + both corpora committed 8fc971f4b (rebased tip;
  pre-rebase hash cd574afc); the safe-commit index clobber hit again
  on that commit (16 corpus files + test staged-as-deleted, game.js
  MM, worktree byte-identical to HEAD throughout) and was repaired the
  same way (`git ls-tree HEAD | git update-index --add --index-info`,
  verified `git status` clean except this evidence file + `git diff
  HEAD` empty). This evidence file committed separately as the
  follow-up commit so its FIX-COMMIT line could carry the rebased
  hash. Proof re-run after the rebase: 21/21 green.
- Fix commit: 8fc971f4b.
- Judged corpora: `evidence/2026-11-06/perseed-wanderspawn-a-before/`
  (8 files, 0 instrument errors) and
  `evidence/2026-11-06/perseed-wanderspawn-a-after/` (8 files,
  0 instrument errors).

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
congtrace blank (1) is now closed with a landed fix, not just a named
one: wanderer-cast wave-4+ monsters are born at def HP, the spurious
1-round kill shape is gone from the band, and the finale nodes share
the fix. The funnel is honestly lower than it looked — one of the
band's three wave-4 kills was never real — and the binding link is
still wave-4 kills achievable in the wild, now measured without the
contamination.
