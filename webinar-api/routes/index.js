var express = require('express');
var router = express.Router();
var auth = require('./auth');
const docs = require('./docs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/auth', auth)
router.use('/docs', docs)

module.exports = router;
