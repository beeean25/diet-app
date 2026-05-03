import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function MealList() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setMeals(data);
  };

  return (
    <div>
      <h3>Rekod Diet / 用餐记录</h3>

      {meals.map((meal) => (
        <div key={meal.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          
          <p><b>Type:</b> {meal.meal_type}</p>
          <p><b>Carb:</b> {meal.carb_exchange}</p>
          <p><b>Score:</b> {meal.meal_score}</p>

          {/* ✅ THIS IS WHAT YOU WANT */}
          <p><b>Glucose:</b> {meal.glucose_flag || "No Data / 无数据"}</p>

        </div>
      ))}

    </div>
  );
}