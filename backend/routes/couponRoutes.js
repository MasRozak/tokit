const express = require('express');
const router = express.Router();
const { createCoupon, deleteCoupon, getAllCoupons, getCouponById, updateCoupon, validateCoupon } = require('../controllers/couponController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.get('/coupon', getAllCoupons);

router.get('/coupon/:id', getCouponById);

router.post('/coupon',authMiddleware, adminMiddleware, createCoupon);

router.put('/coupon/:id',authMiddleware, adminMiddleware, updateCoupon);

router.delete('/coupon/:id',authMiddleware, adminMiddleware, deleteCoupon);

router.post('/coupon/validate', authMiddleware, validateCoupon);

module.exports = router;
