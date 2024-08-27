import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { setUser } from "../../../redux/user";
import { getApiUrl } from "../../../utils/getUrl";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/login/`, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
          // "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.status !== 200) {
        throw "ERROR: " + response.statusText;
      }

      const data = await response.json();

      if (!data) throw "There was a problem parsing login response";

      if (!data.user) {
        setLoginError(data.message);
        setTimeout(() => {
          setLoginError("");
        }, 5000);
        return;
      }

      if (loginError) setLoginError("");
      dispatch(setUser(data.user));
      navigate("/");
    } catch (e) {
      if (typeof e === "string") {
        setLoginError(e);
      } else if (e instanceof Error) {
        setLoginError(e.message);
      }
      setLoading(false);
    }
  }

  return (
    <div className="login-view">
      {searchParams.get("redirectedFrom") && (
        <div className={`redirected-from-info ${searchParams.get("status") || ""}`}>
          <p>{searchParams.get("message")}</p>
        </div>
      )}
      {loginError && <div className="login-error">{loginError}</div>}
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          spellCheck="false"
          placeholder="Username"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          pattern="^\S*$"
          required
          autoComplete="off"
        />
        <input
          type="password"
          spellCheck="false"
          placeholder="Password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          pattern="^\S*$"
          required
          autoComplete="off"
        />
        <button type="submit">Submit</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
      {loading && <LoadingOverlay message="Logging you in..." />}
    </div>
  );
};

export default Login;
