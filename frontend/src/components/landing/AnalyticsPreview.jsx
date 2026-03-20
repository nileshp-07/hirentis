'use client';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/card';

const scoreData = [
  { name: 'Q1', score: 85 },
  { name: 'Q2', score: 72 },
  { name: 'Q3', score: 90 },
  { name: 'Q4', score: 68 },
  { name: 'Q5', score: 95 },
];

const radarData = [
  { skill: 'Problem Solving', value: 88 },
  { skill: 'Communication', value: 75 },
  { skill: 'Technical', value: 92 },
  { skill: 'System Design', value: 70 },
  { skill: 'Algorithms', value: 85 },
];

const trendData = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 70 },
  { day: 'Thu', score: 80 },
  { day: 'Fri', score: 85 },
  { day: 'Sat', score: 88 },
  { day: 'Sun', score: 92 },
];

const CHART_HEIGHT = 180;
const RADAR_CHART_OUTER_RADIUS = 60;
const AXIS_FONT_SIZE_SMALL = 9;
const AXIS_FONT_SIZE_MEDIUM = 11;

const AnalyticsPreview = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Detailed <span className="gradient-text">Analytics</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Track every aspect of your interview performance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card>
            <p className="mb-4 text-sm font-semibold">Question Scores</p>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={scoreData}>
                <Bar
                  dataKey="score"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-4 text-sm font-semibold">Skill Breakdown</p>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <RadarChart
                data={radarData}
                outerRadius={RADAR_CHART_OUTER_RADIUS}
              >
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fontSize: AXIS_FONT_SIZE_SMALL,
                    fill: 'var(--color-muted-foreground)',
                  }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-4 text-sm font-semibold">Performance Trend</p>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <LineChart data={trendData}>
                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: AXIS_FONT_SIZE_MEDIUM,
                    fill: 'var(--color-muted-foreground)',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-gradient-pink)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;
