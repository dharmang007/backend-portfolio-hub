import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  ArrowUpRight,
  Terminal,
  Send,
  Sparkles,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Palette,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Portfolio });

type Profile = {
  full_name: string; title: string; tagline: string; bio: string;
  email: string | null; location: string | null;
  github_url: string | null; linkedin_url: string | null;
  website_url: string | null; avatar_url: string | null; resume_url: string | null;
};

async function fetchAll() {
  const [profile, education, experience, projects, art] = await Promise.all([
    supabase.from("profile").select("*").limit(1).maybeSingle(),
    supabase.from("education").select("*").order("sort_order").order("created_at", { ascending: false }),
    supabase.from("experience").select("*").order("sort_order").order("created_at", { ascending: false }),
    supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false }),
    supabase.from("art_items").select("*").order("sort_order").order("created_at", { ascending: false }),
  ]);
  return {
    profile: (profile.data as Profile | null) ?? null,
    education: education.data ?? [],
    experience: experience.data ?? [],
    projects: projects.data ?? [],
    art: art.data ?? [],
  };
}

function Portfolio() {
  const { data, isLoading } = useQuery({ queryKey: ["portfolio"], queryFn: fetchAll });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground animate-pulse">$ loading...</div>
      </div>
    );
  }

  const p = data.profile;
  return (
    <div className="min-h-screen">
      <Nav isAdmin={isAdmin} />
      <Hero profile={p} />
      <AboutSection profile={p} />
      <ExperienceSection items={data.experience} />
      <EducationSection items={data.education} />
      <ProjectsSection items={data.projects} />
      <ArtSection items={data.art} />
      <ContactSection profile={p} />
      <Footer profile={p} />
    </div>
  );
}

function Nav({ isAdmin }: { isAdmin: boolean }) {
  const links = [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#education", label: "Education" },
    { href: "#projects", label: "Projects" },
    { href: "#art", label: "Art & Stuff" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#top" className="font-mono text-sm font-semibold flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-gradient">~/portfolio</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
              {l.label}
            </a>
          ))}
          <Link to={isAdmin ? "/admin" : "/auth"}
            className="ml-2 px-3 py-1.5 text-sm font-mono text-primary hover:text-glow transition-colors">
            {isAdmin ? "admin" : "·"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero({ profile }: { profile: Profile | null }) {
  return (
    <section id="top" className="relative overflow-hidden bg-hero grid-bg pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-3 py-1 text-xs font-mono text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> available for interesting work
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient">{profile?.full_name ?? "Your Name"}</span>
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-muted-foreground font-mono">
          <span className="text-primary">&gt;</span> {profile?.title ?? "Senior Backend Engineer"}
        </p>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/80">
          {profile?.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
            <a href="#projects"><Sparkles className="mr-2 h-4 w-4" /> See projects</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border/80">
            <a href="#contact"><Mail className="mr-2 h-4 w-4" /> Get in touch</a>
          </Button>
        </div>
        <div className="mt-10 flex items-center gap-5 text-muted-foreground">
          {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-foreground transition"><Github className="h-5 w-5" /></a>}
          {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-foreground transition"><Linkedin className="h-5 w-5" /></a>}
          {profile?.location && <span className="text-sm inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{profile.location}</span>}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ icon: Icon, kicker, title }: { icon: any; kicker: string; title: string }) {
  return (
    <div className="mb-10">
      <div className="font-mono text-xs text-primary flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" /> {kicker}
      </div>
      <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function AboutSection({ profile }: { profile: Profile | null }) {
  return (
    <section id="about" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader icon={Terminal} kicker="// about" title="My self" />
        <div className="prose prose-invert max-w-3xl">
          <p className="text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {profile?.bio || "Add your bio in the admin panel."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection({ items }: { items: any[] }) {
  return (
    <section id="experience" className="py-24 bg-surface/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader icon={Briefcase} kicker="// experience" title="Experience" />
        {items.length === 0 && <EmptyState text="No experience added yet." />}
        <div className="space-y-6">
          {items.map((x) => (
            <div key={x.id} className="group relative rounded-xl border border-border/70 bg-card p-6 shadow-card hover:shadow-glow hover:border-primary/40 transition-all">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold">{x.role}</h3>
                  <p className="text-primary font-medium">{x.company}{x.location && <span className="text-muted-foreground font-normal"> · {x.location}</span>}</p>
                </div>
                <p className="text-sm font-mono text-muted-foreground">
                  {x.start_date} — {x.is_current ? "present" : x.end_date}
                </p>
              </div>
              {x.description && <p className="mt-3 text-foreground/80 whitespace-pre-wrap">{x.description}</p>}
              {x.tech_stack?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {x.tech_stack.map((t: string) => (
                    <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationSection({ items }: { items: any[] }) {
  return (
    <section id="education" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader icon={GraduationCap} kicker="// education" title="Education" />
        {items.length === 0 && <EmptyState text="No education added yet." />}
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((e) => (
            <div key={e.id} className="rounded-xl border border-border/70 bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold">{e.degree}{e.field && <span className="text-muted-foreground font-normal"> · {e.field}</span>}</h3>
              <p className="text-primary">{e.institution}</p>
              <p className="text-sm font-mono text-muted-foreground mt-1">{e.start_date} — {e.end_date}</p>
              {e.description && <p className="mt-3 text-sm text-foreground/80">{e.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ items }: { items: any[] }) {
  return (
    <section id="projects" className="py-24 bg-surface/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader icon={FolderGit2} kicker="// projects" title="Projects" />
        {items.length === 0 && <EmptyState text="No projects added yet." />}
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((p) => (
            <article key={p.id} className="group relative rounded-xl border border-border/70 bg-card overflow-hidden shadow-card hover:shadow-glow hover:border-primary/40 transition-all">
              {p.image_url && (
                <div className="aspect-video overflow-hidden bg-surface">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  {p.featured && <Badge className="bg-gradient-primary">featured</Badge>}
                </div>
                {p.description && <p className="mt-2 text-sm text-foreground/80">{p.description}</p>}
                {p.tech_stack?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech_stack.map((t: string) => (
                      <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex gap-3 text-sm">
                  {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-glow"><Github className="h-4 w-4" /> code</a>}
                  {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-glow"><ExternalLink className="h-4 w-4" /> live</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtSection({ items }: { items: any[] }) {
  return (
    <section id="art" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader icon={Palette} kicker="// off-hours" title="Art and stuff" />
        {items.length === 0 && <EmptyState text="Nothing here yet." />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <a key={a.id} href={a.external_url || "#"} target={a.external_url ? "_blank" : undefined} rel="noreferrer"
              className="group rounded-xl border border-border/70 bg-card overflow-hidden shadow-card hover:border-primary/40 transition-all block">
              {a.image_url && (
                <div className="aspect-square overflow-hidden bg-surface">
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{a.title}</h3>
                  {a.external_url && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />}
                </div>
                {a.category && <p className="text-xs font-mono text-muted-foreground mt-0.5">{a.category}</p>}
                {a.description && <p className="text-sm text-foreground/80 mt-2">{a.description}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Required").max(5000),
});

function ContactSection({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send message"); return; }
    toast.success("Message sent — thanks!");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <section id="contact" className="py-24 bg-surface/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <SectionHeader icon={Send} kicker="// contact" title="Let's talk" />
          <p className="text-foreground/80 max-w-md">
            Have a role, a project, or a technical question? Drop a note — I read every message.
          </p>
          <div className="mt-6 space-y-2 font-mono text-sm text-muted-foreground">
            {profile?.email && <p><span className="text-primary">email</span> · <a className="hover:text-foreground" href={`mailto:${profile.email}`}>{profile.email}</a></p>}
            {profile?.github_url && <p><span className="text-primary">github</span> · <a className="hover:text-foreground" href={profile.github_url} target="_blank" rel="noreferrer">{profile.github_url.replace(/^https?:\/\//, "")}</a></p>}
            {profile?.linkedin_url && <p><span className="text-primary">linkedin</span> · <a className="hover:text-foreground" href={profile.linkedin_url} target="_blank" rel="noreferrer">{profile.linkedin_url.replace(/^https?:\/\//, "")}</a></p>}
          </div>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-border/70 bg-card p-6 shadow-card space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} /></div>
          </div>
          <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} /></div>
          <div><Label htmlFor="message">Message</Label><Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={5000} /></div>
          <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary shadow-glow hover:opacity-90">
            {submitting ? "Sending..." : <>Send <Send className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Footer({ profile }: { profile: Profile | null }) {
  return (
    <footer className="py-10 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground font-mono">
        <span>© {new Date().getFullYear()} {profile?.full_name}</span>
        <span>built with care · <Link to="/auth" className="hover:text-primary">admin</Link></span>
      </div>
    </footer>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm font-mono text-muted-foreground">{text}</div>;
}
