const express = require('express');
const router = express.Router();
const { createCoupon, deleteCoupon, getAllCoupons, getCouponById, updateCoupon, validateCoupon } = require('../controllers/couponController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.get('/', getAllCoupons);

router.get('/:id', getCouponById);

router.post('/',authMiddleware, adminMiddleware, createCoupon);

router.put('/:id',authMiddleware, adminMiddleware, updateCoupon);

router.delete('/:id',authMiddleware, adminMiddleware, deleteCoupon);

router.post('/validate', authMiddleware, validateCoupon);

module.exports = router;
