import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { Button, Picker, Toast, Popup, List, Cell  } from 'vant';

Vue.use(Button);
Vue.use(Picker);
Vue.use(Toast);
Vue.use(Popup);
Vue.use(List);
Vue.use(Cell);

Vue.config.productionTip = false;

Vue.prototype.$toast = Toast

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
