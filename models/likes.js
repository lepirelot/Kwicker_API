const db = require("../db/db");

class Likes {
    /**
     * Select all likes from the database
     * @returns {Promise<*>}
     */
    async getAllLikes() {
        const query = {
            name: "fetch-likes",
            text: `SELECT id_user,
                          id_post
                   FROM kwicker.likes`
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all likes from the database.");
        }
    }

    async getUserLikes(id_user) {
        const query = {
            name: "fetch-user-likes",
            text: `SELECT id_user,
                          id_post
                   FROM kwicker.likes
                   WHERE id_user = $1`,
            values: [id_user]
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting user's likes.");
        }
    }

    async getPostLikes(id_post) {
        const query = {
            text: `SELECT id_user,
                          id_post
                   FROM kwicker.likes
                   WHERE id_post = $1`,
            values: [id_post]
        };
        try{
            const {rows} = await db.query(query);
            return rows;
        } catch (e){
            console.log(e.stackTrace);
            throw new Error("Error while getting all post likes.");
        }
    }

    /**
     * Add a new like to the db
     * @param body
     * @returns {Promise<void>}
     */
    async addLike(body) {
        const query = {
            text: "INSERT INTO kwicker.likes VALUES ($1, $2)",
            values: [body.id_user, body.id_post]
        };
        try {
            await db.query(query)
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while add a new like in the db.");
        }
    }
    async existLike(body) {
        const query = {
            text: "SELECT id_user, id_post FROM kwicker.likes WHERE id_user = $1 AND id_post = $2",
            values: [body.id_user, body.id_post]
        };
        try {
            const rows = await db.query(query);
            return rows.rowCount
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while add a new like in the db.");
        }
    }

    async toggleLike(body) {
        let query = {
            text: "",
            values: []
        };
        let returnValue = true;

        if (await this.existLike(body)) {
            query.text = "DELETE FROM kwicker.likes WHERE id_user = $1 AND id_post = $2";
            query.values = [body.id_user, body.id_post];
            returnValue = false;
        } else {
            query.text = "INSERT INTO kwicker.likes VALUES ($1, $2)";
            query.values = [body.id_user, body.id_post];
        }

        try {
            await db.query(query);
            return returnValue;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while add a new like in the db.");
        }

    }

    async removeLike(body) {
        const query = {
            text: `DELETE
                   FROM kwicker.likes
                   WHERE id_user = $1
                     AND id_post = $2`,
            values: [body.id_user, body.id_post]
        };
        try {
            const result = db.query(query);
            return result.rowCount;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while deleting like from the db.");
        }
    }
}

module.exports = {Likes};