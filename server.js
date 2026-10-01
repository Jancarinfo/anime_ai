const express=require('express');
const multer=require('multer');
const app=express();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024}});
app.use(express.static('public'));

app.post('/api/transform',upload.single('image'),async(req,res)=>{
  if(!req.file)return res.status(400).json({error:'اختر صورة أولاً'});
  const key=process.env.POLLINATIONS_API_KEY;
  if(!key)return res.status(500).json({error:'مفتاح خدمة الصور غير مضبوط.'});
  try{
    const form=new FormData();
    form.append('model','google/gemini-2.5-flash-image');
    form.append('prompt','Transform this exact photo into a polished high-quality 2D anime illustration. Preserve the same person, identity, facial features, pose, clothing, composition and background. Natural skin tones, detailed hair, clean expressive anime linework, soft cinematic cel shading. Do not add text, objects, extra people, nudity or sexual content.');
    form.append('image',new Blob([req.file.buffer],{type:req.file.mimetype||'image/jpeg'}),req.file.originalname||'photo.jpg');
    form.append('response_format','url');
    const r=await fetch('https://gen.pollinations.ai/v1/images/edits',{
      method:'POST',
      headers:{Authorization:`Bearer ${key}`},
      body:form
    });
    const raw=await r.text();
    let data; try{data=JSON.parse(raw)}catch{data=null}
    if(!r.ok){
      console.error('Pollinations error',r.status,raw.slice(0,500));
      return res.status(r.status).json({error:data?.error?.message||data?.error||'تعذر تحويل الصورة حالياً.'});
    }
    const imageUrl=data?.data?.[0]?.url;
    const b64=data?.data?.[0]?.b64_json;
    if(imageUrl)return res.json({imageUrl});
    if(b64)return res.json({imageData:`data:image/png;base64,${b64}`});
    return res.status(502).json({error:'لم تصل صورة من خدمة التحويل.'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'تعذر الاتصال بخدمة التحويل.'});
  }
});
app.get('/health',(req,res)=>res.json({ok:true}));
app.listen(process.env.PORT||3000,()=>console.log('Anime AI running'));