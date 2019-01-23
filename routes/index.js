const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  const user = req.user;
  res.render('index', {user});
});

module.exports = router;
