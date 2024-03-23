const UserModel = require("../Model/UserModel");

const createUser = async (req, res) => {
    try {
        let requestbody = req.body
        let { username, age, hobbies } = requestbody
        if (!requestbody) {
            return res.status(400).send({ status: false, message: "Invalid request, please provide User details" })
        }
        let saveUser = await UserModel.create(requestbody);
        res.status(200).send({ status: true, message: "User is create successfully", data: saveUser })

    }
    catch (error) {
        console.log(error)
    }
}

const getAllUser = async (req, res) => {
    try {
        let getInfo = await UserModel.find();
        res.send(getInfo)
    }
    catch (error) {
        console.log(error)
    }
}

const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please enter userId in params" })
        }
        let getInfo = await UserModel.findOne({ _id: userId });
        res.send(getInfo)
    }
    catch (error) {
        console.log(error)
    }
}

const UpdateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        let requestbody = req.body;
        let { username, age, hobbies } = requestbody
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please enter userId in params" })
        }
        let users = await UserModel.findOne({ _id: userId })
        if (!userId) return res.status(404).send({ status: false, message: "userId Not Found" })

        let updateData = await UserModel.updateOne({ _id: userId }, { $set: { username: requestbody.username, age: requestbody.age, hobbies: requestbody.hobbies } });
        return res.status(200).send({ status: true, message: "Success", data: updateData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const DeleteUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please enter userId in params" })
        }
        let Removeuser = await UserModel.findOneAndDelete({ _id: userId });
        return res.status(200).send({ status: true, message: "user delete Successfully" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createUser, getAllUser, getUserById, UpdateUser, DeleteUser } 