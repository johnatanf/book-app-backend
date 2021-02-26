const express = require('express');
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');

const loginRouter = express.Router();

loginRouter.post('/', (request, response) => {

});

module.exports = loginRouter;
