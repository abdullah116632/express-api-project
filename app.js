const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./router/movieRouter");
const CustomError = require("./Utils/CustomError")
const globalErrorHandler = require("./controller/errorController")

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/movies", moviesRouter);
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
