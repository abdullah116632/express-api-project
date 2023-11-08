const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const a = process.env.PORT;

app.listen(a, () => {
  console.log(`server have started at port ${3000}`);
});
