var express = require('express');
var router = express.Router();

const { authorizeUser } = require('../utils/authorize');
const {Images} = require("../models/images");
const {Users} = require("../models/users");

const usersModel = new Users();
const imageModel = new Images();

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

router.get("/profile/:id", authorizeUser, async function(req, res, next) {
  return res.json(await imageModel.getProfileImage(req.params.idUser));
});

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

router.put("/profile", authorizeUser, async function(req, res, next) {
  if (!req.body
      || (req.body.hasOwnProperty("idUser") && req.body.idUser == "")
      || (req.body.hasOwnProperty("imageBase64") && req.body.imageBase64 == "")
  ) {
    console.log(req.body)
    return res.sendStatus(400);
  }
  if (usersModel.getUserById(req.body.idUser)) {
    await imageModel.addProfileImage(req.body.idUser, req.body.imageBase64);
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

module.exports = router;