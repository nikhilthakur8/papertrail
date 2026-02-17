import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { papersAPI } from '@/lib/api';
import { RESEARCH_DOMAINS, READING_STAGES, IMPACT_SCORES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { PlusCircle, User, BarChart, FileText, Calendar } from 'lucide-react';

const AddPaperPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [firstAuthor, setFirstAuthor] = useState('');
  const [researchDomain, setResearchDomain] = useState(RESEARCH_DOMAINS[0]);
  const [readingStage, setReadingStage] = useState(READING_STAGES[0]);
  const [citationCount, setCitationCount] = useState('0');
  const [impactScore, setImpactScore] = useState(IMPACT_SCORES[1]); // Medium Impact default
  const [dateAdded, setDateAdded] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !firstAuthor) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least a title and author.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await papersAPI.create({
        title,
        firstAuthor,
        researchDomain,
        readingStage,
        citationCount: parseInt(citationCount) || 0,
        impactScore,
        dateAdded,
      });
      
      toast({
        title: 'Success',
        description: 'New paper added to your library.',
      });
      navigate('/library');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the paper. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <PlusCircle className="h-6 w-6 text-primary" />
           </div>
           <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Add New Paper</h1>
              <p className="text-zinc-500 text-sm">Log a new research paper into your collection.</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Paper Title</Label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input
                  id="title"
                  placeholder="The impact of AI on research..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pl-12 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="author" className="text-sm sm:text-base font-bold text-zinc-400 ml-1">First Author</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="author"
                    placeholder="Principal investigator"
                    value={firstAuthor}
                    onChange={(e) => setFirstAuthor(e.target.value)}
                    className="pl-12 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Research Domain</Label>
                <Select value={researchDomain} onValueChange={(v) => setResearchDomain(v as any)}>
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 rounded-xl outline-none text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    {RESEARCH_DOMAINS.map((domain) => (
                      <SelectItem key={domain} value={domain} className="text-sm sm:text-base">{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
                <Label htmlFor="dateAdded" className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Date Added</Label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="dateAdded"
                    type="date"
                    value={dateAdded}
                    onChange={(e) => setDateAdded(e.target.value)}
                    className="pl-12 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base w-full [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                    disabled={isLoading}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Reading Stage</Label>
                <Select value={readingStage} onValueChange={(v) => setReadingStage(v as any)}>
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 rounded-xl outline-none text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    {READING_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage} className="text-sm sm:text-base">{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="citations" className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Citation Count</Label>
                <div className="relative group">
                  <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="citations"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={citationCount}
                    onChange={(e) => setCitationCount(e.target.value)}
                    className="pl-12 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Impact Score</Label>
                <Select value={impactScore} onValueChange={(v) => setImpactScore(v as any)}>
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 rounded-xl outline-none text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    {IMPACT_SCORES.map((score) => (
                      <SelectItem key={score} value={score} className="text-sm sm:text-base">{score}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl text-sm sm:text-base font-bold text-zinc-500 border-zinc-800 hover:bg-zinc-800"
              onClick={() => navigate('/library')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/10 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Adding Paper...' : 'Add Paper'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddPaperPage;
