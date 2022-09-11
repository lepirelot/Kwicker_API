require("dotenv").config();
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieSession = require("cookie-session");

var userRouter = require('./routes/user');
var followRouter = require('./routes/follow');
var postRouter = require("./routes/post");
var likeRouter = require("./routes/like");
var messageRouter = require("./routes/message");
var imageRouter = require("./routes/image");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1h;
app.use(
  cookieSession({
    name: "user",
    keys: ["689HiHoveryDi79*"],
    cookie: {
      httpOnly: true,
      expires: expiryDate,
    },
  })
);

app.use('/users', userRouter);
app.use('/follows', followRouter);
app.use("/posts", postRouter);
app.use("/likes", likeRouter);
app.use("/messages", messageRouter);
app.use("/images", imageRouter);

module.exports = app;
