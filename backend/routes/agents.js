const express = require('express');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all agents
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new agent
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new agent
    const agent = new Agent({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    await agent.save();

    // Return agent without password
    const { password: _, ...agentData } = agent.toObject();
    res.status(201).json({ message: 'Agent created successfully', agent: agentData });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete agent
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
