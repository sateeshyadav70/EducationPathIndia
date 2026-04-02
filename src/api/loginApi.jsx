async function loginApi(form){
  try{
    const response=await fetch("http://localhost:3500/api/login",{
      method:"post",
      headers:{
        "content-type":"application/json",
      },
      body:JSON.stringify(form),
    })
    const result=await response.json();
    if(response.ok){
      return{
        ok:response.ok,
        data:result
      }
    }
  }catch (error){
    return{
      ok:false,
      data:{message:"network.error"}
    }
  }
}
export default loginApi;
