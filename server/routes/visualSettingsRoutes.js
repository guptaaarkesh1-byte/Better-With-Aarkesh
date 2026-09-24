import express from 'express';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_VISUAL_SETTINGS = {
  contrast: 100, // percentage (50% - 150%)
  brightness: 100, // percentage (50% - 150%)
  overlayDarkness: 40, // percentage (0% - 90%)
  saturation: 100, // percentage (50% - 150%)
  fontScale: 100, // percentage (75% - 135%)
};

// @desc    Get universal visual appearance settings (Contrast, Brightness, Overlay, Font Size)
// @route   GET /api/visual-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settingsDoc = await Settings.findOne({ key: 'global_visual_settings' });
    if (!settingsDoc) {
      // Also check home_settings hero overlay opacity as fallback
      const homeDoc = await Settings.findOne({ key: 'home_settings' });
      const heroOpacity = homeDoc?.value?.hero?.overlayOpacity;
      const initialSettings = {
        ...DEFAULT_VISUAL_SETTINGS,
        overlayDarkness: typeof heroOpacity === 'number' ? heroOpacity : 40,
      };

      settingsDoc = await Settings.create({
        key: 'global_visual_settings',
        value: initialSettings,
      });
    }

    res.json({
      ...DEFAULT_VISUAL_SETTINGS,
      ...(settingsDoc.value || {})
    });
  } catch (error) {
    console.error('Error fetching visual settings:', error);
    res.status(500).json({ message: 'Server error fetching visual settings' });
  }
});

// @desc    Update universal visual appearance settings
// @route   PUT /api/visual-settings
// @access  Admin / Public configuration
router.put('/', async (req, res) => {
  try {
    const { contrast, brightness, overlayDarkness, saturation, fontScale } = req.body;

    const newValues = {
      contrast: typeof contrast === 'number' ? Math.max(30, Math.min(200, Number(contrast))) : 100,
      brightness: typeof brightness === 'number' ? Math.max(30, Math.min(200, Number(brightness))) : 100,
      overlayDarkness: typeof overlayDarkness === 'number' ? Math.max(0, Math.min(95, Number(overlayDarkness))) : 40,
      saturation: typeof saturation === 'number' ? Math.max(0, Math.min(200, Number(saturation))) : 100,
      fontScale: typeof fontScale === 'number' ? Math.max(70, Math.min(140, Number(fontScale))) : 100,
    };

    let settingsDoc = await Settings.findOneAndUpdate(
      { key: 'global_visual_settings' },
      { value: newValues },
      { new: true, upsert: true }
    );

    // Also sync overlayOpacity into home_settings hero so both remain consistent
    try {
      const homeDoc = await Settings.findOne({ key: 'home_settings' });
      if (homeDoc && homeDoc.value) {
        if (!homeDoc.value.hero) homeDoc.value.hero = {};
        homeDoc.value.hero.overlayOpacity = newValues.overlayDarkness;
        homeDoc.markModified('value');
        await homeDoc.save();
      }
    } catch (syncErr) {
      console.error('Error syncing overlay to home_settings:', syncErr);
    }

    res.json({
      success: true,
      message: 'Global visual settings saved successfully',
      settings: settingsDoc.value
    });
  } catch (error) {
    console.error('Error saving visual settings:', error);
    res.status(500).json({ message: 'Server error saving visual settings' });
  }
});

export default router;
