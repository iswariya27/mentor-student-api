const express = require("express")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://localhost:27017`
const router = express.Router()


router.post("/create-student", async (req, res) => {
    const {studentName,studentMail} = req.body;
    try {
      let newStudent = {
        studentName: studentName,
        studentMail: studentMail,
        oldMentor: null,
        currentMentor: null
      };
      let client = await mongoClient.connect(dbURL);
      let db = client.db("students-mentors-db");
      let result = await db.collection('students').insertOne(newStudent);
      client.close();
      res.send({
        message: 'Student created successfully',
        result : result
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

router.get("/students",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let studentsData = await db.collection("students").find().toArray()
        client.close()
        res.status(200).json(studentsData)
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error"  
        })
    }
})

router.get("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let studentData = await db.collection("students").findOne({id:`stud-${req.params.id}`})
        client.close()
        res.status(200).json(studentData)
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error" 
        })
    }
})

router.post("/student", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let dbData = await db.collection("students").find().toArray()
        let studentData = {...req.body,...{id:`stud-${dbData.length+1}`}}
        await db.collection("students").insertOne(studentData)
        client.close()
        res.status(200).json({
            message: "Added 1 entry"
        })
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error" 
        })
    }
})

router.patch("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology: true})
        let db = client.db("students-mentors-db")
        let mentor = await db.collection("mentorsCol").findOne({id:req.body.mentorId})
        let student = await db.collection("students").findOne({id:`stud-${req.params.id}`})
        if(mentor){
            if(student.mentorId && student.mentorId!=req.body.mentorId){
                let prevMentor = student.mentorId
                await db.collection("mentorsCol").updateOne({id:prevMentor},{$pull: {"studsId": `stud-${req.params.id}`}})
            }
            await db.collection("students").updateOne({id:`stud-${req.params.id}`},{$set: {"mentorId": req.body.mentorId}})
            if(!mentor.studsId){ 
                await db.collection("mentorsCol").updateOne({id:req.body.mentorId},{$set: {"studsId": []}})
                mentor = await db.collection("mentorsCol").findOne({id:req.body.mentorId})
            }
            if(mentor.studsId.indexOf(`stud-${req.params.id}`)===-1){
                await db.collection("mentorsCol").updateOne({id:req.body.mentorId},{$push: {"studsId": `stud-${req.params.id}`}})
            }
            
            res.status(200).json({
                message : "Mentor assigned to Student and Student added to mentor"
            })
        }
        else{
            throw new Error("Mentor Id not found")
        } 
    }
    catch(err){
        res.status(400).send({
             error: "Internal Server Error" 
        })
    }
})

router.delete("/student/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        await db.collection("students").deleteOne({id:`stud-${req.params.id}`})
        await db.collection("mentorsCol").updateMany({"studsId":`stud-${req.params.id}`},{$pull:{"studsId":`stud-${req.params.id}`}})
        client.close()
        res.status(200).json({
            message: "Delete Success"
        })
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error" 
        })
    }
})

module.exports = router