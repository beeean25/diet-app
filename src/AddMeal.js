 import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { getMealIssues, vegToCupMap } from "./mealUtils";
// =========================
  // 🍚 CARBOHYDRATE (FULL + GROUPED)
  // =========================
  export const carbMap = {
    "None": ["Tiada / 无"],

    // GRAINS
    "Rice / Nasi / 米饭": [
      "1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
      "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
      "2 1/2 cawan/senduk / 2杯半/勺","3 cawan/senduk / 3杯/勺",
      ">3 cawan/senduk / 超过3杯/勺","Lain-lain / 其他"
    ],
    "Noodles / Mee / 面": ["1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
      "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
      "2 1/2 cawan/senduk / 2杯半/勺","3 cawan/senduk / 3杯/勺",
      ">3 cawan/senduk / 超过3杯/勺","Lain-lain / 其他"],
    "Koay Teow / 粿条": ["1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
      "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
      "2 1/2 cawan/senduk / 2杯半/勺","3 cawan/senduk / 3杯/勺",
      ">3 cawan/senduk / 超过3杯/勺","Lain-lain / 其他"],
    "Mihun / 米粉": ["1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
      "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
      "2 1/2 cawan/senduk / 2杯半/勺","3 cawan/senduk / 3杯/勺",
      ">3 cawan/senduk / 超过3杯/勺","Lain-lain / 其他"],
    "Porridge / Bubur / 粥": ["1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺","2 cawan/senduk / 2杯/勺","Lain-lain / 其他"],
    "Pasta / 意大利面": ["1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
      "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
      "2 1/2 cawan/senduk / 2杯半/勺","3 cawan/senduk / 3杯/勺",
      ">3 cawan/senduk / 超过3杯/勺","Lain-lain / 其他"],

    // BREAD
   "Bread / Roti / 面包": ["1/2 keping / 半片","1 keping / 1片","2 keping / 2片","3 keping / 3片","4 keping / 4片","5 keping / 5片","6 keping / 6片","1 biji (bun) / 1个面包","2 biji (bun) / 2个面包","Lain-lain / 其他"],
    "Roti Canai / 印度煎饼": ["1/2 keping / 半片","1 keping / 1片","2 keping / 2片","Lain-lain / 其他"],
    "Chapati / Thosai 印度薄饼": ["1/2 keping / 半片","1 keping / 1片","2 keping / 2片","Lain-lain / 其他"],
    "Idli / 印度米糕": ["1 keping / 1片","2 keping / 2片","Lain-lain / 其他"],
    "Putu Mayam / 米线饼": ["1 keping / 1片","2 keping / 2片","Lain-lain / 其他"],
    "Biscuits / 饼干": ["1 keping / 1片","2 keping / 2片","3 keping / 3片","4 keping / 4片","5 keping / 5片","6 keping / 6片","Lain-lain / 其他"],

    // OATS
    "Oats / 燕麦": ["1 sudu makan / 1汤匙","2 sudu makan / 2汤匙","3 sudu makan / 3汤匙","1/2 cawan / 半杯","1 cawan / 1杯","Lain-lain / 其他"],
    "Cereal / 麦片": ["1 sudu makan / 1汤匙","2 sudu makan / 2汤匙","3 sudu makan / 3汤匙","1/2 cawan / 半杯","1 cawan / 1杯","Lain-lain / 其他"],

    // ROOT VEGETABLES
    "Potato / Kentang / 马铃薯": ["1 kecil / 1个小","2 kecil / 2个小","1 besar / 1个大","Lain-lain / 其他"],
    "Sweet Potato / Ubi / 番薯": ["1 kecil / 1个小","2 kecil / 2个小","1 besar / 1个大","Lain-lain / 其他"],
    "Yam / Keladi / 芋头": ["1/2 cawan / 半杯","1 cawan / 1杯","2 cawan / 2杯","Lain-lain / 其他"],
    "Pumpkin / Labu / 南瓜": ["1/2 cawan / 半杯","1 cawan / 1杯","2 cawan / 2杯","Lain-lain / 其他"],
    "Corn / Jagung / 玉米": ["1/2 kecil (6cm) / 1/2个小(6cm)","1 kecil / 1个小","2 kecil / 2个小","1 besar / 1个大","Lain-lain / 其他"],

    "Lain-lain / 其他": ["Lain-lain / 其他"]
  };
// =========================
// 🍎 FRUIT (GROUPED)
// =========================
export const fruitMap = {
  "None": ["Tiada / 无"],

  "Epal/oren/pir 苹果/橙子/梨子": [
   "1/2  kecil / 半粒（小）",
    "1 kecil / 小",
    "1/2  sederhana / 半粒（中）",
    "1 sederhana / 中",
    "1 besar / 大",
    "Lain-lain / 其他"
  ],

  "Pisang / 香蕉": [
    "1 kecil (contoh pisang mas) / 小（如米蕉）",
    "2 kecil (contoh pisang mas) / 小（如米蕉）",
    "1 sederhana / 中",
    "2 sederhana / 中",
    "1 besar / 大",
    "2 besar / 大",
    "Lain-lain / 其他"
  ],

  "Jambu batu/Buah mangga/Buah naga 番石榴/芒果/火龙果": [
    "1/2 kecil / 半颗(小)",
    "1 kecil / 1颗(小)",
    "1/2 sederhana / 半颗(中)",
    "1 sederhana / 中",
    "Lain-lain / 其他"
  ],

  "Betik/Nanas/Tembikai/Tembikai susu / 木瓜/黄梨/西瓜/蜜瓜": [
    "1/2 cawan / 半杯",
    "1 cawan / 1杯",
    "1 hiris / 1片",
    "2 hiris / 2片",
    "Lain-lain / 其他"
  ],

  "Anggur/Langsat/longan 葡萄/冷杀/龙眼": [
    "4 biji / 4粒",
    "8 biji / 8粒",
    "10 biji / 10粒",
    "16 biji / 16粒",
    "Lain-lain / 其他"
  ],

  "Kismis/buah kering (cincang) 葡萄干/果干(碎片）": [
    "1 sudu makan / 1汤匙",
    "2 sudu makan / 2汤匙",
    "3 sudu makan / 3汤匙",
  ],

  "Kurma/Prun 枣": [
    "1 biji besar/ 1粒(大）",
    "2 biji besar/ 2粒(大)",
    "3 biji besar/ 3粒(大)",
    "1 biji kecil/ 1粒(小）",
    "2 biji kecil/ 2粒(小)",
    "3 biji kecil/ 3粒(小)",
    "Lain-lain / 其他"
  ],

  "Lain-lain / 其他": [
  ]
};
// =========================
// 🍎 FRUIT → CARB EXCHANGE
// =========================
export const fruitExchangeMap = {

  "Epal/oren/pir 苹果/橙子/梨子": {
    "1/2  kecil / 半粒（小）": 0.5,
    "1 kecil / 小": 1,
    "1/2  sederhana / 半粒（中）": 0.5,
    "1 sederhana / 中": 1,
    "1 besar / 大": 1.5
  },

  "Pisang / 香蕉": {
    "1 kecil (contoh pisang mas) / 小（如米蕉）": 1,
    "2 kecil (contoh pisang mas) / 小（如米蕉）": 2,
    "1 sederhana / 中": 1.5,
    "2 sederhana / 中": 3,
    "1 besar / 大": 2,
    "2 besar / 大": 4
  },

  "Jambu batu/Buah mangga/Buah naga 番石榴/芒果/火龙果": {
    "1/2 kecil / 半颗(小)": 1,
    "1 kecil / 1颗(小)": 2,
    "1/2 sederhana / 半颗(中)": 2,
    "1 sederhana / 中": 4
  },

  "Betik/Nanas/Tembikai/Tembikai susu / 木瓜/黄梨/西瓜/蜜瓜": {
    "1/2 cawan / 半杯": 0.5,
    "1 cawan / 1杯": 1,
    "1 hiris / 1片": 1,
    "2 hiris / 2片": 2
  },

  "Anggur/Langsat/longan 葡萄/冷杀/龙眼": {
    "4 biji / 4粒": 0.5,
    "8 biji / 8粒": 1,
    "10 biji / 10粒": 1.5,
    "16 biji / 16粒": 2
  },

  "Kismis/buah kering (cincang) 葡萄干/果干(碎片）": {
    "1 sudu makan / 1汤匙": 1,
    "2 sudu makan / 2汤匙": 2,
    "3 sudu makan / 3汤匙": 3
  },

  "Kurma/Prun 枣": {
    "1 biji kecil/ 1粒(小）": 0.3,
    "2 biji kecil/ 2粒(小)": 0.6,
    "3 biji kecil/ 3粒(小)": 1,
    "1 biji besar/ 1粒(大）": 1,
    "2 biji besar/ 2粒(大)": 2,
    "3 biji besar/ 3粒(大)": 3
  }
};
// =========================
  // 🍗 PROTEIN
  // =========================
  export const proteinMap = {
    "None": ["Tiada / 无"],
    "Chicken / Ayam / 鸡": ["1 ketul / 1块","2 ketul / 2块","3 ketul / 3块","4 ketul / 4块","Lain-lain / 其他"],
    "Fish / Ikan / 鱼": ["1 ekor / 1条","1 ketul / 1块","Lain-lain / 其他"],
    "Prawn / Udang / 虾": ["1 besar / 1只大虾","2 besar / 2只大虾","1 senduk / 1勺","Lain-lain / 其他"],
    "Egg / Telur / 鸡蛋": ["1 biji / 1个","2 biji / 2个","3 biji / 3个","Lain-lain / 其他"],
    "Tofu lembut / 嫩豆腐": ["1 senduk / 1勺","2 senduk / 2勺","1 kotak / 1盒","Lain-lain / 其他"],
    "Tofu keras / 豆干": ["1 ketul / 1块","2 ketul / 2块","Lain-lain / 其他"],
    "Squid / Sotong / 鱿鱼": ["1 ekor / 1只","2 ekor / 2只","1 senduk / 1勺","Lain-lain / 其他"],
    "Anchovies / Ikan bilis / 江鱼仔": ["1 sudu makan / 1汤匙","2 sudu makan / 2汤匙","Lain-lain / 其他"],
    "Tempeh / 天贝": ["1 senduk / 1勺","2 senduk / 2勺","Lain-lain / 其他"],
    "Lain-lain / 其他": ["Lain-lain / 其他"]
  };
  export const vegOptions = [
    "Tiada / 无","1/2 cawan/senduk / 半杯/勺","1 cawan/senduk / 1杯/勺",
    "1 1/2 cawan/senduk / 1杯半/勺","2 cawan/senduk / 2杯/勺",
    "3 cawan/senduk / 3杯/勺","1 sudu besar / 1大匙",
    "2 sudu besar / 2大匙","3 sudu besar / 3大匙","Lain-lain / 其他"
  ];

  export const drinkOptions = [
    "Tiada / 无","Air kosong / 白开水","Teh/Kopi / 茶/咖啡","Teh tarik / 拉茶", "Kopi susu / 奶咖啡",
    "Kopi 3 dalam 1 / 3合1咖啡", "Kopi putih 3 dalam 1 / 3合1白咖啡", "Minuman coklat atau bermalta / 巧克力或麦芽饮料", "Minuman soya / 豆奶", "Minuman soya (tanpa gula) / 豆奶 (无添加糖)",
    "Susu kosong / 牛奶","Susu berperisa / 调味奶","Minuman berkotak / 盒装饮料","Minuman berkarbonat / 汽水","Buble tea / 珍珠奶茶","Lain-lain / 其他"
  ];
  export const sugarExchangeMap = {
  "Tiada gula / 无糖": 0,

  "1 sudu teh gula / 1茶匙糖": 0.3,

  "2 sudu teh gula / 2茶匙糖": 0.6,

  "3 sudu teh gula / 3茶匙糖": 1,

  "1 sudu makan gula / 1汤匙糖": 1,

  "1 1/2 sudu makan gula / 1汤匙半糖": 1.5,

   "2 sudu makan gula / 2汤匙糖": 2
};
export const milkExchangeMap = {
  "Tiada susu / 无奶": 0,

  "Susu segar 1/2 gelas / 鲜奶半杯": 0.5,

  "Susu segar 1 gelas / 鲜奶1杯": 1,

  "Susu tepung 1 sudu makan/ 牛奶粉1汤匙": 0.3,

  "Susu tepung 2 sudu makan/ 牛奶粉2汤匙": 0.6,

  "Susu tepung 3 sudu makan/ 牛奶粉3汤匙": 1.0,

  "Susu cair / 淡奶": 1,

  "Krimer manis 1 sudu makan/ 炼奶1汤匙": 0.5,

  "Krimer manis 2 sudu makan/ 炼奶2汤匙": 1.0,

  "Krimer manis 3 sudu makan/ 炼奶3汤匙": 1.5
};
export const drinkBaseExchangeMap = {
  "Tiada / 无": 0,

  "Air kosong / 白开水": 0,

  "Teh/Kopi / 茶/咖啡": 0,

  "Kopi 3 dalam 1 / 3合1咖啡": 1, 
  
  "Kopi putih 3 dalam 1 / 3合1白咖啡": 2,

  "Minuman coklat atau bermalta / 巧克力或麦芽饮料": 1,

  "Susu kosong / 牛奶": 1,

  "Susu berperisa / 调味奶": 2,

  "Teh tarik / 拉茶": 2,

  "Kopi susu / 奶咖啡": 2,

  "Minuman soya / 豆奶": 1,

  "Minuman soya (tanpa gula) / 豆奶 (无添加糖)":0,

  "Minuman berkotak / 盒装饮料": 1,

  "Minuman berkarbonat / 汽水": 3,

  "Bubble tea / 珍珠奶茶": 4,

  "Lain-lain / 其他": 0
};
const customizableDrinks = [
  "Teh/Kopi / 茶/咖啡",

  "Minuman coklat atau bermalta / 巧克力或麦芽饮料"
];
const carbGroupMap = {

  // 🍚 RICE GROUP (exclude porridge)
  "Rice / Nasi / 米饭": "rice",
  "Noodles / Mee / 面": "rice",
  "Koay Teow / 粿条": "rice",
  "Mihun / 米粉": "rice",
  "Pasta / 意大利面": "rice",

  // 🍲 PORRIDGE (separate)
  "Porridge / Bubur / 粥": "porridge",

  // 🍞 BREAD (separate)
  "Bread / Roti / 面包": "bread",

  // 🫓 ROTI CANAI + CHAPATI
  "Roti Canai / 印度煎饼": "roti",
  "Chapati / Thosai 印度薄饼": "roti",

  // 🍥 PUTU MAYAM + IDLI
  "Putu Mayam / 米线饼": "idli",
  "Idli / 印度米糕": "idli",

  // 🍪 BISCUITS
  "Biscuits / 饼干": "biscuit",

  // 🥣 OATS
  "Oats / 燕麦": "oats",
  "Cereal / 麦片": "oats",

  // 🥔 ROOT (separate properly)
  "Potato / Kentang / 马铃薯": "potato",
  "Sweet Potato / Ubi / 番薯": "sweet_potato",
  "Corn / Jagung / 玉米": "corn",

  // 🟡 YAM + PUMPKIN together
  "Yam / Keladi / 芋头": "yam_pumpkin",
  "Pumpkin / Labu / 南瓜": "yam_pumpkin"
};
const carbExchangeByGroup = {

  // 🍚 rice-type
  rice: {
    "1/2 cawan/senduk / 半杯/勺": 1,
    "1 cawan/senduk / 1杯/勺": 2,
    "1 1/2 cawan/senduk / 1杯半/勺": 3,
    "2 cawan/senduk / 2杯/勺": 4,
    "2 1/2 cawan/senduk / 2杯半/勺": 5,
    "3 cawan/senduk / 3杯/勺": 6,
    ">3 cawan/senduk / 超过3杯/勺": 7
  },

  // 🍲 porridge (lower density)
  porridge: {
    "1/2 cawan/senduk / 半杯/勺": 0.5,
    "1 cawan/senduk / 1杯/勺": 1,
    "2 cawan/senduk / 2杯/勺": 2
  },

  // 🍞 bread
  bread: {
    "1 keping / 1片": 1,
    "2 keping / 2片": 2,
    "3 keping / 3片": 3,
    "4 keping / 4片": 4,
    "5 keping / 5片": 5,
    "6 keping / 6片": 6,
  },

  // 🫓 roti canai / chapati
  roti: {
    "1/2 keping / 半片": 1,
    "1 keping / 1片": 2,
    "2 keping / 2片": 4
  },

  // 🍥 idli / putu mayam
  idli: {
    "1 keping / 1片": 1,
    "2 keping / 2片": 2,
    "3 keping / 3片": 3
  },

  // 🍪 biscuit
  biscuit: {
    "1 keping / 1片": 0.3,
    "2 keping / 2片": 0.6,
    "3 keping / 3片": 1,
    "4 keping / 4片": 1.3,
    "5 keping / 5片": 1.6,
    "6 keping / 6片": 2
  },

  // 🥣 oats
  oats: {
    "1 sudu makan / 1汤匙": 0.3,
    "2 sudu makan / 2汤匙": 0.6,
    "3 sudu makan / 3汤匙": 1,
    "1/2 cawan / 半杯": 1,
    "1 cawan / 1杯": 2
  },

  // 🥔 potato
  potato: {
    "1 kecil / 1个小": 1,
    "2 kecil / 2个小": 2,
    "1 besar / 1个大": 2
  },

  // 🍠 sweet potato
  sweet_potato: {
    "1 kecil / 1个小": 1,
    "2 kecil / 2个小": 2,
    "1 besar / 1个大": 2
  },

  // 🌽 corn
  corn: {
    "1/2 kecil (6cm) / 1/2个小(6cm)": 1,
    "1 kecil / 1个小": 2,
    "2 kecil / 2个小": 4,
    "1 besar / 1个大": 3
  },

  // 🎃 yam + pumpkin
  yam_pumpkin: {
    "1/2 cawan / 半杯": 1,
    "1 cawan / 1杯": 2,
    "2 cawan / 2杯": 4
  }
  
};
export function calculateCarbExchange(carb_food, carb_portion) {
  console.log("======== DEBUG START ========");
  console.log("FOOD RAW:", carb_food);
  console.log("PORTION RAW:", carb_portion);

 const cleanFood = carb_food?.trim();

const group = carbGroupMap[cleanFood];
  console.log("GROUP:", group);

  if (!group) {
    console.log("❌ FOOD NOT FOUND IN carbGroupMap");
    return 0;
  }

  const groupMap = carbExchangeByGroup[group];
  console.log("AVAILABLE PORTIONS:", Object.keys(groupMap));

  const cleanPortion = carb_portion?.trim();
  console.log("TRY MATCH:", cleanPortion);

  const value = groupMap?.[cleanPortion];

  console.log("RESULT:", value);

  console.log("======== DEBUG END ========");

  return value || 0;
}
export default function AddMeal({ 
  user, 
  profile, 
  refresh, 
  existingMeal, 
  onSave }){
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const [mealType, setMealType] = useState("Sarapan pagi （早餐）");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [carbFood, setCarbFood] = useState("Tiada / 无");
  const [carbPortion, setCarbPortion] = useState("Tiada / 无");
  const [carbFood2, setCarbFood2] = useState("Tiada / 无");
const [carbPortion2, setCarbPortion2] = useState("Tiada / 无");
const [carbFood3, setCarbFood3] = useState("Tiada / 无");
const [carbPortion3, setCarbPortion3] = useState("Tiada / 无");
  const [carbOtherFood, setCarbOtherFood] = useState("");
  const [carbOtherPortion, setCarbOtherPortion] = useState("");
  const [showCarb2, setShowCarb2] = useState(false);
const [showCarb3, setShowCarb3] = useState(false);

  const [proteinFood, setProteinFood] = useState("Tiada / 无");
  const [proteinPortion, setProteinPortion] = useState("Tiada / 无");
  const [proteinOtherFood, setProteinOtherFood] = useState("");
  const [proteinOtherPortion, setProteinOtherPortion] = useState("");

  const [vegPortion, setVegPortion] = useState("Tiada / 无");
  const [vegOther, setVegOther] = useState("");

  const [drink, setDrink] = useState("Tiada / 无");
  const [drinkSugar, setDrinkSugar] =
  useState("Tiada gula / 无糖");

const [drinkMilk, setDrinkMilk] =
  useState("Tiada susu / 无奶");
  const [drinkOther, setDrinkOther] = useState("");

  const [fruit, setFruit] = useState("Tiada / 无");
const [fruitPortion, setFruitPortion] = useState("Tiada / 无");
const [fruitOtherPortion, setFruitOtherPortion] = useState("");
  const [fruitOther, setFruitOther] = useState("");

  const [lastScore, setLastScore] = useState("");
  
  // 🔄 Reset form after save
const resetForm = () => {
  setMealType("");
  setCarbFood("");
  setCarbPortion("");
  setCarbFood2("Tiada / 无");
  setCarbPortion2("Tiada / 无");
  setCarbFood3("Tiada / 无");
  setCarbPortion3("Tiada / 无");
  setShowCarb2(false);
  setShowCarb3(false);
  setProteinFood("");
  setProteinPortion("");
  setVegPortion("");
  setFruit("Tiada / 无");
  setFruitPortion("");
  setDrink("");

  // optional fields (if you have them)
  setProteinOtherFood("");
  setProteinOtherPortion("");
  setVegOther("");
  setFruitOther("");
  setFruitOtherPortion("");
  setDrinkOther("");

  setLastScore(null);
};
useEffect(() => {
  if (existingMeal) {
    setMealType(existingMeal.meal_type || "");
    setDate(existingMeal.date || "");
    setTime(existingMeal.time || "");

    setCarbFood(existingMeal.carb_food || "Tiada / 无");
    setCarbPortion(existingMeal.carb_portion || "Tiada / 无");

    setCarbFood2(existingMeal.carb_food2 || "Tiada / 无");
    setCarbPortion2(existingMeal.carb_portion2 || "Tiada / 无");

    setCarbFood3(existingMeal.carb_food3 || "Tiada / 无");
    setCarbPortion3(existingMeal.carb_portion3 || "Tiada / 无");

    if (existingMeal.carb_food2) {
  setShowCarb2(true);
}

if (existingMeal.carb_food3) {
  setShowCarb3(true);
}
    setProteinFood(existingMeal.protein_food || "Tiada / 无");
    setProteinPortion(existingMeal.protein_portion || "Tiada / 无");

    setVegPortion(existingMeal.veg_portion || "Tiada / 无");

    setDrink(existingMeal.drink || "Tiada / 无");

    setFruit(existingMeal.fruit || "Tiada / 无");
    setFruitPortion(existingMeal.fruit_portion || "Tiada / 无");
  }
}, [existingMeal]);

  const handleLogout = async () => {
  setLoggingOut(true);

  const { error } = await supabase.auth.signOut();

  if (error) {
    alert(error.message);
    setLoggingOut(false);
  } else {
   navigate("/login");   // 👈 ADD HERE
  }
  setLoggingOut(false); 
};

// =========================
// 🚦 CUSTOM MEAL SCORING (ADVANCED)
// =========================
function getMealScore(carb, veg, protein, drink, profile) {

  if (!profile) return "No Profile / 无设置";

  const {
    carb_min,
    carb_max,
    require_protein,
    avoid_sugary_drink
  } = profile;

  const hasProtein = protein && protein !== "Tiada / 无";

  const isSugaryDrink =
    drink.includes("gula") ||
    drink.includes("tealive") ||
    drink.includes("milo") ||
    drink.includes("susu manis") ||
    drink.includes("cordial") ||
    drink.includes("coklat") ||
    drink.includes("berperisa");

const issues = getMealIssues({
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
});

  // =========================
  // FINAL SCORE
  // =========================

  if (issues.length === 0) {
    return "Seimbang / 均衡";
  }

  if (issues.length === 1) {
    return "Minor Issue / 轻微问题: " + issues[0];
  }

  return "Diet perlu penambahbaikan / 饮食需改善: " + issues.join(", ");
}
  const saveMeal = async () => {
if (!user?.id) {
    alert("User not logged in");
    return;
  }
const userId = user?.id;

  // =========================
  // ✅ HANDLE CARB (NORMAL vs OTHERS)
  // =========================
 let carbExchange;

if (carbFood === "Lain-lain / 其他") {
  carbExchange = Number(carbOtherPortion) || 0;
} else if (carbPortion === "Lain-lain / 其他") {
  carbExchange = Number(carbOtherPortion) || 0;
} else {
  carbExchange = calculateCarbExchange(carbFood, carbPortion);
}

const finalCarbFood =
  carbFood === "Lain-lain / 其他"
    ? carbOtherFood
    : carbFood;

// 🍎 FRUIT CALCULATION
let fruitCarb = 0;

if (fruitExchangeMap[fruit]) {
  fruitCarb =
    fruitExchangeMap[fruit]?.[fruitPortion] || 0;
}

if (fruitPortion === "Lain-lain / 其他") {
  fruitCarb = 1;
}

// ✅ FINAL TOTAL
const carbExchange2 =
  calculateCarbExchange(carbFood2, carbPortion2);

const carbExchange3 =
  calculateCarbExchange(carbFood3, carbPortion3);

const totalMainCarb =
  carbExchange +
  carbExchange2 +
  carbExchange3;

const baseDrinkExchange =
  Number(
    drinkBaseExchangeMap[drink] || 0
  );

const extraSugarMilkExchange =
  customizableDrinks.includes(drink)
    ? Number(
        sugarExchangeMap[drinkSugar] || 0
      ) +
      Number(
        milkExchangeMap[drinkMilk] || 0
      )
    : 0;

const drinkExchange =
  baseDrinkExchange +
  extraSugarMilkExchange;

const totalCarb =
  totalMainCarb + fruitCarb + drinkExchange;

  // =========================
  // 🚦 MEAL SCORING
  // =========================
  console.log("=== DEBUG START ===");

const mealScore = getMealScore(
  totalCarb,
  vegPortion,
  proteinFood,
  drink,
  profile
);
// =========================
// 📈 GLUCOSE DETECTION (SPIKE + TARGET)
// =========================
const { data: glucoseData } = await supabase
  .from("glucose_logs")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(10);

  console.log("TIMINGS:", glucoseData.map(g => g.timing));

let glucoseFlag = "No Data / 无数据";

if (glucoseData && glucoseData.length > 0) {

  const before = glucoseData.find(g =>
  g.timing?.includes("Sebelum")
);

const after = glucoseData.find(g =>
  g.timing?.includes("Selepas") ||
  g.timing?.includes("餐后")
);

console.log("BEFORE:", before);
console.log("AFTER:", after);

  let alerts = [];

  if (before) {
    if (before.glucose_value > 7) {
      alerts.push("High Fasting / 餐前偏高");
    } else {
      alerts.push("Fasting OK / 餐前正常");
    }
  }

  if (after) {
    if (after.glucose_value > 8.5) {
      alerts.push("High Post Meal / 餐后偏高");
    } else {
      alerts.push("Post Meal OK / 餐后正常");
    }
  }

  if (before && after) {
    const diff = after.glucose_value - before.glucose_value;
    if (diff >= 3) {
      alerts.push("Spike / 血糖升高");
    }
  }
console.log("ALERTS:", alerts);

  glucoseFlag = alerts.join(" | ");
}
// 🧪 DEBUG HERE
console.log("carbFood:", carbFood);
console.log("carbPortion:", carbPortion);
console.log("carbExchange:", carbExchange);

console.log("carbFood2:", carbFood2);
console.log("carbPortion2:", carbPortion2);
console.log("carbExchange2:", carbExchange2);

console.log("carbFood3:", carbFood3);
console.log("carbPortion3:", carbPortion3);
console.log("carbExchange3:", carbExchange3);

console.log("fruitCarb:", fruitCarb);

console.log("totalMainCarb:", totalMainCarb);
console.log("totalCarb:", totalCarb);

  // =========================
  // 💾 SAVE TO DATABASE
  // =========================
  console.log("GLUCOSE FLAG:", glucoseFlag);
let result;

if (existingMeal) {
  // ✏️ UPDATE MODE
  result = await supabase
    .from("meals")
    .update({
      meal_type: mealType,
      date,
      time,

      carb_food: finalCarbFood,
      carb_portion: carbPortion,

      carb_food2: carbFood2,
      carb_portion2: carbPortion2,

      carb_food3: carbFood3,
      carb_portion3: carbPortion3,

      carb_exchange: totalMainCarb,

      protein_food: proteinFood === "Lain-lain / 其他"
        ? proteinOtherFood
        : proteinFood,

      protein_portion: proteinFood === "Lain-lain / 其他"
        ? proteinOtherPortion
        : proteinPortion,

      veg_portion: vegPortion === "Lain-lain / 其他"
        ? vegOther
        : vegPortion,

      fruit: fruit.includes("Lain-lain")
        ? fruitOther
        : fruit,

      fruit_portion: fruit.includes("Lain-lain")
        ? fruitOtherPortion
        : fruitPortion,

      fruit_exchange: fruitCarb,
      total_exchange: totalCarb,

      drink: drink === "Lain-lain / 其他"
        ? drinkOther
        : drink,
      drink_exchange: drinkExchange,

drink_sugar: drinkSugar,

drink_milk: drinkMilk,

      glucose_flag: glucoseFlag,
      meal_score: mealScore
    })
    .eq("id", existingMeal.id);

  alert("Updated / 已更新");

} else {
  // ➕ INSERT MODE (your original code)
  result = await supabase.from("meals").insert([{
    user_id: userId,
    meal_type: mealType,
    date,
    time,

    carb_food: finalCarbFood,
    carb_portion: carbPortion,

    carb_food2: carbFood2,
  carb_portion2: carbPortion2,

  carb_food3: carbFood3,
  carb_portion3: carbPortion3,

    carb_exchange: totalMainCarb,

    protein_food: proteinFood === "Lain-lain / 其他"
      ? proteinOtherFood
      : proteinFood,

    protein_portion: proteinFood === "Lain-lain / 其他"
      ? proteinOtherPortion
      : proteinPortion,

    veg_portion: vegPortion === "Lain-lain / 其他"
      ? vegOther
      : vegPortion,

    fruit: fruit.includes("Lain-lain")
      ? fruitOther
      : fruit,

    fruit_portion: fruit.includes("Lain-lain")
      ? fruitOtherPortion
      : fruitPortion,

    fruit_exchange: fruitCarb,
    total_exchange: totalCarb,

    drink: drink === "Lain-lain / 其他"
      ? drinkOther
      : drink,

    drink_exchange: drinkExchange,

drink_sugar: drinkSugar,

drink_milk: drinkMilk,

    glucose_flag: glucoseFlag,
    meal_score: mealScore
  }]);

  alert("Berjaya simpan / 保存成功");
}

if (result.error) {
  console.log("SAVE ERROR:", result.error);

  alert(result.error.message);

  return;
}
console.log("SAVE SUCCESS");
console.log(result);

setLastScore(mealScore);

// 🔁 refresh dashboard
if (refresh) {
  refresh();
}
// 🔙 exit edit mode
if (onSave) onSave();

// ✅ clear form AFTER successful save
if (!existingMeal) {
  resetForm();
}

};
return (
    <div>

      <button onClick={handleLogout} disabled={loggingOut}>
  {loggingOut ? "Logging out..." : "Logout / 登出"}
</button>
    
      <h3>Tambah Hidangan / 添加餐点</h3>

      <input type="date" onChange={(e)=>setDate(e.target.value)} />
      <br/><br/>
      <input type="time" onChange={(e)=>setTime(e.target.value)} />
      <br/><br/>

      <h4>Jenis Hidangan / 餐类</h4>
     <select onChange={(e)=>setMealType(e.target.value)}>
      <option value="Sarapan pagi （早餐）">Sarapan pagi / 早餐</option>
      <option value="Makan tengahari （午餐）">Makan tengahari / 午餐</option>
      <option value="Makan petang/malam （晚餐）">Makan petang/malam / 晚餐</option>
      <option value="Snek （茶点）">Snek / 茶点</option>

    </select>

    <br/><br/>

      <h4>Karbohidrat / 碳水食物</h4>

{/* FOOD dropdown */}
<select
  value={carbFood}
  onChange={(e) => {
  const selectedFood = e.target.value;

  console.log("SELECT CHANGE:", selectedFood);

  setCarbFood(selectedFood);

  const firstPortion =
    (carbMap[selectedFood] || [])[0] || "";

  setCarbPortion(firstPortion);
}}
>
  {Object.keys(carbMap).map((c,i)=>(
    <option key={i} value={c}>{c}</option>
  ))}
</select>

{/* 👇 SHOW when FOOD = Others */}
{carbFood === "Lain-lain / 其他" && (
  <>
    <input
      type="text"
      placeholder="Nyatakan makanan / 输入食物"
      value={carbOtherFood}
      onChange={(e)=>setCarbOtherFood(e.target.value)}
    />

    <input
      type="number"
      placeholder="Carb exchange (contoh: 2)"
      value={carbOtherPortion}
      onChange={(e)=>setCarbOtherPortion(e.target.value)}
    />
  </>
)}

{/* 👇 NORMAL portion dropdown (only if NOT Others food) */}
{carbFood !== "Lain-lain / 其他" && (
  <>
    <select
      value={carbPortion}
      onChange={(e)=>setCarbPortion(e.target.value)}
    >
      {(carbMap[carbFood] || []).map((p,i)=>(
        <option key={i} value={p}>{p}</option>
      ))}

      {/* 👇 Others portion */}
    </select>

    {/* 👇 SHOW when portion = Others */}
    {carbPortion === "Lain-lain / 其他" && (
      <input
        type="text"
        placeholder="Nyatakan portion / 输入份量"
        value={carbOtherPortion}
        onChange={(e)=>setCarbOtherPortion(e.target.value)}
      />
    )}
    </>
)}
    <button
  type="button"
  onClick={() => setShowCarb2(true)}
>
  + Tambah Karbohidrat/添加碳水食物
</button>
{showCarb2 && (
  <>
    <h5>Karbohidrat Tambahan 2 / 碳水食物 2</h5>

    <select
      value={carbFood2}
      onChange={(e) => {
  const selectedFood = e.target.value;

  setCarbFood2(selectedFood);

  const firstPortion =
    (carbMap[selectedFood] || [])[0] || "";

  setCarbPortion2(firstPortion);
}}
    >
      {Object.keys(carbMap).map((c, i) => (
        <option key={i} value={c}>
          {c}
        </option>
      ))}
    </select>

    <select
      value={carbPortion2}
      onChange={(e) =>
        setCarbPortion2(e.target.value)
      }
    >
      {(carbMap[carbFood2] || []).map((p, i) => (
        <option key={i} value={p}>
          {p}
        </option>
      ))}
    </select>
  </>
)}
{showCarb2 && !showCarb3 && (
  <button
    type="button"
    onClick={() => setShowCarb3(true)}
  >
    + Tambah extra Karbohidrat / 再添加碳水食物
  </button>
)}
{showCarb3 && (
  <>
    <h5>Karbohidrat Tambahan 3 / 碳水食物 3</h5>

    <select
      value={carbFood3}
      onChange={(e) => {
  const selectedFood = e.target.value;

  setCarbFood3(selectedFood);

  const firstPortion =
    (carbMap[selectedFood] || [])[0] || "";

  setCarbPortion3(firstPortion);
}}
    >
      {Object.keys(carbMap).map((c, i) => (
        <option key={i} value={c}>
          {c}
        </option>
      ))}
    </select>

    <select
      value={carbPortion3}
      onChange={(e) =>
        setCarbPortion3(e.target.value)
      }
    >
      {(carbMap[carbFood3] || []).map((p, i) => (
        <option key={i} value={p}>
          {p}
        </option>
      ))}
    </select>
  </>
)}

<h4>Protein / 蛋白质</h4>

{/* FOOD dropdown */}
<select
  value={proteinFood}
  onChange={(e)=>{
    setProteinFood(e.target.value);
    setProteinPortion("None");
  }}
>
  {Object.keys(proteinMap).map((p,i)=>(
    <option key={i}>{p}</option>
  ))}
</select>

{/* 👇 SHOW when Others selected */}
{proteinFood === "Lain-lain / 其他" && (
  <>
    <input
      type="text"
      placeholder="Nyatakan protein / 输入蛋白质"
      value={proteinOtherFood}
      onChange={(e)=>setProteinOtherFood(e.target.value)}
    />

    <input
      type="text"
      placeholder="Nyatakan portion / 输入份量"
      value={proteinOtherPortion}
      onChange={(e)=>setProteinOtherPortion(e.target.value)}
    />
  </>
)}

{/* NORMAL portion dropdown */}
{proteinFood !== "Lain-lain / 其他" && (
  <>
    <select
      value={proteinPortion}
      onChange={(e)=>setProteinPortion(e.target.value)}
    >
      {(proteinMap[proteinFood] || []).map((p,i)=>(
        <option key={i}>{p}</option>
      ))}
    </select>

    {/* 👇 SHOW input when Others */}
    {proteinPortion === "Lain-lain / 其他" && (
      <input
        type="text"
        placeholder="Nyatakan portion / 输入份量"
        value={proteinOtherPortion}
        onChange={(e)=>setProteinOtherPortion(e.target.value)}
      />
    )}
  </>
)}

      <h4>Sayur / 蔬菜</h4>

<select
  value={vegPortion}
  onChange={(e)=>setVegPortion(e.target.value)}
>
  {vegOptions.map((v,i)=>(
    <option key={i}>{v}</option>
  ))}
</select>

{vegPortion === "Lain-lain / 其他" && (
  <input
    type="text"
    placeholder="Nyatakan porsi / 输入分量"
    value={vegOther}
    onChange={(e)=>setVegOther(e.target.value)}
  />
)}

<h4>Buah-buahan / 水果</h4>

{/* FRUIT TYPE */}
<select
  value={fruit}
 onChange={(e)=>{
  const selectedFruit = e.target.value;
  setFruit(selectedFruit);

  // ✅ AUTO-SET FIRST PORTION
  if (fruitMap[selectedFruit] && fruitMap[selectedFruit].length > 0) {
    setFruitPortion(fruitMap[selectedFruit][0]);
  } else {
    setFruitPortion("None");
  }

  // reset others
  setFruitOther("");
  setFruitOtherPortion("");
}}
>
  {Object.keys(fruitMap).map((v, i) => (
    <option key={i} value={v}>{v}</option>
  ))}
</select>

{/* IF NORMAL FRUIT → show portion dropdown */}
{fruit !== "None" && !fruit.includes("Lain-lain") && (
  <select
    value={fruitPortion}
    onChange={(e)=>setFruitPortion(e.target.value)}
  >
    {fruitMap[fruit]?.map((p, i) => (
      <option key={i} value={p}>{p}</option>
    ))}
  </select>
)}

{/* IF OTHERS → show TWO INPUTS (like protein) */}
{fruit.includes("Lain-lain") && (
  <>
    <input
      type="text"
      placeholder="Nyatakan buah / 输入水果"
      value={fruitOther}
      onChange={(e)=>setFruitOther(e.target.value)}
    />

    <input
      type="text"
      placeholder="Nyatakan porsi / 输入分量"
      value={fruitOtherPortion}
      onChange={(e)=>setFruitOtherPortion(e.target.value)}
    />
  </>
)}
      <h4>Minuman / 饮料</h4>

<select
  value={drink}
  onChange={(e)=>setDrink(e.target.value)}
>
  {drinkOptions.map((d,i)=>(
    <option key={i}>{d}</option>
  ))}
</select>

{drink === "Lain-lain / 其他" && (
  <input
    type="text"
    placeholder="Nyatakan minuman / 输入饮料"
    value={drinkOther}
    onChange={(e)=>setDrinkOther(e.target.value)}
  />
  
)}
<p>
  🍬 Gula / 糖
</p>
{customizableDrinks.includes(drink) && (
  <>
<select
  value={drinkSugar}
  onChange={(e) =>
    setDrinkSugar(e.target.value)
  }
>
  {Object.keys(sugarExchangeMap).map((s, i) => (
    <option key={i} value={s}>
      {s}
    </option>
  ))}
</select>
<p>
  🥛 Susu / 奶类
</p>

<select
  value={drinkMilk}
  onChange={(e) =>
    setDrinkMilk(e.target.value)
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
<p
  style={{
    fontSize: "12px",
    color: "#666"
  }}
>
  💡 Minuman manis, minuman coklat,
  teh/kopi bersusu, minuman kotak atau berkarbonat
  mungkin mengandungi karbohidrat tambahan.
  <br />
  甜饮、巧克力饮料、奶茶/咖啡、盒装饮料或汽水可能含有额外碳水化合物。
</p>

      <br/><br/>
      <button onClick={saveMeal}>Simpan / 保存</button>
      

{/* ✅ STEP 3 HERE */}
{lastScore && (
  <h4>Score / 评分: {lastScore}</h4>
)}
</div>
);}