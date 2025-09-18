"use client";

import type { MomentCategory } from "@/types/moment";
import { useState } from "react";
import MomentFilters from "./MomentFilters";
import MomentsList from "./MomentsList";

export default function MomentsScreen() {
  const [category, setCategory] = useState<MomentCategory | "All">("All");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Moments</h1>
        <p className="text-muted-foreground text-sm">
          AI-generated insights from your daily activities and thoughts
        </p>
      </div>
      <MomentFilters category={category} setCategory={setCategory} />
      <MomentsList category={category} />
    </div>
  );
}
