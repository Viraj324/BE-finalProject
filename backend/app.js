const express = require("express");
const app = express();
const cors = require("cors");

const errorMiddleware = require("./middlewares/error");

const test = require("./routes/test");
const teacherRouter = require("./routes/teacher");
const studentRouter = require("./routes/student");
const roomRouter = require("./routes/room");
const quizRouter = require("./routes/quiz");
const personalizationRouter = require("./routes/personalization");
const commonRouter = require("./routes/common");

const connectToDB = require("./db/connect");
const storage = require("node-persist");
require("dotenv").config();

storage.init({
  stringify: JSON.stringify,

  parse: JSON.parse,
  ttl: 10 * 60 * 1000,
  dir: "node-storage",
});

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/test", test);

// teacher router
app.use("/api/v1/teacher", teacherRouter);

// room router
app.use("/api/v1/student", studentRouter);

// student router
app.use("/api/v1/room", roomRouter);

// quiz router
app.use("/api/v1/quiz", quizRouter);

// personalizationRouter
app.use("/api/v1/personalization", personalizationRouter);

// common router files
app.use("/api/v1/common", commonRouter);

const port_no = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectToDB(process.env.MONGO_URI);
    const server = app.listen(port_no, () => {
      console.log(`listening on port ${port_no}`);
    });

    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log(`⚡: ${socket.id} user just connected!`);
      socket.on("setup", (userData) => {
        // console.log("connection created " + JSON.stringify(userData));
      });

      socket.on("create_room", (roomID) => {
        socket.join(roomID);
        console.log("room created " + roomID);
      });

      socket.on("join_room", (data) => {
        socket.join(data._id);

        console.log(
          "user joined to chat room " +
            data._id +
            " user id " +
            data.student._id
        );
        data.student.joinedTime = new Date().toLocaleTimeString();
        data.student.attention = 100;
        socket.in(data._id).emit("new_joinee", data.student);
      });

      socket.on("update_attention", (data) => {
        console.log("update ");
        socket.in(data._id).emit("joinee_attention", {
          student: data.student,
          attention: data.attention,
        });
      });

      socket.on("leave_room", (data) => {
        socket.leave(data._id);
        socket.in(data._id).emit("joinee_left", data.student);
      });

      socket.on("close_room", (data) => {
        io.in(data._id).socketsLeave(data._id);
        console.log("all students left the session");
      });

      socket.on("share_quiz", (payload) => {
        socket.in(payload._id).emit("quiz_created", {
          link: payload.quiz_link,
        });
      });

      socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

start();
app.use(errorMiddleware);
