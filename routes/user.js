var express = require('express');
var router = express.Router();
const { Users }  = require('../models/users');
const { authorizeAdmin, authorizeUser } = require('../utils/authorize');
const {hash} = require("bcrypt");
const userModel = new Users();

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

// Get all users
router.get('/all', authorizeAdmin, async function(req, res, next) {
  return res.json(await userModel.getAllUsers());
});

// Clear user session
router.get("/disconnect", authorizeUser, function (req, res, next) {
  req.session = null;
  return res.status(200).end();
});

// Get profile informations by ID
router.get('/profile/:id', authorizeUser, async function(req, res) {
  return res.json(await userModel.getProfileInformationsById(req.params.id));
});

// Search user similar to /:search
router.get('/search/:search', authorizeUser, async function(req, res, next) {
  return res.json(await userModel.getAllUsersSimilarTo(req.params.search));
});


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


// Delete an user by ID
router.delete("/:idUser", authorizeUser, async function(req, res, next) {
  if (!req.user.is_admin && req.params.idUser != req.session.idUser) return res.status(401).end();
  const deletedUser = userModel.deleteUser(req.params.idUser);
  if (!deletedUser) return res.status(404).end();
  if (!req.user.is_admin) req.session = null;
  return res.json(deletedUser);
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

// Register
router.post("/register", async function (req, res, next) {
  console.log("Routes --> register");
  if (!req.body ||
      (req.body.hasOwnProperty("forename") && req.body.forename == "") ||
      (req.body.hasOwnProperty("lastname") && req.body.lastname == "") ||
      (req.body.hasOwnProperty("email") && req.body.email =="") ||
      (req.body.hasOwnProperty("username") && req.body.username == "") ||
      (req.body.hasOwnProperty("password") && req.body.password == ""))
    return res.status(400).end();

  const authenticatedUser = await userModel.register(req.body);
  if (!authenticatedUser) return res.status(409).end();

  req.session.idUser = authenticatedUser.idUser;
  req.session.token = authenticatedUser.token;
  return res.json(authenticatedUser);
});

// Login
router.post("/login", async function (req, res, next) {
  if (!req.body ||
      (req.body.hasOwnProperty("username") && req.body.username == "") ||
      (req.body.hasOwnProperty("password") && req.body.password == ""))
    return res.status(400).end();

  const authenticatedUser = await userModel.login(req.body);
  if(authenticatedUser === 0)
    return res.sendStatus(404).end();
  if(authenticatedUser === 1)
    return res.sendStatus(403).end();

  req.session.idUser = authenticatedUser.id_user;
  req.session.token = authenticatedUser.token;

  return res.json(authenticatedUser);
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

// Update user forename
router.put('/forename/:idUser', authorizeUser, async function(req, res, next) {
  if (!req.body ||
      (req.body.hasOwnProperty("forename") && req.body.forename == ""))
    return res.status(400).end();
  const updatedUser = await userModel.updateUserForename(req.params.idUser, req.body.forename);
  if (!updatedUser) return res.status(403).end();
  return res.json(updatedUser);
});

// Update user lastname
router.put('/lastname/:idUser', authorizeUser, async function(req, res, next) {
  if (!req.body ||
      (req.body.hasOwnProperty("lastname") && req.body.lastname == ""))
    return res.status(400).end();
  const updatedUser = await userModel.updateUserLastname(req.params.idUser, req.body.lastname);
  if (!updatedUser) return res.status(403).end();
  return res.json(updatedUser);
});

// Update user biography
router.put('/biography/:idUser', authorizeUser, async function(req, res, next) {
  if (!req.body ||
      !req.body.hasOwnProperty("biography"))
    return res.status(400).end();
  const updatedUser = await userModel.updateUserBiography(req.params.idUser, req.body.biography);
  if (!updatedUser) return res.status(403).end();
  return res.json(updatedUser);
});

// Update user activation
router.put("/activate/:id_user", authorizeAdmin, async (req, res) => {
  console.log("Activate user");
  try {
    const rowCount = await userModel.activateUser(req.params.id_user);
    if(rowCount === 0)
      return res.sendStatus(404).end();
    return res.sendStatus(200).end();
  } catch (e) {
    return res.sendStatus(502).end();
  }
});

// Set a member to admin
router.put("/setadmin/:id_user", authorizeAdmin, async (req, res) => {
  console.log("PUT/ Set user admin");
  try {
    const rowCount = await userModel.setAdmin(req.params.id_user);
    if(rowCount === 0)
      return res.sendStatus(404).end();
    return res.sendStatus(200).end();
  } catch (e) {
    return res.sendStatus(502).end();
  }
});

// Set a member non admin
router.put("/setnotadmin/:id_user", authorizeAdmin, async (req, res) => {
  console.log("PUT/ Set user to non admin");
  try {
    const rowCount = await userModel.setNotAdmin(req.params.id_user);
    if(rowCount === 0)
      return res.sendStatus(404).end();
    return res.sendStatus(200).end();
  } catch (e) {
    return res.sendStatus(502).end();
  }
});

module.exports = router;