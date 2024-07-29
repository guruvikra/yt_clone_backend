import { Router  } from "express";
import { loginUser,
     registerUser,
     logoutUser ,
     refreshAccessToken,
     changeUserAvatar,
     changeProfielInfo,
     changeUserCoverImage,
     changeUserPassword,
     currentUser,
     getChannelProfile,
     getUserWatchHistory
    
    } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";


const router =  Router()


router.route("/").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(jwtVerify,logoutUser)
router.route("/refresh").post(refreshAccessToken)
router.route("/updateavatar").patch(jwtVerify,
    upload.single("avatar"),
    changeUserAvatar)
router.route("/updatecoverimage").patch(jwtVerify,
        upload.single("coverimage"),
        changeUserCoverImage)
router.route("/updateprofile").patch(jwtVerify,changeProfielInfo)
router.route("/changepassword").post(jwtVerify,changeUserPassword)
router.route("/profile").get(jwtVerify,currentUser)
router.route("/channelinfo/:username").get(jwtVerify,getChannelProfile)
router.route("/watchhistory").get(jwtVerify,getUserWatchHistory)




export default router


