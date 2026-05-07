import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import ResetPassword from "./ResetPassword";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
const [initialized, setInitialized] = useState(false);
const isProfileComplete = (profile) => {
    if (!profile) return false;

    return (
      profile.carb_max &&
      profile.veg_min_cup &&
      profile.req_protein !== undefined &&
      profile.avoid_sugary_drink !== undefined
    );
  };
  // 🔹 Load user on first render
useEffect(() => {
  const init = async () => {
    console.log("🚀 INIT START");

    try {
      const { data } = await supabase.auth.getSession();

      const currentUser = data.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profile")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!profileData) {
  setProfile(null);
} else {
  setProfile(profileData);
}
      } else {
        setProfile(null);
      }

    } catch (err) {
      console.log("INIT ERROR:", err);
    }

    setInitialized(true);   // ✅ ADD THIS
    setLoading(false);
    console.log("🚀 INIT END");
  };

  init();
}, []);

  // 🔹 Listen to login/logout changes
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("🔄 AUTH CHANGE EVENT:", event);

      // 🚨 BLOCK EARLY TRIGGER
      if (!initialized) return;

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profile")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!profileData) {
  setProfile(null);
} else {
  setProfile(profileData);
}
      } else {
        setProfile(null);
      }
    }
  );

  return () => listener.subscription.unsubscribe();
}, [initialized]);

console.log("FULL URL:", window.location.href);
console.log("HASH:", window.location.hash);
  // 🔹 Routing logic
  console.log("RENDER STATE:", {
  loading,
  user,
  profile
});
if (loading) return <p>Loading...</p>;

const hash = window.location.hash;

if (hash.includes("type=recovery")) {
  console.log("🔐 Rendering ResetPassword directly");
  return <ResetPassword />;
}

return (
  <Routes>

    {/* 🔓 Public */}
    <Route path="/login" element={<Login />} />

    {/* 🔐 Reset Password */}
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* 🔐 Profile */}
    <Route
      path="/profile"
      element={
        user ? (
          <Profile user={user} />
        ) : (
          <Navigate to="/login" />
        )
      }
    />

    {/* 🔐 Dashboard */}
    <Route
      path="/dashboard"
      element={
        user ? (
          isProfileComplete(profile) ? (
            <Dashboard user={user} profile={profile} />
          ) : (
            <Navigate to="/profile" />
          )
        ) : (
          <Navigate to="/login" />
        )
      }
    />

    {/* 🔁 Default route */}
    <Route
      path="*"
      element={
        !user
          ? <Navigate to="/login" />
          : !isProfileComplete(profile)
          ? <Navigate to="/profile" />
          : <Navigate to="/dashboard" />
      }
    />

  </Routes>
);
}

export default App;