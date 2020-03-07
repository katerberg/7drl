const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackTemplate = require('html-webpack-template')

module.exports = (env) => {
    return {
        entry: './src/index.js',
        plugins: [
            new HtmlWebpackPlugin({
                inject: false,
                template: HtmlWebpackTemplate,
                bodyHtmlSnippet: '<div class="contents"></div>',
                title: 'Rogue'
            }),
        ],
        output: {
            path: `${__dirname}/dist`,
            publicPath: './',
            filename: 'bundle.[contenthash].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: ['file-loader']
                },
                {
                    test: /\.css$/,
                    loaders: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(eot|otf|ttf|woff|woff2)$/,
                    use: 'file-loader'
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        devServer: {
            contentBase: './dist',
            historyApiFallback: true
        }
    }
}
