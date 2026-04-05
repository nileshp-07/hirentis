import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function ResumeHeader({ activeResume }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader title="Resume" subtitle="Upload and manage your resume. Your active resume will be used to personalize AI interviews." />
      {activeResume && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2"
        >
          <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
            <Star className="h-3 w-3 mr-1" />
            Active Resume: {activeResume.name}
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}
