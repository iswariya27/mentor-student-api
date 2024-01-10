const express = require("express")
const cors = require("cors")

const app = express()
app.use(
    cors({
      origin: "*",
    })
  );
app.use(express.json())

const port = process.env.PORT || 4000

// const creatementorsRouter = require("./routes/create-mentor")
// const createstudentsRouter = require("./routes/create-student")
const studentsRouter = require("./routes/students")
const mentorsRouter = require("./routes/mentors")

app.use("/",express.static("public"))
app.use("/api",studentsRouter)
app.use("/api",mentorsRouter)
// app.use("/api",creatementorsRouter)
// app.use("/api",createstudentsRouter)

app.listen(port,()=>{
    console.log("Server running on: http://localhost:"+port)
});
