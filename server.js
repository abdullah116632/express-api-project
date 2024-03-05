const dotenv = require("dotenv");
const mongoose = require("mongoose")
dotenv.config({path: "./config.env"});

const app = require("./app");

mongoose.connect(process.env.CONN_STR, {
  useNewUrlParser: true
}).then((connObj) => {
  console.log("DB connection is successfull");
}).catch(err => {
  console.log(err);
})

const a = process.env.PORT;

app.listen(a, () => {
  console.log(`server have started at port ${3000}`);
});
