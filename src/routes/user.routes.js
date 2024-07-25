import { Router  } from "express";
import { loginUser, registerUser,logoutUser ,refreshAccessToken} from "../controllers/user.controller.js"
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
export default router


