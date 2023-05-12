const { src, dest, watch, series, parallel } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const htmlMinify = require("gulp-html-minifier-terser");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const newer = require("gulp-newer");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const replace = require("gulp-replace");

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

function doHtml() {
  return src("src/pages/index.html")
    .pipe(htmlMinify({ collapseWhitespace: true }))
    .pipe(dest("src"))
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

function scripts() {
  return src("src/js/main.js", { sourcemaps: true })
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("src/js", { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function images() {
  return src("src/images-src/**/*.*")
    .pipe(newer("src/images"))
    .pipe(avif())
    .pipe(dest("src/images"));
}

function doReplace() {
  return src("dist/index.html")
    .pipe(replace('href="css/style.min.css"', 'href="dist/css/style.min.css"'))
    .pipe(replace('src="js/main.min.js"', 'src="dist/js/main.min.js"'))
    .pipe(dest("."));
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
  watch(["src/pages/index.html"], doHtml);
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
      "src/**/*.html",
      "src/images/**/*.*",
      "src/fonts/*.woff",
      "src/fonts/*.woff2",
    ],
    {
      base: "src",
    }
  ).pipe(dest("dist"));
}

exports.doHtml = doHtml;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.watching = watching;
exports.building = building;
exports.cleanDist = cleanDist;
exports.doReplace = doReplace;

exports.default = parallel(images, fonts, styles, scripts, doHtml, watching);
exports.build = series(cleanDist, building, doReplace);

// exports.build = parallel(cleanDist, styles, scripts, images, fonts);
// exports.dev = parallel(watching, building, buildingPage);
