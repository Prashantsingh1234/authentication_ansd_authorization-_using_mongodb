const express = require("express");
const path = require("path");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/create", async (req, res) => {
  let { username, email, password, age } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      // Store hash in your password DB.
      let newUser = await userModel.create({
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email }, "shhhhhhhhh");
      res.cookie("token", token);
      res.render("dashboard", { newUser: newUser });
    });
  });
});

app.post("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.send("something is wrong");

  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: user.email }, "shhhhhhhhhhh");
      res.cookie("token", token);
      res.render("dashboard", { newUser: user }); // Corrected here
    } else res.send("something is wrong");
  });
});

app.listen(3000);
