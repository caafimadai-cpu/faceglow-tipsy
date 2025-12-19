import React from 'react';
import { Droplet, Sun, Shield, Sparkles, AlertCircle, Waves, TrendingUp, Droplets, Flame, CircleDot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SkinTypeData {
  type: 'oily' | 'dry' | 'combination' | 'normal';
  confidence: number;
  indicators: string[];
  tZone: string;
  cheeks: string;
}

interface DetailedAnalysis {
  oilLevel: string;
  dryness: string;
  poreSize: string;
  overallCondition: string;
}

interface Features {
  midabMaqaarka: string;
  daQiyaas: number;
  nooMaqaarka: string;
}

interface AnalysisResultProps {
  results: {
    hydration: number;
    clarity?: number;
    texture?: number;
    acne?: number;
    wrinkles?: number;
    darkCircles?: number;
    skinType?: SkinTypeData;
    detailedAnalysis?: DetailedAnalysis;
    features?: Features;
    concerns?: string[];
    recommendations: string[];
  };
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  delay = 0 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  subtitle?: string;
  delay?: number;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Care';
  };

  return (
    <div 
      className="analysis-card animate-slideUp opacity-0"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className={cn("text-4xl font-serif font-bold", getScoreColor(value))}>
            {value}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            {getScoreLabel(value)}
          </div>
        </div>
        
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${value}%`, transitionDelay: `${delay + 0.3}s` }}
          />
        </div>
      </div>
    </div>
  );
};

const SkinTypeCard = ({ skinType, features }: { skinType: SkinTypeData; features?: Features }) => {
  const getSkinTypeIcon = (type: string) => {
    switch (type) {
      case 'oily': return Droplets;
      case 'dry': return Flame;
      case 'combination': return CircleDot;
      default: return Sparkles;
    }
  };

  const getSkinTypeColor = (type: string) => {
    switch (type) {
      case 'oily': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'dry': return 'from-orange-500/20 to-red-500/20 border-orange-500/40';
      case 'combination': return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      default: return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
    }
  };

  const getSkinTypeLabel = (type: string) => {
    switch (type) {
      case 'oily': return 'Oily Skin';
      case 'dry': return 'Dry Skin';
      case 'combination': return 'Combination Skin';
      default: return 'Normal Skin';
    }
  };

  const getSkinTypeSomali = (type: string) => {
    switch (type) {
      case 'oily': return 'Maqaar saliid leh';
      case 'dry': return 'Maqaar qallalan';
      case 'combination': return 'Maqaar isku dhafan';
      default: return 'Maqaar caadi ah';
    }
  };

  const Icon = getSkinTypeIcon(skinType.type);

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 animate-slideUp opacity-0 bg-gradient-to-br",
        getSkinTypeColor(skinType.type)
      )}
      style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Skin Type</p>
            <h2 className="text-3xl font-serif font-bold">{getSkinTypeLabel(skinType.type)}</h2>
            <p className="text-sm text-muted-foreground">{getSkinTypeSomali(skinType.type)}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <div className="flex-1 h-2 bg-background/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${skinType.confidence}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{skinType.confidence}%</span>
        </div>

        {/* Zone Analysis */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-1">T-Zone</p>
            <p className="text-sm font-medium capitalize">{skinType.tZone}</p>
          </div>
          <div className="p-3 rounded-xl bg-background/30 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-1">Cheeks</p>
            <p className="text-sm font-medium capitalize">{skinType.cheeks}</p>
          </div>
        </div>

        {/* Indicators */}
        {skinType.indicators && skinType.indicators.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Detected Indicators:</p>
            <div className="flex flex-wrap gap-2">
              {skinType.indicators.map((indicator, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-background/40 backdrop-blur-sm text-xs font-medium"
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {features && (
          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Estimated Age</p>
                <p className="text-xl font-serif font-bold">{features.daQiyaas} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skin Tone</p>
                <p className="text-sm font-medium">{features.midabMaqaarka}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailedAnalysisCard = ({ analysis }: { analysis: DetailedAnalysis }) => {
  return (
    <div 
      className="analysis-card animate-slideUp opacity-0"
      style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold">Detailed Analysis</h3>
          <p className="text-xs text-muted-foreground">In-depth skin condition</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">Oil Level</p>
          <p className="text-sm font-semibold capitalize">{analysis.oilLevel}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">Dryness</p>
          <p className="text-sm font-semibold capitalize">{analysis.dryness}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">Pore Size</p>
          <p className="text-sm font-semibold capitalize">{analysis.poreSize}</p>
        </div>
      </div>

      {analysis.overallCondition && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
          <p className="text-sm leading-relaxed">{analysis.overallCondition}</p>
        </div>
      )}
    </div>
  );
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ results }) => {
  const { t } = useTranslation();
  
  const primaryMetrics = [
    { key: 'hydration', title: t('hydration'), value: results.hydration, icon: Droplet },
    { key: 'clarity', title: t('clarity'), value: results.clarity, icon: Sparkles },
    { key: 'texture', title: t('texture'), value: results.texture, icon: Shield },
  ].filter(m => m.value !== undefined);

  const secondaryMetrics = [
    { key: 'acne', title: t('acne'), value: results.acne, icon: AlertCircle, subtitle: t('higherIsBetter') },
    { key: 'wrinkles', title: t('wrinkles'), value: results.wrinkles, icon: Waves, subtitle: t('higherIsBetter') },
    { key: 'darkCircles', title: t('darkCircles'), value: results.darkCircles, icon: AlertCircle, subtitle: t('higherIsBetter') },
  ].filter(m => m.value !== undefined);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Analysis Complete
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Your Skin Analysis</h2>
      </div>

      {/* Skin Type Detection - Most Prominent */}
      {results.skinType && (
        <SkinTypeCard skinType={results.skinType} features={results.features} />
      )}

      {/* Detailed Analysis */}
      {results.detailedAnalysis && (
        <DetailedAnalysisCard analysis={results.detailedAnalysis} />
      )}

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {primaryMetrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value as number}
            icon={metric.icon}
            delay={0.3 + index * 0.1}
          />
        ))}
      </div>

      {/* Secondary Metrics */}
      {secondaryMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secondaryMetrics.map((metric, index) => (
            <MetricCard
              key={metric.key}
              title={metric.title}
              value={metric.value as number}
              icon={metric.icon}
              subtitle={metric.subtitle}
              delay={0.5 + index * 0.1}
            />
          ))}
        </div>
      )}

      {/* Skin Concerns */}
      {results.concerns && results.concerns.length > 0 && (
        <div 
          className="analysis-card animate-slideUp opacity-0"
          style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">{t('skinConcerns')}</h3>
              <p className="text-xs text-muted-foreground">Areas that need attention</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.concerns.map((concern, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-amber-500/30 transition-colors duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div 
        className="analysis-card animate-slideUp opacity-0"
        style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sun className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">{t('recommendations')}</h3>
            <p className="text-xs text-muted-foreground">Personalized skincare tips</p>
          </div>
        </div>
        <div className="space-y-3">
          {results.recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className="recommendation-item group"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
