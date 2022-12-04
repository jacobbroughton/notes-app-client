import { FormEvent, ReactEventHandler, useState } from "react";
import { setUser } from "../../../redux/user"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import Input from "../../ui/Input/Input"
import "./Login.css"

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await fetch("http://localhost:3001/login", {
      method: "post",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await result.json();
    if (data.user) {
      dispatch(setUser(data.user))
      navigate('/')
    }
  }

  return (
    <div className='login-view'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <Input type='text' placeholder='Username' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}/>
        <Input type='password' placeholder='Password' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
