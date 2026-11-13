# sim-silentvanish-b — CHECK-FIRST: finding #2308 VOICED JOIN, SILENT VANISHING

Run `fleshout-loop-b-20261113T1530Z` (continuation), Loop B, axis winnability
chain. Check-first root-cause arm on finding #2308 (sim-findings.md):
on seed 190392 d137 a curious wanderer is taken in via the visitor-invite
path — both join lines fire, the roster grows 3→4 (`visjoin_136`) — yet
daily roster snapshots show 3 again by d138, and no say line in d137–139
was reported to mention the newcomer leaving or dying.

**Verdict: ANSWERED. No build.** The removal path is named, reproduced on
current master, and honest: the newcomer — hydrated name **Grace** — is
killed the next day by a wild monster (Loud-Eyes, the Eulogy) in a real
fight, and her death IS said aloud, by name, on the day it happens
(twice) plus once more in the next day's digest. The finding's "silence"
is a sampling artifact twice over: the track filter's verbs miss the
death line's verb ("killed"), the descriptor ("wanderer") never appears
in a death line (the hydrated name does), and the whole join→death arc
fits between two daily roster snapshots, so snapshots alone can never
see it. No code changed; no balance panel (§15) applies — there is no
before/after to compare.

Canon: no canon doc covers roster join/leave narration specifically
(closest: docs/CONVERSATIONS.md, docs/PARTY.md). The standing rule that
bears on this arm is "No silent actions — every action narrates honestly,
including failures" (docs/CANON.md). No canon invented here.

## 1. The case, pinned on current master (48ed1ffd7)

Branch rebased onto master 48ed1ffd7 before any judged sim (clean move,
no commits yet; `git log --oneline -1` verified). Seed 190392,
`scripts/silentvanish-d137-full.js` (full unfiltered say stream d136–139
+ visitorInteract/removeVillager call-site wraps):

**Join — d137** (`visitorInteract(vis_mgpspl2d, invite)`, roster 3→4,
added `visjoin_136`, hydrated name Grace):

- `A curious wanderer grins wide. Haven grows by one.`
- `👋 The village didn't wait for you — a curious wanderer was taken in around the fire. Another pair of hands.`

Both lines are the finding's lines, verbatim, on the finding's day.
Grace is a person the same day, not a ghost: d137 `Grace traded
something with someone for something else. The barter economy stirs.`;
d138 `Grace sets out to find Olivia. "Won't be long." Company makes the
road shorter.`

**Death — d138** (`removeVillager(visjoin_136, killed)`, name Grace):

- Call site: `hurtVillager` (game.js:8358) ← `resolveWildMonsterEncounter`
  (game.js:20962) ← `villagerMonsterTick` (game.js:20786). A wild-monster
  encounter on the road, resolved blow-by-blow; the Eulogy narrates
  `Grace faltered` three times as the fight runs.
- Fallen record: `{ villagerId: visjoin_136, day: 138, cause: 'monster',
  name: 'Grace', monsterId: 'eulogy', monsterName: 'Loud-Eyes' }`.
- The join is at betrayal.js:3440–3441 (`visjoin_` + day, roster push,
  `ensureRosterPerson` hydration); the death is the ordinary lethal-hurt
  pipeline (game.js:8358: `registerDeath` → `removeVillager('killed')` →
  `seedGossip('death')` → fallen push), with the "LETHAL HURT IS DEATH
  (2026-10-08): no silent roster vanishes" comment on it.

**Voiced — by name, on the day, twice, plus the digest:**

- d138: `📖 The Codex turns a page on its own. Grace is dead. You didn't ask. It knew.` (corpses.js:986, `codexDeathSync`, attunement-2 death sync)
- d138: `📖 The entry for Grace is finished. No more pages.`
- d139: `💀 The Loud-Eyes killed Grace in 3 rounds. The village mourns.` (fieldFights.js:2911, the `vDie` line, delivered through the "While you were gone" away-news digest, game.js:8918)

## 2. Why finding #2308's evidence could not see the voice

Two independent artifacts, both in the voicejoins arm's track instrument
(`~/workspace/scratch-loopb-1430/voicejoins-d137-track.js`):

1. **The filter misses the verb and the name.** It kept only lines
   matching `/wanderer|visjoin|dies|dead|gone|leaves|walks|taken in/i`.
   The digest line says "killed Grace" — "killed" matches none of
   dies/dead/gone/leaves. The Codex line says "Grace is dead" — that
   *would* match "dead", and it fires d138 on current master; on the
   voicejoins arm's master (7ffbecad4) the trajectory had already
   diverged (different join days, different deaths), and the track
   report shows no such line — the Codex sync is gated on a corpse +
   attunement 2 (corpses.js:981–988), so whether it fires is
   run-dependent. What is run-independent is the digest line, and the
   filter could never have caught it. Death lines also never use the
   descriptor: they name the hydrated person ("Grace"), never "a
   curious wanderer" — searching for "wanderer" in a death line is
   searching for a word the game never puts there.
2. **The snapshots bracket the whole arc.** The daily snapshot is taken
   once a day at the policy's daily point. The join lands *after* the
   d137 snapshot and the death lands *before* the d138 snapshot, so the
   roster reads 3 at d137 and 3 at d138 on every snapshot — the 3→4→3
   exists only at the call site. A snapshot instrument structurally
   cannot see a join-then-die-within-a-day arc; only the call-site
   wraps in `silentvanish-d137-full.js` / `silentvanish-band.js` can.
   (The plain `silentvanish-d137-check.js` rerun confirms it: roster 3
   on d134–d139, `visjoin_126` present throughout, `visjoin_136` never
   in any snapshot.)

## 3. Removal-path inventory (code survey, before the band)

Every roster-mutation site in `src/js`, audited:

| Site | What it is | Voiced? |
|---|---|---|
| `removeVillager` (betrayal.js:1080–1165) | THE choke point. All `how` values (`killed`, `ambushed`, `exiled`, `fled`, `splinter`, `tribute`, `relay`) filter the roster here. Voices nothing itself except the mentored-death line and the exile crisis; call sites voice. | Via call site |
| `hurtVillager` lethal branch (game.js:8358) | World damage death: `registerDeath` → `removeVillager('killed')` → death gossip → fallen. **Grace's path.** | Yes — Codex sync + gossip + fallen |
| `villageLives` wound deaths (game.js:29085) | `registerDeath` → `removeVillager('killed')` → grief line if present, else away-news queue. **Ximena's path** (`💀 Ximena is gone. The wound was too much.`). | Yes |
| `tbVillagerFalls` (game.js:40166) | Turn-based field-fight death: fallen push + direct roster filter, no `removeVillager` call. Fight narration owns the voice. | Via fight |
| `_cxKillContestant` (contests.js:6073–6076) | Calls `removeVillager('killed')` first, then filters directly (belt & suspenders). | Via removeVillager call |
| `party-formal.js:584–585` | Split-fight death: `registerDeath` → `removeVillager('killed')`, direct filter only if that throws; voiced line follows. | Yes |
| `party.js:1438` | Fled betrayer after a duel: direct filter, no `removeVillager` call. Needs a betrayal arc — a day-old newcomer cannot be there. Audited, not implicated. | Yes — duel lines |
| `membership.js:1074–1087` (`villageEats` wrap) | Filters roster to members *during* the meal call, restores live + withheld after (dead stay dead). Not a removal. | n/a |
| `crowdingTick` (membership.js:313) | Over-cap: trust −1 only. Removes nobody. | n/a |
| `safetynets.js:247` | Local filtered copy for a pantry check. Never written back. | n/a |
| `game.js:2458, 10292` | Setup / restore. Not runtime removals. | n/a |

No cleanup pass, roster cap, visitor expiry, or exile sweep takes a
newcomer anywhere in the code. The only same-day-ish removal a joiner
can meet is death in the world, and every death path in the table
voices by name.

## 4. The probe band (8 seeds, 150d, competent) — 0 silent exits

Driver `scripts/silentvanish-band.js`: call-site join wraps
(`visitorInteract` / `arrivalTick` / `_vaAdmitPetitioners` with roster
diffs) + `removeVillager` / `tbVillagerFalls` / `_cxKillContestant`
wraps with stacks + full say capture retained for event-adjacent days.
Corpora in `evidence/2026-11-13/perseed-silentvanish-b/` (8 files, 5.5 MB
total). One mid-run instrument fix: the first band launch was killed
before any seed completed when the `tbVillagerFalls` wrap was found to
take a fighter object, not a vid string (nothing logged for that site);
fixed, committed (3f26d316f), band re-run clean. No data lost.

| seed | days | end | scale | maxWave | standing | joins | leaves | vanish ≤1d | silent |
|---|---|---|---|---|---|---|---|---|---|
| 190391 | 65 | village-lost | regional | 4 | 145 | 0 | 12 | 0 | 0 |
| 190392 | 143 | village-lost | regional | 4 | 199 | 7 | 19 | 1 (Grace, voiced) | 0 |
| 190393 | 126 | village-lost | regional | 4 | 199 | 13 | 24 | 0 | 0 |
| 190394 | 128 | village-lost | regional | 4 | 199 | 6 | 17 | 0 | 0 |
| 190395 | 150 | survived | regional | 4 | 199 | 6 | 9 | 0 | 0 |
| 190396 | 140 | village-lost | regional | 4 | 199 | 7 | 19 | 0 | 0 |
| 190397 | 135 | village-lost | regional | 4 | 199 | 4 | 16 | 0 | 0 |
| 190398 | 139 | village-lost | regional | 5 | 370 | 9 | 21 | 1 (Theodor, voiced) | 0 |

**Band totals: 52 call-site joins, 137 leaves, 2 vanish-within-a-day
(both voiced), 0 silent leaves.** No instrument errors on any seed.

- **Theodor (190398)** is the band's second same-class case and it
  strengthens the verdict rather than weakening it: joins d138
  (`app_mgpspl8a282`, application arrival), dies d139 in the Influencer
  fight via `playerDeath` (ledger.js:767) — the same day the scholar
  dies and the mantle passes to him — and his death is voiced at
  length the same day: `📖 The Codex turns a page on its own. Theodor
  Eberhard is dead.`, `🕯️ Theodor Eberhard is dead — the wild. The
  village stops. Somebody screams. Somebody else starts digging.`, plus
  the mantle-passing lines naming him.
- **Removal-path mix (band):** 137× `removeVillager:killed`, 1×
  `removeVillager:ambushed` (190396 d30, Jorge Silva, `simNpcAmbush` ←
  `springAmbush`, betrayal.js:1064 — voiced, in the 0-silent count).
  Zero removals via `tbVillagerFalls` or `_cxKillContestant` as the
  logging site, zero `fled` / `exiled` / `tribute` / `splinter` /
  `relay` in the band. Every removal in the band went through the
  choke point.
- **Wart observed, not chased:** on 190397, Rosa Mendez is logged
  removed twice on d135 through the identical `playerDeath` path
  (ledger.js:767 twice). One death, two `removeVillager` calls — the
  dedupe in the driver counts it once, and the roster is correct
  either way, but a double removal call for one death is worth a look
  the next time anyone is in `playerDeath`. Filed here, not chased
  (out of this arm's scope; no silence results from it).

## 5. Wall numbers

Band (8 seeds, 150d, competent): national **0**, table **0**, wins
**0**. Wave-5 unlocks **1/8** (190398 only), wave-4 unlocks **8/8**.
Survived **1/8**, village-lost 7/8. Median survival **137d**. The scale
wall stands unchanged — this arm built nothing and moved nothing (and
was never scoped to). Same wall numbers as the voicejoins band on the
same seeds.

## 6. Village assessment (plain words)

Haven on seed 190392 is a three-person village holding on by its
fingernails: Olivia, James, and Ximena, with strangers drifting in and
dying almost as fast. Grace walks in on day 137, trades with someone
that same afternoon, walks out to find Olivia the next morning — and
meets the Eulogy on the road. She lasts one day. That is not a bug in
the roster: it is the world being what it is, a place where a new
arrival can die the next morning. What matters is that the village
says so: the Codex marks her dead the same day, the fire hears the
whole story the day after. A join that doesn't stick is still a join
when the village remembers the name — and here it does, twice over.
Theodor's story on 190398 is the same shape with the volume turned up:
he arrives, fights beside the scholar the same day, inherits the
mantle, and dies holding it — and the village stops, screams, and digs.
Nobody vanishes. Everybody is mourned by name.

## 7. Metric review

Prereg (`scripts/sim-silentvanish-b-prereg.md`, committed 9e484ff92
before any judged sim): primary metric = removal path named with code
citation + instrument reproduction on current master; GO = path named
+ reproduced, and if a fix lands, after-leg join sticks or exit voiced
AND probe-band survival/wave byte-identical; a miss is NO-GO, never
re-scored. **The metric held as written.** The d137 event reproduced
exactly (join d137, removal d138, same seed, same days, same monster
family), the path is named with citations (§1, §3), and the honest-path
branch of the prereg applies: the wanderer died in a fight that was
said elsewhere (twice on the day, once in the digest), so the verdict
is ANSWERED and no fix was built. No re-scoring happened: the band's
0-silent result is corroboration, not a substitute metric. One
metric-review note for the NEXT run: a finding whose evidence is a
regex-filtered say sample must be re-checked against the FULL say
stream before it becomes a build arm — the same lesson as finding
#2290, one arm later, with a different filter doing the same damage.
The proof pattern that catches it cheaply is the call-site join +
removal tracer in `silentvanish-band.js`: snapshots alone cannot see a
same-day join→leave arc, so any future "silent vanishing" claim needs
the tracer, not a snapshot diff.

## 8. Blanks filled and findings (surfaced, not chased)

- **Blank (finding #2308): ANSWERED, not fixed.** The voiced join's
  exit is an honest, voiced death: wild-monster kill d138, Codex sync
  + digest by name. No code changed. Proposed annotation text for the
  coordinator (do NOT edit sim-findings.md from this arm — see §9):
  `[ANSWERED 2026-11-13 by Loop B arm sim-silentvanish-b, run
  fleshout-loop-b-20261113T1530Z (continuation): the removal path is
  named and reproduced on current master — the newcomer is Grace
  (visjoin_136, hydrated name), killed d138 by Loud-Eyes (the Eulogy,
  monsterId eulogy) in a wild encounter: hurtVillager (game.js:8358) ←
  resolveWildMonsterEncounter (game.js:20962) ← villagerMonsterTick
  (game.js:20786) → removeVillager('killed'); her death IS voiced, by
  name, on the day — '📖 The Codex turns a page on its own. Grace is
  dead.' (corpses.js:986) plus '💀 The Loud-Eyes killed Grace in 3
  rounds. The village mourns.' in the d139 digest (fieldFights.js:2911).
  The finding's evidence was a regex-filtered say sample whose filter
  misses the verb 'killed' and the hydrated name, and daily snapshots
  bracket the whole join→death arc (join after the d137 snapshot, death
  before the d138 one). Band (190391–190398, 150d, competent): 52
  joins, 137 leaves, 2 vanish-within-a-day, 0 silent. No fix. Evidence
  evidence/2026-11-13/sim-silentvanish-b.md.]`
- **Wart (observed, not chased):** `playerDeath` calls `removeVillager`
  twice for one death (190397 d135, Rosa Mendez, ledger.js:767 twice).
  Harmless to the roster (idempotent filter), but a double removal call
  deserves a look next time anyone is in `playerDeath`.

## 9. Convergence

**Converged for this arm's question:** the check is decisive — the
removal path is named with code citations, reproduced by instrument on
current master, and the exit is voiced by name on the day it happens;
the band finds zero silent exits in 137 leaves. The winnability-chain
axis itself remains open (wall numbers §5). The arm leaves no branch
work behind except this evidence file, the prereg, the three instrument
scripts, the band driver, and the 8 per-seed corpora; nothing awaits
landing except the coordinator's merge of those files plus this
evidence file. The coordinator annotates finding #2308 from §8 (this
arm does not edit sim-findings.md, to avoid a same-file conflict with
the sibling arm).

## 10. Run notes

- Rebase: branch moved 3f5191e4b → 48ed1ffd7 before any judged sim
  (clean, no commits yet; verified `git log --oneline -1`).
- Write flap: host EPERM episode ~16:59–17:00Z during setup (two `cp`
  failures; flap-watch log confirms the same window); writes probed OK
  immediately after and the copy succeeded on retry. No work lost.
- safe-commit index clobber: struck on all three commits in this arm
  (files showed staged-deleted, once `MM`); repaired each time with
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  and verified `git status --short` empty + hashes match HEAD. Commits
  themselves were always correct.
- Instrument fix mid-run: the first band launch was killed before any
  seed completed (the `tbVillagerFalls` wrap took a fighter object, not
  a vid string); fixed and committed (3f26d316f), band re-run clean.
- `check.js --quick`: not re-run — no `src/js` changed (check-first
  arm, same standing as sim-voicejoins-b); two sibling gates were live
  when checked (sim-namelessadm-b, sim-steeple-a), and the brief's rule
  is to never run two gates concurrently. The deliverables are scripts
  + evidence only, none on the green list.
- Commit list (branch sim-silentvanish-b): 9e484ff92 (prereg +
  d137 instruments), 639b7e3bf (band driver + d137 full-stream check),
  3f26d316f (band driver wrap fix), 05aa4ce5a (evidence + corpora).
