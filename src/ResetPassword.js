import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
    const navigate = useNavigate();
 useEffect(() => {
    const handleSession = async () => {
      console.log("🔐 Checking recovery session...");

      const { data, error } = await supabase.auth.getSession();

      console.log("SESSION:", data, error);

      if (!data?.session) {
        console.log("❌ No session — reset will fail");
      }
    };

    handleSession();
  }, []);

  const updatePassword = async () => {
  console.log("🚀 Update clicked");

  if (!password) {
    alert("Please enter password");
    return;
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password
  });

  console.log("RESULT:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
  } else {
    alert("Password updated! Please login again.");
    await supabase.auth.signOut();
    setTimeout(() => {
    navigate("/login");
    }, 300);
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