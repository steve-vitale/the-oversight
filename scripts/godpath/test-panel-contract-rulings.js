#!/usr/bin/env node
'use strict';
// Panel contract rulings (Steve 2026-10-24): 665 table counts sittings, 753
// deaths split into village + player series. Pure collector mappings — no game
// loaded, no sim run. The real-panel neutrality proof is refreshed separately
// (scripts/balance-proof.json) because the contract digest changed.
const K = require('./lib'), T = K.reporter('panel contract rulings'), B = require('../balance-panel');
// 665: the `table` metric counts sittings (row.entered), not invitations.
T.ok('an invitation without a sitting does not count as table progress', B.tableSitting({ table: 1, entered: 0 }) === 0);
T.ok('a prompt seat counts even when no waiting invitation was observed', B.tableSitting({ table: 0, entered: 1 }) === 1);
T.ok('a run that neither waited nor sat counts zero', B.tableSitting({ table: 0, entered: 0 }) === 0);
T.ok('a run that waited and sat counts once', B.tableSitting({ table: 1, entered: 1 }) === 1);
// 753: playerDeaths = player-flagged character only; villageDeaths = all deaths.
let d = B.deathMetrics({ 'player:starved': 2, 'villager:eaten': 3, 'monster:slain': 5 });
T.ok('player deaths count only the player-flagged character', d.playerDeaths === 2);
T.ok('village deaths count every recorded death', d.villageDeaths === 10);
d = B.deathMetrics({});
T.ok('a deathless run has zero village and player deaths', d.playerDeaths === 0 && d.villageDeaths === 0);
d = B.deathMetrics({ 'player:slain': 1 });
T.ok('a lone player death appears in both series (the documented overlap)', d.playerDeaths === 1 && d.villageDeaths === 1);
d = B.deathMetrics(null);
T.ok('missing death records read as zero, not a crash', d.playerDeaths === 0 && d.villageDeaths === 0);
T.done();
