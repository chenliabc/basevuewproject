const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = (env, args) => {
  const devFlag = env.dev === 'true';

  let config = {
    entry: './src/main.js',
    output: {
      filename: "js/[name]-[contenthash:6].js",
      path: path.join(__dirname, '/dist'),
      clean: true,
      chunkFilename: 'js/[name]-chunk-[contenthash:6].js',
      assetModuleFilename: 'assets/[name][ext][query]'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          oneOf: [
            { test: /\.css$/, use: [devFlag ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader','postcss-loader'] },
            { test: /\.scss$/, use: [devFlag ? 'vue-style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader','sass-loader',  { loader: 'sass-resources-loader', options: {resources: path.join(__dirname, "./src/css/common.scss")}}] },
            { test: /\.(png|svg|jpg|jpeg|gif|webp)$/, type: 'asset' },
            { test: /\.(woff|woff2|eot|ttf|otf)$/, type: 'asset/resource' },
            {
              test: /\.js$/,
              include: path.resolve(__dirname, "src"),
              use: {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,   //开启缓存
                  cacheCompression: false,//关闭缓存压缩
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        useBuiltIns: "usage",
                        corejs: 3
                      }
                    ]
                  ],
                  plugins: ['@babel/plugin-transform-runtime']
                }
              }
            }
          ]
        }
      ]
    },

    plugins: getPlugin(),

    optimization: getOptimization(),

    resolve: {
      alias: {
        "@css": path.resolve(__dirname, 'src/css'),
        "@js": path.resolve(__dirname, "src/js"),
        "@component": path.resolve(__dirname, "src/component")
      },
      extensions: ['.js', '.jsx', '.vue', '.ts']
    },

    devtool: 'eval-source-map',

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 10000,
    },
    mode: devFlag ? 'development' : 'production'
  }

  if (!devFlag) {
    // 生产模式
    delete config.devtool;
  }

  function getPlugin() {
    let temp = [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      // 请确保引入这个插件！
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
      }),

      // copy
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "src/public"),
            to: path.join(__dirname, "dist/public"),
            toType: "dir",
            noErrorOnMissing: true,
            globOptions: {
              ignore: ["**/index.html"],
            },
            info: {
              minimized: true,
            },
          },
        ],
      }),

      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),

    ];

    if (devFlag) {
      temp.push(
        new ESLintPlugin({
          context: path.resolve(__dirname, "src"),
          exclude: 'node_modules',
          extensions: [
            '.js',
            '.jsx',
            '.vue',
            ".ts"
          ],
          cache: true,
          cacheLocation: path.resolve(__dirname, "./node_modules/.cache/eslintcache")
        })
      )
    } else {
      temp.push(new MiniCssExtractPlugin({
        filename: 'css/[name]-[contenthash:6].css',
        chunkFilename: 'css/[name]-[contenthash:6].chunk.css'
      }))

      temp.push(
        new ESLintPlugin({
          context: path.resolve(__dirname, "src"),
          exclude: 'node_modules',
          extensions: [
            '.js',
            '.jsx',
            '.vue',
            ".ts"
          ],
        })
      )
    }
    return temp;
  }

  function getOptimization() {
    let json = {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime~${entrypoint.name}`,
      },
    }
    if (!devFlag) {
      json.minimizer = [new CssMinimizerPlugin()];

      json.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vue: {
            test: /[\\/]node_modules[\\/]vue(.*)?[\\/]/,
            name: 'vue-chunk',
            priority: 40
          },
          libs: {
            test: /[\\/]node_modules[\\/]/,
            name: 'libs-chunk',
            priority: 20
          }
        }
      }
    }

    return json;
  }


  return config;

}

