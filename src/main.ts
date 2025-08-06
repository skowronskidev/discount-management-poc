import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Register AG Grid Community modules
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const app = createApp(App)

app.mount('#app')
