'use client';

import { Progress } from "@/components/progress";
import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  mainValue: string;
  subtitle?: string;
  progress?: number;
};

export default function MetricCard({ icon, title, mainValue, subtitle, progress }: Props) {
  return (
    <div className="bg-[#F5F0F1] shadow-md rounded-xl p-4 w-full flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#4A2B4D]">
        <div className="w-5 h-5">{icon}</div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-xl font-bold text-black">{mainValue}</div>
      {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
      {progress !== undefined && (
        <Progress value={progress} className="h-2 bg-[#e5d7e6]" indicatorColor="#4A2B4D" />
      )}
    </div>
  );
}
