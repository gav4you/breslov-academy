import React, { useState, useEffect } from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Calendar, ArrowRight, Book } from 'lucide-react';
import { getDafYomi } from '@/utils/jewishCalc';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function DafYomi() {
  const [today] = useState(new Date());
  const daf = getDafYomi(today);
  const [isLearned, setIsLearned] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load state
  useEffect(() => {
    let mounted = true;
    db.getDafProgress(daf.masechet, daf.daf).then(status => {
      if (mounted) {
        setIsLearned(status);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [daf]);

  const handleMarkLearned = async () => {
    if (isLearned) return; // Already done
    
    try {
      await db.markDaf(daf.masechet, daf.daf, true);
      setIsLearned(true);
      toast.success("Mazal Tov! XP earned.");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      toast.error("Failed to save progress");
    }
  };

  if (loading) return <PageShell title="Daf Yomi" subtitle="Loading..." />;

  return (
    <PageShell title="Daf Yomi Tracker" subtitle="Daily Talmud study tracking">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Learning Card */}
        <Card className="col-span-1 lg:col-span-2 border-indigo-100 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <BookOpen className="h-6 w-6" />
              Today's Shiur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-4xl font-serif font-bold text-indigo-950 mb-1">
                  {daf.masechet} {daf.daf}
                </h2>
                <p className="text-slate-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(today, 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
              <Button 
                size="lg" 
                className={isLearned ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                onClick={handleMarkLearned}
                disabled={isLearned}
              >
                {isLearned ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Completed
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Mark as Learned
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Book className="h-4 w-4" />
                Masechet Progress
              </h3>
              <Progress value={isLearned ? 46 : 45} className="h-3" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Page 2</span>
                <span>Page 64</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between group">
              Open Text (Sefaria)
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="outline" className="w-full justify-between group">
              Video Shiur (Rabbi Rosner)
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="outline" className="w-full justify-between group">
              Audio Shiur (Daf Hachaim)
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}