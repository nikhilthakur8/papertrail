import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Users, 
  FileText, 
  Lightbulb,
  Target,
  TrendingUp,
  Library,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Quote,
  Award,
  Layers,
  Brain,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-card/50 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

const GuidePage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-2 sm:gap-3">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
            Research Guide
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            New to academic research? Don't worry! This guide will help you understand 
            research papers, academic terminology, and how to use PaperTrail effectively.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-6 w-6" />
              Quick Start: How to Use PaperTrail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">1. Add Papers</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Add Paper" to log papers you're reading with details like title, author, and domain
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">2. Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Update your reading stage as you progress through each paper
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">3. View Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Check the Analytics page to visualize your reading patterns and progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Terms Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Understanding Academic Terms
          </h2>
          
          <div className="space-y-3">
            <AccordionItem 
              title="What is a Citation Count?" 
              icon={<Quote className="h-5 w-5 text-blue-400" />}
              defaultOpen={true}
            >
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Citation count</strong> is the number of times other researchers 
                  have referenced (cited) a paper in their own work. It's like a "thumbs up" from the academic community.
                </p>
                <div className="bg-background p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground">What Citation Counts Tell You:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">High citations (100+):</strong> Widely influential, foundational work in the field</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">Medium citations (20-100):</strong> Well-regarded, useful contribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">Low citations (0-20):</strong> New paper, niche topic, or less impactful (not always bad!)</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  💡 Tip: New papers have fewer citations simply because they're new. A 2024 paper with 10 citations 
                  might be more impressive than a 2010 paper with 50!
                </p>
              </div>
            </AccordionItem>

            <AccordionItem 
              title="Impact Score Explained" 
              icon={<Award className="h-5 w-5 text-indigo-400" />}
            >
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Impact Score</strong> in PaperTrail helps you categorize how 
                  significant a paper is to your research or the field in general.
                </p>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High Impact</Badge>
                    <p className="text-sm text-muted-foreground">
                      Groundbreaking papers that introduce new concepts, methodologies, or findings. 
                      Often highly cited and referenced in textbooks.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">Medium Impact</Badge>
                    <p className="text-sm text-muted-foreground">
                      Solid contributions that build upon existing work. Good for understanding 
                      specific aspects of a topic.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Low Impact</Badge>
                    <p className="text-sm text-muted-foreground">
                      Incremental work, preliminary studies, or very specialized papers. 
                      Still valuable for specific purposes!
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
                    <p className="text-sm text-muted-foreground">
                      Use this when you haven't determined the impact yet or for very new papers.
                    </p>
                  </div>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem 
              title="Authors: First Author & Co-Authors" 
              icon={<Users className="h-5 w-5 text-purple-400" />}
            >
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Research papers typically have multiple authors. Their order matters!
                </p>
                <div className="bg-background p-4 rounded-lg space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-sm">1st</span>
                      First Author
                    </h4>
                    <p className="text-sm text-muted-foreground ml-10">
                      Did most of the work - experiments, writing, analysis. The "main" researcher on the project.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-sm">2nd-N</span>
                      Co-Authors / Middle Authors
                    </h4>
                    <p className="text-sm text-muted-foreground ml-10">
                      Contributed to specific parts - data collection, editing, providing resources, etc.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm">Last</span>
                      Senior/Corresponding Author
                    </h4>
                    <p className="text-sm text-muted-foreground ml-10">
                      Usually the lab leader or supervisor. Oversees the project and handles correspondence.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  💡 In PaperTrail, we track the first author since they're primarily responsible for the work.
                </p>
              </div>
            </AccordionItem>

            <AccordionItem 
              title="Research Domains" 
              icon={<Layers className="h-5 w-5 text-cyan-400" />}
            >
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Research domains are broad categories that help organize papers by their field of study.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Computer Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'Social Sciences'].map((domain) => (
                    <div key={domain} className="p-2 rounded bg-background text-center">
                      <Badge variant="outline">{domain}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Many papers are interdisciplinary (combine multiple fields). Choose the primary domain 
                  that best represents the paper's main contribution.
                </p>
              </div>
            </AccordionItem>
          </div>
        </div>

        {/* Reading Stages Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            Reading Stages Explained
          </h2>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Reading a research paper isn't like reading a novel - you don't have to read every word! 
                Here's a strategic approach:
              </p>
              <div className="space-y-4">
                {[
                  {
                    stage: 'Abstract Read',
                    color: 'bg-red-500/20 text-red-400 border-red-500/30',
                    time: '2-5 min',
                    description: 'Read the abstract (summary at the beginning). Decide if the paper is relevant to you.',
                    tip: 'If the abstract doesn\'t interest you, it\'s okay to skip the paper!'
                  },
                  {
                    stage: 'Introduction Done',
                    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                    time: '10-15 min',
                    description: 'Read the introduction to understand the problem, motivation, and what the authors claim to contribute.',
                    tip: 'Look for the "contribution" or "we propose" statements.'
                  },
                  {
                    stage: 'Methodology Done',
                    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    time: '20-30 min',
                    description: 'Understand HOW they did their research - the methods, experiments, or theoretical framework.',
                    tip: 'Don\'t worry if you don\'t understand everything. Note what confuses you.'
                  },
                  {
                    stage: 'Results Analyzed',
                    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    time: '15-25 min',
                    description: 'Study the results, figures, and tables. What did they find? Do the results support their claims?',
                    tip: 'Figures often tell the story faster than text!'
                  },
                  {
                    stage: 'Fully Read',
                    color: 'bg-green-500/20 text-green-400 border-green-500/30',
                    time: '30-60 min',
                    description: 'You\'ve read the entire paper including discussion, related work, and conclusion.',
                    tip: 'The conclusion often summarizes key takeaways and future directions.'
                  },
                  {
                    stage: 'Notes Completed',
                    color: 'bg-primary/20 text-primary border-primary/30',
                    time: 'Variable',
                    description: 'You\'ve made comprehensive notes, summaries, or annotations for future reference.',
                    tip: 'Good notes = never having to re-read the entire paper!'
                  }
                ].map((item, index) => (
                  <div key={item.stage} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.color}`}>
                        {index + 1}
                      </div>
                      {index < 5 && <div className="w-0.5 h-full bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={item.color}>{item.stage}</Badge>
                        <span className="text-xs text-muted-foreground">~{item.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                      <p className="text-xs text-primary/80 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> {item.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Paper Structure Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Anatomy of a Research Paper
          </h2>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Most research papers follow a similar structure. Here's what each section contains:
              </p>
              <div className="space-y-3">
                {[
                  { section: 'Title', desc: 'Summarizes the main topic/finding in one sentence' },
                  { section: 'Abstract', desc: '150-300 word summary of the entire paper - problem, method, results' },
                  { section: 'Keywords', desc: 'Important terms for searching and categorization' },
                  { section: 'Introduction', desc: 'Background, motivation, problem statement, and paper contributions' },
                  { section: 'Related Work / Literature Review', desc: 'What others have done before and how this work differs' },
                  { section: 'Methodology / Methods', desc: 'How the research was conducted - experiments, data, techniques' },
                  { section: 'Results / Experiments', desc: 'What was found - data, figures, tables, statistics' },
                  { section: 'Discussion', desc: 'Interpretation of results, implications, limitations' },
                  { section: 'Conclusion', desc: 'Summary of contributions and future work directions' },
                  { section: 'References / Bibliography', desc: 'List of all cited papers (great for finding more papers!)' },
                  { section: 'Appendix', desc: 'Extra details, proofs, or supplementary material' }
                ].map((item) => (
                  <div key={item.section} className="flex items-start gap-3 p-2 rounded hover:bg-accent/50 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground">{item.section}:</span>{' '}
                      <span className="text-muted-foreground">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Understanding Your Analytics
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reading Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Shows how many papers are at each reading stage. A healthy funnel has papers 
                  moving through stages - not all stuck at "Abstract Read"!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Citations vs Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scatter plot showing citation counts by impact score. Helps identify highly 
                  cited papers you should prioritize reading.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Domain Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See which research areas you're focusing on. Useful for maintaining breadth 
                  or identifying your specialization.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reading Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track how many papers you're adding monthly. Helps maintain consistent 
                  reading habits.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Authors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See which researchers appear most in your library. These might be key 
                  figures in your area of interest!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Activity by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Shows which days you're most active. Useful for planning your reading 
                  schedule.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pro Tips Section */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Pro Tips for New Researchers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { tip: "Start with survey/review papers", desc: "They summarize an entire field and point to important papers" },
                { tip: "Read the figures first", desc: "Good papers tell their story through figures" },
                { tip: "It's okay to skim", desc: "Not every paper needs deep reading - know when to move on" },
                { tip: "Follow citations", desc: "References lead to foundational papers; 'Cited by' leads to newer work" },
                { tip: "Take notes immediately", desc: "You'll forget details faster than you think" },
                { tip: "Read actively", desc: "Ask questions as you read: 'Why?' 'How?' 'What if?'" },
                { tip: "Don't get discouraged", desc: "Even experts don't understand everything on first read" },
                { tip: "Track your papers", desc: "That's what PaperTrail is for! 😊" }
              ].map((item) => (
                <div key={item.tip} className="flex items-start gap-2 p-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{item.tip}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Abbreviations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              Common Academic Abbreviations
            </CardTitle>
            <CardDescription>Terms you'll see everywhere in papers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { abbr: 'et al.', meaning: '"and others" (when there are many authors)' },
                { abbr: 'i.e.', meaning: '"that is" (clarification)' },
                { abbr: 'e.g.', meaning: '"for example"' },
                { abbr: 'cf.', meaning: '"compare with"' },
                { abbr: 'ibid.', meaning: '"same source as previous"' },
                { abbr: 'Fig.', meaning: 'Figure' },
                { abbr: 'Tab.', meaning: 'Table' },
                { abbr: 'Eq.', meaning: 'Equation' },
                { abbr: 'Sec.', meaning: 'Section' },
                { abbr: 'w.r.t.', meaning: '"with respect to"' },
                { abbr: 's.t.', meaning: '"such that"' },
                { abbr: 'SOTA', meaning: 'State of the Art' }
              ].map((item) => (
                <div key={item.abbr} className="p-2 rounded bg-accent/50">
                  <span className="font-mono font-bold text-primary">{item.abbr}</span>
                  <p className="text-xs text-muted-foreground">{item.meaning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground">
            Happy researching! 📚 Remember: every expert was once a beginner.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default GuidePage;
