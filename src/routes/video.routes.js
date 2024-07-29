import { Router  } from "express";
import { 
    getVideoById,
    publishVideo,
    deleteVideoById,
    togglePublishStatus, 
    updateVideoById,
    updateThumbNail
} from "../controllers/video.controller.js";
import {jwtVerify} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router =  Router()
router.use(jwtVerify)



router.route("/upload").post(
    upload.fields([
        {name:"video",maxCount:1},
        {name:"thumbnail",maxCount:1}
    ]),
    publishVideo)

router.route("/:id/publish").get(togglePublishStatus)
router.route("/:id").
get(getVideoById).
delete(deleteVideoById).
patch(upload.single("video"),updateVideoById)

router.route("/update-thumbnail/:id").patch(upload.single("thumbnail"),updateThumbNail)


export default router