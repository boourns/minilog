const webpack = require('webpack')
const path = require('path');
const glob = require('glob');

// default settings for building
let moduleCssLoaders = [ 
  { loader: "style-loader" },  // to inject the result into the DOM as a style block
  { loader: "css-modules-typescript-loader"},  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
  { loader: "css-loader", options: { modules: true } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
  { loader: "sass-loader" },  // to convert SASS to CSS
  // NOTE: The first build after adding/removing/renaming CSS classes fails, since the newly generated .d.ts typescript module is picked up only later
] 

// default settings for building
let staticCssLoader = [ 
  { loader: "style-loader" },  // to inject the result into the DOM as a style block
  { loader: "css-loader" },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
  { loader: "sass-loader" },  // to convert SASS to CSS
] 

let entry = {
  editor: {
    import: './src/app.tsx',
    filename: './static/app.js'
  },
}

let outputPath = path.resolve(__dirname, '..')
let target = 'web'

if (process.env.MINILOG_ENV == "test") {
  entry = glob.sync(__dirname + "/test/**/*Test*.ts");
  outputPath = __dirname + "/test/build/";
  target = 'node'

  moduleCssLoaders = [
    { loader: "css-modules-typescript-loader"},  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
  { loader: "css-loader", options: { modules: true } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
  { loader: "sass-loader" },  
  ]
}

let plugins = []

if (process.env.MINILOG_ENV == "production") {
  let revision = require('fs').readFileSync('../REVISION', 'utf8').trim()

  plugins.push(
          new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(revision),
          }))
} else {
  plugins.push(
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(process.env.MINILOG_ENV) || "\"development\""
    }))
}

module.exports = {
  entry: entry,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.module\.(sa|sc|c)ss$/,
        use: moduleCssLoaders,
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: staticCssLoader,
        exclude: /src/,
      },
      {
        test: /\.static\.(sa|sc|c)ss$/,
        use: staticCssLoader,
      },
    ],
  },
  mode: "development",
  plugins,
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', ".css", ".scss" ],
    fallback: { 
      "assert": require.resolve("assert") 
    },
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",     // Must be below test-utils
      "react/jsx-runtime": "preact/jsx-runtime"
    }
  },
  target: target,
  output: {
    path: outputPath
  },
};
