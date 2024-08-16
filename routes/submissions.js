const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to execute code
const executeCode = (filename, language) => {
  return new Promise((resolve, reject) => {
    let cmd;
    switch (language) {
      case 'cpp':
        cmd = `g++ ${filename} -o ${filename}.out && ./${filename}.out`;
        break;
      case 'python':
        cmd = `python3 ${filename}`;
        break;
      case 'java':
        cmd = `javac ${filename} && java ${path.parse(filename).name}`;
        break;
      default:
        reject(new Error('Unsupported language'));
        return;
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Submit and execute code
router.post('/',  async (req, res) => {
    //console.log("came here");
    const uniqueId = uuidv4();

    let output
    
  try {
    const { code, language } = req.body;
    // const problem = await Problem.findById(problemId);
    // if (!problem) {
    //   return res.status(404).json({ error: 'Problem not found' });
    // }

    // const submission = new Submission({
    //   //user: req.user._id,
    //   //problem: problemId,
    //   code,
    //   language,
    // });

    // await submission.save();

    // // Write code to file
    const filename = `submission_${uniqueId}.${language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : 'py'}`;
    await fs.writeFile(filename, code);

    // Execute code
    
    try {
      output = await executeCode(filename, language);
    } catch (error) {
        console.log(error);
    }
   

    // Clean up
    await fs.unlink(filename);
    if (language === 'cpp') {
      await fs.unlink(`${filename}.out`);
    } else if (language === 'java') {
      await fs.unlink(`${path.parse(filename).name}.class`);
    }
    res.status(201).json(output);
  } catch (error) {
    res.status(400).json({ error: 'Submission failed: ' + error.message });
  }
});

// Get user's submissions
router.get('/user',  async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get a specific submission
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('problem', 'title');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

module.exports = router;