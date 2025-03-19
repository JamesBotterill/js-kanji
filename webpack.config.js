const path = require('path');

module.exports = {
  mode: 'production',
  entry: './browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'semantic-kanji.min.js',
    library: 'semanticKanji',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: '>0.25%, not dead'
                }
              }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true
  },
  resolve: {
    extensions: ['.js']
  },
  externals: {
    '@anthropic-ai/sdk': '@anthropic-ai/sdk',
    'openai': 'openai'
  }
};