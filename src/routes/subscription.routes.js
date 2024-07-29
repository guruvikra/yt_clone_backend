import { Router  } from "express";

import {jwtVerify} from "../middlewares/auth.middleware.js"
import { toogleSubscription, getUserChannelSubscribers, getSubscribedChannels} from "../controllers/subscription.controller.js";


const router =  Router()
router.use(jwtVerify)

router.get("/subscribed-to",getSubscribedChannels)
router.get("/:channelid",toogleSubscription)
router.get("/oursubscriber/:channelid",getUserChannelSubscribers)

// router.get("/subscribedchannel/",getSubscribedChannels)




export default router;