const express = require("express");
const {Messages} = require("../models/messages");
const {authorizeUser} = require("../utils/authorize");

const router = express.Router();
const messagesModel = new Messages();

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

router.get("/getMessages/:id_user/:id_contact", authorizeUser, async (req, res) => {
    console.log("GET/ messages");
    try {
        const messages = await messagesModel.getMessages(req.params.id_user, req.params.id_contact);
        if(messages.length === 0)
            return res.sendStatus(404).end();
        return res.json(messages);
    } catch (e) {
        res.sendStatus(502);
    }
});

router.get("/recipients/:id_user", authorizeUser, async (req, res) => {
    console.log("GET/ recipients");
    try {
        const recipients = await messagesModel.getRecipients(req.params.id_user);
        if(recipients.length === 0)
            return res.sendStatus(404).end();
        return res.json(recipients);
    } catch (e) {
        res.sendStatus(502);
    }
});

router.get("/sender/:id_recipient", authorizeUser, async (req, res) => {
    console.log("GET/ recipients");
    try {
        const recipients = await messagesModel.getSender(req.params.id_recipient);
        if(recipients.length === 0)
            return res.sendStatus(404).end();
        return res.json(recipients);
    } catch (e) {
        res.sendStatus(502);
    }
});

router.get("/lastConversationWith/:id_sender", authorizeUser, async (req, res) => {
    console.log("GET/ lastConversationWith");
    try {
        const recipient = await messagesModel.getLastConversationWith(req.params.id_sender);
        if(!recipient)
            return res.sendStatus(404).end();
        return res.json(recipient);
    } catch (e) {
        res.sendStatus(502);
    }
});

router.get("/conversationWith/:id_user", authorizeUser, async (req, res) => {
    console.log("GET/ conversationWith");
    try {
        const recipient = await messagesModel.getConversationWith(req.params.id_user);
        if(!recipient)
            return res.sendStatus(404).end();
        return res.json(recipient);
    } catch (e) {
        res.sendStatus(502);
    }
});

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

router.post("/", authorizeUser, async (req, res) => {
    const body = req.body;
    console.log(body)
    if(!body ||
        (body.hasOwnProperty("id_sender") && body.id_sender == "") ||
        (body.hasOwnProperty("id_recipient") && body.id_recipient == "") ||
        (body.hasOwnProperty("message") && body.message == ""))
        return res.sendStatus(400).end();
    try {
        const rowCount = await messagesModel.sendMessage(body.id_sender, body.id_recipient, body.message);
        if(rowCount === 0)
            return res.sendStatus(502).end();
        return res.sendStatus(200).end();
    } catch (e) {
        return res.sendStatus(502).end();
    }
});
module.exports = router;