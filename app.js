var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var moment = require('moment');
// var logger = require('morgan');
const flash = require('express-flash-notification');
const session = require('express-session');
var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const pathname = require('./path');
//const pathname= path.join(__dirname,'app')


global.__base = __dirname+'/';
global.__path_app = __base+ pathname.folder_app;
global.__path_app_config= __path_app+pathname.folder_app_config;
global.__path_app_helper= __path_app+pathname.folder_app_helper;
global.__path_app_models= __path_app+pathname.folder_app_models;
global.__path_app_public= __path_app+pathname.folder_app_public;
global.__path_app_routes= __path_app+pathname.folder_app_routes;
global.__path_app_schema= __path_app+pathname.folder_app_schema;
global.__path_app_views= __path_app+pathname.folder_app_views;

const database = require(`${__path_app_config}database`);
const systemConfig = require(`${__path_app_config}system`);

mongoose.connect(`mongodb+srv://${database.username}:${database.password}${database.hostname}`);
var db = mongoose.connection;
  db.on('error', ()=>{console.log('connect fail')});
  db.once('open', ()=>{
    console.log("connect success");
  });

var app = express();
app.use(cookieParser());
app.use(session({
  secret: 'example',
  resave: false,
  saveUninitialized: true
}))
app.use(flash(app, {
  viewName: 'notify'
}));
// view engine setup
app.set('views', path.join(__path_app, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'backend');


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__path_app, 'public')));

app.locals.systemConfig = systemConfig;
app.locals.moment = moment;
app.use(`/${systemConfig.prefixAdmin}`, require(`${__path_app_routes}backend/index`));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(`${__path_app_views}page/error`, { pageTitle: 'File not Found' });
});

module.exports = app;
