import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
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
  Sparkles,
  Search,
  Filter,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Input } from './ui/input';
import { AttributeMapping, Brand, Partner } from './PortalConfigTypes';
import svgPaths from '../imports/svg-7un8q74kd7';

interface AttributeMappingScreenProps {
  onBack: () => void;
}

type AttributeKey = 'color' | 'size' | 'gender' | 'subcategory';

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  color: 'Colour',
  size: 'Size',
  gender: 'Gender',
  subcategory: 'Sub-category'
};

export function AttributeMappingScreen({ onBack }: AttributeMappingScreenProps) {
  // Mock brands data
  const brands: Brand[] = [
    { id: 'weekday', name: 'Weekday', code: 'WD' },
    { id: 'monki', name: 'Monki', code: 'MK' }
  ];

  // Mock partners data
  const partners: Partner[] = [
    { id: '1', name: 'Sellpy', code: 'SELLPY' },
    { id: '2', name: 'Thrifted', code: 'THRIFT' },
    { id: '3', name: 'Vinted', code: 'VINTED' }
  ];

  const [selectedBrand, setSelectedBrand] = useState<string>(brands[0].id);
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeKey>('color');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock AI mappings data - multiple partner values can map to one brand value
  const [mappings] = useState<AttributeMapping[]>([
    // Color mappings for Weekday
    {
      id: '1',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'color',
      brandValueCode: 'black',
      brandValueLabel: 'Black',
      partnerValue: 'Svart',
      confidence: 95,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '2',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'color',
      brandValueCode: 'white',
      brandValueLabel: 'White',
      partnerValue: 'Vit',
      confidence: 98,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '3',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'color',
      brandValueCode: 'blue',
      brandValueLabel: 'Blue',
      partnerValue: 'Blå',
      confidence: 92,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '4',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'color',
      brandValueCode: 'black',
      brandValueLabel: 'Black',
      partnerValue: 'Black',
      confidence: 100,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '5',
      brandId: 'weekday',
      partnerId: '3',
      attributeKey: 'color',
      brandValueCode: 'black',
      brandValueLabel: 'Black',
      partnerValue: 'Noir',
      confidence: 98,
      mappedAt: '2025-01-12T09:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-12T09:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '6',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'color',
      brandValueCode: 'navy',
      brandValueLabel: 'Navy',
      partnerValue: 'Dark Blue',
      confidence: 88,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-12T09:15:00Z',
      lastUpdatedBy: 'Admin User'
    },
    {
      id: '7',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'color',
      brandValueCode: 'navy',
      brandValueLabel: 'Navy',
      partnerValue: 'Navy Blue',
      confidence: 95,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    // Size mappings
    {
      id: '8',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'size',
      brandValueCode: 'xs',
      brandValueLabel: 'XS',
      partnerValue: 'Extra Small',
      confidence: 100,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '9',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'size',
      brandValueCode: 's',
      brandValueLabel: 'S',
      partnerValue: 'Small',
      confidence: 100,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '10',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'size',
      brandValueCode: 'm',
      brandValueLabel: 'M',
      partnerValue: 'Medium',
      confidence: 100,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '11',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'size',
      brandValueCode: '36',
      brandValueLabel: '36',
      partnerValue: '36',
      confidence: 100,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    // Gender mappings
    {
      id: '12',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'gender',
      brandValueCode: 'women',
      brandValueLabel: 'Women',
      partnerValue: 'Dam',
      confidence: 96,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '13',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'gender',
      brandValueCode: 'men',
      brandValueLabel: 'Men',
      partnerValue: 'Herr',
      confidence: 96,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '14',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'gender',
      brandValueCode: 'women',
      brandValueLabel: 'Women',
      partnerValue: 'Women',
      confidence: 100,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '15',
      brandId: 'weekday',
      partnerId: '3',
      attributeKey: 'gender',
      brandValueCode: 'women',
      brandValueLabel: 'Women',
      partnerValue: 'Femme',
      confidence: 97,
      mappedAt: '2025-01-12T09:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-12T09:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    // Sub-category mappings - Example: Multiple partner values map to "Trousers"
    {
      id: '16',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Byxor',
      confidence: 92,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '17',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Jogger',
      confidence: 88,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '18',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Sweatpants',
      confidence: 85,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '19',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Wrap pants',
      confidence: 82,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '20',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Suit pants',
      confidence: 90,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '21',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Cargo pants',
      confidence: 87,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '22',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'trousers',
      brandValueLabel: 'Trousers',
      partnerValue: 'Culottes',
      confidence: 80,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '23',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'subcategory',
      brandValueCode: 'tshirts',
      brandValueLabel: 'T-shirts',
      partnerValue: 'T-shirt',
      confidence: 94,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '24',
      brandId: 'weekday',
      partnerId: '1',
      attributeKey: 'subcategory',
      brandValueCode: 'jeans',
      brandValueLabel: 'Jeans',
      partnerValue: 'Jeans',
      confidence: 100,
      mappedAt: '2025-01-10T10:00:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-10T10:00:00Z',
      lastUpdatedBy: 'AI System'
    },
    {
      id: '25',
      brandId: 'weekday',
      partnerId: '2',
      attributeKey: 'subcategory',
      brandValueCode: 'tshirts',
      brandValueLabel: 'T-shirts',
      partnerValue: 'T-Shirt',
      confidence: 97,
      mappedAt: '2025-01-11T14:30:00Z',
      mappedBy: 'ai',
      lastUpdated: '2025-01-11T14:30:00Z',
      lastUpdatedBy: 'AI System'
    }
  ]);

  // Group mappings by brand value (one brand value can have multiple partner values)
  const groupedMappings = useMemo(() => {
    const filtered = mappings.filter((mapping) => {
      const matchesBrand = mapping.brandId === selectedBrand;
      const matchesPartner = selectedPartner === 'all' || mapping.partnerId === selectedPartner;
      const matchesAttribute = mapping.attributeKey === selectedAttribute;
      const matchesSearch =
        searchQuery === '' ||
        mapping.brandValueLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.partnerValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.brandValueCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesBrand && matchesPartner && matchesAttribute && matchesSearch;
    });

    // Group by brand value code
    const grouped = filtered.reduce((acc, mapping) => {
      const key = mapping.brandValueCode;
      if (!acc[key]) {
        acc[key] = {
          brandValueCode: mapping.brandValueCode,
          brandValueLabel: mapping.brandValueLabel,
          mappings: []
        };
      }
      acc[key].mappings.push(mapping);
      return acc;
    }, {} as Record<string, { brandValueCode: string; brandValueLabel: string; mappings: AttributeMapping[] }>);

    return Object.values(grouped).sort((a, b) =>
      a.brandValueLabel.localeCompare(b.brandValueLabel)
    );
  }, [mappings, selectedBrand, selectedPartner, selectedAttribute, searchQuery]);

  const filteredMappings = useMemo(() => {
    return mappings.filter((mapping) => {
      const matchesBrand = mapping.brandId === selectedBrand;
      const matchesPartner = selectedPartner === 'all' || mapping.partnerId === selectedPartner;
      const matchesAttribute = mapping.attributeKey === selectedAttribute;
      const matchesSearch =
        searchQuery === '' ||
        mapping.brandValueLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.partnerValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.brandValueCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesBrand && matchesPartner && matchesAttribute && matchesSearch;
    });
  }, [mappings, selectedBrand, selectedPartner, selectedAttribute, searchQuery]);

  const stats = useMemo(() => {
    const filtered = mappings.filter(
      (m) => m.brandId === selectedBrand && m.attributeKey === selectedAttribute
    );
    const aiMapped = filtered.filter((m) => m.mappedBy === 'ai').length;
    const manualMapped = filtered.filter((m) => m.mappedBy === 'manual').length;
    const avgConfidence =
      filtered.length > 0
        ? filtered.reduce((sum, m) => sum + m.confidence, 0) / filtered.length
        : 0;

    return {
      totalMappings: filtered.length,
      aiMapped,
      manualMapped,
      averageConfidence: Math.round(avgConfidence)
    };
  }, [mappings, selectedBrand, selectedAttribute]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 75) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceBadgeVariant = (confidence: number): 'default' | 'secondary' | 'destructive' => {
    if (confidence >= 90) return 'default';
    if (confidence >= 75) return 'secondary';
    return 'destructive';
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
            <h1 className="title-large text-on-surface">AI Attribute Mappings</h1>
            <p className="body-small text-on-surface-variant">
              View how AI maps partner API values to brand dropdown values
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="border-primary bg-primary-container">
              <span className="label-medium text-on-primary-container">AI Mappings</span>
            </Badge>
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

            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Partner:</span>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-[180px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Attribute:</span>
              <Select
                value={selectedAttribute}
                onValueChange={(value) => setSelectedAttribute(value as AttributeKey)}
              >
                <SelectTrigger className="w-[180px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="border-outline bg-surface">
              <span className="label-medium text-on-surface-variant">
                {groupedMappings.length} brand value{groupedMappings.length !== 1 ? 's' : ''} • {filteredMappings.length} mapping{filteredMappings.length !== 1 ? 's' : ''}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl px-4 md:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-small text-on-surface-variant mb-1">Total Mappings</p>
                <p className="title-large text-on-surface">{stats.totalMappings}</p>
              </div>
              <Filter className="w-8 h-8 text-on-surface-variant" />
            </div>
          </Card>

          <Card className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-small text-on-surface-variant mb-1">AI Mapped</p>
                <p className="title-large text-on-surface">{stats.aiMapped}</p>
              </div>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-small text-on-surface-variant mb-1">Manual Mapped</p>
                <p className="title-large text-on-surface">{stats.manualMapped}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-on-surface-variant" />
            </div>
          </Card>

          <Card className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-small text-on-surface-variant mb-1">Avg Confidence</p>
                <p className="title-large text-on-surface">{stats.averageConfidence}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-on-surface-variant" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[400px]">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d={svgPaths.p3938ac00}
                fill="var(--on-surface-variant)"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search by brand value or partner value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
          />
        </div>

        {/* Mappings Table - Grouped by Brand Value */}
        <Card className="border-outline-variant bg-surface-container overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant bg-surface-container">
                  <TableHead className="body-medium text-on-surface-variant w-[200px]">Brand Value</TableHead>
                  <TableHead className="body-medium text-on-surface-variant">Partner Values Mapped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedMappings.length === 0 ? (
                  <TableRow className="bg-surface">
                    <TableCell
                      colSpan={2}
                      className="h-32 text-center body-medium text-on-surface-variant"
                    >
                      No mappings found. AI mappings will appear here when partner values are processed.
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedMappings.map((group) => {
                    // Calculate average confidence for this brand value
                    const avgConfidence = Math.round(
                      group.mappings.reduce((sum, m) => sum + m.confidence, 0) / group.mappings.length
                    );
                    const hasLowConfidence = group.mappings.some((m) => m.confidence < 75);

                    return (
                      <TableRow
                        key={group.brandValueCode}
                        className="border-outline-variant bg-surface hover:bg-surface-container-high transition-colors"
                      >
                        <TableCell className="align-top">
                          <div className="py-2">
                            <div className="mb-2">
                              <span className="title-small text-on-surface block mb-1">
                                {group.brandValueLabel}
                              </span>
                              <code className="label-small text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                                {group.brandValueCode}
                              </code>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge
                                variant={getConfidenceBadgeVariant(avgConfidence)}
                                className={
                                  avgConfidence >= 90
                                    ? 'bg-success-container text-on-success-container'
                                    : avgConfidence >= 75
                                    ? 'bg-warning-container text-on-warning-container'
                                    : 'bg-error-container text-on-error-container'
                                }
                              >
                                <span className="label-small">Avg: {avgConfidence}%</span>
                              </Badge>
                              <span className="label-small text-on-surface-variant">
                                {group.mappings.length} mapping{group.mappings.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="py-2 space-y-2">
                            {group.mappings.map((mapping) => {
                              const partner = partners.find((p) => p.id === mapping.partnerId);
                              return (
                                <div
                                  key={mapping.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high border border-outline-variant"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <span className="body-medium text-on-surface">
                                        {mapping.partnerValue}
                                      </span>
                                      <Badge variant="outline" className="border-outline bg-surface-container">
                                        <span className="label-small text-on-surface-variant">
                                          {partner?.name || 'Unknown'}
                                        </span>
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={getConfidenceBadgeVariant(mapping.confidence)}
                                        className={
                                          mapping.confidence >= 90
                                            ? 'bg-success-container text-on-success-container'
                                            : mapping.confidence >= 75
                                            ? 'bg-warning-container text-on-warning-container'
                                            : 'bg-error-container text-on-error-container'
                                        }
                                      >
                                        <span className="label-small">{mapping.confidence}%</span>
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        {mapping.mappedBy === 'ai' ? (
                                          <>
                                            <Sparkles className="w-3 h-3 text-primary" />
                                            <span className="label-small text-on-surface-variant">AI</span>
                                          </>
                                        ) : (
                                          <>
                                            <AlertCircle className="w-3 h-3 text-on-surface-variant" />
                                            <span className="label-small text-on-surface-variant">Manual</span>
                                          </>
                                        )}
                                      </div>
                                      <span className="label-small text-on-surface-variant">
                                        {new Date(mapping.lastUpdated).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 border-outline bg-surface-container">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="title-small text-on-surface mb-1">About AI Mappings</h3>
              <p className="body-small text-on-surface-variant mb-2">
                The AI automatically maps partner API values to your brand's dropdown values when
                processing orders. Multiple partner values can map to a single brand value. For
                example, partner values like "Jogger", "Sweatpants", "Wrap pants", "Suit pants",
                "Cargo pants", and "Culottes" may all map to your brand's "Trousers" value.
              </p>
              <p className="body-small text-on-surface-variant">
                Confidence scores indicate how certain the AI is about each mapping. You can review
                and manually adjust mappings if needed. Mappings are used to translate partner
                values (e.g., "Svart" from Sellpy) to your brand values (e.g., "Black").
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

