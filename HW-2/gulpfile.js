const { src, dest, watch, series, parallel } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
// * for not using pictures with which we have worked earlier - plug for cache
const newer = require("gulp-newer");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

function fonts() {
  return src("src/fonts/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("src/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("src/fonts"));
}

function images() {
  return (
    src("src/images-src/**/*.*")
      // if we need to use one more plug for another type of images, have to use before the next ".pipe" the way "src("src/images/**/*.*")" one more time. Because we don't need to use every next plug for pictures that have already been converted after the previous one plug
      // we use plug "newer" before every converter-plug
      .pipe(newer("src/images"))
      .pipe(avif())
      .pipe(dest("src/images"))
  );
}

function scripts() {
  return src("src/js/main.js", { sourcemaps: true })
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("src/js", { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function styles() {
  return src("src/scss/style.scss", { sourcemaps: true })
    .pipe(autoprefixer())
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("src/css", { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

// watch method + browser
function watching() {
  browserSync.init({
    server: {
      baseDir: "src/",
    },
  });

  watch(["src/scss/style.scss"], styles);
  watch(["src/js/main.js"], scripts);
  watch(["src/index.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src("dist").pipe(clean());
}

function building() {
  return src(
    [
      "src/css/style.min.css",
      "src/js/main.min.js",
      "src/images/**/*.*",
      "src/fonts/*.woff",
      "src/fonts/*.woff2",
    ],
    {
      base: "src",
    }
  ).pipe(dest("dist"));
}

function buildingPage() {
  return src("src/index.html").pipe(dest("."));
}

exports.images = images;
exports.fonts = fonts;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.buildingPage = buildingPage;

// exports.default = parallel(images, fonts, styles, scripts, watching);
// exports.build = series(cleanDist, building, buildingPage);

exports.build = parallel(cleanDist, styles, scripts, images, fonts);
exports.dev = parallel(watching, building, buildingPage);
// обязательно ли watching в dev?
// а cleanDist в build?
