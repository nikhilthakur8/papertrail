import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { papersAPI } from '@/lib/api';
import { RESEARCH_DOMAINS, READING_STAGES, IMPACT_SCORES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { FileText, User, Layers, BookMarked, Quote, Star, Calendar, PlusCircle } from 'lucide-react';

const AddPaperPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    firstAuthor: '',
    researchDomain: '',
    readingStage: '',
    citationCount: '',
    impactScore: '',
    dateAdded: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.firstAuthor || !formData.researchDomain || 
        !formData.readingStage || formData.citationCount === '' || !formData.impactScore) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    const citationCount = parseInt(formData.citationCount);
    if (isNaN(citationCount) || citationCount < 0) {
      toast({
        title: 'Validation Error',
        description: 'Citation count must be a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await papersAPI.create({
        title: formData.title,
        firstAuthor: formData.firstAuthor,
        researchDomain: formData.researchDomain,
        readingStage: formData.readingStage,
        citationCount,
        impactScore: formData.impactScore,
        dateAdded: formData.dateAdded,
      });
      
      toast({
        title: 'Paper Added',
        description: 'Your research paper has been added successfully!',
      });
      
      navigate('/library');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add paper',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Add Research Paper
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Track a new research paper by filling in the details below
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paper Details</CardTitle>
            <CardDescription>
              All fields are required to add a paper to your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Paper Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Paper Title
                </Label>
                <Input
                  id="title"
                  placeholder="Write the paper title here..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* First Author */}
              <div className="space-y-2">
                <Label htmlFor="firstAuthor" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  First Author Name
                </Label>
                <Input
                  id="firstAuthor"
                  placeholder="Name of the lead researcher"
                  value={formData.firstAuthor}
                  onChange={(e) => handleInputChange('firstAuthor', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Two columns for domain and stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Research Domain */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Research Domain
                  </Label>
                  <Select
                    value={formData.researchDomain}
                    onValueChange={(value) => handleInputChange('researchDomain', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a research area" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESEARCH_DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reading Stage */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-primary" />
                    Reading Stage
                  </Label>
                  <Select
                    value={formData.readingStage}
                    onValueChange={(value) => handleInputChange('readingStage', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Current progress level" />
                    </SelectTrigger>
                    <SelectContent>
                      {READING_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Two columns for citations and impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Citation Count */}
                <div className="space-y-2">
                  <Label htmlFor="citationCount" className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" />
                    Citation Count
                  </Label>
                  <Input
                    id="citationCount"
                    type="number"
                    min="0"
                    placeholder="Total citations"
                    value={formData.citationCount}
                    onChange={(e) => handleInputChange('citationCount', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Impact Score */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Impact Score
                  </Label>
                  <Select
                    value={formData.impactScore}
                    onValueChange={(value) => handleInputChange('impactScore', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPACT_SCORES.map((score) => (
                        <SelectItem key={score} value={score}>
                          {score}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Added */}
              <div className="space-y-2">
                <Label htmlFor="dateAdded" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date Added
                </Label>
                <Input
                  id="dateAdded"
                  type="date"
                  value={formData.dateAdded}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('dateAdded', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/library')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Adding Paper...' : 'Add Paper'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPaperPage;
