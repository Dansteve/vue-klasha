const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    mode: 'development',
    entry: { klasha: './examples/commonjs/app.js' },
    output: {
        // Kept out of ./dist so the example bundle can never be published.
        path: path.resolve(__dirname, '../.dev-dist'),
        publicPath: '/dist/',
        filename: '[name].js'
    },
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            }
        ]
    },
    plugins: [new VueLoaderPlugin()],
    devServer: {
        static: [
            { directory: path.resolve(__dirname, '../examples/commonjs') },
            {
                directory: path.resolve(__dirname, '../.dev-dist'),
                publicPath: '/dist'
            }
        ],
        hot: true,
        open: true,
        port: 8080
    },
    devtool: 'eval-source-map'
};
