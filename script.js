/* ==========================================================
   script.js — Full Expo-ready logic (complete, self-contained)
   - All 4 diabetes types × 3 ranges (12 sets)
   - Calorie ranges + targets
   - Diet Plan page with 3 boxes (mandatory/moderate/high)
   - Live calorie counter + inline alert
   - Lifestyle tips for each type+range
   - Navigation: Profile → BloodSugar → DietPlan → Lifestyle → Final
========================================================== */

/* GLOBAL NAVIGATION + DATA STORAGE */
const userData = { status: "Normal", diabetesType: "Type 2", name: "", age: "", weight: "" };
let currentPage = "landing";
let pageHistory = [];
window.userData = userData;

function showPage(pageId) {
  const cur = document.getElementById(currentPage);
  if (cur) cur.classList.remove("active-page");
  const next = document.getElementById(pageId);
  if (next) next.classList.add("active-page");

  // Push previous page to history
  if (currentPage && currentPage !== pageId) {
    pageHistory.push(currentPage);
  }

  currentPage = pageId;
}

/* Add this new function */
function goBack() {
  if (pageHistory.length > 0) {
    const prevPage = pageHistory.pop();
    showPage(prevPage);
  } else {
    alert("🚫 No previous page available.");
  }
}


/* PROFILE -> BLOOD-SUGAR */
function saveProfileAndNext() {
  const name = document.getElementById("fullName").value.trim();
  const age = Number(document.getElementById("age").value.trim());
  const weight = Number(document.getElementById("weight").value.trim());
  const height = Number(document.getElementById("height").value.trim());
  const diabetesType = document.getElementById("diabetesType").value;

  if (!name || !age || !weight || !height) {
    alert("Please fill all profile fields.");
    return;
  }

  // 🚫 Block negative, zero, and non-number
  if (age <= 0 || weight <= 0 || height <= 0) {
    alert("Age, Weight, and Height must be positive numbers.");
    return;
  }

  if (isNaN(age) || isNaN(weight) || isNaN(height)) {
    alert("Only numbers allowed for Age, Weight, Height.");
    return;
  }

  userData.name = name;
  userData.age = age;
  userData.weight = weight;
  userData.height = height;
  userData.diabetesType = diabetesType;
  localStorage.setItem("userProfile", JSON.stringify(userData));

  showPage("bloodSugar");
}
function addReadingAndNext() {
  const pre = document.getElementById("preMeal").value.trim();
  const post = document.getElementById("postMeal").value.trim();
  const res = document.getElementById("readingResult");

  if (!pre || !post) {
    res.innerHTML = `<span style="color:red;">⚠️ Please enter both readings.</span>`;
    return;
  }

  const preNum = Number(pre);
  const postNum = Number(post);

  // 🚫 Block letters
  if (isNaN(preNum) || isNaN(postNum)) {
    res.innerHTML = `<span style="color:red;">⚠️ Enter only numbers.</span>`;
    return;
  }

  // 🚫 Block zero and negative
  if (preNum <= 0 || postNum <= 0) {
    res.innerHTML = `<span style="color:red;">⚠️ Values must be positive numbers.</span>`;
    return;
  }

  let status = "Normal";
  if (preNum < 70 || postNum < 90) status = "Low";
  else if (preNum > 125 || postNum > 180) status = "High";

  userData.status = status;
  localStorage.setItem("userStatus", status);

  res.innerHTML = `Your blood-sugar status: <b>${status}</b><br><small>Generating personalized plan...</small>`;

  setTimeout(() => {
    generateDietPlan();
    showPage("dietPlan");
  }, 1500);
}

/* CALORIE RANGE TABLE */
const calorieRanges = {
  "Type 1": {
    Low:    { text: "1800 – 2000 kcal/day", target: 1900 },
    Normal: { text: "1600 – 1800 kcal/day", target: 1700 },
    High:   { text: "1400 – 1600 kcal/day", target: 1500 }
  },
  "Type 2": {
    Low:    { text: "1700 – 1900 kcal/day", target: 1800 },
    Normal: { text: "1500 – 1700 kcal/day", target: 1600 },
    High:   { text: "1300 – 1500 kcal/day", target: 1400 }
  },
  "Gestational": {
    Low:    { text: "2000 – 2200 kcal/day", target: 2100 },
    Normal: { text: "1800 – 2000 kcal/day", target: 1900 },
    High:   { text: "1600 – 1800 kcal/day", target: 1700 }
  },
  "Pre-diabetes": {
    Low:    { text: "1800 – 2000 kcal/day", target: 1900 },
    Normal: { text: "1600 – 1800 kcal/day", target: 1700 },
    High:   { text: "1400 – 1600 kcal/day", target: 1500 }
  }
};

/* SMALL HELPERS FOR FOOD ITEMS */
function f(emoji, name, kcal, gi) {
  return { emoji, name, kcal, gi };
}
function mealSet(o) { return o; }
/* ==========================================================
   FOOD DATA: 4 diabetes types × 3 ranges (Low / Normal / High)
   Each range includes mandatory / moderate / high categories,
   each with Breakfast, Lunch, Dinner, Snacks (3 foods each)
========================================================== */

const foods = {
  /* ---------------- TYPE 1 ---------------- */
  "Type 1": {
    Low: mealSet({
      mandatory: {
        Breakfast: [f("🥛", "Milk + oats", 220, 55), f("🍌", "Banana", 100, 51), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🍚", "Brown rice & dal", 420, 55), f("🥗", "Veg salad", 150, 15), f("🥕", "Boiled veggies", 80, 15)],
        Dinner: [f("🥣", "Soup + chapati", 320, 52), f("🥦", "Steamed broccoli", 70, 15), f("🍅", "Tomato salad", 60, 15)],
        Snacks: [f("🍎", "Apple", 95, 36), f("🥜", "Roasted nuts", 140, 15), f("🥛", "Low-fat milk", 90, 31)]
      },
      moderate: {
        Breakfast: [f("🍞", "Toast + peanut butter", 260, 15), f("🥚", "Boiled egg", 80, 0), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🥘", "Veg pulao small", 330, 70), f("🥗", "Curd", 100, 33), f("🥕", "Salad", 70, 15)],
        Dinner: [f("🍛", "Light curry + roti", 340, 62), f("🥣", "Soup", 100, 20), f("🍆", "Grilled brinjal", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Peanuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥐", "Pastry", 420, 76), f("🥞", "Pancake", 400, 76), f("🥤", "Milkshake", 350, 31)],
        Lunch: [f("🍔", "Burger", 650, 60), f("🍟", "Fries", 400, 75), f("🥓", "Fried bacon", 300, 50)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Pasta", 480, 65), f("🍗", "Fried chicken", 500, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    }),
    Normal: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats porridge", 250, 55), f("🥚", "Boiled eggs", 155, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🥗", "Grilled chicken salad", 350, 15), f("🍚", "Brown rice", 400, 55), f("🥬", "Spinach curry", 120, 15)],
        Dinner: [f("🐟", "Steamed fish + veggies", 380, 15), f("🥣", "Soup", 100, 20), f("🥕", "Boiled veggies", 80, 15)],
        Snacks: [f("🍎", "Apple + nuts", 120, 36), f("🥛", "Yogurt", 100, 33), f("🍌", "Banana", 105, 51)]
      },
      moderate: {
        Breakfast: [f("🍞", "Multigrain toast", 200, 52), f("🥚", "Omelet", 130, 50), f("🥛", "Milk", 100, 31)],
        Lunch: [f("🥘", "Roti + sabzi", 330, 62), f("🥗", "Curd", 90, 33), f("🥦", "Salad", 70, 15)],
        Dinner: [f("🥟", "Paneer paratha small", 360, 10), f("🥣", "Soup", 90, 20), f("🥕", "Veg curry", 100, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15)]
      },
      high: {
        Breakfast: [f("🥐", "Sweet bun", 380, 76), f("🥞", "Pancake", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍜", "Fried rice", 520, 65), f("🍟", "French fries", 450, 75), f("🍔", "Burger", 650, 60)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Cream pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🥤", "Soda", 180, 65), f("🍩", "Donut", 290, 76), f("🍫", "Chocolate", 230, 40)]
      }
    }),
    High: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats with milk", 220, 55), f("🍎", "Apple", 95, 36), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🥗", "Veg salad", 180, 15), f("🥦", "Boiled veggies", 200, 15), f("🥕", "Soup bowl", 90, 20)],
        Dinner: [f("🥦", "Boiled veggies", 200, 15), f("🍚", "Small rice", 200, 89), f("🥣", "Soup", 100, 20)],
        Snacks: [f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15), f("🍎", "Apple", 95, 36)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥚", "Boiled egg", 80, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🍛", "Veg rice small", 300, 70), f("🥗", "Salad", 90, 15), f("🥣", "Dal", 100, 32)],
        Dinner: [f("🍲", "Soup", 200, 20), f("🥕", "Boiled carrot", 60, 50), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍔", "Burger", 600, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍟", "Fried snacks", 450, 50), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    })
  },

  /* ---------------- TYPE 2 ---------------- */
  "Type 2": {
    Low: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats + milk", 230, 55), f("🍌", "Banana", 100, 51), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🍚", "Brown rice + dal", 420, 55), f("🥗", "Veg salad", 150, 15), f("🥬", "Spinach curry", 120, 15)],
        Dinner: [f("🥗", "Veg salad", 160, 15), f("🥣", "Soup", 100, 20), f("🥦", "Boiled veggies", 90, 15)],
        Snacks: [f("🍎", "Apple", 95, 36), f("🥜", "Nuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🥘", "White rice small", 310, 89), f("🍛", "Curry", 130, 50), f("🥗", "Salad", 90, 15)],
        Dinner: [f("🍛", "Curry + roti", 340, 62), f("🥣", "Soup", 100, 20), f("🥕", "Boiled veggies", 80, 15)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Peanuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥐", "Pastry", 420, 76), f("🥞", "Pancake", 400, 76), f("🥤", "Milkshake", 350, 31)],
        Lunch: [f("🍔", "Burger", 650, 60), f("🍟", "French fries", 450, 75), f("🍝", "Cream pasta", 500, 65)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍗", "Fried chicken", 480, 50), f("🍟", "Fried snacks", 450, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    }),
    Normal: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats", 250, 55), f("🥚", "Eggs", 150, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🥗", "Brown rice + dal", 420, 55), f("🥬", "Spinach curry", 120, 15), f("🥕", "Boiled veggies", 80, 15)],
        Dinner: [f("🥬", "Veg stir-fry", 320, 50), f("🥣", "Soup", 90, 20), f("🍚", "Small rice", 200, 89)],
        Snacks: [f("🍎", "Apple + nuts", 130, 36), f("🥛", "Yogurt", 100, 33), f("🍌", "Banana", 105, 51)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥚", "Boiled egg", 80, 0), f("🥛", "Milk", 100, 31)],
        Lunch: [f("🥘", "Veg pulao", 330, 70), f("🥗", "Curd", 90, 33), f("🥕", "Salad", 70, 15)],
        Dinner: [f("🍛", "Roti + sabzi", 340, 62), f("🥣", "Soup", 90, 20), f("🥬", "Boiled veggies", 80, 15)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15)]
      },
      high: {
        Breakfast: [f("🥐", "Sweet bun", 380, 76), f("🥞", "Pancake", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍜", "Fried rice", 520, 65), f("🍟", "French fries", 450, 75), f("🍔", "Burger", 650, 60)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Cream pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🥤", "Soda", 180, 65), f("🍩", "Donut", 290, 76), f("🍫", "Chocolate", 230, 40)]
      }
    }),
    High: mealSet({
      mandatory: {
        Breakfast: [f("🥛", "Milk + oats", 210, 55), f("🍎", "Apple", 95, 36), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🥗", "Veg salad", 180, 15), f("🥦", "Boiled veggies", 200, 15), f("🥣", "Soup", 100, 20)],
        Dinner: [f("🥦", "Steamed veggies", 200, 15), f("🥕", "Soup bowl", 100, 20), f("🍚", "Small rice", 200, 89)],
        Snacks: [f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15), f("🍎", "Apple", 95, 36)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥚", "Boiled egg", 80, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🍛", "Small rice portion", 300, 89), f("🥗", "Salad", 90, 15), f("🥣", "Dal", 100, 32)],
        Dinner: [f("🍲", "Soup", 200, 20), f("🥕", "Boiled carrot", 60, 50), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍔", "Burger", 600, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍟", "Fried snacks", 450, 50), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    })
  },

  /* ---------------- GESTATIONAL ---------------- */
  "Gestational": {
    Low: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats with milk", 220, 55), f("🍌", "Banana", 100, 51), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🍚", "Brown rice", 400, 55), f("🥗", "Veg curry", 280, 50), f("🥬", "Spinach curry", 120, 15)],
        Dinner: [f("🥗", "Veg curry", 280, 50), f("🥣", "Soup", 90, 20), f("🥕", "Boiled veggies", 80, 15)],
        Snacks: [f("🍎", "Apple", 95, 36), f("🥜", "Nuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 210, 52), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🥘", "Small pulao", 320, 70), f("🥗", "Curd", 90, 33), f("🥕", "Salad", 70, 15)],
        Dinner: [f("🍛", "Roti + sabzi", 340, 62), f("🥣", "Soup", 100, 20), f("🥬", "Veg curry", 90, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Peanuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥐", "Cake", 400, 76), f("🥞", "Pancake", 420, 76), f("🥤", "Milkshake", 350, 31)],
        Lunch: [f("🍔", "Burger", 650, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    }),
    Normal: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats + milk", 240, 55), f("🍌", "Banana", 100, 51), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🥗", "Veg salad + chapati", 350, 52), f("🥬", "Curry", 150, 50), f("🍚", "Brown rice", 380, 55)],
        Dinner: [f("🥘", "Rice + dal", 380, 32), f("🥣", "Soup", 90, 20), f("🥕", "Boiled veggies", 80, 15)],
        Snacks: [f("🍊", "Orange", 80, 44), f("🥛", "Yogurt", 100, 33), f("🍎", "Apple", 95, 36)]
      },
      moderate: {
        Breakfast: [f("🍞", "Toast + milk", 230, 31), f("🥚", "Boiled egg", 80, 0), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🍛", "Small rice", 310, 89), f("🥗", "Curd", 90, 33), f("🥕", "Salad", 70, 15)],
        Dinner: [f("🥟", "Paratha small", 360, 50), f("🥣", "Soup", 100, 20), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Nuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥐", "Pastry", 420, 76), f("🥞", "Pancake", 400, 76), f("🥤", "Milkshake", 350, 31)],
        Lunch: [f("🍜", "Fried rice", 520, 65), f("🍟", "Fries", 450, 75), f("🍔", "Burger", 650, 60)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🥤", "Soda", 180, 65), f("🍩", "Donut", 290, 76), f("🍫", "Chocolate", 230, 40)]
      }
    }),
    High: mealSet({
      mandatory: {
        Breakfast: [f("🥛", "Milk + oats", 210, 55), f("🍎", "Apple", 95, 36), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🥗", "Veg salad", 180, 15), f("🥦", "Boiled veggies", 200, 15), f("🥣", "Soup", 100, 20)],
        Dinner: [f("🥦", "Steamed veggies", 200, 15), f("🥕", "Soup bowl", 100, 20), f("🍚", "Small rice", 200, 89)],
        Snacks: [f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15), f("🍎", "Apple", 95, 36)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥚", "Boiled egg", 80, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🍛", "Small rice portion", 300, 89), f("🥗", "Salad", 90, 15), f("🥣", "Dal", 100, 32)],
        Dinner: [f("🍲", "Soup", 200, 20), f("🥕", "Boiled carrot", 60, 50), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍔", "Burger", 600, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍟", "Fried snacks", 450, 50), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    })
  },

  /* ---------------- PRE-DIABETES ---------------- */
  "Pre-Diabetes": {
    Low: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats with skim milk", 220, 55), f("🍌", "Banana", 100, 51), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🍚", "Brown rice + dal", 420, 55), f("🥗", "Veg salad", 150, 15), f("🥕", "Boiled veggies", 80, 15)],
        Dinner: [f("🥣", "Soup + chapati", 320, 52), f("🥦", "Steamed broccoli", 70, 15), f("🍅", "Tomato salad", 60, 15)],
        Snacks: [f("🍎", "Apple", 95, 36), f("🥜", "Nuts", 130, 15), f("🥛", "Low-fat milk", 90, 31)]
      },
      moderate: {
        Breakfast: [f("🍞", "Whole wheat toast", 220, 70), f("🥚", "Boiled egg", 80, 0), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🥘", "Veg pulao", 330, 70), f("🥗", "Curd", 100, 33), f("🥕", "Salad", 70, 15)],
        Dinner: [f("🍛", "Roti + curry", 340, 62), f("🥣", "Soup", 100, 20), f("🥬", "Veg curry", 90, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Nuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Milkshake", 350, 31)],
        Lunch: [f("🍔", "Burger", 650, 60), f("🍟", "Fries", 450, 75), f("🍝", "Pasta", 500, 65)],
        Dinner: [f("🍕", "Pizza", 600, 60), f("🍝", "Pasta", 480, 65), f("🍗", "Fried chicken", 500, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    }),
    Normal: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats with milk", 250, 55), f("🥚", "Boiled eggs", 150, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🥗", "Veg curry + rice", 380, 70), f("🥬", "Spinach curry", 120, 15), f("🥕", "Boiled veggies", 80, 15)],
        Dinner: [f("🥣", "Soup + chapati", 300, 52), f("🥬", "Boiled veggies", 100, 15), f("🍚", "Small rice", 200, 89)],
        Snacks: [f("🍎", "Apple + nuts", 130, 36), f("🥛", "Yogurt", 100, 33), f("🍌", "Banana", 105, 51)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥛", "Milk", 100, 31), f("🍎", "Apple", 95, 36)],
        Lunch: [f("🍛", "Veg rice small", 300, 70), f("🥗", "Salad", 90, 15), f("🥣", "Dal", 100, 32)],
        Dinner: [f("🍲", "Soup", 200, 20), f("🥕", "Boiled carrot", 60, 50), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥜", "Nuts", 130, 15), f("🍊", "Orange", 80, 44)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍔", "Burger", 600, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍝", "Pasta", 500, 65), f("🍟", "Fried snacks", 450, 50), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    }),
    High: mealSet({
      mandatory: {
        Breakfast: [f("🥣", "Oats + milk", 220, 55), f("🍎", "Apple", 95, 36), f("🍓", "Berries", 60, 25)],
        Lunch: [f("🥗", "Veg salad", 180, 15), f("🥦", "Boiled veggies", 200, 15), f("🥣", "Soup", 100, 20)],
        Dinner: [f("🥦", "Steamed veggies", 200, 15), f("🥕", "Soup bowl", 100, 20), f("🍚", "Small rice", 200, 89)],
        Snacks: [f("🍊", "Orange", 80, 44), f("🥜", "Nuts", 130, 15), f("🍎", "Apple", 95, 36)]
      },
      moderate: {
        Breakfast: [f("🍞", "Chapati", 220, 52), f("🥚", "Boiled egg", 80, 0), f("🍊", "Orange", 80, 44)],
        Lunch: [f("🍛", "Small rice portion", 300, 89), f("🥗", "Salad", 90, 15), f("🥣", "Dal", 100, 32)],
        Dinner: [f("🍲", "Soup", 200, 20), f("🥕", "Boiled carrot", 60, 50), f("🥬", "Veg curry", 80, 50)],
        Snacks: [f("🍌", "Banana", 105, 51), f("🥛", "Milk", 90, 31), f("🍎", "Apple", 95, 36)]
      },
      high: {
        Breakfast: [f("🥞", "Pancake", 400, 76), f("🥐", "Pastry", 420, 76), f("🥤", "Soda", 180, 65)],
        Lunch: [f("🍔", "Burger", 600, 60), f("🍟", "Fries", 450, 75), f("🍕", "Pizza", 600, 60)],
        Dinner: [f("🍟", "Fried snacks", 450, 50), f("🍝", "Pasta", 500, 65), f("🍗", "Fried chicken", 480, 50)],
        Snacks: [f("🍫", "Chocolate", 230, 40), f("🍩", "Donut", 290, 76), f("🥤", "Soda", 180, 65)]
      }
    })
  }
};



function updateCalories() {
  const radios = document.querySelectorAll(".food-radio");
  let total = 0;
  radios.forEach(rb => { if (rb.checked) total += Number(rb.dataset.kcal || 0); });
  const el = document.getElementById("totalCalories");
  if (el) el.textContent = `${total} kcal`;
}
  // initial update
  updateCalories();

  function buildCol(title, key, data) {
  let s = `<div class="col ${key}"><h4>${title}</h4>`;
  for (const meal in data) {
    s += `<div class="meal-group"><div class="meal-name">${meal}</div>`;
    data[meal].forEach(it => {
      s += `<label class="food-item">
               <input type="radio" 
                      name="${meal}-${key}" 
                      class="food-radio" 
                      data-kcal="${it.kcal}"
                      data-gi="${it.gi}">
               <span class="food-emoji">${it.emoji}</span>
               <span class="food-name">${it.name}</span>
               <span class="food-kcal">${it.kcal} kcal</span>
               <span class="food-gi">GI ${it.gi}</span>
             </label>`;
    });
    s += `</div>`;
  }
  s += `</div>`;
  return s;
}




  function updateCalories() {
  const radios = document.querySelectorAll(".food-radio");

  let total = 0;      // total calories
  let totalGI = 0;    // total glycemic index

  radios.forEach(rb => { 
    if (rb.checked) {
      total += Number(rb.dataset.kcal || 0);   // calories
      totalGI += Number(rb.dataset.gi || 0);   // GI
    }
  });

  // Update calories UI
const totalEl = document.getElementById("totalCalories");
if (totalEl) totalEl.textContent = `${total} kcal`;

// Update GI UI
const giEl = document.getElementById("totalGI");
if (giEl) giEl.textContent = totalGI;

// ⭐ Save GI to localStorage so summary.html can read it
localStorage.setItem("totalGI", totalGI);

// Existing calorie warning logic
const cal = calorieRanges[userData.diabetesType][userData.status];
const alertBox = document.getElementById("calAlert");


  if (total > cal.target) {
    showPopup(`⚠️ You have exceeded the recommended calories!`);
    if (alertBox) alertBox.classList.add("visible");
    localStorage.setItem("globalAlert", "⚠️ You have exceeded the recommended calories!");
  } else {
    if (alertBox) alertBox.classList.remove("visible");
    localStorage.removeItem("globalAlert");
  }
 


}



/* ==========================================================
   🍽️ GENERATE DIET PLAN PAGE
========================================================== */
function generateDietPlan() {
  const type = userData.diabetesType;
  const status = userData.status;
  const mealData = foods[type][status];
  const cal = calorieRanges[type][status];

  let html = `
    <div class="card diet-card">
      <h2 class="diet-title">🍱 Diet Plan for ${type} (${status})</h2>

      <div class="calorie-box">
        <h3>Recommended Calorie Range: ${cal.text}</h3>
        <div class="counter">
          <span class="total-kcal">🔥 Total Selected: <span id="totalCalories">0 kcal</span></span><br>
          <span class="target-kcal">🎯 Target: ${cal.target} kcal</span>
          <div id="calAlert" class="cal-alert">⚠️ Over Target Calories!</div>
          <div id="giAlert" class="gi-alert"></div>

        </div>
      </div>

      <div class="meal-columns">
        <div class="meal-col"><div class="meal-header">🥣 Breakfast</div>
          ${buildMealCol("Breakfast", mealData)}
        </div>
        <div class="meal-col"><div class="meal-header">🍛 Lunch</div>
          ${buildMealCol("Lunch", mealData)}
        </div>
        <div class="meal-col"><div class="meal-header">🍪 Snacks</div>
          ${buildMealCol("Snacks", mealData)}
        </div>
        <div class="meal-col"><div class="meal-header">🍲 Dinner</div>
          ${buildMealCol("Dinner", mealData)}
        </div>
      </div>

      <div class="nav-buttons">
        <button class="nav-btn back" onclick="goBack()">← Back</button>

        <button class="nav-btn next" id="confirmSelection">Next →</button>
      </div>
    </div>
  `;
      document.getElementById("dietPlan").innerHTML = html;

  document.querySelectorAll(".food-radio").forEach(rb => {
    rb.addEventListener("change", updateCalories);
  });

  document.getElementById("confirmSelection").addEventListener("click", () => {
    const selected = [];
    document.querySelectorAll(".food-radio:checked").forEach(rb => {
      const emoji = rb.parentElement.querySelector(".food-emoji").textContent;
      const name = rb.parentElement.querySelector(".food-name").textContent;
      const kcal = rb.parentElement.querySelector(".food-kcal").textContent.replace(" kcal", "");
       const gi = rb.dataset.gi; 
      selected.push({ emoji, name, kcal, gi });
    });

    userData.selectedFoods = selected;
userData.totalCalories =
  document.getElementById("totalCalories").textContent.replace(" kcal", "");

// Calculate GI properly
let totalGI = 0;
document.querySelectorAll(".food-radio:checked").forEach(rb => {
  totalGI += Number(rb.dataset.gi || 0);
});

localStorage.setItem("selectedFoods", JSON.stringify(selected));
localStorage.setItem("totalCalories", userData.totalCalories);
localStorage.setItem("totalGI", totalGI);  // correct


// Now it will navigate correctly
window.location.href = "summary.html";

  });
}


function buildMealCol(meal, mealData) {
  return `
    <div class="col mandatory"><h4>🟢 Mandatory</h4>
      ${mealItems(mealData.mandatory[meal], meal + "-mandatory")}
    </div>
    <div class="col moderate"><h4>🟡 Moderate</h4>
      ${mealItems(mealData.moderate[meal], meal + "-moderate")}
    </div>
    <div class="col high"><h4>🔴 High</h4>
      ${mealItems(mealData.high[meal], meal + "-high")}
    </div>`;
}

function mealItems(list, namePrefix) {
  if (!list) return "";
  return list.map(it => `
    <label class="food-item">
      <input type="radio" 
             name="${namePrefix}" 
             class="food-radio" 
             data-kcal="${it.kcal}" 
             data-gi="${it.gi}">
      
      <span class="food-emoji">${it.emoji}</span>
      <span class="food-name">${it.name}</span>
      <span class="food-kcal">${it.kcal} kcal</span>
      <span class="food-gi">GI ${it.gi}</span>
    </label>
  `).join("");
}


/* LIFESTYLE TIPS (4 types × 3 ranges) */

const lifestyleTips = {
  "Type 1": {
    Low: [
      "🍽️ Eat frequent small meals to prevent hypoglycemia.",
      "💧 Keep glucose or juice handy for quick correction.",
      "🕒 Avoid long fasting periods; plan snacks.",
      "🛌 Rest if dizzy and inform someone."
    ],
    Normal: [
      "🏃‍♀️ Exercise moderately (30 min daily).",
      "🍎 Include lean protein and fiber-rich vegetables.",
      "💉 Maintain insulin schedule and timing.",
      "💧 Stay hydrated and monitor regularly."
    ],
    High: [
      "🚫 Avoid sweets and refined carbs.",
      "🚶 Take short walks after meals to improve glucose.",
      "🥗 Favor salads and non-starchy vegetables.",
      "📞 Consult your physician for persistent highs."
    ]
  },
  "Type 2": {
    Low: [
      "🥣 Choose slow-release carbs like oats and legumes.",
      "💧 Drink water and carry quick carbs for drops.",
      "🍽️ Don’t skip meals; plan balanced snacks.",
      "⚖️ Monitor levels when exercising."
    ],
    Normal: [
      "🚶 Walk 30–45 minutes after meals.",
      "🥦 Prefer whole grains and vegetables over refined carbs.",
      "🚫 Avoid late-night snacking and sugary drinks.",
      "💧 Stay hydrated and log readings periodically."
    ],
    High: [
      "🚫 Eliminate sugary beverages and junk food.",
      "🏃 Add daily light exercise and increase activity.",
      "🥗 Increase fiber (beans, greens) and reduce portions.",
      "📈 Work with a clinician to adjust meds if needed."
    ]
  },
  "Gestational": {
    Low: [
      "🍽️ Eat every 2–3 hours to prevent drops.",
      "🥜 Carry healthy snacks like nuts or fruit.",
      "💧 Hydrate well and rest when needed.",
      "🩺 Keep your obstetrician informed of readings."
    ],
    Normal: [
      "🍚 Prioritize balanced meals with protein and complex carbs.",
      "🚶 Walk 10–15 minutes after meals.",
      "📈 Monitor sugars regularly per doctor's guidance.",
      "🚫 Avoid fruit juices and sweets."
    ],
    High: [
      "🥦 Increase vegetables and whole grains.",
      "🍽️ Have small, frequent meals to spread carbohydrate load.",
      "💬 Consult your healthcare provider for management.",
      "🛌 Ensure adequate rest and reduced stress."
    ]
  },
  "Pre-diabetes": {
    Low: [
      "🥗 Include complex carbs and avoid long gaps.",
      "🏃 Stay active throughout the day.",
      "🍽️ Keep portion sizes moderate.",
      "🥜 Add nuts and seeds to snacks."
    ],
    Normal: [
      "🚶 Walk after each meal for 15–20 minutes.",
      "🥦 Replace refined carbs with whole grains and veg.",
      "😴 Sleep 7–8 hours nightly.",
      "🍏 Limit added sugars and processed foods."
    ],
    High: [
      "🚫 Avoid soft drinks, sweets and fast foods.",
      "🏃‍♀️ Increase exercise to 45–60 minutes daily.",
      "🥗 Emphasize fiber-rich meals with vegetables and legumes.",
      "📊 Monitor sugar regularly and aim for weight control."
    ]
  }
};

/* Generate Lifestyle Page (inject content based on userData) */
function generateLifestyleTips() {
  const type = userData.diabetesType;
  const status = userData.status;
  const tips = lifestyleTips[type][status] || ["Follow healthy habits."];

  document.getElementById("lifestyle").innerHTML = `
    <div class="card">
      <h2>💪 Lifestyle Tips for ${type} (${status})</h2>
      <ul>${tips.map(t => `<li>${t}</li>`).join("")}</ul>
      <div class="nav-buttons">
        <button class="nav-btn back" onclick="goToDietPlan()">← Back</button>

        <button class="nav-btn next" onclick="showFinalPage()">Next →</button>
      </div>
    </div>`;
}

function showFinalPage() {
  const type = userData.diabetesType;
  const status = userData.status;
  const cal = calorieRanges[type] && calorieRanges[type][status]
    ? calorieRanges[type][status]
    : { text: "N/A" };

  const selectedFoods =
  userData.selectedFoods && userData.selectedFoods.length > 0
    ? `<ul>${userData.selectedFoods
        .map(f => `<li>${f.emoji} ${f.name} — ${f.kcal} kcal — GI ${f.gi}</li>`)
        .join("")}</ul>`
    : "<p>No food items selected.</p>";



  document.getElementById("final").innerHTML = `
    <div class="card">
      <h2 class="diet-title">🎉 ${
        escapeHtml(userData.name || "User")
      }, Your Personalized Plan Summary</h2>

      <div class="summary">
        <p><strong>Type:</strong> ${escapeHtml(type)}</p>
        <p><strong>Status:</strong> ${escapeHtml(status)}</p>
        <p><strong>Recommended Calories:</strong> ${escapeHtml(cal.text)}</p>
        <p><strong>Age:</strong> ${escapeHtml(userData.age)}</p>
        <p><strong>Weight:</strong> ${escapeHtml(userData.weight)} kg</p>
        <p><strong>Height:</strong> ${escapeHtml(userData.height)} cm</p>
      </div>

      <div class="summary">
        <h3>🍱 Selected Foods:</h3>
        ${selectedFoods}
        <p><strong>🔥 Total Calories Selected:</strong> ${
          userData.totalCalories || 0
        } kcal</p>
      </div>

      <p class="note">✅ Eat mindfully, stay active, and monitor your levels regularly.</p>

      <div class="nav-buttons">
        <button class="nav-btn back" onclick="showPage('lifestyle')">← Back</button>
        <button class="nav-btn next" onclick="goHome()">🏠 Home</button>

      </div>
    </div>
  `;

  // ✅ Ensure the Final page is visible
  showPage("final");
}
// ✅ Function to reset everything when Home is clicked
function goHome() {
  // Remove the red warning alert from localStorage
  localStorage.removeItem("globalAlert");
  
  // Refresh the page completely
  location.reload();
}

/* ✅ Global Warning Bar visibility on all pages */
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("globalWarningBar");
  const savedAlert = localStorage.getItem("globalAlert");

  if (bar) {
    if (savedAlert) {
      bar.classList.add("show");
    } else {
      bar.classList.remove("show");
    }
  }
});

// ✅ Keep bar visible even when navigating between pages
function updateGlobalWarningBar() {
  const bar = document.getElementById("globalWarningBar");
  const savedAlert = localStorage.getItem("globalAlert");
  if (bar) {
    if (savedAlert) bar.classList.add("show");
    else bar.classList.remove("show");
  }
}

// ✅ Call it whenever you change pages (safe version)
if (typeof showPage === "function") {
  const oldShowPage = showPage;
  showPage = function(pageId) {
    oldShowPage(pageId);
    updateGlobalWarningBar();
  };
} else {
  // If showPage not ready yet, attach later after DOM loads
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof showPage === "function") {
      const oldShowPage = showPage;
      showPage = function(pageId) {
        oldShowPage(pageId);
        updateGlobalWarningBar();
      };
    }
  });
}


/* Small helper to avoid HTML injection (safe-ish for this UI) */
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Initialize landing page as active on first load (in case not set by HTML) */
document.addEventListener("DOMContentLoaded", () => {
  const landing = document.getElementById("landing");
  if (landing && !landing.classList.contains("active-page"))
    landing.classList.add("active-page");
});

/* ==========================================================
   🔔 POPUP NOTIFICATION HANDLER
========================================================== */
function showPopup(message, callback) {
  const popup = document.getElementById("popupBox");
  const msg = document.getElementById("popupMessage");
  const okBtn = document.getElementById("popupOk");

  if (!popup || !msg || !okBtn) {
    alert(message);
    if (callback) callback();
    return;
  }

  msg.textContent = message;
  popup.classList.add("show");
  popup.querySelector(".popup-content").classList.add("warning");

  // Save state so it persists across pages
  localStorage.setItem("globalAlert", message);

  okBtn.onclick = () => {
    popup.classList.remove("show");
    if (callback) callback();
  };
}
// ✅ Global Warning Bar visibility on all pages
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("globalWarningBar");
  const savedAlert = localStorage.getItem("globalAlert");

  if (bar) {
    if (savedAlert) {
      bar.classList.add("show");
    } else {
      bar.classList.remove("show");
    }
  }
});

// ✅ Keep bar visible even when navigating between pages
function updateGlobalWarningBar() {
  const bar = document.getElementById("globalWarningBar");
  const savedAlert = localStorage.getItem("globalAlert");
  if (bar) {
    if (savedAlert) bar.classList.add("show");
    else bar.classList.remove("show");
  }
}

// Call it whenever you change pages
const oldShowPage = showPage;
showPage = function(pageId) {
  oldShowPage(pageId);
  updateGlobalWarningBar();
};
// 🟢 Allow radio buttons to be deselected on second click
document.querySelectorAll('input[type="radio"]').forEach(rb => {
  rb.addEventListener('click', function(e) {
    if (this.previousChecked) {
      this.checked = false; // uncheck if already selected
    }
    // remember last state
    this.previousChecked = this.checked;
  });
});
// 🟢 When returning from Summary → Diet Plan
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("goto") === "dietPlan") {

    const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const savedFoods   = JSON.parse(localStorage.getItem("selectedFoods") || "[]");
    const status       = localStorage.getItem("userStatus") || "Normal";

    Object.assign(userData, savedProfile);
    userData.status = status;
    userData.selectedFoods = savedFoods;

    // Rebuild diet plan UI
    generateDietPlan();
    showPage("dietPlan");

    // Restore selected foods
    setTimeout(() => {
      document.querySelectorAll(".food-radio").forEach(rb => {
        const name = rb.parentElement.querySelector(".food-name").textContent;

        if (savedFoods.some(f => f.name === name)) {
          rb.checked = true;
        }
      });

      updateCalories();
    }, 100);

    localStorage.removeItem("goto");
  }
});

// ✅ When returning from summary.html, restore everything and open Lifestyle Tips
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("goto") === "lifestyle") {
    const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const savedFoods = JSON.parse(localStorage.getItem("selectedFoods") || "[]");
    const totalCalories = localStorage.getItem("totalCalories") || "0";
    const status = localStorage.getItem("userStatus") || "Normal";

    Object.assign(userData, savedProfile);
    userData.status = status;
    userData.selectedFoods = savedFoods;
    userData.totalCalories = totalCalories;

    generateLifestyleTips();
    showPage("lifestyle");

    localStorage.removeItem("goto");
  }
});
// 🟢 Allow radio buttons to be toggled off when clicked again
document.addEventListener("click", function (e) {
  if (e.target.matches('input[type="radio"]')) {
    // If the radio was already checked, uncheck it
    if (e.target.previousChecked) {
      e.target.checked = false;
    }

    // Reset all radios' previousChecked, then mark this one
    document.querySelectorAll('input[type="radio"]').forEach(rb => rb.previousChecked = false);
    e.target.previousChecked = e.target.checked;
  }
});
// ✅ Add this at the very end of script.js
window.addEventListener("DOMContentLoaded", () => {
  const savedAlert = localStorage.getItem("globalAlert");
  if (savedAlert) {
    showPopup(savedAlert);
  }
});
// ⭐ ADD THESE HERE (before enforcePositiveNumberInput starts)

function goToSugarPage() {
  showPage("bloodSugar");
}

function goBackToDietPlan() {
  localStorage.setItem("goto", "dietPlan"); 
  showPage("dietPlan");   // reload dietPlan page
}


// do not add anywhere inside big blocks — keep these separate

function enforcePositiveNumberInput(fieldId) {
  const input = document.getElementById(fieldId);

  input.addEventListener("input", () => {
    // Remove everything except digits
    input.value = input.value.replace(/[^0-9]/g, "");

    // Remove leading zeros (no 000 or 012)
    input.value = input.value.replace(/^0+/, "");
  });
}
document.addEventListener("DOMContentLoaded", () => {
  enforcePositiveNumberInput("age");
  enforcePositiveNumberInput("weight");
  enforcePositiveNumberInput("height");
  enforcePositiveNumberInput("preMeal");
  enforcePositiveNumberInput("postMeal");
});


  
