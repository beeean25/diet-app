import { supabase } from "./supabaseClient";
import { useState } from "react";

export default function ResetPassword() {

  const [password, setPassword] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  const updatePassword = async () => {

    if (updating) return;

    if (!password) {
      alert("Please enter password");
      return;
    }

    setUpdating(true);

    try {

      console.log("🚀 Updating password...");

      const { error } =
        await supabase.auth.updateUser({
          password
        });

      if (error) {
        console.log(error);

        alert(error.message);

        setUpdating(false);
        return;
      }

      alert(
        "Password updated! Please login again."
      );

      await supabase.auth.signOut();

      window.location.replace("/login");

    } catch (err) {

      console.log("RESET ERROR:", err);

      alert("Reset failed");

      setUpdating(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>
        Reset Password / 重置密码
      </h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e)=>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button
        onClick={updatePassword}
        disabled={updating}
      >
        {updating
          ? "Updating..."
          : "Update Password"}
      </button>

    </div>
  );
}