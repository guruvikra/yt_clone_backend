import { Router } from "express";
import {
    addPlaylist,
    addVideoToPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    removeVideoFromPlaylist
} from "../controllers/playlist.controller.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router=Router();
router.use(jwtVerify)

router.route("/").get(addPlaylist)
router.route("/allplaylist").get(getAllPlaylists)
router.route("/playlist/:playlistId").
get(getPlaylistById).
patch(updatePlaylist).
delete(deletePlaylist)


router.route("add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)






export default router;