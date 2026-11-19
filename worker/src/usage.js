const DAILY_BUDGET=60000;
const CATEGORY_BUDGETS={daily:50000,interactive:10000};
const MODEL_INPUT_RATE=9091;
const MODEL_OUTPUT_RATE=27273;
export async function reserveAI(env,prompt,maxTokens=1000,category='interactive'){
 if(!env.AI_USAGE)throw new Error('AI usage guard belum dikonfigurasi.');
 const bucket=category==='daily'?'daily':'interactive';
 const inputTokens=Math.ceil(String(prompt).length/3*1.25);
 const neurons=Math.ceil(inputTokens*MODEL_INPUT_RATE/1e6+Math.max(1,Number(maxTokens)||1)*MODEL_OUTPUT_RATE/1e6);
 const id=env.AI_USAGE.idFromName('haimiya-global-workers-ai-budget');
 const response=await env.AI_USAGE.get(id).fetch('https://usage-guard/reserve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({neurons,category:bucket})});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'Batas estimasi Workers AI harian tercapai.');
 return {neurons,remaining:data.remaining};
}
export class AIUsageGuard{
 constructor(state){this.state=state}
 async fetch(request){
  const path=new URL(request.url).pathname;
  if(path==='/status'&&request.method==='GET'){
   const today=new Date().toISOString().slice(0,10),usage=await this.state.storage.get('daily');
   const current=usage?.day===today?usage:{day:today,total:0,calls:0,daily:0,interactive:0};
   return Response.json({...current,budget:DAILY_BUDGET,categoryBudgets:CATEGORY_BUDGETS});
  }
  if(path!=='/reserve'||request.method!=='POST')return new Response('Not found',{status:404});
  let body;try{body=await request.json()}catch{return Response.json({error:'Invalid request'},{status:400})}
  const neurons=Math.max(1,Math.ceil(Number(body.neurons)||0)),category=body.category==='daily'?'daily':'interactive',today=new Date().toISOString().slice(0,10);
  return this.state.storage.transaction(async tx=>{
   let usage=await tx.get('daily');
   if(!usage||usage.day!==today)usage={day:today,total:0,calls:0,daily:0,interactive:0};
   const categoryBudget=CATEGORY_BUDGETS[category];
   if(usage.total+neurons>DAILY_BUDGET||usage[category]+neurons>categoryBudget)return Response.json({error:'Anggaran AI harian Haimiya untuk '+category+' sudah mencapai batas aman. Kuota dicoba lagi setelah reset UTC.',used:usage.total,budget:DAILY_BUDGET,categoryUsed:usage[category],categoryBudget,remaining:Math.max(0,Math.min(DAILY_BUDGET-usage.total,categoryBudget-usage[category]))},{status:429});
   usage.total+=neurons;usage[category]+=neurons;usage.calls++;
   await tx.put('daily',usage);
   return Response.json({ok:true,used:usage.total,calls:usage.calls,remaining:DAILY_BUDGET-usage.total,categoryUsed:usage[category],categoryRemaining:categoryBudget-usage[category]});
  });
 }
}