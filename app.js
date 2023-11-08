const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./router/movieRouter");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/movies", moviesRouter);

module.exports = app;
