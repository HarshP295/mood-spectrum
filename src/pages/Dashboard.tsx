import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Brain, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import useDailyTips from '../hooks/useDailyTips';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const { tips, loading, refreshTips } = useDailyTips();
  const [entriesThisWeek, setEntriesThisWeek] = useState<number>(0);
  const [topMood, setTopMood] = useState<string>('neutral');
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<Array<{ date: string; count: number }>>([]);
  const [moodDist, setMoodDist] = useState<Array<{ mood: string; count: number }>>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        setError(null);
        const token = localStorage.getItem('mindflow_token');
        const res = await fetch('/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load dashboard summary');
        const data = await res.json();
        setEntriesThisWeek(data.entriesThisWeek || 0);
        setTopMood(data.topMood || 'neutral');

        const tr = await fetch('/api/dashboard/trends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tr.ok) {
          const trend = await tr.json();
          setTrendData(trend.map((d: any) => ({ date: d.date.slice(5), count: d.count })));
        } else {
          setTrendData([]);
        }

        const md = await fetch('/api/dashboard/mood-distribution?days=30', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (md.ok) {
          const dist = await md.json();
          setMoodDist(dist);
        } else {
          setMoodDist([]);
        }

        // Fetch total entries so far
        const jr = await fetch('/api/journal', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (jr.ok) {
          const list = await jr.json();
          setTotalEntries(Array.isArray(list) ? list.length : 0);
        } else {
          setTotalEntries(0);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load summary');
      } finally {
        setLoadingSummary(false);
      }
    };
    loadSummary();
  }, []);

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: 'bg-yellow',
      sad: 'bg-primary',
      anxious: 'bg-peach',
      neutral: 'bg-muted',
      excited: 'bg-accent',
      calm: 'bg-lavender-light'
    };
    return colors[mood as keyof typeof colors] || 'bg-muted';
  };

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      neutral: '😐',
      excited: '🤩',
      calm: '😌'
    };
    return emojis[mood as keyof typeof emojis] || '😐';
  };

  const pieColorForMood = (mood: string) => {
    const colors: Record<string, string> = {
      happy: '#FACC15', // yellow-400
      sad: '#3B82F6',   // blue-500
      anxious: '#FCA5A5', // red-300
      neutral: '#9CA3AF', // gray-400
      excited: '#22C55E', // green-500
      calm: '#A78BFA',    // violet-400
    };
    return colors[mood] || '#94A3B8'; // slate-400 fallback
  };

  const totalEntries7d = trendData.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = totalEntries7d / 7;
  const totalMoodCount = moodDist.reduce((sum, d) => sum + d.count, 0);
  const topMoodEntry = moodDist.reduce<{ mood: string; count: number } | null>((top, curr) => {
    if (!top || curr.count > top.count) return curr;
    return top;
  }, null);
  const topMoodPercent = totalMoodCount > 0 && topMoodEntry ? Math.round((topMoodEntry.count / totalMoodCount) * 100) : 0;
  const distinctMoods = moodDist.length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Your Wellness Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress and discover insights about your mental health journey.
          </p>
        </div>

        {/* Stats Overview (real values only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1 capitalize">{topMood}</h3>
            <p className="text-sm text-muted-foreground">Most Frequent Mood</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{entriesThisWeek}</h3>
            <p className="text-sm text-muted-foreground">Entries This Week</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{avgPerDay.toFixed(1)}</h3>
            <p className="text-sm text-muted-foreground">Avg Entries / Day (7d)</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{totalEntries}</h3>
            <p className="text-sm text-muted-foreground">Total Entries</p>
          </Card>
          {/* Removed dummy cards; only real values remain */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card variant="default" className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Entries (Last 7 Days)</h3>
            <ChartContainer
              config={{
                count: { label: 'Entries', color: 'hsl(var(--primary))' },
              }}
              className="h-64"
            >
              <AreaChart data={trendData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
                <Area
                  dataKey="count"
                  type="monotone"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.15}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="count" nameKey="count" />} />
              </AreaChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Total (7d)</div>
                <div className="text-foreground text-lg font-semibold">{totalEntries7d}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Avg / day</div>
                <div className="text-foreground text-lg font-semibold">{avgPerDay.toFixed(1)}</div>
              </div>
            </div>
          </Card>

          {/* AI Suggestions */}
          <Card variant="default" className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Mood Distribution (30 days)</h3>
            <ChartContainer
              config={{}}
              className="h-64"
            >
              <PieChart>
                <Pie
                  data={moodDist}
                  dataKey="count"
                  nameKey="mood"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {moodDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColorForMood(entry.mood)} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip content={<ChartTooltipContent nameKey="mood" labelKey="mood" />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Total Entries</div>
                <div className="text-foreground text-lg font-semibold">{totalMoodCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Top Mood</div>
                <div className="text-foreground text-lg font-semibold capitalize">{topMoodEntry?.mood || '—'} {topMoodPercent ? `(${topMoodPercent}%)` : ''}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Distinct Moods</div>
                <div className="text-foreground text-lg font-semibold">{distinctMoods}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {moodDist.slice(0, 4).map((m) => {
                const pct = totalMoodCount ? Math.round((m.count / totalMoodCount) * 100) : 0;
                return (
                  <div key={m.mood} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: pieColorForMood(m.mood) }} />
                      <span className="capitalize text-foreground">{m.mood}</span>
                    </div>
                    <span className="text-muted-foreground">{m.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </Card>

          </div>

        <div className="mt-8">
          <Card variant="therapeutic" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Daily Wellness Tips</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshTips}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {loading || loadingSummary ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/20 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-white/30 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {tips.slice(0, 3).map((tip) => (
                  <div key={tip.id} className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-colors duration-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{tip.title}</h4>
                        <p className="text-white/80 text-sm leading-relaxed">{tip.content}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs text-white/70 capitalize">
                          {tip.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <p className="text-sm text-white/80 mt-4">{error}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;