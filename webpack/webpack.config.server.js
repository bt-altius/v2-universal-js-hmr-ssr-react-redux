import path from 'path';
import webpack from 'webpack';
import qs from 'querystring';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

// Paths
const root = process.cwd();
const src = path.join(root, 'src');
const build = path.join(root, 'build');
const universal = path.join(src, 'universal');
const server = path.join(src, 'server');

const serverInclude = [server, universal];

export default {
    context: src,
    target: 'node',
    mode: "production",
    entry: {
        prerender: './universal/routes/Routes.js'
    },
    output: {
        path: build,
        chunkFilename: '[name]_[hash:5].js',
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        publicPath: '/static/'
    },
    resolve: {
        extensions: ['.js'],
        modules: [src, 'node_modules']
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        // minChunkSize should be 50000 for production apps 10 is for this example
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 5, minChunkSize: 10 }),
        new webpack.DefinePlugin({
            '__CLIENT__': false,
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
                test: /\.css$/,
                include: serverInclude,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]_[local]_[hash:5]'
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                include: serverInclude,
                use: [
                    'babel-loader'
                ]
            }

        ]
    }
};
