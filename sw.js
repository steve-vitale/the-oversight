/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'bcd1fd858-20261101-172425';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=bcd1fd858-20261101-172425",
  "./src/js/engine/modifiers.js?v=bcd1fd858-20261101-172425",
  "./src/js/engine/calories.js?v=bcd1fd858-20261101-172425",
  "./src/js/engine/day.js?v=bcd1fd858-20261101-172425",
  "./src/js/engine/forage.js?v=bcd1fd858-20261101-172425",
  "./src/js/engine/combat.js?v=bcd1fd858-20261101-172425",
  "./src/js/audio-registry.js?v=bcd1fd858-20261101-172425",
  "./src/js/text.js?v=bcd1fd858-20261101-172425",
  "./src/js/game.js?v=bcd1fd858-20261101-172425",
  "./src/js/encounters.js?v=bcd1fd858-20261101-172425",
  "./src/js/conversation.js?v=bcd1fd858-20261101-172425",
  "./src/js/convo-mood.js?v=bcd1fd858-20261101-172425",
  "./src/js/convoTopics.js?v=bcd1fd858-20261101-172425",
  "./src/js/naming-rite.js?v=bcd1fd858-20261101-172425",
  "./src/js/convo-wants.js?v=bcd1fd858-20261101-172425",
  "./src/js/convo-dialogue.js?v=bcd1fd858-20261101-172425",
  "./src/js/convo-beats.js?v=bcd1fd858-20261101-172425",
  "./src/js/convo-scene.js?v=bcd1fd858-20261101-172425",
  "./src/js/voice-piper.js?v=bcd1fd858-20261101-172425",
  "./src/js/voice-system.js?v=bcd1fd858-20261101-172425",
  "./src/js/examine.js?v=bcd1fd858-20261101-172425",
  "./src/js/equipment.js?v=bcd1fd858-20261101-172425",
  "./src/js/journal.js?v=bcd1fd858-20261101-172425",
  "./src/js/party.js?v=bcd1fd858-20261101-172425",
  "./src/js/favor-water.js?v=bcd1fd858-20261101-172425",
  "./src/js/favor-forage.js?v=bcd1fd858-20261101-172425",
  "./src/js/party-formal.js?v=bcd1fd858-20261101-172425",
  "./src/js/truth.js?v=bcd1fd858-20261101-172425",
  "./src/js/galactic-cast.js?v=bcd1fd858-20261101-172425",
  "./src/js/contests.js?v=bcd1fd858-20261101-172425",
  "./src/js/broadcast.js?v=bcd1fd858-20261101-172425",
  "./src/js/contestEngine.js?v=bcd1fd858-20261101-172425",
  "./src/js/alienPlayers.js?v=bcd1fd858-20261101-172425",
  "./src/js/storage.js?v=bcd1fd858-20261101-172425",
  "./src/js/perceive.js?v=bcd1fd858-20261101-172425",
  "./src/js/carexplore.js?v=bcd1fd858-20261101-172425",
  "./src/js/justice.js?v=bcd1fd858-20261101-172425",
  "./src/js/food.js?v=bcd1fd858-20261101-172425",
  "./src/js/betrayal.js?v=bcd1fd858-20261101-172425",
  "./src/js/corpses.js?v=bcd1fd858-20261101-172425",
  "./src/js/corruption.js?v=bcd1fd858-20261101-172425",
  "./src/js/lifeseed.js?v=bcd1fd858-20261101-172425",
  "./src/js/spawn-knack.js?v=bcd1fd858-20261101-172425",
  "./src/js/trial-deeds.js?v=bcd1fd858-20261101-172425",
  "./src/js/practice-deeds.js?v=bcd1fd858-20261101-172425",
  "./src/js/tracks.js?v=bcd1fd858-20261101-172425",
  "./src/js/villager-build.js?v=bcd1fd858-20261101-172425",
  "./src/js/progression.js?v=bcd1fd858-20261101-172425",
  "./src/js/waveLedger.js?v=bcd1fd858-20261101-172425",
  "./src/js/standing.js?v=bcd1fd858-20261101-172425",
  "./src/js/feastBuff.js?v=bcd1fd858-20261101-172425",
  "./src/js/ledger.js?v=bcd1fd858-20261101-172425",
  "./src/js/exposure.js?v=bcd1fd858-20261101-172425",
  "./src/js/abilityActions.js?v=bcd1fd858-20261101-172425",
  "./src/js/buildarounds.js?v=bcd1fd858-20261101-172425",
  "./src/js/foodPower.js?v=bcd1fd858-20261101-172425",
  "./src/js/monsterBehaviors.js?v=bcd1fd858-20261101-172425",
  "./src/js/partyTactics.js?v=bcd1fd858-20261101-172425",
  "./src/js/sigW3a.js?v=bcd1fd858-20261101-172425",
  "./src/js/statusEffects.js?v=bcd1fd858-20261101-172425",
  "./src/js/sigW3b.js?v=bcd1fd858-20261101-172425",
  "./src/js/metaProgression.js?v=bcd1fd858-20261101-172425",
  "./src/js/sigW3c.js?v=bcd1fd858-20261101-172425",
  "./src/js/sigW4.js?v=bcd1fd858-20261101-172425",
  "./src/js/sigW5.js?v=bcd1fd858-20261101-172425",
  "./src/js/villager-agency.js?v=bcd1fd858-20261101-172425",
  "./src/js/npc-triggers.js?v=bcd1fd858-20261101-172425",
  "./src/js/fieldFights.js?v=bcd1fd858-20261101-172425",
  "./src/js/party-wiring.js?v=bcd1fd858-20261101-172425",
  "./src/js/party-bond.js?v=bcd1fd858-20261101-172425",
  "./src/js/villager-objectives.js?v=bcd1fd858-20261101-172425",
  "./src/js/villager-mapmem.js?v=bcd1fd858-20261101-172425",
  "./src/js/codex-people.js?v=bcd1fd858-20261101-172425",
  "./src/js/fallen-memorial.js?v=bcd1fd858-20261101-172425",
  "./src/js/graves.js?v=bcd1fd858-20261101-172425",
  "./src/js/membership.js?v=bcd1fd858-20261101-172425",
  "./src/js/gardenCultivation.js?v=bcd1fd858-20261101-172425",
  "./src/js/havenGrowth.js?v=bcd1fd858-20261101-172425",
  "./src/js/shelter.js?v=bcd1fd858-20261101-172425",
  "./src/js/hierarchy.js?v=bcd1fd858-20261101-172425",
  "./src/js/scaleDiscovery.js?v=bcd1fd858-20261101-172425",
  "./src/js/comms.js?v=bcd1fd858-20261101-172425",
  "./src/js/table.js?v=bcd1fd858-20261101-172425",
  "./src/js/pods.js?v=bcd1fd858-20261101-172425",
  "./src/js/titans.js?v=bcd1fd858-20261101-172425",
  "./src/js/finale-campaign.js?v=bcd1fd858-20261101-172425",
  "./src/js/godhood.js?v=bcd1fd858-20261101-172425",
  "./src/js/pantheon.js?v=bcd1fd858-20261101-172425",
  "./src/js/records.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-feared.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-indispensable.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-beloved.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-witness.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-assimilated.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-defiant.js?v=bcd1fd858-20261101-172425",
  "./src/js/relay-ext.js?v=bcd1fd858-20261101-172425",
  "./src/js/relay-dialogue.js?v=bcd1fd858-20261101-172425",
  "./src/js/table-relay.js?v=bcd1fd858-20261101-172425",
  "./src/js/safetynets.js?v=bcd1fd858-20261101-172425",
  "./src/js/villageAgency.js?v=bcd1fd858-20261101-172425",
  "./src/js/memdepth.js?v=bcd1fd858-20261101-172425",
  "./src/js/overtime.js?v=bcd1fd858-20261101-172425",
  "./src/js/network-campaign.js?v=bcd1fd858-20261101-172425",
  "./src/js/debug-scenarios.js?v=bcd1fd858-20261101-172425",
  "./src/js/keepsakes.js?v=bcd1fd858-20261101-172425",
  "./src/js/skill-teaching.js?v=bcd1fd858-20261101-172425",
  "./src/js/world.js?v=bcd1fd858-20261101-172425",
  "./src/js/nomad.js?v=bcd1fd858-20261101-172425",
  "./src/js/nomad-wild.js?v=bcd1fd858-20261101-172425",
  "./src/js/nomad-scenes.js?v=bcd1fd858-20261101-172425",
  "./src/js/nomad-drive.js?v=bcd1fd858-20261101-172425",
  "./src/js/temperature.js?v=bcd1fd858-20261101-172425",
  "./src/js/godpath.js?v=bcd1fd858-20261101-172425",
  "./src/js/godverbs.js?v=bcd1fd858-20261101-172425",
  "./src/js/endingKey.js?v=bcd1fd858-20261101-172425",
  "./src/js/telemetry-hooks.js?v=bcd1fd858-20261101-172425",
  "./src/js/feel.js?v=bcd1fd858-20261101-172425",
  "./src/js/build.js?v=bcd1fd858-20261101-172425",
  "./src/js/whereAreWe.js?v=bcd1fd858-20261101-172425",
  "./src/js/drama.js?v=bcd1fd858-20261101-172425",
  "./src/js/move-anim.js?v=bcd1fd858-20261101-172425",
  "./src/js/presentation.js?v=bcd1fd858-20261101-172425",
  "./src/js/sprites.js?v=bcd1fd858-20261101-172425",
  "./src/js/tile-scenes.js?v=bcd1fd858-20261101-172425",
  "./src/js/regional-audio.js?v=bcd1fd858-20261101-172425",
  "./src/js/favor-company.js?v=bcd1fd858-20261101-172425",
  "./src/js/timeSettlement.js?v=bcd1fd858-20261101-172425",
  "./src/js/app.js?v=bcd1fd858-20261101-172425",
  "./src/js/feel-audio.js?v=bcd1fd858-20261101-172425",
  "./manifest.json?v=bcd1fd858-20261101-172425",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=bcd1fd858-20261101-172425",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=bcd1fd858-20261101-172425",
  "./src/data/alienPlayers.json?v=bcd1fd858-20261101-172425",
  "./src/data/animals.json?v=bcd1fd858-20261101-172425",
  "./src/data/arrivalText.json?v=bcd1fd858-20261101-172425",
  "./src/data/background_survivors.json?v=bcd1fd858-20261101-172425",
  "./src/data/biomes.json?v=bcd1fd858-20261101-172425",
  "./src/data/books.json?v=bcd1fd858-20261101-172425",
  "./src/data/build-notes.json?v=bcd1fd858-20261101-172425",
  "./src/data/cell_defs.json?v=bcd1fd858-20261101-172425",
  "./src/data/characterGen.json?v=bcd1fd858-20261101-172425",
  "./src/data/climates.json?v=bcd1fd858-20261101-172425",
  "./src/data/contests.json?v=bcd1fd858-20261101-172425",
  "./src/data/cooking.json?v=bcd1fd858-20261101-172425",
  "./src/data/events.json?v=bcd1fd858-20261101-172425",
  "./src/data/evolutions.json?v=bcd1fd858-20261101-172425",
  "./src/data/favor-rules.json?v=bcd1fd858-20261101-172425",
  "./src/data/feast-surge.json?v=bcd1fd858-20261101-172425",
  "./src/data/foreignSpeech.json?v=bcd1fd858-20261101-172425",
  "./src/data/gardening.json?v=bcd1fd858-20261101-172425",
  "./src/data/godpaths.json?v=bcd1fd858-20261101-172425",
  "./src/data/items.json?v=bcd1fd858-20261101-172425",
  "./src/data/justiceVoice.json?v=bcd1fd858-20261101-172425",
  "./src/data/knowledge.json?v=bcd1fd858-20261101-172425",
  "./src/data/lifeseeds.json?v=bcd1fd858-20261101-172425",
  "./src/data/locations.json?v=bcd1fd858-20261101-172425",
  "./src/data/monsterBehaviors.json?v=bcd1fd858-20261101-172425",
  "./src/data/monsters.json?v=bcd1fd858-20261101-172425",
  "./src/data/nameCultures.json?v=bcd1fd858-20261101-172425",
  "./src/data/originPicker.json?v=bcd1fd858-20261101-172425",
  "./src/data/plants.json?v=bcd1fd858-20261101-172425",
  "./src/data/presentation.json?v=bcd1fd858-20261101-172425",
  "./src/data/recipes.json?v=bcd1fd858-20261101-172425",
  "./src/data/regions.json?v=bcd1fd858-20261101-172425",
  "./src/data/relicEnhancements.json?v=bcd1fd858-20261101-172425",
  "./src/data/reward-economy.json?v=bcd1fd858-20261101-172425",
  "./src/data/schemas.json?v=bcd1fd858-20261101-172425",
  "./src/data/statusEffects.json?v=bcd1fd858-20261101-172425",
  "./src/data/synergies.json?v=bcd1fd858-20261101-172425",
  "./src/data/table-beats.json?v=bcd1fd858-20261101-172425",
  "./src/data/table-endings.json?v=bcd1fd858-20261101-172425",
  "./src/data/titans.json?v=bcd1fd858-20261101-172425",
  "./src/data/tracks.json?v=bcd1fd858-20261101-172425",
  "./src/data/villagers.json?v=bcd1fd858-20261101-172425",
  "./src/data/wave-ledger.json?v=bcd1fd858-20261101-172425"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
