import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import jwttkon from "jsonwebtoken"
let slug;
mongoose.connect("mongodb+srv://mjjorden:GGs2nW3Y8Ru2FYFk@cluster0.hcztkhk.mongodb.net/").then(()=>{
    console.log("connected to database")
}).catch(()=>{
    console.log("not connected to database");
})

const orderschema=new mongoose.Schema({
    product:{type:String,required:true},
    qty:{type:Number,required:true},
    price:{type:Number,required:true},
    token:{type:String}
},{timestamps:true});
const productschema=new mongoose.Schema({
    title:{type:String,required:true},
    slug:{type:String,required:true,unique:true},
    desc:{type:String,required:true},
    img:{type:String,require:true},
    catogory:{type:String,required:true},
    size:{type:String},
    color:{type:String},
    price:{type:String,required:true},
    avaiableqty:{type:String,require:true},
    

},{timestamps:true});
const userschema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    
    

},{timestamps:true});


const ordermodel=mongoose.model("orders",orderschema);
const productmodel=mongoose.model("products",productschema);
const usermodel=mongoose.model("users",userschema);


const app=express();
app.use(bodyParser.json({extended:true}));
app.use(cors());


app.get("/api/servicecode",(req,res)=>{
    res.json([411048,111111,222222]);
    console.log("fetched")
})
app.get("/api/getproduct",async(req,res)=>{
    let product=await productmodel.find({});
    let shoes={};
    for(let item of product){
        if(item.title in shoes){
           if(!shoes[item.title].color.includes(item.color)&&item.avaiableqty>0){
            shoes[item.title].color.push(item.color);
            shoes[item.title].size.push(item.size);
           }

        }else{
            shoes[item.title]=JSON.parse(JSON.stringify(item))
            if(item.avaiableqty > 0){
                shoes[item.title].color=[item.color];
                shoes[item.title].size=[item.size]
            }
        }
    }
    res.json({shoes});
    console.log("get product")
})

app.post("/api/getproductslug",async(req,res)=>{
   slug=req.body.head
   
    // let product=await productmodel.findOne()
    let product=productmodel.findOne({slug:slug}).then(a=>{
        
        res.json(a)
    })
    
})

app.get("/api/getproductslug",(req,res)=>{
    
})


app.post("/api/addproduct",async(req,res)=>{
    
    
for(let i=0;i<req.body.length;i++){
    const p=new productmodel({
        title:req.body[i].title,
        slug:req.body[i].slug,
        desc:req.body[i].desc,
        img:req.body[i].img,
        catogory:req.body[i].catogory,
        size:req.body[i].size,
        color:req.body[i].color,
        price:req.body[i].price,
        avaiableqty:req.body[i].avaiableqty,

    })
    await p.save();
    
}
    
    res.send("product saved successfully");
   
})

app.put("/api/updateproduct",async(req,res)=>{
    
    
for(let i=0;i<req.body.length;i++){
    await productmodel.findByIdAndUpdate(req.body[i]._id,req.body[i])
    
       
}
    
    res.send("product saved successfully update");
   
})

app.post("/api/signup",async(req,res)=>{
    const salt=await bcrypt.genSalt(10)
    let success=false
    if(await usermodel.findOne({email:req.body.email})){
        
        res.json(success)
    }else{
        
        
            
            const user=new usermodel({
            name:req.body.name,
            email:req.body.email,
            password: await bcrypt.hash(req.body.password,salt)
                })
            user.save().then(found=>{
                success=true
                res.json(success);
                console.log("logged")
            }).catch(error=>{
                res.json(success)
                console.log("not logged");
            })
                 
        
        
      
    
        
     
    }
    
    
})
app.post("/api/orderplaced",async(req,res)=>{
    
    const datas=req.body
    
    if(req.body){
        Object.keys(datas.cart).map(ele=>{
            const order=new ordermodel({
                product:datas.cart[ele].name,
                qty:datas.cart[ele].qty,
                price:datas.cart[ele].price,
                token:datas.id   
            })
            order.save();
        })
        
    }
    let a=datas.id
    await ordermodel.find({token:a}).then(found=>{console.log("matched id",res.json(found))}).catch(err=>{console.log("not matched id")})
    
    
    

})

app.post("/api/login",async (req,res)=>{
    let success=false
    const{email,password}=req.body;
    usermodel.findOne({email:email}).then(async found=>{
        if(!found){
            res.json(success);
            console.log("not found");
        }else{
            if(await bcrypt.compare(password,found.password)){
                success=true;
                let secret="kyaboltepublic"
                let data={
                    user:found._id
                }
                const jwtdata=jwttkon.sign(data,secret,{expiresIn:"2d"});
                res.json({success,jwtdata,data});
                console.log("password match")
            }else{
                console.log("password not match");
                res.json(success);
            }
        }
    })
    // let id=await usermodel.find({email:email});
    // res.json(id[0]._id);
    
})



app.listen(5000,()=>{
    console.log("listening at localhost:5000");
})




