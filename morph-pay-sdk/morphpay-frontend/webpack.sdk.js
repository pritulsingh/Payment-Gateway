// webpack.sdk.js - Build configuration for SDK
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/sdk/index.js',
  output: {
    path: path.resolve(__dirname, 'public/sdk'),
    filename: 'morphpay-sdk.js',
    library: 'MorphPay',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                }
              }],
              '@babel/preset-react'
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    'react': {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  },
  optimization: {
    minimize: false // Keep unminified version
  }
};

// For minified version
const minifiedConfig = {
  ...module.exports,
  output: {
    ...module.exports.output,
    filename: 'morphpay-sdk.min.js'
  },
  optimization: {
    minimize: true
  }
};

module.exports = [module.exports, minifiedConfig];