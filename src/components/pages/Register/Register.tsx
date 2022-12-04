import { FormEvent, useState } from "react";
import Input from "../../ui/Input/Input"
import "./Register.css"

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await fetch("http://localhost:3001/register", {
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
    console.log(data);
  }

  return (
    <div className='register-view'>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <Input type='text' placeholder='Username' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} value={username}/>
        <Input type='password' placeholder='Password' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} value={password}/>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
