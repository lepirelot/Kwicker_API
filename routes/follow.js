var express = require('express');
var router = express.Router();
const { Follows }  = require('../models/follows');
const { authorizeUser } = require('../utils/authorize');
const followsModel = new Follows();

router.get("/followers/:idUser", authorizeUser, async function (req, res, next) {
    return res.json(await followsModel.getFollowers(req.params.idUser));
});

router.get("/followeds/:idUser", authorizeUser, async function (req, res, next) {
    return res.json(await followsModel.getFolloweds(req.params.idUser));
});

router.post("/exists", authorizeUser, async function (req, res, next) {
    if (!req.body ||
        (req.body.hasOwnProperty("id_user_followed") && req.body.id_user_followed == "") ||
        (req.body.hasOwnProperty("id_user_follower") && req.body.id_user_follower == ""))
        return res.sendStatus(400);
    try {
        if(await followsModel.existFollow(req.body))
            return res.sendStatus(201);
        else
            return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(502);
    }
});

router.post("/toggle", authorizeUser, async function (req, res, next) {
    if (!req.body ||
        (req.body.hasOwnProperty("id_user_followed") && req.body.id_user_followed == "") ||
        (req.body.hasOwnProperty("id_user_follower") && req.body.id_user_follower == ""))
        return res.sendStatus(400);
    try {
        if(await followsModel.toggleFollow(req.body))
            return res.sendStatus(201);
        else
            return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(502);
    }
});

module.exports = router;