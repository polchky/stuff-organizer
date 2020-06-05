import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from '@/App.vue';
import VueGAPI from 'vue-gapi';

Vue.config.productionTip = false;

const apiConfig = {
    clientId: process.env.VUE_APP_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: 'https://www.googleapis.com/auth/drive.appdata',
};
Vue.use(VueGAPI, apiConfig);

new Vue({
    vuetify,
    render: (h) => h(App),
}).$mount('#app');
