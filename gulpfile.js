const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const gulpConcat = require('gulp-concat');
const fsExtra = require('fs-extra');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const glob = require('glob');
const es = require('event-stream');
const path = require('path');

function clean(done){
  fsExtra.emptyDirSync('./publish');
  done();
}

function jsTask(done){

  glob('./src/js/main-**.js', function(err, files) {
    if(err) done(err);

    let tasks = files.map(function(entry) {

      let b = browserify({
        entries: [entry],
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify.configure({
          presets: ['@babel/preset-env']
        })]
      });

      const sourceEntry = path.basename(entry);
      // console.log(entry, sourceEntry);
      return b.bundle()
          .pipe(source(sourceEntry))
          .pipe(rename({
              extname: '.bundle.js'
          }))
          .pipe(dest('./publish/js/'));
      });

    es.merge(tasks).on('end', done);

  });
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
  watch('./src/js/**/*.js', { delay: 750 }, jsTask);
}

function jsInject(){
  return jsTask().pipe(browserSync.stream());
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
      baseDir: './publish'
    }
  });

  // in-essence this takes over watchActivities() because it will also inject the data to the browser using browser-sync
  watch('./src/scss/**/*.scss', { delay: 350 }, sassInject); // watch scss changes, then inject the updated new css file to browser without refresh
  watch('./src/static/**/*', series(copyStatic, reloadServer)); // this is to force a reload on the browser if any new static content is updated like a new .html
  watch('./src/js/**/*.js', { delay: 350 }, jsInject); // watch js changes, then inject the updated new js file into ./publish
}
// dev (gulp task): start by building the files into ./publish folder then run the server
const dev = series(clean, parallel(sassTask, jsTask, copyStatic), browserSyncServer);
// just build and put processed files into ./publish
const build = series(clean, parallel(sassTask, jsTask, copyStatic));

// these 'exports' just allows you to run gulp commands with different task and configs
exports.scss = sassTask; // $ gulp scss - just process scss files
exports.js = jsTask; // $ gulp js - just process js files
exports.copyStatic = copyStatic; // $ gulp copyStatic - just copy over static files *.html
exports.build = build; // $ gulp build - process static and scss files and put into ./publish
exports.watchActivities = watchActivities; // $ gulp watchActivities - continues to watch changes and put files into ./publish
exports.dev = dev; // $ gulp dev - runs browserSync and watch changes and serve them from ./publish
exports.clean = clean; // $ gulp clean - empties ./publish

exports.default = dev;