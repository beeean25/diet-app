import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import AddMeal, {
  carbMap,
  fruitMap,
  fruitExchangeMap,
  proteinMap,
  drinkOptions,
  sugarExchangeMap,
  milkExchangeMap,
  drinkBaseExchangeMap,
  calculateCarbExchange
} from "./AddMeal";
import GlucoseForm from "./GlucoseForm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

export default function Dashboard({ user, profile }) {
  const [meals, setMeals] = useState([]);
  const [glucoseLogs, setGlucoseLogs] = useState([]);
 const [editingMeal, setEditingMeal] = useState(null);
const [selectedDate, setSelectedDate] = useState("");
  const fetchMeals = useCallback(async () => {
    console.log("🚀 fetchMeals START");
    const { data,error } = await supabase
      .from("meals")
      .select(`
  id,
  meal_type,
  date,
  time,
  glucose_flag,

  carb_food,
  carb_portion,

  carb_food2,
  carb_portion2,

  carb_food3,
  carb_portion3,

  carb_exchange,

  protein_food,
  protein_portion,

  veg_portion,

  fruit,
  fruit_portion,
  fruit_exchange,

  total_exchange,

  drink,
drink_exchange,
drink_sugar,
drink_milk,
  meal_score
`)
      .eq("user_id", user?.id)
      .order("date", { ascending: false });
       console.log("📦 DATA:", data);
  console.log("❌ ERROR:", error);

  if (error) {
    console.log("🔥 ERROR FOUND:", error.message);
    return;
  }

    setMeals(data || []);
    
 }, [user]);

  const fetchGlucose = useCallback(async () => {
    const { data } = await supabase
      .from("glucose_logs")
      .select("*")
      .eq("user_id", user?.id)
     .order("glucose_date", { ascending: false })
    .order("glucose_time", { ascending: false })

    setGlucoseLogs(data || []);
  }, [user]);

  useEffect(() => {
  if (user?.id) {
    fetchMeals();
    fetchGlucose();
  }
}, [user, fetchMeals, fetchGlucose]);
useEffect(() => {
  const today = new Date().toISOString().split("T")[0];
  setSelectedDate(today);
}, []);
useEffect(() => {
  console.log("UPDATED GLUCOSE LOGS:", glucoseLogs);
}, [glucoseLogs]);
  // =========================
// 🩸 GLUCOSE STATUS FUNCTION (ADD HERE)
// =========================
function detectGlucoseStatus(value, timing) {
  const glucose = Number(value);

  const isBefore =
    timing === "before" ||
    timing?.toLowerCase().includes("sebelum");

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
// 📊 MATCH GLUCOSE WITH MEAL
// =========================
function getMealGlucose(meal) {
  if (!glucoseLogs || glucoseLogs.length === 0) return {};

  // filter same day
  const sameDayLogs = glucoseLogs.filter(
    (g) => new Date(g.glucose_date).toDateString() === new Date(meal.date).toDateString()
  );
console.log("=== DEBUG START ===");
console.log("MEAL:", meal.date, meal.time);
console.log("ALL LOGS:", glucoseLogs);
console.log("SAME DAY LOGS:", sameDayLogs);
  // BEFORE candidates
  const beforeCandidates = sameDayLogs.filter((g) =>
  g.timing?.toLowerCase().includes("sebelum") ||
  g.timing?.toLowerCase().includes("before")
);

  let before = null;
let minBeforeDiff = Infinity;

beforeCandidates.forEach((g) => {
  const gTime = new Date(`${g.glucose_date}T${g.glucose_time}`);
  const mealTime = new Date(`${meal.date}T${meal.time}`);

  const diff = (mealTime - gTime) / 60000; // minutes

  if (diff >= 0 && diff <= 200 && diff < minBeforeDiff) {
    minBeforeDiff = diff;
    before = g;
  }
});

  let after = null;
let minAfterDiff = Infinity;
console.log("BEFORE CANDIDATES:", beforeCandidates);
const afterCandidates = sameDayLogs.filter((g) =>
  g.timing?.toLowerCase().includes("selepas") ||
  g.timing?.toLowerCase().includes("after")
);
afterCandidates.forEach((g) => {
  const gTime = new Date(`${g.glucose_date}T${g.glucose_time}`);
  const mealTime = new Date(`${meal.date}T${meal.time}`);

  const diff = (gTime - mealTime) / 60000; // minutes

  if (diff >= 0 && diff <= 200 && diff < minAfterDiff) {
    minAfterDiff = diff;
    after = g;
  }
});
console.log("AFTER CANDIDATES:", afterCandidates);
  const fastingCandidates = sameDayLogs.filter(
  (g) =>
    g.timing?.toLowerCase().includes("puasa")
);

  const fasting = fastingCandidates[0]; 
console.log("SELECTED BEFORE:", before);
console.log("SELECTED AFTER:", after);
console.log("=== DEBUG END ===");

console.log("FINAL BEFORE:", before?.id);
console.log("FINAL AFTER:", after?.id);
console.log("FINAL FASTING:", fasting?.id);

  return { before, after, fasting };
}

  // 📈 FILTERED GLUCOSE DATA
const glucoseChartData = [
  // 🔵 glucose data
  ...glucoseLogs
    .filter((g) => (selectedDate ? g.glucose_date === selectedDate : true))
    .map((g) => ({
      time: g.glucose_time.slice(0, 5),
      value: Number(g.glucose_value),
      type: "glucose"
    })),

  // 🔴 meal time (inject into chart)
  ...meals
  .filter((m) => (
    selectedDate
      ? m.date === selectedDate
      : true
  ))
  .map((m) => ({
    time: m.time.slice(0, 5),

    value: null,

    type: "meal",

    mealMarker: true,

    totalCarb:
      Number(m.carb_exchange || 0) +
      Number(m.fruit_exchange || 0) +
      Number(m.drink_exchange || 0),

    mealType: m.meal_type
  }))
]
.sort((a, b) =>
  new Date(`2020-01-01T${a.time}`) -
  new Date(`2020-01-01T${b.time}`)
);

// 📊 CHECK IF DATA EXISTS
const hasData = glucoseChartData.length > 0;

// 🍽 MEAL TIMES (for red lines)
const mealTimes = meals
  .filter((m) => (selectedDate ? m.date === selectedDate : true))
  .map((m) => m.time.slice(0, 5));
console.log("MEAL TIMES:", mealTimes);
console.log("CHART TIMES:", glucoseChartData.map(d => d.time));
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard / 仪表板</h2>

      <GlucoseForm
  user={user}   // 👈 ADD THIS
  refresh={() => {
    fetchGlucose();
    fetchMeals();
  }}
/>
{!editingMeal && (
  <AddMeal user={user} 
  profile={profile} 
  refresh={fetchMeals} />
)}  
{/* 📅 DATE FILTER */}
<div style={{ marginTop: 10, marginBottom: 10 }}>
  <label>📅 Pilih tarikh / 选择日期: </label>
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
  />
</div>

{/* 📈 GLUCOSE TREND */}
<h4>📈 Trend Glukosa / 血糖趋势</h4>

{!hasData ? (
  <p style={{ color: "gray" }}>
    ⚠ Tiada data untuk tarikh ini / 此日期没有数据
  </p>
) : (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={glucoseChartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
  dataKey="time"
  allowDuplicatedCategory={false}
/>
      <YAxis />
      <Tooltip />

      {/* 🔴 MEAL TIME MARKERS */}
      {meals
  .filter((m) =>
    selectedDate
      ? m.date === selectedDate
      : true
  )
  .map((meal, i) => (
    <ReferenceLine
      key={i}
      x={meal.time.slice(0, 5)}
          stroke="red"
          strokeWidth={2}     // 👈 ADD THIS
          label={{
          value: `${meal.meal_type || ""} (${
  Number(meal.carb_exchange || 0) +
  Number(meal.fruit_exchange || 0) +
  Number(meal.drink_exchange || 0)
} EX)`,
          position: "insideTop",
         fill: "red",
         fontSize: 11
}}
        />
      ))}

      <Line
  type="monotone"
  dataKey="value"
  stroke="#8884d8"
  connectNulls
   dot={{ r: 4 }}
/>
    </LineChart>
  </ResponsiveContainer>
)}
      <h3>Hidangan / 餐点记录</h3>

{meals
  .filter((meal) => {
    if (!selectedDate) return true;
    return meal.date === selectedDate;
  })
  .map((meal) => {
   console.log("MEAL DATA:", meal);
  const isEditing = editingMeal?.id === meal.id;
  if (isEditing) {
  console.log("Selected Protein:", editingMeal.protein_food);
  console.log("Available Portions:", proteinMap[editingMeal.protein_food]);
}
const liveCarbExchange =
  isEditing &&
  editingMeal.carb_food &&
  editingMeal.carb_portion
    ? calculateCarbExchange(
        editingMeal.carb_food,
        editingMeal.carb_portion
      )
    : meal.carb_exchange || 0;  
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
const liveDrinkExchange =
  isEditing
    ? (
        Number(
          drinkBaseExchangeMap[
            editingMeal?.drink
          ] || 0
        ) +

        Number(
          sugarExchangeMap[
            editingMeal?.drink_sugar
          ] || 0
        ) +

        Number(
          milkExchangeMap[
            editingMeal?.drink_milk
          ] || 0
        )
      )
    : Number(meal.drink_exchange || 0);

const totalExchange =
  isEditing
    ? (
        Number(
          calculateCarbExchange(
            editingMeal.carb_food,
            editingMeal.carb_portion
          )
        ) +

        Number(
          calculateCarbExchange(
            editingMeal.carb_food2,
            editingMeal.carb_portion2
          )
        ) +

        Number(
          calculateCarbExchange(
            editingMeal.carb_food3,
            editingMeal.carb_portion3
          )
        ) +

        Number(
          fruitExchangeMap?.[
            editingMeal.fruit
          ]?.[
            editingMeal.fruit_portion
          ] || 0
        )
        + Number(liveDrinkExchange || 0)
      )

    : Number(meal.total_exchange || 0);

const maxCarb = profile?.carb_max || 3;
const saveInlineEdit = async () => {

const mealData = {
  meal_type: editingMeal.meal_type,
  date: editingMeal.date,
  time: editingMeal.time,

  carb_food: editingMeal.carb_food,
  carb_portion: editingMeal.carb_portion,

  carb_food2: editingMeal.carb_food2,
carb_portion2: editingMeal.carb_portion2,

carb_food3: editingMeal.carb_food3,
carb_portion3: editingMeal.carb_portion3,

  carb_exchange:
  Number(
    calculateCarbExchange(
      editingMeal.carb_food,
      editingMeal.carb_portion
    )
  ) +

  Number(
    calculateCarbExchange(
      editingMeal.carb_food2,
      editingMeal.carb_portion2
    )
  ) +

  Number(
    calculateCarbExchange(
      editingMeal.carb_food3,
      editingMeal.carb_portion3
    )
  ),

  protein_food: editingMeal.protein_food,
  protein_portion: editingMeal.protein_portion,

  veg_portion:
    editingMeal.veg_portion === "Lain-lain / 其他"
      ? editingMeal.veg_other
      : editingMeal.veg_portion,

  fruit: editingMeal.fruit,
  fruit_portion: editingMeal.fruit_portion,

  fruit_exchange: Number(
  fruitExchangeMap?.[editingMeal.fruit]?.[
    editingMeal.fruit_portion
  ] || 0
),
total_exchange:
  (
    Number(
      calculateCarbExchange(
        editingMeal.carb_food,
        editingMeal.carb_portion
      )
    ) +

    Number(
      calculateCarbExchange(
        editingMeal.carb_food2,
        editingMeal.carb_portion2
      )
    ) +

    Number(
      calculateCarbExchange(
        editingMeal.carb_food3,
        editingMeal.carb_portion3
      )
    )
  ) +

  Number(
    fruitExchangeMap?.[
      editingMeal.fruit
    ]?.[
      editingMeal.fruit_portion
    ] || 0
  ) +

  Number(
    drinkBaseExchangeMap[
      editingMeal.drink
    ] || 0
  ) +

  Number(
    sugarExchangeMap[
      editingMeal.drink_sugar
    ] || 0
  ) +

  Number(
    milkExchangeMap[
      editingMeal.drink_milk
    ] || 0
  ),

drink:
  editingMeal.drink === "Lain-lain / 其他"
    ? editingMeal.drink_other
    : editingMeal.drink,

drink_exchange:
  Number(
    drinkBaseExchangeMap[
      editingMeal.drink
    ] || 0
  ) +

  Number(
    sugarExchangeMap[
      editingMeal.drink_sugar
    ] || 0
  ) +

  Number(
    milkExchangeMap[
      editingMeal.drink_milk
    ] || 0
  ),

drink_sugar:
  editingMeal.drink_sugar,

drink_milk:
  editingMeal.drink_milk,
};

const { data: mealUpdateData, error } = await supabase
  .from("meals")
  .update(mealData)
  .eq("id", editingMeal.id)
  .select();
console.log("SAVE CONTINUES");
console.log(
  "MEAL UPDATE DATA:",
  mealUpdateData
);

console.log(
  "MEAL UPDATE ERROR:",
  error
);
console.log("REACHED AFTER MEAL UPDATE");
  if (error) {
    alert(error.message);
    return;
  }
if (
  before &&
  before.id &&
  editingMeal.before_value !== undefined
) {

  const { data, error } = await supabase
    .from("glucose_logs")
    .update({
      glucose_value: Number(editingMeal.before_value),
      glucose_flag: detectGlucoseStatus(
        editingMeal.before_value,
        before.timing
      )
    })
    .eq("id", before.id)
    .select();

  console.log("BEFORE UPDATE DATA:", data);
  console.log("BEFORE UPDATE ERROR:", error);

  if (error) {
    alert(error.message);
  }
}
if (
  after &&
  after.id &&
  editingMeal.after_value !== undefined
) {

  const { data, error } = await supabase
    .from("glucose_logs")
    .update({
      glucose_value: Number(editingMeal.after_value),

      glucose_flag: detectGlucoseStatus(
        editingMeal.after_value,
        after.timing
      )
    })
    .eq("id", after.id)
    .select();

  console.log("AFTER UPDATE DATA:", data);
  console.log("AFTER UPDATE ERROR:", error);

  if (error) {
    alert(error.message);
  }
}
if (
  fasting &&
  fasting.id &&
  editingMeal.fasting_value !== undefined
) {

const { data, error } = await supabase
    .from("glucose_logs")
    .update({
      glucose_value: Number(editingMeal.fasting_value),
glucose_flag: detectGlucoseStatus(
  editingMeal.fasting_value,
  fasting.timing
)
    })
   .eq("id", fasting.id)
    .select();

  console.log("FASTING UPDATE DATA:", data);
  console.log("FASTING UPDATE ERROR:", error);

  if (error) {
    alert(error.message);
  }
}

  await fetchGlucose();
await fetchMeals();

  setEditingMeal(null);

  alert("Updated / 已更新");

};
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
      <p><b>⚡ Karbohidrat / 碳水:</b></p>
     {isEditing ? (
  <>
    <select
      value={editingMeal.carb_food}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          carb_food: e.target.value,
          carb_portion: "Sila pilih / 请选择"
        })
      }
    >
      {Object.keys(carbMap).map((c, i) => (
        <option key={i} value={c}>{c}</option>
      ))}
    </select>

    <select
      value={
  editingMeal.carb_portion === "None"
    ? "Sila pilih / 请选择"
    : editingMeal.carb_portion
}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          carb_portion: e.target.value
        })
      }
    >
      <option value="Sila pilih / 请选择">
  Sila pilih / 请选择
</option>
      {(carbMap[editingMeal.carb_food] || []).map((p, i) => (
        <option key={i} value={p}>{p}</option>
      ))}
    </select>

    {/* 🍚 CARB 2 */}
    {editingMeal.carb_food2 &&
     editingMeal.carb_food2 !== "None" && (
      <>
        <h5>🍚 Carb 2</h5>

        <select
          value={
  editingMeal.carb_portion === "None"
    ? "Sila pilih / 请选择"
    : editingMeal.carb_portion
}
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              carb_food2: e.target.value,
              carb_portion2: "Sila pilih / 请选择"
            })
          }
        >
          {Object.keys(carbMap).map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={editingMeal.carb_portion2}
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              carb_portion2: e.target.value
            })
          }
        >
          <option value="Sila pilih / 请选择">
  Sila pilih / 请选择
</option>
          {(carbMap[editingMeal.carb_food2] || []).map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>
      </>
    )}
        {/* 🍚 CARB 3 */}
    {editingMeal.carb_food3 &&
     editingMeal.carb_food3 !== "None" && (
      <>
        <h5>🍚 Carb 3</h5>

        <select
          value={
  editingMeal.carb_portion3 === "None"
    ? "Sila pilih / 请选择"
    : editingMeal.carb_portion3
}
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              carb_food3: e.target.value,
              carb_portion3: "Sila pilih / 请选择"
            })
          }
        >
          {Object.keys(carbMap).map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={editingMeal.carb_portion3}
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              carb_portion3: e.target.value
            })
          }
        >
          <option value="Sila pilih / 请选择">
  Sila pilih / 请选择
</option>
          {(carbMap[editingMeal.carb_food3] || []).map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>
      </>
    )}
  </>
  
) : (
  <>
    <p>
      🍚1: {meal.carb_food}
      ({meal.carb_portion})
    </p>

    {meal.carb_food2 &&
      meal.carb_food2 !== "None" && (
        <p>
          🍚2: {meal.carb_food2}
          ({meal.carb_portion2})
        </p>
    )}

    {meal.carb_food3 &&
      meal.carb_food3 !== "None" && (
        <p>
          🍚3: {meal.carb_food3}
          ({meal.carb_portion3})
        </p>
    )}

    <p>
      🧮 Pertukaran Karbohidrat Makanan Utama/ 主食碳水换算分量:{" "}

  <strong style={{ color: "orange" }}>
    {isEditing
      ? liveCarbExchange
      : (meal.carb_exchange ?? 0)}
  </strong>
</p>
<p
  style={{
    fontSize: "12px",
    color: "#666",
    marginTop: "-5px"
  }}
>
  💡 Nasi goreng, mi goreng, mihun goreng atau makanan berkuah/bersos/bersalut tepung mungkin mengandungi karbohidrat tambahan.
  <br />
  炒饭、炒面、炒米粉或含酱汁/汤汁/裹面粉的食物可能含有额外碳水化合物。
</p>
  </>
  )}

      <p><b>💪 Protein / 蛋白质:</b></p>
      {isEditing ? (
  <>
    {/* FOOD */}
    <select
      value={editingMeal.protein_food}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          protein_food: e.target.value,
          protein_portion: "Sila Pilih / 请选择"
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
          <option value="Sila pilih / 请选择">
  Sila pilih / 请选择
</option>
          {(proteinMap[editingMeal.protein_food] || []).map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      )
    )}
  </>
) : (
  <p>🍗: {meal.protein_food || "-"} ({meal.protein_portion || "-"})</p>
)}
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
    🥗:{" "}
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
          fruit_portion: "Sila pilih / 请选择"
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
        <option value="Sila pilih / 请选择">
  Sila pilih / 请选择
</option>
        {(fruitMap[editingMeal.fruit] || []).map((p, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>
    )}
  </>
) : (
  <p>
    🍎: {meal.fruit || "None"}{" "}
    {meal.fruit_portion && `(${meal.fruit_portion})`}
  </p>
)}

<p>
  🧮 Pertukaran Karbohidrat Buah-buahan / 水果碳水换算分量:{" "}
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
 {[
      "Teh/Kopi / 茶/咖啡",
      "Minuman coklat atau bermalta / 巧克力或麦芽饮料"
    ].includes(editingMeal.drink) && (
      <>
        <p>🍬 Gula / 糖</p>

        <select
          value={
            editingMeal.drink_sugar ||
            "Tiada gula / 无糖"
          }
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              drink_sugar: e.target.value
            })
          }
        >
          {Object.keys(sugarExchangeMap).map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        <p>🥛 Susu / 奶类</p>

        <select
          value={
            editingMeal.drink_milk ||
            "Tiada susu / 无奶"
          }
          onChange={(e) =>
            setEditingMeal({
              ...editingMeal,
              drink_milk: e.target.value
            })
          }
        >
          {Object.keys(milkExchangeMap).map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>
      </>
    )}
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
  <>
    <p>
  🥤 Drink:{" "}
  {meal.drink === "Lain-lain / 其他"
    ? meal.drink_other || "Lain-lain / 其他"
    : meal.drink || "-"}
</p>

{meal.drink_sugar &&
 meal.drink_sugar !== "Tiada gula / 无糖" && (
  <p>
    🍬 Gula / 糖:
    {meal.drink_sugar}
  </p>
)}

{meal.drink_milk &&
 meal.drink_milk !== "Tiada susu / 无奶" && (
  <p>
    🥛 Susu / 奶类:
    {meal.drink_milk}
  </p>
)}

<p>
  🥤🧮 Pertukaran Karbohidrat Minuman /
  饮料碳水换算:
  <strong style={{ color: "orange" }}>
    {" "}
    {meal.drink_exchange || 0}
  </strong>
</p>
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
    </>
)}

{isEditing && (
  <div style={{ marginTop: 10, marginBottom: 10 }}>

    <button onClick={saveInlineEdit}>
      💾 Save
    </button>

    <button
      onClick={() => setEditingMeal(null)}
      style={{ marginLeft: 10 }}
    >
      ❌ Cancel
    </button>

  </div>
)}
      {/* ✅ FINAL STEP */}
     <p>
  Gula puasa / 空腹血糖:{" "}

  {isEditing ? (

    <input
      type="number"
      step="0.1"
      value={
  editingMeal.fasting_value ??
  fasting?.glucose_value ??
  ""
}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          fasting_value: e.target.value
        })
      }
      style={{ width: 80 }}
    />

  ) : (

    <strong style={{ color: getColor(fastingStatus) }}>
      {fasting
        ? `${fasting.glucose_value} (${fastingStatus})`
        : "Tiada / 无"}
    </strong>

  )}
</p>

<p>
  Gula sebelum makan / 餐前血糖:{" "}

  {isEditing ? (

    <input
      type="number"
      step="0.1"
      value={
  editingMeal.before_value ??
  before?.glucose_value ??
  ""
}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          before_value: e.target.value
        })
      }
      style={{ width: 80 }}
    />

  ) : (

    <strong style={{ color: getColor(beforeStatus) }}>
      {before
        ? `${before.glucose_value} (${beforeStatus})`
        : "Tiada / 无"}
    </strong>

  )}
</p>

<p>
  Gula selepas makan / 餐后血糖:{" "}

  {isEditing ? (

    <input
      type="number"
      step="0.1"
      value={
  editingMeal.after_value ??
  after?.glucose_value ??
  ""
}
      onChange={(e) =>
        setEditingMeal({
          ...editingMeal,
          after_value: e.target.value
        })
      }
      style={{ width: 80 }}
    />

  ) : (

    <strong style={{ color: getColor(afterStatus) }}>
      {after
        ? `${after.glucose_value} (${afterStatus})`
        : "Tiada / 无"}
    </strong>

  )}
</p>
     
<p>
  ⭐Ulasan Pemakanan / 饮食评估:{" "}
  <strong style={{
    color: meal.meal_score?.includes("perlu") ? "red" : "green"
  }}>
    {meal.meal_score || "Tiada / 无"}
  </strong>
</p>
{!isEditing && (
  <button
    onClick={() =>
      setEditingMeal({
        ...meal,

        before_value:
          before?.glucose_value ?? "",

        after_value:
          after?.glucose_value ?? "",

        fasting_value:
          fasting?.glucose_value ?? ""
      })
    }
  >
    ✏️ Edit
  </button>
)}
    </div>
  );
})}
    </div>
  );
}