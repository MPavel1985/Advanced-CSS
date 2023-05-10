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
// * for not using pictures with which we have worked earlier - plug for cache
const newer = require("gulp-newer");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const include = require("gulp-include");

function makePages() {
  return src("app/pages/*.html")
    .pipe(
      include({
        includePaths: "app/components",
      })
    )
    .pipe(dest("app"))
    .pipe(browserSync.stream());
}

function fonts() {
  return src("app/fonts/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts"));
}

function images() {
  return (
    src("app/images-app/**/*.*")
      // if we need to use one more plug for another type of images, have to use before the next ".pipe" the way "src("app/images/**/*.*")" one more time. Because we don't need to use every next plug for pictures that have already been converted after the previous one plug
      // we use plug "newer" before every converter-plug
      .pipe(newer("app/images"))
      .pipe(avif())
      .pipe(dest("app/images"))
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
  watch(["app/components/**", "app/pages/**"], makePages);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src("dist").pipe(clean());
}

function building() {
  return src(
    [
      "app/css/style.min.css",
      "app/js/main.min.js",
      "app/images/**/*.*",
      "app/fonts/*.woff",
      "app/fonts/*.woff2",
      "app/*.html",
    ],
    {
      base: "app",
    }
  ).pipe(dest("dist"));
}

exports.images = images;
exports.fonts = fonts;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.makePages = makePages;

// gulp
exports.default = parallel(images, fonts, makePages, styles, scripts, watching);
// gulp build >>> dist
exports.build = series(cleanDist, building);
