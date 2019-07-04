const {src, dest,watch,series,parallel} = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    replace = require('gulp-replace'),
    postcss = require('gulp-postcss'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    babel = require('gulp-babel'),
    del = require('del');

const cbString = new Date().getTime();

//File Path
const file = {
    scssPath : './public/styles/**/*.scss',
    mainScss: './public/styles/main.scss',
    viewScssPath: './public/styles/view/*.scss',
    coreScssPath: './public/styles/core/*.scss',
    jsPath: './public/scripts/**/*.js',
    jsScaffolderPath: './public/scripts/scaffolder.js',
    jsMainPath: './public/scripts/main.js',
    publicHtml: './public/*.html',
    jsDependPath: './public/_dependencies/*.js',
    fontPath: './public/_fonts/**/*.*'
};

let jsArr = [file.jsScaffolderPath,file.jsMainPath];
let scssArr = [file.mainScss,file.viewScssPath,file.coreScssPath];

//compile SASS
function taskScss(){
    return src(scssArr)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error',sass.logError)
        .pipe(concat('bundle.css'))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/styles'))
        .pipe(browserSync.stream());
}

//JS Files
function taskJS(){
    return src(jsArr)
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/preset-env']
            })
        )
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/scripts'))
        .pipe(browserSync.stream());
}

//Cashbusting
function taskCashBusting() {
    return src(file.publicHtml)
        .pipe(replace(/cb=\d+/g, 'cb'+cbString))
        .pipe(dest('./dist/'));
}

//Copy Font Dependencies
function taskFontDependencies() {
    return src(file.fontPath)
        .pipe(dest('./dist/_fonts'));
}

//Copy JS Dependencies
function taskJSDependencies() {
    return src(file.jsDependPath)
        .pipe(dest('./dist/_dependencies'));
}

//Cleanup
function taskClean() {
    return del(['./dist/']);
}

//Watch
function taskWatch() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });

    watch([file.scssPath],taskScss);
    watch([file.jsPath],taskJS);
    watch('./dist/*.html').on('change',browserSync.stream);
}

//Default
exports.default = series(
    taskClean,
    parallel(taskScss,taskJS),
    parallel(
        taskFontDependencies,
        taskJSDependencies
    ),
    taskCashBusting,
    taskWatch
);

