import express, { json } from "express";
import expressLayout from "express-ejs-layouts";
import {dirname} from "path";
import  {fileURLToPath}  from "url";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import {} from "dotenv/config";

const Schema = mongoose.Schema;

const blogData = new Schema({
    'title':{
        type:String,
        require:true
    },
    'blogPost':{
        type:String,
        required:true
    },
    'createdDay':{
        type:Date,
        default:Date.now
    },
    'updatedDay':{
        type:Date,
        default:Date.now
    }
})
const adminPassword = encodeURIComponent(process.env.password)
const username = process.env.user;
mongoose.connect(`mongodb+srv://${username}:${adminPassword}@cluster0.q66skeb.mongodb.net/?retryWrites=true&w=majority`).then((result)=>console.log("Connected")).catch((err)=>{
    console.log(err);
});

const conn = mongoose.model('blogpost',blogData);

const __dirname = dirname(fileURLToPath(import.meta.url)); 

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

await app.use(express.static("public"));

app.use(expressLayout);
app.set('layout','./layouts/main.ejs');
app.get('',(req,res)=>{
    try{
        conn.find({}).sort({_id:-1}).limit(5).then((data)=>{
            res.render('index.ejs',{record:data});
        });
        }catch(error){
            console.log(error)
        }
    }
)
app.get('/about',(req,res)=>{
    res.render('about.ejs');
})
app.get('/newpost',(req,res)=>{
    res.render('newpost.ejs');
})
app.post("/submit",async (req,res)=>{
    var postTitle = req.body.posttitle;
    var postContent=req.body.postdata;
    try{
        const pdata = new conn({
            'title':postTitle,
            'blogPost': postContent
        });
        await pdata.save().then((result)=>{
        })
        res.redirect("/vpost");
    }
    catch(error){
        console.log(error);
    }
});
app.get('/vpost',(req,res)=>{
    try{
        conn.find({}).sort({_id:-1}).limit(1).then((data)=>{
            data.forEach(element => {
                const new_id = element._id;
                res.redirect(`/vpost/${new_id}`)
            });
        });
    }
    catch(error){
        console.log(error);
    }
})
app.get('/vpost/:id',async(req,res)=>{
    try{
        let slug = req.params.id;
        await conn.findById(slug).then((bdata)=>{
            res.render('vpost.ejs',{record:bdata});
        });
    }
    catch(error){
        console.log(error.message);
    }
})
app.post('/search',async(req,res)=>{
    try{
            let search = req.body.searchTerm;
            let searchref = search.replace(/[^a-zA-Z0-9 ]/g, "")
            await conn.find({title:{$regex : new RegExp(searchref,'i')}}).then((data)=>{
                res.render('search.ejs',{record:data});
            });
        }catch(error){
            console.log(error)
        }
    }
)
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})