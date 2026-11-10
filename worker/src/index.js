import { login, checkSession, logout } from './auth.js';
import { askAI } from './ai.js';
const DEFAULT_ORIGIN='https://haimiya-school.asybn867.workers.dev';
const appOrigin=env=>env.APP_ORIGIN||DEFAULT_ORIGIN;
const cors=(origin,env)=>origin===appOrigin(env)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Credentials':'true','Vary':'Origin'}:{};
const base={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(body,status,origin,env,extra={})=>new Response(JSON.stringify(body),{status,headers:{...base,...cors(origin,env),...extra}});
const result=(r,origin,env)=>json(r.body,r.status,origin,env,r.cookie?{'Set-Cookie':r.cookie}:{});
export default {async fetch(req,env){const u=new URL(req.url),origin=req.headers.get('Origin')||'';if(origin&&origin!==appOrigin(env))return json({error:'Origin tidak diizinkan.'},403,origin,env);if(req.method==='OPTIONS'){if(origin!==appOrigin(env))return new Response(null,{status:403});return new Response(null,{status:204,headers:{...cors(origin,env),'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Max-Age':'86400','Vary':'Origin'}})}try{
if(u.pathname==='/api/health'&&req.method==='GET')return json({ok:true,service:'haimiya-api'},200,origin,env);
if(u.pathname==='/api/admin/login'&&req.method==='POST')return result(await login(req,env),origin,env);
if(u.pathname==='/api/admin/session'&&req.method==='GET')return result(await checkSession(req,env),origin,env);
if(u.pathname==='/api/admin/logout'&&req.method==='POST')return result(await logout(req,env),origin,env);
if(u.pathname==='/api/ai'&&req.method==='POST'){const r=await askAI(req,env);return json(r.body??r,r.status??200,origin,env)}
if(['/api/admin/login','/api/admin/session','/api/admin/logout','/api/ai'].includes(u.pathname))return json({error:'Method not allowed.'},405,origin,env,{'Allow':u.pathname.endsWith('/session')?'GET, OPTIONS':'POST, OPTIONS'});
return json({error:'Not found.'},404,origin,env)
}catch(e){console.error('Worker request failed:',e?.message||e);return json({error:'Internal server error.'},500,origin,env)}}};
