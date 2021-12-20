const db = require("../db/db");
const {decrypt, encrypt} = require("../utils/crypt");

class Messages {

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
     * Get all messages for a conversation
     * @param id_sender
     * @param id_recipient
     * @returns {Promise<*>}
     */
    async getMessages(id_sender, id_recipient) {
        const query = {
            text: `SELECT id_message,
                          id_sender,
                          id_recipient,
                          message,
                          date_creation
                   FROM kwicker.messages
                   WHERE (id_sender = $1 AND id_recipient = $2)
                      OR (id_sender = $2 AND id_recipient = $1)
                   ORDER BY id_message`,
            values: [id_sender, id_recipient]
        };

        try {
            const {rows} = await db.query(query);
            decrypt(rows);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all messages from a conversation from the database.");
        }
    }

    /**
     * Getting all senders
     * @param id_sender
     * @returns {Promise<number|*>}
     */
    async getSender(id_recipient) {
        const query = {
            text: `SELECT DISTINCT id_sender
                   FROM kwicker.messages
                   WHERE id_recipient = $1`,
            values: [id_recipient]
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all users the sender talked with");
        }
    }

    async getRecipients(id_sender) {
        const query = {
            text: `SELECT DISTINCT id_recipient
                   FROM kwicker.messages
                   WHERE id_sender = $1`,
            values: [id_sender]
        };
        try {
            const {rows} = await db.query(query);
            return rows;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting all users the sender talked with");
        }
    }

    async getLastConversationWith(id_sender) {
        const query = {
            text: `SELECT DISTINCT id_sender,
                                   id_recipient,
                                   id_message
                   FROM kwicker.messages
                   WHERE id_sender = $1
                      OR id_recipient = $1
                   ORDER BY id_message DESC
                   LIMIT 1`,
            values: [id_sender]
        };
        try {
            const {rows} = await db.query(query);
            return rows[0];
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting the last conversation id_recipient.");
        }
    }

    async getConversationWith(id_user) {
        const query = {
            text: `SELECT DISTINCT id_sender,
                                   id_recipient
                   FROM kwicker.messages
                   WHERE id_sender = $1
                      OR id_recipient = $1`,
            values: [id_user]
        };
        try {
            const {rows} = await db.query(query);
            return rows[0];
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while getting the last conversation id_recipient.");
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
     * Insert a message between 2 users into the database
     * @param id_sender
     * @param id_recipient
     * @param message
     * @returns {Promise<null|number|*>}
     */
    async sendMessage(id_sender, id_recipient, message) {
        const query = {
            text: `INSERT INTO kwicker.messages (id_sender, id_recipient, message)
                   VALUES ($1, $2, $3)`,
            values: [id_sender, id_recipient, encrypt(message)]
        };
        try {
            const result = await db.query(query);
            return result.rowCount;
        } catch (e) {
            console.log(e.stack);
            throw new Error("Error while insert a message into the database.");
        }
    }
}

module.exports = {Messages};