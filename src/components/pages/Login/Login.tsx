import { FormEvent, ReactEventHandler, useEffect, useState } from "react";
import { setUser } from "../../../redux/user";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../../ui/Input/Input";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [searchParams] = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await fetch("http://localhost:3001/login", {
      method: "post",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await result.json();
    if (data.user) {
      if (loginError) setLoginError("")
      dispatch(setUser(data.user));
      navigate("/");
    } else {
      setLoginError(data.message);
      setTimeout(() => {
        setLoginError("")
      }, 5000)
    }
  }

  useEffect(() => {
    console.log(searchParams.get("redirectedFrom"));
    console.log(searchParams.get("message"));
    console.log(searchParams.get("isError"));
  }, [searchParams]);

  return (
    <div className="login-view">
      {searchParams.get("redirectedFrom") && (
        <div className={`redirected-from-info ${searchParams.get("status") || ""}`}>
          <p>{searchParams.get("message")}</p>
        </div>
      )}
      {loginError && <div className='login-error'>{loginError}</div>}
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          pattern="^\S*$"
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          pattern="^\S*$"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
