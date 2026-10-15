# Simulating The Oversight — how to measure a change

The simulator is the best tool we have for answering "what does this lever
actually do?" This page is the short manual. The audit behind it is
`evidence/2026-10-14/simulator-audit.md`.

## The one rule

**Compare, never eyeball.**
- Run the same seeds, days and policies **before** and **after** a change, and
  read the difference.
- One run is an anecdote. Use at least 8 seeds; use 16 when the effect is small.

## Policies (bots)

| Policy | Use it for |
|---|---|
| **`capable`** | **Default for lever work.** Flees for real, uses abilities, scores choices (no "always option 0"), takes the Table seat at day 90+, holds conversations, climbs the scale ladder |
| `competent` | Legacy baseline. Can't flee, never uses abilities, never answers the Table. Use only to compare against old evidence |
| `winseek`, `leadcourt`, `socialite`, `kind`, `oraclev2`… | Niche behaviours (see `scripts/policies/README.md`). Note: `kind` currently behaves like `competent` |
| `zero`, `mvc`, `leader` | Do-nothing baselines |

Policies draw randomness from their own seeded stream
(`global.__policyRandom`), so changing a bot doesn't change the game's luck.

## Commands

```bash
# The standard before/after table (8 seeds x 150 days)
SEEDS=7,42,99,1234,555,777,2026,31337 POLICIES=capable DAYS=150 \
  OUT=evidence/<date>/<label>.json node scripts/sweep-compare.js

# What silently fails, and what never runs (seeds x policies, about 1 min)
SEEDS=7,42,99,1234 POLICIES=capable,competent DAYS=150 LABEL=<label> \
  node scripts/sim-audit.js

# Any sim, with swallowed errors reported
SIM_CATCH=1 node <your-sim>.js
```

## Reading the sweep table

| Column | Means |
|---|---|
| `won` | Runs that won at the Table |
| `medD` / `maxD` | Days survived (median / max) |
| `maxWave` | Highest wave **unlocked** (not necessarily fought) |
| `nat%` | Reached national rank |
| `inv%` | Was **invited** to the Table (`tableWaiting`) |
| `sat%` | Actually **sat** at the Table |
| `delib/d` | Deliberate player actions per day |
| `deaths` | `player:<cause>` = the bearer died; `<kind>:<cause>` = everyone else. Captured live, never truncated |

## Telemetry you can count

Sims keep the **full** stream (`Game.state.telemetry`). The phone keeps only
300 events; that cap doesn't apply to sims.

**Milestones** (`src/js/telemetry-hooks.js`):
- Table: `table_entered`, `table_path`, `table_failed`, `table_won`
- Progress: `arc`, `scale_rank`, `ascension`, `village_lost`
- Builds: `ability_used`, `synergy_active`

**Also:** `death`, `combat_start`, `combat_end`, `contest_end`,
`ability_granted`, and the rest listed in the audit.

Count them in an `extraMetrics(Game)` hook passed to `runComparison` (see
`scripts/sweep-compare.js` header).

### Gear and feature-use audit

`node scripts/gear-usage-audit.js --label <name> --n 16 --days 150 --par 4`
records actual acquisitions by source (contest, show, package, trade, craft,
and each corpse kind), including tier, armor/weapon fields and beam resistance.
Use `--policies merchant,maker,caregiver` for livelihood probes and `--n 64`
for balance comparisons. `--root <frozen-checkout>` runs identical current
observer code against frozen game/policy sources; reports include hashes.

Starting gear, equipping/transferring an owned item and taking a successor's
pack are not earned prizes. The observer excludes those transfers; corpses
remain separate from monster drops. Method calls are reachability evidence,
not universal success counts. Inspect policy counters/errors and pair this
with `sim-audit.js` coverage. Use the real `Game._fullStatus` when proving UI
inventory behavior: the default simulator intentionally slims `status()`.

The census also records `crafts` (attempts and actual successes per recipe)
and `recipeAccess` (highest knowledge, known samples, materials-ready samples).
Knowledge samples include succession; readiness can be missed between samples.
These fields distinguish an unused output from unknown recipes or missing
materials. They do not classify each failed attempt. The observer's 100-day
on/off state-hash proof covers this additional sampling.

## Pitfalls (each one has bitten us)

- **Never run two games in one node process.** Use separate processes;
  `sim-audit.js` shows how.
- **Don't read the bearer's state *after* `tbEnd` / `endDay` / `playerDeath`**
  when a death could have happened inside. A successor has replaced them.
  Snapshot before the call.
- **Single-seed tests are fragile.** If a test needs a specific seed to reach
  some state, pin the state directly instead.
- **Stale green list?** Run `node scripts/check.js` before trusting a sim on
  changed code.
- **Big effects that were silently off are now on.** Forage yield, 23 relic
  perks, villager flank/War Cry, aid fights and more. Compare against
  post-2026-10-14 baselines only.

## Windows checkout

The shared harness reads script order from `index.html` without a shell. Some
older proof scripts still use `grep`/`head`; run the complete legacy net with
the installed Git for Windows tools in the current PowerShell process:

```powershell
$env:ComSpec = 'C:\Program Files\Git\bin\bash.exe'
$env:PATH = 'C:\Program Files\Git\usr\bin;' + $env:PATH
node scripts/check.js --jobs 4
```

`.gitattributes` keeps source and fixture text in LF: several legacy audio
and UI tests extract actual functions by newline boundaries. Syntax-check
probes use `execFileSync` where Windows paths must be passed as arguments.
