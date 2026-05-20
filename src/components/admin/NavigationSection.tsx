'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  RefreshCcw,
  AlertCircle,
  ChevronRight,
  Menu,
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
  getNavigationItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
} from '@/lib/admin-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface NavItem {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  parentId: string | null;
  position: string;
  order: number;
  isActive: boolean;
  isOpen: boolean;
  children?: NavItem[];
}

interface NavItemFormData {
  label: string;
  url: string;
  icon: string;
  parentId: string;
  position: string;
  order: number;
  isActive: boolean;
  isOpen: boolean;
}

const EMPTY_FORM: NavItemFormData = {
  label: '',
  url: '',
  icon: '',
  parentId: '',
  position: 'navbar',
  order: 0,
  isActive: true,
  isOpen: false,
};

type TabPosition = 'navbar' | 'footer';

// ============ HELPERS ============

/** Flatten nested items for drag-sortable list (children shown indented) */
function flattenItems(items: NavItem[]): NavItem[] {
  const flat: NavItem[] = [];
  for (const item of items) {
    flat.push(item);
    if (item.children && item.children.length > 0) {
      flat.push(...item.children);
    }
  }
  return flat;
}

function getTopLevelItems(items: NavItem[]): NavItem[] {
  return items.filter((item) => !item.parentId);
}

// ============ SORTABLE NAV ITEM ============

function SortableNavItemRow({
  item,
  depth,
  allItems,
  onToggle,
  onEdit,
  onDelete,
  toggleLoading,
}: {
  item: NavItem;
  depth: number;
  allItems: NavItem[];
  onToggle: (item: NavItem) => void;
  onEdit: (item: NavItem) => void;
  onDelete: (item: NavItem) => void;
  toggleLoading: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    paddingLeft: `${depth * 24 + 12}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 py-2.5 border-b last:border-0 transition-colors ${
        isDragging ? 'bg-emerald-50 dark:bg-emerald-950/10' : ''
      }`}
    >
      {/* Drag Handle - only for top-level items */}
      {!item.parentId ? (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-4 flex-shrink-0" />
      )}

      {/* Depth indicator for children */}
      {item.parentId && (
        <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
      )}

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        {item.url && (
          <p className="text-xs text-muted-foreground truncate">{item.url}</p>
        )}
      </div>

      {/* Children count */}
      {item.children && item.children.length > 0 && (
        <Badge
          variant="secondary"
          className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        >
          {item.children.length} sub
        </Badge>
      )}

      {/* Dropdown indicator */}
      {item.isOpen && (
        <Badge
          variant="secondary"
          className="text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        >
          Dropdown
        </Badge>
      )}

      {/* Active Toggle */}
      <Switch
        checked={item.isActive}
        onCheckedChange={() => onToggle(item)}
        disabled={toggleLoading}
        aria-label={`Toggle ${item.label}`}
        className="flex-shrink-0"
      />

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(item)}
        >
          <Edit className="w-3.5 h-3.5" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}

// ============ SKELETON ============

function NavigationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="rounded-lg border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b last:border-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function NavigationSection() {
  // Data state
  const [navbarItems, setNavbarItems] = useState<NavItem[]>([]);
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<TabPosition>('navbar');

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<NavItemFormData>(EMPTY_FORM);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);
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

  // ============ FETCH ============
  const fetchNavItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [navRes, footerRes] = await Promise.all([
        getNavigationItems('navbar'),
        getNavigationItems('footer'),
      ]);
      if (navRes.success && navRes.data) {
        setNavbarItems(
          (navRes.data as NavItem[]).sort((a, b) => a.order - b.order)
        );
      }
      if (footerRes.success && footerRes.data) {
        setFooterItems(
          (footerRes.data as NavItem[]).sort((a, b) => a.order - b.order)
        );
      }
      if (!navRes.success && !footerRes.success) {
        setError('Failed to load navigation items');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavItems();
  }, [fetchNavItems]);

  // Current items based on tab
  const currentItems = activeTab === 'navbar' ? navbarItems : footerItems;
  const setCurrentItems =
    activeTab === 'navbar' ? setNavbarItems : setFooterItems;

  // Top-level items for parent selection
  const topLevelItems = getTopLevelItems(currentItems);

  // ============ DRAG & DROP ============
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const topLevel = topLevelItems;
    const oldIndex = topLevel.findIndex((i) => i.id === active.id);
    const newIndex = topLevel.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(topLevel, oldIndex, newIndex).map((item, i) => ({
      ...item,
      order: i,
    }));

    // Optimistic update
    const merged = currentItems.map((item) => {
      const reorderedItem = reordered.find((r) => r.id === item.id);
      return reorderedItem ? { ...item, order: reorderedItem.order } : item;
    });
    setCurrentItems(merged);

    try {
      await Promise.all(
        reordered.map((s) => updateNavItem({ id: s.id, order: s.order }))
      );
      toast.success('Navigation order updated');
    } catch {
      toast.error('Failed to update order');
      fetchNavItems();
    }
  };

  // ============ TOGGLE ============
  const handleToggle = async (item: NavItem) => {
    const newActive = !item.isActive;
    setActionLoading(item.id);

    // Optimistic
    setCurrentItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: newActive } : i))
    );

    try {
      const res = await updateNavItem({ id: item.id, isActive: newActive });
      if (res.success) {
        toast.success(
          newActive
            ? `"${item.label}" enabled`
            : `"${item.label}" disabled`
        );
      } else {
        toast.error(res.error || 'Failed to update item');
        fetchNavItems();
      }
    } catch {
      toast.error('Network error');
      fetchNavItems();
    } finally {
      setActionLoading(null);
    }
  };

  // ============ CREATE ============
  const handleCreate = async () => {
    if (!formData.label.trim()) return;
    setDialogLoading(true);

    try {
      const payload: Parameters<typeof createNavItem>[0] = {
        label: formData.label.trim(),
        position: activeTab,
        order: topLevelItems.length,
        isActive: formData.isActive,
        isOpen: formData.isOpen,
      };
      if (formData.url.trim()) payload.url = formData.url.trim();
      if (formData.icon.trim()) payload.icon = formData.icon.trim();
      if (formData.parentId) payload.parentId = formData.parentId;
      if (formData.order) payload.order = formData.order;

      const res = await createNavItem(payload);
      if (res.success) {
        toast.success(`"${formData.label}" added to ${activeTab}`);
        setAddOpen(false);
        setFormData({ ...EMPTY_FORM, position: activeTab });
        fetchNavItems();
      } else {
        toast.error(res.error || 'Failed to create item');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ UPDATE ============
  const handleUpdate = async () => {
    if (!editingItem) return;
    setDialogLoading(true);

    try {
      const payload: Parameters<typeof updateNavItem>[0] = {
        id: editingItem.id,
        label: formData.label.trim(),
        isActive: formData.isActive,
        isOpen: formData.isOpen,
      };
      if (formData.url.trim() !== (editingItem.url || ''))
        payload.url = formData.url.trim();
      if (formData.icon.trim() !== (editingItem.icon || ''))
        payload.icon = formData.icon.trim();
      if (formData.parentId !== (editingItem.parentId || ''))
        payload.parentId = formData.parentId || null;

      const res = await updateNavItem(payload);
      if (res.success) {
        toast.success(`"${formData.label}" updated`);
        setEditOpen(false);
        setEditingItem(null);
        setFormData(EMPTY_FORM);
        fetchNavItems();
      } else {
        toast.error(res.error || 'Failed to update item');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ DELETE ============
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDialogLoading(true);

    try {
      const res = await deleteNavItem(deleteTarget.id);
      if (res.success) {
        toast.success(`"${deleteTarget.label}" deleted`);
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchNavItems();
      } else {
        toast.error(res.error || 'Failed to delete item');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDialogLoading(false);
    }
  };

  // ============ OPEN EDIT ============
  const openEditDialog = (item: NavItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label || '',
      url: item.url || '',
      icon: item.icon || '',
      parentId: item.parentId || '',
      position: item.position,
      order: item.order,
      isActive: item.isActive,
      isOpen: item.isOpen,
    });
    setEditOpen(true);
  };

  // ============ RENDER ============
  if (loading) return <NavigationSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={fetchNavItems}
          className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const flatItems = flattenItems(currentItems);
  const draggableIds = topLevelItems.map((i) => i.id);

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
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
            <p className="text-muted-foreground text-xs">
              Manage navbar and footer menu items
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNavItems}
            className="gap-1.5"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setFormData({ ...EMPTY_FORM, position: activeTab });
              setAddOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabPosition)}
      >
        <TabsList>
          <TabsTrigger value="navbar" className="gap-1.5">
            <Menu className="h-3.5 w-3.5" />
            Navbar
            <Badge
              variant="secondary"
              className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 ml-1"
            >
              {navbarItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-1.5">
            <Navigation className="h-3.5 w-3.5" />
            Footer
            <Badge
              variant="secondary"
              className="text-[10px] bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 ml-1"
            >
              {footerItems.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {flatItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Navigation className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No {activeTab} items yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click &ldquo;Add Item&rdquo; to create navigation links
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={draggableIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {flatItems.map((item) => {
                      const depth = item.parentId
                        ? (currentItems.find(
                            (p) => p.id === item.parentId
                          ) ? 1 : 0)
                        : 0;
                      const isDraggable = !item.parentId;
                      return isDraggable ? (
                        <SortableNavItemRow
                          key={item.id}
                          item={item}
                          depth={depth}
                          allItems={currentItems}
                          onToggle={handleToggle}
                          onEdit={openEditDialog}
                          onDelete={(i) => {
                            setDeleteTarget(i);
                            setDeleteOpen(true);
                          }}
                          toggleLoading={actionLoading === item.id}
                        />
                      ) : (
                        <SortableNavItemRow
                          key={item.id}
                          item={item}
                          depth={depth}
                          allItems={currentItems}
                          onToggle={handleToggle}
                          onEdit={openEditDialog}
                          onDelete={(i) => {
                            setDeleteTarget(i);
                            setDeleteOpen(true);
                          }}
                          toggleLoading={actionLoading === item.id}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ============ ADD ITEM DIALOG ============ */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) setAddOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Navigation Item</DialogTitle>
            <DialogDescription>
              Create a new link for the {activeTab}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="add-label">Label *</Label>
              <Input
                id="add-label"
                placeholder="Menu item label..."
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="add-url">URL</Label>
              <Input
                id="add-url"
                placeholder="/path or https://..."
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="add-icon">Icon Name</Label>
              <Input
                id="add-icon"
                placeholder="e.g. Car, Home, Settings"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
              />
            </div>

            {/* Parent */}
            <div className="space-y-2">
              <Label>Parent Item</Label>
              <Select
                value={formData.parentId || '__none__'}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: val === '__none__' ? '' : val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top level)</SelectItem>
                  {topLevelItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={formData.position}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, position: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navbar">Navbar</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="add-order">Order</Label>
              <Input
                id="add-order"
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>

            <Separator />

            {/* Toggles */}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="add-open">Is Dropdown</Label>
              <Switch
                id="add-open"
                checked={formData.isOpen}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isOpen: checked }))
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
              disabled={dialogLoading || !formData.label.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {dialogLoading ? 'Creating...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT ITEM DIALOG ============ */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditOpen(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Navigation Item</DialogTitle>
            <DialogDescription>
              Update link settings and content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label *</Label>
              <Input
                id="edit-label"
                placeholder="Menu item label..."
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                placeholder="/path or https://..."
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon Name</Label>
              <Input
                id="edit-icon"
                placeholder="e.g. Car, Home, Settings"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
              />
            </div>

            {/* Parent */}
            <div className="space-y-2">
              <Label>Parent Item</Label>
              <Select
                value={formData.parentId || '__none__'}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: val === '__none__' ? '' : val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top level)</SelectItem>
                  {topLevelItems
                    .filter((item) => item.id !== editingItem?.id)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>

            <Separator />

            {/* Toggles */}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-open">Is Dropdown</Label>
              <Switch
                id="edit-open"
                checked={formData.isOpen}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isOpen: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditingItem(null);
              }}
              disabled={dialogLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={dialogLoading || !formData.label.trim()}
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
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Delete Navigation Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-foreground">
                &ldquo;{deleteTarget?.label}&rdquo;
              </strong>
              ?{deleteTarget?.children && deleteTarget.children.length > 0 && (
                <span className="block mt-2 text-red-600 dark:text-red-400">
                  This item has {deleteTarget.children.length} sub-item
                  {deleteTarget.children.length !== 1 ? 's' : ''} that will also
                  be removed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={dialogLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dialogLoading ? 'Deleting...' : 'Delete Item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
