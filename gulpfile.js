const {src, dest, watch, series} = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const concat = require('gulp-concat')
const del = require('del')
const sync = require('browser-sync').create()
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const include = require('gulp-file-include')

function clear() {
    return del('dist')
}

const arr  = [
    'node_modules/normalize.css/normalize.css',
    'src/style/main.scss'
]

function html() {
    return src('src/**/*.html')
    .pipe(include({
      prefix: '@@'
  }))
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(dest('dist'))
}

function scss() {
    return src(arr)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 version']
        }))
        .pipe(csso())
        .pipe(concat('style/main.css'))
        .pipe(dest('dist'))
}

function images() {
    return src('src/image/**/*')
      .pipe(imagemin(
        [
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 75, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              { removeViewBox: true },
              { cleanupIDs: false }
            ]
          })
        ]
      ))
      .pipe(dest('dist/image'))
  }

  function scripts() {
    return src('src/script/**.js')
    .pipe(babel({
      presets: ['@babel/env']
  }))
    .pipe(concat('main.js', {newLine: ";"}))
    .pipe(uglify())
    .pipe(dest('dist'))
  }

  function serve() {
    sync.init({
        server: './dist'
    })

    watch('src/**.html', series(html)).on('change', sync.reload)
    watch('src/style/*.scss' , series(scss)).on('change', sync.reload)
    watch('src/scripts/**.js' , series(scripts)).on('change', sync.reload)
  }

  exports.default = series(clear, images, scss, scripts, html, serve);