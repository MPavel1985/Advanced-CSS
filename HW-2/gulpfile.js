const { src, dest, watch, series, parallel } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
// * !not for all browsers!
const avif = require("gulp-avif");
// * I can't inctall it + gulp-cwebp
// const webp = require("gulp-webp");
// * gulp-imagemin works with PNG, JPEG, GIF and SVG
// const imagemin = require("gulp-imagemin");

function images() {
  return (
    src(["app/images/**/*.*", "!app/images/**/*.svg"])
      // if we need to use one more plug for another type of images, have to use before the next ".pipe" the way "src("app/images/**/*.*")" one more time. Because we don't need to use every next plug for pictures that have already been converted after previous one plug
      .pipe(avif())
      // ! dist?
      .pipe(dest("app/images/dist"))
  );
}

function scripts() {
  return src("app/js/main.js")
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(autoprefixer())
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

// watch method + browser
function watching() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
  watch(["app/scss/style.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src("dist").pipe(clean());
}

// !!! images + ...
function building() {
  return src(
    [
      "app/css/style.min.css",
      "app/js/main.min.js",
      "app/*.html",
      "app/images/dist/**/*.*",
    ],
    {
      base: "app",
    }
  ).pipe(dest("dist"));
}

exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;

// gulp
exports.default = parallel(images, styles, scripts, watching);
// gulp build >>> dist
exports.build = series(cleanDist, building);
