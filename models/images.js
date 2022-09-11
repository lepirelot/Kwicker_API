const db = require("../db/db");

class Images {
  constructor() {
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