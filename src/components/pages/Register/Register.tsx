import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { throwResponseStatusError } from "../../../utils/throwResponseStatusError";

import "./Register.css";
import { getApiUrl } from "../../../utils/getUrl";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch(`${getApiUrl()}/register`, {
        method: "post",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "true",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const result = await response.json();

      if (!result) throw "There was a problem registering user";

      navigate({
        pathname: "/login",
        search: `?redirectedFrom=register&message=Account '${username}' has been created&status=success`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="register-view">
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
    </div>
  );
};

export default Login;
