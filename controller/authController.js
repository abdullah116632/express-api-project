const CustomError = require("../Utils/CustomError");
const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler")
const jwt = require("jsonwebtoken");
const sendEmail = require("./../Utils/email")
const crypto = require("crypto");
// const util = require("util")


const signToken = (id) => {
     const token = jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })

    return token;
}

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id)

    const options = {
        expiresIn: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }

    if(process.env.NODE_ENV === "production"){
        options.secure = true;
    }

    res.cookie("jwt", token, options)

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

module.exports.signup = asyncErrorHandler( async (req, res, next) => {
    const newUser = await User.create(req.body)

    createSendResponse(newUser, 201, res);
})

module.exports.login = asyncErrorHandler( async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password){
        const error = new CustomError("Please provide email id and password for login", 400);
        return next(error)
    }

    const user = await User.findOne({email}).select("+password")

    // const isMatch = await user.comparePasswordInDb(password, user.password)

    if(!user || !(await user.comparePasswordInDb(password, user.password)) ){
        const error = new CustomError("Incorrect email or password", 400);
        return next(error)
    }

    createSendResponse(user, 200, res);
})

module.exports.protect = asyncErrorHandler( async (req, res, next) => {
    //1 read the token and check if it exist
    const testToken = req.headers.authorization;

    let token;
    if(testToken && testToken.startsWith("Bearer")){
        token = testToken.split(" ")[1];
    }

    if(!token){
        next(new CustomError("You are not logged in", 401))
    }

    // 2 verify the token
    const decodedToken = jwt.verify(token, process.env.SECRET_STR)

    // 3 If the user does not exists now
    const user = await User.findById(decodedToken.id)

    
    if(!user){
        const error = new CustomError("The user with given token does not exist", 401);
        next(error)
    }

    // 4 if the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    
    if(isPasswordChanged){
        const err = new CustomError("The password has been changed recently, please log in again", 401);
        return next(err)
    }

    // 5 allow the user to access route
    req.user = user;
    next()
})

module.exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new CustomError("You do not have permission to perform this action", 403)
            next(error)
        }

        next()
    }
}

module.exports.forgotPassword = asyncErrorHandler( async (req, res, next) => {
    // 1 get the user based on posted email
    const user = await User.findOne({email: req.body.email})

    if(!user){
        const err = new CustomError("We could not find the user with given email", 404)
        next(err);
    }

    // create a random reset token
    const resetToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave: false})

    // send the token back to the user email
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`
    const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes.`;
    try{
        
        await sendEmail({
            email: user.email,
            subject: "Password change request received",
            message: message
        })

        res.status(200).json({
            status: "success",
            message: "password reset link send to the user email"
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;

        await user.save({validateBeforeSave: false});

        return next(new CustomError(err.message, 500))
    }
})

module.exports.resetPassword = asyncErrorHandler( async (req, res, next) => {

    const randomToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({passwordResetToken: randomToken, passwordResetTokenExpires: {$gt: Date.now()}});


    if(!user){
        const error = new CustomError("Token is invalid or has expired!", 400);
        next(error);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    createSendResponse(user, 200, res);
})