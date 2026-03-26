import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Resume"
        subtitle="Manage and upload your candidate resume below."
      />
      <Card className="p-6">
        <p className="text-muted-foreground">
          Resume uploading functionality coming soon...
        </p>
      </Card>
    </div>
  );
}
