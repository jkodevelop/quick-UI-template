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
      .pipe(sass())
      // .pipe(gulpConcat('style.css')) // combine all css to one, name it style.css, concat files order by alphabet
      .pipe(dest('./publish/css'));
}

function copyStatic() {
  return src('./src/static/**/*', { allowEmpty: true }) 
      .pipe(dest('./publish'));
}

function watchActivities() {
  watch('./src/scss/**/*.scss', { delay: 750 }, sassTask);
  watch('./src/static/**/*', copyStatic);
}

function sassInject(){
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

  // in-essence this takes over watchActivities() because it will also inject the data to the browser using browser-sync
  watch("./src/scss/**/*.scss", { delay: 250 }, sassInject); // watch scss changes, then inject the updated new css file to browser without refresh
  watch('./src/static/**/*', series(copyStatic, reloadServer)); // this is to force a reload on the browser if any new static content is updated like a new .html
}
// dev (gulp task): start by building the files into ./publish folder then run the server
const dev = series(clean,parallel(sassTask, copyStatic), browserSyncServer);
// just build and put processed files into ./publish
const build = series(clean,parallel(sassTask, copyStatic));

// these "exports" just allows you to run gulp commands with different task and configs
exports.scss = sassTask; // $ gulp scss - just process scss files
exports.copyStatic = copyStatic; // $ gulp copyStatic - just copy over static files *.html
exports.build = build; // $ gulp build - process static and scss files and put into ./publish
exports.watchActivities = watchActivities; // $ gulp watchActivities - continues to watch changes and put files into ./publish
exports.dev = dev; // $ gulp dev - runs browserSync and watch changes and serve them from ./publish
exports.clean = clean; // $ gulp clean - empties ./publish

exports.default = dev;