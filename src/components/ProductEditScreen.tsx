import React, { useState } from 'react';
import { ArrowLeft, Save, ImagePlus, X, Plus, Minus } from 'lucide-react';
import { ShowroomProduct, ProductType, ProductStatus, PriceTier } from './ShowroomTypes';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ProductEditScreenProps {
  product: ShowroomProduct;
  onBack: () => void;
  onSave: (product: ShowroomProduct) => void;
}

export default function ProductEditScreen({
  product: initialProduct,
  onBack,
  onSave
}: ProductEditScreenProps) {
  const [product, setProduct] = useState<ShowroomProduct>(initialProduct);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const updateField = <K extends keyof ShowroomProduct>(field: K, value: ShowroomProduct[K]) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const addPriceTier = () => {
    setProduct(prev => ({
      ...prev,
      priceTiers: [
        ...prev.priceTiers,
        { minQuantity: 1, price: prev.wholesalePrice }
      ]
    }));
  };

  const updatePriceTier = (index: number, field: keyof PriceTier, value: number) => {
    setProduct(prev => {
      const newTiers = [...prev.priceTiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      return { ...prev, priceTiers: newTiers };
    });
  };

  const removePriceTier = (index: number) => {
    setProduct(prev => ({
      ...prev,
      priceTiers: prev.priceTiers.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (imageUrlInput.trim()) {
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImageToFront = (index: number) => {
    setProduct(prev => {
      const newImages = [...prev.images];
      const [image] = newImages.splice(index, 1);
      newImages.unshift(image);
      return { ...prev, images: newImages };
    });
  };

  const handleSave = () => {
    onSave({
      ...product,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Edit product</h1>
            <p className="body-small text-on-surface-variant">{product.sku}</p>
          </div>

          <Badge variant={product.status === 'active' ? 'default' : 'outline'}>
            {product.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Information */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-4">Basic information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku" className="label-large text-on-surface mb-2">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={product.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="status" className="label-large text-on-surface mb-2">
                  Status
                </Label>
                <Select value={product.status} onValueChange={(value) => updateField('status', value as ProductStatus)}>
                  <SelectTrigger className="bg-surface border-outline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="label-large text-on-surface mb-2">
                Product title
              </Label>
              <Input
                id="title"
                value={product.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="bg-surface border-outline"
              />
            </div>

            <div>
              <Label htmlFor="description" className="label-large text-on-surface mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="bg-surface border-outline"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand" className="label-large text-on-surface mb-2">
                  Brand
                </Label>
                <Input
                  id="brand"
                  value={product.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="category" className="label-large text-on-surface mb-2">
                  Category
                </Label>
                <Input
                  id="category"
                  value={product.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Product Details */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-4">Product details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="color" className="label-large text-on-surface mb-2">
                  Color
                </Label>
                <Input
                  id="color"
                  value={product.color || ''}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="size" className="label-large text-on-surface mb-2">
                  Size
                </Label>
                <Input
                  id="size"
                  value={product.size || ''}
                  onChange={(e) => updateField('size', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="fabric" className="label-large text-on-surface mb-2">
                  Fabric
                </Label>
                <Input
                  id="fabric"
                  value={product.fabric || ''}
                  onChange={(e) => updateField('fabric', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="season" className="label-large text-on-surface mb-2">
                  Season
                </Label>
                <Input
                  id="season"
                  value={product.season || ''}
                  onChange={(e) => updateField('season', e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              {product.condition && (
                <div>
                  <Label htmlFor="condition" className="label-large text-on-surface mb-2">
                    Condition
                  </Label>
                  <Input
                    id="condition"
                    value={product.condition}
                    onChange={(e) => updateField('condition', e.target.value)}
                    className="bg-surface border-outline"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-medium text-on-surface">Product images</h2>
            <span className="body-small text-on-surface-variant">
              {product.images.length} {product.images.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Add Image First - More Prominent */}
            <div className="p-5 bg-primary-container/30 rounded-xl border-2 border-dashed border-primary">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <ImagePlus className="w-6 h-6 text-on-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="title-medium text-on-surface mb-1">📸 Add product images</h3>
                    <p className="body-medium text-on-surface-variant mb-2">
                      Enter image URLs to showcase your product. The first image will be the primary image shown in listings.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md border border-outline-variant">
                        <span className="body-small text-on-surface">✓ Multiple images supported</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md border border-outline-variant">
                        <span className="body-small text-on-surface">✓ Drag to reorder</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md border border-outline-variant">
                        <span className="body-small text-on-surface">✓ Set primary image</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="bg-surface border-outline flex-1"
                    />
                    <Button
                      onClick={addImage}
                      disabled={!imageUrlInput.trim()}
                      className="bg-primary text-on-primary whitespace-nowrap"
                    >
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Add image
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Images Grid */}
            {product.images.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="label-large text-on-surface">Current images</h3>
                  <span className="body-small text-on-surface-variant">Hover to reorder or remove</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-surface-container-high border-2 border-outline-variant hover:border-primary transition-colors"
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Error';
                        }}
                      />
                      
                      {/* Image Number Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`${index === 0 ? 'bg-primary text-on-primary' : 'bg-surface/90 text-on-surface border border-outline'}`}>
                          {index === 0 ? 'Primary' : `#${index + 1}`}
                        </Badge>
                      </div>
                      
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-full flex flex-col items-center justify-center gap-2 p-2">
                          {index !== 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => moveImageToFront(index)}
                              className="bg-surface text-on-surface w-full text-xs"
                            >
                              Make primary
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="w-full text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Helper text */}
                <div className="mt-3 p-3 bg-surface-container-high rounded-lg">
                  <p className="body-small text-on-surface-variant">
                    <strong>Tip:</strong> Click "Make primary" on any image to set it as the main product image. Images are displayed in order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-surface-container-high rounded-lg border border-outline-variant">
                <ImagePlus className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-50" />
                <p className="body-medium text-on-surface-variant">
                  No images added yet. Add your first image above.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-4">Pricing</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="msrp" className="label-large text-on-surface mb-2">
                  MSRP
                </Label>
                <Input
                  id="msrp"
                  type="number"
                  value={product.msrp}
                  onChange={(e) => updateField('msrp', parseFloat(e.target.value))}
                  className="bg-surface border-outline"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="wholesalePrice" className="label-large text-on-surface mb-2">
                  Wholesale price
                </Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  value={product.wholesalePrice}
                  onChange={(e) => updateField('wholesalePrice', parseFloat(e.target.value))}
                  className="bg-surface border-outline"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="label-large text-on-surface">Price tiers</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPriceTier}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add tier
                </Button>
              </div>

              <div className="space-y-2">
                {product.priceTiers.map((tier, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min qty"
                      value={tier.minQuantity}
                      onChange={(e) => updatePriceTier(index, 'minQuantity', parseInt(e.target.value))}
                      className="bg-surface border-outline flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max qty"
                      value={tier.maxQuantity || ''}
                      onChange={(e) => updatePriceTier(index, 'maxQuantity', parseInt(e.target.value) || undefined as any)}
                      className="bg-surface border-outline flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={tier.price}
                      onChange={(e) => updatePriceTier(index, 'price', parseFloat(e.target.value))}
                      className="bg-surface border-outline flex-1"
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePriceTier(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Inventory & Fulfillment */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-4">Inventory & fulfillment</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="moq" className="label-large text-on-surface mb-2">
                  MOQ
                </Label>
                <Input
                  id="moq"
                  type="number"
                  value={product.moq}
                  onChange={(e) => updateField('moq', parseInt(e.target.value))}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="stock" className="label-large text-on-surface mb-2">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={product.stock || 0}
                  onChange={(e) => updateField('stock', parseInt(e.target.value))}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="leadTime" className="label-large text-on-surface mb-2">
                  Lead time (days)
                </Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={product.leadTime}
                  onChange={(e) => updateField('leadTime', parseInt(e.target.value))}
                  className="bg-surface border-outline"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availStart" className="label-large text-on-surface mb-2">
                  Available from
                </Label>
                <Input
                  id="availStart"
                  type="date"
                  value={product.availabilityWindow.start.split('T')[0]}
                  onChange={(e) => updateField('availabilityWindow', {
                    ...product.availabilityWindow,
                    start: e.target.value
                  })}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="availEnd" className="label-large text-on-surface mb-2">
                  Available until
                </Label>
                <Input
                  id="availEnd"
                  type="date"
                  value={product.availabilityWindow.end.split('T')[0]}
                  onChange={(e) => updateField('availabilityWindow', {
                    ...product.availabilityWindow,
                    end: e.target.value
                  })}
                  className="bg-surface border-outline"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-row flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            className="flex-1 md:flex-none min-w-[220px] h-[56px]"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 md:flex-none min-w-[220px] h-[56px] bg-primary text-on-primary hover:bg-primary/90"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}