import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router).use(Antd)

app.mount('#app')
