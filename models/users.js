"use strict";
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const db = require("../db/db");
const LIFETIME_JWT = 24 * 60 * 60 * 1000;
const saltRounds = 10;

class Users {
  constructor() {
  }


/*
*
*  ░██████╗░███████╗████████╗
*  ██╔════╝░██╔════╝╚══██╔══╝
*  ██║░░██╗░█████╗░░░░░██║░░░
*  ██║░░╚██╗██╔══╝░░░░░██║░░░
*  ╚██████╔╝███████╗░░░██║░░░
*  ░╚═════╝░╚══════╝░░░╚═╝░░░
*
**/

  async getAllUsers() {
    const query = `SELECT id_user, forename, lastname, email, username, image, password, is_active, is_admin, biography, date_creation 
                    FROM kwicker.users
                    ORDER BY id_user`;
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  async getAllUsersSimilarTo(search) {
    const query = {
      text: `SELECT id_user,
                    forename,
                    lastname,
                    email,
                    username,
                    image,
                    is_active,
                    is_admin,
                    biography,
                    date_creation
             FROM kwicker.users
             WHERE (lower(forename) LIKE $1 OR lower(lastname) LIKE $1 OR lower(username) LIKE $1)
               AND is_active = TRUE`,
      values: [search + '%']
    };
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (e) {
      return false;
    }
  }

  async getUserById(id) {
    const query = {
      text: `SELECT id_user,
                    forename,
                    lastname,
                    email,
                    username,
                    image,
                    password,
                    is_active,
                    is_admin,
                    biography,
                    date_creation
             FROM kwicker.users u
             WHERE u.id_user = $1`,
      values: [id]
    };
    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  async getUserByUsername(username) {
    const query = {
      text: `SELECT id_user,
                    forename,
                    lastname,
                    email,
                    username,
                    password,
                    is_active,
                    is_admin,
                    biography,
                    date_creation
             FROM kwicker.users
             WHERE username = $1`,
      values: [username]
    };
    try {
      const { rows } = await db.query(query);
      if (!rows || rows.length === 0) return;
      return rows[0];
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  async getProfileInformationsById(id) {
    const query = {
      text: `SELECT id_user,
                    forename,
                    lastname,
                    email,
                    username,
                    is_active,
                    is_admin,
                    biography,
                    date_creation
             FROM kwicker.users
             WHERE id_user = $1`,
      values: [id]
    };
    try {
      const { rows } = await db.query(query);
      if (!rows || rows.length === 0) return;
      return rows[0];
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }


/*
*
*  ██████╗░███████╗██╗░░░░░███████╗████████╗███████╗
*  ██╔══██╗██╔════╝██║░░░░░██╔════╝╚══██╔══╝██╔════╝
*  ██║░░██║█████╗░░██║░░░░░█████╗░░░░░██║░░░█████╗░░
*  ██║░░██║██╔══╝░░██║░░░░░██╔══╝░░░░░██║░░░██╔══╝░░
*  ██████╔╝███████╗███████╗███████╗░░░██║░░░███████╗
*  ╚═════╝░╚══════╝╚══════╝╚══════╝░░░╚═╝░░░╚══════╝
*
**/

  async deleteUser(id) {
    const query = {
      text: `UPDATE kwicker.users
             SET is_active = FALSE
             WHERE id_user = $1`,
      values: [id]
    }
    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (e) {
      return false;
    }
  }


/*
*
*  ██████╗░░█████╗░░██████╗████████╗
*  ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
*  ██████╔╝██║░░██║╚█████╗░░░░██║░░░
*  ██╔═══╝░██║░░██║░╚═══██╗░░░██║░░░
*  ██║░░░░░╚█████╔╝██████╔╝░░░██║░░░
*  ╚═╝░░░░░░╚════╝░╚═════╝░░░░╚═╝░░░
*
**/

  async addUser(body) {
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    const query = {
      name: 'insert-user',
      text: 'INSERT INTO kwicker.users VALUES (DEFAULT, $1, $2, $3, $4, NULL, $5, DEFAULT, DEFAULT, NULL, DEFAULT)',
      values: [body.forename, body.lastname, body.email, body.username, hashedPassword]
    };
    try {
      const result = await db.query(query);
      return result.rowCount;
    } catch (e) {
      return false;
    }
  }

  async login(body) {
    const userFound = await this.getUserByUsername(body.username);
    if (!userFound) return 0;

    const match = await bcrypt.compare(body.password, userFound.password);
    if (!match) return 1;

    const authenticatedUser = {
      id_user: userFound.id_user,
      is_admin: userFound.is_admin,
      token: "None",
    };

    const token = jwt.sign(
        { idUser: authenticatedUser.id_user },
        process.env.jwtSecret,
        { expiresIn: LIFETIME_JWT }
    );

    authenticatedUser.token = token;
    return authenticatedUser;
  }

  async register(body) {
    const rowCount = await this.addUser(body);
    if (rowCount === 0) return;
    return await this.login(body);
  }


/*
*
*  ██╗░░░██╗██████╗░██████╗░░█████╗░████████╗███████╗
*  ██║░░░██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
*  ██║░░░██║██████╔╝██║░░██║███████║░░░██║░░░█████╗░░
*  ██║░░░██║██╔═══╝░██║░░██║██╔══██║░░░██║░░░██╔══╝░░
*  ╚██████╔╝██║░░░░░██████╔╝██║░░██║░░░██║░░░███████╗
*  ░╚═════╝░╚═╝░░░░░╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░╚══════╝
*
**/

  async updateUserForename(id, forename) {
    const query = {
      text: `UPDATE kwicker.users
             SET forename = $1
             WHERE id_user = $2`,
      values: [forename, id]
    };
    try {
      return await db.query(query) != null;
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  async updateUserLastname(id, lastname) {
    const query = {
      text: `UPDATE kwicker.users
             SET lastname = $1
             WHERE id_user = $2`,
      values: [lastname, id]
    };
    try {
      return await db.query(query) != null;
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  async updateUserBiography(id, biography) {
    const query = {
      text: `UPDATE kwicker.users
             SET biography = $1
             WHERE id_user = $2`,
      values: [biography, id]
    };

    try {
      return await db.query(query);
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }


  async updateUserImage(id, image) {
    const query = {
      text: `UPDATE kwicker.users
             SET image = $1
             WHERE id_user = $2`,
      values: [image, id]
    };
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (e) {
      console.log(e.stack);
      return false;
    }
  }

  /**
   * Activate the user an return 1 if it worked, otherwise 0
   * @param id_user
   * @returns {Promise<void>}
   */
  async activateUser(id_user) {
    const query = {
      text: `UPDATE kwicker.users
             SET is_active = TRUE
             WHERE id_user = $1`,
      values: [id_user]
    };
    try{
      const result = await db.query(query);
      return result.rowCount;
    } catch (e) {
      console.log(e.stack);
      throw new Error("Error while changing is_active to TRUE");
    }
  }

  /**
   * Set a user to admin
   * @param id_user
   * @returns {Promise<null|number|*>}
   */
  async setAdmin(id_user) {
    const query = {
      text: `UPDATE kwicker.users
             SET is_admin = TRUE
             WHERE id_user =  $1`,
      values: [id_user]
    };
    try {
      const result = await db.query(query);
      return result.rowCount;
    } catch (e) {
      console.log(e.stack);
      throw new Error("Error while changing is_admin to TRUE.");
    }
  }

  /**
   * Set a user from admin to non admin
   * @param id_user
   * @returns {Promise<null|number|*>}
   */
  async setNotAdmin(id_user) {
    const query = {
      text: `UPDATE kwicker.users
             SET is_admin = FALSE
             WHERE id_user = $1`,
      values: [id_user]
  };
    try {
      const result = await db.query(query);
      return result.rowCount;
    } catch (e) {
      console.log(e.stack);
      throw new Error("Error while changing is_admin to FALSE.");
    }
  }
}

module.exports = { Users };