import { cn } from "@/lib/utils";
import { Progress } from "@/components/progress";


interface CardStatsWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const CardStatsWidget = ({
  icon,
  title,
  value,
  subtitle,
  progress,
  actionLabel,
  onActionClick,
}: CardStatsWidgetProps) => (
  <div className="rounded-lg shadow-md bg-white w-full p-4 space-y-2">
    <div className="flex items-center space-x-2 text-[#4A2B4A]">
      {icon}
      <h2 className="font-semibold">{title}</h2>
    </div>
    <div className="text-3xl font-bold text-black">{value}</div>
    {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    {progress !== undefined && (
      <Progress value={progress} className="h-2 bg-purple-100" />
    )}
    {actionLabel && (
      <button
        onClick={onActionClick}
        className="mt-2 w-full rounded-md bg-[#4A2B4A] text-white py-1 font-medium"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
