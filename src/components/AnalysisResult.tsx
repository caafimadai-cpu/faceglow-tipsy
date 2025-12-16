import React from 'react';
import { Droplet, Sun, Shield, Sparkles, AlertCircle, Waves, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AnalysisResultProps {
  results: {
    hydration: number;
    clarity?: number;
    texture?: number;
    acne?: number;
    wrinkles?: number;
    darkCircles?: number;
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

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {primaryMetrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value as number}
            icon={metric.icon}
            delay={index * 0.1}
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
              delay={0.3 + index * 0.1}
            />
          ))}
        </div>
      )}

      {/* Skin Concerns */}
      {results.concerns && results.concerns.length > 0 && (
        <div 
          className="analysis-card animate-slideUp opacity-0"
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
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
        style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
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
