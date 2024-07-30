import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    addComment,
    deleteComment,
    updateComment
    
} from "../controllers/comment.controller.js"




const router =Router();
router.use(jwtVerify)

router.route("/:videoId").post(addComment)

router.route("/:commentId").patch(updateComment).delete(deleteComment)



export default router