const { model } = require("mongoose");
const TaskModel = require("../model/TaskModel");

const TaskCreate = async function (req, res) {
    try {
        let requestbody = req.body
        let { Title, Description, Completed } = requestbody

        if (!requestbody) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
        }
        if (!Title) {
            return res.status(400).send({ status: false, message: 'Title is require' })
        }
        let TaskSaved = await TaskModel.create(requestbody);
        res.status(200).send({ status: true, message: "Task create successfully", data: TaskSaved })
    }
    catch (error) {
        console.log(error)
    }
}
const CheckTask = async function (req, res) {
    try {
        let CheckInfo = await TaskModel.find();
        res.send(CheckInfo)
    } catch (error) {
        console.log(error)
    }
}
const CheckTaskById = async function (req, res) {
    try {
        let taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).send({ message: "Task id is not present" })
        }
        let task = await TaskModel.findOne({ _id: taskId })
        if (task == null) return res.status(404).send({ status: false, message: `No task Found with This (${taskId}) TaskId !!` })

        let CheckData = await TaskModel.find({ _id: taskId })
        return res.status(200).send({ status: true, message: "task List with Id", data: CheckData })

    } catch (error) {
        console.log(error)
    }
}
const updateTask = async function (req, res) {
    try {
        let taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).send({ message: "Task id is not present" })
        }
        let task = await TaskModel.findOne({ _id: taskId })
        if (task == null) return res.status(404).send({ status: false, message: `No task Found with This (${taskId}) TaskId !!` })

        let requestBody = req.body
        let { Title, Description, Completed } = requestBody

        if (!requestBody) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
        }
        let unique = await TaskModel.updateOne({ _id: taskId }, { $set: { Title: requestBody.Title, Description: requestBody.Description, Completed: requestBody.Completed, } });
        return res.status(200).send({ status: true, message: "message  Modify and update" });
    } catch (error) {
        console.log(error)
    }
}

const deleteTask = async function (req, res) {
    try {
        let taskId = req.params.taskId
        if (!taskId) {
            return res.status(400).send({ message: "please enter the taskId !!" })
        }
        const deletedTaskResult = await TaskModel.deleteOne({ _id: taskId });
        if (!deletedTaskResult) {
            return res.status(401).json({ error: "Task cannot be deleted" });
        }
        return res.status(200).json({ message: "Task Deleted Successfully" });
    } catch (error) {
        console.log(error)
    }
}
module.exports = { TaskCreate, CheckTask, CheckTaskById, updateTask, deleteTask }