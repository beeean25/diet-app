import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function GlucoseForm({ refresh }) {
  const [glucoseValue, setGlucoseValue] = useState("");
  const [glucoseTime, setGlucoseTime] = useState("");
  const [glucoseDate, setGlucoseDate] = useState("");
  const [note, setRemark] = useState("");
  const [timing, setTiming] = useState("Sebelum makan / 餐前");
  
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
const saveGlucose = async () => {
    if (!glucoseValue) {
    alert("Please enter glucose value / 请输入血糖值");
    return;
  }

  if (!glucoseTime) {
    alert("Please select time / 请选择时间");
    return;
  }

  const finalGlucose = Number(glucoseValue);

   const glucoseFlag = detectGlucoseStatus(glucoseValue, timing);

  const { data: userData } = await supabase.auth.getUser();

const cleanTime = glucoseTime ? glucoseTime.slice(0,5) : "";
const payload = {
  user_id: userData?.user?.id,
  glucose_value: finalGlucose,
  glucose_time: cleanTime,
  glucose_date: glucoseDate,
  timing: timing,
  glucose_flag: glucoseFlag
};

console.log("PAYLOAD:", payload);

const { data, error } = await supabase
  .from("glucose_logs")
  .insert([payload]);

console.log("INSERT DATA:", data);
console.log("INSERT ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Saved / 已保存");
  refresh();   // ✅ ADD THIS
};

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Paras Gula Darah / 血糖记录</h3>

      <input
        placeholder="Nilai gula (mmol/L) / 血糖值"
        onChange={(e)=>setGlucoseValue(e.target.value)}
      />

      <br/><br/>

      <input type="date" onChange={(e)=>setGlucoseDate(e.target.value)} />

      <br/><br/>

      <input type="time" onChange={(e)=>setGlucoseTime(e.target.value)} />

      <br/><br/>

     <select value={timing} onChange={(e)=>setTiming(e.target.value)}>
  <option value="Sebelum makan / 餐前">Sebelum makan / 餐前</option>
  <option value="Selepas makan / 餐后">Selepas makan / 餐后</option>
  <option value="Puasa / 空腹">Puasa / 空腹</option>
</select>

      <br/><br/>

      <button onClick={saveGlucose}>Simpan / 保存</button>
    </div>
  );
}