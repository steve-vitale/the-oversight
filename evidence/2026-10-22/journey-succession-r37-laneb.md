# Journey-succession r37 (lane B) — "THE FUNERAL" (2026-10-22)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** r34 proved the handoff MACHINERY passes clean; r35 proved the
second life is a life (and found the trust trap — Steve's call, not re-litigated
here). The untested half of the leg: when the player character dies, does the
death→funeral→handoff arc land as a coherent, MEANINGFUL sequence in the wild —
the death beat, the village bringing the body home, the grave by the fire, the
vouching at the grave, the successor's burial act — and does the village
socially echo the dead bearer by true name? Or are there silent steps, dead
buttons, missing voices?

**Seeds:** 10001–10004 (fresh; r34/r35 re-used the 99xx trajectories).
**Policy:** competent. **Horizon:** phase A d1–9, scripted kill via the REAL
playerDeath ('a hushwolf') ~d10, post-death +14d of real competent play as the
successor. Death-aware stop. The funeral arc is observed in the wild; the
burial act is script-driven at d+3 (proves completable via the player-facing
API) AFTER recording whether the competent policy did it organically.

**Binding metrics:**
- M1 (funeral arc): >=3/4 deaths produce (a) the death beat naming the bearer,
  (b) recoverBearer within 2 days (grave dug, body brought home), (c) the
  burial act completable (payRespects + buryCorpse succeed, no 'Nothing to honor
  here'). Kill rule: >=2/4 deaths with NO recoverBearer → SUBSTRATE-MISSING.
- M2 (social echo): on >=3/4 seeds, >=2 true-name mentions of the dead bearer
  in VILLAGER TALK (conversation NPC lines + villager-speech say lines) within
  7 days of death — funeral-arc system beats excluded.
- M3 (machinery): 4/4 scripted mantles clean (linOk + moOk).
- M4 (people check): 0 identity failures across sense-read death/funeral
  transcripts (manual verdict, SENSE-TESTING LAW).

**Interesting-finding criteria:** (a) any funeral-arc step that never fires in
the wild → REAL blank; (b) the System's voice at the death — big brother +
chilling benefactor, genuinely believing it helps: does it speak, and does it
read as designed? (c) vouch-at-the-grave coverage: who speaks for whom, and
does a voiceless succession read hollow?

**Instrument:** scripts/journey-succession-r37-20261022.js (new; r35-derived:
phase A + scripted kill + harness, funeral-arc watchers, burial API drive at
d+3, organic-burial detector, echo scan, identity tripwire, convos at
d+3/d+7/d+14).

## What happened

| Seed | Death | Successor (trust) | M1 | M2 | M3 | End |
|------|-------|-------------------|----|----|----|-----|
| 10001 | DeShawn→Aaron d10 | Aaron (29) | GO | MISS (0) | GO | Aaron alive, 5 villagers |
| 10002 | Asher→Hermann d10 | Hermann (21) →Dwayne | GO | MISS (1) | GO | Dwayne, 10 alive; Hermann died d13 combat |
| 10003 | Harold→Ethel d10 | Ethel (30) | GO | MISS (0) | GO | Ethel alive, 9 alive |
| 10004 | Gerald→Jesse d9 | Jesse (21) | GO | GO (2) | GO | Jesse alive, 10 alive |

**M1: 4/4 GO.** Every death produced the full arc: the death beat (🕯️ line
naming the bearer + Codex page-turn), recoverBearer overnight ("That night,
they bring X home... the grave is dug by the fire, and the body is laid out
beside it. The filling of it is yours."), and the burial act completable via
the player-facing API (payRespects + buryCorpse succeeded on the recovered
corpse on all 4 seeds — no dead buttons). Fallen-ledger entries correct
(day, cause, name) on 4/4.

**M3: 4/4 GO.** All mantles linOk + moOk on current master.

**M4: GO (manual).** 13 transcripts sense-read (d+3/d+7/d+14 across all 4
seeds). 0 identity failures (tripwire 0 after excluding the honest burial
lines). The dead stay dead; the living are met as themselves.

**M2: 1/4 → MISS (as bound).** Villager-talk true-name mentions of the dead
bearer within 7 days: 10001: 0, 10002: 1, 10003: 0, 10004: 2. The echo is real
but RARE — see findings.

## Findings

### 1. The funeral arc is mechanically complete — and it reads (M1)
The death moment is the best-written sequence in the succession path: the
Codex turns a page on its own ("DeShawn Hogan is dead. You didn't ask. It
knew."), the candle line ("The village stops. Somebody screams. Somebody else
starts digging."), the System's chilling transfer voice ("MANTLE TRANSFER
DETECTED. ...Oh! New face! Same job! ... (That is a lie. We noticed. The
audience CRIED.)"), then overnight the village brings the body home and digs
the grave — "Nobody asks you to help carry; nobody has to." Desperate and
traumatic per the design rule, and the fiction holds: the death pack rides
home on the corpse, nothing auto-transfers.

### 2. The village's voice at the handoff is silent: vouching never fired (4/4)
The elders'-vouching beat ("At the grave, X speaks for Y") fired on 0/4
seeds. It requires a living villager with trust ≥60 in the office; the
inheritance lands successors at 21–30, and at d10 the village simply has no
trust-60 elders. Structural, not a bug: early-game successions are
voiceless — the handoff's emotional weight is carried entirely by the System
and the Codex, never by a villager speaking for the new bearer. Sense note
for the voice pass, not a defect.

### 3. Organic burial 0/4 — policy gap, not a game defect
The competent policy never buried the bearer on its own within 3 days on any
seed (respects: false, bury: false ×4). Root cause checked: the rite is
exposed in the UI (app.js:1740-1741, 1797-1798: "Say a few words" / "Bury
them" on the corpse detail) but the competent POLICY implements no bury
action at all — the bot cannot perform the rite, while a real player gets the
buttons. So the 0/4 is a policy-harness gap, not a game bug. Consequence for
sims: the funeral arc's downstream effects (payRespects −3 trauma,
observe('bury_dead')/('honor_dead'), grave-goods narration) are never
exercised by policy-driven runs — the arc is systematically under-measured.
Noted for the harness maintainers; no game change.

### 4. Social echo: thin but genuine — M2 MISS is the finding
When villagers speak the dead bearer's name, it passes the quality bar with
room to spare:
- Mere (10002 d+3): "Asher is gone and Hermann is gone. The fire doesn't
  care. That's what gets me — the fire doesn't care."
- Enrique (10004 d+7): "Gerald is gone and the world just... continues. That's
  the part I can't stand." / "I save the best bite for last for Gerald, now.
  Feels right. Feels like the least I can do."
- Enrique also dug up a pre-Scattering food stash (+1513 kcal) as a story beat
  with a real game effect — the kind of emergent content this leg should have
  more of.
But on 2/4 seeds there was ZERO villager-talk mention of the dead bearer in a
week. The grief template cadence (r34's carried blank) persists: Chloe and
Ntombi open with the verbatim "I keep expecting to see them by the fire. Then
I remember." — true feeling, one rhythm, unnamed "them." Rosa (10001 d+7)
circles "what's been happening" without ever naming it. Voice-pass candidate,
still.

### 5. CONFIRMED on current master: joint-foraging invitation dead end (r34 carry)
Ivy (10001 d+3): "Come forage with me tomorrow — two of us can fill packs."
→ "There is no playable joint foraging outing yet. Giving food does not
perform the promised outing." The honest dead-end disclosure still fires; the
NPC's want (a foraging partner) still can't be engaged. r34's design call for
Steve stands: make playable or stop inviting.

### 6. Minor: Codex page-turn beat fires per monster kill with no disambiguation
d10 10004: "The Codex turns a page on its own. Flashbulb Moth is dead. You
didn't ask. It knew." — twice, back-to-back. Context shows 2 moths were put
down in the same fight ("Miriam, Enrique, Blanca, Rafiq and Kiara met them at
the door — 2 put down, 3 driven off"), so the beat fired once per kill, not a
duplicate-firing bug. The issue is voice: two identical lines read as a
stutter; a count ("two Flashbulb Moths") would read better. Same template
reused for monsters ("Nightlight is dead" 10002 d21) reads odd for a beast.
Polish note for the voice pass, not a defect.

### 7. Trust-trap shadow (not this run's question, noted)
Successors landed at 21/21/29/30 again; 10002's Hermann (21) died d13 in
combat — 3 days into the tenure. The interaction Steve is deciding on
persists on current master. No action taken.

## Village assessment (plain words)

Four villages, four funerals, all held. 10001: DeShawn fell to the scripted
hushwolf d10 → Aaron (29); the village buried him by the fire and kept going
with 5 alive. 10002: Asher → Hermann (21) d10; Hermann died in combat d13 →
Dwayne steadied the village (10 alive); Mere grieved both by name. 10003:
Harold → Ethel (30), quiet, 9 alive. 10004: Gerald → Jesse (21); Enrique
saved Gerald's best bite and dug up a pre-Scattering stash for the village.
Every bearer got a grave; every grave got filled (by script, not by bot).
The villages that survived did so on rising trust — the office outlives the
office-holder, again.

## People check

13 transcripts sense-read. Verdict: villagers act like people, and the grief
is real when it has a name. Kiara's Spanish-only barrier exchange works as
designed. Chloe's moot/ambush-of-Aroha justice beat shows the village
governing itself. The failure mode is not robotic villagers but rare ones:
the dead bearer goes unnamed in conversation on half the seeds.

## Blanks filled / documented

1. DOCUMENTED (r34 carry, confirmed): joint-foraging invitation dead end.
2. DOCUMENTED (r34 carry, confirmed): grief template cadence — verbatim opener
   on two villagers, unnamed "them" for the bearer.
3. DOCUMENTED (new): vouch-at-the-grave structurally voiceless early (0/4).
4. DOCUMENTED (new): organic burial 0/4 — the competent policy implements no
   bury rite (UI has the buttons; the bot doesn't). Sims systematically
   under-measure the funeral arc's downstream effects. Harness note.
5. DOCUMENTED (new, minor): Codex "X is dead" beat for monster kills +
   same-day duplicate.

## Metric review

M2 as FIRST conceived (say-log true-name mentions) was a misfit of the same
class r35 hit: it counted the funeral arc's own system beats (bring-home,
burial lines) as "social echo." Revised in-instrument BEFORE the pilot runs
to villager-talk-only (convo NPC lines + Overheard/quoted villager speech,
funeral-arc beats excluded); under the honest definition M2 = 1/4 → MISS as
bound, and the miss IS the finding (echo is thin). No metric re-scored
mid-run. M1/M3/M4 held; no other metric proved wrong.

## Reachable / fun / winnable

- **Reachable:** the full funeral arc fires in the wild on 4/4 seeds with no
  player input for the village's part; the burial rite is completable via the
  player-facing API. A real player who dies WILL see this.
- **Fun:** the death moment reads — the System's chilling transfer line, the
  overnight body-bringing, "The filling of it is yours." When villagers speak
  the dead by name (Enrique, Mere), it's the best content in the leg. But the
  echo is rare (1/4 at bar), the grave-vouching never speaks, and the bot
  never fills the grave on its own — the funeral's social half is thinner
  than its mechanical half.
- **Winnable:** 4/4 villages alive at +14d with mantles clean; one 3-deep
  chain. Succession keeps the run going. The trust-trap shadow persists
  (Steve's call).

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: 3 LOUD lines, all
SCHEMA-MISMATCH (r37 JSON uses death.*/funeral.* paths, not deaths.bearer /
census.* — same as r35's note). Manual comparison:
- deaths.bearer: baseline 5 → current 5 (4 scripted + 1 organic) — no
  deviation.
- census.alive: baseline 49 → current 34 (0.69×, quiet; d+14 horizon vs
  r35's d+45; one village at 5 alive).
- census.fallen: baseline 10 → current 14 (1.4×, explained: 10002's
  double-succession + phase-A deaths).
**Baseline NOT rolled** (different horizon profile; all explained).

## Regression

- scripts/journey-succession-r37-20261022.js: 4/4 seeds complete, deterministic
  harness (seed-before-eval, full module list, window stubbed then deleted).
- `node scripts/check.js --quick` on the worktree: **281 passed, 6 failed**
  (712s). Failure classes, all pre-existing on master and unrelated to this
  tooling-only change (zero src/js; the new script is journey-*, not in the
  test glob):
  - scripts/test-offline-assets.js (1): "Stale offline assets" — confirmed
    individually; maintenance task (regenerate via build-offline-assets.js),
    not this lane's work.
  - scripts/godpath/test-phone-frame-proof.js (3): stale retained receipts —
    confirmed individually (3 passed/3 failed); the known phone-proof
    maintenance issue (r35 note), refresh via phone-frame-proof-update.js.
  - Remaining include measurement cache-flag isolation (test-measurement-
    cache-flags.js: 0/4 standalone) — environmental/pre-existing per today's
    lane reports; fails standalone on this box independent of any game change.
- `node scripts/check.js --only succession`: **11 passed, 0 failed** (134s) —
  the succession lane is green on current master.

## Design calls for Steve (carried + new)

1. (Carried, r35) The succession trust trap — successors at 21–30 starve on
   half rations. Still his call.
2. (Carried, r34) Joint foraging invitations — confirmed still firing.
3. (Carried, r34) Grief template cadence — voice-pass candidate.
4. (New) Vouch-at-the-grave voicelessness — is the silent handoff intended
   early, or should the village find SOME voice?
5. (New) Policy gap: the competent policy can't perform funeral rites — sims
   under-measure the arc's downstream effects. Harness maintainers' call.
