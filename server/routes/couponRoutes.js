import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fallback/Default Coupons (Active by default if not overridden in database)
const DEFAULT_COUPONS = {
  AARKESH50: {
    code: 'AARKESH50',
    discountType: 'percentage',
    discountValue: 50,
    applicableTo: 'all',
    minOrderAmount: 0,
    description: 'Exclusive 50% discount on all sessions & courses'
  },
  CLAIM50: {
    code: 'CLAIM50',
    discountType: 'percentage',
    discountValue: 50,
    applicableTo: 'all',
    minOrderAmount: 0,
    description: '50% discount coupon'
  },
  SHERY50: {
    code: 'SHERY50',
    discountType: 'percentage',
    discountValue: 50,
    applicableTo: 'all',
    minOrderAmount: 0,
    description: 'Special 50% discount'
  },
  BETTER20: {
    code: 'BETTER20',
    discountType: 'percentage',
    discountValue: 20,
    applicableTo: 'all',
    minOrderAmount: 0,
    description: '20% discount on your transformation journey'
  },
  WELCOME10: {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    applicableTo: 'all',
    minOrderAmount: 0,
    description: '10% welcome discount'
  },
  FIRST1000: {
    code: 'FIRST1000',
    discountType: 'fixed',
    discountValue: 1000,
    applicableTo: 'all',
    minOrderAmount: 4000,
    description: 'Flat ₹1,000 off on orders above ₹4,000'
  }
};

/**
 * Internal helper to validate a coupon code and calculate discount
 * @param {string} rawCode - User entered coupon code
 * @param {string} targetType - 'session' | 'course'
 * @param {number} baseAmount - Total original amount in INR (Rupees)
 */
export async function validateCouponInternal(rawCode, targetType = 'all', baseAmount = 0) {
  if (!rawCode || typeof rawCode !== 'string') {
    return { valid: false, message: 'Please enter a valid coupon code.' };
  }

  const cleanCode = rawCode.trim().toUpperCase();
  const numericAmount = Number(baseAmount) || 0;

  // 1. Look up in DB
  let coupon = null;
  try {
    coupon = await Coupon.findOne({ code: cleanCode });
  } catch (err) {
    console.error('Error finding coupon in DB:', err);
  }

  // 2. Check defaults if not in DB
  if (!coupon && DEFAULT_COUPONS[cleanCode]) {
    coupon = DEFAULT_COUPONS[cleanCode];
  }

  if (!coupon || coupon.isDeleted === true) {
    return { valid: false, message: 'Invalid coupon code. Please check and try again.' };
  }

  // Check if coupon is active
  if (coupon.isActive === false) {
    return { valid: false, message: 'This coupon is no longer active.' };
  }

  // Check validity dates
  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { valid: false, message: 'This coupon is not active yet.' };
  }
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { valid: false, message: 'This coupon has expired.' };
  }

  // Check usage limit
  if (coupon.usageLimit && typeof coupon.usedCount === 'number' && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'This coupon has reached its maximum usage limit.' };
  }

  // Check applicable category ('all', 'session', 'course')
  if (coupon.applicableTo && coupon.applicableTo !== 'all' && targetType !== 'all') {
    if (coupon.applicableTo !== targetType) {
      const typeLabel = coupon.applicableTo === 'session' ? 'coaching sessions' : 'course purchases';
      return { valid: false, message: `This coupon is only valid for ${typeLabel}.` };
    }
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && numericAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for this coupon.`
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((numericAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    // Fixed amount discount
    discount = Math.min(coupon.discountValue, numericAmount);
  }

  discount = Math.max(0, discount);
  const finalAmount = Math.max(0, numericAmount - discount);

  return {
    valid: true,
    code: cleanCode,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: discount,
    originalAmount: numericAmount,
    finalAmount,
    applicableTo: coupon.applicableTo || 'all',
    description: coupon.description || '',
    message: coupon.discountType === 'percentage'
      ? `Coupon applied! ${coupon.discountValue}% discount applied successfully.`
      : `Coupon applied! ₹${coupon.discountValue.toLocaleString('en-IN')} discount applied successfully.`
  };
}

/**
 * Increment usage count of a coupon after successful payment
 */
export async function incrementCouponUsage(code) {
  if (!code) return;
  try {
    const cleanCode = code.trim().toUpperCase();
    await Coupon.findOneAndUpdate(
      { code: cleanCode },
      { $inc: { usedCount: 1 } }
    );
  } catch (err) {
    console.error('Failed to increment coupon usage:', err);
  }
}

// @desc    Validate a coupon code (Public)
// @route   POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, type = 'all', amount = 0 } = req.body;
    const result = await validateCouponInternal(code, type, amount);
    if (!result.valid) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ valid: false, message: 'Server error validating coupon.' });
  }
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    // Filter out deleted coupons
    const activeCoupons = coupons.filter(c => !c.isDeleted);
    const dbCodes = new Set(coupons.map(c => c.code)); // includes deleted ones so we don't re-add defaults
    const merged = [...activeCoupons];
    
    Object.values(DEFAULT_COUPONS).forEach(d => {
      if (!dbCodes.has(d.code)) {
        merged.push({
          ...d,
          _id: `default_${d.code}`,
          isSystemDefault: true,
          isActive: true,
          usedCount: 0
        });
      }
    });

    res.json(merged);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// @desc    Create a new coupon (Admin)
// @route   POST /api/coupons
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      applicableTo = 'all',
      minOrderAmount = 0,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive = true,
      description = ''
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ message: 'Code and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists' });
    }

    const coupon = new Coupon({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      applicableTo,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: Boolean(isActive),
      description
    });

    const saved = await coupon.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: error.message || 'Failed to create coupon' });
  }
});

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    let coupon = null;

    if (id.startsWith('default_')) {
      const code = id.replace('default_', '');
      const def = DEFAULT_COUPONS[code] || {};
      coupon = new Coupon({
        code,
        ...def,
        ...req.body
      });
      const saved = await coupon.save();
      return res.json(saved);
    }

    coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (req.body.code) {
      coupon.code = req.body.code.trim().toUpperCase();
    }
    if (req.body.discountType !== undefined) coupon.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) coupon.discountValue = Number(req.body.discountValue);
    if (req.body.applicableTo !== undefined) coupon.applicableTo = req.body.applicableTo;
    if (req.body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = req.body.maxDiscountAmount ? Number(req.body.maxDiscountAmount) : null;
    if (req.body.validFrom !== undefined) coupon.validFrom = req.body.validFrom ? new Date(req.body.validFrom) : coupon.validFrom;
    if (req.body.validUntil !== undefined) coupon.validUntil = req.body.validUntil ? new Date(req.body.validUntil) : null;
    if (req.body.usageLimit !== undefined) coupon.usageLimit = req.body.usageLimit ? Number(req.body.usageLimit) : null;
    if (req.body.isActive !== undefined) coupon.isActive = Boolean(req.body.isActive);
    if (req.body.description !== undefined) coupon.description = req.body.description;

    const updated = await coupon.save();
    res.json(updated);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: error.message || 'Failed to update coupon' });
  }
});

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    if (id.startsWith('default_')) {
      const code = id.replace('default_', '');
      await Coupon.findOneAndUpdate(
        { code },
        { code, isActive: false, isDeleted: true },
        { upsert: true }
      );
      return res.json({ message: 'Default coupon removed successfully' });
    }
    await Coupon.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

export default router;
