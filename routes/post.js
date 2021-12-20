const express = require("express");
const {Posts} = require("../models/posts");
const {authorizeUser, authorizeAdmin} = require("../utils/authorize");

const router = express.Router();
const postsModel = new Posts();

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
 * GET all posts
 */
router.get("/", authorizeUser, async (req, res) => {
    try {
        const posts = await postsModel.getAllPosts();
        return res.json(posts);
    } catch (e) {
        return res.sendStatus(502);
    }
});

/**
 * GET all posts from a user identified by its id
 */
router.get("/user/:id_user", authorizeUser, async (req, res) => {
    console.log("GET/ : Posts from a user");
    try {
        const posts = await postsModel.getUserPosts(req.params.id_user);

        return res.json(posts);
    } catch (e) {
        return res.sendStatus(502);
    }
});

router.get("/orderbylike", authorizeUser, async (req, res) => {
    console.log("GET/ : Posts ordered by number of likes");
    try{
        const posts = await postsModel.getPostsByLikesNumber();
        return res.json(posts);
    } catch (e){
        return res.sendStatus(502);
    }
});

router.get("/allPostWithLikesAndUser/:profilePosts", authorizeUser, async (req, res) => {
    try{
        const posts = await postsModel.getPostsWithLikesAndUser(req.params.profilePosts);
        return res.json(posts);
    } catch (e){
        return res.sendStatus(502);
    }
});

// GET get all posts liked by a user
router.get("/postsLiked/:id_user", authorizeUser, async (req, res) => {
    console.log("GET/ postsLiked");
    try {
        const posts = await postsModel.getLikedPosts(req.params.id_user);
        return res.json(posts);
    } catch (e) {
        return res.sendStatus(502).end();
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

/**
 * POST add a new post to the db
 */
router.post("/", authorizeUser, async (req, res) => {
    console.log("POST/");
    if (!req.body)
        return res.sendStatus(400);
    try {
        await postsModel.createPost(req.body);
        return res.sendStatus(201);
    } catch (e) {
        return res.sendStatus(502);
    }
});

router.post("/homepage", authorizeUser, async (req, res) => {
    if(!req.body ||
        (req.body.hasOwnProperty("id_user") && req.body.id_user == ""))
        return res.sendStatus(400).end();
    try {
        const posts = await postsModel.getHomePosts(req.body.id_user);
        return res.json(posts);
    } catch (e) {
        return res.sendStatus(502);
    }
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

/**
 * PUT update a post identified by its id
 */
router.put("/:id_post", authorizeUser, async function (req, res) {
    console.log("PUT/ Update a post");
    if (!req.body ||
        (req.body.hasOwnProperty("message") && req.body.message == ""))
        return res.sendStatus(400).end();
    try {
        const rowCount = await postsModel.updatePost(req.params.id_post, req.body);
        if (rowCount === 0)
            return res.sendStatus(404).end();
        return res.sendStatus(200).end();
    } catch (e) {
        return res.sendStatus(502).end();
    }
});

/**
 * PUT update a post to is_removed = FALSE
 */
router.put("/activate/:id_post", authorizeAdmin, async function (req, res) {
    console.log("PUT/ activate a post");
    try{
        const rowCount = await postsModel.activatePost(req.params.id_post);
        if(rowCount === 0)
            return res.sendStatus(404).end();
        return res.sendStatus(200).end();
    } catch (e) {
        return res.sendStatus(502).end();
    }
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

/**
 * DELETE a post identified by its id
 */
router.delete("/:id_post", authorizeUser, async (req, res) => {
    console.log("DELETE /");
    try {
        const rowCount = await removePost(req.params.id_post);
        if (rowCount === 0)
            return res.sendStatus(404).end();
        return res.sendStatus(200).end();
    } catch (e) {
        res.sendStatus(502).end();
    }
});

router.delete("/admin/:id_post", authorizeAdmin, async (req, res) => {
    console.log("DELETE /admin/");
    try {
        const rowCount = await removePost(req.params.id_post);
        if(rowCount === 0)
            return res.sendStatus(404).end();
        return res.sendStatus(200).end();
    } catch (e) {
        res.sendStatus(502).end();
    }
});

async function removePost(id_post) {
    return await postsModel.removePost(id_post);
}

module.exports = router;