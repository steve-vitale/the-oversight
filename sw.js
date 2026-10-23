/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'fc38d52ce-20261023-052459';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=fc38d52ce-20261023-052459",
  "./src/js/engine/modifiers.js?v=fc38d52ce-20261023-052459",
  "./src/js/engine/calories.js?v=fc38d52ce-20261023-052459",
  "./src/js/engine/day.js?v=fc38d52ce-20261023-052459",
  "./src/js/engine/forage.js?v=fc38d52ce-20261023-052459",
  "./src/js/engine/combat.js?v=fc38d52ce-20261023-052459",
  "./src/js/audio-registry.js?v=fc38d52ce-20261023-052459",
  "./src/js/text.js?v=fc38d52ce-20261023-052459",
  "./src/js/game.js?v=fc38d52ce-20261023-052459",
  "./src/js/encounters.js?v=fc38d52ce-20261023-052459",
  "./src/js/conversation.js?v=fc38d52ce-20261023-052459",
  "./src/js/convo-mood.js?v=fc38d52ce-20261023-052459",
  "./src/js/convoTopics.js?v=fc38d52ce-20261023-052459",
  "./src/js/naming-rite.js?v=fc38d52ce-20261023-052459",
  "./src/js/convo-wants.js?v=fc38d52ce-20261023-052459",
  "./src/js/convo-dialogue.js?v=fc38d52ce-20261023-052459",
  "./src/js/convo-beats.js?v=fc38d52ce-20261023-052459",
  "./src/js/convo-scene.js?v=fc38d52ce-20261023-052459",
  "./src/js/voice-piper.js?v=fc38d52ce-20261023-052459",
  "./src/js/voice-system.js?v=fc38d52ce-20261023-052459",
  "./src/js/examine.js?v=fc38d52ce-20261023-052459",
  "./src/js/equipment.js?v=fc38d52ce-20261023-052459",
  "./src/js/journal.js?v=fc38d52ce-20261023-052459",
  "./src/js/party.js?v=fc38d52ce-20261023-052459",
  "./src/js/favor-water.js?v=fc38d52ce-20261023-052459",
  "./src/js/party-formal.js?v=fc38d52ce-20261023-052459",
  "./src/js/truth.js?v=fc38d52ce-20261023-052459",
  "./src/js/galactic-cast.js?v=fc38d52ce-20261023-052459",
  "./src/js/contests.js?v=fc38d52ce-20261023-052459",
  "./src/js/broadcast.js?v=fc38d52ce-20261023-052459",
  "./src/js/contestEngine.js?v=fc38d52ce-20261023-052459",
  "./src/js/alienPlayers.js?v=fc38d52ce-20261023-052459",
  "./src/js/storage.js?v=fc38d52ce-20261023-052459",
  "./src/js/perceive.js?v=fc38d52ce-20261023-052459",
  "./src/js/carexplore.js?v=fc38d52ce-20261023-052459",
  "./src/js/justice.js?v=fc38d52ce-20261023-052459",
  "./src/js/food.js?v=fc38d52ce-20261023-052459",
  "./src/js/betrayal.js?v=fc38d52ce-20261023-052459",
  "./src/js/corpses.js?v=fc38d52ce-20261023-052459",
  "./src/js/corruption.js?v=fc38d52ce-20261023-052459",
  "./src/js/lifeseed.js?v=fc38d52ce-20261023-052459",
  "./src/js/spawn-knack.js?v=fc38d52ce-20261023-052459",
  "./src/js/trial-deeds.js?v=fc38d52ce-20261023-052459",
  "./src/js/practice-deeds.js?v=fc38d52ce-20261023-052459",
  "./src/js/tracks.js?v=fc38d52ce-20261023-052459",
  "./src/js/villager-build.js?v=fc38d52ce-20261023-052459",
  "./src/js/progression.js?v=fc38d52ce-20261023-052459",
  "./src/js/waveLedger.js?v=fc38d52ce-20261023-052459",
  "./src/js/standing.js?v=fc38d52ce-20261023-052459",
  "./src/js/feastBuff.js?v=fc38d52ce-20261023-052459",
  "./src/js/ledger.js?v=fc38d52ce-20261023-052459",
  "./src/js/exposure.js?v=fc38d52ce-20261023-052459",
  "./src/js/abilityActions.js?v=fc38d52ce-20261023-052459",
  "./src/js/buildarounds.js?v=fc38d52ce-20261023-052459",
  "./src/js/foodPower.js?v=fc38d52ce-20261023-052459",
  "./src/js/monsterBehaviors.js?v=fc38d52ce-20261023-052459",
  "./src/js/partyTactics.js?v=fc38d52ce-20261023-052459",
  "./src/js/sigW3a.js?v=fc38d52ce-20261023-052459",
  "./src/js/statusEffects.js?v=fc38d52ce-20261023-052459",
  "./src/js/sigW3b.js?v=fc38d52ce-20261023-052459",
  "./src/js/metaProgression.js?v=fc38d52ce-20261023-052459",
  "./src/js/sigW3c.js?v=fc38d52ce-20261023-052459",
  "./src/js/sigW4.js?v=fc38d52ce-20261023-052459",
  "./src/js/sigW5.js?v=fc38d52ce-20261023-052459",
  "./src/js/villager-agency.js?v=fc38d52ce-20261023-052459",
  "./src/js/npc-triggers.js?v=fc38d52ce-20261023-052459",
  "./src/js/fieldFights.js?v=fc38d52ce-20261023-052459",
  "./src/js/party-wiring.js?v=fc38d52ce-20261023-052459",
  "./src/js/party-bond.js?v=fc38d52ce-20261023-052459",
  "./src/js/villager-objectives.js?v=fc38d52ce-20261023-052459",
  "./src/js/villager-mapmem.js?v=fc38d52ce-20261023-052459",
  "./src/js/codex-people.js?v=fc38d52ce-20261023-052459",
  "./src/js/fallen-memorial.js?v=fc38d52ce-20261023-052459",
  "./src/js/membership.js?v=fc38d52ce-20261023-052459",
  "./src/js/gardenCultivation.js?v=fc38d52ce-20261023-052459",
  "./src/js/havenGrowth.js?v=fc38d52ce-20261023-052459",
  "./src/js/shelter.js?v=fc38d52ce-20261023-052459",
  "./src/js/hierarchy.js?v=fc38d52ce-20261023-052459",
  "./src/js/scaleDiscovery.js?v=fc38d52ce-20261023-052459",
  "./src/js/comms.js?v=fc38d52ce-20261023-052459",
  "./src/js/table.js?v=fc38d52ce-20261023-052459",
  "./src/js/pods.js?v=fc38d52ce-20261023-052459",
  "./src/js/titans.js?v=fc38d52ce-20261023-052459",
  "./src/js/finale-campaign.js?v=fc38d52ce-20261023-052459",
  "./src/js/godhood.js?v=fc38d52ce-20261023-052459",
  "./src/js/pantheon.js?v=fc38d52ce-20261023-052459",
  "./src/js/records.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-feared.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-indispensable.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-beloved.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-witness.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-assimilated.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-defiant.js?v=fc38d52ce-20261023-052459",
  "./src/js/relay-ext.js?v=fc38d52ce-20261023-052459",
  "./src/js/relay-dialogue.js?v=fc38d52ce-20261023-052459",
  "./src/js/table-relay.js?v=fc38d52ce-20261023-052459",
  "./src/js/safetynets.js?v=fc38d52ce-20261023-052459",
  "./src/js/villageAgency.js?v=fc38d52ce-20261023-052459",
  "./src/js/memdepth.js?v=fc38d52ce-20261023-052459",
  "./src/js/overtime.js?v=fc38d52ce-20261023-052459",
  "./src/js/network-campaign.js?v=fc38d52ce-20261023-052459",
  "./src/js/debug-scenarios.js?v=fc38d52ce-20261023-052459",
  "./src/js/keepsakes.js?v=fc38d52ce-20261023-052459",
  "./src/js/skill-teaching.js?v=fc38d52ce-20261023-052459",
  "./src/js/world.js?v=fc38d52ce-20261023-052459",
  "./src/js/nomad.js?v=fc38d52ce-20261023-052459",
  "./src/js/nomad-wild.js?v=fc38d52ce-20261023-052459",
  "./src/js/nomad-scenes.js?v=fc38d52ce-20261023-052459",
  "./src/js/nomad-drive.js?v=fc38d52ce-20261023-052459",
  "./src/js/temperature.js?v=fc38d52ce-20261023-052459",
  "./src/js/godpath.js?v=fc38d52ce-20261023-052459",
  "./src/js/godverbs.js?v=fc38d52ce-20261023-052459",
  "./src/js/endingKey.js?v=fc38d52ce-20261023-052459",
  "./src/js/telemetry-hooks.js?v=fc38d52ce-20261023-052459",
  "./src/js/feel.js?v=fc38d52ce-20261023-052459",
  "./src/js/build.js?v=fc38d52ce-20261023-052459",
  "./src/js/whereAreWe.js?v=fc38d52ce-20261023-052459",
  "./src/js/drama.js?v=fc38d52ce-20261023-052459",
  "./src/js/move-anim.js?v=fc38d52ce-20261023-052459",
  "./src/js/presentation.js?v=fc38d52ce-20261023-052459",
  "./src/js/sprites.js?v=fc38d52ce-20261023-052459",
  "./src/js/tile-scenes.js?v=fc38d52ce-20261023-052459",
  "./src/js/regional-audio.js?v=fc38d52ce-20261023-052459",
  "./src/js/favor-company.js?v=fc38d52ce-20261023-052459",
  "./src/js/timeSettlement.js?v=fc38d52ce-20261023-052459",
  "./src/js/app.js?v=fc38d52ce-20261023-052459",
  "./src/js/feel-audio.js?v=fc38d52ce-20261023-052459",
  "./manifest.json?v=fc38d52ce-20261023-052459",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=fc38d52ce-20261023-052459",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=fc38d52ce-20261023-052459",
  "./src/data/alienPlayers.json?v=fc38d52ce-20261023-052459",
  "./src/data/animals.json?v=fc38d52ce-20261023-052459",
  "./src/data/arrivalText.json?v=fc38d52ce-20261023-052459",
  "./src/data/background_survivors.json?v=fc38d52ce-20261023-052459",
  "./src/data/biomes.json?v=fc38d52ce-20261023-052459",
  "./src/data/books.json?v=fc38d52ce-20261023-052459",
  "./src/data/build-notes.json?v=fc38d52ce-20261023-052459",
  "./src/data/cell_defs.json?v=fc38d52ce-20261023-052459",
  "./src/data/characterGen.json?v=fc38d52ce-20261023-052459",
  "./src/data/climates.json?v=fc38d52ce-20261023-052459",
  "./src/data/contests.json?v=fc38d52ce-20261023-052459",
  "./src/data/cooking.json?v=fc38d52ce-20261023-052459",
  "./src/data/events.json?v=fc38d52ce-20261023-052459",
  "./src/data/evolutions.json?v=fc38d52ce-20261023-052459",
  "./src/data/favor-rules.json?v=fc38d52ce-20261023-052459",
  "./src/data/feast-surge.json?v=fc38d52ce-20261023-052459",
  "./src/data/foreignSpeech.json?v=fc38d52ce-20261023-052459",
  "./src/data/gardening.json?v=fc38d52ce-20261023-052459",
  "./src/data/godpaths.json?v=fc38d52ce-20261023-052459",
  "./src/data/items.json?v=fc38d52ce-20261023-052459",
  "./src/data/justiceVoice.json?v=fc38d52ce-20261023-052459",
  "./src/data/knowledge.json?v=fc38d52ce-20261023-052459",
  "./src/data/lifeseeds.json?v=fc38d52ce-20261023-052459",
  "./src/data/locations.json?v=fc38d52ce-20261023-052459",
  "./src/data/monsterBehaviors.json?v=fc38d52ce-20261023-052459",
  "./src/data/monsters.json?v=fc38d52ce-20261023-052459",
  "./src/data/nameCultures.json?v=fc38d52ce-20261023-052459",
  "./src/data/originPicker.json?v=fc38d52ce-20261023-052459",
  "./src/data/plants.json?v=fc38d52ce-20261023-052459",
  "./src/data/presentation.json?v=fc38d52ce-20261023-052459",
  "./src/data/recipes.json?v=fc38d52ce-20261023-052459",
  "./src/data/regions.json?v=fc38d52ce-20261023-052459",
  "./src/data/relicEnhancements.json?v=fc38d52ce-20261023-052459",
  "./src/data/reward-economy.json?v=fc38d52ce-20261023-052459",
  "./src/data/schemas.json?v=fc38d52ce-20261023-052459",
  "./src/data/statusEffects.json?v=fc38d52ce-20261023-052459",
  "./src/data/synergies.json?v=fc38d52ce-20261023-052459",
  "./src/data/table-beats.json?v=fc38d52ce-20261023-052459",
  "./src/data/table-endings.json?v=fc38d52ce-20261023-052459",
  "./src/data/titans.json?v=fc38d52ce-20261023-052459",
  "./src/data/tracks.json?v=fc38d52ce-20261023-052459",
  "./src/data/villagers.json?v=fc38d52ce-20261023-052459",
  "./src/data/wave-ledger.json?v=fc38d52ce-20261023-052459"
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
