const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit")
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const moviesRouter = require("./router/movieRouter");
const CustomError = require("./Utils/CustomError")
const globalErrorHandler = require("./controller/errorController");
const authRouter = require("./router/authRouter")
const userRouter = require("./router/userRoute");


const app = express();

app.use(helmet())

let limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "We have receive too many request from this IP . Please try after one hour"
});

app.use("/api", limiter)

app.use(express.json());
app.use(sanitize());
app.use(xss());
app.use(hpp({whitelist: ["duration", "ratings", "releaseYear", "releaseDate", "genres", "directors", "actors", "price"]}))

app.use(morgan("dev"));

app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `Cant find ${req.originalUrl} on the server`
    // })

    // const err = new Error(`Cant find ${req.originalUrl} on the server`)
    // err.status = "fail"
    // err.statusCode = 404;

    const err = new CustomError(`Cant find ${req.originalUrl} on the server`, 404)

    next(err)
})

app.use(globalErrorHandler)

module.exports = app;
