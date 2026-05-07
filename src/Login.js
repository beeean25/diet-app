import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const signUp = async () => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
    emailRedirectTo:
      "https://diet-app-nine-ruddy.vercel.app/login"
  }
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Check your email / 请检查邮箱");
};

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };
const resetPassword = async () => {
    if (!email) {
      alert("Please enter your email / 请输入邮箱");
      return;
    }
    if (sending) return; // 🚫 prevent spam click
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://diet-app-nine-ruddy.vercel.app/reset-password"
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent / 重置邮件已发送");
    }
    setSending(false);
  };
  return (
    <div style={{ padding: 20 }}>
      <h2>Login / 登录</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <br/><br/>

      <input type="password" placeholder="Password / 密码" onChange={(e)=>setPassword(e.target.value)} />
      <br/><br/>

      <button onClick={login}>Log masuk / 登录</button>
      <button onClick={signUp}>Pendaftaran Baru / 注册</button>
      <button onClick={resetPassword}
  disabled={sending}
>
  {sending
    ? "Sending..."
    : "Terlupa Password / 忘记密码"}
</button>
    </div>
  );
}