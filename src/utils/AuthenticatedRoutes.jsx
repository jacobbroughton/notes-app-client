import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthenticatedRoutes = () => {
  const user = useSelector((state) => state.user);

  return user ? <Navigate to="/" /> : <Outlet />;
};

export default AuthenticatedRoutes;
