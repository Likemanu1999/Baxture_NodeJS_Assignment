const express = require('express');
const router = express.Router()
const TaskController = require("../Controllers/TaskController")

router.post("/create",TaskController.TaskCreate);
router.get("/getTask",TaskController.CheckTask);
router.get("/getTask/:taskId",TaskController.CheckTaskById);
router.patch("/updateTask/:taskId",TaskController.updateTask);
router.delete("/deleteTask/:taskId", TaskController.deleteTask);

module.exports = router