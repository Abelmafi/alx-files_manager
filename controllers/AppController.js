const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
/**
 * defining appcontroller
 */


class AppController {
  /**
   * Checks if this client's connection to the MongoDB server is active
   */
  static async getStatus(req, res) {
    const redisStatus = await redisClient.isAlive();
    const dbStatus = await dbClient.isAlive();

    if (redisStatus && dbStatus) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(500).json({ redis: false, db: false});
    }
  }
  /**
   * Checks if this client's connection to the MongoDB server is active
   */
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

module.exports = AppController;
