const express = require("express");
const router = express.Router();
const UserController = require("../Controller/UserController");

router.post("/api/create", UserController.createUser);
router.get("/api/users", UserController.getAllUser);
router.get("/api/users/:userId", UserController.getUserById);
router.put("/api/users/:userId", UserController.UpdateUser);
router.delete("/api/users/:userId", UserController.DeleteUser)


module.exports = router