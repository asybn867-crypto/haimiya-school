import { login, checkSession } from './auth.js';
import { askAI } from './ai.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}});
export default {async fetch(req,env){const url=new URL(req.url);if(req.method==='OPTIONS')return new Response(null,{headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});try{
if(url.pathname==='/api/health')return json({ok:true,service:'haimiya-api'});
if(url.pathname==='/api/admin/login'&&req.method==='POST')return json(await login(req,env));
if(url.pathname==='/api/admin/session'&&req.method==='GET')return json(await checkSession(req,env));
if(url.pathname==='/api/ai'&&req.method==='POST')return json(await askAI(req,env));
return json({error:'Not found'},404);
}catch(e){console.error('Worker request failed:',e?.message||e);return json({error:'Internal server error'},500)}}};
