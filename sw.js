/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = '66239763c-20261101-000436';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=66239763c-20261101-000436",
  "./src/js/engine/modifiers.js?v=66239763c-20261101-000436",
  "./src/js/engine/calories.js?v=66239763c-20261101-000436",
  "./src/js/engine/day.js?v=66239763c-20261101-000436",
  "./src/js/engine/forage.js?v=66239763c-20261101-000436",
  "./src/js/engine/combat.js?v=66239763c-20261101-000436",
  "./src/js/audio-registry.js?v=66239763c-20261101-000436",
  "./src/js/text.js?v=66239763c-20261101-000436",
  "./src/js/game.js?v=66239763c-20261101-000436",
  "./src/js/encounters.js?v=66239763c-20261101-000436",
  "./src/js/conversation.js?v=66239763c-20261101-000436",
  "./src/js/convo-mood.js?v=66239763c-20261101-000436",
  "./src/js/convoTopics.js?v=66239763c-20261101-000436",
  "./src/js/naming-rite.js?v=66239763c-20261101-000436",
  "./src/js/convo-wants.js?v=66239763c-20261101-000436",
  "./src/js/convo-dialogue.js?v=66239763c-20261101-000436",
  "./src/js/convo-beats.js?v=66239763c-20261101-000436",
  "./src/js/convo-scene.js?v=66239763c-20261101-000436",
  "./src/js/voice-piper.js?v=66239763c-20261101-000436",
  "./src/js/voice-system.js?v=66239763c-20261101-000436",
  "./src/js/examine.js?v=66239763c-20261101-000436",
  "./src/js/equipment.js?v=66239763c-20261101-000436",
  "./src/js/journal.js?v=66239763c-20261101-000436",
  "./src/js/party.js?v=66239763c-20261101-000436",
  "./src/js/favor-water.js?v=66239763c-20261101-000436",
  "./src/js/favor-forage.js?v=66239763c-20261101-000436",
  "./src/js/party-formal.js?v=66239763c-20261101-000436",
  "./src/js/truth.js?v=66239763c-20261101-000436",
  "./src/js/galactic-cast.js?v=66239763c-20261101-000436",
  "./src/js/contests.js?v=66239763c-20261101-000436",
  "./src/js/broadcast.js?v=66239763c-20261101-000436",
  "./src/js/contestEngine.js?v=66239763c-20261101-000436",
  "./src/js/alienPlayers.js?v=66239763c-20261101-000436",
  "./src/js/storage.js?v=66239763c-20261101-000436",
  "./src/js/perceive.js?v=66239763c-20261101-000436",
  "./src/js/carexplore.js?v=66239763c-20261101-000436",
  "./src/js/justice.js?v=66239763c-20261101-000436",
  "./src/js/food.js?v=66239763c-20261101-000436",
  "./src/js/betrayal.js?v=66239763c-20261101-000436",
  "./src/js/corpses.js?v=66239763c-20261101-000436",
  "./src/js/corruption.js?v=66239763c-20261101-000436",
  "./src/js/lifeseed.js?v=66239763c-20261101-000436",
  "./src/js/spawn-knack.js?v=66239763c-20261101-000436",
  "./src/js/trial-deeds.js?v=66239763c-20261101-000436",
  "./src/js/practice-deeds.js?v=66239763c-20261101-000436",
  "./src/js/tracks.js?v=66239763c-20261101-000436",
  "./src/js/villager-build.js?v=66239763c-20261101-000436",
  "./src/js/progression.js?v=66239763c-20261101-000436",
  "./src/js/waveLedger.js?v=66239763c-20261101-000436",
  "./src/js/standing.js?v=66239763c-20261101-000436",
  "./src/js/feastBuff.js?v=66239763c-20261101-000436",
  "./src/js/ledger.js?v=66239763c-20261101-000436",
  "./src/js/exposure.js?v=66239763c-20261101-000436",
  "./src/js/abilityActions.js?v=66239763c-20261101-000436",
  "./src/js/buildarounds.js?v=66239763c-20261101-000436",
  "./src/js/foodPower.js?v=66239763c-20261101-000436",
  "./src/js/monsterBehaviors.js?v=66239763c-20261101-000436",
  "./src/js/partyTactics.js?v=66239763c-20261101-000436",
  "./src/js/sigW3a.js?v=66239763c-20261101-000436",
  "./src/js/statusEffects.js?v=66239763c-20261101-000436",
  "./src/js/sigW3b.js?v=66239763c-20261101-000436",
  "./src/js/metaProgression.js?v=66239763c-20261101-000436",
  "./src/js/sigW3c.js?v=66239763c-20261101-000436",
  "./src/js/sigW4.js?v=66239763c-20261101-000436",
  "./src/js/sigW5.js?v=66239763c-20261101-000436",
  "./src/js/villager-agency.js?v=66239763c-20261101-000436",
  "./src/js/npc-triggers.js?v=66239763c-20261101-000436",
  "./src/js/fieldFights.js?v=66239763c-20261101-000436",
  "./src/js/party-wiring.js?v=66239763c-20261101-000436",
  "./src/js/party-bond.js?v=66239763c-20261101-000436",
  "./src/js/villager-objectives.js?v=66239763c-20261101-000436",
  "./src/js/villager-mapmem.js?v=66239763c-20261101-000436",
  "./src/js/codex-people.js?v=66239763c-20261101-000436",
  "./src/js/fallen-memorial.js?v=66239763c-20261101-000436",
  "./src/js/graves.js?v=66239763c-20261101-000436",
  "./src/js/membership.js?v=66239763c-20261101-000436",
  "./src/js/gardenCultivation.js?v=66239763c-20261101-000436",
  "./src/js/havenGrowth.js?v=66239763c-20261101-000436",
  "./src/js/shelter.js?v=66239763c-20261101-000436",
  "./src/js/hierarchy.js?v=66239763c-20261101-000436",
  "./src/js/scaleDiscovery.js?v=66239763c-20261101-000436",
  "./src/js/comms.js?v=66239763c-20261101-000436",
  "./src/js/table.js?v=66239763c-20261101-000436",
  "./src/js/pods.js?v=66239763c-20261101-000436",
  "./src/js/titans.js?v=66239763c-20261101-000436",
  "./src/js/finale-campaign.js?v=66239763c-20261101-000436",
  "./src/js/godhood.js?v=66239763c-20261101-000436",
  "./src/js/pantheon.js?v=66239763c-20261101-000436",
  "./src/js/records.js?v=66239763c-20261101-000436",
  "./src/js/table-feared.js?v=66239763c-20261101-000436",
  "./src/js/table-indispensable.js?v=66239763c-20261101-000436",
  "./src/js/table-beloved.js?v=66239763c-20261101-000436",
  "./src/js/table-witness.js?v=66239763c-20261101-000436",
  "./src/js/table-assimilated.js?v=66239763c-20261101-000436",
  "./src/js/table-defiant.js?v=66239763c-20261101-000436",
  "./src/js/relay-ext.js?v=66239763c-20261101-000436",
  "./src/js/relay-dialogue.js?v=66239763c-20261101-000436",
  "./src/js/table-relay.js?v=66239763c-20261101-000436",
  "./src/js/safetynets.js?v=66239763c-20261101-000436",
  "./src/js/villageAgency.js?v=66239763c-20261101-000436",
  "./src/js/memdepth.js?v=66239763c-20261101-000436",
  "./src/js/overtime.js?v=66239763c-20261101-000436",
  "./src/js/network-campaign.js?v=66239763c-20261101-000436",
  "./src/js/debug-scenarios.js?v=66239763c-20261101-000436",
  "./src/js/keepsakes.js?v=66239763c-20261101-000436",
  "./src/js/skill-teaching.js?v=66239763c-20261101-000436",
  "./src/js/world.js?v=66239763c-20261101-000436",
  "./src/js/nomad.js?v=66239763c-20261101-000436",
  "./src/js/nomad-wild.js?v=66239763c-20261101-000436",
  "./src/js/nomad-scenes.js?v=66239763c-20261101-000436",
  "./src/js/nomad-drive.js?v=66239763c-20261101-000436",
  "./src/js/temperature.js?v=66239763c-20261101-000436",
  "./src/js/godpath.js?v=66239763c-20261101-000436",
  "./src/js/godverbs.js?v=66239763c-20261101-000436",
  "./src/js/endingKey.js?v=66239763c-20261101-000436",
  "./src/js/telemetry-hooks.js?v=66239763c-20261101-000436",
  "./src/js/feel.js?v=66239763c-20261101-000436",
  "./src/js/build.js?v=66239763c-20261101-000436",
  "./src/js/whereAreWe.js?v=66239763c-20261101-000436",
  "./src/js/drama.js?v=66239763c-20261101-000436",
  "./src/js/move-anim.js?v=66239763c-20261101-000436",
  "./src/js/presentation.js?v=66239763c-20261101-000436",
  "./src/js/sprites.js?v=66239763c-20261101-000436",
  "./src/js/tile-scenes.js?v=66239763c-20261101-000436",
  "./src/js/regional-audio.js?v=66239763c-20261101-000436",
  "./src/js/favor-company.js?v=66239763c-20261101-000436",
  "./src/js/timeSettlement.js?v=66239763c-20261101-000436",
  "./src/js/app.js?v=66239763c-20261101-000436",
  "./src/js/feel-audio.js?v=66239763c-20261101-000436",
  "./manifest.json?v=66239763c-20261101-000436",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=66239763c-20261101-000436",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=66239763c-20261101-000436",
  "./src/data/alienPlayers.json?v=66239763c-20261101-000436",
  "./src/data/animals.json?v=66239763c-20261101-000436",
  "./src/data/arrivalText.json?v=66239763c-20261101-000436",
  "./src/data/background_survivors.json?v=66239763c-20261101-000436",
  "./src/data/biomes.json?v=66239763c-20261101-000436",
  "./src/data/books.json?v=66239763c-20261101-000436",
  "./src/data/build-notes.json?v=66239763c-20261101-000436",
  "./src/data/cell_defs.json?v=66239763c-20261101-000436",
  "./src/data/characterGen.json?v=66239763c-20261101-000436",
  "./src/data/climates.json?v=66239763c-20261101-000436",
  "./src/data/contests.json?v=66239763c-20261101-000436",
  "./src/data/cooking.json?v=66239763c-20261101-000436",
  "./src/data/events.json?v=66239763c-20261101-000436",
  "./src/data/evolutions.json?v=66239763c-20261101-000436",
  "./src/data/favor-rules.json?v=66239763c-20261101-000436",
  "./src/data/feast-surge.json?v=66239763c-20261101-000436",
  "./src/data/foreignSpeech.json?v=66239763c-20261101-000436",
  "./src/data/gardening.json?v=66239763c-20261101-000436",
  "./src/data/godpaths.json?v=66239763c-20261101-000436",
  "./src/data/items.json?v=66239763c-20261101-000436",
  "./src/data/justiceVoice.json?v=66239763c-20261101-000436",
  "./src/data/knowledge.json?v=66239763c-20261101-000436",
  "./src/data/lifeseeds.json?v=66239763c-20261101-000436",
  "./src/data/locations.json?v=66239763c-20261101-000436",
  "./src/data/monsterBehaviors.json?v=66239763c-20261101-000436",
  "./src/data/monsters.json?v=66239763c-20261101-000436",
  "./src/data/nameCultures.json?v=66239763c-20261101-000436",
  "./src/data/originPicker.json?v=66239763c-20261101-000436",
  "./src/data/plants.json?v=66239763c-20261101-000436",
  "./src/data/presentation.json?v=66239763c-20261101-000436",
  "./src/data/recipes.json?v=66239763c-20261101-000436",
  "./src/data/regions.json?v=66239763c-20261101-000436",
  "./src/data/relicEnhancements.json?v=66239763c-20261101-000436",
  "./src/data/reward-economy.json?v=66239763c-20261101-000436",
  "./src/data/schemas.json?v=66239763c-20261101-000436",
  "./src/data/statusEffects.json?v=66239763c-20261101-000436",
  "./src/data/synergies.json?v=66239763c-20261101-000436",
  "./src/data/table-beats.json?v=66239763c-20261101-000436",
  "./src/data/table-endings.json?v=66239763c-20261101-000436",
  "./src/data/titans.json?v=66239763c-20261101-000436",
  "./src/data/tracks.json?v=66239763c-20261101-000436",
  "./src/data/villagers.json?v=66239763c-20261101-000436",
  "./src/data/wave-ledger.json?v=66239763c-20261101-000436"
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
