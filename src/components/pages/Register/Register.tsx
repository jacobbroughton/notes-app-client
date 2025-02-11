import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "../../../utils/getUrl";

import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import "./Register.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/register/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was a problem registering user";

      if (registerError) setRegisterError("");

      setLoading(false);

      navigate({
        pathname: "/login",
        search: `?redirectedFrom=register&message=Account '${username}' has been created&status=success`,
      });
    } catch (e) {
      if (typeof e === "string") {
        setRegisterError(e);
      } else if (e instanceof Error) {
        setRegisterError(e.message);
      }
      setLoading(false);
    }
  }

  return (
    <div className="register-view">
      {registerError && <div className="register-error">{registerError}</div>}
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          spellCheck="false"
          placeholder="Username"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          value={username}
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
          required
          value={password}
          pattern="^\S*$"
          autoComplete="off"
        />
        <button type="submit">Submit</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      {loading && <LoadingOverlay message="Creating your account..." />}
    </div>
  );
};

export default Login;
