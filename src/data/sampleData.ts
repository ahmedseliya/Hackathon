// Sample data for the fitness application

export interface Meal {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: string;
  source?: 'ai' | 'manual';
  confidence?: string;
}

export interface Exercise {
  id: number;
  name: string;
  type: string;
  duration: string;
  calories: number;
  time: string;
}

export interface ProgressData {
  day: string;
  calories: number;
  steps: number;
}

export const sampleMeals: Meal[] = [
  { 
    id: 1, 
    name: "Protein Shake", 
    time: "08:00 AM", 
    calories: 250, 
    protein: 25, 
    carbs: 15, 
    fat: 5, 
    type: "Breakfast",
    source: "manual" as const
  },
  { 
    id: 2, 
    name: "Grilled Chicken Salad", 
    time: "12:30 PM", 
    calories: 450, 
    protein: 35, 
    carbs: 20, 
    fat: 12, 
    type: "Lunch",
    source: "manual" as const
  },
  { 
    id: 3, 
    name: "Greek Yogurt", 
    time: "03:00 PM", 
    calories: 150, 
    protein: 12, 
    carbs: 18, 
    fat: 3, 
    type: "Snack",
    source: "manual" as const
  },
  { 
    id: 4, 
    name: "Salmon with Veggies", 
    time: "07:00 PM", 
    calories: 550, 
    protein: 40, 
    carbs: 25, 
    fat: 18, 
    type: "Dinner",
    source: "manual" as const
  },
];

export const sampleExercises: Exercise[] = [
  { 
    id: 1, 
    name: "Morning Run", 
    type: "Cardio", 
    duration: "30 min", 
    calories: 320, 
    time: "07:00 AM" 
  },
  { 
    id: 2, 
    name: "Weight Training", 
    type: "Strength", 
    duration: "45 min", 
    calories: 280, 
    time: "06:00 PM" 
  },
  { 
    id: 3, 
    name: "Yoga Session", 
    type: "Flexibility", 
    duration: "25 min", 
    calories: 150, 
    time: "08:00 PM" 
  },
];

export const weeklyProgress: ProgressData[] = [
  { day: "Mon", calories: 2200, steps: 8500 },
  { day: "Tue", calories: 2400, steps: 9200 },
  { day: "Wed", calories: 2100, steps: 7800 },
  { day: "Thu", calories: 2300, steps: 8900 },
  { day: "Fri", calories: 2500, steps: 9500 },
  { day: "Sat", calories: 2700, steps: 11000 },
  { day: "Sun", calories: 2000, steps: 7500 },
];