import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
    const navigate = useNavigate();
  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated! Please login again.");
      await supabase.auth.signOut();

      navigate("/login");   // ✅ React Router navigation
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>Reset Password / 重置密码</h2>

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={updatePassword}>
        Update Password
      </button>
    </div>
  );
}