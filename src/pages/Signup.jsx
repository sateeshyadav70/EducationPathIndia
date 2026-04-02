import { useState } from 'react'
import SignupApi from '../api/SignupApi'
import { useNavigate } from 'react-router-dom';
function Signup() {
  const navigate=useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  };
  const handleSubmit=async(e)=>{
    e.preventDefault();

    if(!form.name || !form.email || !form.password){
      alert("please fill all the fields");
      return;
    }
    const response=await SignupApi(form);
    if(response.ok){
      alert("signup sucessfull");
      setForm({
        name:"",
        email:"",
        password:""
      })
       navigate("/login");

    }else{
      alert(response.data.message);
    }

  }
  return (
    <div className="flex justify-center items-center bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">

      <div className="flex flex-col p-10 rounded-2xl shadow-2xl border-3 border-green-500 mt-10 max-w-md w-full shadow-green-200 bg-white dark:bg-gray-800">

        <h1 className="text-2xl mb-6 text-center font-bold p-2 text-gray-600 dark:text-gray-300">Signup</h1>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>

          <label className="font-bold text-black dark:text-white" >Name</label>
          <input className="border-2 border-amber-400 p-2 rounded-2xl hover:border-green-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            type="text"
            name="name"
            placeholder="enter your name"
            value={form.name}
            onChange={handleChange}
          />

          <label className="font-bold text-black dark:text-white">Gmail</label>

          <input className="border-2 p-2 rounded-2xl border-amber-400 hover:border-green-500 bg-white dark:bg-gray-700 text-black dark:text-white"

            type="text"
            name="email"
            placeholder="enter your email"
            value={form.email}
            onChange={handleChange}
          />

          <label className="font-bold text-black dark:text-white">Password</label>
          <input className="border-2 border-amber-400 p-2 rounded-2xl hover:border-green-500 bg-white dark:bg-gray-700 text-black dark:text-white"

            type="password"
            name="password"
            placeholder="enter your password"
            value={form.password}
            onChange={handleChange}
          />

          <div className="p-[2px] rounded-xl bg-[linear-gradient(270deg,#3b82f6,#ef4444,#8b5cf6,#3b82f6)] bg-[length:400%_400%] animate-gradient">
            <button 
            type="submit"
            className="bg-white dark:bg-gray-700 px-4 py-2 rounded-xl w-full text-black dark:text-white">
              Signup
            </button>
          </div>


        </form>

      </div>

    </div>
  )
}

export default Signup