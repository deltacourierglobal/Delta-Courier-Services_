const User = require('../models/User');

// REGISTER ADMIN
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const newUser = new User({
      username,
      password
    });

    await newUser.save();

    res.json({ message: "Admin registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN ADMIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid login" });
    }

    res.json({
      message: "Login successful",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};