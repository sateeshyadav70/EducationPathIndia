import { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import loginApi from '../api/loginApi.jsx';

function Login(){
  const navigate=useNavigate();
  const [form, setForm]=useState({
    email:"",
    password:""
  });
  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
    };
    const handleSubmit=async (e)=>{
      e.preventDefault();
        if(!form.email  || !form.password){
          alert("please fill all the fields");
          return;
      }
      const result=await loginApi(form);
      if(result.ok){
        alert("login sucessfull");
        setForm({
          email:"",
          password:""
        })
        navigate("/")
      }else{
        alert(result.data.message);
      }

    }
  return (
    <div className="flex justify-center items-center bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      
      <div className="flex flex-col p-10 rounded-2xl shadow-2xl border-3 border-green-500 mt-10 max-w-md w-full shadow-green-200 bg-white dark:bg-gray-800">
        
        <h1 className="text-2xl mb-6 text-center font-bold p-2 text-gray-600 dark:text-gray-300">Login</h1>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          
          <label className="font-bold text-black dark:text-white">User ID / Email</label>
          <input

            type="email"
            name="email"
            value={form.email}
           onChange={handleChange}
            className="border-2 border-amber-400 p-2 rounded-2xl hover:border-green-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            placeholder="enter your email"
          />

          <label className="font-bold text-black dark:text-white">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
          onChange={handleChange}
            className="border-2 border-amber-400 p-2 rounded-2xl hover:border-green-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            placeholder="enter your password"
          />


          <div className="p-[2px] rounded-xl bg-[linear-gradient(270deg,#3b82f6,#ef4444,#8b5cf6,#3b82f6)] bg-[length:400%_400%] animate-gradient mt-4">
            <button className="bg-white dark:bg-gray-700 px-4 py-2 rounded-xl w-full text-black dark:text-white font-semibold" type="submit">
              Login
            </button>
          </div>
          <Link className="btn ghost border-2 border-gray-300 dark:border-gray-600 rounded-xl py-2 text-center hover:border-green-500 transition-colors" to="/signup">
            New here? Create account
          </Link>
        </form>

      </div>

    </div>
  )

}
export default Login
