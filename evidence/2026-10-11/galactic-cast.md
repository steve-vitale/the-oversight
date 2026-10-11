# Galactic cast scaffold — stages 1-2 (2026-10-11)

Steve's directive: "throughout the tv shows and contests, we learn about galactic characters more and more until we are fighting them as aliens, producers, at the galactic table etc. this completes our world building scaffold."

## What was built

**New module `src/js/galactic-cast.js`** (loaded before contests.js): per-run registry for the five personae — Vex Marlowe (trophy hunter), Countess Sable (collector/arsonist), Sarge (veteran), Dr. Fenwick (xenobiologist), Pip Quindle (extreme tourist). ids match `src/data/alienPlayers.json`; display names resolve from `apPersona()` at runtime.

Arc stages: 0 unknown → 1 heard → 2 seen → 3 faced → 4 known. Monotonic (never decreases).

**Show integration** (`fireShow` in contests.js): one sponsor card or flavor mention per show.
- Stage-0 persona whose show-domain matches → sponsor card naming them ("Tonight's exhibition is brought to you by Marlowe Expeditions…"), advancing to stage 1 (heard) + `met_on_show` flag.
- Stage ≥1 persona in-domain → occasional flavor mention ("Vex Marlowe is in the audience tonight…").
- Domains: Vex = hunt/wilderness (stare_down, who_moved_it, mystery_smell, mouth_race); Sable = galas/spectacle (rose_ceremony, makeover, karaoke, dance_off, talent_pit, museum_of_you); Sarge = veteran/military (stare_down, talent_pit, who_farted, small_claims); Fenwick = documentary/specimen (mystery_smell, museum_of_you, how_to_human, crib_mine, lost_found); Pip = audience-cam/tourist (infomercial, karaoke, nap_wars, tiny_door, complaint_box, crib_mine).
- Frequency discipline: 5-day per-persona cooldown, 50% sponsor chance, 35% mention chance. Recurring, not spammy.

**Contest integration** (producer-twist machinery in contests.js):
- `castProducerDemand()`: generic twist fallback now comes SIGNED by a known persona (stage ≥ 1) with a characterful demand — Vex wants risk/spectacle, Sable drama/beauty, Sarge discipline, Fenwick data/novelty, Pip footage. Signed notes advance the persona toward stage 2 (seen) + `interfered_contest` flag. At stage 0 the same notes arrive unsigned ("the producers").
- `_cxDossierLine` wins≥4 ("The producers have a file on you now…") can arrive signed via `castSignOff()`.

**Knowledge gating**: `castDisplayName(pid)` returns the real name only at stage ≥ 1, else "a sponsor"/"the producers". No stage-0 name ever reaches player-facing text (proven by test).

## Proof

- `scripts/test-galactic-cast.js`: 22/22 × 3 seeds (777001, 424242, 999001). Registry starts all-0; sponsor cards fire on domain match and advance exactly one persona 0→1; cooldowns hold; off-domain shows never fire; demands unsigned at 0 / signed at ≥1 with sign-off; signed notes advance toward 2; stages monotonic; show/contest paths can never reach stage 3+; displayName gates correctly.
- Regressions: ontology 75/75; test-shows-breakit-r16 22/22; test-contest-prize-lanes 52/52.

## Handoff: stages 3-4 (follow-up worker)

Stages 1-2 are live. The encounter and table systems need to drive 3-4 through the exposed API:

- `advanceCastStage(pid, 3, why)` — call when the player FACES a persona: `apStartEncounter(pid)` / `apStartGroupEncounter(pids)` in alienPlayers.js, and the reveal path `apRevealAlien(pid, how)` ("that wasn't human…"). Suggested `why` strings: 'alien encounter', 'persona revealed'.
- `advanceCastStage(pid, 4, why)` — call when the persona is fully KNOWN: after a completed encounter arc (fought + survived, or `apOnCombatEnd` with a decisive outcome), or when they appear at the galactic table (table.js / table-*.js). Suggested: 'faced and survived', 'met at the galactic table'.
- History flags available via `castFlag(pid, flag, val)`: `fought`, `beat_player`, `spared`, `killed` are the intended vocabulary — the encounter system should set these in `apOnCombatEnd` so the table layer can read them (a persona the player spared should act differently at the table than one they killed — kills are permanent per break-it r12).
- `castKnows(pid)` / `castStage(pid)` are the gates: encounter intros and table dialogue should name personae at stage ≥ 1, but can assume familiarity (first-name basis, callbacks to show/contest history) at stage ≥ 2. At stage 0 the encounter system already has its own reveal path — keep it; the cast registry is the cross-layer memory.
- Open design question for Steve: should a stage-3+ persona's show mentions change tone (e.g., Vex commenting on YOUR fight after you faced her)? The registry supports it (`castStage` checks in `castShowSponsor`); not implemented.
