const express=require("express")
const cors=require("cors")
const app=express()
const sequelize=require("./connection/dbconnection")
const sigincontroller=require("./controllers/sigincontroller")
const logincontroller=require("./controllers/logincontroller")
const messagecontroller = require("./controllers/messagecontroller")


app.use(cors())
app.use(express.json())
app.post("/signup",sigincontroller.signup)
app.post("/login",logincontroller.login)
app.post("/checkuser",logincontroller.checkuser)
app.post("/sendMessage", messagecontroller.sendmessage);
app.get("/getMessages", messagecontroller.getmessage);
app.get("/getChatUsers", messagecontroller.getchatusers);

sequelize.sync()
.then(()=>
{
    app.listen(5000,()=>
    {
        console.log("running on server 5000")
    })
})
