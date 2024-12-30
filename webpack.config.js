const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')

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
  },
  devtool: 'eval-cheap-source-map',
  plugins: [
    new HtmlPlugin({
      template: './source/index.html',
    }),
    new CleanWebpackPlugin(),
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
