import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();
app.use(cors()); app.use(express.json());
const port = process.env.PORT || 4000;

const CampaignSchema = new mongoose.Schema({
  title:String, description:String, target:Number, collected:{type:Number,default:0},
  charityWallet:String, status:{type:String,default:"Active"},
  milestones:[{title:String, amount:Number, status:{type:String,default:"Pending"}, evidenceRef:String}]
},{timestamps:true});
const Campaign = mongoose.model("Campaign", CampaignSchema);

const memoryCampaigns = [
 {id:"demo-1",title:"Education Support Campaign",description:"Provide educational supplies to students.",target:100000,collected:0,status:"Active",charityWallet:"Demo charity wallet",milestones:[{title:"Procurement",amount:30000,status:"Pending"},{title:"Distribution",amount:40000,status:"Pending"},{title:"Completion",amount:30000,status:"Pending"}]},
 {id:"demo-2",title:"Community Food Relief",description:"Support food distribution for families in need.",target:75000,collected:0,status:"Active",charityWallet:"Demo charity wallet",milestones:[{title:"Procurement",amount:25000,status:"Pending"},{title:"Distribution",amount:50000,status:"Pending"}]}
];
let dbReady=false;
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/charity", {serverSelectionTimeoutMS:1500}).then(()=>{dbReady=true;console.log("MongoDB connected")}).catch(()=>console.log("MongoDB unavailable; using demo memory data"));

app.get("/api/health", (req,res)=>res.json({ok:true, database:dbReady?"mongodb":"memory"}));
app.get("/api/campaigns", async (req,res)=>{
  if(dbReady) return res.json(await Campaign.find().sort({createdAt:-1}));
  res.json(memoryCampaigns);
});
app.post("/api/campaigns", async (req,res)=>{
  const {title,description,target,charityWallet,milestones=[]}=req.body;
  if(!title || !target) return res.status(400).json({error:"title and target are required"});
  if(dbReady) return res.status(201).json(await Campaign.create({title,description,target,charityWallet,milestones}));
  const item={id:`demo-${Date.now()}`,title,description,target:Number(target),collected:0,status:"Active",charityWallet,milestones}; memoryCampaigns.unshift(item); res.status(201).json(item);
});
app.post("/api/alerts/analyze", async (req,res)=>{
  try {
    const response=await fetch(`${process.env.AI_URL||"http://127.0.0.1:5000"}/analyze`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(req.body)});
    res.status(response.status).json(await response.json());
  } catch { res.status(503).json({error:"AI service unavailable"}); }
});
app.post("/api/evidence", (req,res)=>{
  const {campaignId,milestoneId,evidenceRef}=req.body;
  if(!campaignId || milestoneId===undefined || !evidenceRef) return res.status(400).json({error:"campaignId, milestoneId and evidenceRef required"});
  res.json({ok:true,campaignId,milestoneId,evidenceRef,mode:"reference-only demo"});
});
app.listen(port,()=>console.log(`Backend running on http://localhost:${port}`));
