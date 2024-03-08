const dotenv = require("dotenv");
const mongoose = require("mongoose")
dotenv.config({path: "./config.env"});


process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncougnt exception occured! Sutting down....")
    process.exit(1)
})

const app = require("./app");

mongoose.connect(process.env.CONN_STR, {
  useNewUrlParser: true
}).then((connObj) => {
  console.log("DB connection is successfull");
}).catch((err) => {
  console.log("Some error have occured to connect DB")
})

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`server have started at port ${3000}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandalded rejection occured! Sutting down....")

  server.close(() => {
    process.exit(1)
  })
})
