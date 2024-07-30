import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} from "../controllers/like.controller.js"

const router = Router()


router.use(jwtVerify)

router.route("/:videoId").post(toggleVideoLike)
router.route("/:commentId").post(toggleCommentLike)
router.route("/:tweetId").post(toggleTweetLike)






export default router