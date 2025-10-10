import React from 'react';
import { Droplet, Sun, Shield, Sparkles, AlertCircle, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ results }) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="analysis-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('hydration')}</h3>
            <Droplet className="w-5 h-5 text-primary" />
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${results.hydration}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {results.hydration}%
          </p>
        </div>

        {results.clarity !== undefined && (
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('clarity')}</h3>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${results.clarity}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.clarity}%
            </p>
          </div>
        )}

        {results.texture !== undefined && (
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('texture')}</h3>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${results.texture}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.texture}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.acne !== undefined && (
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('acne')}</h3>
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${results.acne}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.acne}% ({t('higherIsBetter')})
            </p>
          </div>
        )}

        {results.wrinkles !== undefined && (
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('wrinkles')}</h3>
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${results.wrinkles}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.wrinkles}% ({t('higherIsBetter')})
            </p>
          </div>
        )}

        {results.darkCircles !== undefined && (
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('darkCircles')}</h3>
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${results.darkCircles}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.darkCircles}% ({t('higherIsBetter')})
            </p>
          </div>
        )}
      </div>

      {results.concerns && results.concerns.length > 0 && (
        <div className="analysis-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('skinConcerns')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.concerns.map((concern, index) => (
              <div
                key={index}
                className="p-3 bg-secondary/50 rounded-lg text-sm"
              >
                {concern}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-card">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('recommendations')}</h3>
        </div>
        <div className="space-y-4">
          {results.recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-item">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {index + 1}
              </span>
              <p className="text-sm">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};