// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface for AI meal detection
interface AIResult {
  foodItems: string[];
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: string;
  mealType: string;
}

// Interface for BMI recommendations
interface BMIRecommendation {
  idealWeight: number;
  recommendedCalories: number;
  dietPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  workoutPlan: {
    cardio: string[];
    strength: string[];
    frequency: string;
    duration: string;
  };
  geneticFactors: string[];
  timeframe: string;
  healthTips: string[];
}

class GeminiService {
  private genAI!: GoogleGenerativeAI;
  public model: any;

  constructor() {
    // ⚠️ PASTE YOUR ACTUAL GEMINI API KEY HERE ⚠️
    const apiKey = "AIzaSyAIoHLFTKDaelkpgPsnQmkImxxdy2Soa4k"; // Replace with your real key
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"  // Using stable model
    });
  }

  // ============ MEAL DETECTION METHODS ============

  async analyzeFoodImage(imageFile: File): Promise<AIResult> {
    try {
      const prompt = `Analyze this food image and provide nutritional information in JSON format. 
      Return ONLY this exact JSON structure, no other text, no markdown, no code blocks:
      {
        "foodItems": ["item1", "item2"],
        "estimatedCalories": 350,
        "estimatedProtein": 25,
        "estimatedCarbs": 30,
        "estimatedFat": 12,
        "confidence": "high",
        "mealType": "Lunch"
      }`;
      
      // Convert image to base64
      const imageBase64 = await this.fileToBase64(imageFile);
      const base64Data = imageBase64.split(',')[1];
      
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data
          }
        },
        { text: prompt }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      // Clean the response - remove markdown code blocks and extra text
      const cleanedText = this.cleanGeminiResponse(text);
      
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return this.getMockFoodData();
      }
      
    } catch (error) {
      console.error('Image analysis error:', error);
      return this.getMockFoodData();
    }
  }

  async processFoodDescription(description: string): Promise<AIResult> {
    try {
      const prompt = `Analyze this food description: "${description}"
      Return ONLY this exact JSON structure, no other text, no markdown, no code blocks:
      {
        "foodItems": ["item1", "item2"],
        "estimatedCalories": 350,
        "estimatedProtein": 25,
        "estimatedCarbs": 30,
        "estimatedFat": 12,
        "confidence": "high",
        "mealType": "Lunch"
      }`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response - remove markdown code blocks
      const cleanedText = this.cleanGeminiResponse(text);
      
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return this.getMockFoodData();
      }
      
    } catch (error) {
      console.error('Description analysis error:', error);
      return this.getMockFoodData();
    }
  }

  // ============ BMI RECOMMENDATIONS METHODS ============

  async getBMIRecommendations(
    bmi: number,
    weight: number,
    height: number,
    age: number,
    gender: string,
    activityLevel: string,
    goal: string,
    familyHistory: string,
    metabolism: string
  ): Promise<BMIRecommendation> {
    try {
      const prompt = `You are a certified nutritionist and fitness expert. Provide detailed recommendations for this person:
      BMI: ${bmi}
      Weight: ${weight}kg
      Height: ${height}cm
      Age: ${age}
      Gender: ${gender}
      Activity Level: ${activityLevel}
      Goal: ${goal}
      Family History: ${familyHistory}
      Metabolism Type: ${metabolism}
      
      Return ONLY valid JSON with this exact structure, no markdown, no extra text:
      {
        "idealWeight": 70,
        "recommendedCalories": 2200,
        "dietPlan": {
          "breakfast": "High-protein breakfast suggestions",
          "lunch": "Balanced lunch suggestions",
          "dinner": "Light dinner suggestions",
          "snacks": "Healthy snack suggestions"
        },
        "workoutPlan": {
          "cardio": ["Running", "Cycling"],
          "strength": ["Squats", "Push-ups"],
          "frequency": "4 times per week",
          "duration": "45 minutes per session"
        },
        "geneticFactors": ["Factor 1", "Factor 2"],
        "timeframe": "12 weeks",
        "healthTips": ["Tip 1", "Tip 2", "Tip 3"]
      }`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanGeminiResponse(text);
      return JSON.parse(cleanedText);
      
    } catch (error) {
      console.error('BMI recommendations error:', error);
      return this.getMockBMIRecommendations(bmi, goal);
    }
  }

  // ============ HELPER METHODS ============

  // Helper to clean Gemini response (remove markdown, extra text)
  private cleanGeminiResponse(text: string): string {
    // Remove markdown code blocks (```json, ```)
    let cleaned = text.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/gi, '');
    
    // Remove any text before first { and after last }
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd);
    }
    
    // Remove any extra whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // ============ MOCK DATA METHODS ============

  private getMockFoodData(): AIResult {
    return {
      foodItems: ['Chicken', 'Rice', 'Vegetables'],
      estimatedCalories: 450,
      estimatedProtein: 35,
      estimatedCarbs: 40,
      estimatedFat: 15,
      confidence: 'high',
      mealType: 'Lunch'
    };
  }

  private getMockBMIRecommendations(bmi: number, goal: string): BMIRecommendation {
    const recommendations = {
      underweight: {
        idealWeight: 65,
        recommendedCalories: 2500,
        dietPlan: {
          breakfast: "Oatmeal with nuts, honey, and whole milk + 2 boiled eggs",
          lunch: "Chicken rice bowl with avocado, cheese, and mixed vegetables",
          dinner: "Salmon with sweet potato mash and steamed broccoli with olive oil",
          snacks: "Protein shake with banana, Greek yogurt with honey, handful of almonds"
        },
        workoutPlan: {
          cardio: ["Light jogging 20 min", "Swimming 30 min", "Cycling 25 min"],
          strength: ["Squats 3x12", "Bench press 3x10", "Deadlifts 3x8", "Pull-ups 3x max"],
          frequency: "3-4 times per week",
          duration: "45-60 minutes per session"
        },
        geneticFactors: ["High basal metabolic rate", "Fast-digesting system", "Naturally lean body type"],
        timeframe: "8-12 weeks to gain 2-4 kg",
        healthTips: ["Eat every 3-4 hours", "Include healthy fats like avocado and nuts", "Track calorie intake to ensure surplus", "Focus on compound exercises"]
      },
      normal: {
        idealWeight: 70,
        recommendedCalories: 2200,
        dietPlan: {
          breakfast: "Greek yogurt with berries, granola and honey + protein smoothie",
          lunch: "Grilled chicken salad with quinoa, mixed greens, and olive oil dressing",
          dinner: "Baked fish with roasted vegetables and 1 cup brown rice",
          snacks: "Apple with almond butter, protein bar, carrot sticks with hummus"
        },
        workoutPlan: {
          cardio: ["Running 30 min", "Cycling 40 min", "HIIT workouts 20 min", "Jump rope 15 min"],
          strength: ["Full body workouts", "Push-pull split", "Core exercises", "Functional training"],
          frequency: "4-5 times per week",
          duration: "50-60 minutes per session"
        },
        geneticFactors: ["Balanced metabolism", "Average muscle gain potential", "Moderate fat storage tendency"],
        timeframe: "Maintain current weight within 2kg range",
        healthTips: ["Stay consistent with workouts", "Balance cardio and strength training", "Stay hydrated (3-4L daily)", "Get 7-8 hours sleep"]
      },
      overweight: {
        idealWeight: 68,
        recommendedCalories: 1800,
        dietPlan: {
          breakfast: "Protein shake with spinach and berries + 1 boiled egg",
          lunch: "Turkey wrap with whole wheat tortilla, lettuce, tomato and avocado",
          dinner: "Lean beef stir-fry with mixed vegetables and 1/2 cup brown rice",
          snacks: "Carrot sticks, Greek yogurt, cucumber slices, rice cakes"
        },
        workoutPlan: {
          cardio: ["Brisk walking 45 min", "Swimming 40 min", "Elliptical 35 min", "Dancing 30 min"],
          strength: ["Resistance band exercises", "Bodyweight circuit training", "Light weights high reps", "Core stabilization"],
          frequency: "5-6 times per week",
          duration: "50-60 minutes per session"
        },
        geneticFactors: ["Slow metabolism", "Carbohydrate sensitive", "Tendency for abdominal fat storage"],
        timeframe: "16 weeks to lose 8-10 kg",
        healthTips: ["Reduce added sugar intake", "Increase protein to 30% of calories", "Track portion sizes", "Include fiber in every meal"]
      }
    };

    let category = 'normal';
    if (bmi < 18.5) category = 'underweight';
    else if (bmi >= 25) category = 'overweight';

    return recommendations[category as keyof typeof recommendations] as BMIRecommendation;
  }
}

export default new GeminiService();