import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../../../redux/user"
import "./Home.css"

const Home = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const pages = useSelector(state => state.pages)
  const [loading, setLoading] = useState(true)

  async function testApi() {
    const result = await fetch("http://localhost:3001", {
        credentials: 'include'
    });
    const data = await result.json();
    if (data.user && !user) {
      dispatch(setUser(data.user))
      setLoading(false)
    }
    if (!data.user) navigate('/login')
    
  }

  async function testProtectedRoute() {
    const result = await fetch("http://localhost:3001/protected-route", {
        credentials: 'include'

    });
    const data = await result.json();
    console.log(data);
  }

  async function testAdminRoute() {
    const result = await fetch("http://localhost:3001/admin-route", {
        credentials: 'include'
    });
    const data = await result.json();
    console.log(data);
  }

  
  useEffect(() => {
    testApi();
  }, []);

  if (loading && !user) {
    return <p>Loading...</p>
  }

  if (!loading && !user) {
    return <Navigate to='/login' replace/>
  }

  return (
    <div className='home-view'>
      <h1>{pages.selected?.NAME}</h1>

      
    
      {/* <button onClick={testProtectedRoute}>Protected Route</button>
      <button onClick={testAdminRoute}>Admin Route</button> */}
    </div>
  );
};

export default Home;
