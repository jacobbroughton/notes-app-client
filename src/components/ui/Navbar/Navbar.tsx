import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { RootState } from "../../../redux/store";
import DownCaret from "../Icons/DownCaret";
import { setUser } from "../../../redux/user";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Navbar.css";
import { FormEvent } from "react";

const Navbar = () => {
  const navDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const [navDropdownToggled, setNavDropdownToggled] = useState(false);

  useEffect(() => {
    function handler(e) {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current?.contains(e.target) &&
        !e.target.classList.contains("nav-dropdown-toggle")
      ) {
        setNavDropdownToggled(false);
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  async function handleLogout(e: FormEvent) {
    e.preventDefault();

    const result = await fetch("http://localhost:3001/logout", {
      credentials: "include",
    });
    const data = await result.json();

    dispatch(setUser(null));
    navigate("/login");
  }

  return (
    <nav>
      <div className="container">
        <p>Notes</p>
        <div className="nav-links">
          {user ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNavDropdownToggled(!navDropdownToggled);
                }}
                className="nav-dropdown-toggle"
              >
                <img src={`https://avatars.dicebear.com/api/initials/${user.USERNAME}.svg?backgroundColor=%23646cff`}/>
                {user.USERNAME[0].toUpperCase() +
                  user.USERNAME.slice(1, user.USERNAME.length)}{" "}
                <DownCaret direction={navDropdownToggled ? "up" : "down"} />
              </button>
              {navDropdownToggled && (
                <div className="nav-dropdown" ref={navDropdownRef}>
                  <Link to="/">Home</Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
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
