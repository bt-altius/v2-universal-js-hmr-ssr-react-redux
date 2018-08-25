import path from 'path';
import webpack from 'webpack';
import qs from 'querystring';

import AssetsPlugin from 'assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';


const root = process.cwd();
const src = path.join(root, 'src');
const build = path.join(root, 'build');

const clientSrc = path.join(src, 'client');
const universalSrc = path.join(src, 'universal');

const clientInclude = [clientSrc, universalSrc];

export default {
    context: src,
    mode: "production",
    entry: {
        app: [
            'babel-polyfill/dist/polyfill.js',
            './client/client.js'
        ]
    },
    output: {
        filename: '[name].[hash:5].js',
        chunkFilename: '[name].chunk.[hash:5].js',
        path: build,
        publicPath: '/static/'
    },
    resolve: {
        extensions: ['.js'],
        modules: [src, 'node_modules'],
        unsafeCache: true
    },
    node: {
        dns: 'mock',
        net: 'mock'
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[hash:5].css",
            chunkFilename: "[name].chunk.[hash:5].css"
        }),
        new webpack.NormalModuleReplacementPlugin(/\.\.\/routes\/static/, '../routes/async'),
        new webpack.optimize.AggressiveMergingPlugin(),
        // minChunkSize should be 50000 for production apps 10 is for this example
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 5, minChunkSize: 10 }),
        new AssetsPlugin({ path: build, filename: 'assets.json' }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            '__CLIENT__': true,
            '__PRODUCTION__': true,
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin()
        ],
        runtimeChunk: {
            name: 'runtime'
        },
        splitChunks: {
            chunks: 'all',
            name: true,
            cacheGroups: {
                // Cache vendor && client javascript on CDN...
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: Infinity,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|j|jpeg|gif|svg|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                include: clientInclude,
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.css$/,
                include: clientInclude,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[local]_[hash:5]'
                        }
                    }
                ]
            }

        ]
    }
};
