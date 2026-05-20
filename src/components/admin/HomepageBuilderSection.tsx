'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Star,
  Grid3x3,
  ImageIcon,
  MessageSquare,
  BarChart3,
  Megaphone,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  RefreshCcw,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

import {
  getHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
} from '@/lib/admin-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ============ TYPES ============

interface HomepageSection {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: unknown;
  order: number;
  isActive: boolean;
}

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero', icon: LayoutDashboard },
  { value: 'featured_cars', label: 'Featured Cars', icon: Star },
  { value: 'categories', label: 'Categories', icon: Grid3x3 },
  { value: 'banner', label: 'Banner', icon: ImageIcon },
  { value: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { value: 'stats', label: 'Stats', icon: BarChart3 },
  { value: 'cta', label: 'Call to Action', icon: Megaphone },
] as const;

const SECTION_TYPE_COLORS: Record<string, string> = {
  hero: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  featured_cars: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  categories: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  banner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  testimonials: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  stats: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  cta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

// ============ SECTION TYPE ICON COMPONENT ============

function SectionTypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = className || 'w-4 h-4';
  switch (type) {
    case 'hero':
      return <LayoutDashboard className={cls} />;
    case 'featured_cars':
      return <Star className={cls} />;
    case 'categories':
      return <Grid3x3 className={cls} />;
    case 'banner':
      return <ImageIcon className={cls} />;
    case 'testimonials':
      return <MessageSquare className={cls} />;
    case 'stats':
      return <BarChart3 className={cls} />;
    case 'cta':
      return <Megaphone className={cls} />;
    default:
      return <LayoutDashboard className={cls} />;
  }
}

// ============ HELPERS ============

function getSectionLabel(type: string): string {
  const found = SECTION_TYPES.find((t) => t.value === type);
  return found ? found.label : type.replace(/_/g, ' ');
}

// ============ SORTABLE ITEM ============

function SortableSectionItem({
  section,
  onToggle,
  onEdit,
  onDelete,
  toggleLoading,
}: {
  section: HomepageSection;
  onToggle: (section: HomepageSection) => void;
  onEdit: (section: HomepageSection) => void;
  onDelete: (section: HomepageSection) => void;
  toggleLoading: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-emerald-500/30' : 'hover:shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Type Icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-md ${
          SECTION_TYPE_COLORS[section.type] || 'bg-gray-100 text-gray-700'
        }`}
      >
        <SectionTypeIcon type={section.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {section.title || getSectionLabel(section.type)}
          </p>
          {!section.isActive && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              Hidden
            </Badge>
          )}
        </div>
        {section.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{section.subtitle}</p>
        )}
      </div>

      {/* Order Badge */}
      <Badge
        variant="outline"
        className="text-[10px] font-mono text-muted-foreground hidden sm:inline-flex"
      >
        #{section.order + 1}
      </Badge>

      {/* Active Toggle */}
      <Switch
        checked={section.isActive}
        onCheckedChange={() => onToggle(section)}
        disabled={toggleLoading}
        aria-label={`Toggle ${section.title || section.type}`}
      />

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(section)}
      >
        <Edit className="w-3.5 h-3.5" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        onClick={() => onDelete(section)}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}

// ============ SKELETON LOADER ============

function HomepageBuilderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

interface SectionFormData {
  type: string;
  title: string;
  subtitle: string;
  isActive: boolean;
}

const EMPTY_FORM: SectionFormData = {
  type: 'hero',
  title: '',
  subtitle: '',
  isActive: true,
};

export default function HomepageBuilderSection() {
  // Data state
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<SectionFormData>(EMPTY_FORM);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomepageSection | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============ FETCH SECTIONS ============
  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHomepageSections();
      if (res.success && res.data) {
        const sorted = (res.data as HomepageSection[]).sort(
          (a, b) => a.order - b.order
        );
        setSections(sorted);
      } else {
        setError(res.error || 'Failed to load homepage sections');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ============ DRAG & DROP ============
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));

    // Optimistic update
    setSections(reordered);

    // Persist new order
    try {
      await Promise.all(
        reordered.map((s) =>
          updateHomepageSection({ id: s.id, order: s.order })
        )
      );
      toast.success('Section order updated');
    } catch {
      toast.error('Failed to update order');
      fetchSections();
    }
  };

  // ============ TOGGLE ACTIVE ============
  const handleToggle = async (section: HomepageSection) => {
    const newActive = !section.isActive;
    setActionLoading(section.id);

    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, isActive: newActive } : s))
    );

    try {
      const res = await updateHomepageSection({
        id: section.id,
        isActive: newActive,
      });
      if (res.success) {
        toast.success(
          newActive
            ? `"${section.title || section.type}" enabled`
            : `"${section.title || section.type}" disabled`
        );
      } else {
        toast.error(res.error || 'Failed to update section');
        fetchSections();
      }
    } catch {
      toast.error('Network error');
      fetchSections();
    } finally {
      setActionLoading(null);
    }
  };

  // ============ CREATE SECTION ============
  const handleCreate = async () => {
    if (!formData.type) return;
    setDialogLoading(true);

    try {
      const payload: Parameters<typeof createHomepageSection>[0] = {
        type: formData.type,
        order: sections.length,
        isActive: formData.isActive,
      };
      if (formData.title.trim()) payload.title = formData.title.trim();
      if (formData.subtitle.trim()) payload.subtitle = formData.subtitle.trim();

      const res = await createHomepageSection(payload);
      if (res.success) {
        toast.success(`"${formData.title || getSectionLabel(formData.type)}" created`);
        setAddOpen(false);
        setFormData(EMPTY_FORM);
        fetchSections();
      } else {
        toast.error(res.error || 'Failed to create section');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ UPDATE SECTION ============
  const handleUpdate = async () => {
    if (!editingSection) return;
    setDialogLoading(true);

    try {
      const payload: Parameters<typeof updateHomepageSection>[0] = {
        id: editingSection.id,
        type: formData.type,
        isActive: formData.isActive,
      };
      if (formData.title.trim() !== (editingSection.title || ''))
        payload.title = formData.title.trim();
      if (formData.subtitle.trim() !== (editingSection.subtitle || ''))
        payload.subtitle = formData.subtitle.trim();

      const res = await updateHomepageSection(payload);
      if (res.success) {
        toast.success(`"${formData.title || getSectionLabel(formData.type)}" updated`);
        setEditOpen(false);
        setEditingSection(null);
        setFormData(EMPTY_FORM);
        fetchSections();
      } else {
        toast.error(res.error || 'Failed to update section');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ DELETE SECTION ============
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDialogLoading(true);

    try {
      const res = await deleteHomepageSection(deleteTarget.id);
      if (res.success) {
        toast.success(`"${deleteTarget.title || deleteTarget.type}" deleted`);
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchSections();
      } else {
        toast.error(res.error || 'Failed to delete section');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ OPEN EDIT ============
  const openEditDialog = (section: HomepageSection) => {
    setEditingSection(section);
    setFormData({
      type: section.type,
      title: section.title || '',
      subtitle: section.subtitle || '',
      isActive: section.isActive,
    });
    setEditOpen(true);
  };

  // ============ RENDER ============
  if (loading) return <HomepageBuilderSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={fetchSections}
          className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Homepage Builder</h2>
            <p className="text-muted-foreground text-xs">
              {sections.length} section{sections.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSections}
            className="gap-1.5"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Draggable Section List */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No homepage sections yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &ldquo;Add Section&rdquo; to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      onToggle={handleToggle}
                      onEdit={openEditDialog}
                      onDelete={(s) => {
                        setDeleteTarget(s);
                        setDeleteOpen(true);
                      }}
                      toggleLoading={actionLoading === section.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* ============ ADD SECTION DIALOG ============ */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) setAddOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Homepage Section</DialogTitle>
            <DialogDescription>
              Choose a section type and customize its content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>Section Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="add-title">Title</Label>
              <Input
                id="add-title"
                placeholder="Section title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="add-subtitle">Subtitle</Label>
              <Input
                id="add-subtitle"
                placeholder="Section subtitle..."
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="add-active">Active</Label>
              <Switch
                id="add-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={dialogLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={dialogLoading || !formData.type}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {dialogLoading ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT SECTION DIALOG ============ */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditingSection(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section content and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>Section Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Section title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="edit-subtitle">Subtitle</Label>
              <Input
                id="edit-subtitle"
                placeholder="Section subtitle..."
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEditOpen(false); setEditingSection(null); }}
              disabled={dialogLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={dialogLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {dialogLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION ============ */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => { if (!open) { setDeleteOpen(false); setDeleteTarget(null); } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Delete Section
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-foreground">
                &ldquo;{deleteTarget?.title || getSectionLabel(deleteTarget?.type || '')}&rdquo;
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={dialogLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dialogLoading ? 'Deleting...' : 'Delete Section'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
