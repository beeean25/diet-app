import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [updating, setUpdating] = useState(false);
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

  // 🚫 prevent double execution
  if (updating) return;

  setUpdating(true);

  console.log("🚀 Update clicked");

  if (!password) {
    alert("Please enter password");
    setUpdating(false);
    return;
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password
  });

  console.log("RESULT:", data);
  console.log("ERROR:", error);

  if (error) {
  alert(error.message);
  setUpdating(false);

} else {

  alert("Password updated! Please login again.");

  // ⏳ wait for Supabase auth lock release
  setTimeout(async () => {

    await supabase.auth.signOut();

    navigate("/login");

  }, 1000);
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

      <button
  onClick={updatePassword}
  disabled={updating}
>
  {updating ? "Updating..." : "Update Password"}
</button>
    </div>
  );
}