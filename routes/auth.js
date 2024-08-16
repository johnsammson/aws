const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username  } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new UserModel({
        email: email,
        username: username,
        password: hash,
      });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    console.log(error);
    
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({ email: email });
  
      if (!user) {
        return res.json({ error: "User Doesn't Exist" });
      }
  
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.json({ error: "Wrong Username And Password Combination" });
      }
  
      const accessToken = jwt.sign(
        { email: user.email, id: user.id, name: user.username, user:user},
        process.env.JWT_SECRET
      );
  
      res.json({
        token: accessToken,
        name: user.username,
        role: user.role,
        lastname: user.lastname,
        id: user.id,
        email: user.email,
        friends: user.friends,
        user:user
      });
    } catch (err) {
      // Pass the error to the next middleware for centralized error handling
      console.log(err);
      
      res.json({ error: "An Error Occurred" });
    }
});

// Logout (optional, as JWT is stateless)
router.post('/logout', auth, async (req, res) => {
  try {
    // You might want to implement a token blacklist here
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;