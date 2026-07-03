import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trash2, Plus, LogOut, Terminal, ExternalLink, Save, Mail,
  Briefcase, GraduationCap, FolderGit2, Palette, User as UserIcon, Inbox
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen grid-bg flex items-center justify-center font-mono text-sm text-muted-foreground">$ checking auth...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="max-w-md text-center rounded-xl border border-border/70 bg-card p-8">
          <h1 className="text-xl font-semibold">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account isn't an admin.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={signOut} variant="outline">Sign out</Button>
            <Button asChild><Link to="/">Home</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-gradient">~/admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/"><ExternalLink className="h-4 w-4 mr-1" /> View site</Link></Button>
            <Button onClick={signOut} variant="outline" size="sm"><LogOut className="h-4 w-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile"><UserIcon className="h-4 w-4 mr-1.5" />About</TabsTrigger>
            <TabsTrigger value="experience"><Briefcase className="h-4 w-4 mr-1.5" />Experience</TabsTrigger>
            <TabsTrigger value="education"><GraduationCap className="h-4 w-4 mr-1.5" />Education</TabsTrigger>
            <TabsTrigger value="projects"><FolderGit2 className="h-4 w-4 mr-1.5" />Projects</TabsTrigger>
            <TabsTrigger value="art"><Palette className="h-4 w-4 mr-1.5" />Art & Stuff</TabsTrigger>
            <TabsTrigger value="messages"><Inbox className="h-4 w-4 mr-1.5" />Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6"><ProfileEditor /></TabsContent>
          <TabsContent value="experience" className="mt-6"><ExperienceEditor /></TabsContent>
          <TabsContent value="education" className="mt-6"><EducationEditor /></TabsContent>
          <TabsContent value="projects" className="mt-6"><ProjectsEditor /></TabsContent>
          <TabsContent value="art" className="mt-6"><ArtEditor /></TabsContent>
          <TabsContent value="messages" className="mt-6"><MessagesInbox /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border/70 bg-card p-6 shadow-card">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ---------------- PROFILE ---------------- */
function ProfileEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => (await supabase.from("profile").select("*").limit(1).maybeSingle()).data,
  });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);
  if (isLoading || !form) return <Card>Loading...</Card>;

  async function save() {
    const { error } = await supabase.from("profile").update({
      full_name: form.full_name, title: form.title, tagline: form.tagline, bio: form.bio,
      email: form.email, location: form.location,
      github_url: form.github_url, linkedin_url: form.linkedin_url,
      website_url: form.website_url, avatar_url: form.avatar_url, resume_url: form.resume_url,
    }).eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["admin", "profile"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  }

  return (
    <Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
        <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Email"><Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Location"><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
        <Field label="GitHub URL"><Input value={form.github_url ?? ""} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></Field>
        <Field label="LinkedIn URL"><Input value={form.linkedin_url ?? ""} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></Field>
        <Field label="Website URL"><Input value={form.website_url ?? ""} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></Field>
        <Field label="Avatar URL"><Input value={form.avatar_url ?? ""} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} /></Field>
      </div>
      <div className="mt-4"><Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field></div>
      <div className="mt-4"><Field label="Bio"><Textarea rows={6} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field></div>
      <div className="mt-6"><Button onClick={save} className="bg-gradient-primary shadow-glow"><Save className="h-4 w-4 mr-1.5" /> Save</Button></div>
    </Card>
  );
}

/* ---------------- Generic list editor ---------------- */
function useList(table: string) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => (await (supabase as any).from(table).select("*").order("sort_order").order("created_at", { ascending: false })).data ?? [],
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };
  return { data, isLoading, invalidate };
}

async function upsertRow(table: string, row: any) {
  const { id, created_at, updated_at, ...rest } = row;
  if (id) return (supabase as any).from(table).update(rest).eq("id", id);
  return (supabase as any).from(table).insert(rest);
}

/* ---------------- EXPERIENCE ---------------- */
function ExperienceEditor() {
  const { data, isLoading, invalidate } = useList("experience");
  const empty = { role: "", company: "", location: "", start_date: "", end_date: "", is_current: false, description: "", tech_stack: [] as string[], sort_order: 0 };
  return <RowEditor title="Experience" list={data ?? []} isLoading={isLoading} empty={empty} table="experience" invalidate={invalidate}
    render={(row, set) => (
      <>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Role"><Input value={row.role} onChange={(e) => set({ ...row, role: e.target.value })} /></Field>
          <Field label="Company"><Input value={row.company} onChange={(e) => set({ ...row, company: e.target.value })} /></Field>
          <Field label="Location"><Input value={row.location ?? ""} onChange={(e) => set({ ...row, location: e.target.value })} /></Field>
          <Field label="Sort order"><Input type="number" value={row.sort_order} onChange={(e) => set({ ...row, sort_order: Number(e.target.value) })} /></Field>
          <Field label="Start (e.g. Jan 2022)"><Input value={row.start_date ?? ""} onChange={(e) => set({ ...row, start_date: e.target.value })} /></Field>
          <Field label="End"><Input value={row.end_date ?? ""} disabled={row.is_current} onChange={(e) => set({ ...row, end_date: e.target.value })} /></Field>
        </div>
        <div className="flex items-center gap-2 mt-3"><Switch checked={row.is_current} onCheckedChange={(v) => set({ ...row, is_current: v })} /><Label>Current role</Label></div>
        <div className="mt-3"><Field label="Description"><Textarea rows={4} value={row.description ?? ""} onChange={(e) => set({ ...row, description: e.target.value })} /></Field></div>
        <div className="mt-3"><TechStackInput value={row.tech_stack} onChange={(v) => set({ ...row, tech_stack: v })} /></div>
      </>
    )}
    label={(r) => `${r.role || "(role)"} @ ${r.company || "(company)"}`}
  />;
}

/* ---------------- EDUCATION ---------------- */
function EducationEditor() {
  const { data, isLoading, invalidate } = useList("education");
  const empty = { institution: "", degree: "", field: "", start_date: "", end_date: "", description: "", sort_order: 0 };
  return <RowEditor title="Education" list={data ?? []} isLoading={isLoading} empty={empty} table="education" invalidate={invalidate}
    render={(row, set) => (
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Institution"><Input value={row.institution} onChange={(e) => set({ ...row, institution: e.target.value })} /></Field>
        <Field label="Degree"><Input value={row.degree} onChange={(e) => set({ ...row, degree: e.target.value })} /></Field>
        <Field label="Field"><Input value={row.field ?? ""} onChange={(e) => set({ ...row, field: e.target.value })} /></Field>
        <Field label="Sort order"><Input type="number" value={row.sort_order} onChange={(e) => set({ ...row, sort_order: Number(e.target.value) })} /></Field>
        <Field label="Start"><Input value={row.start_date ?? ""} onChange={(e) => set({ ...row, start_date: e.target.value })} /></Field>
        <Field label="End"><Input value={row.end_date ?? ""} onChange={(e) => set({ ...row, end_date: e.target.value })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><Textarea rows={3} value={row.description ?? ""} onChange={(e) => set({ ...row, description: e.target.value })} /></Field></div>
      </div>
    )}
    label={(r) => `${r.degree || "(degree)"} — ${r.institution || "(institution)"}`}
  />;
}

/* ---------------- PROJECTS ---------------- */
function ProjectsEditor() {
  const { data, isLoading, invalidate } = useList("projects");
  const empty = { name: "", description: "", tech_stack: [] as string[], repo_url: "", live_url: "", image_url: "", featured: false, sort_order: 0 };
  return <RowEditor title="Projects" list={data ?? []} isLoading={isLoading} empty={empty} table="projects" invalidate={invalidate}
    render={(row, set) => (
      <>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Name"><Input value={row.name} onChange={(e) => set({ ...row, name: e.target.value })} /></Field>
          <Field label="Sort order"><Input type="number" value={row.sort_order} onChange={(e) => set({ ...row, sort_order: Number(e.target.value) })} /></Field>
          <Field label="Repo URL"><Input value={row.repo_url ?? ""} onChange={(e) => set({ ...row, repo_url: e.target.value })} /></Field>
          <Field label="Live URL"><Input value={row.live_url ?? ""} onChange={(e) => set({ ...row, live_url: e.target.value })} /></Field>
          <Field label="Image URL"><Input value={row.image_url ?? ""} onChange={(e) => set({ ...row, image_url: e.target.value })} /></Field>
          <div className="flex items-center gap-2 self-end pb-2"><Switch checked={row.featured} onCheckedChange={(v) => set({ ...row, featured: v })} /><Label>Featured</Label></div>
        </div>
        <div className="mt-3"><Field label="Description"><Textarea rows={3} value={row.description ?? ""} onChange={(e) => set({ ...row, description: e.target.value })} /></Field></div>
        <div className="mt-3"><TechStackInput value={row.tech_stack} onChange={(v) => set({ ...row, tech_stack: v })} /></div>
      </>
    )}
    label={(r) => r.name || "(project)"}
  />;
}

/* ---------------- ART & STUFF ---------------- */
function ArtEditor() {
  const { data, isLoading, invalidate } = useList("art_items");
  const empty = { title: "", description: "", image_url: "", external_url: "", category: "", sort_order: 0 };
  return <RowEditor title="Art & Stuff" list={data ?? []} isLoading={isLoading} empty={empty} table="art_items" invalidate={invalidate}
    render={(row, set) => (
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Title"><Input value={row.title} onChange={(e) => set({ ...row, title: e.target.value })} /></Field>
        <Field label="Category"><Input value={row.category ?? ""} onChange={(e) => set({ ...row, category: e.target.value })} /></Field>
        <Field label="Image URL"><Input value={row.image_url ?? ""} onChange={(e) => set({ ...row, image_url: e.target.value })} /></Field>
        <Field label="External URL"><Input value={row.external_url ?? ""} onChange={(e) => set({ ...row, external_url: e.target.value })} /></Field>
        <Field label="Sort order"><Input type="number" value={row.sort_order} onChange={(e) => set({ ...row, sort_order: Number(e.target.value) })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><Textarea rows={3} value={row.description ?? ""} onChange={(e) => set({ ...row, description: e.target.value })} /></Field></div>
      </div>
    )}
    label={(r) => r.title || "(item)"}
  />;
}

function TechStackInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState("");
  useEffect(() => { setText((value ?? []).join(", ")); }, [value]);
  return (
    <Field label="Tech stack (comma-separated)">
      <Input value={text} onChange={(e) => setText(e.target.value)}
        onBlur={() => onChange(text.split(",").map((s) => s.trim()).filter(Boolean))} />
    </Field>
  );
}

/* ---------------- Generic RowEditor ---------------- */
function RowEditor({
  title, list, isLoading, empty, table, invalidate, render, label,
}: {
  title: string; list: any[]; isLoading: boolean; empty: any; table: string;
  invalidate: () => void;
  render: (row: any, set: (r: any) => void) => React.ReactNode;
  label: (r: any) => string;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  if (isLoading) return <Card>Loading...</Card>;

  async function save() {
    const { error } = await upsertRow(table, editing);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    invalidate();
  }
  async function del(id: string) {
    if (!confirm("Delete this?")) return;
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    invalidate();
  }

  return (
    <div className="space-y-4">
      {editing ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editing.id ? "Edit" : "New"} — {title}</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
          {render(editing, setEditing)}
          <div className="mt-6"><Button onClick={save} className="bg-gradient-primary shadow-glow"><Save className="h-4 w-4 mr-1.5" /> Save</Button></div>
        </Card>
      ) : (
        <Button onClick={() => setEditing(empty)}><Plus className="h-4 w-4 mr-1.5" /> Add {title.toLowerCase()}</Button>
      )}
      <div className="grid gap-2">
        {list.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-4">
            <span className="text-sm truncate">{label(r)}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground font-mono">// nothing yet</p>}
      </div>
    </div>
  );
}

/* ---------------- MESSAGES ---------------- */
function MessagesInbox() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const unread = useMemo(() => (data ?? []).filter((m) => !m.is_read).length, [data]);

  async function toggleRead(id: string, is_read: boolean) {
    await supabase.from("contact_messages").update({ is_read: !is_read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  }

  if (isLoading) return <Card>Loading...</Card>;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><span className="text-sm text-muted-foreground">{unread} unread · {data?.length ?? 0} total</span></div>
      {(data ?? []).map((m) => (
        <Card key={m.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-semibold">{m.name} <span className="text-muted-foreground font-normal">· <a href={`mailto:${m.email}`} className="underline decoration-dotted">{m.email}</a></span></p>
              {m.subject && <p className="text-sm text-primary">{m.subject}</p>}
            </div>
            <div className="flex items-center gap-2">
              {!m.is_read && <Badge className="bg-gradient-primary">new</Badge>}
              <span className="text-xs font-mono text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-foreground/85">{m.message}</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggleRead(m.id, m.is_read)}>{m.is_read ? "Mark unread" : "Mark read"}</Button>
            <Button size="sm" variant="ghost" onClick={() => del(m.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
          </div>
        </Card>
      ))}
      {(data ?? []).length === 0 && <p className="text-sm text-muted-foreground font-mono">// inbox is empty</p>}
    </div>
  );
}
