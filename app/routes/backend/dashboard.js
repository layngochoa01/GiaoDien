var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
 res.render('page/dashboard/index', { pageTitle: 'Dashboard Manager' })
});

module.exports = router;