/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'e54aeb922-20261102-232907';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=e54aeb922-20261102-232907",
  "./src/js/engine/modifiers.js?v=e54aeb922-20261102-232907",
  "./src/js/engine/calories.js?v=e54aeb922-20261102-232907",
  "./src/js/engine/day.js?v=e54aeb922-20261102-232907",
  "./src/js/engine/forage.js?v=e54aeb922-20261102-232907",
  "./src/js/engine/combat.js?v=e54aeb922-20261102-232907",
  "./src/js/audio-registry.js?v=e54aeb922-20261102-232907",
  "./src/js/text.js?v=e54aeb922-20261102-232907",
  "./src/js/game.js?v=e54aeb922-20261102-232907",
  "./src/js/encounters.js?v=e54aeb922-20261102-232907",
  "./src/js/conversation.js?v=e54aeb922-20261102-232907",
  "./src/js/convo-mood.js?v=e54aeb922-20261102-232907",
  "./src/js/convoTopics.js?v=e54aeb922-20261102-232907",
  "./src/js/naming-rite.js?v=e54aeb922-20261102-232907",
  "./src/js/convo-wants.js?v=e54aeb922-20261102-232907",
  "./src/js/convo-dialogue.js?v=e54aeb922-20261102-232907",
  "./src/js/convo-beats.js?v=e54aeb922-20261102-232907",
  "./src/js/convo-scene.js?v=e54aeb922-20261102-232907",
  "./src/js/voice-piper.js?v=e54aeb922-20261102-232907",
  "./src/js/voice-system.js?v=e54aeb922-20261102-232907",
  "./src/js/examine.js?v=e54aeb922-20261102-232907",
  "./src/js/equipment.js?v=e54aeb922-20261102-232907",
  "./src/js/journal.js?v=e54aeb922-20261102-232907",
  "./src/js/party.js?v=e54aeb922-20261102-232907",
  "./src/js/favor-water.js?v=e54aeb922-20261102-232907",
  "./src/js/favor-forage.js?v=e54aeb922-20261102-232907",
  "./src/js/favor-outing.js?v=e54aeb922-20261102-232907",
  "./src/js/party-formal.js?v=e54aeb922-20261102-232907",
  "./src/js/truth.js?v=e54aeb922-20261102-232907",
  "./src/js/galactic-cast.js?v=e54aeb922-20261102-232907",
  "./src/js/contests.js?v=e54aeb922-20261102-232907",
  "./src/js/broadcast.js?v=e54aeb922-20261102-232907",
  "./src/js/contestEngine.js?v=e54aeb922-20261102-232907",
  "./src/js/alienPlayers.js?v=e54aeb922-20261102-232907",
  "./src/js/storage.js?v=e54aeb922-20261102-232907",
  "./src/js/perceive.js?v=e54aeb922-20261102-232907",
  "./src/js/carexplore.js?v=e54aeb922-20261102-232907",
  "./src/js/justice.js?v=e54aeb922-20261102-232907",
  "./src/js/food.js?v=e54aeb922-20261102-232907",
  "./src/js/betrayal.js?v=e54aeb922-20261102-232907",
  "./src/js/corpses.js?v=e54aeb922-20261102-232907",
  "./src/js/corruption.js?v=e54aeb922-20261102-232907",
  "./src/js/lifeseed.js?v=e54aeb922-20261102-232907",
  "./src/js/spawn-knack.js?v=e54aeb922-20261102-232907",
  "./src/js/trial-deeds.js?v=e54aeb922-20261102-232907",
  "./src/js/practice-deeds.js?v=e54aeb922-20261102-232907",
  "./src/js/tracks.js?v=e54aeb922-20261102-232907",
  "./src/js/villager-build.js?v=e54aeb922-20261102-232907",
  "./src/js/progression.js?v=e54aeb922-20261102-232907",
  "./src/js/waveLedger.js?v=e54aeb922-20261102-232907",
  "./src/js/standing.js?v=e54aeb922-20261102-232907",
  "./src/js/feastBuff.js?v=e54aeb922-20261102-232907",
  "./src/js/ledger.js?v=e54aeb922-20261102-232907",
  "./src/js/exposure.js?v=e54aeb922-20261102-232907",
  "./src/js/abilityActions.js?v=e54aeb922-20261102-232907",
  "./src/js/buildarounds.js?v=e54aeb922-20261102-232907",
  "./src/js/foodPower.js?v=e54aeb922-20261102-232907",
  "./src/js/monsterBehaviors.js?v=e54aeb922-20261102-232907",
  "./src/js/partyTactics.js?v=e54aeb922-20261102-232907",
  "./src/js/sigW3a.js?v=e54aeb922-20261102-232907",
  "./src/js/statusEffects.js?v=e54aeb922-20261102-232907",
  "./src/js/sigW3b.js?v=e54aeb922-20261102-232907",
  "./src/js/metaProgression.js?v=e54aeb922-20261102-232907",
  "./src/js/sigW3c.js?v=e54aeb922-20261102-232907",
  "./src/js/sigW4.js?v=e54aeb922-20261102-232907",
  "./src/js/sigW5.js?v=e54aeb922-20261102-232907",
  "./src/js/villager-agency.js?v=e54aeb922-20261102-232907",
  "./src/js/npc-triggers.js?v=e54aeb922-20261102-232907",
  "./src/js/fieldFights.js?v=e54aeb922-20261102-232907",
  "./src/js/party-wiring.js?v=e54aeb922-20261102-232907",
  "./src/js/party-bond.js?v=e54aeb922-20261102-232907",
  "./src/js/villager-objectives.js?v=e54aeb922-20261102-232907",
  "./src/js/villager-mapmem.js?v=e54aeb922-20261102-232907",
  "./src/js/codex-people.js?v=e54aeb922-20261102-232907",
  "./src/js/fallen-memorial.js?v=e54aeb922-20261102-232907",
  "./src/js/graves.js?v=e54aeb922-20261102-232907",
  "./src/js/membership.js?v=e54aeb922-20261102-232907",
  "./src/js/gardenCultivation.js?v=e54aeb922-20261102-232907",
  "./src/js/havenGrowth.js?v=e54aeb922-20261102-232907",
  "./src/js/shelter.js?v=e54aeb922-20261102-232907",
  "./src/js/hierarchy.js?v=e54aeb922-20261102-232907",
  "./src/js/scaleDiscovery.js?v=e54aeb922-20261102-232907",
  "./src/js/comms.js?v=e54aeb922-20261102-232907",
  "./src/js/table.js?v=e54aeb922-20261102-232907",
  "./src/js/pods.js?v=e54aeb922-20261102-232907",
  "./src/js/titans.js?v=e54aeb922-20261102-232907",
  "./src/js/finale-campaign.js?v=e54aeb922-20261102-232907",
  "./src/js/godhood.js?v=e54aeb922-20261102-232907",
  "./src/js/pantheon.js?v=e54aeb922-20261102-232907",
  "./src/js/records.js?v=e54aeb922-20261102-232907",
  "./src/js/table-feared.js?v=e54aeb922-20261102-232907",
  "./src/js/table-indispensable.js?v=e54aeb922-20261102-232907",
  "./src/js/table-beloved.js?v=e54aeb922-20261102-232907",
  "./src/js/table-witness.js?v=e54aeb922-20261102-232907",
  "./src/js/table-assimilated.js?v=e54aeb922-20261102-232907",
  "./src/js/table-defiant.js?v=e54aeb922-20261102-232907",
  "./src/js/relay-ext.js?v=e54aeb922-20261102-232907",
  "./src/js/relay-dialogue.js?v=e54aeb922-20261102-232907",
  "./src/js/table-relay.js?v=e54aeb922-20261102-232907",
  "./src/js/safetynets.js?v=e54aeb922-20261102-232907",
  "./src/js/villageAgency.js?v=e54aeb922-20261102-232907",
  "./src/js/memdepth.js?v=e54aeb922-20261102-232907",
  "./src/js/overtime.js?v=e54aeb922-20261102-232907",
  "./src/js/network-campaign.js?v=e54aeb922-20261102-232907",
  "./src/js/debug-scenarios.js?v=e54aeb922-20261102-232907",
  "./src/js/keepsakes.js?v=e54aeb922-20261102-232907",
  "./src/js/skill-teaching.js?v=e54aeb922-20261102-232907",
  "./src/js/world.js?v=e54aeb922-20261102-232907",
  "./src/js/nomad.js?v=e54aeb922-20261102-232907",
  "./src/js/nomad-wild.js?v=e54aeb922-20261102-232907",
  "./src/js/nomad-scenes.js?v=e54aeb922-20261102-232907",
  "./src/js/nomad-drive.js?v=e54aeb922-20261102-232907",
  "./src/js/temperature.js?v=e54aeb922-20261102-232907",
  "./src/js/godpath.js?v=e54aeb922-20261102-232907",
  "./src/js/godverbs.js?v=e54aeb922-20261102-232907",
  "./src/js/endingKey.js?v=e54aeb922-20261102-232907",
  "./src/js/telemetry-hooks.js?v=e54aeb922-20261102-232907",
  "./src/js/feel.js?v=e54aeb922-20261102-232907",
  "./src/js/build.js?v=e54aeb922-20261102-232907",
  "./src/js/whereAreWe.js?v=e54aeb922-20261102-232907",
  "./src/js/drama.js?v=e54aeb922-20261102-232907",
  "./src/js/move-anim.js?v=e54aeb922-20261102-232907",
  "./src/js/presentation.js?v=e54aeb922-20261102-232907",
  "./src/js/sprites.js?v=e54aeb922-20261102-232907",
  "./src/js/tile-scenes.js?v=e54aeb922-20261102-232907",
  "./src/js/regional-audio.js?v=e54aeb922-20261102-232907",
  "./src/js/favor-company.js?v=e54aeb922-20261102-232907",
  "./src/js/timeSettlement.js?v=e54aeb922-20261102-232907",
  "./src/js/app.js?v=e54aeb922-20261102-232907",
  "./src/js/feel-audio.js?v=e54aeb922-20261102-232907",
  "./manifest.json?v=e54aeb922-20261102-232907",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=e54aeb922-20261102-232907",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=e54aeb922-20261102-232907",
  "./src/data/alienPlayers.json?v=e54aeb922-20261102-232907",
  "./src/data/animals.json?v=e54aeb922-20261102-232907",
  "./src/data/arrivalText.json?v=e54aeb922-20261102-232907",
  "./src/data/background_survivors.json?v=e54aeb922-20261102-232907",
  "./src/data/biomes.json?v=e54aeb922-20261102-232907",
  "./src/data/books.json?v=e54aeb922-20261102-232907",
  "./src/data/build-notes.json?v=e54aeb922-20261102-232907",
  "./src/data/cell_defs.json?v=e54aeb922-20261102-232907",
  "./src/data/characterGen.json?v=e54aeb922-20261102-232907",
  "./src/data/climates.json?v=e54aeb922-20261102-232907",
  "./src/data/contests.json?v=e54aeb922-20261102-232907",
  "./src/data/cooking.json?v=e54aeb922-20261102-232907",
  "./src/data/events.json?v=e54aeb922-20261102-232907",
  "./src/data/evolutions.json?v=e54aeb922-20261102-232907",
  "./src/data/favor-rules.json?v=e54aeb922-20261102-232907",
  "./src/data/feast-surge.json?v=e54aeb922-20261102-232907",
  "./src/data/foreignSpeech.json?v=e54aeb922-20261102-232907",
  "./src/data/gardening.json?v=e54aeb922-20261102-232907",
  "./src/data/godpaths.json?v=e54aeb922-20261102-232907",
  "./src/data/items.json?v=e54aeb922-20261102-232907",
  "./src/data/justiceVoice.json?v=e54aeb922-20261102-232907",
  "./src/data/knowledge.json?v=e54aeb922-20261102-232907",
  "./src/data/lifeseeds.json?v=e54aeb922-20261102-232907",
  "./src/data/locations.json?v=e54aeb922-20261102-232907",
  "./src/data/monsterBehaviors.json?v=e54aeb922-20261102-232907",
  "./src/data/monsters.json?v=e54aeb922-20261102-232907",
  "./src/data/nameCultures.json?v=e54aeb922-20261102-232907",
  "./src/data/originPicker.json?v=e54aeb922-20261102-232907",
  "./src/data/plants.json?v=e54aeb922-20261102-232907",
  "./src/data/presentation.json?v=e54aeb922-20261102-232907",
  "./src/data/recipes.json?v=e54aeb922-20261102-232907",
  "./src/data/regions.json?v=e54aeb922-20261102-232907",
  "./src/data/relicEnhancements.json?v=e54aeb922-20261102-232907",
  "./src/data/reward-economy.json?v=e54aeb922-20261102-232907",
  "./src/data/schemas.json?v=e54aeb922-20261102-232907",
  "./src/data/statusEffects.json?v=e54aeb922-20261102-232907",
  "./src/data/synergies.json?v=e54aeb922-20261102-232907",
  "./src/data/table-beats.json?v=e54aeb922-20261102-232907",
  "./src/data/table-endings.json?v=e54aeb922-20261102-232907",
  "./src/data/titans.json?v=e54aeb922-20261102-232907",
  "./src/data/tracks.json?v=e54aeb922-20261102-232907",
  "./src/data/villagers.json?v=e54aeb922-20261102-232907",
  "./src/data/wave-ledger.json?v=e54aeb922-20261102-232907"
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
