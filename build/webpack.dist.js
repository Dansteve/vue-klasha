const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const ESLintPlugin = require('eslint-webpack-plugin');

const outputPath = path.resolve(__dirname, '../dist');

const rules = [
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
];

const plugins = () => [
    new VueLoaderPlugin(),
    new ESLintPlugin({ extensions: ['js', 'vue'] })
];

// Vue is a peerDependency: it must never be bundled, or consumers end up with
// two Vue instances.
const umd = {
    mode: 'production',
    entry: { klasha: './src/index.js' },
    output: {
        path: outputPath,
        publicPath: '/dist/',
        filename: '[name].min.js',
        library: 'VueKlasha',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true
    },
    externals: {
        vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue',
            root: 'Vue'
        }
    },
    module: { rules },
    plugins: plugins(),
    devtool: 'source-map'
};

const esm = {
    mode: 'production',
    entry: { klasha: './src/index.js' },
    experiments: { outputModule: true },
    output: {
        path: outputPath,
        publicPath: '/dist/',
        filename: '[name].esm.js',
        library: { type: 'module' },
        environment: { module: true }
    },
    externalsType: 'module',
    externals: { vue: 'vue' },
    module: { rules },
    plugins: plugins(),
    optimization: {
        // Keep the ESM build readable-ish and let the consumer's bundler
        // do the final minification/tree-shaking.
        minimize: false
    },
    devtool: 'source-map'
};

module.exports = [umd, esm];
