import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/es5/util/colors';

const options = {
    theme: {
        dark: true,
        themes: {
            dark: {
                primary: colors.blue.base,
                secondary: colors.purple.base,
                accent: colors.teal.base,
                error: colors.red.base,
                warning: colors.amber.base,
                info: colors.blue.base,
                success: colors.green.base,
            },
        },
    },
    icons: {
        iconfont: 'mdi',
    },
};

Vue.use(Vuetify);

export default new Vuetify(options);
