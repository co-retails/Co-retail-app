import React, { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  Trash2,
  Upload,
  Download,
  Search,
  GripVertical,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { DropdownValue, Attribute, Brand } from './PortalConfigTypes';
import { toast } from 'sonner@2.0.3';

interface DropdownValuesScreenProps {
  onBack: () => void;
}

type ExtendedDropdownValue = DropdownValue & {
  brandId: string;
  parentCode?: string;
};

export function DropdownValuesScreen({ onBack }: DropdownValuesScreenProps) {
  // Mock brands data
  const brands: Brand[] = [
    { id: 'weekday', name: 'Weekday', code: 'WD' },
    { id: 'monki', name: 'Monki', code: 'MK' }
  ];

  // Mock attributes (only dropdown/chips types)
  const attributes: Attribute[] = [
    {
      id: 'category',
      key: 'category',
      label: 'Category',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 12,
      lastEdited: '2025-01-05',
      lastEditedBy: 'Admin',
      createdAt: '2024-02-01'
    },
    {
      id: 'subcategory',
      key: 'subcategory',
      label: 'Sub-category',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 28,
      lastEdited: '2025-01-08',
      lastEditedBy: 'Admin',
      createdAt: '2024-02-08'
    },
    {
      id: 'color',
      key: 'color',
      label: 'Color',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 45,
      lastEdited: '2025-01-15',
      lastEditedBy: 'Admin',
      createdAt: '2024-06-01'
    },
    {
      id: 'size',
      key: 'size',
      label: 'Size',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 52,
      lastEdited: '2025-01-10',
      lastEditedBy: 'Admin',
      createdAt: '2024-06-01'
    },
    {
      id: 'material',
      key: 'material',
      label: 'Material',
      type: 'multi-select',
      inputType: 'chips',
      mandatory: false,
      brandId: 'weekday',
      status: 'active',
      usedByCategories: 38,
      lastEdited: '2024-12-20',
      lastEditedBy: 'Admin',
      createdAt: '2024-06-01'
    },
    {
      id: 'category-monki',
      key: 'category',
      label: 'Category',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'monki',
      status: 'active',
      usedByCategories: 18,
      lastEdited: '2025-01-12',
      lastEditedBy: 'Admin',
      createdAt: '2024-03-15'
    },
    {
      id: 'subcategory-monki',
      key: 'subcategory',
      label: 'Sub-category',
      type: 'list',
      inputType: 'dropdown',
      mandatory: true,
      brandId: 'monki',
      status: 'active',
      usedByCategories: 32,
      lastEdited: '2025-01-12',
      lastEditedBy: 'Admin',
      createdAt: '2024-03-20'
    },
    {
      id: 'pattern-monki',
      key: 'pattern',
      label: 'Pattern',
      type: 'multi-select',
      inputType: 'chips',
      mandatory: false,
      brandId: 'monki',
      status: 'active',
      usedByCategories: 15,
      lastEdited: '2024-12-12',
      lastEditedBy: 'Admin',
      createdAt: '2024-05-10'
    }
  ];

  const [selectedBrand, setSelectedBrand] = useState<string>(() => brands[0].id);
  const [selectedAttribute, setSelectedAttribute] = useState<string>(() => {
    const firstAttribute = attributes.find(
      (attr) =>
        attr.brandId === brands[0].id &&
        (attr.inputType === 'dropdown' || attr.inputType === 'chips')
    );
    return firstAttribute?.id ?? '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<ExtendedDropdownValue | null>(null);

  // Mock values data
  const [values, setValues] = useState<ExtendedDropdownValue[]>([
    { id: '1', code: 'black', label: 'Black', sort: 1, active: true, attributeId: 'color', brandId: 'weekday' },
    { id: '2', code: 'white', label: 'White', sort: 2, active: true, attributeId: 'color', brandId: 'weekday' },
    { id: '3', code: 'red', label: 'Red', sort: 3, active: true, attributeId: 'color', brandId: 'weekday' },
    { id: '4', code: 'blue', label: 'Blue', sort: 4, active: true, attributeId: 'color', brandId: 'weekday' },
    { id: '5', code: 'green', label: 'Green', sort: 5, active: false, attributeId: 'color', brandId: 'weekday' },
    { id: 'cat-1', code: 'tops', label: 'Tops', sort: 1, active: true, attributeId: 'category', brandId: 'weekday' },
    { id: 'cat-2', code: 'bottoms', label: 'Bottoms', sort: 2, active: true, attributeId: 'category', brandId: 'weekday' },
    { id: 'cat-3', code: 'outerwear', label: 'Outerwear', sort: 3, active: true, attributeId: 'category', brandId: 'weekday' },
    { id: 'sub-1', code: 'tshirts', label: 'T-shirts', sort: 1, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'tops' },
    { id: 'sub-2', code: 'shirts', label: 'Shirts & blouses', sort: 2, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'tops' },
    { id: 'sub-3', code: 'jeans', label: 'Jeans', sort: 1, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'bottoms' },
    { id: 'sub-4', code: 'tailored', label: 'Tailored trousers', sort: 2, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'bottoms' },
    { id: 'sub-5', code: 'puffer', label: 'Puffer jackets', sort: 1, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'outerwear' },
    { id: 'sub-6', code: 'coats', label: 'Wool coats', sort: 2, active: true, attributeId: 'subcategory', brandId: 'weekday', parentCode: 'outerwear' },
    { id: 'mk-cat-1', code: 'dresses', label: 'Dresses', sort: 1, active: true, attributeId: 'category-monki', brandId: 'monki' },
    { id: 'mk-cat-2', code: 'knitwear', label: 'Knitwear', sort: 2, active: true, attributeId: 'category-monki', brandId: 'monki' },
    { id: 'mk-sub-1', code: 'party-dresses', label: 'Party dresses', sort: 1, active: true, attributeId: 'subcategory-monki', brandId: 'monki', parentCode: 'dresses' },
    { id: 'mk-sub-2', code: 'casual-dresses', label: 'Casual dresses', sort: 2, active: true, attributeId: 'subcategory-monki', brandId: 'monki', parentCode: 'dresses' },
    { id: 'mk-sub-3', code: 'chunky-knit', label: 'Chunky knit', sort: 1, active: true, attributeId: 'subcategory-monki', brandId: 'monki', parentCode: 'knitwear' },
    { id: 'mk-sub-4', code: 'fine-knit', label: 'Fine knit', sort: 2, active: true, attributeId: 'subcategory-monki', brandId: 'monki', parentCode: 'knitwear' },
    { id: 'pattern-1', code: 'floral', label: 'Floral', sort: 1, active: true, attributeId: 'pattern-monki', brandId: 'monki' },
    { id: 'pattern-2', code: 'polka', label: 'Polka dots', sort: 2, active: true, attributeId: 'pattern-monki', brandId: 'monki' }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    sort: 1,
    active: true,
    parentCode: ''
  });
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);

  const currentAttribute = attributes.find((a) => a.id === selectedAttribute);

  useEffect(() => {
    const brandSpecificAttributes = attributes.filter(
      (attr) =>
        attr.brandId === selectedBrand &&
        (attr.inputType === 'dropdown' || attr.inputType === 'chips')
    );

    if (!brandSpecificAttributes.find((attr) => attr.id === selectedAttribute)) {
      setSelectedAttribute(brandSpecificAttributes[0]?.id ?? '');
    }
  }, [attributes, selectedBrand, selectedAttribute]);

  const brandAttributes = useMemo(
    () =>
      attributes.filter(
        (attr) =>
          attr.brandId === selectedBrand &&
          (attr.inputType === 'dropdown' || attr.inputType === 'chips')
      ),
    [attributes, selectedBrand]
  );

  const categoryAttributeId = useMemo(
    () =>
      attributes.find(
        (attr) => attr.brandId === selectedBrand && attr.key === 'category'
      )?.id,
    [attributes, selectedBrand]
  );

  const categoryValues = useMemo(
    () =>
      values.filter(
        (val) => val.brandId === selectedBrand && val.attributeId === categoryAttributeId
      ),
    [values, selectedBrand, categoryAttributeId]
  );

  const showParentColumn = currentAttribute?.key === 'subcategory';

  const filteredValues = values
    .filter(
      (val) =>
        val.attributeId === selectedAttribute &&
        val.brandId === selectedBrand &&
        (val.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          val.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.sort - b.sort);

  useEffect(() => {
    if (currentAttribute?.key === 'subcategory') {
      setFormData((prev) => ({
        ...prev,
        parentCode:
          prev.parentCode && categoryValues.some((cat) => cat.code === prev.parentCode)
            ? prev.parentCode
            : categoryValues[0]?.code ?? ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, parentCode: '' }));
    }
  }, [currentAttribute, categoryValues]);


  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

  const handleAddValue = () => {
    if (!selectedAttribute) {
      toast.error('Select an attribute to add values');
      return;
    }

    if (currentAttribute?.key === 'subcategory' && !formData.parentCode) {
      toast.error('Select a category before adding sub-categories');
      return;
    }

    const normalizedCode = formData.code.trim();
    if (!normalizedCode) {
      toast.error('Code cannot be empty');
      return;
    }

    const normalizedLabel = formData.label.trim().toLowerCase();

    const exists = values.some(
      (val) =>
        val.attributeId === selectedAttribute &&
        val.brandId === selectedBrand &&
        (val.code.toLowerCase() === normalizedCode.toLowerCase() ||
          val.label.trim().toLowerCase() === normalizedLabel)
    );
    if (exists) {
      toast.error('This value already exists for the selected attribute');
      return;
    }

    const trimmedLabel = formData.label.trim();

    const newValue: DropdownValue = {
      id: Date.now().toString(),
      ...formData,
      code: normalizedCode,
      label: trimmedLabel,
      attributeId: selectedAttribute
    };

    const extendedValue: ExtendedDropdownValue = {
      ...newValue,
      brandId: selectedBrand,
      parentCode:
        currentAttribute?.key === 'subcategory' ? formData.parentCode : undefined
    };

    setValues([...values, extendedValue]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Value added successfully');
  };

  const handleEditValue = () => {
    if (!editingValue) return;

    if (currentAttribute?.key === 'subcategory' && !formData.parentCode) {
      toast.error('Select a category before saving sub-categories');
      return;
    }

    const normalizedCode = formData.code.trim();
    const normalizedLabel = formData.label.trim().toLowerCase();

    if (!normalizedCode) {
      toast.error('Code cannot be empty');
      return;
    }

    const conflict = values.some(
      (val) =>
        val.id !== editingValue.id &&
        val.attributeId === selectedAttribute &&
        val.brandId === selectedBrand &&
        (val.code.toLowerCase() === normalizedCode.toLowerCase() ||
          val.label.trim().toLowerCase() === normalizedLabel)
    );

    if (conflict) {
      toast.error('Another value already uses this code or label');
      return;
    }

    setValues(
      values.map((val) =>
        val.id === editingValue.id
          ? {
              ...val,
              code: normalizedCode,
              label: formData.label.trim(),
              sort: formData.sort,
              active: formData.active,
              parentCode:
                currentAttribute?.key === 'subcategory' ? formData.parentCode : val.parentCode
            }
          : val
      )
    );
    setEditingValue(null);
    resetForm();
    toast.success('Value updated successfully');
  };

  const handleToggleActive = (id: string) => {
    setValues(
      values.map((val) => (val.id === id ? { ...val, active: !val.active } : val))
    );
    toast.success('Status updated');
  };

  const handleDeleteValue = (id: string) => {
    setValues(values.filter((val) => val.id !== id));
    toast.success('Value deleted');
  };

  const resetForm = () => {
    const relevantValues = values.filter(
      (v) => v.attributeId === selectedAttribute && v.brandId === selectedBrand
    );
    const maxSort = Math.max(...relevantValues.map((v) => v.sort), 0);
    setFormData({
      code: '',
      label: '',
      sort: maxSort + 1,
      active: true,
      parentCode:
        currentAttribute?.key === 'subcategory' ? categoryValues[0]?.code ?? '' : ''
    });
    setIsCodeManuallyEdited(false);
  };

  const openEditDialog = (value: ExtendedDropdownValue) => {
    setFormData({
      code: value.code,
      label: value.label,
      sort: value.sort,
      active: value.active,
      parentCode: value.parentCode || ''
    });
    setEditingValue(value);
    setIsCodeManuallyEdited(true);
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
            <h1 className="title-large text-on-surface">Dropdown values</h1>
            <p className="body-small text-on-surface-variant">
              Manage attribute value options
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-outline hover:bg-surface-container-high"
              onClick={() => toast.info('CSV export will be available in a future update')}
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="border-outline hover:bg-surface-container-high"
              onClick={() => toast.info('Use copy/paste or CSV import (coming soon) to manage values')}
            >
              <Upload className="w-5 h-5 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-on-primary">
              <Plus className="w-5 h-5 mr-2" />
              Add value
            </Button>
          </div>
        </div>

        {/* Context Bar */}
        <div className="border-t border-outline-variant bg-surface-container px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Brand:</span>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] bg-surface border-outline">
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
                {filteredValues.length} values
              </span>
            </Badge>

            {currentAttribute && (
              <Badge variant="secondary" className="bg-secondary-container text-on-secondary-container">
                <span className="label-medium">
                  Attribute: {currentAttribute.label}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Attribute List */}
          <Card className="border-outline-variant bg-surface-container p-4">
            <h3 className="title-medium text-on-surface mb-3">Attributes</h3>
            <div className="space-y-2">
              {brandAttributes.map((attr) => (
                <button
                  key={attr.id}
                  onClick={() => setSelectedAttribute(attr.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedAttribute === attr.id
                      ? 'bg-primary-container text-on-primary-container'
                      : 'hover:bg-surface-container-high'
                  }`}
                >
                  <p className="body-medium">{attr.label}</p>
                  <p className="body-small text-on-surface-variant">
                    {
                      values.filter(
                        (v) => v.attributeId === attr.id && v.brandId === selectedBrand
                      ).length
                    }{' '}
                    values
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Right: Values Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-container border-outline"
              />
            </div>

            {/* Table */}
            <Card className="border-outline-variant bg-surface-container overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-outline-variant hover:bg-surface-container-high">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="body-medium text-on-surface-variant">Code</TableHead>
                      <TableHead className="body-medium text-on-surface-variant">Label</TableHead>
                      {showParentColumn && (
                        <TableHead className="body-medium text-on-surface-variant">
                          Category
                        </TableHead>
                      )}
                      <TableHead className="body-medium text-on-surface-variant">Sort</TableHead>
                      <TableHead className="body-medium text-on-surface-variant">Active</TableHead>
                      <TableHead className="body-medium text-on-surface-variant w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValues.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={showParentColumn ? 7 : 6}
                          className="h-32 text-center body-medium text-on-surface-variant"
                        >
                          No values found. Add values to populate the dropdown options.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredValues.map((value) => (
                        <TableRow
                          key={value.id}
                          className="border-outline-variant hover:bg-surface-container-high"
                        >
                          <TableCell>
                            <GripVertical className="w-5 h-5 text-on-surface-variant" />
                          </TableCell>
                          <TableCell>
                            <code className="label-medium text-on-surface bg-surface-container-high px-2 py-1 rounded">
                              {value.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="body-medium text-on-surface">{value.label}</span>
                          </TableCell>
                          {showParentColumn && (
                            <TableCell>
                              <span className="body-medium text-on-surface-variant">
                                {value.parentCode
                                  ? categoryValues.find((cat) => cat.code === value.parentCode)?.label ||
                                    '—'
                                  : '—'}
                              </span>
                            </TableCell>
                          )}
                          <TableCell>
                            <span className="body-medium text-on-surface-variant">{value.sort}</span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={value.active}
                              onCheckedChange={() => handleToggleActive(value.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-surface-container-high"
                                >
                                  <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-surface-container border-outline"
                              >
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(value)}
                                  className="hover:bg-surface-container-high cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 mr-2 text-on-surface-variant" />
                                  <span className="body-medium text-on-surface">Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteValue(value.id)}
                                  className="hover:bg-surface-container-high cursor-pointer text-error"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  <span className="body-medium">Delete</span>
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

            {/* Helper text */}
            <Card className="p-4 border-outline bg-surface-container">
              <p className="body-small text-on-surface-variant">
                💡 Tip: You can bulk import values via CSV. Download the template first, fill in your
                values, and upload. Drag rows to reorder sort priority.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || editingValue !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingValue(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-surface border-outline">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              {editingValue ? 'Edit value' : 'Add new value'}
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              {editingValue
                ? `Update value for ${currentAttribute?.label}`
                : `Add a new value to ${currentAttribute?.label}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                    if (!isCodeManuallyEdited) {
                      next.code = newLabel ? slugify(newLabel) : '';
                    }
                    return next;
                  });
                }}
                placeholder="e.g., Black, Extra Small"
                className="bg-surface-container border-outline"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="code" className="label-medium text-on-surface">
                  Generated code
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-primary"
                  onClick={() => {
                    setIsCodeManuallyEdited((prev) => {
                      const next = !prev;
                      if (!next) {
                        setFormData((prevForm) => ({
                          ...prevForm,
                          code: prevForm.label ? slugify(prevForm.label) : ''
                        }));
                      }
                      return next;
                    });
                  }}
                >
                  {isCodeManuallyEdited ? 'Use auto-code' : 'Override'}
                </Button>
              </div>
              <Input
                id="code"
                value={formData.code}
                readOnly={!isCodeManuallyEdited}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  if (!isCodeManuallyEdited) {
                    setIsCodeManuallyEdited(true);
                  }
                }}
                placeholder="Auto-generated from label"
                className={`bg-surface-container border-outline ${
                  !isCodeManuallyEdited ? 'text-on-surface-variant' : ''
                }`}
              />
              <p className="body-small text-on-surface-variant">
                {isCodeManuallyEdited
                  ? 'Code is manually overridden. Choose “Use auto-code” to reset.'
                  : 'Code auto-generates from the label and is used for integrations.'}
              </p>
            </div>

            {currentAttribute?.key === 'subcategory' && (
              <div className="space-y-2">
                <Label htmlFor="parent-category" className="label-medium text-on-surface">
                  Belongs to category *
                </Label>
                <Select
                  value={formData.parentCode}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, parentCode: value }))
                  }
                  disabled={!categoryValues.length}
                >
                  <SelectTrigger
                    id="parent-category"
                    className="bg-surface-container border-outline"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryValues.length ? (
                      categoryValues.map((category) => (
                        <SelectItem key={category.code} value={category.code}>
                          {category.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!categoryValues.length && (
                  <p className="body-small text-error">
                    Define categories for this brand before adding sub-categories.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sort" className="label-medium text-on-surface">
                Sort order
              </Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 1 })}
                className="bg-surface-container border-outline"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active" className="body-medium text-on-surface cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingValue(null);
                resetForm();
              }}
              className="border-outline hover:bg-surface-container-high"
            >
              Cancel
            </Button>
            <Button
              onClick={editingValue ? handleEditValue : handleAddValue}
              disabled={!formData.code || !formData.label}
              className="bg-primary text-on-primary"
            >
              {editingValue ? 'Save changes' : 'Add value'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
