import { Link } from "react-router-dom";
import { RootState } from "../../../redux/store";
import { setUser } from "../../../redux/user";
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux";
import "./Navbar.css";
import { FormEvent } from "react";

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user);

  async function handleLogout(e: FormEvent) {
    e.preventDefault()

    const result = await fetch('http://localhost:3001/logout', {
      credentials: 'include'
    })
    const data = await result.json()
    
    
    dispatch(setUser(null))
    navigate('/login')
}

  return (
    <nav>
      <div className="container">
        <p>Notes</p>
        <div className="nav-links">
          {user ? (
            <>
            <Link to="/">Home</Link>
              <button className='logout-btn' onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
