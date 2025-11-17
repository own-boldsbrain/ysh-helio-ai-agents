module.exports=[857159,e=>{"use strict";var t=e.i(565900),r=e.i(128963),n=e.i(32419),s=e.i(719572);let o=(0,r.cache)(async()=>{let e=await (0,t.cookies)(),r=e.get(n.SESSION_COOKIE_NAME)?.value;return(0,s.getSessionFromCookie)(r)});e.s(["getServerSession",0,o])},875972,e=>{"use strict";let t=new Map;function r(e,n,s=!1){t.set(e,n)}function n(e){t.delete(e)}function s(e){return t.get(e)}async function o(e){let r=t.get(e);if(!r){if(t.size>0){let e=t.entries().next().value;if(e){let[r]=e;return t.delete(r),{success:!0,error:`Killed sandbox for task ${r} (fallback)`}}}return{success:!1,error:"No active sandbox found for this task"}}try{t.delete(e);try{await r.stop()}catch(e){console.log("Sandbox stop completed or was already stopped")}return{success:!0}}catch(e){return{success:!1,error:e instanceof Error?e.message:"Failed to kill sandbox"}}}function a(){return t.size}e.s(["getActiveSandboxCount",()=>a,"getSandbox",()=>s,"killSandbox",()=>o,"registerSandbox",()=>r,"unregisterSandbox",()=>n])},442881,e=>{"use strict";var t=e.i(395983),r=e.i(169808),n=e.i(67257),s=e.i(482556),o=e.i(259972),a=e.i(234712),i=e.i(601560),l=e.i(796167),c=e.i(124540),d=e.i(535383),u=e.i(98264),p=e.i(933030),f=e.i(199428),h=e.i(357702),g=e.i(178887),m=e.i(296300),x=e.i(193695);e.i(977362);var S=e.i(167641),R=e.i(988602),v=e.i(857585),E=e.i(61658),y=e.i(857721),C=e.i(875972),N=e.i(857159);async function w(t,{params:r}){try{let n=await (0,N.getServerSession)();if(!n?.user?.id)return v.NextResponse.json({error:"Unauthorized"},{status:401});let{taskId:s}=await r,o=await E.db.select().from(y.tasks).where((0,R.eq)(y.tasks.id,s)).limit(1).then(e=>e[0]);if(!o||o.userId!==n.user.id)return v.NextResponse.json({error:"Task not found"},{status:404});if(!o.sandboxId)return v.NextResponse.json({error:"Task does not have an active sandbox"},{status:400});let a=(0,C.getSandbox)(s);if(!a)try{let t=process.env.SANDBOX_VERCEL_TOKEN,r=process.env.SANDBOX_VERCEL_TEAM_ID,n=process.env.SANDBOX_VERCEL_PROJECT_ID;if(!t||!r||!n)return v.NextResponse.json({error:"Sandbox credentials not configured"},{status:500});let{Sandbox:s}=await e.A(317277);a=await s.get({sandboxId:o.sandboxId,teamId:r,projectId:n,token:t})||void 0}catch(e){return console.error("Failed to reconnect to sandbox:",e),v.NextResponse.json({error:"Failed to connect to sandbox"},{status:500})}if(!a)return v.NextResponse.json({error:"Sandbox not available"},{status:400});let{method:i,filename:l,position:c,textDocument:d}=await t.json(),u=l.startsWith("/")?l:`/${l}`;switch(i){case"textDocument/definition":{let e=".lsp-helper.mjs",t=`
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const filename = '${u.replace(/'/g,"\\'")}';
const line = ${c.line};
const character = ${c.character};

// Find tsconfig.json
let configPath = process.cwd();
while (configPath !== '/') {
  const tsconfigPath = path.join(configPath, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    break;
  }
  configPath = path.dirname(configPath);
}

const tsconfigPath = path.join(configPath, 'tsconfig.json');
const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  configPath
);

// Create language service host
const files = new Map();
const host = {
  getScriptFileNames: () => parsedConfig.fileNames,
  getScriptVersion: (fileName) => {
    const file = files.get(fileName);
    return file && file.version ? file.version.toString() : '0';
  },
  getScriptSnapshot: (fileName) => {
    if (!fs.existsSync(fileName)) return undefined;
    const content = fs.readFileSync(fileName, 'utf8');
    return ts.ScriptSnapshot.fromString(content);
  },
  getCurrentDirectory: () => configPath,
  getCompilationSettings: () => parsedConfig.options,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};

// Create language service
const service = ts.createLanguageService(host, ts.createDocumentRegistry());

// Get definitions
const fullPath = path.resolve(configPath, filename.replace(/^\\/*/g, ''));
const program = service.getProgram();
if (!program) {
  console.error(JSON.stringify({ error: 'Failed to get program' }));
  process.exit(1);
}

const sourceFile = program.getSourceFile(fullPath);
if (!sourceFile) {
  console.error(JSON.stringify({ error: 'File not found', filename: fullPath }));
  process.exit(1);
}

const offset = ts.getPositionOfLineAndCharacter(sourceFile, line, character);
const definitions = service.getDefinitionAtPosition(fullPath, offset);

if (definitions && definitions.length > 0) {
  const results = definitions.map(def => {
    const defSourceFile = program.getSourceFile(def.fileName);
    if (!defSourceFile) {
      return null;
    }
    
    const start = ts.getLineAndCharacterOfPosition(defSourceFile, def.textSpan.start);
    const end = ts.getLineAndCharacterOfPosition(defSourceFile, def.textSpan.start + def.textSpan.length);
    
    return {
      uri: 'file://' + def.fileName,
      range: {
        start: start,
        end: end,
      },
    };
  }).filter(def => def !== null);
  
  console.log(JSON.stringify({ definitions: results }));
} else {
  console.log(JSON.stringify({ definitions: [] }));
}
`,r=`cat > '${e}' << 'EOF'
${t}
EOF`;await a.runCommand("sh",["-c",r]);let n=await a.runCommand("node",[e]),s="",o="";try{s=await n.stdout()}catch(e){console.error("Failed to read LSP stdout:",e)}try{o=await n.stderr()}catch(e){console.error("Failed to read LSP stderr:",e)}if(await a.runCommand("rm",[e]),0!==n.exitCode)return console.error("LSP script failed:",o),v.NextResponse.json({definitions:[],error:o||"Script execution failed"});try{let e=JSON.parse(s.trim());return v.NextResponse.json(e)}catch(e){return console.error("Failed to parse LSP result:",e),v.NextResponse.json({definitions:[],error:"Failed to parse TypeScript response"})}}case"textDocument/hover":return v.NextResponse.json({hover:null});case"textDocument/completion":return v.NextResponse.json({completions:[]});default:return v.NextResponse.json({error:"Unsupported LSP method"},{status:400})}}catch(e){return console.error("LSP request error:",e),v.NextResponse.json({error:"Failed to process LSP request"},{status:500})}}e.s(["POST",()=>w,"maxDuration",0,60,"runtime",0,"nodejs"],687458);var P=e.i(687458);let b=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/tasks/[taskId]/lsp/route",pathname:"/api/tasks/[taskId]/lsp",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/apps/web/app/api/tasks/[taskId]/lsp/route.ts",nextConfigOutput:"",userland:P}),{workAsyncStorage:F,workUnitAsyncStorage:A,serverHooks:O}=b;function k(){return(0,n.patchFetch)({workAsyncStorage:F,workUnitAsyncStorage:A})}async function _(e,t,n){b.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/tasks/[taskId]/lsp/route";R=R.replace(/\/index$/,"")||"/";let v=await b.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:E,params:y,nextConfig:C,parsedUrl:N,isDraftMode:w,prerenderManifest:P,routerServerContext:F,isOnDemandRevalidate:A,revalidateOnlyGenerated:O,resolvedPathname:k,clientReferenceManifest:_,serverActionsManifest:D}=v,T=(0,l.normalizeAppPath)(R),j=!!(P.dynamicRoutes[T]||P.routes[k]),I=async()=>((null==F?void 0:F.render404)?await F.render404(e,t,N,!1):t.end("This page could not be found"),null);if(j&&!w){let e=!!P.routes[k],t=P.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(C.experimental.adapterPath)return await I();throw new x.NoFallbackError}}let L=null;!j||b.isDev||w||(L="/index"===(L=k)?"/":L);let M=!0===b.isDev||!j,U=j&&!M;D&&_&&(0,a.setReferenceManifestsSingleton)({page:R,clientReferenceManifest:_,serverActionsManifest:D,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:D})});let q=e.method||"GET",H=(0,o.getTracer)(),$=H.getActiveScopeSpan(),K={params:y,prerenderManifest:P,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:C.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>b.onRequestError(e,t,n,F)},sharedContext:{buildId:E}},B=new c.NodeNextRequest(e),J=new c.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(B,(0,d.signalFromNodeResponse)(t));try{let a=async e=>b.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${q} ${R}`)}),i=!!(0,s.getRequestMeta)(e,"minimalMode"),l=async s=>{var o,l;let c=async({previousCacheEntry:r})=>{try{if(!i&&A&&O&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await a(s);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let c=K.renderOpts.collectedTags;if(!j)return await (0,f.sendResponse)(B,J,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(o.headers);c&&(t[m.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:S.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})},F),t}},d=await b.handleResponse({req:e,nextConfig:C,cacheKey:L,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:P,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:O,responseGenerator:c,waitUntil:n.waitUntil,isMinimalMode:i});if(!j)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==S.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",A?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,h.fromNodeOutgoingHttpHeaders)(d.value.headers);return i&&j||u.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,f.sendResponse)(B,J,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};$?await l($):await H.withPropagatedContext(e.headers,()=>H.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${R}`,kind:o.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},l))}catch(t){if(t instanceof x.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})}),j)throw t;return await (0,f.sendResponse)(B,J,new Response(null,{status:500})),null}}e.s(["handler",()=>_,"patchFetch",()=>k,"routeModule",()=>b,"serverHooks",()=>O,"workAsyncStorage",()=>F,"workUnitAsyncStorage",()=>A],442881)},317277,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__d547a168._.js"].map(t=>e.l(t))).then(()=>t(519224)))}];

//# sourceMappingURL=_46f92cc6._.js.map