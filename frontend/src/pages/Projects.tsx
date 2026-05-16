import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { SkeletonRows } from "../components/ui/Skeleton";
import { api, unwrap } from "../lib/api";
import { projectSchema } from "../lib/schemas";
import { Project } from "../types/domain";

export function Projects() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => unwrap<Project[]>(api.get("/api/projects")) });
  const mutation = useMutation({ mutationFn: (values: z.infer<typeof projectSchema>) => unwrap<Project>(api.post("/api/projects", values)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); } });
  const form = useForm<z.infer<typeof projectSchema>>({ resolver: zodResolver(projectSchema), defaultValues: { name: "", description: "" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <button className="btn" onClick={() => setOpen(true)}><Plus size={16} />New Project</button>
      </div>
      {isLoading ? <SkeletonRows rows={6} /> : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : <EmptyState title="No projects" text="Create your first project to start coordinating tasks." action={<button className="btn" onClick={() => setOpen(true)}><Plus size={16} />New Project</button>} />}
      {open && <Modal title="New Project" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <input className="input" placeholder="Project name" {...form.register("name")} />
          <textarea className="input min-h-28" placeholder="Description" {...form.register("description")} />
          <button className="btn w-full" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create project"}</button>
        </form>
      </Modal>}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const total = project.tasks.length;
  const done = project.tasks.filter((task) => task.status === "DONE").length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  return (
    <Link to={`/projects/${project.id}`} className="glass block rounded-xl p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--border-hover)]">
      <h3 className="text-xl font-semibold">{project.name}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[color:var(--text-secondary)]">{project.description}</p>
      <div className="mt-5 flex -space-x-2">{project.members.slice(0, 5).map((m) => <div key={m.id} className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--bg-card)] bg-indigo-500/30 text-xs font-semibold">{m.user.name[0]}</div>)}</div>
      <div className="mt-5 h-2 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${progress}%` }} /></div>
      <div className="mt-4 flex items-center justify-between text-xs text-[color:var(--text-secondary)]"><span>{project.members.length} members</span><span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span></div>
    </Link>
  );
}
