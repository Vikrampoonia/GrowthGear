import express from 'express'
import cors from 'cors'
import {queryController,queryBreakDownController,queryFeasibilityController} from "./controllers/controller.js"
import {authenticate} from './middlewares/auth.js'

const app=express()
app.use(express.json())
app.use(cors())

//features to implement
//Convert simple natural language queries to pseudo-SQL
//Generate mock response for different query types
//Include basic error handling
//Implement lightweight authentication

app.get("/", async (req, res) => {
    res.json({
      message: "Use /query, /explain, /validate endpoints to see result"
    });
  });

//only get nlp query
app.get("/query",authenticate, queryController);

//Returns simulated query breakdown
app.get("/explain",authenticate, queryBreakDownController);

//Checks query feasibility
app.get("/validate",authenticate,queryFeasibilityController);

const PORT=4000; 
app.listen(PORT,()=>{
    console.log(`server running on http://localhost:${PORT}`)
})


