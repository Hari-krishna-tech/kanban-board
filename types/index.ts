export interface Board {
  id: string;
  name: string;
  userId: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  dueDate: string | null;
  status: string;
  progress: number;
  taskType: "Concept" | "Project" | "Revision";
  timeSpent: number;
  order: number;
  columnId: string;
  boardId: string;
  tags: TaskTag[];
  subtasks: Subtask[];
  resources: Resource[];
  timeEntries?: TimeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  url: string;
  title: string | null;
  taskId: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  minutes: number;
  note: string | null;
  taskId: string;
  createdAt: string;
}

export interface InsightsData {
  weeklyCompletion: { week: string; count: number }[];
  streak: number;
  totalTimeSpent: number;
  categoryBreakdown: { name: string; count: number }[];
  completedCount: number;
  totalCount: number;
}
