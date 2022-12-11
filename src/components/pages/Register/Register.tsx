import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../ui/Input/Input";
import "./Register.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const result = await fetch("http://localhost:3001/register", {
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

      if (data) {
        console.log(data)
        // setSearchParams({ redirectedFrom: 'register', message: 'Your account has been created, please log in', isError: 'false' })
        navigate({
          pathname: '/login',
          search: `?redirectedFrom=register&message=Account '${username}' has been created&status=success`
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="register-view">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          value={username}
          pattern="^\S*$"
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
          value={password}
          pattern="^\S*$"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
