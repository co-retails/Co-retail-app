import { useState } from 'react';
import svgPaths from "../imports/svg-7un8q74kd7";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Switch } from './ui/switch';
import {
  ArrowLeft,
  Plus,
  Edit,
  Power,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Attribute, AttributeType, InputType, Brand } from './PortalConfigTypes';
import { toast } from 'sonner';

interface AttributeDictionaryScreenProps {
  onBack: () => void;
}

export function AttributeDictionaryScreen({ onBack }: AttributeDictionaryScreenProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('weekday');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);

  // Mock brands data
  const brands: Brand[] = [
    { id: 'weekday', name: 'Weekday', code: 'WD' },
    { id: 'monki', name: 'Monki', code: 'MK' },
    { id: 'cheap-monday', name: 'Cheap Monday', code: 'CM' }
  ];

  // Mock attributes data
  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      id: '1',
      key: 'color',
      label: 'Color',
      description: 'Primary color of the item',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      helpText: 'Select the dominant color',
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 45,
      lastEdited: '2025-01-15',
      lastEditedBy: 'Admin User',
      createdAt: '2024-06-01'
    },
    {
      id: '2',
      key: 'size',
      label: 'Size',
      description: 'Garment size',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      helpText: 'Standard sizing (XS-XXL)',
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 52,
      lastEdited: '2025-01-10',
      lastEditedBy: 'Admin User',
      createdAt: '2024-06-01'
    },
    {
      id: '3',
      key: 'material',
      label: 'Material',
      description: 'Primary fabric material',
      type: 'multi-select',
      inputType: 'chips',
      mandatory: false,
      helpText: 'Select all applicable materials',
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 38,
      lastEdited: '2024-12-20',
      lastEditedBy: 'Admin User',
      createdAt: '2024-06-01'
    },
    {
      id: '4',
      key: 'condition_notes',
      label: 'Condition Notes',
      description: 'Additional condition information',
      type: 'text',
      inputType: 'free-text',
      mandatory: false,
      helpText: 'Optional notes about item condition',
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 12,
      lastEdited: '2024-11-05',
      lastEditedBy: 'Admin User',
      createdAt: '2024-08-15'
    }
  ]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    type: 'list' as AttributeType,
    inputType: 'dropdown' as InputType,
    mandatory: false,
    helpText: ''
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

  const filteredAttributes = attributes.filter(
    (attr) =>
      attr.brandId === selectedBrand &&
      (attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.key.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddAttribute = () => {
    const label = formData.label.trim();
    const keyValue = (isKeyManuallyEdited ? formData.key : slugify(formData.label)).trim();

    if (!label) {
      toast.error('Label is required');
      return;
    }

    if (!keyValue) {
      toast.error('Key cannot be empty');
      return;
    }

    if (
      attributes.some(
        (attr) =>
          attr.brandId === selectedBrand &&
          (attr.label.toLowerCase() === label.toLowerCase() ||
            attr.key.toLowerCase() === keyValue.toLowerCase())
      )
    ) {
      toast.error('An attribute with the same label or key already exists for this brand');
      return;
    }

    const newAttribute: Attribute = {
      id: Date.now().toString(),
      ...formData,
      brandId: selectedBrand,
      status: 'active',
      usedByCategories: 0,
      lastEdited: new Date().toISOString().split('T')[0],
      lastEditedBy: 'Admin User',
      createdAt: new Date().toISOString().split('T')[0]
    };
    newAttribute.label = label;
    newAttribute.key = keyValue;

    setAttributes([...attributes, newAttribute]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Attribute created successfully');
  };

  const handleEditAttribute = () => {
    if (!editingAttribute) return;

    const label = formData.label.trim();
    const keyValue = (isKeyManuallyEdited ? formData.key : slugify(formData.label)).trim();

    if (!label) {
      toast.error('Label is required');
      return;
    }

    if (!keyValue) {
      toast.error('Key cannot be empty');
      return;
    }

    if (
      attributes.some(
        (attr) =>
          attr.id !== editingAttribute.id &&
          attr.brandId === selectedBrand &&
          (attr.label.toLowerCase() === label.toLowerCase() ||
            attr.key.toLowerCase() === keyValue.toLowerCase())
      )
    ) {
      toast.error('Another attribute with this label or key already exists for this brand');
      return;
    }

    setAttributes(
      attributes.map((attr) =>
        attr.id === editingAttribute.id
          ? {
              ...attr,
              ...formData,
              label,
              key: keyValue,
              lastEdited: new Date().toISOString().split('T')[0]
            }
          : attr
      )
    );
    setEditingAttribute(null);
    resetForm();
    toast.success('Attribute updated successfully');
  };

  const handleToggleStatus = (id: string) => {
    setAttributes(
      attributes.map((attr) =>
        attr.id === id
          ? {
              ...attr,
              status: attr.status === 'active' ? 'inactive' : 'active',
              lastEdited: new Date().toISOString().split('T')[0]
            }
          : attr
      )
    );
    toast.success('Status updated');
  };

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      description: '',
      type: 'list',
      inputType: 'dropdown',
      mandatory: false,
      helpText: ''
    });
    setIsKeyManuallyEdited(false);
  };

  const openEditDialog = (attribute: Attribute) => {
    setFormData({
      key: attribute.key,
      label: attribute.label,
      description: attribute.description || '',
      type: attribute.type,
      inputType: attribute.inputType,
      mandatory: attribute.mandatory,
      helpText: attribute.helpText || ''
    });
    setEditingAttribute(attribute);
    setIsKeyManuallyEdited(attribute.key !== slugify(attribute.label));
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>

          <div className="flex-1">
            <h1 className="title-large text-on-surface">Attribute dictionary</h1>
            <p className="body-small text-on-surface-variant">Brand master attributes</p>
          </div>

          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-on-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add attribute
          </Button>
        </div>

        {/* Context Bar */}
        <div className="border-t border-outline-variant bg-surface-container px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Brand:</span>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="border-outline bg-surface">
              <span className="label-medium text-on-surface-variant">
                {filteredAttributes.length} attributes
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl px-4 md:px-6 py-6">
        {/* Search and Filters */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1 md:flex-none md:w-[400px]">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="attributes-search"
              name="attributes-search"
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="border-outline-variant bg-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant bg-surface-container">
                  <TableHead className="body-medium text-on-surface-variant">Attribute</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Key</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Type</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Input</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Mandatory</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Used by</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Status</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Last edited</TableHead>
                  <TableHead className="body-medium text-on-surface-variant w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.length === 0 ? (
                  <TableRow className="bg-surface">
                    <TableCell
                      colSpan={9}
                      className="h-32 text-center body-medium text-on-surface-variant"
                    >
                      No attributes found. Create your first attribute to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attribute) => (
                    <TableRow
                      key={attribute.id}
                      className="border-outline-variant bg-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="body-medium text-on-surface">{attribute.label}</p>
                          {attribute.description && (
                            <p className="body-small text-on-surface-variant">{attribute.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="label-medium text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                          {attribute.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="label-medium text-on-surface capitalize">{attribute.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="label-medium text-on-surface capitalize">
                          {attribute.inputType.replace('-', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={attribute.mandatory ? 'default' : 'outline'}
                          className={
                            attribute.mandatory
                              ? 'bg-accent text-on-accent'
                              : 'border-outline bg-surface text-on-surface-variant'
                          }
                        >
                          <span className="label-small">{attribute.mandatory ? 'Yes' : 'No'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="body-medium text-on-surface">{attribute.usedByCategories}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={attribute.status === 'active' ? 'default' : 'outline'}
                          className={
                            attribute.status === 'active'
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'border-outline bg-surface text-on-surface-variant'
                          }
                        >
                          <span className="label-small capitalize">{attribute.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="body-small text-on-surface-variant">{attribute.lastEdited}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-surface-container-high">
                              <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-surface-container border-outline">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(attribute)}
                              className="hover:bg-surface-container-high cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2 text-on-surface-variant" />
                              <span className="body-medium text-on-surface">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(attribute.id)}
                              className="hover:bg-surface-container-high cursor-pointer"
                            >
                              <Power className="w-4 h-4 mr-2 text-on-surface-variant" />
                              <span className="body-medium text-on-surface">
                                {attribute.status === 'active' ? 'Deactivate' : 'Activate'}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || editingAttribute !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingAttribute(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-surface border-outline max-w-2xl">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              {editingAttribute ? 'Edit attribute' : 'Add new attribute'}
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              {editingAttribute
                ? 'Update the attribute properties below'
                : 'Create a new attribute for the selected brand'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="label-medium text-on-surface">
                  Label *
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setFormData((prev) => {
                      const next = { ...prev, label: newLabel };
                      if (!isKeyManuallyEdited) {
                        next.key = newLabel ? slugify(newLabel) : '';
                      }
                      return next;
                    });
                  }}
                  placeholder="e.g., Color, Size"
                  className="bg-surface-container border-outline"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="key" className="label-medium text-on-surface">
                    Generated key
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-primary"
                    onClick={() => {
                      setIsKeyManuallyEdited((prev) => {
                        const next = !prev;
                        if (!next) {
                          setFormData((prevData) => ({
                            ...prevData,
                            key: prevData.label ? slugify(prevData.label) : ''
                          }));
                        }
                        return next;
                      });
                    }}
                  >
                    {isKeyManuallyEdited ? 'Use auto-key' : 'Override'}
                  </Button>
                </div>
                <Input
                  id="key"
                  value={formData.key}
                  readOnly={!isKeyManuallyEdited}
                  onChange={(e) => {
                    setFormData({ ...formData, key: e.target.value });
                    if (!isKeyManuallyEdited) {
                      setIsKeyManuallyEdited(true);
                    }
                  }}
                  placeholder="Auto-generated from label"
                  className={`bg-surface-container border-outline ${
                    !isKeyManuallyEdited ? 'text-on-surface-variant' : ''
                  }`}
                />
                <p className="body-small text-on-surface-variant">
                  {isKeyManuallyEdited
                    ? 'Key is manually overridden. Choose “Use auto-key” to reset.'
                    : 'Key auto-generates from the label and is used in APIs.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="label-medium text-on-surface">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the attribute"
                className="bg-surface-container border-outline"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="label-medium text-on-surface">
                  Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as AttributeType })}
                >
                  <SelectTrigger id="type" className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="list">List (single)</SelectItem>
                    <SelectItem value="multi-select">Multi-select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inputType" className="label-medium text-on-surface">
                  Input type *
                </Label>
                <Select
                  value={formData.inputType}
                  onValueChange={(value) => setFormData({ ...formData, inputType: value as InputType })}
                >
                  <SelectTrigger id="inputType" className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free-text">Free text</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="chips">Chips</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText" className="label-medium text-on-surface">
                Help text
              </Label>
              <Input
                id="helpText"
                value={formData.helpText}
                onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                placeholder="Optional guidance for users"
                className="bg-surface-container border-outline"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="mandatory"
                checked={formData.mandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, mandatory: checked })}
              />
              <Label htmlFor="mandatory" className="body-medium text-on-surface cursor-pointer">
                Mandatory at brand level
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingAttribute(null);
                resetForm();
              }}
              className="border-outline hover:bg-surface-container-high"
            >
              Cancel
            </Button>
            <Button
              onClick={editingAttribute ? handleEditAttribute : handleAddAttribute}
              disabled={!formData.key || !formData.label}
              className="bg-primary text-on-primary"
            >
              {editingAttribute ? 'Save changes' : 'Create attribute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
