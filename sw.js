/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = '8c4db3ce2-20261115-232613';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=8c4db3ce2-20261115-232613",
  "./src/js/engine/modifiers.js?v=8c4db3ce2-20261115-232613",
  "./src/js/engine/calories.js?v=8c4db3ce2-20261115-232613",
  "./src/js/engine/day.js?v=8c4db3ce2-20261115-232613",
  "./src/js/engine/forage.js?v=8c4db3ce2-20261115-232613",
  "./src/js/engine/combat.js?v=8c4db3ce2-20261115-232613",
  "./src/js/audio-registry.js?v=8c4db3ce2-20261115-232613",
  "./src/js/text.js?v=8c4db3ce2-20261115-232613",
  "./src/js/game.js?v=8c4db3ce2-20261115-232613",
  "./src/js/encounters.js?v=8c4db3ce2-20261115-232613",
  "./src/js/conversation.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convo-mood.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convoTopics.js?v=8c4db3ce2-20261115-232613",
  "./src/js/naming-rite.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convo-wants.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convo-dialogue.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convo-beats.js?v=8c4db3ce2-20261115-232613",
  "./src/js/convo-scene.js?v=8c4db3ce2-20261115-232613",
  "./src/js/voice-piper.js?v=8c4db3ce2-20261115-232613",
  "./src/js/voice-system.js?v=8c4db3ce2-20261115-232613",
  "./src/js/examine.js?v=8c4db3ce2-20261115-232613",
  "./src/js/equipment.js?v=8c4db3ce2-20261115-232613",
  "./src/js/journal.js?v=8c4db3ce2-20261115-232613",
  "./src/js/party.js?v=8c4db3ce2-20261115-232613",
  "./src/js/favor-water.js?v=8c4db3ce2-20261115-232613",
  "./src/js/favor-forage.js?v=8c4db3ce2-20261115-232613",
  "./src/js/favor-outing.js?v=8c4db3ce2-20261115-232613",
  "./src/js/party-formal.js?v=8c4db3ce2-20261115-232613",
  "./src/js/truth.js?v=8c4db3ce2-20261115-232613",
  "./src/js/galactic-cast.js?v=8c4db3ce2-20261115-232613",
  "./src/js/contests.js?v=8c4db3ce2-20261115-232613",
  "./src/js/broadcast.js?v=8c4db3ce2-20261115-232613",
  "./src/js/contestEngine.js?v=8c4db3ce2-20261115-232613",
  "./src/js/alienPlayers.js?v=8c4db3ce2-20261115-232613",
  "./src/js/storage.js?v=8c4db3ce2-20261115-232613",
  "./src/js/perceive.js?v=8c4db3ce2-20261115-232613",
  "./src/js/carexplore.js?v=8c4db3ce2-20261115-232613",
  "./src/js/justice.js?v=8c4db3ce2-20261115-232613",
  "./src/js/food.js?v=8c4db3ce2-20261115-232613",
  "./src/js/betrayal.js?v=8c4db3ce2-20261115-232613",
  "./src/js/corpses.js?v=8c4db3ce2-20261115-232613",
  "./src/js/corruption.js?v=8c4db3ce2-20261115-232613",
  "./src/js/lifeseed.js?v=8c4db3ce2-20261115-232613",
  "./src/js/spawn-knack.js?v=8c4db3ce2-20261115-232613",
  "./src/js/trial-deeds.js?v=8c4db3ce2-20261115-232613",
  "./src/js/practice-deeds.js?v=8c4db3ce2-20261115-232613",
  "./src/js/tracks.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-build.js?v=8c4db3ce2-20261115-232613",
  "./src/js/progression.js?v=8c4db3ce2-20261115-232613",
  "./src/js/waveLedger.js?v=8c4db3ce2-20261115-232613",
  "./src/js/standing.js?v=8c4db3ce2-20261115-232613",
  "./src/js/ladder.js?v=8c4db3ce2-20261115-232613",
  "./src/js/feastBuff.js?v=8c4db3ce2-20261115-232613",
  "./src/js/ledger.js?v=8c4db3ce2-20261115-232613",
  "./src/js/exposure.js?v=8c4db3ce2-20261115-232613",
  "./src/js/abilityActions.js?v=8c4db3ce2-20261115-232613",
  "./src/js/buildarounds.js?v=8c4db3ce2-20261115-232613",
  "./src/js/foodPower.js?v=8c4db3ce2-20261115-232613",
  "./src/js/monsterBehaviors.js?v=8c4db3ce2-20261115-232613",
  "./src/js/partyTactics.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sigW3a.js?v=8c4db3ce2-20261115-232613",
  "./src/js/statusEffects.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sigW3b.js?v=8c4db3ce2-20261115-232613",
  "./src/js/metaProgression.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sigW3c.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sigW4.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sigW5.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-agency.js?v=8c4db3ce2-20261115-232613",
  "./src/js/win-plan.js?v=8c4db3ce2-20261115-232613",
  "./src/js/npc-triggers.js?v=8c4db3ce2-20261115-232613",
  "./src/js/fieldFights.js?v=8c4db3ce2-20261115-232613",
  "./src/js/party-wiring.js?v=8c4db3ce2-20261115-232613",
  "./src/js/party-bond.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-objectives.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-goals.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-brain.js?v=8c4db3ce2-20261115-232613",
  "./src/js/bond-initiation.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villager-mapmem.js?v=8c4db3ce2-20261115-232613",
  "./src/js/codex-people.js?v=8c4db3ce2-20261115-232613",
  "./src/js/fallen-memorial.js?v=8c4db3ce2-20261115-232613",
  "./src/js/graves.js?v=8c4db3ce2-20261115-232613",
  "./src/js/membership.js?v=8c4db3ce2-20261115-232613",
  "./src/js/gardenCultivation.js?v=8c4db3ce2-20261115-232613",
  "./src/js/havenGrowth.js?v=8c4db3ce2-20261115-232613",
  "./src/js/shelter.js?v=8c4db3ce2-20261115-232613",
  "./src/js/hierarchy.js?v=8c4db3ce2-20261115-232613",
  "./src/js/scaleDiscovery.js?v=8c4db3ce2-20261115-232613",
  "./src/js/comms.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table.js?v=8c4db3ce2-20261115-232613",
  "./src/js/pods.js?v=8c4db3ce2-20261115-232613",
  "./src/js/titans.js?v=8c4db3ce2-20261115-232613",
  "./src/js/finale-campaign.js?v=8c4db3ce2-20261115-232613",
  "./src/js/godhood.js?v=8c4db3ce2-20261115-232613",
  "./src/js/pantheon.js?v=8c4db3ce2-20261115-232613",
  "./src/js/records.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-feared.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-indispensable.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-beloved.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-witness.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-assimilated.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-defiant.js?v=8c4db3ce2-20261115-232613",
  "./src/js/relay-ext.js?v=8c4db3ce2-20261115-232613",
  "./src/js/relay-dialogue.js?v=8c4db3ce2-20261115-232613",
  "./src/js/table-relay.js?v=8c4db3ce2-20261115-232613",
  "./src/js/safetynets.js?v=8c4db3ce2-20261115-232613",
  "./src/js/villageAgency.js?v=8c4db3ce2-20261115-232613",
  "./src/js/memdepth.js?v=8c4db3ce2-20261115-232613",
  "./src/js/overtime.js?v=8c4db3ce2-20261115-232613",
  "./src/js/network-campaign.js?v=8c4db3ce2-20261115-232613",
  "./src/js/debug-scenarios.js?v=8c4db3ce2-20261115-232613",
  "./src/js/keepsakes.js?v=8c4db3ce2-20261115-232613",
  "./src/js/skill-teaching.js?v=8c4db3ce2-20261115-232613",
  "./src/js/person-trust.js?v=8c4db3ce2-20261115-232613",
  "./src/js/companion-score.js?v=8c4db3ce2-20261115-232613",
  "./src/js/world.js?v=8c4db3ce2-20261115-232613",
  "./src/js/nomad.js?v=8c4db3ce2-20261115-232613",
  "./src/js/nomad-wild.js?v=8c4db3ce2-20261115-232613",
  "./src/js/nomad-scenes.js?v=8c4db3ce2-20261115-232613",
  "./src/js/nomad-drive.js?v=8c4db3ce2-20261115-232613",
  "./src/js/temperature.js?v=8c4db3ce2-20261115-232613",
  "./src/js/godpath.js?v=8c4db3ce2-20261115-232613",
  "./src/js/godverbs.js?v=8c4db3ce2-20261115-232613",
  "./src/js/endingKey.js?v=8c4db3ce2-20261115-232613",
  "./src/js/telemetry-hooks.js?v=8c4db3ce2-20261115-232613",
  "./src/js/finishLog.js?v=8c4db3ce2-20261115-232613",
  "./src/js/feel.js?v=8c4db3ce2-20261115-232613",
  "./src/js/build.js?v=8c4db3ce2-20261115-232613",
  "./src/js/whereAreWe.js?v=8c4db3ce2-20261115-232613",
  "./src/js/drama.js?v=8c4db3ce2-20261115-232613",
  "./src/js/move-anim.js?v=8c4db3ce2-20261115-232613",
  "./src/js/presentation.js?v=8c4db3ce2-20261115-232613",
  "./src/js/sprites.js?v=8c4db3ce2-20261115-232613",
  "./src/js/tile-scenes.js?v=8c4db3ce2-20261115-232613",
  "./src/js/regional-audio.js?v=8c4db3ce2-20261115-232613",
  "./src/js/favor-company.js?v=8c4db3ce2-20261115-232613",
  "./src/js/timeSettlement.js?v=8c4db3ce2-20261115-232613",
  "./src/js/app.js?v=8c4db3ce2-20261115-232613",
  "./src/js/feel-audio.js?v=8c4db3ce2-20261115-232613",
  "./manifest.json?v=8c4db3ce2-20261115-232613",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=8c4db3ce2-20261115-232613",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=8c4db3ce2-20261115-232613",
  "./src/data/alienPlayers.json?v=8c4db3ce2-20261115-232613",
  "./src/data/animals.json?v=8c4db3ce2-20261115-232613",
  "./src/data/arrivalText.json?v=8c4db3ce2-20261115-232613",
  "./src/data/background_survivors.json?v=8c4db3ce2-20261115-232613",
  "./src/data/biomes.json?v=8c4db3ce2-20261115-232613",
  "./src/data/books.json?v=8c4db3ce2-20261115-232613",
  "./src/data/build-notes.json?v=8c4db3ce2-20261115-232613",
  "./src/data/cell_defs.json?v=8c4db3ce2-20261115-232613",
  "./src/data/characterGen.json?v=8c4db3ce2-20261115-232613",
  "./src/data/climates.json?v=8c4db3ce2-20261115-232613",
  "./src/data/contests.json?v=8c4db3ce2-20261115-232613",
  "./src/data/cooking.json?v=8c4db3ce2-20261115-232613",
  "./src/data/events.json?v=8c4db3ce2-20261115-232613",
  "./src/data/evolutions.json?v=8c4db3ce2-20261115-232613",
  "./src/data/favor-rules.json?v=8c4db3ce2-20261115-232613",
  "./src/data/feast-surge.json?v=8c4db3ce2-20261115-232613",
  "./src/data/foreignSpeech.json?v=8c4db3ce2-20261115-232613",
  "./src/data/gardening.json?v=8c4db3ce2-20261115-232613",
  "./src/data/godpaths.json?v=8c4db3ce2-20261115-232613",
  "./src/data/items.json?v=8c4db3ce2-20261115-232613",
  "./src/data/justiceVoice.json?v=8c4db3ce2-20261115-232613",
  "./src/data/knowledge.json?v=8c4db3ce2-20261115-232613",
  "./src/data/ladder-capstones.json?v=8c4db3ce2-20261115-232613",
  "./src/data/lifeseeds.json?v=8c4db3ce2-20261115-232613",
  "./src/data/locations.json?v=8c4db3ce2-20261115-232613",
  "./src/data/monsterBehaviors.json?v=8c4db3ce2-20261115-232613",
  "./src/data/monsters.json?v=8c4db3ce2-20261115-232613",
  "./src/data/nameCultures.json?v=8c4db3ce2-20261115-232613",
  "./src/data/originPicker.json?v=8c4db3ce2-20261115-232613",
  "./src/data/pellet-boost.json?v=8c4db3ce2-20261115-232613",
  "./src/data/plants.json?v=8c4db3ce2-20261115-232613",
  "./src/data/presentation.json?v=8c4db3ce2-20261115-232613",
  "./src/data/recipes.json?v=8c4db3ce2-20261115-232613",
  "./src/data/regions.json?v=8c4db3ce2-20261115-232613",
  "./src/data/relicEnhancements.json?v=8c4db3ce2-20261115-232613",
  "./src/data/reward-economy.json?v=8c4db3ce2-20261115-232613",
  "./src/data/schemas.json?v=8c4db3ce2-20261115-232613",
  "./src/data/statusEffects.json?v=8c4db3ce2-20261115-232613",
  "./src/data/synergies.json?v=8c4db3ce2-20261115-232613",
  "./src/data/table-beats.json?v=8c4db3ce2-20261115-232613",
  "./src/data/table-endings.json?v=8c4db3ce2-20261115-232613",
  "./src/data/titans.json?v=8c4db3ce2-20261115-232613",
  "./src/data/tracks.json?v=8c4db3ce2-20261115-232613",
  "./src/data/villagers.json?v=8c4db3ce2-20261115-232613",
  "./src/data/wave-ledger.json?v=8c4db3ce2-20261115-232613"
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
