import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Real AI analysis using RapidAPI
const analyzeImage = async (file: File) => {
  // Convert image to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  
  const imageBase64 = await base64Promise;
  
  // Call the edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-face`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ imageBase64 }),
    }
  );

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const result = await response.json();
  
  // Transform to component format - handle both Somali and English field names
  return {
    hydration: result.skinHealth?.qoyaan || result.skinHealth?.hydration || 70,
    clarity: result.skinHealth?.nadiifnimo || result.skinHealth?.clarity,
    texture: result.skinHealth?.dhadhanka || result.skinHealth?.texture,
    acne: result.skinHealth?.acne,
    wrinkles: result.skinHealth?.wrinkles,
    darkCircles: result.skinHealth?.darkCircles,
    concerns: result.walaacyo || [],
    recommendations: result.talooyinka || result.recommendations || []
  };
};

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      const results = await analyzeImage(file);
      setAnalysisResults(results);
    } catch (error) {
      toast({
        title: "Falanqayntu Waa Fashilantay",
        description: "Waxaa jirtay khalad la falanqaynaya sawirkaaga. Fadlan mar kale isku day.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Falanqaynta Wejiga</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Soo rar sawirkaaga si aad u hesho falanqayn faahfaahsan oo ku saabsan caafimaadka maqaarkaaga iyo talooyinka gaarka ah
        </p>
      </div>

      <ImageUpload onImageSelect={handleImageSelect} />

      {isAnalyzing && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Sawirkaaga waan ku falanqaynaynaa...</p>
        </div>
      )}

      {!isAnalyzing && analysisResults && (
        <AnalysisResult results={analysisResults} />
      )}
    </div>
  );
};

export default Index;