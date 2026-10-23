import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, FileText, FolderOpen, FolderPlus, Image as ImageIcon, Link2, NotebookPen, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiPost, apiUpload } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useFolders, useMaterials } from "@/lib/queries";
import { errMsg, fileSize, relTime } from "@/lib/format";
import type { Folder, FolderCreate, Material, MaterialCreate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, EmptyState, LoadError, SectionHeader, Segmented, SkeletonList } from "@/components/common";

type Kind = "link" | "note" | "file";
const ALL = "__all__";

function refreshMaterials() {
  void queryClient.invalidateQueries({ queryKey: ["materials"] });
  void queryClient.invalidateQueries({ queryKey: ["folders"] });
}

function MaterialCard({ m, folderName }: { m: Material; folderName?: string }) {
  const fileUrl = m.file_id ? `/api/files/${m.file_id}` : null;
  const isImage = m.file_type?.startsWith("image/");
  const Icon = m.kind === "link" ? Link2 : m.kind === "note" ? NotebookPen : isImage ? ImageIcon : FileText;
  const tone = m.kind === "link" ? "text-[#58A6FF] bg-[#388BFD]/12" : m.kind === "note" ? "text-[#E3B341] bg-[#D29922]/12" : "text-[#D2A8FF] bg-[#BC8CFF]/12";

  return (
    <article className="flex flex-col rounded-lg border border-[#30363D] bg-[#161B22] p-4 transition-colors duration-150 hover:border-[#58A6FF]/40 hover:bg-[#1C2128]" data-testid={`material-card-${m.id}`}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", tone)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-snug" data-testid={`material-title-${m.id}`}>{m.title}</p>
          <p className="mt-0.5 text-xs text-[#8B949E]">
            {folderName && <span className="text-[#C9D1D9]">{folderName} · </span>}
            {m.kind === "link" ? "Link" : m.kind === "note" ? "Appunto" : `${m.file_type === "application/pdf" ? "PDF" : "Immagine"} · ${fileSize(m.file_size)}`}
          </p>
        </div>
      </div>

      {m.kind === "file" && isImage && fileUrl && (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-md border border-[#30363D]">
          <img src={fileUrl} alt={m.title} className="max-h-40 w-full object-cover" loading="lazy" />
        </a>
      )}
      {m.note && (
        <p className={cn("mt-3 text-sm leading-relaxed whitespace-pre-wrap text-[#C9D1D9]", m.kind === "note" && "rounded-md border border-[#30363D] bg-[#0D1117] p-3 font-mono text-[13px]")} data-testid={`material-note-${m.id}`}>
          {m.note}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-[#8B949E]">
          <Avatar name={m.author} size="sm" />
          <span className="truncate">{m.author} · {relTime(m.created_at)}</span>
        </span>
        {m.kind === "link" && m.url && (
          <a href={m.url} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#58A6FF] hover:underline" data-testid={`material-open-${m.id}`}>
            Apri <ExternalLink className="size-3.5" />
          </a>
        )}
        {m.kind === "file" && fileUrl && (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#58A6FF] hover:underline" data-testid={`material-open-${m.id}`}>
            Apri file <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export default function MaterialsPanel() {
  const folders = useFolders();
  const materials = useMaterials();
  const [active, setActive] = useState<string>(ALL);

  // new-folder draft
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  // new-material draft
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("link");
  const [targetFolder, setTargetFolder] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const folderList = folders.data ?? [];
  const folderById = Object.fromEntries(folderList.map((f) => [f.id, f.name]));

  const createFolder = useMutation({
    mutationFn: (body: FolderCreate) => apiPost<Folder>("/folders", body),
    onSuccess: (f) => {
      refreshMaterials();
      toast.success(`Cartella «${f.name}» creata`);
      setFolderName("");
      setFolderOpen(false);
      setActive(f.id);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const resetMaterial = () => {
    setTitle("");
    setUrl("");
    setNote("");
    setFile(null);
    setFileKey((k) => k + 1);
    setOpen(false);
  };

  const createMaterial = useMutation({
    mutationFn: async (): Promise<Material> => {
      if (kind === "file") {
        const form = new FormData();
        form.append("folder_id", targetFolder);
        form.append("title", title.trim());
        if (file) form.append("file", file);
        return apiUpload<Material>("/materials/upload", form);
      }
      const body: MaterialCreate = { folder_id: targetFolder, title: title.trim(), kind, url: kind === "link" ? url.trim() : null, note: note.trim() || null };
      return apiPost<Material>("/materials", body);
    },
    onSuccess: () => {
      refreshMaterials();
      toast.success("Materiale aggiunto");
      resetMaterial();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openMaterialDialog = () => {
    if (!targetFolder) setTargetFolder(active !== ALL ? active : folderList[0]?.id ?? "");
    setOpen(true);
  };

  const submitMaterial = (e: FormEvent) => {
    e.preventDefault();
    if (!targetFolder) return toast.error("Scegli una cartella di destinazione");
    if (kind === "file" && !file) return toast.error("Seleziona un file PDF o un'immagine");
    if (file && file.size > 8 * 1024 * 1024) return toast.error("File troppo grande (max 8 MB)");
    createMaterial.mutate();
  };

  const items = (materials.data ?? []).filter((m) => active === ALL || m.folder_id === active);
  const totalCount = materials.data?.length ?? 0;

  return (
    <div>
      <SectionHeader
        title="Materiali & Cartelle"
        subtitle="Schemi, link a Drive, PDF e appunti, divisi per materia."
        testId="materials"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFolderOpen(true)} className="h-9 gap-1.5" data-testid="add-folder-button">
              <FolderPlus className="size-4" /> <span className="hidden sm:inline">Cartella</span>
            </Button>
            <Button onClick={openMaterialDialog} disabled={folderList.length === 0} className="h-9 gap-1.5" data-testid="add-material-button">
              <Plus className="size-4" /> <span className="hidden sm:inline">Aggiungi materiale</span><span className="sm:hidden">Aggiungi</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        {/* folders */}
        <nav className="col-span-12 md:col-span-4 lg:col-span-3" data-testid="folder-list">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:gap-1 md:px-0">
            {[{ id: ALL, name: "Tutti i materiali", item_count: totalCount }, ...folderList].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                data-testid={`folder-item-${f.id === ALL ? "all" : f.id}`}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150 md:w-full",
                  active === f.id ? "border-[#388BFD]/50 bg-[#388BFD]/10 text-[#F0F6FC]" : "border-[#30363D] bg-[#161B22] text-[#C9D1D9] hover:border-[#58A6FF]/40 md:border-transparent md:bg-transparent md:hover:bg-[#161B22]",
                )}
              >
                <FolderOpen className={cn("size-4 shrink-0", active === f.id ? "text-[#58A6FF]" : "text-[#BC8CFF]")} />
                <span className="truncate md:flex-1">{f.name}</span>
                <span className="text-xs text-[#8B949E]">{f.item_count}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* items */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9">
          {materials.isPending || folders.isPending ? (
            <SkeletonList />
          ) : materials.isError || folders.isError ? (
            <LoadError testId="materials-error" />
          ) : folderList.length === 0 ? (
            <EmptyState icon={<FolderPlus className="size-5" />} title="Nessuna cartella" hint="Crea una cartella per materia, es. Matematica." testId="folders-empty" />
          ) : items.length === 0 ? (
            <EmptyState icon={<FolderOpen className="size-5" />} title="Cartella vuota" hint="Aggiungi un link, un appunto o un file." testId="materials-empty" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2" data-testid="materials-list">
              {items.map((m) => (
                <MaterialCard key={m.id} m={m} folderName={active === ALL ? folderById[m.folder_id] : undefined} />
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-[#8B949E]">Chiunque può aggiungere risorse; i contenuti pubblicati non si possono eliminare.</p>
        </section>
      </div>

      {/* new folder */}
      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="folder-dialog">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createFolder.mutate({ name: folderName.trim() });
            }}
          >
            <DialogHeader>
              <DialogTitle>Nuova cartella</DialogTitle>
              <DialogDescription>Es. Matematica, Storia, Schemi & Formulari.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-1.5">
              <Label htmlFor="folder-name">Nome</Label>
              <Input id="folder-name" value={folderName} onChange={(e) => setFolderName(e.target.value)} required maxLength={40} placeholder="es. Filosofia" data-testid="folder-name-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFolderOpen(false)} data-testid="folder-cancel-button">Chiudi</Button>
              <Button type="submit" disabled={createFolder.isPending} data-testid="folder-submit-button">Crea cartella</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* new material */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="material-dialog">
          <form onSubmit={submitMaterial}>
            <DialogHeader>
              <DialogTitle>Aggiungi materiale</DialogTitle>
              <DialogDescription>Visibile a tutta la classe, non eliminabile.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <Segmented
                value={kind}
                onChange={setKind}
                testId="material-kind"
                className="w-full"
                options={[
                  { value: "link", label: <span className="flex items-center justify-center gap-1.5"><Link2 className="size-3.5" /> Link</span> },
                  { value: "note", label: <span className="flex items-center justify-center gap-1.5"><NotebookPen className="size-3.5" /> Appunto</span> },
                  { value: "file", label: <span className="flex items-center justify-center gap-1.5"><Upload className="size-3.5" /> File</span> },
                ]}
              />
              <div className="space-y-1.5">
                <Label>Cartella</Label>
                <Select value={targetFolder} onValueChange={(v: string) => setTargetFolder(v)}>
                  <SelectTrigger className="w-full" data-testid="material-folder-select">
                    <SelectValue>{(v) => folderById[v as string] ?? "Scegli cartella"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {folderList.map((f) => (
                      <SelectItem key={f.id} value={f.id} data-testid={`material-folder-option-${f.id}`}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-title">Titolo</Label>
                <Input id="mat-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="es. Schema sul Rinascimento" data-testid="material-title-input" />
              </div>
              {kind === "link" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="mat-url">Link</Label>
                    <Input id="mat-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://drive.google.com/…" data-testid="material-url-input" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mat-desc">Descrizione (facoltativa)</Label>
                    <Input id="mat-desc" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Cosa contiene?" data-testid="material-link-note-input" />
                  </div>
                </>
              )}
              {kind === "note" && (
                <div className="space-y-1.5">
                  <Label htmlFor="mat-note">Appunto</Label>
                  <Textarea id="mat-note" value={note} onChange={(e) => setNote(e.target.value)} required rows={5} maxLength={5000} placeholder="Scrivi qui formule, schemi, riassunti…" data-testid="material-note-input" />
                </div>
              )}
              {kind === "file" && (
                <div className="space-y-1.5">
                  <Label htmlFor="mat-file">File (PDF o immagine, max 8 MB)</Label>
                  <label htmlFor="mat-file" className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-[#30363D] bg-[#0D1117] px-3 py-4 text-sm transition-colors duration-150 hover:border-[#58A6FF]/50">
                    <Upload className="size-4 text-[#8B949E]" />
                    <span className="min-w-0 flex-1 truncate text-[#C9D1D9]">{file ? `${file.name} · ${fileSize(file.size)}` : "Scegli un file dal dispositivo"}</span>
                  </label>
                  <input
                    key={fileKey}
                    id="mat-file"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    data-testid="material-file-input"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="material-cancel-button">Chiudi</Button>
              <Button type="submit" disabled={createMaterial.isPending} data-testid="material-submit-button">{createMaterial.isPending ? "Salvo…" : "Aggiungi"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
