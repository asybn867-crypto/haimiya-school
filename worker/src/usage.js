const DAILY_BUDGET=8500;
const MODEL_INPUT_RATE=9091;
const MODEL_OUTPUT_RATE=27273;
export async function reserveAI(env,prompt,maxTokens=1000){
 if(!env.AI_USAGE)throw new Error('AI usage guard belum dikonfigurasi.');
 const inputTokens=Math.ceil(String(prompt).length/3*1.25);
 const neurons=Math.ceil(inputTokens*MODEL_INPUT_RATE/1e6+Math.max(1,Number(maxTokens)||1)*MODEL_OUTPUT_RATE/1e6);
 const id=env.AI_USAGE.idFromName('haimiya-global-workers-ai-budget');
 const response=await env.AI_USAGE.get(id).fetch('https://usage-guard/reserve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({neurons,budget:DAILY_BUDGET})});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'Batas estimasi Workers AI harian tercapai.');
 return {neurons,remaining:data.remaining};
}
export class AIUsageGuard{
 constructor(state){this.state=state}
 async fetch(request){
  if(new URL(request.url).pathname!=='/reserve'||request.method!=='POST')return new Response('Not found',{status:404});
  let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request'},{status:400})}
  const neurons=Math.max(1,Math.ceil(Number(body.neurons)||0)),budget=8500,today=new Date().toISOString().slice(0,10);
  return this.state.storage.transaction(async tx=>{
   let usage=await tx.get('daily');
   if(!usage||usage.day!==today)usage={day:today,neurons:0,calls:0};
   if(usage.neurons+neurons>budget)return Response.json({error:'Anggaran AI harian Haimiya sudah mencapai batas aman. Kuota akan dicoba lagi setelah reset UTC.',used:usage.neurons,budget,remaining:Math.max(0,budget-usage.neurons)},{status:429});
   usage.neurons+=neurons;usage.calls++;
   await tx.put('daily',usage);
   return Response.json({ok:true,used:usage.neurons,calls:usage.calls,remaining:budget-usage.neurons});
  });
 }
}