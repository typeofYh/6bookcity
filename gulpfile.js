var gulp = require('gulp');
var server = require('gulp-webserver');
var mincss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var minjs = require('gulp-uglify');
var minhtml = require('gulp-htmlmin');
var babel = require('gulp-babel');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mock = require('./mock/');
var sass = require('gulp-sass');
var userdata = require('./mock/user/user').userInfo;
gulp.task('sass', function() {
    gulp.src('src/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
});
gulp.task('devserver', function() {
    gulp.src('src')
        .pipe(server({
            port: 6060,
            host: 'localhost',
            middleware: function(req, res, next) {
                if (req.url === "/favicon.ico") {
                    return;
                }
                var pathname = url.parse(req.url).pathname;
                pathname = pathname === '/' ? '/index.html' : pathname;
                if (/\/api\//.test(pathname)) {
                    //post
                    if (pathname === "/api/login" || pathname === "/api/reglogin") {
                        var arr = [];
                        req.on('data', function(chunk) {
                            arr.push(chunk);
                        });
                        req.on('end', function() {
                            var data = Buffer.concat(arr).toString();
                            data = require('querystring').parse(data);
                            if (pathname === "/api/login") {
                                //查找
                                var resule = userdata.some(function(v) {
                                    return v.user == data.user && v.pwd == data.pwd
                                });
                                if (resule) {
                                    res.end('{"res":1,"mes":"登录成功"}');
                                } else {
                                    res.end('{"res":0,"mes":"用户名或密码输入有误"}');
                                }
                            } else {
                                //添加
                                userdata.push(data);
                                var userObj = {
                                    userInfo: userdata
                                };
                                fs.writeFileSync('./mock/user/user.json', JSON.stringify(userObj));
                                res.end('{"res":1,"mes":"注册成功"}');
                            }
                        });
                        return false;
                    };
                    res.end(JSON.stringify(mock(req.url)));
                } else {
                    res.end(fs.readFileSync(path.join(__dirname, 'src', pathname)));
                }
            }
        }))
});

gulp.task('change', function() {
    gulp.watch('src/sass/*.scss', ['sass'])
});

gulp.task('dev', ['sass', 'change', 'devserver']);


gulp.task('mincss', function() {
    gulp.src('src/css/*.css')
        .pipe(mincss())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'] //离你最近的两个浏览器版本
        }))
        .pipe(gulp.dest('build/css'))
});
gulp.task('minjs', function() {
    gulp.src('src/js/**/*.js')
        .pipe(babel({
            presets: 'es2015' //指定编译后的版本为es5
        }))
        .pipe(minjs())
        .pipe(gulp.dest('build/js'))
});
gulp.task('minhtml', function() {
    gulp.src('src/**/*.html')
        .pipe(minhtml({
            removeComments: false, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
        }))
        .pipe(gulp.dest('build'))
});
gulp.task('buildserver', function() {
    gulp.src('build')
        .pipe(server({
            port: 6060,
            host: 'localhost',
            middleware: function(req, res, next) {
                if (req.url === "/favicon.ico") {
                    return;
                }
                var pathname = url.parse(req.url).pathname;
                pathname = pathname === '/' ? '/index.html' : pathname;
                if (/\/api\//.test(pathname)) {
                    //post
                    if (pathname === "/api/login" || pathname === "/api/reglogin") {
                        var arr = [];
                        req.on('data', function(chunk) {
                            arr.push(chunk);
                        });
                        req.on('end', function() {
                            var data = Buffer.concat(arr).toString();
                            data = require('querystring').parse(data);
                            if (pathname === "/api/login") {
                                //查找
                                var resule = userdata.some(function(v) {
                                    return v.user == data.user && v.pwd == data.pwd
                                });
                                if (resule) {
                                    res.end('{"res":1,"mes":"登录成功"}');
                                } else {
                                    res.end('{"res":0,"mes":"用户名或密码输入有误"}');
                                }
                            } else {
                                //添加
                                userdata.push(data);
                                var userObj = {
                                    userInfo: userdata
                                };
                                fs.writeFileSync('./mock/user/user.json', JSON.stringify(userObj));
                                res.end('{"res":1,"mes":"注册成功"}');
                            }
                        });
                        return false;
                    };
                    res.end(JSON.stringify(mock(req.url)));
                } else {
                    res.end(fs.readFileSync(path.join(__dirname, 'build', pathname)));
                }
            }
        }))
});
gulp.task('build', ['mincss', 'minjs', 'minhtml', 'buildserver'])