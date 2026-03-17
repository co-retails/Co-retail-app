import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Filter, Pencil, Plus, User, UserX, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  FullScreenDialogDescription,
  FullScreenDialogHeader,
  FullScreenDialogTitle
} from './ui/full-screen-dialog';
import { useMediaQuery } from './ui/use-mobile';
import { AdminAccessUser, defaultAccessScope, mockAdminAccessUsers } from '../data/userAccessMockData';
import { Brand, Country, Store } from './StoreSelector';
import { Partner, Warehouse } from './PartnerWarehouseSelector';

interface StoreUserAccessScreenProps {
  onBack: () => void;
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  partners: Partner[];
  warehouses: Warehouse[];
  currentUserRole: 'Admin';
}

type FormState = Omit<AdminAccessUser, 'id' | 'lastActive' | 'status'> & { status: 'active' | 'inactive' };

const createFormState = (): FormState => ({
  name: '',
  email: '',
  status: 'active',
  portalAccess: { storeApp: true, partnerPortal: true },
  scope: defaultAccessScope()
});

const formatLastActive = (dateString?: string) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const getBrandSummary = (user: AdminAccessUser, brands: Brand[]) => {
  if (user.scope.allBrands) return 'All brands';
  const names = brands.filter((brand) => user.scope.brandIds.includes(brand.id)).map((brand) => brand.name);
  return names.length ? names.join(', ') : 'No brands selected';
};

const scopeChip = (all: boolean, count: number, label: string) => (all ? `All ${label}` : `${count} ${label}`);

export default function StoreUserAccessScreen({
  onBack,
  brands,
  countries,
  stores,
  partners,
  warehouses
}: StoreUserAccessScreenProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [users, setUsers] = useState<AdminAccessUser[]>(mockAdminAccessUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrandId, setFilterBrandId] = useState('all');
  const [filterCountryId, setFilterCountryId] = useState('all');
  const [filterPortal, setFilterPortal] = useState<'all' | 'store' | 'partner' | 'both'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(createFormState());

  const [brandSearch, setBrandSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');

  const countryGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; ids: string[] }>();
    countries.forEach((country) => {
      const key = country.name.trim().toLowerCase();
      const existing = groups.get(key);
      if (existing) {
        existing.ids.push(country.id);
      } else {
        groups.set(key, { key, label: country.name, ids: [country.id] });
      }
    });
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [countries]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = filterBrandId === 'all' || user.scope.allBrands || user.scope.brandIds.includes(filterBrandId);
      const selectedCountryIds = filterCountryId === 'all' ? [] : (countryGroups.find((country) => country.key === filterCountryId)?.ids || []);
      const matchesCountry =
        filterCountryId === 'all' ||
        user.scope.allCountries ||
        user.scope.countryIds.some((countryId) => selectedCountryIds.includes(countryId));
      const matchesPortal =
        filterPortal === 'all' ||
        (filterPortal === 'store' && user.portalAccess.storeApp) ||
        (filterPortal === 'partner' && user.portalAccess.partnerPortal) ||
        (filterPortal === 'both' && user.portalAccess.storeApp && user.portalAccess.partnerPortal);
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesBrand && matchesCountry && matchesPortal && matchesStatus;
    });
  }, [users, searchQuery, filterBrandId, filterCountryId, filterPortal, filterStatus, countryGroups]);

  const selectedBrandIdsForFiltering = useMemo(
    () => (formState.scope.allBrands ? brands.map((brand) => brand.id) : formState.scope.brandIds),
    [formState.scope.allBrands, formState.scope.brandIds, brands]
  );

  const filteredCountryGroups = useMemo(() => {
    if (formState.scope.allBrands) return countryGroups;
    const selectedBrandSet = new Set(formState.scope.brandIds);
    return countryGroups.filter((group) =>
      group.ids.some((countryId) => {
        const country = countries.find((item) => item.id === countryId);
        return country ? selectedBrandSet.has(country.brandId) : false;
      })
    );
  }, [formState.scope.allBrands, formState.scope.brandIds, countryGroups, countries]);

  const selectedCountryIdsForFiltering = useMemo(() => {
    if (!formState.scope.allCountries) return formState.scope.countryIds;
    if (formState.scope.allBrands) return countries.map((country) => country.id);
    const selectedBrandSet = new Set(formState.scope.brandIds);
    return countries.filter((country) => selectedBrandSet.has(country.brandId)).map((country) => country.id);
  }, [formState.scope.allCountries, formState.scope.countryIds, formState.scope.allBrands, formState.scope.brandIds, countries]);

  const filteredStoreOptions = useMemo(() => {
    const selectedBrandSet = new Set(selectedBrandIdsForFiltering);
    const selectedCountrySet = new Set(selectedCountryIdsForFiltering);
    return stores
      .filter((store) => (formState.scope.allBrands ? true : selectedBrandSet.has(store.brandId)))
      .filter((store) => (formState.scope.allCountries ? true : selectedCountrySet.has(store.countryId)))
      .map((store) => ({ id: store.id, label: `${store.name} (${store.code})` }));
  }, [stores, formState.scope.allBrands, formState.scope.allCountries, selectedBrandIdsForFiltering, selectedCountryIdsForFiltering]);

  const filteredWarehouseOptions = useMemo(() => {
    if (formState.scope.allPartners) {
      return warehouses.map((warehouse) => ({ id: warehouse.id, label: warehouse.name }));
    }
    const selectedPartnerSet = new Set(formState.scope.partnerIds);
    return warehouses
      .filter((warehouse) => selectedPartnerSet.has(warehouse.partnerId))
      .map((warehouse) => ({ id: warehouse.id, label: warehouse.name }));
  }, [warehouses, formState.scope.allPartners, formState.scope.partnerIds]);

  useEffect(() => {
    setFormState((prev) => {
      const selectedBrandSet = new Set(prev.scope.allBrands ? brands.map((brand) => brand.id) : prev.scope.brandIds);
      const allowedCountryIds = countries.filter((country) => selectedBrandSet.has(country.brandId)).map((country) => country.id);
      const allowedCountrySet = new Set(allowedCountryIds);
      const nextCountryIds = prev.scope.allCountries ? prev.scope.countryIds : prev.scope.countryIds.filter((id) => allowedCountrySet.has(id));

      const selectedCountrySet = new Set(prev.scope.allCountries ? allowedCountryIds : nextCountryIds);
      const allowedStoreIds = stores
        .filter((store) => selectedBrandSet.has(store.brandId))
        .filter((store) => selectedCountrySet.has(store.countryId))
        .map((store) => store.id);
      const allowedStoreSet = new Set(allowedStoreIds);
      const nextStoreIds = prev.scope.allStores ? prev.scope.storeIds : prev.scope.storeIds.filter((id) => allowedStoreSet.has(id));

      const selectedPartnerSet = new Set(prev.scope.partnerIds);
      const allowedWarehouseIds = warehouses
        .filter((warehouse) => (prev.scope.allPartners ? true : selectedPartnerSet.has(warehouse.partnerId)))
        .map((warehouse) => warehouse.id);
      const allowedWarehouseSet = new Set(allowedWarehouseIds);
      const nextWarehouseIds = prev.scope.allWarehouses ? prev.scope.warehouseIds : prev.scope.warehouseIds.filter((id) => allowedWarehouseSet.has(id));

      const countryChanged = nextCountryIds.length !== prev.scope.countryIds.length;
      const storeChanged = nextStoreIds.length !== prev.scope.storeIds.length;
      const warehouseChanged = nextWarehouseIds.length !== prev.scope.warehouseIds.length;
      if (!countryChanged && !storeChanged && !warehouseChanged) return prev;

      return {
        ...prev,
        scope: {
          ...prev.scope,
          countryIds: nextCountryIds,
          storeIds: nextStoreIds,
          warehouseIds: nextWarehouseIds
        }
      };
    });
  }, [
    brands,
    countries,
    stores,
    warehouses,
    formState.scope.allBrands,
    formState.scope.brandIds,
    formState.scope.allCountries,
    formState.scope.countryIds,
    formState.scope.allStores,
    formState.scope.storeIds,
    formState.scope.allPartners,
    formState.scope.partnerIds,
    formState.scope.allWarehouses,
    formState.scope.warehouseIds
  ]);

  const updateScopeToggle = (key: keyof FormState['scope'], checked: boolean) => {
    setFormState((prev) => ({ ...prev, scope: { ...prev.scope, [key]: checked } }));
  };

  const updateScopeSelection = (
    key: 'brandIds' | 'countryIds' | 'storeIds' | 'partnerIds' | 'warehouseIds',
    value: string,
    checked: boolean
  ) => {
    setFormState((prev) => {
      const next = new Set(prev.scope[key]);
      if (checked) next.add(value);
      else next.delete(value);
      return { ...prev, scope: { ...prev.scope, [key]: Array.from(next) } };
    });
  };

  const openCreate = () => {
    setEditingUserId(null);
    setFormState(createFormState());
    setIsEditorOpen(true);
  };

  const openEdit = (user: AdminAccessUser) => {
    setEditingUserId(user.id);
    setFormState({
      name: user.name,
      email: user.email,
      status: user.status,
      portalAccess: user.portalAccess,
      scope: user.scope
    });
    setIsEditorOpen(true);
  };

  const toggleEnabled = (id: string) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user)));
  };

  const saveUser = () => {
    if (!formState.name.trim() || !formState.email.trim()) return;
    if (!formState.portalAccess.storeApp && !formState.portalAccess.partnerPortal) return;

    if (editingUserId) {
      setUsers((prev) => prev.map((user) => (user.id === editingUserId ? { ...user, ...formState } : user)));
    } else {
      setUsers((prev) => [{ id: `au-${Date.now()}`, lastActive: undefined, ...formState }, ...prev]);
    }

    setIsEditorOpen(false);
  };

  const renderScopeSection = (
    title: string,
    allKey: keyof FormState['scope'],
    selectedKey: 'brandIds' | 'countryIds' | 'storeIds' | 'partnerIds' | 'warehouseIds',
    searchValue: string,
    onSearchChange: (value: string) => void,
    options: Array<{ id: string; label: string }>
  ) => {
    const allSelected = Boolean(formState.scope[allKey]);
    const selectedValues = formState.scope[selectedKey];
    const visible = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()));
    const selectedCountLabel = allSelected ? `All ${options.length}` : `${selectedValues.length} selected`;

    return (
      <Card className="border-outline">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="label-large text-on-surface">{title}</span>
              <Badge variant="secondary" className="text-xs bg-surface-container-highest">
                {selectedCountLabel}
              </Badge>
            </div>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={allSelected} onCheckedChange={(checked) => updateScopeToggle(allKey, Boolean(checked))} />
              <span className="body-small text-on-surface-variant">All</span>
            </label>
          </div>
          {!allSelected && (
            <>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 body-medium text-on-surface"
              />
              <div className="max-h-40 overflow-y-auto rounded-lg border border-outline-variant p-2 space-y-2">
                {visible.length === 0 && <p className="body-small text-on-surface-variant">No matches</p>}
                {visible.map((item) => (
                  <label key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedValues.includes(item.id)}
                      onCheckedChange={(checked) => updateScopeSelection(selectedKey, item.id, Boolean(checked))}
                    />
                    <span className="body-small text-on-surface">{item.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCountryScopeSection = () => {
    const allSelected = formState.scope.allCountries;
    const visible = filteredCountryGroups.filter((country) => country.label.toLowerCase().includes(countrySearch.toLowerCase()));
    const selectedCount = filteredCountryGroups.filter((country) =>
      country.ids.every((id) => formState.scope.countryIds.includes(id))
    ).length;
    const selectedCountLabel = allSelected ? `All ${filteredCountryGroups.length}` : `${selectedCount} selected`;

    const onToggleCountryGroup = (countryIds: string[], checked: boolean) => {
      setFormState((prev) => {
        const next = new Set(prev.scope.countryIds);
        countryIds.forEach((id) => {
          if (checked) next.add(id);
          else next.delete(id);
        });
        return { ...prev, scope: { ...prev.scope, countryIds: Array.from(next) } };
      });
    };

    return (
      <Card className="border-outline">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="label-large text-on-surface">Countries</span>
              <Badge variant="secondary" className="text-xs bg-surface-container-highest">
                {selectedCountLabel}
              </Badge>
            </div>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={allSelected} onCheckedChange={(checked) => updateScopeToggle('allCountries', Boolean(checked))} />
              <span className="body-small text-on-surface-variant">All</span>
            </label>
          </div>
          {!allSelected && (
            <>
              <input
                type="text"
                value={countrySearch}
                onChange={(event) => setCountrySearch(event.target.value)}
                placeholder="Search countries..."
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 body-medium text-on-surface"
              />
              <div className="max-h-40 overflow-y-auto rounded-lg border border-outline-variant p-2 space-y-2">
                {visible.length === 0 && <p className="body-small text-on-surface-variant">No matches</p>}
                {visible.map((country) => {
                  const isChecked = country.ids.every((id) => formState.scope.countryIds.includes(id));
                  return (
                    <label key={country.key} className="flex items-center gap-2">
                      <Checkbox checked={isChecked} onCheckedChange={(checked) => onToggleCountryGroup(country.ids, Boolean(checked))} />
                      <span className="body-small text-on-surface">{country.label}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const editorBody = (
    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-4 space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="label-medium text-on-surface">Name</label>
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface px-3"
            />
          </div>
          <div className="space-y-1">
            <label className="label-medium text-on-surface">Email</label>
            <input
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface px-3"
            />
          </div>
        </div>

        <Card className="border-outline">
          <CardContent className="p-4">
            <h3 className="title-small text-on-surface mb-3">Portal access</h3>
            <div className="flex gap-6 flex-wrap">
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={formState.portalAccess.storeApp}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, portalAccess: { ...prev.portalAccess, storeApp: Boolean(checked) } }))
                  }
                />
                <span className="body-medium">Store app</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={formState.portalAccess.partnerPortal}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, portalAccess: { ...prev.portalAccess, partnerPortal: Boolean(checked) } }))
                  }
                />
                <span className="body-medium">Partner portal</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-outline bg-surface-container-low">
          <CardContent className="p-4 space-y-2">
            <h3 className="title-small text-on-surface">Access summary</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {formState.portalAccess.storeApp ? 'Store app enabled' : 'Store app disabled'}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {formState.portalAccess.partnerPortal ? 'Partner portal enabled' : 'Partner portal disabled'}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {scopeChip(formState.scope.allBrands, formState.scope.brandIds.length, 'brands')}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {scopeChip(formState.scope.allCountries, formState.scope.countryIds.length, 'countries')}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {scopeChip(formState.scope.allStores, formState.scope.storeIds.length, 'stores')}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {scopeChip(formState.scope.allPartners, formState.scope.partnerIds.length, 'partners')}
              </Badge>
              <Badge variant="secondary" className="bg-surface-container-highest text-xs">
                {scopeChip(formState.scope.allWarehouses, formState.scope.warehouseIds.length, 'warehouses')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setFormState((prev) => ({ ...prev, scope: defaultAccessScope() }))}>
            All brands/countries/stores/partners/warehouses
          </Button>
        </div>

        <div className="space-y-3">
          {renderScopeSection('Brands', 'allBrands', 'brandIds', brandSearch, setBrandSearch, brands.map((item) => ({ id: item.id, label: item.name })))}
          {renderCountryScopeSection()}
          {renderScopeSection('Stores', 'allStores', 'storeIds', storeSearch, setStoreSearch, filteredStoreOptions)}
          {renderScopeSection('Partners', 'allPartners', 'partnerIds', partnerSearch, setPartnerSearch, partners.map((item) => ({ id: item.id, label: item.name })))}
          {renderScopeSection('Warehouses', 'allWarehouses', 'warehouseIds', warehouseSearch, setWarehouseSearch, filteredWarehouseOptions)}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="headline-small text-on-surface">Admin user access</h1>
              <p className="body-medium text-on-surface-variant">Manage admin users only. Store users are not shown on this screen.</p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add admin access
            </Button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full md:max-w-2xl h-14 rounded-lg border border-outline-variant bg-surface px-4 body-large text-on-surface"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-tertiary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-tertiary-container">{filteredUsers.length}</div>
                  <div className="body-small text-on-tertiary-container/80">Admins</div>
                </CardContent>
              </Card>
              <Card className="bg-primary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-primary-container">{filteredUsers.filter((user) => user.status === 'active').length}</div>
                  <div className="body-small text-on-primary-container/80">Active</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-secondary-container">{filteredUsers.filter((user) => user.portalAccess.storeApp).length}</div>
                  <div className="body-small text-on-secondary-container/80">Store app</div>
                </CardContent>
              </Card>
              <Card className="bg-surface-container-high border-outline border">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-surface">{filteredUsers.filter((user) => user.portalAccess.partnerPortal).length}</div>
                  <div className="body-small text-on-surface-variant">Partner portal</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-on-surface-variant" />
              <span className="label-large text-on-surface">Filters:</span>
            </div>
            <Select value={filterBrandId} onValueChange={setFilterBrandId}>
              <SelectTrigger className="h-12 bg-surface-container border border-outline-variant rounded-lg w-[180px]">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCountryId} onValueChange={setFilterCountryId}>
              <SelectTrigger className="h-12 bg-surface-container border border-outline-variant rounded-lg w-[180px]">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countryGroups.map((country) => (
                  <SelectItem key={country.key} value={country.key}>{country.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPortal} onValueChange={(value) => setFilterPortal(value as 'all' | 'store' | 'partner' | 'both')}>
              <SelectTrigger className="h-12 bg-surface-container border border-outline-variant rounded-lg w-[200px]">
                <SelectValue placeholder="All portal access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All portal access</SelectItem>
                <SelectItem value="store">Store app</SelectItem>
                <SelectItem value="partner">Partner portal</SelectItem>
                <SelectItem value="both">Store app + Partner portal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="h-12 bg-surface-container border border-outline-variant rounded-lg w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
            <p className="body-large text-on-surface-variant">No users found</p>
          </div>
        ) : isDesktop ? (
          <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-outline">
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">User</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Brand scope</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Access scope</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Portals</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Last active</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                          <User className="w-5 h-5 text-on-tertiary-container" />
                        </div>
                        <div>
                          <div className="body-medium font-medium text-on-surface">{user.name}</div>
                          <div className="body-small text-on-surface-variant">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs bg-surface-container-highest">{getBrandSummary(user, brands)}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allCountries, user.scope.countryIds.length, 'countries')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allStores, user.scope.storeIds.length, 'stores')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allPartners, user.scope.partnerIds.length, 'partners')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allWarehouses, user.scope.warehouseIds.length, 'warehouses')}</Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="body-small text-on-surface-variant">Store app: {user.portalAccess.storeApp ? 'Yes' : 'No'}</span>
                        <span className="body-small text-on-surface-variant">Partner portal: {user.portalAccess.partnerPortal ? 'Yes' : 'No'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="body-small text-on-surface-variant">{formatLastActive(user.lastActive)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={user.status === 'active' ? 'text-xs text-on-surface border-outline' : 'text-xs text-error border-error'}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleEnabled(user.id)}>
                          <UserX className="w-4 h-4 mr-1" />
                          {user.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-surface-container border border-outline-variant">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-on-tertiary-container" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="body-large font-medium text-on-surface">{user.name}</span>
                        <Badge className="bg-tertiary-container text-on-tertiary-container text-xs">Admin</Badge>
                        <Badge variant="outline" className={user.status === 'active' ? 'text-xs text-on-surface border-outline' : 'text-xs text-error border-error'}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="body-medium text-on-surface-variant mb-2">{user.email}</p>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{getBrandSummary(user, brands)}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allCountries, user.scope.countryIds.length, 'countries')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allStores, user.scope.storeIds.length, 'stores')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allPartners, user.scope.partnerIds.length, 'partners')}</Badge>
                        <Badge variant="secondary" className="text-xs bg-surface-container-highest">{scopeChip(user.scope.allWarehouses, user.scope.warehouseIds.length, 'warehouses')}</Badge>
                        <Badge variant="outline" className="text-xs text-on-surface border-outline">Store app: {user.portalAccess.storeApp ? 'Yes' : 'No'}</Badge>
                        <Badge variant="outline" className="text-xs text-on-surface border-outline">Partner portal: {user.portalAccess.partnerPortal ? 'Yes' : 'No'}</Badge>
                      </div>
                      <p className="body-small text-on-surface-variant/70">Last active: {formatLastActive(user.lastActive)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleEnabled(user.id)}>
                      <UserX className="w-4 h-4 mr-1" />
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isDesktop ? (
        <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <SheetContent side="right" className="bg-surface border-outline-variant p-0 max-w-[760px] w-full h-full overflow-hidden !gap-0 grid grid-rows-[auto_minmax(0,1fr)_auto]">
            <SheetHeader className="shrink-0 border-b border-outline-variant px-6 py-4">
              <SheetTitle className="title-large text-on-surface">{editingUserId ? 'Edit admin access' : 'Add admin access'}</SheetTitle>
              <SheetDescription className="body-medium text-on-surface-variant">Set admin permissions and scope.</SheetDescription>
            </SheetHeader>
            {editorBody}
            <div className="shrink-0 z-10 bg-surface border-t border-outline-variant p-4 md:px-6 flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveUser} disabled={!formState.name || !formState.email || (!formState.portalAccess.storeApp && !formState.portalAccess.partnerPortal)}>
                Save access
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <FullScreenDialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <FullScreenDialogContent className="bg-surface p-0 h-screen overflow-hidden !gap-0 grid grid-rows-[auto_minmax(0,1fr)_auto]">
            <FullScreenDialogHeader className="shrink-0 border-b border-outline-variant px-4 py-4">
              <FullScreenDialogTitle className="title-large text-on-surface">{editingUserId ? 'Edit admin access' : 'Add admin access'}</FullScreenDialogTitle>
              <FullScreenDialogDescription className="body-medium text-on-surface-variant">Set admin permissions and scope.</FullScreenDialogDescription>
            </FullScreenDialogHeader>
            {editorBody}
            <div className="shrink-0 z-10 bg-surface border-t border-outline-variant p-4 md:px-6 flex gap-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
              <Button className="flex-1" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveUser} disabled={!formState.name || !formState.email || (!formState.portalAccess.storeApp && !formState.portalAccess.partnerPortal)}>
                Save access
              </Button>
            </div>
          </FullScreenDialogContent>
        </FullScreenDialog>
      )}
    </div>
  );
}
