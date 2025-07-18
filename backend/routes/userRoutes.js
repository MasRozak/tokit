﻿const express = require("express");
const router = express.Router();
const {getProfile, updateProfile} = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;

