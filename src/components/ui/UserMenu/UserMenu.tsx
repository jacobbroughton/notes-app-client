import { FormEvent, useRef, useEffect, MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/user";
import { Link, useNavigate } from "react-router-dom";
import "./UserMenu.css";

const UserMenu = ({
  setUserMenuToggled,
}: {
  setUserMenuToggled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  async function handleLogout(e: FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3001/logout", {
      credentials: "include",
    });

    dispatch(setUser(null));
    setUserMenuToggled(false);
    navigate("/login");
  }

  useEffect(() => {
    function handler(e: Event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        !e.target.classList.contains("user-button") && 
        !e.target.classList.contains("user-icon")
      ) {
        setUserMenuToggled(false);
      }
    }

    window.addEventListener("mousedown", handler);

    return () => window.removeEventListener("mousedown", handler);
  });


  return (
    <div className="user-menu" ref={userMenuRef}>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserMenu;
