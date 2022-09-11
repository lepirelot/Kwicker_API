const db = require("../db/db");

class Images {
  constructor() {
  }

  async getProfileImage(idUser) {
    const query = {
      text: `SELECT image
             FROM kwicker.users
             WHERE id_user = $1`,
      values: [idUser]
    };
    try {
      const rows = await db.query(query);
      return rows;
    } catch (e) {
      console.log(e.stack);
      return undefined;
    }
  }

  async addProfileImage(idUser, imageBase64) {
    const query = {
      text: `UPDATE kwicker.users
             SET image = $1
             WHERE id_user = $2`,
      values: [imageBase64, idUser]
    };
    try {
      await db.query(query);
    } catch (e) {
      console.log(e.stack);
      throw new Error("Error while uploading a profile image.");
    }
  }
}

module.exports = { Images };