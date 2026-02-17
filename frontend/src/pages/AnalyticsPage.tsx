import React, { useState, useEffect } from 'react';
import { papersAPI } from '@/lib/api';
import { READING_STAGES, RESEARCH_DOMAINS, IMPACT_SCORES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  Target,
  Percent,
  Users,
  Calendar,
  Award,
  Zap
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
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
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
  'hsl(262, 83%, 58%)',   // Primary violet
  'hsl(262, 83%, 70%)',   // Lighter
  'hsl(262, 83%, 45%)',   // Darker
  'hsl(245, 80%, 60%)',   // Indigo
  'hsl(280, 75%, 55%)',   // Purple
  'hsl(230, 80%, 65%)',   // Soft Blue/Violet
];

const CHART_COLORS = [
  '#8b5cf6', // violet
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f43f5e', // rose
];

const IMPACT_COLORS: Record<string, string> = {
  'High Impact': '#22c55e',
  'Medium Impact': '#8b5cf6',
  'Low Impact': '#f97316',
  'Unknown': '#6b7280',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const tooltipStyle = {
  contentStyle: { 
    backgroundColor: 'hsl(var(--card))', 
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))'
  },
  itemStyle: { color: 'hsl(var(--foreground))' },
  labelStyle: { color: 'hsl(var(--foreground))' },
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
      } catch (error) {
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
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </Layout>
    );
  }

  // Prepare funnel data
  const funnelData = READING_STAGES.map((stage, index) => {
    const stageData = analytics.funnel.find(f => f._id === stage);
    return {
      name: stage,
      value: stageData?.count || 0,
      fill: GOLDEN_COLORS[index % GOLDEN_COLORS.length],
    };
  }).filter(item => item.value > 0);

  // Prepare scatter data grouped by impact
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

  // Prepare stacked bar data
  const stackedBarData = RESEARCH_DOMAINS.map(domain => {
    const domainData: Record<string, any> = { domain };
    READING_STAGES.forEach(stage => {
      const entry = analytics.stackedBar.find(
        s => s._id.domain === domain && s._id.stage === stage
      );
      domainData[stage] = entry?.count || 0;
    });
    return domainData;
  }).filter(d => READING_STAGES.some(stage => d[stage] > 0));

  // Stage counts for summary
  const stageCounts = READING_STAGES.map(stage => {
    const stageData = analytics.funnel.find(f => f._id === stage);
    return {
      stage,
      count: stageData?.count || 0,
    };
  });

  // Prepare papers over time data for area chart
  const timelineData = (analytics.papersOverTime || []).map(item => ({
    month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
    papers: item.count,
    citations: item.totalCitations,
  }));

  // Prepare impact distribution for pie chart
  const impactPieData = (analytics.impactDistribution || []).map(item => ({
    name: item._id,
    value: item.count,
    avgCitations: Math.round(item.avgCitations),
    fill: IMPACT_COLORS[item._id] || '#6b7280',
  }));

  // Prepare domain radar data
  const radarData = (analytics.domainStats || []).map(item => ({
    domain: item._id.replace(' ', '\n'),
    papers: item.totalPapers,
    citations: Math.round(item.avgCitations / 10), // Scale down for radar
    completion: item.totalPapers > 0 ? Math.round((item.fullyRead / item.totalPapers) * 100) : 0,
  }));

  // Prepare activity by day data
  const activityData = DAY_NAMES.map((day, index) => {
    const dayData = (analytics.activityByDay || []).find(d => d._id === index + 1);
    return {
      day,
      papers: dayData?.count || 0,
    };
  });

  // Prepare top authors data
  const authorData = (analytics.topAuthors || []).slice(0, 8).map(author => ({
    name: author._id.length > 15 ? author._id.substring(0, 15) + '...' : author._id,
    fullName: author._id,
    papers: author.paperCount,
    avgCitations: Math.round(author.avgCitations),
    totalCitations: author.totalCitations,
  }));

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Visualize your research reading progress
          </p>
        </div>

        {/* Summary Statistics */}
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Papers</p>
                  <p className="text-2xl font-bold">{analytics.summary.totalPapers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fully Read</p>
                  <p className="text-2xl font-bold">{analytics.summary.fullyReadPapers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Percent className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{analytics.summary.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Summary Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Papers by Reading Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stageCounts.map((item, index) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: GOLDEN_COLORS[index % GOLDEN_COLORS.length] }}
                      />
                      <span className="text-sm">{item.stage}</span>
                    </div>
                    <span className="font-mono font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Citations by Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.summary.avgCitationsByDomain.length > 0 ? (
                  analytics.summary.avgCitationsByDomain.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: GOLDEN_COLORS[index % GOLDEN_COLORS.length] }}
                        />
                        <span className="text-sm">{item._id}</span>
                        <span className="text-xs text-muted-foreground">
                          ({item.totalPapers} papers)
                        </span>
                      </div>
                      <span className="font-mono font-semibold">
                        {Math.round(item.avgCitations).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Funnel Chart - Reading Stage Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Reading Progress Funnel
              </CardTitle>
              <CardDescription>
                Papers at each reading stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
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
                        fill="hsl(var(--foreground))" 
                        stroke="none" 
                        dataKey="name"
                        fontSize={12}
                      />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stacked Bar Chart - Domain vs Reading Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Reading Progress by Domain
              </CardTitle>
              <CardDescription>
                Distribution of reading stages across research domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stackedBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="domain" 
                      stroke="hsl(var(--muted-foreground))"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    {READING_STAGES.map((stage, index) => (
                      <Bar 
                        key={stage} 
                        dataKey={stage} 
                        stackId="a" 
                        fill={GOLDEN_COLORS[index % GOLDEN_COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scatter Plot - Citations by Impact Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Citations by Impact Score
              </CardTitle>
              <CardDescription>
                Paper distribution by citation count and impact (Citation Count on X-axis)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.scatter.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Citations" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Citation Count', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Paper" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Papers', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ color: 'hsl(var(--foreground))' }} 
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
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
