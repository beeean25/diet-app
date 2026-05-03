import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AddMeal, {
  carbMap,
  fruitMap,
  fruitExchangeMap,
  proteinMap,
  drinkOptions
} from "./AddMeal";
import GlucoseForm from "./GlucoseForm";
import MealList from "./MealList";
import { getMealIssues, vegToCupMap } from "./mealUtils";


export default function Dashboard() {
  const [meals, setMeals] = useState([]);
  const [glucoseLogs, setGlucoseLogs] = useState([]);
  const [profile, setProfile] = useState(null);
 const [editingMeal, setEditingMeal] = useState(null);
const getStatus = (value, timing) => {
  return detectGlucoseStatus(value, timing);
};

  const fetchMeals = async () => {
    console.log("🚀 fetchMeals START");
    const { data,error } = await supabase
      .from("meals")
      .select("id, meal_type, date, time, glucose_flag, carb_food, carb_portion, carb_exchange, protein_food, protein_portion, veg_portion, fruit, fruit_portion, fruit_exchange, drink, meal_score")
      .order("date", { ascending: false });
       console.log("📦 DATA:", data);
  console.log("❌ ERROR:", error);

  if (error) {
    console.log("🔥 ERROR FOUND:", error.message);
    return;
  }

    setMeals(data || []);
    
  };

  const fetchGlucose = async () => {
    const { data } = await supabase
      .from("glucose_logs")
      .select("*")
     .order("glucose_date", { ascending: false })
    .order("glucose_time", { ascending: false })

    setGlucoseLogs(data || []);
  };
const fetchProfile = async () => {
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.log("PROFILE ERROR:", error);
    return;
  }

  console.log("PROFILE:", data);
  setProfile(data);
};

  useEffect(() => {
  fetchMeals();
  fetchGlucose();
  fetchProfile();   // ✅ ADD THIS
}, []);
  // =========================
// 🩸 GLUCOSE STATUS FUNCTION (ADD HERE)
// =========================
function detectGlucoseStatus(value, timing) {
  const glucose = Number(value);

  const isBefore =
    timing === "before" ||
    timing?.toLowerCase().includes("sebelum") ||
    timing?.toLowerCase().includes("puasa");

  const isAfter =
    timing === "after" ||
    timing?.toLowerCase().includes("selepas");

  if (isBefore) {
    if (glucose < 4) return "Rendah / 偏低";
    if (glucose <= 7) return "Normal / 正常";
    return "Tinggi / 偏高";
  }

  if (isAfter) {
    if (glucose < 4) return "Rendah / 偏低";
    if (glucose <= 8.5) return "Normal / 正常";
    if (glucose <= 11) return "Tinggi / 中度偏高";
    return "Sangat Tinggi / 偏高";
  }

  return "Tiada data / 无数据";
}
// =========================
// ⏱ FIXED TIME PARSING (ADD HERE)
// =========================
function getTimeDiffInMinutes(t1, t2) {
  if (!t1 || !t2) return Infinity;

  const normalize = (t) => {
    // handle "08:56:00" → "08:56"
    return t.length > 5 ? t.slice(0, 5) : t;
  };

  const [h1, m1] = normalize(t1).split(":").map(Number);
  const [h2, m2] = normalize(t2).split(":").map(Number);

  return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
}
// =========================
// 📊 MATCH GLUCOSE WITH MEAL
// =========================
function getMealGlucose(meal) {
  if (!glucoseLogs || glucoseLogs.length === 0) return {};

  // filter same day
  const sameDayLogs = glucoseLogs.filter(
    (g) => new Date(g.glucose_date).toDateString() === new Date(meal.date).toDateString()
  );

  // BEFORE candidates
  const beforeCandidates = sameDayLogs.filter((g) =>
    g.timing?.includes("Sebelum")
  );

  let before = null;
  let minBeforeDiff = Infinity;

  beforeCandidates.forEach((g) => {
    const diff = getTimeDiffInMinutes(g.glucose_time, meal.time);
    if (diff < minBeforeDiff && diff <= 120) {
      minBeforeDiff = diff;
      before = g;
    }
  });

  // AFTER candidates
  const afterCandidates = sameDayLogs.filter((g) =>
    g.timing?.includes("Selepas")
  );

  let after = null;
  let minAfterDiff = Infinity;

  afterCandidates.forEach((g) => {
    const diff = getTimeDiffInMinutes(g.glucose_time, meal.time);
    if (diff < minAfterDiff && diff <= 120) {
      minAfterDiff = diff;
      after = g;
    }
  });
  const fastingCandidates = sameDayLogs.filter(
    (g) =>
      g.timing === "fasting" ||
      g.timing?.toLowerCase().includes("puasa")
  );

  const fasting = fastingCandidates[0]; 

  return { before, after, fasting };
}
const updateMeal = async () => {
  if (!editingMeal) return;

  console.log("EDITING ID:", editingMeal.id);
  console.log("FULL EDITING OBJECT:", editingMeal);

  const { data, error } = await supabase
    .from("meals")
    .update({
      carb_food: editingMeal.carb_food,
      carb_portion: editingMeal.carb_portion,
      protein_food: editingMeal.protein_food,
      protein_portion: editingMeal.protein_portion,
      veg_portion: editingMeal.veg_portion,
      fruit: editingMeal.fruit,
      fruit_portion: editingMeal.fruit_portion,
      drink: editingMeal.drink,
    })
    .eq("id", Number(editingMeal.id))   // safer
    .select();   // ✅ VERY IMPORTANT

  console.log("UPDATED DATA:", data);

  if (error) {
    alert(error.message);
    return;
  }

  setEditingMeal(null);
  fetchMeals();
};
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard / 仪表板</h2>

      <GlucoseForm
  refresh={() => {
    fetchGlucose();
    fetchMeals();   // ✅ ADD THIS
  }}
/>
{!editingMeal && (
  <AddMeal refresh={fetchMeals} />
)}   // 

      <h3>Hidangan / 餐点记录</h3>

{meals.map((meal) => {
   console.log("MEAL DATA:", meal);
  const isEditing = editingMeal?.id === meal.id;
  if (isEditing) {
  console.log("Selected Protein:", editingMeal.protein_food);
  console.log("Available Portions:", proteinMap[editingMeal.protein_food]);
}
  const liveFruitExchange =
  isEditing && editingMeal.fruit && editingMeal.fruit_portion
    ? fruitExchangeMap?.[editingMeal.fruit]?.[editingMeal.fruit_portion] || 0
    : meal.fruit_exchange || 0;
   const { before, after,fasting } = getMealGlucose(meal);
  const beforeStatus = before
  ? detectGlucoseStatus(before.glucose_value, before.timing)
  : "Tiada / 无";

const afterStatus = after
  ? detectGlucoseStatus(after.glucose_value, after.timing)
  : "Tiada / 无";

  const fastingStatus = fasting
  ? detectGlucoseStatus(fasting.glucose_value, fasting.timing)
  : "Tiada / 无";

const getColor = (status) => {
  if (status.includes("Normal")) return "green";
  if (status.includes("Rendah")) return "orange";
  if (status.includes("Tiada")) return "gray";
  return "red";
};
const issues = getMealIssues({
  carb: meal.carb_exchange || 0,
  carb_min: profile?.carb_min || 0,
  carb_max: profile?.carb_max || 999,
  veg: meal.veg_portion,
  vegToCupMap,
  profile,
  require_protein: true,
  hasProtein: meal.protein_food !== "None",
  avoid_sugary_drink: true,
  isSugaryDrink: meal.drink?.toLowerCase().includes("manis")
});

const totalExchange =
  (meal.carb_exchange || 0) + (meal.fruit_exchange || 0);

const maxCarb = profile?.carb_max || 3;
  return (
    <div
      key={meal.id}
      style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
    >
     {isEditing ? (
  <>
    <select
      value={editingMeal.meal_type}
      onChange={(e) =>
        setEditingMeal({ ...editingMeal, meal_type: e.target.value })
      }
    >
      <option>Sarapan pagi （早餐）</option>
      <option>Makan tengahari （午餐）</option>
      <option>Makan petang/malam （晚餐）</option>
      <option>Snek （茶点）</option>
    </select>

    <input
      type="date"
      value={editingMeal.date}
      onChange={(e) =>
        setEditingMeal({ ...editingMeal, date: e.target.value })
      }
    />

    <input
      type="time"
      value={editingMeal.time}
      onChange={(e) =>
        setEditingMeal({ ...editingMeal, time: e.target.value })
      }
    />
  </>
) : (
  <h4>{meal.meal_type} ({meal.date} {meal.time})</h4>
)}

      {/* FOOD */}
      <p><b>Food / 食物:</b></p>
      <p><b>🍚 Karbohidrat / 碳水:</b></p>
     {isEditing ? (
  <>
    <select
      value={editingMeal.carb_food}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          carb_food: e.target.value,
          carb_portion: "None"
        })
      }
    >
      {Object.keys(carbMap).map((c, i) => (
        <option key={i} value={c}>{c}</option>
      ))}
    </select>

    <select
      value={editingMeal.carb_portion}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          carb_portion: e.target.value
        })
      }
    >
      {(carbMap[editingMeal.carb_food] || []).map((p, i) => (
        <option key={i} value={p}>{p}</option>
      ))}
    </select>
  </>
) : (
  <p>🍚 Carb: {meal.carb_food} ({meal.carb_portion})</p>
)}
      <p>🍚 Carb Exchange:{" "}
        <strong style={{ color: "orange" }}>
        {meal.carb_exchange ?? 0}
        </strong>
      </p>
      <p><b>🍗 Protein / 蛋白质:</b></p>
      {isEditing ? (
  <>
    {/* FOOD */}
    <select
      value={editingMeal.protein_food}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          protein_food: e.target.value,
          protein_portion: "None"
        })
      }
    >
      {Object.keys(proteinMap).map((p, i) => (
        <option key={i} value={p}>{p}</option>
      ))}
    </select>

    {/* 👇 IF Others → show input */}
    {editingMeal.protein_food === "Lain-lain / 其他" ? (
      <input
        placeholder="Nyatakan protein / 输入蛋白质"
        value={editingMeal.protein_food || ""}
        onChange={(e) =>
          setEditingMeal({
            ...editingMeal,
            protein_food: e.target.value
          })
        }
      />
    ) : (
      /* 👇 NORMAL portion dropdown */
      editingMeal.protein_food !== "None" && (
        <select
          value={editingMeal.protein_portion}
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              protein_portion: e.target.value
            })
          }
        >
          {(proteinMap[editingMeal.protein_food] || []).map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      )
    )}
  </>
) : (
  <p>🍗 Protein: {meal.protein_food || "-"} ({meal.protein_portion || "-"})</p>
)}
<br />
      {/* 🥬 VEGETABLES */}
<p><b>🥬 Sayur-sayuran / 蔬菜:</b></p>

{isEditing ? (
  <>
    <select
      value={editingMeal.veg_portion || "Tiada / 无"}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          veg_portion: e.target.value
        })
      }
    >
      <option value="Tiada / 无">Tiada / 无</option>
      <option value="1/2 cawan/senduk / 半杯/勺">1/2 cawan/senduk / 半杯/勺</option>
      <option value="1 cawan/senduk / 1杯/勺">1 cawan/senduk / 1杯/勺</option>
      <option value="1 1/2 cawan/senduk / 1杯半/勺">1 1/2 cawan/senduk / 1杯半/勺</option>
      <option value="2 cawan/senduk / 2杯/勺">2 cawan/senduk / 2杯/勺</option>
      <option value="3 cawan/senduk / 3杯/勺">3 cawan/senduk / 3杯/勺</option>
      <option value="1 sudu besar / 1大匙">1 sudu besar / 1大匙</option>
      <option value="2 sudu besar / 2大匙">2 sudu besar / 2大匙</option>
      <option value="3 sudu besar / 3大匙">3 sudu besar / 3大匙</option>
      <option value="Lain-lain / 其他">Lain-lain / 其他</option>
    </select>

    {/* 👇 IF Others → allow input */}
    {editingMeal.veg_portion === "Lain-lain / 其他" && (
      <input
        type="text"
        placeholder="Nyatakan sayur / 输入蔬菜份量"
        value={editingMeal.veg_other || ""}
        onChange={(e) =>
          setEditingMeal({
            ...editingMeal,
            veg_other: e.target.value
          })
        }
      />
    )}
  </>
) : (
  <p>
    🥬 Vegetables:{" "}
    {meal.veg_portion === "Lain-lain / 其他"
      ? meal.veg_other || "Lain-lain / 其他"
      : meal.veg_portion || "-"}
  </p>
)}
<p><b>🍊 Buah-buahan / 水果:</b></p>
      {isEditing ? (
  <>
    {/* FRUIT TYPE */}
    <select
      value={editingMeal.fruit}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          fruit: e.target.value,
          fruit_portion: "None"
        })
      }
    >
      {Object.keys(fruitMap).map((f, i) => (
        <option key={i} value={f}>{f}</option>
      ))}
    </select>

    {/* FRUIT PORTION */}
    {editingMeal.fruit !== "None" && (
      <select
        value={editingMeal.fruit_portion}
        onChange={(e) =>
          setEditingMeal({
            ...editingMeal,
            fruit_portion: e.target.value
          })
        }
      >
        {(fruitMap[editingMeal.fruit] || []).map((p, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>
    )}
  </>
) : (
  <p>
    🍎 Fruit: {meal.fruit || "None"}{" "}
    {meal.fruit_portion && `(${meal.fruit_portion})`}
  </p>
)}

<p>
  🍏 Fruit Exchange:{" "}
  <strong style={{ color: "orange" }}>
    {isEditing ? liveFruitExchange : (meal.fruit_exchange ?? 0)}
  </strong>
</p>
{/* 🥤 DRINK */}
<p><b>🥤 Drink / 饮料:</b></p>

{isEditing ? (
  <>
    <select
      value={drinkOptions.includes(editingMeal.drink)
        ? editingMeal.drink
        : "Tiada / 无"}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          drink: e.target.value
        })
      }
    >
      {drinkOptions.map((d, i) => (
        <option key={i} value={d}>{d}</option>
      ))}
    </select>

    {/* 👇 ONLY if Others */}
    {editingMeal.drink === "Lain-lain / 其他" && (
      <input
        type="text"
        placeholder="Nyatakan minuman / 输入饮料"
        value={editingMeal.drink_other || ""}
        onChange={(e) =>
          setEditingMeal({
            ...editingMeal,
            drink_other: e.target.value
          })
        }
      />
    )}
  </>
) : (
  <p>
    🥤 Drink:{" "}
    {meal.drink === "Lain-lain / 其他"
      ? meal.drink_other || "Lain-lain / 其他"
      : meal.drink || "-"}
  </p>
)}
<p>🎯 Had Karbohidrat/ 碳水化合物上限: {maxCarb}</p>

<p style={{
  color: totalExchange > maxCarb ? "red" : "green"
}}>
  🔥 Jumlah Pengambilan karbohidrat/总碳水摄取量: {totalExchange}
</p>
<p>{totalExchange > maxCarb
    ? "⚠ Melebihi had / 超出目标"
    : "✅ Dalam had / 在目标内"}
</p>
      {/* ✅ FINAL STEP */}
     <p>
  Gula puasa / 空腹血糖:{" "}
  <strong style={{ color: getColor(fastingStatus) }}>
    {fasting
      ? `${fasting.glucose_value} (${fastingStatus})`
      : "Tiada / 无"}
  </strong>
</p>

<p>
  Gula sebelum makan / 餐前血糖:{" "}
  <strong style={{ color: getColor(beforeStatus) }}>
    {before
      ? `${before.glucose_value} (${beforeStatus})`
      : "Tiada / 无"}
  </strong>
</p>

<p>
  Gula selepas makan / 餐后血糖:{" "}
  <strong style={{ color: getColor(afterStatus) }}>
    {after
      ? `${after.glucose_value} (${afterStatus})`
      : "Tiada / 无"}
  </strong>
</p>
     
<p>
  Ulasan Pemakanan / 饮食评估:{" "}
  <strong style={{
    color: meal.meal_score?.includes("perlu") ? "red" : "green"
  }}>
    {meal.meal_score || "Tiada / 无"}
  </strong>
</p>
<button onClick={() => setEditingMeal(meal)}>
  ✏️ Edit
</button>
    </div>
  );
})}
{editingMeal && (
  <AddMeal
    existingMeal={editingMeal}
    refresh={fetchMeals}
    onSave={() => setEditingMeal(null)}
  />
)}
    </div>
  );
}