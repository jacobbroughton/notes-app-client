import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login/Login";
import WrongBrowser from "./components/pages/WrongBrowser/WrongBrowser";
import WindowTooSmall from "./components/pages/WindowTooSmall/WindowTooSmall";
import Register from "./components/pages/Register/Register";
import Sidebar from "./components/ui/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { AuthenticatedRoutes } from "./utils/AuthenticatedRoutes";
import { detect } from "detect-browser";
import useWindowSize from "./utils/useWindowSize";
const browser = detect();

function App() {
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const user = useSelector((state: RootState) => state.user);
  const theme = useSelector((state: RootState) => state.theme);
  const windowSize = useWindowSize();

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  // alert(`${browser?.name} ${browser?.os} ${browser?.version} ${browser?.type}`);

  // if (
  //   browser?.name === "safari" ||
  //   browser?.name === "ios" ||
  //   browser?.name === "crios"
  // ) {
  //   return <WrongBrowser />;
  // }

  // if (windowSize.width < 600) {
  //   return <WindowTooSmall/>
  // }

  let marginLeft = 0;
  if (!user) {
  }

  function determineMarginLeft(user: object | null) {
    if (!user) return 0;
    if (sidebar.floating) return 45
    return sidebar.toggled ? sidebar.width + 45 : 45;
  }

  return (
    <div className="App">
      {/* // TODO - uncomment */}
      {user && <Sidebar />}
      {/* <Sidebar /> */}
      <main
        style={{
          marginLeft: `${determineMarginLeft(user)}px`,
        }}
      >
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<AuthenticatedRoutes />}>
            <Route element={<Login />} path="/login" />
          </Route>
          <Route element={<Register />} path="/register" />
          <Route element={<p>Page not found </p>} path="*" />
        </Routes>
      </main>
    </div>
  );
}

export default App;
