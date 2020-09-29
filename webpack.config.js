/**
 * @author zacharyjuang
 */
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

require('dotenv').config();

const APP_DIR = path.join(__dirname, 'src');

const config = {
  entry: [
    path.join(APP_DIR, 'index.jsx')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: "/"
  },
  mode: 'production',
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
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
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
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'loaders')
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      // new MinifyPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new Dotenv(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      favicon: 'src/favicon.svg',
      template: 'src/index.ejs',
      templateParameters: {
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
        RECAPTCHA: process.env.RECAPTCHA
      }
    }),
    new BundleAnalyzerPlugin()
  ]
};

module.exports = config;

