import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Users, ChevronRight, User, Package, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useMediaQuery } from './ui/use-mobile';
import { PartnerUserAccess, mockPartnerUserAccess } from '../data/userAccessMockData';
import { Brand } from './StoreSelector';
import { Partner as WarehousePartner } from './PartnerWarehouseSelector';

interface PartnerUserAccessScreenProps {
  onBack: () => void;
  brands: Brand[];
  partners: WarehousePartner[];
  currentUserRole: 'Admin' | 'Brand Admin' | 'Partner Admin';
  currentUserBrandId?: string; // For Brand Admin filtering
  currentUserPartnerId?: string; // For Partner Admin filtering
}

export default function PartnerUserAccessScreen({
  onBack,
  brands,
  partners,
  currentUserRole,
  currentUserBrandId,
  currentUserPartnerId
}: PartnerUserAccessScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPartnerId, setFilterPartnerId] = useState<string>('all');
  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<PartnerUserAccess | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Filter users based on current user role
  const accessibleUsers = useMemo(() => {
    let users = mockPartnerUserAccess;

    // Partner Admins can only see users from their own partner
    if (currentUserRole === 'Partner Admin' && currentUserPartnerId) {
      users = users.filter(user => user.partnerId === currentUserPartnerId);
    }

    // Brand Admins can see:
    // 1. Partner users from partners that work with their brand
    // 2. Other accounts (admins, etc.) from their brand
    if (currentUserRole === 'Brand Admin' && currentUserBrandId) {
      users = users.filter(user => 
        user.brandIds.includes(currentUserBrandId)
      );
    }

    return users;
  }, [currentUserRole, currentUserBrandId, currentUserPartnerId]);

  // Apply filters
  const filteredUsers = useMemo(() => {
    return accessibleUsers.filter(user => {
      // Search filter
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.partnerName.toLowerCase().includes(searchQuery.toLowerCase());

      // Partner filter
      const matchesPartner = filterPartnerId === 'all' || user.partnerId === filterPartnerId;

      // Brand filter (for admins viewing cross-brand partners)
      const matchesBrand = filterBrandId === 'all' || user.brandIds.includes(filterBrandId);

      // Role filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;

      return matchesSearch && matchesPartner && matchesBrand && matchesRole;
    });
  }, [accessibleUsers, searchQuery, filterPartnerId, filterBrandId, filterRole]);

  // Group users by partner and category
  const groupedUsers = useMemo(() => {
    const groups: Record<string, PartnerUserAccess[]> = {};
    
    // Separate internal users (admins, brand admins) from partner users
    const internalUsers: PartnerUserAccess[] = [];
    const partnerUsers: PartnerUserAccess[] = [];
    
    filteredUsers.forEach(user => {
      if (user.role === 'admin' || user.role === 'brand-admin') {
        internalUsers.push(user);
      } else {
        partnerUsers.push(user);
      }
    });
    
    // Group internal users under a special category for admins
    if (currentUserRole === 'Admin' && internalUsers.length > 0) {
      groups['Internal Users (Admins & Brand Admins)'] = internalUsers;
    }
    
    // Group partner users by partner
    partnerUsers.forEach(user => {
      if (!groups[user.partnerName]) {
        groups[user.partnerName] = [];
      }
      groups[user.partnerName].push(user);
    });

    return groups;
  }, [filteredUsers, currentUserRole]);

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

  // Get available partners and brands for filters
  const availablePartners = useMemo(() => {
    if (currentUserRole === 'Partner Admin' && currentUserPartnerId) {
      return partners.filter(p => p.id === currentUserPartnerId);
    }
    // Get unique partner IDs from accessible users
    const partnerIds = new Set(accessibleUsers.map(u => u.partnerId));
    return partners.filter(p => partnerIds.has(p.id));
  }, [partners, currentUserRole, currentUserPartnerId, accessibleUsers]);

  const availableBrands = useMemo(() => {
    if (currentUserRole === 'Brand Admin' && currentUserBrandId) {
      return brands.filter(b => b.id === currentUserBrandId);
    }
    return brands;
  }, [brands, currentUserRole, currentUserBrandId]);

  const totalAdmins = filteredUsers.filter(u => u.role === 'admin' || u.role === 'brand-admin').length;
  const totalPartnerUsers = filteredUsers.filter(u => u.role === 'partner-user').length;
  const totalActive = filteredUsers.filter(u => u.status === 'active').length;
  // Count actual partners (excluding internal users group)
  const totalPartners = Object.keys(groupedUsers).filter(key => key !== 'Internal Users (Admins & Brand Admins)').length;

  const getScreenTitle = () => {
    switch (currentUserRole) {
      case 'Partner Admin':
        return 'Partner User Access';
      case 'Brand Admin':
        return 'Partner User Access';
      case 'Admin':
        return 'Partner User Access';
      default:
        return 'User Access';
    }
  };

  const getScreenDescription = () => {
    switch (currentUserRole) {
      case 'Partner Admin':
        return 'View accounts that have access to your partner portal';
      case 'Brand Admin':
        return 'View partner accounts with access to your brand';
      case 'Admin':
        return 'View all partner user accounts across all partners and brands';
      default:
        return 'View user accounts';
    }
  };

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
              <h1 className="headline-small text-on-surface">{getScreenTitle()}</h1>
              <p className="body-medium text-on-surface-variant">
                {getScreenDescription()}
              </p>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="space-y-3">
            <div className="relative flex-1 md:flex-none md:w-[576px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search by name, email, or partner..."
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
                  <div className="text-2xl font-semibold text-on-primary-container">{totalPartners}</div>
                  <div className="body-small text-on-primary-container/80">Partners</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-container border-0">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-secondary-container">{totalPartnerUsers}</div>
                  <div className="body-small text-on-secondary-container/80">Users</div>
                </CardContent>
              </Card>
              <Card className="bg-surface-container-high border-outline border">
                <CardContent className="p-3">
                  <div className="text-2xl font-semibold text-on-surface">{totalActive}</div>
                  <div className="body-small text-on-surface-variant">Active</div>
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

            {/* Partner Filter */}
            {currentUserRole !== 'Partner Admin' && (
              <Select value={filterPartnerId} onValueChange={setFilterPartnerId}>
                <SelectTrigger className="bg-surface-container-highest border-outline w-[220px]">
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All partners</SelectItem>
                  {availablePartners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
                <SelectItem value="partner-user">Partner User</SelectItem>
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
            {Object.entries(groupedUsers).map(([partnerName, users]) => {
              const isInternalGroup = partnerName === 'Internal Users (Admins & Brand Admins)';
              return (
              <div key={partnerName}>
                <h2 className="title-large text-on-surface mb-4 flex items-center gap-2">
                  {isInternalGroup ? (
                    <Shield className="w-6 h-6 text-tertiary" />
                  ) : (
                    <Package className="w-6 h-6 text-primary" />
                  )}
                  {partnerName}
                </h2>
                
                {/* Desktop Table View */}
                {isDesktop ? (
                  <div className="ml-8 overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-outline">
                          <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">User</th>
                          <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Email</th>
                          <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Role</th>
                          {currentUserRole === 'Admin' && (
                            <th className="text-left py-3 px-4 body-medium font-semibold text-on-surface">Brand Access</th>
                          )}
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
                              {user.role === 'admin' ? (
                                <Badge className="bg-error-container text-on-error-container text-xs">
                                  Admin
                                </Badge>
                              ) : user.role === 'brand-admin' ? (
                                <Badge className="bg-tertiary-container text-on-tertiary-container text-xs">
                                  Brand Admin
                                </Badge>
                              ) : (
                                <Badge className="bg-secondary-container text-on-secondary-container text-xs">
                                  Partner User
                                </Badge>
                              )}
                            </td>
                            {currentUserRole === 'Admin' && (
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {user.brandNames.map((brandName, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant="secondary" 
                                      className="text-xs bg-surface-container-highest"
                                    >
                                      {brandName}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                            )}
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
                  <div className="space-y-2 mb-6">
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
                              {user.role === 'admin' ? (
                                <Badge className="bg-error-container text-on-error-container text-xs">
                                  Admin
                                </Badge>
                              ) : user.role === 'brand-admin' ? (
                                <Badge className="bg-tertiary-container text-on-tertiary-container text-xs">
                                  Brand Admin
                                </Badge>
                              ) : (
                                <Badge className="bg-secondary-container text-on-secondary-container text-xs">
                                  Partner User
                                </Badge>
                              )}
                              {user.status === 'inactive' && (
                                <Badge variant="outline" className="text-xs text-error border-error">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                              <p className="body-medium text-on-surface-variant mb-2">{user.email}</p>
                              
                              {/* Brand Access */}
                              {currentUserRole === 'Admin' && user.brandNames.length > 0 && (
                                <div className="space-y-1 mb-2">
                                  <p className="body-small text-on-surface-variant font-medium">Brand Access:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {user.brandNames.map((brandName, idx) => (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className="text-xs bg-surface-container-highest"
                                      >
                                        {brandName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

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
                
                <Separator className="my-6 bg-outline-variant" />
              </div>
            );
            })}
          </div>
        )}

        {/* Summary */}
        <Card className="mt-6 bg-surface-container-low border-outline">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="body-medium text-on-surface-variant">
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} 
                {' '}from {totalPartners} partner{totalPartners !== 1 ? 's' : ''}
              </span>
              {currentUserRole === 'Admin' && (
                <span className="body-small text-on-surface-variant">
                  Total: {accessibleUsers.length} across all partners
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

