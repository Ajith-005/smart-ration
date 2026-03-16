(async ()=>{
  try{
    const login = await fetch('http://localhost:5000/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.com',password:'Admin@123'})});
    const li = await login.json();
    console.log('LOGIN_STATUS', login.status, li);
    if(!login.ok) return;
    const token = li.token;
    const res = await fetch('http://localhost:5000/api/distributions',{headers:{Authorization:`Bearer ${token}`}});
    const body = await res.text();
    console.log('DISTS_STATUS', res.status, body);
  }catch(e){
    console.error('ERROR', e);
  }
})();
