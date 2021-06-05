module.exports = {
    transpileDependencies: [
        'vuetify',
    ],
    lintOnSave: false,
    chainWebpack: (config) => {
        config.plugin('copy').tap(([pathConfigs]) => {
            pathConfigs.unshift({
                from: 'cfg',
                to: 'cfg',
            });
            return [pathConfigs];
        });
    },
};
