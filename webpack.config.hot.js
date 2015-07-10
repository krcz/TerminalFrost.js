var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: ['webpack/hot/dev-server', './src/js/app']
  },
  output: {
    path: __dirname + '/dist', 
    publicPath: '/',
    filename: 'js/app.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude:  /node_modules\//,
      loader: 'babel-loader'
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
    }, {
      test: /\.less/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
    }]
  },
  plugins: [
    new ExtractTextPlugin("style.css", {allChunks: true})
    //,new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
};
