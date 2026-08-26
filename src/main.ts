import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './assets/main.css'
import { evictStaleDays, queryClient, restoreQueryCache } from './lib/query'
import { preventPinchZoom } from './lib/viewport'
import { router } from './router'

async function bootstrap() {
  preventPinchZoom()

  // Rehydrate before mounting: mounting first would render an empty cache for a frame
  // and show nothing at all on an offline launch.
  await restoreQueryCache()
  evictStaleDays()

  createApp(App)
    .use(createPinia())
    .use(router)
    .use(VueQueryPlugin, { queryClient })
    .mount('#app')
}

void bootstrap()
