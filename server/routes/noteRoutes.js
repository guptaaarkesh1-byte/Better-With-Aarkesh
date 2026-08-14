import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notes for a user
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notes', error: error.message });
  }
});

// Create a new note
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, attachedTo } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const note = new Note({
      user: req.user._id,
      title,
      content,
      attachedTo: attachedTo || 'Standalone note'
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating note', error: error.message });
  }
});

// Update a note
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content, attachedTo } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this note' });
    }

    note.title = title || note.title;
    note.content = content !== undefined ? content : note.content;
    note.attachedTo = attachedTo || note.attachedTo;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating note', error: error.message });
  }
});

// Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting note', error: error.message });
  }
});

export default router;
