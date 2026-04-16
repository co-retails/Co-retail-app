import { useEffect, useMemo, useState } from 'react';
import svgPaths from "../imports/svg-7un8q74kd7";
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
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
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
import { MASTER_VALUES_DEMO } from '../data/masterValuesDemo';
import { toast } from 'sonner';

interface DropdownValuesScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

type ExtendedDropdownValue = DropdownValue & {
  brandId: string;
  parentCode?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export function DropdownValuesScreen({ onBack, onNavigate }: DropdownValuesScreenProps) {
  const brands: Brand[] = useMemo(
    () => [
      { id: 'weekday', name: 'Weekday', code: 'WD' },
      { id: 'monki', name: 'Monki', code: 'MK' },
      { id: 'hm', name: 'H&M', code: 'HM' },
      { id: 'cos', name: 'COS', code: 'COS' },
      { id: 'arket', name: 'Arket', code: 'ARK' }
    ],
    []
  );

  const baseAttributes = useMemo(
    () =>
      [
        { key: 'category', label: 'Category', type: 'list', inputType: 'dropdown', mandatory: true },
        { key: 'subcategory', label: 'Sub-category', type: 'list', inputType: 'dropdown', mandatory: true },
        { key: 'color', label: 'Color', type: 'list', inputType: 'dropdown', mandatory: true },
        { key: 'size', label: 'Size', type: 'list', inputType: 'dropdown', mandatory: true },
        { key: 'gender', label: 'Gender', type: 'list', inputType: 'dropdown', mandatory: true },
        { key: 'material', label: 'Material', type: 'multi-select', inputType: 'chips', mandatory: false },
        { key: 'condition', label: 'Condition', type: 'list', inputType: 'dropdown', mandatory: true }
      ] as const,
    []
  );

  const attributes: Attribute[] = useMemo(
    () =>
      brands.flatMap((brand) =>
        baseAttributes.map((attr) => ({
          id: `${attr.key}-${brand.id}`,
          key: attr.key,
          label: attr.label,
          type: attr.type,
          inputType: attr.inputType,
          mandatory: attr.mandatory,
          brandId: brand.id,
          status: 'active',
          usedByCategories: 0,
          lastEdited: '2026-01-01',
          lastEditedBy: 'Demo',
          createdAt: '2026-01-01'
        }))
      ),
    [brands, baseAttributes]
  );

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

  const getMasterCategoryKey = (brandId: string) => {
    if (brandId === 'hm') return 'H&M' as const;
    if (brandId === 'cos') return 'COS' as const;
    if (brandId === 'arket') return 'ARKET' as const;
    return 'WEEKDAY' as const;
  };

  const getMasterSizesKey = (brandId: string) => {
    if (brandId === 'hm') return 'H&M' as const;
    if (brandId === 'cos') return 'COS' as const;
    if (brandId === 'arket') return 'ARKET' as const;
    return 'WEEKDAY/MONKI' as const;
  };

  const getMasterGendersKey = (brandId: string) => {
    if (brandId === 'hm') return 'H&M' as const;
    if (brandId === 'cos') return 'COS' as const;
    if (brandId === 'arket') return 'ARKET' as const;
    return 'WEEKDAY/MONKI' as const;
  };

  const buildDemoValues = (): ExtendedDropdownValue[] => {
    const all: ExtendedDropdownValue[] = [];

    brands.forEach((brand) => {
      const categoryKey = getMasterCategoryKey(brand.id);
      const sizesKey = getMasterSizesKey(brand.id);
      const gendersKey = getMasterGendersKey(brand.id);

      const categoryAttrId = `category-${brand.id}`;
      const subcategoryAttrId = `subcategory-${brand.id}`;
      const colorAttrId = `color-${brand.id}`;
      const sizeAttrId = `size-${brand.id}`;
      const genderAttrId = `gender-${brand.id}`;
      const materialAttrId = `material-${brand.id}`;
      const conditionAttrId = `condition-${brand.id}`;

      // Category + subcategory
      Object.entries(MASTER_VALUES_DEMO.categoriesByBrand[categoryKey]).forEach(
        ([categoryLabel, subcategories], categoryIndex) => {
          const categoryCode = slugify(categoryLabel);

          all.push({
            id: `${brand.id}-category-${categoryCode}`,
            code: categoryCode,
            label: categoryLabel,
            sort: categoryIndex + 1,
            active: true,
            attributeId: categoryAttrId,
            brandId: brand.id
          });

          subcategories.forEach((subLabel, subIndex) => {
            all.push({
              id: `${brand.id}-subcategory-${categoryCode}-${slugify(subLabel)}`,
              code: slugify(subLabel),
              label: subLabel,
              sort: subIndex + 1,
              active: true,
              attributeId: subcategoryAttrId,
              brandId: brand.id,
              parentCode: categoryCode
            });
          });
        }
      );

      MASTER_VALUES_DEMO.colors.forEach((label, index) => {
        all.push({
          id: `${brand.id}-color-${slugify(label)}`,
          code: slugify(label),
          label,
          sort: index + 1,
          active: true,
          attributeId: colorAttrId,
          brandId: brand.id
        });
      });

      MASTER_VALUES_DEMO.sizesByBrand[sizesKey].forEach((label, index) => {
        all.push({
          id: `${brand.id}-size-${slugify(label)}`,
          code: slugify(label),
          label,
          sort: index + 1,
          active: true,
          attributeId: sizeAttrId,
          brandId: brand.id
        });
      });

      MASTER_VALUES_DEMO.gendersByBrand[gendersKey].forEach((label, index) => {
        all.push({
          id: `${brand.id}-gender-${slugify(label)}`,
          code: slugify(label),
          label,
          sort: index + 1,
          active: true,
          attributeId: genderAttrId,
          brandId: brand.id
        });
      });

      MASTER_VALUES_DEMO.materials.forEach((label, index) => {
        all.push({
          id: `${brand.id}-material-${slugify(label)}`,
          code: slugify(label),
          label,
          sort: index + 1,
          active: true,
          attributeId: materialAttrId,
          brandId: brand.id
        });
      });

      MASTER_VALUES_DEMO.conditions.forEach((label, index) => {
        all.push({
          id: `${brand.id}-condition-${slugify(label)}`,
          code: slugify(label),
          label,
          sort: index + 1,
          active: true,
          attributeId: conditionAttrId,
          brandId: brand.id
        });
      });
    });

    return all;
  };

  const [values, setValues] = useState<ExtendedDropdownValue[]>(() => buildDemoValues());

  // Form state
  const [formData, setFormData] = useState({
    label: '',
    parentCode: ''
  });

  const currentAttribute = attributes.find((a) => a.id === selectedAttribute);

  // Sync selectedAttribute when selectedBrand changes
  useEffect(() => {
    const brandSpecificAttributes = attributes.filter(
      (attr) =>
        attr.brandId === selectedBrand &&
        (attr.inputType === 'dropdown' || attr.inputType === 'chips')
    );

    if (brandSpecificAttributes.length === 0) return;

    setSelectedAttribute((current) => {
      const isValid = brandSpecificAttributes.some((attr) => attr.id === current);
      return isValid ? current : brandSpecificAttributes[0].id;
    });
  }, [selectedBrand, attributes]);

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
    .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));

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

  const handleAddValue = () => {
    if (!selectedAttribute) {
      toast.error('Select an attribute to add values');
      return;
    }

    if (currentAttribute?.key === 'subcategory' && !formData.parentCode) {
      toast.error('Select a category before adding sub-categories');
      return;
    }

    const normalizedCode = slugify(formData.label);

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
      code: normalizedCode,
      label: trimmedLabel,
      sort: Math.max(
        ...values
          .filter((v) => v.attributeId === selectedAttribute && v.brandId === selectedBrand)
          .map((v) => v.sort),
        0
      ) + 1,
      active: true,
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

    const normalizedCode = slugify(formData.label);
    const normalizedLabel = formData.label.trim().toLowerCase();

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

  const handleDeleteValue = (id: string) => {
    setValues(values.filter((val) => val.id !== id));
    toast.success('Value deleted');
  };

  const resetForm = () => {
    setFormData({
      label: '',
      parentCode:
        currentAttribute?.key === 'subcategory' ? categoryValues[0]?.code ?? '' : ''
    });
  };

  const openEditDialog = (value: ExtendedDropdownValue) => {
    setFormData({
      label: value.label,
      parentCode: value.parentCode || ''
    });
    setEditingValue(value);
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
            <h1 className="title-large text-on-surface">Attribute values</h1>
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="values-search"
                name="values-search"
                placeholder="Search values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
              />
            </div>

            {/* Table */}
            <Card className="border-outline-variant bg-surface-container overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-outline-variant bg-surface-container">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="body-medium text-on-surface-variant">Label</TableHead>
                      {showParentColumn && (
                        <TableHead className="body-medium text-on-surface-variant">
                          Category
                        </TableHead>
                      )}
                      <TableHead className="body-medium text-on-surface-variant w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValues.length === 0 ? (
                      <TableRow className="bg-surface">
                        <TableCell
                          colSpan={showParentColumn ? 4 : 3}
                          className="h-32 text-center body-medium text-on-surface-variant"
                        >
                          No values found. Add values to populate the dropdown options.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredValues.map((value) => (
                        <TableRow
                          key={value.id}
                          className="border-outline-variant bg-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                        >
                          <TableCell>
                            <GripVertical className="w-5 h-5 text-on-surface-variant" />
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
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Black, Extra Small"
                className="bg-surface-container border-outline"
              />
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
                    className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]"
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
                      <SelectItem value="no-categories" disabled>
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
              disabled={!formData.label}
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
