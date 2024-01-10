const express = require("express")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://localhost:27017`

const router = express.Router()


router.post("/create-mentor", async (req, res) => {
    try {
      let {mentorName,mentorMail} = req.body
      let client = await mongoClient.connect(dbURL)
      let db = client.db("students-mentors-db")
      let result = await db.collection("mentors").insertOne({
        mentorName: mentorName,
        mentorMail: mentorMail,
        students: []
      })
      res.status(200).json({
        message: 'Mentor Created Successfully',
        result : result,  
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message : 'Something went wrong please try again later'
      })
    }
  })

router.get("/mentors",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let mentorsData = await db.collection("mentors").find().toArray()
        client.close()
        res.status(200).json(mentorsData)
    }
    catch(err){
        res.status(400).json({ 
            error: "Internal Server Error" 
        })
    }
})

router.get("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let mentorData = await db.collection("mentors").findOne({id:`ment-${req.params.id}`})
        client.close()
        res.status(200).json(mentorData)
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error" 
        })
    }
})

router.post("/mentor", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        let dbData = await db.collection("mentors").find().toArray()
        let mentorData = {...req.body,...{id:`ment-${dbData.length+1}`}}
        await db.collection("mentors").insertOne(mentorData)
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

router.patch("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        req.body.studsId.forEach( async (studId,idx)=>{
            let student = await db.collection("studentsCol").findOne({id:studId})
            let mentor = await db.collection("mentors").findOne({id:`ment-${req.params.id}`})
            if(student){
                if(!mentor.studsId){
                    await db.collection("mentors").updateOne({id:`ment-${req.params.id}`},{$set: {"studsId":[]}})
                }
                else if(mentor.studsId.indexOf(studId)===-1){
                    await db.collection("mentors").updateOne({id:`ment-${req.params.id}`},{$push: {"studsId":studId}})
                    await db.collection("studentsCol").updateOne({id:studId},{$set: {"mentorId":`ment-${req.params.id}`}})
                } 
            }
        })
        res.status(200).json({
            message : "Patch Success"
        })
    }
    catch(err){
        res.status(400).json({
             error: "Internal Server Error" 
        })
    }
})

router.delete("/mentor/:id", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("students-mentors-db")
        await db.collection("mentors").deleteOne({id:`ment-${req.params.id}`})
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