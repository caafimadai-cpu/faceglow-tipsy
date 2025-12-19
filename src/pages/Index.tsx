import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { AdSlot } from '@/components/AdSlot';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, LogOut, Globe, Sparkles, ArrowRight, Scan, Shield, Zap } from 'lucide-react';
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

const analyzeImage = async (file: File) => {
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  
  const imageBase64 = await base64Promise;
  
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
  
  return {
    hydration: result.skinHealth?.qoyaan || result.skinHealth?.hydration || 70,
    clarity: result.skinHealth?.nadiifnimo || result.skinHealth?.clarity,
    texture: result.skinHealth?.dhadhanka || result.skinHealth?.texture,
    acne: result.skinHealth?.acne,
    wrinkles: result.skinHealth?.wrinkles,
    darkCircles: result.skinHealth?.darkCircles,
    skinType: result.skinType || null,
    detailedAnalysis: result.detailedAnalysis || null,
    features: result.features || null,
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      await supabase.from('user_credits').insert({
        user_id: user.id,
        upload_count: 0,
        has_paid: false,
      });
      setUploadCount(0);
      setHasPaid(false);
    } else {
      const lastReset = new Date(data.last_reset_at);
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset >= 24 && !data.has_paid) {
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
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to analyze images',
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!hasPaid && uploadCount >= 2) {
      setShowPaymentDialog(true);
      return;
    }

    try {
      setIsAnalyzing(true);
      const results = await analyzeImage(file);
      setAnalysisResults(results);

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

  const features = [
    { icon: Scan, title: 'AI Analysis', desc: 'Advanced skin detection' },
    { icon: Shield, title: 'Privacy First', desc: 'Secure & encrypted' },
    { icon: Zap, title: 'Instant Results', desc: 'Under 5 seconds' },
  ];

  return (
    <div className="min-h-screen grain" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Ambient Background Glow */}
      <div className="hero-glow w-[600px] h-[600px] -top-[300px] left-1/2 -translate-x-1/2 animate-pulse-glow" />
      <div className="hero-glow w-[400px] h-[400px] top-1/2 -left-[200px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold">SkinAI</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={toggleLanguage}
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-secondary"
              >
                <Globe className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={() => navigate('/community')}
                variant="ghost"
                className="hidden sm:flex gap-2 rounded-xl hover:bg-secondary"
              >
                <Users className="w-4 h-4" />
                {t('community')}
              </Button>
              
              {user ? (
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="gap-2 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('signOut')}</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-premium"
                >
                  {t('signIn')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Top Banner Ad */}
        <div className="mb-8">
          <AdSlot type="banner" placement="top-banner" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AdSlot type="skyscraper" placement="left-skyscraper" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-8 animate-fadeIn">
              <div className="space-y-2">
                <div className="floating-badge mx-auto animate-float">
                  <Sparkles className="w-3 h-3" />
                  Powered by Advanced AI
                </div>
              </div>
              
              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight">
                  Discover Your Skin's
                  <span className="block text-gradient">True Potential</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t('pageDescription')}
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border/50 animate-slideUp opacity-0"
                    style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credits Display */}
              {user && (
                <div className="pt-4 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                  {hasPaid ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Unlimited uploads active
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm">
                      <span className="text-muted-foreground">Free uploads:</span>
                      <span className="font-semibold text-foreground">{Math.max(0, 2 - uploadCount)} / 2</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Upload Section */}
            <section className="animate-slideUp opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <ImageUpload onImageSelect={handleImageSelect} />
            </section>

            {/* Middle Ad */}
            <div>
              <AdSlot type="square" placement="middle-square" />
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center gap-6 py-12 animate-fadeIn">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">{t('analyzing')}</p>
                  <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
                </div>
              </div>
            )}

            {/* Results */}
            {!isAnalyzing && analysisResults && (
              <>
                <AnalysisResult results={analysisResults} />
                <div className="mt-8">
                  <AdSlot type="video" placement="post-results-video" />
                </div>
              </>
            )}

            {/* Bottom Banner Ad */}
            <div className="pt-8">
              <AdSlot type="banner" placement="bottom-banner" />
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-[300px]">
            <div className="sticky top-24 space-y-8">
              <AdSlot type="square" placement="right-square-1" />
              <AdSlot type="video" placement="right-video" />
              <AdSlot type="square" placement="right-square-2" />
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-serif text-sm">SkinAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SkinAI. Advanced skin analysis powered by AI.
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Unlock Unlimited Access</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You've used your 2 free uploads. Upgrade for unlimited scans and community access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unlimited Plan</span>
                <span className="text-lg font-semibold text-primary">$1</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited skin analyses</li>
                <li>• Community membership</li>
                <li>• Priority support</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">EVC Plus Phone Number</Label>
              <Input
                id="phone"
                placeholder="252xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="rounded-xl bg-secondary border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowPaymentDialog(false)}
              className="rounded-xl"
            >
              Wait 24 Hours
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!phoneNumber || isProcessingPayment}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground btn-premium"
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
