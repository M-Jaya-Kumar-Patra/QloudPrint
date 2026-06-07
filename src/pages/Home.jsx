
function Home() {
return ( <div className="bg-slate-950 text-white min-h-screen">

  {/* Navbar */}
  <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">
    <h1 className="text-3xl font-bold text-blue-500">
      QloudPrint
    </h1>

    <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg">
      Login
    </button>
  </nav>

  {/* Hero Section */}
  <section className="flex flex-col items-center justify-center text-center px-6 py-32">

    <h1 className="text-6xl md:text-7xl font-bold leading-tight max-w-5xl">
      Intelligent Cloud Printing
      <span className="text-blue-500"> & Queue Management</span>
    </h1>

    <p className="text-slate-400 text-xl mt-8 max-w-3xl">
      Upload documents remotely, track print orders in real time,
      and reduce waiting time with smart queue optimization.
    </p>

    <div className="flex gap-4 mt-10">
      <button className="bg-blue-600 hover:bg-blue-700 px-7 py-3 rounded-xl text-lg">
        Get Started
      </button>

      <button className="border border-slate-700 hover:border-slate-500 px-7 py-3 rounded-xl text-lg">
        Learn More
      </button>
    </div>
  </section>

  {/* Features */}
  <section className="px-10 pb-24">
    <h2 className="text-4xl font-bold text-center mb-16">
      Features
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h3 className="text-2xl font-semibold mb-4">
          Remote Printing
        </h3>

        <p className="text-slate-400">
          Upload and print documents from anywhere.
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h3 className="text-2xl font-semibold mb-4">
          Smart Queue
        </h3>

        <p className="text-slate-400">
          Intelligent queue optimization with waiting prediction.
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h3 className="text-2xl font-semibold mb-4">
          Realtime Tracking
        </h3>

        <p className="text-slate-400">
          Track printing progress live in real time.
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h3 className="text-2xl font-semibold mb-4">
          Secure Workflow
        </h3>

        <p className="text-slate-400">
          QR pickup and secure cloud document handling.
        </p>
      </div>

    </div>
  </section>

</div>

);
}

export default Home;
