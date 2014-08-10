var
  gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  cssMinify = require('gulp-minify-css'),
  usemin = require('gulp-usemin'),
  assets = {
    html: ['index.html'],
    css : ['css/*.css'],
    js : ['js/libs/*.js', 'js/*.js'],
  };

gulp.task('usemin', function() {
    gulp.src(assets.html)
      .pipe(usemin({
        css: [cssMinify()],
        js: [uglify()],
      }))
      .pipe(gulp.dest('build/'));
  }
);

gulp.task('default', ['usemin']);
