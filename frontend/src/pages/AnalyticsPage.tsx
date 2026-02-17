import React, { useState, useEffect } from 'react';
import { papersAPI } from '@/lib/api';
import { READING_STAGES, RESEARCH_DOMAINS, IMPACT_SCORES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Target,
  Percent,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

interface AnalyticsData {
  funnel: Array<{ _id: string; count: number }>;
  scatter: Array<{ title: string; citationCount: number; impactScore: string }>;
  stackedBar: Array<{ _id: { domain: string; stage: string }; count: number }>;
  papersOverTime: Array<{ _id: { year: number; month: number }; count: number; totalCitations: number }>;
  topAuthors: Array<{ _id: string; paperCount: number; avgCitations: number; totalCitations: number }>;
  impactDistribution: Array<{ _id: string; count: number; avgCitations: number }>;
  domainStats: Array<{ _id: string; totalPapers: number; avgCitations: number; fullyRead: number }>;
  activityByDay: Array<{ _id: number; count: number }>;
  summary: {
    totalPapers: number;
    fullyReadPapers: number;
    completionRate: number;
    avgCitationsByDomain: Array<{ _id: string; avgCitations: number; totalPapers: number }>;
    citationStats: { totalCitations: number; avgCitations: number; maxCitations: number };
  };
}

const GOLDEN_COLORS = [
  'hsl(var(--primary))',
  'hsl(262, 83%, 70%)',
  'hsl(262, 83%, 45%)',
  'hsl(245, 80%, 60%)',
  'hsl(280, 75%, 55%)',
  'hsl(230, 80%, 65%)',
];

const IMPACT_COLORS: Record<string, string> = {
  'High Impact': '#10b981',
  'Medium Impact': '#3b82f6',
  'Low Impact': '#6b7280',
  'Unknown': '#4b5563',
};

const tooltipStyle = {
  contentStyle: { 
    backgroundColor: '#18181b', 
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#f4f4f5'
  },
  itemStyle: { color: '#f4f4f5' },
  labelStyle: { color: '#f4f4f5' },
};

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await papersAPI.getAnalytics();
        setAnalytics(response.data);
      } catch (error: unknown) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-80 space-y-4">
           <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-xs text-zinc-500">Calculating statistics...</p>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-80 text-center">
           <BarChart3 className="h-10 w-10 text-zinc-800 mb-4" />
           <p className="text-zinc-500">No data available for analysis.</p>
        </div>
      </Layout>
    );
  }

  const funnelData = READING_STAGES.map((stage, index) => {
    const stageData = analytics.funnel.find(f => f._id === stage);
    return {
      name: stage,
      value: stageData?.count || 0,
      fill: GOLDEN_COLORS[index % GOLDEN_COLORS.length],
    };
  }).filter(item => item.value > 0);

  const scatterDataByImpact = IMPACT_SCORES.reduce((acc, impact) => {
    const papers = analytics.scatter.filter(p => p.impactScore === impact);
    if (papers.length > 0) {
      acc[impact] = papers.map((p, idx) => ({
        x: p.citationCount,
        y: idx + 1,
        title: p.title,
        citationCount: p.citationCount,
      }));
    }
    return acc;
  }, {} as Record<string, Array<{ x: number; y: number; title: string; citationCount: number }>>);

  const stackedBarData = RESEARCH_DOMAINS.map(domain => {
    const domainData: Record<string, number | string> = { domain };
    READING_STAGES.forEach(stage => {
      const entry = analytics.stackedBar.find(
        s => s._id.domain === domain && s._id.stage === stage
      );
      domainData[stage] = entry?.count || 0;
    });
    return domainData;
  }).filter(d => READING_STAGES.some(stage => (d[stage] as number) > 0));

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-zinc-500 mt-0.5 text-sm sm:text-base">Visualize your research library stats.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/40 border-zinc-800 shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-zinc-500">Total Papers</p>
                  <p className="text-2xl font-bold text-white">{analytics.summary.totalPapers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800 shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-zinc-500">Fully Read</p>
                  <p className="text-2xl font-bold text-white">{analytics.summary.fullyReadPapers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800 shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Percent className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-zinc-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.summary.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Reading Progress Funnel</CardTitle>
              <CardDescription className="text-xs">Papers at each stage of the reading process.</CardDescription>
            </CardHeader>
            <CardContent>
              {funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip {...tooltipStyle} />
                    <Funnel
                      data={funnelData}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive
                    >
                      <LabelList 
                        position="right" 
                        fill="#71717a" 
                        stroke="none" 
                        dataKey="name"
                        fontSize={10}
                      />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-zinc-700 text-xs">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base">Progress by Domain</CardTitle>
              <CardDescription className="text-xs">Reading stages distributed across research domains.</CardDescription>
            </CardHeader>
            <CardContent>
              {stackedBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stackedBarData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="domain" 
                      stroke="#71717a"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                    {READING_STAGES.map((stage, index) => (
                      <Bar 
                        key={stage} 
                        dataKey={stage} 
                        stackId="a" 
                        radius={index === READING_STAGES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        fill={GOLDEN_COLORS[index % GOLDEN_COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-zinc-700 text-xs">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Citations by Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.scatter.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Citations" 
                    stroke="#71717a"
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Citation Count', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Paper" 
                    stroke="#71717a"
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Papers', angle: -90, position: 'insideLeft', offset: 10, fill: '#71717a', fontSize: 10 }}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }} 
                  />
                  {Object.entries(scatterDataByImpact).map(([impact, data]) => (
                    <Scatter 
                      key={impact} 
                      name={impact} 
                      data={data} 
                      fill={IMPACT_COLORS[impact]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-zinc-700 text-xs">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
