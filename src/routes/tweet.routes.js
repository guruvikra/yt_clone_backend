import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    getTweetofUser,
    updateTweet,
    getUserTweets
    } from "../controllers/tweet.controller.js"


const router=Router()
router.use(jwtVerify)

router.route("/").get(getTweetofUser).post(createTweet)
router.route("/:id").delete(deleteTweet).patch(updateTweet)
router.route("/user/:userId").get(getUserTweets)



export default router