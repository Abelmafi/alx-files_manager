import sha1 from 'sha1';
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    try {
      const collection = dbClient.client.db().collection('users');
      const existingUser = await collection.findOne({ email });

      if (existingUser) {
        res.status(400).json({ error: 'Already exist' });
        return;
      }

      const hashedPassword = sha1(password);
      const newUser = { email, password: hashedPassword };

      const result = await collection.insertOne(newUser);

      res.status(201).json({ email: newUser.email, id: result.insertedId });
    } catch (error) {
      console.error('Error creating new user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { token } = req.headers;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const collection = dbClient.client.db().collection('users');
      const user = await collection.findOne({ _id: dbClient.ObjectId(userId) });

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.status(200).json({ email: user.email, id: user._id });
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
