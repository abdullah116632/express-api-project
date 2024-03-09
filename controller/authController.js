const { error } = require("console");
const CustomError = require("../Utils/CustomError");
const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler")
const jwt = require("jsonwebtoken");
// const util = require("util")


const signToken = (id) => {
     const token = jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })

    return token;
}

module.exports.signup = asyncErrorHandler( async (req, res, next) => {
    const newUser = await User.create(req.body)

    const token = signToken(newUser._id)

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    })
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

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
    })
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





