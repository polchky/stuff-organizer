module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'airbnb-base',
        'plugin:vue/recommended',
    ],
    rules: {
        'arrow-parens': [
            'error',
            'always',
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'import/no-unresolved': [
            'off',
        ],
        indent: [
            'error',
            4,
        ],
        'vue/html-indent': [
            'error',
            4,
        ],
        'no-param-reassign': [
            2,
            {
                props: false,
            },
        ],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};