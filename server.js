var express = require("express");
//Support json post
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;

var dbUrl =
  "mongodb+srv://user:user1234@cluster0.uzgyz.mongodb.net/learningnode?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
  name: String,
  message: String,
});

//#region Endpoints

// Get
app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

// Post
app.post("/messages", async (req, res) => {
  try {
    var message = new Message(req.body);

    var savedMessage = await message.save();

    console.log("saved");

    var censored = await Message.findOne({ message: "badword" });

    if (censored) await Message.remove({ _id: censored.id });
    else io.emit("message", req.body);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.error(err);
  } finally {
  }
});

//#endregion

// User connected
io.on("connection", (socket) => {
  console.log("an user connected");
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("mongo db connection", err);
  }
);

var server = http.listen(3000, () => {
  console.log("Server is listening on port", server.address().port);
});
