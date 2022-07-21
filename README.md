# Quick UI Template [2022]
This project can used for quick template generations with a little bit of help, useful for prototyping.
It has sass and js bundling capabilities from gulp libraries and `browserify` + `babelify`

```

Please fork the project to start a new project

```

## Usage
1. develop with browser-sync, allows live preview and autoreload 
```
npm start
```

2. process and copy src files to publish folder for deployment
```
npm run build
```

edit gulpfile.js to further add function for development

## starting point

1. **./src/static/\*.html** this is where to put in templates

2. **./src/scss/\*.scss** the scss files will be transpiled into css as is and can be included into templates <link>. There is an optional gulpConcat() to allow for bunlding all css into one file inside gulpfile.js

3. **./src/scss/\*.js** this is where to put the starting js files. use the format `main-***.js` to create a separate bundle. 

Example: if `templateA.html` needs its own js bundle then create and name `main-A.js` as a starting js. Once bundled and transpiled include `main-A.bundle.js` from the html file <script>. This way different template can have different bundles but allow development of shared libraries.
