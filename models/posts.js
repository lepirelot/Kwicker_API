const db = require("../db/db");
const escape = require("escape-html");

class Posts {

    /*
    *
    * ░██████╗░███████╗████████╗
    * ██╔════╝░██╔════╝╚══██╔══╝
    * ██║░░██╗░█████╗░░░░░██║░░░
    * ██║░░╚██╗██╔══╝░░░░░██║░░░
    * ╚██████╔╝███████╗░░░██║░░░
    * ░╚═════╝░╚══════╝░░░╚═╝░░░
    *
    **/

    /**
     * Request to the db to SELECT all posts
     * @returns {Array} rows -> list of all posts
     */
    async getAllPosts() {
        const query = `SELECT id_post,
                              id_user,
                              image,
                              message,
                              parent_post,
                              is_removed,
                              date_creation,
                              number_of_likes
                       FROM kwicker.posts
                       ORDER BY id_post DESC`;
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all posts from the database.");
        }
    }

    /**
     * Return the user from the db
     * @param body
     * @returns {Promise<{image, parent_post, id_user, message}>}
     */
    async getUserPosts(id_user) {
        const query = {
            text: `SELECT id_post,
                              id_user,
                              image,
                              message,
                              parent_post,
                              is_removed,
                              date_creation,
                              number_of_likes
                       FROM kwicker.posts
                       WHERE id_user = $1
                       ORDER BY date_creation`,
            values: [id_user]
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting user's posts from the database.");
        }
    }

    async getPostsByLikesNumber() {
        const query = `SELECT id_post,
                              id_user,
                              image,
                              message,
                              parent_post,
                              is_removed,
                              date_creation,
                              number_of_likes
                       FROM kwicker.posts
                       ORDER BY number_of_likes DESC`;
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all posts ordered by number of likes from the db.");
        }
    }

    /**
     * @param idUser display only from one user o (so ordered by date)
     * @returns a list of posts associate with user and likes ordered by likes
     */
    async getPostsWithLikesAndUser(idUser) {
        const query = {
            text: ` SELECT u.id_user, u.username, p.id_post, p.message, p.image, p.date_creation, p.number_of_likes
                    FROM kwicker.users u LEFT OUTER JOIN kwicker.posts p ON u.id_user = p.id_user
                    WHERE p.is_removed = FALSE AND u.is_active = TRUE `
        };

        if (idUser != "null") {
            query.text += ` AND u.id_user = $1 `;
            query.values = [idUser];
        }

        if (idUser != "null") {
            query.text += `ORDER BY p.date_creation DESC`
        } else {
            query.text += `ORDER BY p.number_of_likes DESC`
        }

        try {
            const { rows } = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    }


    async getHomePosts(idUser) {

        let query = {
            text: `SELECT u.id_user, u.username, p.id_post, p.message, p.image, p.date_creation, p.number_of_likes
                   FROM kwicker.users u LEFT OUTER JOIN kwicker.posts p ON u.id_user = p.id_user
                                        LEFT OUTER JOIN kwicker.follows f ON u.id_user = f.id_user_followed
                   WHERE p.is_removed = FALSE AND u.is_active = TRUE
                     AND f.id_user_follower = $1
                   ORDER BY p.date_creation DESC`,
            values: [idUser]
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
     * Select all posts liked by a user identified by its id
     * @param id_user
     * @returns {Promise<*>}
     */
    async getLikedPosts(id_user) {
        const query = {
            text: `SELECT p.id_post,
                          u.id_user,
                          u.username,
                          p.image,
                          p.message,
                          p.parent_post,
                          p.is_removed,
                          p.date_creation,
                          p.number_of_likes
                   FROM kwicker.posts p,
                        kwicker.users u
                   WHERE p.id_user = u.id_user
                     AND p.is_removed = FALSE
                     AND p.id_post IN (SELECT id_post
                                     FROM kwicker.likes
                                     WHERE id_user = $1)`,
            values: [id_user]
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting posts liked by the user from the dataase.");
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

    /**
     * Add a new post to the db
     * @param body
     * @returns {Promise<void>}
     */
    async createPost(body) {
        const query = {
            text: `INSERT INTO kwicker.posts (id_user, image, message, parent_post)
                   VALUES ($1, $2, $3, $4)`,
            values: [body.id_user,
                     escape(body.image),
                     escape(body.message),
                     body.parent_post]
        };
        try {
            await db.query(query);
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while creating post to database.");
        }
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

    /**
     * Update the post identified by its id and add it body's attributes, image and message are required
     * @param id_post
     * @param body
     * @returns {Promise<null|number|*>}
     */
    async updatePost(id_post, body) {
        const query = {
            text: "UPDATE kwicker.posts SET image = $1, message = $2 WHERE id_post = $3",
            values: [escape(body.image),
                     escape(body.message),
                     id_post]
        } ;
        try {
            const result = db.query(query);
            return result.rowCount;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while updating post in the database.");
        }
    }

    async activatePost(id_post) {
        const query = {
            text: `UPDATE kwicker.posts
                   SET is_removed = FALSE
                   WHERE id_post = $1`,
            values: [id_post]
        };
        try{
            const result = await db.query(query);
            return result.rowCount;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while activating a post from the database.");
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

    /**
     * Remove a post from the db
     * @param id_post
     * @returns {Promise<null|number|*>}
     */
    async removePost(id_post) {
        const query = {
            text: `UPDATE kwicker.posts
                       SET is_removed = TRUE
                       WHERE id_post = $1`,
            values: [id_post]
        };
        try {
            const result = await db.query(query);
            return result.rowCount;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while removing a post from the database.");
        }
    }
}

module.exports = {Posts};