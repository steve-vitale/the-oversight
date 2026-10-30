# sim-armorfetch-b — the vessel fetches their own stashed armor

Run: oversight-flesh-out-loop-b, arm sim-armorfetch2-b, axis food-economy.
Successor to sim-stashfetch-b (landed 21efcdcb2): that arm fetched the
vessel's own best stashed WEAPON; this arm mirrors it for ARMOR (tracker
next blank 4). Game-code arm: ONE new method + ONE call site. Main tree
never touched. Sibling trees never touched.

## Prereg (binding, committed BEFORE any judged leg in content)

evidence/2026-10-30/sim-armorfetch-b-prereg.md — primary metric armor
acceptance, GO iff WORN-or-FETCHED on >= 2/3 acceptance seeds
(16103 swat_vest torso P35, 16101 bark_armor torso P10, 16109
farstrider_boots shoes P12), window first 7 game days; cost bar
village-lost <= baseline+1 (baseline 1/16) AND median daysAlive >= 0.8x
baseline median (baseline 60, capped); horizon 60d death-aware;
recorder band 16101–16116, pilot 16101–16108, confirm 16109–16116.

FLAP DISCLOSURE (read before judging the commit order): the container
EPERM write flap blocked every git commit for the whole run (safe-commit
private-index writes in /tmp, then git object writes), and blocked node
fs writes (see below). The prereg FILE was authored before any judged
sweep and never edited after — sha256
6cce52d30cb33d0632844c8b326c14478ba6bcebba1afbf34b1cb22fe6fd729c
recorded at authoring time; verify it against the committed file. The
commits land in prereg-first order once writes recover, but their
timestamps postdate the sweeps. The prereg CONTENT is unchanged; only
the git timestamps are flap-delayed. This is stated, not hidden.

## Verdict — GO (3/3 WORN, cost bar holds)

The fix: `Game.vesselArmorFetch()` (src/js/villager-build.js), called
from `villagerBuildDay()` immediately after `vesselStashFetch()` (the
endDay sleep path — live play and sims, no policy change). Once a day,
at haven (`playerAtHaven()`, same teleport guard as the weapon fetch),
the vessel fetches their own best stashed ARMOR into the pack when it
beats what they wear in its slot (empty counts as beaten). Own stash
only, at most one armor fetch per day, narrated via Game.say + a
`vessel_armor_fetch` tele record. Wearing stays on the normal path
(policy gearUp in sims, player UI in live play): the fix OFFERS the
choice, it does not force the wear. Nothing granted, nothing generated.
The armor fetch carries its OWN day flag (`_armorFetchDay`) so it can
never block the landed weapon fetch on a night both apply — every
seed's day-1 narration shows BOTH lines firing the same night (weapon
line, then armor line). The weapon-fetch code path is untouched: the
diff is +77 lines, 0 deletions.

## Armor ordering (from code, not invented)

Per-slot `def.armor.protection` via `equipment.slotForItem(def)` — the
gear path's own reading (`equipment.equipScore` scores a body-slot item
at protection*10; villager-build `_slotValue` reads
`def.armor.protection`). Only items with `def.armor` qualify (head-slot
non-armor curios like pot helmets are excluded). Among stashed armor
beating its slot's worn protection, the fetch picks the LARGEST GAIN
(candidate minus worn in its slot, tie-broken by higher protection —
villagerGearDay's "biggest gains first" armory rule). A full-set torso
is compared by its set protection; the fetch only moves the piece to
the pack, so no set-breaking decision is made by this fix — gearUp/UI
decides the wear. Proof-test case B2 pins the gain ordering (worn
torso P30 + stashed vest gain 5 vs boots gain 12 -> boots win).

## Before/after numbers (identical seeds, recorder band 16101–16116, 60d)

Before-leg = the stashfetch after-corpus (pre-armor code, identical
substrate: nighttravel + woodcarry, WOODWARM=0, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1): its morning snapshots show
stashed armor NEVER entering the scholar kit within 7 days on any
acceptance seed (analyzer: 0/3, all NO-GO with null stash-loss/kit/eq
days). After-leg = the verdict driver below (same substrate, same
seeds, same window).

| seed | spawn stashed armor | BEFORE (7d) | AFTER: narration / stash-loss / kit / equipped | verdict |
|------|---------------------|-------------|--------------------------------------------------|---------|
| 16103 | swat_vest torso P35 | never / never | day 1 / day 2 / day 2 / day 2 | WORN |
| 16101 | bark_armor torso P10 | never / never | day 1 / day 2 / day 2 / day 2 | WORN |
| 16109 | farstrider_boots shoes P12 | never / never | day 1 / day 2 / day 2 / day 2 | WORN |

Acceptance 3/3 WORN — the strongest tier, above the >= 2/3 bar. The
full band is 16/16 WORN: every seed's spawn armor (bark, gloves,
boots, rain shell, apron, flannel, running shoes) is narrated day 1
and worn day 2. Non-torso slots work (hands, shoes), not just torso.

Band cost bar: village-lost 0/16 after vs 1/16 before (bar: <= 2) —
HOLDS; median daysAlive 60 after vs 60 before (bar: >= 48) — HOLDS.
Max wave 3 both legs, never 4+. Wins 0/16 both. Single-seed movement
worth one line: 16103 flips village-lost day 37 (before) to survived
60 (after) — trajectory shift from the code change (RNG stream + early
P35 armor), same class as stashfetch's note; the COUNT bar is what
binds, and it holds.

## Flap adaptation: verdict driver replaces the corpus (disclosed)

The full recorder (scripts/armorfetch-trace-b.js, a faithful copy of
hatchequip-trace-b.js with only the say filter extended to fetch lines
and the outdir changed) ran the 8-seed pilot correctly, but the flap
turned all 8 corpus writes into 0-byte files; its in-memory retry loop
held the data until the process was reaped, so the corpus JSONs are
unrecoverable (the 0-byte files were deleted, not committed). The
judged legs therefore ran through scripts/armorfetch-verdict-b.js: the
SAME substrate, policy stack, snapshot shape, and verdict function
(stash-loss + kit/eq within 7 days), but printing one JSON summary line
per seed to stdout and writing NO files. Pilot 16101–16108 and confirm
16109–16116 both completed exit 0 on this driver; the per-seed table
above is transcribed from that stdout. Consequence, stated plainly:
proof-test Part C (corpus assertions) cannot run without a corpus —
with the flap-killed 0-byte files deleted, Part C SKIPs while Parts A+B
pass 38/38 (including the post-restore re-run). The GO rests on the
verdict driver, not on Part C. The corpus-dependent claim is NOT made.

## Balanced panel (§15, supporting instrument)

- Before: evidence/2026-10-30/sim-armorfetch-b-panel-before/panel.json.gz
  (16 competent cases, seeds 16101–16116, 60d, fresh run on base code:
  villager-build.js temporarily restored to HEAD, then the armor change
  restored byte-identically, sha256-verified, proof test re-run).
- After: evidence/2026-10-30/sim-armorfetch-b-panel-after/panel.json.gz
  (16 cases; 11 cached jobs reused from the interrupted first attempt,
  6 freshly run). cases/ caches deleted before commit, never committed.
- Compare: evidence/2026-10-30/sim-armorfetch-b-panel-compare.md —
  decision review_required, with NO regression_signal on any metric.
  Notable moves: player deaths per run 1.4375 -> 0.9375, first bearer
  through day 60 0.2667 -> 0.4, community loss 0.0625 -> 0, village
  deaths per run 14.625 -> 13.8125 — all no_material_signal or
  descriptive, consistent with early armor helping survival without
  moving the wall. Table win/entry/sitting 0, national 0, unchanged.
- REPAIR NOTE: the first compare (against the reused stashfetch
  panel-after) came back INVALID — sibling policy files
  dissolveprobe-diag.js and fleepolicy-a.js landed after that panel
  ran, tripping the manifest check. They do not feed competent cases,
  but §15 says invalid comparisons must be repaired before
  interpretation, so a fresh before-panel was run from the current
  tree instead (above). The reused-panel compare was discarded, not
  interpreted.
- WATCH (investigated, not hidden): earned player tier-3+ weapon/armor
  access 0.5 -> 0.3125 and tier-3+ contest/show 0.3125 -> 0.125, both
  regression_watch with intervals including 0. No mechanism links the
  fetch to fewer tier-3+ grants: the fetch moves only already-owned
  spawn armor, touches no loot table, grant, or drop; per-seed gear
  call counts shift on 15/16 seeds (trajectory shift, same class as
  stashfetch's 0.5625 -> 0.5 watch). Flagged for the next run; per §15
  it does not override the prereg GO.

## Sense-test (law — read, judged for meaning)

Day-1 narration on all 16 seeds pairs the weapon line with the armor
line in the same voice, e.g. 16103: "You remember the Hatchet at your
space in the haven and fetch it — it rides in your pack now." /
"You remember the SWAT vest at your space in the haven and fetch it —
it rides in your pack now." That reads as a person collecting their
own things from their own space on the first night — the absurdity
stashfetch named for the hatchet, now closed for the vest sitting
beside it. The wear itself goes through the normal gearUp path (day-2
equipped in snapshots, no special-case line). PASS. One wrinkle worth
naming: the two fetch lines fire back-to-back every night both apply,
which is slightly pat ("remember the X... remember the Y...") — the
voice is consistent and honest, but a future pass could vary the
second line. Not a GO blocker; noted, not chased.

## Village assessment (plain words)

The village looks the same from the outside — same survival counts
(bar one flip), same wave ceiling — but the people in it stop being
absurd about one more small thing: a vessel who owns armor now puts
it on on the second morning instead of never. On 16103 that means a
P35 vest in fights from day 2 instead of bare skin for 60 days. The
blank filled is exactly the one stashfetch named, and no other blank
was chased mid-run.

## Blanks filled / documented

- FILLED (landed here): vessel armor-fetch — the named next fix from
  sim-stashfetch-b (tracker next blank 4).
- DOCUMENTED (not chased): the back-to-back fetch narration could vary
  its second line (see sense-test); the panel tier-3+ watch (see
  panel); the full recorder corpus is unrecoverable from this run
  (flap) — a future run with a healthy container should re-run the
  recorder to bank the corpus.
- DOCUMENTED (watch, not verdict): panel tier-3+ access dip
  (0.5 -> 0.3125, regression_watch, interval includes 0) — re-check on
  the next panel, do not tune against it now.

## Wall numbers

Recorder band (60d, 16 seeds): wins 0/16, village-lost 0/16 (before
1/16), median survival 60d (capped), max wave 3, never 4+. Panel on
the same band: table win 0, national 0, community loss 0 (before
1/16). Same wall as stashfetch: this arm fills a gear-access blank,
it does not move the scale on-ramp.

## Proof

- scripts/test-armorfetch-b.js: 38/38 GREEN Parts A+B (static wiring:
  method exists, called from villagerBuildDay next to the weapon fetch,
  own day flag, weapon flag untouched, weapon haven gate + tele
  intact; live harness, one loadGame, 11 fixture cases: unarmored
  fetch, gain ordering, better-worn blocks, weaker-worn allows,
  non-torso slot, away blocks, one-per-day, no-duplicate,
  object-form entries, no-grant, weapon fetch unaffected same day).
  Part C SKIPs with no corpus dir (the flap-killed 0-byte files were
  deleted, not committed) — see flap adaptation; the judged verdicts
  come from the verdict driver.
- Determinism note: the verdict driver re-ran pilot + confirm
  deterministically (same code -> same per-seed lines across the
  recorder pilot's in-memory run and the verdict runs where comparable:
  day-1 narration / day-2 wear on all seeds).
- Verdict driver: scripts/armorfetch-verdict-b.js (stdout, no files).
- Recorder: scripts/armorfetch-trace-b.js (faithful hatchequip copy +
  fetchLines); analyzer: scripts/analyze-armorfetch-b.js (before-leg
  verified 0/3 NO-GO on the stashfetch corpus).
- Panel: before/after panel.json.gz + compare .md (cases/ deleted).
- Base-restore proof: before-panel ran on HEAD villager-build.js;
  restoration sha256-verified to 28ab74e965489b7a2bc12b4f216453e4f186146d1b73c4e6b2407b3db635db0b
  (the pre-panel hash), diff +77/-0, proof test re-run green (A+B).

## Metric review

Pre-registered metrics bound this run and were honored: acceptance
3/3 WORN beats the >= 2/3 bar at the strongest tier; cost bar holds on
both legs (lost 0 <= 2, median 60 >= 48). No re-scoring occurred. Two
instrument revisions are proposed for the NEXT run, not applied here:
(1) the verdict driver (stdout, no corpus files) should be the named
instrument when the container flap is active — it measures the same
quantities without depending on node fs writes; (2) panel-before legs
should be run fresh from the current tree, not reused across sibling
policy landings, since the manifest check invalidates reuse. The 7-day
window proved generous (everything landed day 1–2); a future run could
tighten it to 3 days without changing this verdict.
