import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  MessageCircleQuestion, 
  Send, 
  ExternalLink,
  Sparkles,
  BookOpen,
  FileText,
  Search,
  PenTool,
  GraduationCap,
  Lightbulb
} from 'lucide-react';

const frequentQuestions = [
  {
    category: 'Getting Started',
    icon: GraduationCap,
    color: 'text-blue-400',
    questions: [
      'How do I start reading research papers as a beginner?',
      'What is the best way to find research papers in my field?',
      'How do I know if a research paper is credible?',
      'What are the best databases to find academic papers?',
    ]
  },
  {
    category: 'Understanding Papers',
    icon: BookOpen,
    color: 'text-green-400',
    questions: [
      'How do I read a research paper efficiently?',
      'What should I focus on when reading a research paper?',
      'How do I understand complex methodology sections?',
      'What do statistical terms like p-value and confidence interval mean?',
    ]
  },
  {
    category: 'Citations & References',
    icon: FileText,
    color: 'text-indigo-400',
    questions: [
      'How do citations work in academic papers?',
      'What is the difference between APA, MLA, and Chicago citation styles?',
      'How do I cite a research paper correctly?',
      'What is a DOI and how do I use it?',
    ]
  },
  {
    category: 'Literature Review',
    icon: Search,
    color: 'text-purple-400',
    questions: [
      'How do I write a literature review?',
      'How many papers should I read for a literature review?',
      'How do I organize papers for a literature review?',
      'What is the difference between a literature review and a systematic review?',
    ]
  },
  {
    category: 'Writing Research',
    icon: PenTool,
    color: 'text-pink-400',
    questions: [
      'How do I structure a research paper?',
      'What makes a good research question?',
      'How do I write an abstract for my paper?',
      'What is peer review and how does it work?',
    ]
  },
  {
    category: 'Advanced Topics',
    icon: Lightbulb,
    color: 'text-orange-400',
    questions: [
      'What is the h-index and impact factor?',
      'How do I identify gaps in existing research?',
      'What is open access publishing?',
      'How do I evaluate the quality of a journal?',
    ]
  }
];

const AskAwayPage: React.FC = () => {
  const [customQuestion, setCustomQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAskChatGPT = (question: string) => {
    const encodedQuestion = encodeURIComponent(question);
    window.open(`https://chatgpt.com/?mode=default&prompt=${encodedQuestion}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      handleAskChatGPT(customQuestion);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-2 sm:gap-3">
            <MessageCircleQuestion className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
            Ask Away
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Got questions about research? Ask anything! Click any question below or type your own.
            Powered by ChatGPT.
          </p>
        </div>

        {/* Custom Question Input */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ask Your Own Question
              <Popover>
                <PopoverTrigger asChild>
                  <button className="ml-auto h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors animate-pulse hover:animate-none focus:animate-none">
                    <Lightbulb className="h-4 w-4 text-primary " />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Pro Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      For best results, be specific in your questions! Instead of "How do I research?", 
                      try "How do I conduct a systematic literature review in computer science?" 
                      The more context you provide, the better the answer.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </CardTitle>
            <CardDescription>
              Type any question about research, papers, or academia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask anything about research..."
                className="flex-1"
              />
              <Button type="submit" disabled={!customQuestion.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

            {/* Suggested Question Starters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Question Starters</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Explain like I\'m 5: ',
              'What is the difference between ',
              'How do I ',
              'Why is ',
              'What are the best practices for ',
              'Can you summarize ',
              'Step by step guide to ',
            ].map((starter) => (
              <Badge
                key={starter}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors py-2 px-3"
                onClick={() => {
                  setCustomQuestion(starter);
                  inputRef.current?.focus();
                }}
              >
                {starter}...
              </Badge>
            ))}
          </div>
        </div>

        {/* Frequent Questions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Click any question to get an instant answer from ChatGPT
          </p>

          <div className="grid gap-6">
            {frequentQuestions.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {category.questions.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleAskChatGPT(question)}
                          className="w-full text-left p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors group flex items-center justify-between"
                        >
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                            {question}
                          </span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Questions are answered by ChatGPT. Always verify important information with official sources.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AskAwayPage;
