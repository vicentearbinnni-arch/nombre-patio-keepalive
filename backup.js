const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_ANON_KEY,S=process.env.BACKUP_SECRET,D=process.env.DISCORD_WEBHOOK_URL;
async function alertar(m){if(D){try{await fetch(D,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:m})});}catch(e){}}}
(async()=>{
  try{
    const r=await fetch(U+'/rest/v1/rpc/export_backup',{method:'POST',headers:{'Content-Type':'application/json','apikey':K,'Authorization':'Bearer '+K,'Content-Profile':'dinein'},body:JSON.stringify({p_secret:S})});
    if(!r.ok)throw new Error('export_backup: '+r.status+' '+(await r.text()));
    const dump=await r.json();
    const nombre='backup-'+new Date().toISOString().slice(0,10)+'.json';
    const up=await fetch(U+'/storage/v1/object/dinein-backups/'+nombre,{method:'POST',headers:{'Content-Type':'application/json','apikey':K,'Authorization':'Bearer '+K,'x-upsert':'true'},body:JSON.stringify(dump)});
    if(!up.ok)throw new Error('subida: '+up.status+' '+(await up.text()));
    console.log('Backup OK: '+nombre);
  }catch(e){
    console.error('Backup fallo:',e.message);
    await alertar('Fallo el backup semanal de Patio: '+e.message);
    process.exit(1);
  }
})();
