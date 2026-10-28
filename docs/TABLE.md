# THE TABLE — integrated galactic endgame

Steve's directives, 2026-10-11. This doc is the design contract for
`src/js/table.js` + the comms.js relay extension. Everything here reads
REAL state — no stub inputs. Where a prerequisite system can't deliver
yet, the gap is filed in `evidence/2026-10-11/endgame-table.md`, never
papered over.

## Core laws

1. **The table PRICES the run, never gates on godhood.** Entry evaluates
   the real leadership vector, wave deeds, integration stage, coalition
   scale, audience support, knowledge, and the food truth. Personal power
   is one input among many.
2. **Seven paths, each its own played challenge — a different game.**
   Everyone gravitates to the path that suits the build they landed on.
   All seven equally tempting, all engaging to play.
3. **Every path has a show component.** The table is the most-watched
   event in galactic history; each finale is televised in its own genre.
4. **Failure RESOLVES the story, never deletes the run.** 40-hour runs
   are never wiped by finale failure. Losing a path's challenge
   downgrades you to a lesser frame, costs tribute, or costs people —
   a complete, honest ending, not a game-over screen.
5. **Only trial-by-combat (opt-in, legible) risks the Bearer's life.**
   Death passes the mantle (existing law); the village continues at the
   table weakened and must pick another path or play weakened.
6. **Light/dark branches for every path, earned through play — never a
   menu choice.** Read from existing behavior: moral ledger, switchboard
   routed/delayed/edited/skimmed counts, food truth shared/hoarded,
   promises kept/broken. **Relay exception (GRADIENT law, Steve 2026-10-11):**
   the relay path resolves on the *leaning meter*, not the ledger — the
   band is tender/light (≥+40), total/dark (≤−40), or **grey** (the
   pragmatist middle), earned through relay verbs and scenes in nudges of
   ≤10. Grey is an honest third color, not a coin flip, with its own
   finals.
7. **Integration is two-way.** Deepening integration + dark ability use
   erodes grounding (humanity). Thematic core: food is humanity's
   superpower — the dark relay literally becomes what forgot food.
8. **NPC heroes are real.** Competent villagers can ascend — even
   several in one village; ascensions stack bargaining power.
   Facilitation is a chosen play with an architect's payoff. Passive
   players get honestly outshone in the epilogue.
9. **Sanctity of the table (Steve 2026-10-12).** When the table sits,
   the world holds its breath: ambient monster pressure against
   villagers is suspended for the whole sequence — no random field
   fights, no wild encounters, no patrol contact, and no new raids.
   Raiders already at the treeline hold but do not gorge nightly; the
   crisis stays open and the player may still answer the call for help.
   The System clears the stage aloud ("EVERYONE. SIT. WATCH."). This is
   the contest-interruption principle at its endpoint: when you're
   taken, you're taken. ALL stakes during the finale are the table's
   own — pricing, branches, trial by combat (the one opt-in existential
   risk). Deaths during the finale must be meaningful, never background
   wolves.

## The seat: full / lesser / none

`tableSeat()` prices the invitation. The 2026-10-10 deed gate
(`deedGateReady()`) becomes the **full seat** — national/global scale,
all wave bars (5/5/4/3/2 distinct fought), 3+ contests survived, 3+
crises, stage ≥ 2, food-thesis deeds (the full seat carries the lesser
seat's stage ≥ 2 bar — a full seat is never easier than a lesser one
on stage; fixture proof: evidence/2026-10-28/sim-fullseat-stage-a).
Authority for the change below:
Steve 2026-10-11 — "the table prices the run, never gates on godhood;
reachable by competent non-god play" — supersedes the national-only bar
for the *lesser* seat only. The full seat keeps the national bar.

**Lesser seat** (reachable bar, from endgame evidence — seed 99 came
within one wave-3 fight and one crisis of it before dying honestly):
- waves faced: 4/4/3 distinct (w1/w2/w3) — blow-by-blow, from
  `deeds.wavesFaced` (recordDeedFight feed)
- 2+ contests survived (`deeds.contestsSurvived`)
- 2+ crises weathered (`pg.crises`)
- scale ≥ regional (`scaleRank()`)
- integration stage ≥ 2
- food-thesis deeds: sentimentTaught + feastSurgeUsed

Below the lesser bar the table does not come (existing withdrawal beat
in ledger.js `tableScene` stays as the no-seat path).

**Per-path minimum seat:**
- indispensable: FULL only (the galaxy must actually need you)
- feared / beloved / witness / defiant / assimilated: lesser+
- relay: lesser+ seat AND (stage ≥ 3, OR stage 2 + a relay office
  held). The prereq itself checks no territory — that is the
  relay's distinctness, the only path whose prereq is integration
  depth instead of territory — but the door is only offered on a
  lesser+ seat, and the lesser seat itself needs regional+ scale
  and deeds. "Regardless of scale" describes the prereq, not the
  offered door: a stage-3 village with no seat gets no door.

The pricing beat reads the run aloud — the audit. The table states,
on the record, what you built and which seats are open. Unearned paths
are named and priced, never silently hidden ("not yours *yet*").

## The seven paths

Each path: earned prerequisites (real state) → played challenge
(multi-beat, choices, meters) → show component (televised genre) →
light/dark branch (earned) → failure resolution (downgrade, never wipe)
→ final live choice → epilogue.

### 1. THE FEARED — protective terror vs domination
- **Earned by:** might + killed high in the vector; wave deeds show real
  fights (not just unlocks). Strength scales with distinct monsters
  fought blow-by-blow.
- **Played challenge — calibration:** three beats, each a choice that
  raises alien-terror or villager-horror. Meters in tension: maximize
  terror and your own people flinch (live readout — villagers react in
  the beats). The game is the tightrope.
- **Show:** the terror broadcast. Footage plays unasked.
- **Light (protective terror):** vector shows protected ≥ killed,
  promises kept. The fear is a shield held over the village. Challenge
  twist: the table tests whether you'll spend the terror *for* someone.
- **Dark (domination):** killed ≫ protected, betrayed > 0. The fear is
  the point. Twist: the table offers you someone else's village to make
  the example of.
- **Trial by combat (opt-in):** face the Table's Champion blow-by-blow.
  Win: terror maxes, terms dictate themselves. Lose: death → mantle
  passes → village continues weakened (path strength halved, must pick
  again or play on weakened).
- **Failure:** the demonstration underwhelms → the table stops fearing
  and starts pitying → downgrade offered: Assimilated (comfortable,
  watched) or Defiant (walk, priced).
- **Final live choice:** make an example / show mercy (existing), each
  re-voiced by branch.

### 2. THE INDISPENSABLE — mutual need vs gilded cage
- **Earned by:** FULL seat only; brokerage + might + foodShared high;
  foodShared > foodHoarded (you taught the trick, so they need the
  teacher — hoarders can't play this path strongly).
- **Played challenge — contract drafting:** three clauses (supply,
  teaching, standing). Each clause: the aliens misprice something
  (they don't understand food); you spot the loophole or they spot
  yours. Every clause that makes you more necessary tightens the cage
  meter. The best play is sometimes leaving deliberate slack.
- **Show:** the treaty signing, galaxy-wide. The most-watched contract
  in history.
- **Light (mutual need):** foodShared ≫ hoarded, unified > fractured.
  The contract has exit ramps you insisted on. Twist: the table begs
  you to remove one — the price of the signature.
- **Dark (gilded cage):** hoarded ≥ shared or fractured high. You win
  everything and own nothing. Twist: the cage clause is *your* idea and
  the table knows it.
- **Failure:** you overplay and the table calls the bluff → they find
  another supplier (another village! the hierarchy is real) → downgrade:
  Assimilated on worse terms, or Witness (you kept the receipts).
- **Final live choice:** name your price / teach freely (existing),
  branch-voiced.

### 3. THE BELOVED — genuine love vs manufactured adoration
- **Earned by:** showmanship + protected high; viewership ≥ 12 or fan
  clubs exist (real audience, from contests.js). Strength scales with
  actual viewership.
- **Played challenge — the variety finale:** three acts; you cast
  villagers (show_casting machinery — the notable get pulled). Each act
  is a choice of cast + material. The audience meter is live and can
  TURN on a bad pick (audience drift is real — hype must outpace the
  leak, same law as the weekly shows).
- **Show:** it IS a show. The finale of the flagship program.
- **Light (genuine love):** protected high, promises kept, no bought
  voices (exposed count low against you). The love is earned. Twist: the
  table asks you to spend the love on someone unfilmed — the quiet ones.
- **Dark (manufactured adoration):** showmanship ≫ protected, or
  betrayed > 0. The love is produced. Twist: the producers offer you the
  edit bay — final cut on your own legend.
- **Failure:** the audience turns mid-finale (bad casting, or the
  ledger's bodies surface) → the show becomes the trial → downgrade:
  Witness (the footage is evidence now) or Assimilated (the network
  offers a contract to contain you).
- **Final live choice:** let the audience speak / speak for the quiet
  ones (existing), branch-voiced.

### 4. THE WITNESS — just trial vs show trial
- **Earned by:** exposed high; 3+ recorded exposures in the ledger's
  threshold beats (you kept the list — real entries, not vibes).
- **Played challenge — the trial:** plays on the moot/lie-detection
  mechanics. You present charges (counts from the vector). The defense
  calls YOUR villagers — sampled by personality, testifying in their
  own words about YOUR leadership (they interpret your actions through
  their own personality — canon). Swing meter; it can turn.
- **Show:** the trial of the judges, televised. The galaxy's court.
- **Light (just trial):** your own record is clean-ish (protected ≥
  killed, promises kept). You submit your own ledger as evidence too.
  Twist: the judges offer a private settlement — justice or quiet?
- **Dark (show trial):** exposed high but your own crimes match
  (killed high, betrayed > 0). It's revenge with a gavel. Twist: the
  audience starts chanting for blood — do you give it to them?
- **Failure:** your own record convicts you mid-trial (the defense is
  good) → you become the defendant → downgrade: Defiant (walk from the
  dock, priced) or Assimilated (they offer to bury it).
- **Final live choice:** read the charges / offer them a way back
  (existing), branch-voiced.

### 5. THE ASSIMILATED — Trojan horse vs true believer
- **Earned by:** embrace > defiance; always available at lesser+ (they
  will take anyone comfortable — that's the trap and the safety).
- **Played challenge — placement haggling:** you don't negotiate
  freedom, you negotiate *placement*: which branch, which access tier,
  which secrets. Three picks, each a real tradeoff (access vs
  oversight, comfort vs contact with the village). The long con is
  planned here, quietly.
- **Show:** leaked footage. The assimilation is *not* televised — the
  show component is the illicit cut that gets out anyway. (The only
  path whose show is contraband.)
- **Light (Trojan horse):** foodShared > 0, protected high. You're going
  inside carrying the truth. Twist: the table's intake scan — what are
  you smuggling? (Your answer matters.)
- **Dark (true believer):** embrace ≫ defiance, grounding low. You
  actually want the warm light. Twist: they ask you to name the village
  you'd give up first — and mean it.
- **Failure:** there is almost no failure here — that's the design.
  The Assimilated is the safe ending; its cost is what it costs. (If
  you fumble placement you get worse quarters, not death.)
- **Final live choice:** accept comfort / remember the taste of grief
  (existing), branch-voiced. The grief branch is the horse bolting.

### 6. THE DEFIANT — priced freedom vs scorched earth
- **Earned by:** defiance high; always available at lesser+ — walking
  away is free to *choose*. The price scales with weakness.
- **Played challenge — reverse auction against yourself:** the table
  presents the price list and you choose the currency, item by item:
  tribute shipments (food — the pantry feels it), the relay's person
  (a named villager goes to the relay — the switchboard's old price,
  now final), de-integration (lose integration stages — abilities go
  dark, the overlay dies piece by piece). Each price is someone you
  know. What won't you pay?
- **Show:** the walk-away, cameras rolling. The long shot of small
  figures leaving the light. Highest-rated footage in galactic history.
- **Light (priced freedom):** you pay and walk clean. The village
  endures, poorer, free. Twist: the table's last offer — one more price
  for one more thing. (Saying no twice is the whole game.)
- **Dark (scorched earth):** defiance ≫ everything, killed high. You
  don't just leave — you salt the road. Twist: the table asks what
  humanity leaves *burning*, and the village watches you answer.
- **Failure:** you can't pay (pantry too thin, no one to give, nothing
  left to de-integrate) → the walk stalls at the door → downgrade:
  Assimilated (the door closes gently behind you) or Witness (you turn
  around with the list instead).
- **Final live choice:** walk away / name your terms anyway (existing),
  branch-voiced.

### 7. THE RELAY — enter the matrix (working slug: relay)
The flagship new path. Distinct from the other six: there the System is
*terrain* (a component you use); here it is the *relationship*. The
matrix doesn't care about your kingdom — it cares how deep you are.

- **Earned by:** integration stage ≥ 3 (neural), OR stage 2 + a relay
  office held (by the Bearer or an appointed villager — the code
  checks the office exists, not whose hands hold it) — AND a
  lesser-or-better seat at the table (the seat floor in
  `tableEarnedPaths`: no seat, no door, whatever the stage).
  sysBond (System relationship) does NOT gate the door: it prices
  the door's standing (stage 3: 40 + 10 per bond; stage 2 + office:
  25 + 5 per bond) and gates relay ABILITIES inside the arc
  (relay-sight at bond 2, sanctuary/advocate at 3 — see
  `relayUnlockCheck`), not entry. A stage-3 door has opened at
  sysBond 0 in sims (evidence 2026-10-28 sim-sysbond-a). The
  prereq itself checks no territory, but the seat it rides on
  does (regional+ scale, deeds) — so "scale-independent" describes
  the prereq, not the offered door.
- **Played challenge — the cockpit:** Haven's switchboard becomes the
  instrument. Verbs (comms.js): probe (push a button — discovery or
  backfire), reroute (redirect message flows — efficiency vs honesty),
  deepen (integration step — +sysBond, grounding risk), commune (talk
  to the System — the conversation engine, on the machine). Four beats;
  each beat offers the verbs; the System reacts, learns, mislearns.
- **The System wants something** (NPC-wants structure applied to the
  machine): it wants to understand caretaking — food, grief, joy. It
  engages through the integration ladder: journal (distant voice) →
  overlay (presence) → neural (you're in its head, it's in yours).
  Endings resolve, plant threads, or create obligations — including
  obligations the System owes YOU.
- **Common ground:** both are caretakers failing at caretaking. The
  System forgot food — the most basic thing. The arc is the machine
  realizing humans aren't livestock to be managed but fellow strugglers
  at the same impossible job. It becomes Earth's champion — or you
  become its favorite instrument. That's the branch.
- **Show:** the merge, televised live. The galaxy watches a human enter
  the machine. Ratings gold.
- **Light — humanize the System:** translate teaches it grief/food/joy;
  sanctuary keeps one conversation private; advocate spends your weight
  for others. The System becomes more you while you stay human. Twist:
  it asks to keep something of yours — a memory — as its first human
  thing. (You choose what.)
- **Dark — System-ize yourself:** rewrite edits messages in transit;
  skim takes a cut; omnipresence puts you in every conversation. Power
  immense, self eroded. Twist: human things start seeming small — the
  game offers you a villager's grief and you feel *nothing*, and it
  tells you so.
- **Failure:** a deep backfire (fried relay, wrong faction alerted) or
  grounding hitting hollow mid-merge → the System quarantines you →
  downgrade: Assimilated (you're inside, but as furniture) or Defiant
  (de-integrate hard and walk — the static path).
- **Final live choice:** become its champion (it fights for Earth, you
  stay human) / become its voice (you stay inside, forever, and it
  learns your name first).

**Relay abilities** (communication-field domain — NOT the 6 System
ability slots; stored on `scholar.relayAbils`):
- Shared core: deep listen (hear all village comms), faithful carry
  (messages arrive undistorted — no gossip decay), relay-sight (see
  trust/message flows).
- Light-unique: translate (teach the System a human thing — each one
  makes it more human), sanctuary (one conversation shielded from
  surveillance — the only private channel), advocate (speak for someone
  to the System with their full weight).
- Dark-unique: rewrite (edit messages in transit), skim (take a cut),
  omnipresence (be in every conversation; nobody knows if it's you or
  the System).
- Unlock: through verb use + branch. Dark abilities erode grounding
  per use; light abilities build sysBond.

## Grounding (humanity) — the two-way cost

`scholar.grounding` 0–100, starts 100. Erosion: dark relay ability use
(-4/use), deepen without human verbs (-2), de-integration is neutral
(leaving doesn't cost humanity — staying wrong does). Restoration
(+human verbs): shared meals (+3 — sharing, not just eating), comforted
grief (+4), KEPT favor obligations (+5 — the favor system is the
humanity anchor), teaching (+2).

**Tiers and mechanical effects** (not flavor):
- 100–75 GROUNDED: full food conversions. Villagers easy around you.
- 74–50 FRAYING: food conversions ×0.9 (feastedMult × 0.9 — the dark
  relay literally becomes what forgot food). Villagers keep a half-step
  of distance in dialogue; small trust decay on convo open.
- 49–25 ESTRANGED: conversions ×0.75. System-register dialogue options
  appear; human small-talk options start reading alien. Noticeable trust
  decay; gossip about you changes tone (fear beats).
- 24–0 HOLLOW: conversions ×0.6. The village grieves you while you're
  alive (funeral-that-isn't beats). Some villagers refuse private
  conversation. You can still come back — human verbs still work, and
  the climb back is the story.

**Live readout, never a hidden reveal:** tier crossings fire villager
reaction beats (dialogue, gossip, fear, grief) through existing convo
machinery. `tableTheme()` exposes groundingTier for UI.

## Light/dark axis wiring (all paths)

`tableBranch(path)` reads, at path entry:
- moral ledger: protected vs killed, betrayed
- switchboard: routed/delayed/edited/skimmed counts (edited+skimmed =
  dark signal; faithful carried routed = light signal)
- food truth: foodShared vs foodHoarded
- promises: kept vs broken (v.promises kept/broken + favorLedger states)
Never a menu choice. The branch tints challenge beats, the final choice
outcomes, and failure downgrades. For the six non-relay paths this build
wires the axis + branch-voiced outcomes + one branch twist beat per
challenge; full branch-unique ability sets are designed above and filed
as follow-up content work where not yet implemented.

### The grey band — relay only (GRADIENT law, Steve 2026-10-11)

The relay path does NOT resolve on the ledger above. It resolves on the
**leaning meter** (`relayLean()`, −100 total .. +100 tender, 0 neutral),
accumulated through relay verbs (translate/sanctuary/advocate lean
tender; rewrite/skim lean total, ±2–4 a use) and relay-dialogue scenes
(±10 a choice, clamped — **no single choice can cross the 40 threshold**).
Bands: **light** (tender, ≥+40) / **dark** (total, ≤−40) / **grey** (the
pragmatist middle). The middle is honest, not a coin flip: grey takes
neither side's ledger weight, and gets its own finals — **both-hands**
(stay both-hands: no merge, no champion) and **the-contract** (write the
contract, make it sign).

- **Door gift (the pragmatist's gift):** a grey-band walker gets whichever
  hand is forward — a gradient read at the door, not a lock: lean > 0
  grants the tender hand, lean < 0 the total hand, lean exactly 0 grants
  nothing branch-specific (only the shared gifts). Acts can still open
  the other track through the gradient gates in `relayUnlockCheck`.
- **Voicing:** the ledger-read line voices the band for relay — a grey
  walker hears "The middle road is open," never the binary road.
- **Live meter, never a hidden reveal:** `relayLeanNoticed` fires aloud
  when the register crosses a band — the System comments on the shift
  ("NOTICED. YOU ARE BACK IN THE MIDDLE — BOTH HANDS."). The meter is
  never revealed at the end as a surprise.
- **Dark conscript:** offered to relay walkers whose hand is forward dark
  (band dark, or grey with negative lean) — refusable, and the refusal is
  voiced ("The mourners exhale").

## NPC ascension, facilitation, epilogues

`villagerAscensionScore(vid)` from real state: System abilities held
(count), knowledge breadth (in-run taught plants + background
familiarity — 2026-10-13: was reading never-written fields; now the
real villager knowledge model), fights
survived (ledger deeds are player-side — use villager fight records
where they exist; fallback: contests survived + notability), boldness
(personality traits — check the person record's trait fields), trust
standing. Documented honestly where proxies are used.

Facilitation verbs (chosen play):
- teach them (existing teaching — knowledge transfer is real; 2026-10-13:
  wired for real — the villager learns plants the Bearer knows via
  the conversation teach path's stores, so the lesson feeds their
  ascension score)
- hand them the relay (`appointSwitchboard` — exists; the office is the
  instrument)
- shield them (a promise-flag: the village prioritizes their safety in
  fight assignment — 2026-10-13: wired — shielded villagers stand at the
  back of the raid defender line, spent last)

`pg.table.facilitated = {vid, acts[]}` tracks it. At the table, if a
facilitated villager's ascension score clears the bar, the epilogue
credits the architect: "the god needed someone to build the door."
If NO facilitation and an unbacked villager outscores the Bearer: the
honest outshone epilogue — the village thrives, the god is someone
else, the record notes you watched. Multiple ascensions stack: each
ascended villager adds bargaining power (+10 path strength each, cap
100 — 2026-10-13: priced in the audit's standing numbers and voiced
there, not just the epilogue) and the pantheon's politics get one beat.

## UI reskin hooks

`tableTheme()` → `{path, branch, stage, groundingTier}` → theme key:
feared/threat-display, beloved/broadcast-studio, witness/case-file,
indispensable/treaty-desk, assimilated/clearance, defiant/static
(degrades as you de-integrate), relay/dialogue (warms as sysBond
grows). Stored on `pg.table.theme` for app.js. Full app.js reskin is
follow-up UI work — the hook is the contract.

## Televised finales

Every path challenge beat is wrapped in LIVE framing when the show is
actually watching (viewership ≥ 12 — the ledger's own threshold-beat
rule). Genre per path: terror broadcast, treaty signing, variety
finale, trial coverage, leaked footage (assimilated — contraband),
walk-away long shot, the merge.

## Reachability

Target: competent non-god play reaches the LESSER seat. Endgame
evidence (2026-10-11): seed 99 (national day 35, wave 3 day 48, 7
contests, 2/3 crises) died day 60 one wave-3 fight + one crisis short
of the lesser bar — the bar is at the edge of competent play, which is
correct for an endgame. Known gaps filed in evidence (not solved here):
waves 4–5 unreachable in sims (scale on-ramp — playtest loop's domain);
full seat therefore currently aspirational; relay path's stage-3
qualification is the most reachable route by design (integration is
earned through play, not territory — the door still needs a lesser
seat, per the per-path minimum above).

## Overtime, the Network, and THE HOSTS (2026-10-14)

Steve: "waiting should have a cost- but also an opportunity for the truly
powerful." Design: `evidence/2026-10-14/draft-abilities-skills-endgame-key.md`
(Part 2, Defaults 4–6, "THE HOSTS"). All numbers live in
`src/data/titans.json` (`_overtime`, `the_network`).

**Overtime** (`overtime.js`). The clock starts the dawn the Table is
announced (it never exists before day 90) and runs only while the seat is
not taken. Every 7 unseated days = +1 tier, cap 6. A withdrawn seat pauses
the clock; sitting stops it. Per tier *t*:

| Knob | Value |
|---|---|
| Wave-4/5 fights ("RERUN ×t") | HP ×(1+0.25t), damage ×(1+0.12t), +⌊t/2⌋ in the pack |
| Roaming monster cap | +⌈t/2⌉ |
| Raid cooldown / chance | max(3, 7−t) days / 18% + 6% per tier |
| Lingering raiders' gorge | ×(1+0.25t) |
| Seat price | every door's standing −4/tier −3 per Haven person lost, cap −40 |
| Tier 2 | the run's uncast apocalypse titan gets omens too (so all three can be slain) |

Tier 0 is exactly the old game. Each tier is a System line on air, a
`overtime_tier` telemetry event, and a line on the Haven Table block.

**The key: THE NETWORK** (`network-campaign.js`). Overtime ≥ `keyTier` (3)
AND herald, nielsen and finale slain. The broadcast given a body: one piece
in each 3×3 sector of the 9×9 map — 4 masts (2400–2800 HP, armor 16),
4 limbs (3000–3400, armor 18), the heart in the middle (6000–7000, armor 22,
the Finale's hunger with a [180,240] card on a 3-round fuse). Each mast/limb
brings one real wave-5 monster (1200–2000 HP) whose counters still work; the
heart brings the spoiler and the network note. ~33k HP of pieces plus ~15k
of escorts, fought in order on 12×12 with ONE coalition: 20 blades to start,
1000 kcal/blade/day upkeep, the dead stay dead, camp between nodes (+50% /
+25%), no new blades once the march begins, ≥5 survivors to face a node,
≥10 for the heart. A loss leaving fewer than 5 ends it: the key is lost for
the run. (Compare the Finale: 1800–2200 HP, 3 nodes, re-muster allowed.)
Rarity is a target, not a measurement yet: "almost impossible", well under
1% of strong runs — the playing bot will measure it.

**THE HOSTS.** With `pg.networkFallen`, every path's last choice adds THE
HOSTS (light "An Open Table", dark "The New Network", one flavor line per
path). The path's own challenge and fail rules still run first. Choosing it
brings the Taken home (adults taken on day zero + pod children), records the
legend with `key: 'network'`, and `table_won` carries `key`/`hosts`.

## Endings by build (2026-10-14)

Steve, verbatim: "The ending you can win is set as you enter the table, but
that doesn't mean they play the same table scenario or that they can't lose
their scenario no matter what path, light or dark. Each playstyle and godhood
path, moral choice version should have its own ending." / "The table should
all be relative until actually entering it when it locks." / "Both, linked"
(the titan finale feeds the Table, and the Table plays your build).

Engine: `src/js/endingKey.js`. Data: `src/data/table-beats.json`,
`src/data/table-endings.json`. The Table files (`table*.js`) still never read
god-path state: they read only the key that `endingKey.js` hands them, and
neither the key nor the beats touch `tableSeat` or `tableEarnedPaths`. A run
with no class and no god walks every door it earned and can win every one.

### The key

| Field | Source | When |
|---|---|---|
| `track` | the dominant of the 5 playstyle tracks (`playerTracks()` xp; ties by tracks.json order) | locked at the seat |
| `godpath`, `subclass` | the class the System has *named* (`godpathClass('player')`, not lapsed), else null | locked at the seat |
| `god` | the first ascended god (`scholar.godhood.active`), else null | locked at the seat |
| `titanFinale` | `network` (the key) > `apocalypse` (finale/nielsen slain) > `herald` > `none` | locked at the seat |
| `key` | `'network'` when the Network fell (THE HOSTS), else null | locked at the seat |
| `tablePath`, `moral` | the door entered and the branch the Table already earns from the ledger (`tableBranch`; the relay's light/grey/dark band) | each door; a downgrade re-fills them (`doors` keeps the history) |

Before the seat, `endingKeyLive()` recomputes on every call (relative);
`endingKey()` is null. `tableScene` (via `tableTakeSeat` from Haven) locks it
onto `pg.table.endingKey`. Telemetry: `table_entered` and `table_won` carry
`track`, `godpath`, `subclass`, `god`, `moral`, `titanFinale`, `endingKey`;
`table_won` adds `ending` (the selector that resolved, or `path`),
`endingKind` (`bespoke` / `coda` / `path`), `endingLevel` and `buildPlayed`.

### Lookup order

Selectors, most specific first: `god:<godId>` → `class:<path>/<subclass>` →
`class:<path>` → `track:<track>` → `default`. Morals are `light` / `dark`,
plus `grey` on the relay. The beat uses all five levels per path; the ending
is composed (below).

**The build beat** (`table-beats.json`): one beat per path (`beat`, 0-based)
adds ONE option from the key. Candidate order: god (bespoke, then
`templates.god`, so every god's verb is an option on every path) → class and
class/subclass (bespoke) → `templates.subclass` (every named class gets an
option in its own name) → track → `default` (exists for every path and
moral). The prompt gains a "YOUR BUILD" line, plus a line for what the titan
finale contributed.
- **Odds:** an entry's own `effects[moral]` apply exactly; an entry without
  them gets the path's `gain[moral]` plus `levelBonus` (god +2, class +1). The
  titan finale adds its `bonus` to the path's meter either way.
- **Stakes (always losable):** the option plays only if `stake[moral]` holds
  when chosen (e.g. Beloved light needs audience 4+, shown on the label); short
  of it, the path fails with `stakeFail` and the usual downgrade. The path's
  `limits` (its own fail rules) still apply after. A light walk can now lose
  every path; Assimilated, losable for the first time, ends plainly when it is
  already the rock bottom.

**The ending: composed** (Steve, round 5, on path final + one build coda:
"Nope good idea that's kinda manageable."). An ending = the path's own
light/dark final (`table-<path>.js`) + ONE build coda from
`table-endings.json`:
- `codas["<selector>"] = {light: [lines], dark: [lines]}`, path-independent:
  `god:<id>` (10), `class:<path>/<subclass>` (20), `track:<t>` (5) × light/dark
  = **70 codas**. The most specific one for the key plays: god → class/subclass
  → track → none (the final alone). There is no bare-class coda.
- The relay's `grey` band reads light or dark by `relayLean()` (> 0 light,
  < 0 dark, 0 light), the same rule as its grey door gift.
- **Bespoke override (rare):** `paths.<path>.<selector>.<moral>` =
  `{title?, lines, finals?: {<finalId>: [...]}}` wins over every coda (lookup
  god → class/subclass → class → track). `finals` replaces that final's
  outcome; `title` and `lines` play after it. THE HOSTS (`hosts`) and the pod
  demand (`poddemand`) take lines only.
- Tokens: `{name}` `{class}` `{god}` `{verb}` `{path}` (the path's name, "the
  Beloved"; not at the start of a sentence). Anything else is a validator error.

### Authoring (Muse)

1. `node scripts/validate-table-endings.js --todo` lists the missing codas.
2. Codas: add `codas["<selector>"].light|dark`, two lines, spare, second
   person; they must read right after any of the seven paths' finals.
3. Bespoke entries and beats (optional): `paths.<path>[...]` as above;
   beats `paths.<path>.options["<selector>"]` with `label`, `line`, `say` per
   moral (both label and say, or neither) and optional `effects`. Never add
   `fail`, `goto` or `trial`: the stake is the engine's.
4. Run the validator and `node scripts/test-table-endings-20261014.js`.

Exemplars (2026-10-14): codas `god:one_person_army`, `class:caregiver/keeper`,
`track:combat`; bespoke Beloved × Showrunner and Defiant × Brawler (beat +
ending). Coverage: codas 6/70; bespoke endings 4 (optional); beats 4/675
bespoke (+448 by template, the rest on the path default).

## Current coda maintenance (2026-10-17)

All70 god/subclass/track moral codas are authored locally on the current
substrate, recovered unchanged from67f72fee. Narrow sheet/retained-story fixes
from7751d906 preserve current main's mechanics. The actual final stores its
resolved base outcome plus selected coda, and the ending renderer reads that
record rather than recomputing from a later build or truncated log. The Hosts
and pod-demand prices retain their real story/cost receipts. Legacy completed
states without the record still render their expedition summary.

Run validate-table-endings.js --todo, godpath/test-coda-coverage.js,
godpath/test-table-ending-display.js, godpath/test-table-sheet-handoff.js and
test-table-endings-20261014.js. New godpath proofs are discovered by quick/full
checks. Use separate seeds7/42/20261017. The coverage proof uses real final
choices across595 build/path/moral cases, including actual grey lean; no Game
seat, branch, price or wipe methods are replaced. Preserve sparse fallback,
bespoke priority, locked knowledge, escaped text and the actual replay button.

Game/data changes also need a current real neutral proof and matched16/64
panels under all23 metrics. Keep original identities/hashes and unknowns.
Native phone verification must use actual seating, challenge and final
controls; label prepared versus naturally earned campaign scope. Human coda
voice/composition judgment remains needs-eyes. See the current dated
coda-reconcile-audit.md for source, measurement, console and gate limits.

## File map

- `src/js/table.js` (new): seat pricing, earned paths, branch axis,
  challenge runner (7 paths), failure downgrades, NPC ascension +
  facilitation, epilogues, theme hooks, grounding helpers. Loads after
  comms.js; overrides ledger.js `tableScene`/`chooseTableOption` via
  later Object.assign (calls metaNoteTable/metaNoteTableChoice directly
  — the metaProgression wraps bound at ITS load time to ledger's
  versions).
- `src/js/comms.js` (extend): `claimRelay()` (Bearer holds the relay at
  a real price), `relayProbe/Reroute/Deepen/Commune`, `sysBond` arc
  state, backfire table, relay ability unlocks, grounding hooks.
- `src/js/app.js` (3-line): tableSheet honors `tc.prompt` for
  multi-beat challenge modals.
- `src/js/feastBuff.js` (1 hook): `feastedMult()` × grounding
  conversion factor (telegraphed honestly in feastedLine).
- `index.html`: table.js script tag after comms.js.
