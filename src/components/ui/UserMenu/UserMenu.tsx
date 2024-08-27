import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetCombinedState } from "../../../redux/combined";
import { resetFoldersState } from "../../../redux/folders";
import { resetModalsState } from "../../../redux/modals";
import { resetPagesState } from "../../../redux/pages";
import { resetSidebarState } from "../../../redux/sidebar";
import { resetTagsState } from "../../../redux/tags";
import { resetThemeState } from "../../../redux/theme";
import { resetUserState } from "../../../redux/user";
import { getApiUrl } from "../../../utils/getUrl";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import "./UserMenu.css";

const UserMenu = ({
  setUserMenuToggled,
}: {
  setUserMenuToggled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogout(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/logout/`, {
        credentials: "include",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      });

      if (response.status !== 200) throw response.statusText;

      dispatch(resetUserState());
      dispatch(resetThemeState());
      dispatch(resetTagsState());
      dispatch(resetSidebarState());
      dispatch(resetPagesState());
      dispatch(resetFoldersState());
      dispatch(resetModalsState());
      dispatch(resetCombinedState());
      setUserMenuToggled(false);
      navigate("/login");
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    function handler(e: Event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as HTMLElement) &&
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
      {loading && <LoadingOverlay message="Logging you out..." />}
    </div>
  );
};

export default UserMenu;
