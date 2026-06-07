function Login() {
return ( <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"> <div className="bg-slate-900 p-10 rounded-2xl w-[400px] border border-slate-800">

    <h1 className="text-4xl font-bold mb-8 text-center">
      Register
    </h1>

    <input
      type="name"
      placeholder="Name"
      className="w-full mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
    />

    <input
      type="email"
      placeholder="Email"
      className="w-full mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
    />

    <input
      type="password"
      placeholder="Password"
      className="w-full mb-6 p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
    />

    <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg">
      Register
    </button>

  </div>
</div>

);
}

export default Login;
