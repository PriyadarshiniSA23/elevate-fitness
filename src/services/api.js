// Mock Data Service for ELEVATE Fitness
// Ready to be linked to Node.js + Express + MySQL REST endpoints in the future

export const mockPrograms = [
  {
    id: "personal-training",
    title: "Personal Training",
    price: 499,
    duration: "60 min",
    category: "strength",
    tier: "Standard",
    description: "Elite 1-on-1 coaching tailored specifically to your biological profile and physical goals.",
    image: "/images/personal_training.png"
  },
  {
    id: "strength-conditioning",
    title: "Strength & Conditioning",
    price: 699,
    duration: "75 min",
    category: "strength",
    tier: "Gold",
    description: "Build absolute power, structural integrity, and athletic resilience through scientific periodization.",
    image: "/images/strength_conditioning.png"
  },
  {
    id: "weight-loss",
    title: "Weight Loss Program",
    price: 599,
    duration: "60 min",
    category: "weight-loss",
    tier: "Standard",
    description: "Optimize body composition, accelerate metabolic rate, and sustain fat loss via personalized cardio and diet structure.",
    image: "/images/weight_loss.png"
  },
  {
    id: "hiit",
    title: "HIIT Training",
    price: 399,
    duration: "45 min",
    category: "weight-loss",
    tier: "Standard",
    description: "High-intensity interval protocols focused on cardiovascular conditioning and maximizing calorie afterburn.",
    image: "/images/hiit.png"
  },
  {
    id: "functional-fitness",
    title: "Functional Fitness",
    price: 449,
    duration: "60 min",
    category: "strength",
    tier: "Standard",
    description: "Enhance multi-planar movement, core strength, stability, and coordination for life and sport.",
    image: "/images/functional_fitness.png"
  },
  {
    id: "group-fitness",
    title: "Group Fitness Classes",
    price: 299,
    duration: "60 min",
    category: "wellness",
    tier: "Standard",
    description: "Dynamic, community-centric group classes led by expert instructors for high energy and motivation.",
    image: "/images/group_fitness.png"
  },
  {
    id: "yoga-wellness",
    title: "Yoga & Wellness",
    price: 499,
    duration: "60 min",
    category: "wellness",
    tier: "Silver",
    description: "Find equilibrium, mindfulness, and flexibility with restorative yoga flows and meditation.",
    image: "/images/yoga_wellness.png"
  },
  {
    id: "sports-performance",
    title: "Sports Performance Training",
    price: 899,
    duration: "90 min",
    category: "strength",
    tier: "Gold",
    description: "Elite agility drills, power development, and custom conditioning geared for competitive athletes.",
    image: "/images/sports_performance.png"
  },
  {
    id: "nutrition-coaching",
    title: "Nutrition Coaching & Lifestyle Management",
    price: 349,
    duration: "45 min",
    category: "wellness",
    tier: "Silver",
    description: "Work with certified clinical nutritionists to fuel performance, longevity, and overall body vitality.",
    image: "/images/nutrition_coaching.png"
  },
  {
    id: "elite-performance-recovery",
    title: "Elite Performance Assessment & Executive Recovery Program",
    price: 999,
    duration: "90 min",
    category: "wellness",
    tier: "Platinum",
    description: "Full biometric scanning, Vo2 Max analysis, combined with advanced percussion and cold plunge therapy.",
    image: "/images/elite_performance.png"
  }
];


export const mockMemberships = [
  {
    id: "silver-suite",
    title: "Silver Suite",
    price: 1999,
    features: [
      "Eligible to book after Discovery Sessions",
      "5% discount on every booking",
      "Access to Silver Exclusive Trainers & Programs",
      "Standard booking slots",
      "Digital Membership Card",
      "Monthly member offers",
      "1 complimentary trainer consultation monthly",
      "1 free booking reschedule monthly"
    ],
    isPopular: false
  },
  {
    id: "gold-collective",
    title: "Gold Collective",
    price: 3999,
    features: [
      "All Silver benefits included",
      "10% discount on every booking",
      "Access to Gold Exclusive Trainers & Programs",
      "Priority booking slots",
      "2 complimentary trainer consultations monthly",
      "Monthly progress review",
      "Priority customer support & premium queue"
    ],
    isPopular: true
  },
  {
    id: "platinum-elite",
    title: "Platinum Elite",
    price: 5999,
    features: [
      "All Gold benefits included",
      "15% discount on every booking",
      "Access to ALL Trainers & Programs",
      "VIP booking slots",
      "Unlimited trainer consultations",
      "Monthly fitness assessment & highest rewards",
      "Premium customer support & VIP queue"
    ],
    isPopular: false
  }
];

export const mockTransformations = [
  {
    id: "maria-t",
    name: "Maria T.",
    role: "CEO",
    quote: "Regained the energy I had in my 20s. 16kg lost in 6 months.",
    image: "/images/trans1.png"
  },
  {
    id: "david-k",
    name: "David K.",
    role: "Entrepreneur",
    quote: "From lean to defined. The strength training protocol completely redefined my physique.",
    image: "/images/trans3.png"
  },
  {
    id: "sarah-l",
    name: "Sarah L.",
    role: "Creative Director",
    quote: "More than just a physical change; my energy levels and mental clarity reached new heights. Elevate changed my life.",
    image: "/images/trans2.png"
  }
];

export const mockTestimonials = [
  {
    name: "Elena R.",
    role: "Executive Member",
    content: "The level of bespoke programming here is unmatched. It's not just about the workout; it's about optimizing every facet of my performance and lifestyle."
  },
  {
    name: "James W.",
    role: "Performance Athlete",
    content: "Elevate has completely redefined what I thought was possible for my health. The elite coaching and data-driven approach have pushed me to peak performance."
  },
  {
    name: "Sophia M.",
    role: "Longevity Client",
    content: "A sanctuary for those who demand the best. The environment is refined, the trainers are world-class, and the results are undeniable."
  }
];

export const mockDashboardData = {
  biometrics: {
    restingHeartRate: "54 bpm",
    avgDailyBurn: "840 kcal",
    attendanceThisMonth: "18 Days",
    monthlyGoalProgress: 85
  },
  billingHistory: [],
  userBookings: []
};

export const mockAdminData = {
  stats: {
    totalMembers: 1200,
    activeTrainers: 10,
    totalPrograms: 10,
    dailyBookings: 114,
    monthlyRevenue: "₹18.4L"
  },
  liveActivity: [
    { id: 1, type: "member", message: "New Platinum Member", detail: "Arjun Mehta joined 10m ago" },
    { id: 2, type: "session", message: "Session Completed", detail: "Sienna's Yoga flow finished" },
    { id: 3, type: "payment", message: "Payment Received", detail: "₹15,000 from Priya K." }
  ],
  liveSchedule: [
    { id: 1, member: "Vikram Singh", coach: "Marcus Sterling", program: "Elite HIIT", time: "Today, 04:00 PM", status: "Confirmed" },
    { id: 2, member: "Priya Kapoor", coach: "Dr. Julian Reed", program: "Nutrition Coaching", time: "Today, 05:30 PM", status: "Confirmed" },
    { id: 3, member: "Arjun Mehta", coach: "Sienna Blake", program: "Weight Loss Session", time: "Tomorrow, 08:00 AM", status: "Confirmed" }
  ],
  paymentsLedger: {
    totalRevenue: "₹18.4L",
    pendingInvoices: "₹45,000",
    successfulTransactions: 1248,
    transactions: [
      { member: "Arjun Mehta", amount: 15000, date: "Today, 10:45 AM", status: "SUCCESSFUL" },
      { member: "Priya K.", amount: 8500, date: "Yesterday", status: "SUCCESSFUL" },
      { member: "Rohan S.", amount: 12000, date: "24 Oct", status: "PENDING" }
    ]
  }
};
