/**
 * @author zacharyjuang
 */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

require('dotenv').config({path: path.resolve(process.cwd(), '.env.dev')});

const APP_DIR = path.join(__dirname, 'src');

const config = {
  entry: [
    path.join(APP_DIR, 'index.jsx')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: "/"
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/sungear_react/src')
        ],
        loader: 'babel-loader',
        options: {
          configFile: path.resolve('babel.config.js')
        }
      },
      {
        test: /\.css(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(ttf|eot|gif|woff(2)?|png|txt|svg|jpe?g)(\?[a-z0-9]+)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          esModule: false
        }
      },
      {
        test: /\.txt$/,
        use: ['raw-loader']
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    symlinks: false
  },
  devtool: 'inline-source-map',
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new Dotenv({path: path.resolve(process.cwd(), '.env.dev')}),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      templateParameters: {
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
        RECAPTCHA: process.env.RECAPTCHA
      }
    })
  ],
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'loaders')
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    historyApiFallback: true,
    hot: true,
    proxy: {
      '/api': 'http://localhost:8001'
    }
  }
};

module.exports = config;

