/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'dbe19abad-20261029-113024';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=dbe19abad-20261029-113024",
  "./src/js/engine/modifiers.js?v=dbe19abad-20261029-113024",
  "./src/js/engine/calories.js?v=dbe19abad-20261029-113024",
  "./src/js/engine/day.js?v=dbe19abad-20261029-113024",
  "./src/js/engine/forage.js?v=dbe19abad-20261029-113024",
  "./src/js/engine/combat.js?v=dbe19abad-20261029-113024",
  "./src/js/audio-registry.js?v=dbe19abad-20261029-113024",
  "./src/js/text.js?v=dbe19abad-20261029-113024",
  "./src/js/game.js?v=dbe19abad-20261029-113024",
  "./src/js/encounters.js?v=dbe19abad-20261029-113024",
  "./src/js/conversation.js?v=dbe19abad-20261029-113024",
  "./src/js/convo-mood.js?v=dbe19abad-20261029-113024",
  "./src/js/convoTopics.js?v=dbe19abad-20261029-113024",
  "./src/js/naming-rite.js?v=dbe19abad-20261029-113024",
  "./src/js/convo-wants.js?v=dbe19abad-20261029-113024",
  "./src/js/convo-dialogue.js?v=dbe19abad-20261029-113024",
  "./src/js/convo-beats.js?v=dbe19abad-20261029-113024",
  "./src/js/convo-scene.js?v=dbe19abad-20261029-113024",
  "./src/js/voice-piper.js?v=dbe19abad-20261029-113024",
  "./src/js/voice-system.js?v=dbe19abad-20261029-113024",
  "./src/js/examine.js?v=dbe19abad-20261029-113024",
  "./src/js/equipment.js?v=dbe19abad-20261029-113024",
  "./src/js/journal.js?v=dbe19abad-20261029-113024",
  "./src/js/party.js?v=dbe19abad-20261029-113024",
  "./src/js/favor-water.js?v=dbe19abad-20261029-113024",
  "./src/js/favor-forage.js?v=dbe19abad-20261029-113024",
  "./src/js/party-formal.js?v=dbe19abad-20261029-113024",
  "./src/js/truth.js?v=dbe19abad-20261029-113024",
  "./src/js/galactic-cast.js?v=dbe19abad-20261029-113024",
  "./src/js/contests.js?v=dbe19abad-20261029-113024",
  "./src/js/broadcast.js?v=dbe19abad-20261029-113024",
  "./src/js/contestEngine.js?v=dbe19abad-20261029-113024",
  "./src/js/alienPlayers.js?v=dbe19abad-20261029-113024",
  "./src/js/storage.js?v=dbe19abad-20261029-113024",
  "./src/js/perceive.js?v=dbe19abad-20261029-113024",
  "./src/js/carexplore.js?v=dbe19abad-20261029-113024",
  "./src/js/justice.js?v=dbe19abad-20261029-113024",
  "./src/js/food.js?v=dbe19abad-20261029-113024",
  "./src/js/betrayal.js?v=dbe19abad-20261029-113024",
  "./src/js/corpses.js?v=dbe19abad-20261029-113024",
  "./src/js/corruption.js?v=dbe19abad-20261029-113024",
  "./src/js/lifeseed.js?v=dbe19abad-20261029-113024",
  "./src/js/spawn-knack.js?v=dbe19abad-20261029-113024",
  "./src/js/trial-deeds.js?v=dbe19abad-20261029-113024",
  "./src/js/practice-deeds.js?v=dbe19abad-20261029-113024",
  "./src/js/tracks.js?v=dbe19abad-20261029-113024",
  "./src/js/villager-build.js?v=dbe19abad-20261029-113024",
  "./src/js/progression.js?v=dbe19abad-20261029-113024",
  "./src/js/waveLedger.js?v=dbe19abad-20261029-113024",
  "./src/js/standing.js?v=dbe19abad-20261029-113024",
  "./src/js/feastBuff.js?v=dbe19abad-20261029-113024",
  "./src/js/ledger.js?v=dbe19abad-20261029-113024",
  "./src/js/exposure.js?v=dbe19abad-20261029-113024",
  "./src/js/abilityActions.js?v=dbe19abad-20261029-113024",
  "./src/js/buildarounds.js?v=dbe19abad-20261029-113024",
  "./src/js/foodPower.js?v=dbe19abad-20261029-113024",
  "./src/js/monsterBehaviors.js?v=dbe19abad-20261029-113024",
  "./src/js/partyTactics.js?v=dbe19abad-20261029-113024",
  "./src/js/sigW3a.js?v=dbe19abad-20261029-113024",
  "./src/js/statusEffects.js?v=dbe19abad-20261029-113024",
  "./src/js/sigW3b.js?v=dbe19abad-20261029-113024",
  "./src/js/metaProgression.js?v=dbe19abad-20261029-113024",
  "./src/js/sigW3c.js?v=dbe19abad-20261029-113024",
  "./src/js/sigW4.js?v=dbe19abad-20261029-113024",
  "./src/js/sigW5.js?v=dbe19abad-20261029-113024",
  "./src/js/villager-agency.js?v=dbe19abad-20261029-113024",
  "./src/js/npc-triggers.js?v=dbe19abad-20261029-113024",
  "./src/js/fieldFights.js?v=dbe19abad-20261029-113024",
  "./src/js/party-wiring.js?v=dbe19abad-20261029-113024",
  "./src/js/party-bond.js?v=dbe19abad-20261029-113024",
  "./src/js/villager-objectives.js?v=dbe19abad-20261029-113024",
  "./src/js/villager-mapmem.js?v=dbe19abad-20261029-113024",
  "./src/js/codex-people.js?v=dbe19abad-20261029-113024",
  "./src/js/fallen-memorial.js?v=dbe19abad-20261029-113024",
  "./src/js/graves.js?v=dbe19abad-20261029-113024",
  "./src/js/membership.js?v=dbe19abad-20261029-113024",
  "./src/js/gardenCultivation.js?v=dbe19abad-20261029-113024",
  "./src/js/havenGrowth.js?v=dbe19abad-20261029-113024",
  "./src/js/shelter.js?v=dbe19abad-20261029-113024",
  "./src/js/hierarchy.js?v=dbe19abad-20261029-113024",
  "./src/js/scaleDiscovery.js?v=dbe19abad-20261029-113024",
  "./src/js/comms.js?v=dbe19abad-20261029-113024",
  "./src/js/table.js?v=dbe19abad-20261029-113024",
  "./src/js/pods.js?v=dbe19abad-20261029-113024",
  "./src/js/titans.js?v=dbe19abad-20261029-113024",
  "./src/js/finale-campaign.js?v=dbe19abad-20261029-113024",
  "./src/js/godhood.js?v=dbe19abad-20261029-113024",
  "./src/js/pantheon.js?v=dbe19abad-20261029-113024",
  "./src/js/records.js?v=dbe19abad-20261029-113024",
  "./src/js/table-feared.js?v=dbe19abad-20261029-113024",
  "./src/js/table-indispensable.js?v=dbe19abad-20261029-113024",
  "./src/js/table-beloved.js?v=dbe19abad-20261029-113024",
  "./src/js/table-witness.js?v=dbe19abad-20261029-113024",
  "./src/js/table-assimilated.js?v=dbe19abad-20261029-113024",
  "./src/js/table-defiant.js?v=dbe19abad-20261029-113024",
  "./src/js/relay-ext.js?v=dbe19abad-20261029-113024",
  "./src/js/relay-dialogue.js?v=dbe19abad-20261029-113024",
  "./src/js/table-relay.js?v=dbe19abad-20261029-113024",
  "./src/js/safetynets.js?v=dbe19abad-20261029-113024",
  "./src/js/villageAgency.js?v=dbe19abad-20261029-113024",
  "./src/js/memdepth.js?v=dbe19abad-20261029-113024",
  "./src/js/overtime.js?v=dbe19abad-20261029-113024",
  "./src/js/network-campaign.js?v=dbe19abad-20261029-113024",
  "./src/js/debug-scenarios.js?v=dbe19abad-20261029-113024",
  "./src/js/keepsakes.js?v=dbe19abad-20261029-113024",
  "./src/js/skill-teaching.js?v=dbe19abad-20261029-113024",
  "./src/js/world.js?v=dbe19abad-20261029-113024",
  "./src/js/nomad.js?v=dbe19abad-20261029-113024",
  "./src/js/nomad-wild.js?v=dbe19abad-20261029-113024",
  "./src/js/nomad-scenes.js?v=dbe19abad-20261029-113024",
  "./src/js/nomad-drive.js?v=dbe19abad-20261029-113024",
  "./src/js/temperature.js?v=dbe19abad-20261029-113024",
  "./src/js/godpath.js?v=dbe19abad-20261029-113024",
  "./src/js/godverbs.js?v=dbe19abad-20261029-113024",
  "./src/js/endingKey.js?v=dbe19abad-20261029-113024",
  "./src/js/telemetry-hooks.js?v=dbe19abad-20261029-113024",
  "./src/js/feel.js?v=dbe19abad-20261029-113024",
  "./src/js/build.js?v=dbe19abad-20261029-113024",
  "./src/js/whereAreWe.js?v=dbe19abad-20261029-113024",
  "./src/js/drama.js?v=dbe19abad-20261029-113024",
  "./src/js/move-anim.js?v=dbe19abad-20261029-113024",
  "./src/js/presentation.js?v=dbe19abad-20261029-113024",
  "./src/js/sprites.js?v=dbe19abad-20261029-113024",
  "./src/js/tile-scenes.js?v=dbe19abad-20261029-113024",
  "./src/js/regional-audio.js?v=dbe19abad-20261029-113024",
  "./src/js/favor-company.js?v=dbe19abad-20261029-113024",
  "./src/js/timeSettlement.js?v=dbe19abad-20261029-113024",
  "./src/js/app.js?v=dbe19abad-20261029-113024",
  "./src/js/feel-audio.js?v=dbe19abad-20261029-113024",
  "./manifest.json?v=dbe19abad-20261029-113024",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=dbe19abad-20261029-113024",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=dbe19abad-20261029-113024",
  "./src/data/alienPlayers.json?v=dbe19abad-20261029-113024",
  "./src/data/animals.json?v=dbe19abad-20261029-113024",
  "./src/data/arrivalText.json?v=dbe19abad-20261029-113024",
  "./src/data/background_survivors.json?v=dbe19abad-20261029-113024",
  "./src/data/biomes.json?v=dbe19abad-20261029-113024",
  "./src/data/books.json?v=dbe19abad-20261029-113024",
  "./src/data/build-notes.json?v=dbe19abad-20261029-113024",
  "./src/data/cell_defs.json?v=dbe19abad-20261029-113024",
  "./src/data/characterGen.json?v=dbe19abad-20261029-113024",
  "./src/data/climates.json?v=dbe19abad-20261029-113024",
  "./src/data/contests.json?v=dbe19abad-20261029-113024",
  "./src/data/cooking.json?v=dbe19abad-20261029-113024",
  "./src/data/events.json?v=dbe19abad-20261029-113024",
  "./src/data/evolutions.json?v=dbe19abad-20261029-113024",
  "./src/data/favor-rules.json?v=dbe19abad-20261029-113024",
  "./src/data/feast-surge.json?v=dbe19abad-20261029-113024",
  "./src/data/foreignSpeech.json?v=dbe19abad-20261029-113024",
  "./src/data/gardening.json?v=dbe19abad-20261029-113024",
  "./src/data/godpaths.json?v=dbe19abad-20261029-113024",
  "./src/data/items.json?v=dbe19abad-20261029-113024",
  "./src/data/justiceVoice.json?v=dbe19abad-20261029-113024",
  "./src/data/knowledge.json?v=dbe19abad-20261029-113024",
  "./src/data/lifeseeds.json?v=dbe19abad-20261029-113024",
  "./src/data/locations.json?v=dbe19abad-20261029-113024",
  "./src/data/monsterBehaviors.json?v=dbe19abad-20261029-113024",
  "./src/data/monsters.json?v=dbe19abad-20261029-113024",
  "./src/data/nameCultures.json?v=dbe19abad-20261029-113024",
  "./src/data/originPicker.json?v=dbe19abad-20261029-113024",
  "./src/data/plants.json?v=dbe19abad-20261029-113024",
  "./src/data/presentation.json?v=dbe19abad-20261029-113024",
  "./src/data/recipes.json?v=dbe19abad-20261029-113024",
  "./src/data/regions.json?v=dbe19abad-20261029-113024",
  "./src/data/relicEnhancements.json?v=dbe19abad-20261029-113024",
  "./src/data/reward-economy.json?v=dbe19abad-20261029-113024",
  "./src/data/schemas.json?v=dbe19abad-20261029-113024",
  "./src/data/statusEffects.json?v=dbe19abad-20261029-113024",
  "./src/data/synergies.json?v=dbe19abad-20261029-113024",
  "./src/data/table-beats.json?v=dbe19abad-20261029-113024",
  "./src/data/table-endings.json?v=dbe19abad-20261029-113024",
  "./src/data/titans.json?v=dbe19abad-20261029-113024",
  "./src/data/tracks.json?v=dbe19abad-20261029-113024",
  "./src/data/villagers.json?v=dbe19abad-20261029-113024",
  "./src/data/wave-ledger.json?v=dbe19abad-20261029-113024"
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
