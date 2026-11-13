import {Router} from 'express';
const router: Router = Router()


router.get("/api/users",(req, res) =>{
    res.send("Hello this is express router!")
})
export default router;