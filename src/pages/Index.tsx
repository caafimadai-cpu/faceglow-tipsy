import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Simulated AI analysis function (replace with actual AI implementation)
const analyzeImage = async (file: File) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock results (replace with actual AI analysis)
  return {
    score: 85,
    hydration: 70,
    concerns: [
      "Slight dehydration in T-zone",
      "Minor texture around chin",
      "Early signs of sun damage",
      "Uneven skin tone"
    ],
    recommendations: [
      "Increase water intake to improve skin hydration",
      "Add a hyaluronic acid serum to your routine",
      "Use broad-spectrum SPF 30+ daily",
      "Consider adding vitamin C serum for evening skin tone",
      "Gentle exfoliation twice weekly"
    ]
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
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Facial Analysis</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your photo for a detailed analysis of your skin health and personalized recommendations
        </p>
      </div>

      <ImageUpload onImageSelect={handleImageSelect} />

      {isAnalyzing && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing your image...</p>
        </div>
      )}

      {!isAnalyzing && analysisResults && (
        <AnalysisResult results={analysisResults} />
      )}
    </div>
  );
};

export default Index;