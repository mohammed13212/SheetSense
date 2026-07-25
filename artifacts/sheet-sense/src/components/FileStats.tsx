import type { ReactNode } from "react";
import { FileSpreadsheet, Layers, Columns, Rows } from "lucide-react";
import type { ParsedFile } from "@/types";
import { cn } from "@/lib/utils";

interface FileStatsProps {
  file: ParsedFile;
}

export function FileStats({ file }: FileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full" data-testid="file-stats-grid">
      <StatCard 
        icon={<FileSpreadsheet className="w-5 h-5 text-primary" />}
        label="File Name"
        value={file.fileName}
        testId="stat-filename"
      />
      <StatCard 
        icon={<Layers className="w-5 h-5 text-primary" />}
        label="Total Sheets"
        value={file.sheetNames.length.toString()}
        testId="stat-sheets"
      />
      <StatCard 
        icon={<Rows className="w-5 h-5 text-primary" />}
        label="Rows (Sheet 1)"
        value={file.rowCount.toLocaleString()}
        testId="stat-rows"
      />
      <StatCard 
        icon={<Columns className="w-5 h-5 text-primary" />}
        label="Columns (Sheet 1)"
        value={file.colCount.toLocaleString()}
        testId="stat-cols"
      />
    </div>
  );
}

function StatCard({ icon, label, value, testId }: { icon: ReactNode; label: string; value: string; testId: string }) {
  return (
    <div 
      className="bg-card border border-card-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={testId}
    >
      <div className="mt-0.5 shrink-0 bg-primary/10 p-2 rounded-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-base font-semibold text-foreground truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}
