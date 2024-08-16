const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases -testCaseGenerator');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get a specific problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select('-testCaseGenerator');
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Create a new problem
router.post('/', async (req, res) => {
  try {
    const problem = new Problem({
      ...req.body,
      creator: req.user._id
    });
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create problem' });
  }
});

// Update a problem
router.put('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found or you are not the creator' });
    }
    res.json(problem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update problem' });
  }
});

// Delete a problem
router.delete('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found or you are not the creator' });
    }
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Generate test cases
router.post('/:id/generate-test-cases', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const testCases = await problem.generateTestCases(req.body.count || 5);
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate test cases' });
  }
});

module.exports = router;