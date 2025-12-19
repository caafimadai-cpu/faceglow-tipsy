import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HealthReportExportProps {
  userId: string;
}

export const HealthReportExport: React.FC<HealthReportExportProps> = ({ userId }) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDFReport = async () => {
    setGenerating(true);
    
    try {
      // Fetch all health data
      const [vitaminRes, gutRes, bodyRes, goalsRes] = await Promise.all([
        supabase.from('vitamin_logs').select('*').eq('user_id', userId).order('taken_at', { ascending: false }).limit(30),
        supabase.from('gut_health_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
        supabase.from('body_health_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
        supabase.from('health_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      const vitamins = vitaminRes.data || [];
      const gutHealth = gutRes.data || [];
      const bodyHealth = bodyRes.data || [];
      const goals = goalsRes.data || [];

      // Get AI analysis
      let aiAnalysis = null;
      try {
        const { data, error } = await supabase.functions.invoke('analyze-health', {
          method: 'POST',
        });
        if (!error && data) {
          aiAnalysis = data;
        }
      } catch (e) {
        console.error('AI analysis failed:', e);
      }

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text('Warbixinta Caafimaadka', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Subtitle with date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Taariikhda: ${new Date().toLocaleDateString('so-SO')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // AI Summary Section
      if (aiAnalysis?.summary) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Falanqaynta AI', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const summaryLines = doc.splitTextToSize(aiAnalysis.summary, pageWidth - 28);
        doc.text(summaryLines, 14, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // AI Insights
      if (aiAnalysis?.insights?.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Aragtiyo Muhiim ah:', 14, yPos);
        yPos += 8;

        aiAnalysis.insights.forEach((insight: any) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(10);
          doc.setTextColor(insight.type === 'positive' ? 34 : insight.type === 'warning' ? 180 : 60, 
                          insight.type === 'positive' ? 139 : insight.type === 'warning' ? 83 : 60, 
                          insight.type === 'positive' ? 34 : insight.type === 'warning' ? 9 : 60);
          doc.text(`• ${insight.title}`, 14, yPos);
          yPos += 5;
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(insight.description, pageWidth - 32);
          doc.text(descLines, 18, yPos);
          yPos += descLines.length * 4 + 5;
        });
        yPos += 5;
      }

      // AI Recommendations
      if (aiAnalysis?.recommendations?.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Talooyinka:', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        aiAnalysis.recommendations.forEach((rec: string, i: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const recLines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 28);
          doc.text(recLines, 14, yPos);
          yPos += recLines.length * 4 + 3;
        });
        yPos += 10;
      }

      // Health Goals Section
      if (goals.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Hadafyada Caafimaadka', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Hadafka', 'Nooca', 'Hadafka', 'Hadda', 'Horumar']],
          body: goals.map(g => [
            g.title,
            g.goal_type,
            `${g.target_value} ${g.unit}`,
            `${g.current_value || 0} ${g.unit}`,
            `${Math.round(((g.current_value || 0) / g.target_value) * 100)}%`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Vitamins Section
      if (vitamins.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Fitamiinka La Qaatay', 14, yPos);
        yPos += 8;

        // Vitamin frequency chart data
        const vitaminCounts: Record<string, number> = {};
        vitamins.forEach(v => {
          vitaminCounts[v.vitamin_name] = (vitaminCounts[v.vitamin_name] || 0) + 1;
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Fitamiinka', 'Tirada Qaadashada', 'Qiyaasta']],
          body: Object.entries(vitaminCounts).map(([name, count]) => {
            const lastDosage = vitamins.find(v => v.vitamin_name === name)?.dosage || '-';
            return [name, count.toString(), lastDosage];
          }),
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Gut Health Section
      if (gutHealth.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Caafimaadka Mindhicirka', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Taariikhda', 'Dheefshiid', 'Baruurta', 'Biyaha (L)', 'Probiotic']],
          body: gutHealth.map(g => [
            new Date(g.date).toLocaleDateString('so-SO'),
            g.digestion_score ? `${g.digestion_score}/10` : '-',
            g.bloating_level ? `${g.bloating_level}/10` : '-',
            g.water_intake_liters?.toString() || '-',
            g.probiotic_taken ? 'Haa' : 'Maya'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Calculate averages
        const avgDigestion = gutHealth.filter(g => g.digestion_score).reduce((sum, g) => sum + (g.digestion_score || 0), 0) / gutHealth.filter(g => g.digestion_score).length || 0;
        const avgBloating = gutHealth.filter(g => g.bloating_level).reduce((sum, g) => sum + (g.bloating_level || 0), 0) / gutHealth.filter(g => g.bloating_level).length || 0;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Celceliska Dheefshiidka: ${avgDigestion.toFixed(1)}/10 | Celceliska Baruurta: ${avgBloating.toFixed(1)}/10`, 14, yPos);
        yPos += 15;
      }

      // Body Health Section
      if (bodyHealth.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Caafimaadka Jirka', 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [['Taariikhda', 'Tamar', 'Hurdo', 'Tayada', 'Walbahar', 'Jimicsi']],
          body: bodyHealth.map(b => [
            new Date(b.date).toLocaleDateString('so-SO'),
            b.energy_level ? `${b.energy_level}/10` : '-',
            b.sleep_hours ? `${b.sleep_hours}h` : '-',
            b.sleep_quality ? `${b.sleep_quality}/10` : '-',
            b.stress_level ? `${b.stress_level}/10` : '-',
            b.exercise_minutes ? `${b.exercise_minutes}min` : '-'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Calculate averages
        const avgEnergy = bodyHealth.filter(b => b.energy_level).reduce((sum, b) => sum + (b.energy_level || 0), 0) / bodyHealth.filter(b => b.energy_level).length || 0;
        const avgSleep = bodyHealth.filter(b => b.sleep_hours).reduce((sum, b) => sum + (b.sleep_hours || 0), 0) / bodyHealth.filter(b => b.sleep_hours).length || 0;
        const avgStress = bodyHealth.filter(b => b.stress_level).reduce((sum, b) => sum + (b.stress_level || 0), 0) / bodyHealth.filter(b => b.stress_level).length || 0;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Celceliska: Tamar ${avgEnergy.toFixed(1)}/10 | Hurdo ${avgSleep.toFixed(1)}h | Walbahar ${avgStress.toFixed(1)}/10`, 14, yPos);
        yPos += 15;
      }

      // AI Correlations
      if (aiAnalysis?.correlations?.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Isku-xirnaanshaha La Helay:', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        aiAnalysis.correlations.forEach((corr: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const corrLines = doc.splitTextToSize(`• ${corr}`, pageWidth - 28);
          doc.text(corrLines, 14, yPos);
          yPos += corrLines.length * 4 + 3;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Bogga ${i} / ${pageCount} - Waxaa soo saaray Caafimaad Tracker AI`, pageWidth / 2, 290, { align: 'center' });
      }

      // Save the PDF
      doc.save(`warbixinta-caafimaadka-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({ 
        title: 'Warbixinta Waa La Soo Saaray!', 
        description: 'PDF-ka warbixintaada caafimaadka waa la dejiyay.' 
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ 
        title: 'Khalad', 
        description: 'Wax khalad ah ayaa dhacay markii la soo saarayay warbixinta', 
        variant: 'destructive' 
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDFReport} 
      disabled={generating}
      className="gap-2"
      variant="outline"
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Waa la soo saaraa...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Soo Saari PDF
        </>
      )}
    </Button>
  );
};
