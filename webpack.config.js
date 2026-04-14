const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    startPage: './source/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.[chunkhash].js',
  },
  devServer: {
    server: 'http',
    historyApiFallback: true,
    magicHtml: true,
    allowedHosts: 'all',
    port: 3000,
    static: [
      { directory: path.resolve(__dirname), publicPath: '/' },
      { directory: path.resolve(__dirname, 'source'), publicPath: '/' },
    ],
  },
  devtool: 'eval-cheap-source-map',
  plugins: [
    new HtmlPlugin({
      template: './source/index.html',
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'favicon.svg', to: 'favicon.svg' },
        { from: 'memonk-lineart.jpeg', to: 'memonk-lineart.jpeg' },
        { from: 'source/mascot', to: 'mascot' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
