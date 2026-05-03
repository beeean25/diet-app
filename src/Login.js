import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email / 请检查邮箱");
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login / 登录</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <br/><br/>

      <input type="password" placeholder="Password / 密码" onChange={(e)=>setPassword(e.target.value)} />
      <br/><br/>

      <button onClick={login}>Login / 登录</button>
      <button onClick={signUp}>Sign Up / 注册</button>
    </div>
  );
}