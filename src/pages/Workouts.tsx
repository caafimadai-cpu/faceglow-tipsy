import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, Heart, Zap, Target, Timer, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  imageUrl: string;
  gifUrl?: string;
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
    imageUrl: "https://media.giphy.com/media/Kajbn3MgRxVPa/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX6OBy/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/xT8qBff8cRRFf7k2u4/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/23hPPMRgPxbNBlPQe3/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/l0HlRFpFpRzpPKVoc/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/bReZVG0k9hM5q/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/7YCC7gFhkiPvBfy2BB/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/7YCC7gFhkiPvBfy2BB/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/3o7qDQ5iw1oXyDeJAk/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/5t9IcXiBCyw60XPpGu/giphy.gif",
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

const ExerciseImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  return (
    <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded-t-lg">
      <img 
        src={imageUrl} 
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

const Workouts = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

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
              <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} />
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
