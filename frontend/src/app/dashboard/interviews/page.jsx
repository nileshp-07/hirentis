import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        subtitle={`Practice answering questions tracked by AI.`}
      />

      <Card className="p-6">
        <p className="text-muted-foreground">
          Interview functionality coming soon...
        </p>
      </Card>
    </div>
  );
}
