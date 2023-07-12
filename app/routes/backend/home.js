var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
 res.render('page/home/index', { pageTitle: 'Home Manager' })
});

module.exports = router;