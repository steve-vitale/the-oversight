/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'fa8f9289d-20261114-234552';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=fa8f9289d-20261114-234552",
  "./src/js/engine/modifiers.js?v=fa8f9289d-20261114-234552",
  "./src/js/engine/calories.js?v=fa8f9289d-20261114-234552",
  "./src/js/engine/day.js?v=fa8f9289d-20261114-234552",
  "./src/js/engine/forage.js?v=fa8f9289d-20261114-234552",
  "./src/js/engine/combat.js?v=fa8f9289d-20261114-234552",
  "./src/js/audio-registry.js?v=fa8f9289d-20261114-234552",
  "./src/js/text.js?v=fa8f9289d-20261114-234552",
  "./src/js/game.js?v=fa8f9289d-20261114-234552",
  "./src/js/encounters.js?v=fa8f9289d-20261114-234552",
  "./src/js/conversation.js?v=fa8f9289d-20261114-234552",
  "./src/js/convo-mood.js?v=fa8f9289d-20261114-234552",
  "./src/js/convoTopics.js?v=fa8f9289d-20261114-234552",
  "./src/js/naming-rite.js?v=fa8f9289d-20261114-234552",
  "./src/js/convo-wants.js?v=fa8f9289d-20261114-234552",
  "./src/js/convo-dialogue.js?v=fa8f9289d-20261114-234552",
  "./src/js/convo-beats.js?v=fa8f9289d-20261114-234552",
  "./src/js/convo-scene.js?v=fa8f9289d-20261114-234552",
  "./src/js/voice-piper.js?v=fa8f9289d-20261114-234552",
  "./src/js/voice-system.js?v=fa8f9289d-20261114-234552",
  "./src/js/examine.js?v=fa8f9289d-20261114-234552",
  "./src/js/equipment.js?v=fa8f9289d-20261114-234552",
  "./src/js/journal.js?v=fa8f9289d-20261114-234552",
  "./src/js/party.js?v=fa8f9289d-20261114-234552",
  "./src/js/favor-water.js?v=fa8f9289d-20261114-234552",
  "./src/js/favor-forage.js?v=fa8f9289d-20261114-234552",
  "./src/js/favor-outing.js?v=fa8f9289d-20261114-234552",
  "./src/js/party-formal.js?v=fa8f9289d-20261114-234552",
  "./src/js/truth.js?v=fa8f9289d-20261114-234552",
  "./src/js/galactic-cast.js?v=fa8f9289d-20261114-234552",
  "./src/js/contests.js?v=fa8f9289d-20261114-234552",
  "./src/js/broadcast.js?v=fa8f9289d-20261114-234552",
  "./src/js/contestEngine.js?v=fa8f9289d-20261114-234552",
  "./src/js/alienPlayers.js?v=fa8f9289d-20261114-234552",
  "./src/js/storage.js?v=fa8f9289d-20261114-234552",
  "./src/js/perceive.js?v=fa8f9289d-20261114-234552",
  "./src/js/carexplore.js?v=fa8f9289d-20261114-234552",
  "./src/js/justice.js?v=fa8f9289d-20261114-234552",
  "./src/js/food.js?v=fa8f9289d-20261114-234552",
  "./src/js/betrayal.js?v=fa8f9289d-20261114-234552",
  "./src/js/corpses.js?v=fa8f9289d-20261114-234552",
  "./src/js/corruption.js?v=fa8f9289d-20261114-234552",
  "./src/js/lifeseed.js?v=fa8f9289d-20261114-234552",
  "./src/js/spawn-knack.js?v=fa8f9289d-20261114-234552",
  "./src/js/trial-deeds.js?v=fa8f9289d-20261114-234552",
  "./src/js/practice-deeds.js?v=fa8f9289d-20261114-234552",
  "./src/js/tracks.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-build.js?v=fa8f9289d-20261114-234552",
  "./src/js/progression.js?v=fa8f9289d-20261114-234552",
  "./src/js/waveLedger.js?v=fa8f9289d-20261114-234552",
  "./src/js/standing.js?v=fa8f9289d-20261114-234552",
  "./src/js/ladder.js?v=fa8f9289d-20261114-234552",
  "./src/js/feastBuff.js?v=fa8f9289d-20261114-234552",
  "./src/js/ledger.js?v=fa8f9289d-20261114-234552",
  "./src/js/exposure.js?v=fa8f9289d-20261114-234552",
  "./src/js/abilityActions.js?v=fa8f9289d-20261114-234552",
  "./src/js/buildarounds.js?v=fa8f9289d-20261114-234552",
  "./src/js/foodPower.js?v=fa8f9289d-20261114-234552",
  "./src/js/monsterBehaviors.js?v=fa8f9289d-20261114-234552",
  "./src/js/partyTactics.js?v=fa8f9289d-20261114-234552",
  "./src/js/sigW3a.js?v=fa8f9289d-20261114-234552",
  "./src/js/statusEffects.js?v=fa8f9289d-20261114-234552",
  "./src/js/sigW3b.js?v=fa8f9289d-20261114-234552",
  "./src/js/metaProgression.js?v=fa8f9289d-20261114-234552",
  "./src/js/sigW3c.js?v=fa8f9289d-20261114-234552",
  "./src/js/sigW4.js?v=fa8f9289d-20261114-234552",
  "./src/js/sigW5.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-agency.js?v=fa8f9289d-20261114-234552",
  "./src/js/win-plan.js?v=fa8f9289d-20261114-234552",
  "./src/js/npc-triggers.js?v=fa8f9289d-20261114-234552",
  "./src/js/fieldFights.js?v=fa8f9289d-20261114-234552",
  "./src/js/party-wiring.js?v=fa8f9289d-20261114-234552",
  "./src/js/party-bond.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-objectives.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-goals.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-brain.js?v=fa8f9289d-20261114-234552",
  "./src/js/bond-initiation.js?v=fa8f9289d-20261114-234552",
  "./src/js/villager-mapmem.js?v=fa8f9289d-20261114-234552",
  "./src/js/codex-people.js?v=fa8f9289d-20261114-234552",
  "./src/js/fallen-memorial.js?v=fa8f9289d-20261114-234552",
  "./src/js/graves.js?v=fa8f9289d-20261114-234552",
  "./src/js/membership.js?v=fa8f9289d-20261114-234552",
  "./src/js/gardenCultivation.js?v=fa8f9289d-20261114-234552",
  "./src/js/havenGrowth.js?v=fa8f9289d-20261114-234552",
  "./src/js/shelter.js?v=fa8f9289d-20261114-234552",
  "./src/js/hierarchy.js?v=fa8f9289d-20261114-234552",
  "./src/js/scaleDiscovery.js?v=fa8f9289d-20261114-234552",
  "./src/js/comms.js?v=fa8f9289d-20261114-234552",
  "./src/js/table.js?v=fa8f9289d-20261114-234552",
  "./src/js/pods.js?v=fa8f9289d-20261114-234552",
  "./src/js/titans.js?v=fa8f9289d-20261114-234552",
  "./src/js/finale-campaign.js?v=fa8f9289d-20261114-234552",
  "./src/js/godhood.js?v=fa8f9289d-20261114-234552",
  "./src/js/pantheon.js?v=fa8f9289d-20261114-234552",
  "./src/js/records.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-feared.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-indispensable.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-beloved.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-witness.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-assimilated.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-defiant.js?v=fa8f9289d-20261114-234552",
  "./src/js/relay-ext.js?v=fa8f9289d-20261114-234552",
  "./src/js/relay-dialogue.js?v=fa8f9289d-20261114-234552",
  "./src/js/table-relay.js?v=fa8f9289d-20261114-234552",
  "./src/js/safetynets.js?v=fa8f9289d-20261114-234552",
  "./src/js/villageAgency.js?v=fa8f9289d-20261114-234552",
  "./src/js/memdepth.js?v=fa8f9289d-20261114-234552",
  "./src/js/overtime.js?v=fa8f9289d-20261114-234552",
  "./src/js/network-campaign.js?v=fa8f9289d-20261114-234552",
  "./src/js/debug-scenarios.js?v=fa8f9289d-20261114-234552",
  "./src/js/keepsakes.js?v=fa8f9289d-20261114-234552",
  "./src/js/skill-teaching.js?v=fa8f9289d-20261114-234552",
  "./src/js/person-trust.js?v=fa8f9289d-20261114-234552",
  "./src/js/companion-score.js?v=fa8f9289d-20261114-234552",
  "./src/js/world.js?v=fa8f9289d-20261114-234552",
  "./src/js/nomad.js?v=fa8f9289d-20261114-234552",
  "./src/js/nomad-wild.js?v=fa8f9289d-20261114-234552",
  "./src/js/nomad-scenes.js?v=fa8f9289d-20261114-234552",
  "./src/js/nomad-drive.js?v=fa8f9289d-20261114-234552",
  "./src/js/temperature.js?v=fa8f9289d-20261114-234552",
  "./src/js/godpath.js?v=fa8f9289d-20261114-234552",
  "./src/js/godverbs.js?v=fa8f9289d-20261114-234552",
  "./src/js/endingKey.js?v=fa8f9289d-20261114-234552",
  "./src/js/telemetry-hooks.js?v=fa8f9289d-20261114-234552",
  "./src/js/finishLog.js?v=fa8f9289d-20261114-234552",
  "./src/js/feel.js?v=fa8f9289d-20261114-234552",
  "./src/js/build.js?v=fa8f9289d-20261114-234552",
  "./src/js/whereAreWe.js?v=fa8f9289d-20261114-234552",
  "./src/js/drama.js?v=fa8f9289d-20261114-234552",
  "./src/js/move-anim.js?v=fa8f9289d-20261114-234552",
  "./src/js/presentation.js?v=fa8f9289d-20261114-234552",
  "./src/js/sprites.js?v=fa8f9289d-20261114-234552",
  "./src/js/tile-scenes.js?v=fa8f9289d-20261114-234552",
  "./src/js/regional-audio.js?v=fa8f9289d-20261114-234552",
  "./src/js/favor-company.js?v=fa8f9289d-20261114-234552",
  "./src/js/timeSettlement.js?v=fa8f9289d-20261114-234552",
  "./src/js/app.js?v=fa8f9289d-20261114-234552",
  "./src/js/feel-audio.js?v=fa8f9289d-20261114-234552",
  "./manifest.json?v=fa8f9289d-20261114-234552",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=fa8f9289d-20261114-234552",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=fa8f9289d-20261114-234552",
  "./src/data/alienPlayers.json?v=fa8f9289d-20261114-234552",
  "./src/data/animals.json?v=fa8f9289d-20261114-234552",
  "./src/data/arrivalText.json?v=fa8f9289d-20261114-234552",
  "./src/data/background_survivors.json?v=fa8f9289d-20261114-234552",
  "./src/data/biomes.json?v=fa8f9289d-20261114-234552",
  "./src/data/books.json?v=fa8f9289d-20261114-234552",
  "./src/data/build-notes.json?v=fa8f9289d-20261114-234552",
  "./src/data/cell_defs.json?v=fa8f9289d-20261114-234552",
  "./src/data/characterGen.json?v=fa8f9289d-20261114-234552",
  "./src/data/climates.json?v=fa8f9289d-20261114-234552",
  "./src/data/contests.json?v=fa8f9289d-20261114-234552",
  "./src/data/cooking.json?v=fa8f9289d-20261114-234552",
  "./src/data/events.json?v=fa8f9289d-20261114-234552",
  "./src/data/evolutions.json?v=fa8f9289d-20261114-234552",
  "./src/data/favor-rules.json?v=fa8f9289d-20261114-234552",
  "./src/data/feast-surge.json?v=fa8f9289d-20261114-234552",
  "./src/data/foreignSpeech.json?v=fa8f9289d-20261114-234552",
  "./src/data/gardening.json?v=fa8f9289d-20261114-234552",
  "./src/data/godpaths.json?v=fa8f9289d-20261114-234552",
  "./src/data/items.json?v=fa8f9289d-20261114-234552",
  "./src/data/justiceVoice.json?v=fa8f9289d-20261114-234552",
  "./src/data/knowledge.json?v=fa8f9289d-20261114-234552",
  "./src/data/ladder-capstones.json?v=fa8f9289d-20261114-234552",
  "./src/data/lifeseeds.json?v=fa8f9289d-20261114-234552",
  "./src/data/locations.json?v=fa8f9289d-20261114-234552",
  "./src/data/monsterBehaviors.json?v=fa8f9289d-20261114-234552",
  "./src/data/monsters.json?v=fa8f9289d-20261114-234552",
  "./src/data/nameCultures.json?v=fa8f9289d-20261114-234552",
  "./src/data/originPicker.json?v=fa8f9289d-20261114-234552",
  "./src/data/pellet-boost.json?v=fa8f9289d-20261114-234552",
  "./src/data/plants.json?v=fa8f9289d-20261114-234552",
  "./src/data/presentation.json?v=fa8f9289d-20261114-234552",
  "./src/data/recipes.json?v=fa8f9289d-20261114-234552",
  "./src/data/regions.json?v=fa8f9289d-20261114-234552",
  "./src/data/relicEnhancements.json?v=fa8f9289d-20261114-234552",
  "./src/data/reward-economy.json?v=fa8f9289d-20261114-234552",
  "./src/data/schemas.json?v=fa8f9289d-20261114-234552",
  "./src/data/statusEffects.json?v=fa8f9289d-20261114-234552",
  "./src/data/synergies.json?v=fa8f9289d-20261114-234552",
  "./src/data/table-beats.json?v=fa8f9289d-20261114-234552",
  "./src/data/table-endings.json?v=fa8f9289d-20261114-234552",
  "./src/data/titans.json?v=fa8f9289d-20261114-234552",
  "./src/data/tracks.json?v=fa8f9289d-20261114-234552",
  "./src/data/villagers.json?v=fa8f9289d-20261114-234552",
  "./src/data/wave-ledger.json?v=fa8f9289d-20261114-234552"
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
