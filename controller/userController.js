const CustomError = require("../Utils/CustomError");
const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler")
const jwt = require("jsonwebtoken");
const sendEmail = require("./../Utils/email")
const crypto = require("crypto");
const authController = require("./authController");


const signToken = (id) => {
    const token = jwt.sign({id}, process.env.SECRET_STR, {
       expiresIn: process.env.LOGIN_EXPIRES
   })

   return token;
}

const createSendResponse = (user, statusCode, res) => {
   const token = signToken(user._id)

   // const options = {
   //     maxAge: process.env.LOGIN_EXPIRES,
   //     httpOnly: true
   // }

   // if(process.env.NODE_ENV === "production"){
   //     options.secure = true;
   // }

   // res.cookie("jwt", token, options)

   user.password = undefined;

   res.status(statusCode).json({
       status: "success",
       token,
       data: {
           user
       }
   })
}

const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];
        }
    })

    return newObj;
}


module.exports.getAllUsers = asyncErrorHandler( async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        result: users.length,
        data: {
            users
        }
    })
})

module.exports.updatePassword = asyncErrorHandler( async (req, res, next) => {
    //get current user data from database
    const user = await User.findById(req.user._id).select("+password");

    //check if the supplied current password is correct
    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError("The current password you provided is wrong", 401));
    }

    // If supplied password is correct, update user password with new value
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save()

    // login user & send JWT
    createSendResponse(user, 200, res)
})

module.exports.updateMe = asyncErrorHandler( async (req, res, next) => {
    // user should not update password using this route
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError("You cannot update your password using this endPoint", 400))
    }

    const filterObj = filterReqObj(req.body, "name", "email")
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators: true, new: true});

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

module.exports.deleteMe = asyncErrorHandler( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: "success",
        data: null
    })
})