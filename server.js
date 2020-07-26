let express = require('express')
let mongodb = require('mongodb')
let sanitizeHTML = require('sanitize-html')


const { urlencoded } = require('body-parser')


let app = express()

app.use(express.static('public'))// acess to newely created folder

let db
//for connecting to heroku
let port = process.env.PORT
if(port == null || port == ""){
  port=3000
}
//db connection
let connectionString ="mongodb+srv://todoapp:HO5bTmf9SjxA8Swz@cluster0.mwcnn.mongodb.net/TodoApp?retryWrites=true&w=majority"
mongodb.connect(connectionString, {useNewUrlParser:true, useUnifiedTopology: true}, function(err,client){
db = client.db()
app.listen(port)
})

app.use(express.json())//for asynchronous requests
app.use(express.urlencoded({extended:false}))// it makes acess to form data

//security and password protection
function passwordProtected(req,res,next){
  console.log('custom functuon')
 res.set('WWW-Authenticate','Basic realm="simple To Do APP"')
 console.log(req.headers.authorization)
 if(req.headers.authorization == "Basic aC5rOmdlZm9yY2U=" ){
   next()
 }else{
res.status(401).send('Authentication Required')
 }
}
app.use(passwordProtected)// every function use this as a parameter
app.get("/",function(req,res){
db.collection('items').find().toArray(function(err,items){// read operation
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body style="background: linear-gradient(153deg, rgba(2,0,36,1) 0%, rgba(121,9,70,1) 39%, rgba(0,212,255,1) 100%);background-repeat:no-repeat;height:100vh;">
  <div class="container"> 
    <h1 class="display-4 text-center py-1 text-light">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id= "create-form"action="/create" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field"  name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list"class="list-group pb-5">
    
    </ul>
    
  </div>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script> let items = ${JSON.stringify(items)}</script>
  <script src="/browser.js"></script>
<div class="container">
  <h1 style="text-align:center; text-transform:uppercase; font-size:19px;">created BY HINAN KHAN</h1>
  </div>
  </body>
</html>`)
})

})
// insert data or create
app.post("/create-item",function(req,res){
  let safeText = sanitizeHTML(req.body.text,{allowedTags: [], allowedAttributes: {}}) 
  db.collection('items').insertOne({text:safeText},function(err,info){
    res.json(info.ops[0])
   })
    
})
//update data
app.post('/update-item',function(req,res){
  let safeText = sanitizeHTML(req.body.text,{allowedTags: [], allowedAttributes: {}}) 
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {$set:{text:safeText}} ,function(){
res.send('sucess')
})
})
//delete Item
app.post("/delete-item",function(req,res){
  db.collection('items').deleteOne({_id: new mongodb.ObjectID(req.body.id)},function(){
    res.send('sucess')
  })
})