export const vegToCupMap = {
  "Tiada / 无": 0,

  "1/2 cawan/senduk / 半杯/勺": 0.5,
  "1 cawan/senduk / 1杯/勺": 1,
  "1 1/2 cawan/senduk / 1杯半/勺": 1.5,
  "2 cawan/senduk / 2杯/勺": 2,
  "3 cawan/senduk / 3杯/勺": 3,

  "1 sudu besar / 1大匙": 0.15,
  "2 sudu besar / 2大匙": 0.3,
  "3 sudu besar / 3大匙": 0.5,
};
export function getMealIssues({
  carb,
  carb_min,
  carb_max,
  veg,
  vegToCupMap,
  profile,
  require_protein,
  hasProtein,
  avoid_sugary_drink,
  isSugaryDrink
}) {
  const issues = [];
  const minCarb = profile?.carb_min ?? 1;
const maxCarb = profile?.carb_max ?? 4;

if (carb > maxCarb) {
  issues.push("Karbohidrat berlebihan / 碳水摄取量过多");
}
 const vegAmount = vegToCupMap[veg] || 0;
  if (profile?.veg_min_cup && vegAmount < profile.veg_min_cup) {
    issues.push("Perlu tingkatkan pengambilan serat (sayur-sayuran) / 多添加纤维（蔬菜）");
  }

  if (require_protein && !hasProtein) {
    issues.push("Sila tambahkan sumber protein / 请添加蛋白质食物");
  }

  if (avoid_sugary_drink && isSugaryDrink) {
    issues.push("Sila kurangkan pengambilan minuman bergula / 请减少含糖饮料");
  }
  return issues;
}