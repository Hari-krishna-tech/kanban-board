"use client";

import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/store/ui-store";
import { createTask, updateTask, deleteTask, moveTask } from "@/actions/task";
import { addSubtask, toggleSubtask, deleteSubtask } from "@/actions/subtask";
import { addResource, removeResource } from "@/actions/resource";
import { createTag, addTagToTask, removeTagFromTask } from "@/actions/tag";
import { logTime } from "@/actions/timeEntry";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Link,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import type { Board, Column, Task, Subtask, Resource, TimeEntry, TaskTag } from "@/types";

interface TaskDialogProps {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
}

export function TaskDialog({ board, setBoard }: TaskDialogProps) {
  const { taskDialogOpen, setTaskDialogOpen, selectedTaskId, setSelectedTaskId } =
    useUIStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("Medium");
  const [taskType, setTaskType] = useState<string>("Concept");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedColId, setSelectedColId] = useState("");

  // Subtask input
  const [newSubtask, setNewSubtask] = useState("");

  // Resource input
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");

  // Tag input
  const [newTagName, setNewTagName] = useState("");

  // Time logging
  const [timeMinutes, setTimeMinutes] = useState("");

  const columns = board.columns;
  const task = board.columns
    .flatMap((c: Column) => c.tasks)
    .find((t: Task) => t.id === selectedTaskId);

  const isEditing = !!task;

  const syncFormFromTask = useCallback((nextTask?: Task) => {
    if (nextTask) {
      setTitle(nextTask.title);
      setDescription(nextTask.description || "");
      setPriority(nextTask.priority);
      setTaskType(nextTask.taskType);
      setDueDate(nextTask.dueDate ? format(new Date(nextTask.dueDate), "yyyy-MM-dd") : "");
      setProgress(nextTask.progress);
      setSelectedColId(nextTask.columnId);
      return;
    }

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setTaskType("Concept");
    setDueDate("");
    setProgress(0);
    // selectedTaskId may hold a task id or a column id.
    // For "new task", only accept it when it matches an existing column.
    const initialColumnId =
      columns.find((col) => col.id === selectedTaskId)?.id || columns[0]?.id || "";
    setSelectedColId(initialColumnId);
  }, [selectedTaskId, columns]);

  const updateCurrentTaskInBoard = useCallback(
    (updater: (currentTask: Task) => Task) => {
      if (!selectedTaskId) return;
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === selectedTaskId ? updater(t) : t
          ),
        })),
      }));
    },
    [selectedTaskId, setBoard]
  );

  // Populate form when editing
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFormFromTask(task);
  }, [task, syncFormFromTask]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (isEditing && selectedTaskId) {
        const previousTask = task;
        const targetColumnId = selectedColId || task.columnId;
        const sameColumn = targetColumnId === task.columnId;
        const optimisticTask: Task = {
          ...task,
          title,
          description: description || null,
          priority: priority as "Low" | "Medium" | "High",
          taskType: taskType as "Concept" | "Project" | "Revision",
          dueDate: dueDate || null,
          progress,
          columnId: targetColumnId,
        };

        setBoard((prev) => {
          const nextColumns = prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== selectedTaskId),
          }));
          const targetColumn = nextColumns.find((c) => c.id === targetColumnId);
          if (targetColumn) {
            targetColumn.tasks.push(optimisticTask);
          }
          return { ...prev, columns: nextColumns };
        });

        handleClose();

        updateTask(selectedTaskId, {
          title,
          description: description || undefined,
          priority: priority as "Low" | "Medium" | "High",
          taskType: taskType as "Concept" | "Project" | "Revision",
          dueDate: dueDate || null,
          progress,
        })
          .then(async () => {
            if (!sameColumn) {
              await moveTask(selectedTaskId, targetColumnId);
            }
          })
          .catch(() => {
            if (previousTask) {
              setBoard((prev) => {
                const nextColumns = prev.columns.map((col) => ({
                  ...col,
                  tasks: col.tasks.filter((t) => t.id !== selectedTaskId),
                }));
                const originalColumn = nextColumns.find(
                  (c) => c.id === previousTask.columnId
                );
                if (originalColumn) {
                  originalColumn.tasks.push(previousTask);
                }
                return { ...prev, columns: nextColumns };
              });
            }
            router.refresh();
          });
      } else {
        const columnId = selectedColId || columns[0]?.id;
        if (columnId) {
          const tempId = `temp-${Date.now()}`;
          const optimisticTask: Task = {
            id: tempId,
            title,
            description: description || null,
            priority: priority as "Low" | "Medium" | "High",
            dueDate: dueDate || null,
            status: columns.find((c) => c.id === columnId)?.name || "Backlog",
            progress,
            taskType: taskType as "Concept" | "Project" | "Revision",
            timeSpent: 0,
            order: Date.now(),
            columnId,
            boardId: board.id,
            tags: [],
            subtasks: [],
            resources: [],
            timeEntries: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setBoard((prev) => ({
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === columnId
                ? { ...col, tasks: [...col.tasks, optimisticTask] }
                : col
            ),
          }));

          handleClose();

          createTask(columnId, board.id, {
            title,
            description: description || undefined,
            priority: priority as "Low" | "Medium" | "High",
            taskType: taskType as "Concept" | "Project" | "Revision",
            dueDate: dueDate || null,
            progress,
          })
            .then((createdTask) => {
              const normalizedTask = JSON.parse(JSON.stringify(createdTask)) as Task;
              setBoard((prev) => ({
                ...prev,
                columns: prev.columns.map((col) => ({
                  ...col,
                  tasks: col.tasks.map((t) => (t.id === tempId ? normalizedTask : t)),
                })),
              }));
            })
            .catch(() => {
              setBoard((prev) => ({
                ...prev,
                columns: prev.columns.map((col) => ({
                  ...col,
                  tasks: col.tasks.filter((t) => t.id !== tempId),
                })),
              }));
              router.refresh();
            });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    const previousTask = task;
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== selectedTaskId),
      })),
    }));
    handleClose();
    deleteTask(selectedTaskId).catch(() => {
      if (previousTask) {
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === previousTask.columnId
              ? { ...col, tasks: [...col.tasks, previousTask] }
              : col
          ),
        }));
      }
      router.refresh();
    });
  };

  const handleClose = () => {
    setTaskDialogOpen(false);
    setSelectedTaskId(null);
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !selectedTaskId) return;
    const subtaskTitle = newSubtask.trim();
    const tempId = `temp-subtask-${Date.now()}`;
    const tempSubtask: Subtask = {
      id: tempId,
      title: subtaskTitle,
      completed: false,
      taskId: selectedTaskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      subtasks: [...currentTask.subtasks, tempSubtask],
    }));
    setNewSubtask("");
    try {
      const createdSubtask = await addSubtask(selectedTaskId, subtaskTitle);
      const normalizedSubtask = JSON.parse(
        JSON.stringify(createdSubtask)
      ) as Subtask;
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        subtasks: currentTask.subtasks.map((st) =>
          st.id === tempId ? normalizedSubtask : st
        ),
      }));
    } catch {
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        subtasks: currentTask.subtasks.filter((st) => st.id !== tempId),
      }));
      router.refresh();
    }
  };

  const handleToggleSubtask = async (id: string, completed: boolean) => {
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      subtasks: currentTask.subtasks.map((st) =>
        st.id === id ? { ...st, completed: !completed } : st
      ),
    }));
    try {
      await toggleSubtask(id, !completed);
    } catch {
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        subtasks: currentTask.subtasks.map((st) =>
          st.id === id ? { ...st, completed } : st
        ),
      }));
      router.refresh();
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    const previousSubtask = task?.subtasks.find((st) => st.id === id);
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      subtasks: currentTask.subtasks.filter((st) => st.id !== id),
    }));
    try {
      await deleteSubtask(id);
    } catch {
      if (previousSubtask) {
        updateCurrentTaskInBoard((currentTask) => ({
          ...currentTask,
          subtasks: [...currentTask.subtasks, previousSubtask],
        }));
      }
      router.refresh();
    }
  };

  const handleAddResource = async () => {
    if (!resourceUrl.trim() || !selectedTaskId) return;
    const tempId = `temp-resource-${Date.now()}`;
    const tempResource: Resource = {
      id: tempId,
      url: resourceUrl.trim(),
      title: resourceTitle || null,
      taskId: selectedTaskId,
      createdAt: new Date().toISOString(),
    };
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      resources: [tempResource, ...currentTask.resources],
    }));
    setResourceUrl("");
    setResourceTitle("");
    try {
      const createdResource = await addResource(
        selectedTaskId,
        tempResource.url,
        tempResource.title || undefined
      );
      const normalizedResource = JSON.parse(
        JSON.stringify(createdResource)
      ) as Resource;
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        resources: currentTask.resources.map((res) =>
          res.id === tempId ? normalizedResource : res
        ),
      }));
    } catch {
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        resources: currentTask.resources.filter((res) => res.id !== tempId),
      }));
      router.refresh();
    }
  };

  const handleRemoveResource = async (id: string) => {
    const previousResource = task?.resources.find((res) => res.id === id);
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      resources: currentTask.resources.filter((res) => res.id !== id),
    }));
    try {
      await removeResource(id);
    } catch {
      if (previousResource) {
        updateCurrentTaskInBoard((currentTask) => ({
          ...currentTask,
          resources: [previousResource, ...currentTask.resources],
        }));
      }
      router.refresh();
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || !selectedTaskId) return;
    const tempTagId = `temp-tag-${Date.now()}`;
    const tagName = newTagName.trim();
    const tempTaskTag: TaskTag = {
      taskId: selectedTaskId,
      tagId: tempTagId,
      tag: { id: tempTagId, name: tagName },
    };
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      tags: [...(currentTask.tags || []), tempTaskTag],
    }));
    setNewTagName("");
    try {
      const createdTag = await createTag(tagName);
      await addTagToTask(selectedTaskId, createdTag.id);
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        tags: (currentTask.tags || []).map((tt) =>
          tt.tag.id === tempTagId
            ? { taskId: selectedTaskId, tagId: createdTag.id, tag: createdTag }
            : tt
        ),
      }));
    } catch {
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        tags: (currentTask.tags || []).filter((tt) => tt.tag.id !== tempTagId),
      }));
      router.refresh();
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!selectedTaskId) return;
    const previousTaskTag = task?.tags.find((tt) => tt.tag.id === tagId);
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      tags: (currentTask.tags || []).filter((tt) => tt.tag.id !== tagId),
    }));
    try {
      await removeTagFromTask(selectedTaskId, tagId);
    } catch {
      if (previousTaskTag) {
        updateCurrentTaskInBoard((currentTask) => ({
          ...currentTask,
          tags: [...(currentTask.tags || []), previousTaskTag],
        }));
      }
      router.refresh();
    }
  };

  const handleLogTime = async () => {
    const mins = parseInt(timeMinutes);
    if (!mins || mins <= 0 || !selectedTaskId) return;
    const tempEntryId = `temp-time-${Date.now()}`;
    const tempEntry: TimeEntry = {
      id: tempEntryId,
      minutes: mins,
      note: null,
      taskId: selectedTaskId,
      createdAt: new Date().toISOString(),
    };
    updateCurrentTaskInBoard((currentTask) => ({
      ...currentTask,
      timeSpent: currentTask.timeSpent + mins,
      timeEntries: [...(currentTask.timeEntries || []), tempEntry],
    }));
    setTimeMinutes("");
    try {
      const createdEntry = await logTime(selectedTaskId, mins);
      const normalizedEntry = JSON.parse(JSON.stringify(createdEntry)) as TimeEntry;
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        timeEntries: (currentTask.timeEntries || []).map((te) =>
          te.id === tempEntryId ? normalizedEntry : te
        ),
      }));
    } catch {
      updateCurrentTaskInBoard((currentTask) => ({
        ...currentTask,
        timeSpent: Math.max(0, currentTask.timeSpent - mins),
        timeEntries: (currentTask.timeEntries || []).filter(
          (te) => te.id !== tempEntryId
        ),
      }));
      router.refresh();
    }
  };

  const completedSubtasks = task?.subtasks.filter((s: Subtask) => s.completed).length || 0;
  const totalSubtasks = task?.subtasks.length || 0;
  const selectedColumnName =
    columns.find((col) => col.id === selectedColId)?.name || "Select column";

  return (
    <Dialog open={taskDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 pb-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you learning?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Grid: Priority, Type, Column, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={taskType} onValueChange={(v) => v && setTaskType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concept">Concept</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Column</Label>
                <Select value={selectedColId} onValueChange={(v) => v && setSelectedColId(v)}>
                  <SelectTrigger className="w-full">
                    <span className="truncate">{selectedColumnName}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Label>Progress ({progress}%)</Label>
              <Progress value={progress} className="h-2" />
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Task-specific sections (only when editing) */}
            {isEditing && task && (
              <>
                <Separator />

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.tags?.map((tt: TaskTag) => (
                      <Badge key={tt.tag.id} variant="secondary" className="gap-1">
                        {tt.tag.name}
                        <button onClick={() => handleRemoveTag(tt.tag.id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Add tag..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button size="sm" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  <Label>
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </Label>
                  <div className="space-y-1">
                    {task.subtasks?.map((st: Subtask) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-2 group py-1"
                      >
                        <Checkbox
                          checked={st.completed}
                          onCheckedChange={() =>
                            handleToggleSubtask(st.id, st.completed)
                          }
                          className="h-4 w-4"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            st.completed
                              ? "line-through text-slate-400"
                              : ""
                          }`}
                        >
                          {st.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteSubtask(st.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add subtask..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <Button size="sm" variant="outline" onClick={handleAddSubtask}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <Label>Resources</Label>
                  <div className="space-y-1">
                    {task.resources?.map((res: Resource) => (
                      <div
                        key={res.id}
                        className="flex items-center gap-2 group py-1"
                      >
                        <Link className="h-3 w-3 text-slate-400" />
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {res.title || res.url}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveResource(res.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        placeholder="URL"
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddResource();
                          }
                        }}
                      />
                      <Button size="sm" variant="outline" onClick={handleAddResource}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Time Tracking */}
                <div className="space-y-2">
                  <Label>
                    Time Spent: {Math.floor(task.timeSpent / 60)}h{" "}
                    {task.timeSpent % 60}m
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={timeMinutes}
                      onChange={(e) => setTimeMinutes(e.target.value)}
                      placeholder="Minutes"
                      className="h-8 text-sm w-28"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleLogTime();
                        }
                      }}
                    />
                    <Button size="sm" variant="outline" onClick={handleLogTime}>
                      <Clock className="h-3 w-3 mr-1" />
                      Log Time
                    </Button>
                  </div>
                  {task.timeEntries && task.timeEntries.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                      {task.timeEntries.slice(-5).map((te: TimeEntry) => (
                        <div key={te.id} className="flex justify-between">
                          <span>{te.note || "No note"}</span>
                          <span>
                            {te.minutes}m -{" "}
                            {format(new Date(te.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-500">Delete</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {isEditing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
