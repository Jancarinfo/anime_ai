let file;
const preview=document.querySelector('#preview'),go=document.querySelector('#go'),status=document.querySelector('#status');
function choose(f){
  if(!f)return;
  file=f;
  const u=URL.createObjectURL(f);
  preview.innerHTML='<img alt="الصورة المختارة">';
  preview.querySelector('img').src=u;
  go.disabled=false;
  status.textContent='';
}
document.querySelector('#camera').onchange=e=>choose(e.target.files[0]);
document.querySelector('#gallery').onchange=e=>choose(e.target.files[0]);
go.onclick=async()=>{
  go.disabled=true;
  status.textContent='جاري التحويل إلى أنمي…';
  const fd=new FormData();fd.append('image',file);
  try{
    const r=await fetch('/api/transform',{method:'POST',body:fd});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error||'تعذر التحويل');
    const src=j.imageUrl||j.imageData;
    if(!src)throw new Error('لم تصل الصورة');
    preview.innerHTML='<img alt="الصورة بعد التحويل إلى أنمي">';
    preview.querySelector('img').src=src;
    status.textContent='تم التحويل ✓';
  }catch(e){
    status.textContent=e.message||'تعذر الاتصال بالخدمة.';
  }finally{go.disabled=false;}
};