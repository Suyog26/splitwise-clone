const express=require("express")
const router =express.Router()
const UserController=require("../controllers/usercontroller.js")
const checkUserauth = require("../middleware/authmiddleware.js")

// middleware running on routes
router.use("/changepassword",checkUserauth)
router.use("/loggeduser",checkUserauth)
router.use("/getuserdata",checkUserauth)


// public route 
router.post("/register",UserController.userRegister)
router.post("/login",UserController.userLogin)
router.post("/send-Reset-password-email",UserController.sendUserpasswordResetEmail)
router.post("/Reset-password",UserController.userpasswordreset)

router.post("/addfriend",UserController.AddFriend)
router.post("/addExpenses",UserController.AddExp)
router.post("/settleExpenses",UserController.settle)
router.post("/getuserData",UserController.getUserData)
router.post("/invite",UserController.invite)

// protected route
router.post("/changepassword",UserController.changeUserpassword)
router.get("/loggeduser",UserController.loggedUser)



module.exports=router