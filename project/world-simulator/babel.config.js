/* eslint-disable no-undef */
module.exports = {
    presets: [['@babel/preset-env', {
        targets: {
            node: process.versions.node
        }
    }]],
    plugins: [
        'babel-plugin-transform-class-properties'
    ]
};