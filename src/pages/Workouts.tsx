import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, Heart, Zap, Target, Timer, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: string;
  name: string;
  nameSo: string;
  category: string;
  difficulty: "Fudud" | "Dhexe" | "Adag";
  muscles: string[];
  duration: string;
  calories: number;
  instructions: string[];
}

const exercises: Exercise[] = [
  {
    id: "pushups",
    name: "Push-ups",
    nameSo: "Riix-kordhinta",
    category: "Xoogga Jidhka Sare",
    difficulty: "Fudud",
    muscles: ["Laabta", "Garbaha", "Gacanfaraha"],
    duration: "10-15 daqiiqo",
    calories: 100,
    instructions: [
      "Gacmaha dhig dhulka si toos ah",
      "Jirkaaga toosi sida loox",
      "Hoos u dhig ilaa laabta ay dhulka taabato",
      "Kor u riix",
    ],
  },
  {
    id: "squats",
    name: "Squats",
    nameSo: "Fadhiis-kaca",
    category: "Xoogga Jidhka Hoose",
    difficulty: "Fudud",
    muscles: ["Bowdada", "Xabaalaha", "Jilibka"],
    duration: "10-15 daqiiqo",
    calories: 120,
    instructions: [
      "Cagaha u kala fog sida garbaha",
      "Dhabarka toosi",
      "Hoos u fadhiiso sida kursiga",
      "Kor u kac si tartiib ah",
    ],
  },
  {
    id: "lunges",
    name: "Lunges",
    nameSo: "Tallaabo-fadhiis",
    category: "Xoogga Jidhka Hoose",
    difficulty: "Dhexe",
    muscles: ["Bowdada", "Xabaalaha", "Calooshaweyn"],
    duration: "12-15 daqiiqo",
    calories: 130,
    instructions: [
      "Tallaabo weyn hor u qaad",
      "Jilibka dambe dhulka u dhowee",
      "Dhabarka toosi",
      "U beddel lugaha",
    ],
  },
  {
    id: "plank",
    name: "Plank",
    nameSo: "Loox-taagan",
    category: "Wadnaha & Calooshaweyn",
    difficulty: "Dhexe",
    muscles: ["Calooshaweyn", "Dhabarka", "Garbaha"],
    duration: "5-10 daqiiqo",
    calories: 60,
    instructions: [
      "Suxunta gacmaha dhulka saaro",
      "Jirkaaga toosi sida loox",
      "Calooshaweyn adag hay",
      "U hay 30-60 ilbiriqsi",
    ],
  },
  {
    id: "burpees",
    name: "Burpees",
    nameSo: "Bood-fadhiis",
    category: "Jimicsiga Oo Dhan",
    difficulty: "Adag",
    muscles: ["Jirka oo dhan"],
    duration: "10-15 daqiiqo",
    calories: 200,
    instructions: [
      "Fadhiis hoos u dhig",
      "Gacmaha dhulka saaro",
      "Cagaha dib ugu bood",
      "Riix-kordhinta samee",
      "Cagaha soo cel oo kor u bood",
    ],
  },
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    nameSo: "Bood-kala-qaad",
    category: "Wadnaha & Calooshaweyn",
    difficulty: "Fudud",
    muscles: ["Lugaha", "Garbaha", "Wadnaha"],
    duration: "5-10 daqiiqo",
    calories: 80,
    instructions: [
      "Cagaha isku wada dhig",
      "Kor u bood oo cagaha kala qaad",
      "Isku mar gacmaha kor u qaad",
      "Ku soo laabo qaabka hore",
    ],
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    nameSo: "Fuul-buur",
    category: "Wadnaha & Calooshaweyn",
    difficulty: "Adag",
    muscles: ["Calooshaweyn", "Lugaha", "Garbaha"],
    duration: "10-12 daqiiqo",
    calories: 150,
    instructions: [
      "Qaab riix-kordhinta u jooji",
      "Jilbaha si tartiib ah laabta u dhowee",
      "Lugaha si degdeg ah u beddel",
      "Dhabarka sida loox u hay",
    ],
  },
  {
    id: "deadlift",
    name: "Deadlift",
    nameSo: "Rog-culusow",
    category: "Xoogga Jidhka Hoose",
    difficulty: "Adag",
    muscles: ["Dhabarka", "Xabaalaha", "Bowdada"],
    duration: "15-20 daqiiqo",
    calories: 180,
    instructions: [
      "Miisaanka hortaada dhig",
      "Dhabarka toosi oo jilibka laab",
      "Miisaanka kor u qaad",
      "Toosi oo hoos u dhig si tartiib ah",
    ],
  },
  {
    id: "bicep-curls",
    name: "Bicep Curls",
    nameSo: "Laab-culusow",
    category: "Xoogga Jidhka Sare",
    difficulty: "Fudud",
    muscles: ["Murqaha gacanta"],
    duration: "10-12 daqiiqo",
    calories: 70,
    instructions: [
      "Culusowga gacmaha ku hay",
      "Suxunta la jooji",
      "Culusowga garbaha u qaad",
      "Si tartiib ah hoos u dhig",
    ],
  },
  {
    id: "crunches",
    name: "Crunches",
    nameSo: "Laab-calooshaweyn",
    category: "Calooshaweyn",
    difficulty: "Fudud",
    muscles: ["Calooshaweyn"],
    duration: "8-10 daqiiqo",
    calories: 50,
    instructions: [
      "Dhabarka dhulka saaro",
      "Jilibka laab",
      "Gacmaha madaxa dab saaro",
      "Garbaha dhulka ka kor u qaad",
    ],
  },
  {
    id: "leg-raises",
    name: "Leg Raises",
    nameSo: "Kor-u-qaadis-lugaha",
    category: "Calooshaweyn",
    difficulty: "Dhexe",
    muscles: ["Calooshaweyn hoose", "Bowdada"],
    duration: "8-10 daqiiqo",
    calories: 60,
    instructions: [
      "Dhabarka dhulka saaro",
      "Lugaha si toos ah toosi",
      "Lugaha kor u qaad ilaa 90°",
      "Si tartiib ah hoos u dhig",
    ],
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    nameSo: "Maroorsi-ruush",
    category: "Calooshaweyn",
    difficulty: "Dhexe",
    muscles: ["Calooshaweyn dhinacyada"],
    duration: "8-10 daqiiqo",
    calories: 70,
    instructions: [
      "Fadhiiso oo jirkaaga dib u jiid",
      "Cagaha dhulka ka qaad",
      "Gacmahaaga isku wada dhig",
      "Dhinac ilaa dhinac u maroorsi",
    ],
  },
];

const categories = [
  { id: "all", name: "Dhammaan", icon: Dumbbell },
  { id: "upper", name: "Jidhka Sare", icon: Zap },
  { id: "lower", name: "Jidhka Hoose", icon: Target },
  { id: "cardio", name: "Wadnaha", icon: Heart },
  { id: "core", name: "Calooshaweyn", icon: Flame },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Fudud":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Dhexe":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Adag":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ExerciseIllustration = ({ exerciseId, gender }: { exerciseId: string; gender: "male" | "female" }) => {
  const getIllustration = () => {
    const baseColor = gender === "male" ? "#3b82f6" : "#ec4899";
    const skinColor = gender === "male" ? "#d4a574" : "#e8c4a0";
    const clothingColor = gender === "male" ? "#1e40af" : "#be185d";
    
    switch (exerciseId) {
      case "pushups":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="80" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Body in push-up position */}
            <ellipse cx="60" cy="80" rx="15" ry="12" fill={skinColor} /> {/* Head */}
            <rect x="70" y="85" width="80" height="12" rx="6" fill={clothingColor} /> {/* Body */}
            <rect x="145" y="90" width="30" height="8" rx="4" fill={clothingColor} /> {/* Legs */}
            <line x1="55" y1="95" x2="55" y2="112" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Arm */}
            <line x1="85" y1="95" x2="85" y2="112" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Arm */}
            <circle cx="55" cy="112" r="4" fill={skinColor} /> {/* Hand */}
            <circle cx="85" cy="112" r="4" fill={skinColor} /> {/* Hand */}
          </svg>
        );
      case "squats":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="40" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person in squat position */}
            <circle cx="100" cy="25" r="15" fill={skinColor} /> {/* Head */}
            <rect x="85" y="38" width="30" height="35" rx="8" fill={clothingColor} /> {/* Torso */}
            <path d="M85 70 Q70 85 75 100 L85 100 Q90 85 95 75" fill={clothingColor} /> {/* Left leg */}
            <path d="M115 70 Q130 85 125 100 L115 100 Q110 85 105 75" fill={clothingColor} /> {/* Right leg */}
            <rect x="72" y="98" width="18" height="8" rx="3" fill={skinColor} /> {/* Left foot */}
            <rect x="110" y="98" width="18" height="8" rx="3" fill={skinColor} /> {/* Right foot */}
            <line x1="88" y1="50" x2="70" y2="60" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm */}
            <line x1="112" y1="50" x2="130" y2="60" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm */}
          </svg>
        );
      case "lunges":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="60" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person in lunge position */}
            <circle cx="80" cy="20" r="14" fill={skinColor} /> {/* Head */}
            <rect x="68" y="32" width="24" height="40" rx="6" fill={clothingColor} /> {/* Torso */}
            <path d="M75 70 L60 100 L75 100 L85 75" fill={clothingColor} /> {/* Front leg bent */}
            <path d="M85 70 L140 95 L145 105 L135 105 L90 75" fill={clothingColor} /> {/* Back leg extended */}
            <rect x="55" y="98" width="22" height="8" rx="3" fill={skinColor} /> {/* Front foot */}
            <rect x="138" y="100" width="15" height="6" rx="2" fill={skinColor} /> {/* Back foot */}
          </svg>
        );
      case "plank":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="80" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Body in plank position */}
            <circle cx="40" cy="70" r="12" fill={skinColor} /> {/* Head */}
            <rect x="50" y="75" width="90" height="14" rx="7" fill={clothingColor} /> {/* Body */}
            <rect x="135" y="80" width="40" height="10" rx="5" fill={clothingColor} /> {/* Legs */}
            <line x1="55" y1="88" x2="55" y2="112" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm */}
            <line x1="75" y1="88" x2="75" y2="112" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm */}
            <circle cx="55" cy="112" r="4" fill={skinColor} />
            <circle cx="75" cy="112" r="4" fill={skinColor} />
            <rect x="170" y="105" width="12" height="6" rx="2" fill={skinColor} /> {/* Feet */}
          </svg>
        );
      case "burpees":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="40" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person jumping with arms up */}
            <circle cx="100" cy="20" r="14" fill={skinColor} /> {/* Head */}
            <rect x="88" y="32" width="24" height="35" rx="6" fill={clothingColor} /> {/* Torso */}
            <line x1="92" y1="38" x2="75" y2="10" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm up */}
            <line x1="108" y1="38" x2="125" y2="10" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm up */}
            <path d="M90 65 L85 95 L95 95 L98 68" fill={clothingColor} /> {/* Left leg */}
            <path d="M110 65 L115 95 L105 95 L102 68" fill={clothingColor} /> {/* Right leg */}
            <rect x="82" y="93" width="15" height="7" rx="2" fill={skinColor} /> {/* Left foot */}
            <rect x="103" y="93" width="15" height="7" rx="2" fill={skinColor} /> {/* Right foot */}
            {/* Jump lines */}
            <path d="M70 100 L65 110" stroke={baseColor} strokeWidth="2" strokeDasharray="3" opacity="0.5" />
            <path d="M130 100 L135 110" stroke={baseColor} strokeWidth="2" strokeDasharray="3" opacity="0.5" />
          </svg>
        );
      case "jumping-jacks":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="50" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person with arms and legs spread */}
            <circle cx="100" cy="18" r="14" fill={skinColor} /> {/* Head */}
            <rect x="88" y="30" width="24" height="35" rx="6" fill={clothingColor} /> {/* Torso */}
            <line x1="92" y1="38" x2="55" y2="20" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm */}
            <line x1="108" y1="38" x2="145" y2="20" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm */}
            <path d="M92 63 L65 105" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Left leg */}
            <path d="M108 63 L135 105" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Right leg */}
            <circle cx="55" cy="20" r="5" fill={skinColor} />
            <circle cx="145" cy="20" r="5" fill={skinColor} />
            <rect x="58" y="102" width="15" height="7" rx="2" fill={skinColor} />
            <rect x="128" y="102" width="15" height="7" rx="2" fill={skinColor} />
          </svg>
        );
      case "mountain-climbers":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="80" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person in mountain climber position */}
            <circle cx="45" cy="55" r="12" fill={skinColor} /> {/* Head */}
            <rect x="55" y="58" width="70" height="14" rx="7" fill={clothingColor} /> {/* Torso angled */}
            <path d="M70 70 L55 100 L70 100 L80 75" fill={clothingColor} /> {/* Bent leg forward */}
            <path d="M120 68 L165 90 L168 100 L155 100 L125 72" fill={clothingColor} /> {/* Extended leg back */}
            <line x1="55" y1="70" x2="40" y2="105" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm */}
            <line x1="70" y1="70" x2="60" y2="105" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm */}
            <circle cx="40" cy="108" r="4" fill={skinColor} />
            <circle cx="60" cy="108" r="4" fill={skinColor} />
          </svg>
        );
      case "deadlift":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="50" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person lifting barbell */}
            <circle cx="100" cy="20" r="14" fill={skinColor} /> {/* Head */}
            <rect x="88" y="32" width="24" height="40" rx="6" fill={clothingColor} /> {/* Torso */}
            <path d="M90 70 L85 100" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Left leg */}
            <path d="M110 70 L115 100" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Right leg */}
            <line x1="92" y1="45" x2="70" y2="70" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Left arm */}
            <line x1="108" y1="45" x2="130" y2="70" stroke={skinColor} strokeWidth="6" strokeLinecap="round" /> {/* Right arm */}
            {/* Barbell */}
            <rect x="55" y="68" width="90" height="6" rx="3" fill="#6b7280" />
            <rect x="50" y="62" width="12" height="18" rx="3" fill="#374151" />
            <rect x="138" y="62" width="12" height="18" rx="3" fill="#374151" />
            <rect x="78" y="102" width="15" height="7" rx="2" fill={skinColor} />
            <rect x="108" y="102" width="15" height="7" rx="2" fill={skinColor} />
          </svg>
        );
      case "bicep-curls":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="30" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person doing bicep curl */}
            <circle cx="100" cy="18" r="14" fill={skinColor} /> {/* Head */}
            <rect x="88" y="30" width="24" height="42" rx="6" fill={clothingColor} /> {/* Torso */}
            <path d="M92 70 L90 100" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Left leg */}
            <path d="M108 70 L110 100" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" /> {/* Right leg */}
            {/* Left arm curled */}
            <line x1="90" y1="40" x2="70" y2="55" stroke={skinColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="70" y1="55" x2="75" y2="35" stroke={skinColor} strokeWidth="6" strokeLinecap="round" />
            {/* Right arm straight with dumbbell */}
            <line x1="110" y1="40" x2="130" y2="70" stroke={skinColor} strokeWidth="6" strokeLinecap="round" />
            {/* Dumbbells */}
            <rect x="70" y="28" width="12" height="8" rx="2" fill="#6b7280" />
            <rect x="125" y="68" width="12" height="8" rx="2" fill="#6b7280" />
            <rect x="83" y="102" width="14" height="7" rx="2" fill={skinColor} />
            <rect x="103" y="102" width="14" height="7" rx="2" fill={skinColor} />
          </svg>
        );
      case "crunches":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="108" rx="70" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person doing crunch */}
            <circle cx="75" cy="50" r="12" fill={skinColor} /> {/* Head tilted up */}
            <ellipse cx="100" cy="85" rx="35" ry="12" fill={clothingColor} /> {/* Body on ground */}
            <path d="M75 60 Q90 70 95 80" fill={clothingColor} /> {/* Upper body lifting */}
            <path d="M130 85 L150 65 L160 70 L145 95 Z" fill={clothingColor} /> {/* Bent legs */}
            <path d="M145 90 L165 75 L170 80 L155 100 Z" fill={clothingColor} />
            <line x1="72" y1="55" x2="85" y2="45" stroke={skinColor} strokeWidth="5" strokeLinecap="round" /> {/* Arms behind head */}
            <line x1="78" y1="55" x2="90" y2="48" stroke={skinColor} strokeWidth="5" strokeLinecap="round" />
            <rect x="158" y="68" width="12" height="7" rx="2" fill={skinColor} />
            <rect x="165" y="75" width="12" height="7" rx="2" fill={skinColor} />
          </svg>
        );
      case "leg-raises":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="108" rx="70" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person doing leg raises */}
            <circle cx="45" cy="90" r="12" fill={skinColor} /> {/* Head on ground */}
            <rect x="55" y="85" width="50" height="14" rx="7" fill={clothingColor} /> {/* Upper body on ground */}
            <path d="M100 88 L145 30" stroke={clothingColor} strokeWidth="14" strokeLinecap="round" /> {/* Legs raised */}
            <line x1="50" y1="82" x2="35" y2="75" stroke={skinColor} strokeWidth="5" strokeLinecap="round" /> {/* Arms */}
            <line x1="55" y1="82" x2="40" y2="70" stroke={skinColor} strokeWidth="5" strokeLinecap="round" />
            <rect x="140" y="22" width="14" height="8" rx="2" fill={skinColor} /> {/* Feet at top */}
          </svg>
        );
      case "russian-twist":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="50" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            {/* Person in V-sit twisting position */}
            <circle cx="85" cy="35" r="12" fill={skinColor} /> {/* Head */}
            <rect x="80" y="45" width="22" height="30" rx="6" fill={clothingColor} transform="rotate(-15 90 60)" /> {/* Torso angled back */}
            <path d="M95 73 L70 105 L85 105 L100 78" fill={clothingColor} /> {/* Left leg bent up */}
            <path d="M105 73 L130 105 L115 105 L108 78" fill={clothingColor} /> {/* Right leg bent up */}
            {/* Arms extended holding position - twisted to side */}
            <line x1="88" y1="55" x2="55" y2="60" stroke={skinColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="95" y1="55" x2="60" y2="65" stroke={skinColor} strokeWidth="5" strokeLinecap="round" />
            <circle cx="55" cy="62" r="4" fill={skinColor} />
            <rect x="67" y="102" width="15" height="7" rx="2" fill={skinColor} />
            <rect x="118" y="102" width="15" height="7" rx="2" fill={skinColor} />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <ellipse cx="100" cy="115" rx="30" ry="5" fill="hsl(var(--muted))" opacity="0.3" />
            <circle cx="100" cy="25" r="15" fill={skinColor} />
            <rect x="88" y="38" width="24" height="40" rx="6" fill={clothingColor} />
            <path d="M92 76 L88 105" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" />
            <path d="M108 76 L112 105" stroke={clothingColor} strokeWidth="12" strokeLinecap="round" />
            <line x1="90" y1="45" x2="70" y2="65" stroke={skinColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="110" y1="45" x2="130" y2="65" stroke={skinColor} strokeWidth="6" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-32 flex items-center justify-center">
      {getIllustration()}
    </div>
  );
};

const Workouts = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [gender, setGender] = useState<"male" | "female">("male");

  const filteredExercises = exercises.filter((exercise) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "upper") return exercise.category.includes("Sare");
    if (selectedCategory === "lower") return exercise.category.includes("Hoose");
    if (selectedCategory === "cardio") return exercise.category.includes("Wadnaha");
    if (selectedCategory === "core") return exercise.category.includes("Calooshaweyn");
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/health-tracker">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Jimicsiyada</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Gender Toggle */}
        <div className="flex justify-center">
          <Tabs value={gender} onValueChange={(v) => setGender(v as "male" | "female")} className="w-full max-w-xs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="male" className="flex items-center gap-2">
                <span className="text-blue-500">👨</span> Rag
              </TabsTrigger>
              <TabsTrigger value="female" className="flex items-center gap-2">
                <span className="text-pink-500">👩</span> Dumar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">{exercises.length}</div>
            <div className="text-xs text-muted-foreground">Jimicsiyo</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-xs text-muted-foreground">Qaybaha</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-xs text-muted-foreground">Heerarka</div>
          </Card>
        </div>

        {/* Exercise Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`p-4 ${gender === "male" ? "bg-blue-500/10" : "bg-pink-500/10"}`}>
                <ExerciseIllustration exerciseId={exercise.id} gender={gender} />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.nameSo}</CardTitle>
                    <p className="text-sm text-muted-foreground">{exercise.name}</p>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {exercise.muscles.map((muscle, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {exercise.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {exercise.calories} cal
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium mb-2">Sida loo sameeyo:</p>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    {exercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Talooyinka Jimicsiga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Ka hor jimicsiga, si fiican u kululee jirkaaga 5-10 daqiiqo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Biyo badan cab jimicsiga intii lagu jiro
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Neefsashada si sax ah u samee - neefso marka aad xoog isticmaalayso
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Nasasho ku filan sii murqaha inta u dhexeysa jimicsiyada
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Haddii aad dareento xanuun, jooji oo la tasho takhatr
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Workouts;
