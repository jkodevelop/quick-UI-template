const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const gulpConcat = require('gulp-concat');
const fsExtra = require('fs-extra');

// function jsTask(pattern, outPath, params){
//   return src(pattern, { allowEmpty: true })
//       .pipe(gulpSourcemap.init())
//       .pipe(gulpBrowserify())
//       .pipe(gulpBabel({
//         presets: ['@babel/env']
//       })) // babel process bundle
//       .pipe(gulpUglify())
//       .pipe(gulpSourcemap.write('.', {
//         mapFile: function(mapFilePath) {
//           // source map files are named *.map instead of *.js.map
//           return mapFilePath.replace(params.mapSource, params.mapDest);
//         }
//       }))
//       .pipe(gulpRename({
//         basename: params.renameBasename,
//         suffix: params.renameSuffix
//       })) // rename javascript to script.min.js
//       .pipe(dest(outPath)); // then copy to this location
// }

function clean(done){
  fsExtra.emptyDirSync('./publish');
  done();
}

function sassTask(){
  return src('./src/scss/**/*.scss', { allowEmpty: true })
      .pipe(sass()) // process sass 
      // .pipe(cssnano()) // then minimize the css
      // concat file order by alphabet
      .pipe(gulpConcat('style.css')) // combine all css to one, name it style.css
      .pipe(dest('./publish/css')); // then copy to this location
}

function copyStatic() {
  return src('./src/static/**/*', { allowEmpty: true }) 
      .pipe(dest('./publish'));
}

function watchActivities() {
  noCleanBuild();
  watch('./src/scss/**/*.scss', { delay: 750 }, sassTask);
  watch('./src/static/**/*', copyStatic);
}

function sassInject(){
  // stream data to static server using browser-sync.create().steam()
  // this allows browser-sync 
  return sassTask().pipe(browserSync.stream());
}

function reloadServer() {
  return browserSync.reload();
}
function browserSyncServer(){
  // static server
  browserSync.init({
    server: {
        baseDir: "./publish"
    }
  });

  // this in essence takes over watchActivities() because it will also inject the data to the browser using browser-sync
  watch("./src/scss/**/*.scss", { delay: 250 }, sassInject); // watch scss changes, then inject the updated new css file to browser without refresh
  watch('./src/static/**/*', series(copyStatic, reloadServer)); // this is to force a reload on the browser if any new static content is updated
}
// dev (gulp task): start by building the files into ./publish folder then run the server
const dev = series(clean,parallel(sassTask, copyStatic), browserSyncServer);

const build = series(clean,parallel(sassTask, copyStatic));

// special case for use in watchActivities() 
// added because web-ext runner for Firefox web-extension development needs ./publish/manifest.json to exist to load
// if you clean while running web-ext, then firefox won't be able to import and setup the Web Extension
// $ npm run webext
const noCleanBuild = parallel(sassTask, copyStatic); 

// this allows you to just run sass in command line
exports.scss = sassTask; // $ gulp sass
// exports.js = browserActionJS; // $ gulp js
exports.copyStatic = copyStatic; // $ gulp copyStatic

exports.build = build;
exports.noCleanBuild = noCleanBuild;
exports.watchActivities = watchActivities;
exports.dev = dev;

exports.clean = clean;

exports.default = watchActivities;