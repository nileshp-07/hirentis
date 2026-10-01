'use client';
import { motion } from 'framer-motion';
import { BarChart3, Radar as RadarIcon, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AXIS_TICK,
  GRID_STROKE,
  SCORE_DOMAIN,
  SERIES_COLOR,
  TOOLTIP_PROPS,
} from './chartTheme';

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4 },
};

const MAX_TOPIC_CHARS = 24;
const shortTopic = (topic) =>
  topic.length > MAX_TOPIC_CHARS
    ? `${topic.slice(0, MAX_TOPIC_CHARS - 1)}�`
    : topic;

const ChartCard = ({
  title,
  icon: Icon,
  height = 'h-64',
  children,
  delay = 0,
}) => (
  <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay }}>
    <Card className="h-full p-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  </motion.div>
);

export const SkillRadarChart = ({ data }) => (
  <ChartCard title="Skill profile" icon={RadarIcon}>
    <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
      <PolarGrid stroke={GRID_STROKE} />
      <PolarAngleAxis dataKey="skill" tick={AXIS_TICK} />
      <PolarRadiusAxis domain={SCORE_DOMAIN} tick={false} axisLine={false} />
      <Radar
        dataKey="score"
        stroke={SERIES_COLOR}
        fill={SERIES_COLOR}
        fillOpacity={0.18}
        strokeWidth={2}
        dot={{ fill: SERIES_COLOR, r: 4 }}
      />
      <Tooltip {...TOOLTIP_PROPS} cursor={false} />
    </RadarChart>
  </ChartCard>
);

export const ScoreTrendChart = ({ data }) => (
  <ChartCard title="Score across the interview" icon={TrendingUp} delay={0.1}>
    <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={GRID_STROKE}
        vertical={false}
      />
      <XAxis
        dataKey="label"
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        domain={SCORE_DOMAIN}
        ticks={[0, 2, 4, 6, 8, 10]}
        tick={AXIS_TICK}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip {...TOOLTIP_PROPS} cursor={{ stroke: GRID_STROKE }} />
      <Line
        type="monotone"
        dataKey="score"
        stroke={SERIES_COLOR}
        strokeWidth={2}
        dot={{
          fill: SERIES_COLOR,
          r: 4,
          strokeWidth: 2,
          stroke: 'var(--card)',
        }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ChartCard>
);

export const TopicScoresChart = ({ data }) => (
  <motion.div {...fadeIn}>
    <Card className="p-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-primary" />
          Score by topic
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Your weakest topics are the fastest place to improve.
        </p>
      </CardHeader>
      <div style={{ height: Math.max(180, data.length * 46) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 36, bottom: 4, left: 8 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={SCORE_DOMAIN}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={150}
              tick={AXIS_TICK}
              tickFormatter={shortTopic}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((entry) => (
                <Cell key={entry.topic} fill={SERIES_COLOR} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                className="fill-muted-foreground"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </motion.div>
);
