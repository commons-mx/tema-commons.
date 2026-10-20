/* Public client API only. Send only when the visitor requests their protocol. */
(function(){
  'use strict';
  function absoluteUrl(value){
    if (!value || value === '#') return '';
    try {
      var url=new URL(value, 'https://commons.mx');
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      url.protocol='https:';
      return url.href;
    } catch(e){return '';}
  }
  function properties(q){
    if(!q || !Array.isArray(q.det) || !q.det.length) throw new Error('No hay un protocolo disponible.');
    return {protocol_name:q.n||'',intro:q.intro||'',products:q.det.map(function(p){var product={name:p.n||'',line:p.line||'',format:p.format||'',instructions:p.how||'',url:absoluteUrl(p.url),image:absoluteUrl(p.img)}; if(typeof p.reason === 'string' && p.reason.trim()) product.reason=p.reason.trim(); return product;}),weeks:[{label:'Semana 1–2',text:'Empieza con la dosis mínima para ver cómo te sienta.'},{label:'Semana 3',text:'Si te sientes bien, sube a tu dosis completa.'},{label:'Semana 8–10',text:'Evalúa cómo vas.'},{label:'Semana 12',text:'Descansa las que lo piden y retoma.'}],source:'commons_quiz',schema_version:1};
  }
  async function send(email,q,id){
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},15000);
    try{
      var payload={data:{type:'event',attributes:{unique_id:id,metric:{data:{type:'metric',attributes:{name:'Protocolo Commons solicitado'}}},profile:{data:{type:'profile',attributes:{email:email.trim()}}},properties:properties(q)}}};
      var response=await fetch('https://a.klaviyo.com/client/events/?company_id=Rem5xS',{method:'POST',headers:{'Content-Type':'application/json',accept:'application/json',revision:'2026-10-15'},body:JSON.stringify(payload),signal:controller.signal});
      console.info('[Commons protocolo]', {status:response.status, event_id:id, time_utc:new Date().toISOString()});
      if(response.status!==202)throw new Error('No pudimos registrar la solicitud. Intenta de nuevo o guarda tu protocolo en PDF.');
    }finally{clearTimeout(timer);}
  }
  window.CommonsProtocolEmail={send:send,properties:properties};
})();
