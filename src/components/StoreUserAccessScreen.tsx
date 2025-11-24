import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Users, ChevronRight, User, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useMediaQuery } from './ui/use-mobile';
import { StoreUserAccess, mockStoreUserAccess } from '../data/userAccessMockData';
import { Brand, Country, Store } from './StoreSelector';

interface StoreUserAccessScreenProps {
  onBack: () => void;
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  currentUserRole: 'Admin' | 'Brand Admin' | 'Store Manager';
  currentUserBrandId?: string; // For Brand Admin filtering
}

export default function StoreUserAccessScreen({
  onBack,
  brands,
  countries,
  stores,
  currentUserRole,
  currentUserBrandId
}: StoreUserAccessScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [filterCountryId, setFilterCountryId] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStoreId, setFilterStoreId] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<StoreUserAccess | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Filter users based on current user role
  const accessibleUsers = useMemo(() => {
    let users = mockStoreUserAccess;

    // Brand Admins can only see users from their own brand (including other brand admins and staff)
    if (currentUserRole === 'Brand Admin' && currentUserBrandId) {
      users = users.filter(user => user.brandId === currentUserBrandId);
    }

    // Admins see all users including brand admins and system admins

    // Store Managers cannot access this screen (handled in parent)
    
    return users;
  }, [currentUserRole, currentUserBrandId]);

  // Apply filters
  const filteredUsers = useMemo(() => {
    return accessibleUsers.filter(user => {
      // Search filter
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.storeNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.storeCodes.some(code => code.toLowerCase().includes(searchQuery.toLowerCase()));

      // Brand filter
      const matchesBrand = filterBrandId === 'all' || user.brandId === filterBrandId;

      // Country filter
      const matchesCountry = filterCountryId === 'all' || user.countryId === filterCountryId;

      // Role filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;

      // Store filter
      const matchesStore = filterStoreId === 'all' || user.storeIds.includes(filterStoreId);

      return matchesSearch && matchesBrand && matchesCountry && matchesRole && matchesStore;
    });
  }, [accessibleUsers, searchQuery, filterBrandId, filterCountryId, filterRole, filterStoreId]);

  // Group users by brand and country
  const groupedUsers = useMemo(() => {
    const groups: Record<string, Record<string, StoreUserAccess[]>> = {};
    
    filteredUsers.forEach(user => {
      if (!groups[user.brandName]) {
        groups[user.brandName] = {};
      }
      if (!groups[user.brandName][user.countryName]) {
        groups[user.brandName][user.countryName] = [];
      }
      groups[user.brandName][user.countryName].push(user);
    });

    return groups;
  }, [filteredUsers]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-error-container text-on-error-container';
      case 'brand-admin':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'store-manager':
        return 'bg-primary-container text-on-primary-container';
      case 'store-staff':
        return 'bg-secondary-container text-on-secondary-container';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'brand-admin':
        return 'Brand Admin';
      case 'store-manager':
        return 'Store Manager';
      case 'store-staff':
        return 'Store Staff';
      default:
        return role;
    }
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Get available brands, countries, and stores for filters
  const availableBrands = useMemo(() => {
    if (currentUserRole === 'Brand Admin' && currentUserBrandId) {
      return brands.filter(b => b.id === currentUserBrandId);
    }
    return brands;
  }, [brands, currentUserRole, currentUserBrandId]);

  const availableCountries = useMemo(() => {
    if (filterBrandId === 'all') {
      return countries;
    }
    return countries.filter(c => c.brandId === filterBrandId);
  }, [countries, filterBrandId]);

  const availableStores = useMemo(() => {
    let filteredStores = stores;
    
    // Filter by selected brand
    if (filterBrandId !== 'all') {
      filteredStores = filteredStores.filter(s => s.brandId === filterBrandId);
    }
    
    // Filter by selected country
    if (filterCountryId !== 'all') {
      filteredStores = filteredStores.filter(s => s.countryId === filterCountryId);
    }
    
    return filteredStores;
  }, [stores, filterBrandId, filterCountryId]);

  const totalAdmins = filteredUsers.filter(u => u.role === 'admin' || u.role === 'brand-admin').length;
  const totalManagers = filteredUsers.filter(u => u.role === 'store-manager').length;
  const totalStaff = filteredUsers.filter(u => u.role === 'store-staff').length;
  
  // Get unique store count from filtered users
  const uniqueStores = useMemo(() => {
    const storeIds = new Set<string>();
    filteredUsers.forEach(user => {
      user.storeIds.forEach(id => storeIds.add(id));
    });
    return storeIds.size;
  }, [filteredUsers]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="headline-small text-on-surface">Store User Access</h1>
              <p className="body-medium text-on-surface-variant">
                {currentUserRole === 'Admin' 
                  ? 'View all users with access to store app across all brands'
                  : 'View users with access to your brand\'s stores'}
              </p>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="space-y-3">
            <div className="relative flex-1 md:flex-none md:w-[576px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search by name, email, or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-container border-outline"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {currentUserRole === 'Admin' && (
                <Card className="bg-tertiary-container border-0">
                  <CardContent className="p-3">
                    <div className="text-2xl font-semibold text-on-tertiary-container">{totalAdmins}</div>
                    <div className="body-small text-on-tertiary-container/80">Admins</div>
                  </CardContent>
                </Card>
              )}
              <Card className="bg-primary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-primary-container">{totalManagers}</div>
                  <div className="body-small text-on-primary-container/80">Managers</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-secondary-container">{totalStaff}</div>
                  <div className="body-small text-on-secondary-container/80">Staff</div>
                </CardContent>
              </Card>
              <Card className="bg-surface-container-high border-outline border">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-surface">{uniqueStores}</div>
                  <div className="body-small text-on-surface-variant">Stores</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-on-surface-variant" />
              <span className="label-large text-on-surface">Filters:</span>
            </div>

            {/* Brand Filter */}
            <Select value={filterBrandId} onValueChange={setFilterBrandId}>
              <SelectTrigger className="bg-surface-container-highest border-outline w-[180px]">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {availableBrands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Country Filter */}
            <Select value={filterCountryId} onValueChange={setFilterCountryId}>
              <SelectTrigger className="bg-surface-container-highest border-outline w-[180px]">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {availableCountries.map(country => (
                  <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-surface-container-highest border-outline w-[180px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {currentUserRole === 'Admin' && (
                  <>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="brand-admin">Brand Admin</SelectItem>
                  </>
                )}
                <SelectItem value="store-manager">Store Manager</SelectItem>
                <SelectItem value="store-staff">Store Staff</SelectItem>
              </SelectContent>
            </Select>

            {/* Store Filter */}
            <Select value={filterStoreId} onValueChange={setFilterStoreId}>
              <SelectTrigger className="bg-surface-container-highest border-outline w-[240px]">
                <SelectValue placeholder="All stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                {availableStores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
            <p className="body-large text-on-surface-variant">No users found</p>
            <p className="body-medium text-on-surface-variant/70">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedUsers).map(([brandName, countryGroups]) => (
              <div key={brandName}>
                <h2 className="title-large text-on-surface mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  {brandName}
                </h2>
                
                {Object.entries(countryGroups).map(([countryName, users]) => (
                  <div key={countryName} className="mb-6">
                    <h3 className="title-medium text-on-surface-variant mb-3 lg:ml-8 ml-0">
                      {countryName}
                    </h3>
                    
                    {/* Desktop Table View */}
                    {isDesktop ? (
                      <div className="ml-8 overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-outline">
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">User</th>
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Email</th>
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Role</th>
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Store Access</th>
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Last Active</th>
                              <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(user => (
                              <tr 
                                key={user.id}
                                className="border-b border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                                onClick={() => setSelectedUser(user)}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
                                      <User className="w-5 h-5 text-on-tertiary-container" />
                                    </div>
                                    <span className="body-medium font-medium text-on-surface">{user.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="body-medium text-on-surface-variant">{user.email}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                                    {formatRole(user.role)}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {user.storeNames.map((storeName, idx) => (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className="text-xs bg-surface-container-highest"
                                      >
                                        {storeName} ({user.storeCodes[idx]})
                                      </Badge>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="body-small text-on-surface-variant">
                                    {formatLastActive(user.lastActive)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {user.status === 'inactive' ? (
                                    <Badge variant="outline" className="text-xs text-error border-error">
                                      Inactive
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-on-surface border-outline">
                                      Active
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Mobile Card View */
                      <div className="space-y-2">
                        {users.map(user => (
                          <Card 
                            key={user.id} 
                            className="hover:bg-surface-container-high transition-colors cursor-pointer border-outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-on-tertiary-container" />
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="body-large font-medium text-on-surface">{user.name}</span>
                                    <Badge 
                                      className={`${getRoleBadgeColor(user.role)} text-xs`}
                                    >
                                      {formatRole(user.role)}
                                    </Badge>
                                    {user.status === 'inactive' && (
                                      <Badge variant="outline" className="text-xs text-error border-error">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="body-medium text-on-surface-variant mb-2">{user.email}</p>
                                  
                                  {/* Store Access */}
                                  <div className="space-y-1">
                                    <p className="body-small text-on-surface-variant font-medium">Store Access:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {user.storeNames.map((storeName, idx) => (
                                        <Badge 
                                          key={idx} 
                                          variant="secondary" 
                                          className="text-xs bg-surface-container-highest"
                                        >
                                          {storeName} ({user.storeCodes[idx]})
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Last Active */}
                                  <p className="body-small text-on-surface-variant/70 mt-2">
                                    Last active: {formatLastActive(user.lastActive)}
                                  </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-2" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {Object.keys(countryGroups).length > 0 && (
                  <Separator className="my-6 bg-outline-variant" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <Card className="mt-6 bg-surface-container-low border-outline">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="body-medium text-on-surface-variant">
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
              {currentUserRole === 'Admin' && (
                <span className="body-small text-on-surface-variant">
                  Total: {accessibleUsers.length} across all brands
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

