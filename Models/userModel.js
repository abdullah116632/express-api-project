const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(val){
                return val == this.password
            },
            message: "Password & Confirm password does not same"
        }
    },
    passwordChangedAt: Date
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;

    next()
})

userSchema.methods.comparePasswordInDb = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB)
}

userSchema.methods.isPasswordChanged = async function(JWTtimestamp){
    if(this.passwordChangedAt){
        const paswdChangedtimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTtimestamp < paswdChangedtimestamp
    }

    return false;
}

const User = mongoose.model("User", userSchema);

module.exports = User;