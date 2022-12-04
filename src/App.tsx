import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login/Login";
import Register from "./components/pages/Register/Register";
import Navbar from "./components/ui/Navbar/Navbar";
import Sidebar from "./components/ui/Sidebar/Sidebar";
import { useSelector } from "react-redux"

function App() {

  const sidebar = useSelector(state => state.sidebar)

  return (
    <div className="App">
      <Navbar/>
      <Sidebar/>
      <main style={{ marginLeft:  `${sidebar.width}px`}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p>Page not found </p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
