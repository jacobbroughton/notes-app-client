import { FormEvent, useRef, useEffect, MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/user";
import { Link, useNavigate } from "react-router-dom";
import "./UserMenu.css";
import { getApiUrl } from "../../../utils/getUrl";

const UserMenu = ({
  setUserMenuToggled,
}: {
  setUserMenuToggled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  async function handleLogout(e: FormEvent) {
    e.preventDefault();

    await fetch(`${getApiUrl()}/logout`, {
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
        !userMenuRef.current.contains((e.target as HTMLElement)) &&
        !(e.target as HTMLElement).classList.contains("user-button") && 
        !(e.target as HTMLElement).classList.contains("user-icon")
      ) {
        setUserMenuToggled(false);
      }
    }

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
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
