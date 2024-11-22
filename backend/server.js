const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto'); 
const sequelize = require('./db');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const app = express();
const port = 8000;
app.use(cors());
app.use(bodyParser.json());


const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; 
const LINK_EXPIRATION_TIME = 10 * 60 * 1000; 

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.',
});


app.post('/register', async (req, res) => {
  const { name, contact, password } = req.body;

  if (!name || !contact || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^[0-9]{10}$/.test(contact);

  if (!isEmail && !isPhone) {
    return res.status(400).json({ message: 'Invalid contact format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let existingUser;
    if (isEmail) {
      existingUser = await User.findOne({ where: { email: contact } });
    } else if (isPhone) {
      existingUser = await User.findOne({ where: { phone_no: contact } });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      name,
      email: isEmail ? contact : null,
      phone_no: isPhone ? contact : null,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
});


app.post('/login', loginLimiter, async (req, res) => {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone = /^[0-9]{10}$/.test(contact);

    if (!isEmail && !isPhone) {
      return res.status(400).json({ message: 'Invalid contact format' });
    }

    let user;
    if (isEmail) {
      user = await User.findOne({ where: { email: contact } });
    } else if (isPhone) {
      user = await User.findOne({ where: { phone_no: contact } });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      return res.status(403).json({
        message: `Account is locked. Try again after ${new Date(user.lockedUntil).toLocaleTimeString()}`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_TIME); 
        await user.save();
        return res.status(403).json({
          message: `Account is locked due to too many failed attempts. Try again after ${new Date(user.lockedUntil).toLocaleTimeString()}`,
        });
      }

      await user.save();
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.post('/generate-one-time-link', async (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ message: 'Contact is required' });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^[0-9]{10}$/.test(contact);

  if (!isEmail && !isPhone) {
    return res.status(400).json({ message: 'Invalid contact format' });
  }

  try {
    let user;
    if (isEmail) {
      user = await User.findOne({ where: { email: contact } });
    } else if (isPhone) {
      user = await User.findOne({ where: { phone_no: contact } });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const oneTimeToken = crypto.randomBytes(32).toString('hex');
    const expirationTime = Date.now() + LINK_EXPIRATION_TIME;

    user.oneTimeToken = oneTimeToken;
    user.oneTimeTokenExpires = expirationTime;
    await user.save();

    const link = `${process.env.BASE_URL}/auth/one-time-login/${oneTimeToken}`;
    return res.status(200).json({
      message: 'One-time link generated successfully',
      link, 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating one-time link', error });
  }
});


app.get('/auth/one-time-login/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ where: { oneTimeToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid one-time link' });
    }

    if (user.oneTimeTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'One-time link has expired' });
    }

    // Generate JWT token for the user
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    user.oneTimeToken = null;
    user.oneTimeTokenExpires = null;
    await user.save();

    return res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing one-time login', error });
  }
});

app.delete('/delete-user', async (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ message: 'Contact is required' });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^[0-9]{10}$/.test(contact);

  if (!isEmail && !isPhone) {
    return res.status(400).json({ message: 'Invalid contact format' });
  }

  try {
    let user;
    if (isEmail) {
      user = await User.findOne({ where: { email: contact } });
    } else if (isPhone) {
      user = await User.findOne({ where: { phone_no: contact } });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user; 
    next();
  });
};

app.get('/validate-token', authenticateToken, (req, res) => {
  const currentTime = new Date().toISOString();
  return res.status(200).json({ message: 'Token is valid', serverTime: currentTime });
});


sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
