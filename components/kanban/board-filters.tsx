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
import { Filter, Tag as TagIcon } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-3 border-b border-border/70 bg-background/55 px-4 py-3 backdrop-blur-xl lg:px-6">
      <Select value={filters.priority || "all"} onValueChange={handlePriorityChange}>
        <SelectTrigger className="h-9 w-[150px] rounded-xl bg-card/80 text-xs shadow-sm">
          <Filter className="mr-1 h-3.5 w-3.5" />
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
        <SelectTrigger className="h-9 w-[150px] rounded-xl bg-card/80 text-xs shadow-sm">
          <TagIcon className="mr-1 h-3.5 w-3.5" />
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
          className="h-9 rounded-xl text-xs text-muted-foreground"
          onClick={handleClear}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
