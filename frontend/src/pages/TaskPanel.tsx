import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { api, unwrap } from "../lib/api";
import { Priority, Project, Status, Task } from "../types/domain";
import { Badge } from "./Dashboard";

export function TaskPanel({ task, project, isAdmin, onClose, onDone }: { task: Task; project: Project; isAdmin: boolean; onClose: () => void; onDone: () => void }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: (data: Partial<Task>) => unwrap<Task>(api.put(`/api/projects/${project.id}/tasks/${task.id}`, data)),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["project", project.id, "tasks"] });
      queryClient.setQueriesData<Task[]>({ queryKey: ["project", project.id, "tasks"] }, (old) => old?.map((t) => t.id === task.id ? { ...t, ...patch } : t));
    },
    onSettled: onDone
  });
  const del = useMutation({ mutationFn: () => unwrap(api.delete(`/api/projects/${project.id}/tasks/${task.id}`)), onSuccess: () => { onDone(); onClose(); } });
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} className="glass ml-auto h-full w-full max-w-xl overflow-y-auto rounded-l-xl p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">{task.title}</h2><p className="mt-2 text-[color:var(--text-secondary)]">{task.description}</p></div><button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose}><X size={18} /></button></div>
        <div className="mt-6 grid gap-4">
          <Field label="Status"><select className="input" defaultValue={task.status} onChange={(e) => update.mutate({ status: e.target.value as Status })}><option>TODO</option><option>IN_PROGRESS</option><option>DONE</option></select></Field>
          <Field label="Priority"><select className="input" defaultValue={task.priority} onChange={(e) => update.mutate({ priority: e.target.value as Priority })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></Field>
          <Field label="Assignee"><p>{task.assignee.name}</p></Field>
          <Field label="Due date"><p>{format(new Date(task.dueDate), "PPpp")} {task.overdue ? <Badge value="OVERDUE" /> : null}</p></Field>
          <Field label="Created by"><p>{task.createdBy.name}</p></Field>
          <Field label="Timestamps"><p className="text-sm">Created {format(new Date(task.createdAt), "PPpp")}<br />Updated {format(new Date(task.updatedAt), "PPpp")}</p></Field>
        </div>
        {isAdmin ? <button className="btn mt-8 w-full !from-red-500 !to-red-600" onClick={() => del.mutate()}><Trash2 size={16} />Delete task</button> : null}
      </motion.aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-[color:var(--border)] bg-white/[.03] p-4"><p className="mb-2 text-xs uppercase text-[color:var(--text-muted)]">{label}</p>{children}</div>;
}
