import dotenv from "dotenv"
import connectToDb  from './db/db.js'
import { app } from "./app.js"


dotenv.config({
    path:'./.env'
})


connectToDb()
.then(() => {
    app.listen(process.env.PORT || 8000 ,() => {
        console.log("app is listening on port " + process.env.PORT);
    })
})
.catch( (err) => {
    console.log("error : ",err);
})