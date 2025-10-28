import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { AdSlot } from '@/components/AdSlot';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [uploadCount, setUploadCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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

  // Fetch user credits
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      return;
    }

    if (!data) {
      // Create initial credits record
      await supabase.from('user_credits').insert({
        user_id: user.id,
        upload_count: 0,
        has_paid: false,
      });
      setUploadCount(0);
      setHasPaid(false);
    } else {
      // Check if 24 hours have passed since last reset
      const lastReset = new Date(data.last_reset_at);
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset >= 24 && !data.has_paid) {
        // Reset upload count
        await supabase
          .from('user_credits')
          .update({ upload_count: 0, last_reset_at: now.toISOString() })
          .eq('user_id', user.id);
        setUploadCount(0);
      } else {
        setUploadCount(data.upload_count);
      }
      setHasPaid(data.has_paid);
    }
  };

  const handleImageSelect = async (file: File) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to analyze images',
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check credits
    if (!hasPaid && uploadCount >= 2) {
      setShowPaymentDialog(true);
      return;
    }

    try {
      setIsAnalyzing(true);
      const results = await analyzeImage(file);
      setAnalysisResults(results);

      // Increment upload count
      await supabase
        .from('user_credits')
        .update({ upload_count: uploadCount + 1 })
        .eq('user_id', user.id);
      
      setUploadCount(uploadCount + 1);
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

  const handlePayment = async () => {
    if (!phoneNumber || !user) return;

    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('hormuud-payment', {
        body: {
          communityId: 'unlimited-uploads',
          userId: user.id,
          amount: 1,
          phoneNumber: phoneNumber,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Update credits to show payment completed
        await supabase
          .from('user_credits')
          .update({ has_paid: true, upload_count: 0 })
          .eq('user_id', user.id);

        setHasPaid(true);
        setUploadCount(0);
        setShowPaymentDialog(false);
        setPhoneNumber('');

        toast({
          title: 'Payment Successful',
          description: 'You now have unlimited uploads and community access!',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Please try again',
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
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

        {/* Top Banner Ad */}
        <div className="mb-8">
          <AdSlot type="banner" id="top-banner-ad" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Skyscraper Ad (Desktop Only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <AdSlot type="skyscraper" id="left-skyscraper-ad" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">{t('pageTitle')}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('pageDescription')}
              </p>
              {user && !hasPaid && (
                <p className="text-sm text-muted-foreground">
                  Uploads remaining: {Math.max(0, 2 - uploadCount)} / 2 (Free tier - resets in 24h)
                </p>
              )}
              {user && hasPaid && (
                <p className="text-sm text-primary font-medium">
                  ✓ Unlimited uploads active
                </p>
              )}
            </div>

            <ImageUpload onImageSelect={handleImageSelect} />

            {/* Middle Ad - Square/Video */}
            <div className="my-8">
              <AdSlot type="square" id="middle-square-ad" />
            </div>

            {isAnalyzing && (
              <div className="flex flex-col items-center gap-4 animate-fadeIn">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t('analyzing')}</p>
              </div>
            )}

            {!isAnalyzing && analysisResults && (
              <>
                <AnalysisResult results={analysisResults} />
                
                {/* Video Ad After Results */}
                <div className="mt-8">
                  <AdSlot type="video" id="post-results-video-ad" />
                </div>
              </>
            )}

            {/* Bottom Banner Ad */}
            <div className="mt-12">
              <AdSlot type="banner" id="bottom-banner-ad" />
            </div>
          </main>

          {/* Right Sidebar - Square Ads (Desktop Only) */}
          <aside className="hidden lg:block w-[300px]">
            <div className="sticky top-8 space-y-8">
              <AdSlot type="square" id="right-square-ad-1" />
              <AdSlot type="video" id="right-video-ad" />
              <AdSlot type="square" id="right-square-ad-2" />
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Unlimited Uploads</DialogTitle>
            <DialogDescription>
              You've used your 2 free uploads. Pay $1 to get unlimited uploads and join the community!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">EVC Plus Phone Number</Label>
              <Input
                id="phone"
                placeholder="252xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Or wait 24 hours for your free uploads to reset.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Wait 24 Hours
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!phoneNumber || isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay $1 via EVC Plus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
