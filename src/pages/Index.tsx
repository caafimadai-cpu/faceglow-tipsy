import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      const results = await analyzeImage(file);
      setAnalysisResults(results);
    } catch (error) {
      toast({
        title: t('analysisFailed'),
        description: t('analysisFailedDesc'),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('success'),
      description: t('signedOut'),
    });
  };

  const toggleLanguage = () => {
    const languages = ['en', 'ar', 'so'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {user ? (
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
            >
              {t('signIn')}
            </Button>
          )}
          <Button 
            onClick={toggleLanguage}
            variant="outline"
            size="icon"
            title="Change Language"
          >
            <Globe className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          onClick={() => navigate('/community')}
          variant="outline"
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          {t('community')}
        </Button>
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pageDescription')}
        </p>
      </div>

      <ImageUpload onImageSelect={handleImageSelect} />

      {isAnalyzing && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('analyzing')}</p>
        </div>
      )}

      {!isAnalyzing && analysisResults && (
        <AnalysisResult results={analysisResults} />
      )}
    </div>
  );
};

export default Index;
