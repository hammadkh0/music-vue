import './assets/base.css';
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VeeValidatePlugin from './includes/validation';
import { auth } from './includes/firebase';

import App from './App.vue';
import router from './router';
import Icon from './directives/icon';
import i189 from './includes/i189';
import GlobalComponents from './includes/_globals';

let app;
auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App);

    app.use(createPinia());
    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(i189);
    app.use(GlobalComponents);
    app.directive('icon', Icon);
    app.mount('#app');
  }
});
