"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/store/ui-store";
import { Filter } from "lucide-react";
import type { Tag } from "@/types";

interface BoardFiltersProps {
  tags: Tag[];
}

export function BoardFilters({ tags }: BoardFiltersProps) {
  const { filters, setFilter, clearFilters } = useUIStore();
  const activeFilters = (filters.priority ? 1 : 0) + (filters.tagId ? 1 : 0);

  const handlePriorityChange = (value: string | null) => {
    setFilter("priority", value === "all" ? null : value);
  };

  const handleTagChange = (value: string | null) => {
    setFilter("tagId", value === "all" ? null : value);
  };

  const handleClear = () => {
    clearFilters();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <Select value={filters.priority || "all"} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <Filter className="h-3 w-3 mr-1" />
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.tagId || "all"} onValueChange={handleTagChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeFilters > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-slate-500"
          onClick={handleClear}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
