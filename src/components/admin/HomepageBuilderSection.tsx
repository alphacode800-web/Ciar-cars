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
  Sparkles,
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
  generateSeoAi,
} from '@/lib/admin-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { pickLocalized, type LocalizedString } from '@/lib/cms-content';

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

const SECTION_TYPE_DEFS = [
  { value: 'hero', icon: LayoutDashboard },
  { value: 'banner', icon: ImageIcon },
  { value: 'gallery', icon: Layers },
  { value: 'featured_cars', icon: Star },
  { value: 'categories', icon: Grid3x3 },
  { value: 'stats', icon: BarChart3 },
  { value: 'testimonials', icon: MessageSquare },
  { value: 'payments', icon: Megaphone },
  { value: 'cta', icon: Megaphone },
] as const;

const SECTION_TYPE_COLORS: Record<string, string> = {
  hero: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  featured_cars: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  categories: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  banner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  testimonials: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  stats: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  cta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gallery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  payments: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
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

function getSectionTypeLabel(type: string, t: (key: string) => string): string {
  const key = `homepage.types.${type}`;
  const label = t(key);
  return label === key ? type.replace(/_/g, ' ') : label;
}

function resolveSectionDisplay(
  section: HomepageSection,
  locale: string,
  t: (key: string) => string
): { title: string; subtitle: string } {
  const content = (section.content && typeof section.content === 'object'
    ? section.content
    : {}) as { title?: LocalizedString; subtitle?: LocalizedString };
  const title =
    pickLocalized(content.title, locale) ||
    section.title ||
    getSectionTypeLabel(section.type, t);
  const subtitle =
    pickLocalized(content.subtitle, locale) || section.subtitle || '';
  return { title, subtitle };
}

// ============ SORTABLE ITEM ============

function SortableSectionItem({
  section,
  onToggle,
  onEdit,
  onDelete,
  toggleLoading,
  t,
  locale,
}: {
  section: HomepageSection;
  onToggle: (section: HomepageSection) => void;
  onEdit: (section: HomepageSection) => void;
  onDelete: (section: HomepageSection) => void;
  toggleLoading: boolean;
  t: (key: string) => string;
  locale: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  const { title, subtitle } = resolveSectionDisplay(section, locale, t);

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
        aria-label={t('homepage.dragReorder')}
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
          <p className="text-sm font-medium truncate">{title}</p>
          {!section.isActive && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              {t('homepage.hidden')}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
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
        aria-label={title}
      />

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(section)}
      >
        <Edit className="w-3.5 h-3.5" />
        <span className="sr-only">{t('common.save')}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        onClick={() => onDelete(section)}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="sr-only">{t('common.delete')}</span>
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
  contentJson: string;
}

const EMPTY_FORM: SectionFormData = {
  type: 'hero',
  title: '',
  subtitle: '',
  isActive: true,
  contentJson: '{\n  "title": { "en": "", "ar": "" }\n}',
};

export default function HomepageBuilderSection() {
  const { t, locale } = useAdminTranslation();

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
        setError(res.error || t('homepage.loadError'));
      }
    } catch {
      setError(t('homepage.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      toast.success(t('homepage.reordered'));
    } catch {
      toast.error(t('homepage.networkError'));
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
        toast.success(t('homepage.updated'));
      } else {
        toast.error(res.error || t('homepage.networkError'));
        fetchSections();
      }
    } catch {
      toast.error(t('homepage.networkError'));
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
      let content: unknown = {};
      try {
        content = JSON.parse(formData.contentJson || '{}');
      } catch {
        content = {};
      }

      const payload: Parameters<typeof createHomepageSection>[0] = {
        type: formData.type,
        order: sections.length,
        isActive: formData.isActive,
        content,
      };
      if (formData.title.trim()) payload.title = formData.title.trim();
      if (formData.subtitle.trim()) payload.subtitle = formData.subtitle.trim();

      const res = await createHomepageSection(payload);
      if (res.success) {
        toast.success(t('homepage.created'));
        setAddOpen(false);
        setFormData(EMPTY_FORM);
        fetchSections();
      } else {
        toast.error(res.error || t('homepage.networkError'));
      }
    } catch {
      toast.error(t('homepage.networkError'));
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ UPDATE SECTION ============
  const handleUpdate = async () => {
    if (!editingSection) return;
    setDialogLoading(true);

    try {
      let content: unknown = undefined;
      try {
        content = JSON.parse(formData.contentJson || '{}');
      } catch {
        toast.error(t('homepage.networkError'));
        setDialogLoading(false);
        return;
      }

      const payload: Parameters<typeof updateHomepageSection>[0] = {
        id: editingSection.id,
        type: formData.type,
        isActive: formData.isActive,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        content,
      };

      const res = await updateHomepageSection(payload);
      if (res.success) {
        toast.success(t('homepage.updated'));
        setEditOpen(false);
        setEditingSection(null);
        setFormData(EMPTY_FORM);
        fetchSections();
      } else {
        toast.error(res.error || t('homepage.networkError'));
      }
    } catch {
      toast.error(t('homepage.networkError'));
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
        toast.success(t('homepage.deleted'));
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchSections();
      } else {
        toast.error(res.error || t('homepage.networkError'));
      }
    } catch {
      toast.error(t('homepage.networkError'));
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
      contentJson: JSON.stringify(section.content ?? {}, null, 2),
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
          {t('common.retry')}
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
            <h2 className="text-lg font-semibold tracking-tight">{t('homepage.title')}</h2>
            <p className="text-muted-foreground text-xs">
              {sections.length} {t('homepage.sectionsConfigured')}
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
            {t('common.refresh')}
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="h-3.5 w-3.5 me-1.5" />
            {t('homepage.addSection')}
          </Button>
        </div>
      </div>

      {/* Draggable Section List */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t('homepage.noSections')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('homepage.noSectionsHint')}
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
                      t={t}
                      locale={locale}
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
            <DialogTitle>{t('homepage.addTitle')}</DialogTitle>
            <DialogDescription>
              {t('homepage.addDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>{t('homepage.sectionTypeRequired')}</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('homepage.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPE_DEFS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <span className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {getSectionTypeLabel(item.value, t)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="add-title">{t('homepage.titleLabel')}</Label>
              <Input
                id="add-title"
                placeholder={t('homepage.titlePlaceholder')}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="add-subtitle">{t('homepage.subtitleLabel')}</Label>
              <Input
                id="add-subtitle"
                placeholder={t('homepage.subtitlePlaceholder')}
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="add-active">{t('homepage.active')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={dialogLoading || !formData.type}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {dialogLoading ? t('homepage.creating') : t('homepage.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT SECTION DIALOG ============ */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditingSection(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('homepage.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('homepage.editDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>{t('homepage.sectionType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('homepage.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPE_DEFS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <span className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {getSectionTypeLabel(item.value, t)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t('homepage.titleLabel')}</Label>
              <Input
                id="edit-title"
                placeholder={t('homepage.titlePlaceholder')}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="edit-subtitle">{t('homepage.subtitleLabel')}</Label>
              <Input
                id="edit-subtitle"
                placeholder={t('homepage.subtitlePlaceholder')}
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">{t('homepage.active')}</Label>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={async () => {
                  const res = await generateSeoAi({
                    target: 'section',
                    id: editingSection?.id,
                    locale: 'ar',
                    title: formData.title,
                    subtitle: formData.subtitle,
                    contentHint: formData.contentJson.slice(0, 1500),
                  });
                  if (!res.success) {
                    toast.error(res.error || t('aiSuite.error'));
                    return;
                  }
                  const draft = res.data;
                  setFormData((prev) => ({
                    ...prev,
                    title: draft.titleAr || draft.seoTitle || prev.title,
                    subtitle: draft.descriptionAr || draft.seoDescription || prev.subtitle,
                  }));
                  toast.success(t('aiSuite.seoApply'));
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t('aiSuite.seoAssist')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">{t('homepage.contentJson')}</Label>
              <Textarea
                id="edit-content"
                className="font-mono text-xs min-h-[220px]"
                value={formData.contentJson}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contentJson: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">{t('homepage.contentJsonHint')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEditOpen(false); setEditingSection(null); }}
              disabled={dialogLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={dialogLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {dialogLoading ? t('homepage.updating') : t('homepage.update')}
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
              {t('homepage.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('homepage.deleteDesc')}
              {deleteTarget && (
                <strong className="block mt-2 text-foreground">
                  {resolveSectionDisplay(deleteTarget, locale, t).title}
                </strong>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={dialogLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dialogLoading ? t('common.loading') : t('homepage.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
