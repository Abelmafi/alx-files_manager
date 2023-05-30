const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { v4: uuidv4 } = require('uuid');
const { sha1 } = require('bcryptjs');

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Basic ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const credentials = authorization.slice('Basic '.length);
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8').split(':');
    const email = decodedCredentials[0];
    const password = decodedCredentials[1];

    try {
      const collection = dbClient.client.db().collection('users');
      const user = await collection.findOne({ email, password: sha1(password) });

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 'EX', 24 * 60 * 60);

      res.status(200).json({ token });
    } catch (error) {
      console.error('Error connecting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const { token } = req.headers;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const key = `auth_${token}`;
      const deletedCount = await redisClient.del(key);

      if (deletedCount === 0) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error disconnecting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
