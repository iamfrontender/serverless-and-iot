'use strict';

const gulp = require('gulp');

const pug = require('gulp-pug');
const sass = require('gulp-sass');
const connect = require('gulp-connect');

const sequence = require('run-sequence');

////////////////////////////////////////////////////////////////

gulp.task('connect', () => {
  connect.server({
    root: '.',
    livereload: true
  });
});

gulp.task('pug', () => {
  return gulp.src('pug/index.pug')
    .pipe(pug())
    .pipe(gulp.dest('html'));
});

gulp.task('copy-index', () => {
  return gulp.src('html/index.html')
    .pipe(gulp.dest('./'));
});

gulp.task('reload', () => {
  return gulp.src('index.html')
    .pipe(connect.reload());
});

gulp.task('styles', () => {
  return gulp.src('sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('html', () => {
  return sequence('pug', 'copy-index', 'reload');
});

gulp.task('sass', () => {
  return sequence('styles', 'reload');
});

gulp.task('watch', () => {
  gulp.watch('pug/**/*.pug', ['html']);
  gulp.watch('sass/*.scss', ['sass']);
  gulp.watch('js/**/*.js', ['reload'])
});

gulp.task('default', ['connect', 'html', 'sass', 'watch']);