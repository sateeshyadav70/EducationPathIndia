async function SignupApi(form){

  try{
    const response=await fetch("http://localhost:3500/api/signup",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body: JSON.stringify(form)
    });
    const data=await response.json();
    return{
      ok:response.ok,
      data
    };
  }catch(error){
    return {
      ok:false,
      data:{message:"network error"}
    };
  }
};
export default SignupApi;