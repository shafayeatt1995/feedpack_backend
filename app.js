require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const port = parseInt(process.env.PORT || "8000", 10);
require("./config/mongo");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60,
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use("/webhooks", require("./routes/webhooks"));
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});
app.use("/", require("./routes"));

app.listen(port, "0.0.0.0", () => {
  console.log(`> Server listening at http://localhost:${port}`);
});
