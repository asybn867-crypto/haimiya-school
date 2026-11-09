import { login, checkSession, logout } from './auth.js';
import { askAI } from './ai.js';
const FRONTEND='https://haimiya-school.asybn867.workers.dev';
const cors=origin=>origin===FRONTEND?{'Access-Control-Allow-Origin':FRONTEND,'Access-Control-Allow-Credentials':'true','Vary':'Origin'}:{};
const json=(data,status=200,origin='')=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...cors(origin)}});
export default {async fetch(req,env){const url=new URL(req.url),origin=req.headers.get('Origin')||'';if(req.method==='OPTIONS')return new Response(null,{headers:{...cors(origin),'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Max-Age':'86400'}});if(origin&&origin!==FRONTEND)return json({error:'Origin not allowed.'},403);try{
if(url.pathname==='/api/health')return json({ok:true,service:'haimiya-api'},200,origin);
if(url.pathname==='/api/admin/login'&&req.method==='POST')return json(await login(req,env),200,origin);
if(url.pathname==='/api/admin/session'&&req.method==='GET')return json(await checkSession(req,env),200,origin);
if(url.pathname==='/api/admin/logout'&&req.method==='POST')return json(await logout(req,env),200,origin);
if(url.pathname==='/api/ai'&&req.method==='POST')return json(await askAI(req,env),200,origin);
return json({error:'Not found'},404,origin);
}catch(e){console.error('Worker request failed:',e?.message||e);return json({error:'Internal server error'},500,origin)}}};
