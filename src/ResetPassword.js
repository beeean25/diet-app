import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ResetPassword({ onDone }) {
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

  if (updating) return;

  setUpdating(true);

  try {

    if (!password) {
      alert("Please enter password");
      setUpdating(false);
      return;
    }

    console.log("🚀 Update clicked");

    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    console.log("RESULT:", data);
    console.log("ERROR:", error);

    if (error) {
      alert(error.message);
      setUpdating(false);
      return;
    }

    alert("Password updated! Please login again.");

    await supabase.auth.signOut();
    setUpdating(false);

window.history.replaceState(
  {},
  document.title,
  "/login"
);

if (onDone) {
  onDone();
} else {
  navigate("/login");
}

  } catch (err) {

    console.log("RESET ERROR:", err);

    alert("Reset failed");

    setUpdating(false);
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Reset Password / 重置密码</h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
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