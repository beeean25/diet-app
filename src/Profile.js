import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Profile({ user }) {
const navigate = useNavigate();
  const [carbMax, setCarbMax] = useState("");
  const [vegTarget, setVegTarget] = useState("");
const [requireProtein, setRequireProtein] = useState(true);
const [avoidSugaryDrink, setAvoidSugaryDrink] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  // 🔹 Load existing profile (auto-fill)
useEffect(() => {
  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setCarbMax(data.carb_max || "");
      setVegTarget(data.veg_min_cup || "");
      setRequireProtein(data.req_protein ?? true);
      setAvoidSugaryDrink(data.avoid_sugary_drink ?? true);
      setIsEdit(true);
    }

    setLoading(false);
  };

  loadProfile();
}, [user]);

  // 🔹 Save profile
const saveProfile = async () => {
  console.log("🚀 SAVE CLICKED");

  if (!user?.id) {
    alert("User not found");
    return;
  }

  if (!carbMax) {
    alert("Please enter carb limit / 请输入碳水上限");
    return;
  }

  const { data, error } = await supabase.from("profile").upsert([
    {
      id: user.id,
      carb_max: Number(carbMax),
      veg_min_cup: Number(vegTarget),
      req_protein: requireProtein,
      avoid_sugary_drink: avoidSugaryDrink
    }
  ]);

  console.log("RESULT:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
    return;   // ❗ STOP here if error
  }

  alert("Profile saved");

  navigate("/dashboard");   // ✅ ONLY after success
};

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>
        {isEdit
          ? "Edit Profile / 编辑资料"
          : "Setup Profile / 设置资料"}
      </h2>

      <div style={{ marginTop: 10 }}>
        <label>Max Carb per Meal:</label>
        <br />
        <input
          type="number"
          value={carbMax}
          onChange={(e) => setCarbMax(e.target.value)}
          placeholder="e.g. 4"
        />
        <input
  type="number"
  placeholder="Veg target (cups)"
  value={vegTarget}
  onChange={(e) => setVegTarget(e.target.value)}
/>
      </div>
      <div style={{ marginTop: 15 }}>
      <label>
        <input
          type="checkbox"
          checked={requireProtein}
          onChange={(e) => setRequireProtein(e.target.checked)}
        />
        Require Protein
      </label>
    </div>

    <div style={{ marginTop: 10 }}>
      <label>
        <input
          type="checkbox"
          checked={avoidSugaryDrink}
          onChange={(e) => setAvoidSugaryDrink(e.target.checked)}
        />
        Avoid Sugary Drinks
      </label>
    </div>

      <button
        onClick={saveProfile}
        style={{ marginTop: 15 }}
      >
        {isEdit ? "Update" : "Save"}
      </button>
    </div>
  );
}