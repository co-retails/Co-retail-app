/**
 * User Access Management Mock Data
 * 
 * This file contains mock data for user access management across stores and partners.
 * It defines user accounts with their roles and access permissions.
 */

// User role types for the entire system
export type StoreUserRole = 'store-staff' | 'store-manager' | 'brand-admin' | 'admin';
export type PartnerUserRole = 'partner-user' | 'brand-admin' | 'admin';
export type SystemRole = 'admin' | 'brand-admin';
export type UserAccessRole = StoreUserRole | PartnerUserRole | SystemRole;

// Store user access interface
export interface StoreUserAccess {
  id: string;
  name: string;
  email: string;
  role: StoreUserRole;
  brandId: string;
  brandName: string;
  countryId: string;
  countryName: string;
  storeIds: string[]; // Array of store IDs they have access to
  storeNames: string[]; // Corresponding store names
  storeCodes: string[]; // Corresponding store codes
  lastActive?: string;
  status: 'active' | 'inactive';
}

// Partner user access interface
export interface PartnerUserAccess {
  id: string;
  name: string;
  email: string;
  role: PartnerUserRole;
  partnerId: string;
  partnerName: string;
  brandIds: string[]; // Brands this partner has access to (for brand admin filtering)
  brandNames: string[];
  lastActive?: string;
  status: 'active' | 'inactive';
}

// Mock store user access data
export const mockStoreUserAccess: StoreUserAccess[] = [
  // WEEKDAY Sweden - Drottninggatan 63
  {
    id: 'su-001',
    name: 'Emma Andersson',
    email: 'emma.andersson@weekday.com',
    role: 'store-manager',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['1'],
    storeNames: ['Drottninggatan 63'],
    storeCodes: ['SE0655'],
    lastActive: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'su-002',
    name: 'Oscar Lindberg',
    email: 'oscar.lindberg@weekday.com',
    role: 'store-staff',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['1'],
    storeNames: ['Drottninggatan 63'],
    storeCodes: ['SE0655'],
    lastActive: '2024-01-15T14:20:00Z',
    status: 'active'
  },
  {
    id: 'su-003',
    name: 'Sara Johansson',
    email: 'sara.johansson@weekday.com',
    role: 'store-staff',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['1'],
    storeNames: ['Drottninggatan 63'],
    storeCodes: ['SE0655'],
    lastActive: '2024-01-14T16:45:00Z',
    status: 'active'
  },
  
  // WEEKDAY Sweden - Södermalm Store
  {
    id: 'su-004',
    name: 'Viktor Bergström',
    email: 'viktor.bergstrom@weekday.com',
    role: 'store-manager',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['2'],
    storeNames: ['Södermalm Store'],
    storeCodes: ['SE0656'],
    lastActive: '2024-01-15T09:15:00Z',
    status: 'active'
  },
  {
    id: 'su-005',
    name: 'Maja Karlsson',
    email: 'maja.karlsson@weekday.com',
    role: 'store-staff',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['2'],
    storeNames: ['Södermalm Store'],
    storeCodes: ['SE0656'],
    lastActive: '2024-01-15T11:30:00Z',
    status: 'active'
  },

  // Multi-store manager (has access to both Swedish stores)
  {
    id: 'su-006',
    name: 'Lars Svensson',
    email: 'lars.svensson@weekday.com',
    role: 'store-manager',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: ['1', '2'],
    storeNames: ['Drottninggatan 63', 'Södermalm Store'],
    storeCodes: ['SE0655', 'SE0656'],
    lastActive: '2024-01-15T08:00:00Z',
    status: 'active'
  },

  // WEEKDAY Denmark - Copenhagen Central
  {
    id: 'su-007',
    name: 'Sofie Hansen',
    email: 'sofie.hansen@weekday.com',
    role: 'store-manager',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '2',
    countryName: 'Denmark',
    storeIds: ['3'],
    storeNames: ['Copenhagen Central'],
    storeCodes: ['DK0123'],
    lastActive: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'su-008',
    name: 'Mikkel Jensen',
    email: 'mikkel.jensen@weekday.com',
    role: 'store-staff',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '2',
    countryName: 'Denmark',
    storeIds: ['3'],
    storeNames: ['Copenhagen Central'],
    storeCodes: ['DK0123'],
    lastActive: '2024-01-14T15:30:00Z',
    status: 'active'
  },

  // COS Spain - Barcelona Passeig
  {
    id: 'su-009',
    name: 'Maria Garcia',
    email: 'maria.garcia@cos.com',
    role: 'store-manager',
    brandId: '2',
    brandName: 'COS',
    countryId: '9',
    countryName: 'Spain',
    storeIds: ['13'],
    storeNames: ['Barcelona Passeig'],
    storeCodes: ['ES0001'],
    lastActive: '2024-01-15T12:00:00Z',
    status: 'active'
  },
  {
    id: 'su-010',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@cos.com',
    role: 'store-staff',
    brandId: '2',
    brandName: 'COS',
    countryId: '9',
    countryName: 'Spain',
    storeIds: ['13'],
    storeNames: ['Barcelona Passeig'],
    storeCodes: ['ES0001'],
    lastActive: '2024-01-15T13:45:00Z',
    status: 'active'
  },

  // Inactive user example
  {
    id: 'su-011',
    name: 'Anna Nielsen',
    email: 'anna.nielsen@weekday.com',
    role: 'store-staff',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '2',
    countryName: 'Denmark',
    storeIds: ['3'],
    storeNames: ['Copenhagen Central'],
    storeCodes: ['DK0123'],
    lastActive: '2023-12-01T10:00:00Z',
    status: 'inactive'
  },

  // Brand Admins - have access to all stores in their brand
  {
    id: 'su-012',
    name: 'Helena Svensson',
    email: 'helena.svensson@weekday.com',
    role: 'brand-admin',
    brandId: '1',
    brandName: 'WEEKDAY',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: [], // Empty means all stores in brand
    storeNames: ['All WEEKDAY stores'],
    storeCodes: ['ALL'],
    lastActive: '2024-01-15T16:00:00Z',
    status: 'active'
  },
  {
    id: 'su-013',
    name: 'Isabella Garcia',
    email: 'isabella.garcia@cos.com',
    role: 'brand-admin',
    brandId: '2',
    brandName: 'COS',
    countryId: '9',
    countryName: 'Spain',
    storeIds: [],
    storeNames: ['All COS stores'],
    storeCodes: ['ALL'],
    lastActive: '2024-01-15T15:30:00Z',
    status: 'active'
  },

  // System Admins - have access to all stores across all brands
  {
    id: 'su-014',
    name: 'Jane Doe',
    email: 'jane.doe@hm.com',
    role: 'admin',
    brandId: '1',
    brandName: 'H&M Group',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: [],
    storeNames: ['All stores (all brands)'],
    storeCodes: ['ALL'],
    lastActive: '2024-01-15T17:45:00Z',
    status: 'active'
  },
  {
    id: 'su-015',
    name: 'Michael Anderson',
    email: 'michael.anderson@hm.com',
    role: 'admin',
    brandId: '1',
    brandName: 'H&M Group',
    countryId: '1',
    countryName: 'Sweden',
    storeIds: [],
    storeNames: ['All stores (all brands)'],
    storeCodes: ['ALL'],
    lastActive: '2024-01-15T09:20:00Z',
    status: 'active'
  }
];

// Mock partner user access data
export const mockPartnerUserAccess: PartnerUserAccess[] = [
  // Sellpy partner users
  {
    id: 'pu-001',
    name: 'Johan Persson',
    email: 'johan.persson@sellpy.com',
    role: 'partner-user',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandIds: ['1', '2', '3', '4'], // All brands
    brandNames: ['WEEKDAY', 'COS', 'Monki', 'H&M'],
    lastActive: '2024-01-15T14:30:00Z',
    status: 'active'
  },
  {
    id: 'pu-002',
    name: 'Linda Eriksson',
    email: 'linda.eriksson@sellpy.com',
    role: 'partner-user',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandIds: ['1', '2', '3', '4'],
    brandNames: ['WEEKDAY', 'COS', 'Monki', 'H&M'],
    lastActive: '2024-01-15T11:00:00Z',
    status: 'active'
  },
  {
    id: 'pu-003',
    name: 'Anders Nilsson',
    email: 'anders.nilsson@sellpy.com',
    role: 'partner-user',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandIds: ['1', '2', '3', '4'],
    brandNames: ['WEEKDAY', 'COS', 'Monki', 'H&M'],
    lastActive: '2024-01-14T16:20:00Z',
    status: 'active'
  },

  // Thrifted partner users
  {
    id: 'pu-004',
    name: 'Kristin Olsen',
    email: 'kristin.olsen@thrifted.no',
    role: 'partner-user',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandIds: ['1', '3'], // WEEKDAY and Monki
    brandNames: ['WEEKDAY', 'Monki'],
    lastActive: '2024-01-15T13:00:00Z',
    status: 'active'
  },
  {
    id: 'pu-005',
    name: 'Erik Hansen',
    email: 'erik.hansen@thrifted.no',
    role: 'partner-user',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandIds: ['1', '3'],
    brandNames: ['WEEKDAY', 'Monki'],
    lastActive: '2024-01-15T10:45:00Z',
    status: 'active'
  },

  // Shenzhen Fashion Manufacturing partner users
  {
    id: 'pu-006',
    name: 'Li Wei',
    email: 'li.wei@shenzhenfashion.cn',
    role: 'partner-user',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    brandIds: ['1', '2'], // WEEKDAY and COS
    brandNames: ['WEEKDAY', 'COS'],
    lastActive: '2024-01-15T15:00:00Z',
    status: 'active'
  },
  {
    id: 'pu-007',
    name: 'Zhang Min',
    email: 'zhang.min@shenzhenfashion.cn',
    role: 'partner-user',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    brandIds: ['1', '2'],
    brandNames: ['WEEKDAY', 'COS'],
    lastActive: '2024-01-15T09:30:00Z',
    status: 'active'
  },
  {
    id: 'pu-008',
    name: 'Chen Hui',
    email: 'chen.hui@shenzhenfashion.cn',
    role: 'partner-user',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    brandIds: ['1', '2'],
    brandNames: ['WEEKDAY', 'COS'],
    lastActive: '2024-01-14T14:00:00Z',
    status: 'active'
  },

  // Inactive partner user example
  {
    id: 'pu-009',
    name: 'Ole Petersen',
    email: 'ole.petersen@thrifted.no',
    role: 'partner-user',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandIds: ['1', '3'],
    brandNames: ['WEEKDAY', 'Monki'],
    lastActive: '2023-11-20T12:00:00Z',
    status: 'inactive'
  },

  // Brand Admins - have oversight of their brand's partner relationships
  {
    id: 'pu-010',
    name: 'Helena Svensson',
    email: 'helena.svensson@weekday.com',
    role: 'brand-admin',
    partnerId: '0', // Not a partner, internal user
    partnerName: 'WEEKDAY Brand Team',
    brandIds: ['1'],
    brandNames: ['WEEKDAY'],
    lastActive: '2024-01-15T16:00:00Z',
    status: 'active'
  },
  {
    id: 'pu-011',
    name: 'Isabella Garcia',
    email: 'isabella.garcia@cos.com',
    role: 'brand-admin',
    partnerId: '0',
    partnerName: 'COS Brand Team',
    brandIds: ['2'],
    brandNames: ['COS'],
    lastActive: '2024-01-15T15:30:00Z',
    status: 'active'
  },

  // System Admins - have access to all partner portals
  {
    id: 'pu-012',
    name: 'Jane Doe',
    email: 'jane.doe@hm.com',
    role: 'admin',
    partnerId: '0',
    partnerName: 'H&M Group Admin',
    brandIds: ['1', '2', '3', '4'],
    brandNames: ['WEEKDAY', 'COS', 'Monki', 'H&M'],
    lastActive: '2024-01-15T17:45:00Z',
    status: 'active'
  },
  {
    id: 'pu-013',
    name: 'Michael Anderson',
    email: 'michael.anderson@hm.com',
    role: 'admin',
    partnerId: '0',
    partnerName: 'H&M Group Admin',
    brandIds: ['1', '2', '3', '4'],
    brandNames: ['WEEKDAY', 'COS', 'Monki', 'H&M'],
    lastActive: '2024-01-15T09:20:00Z',
    status: 'active'
  }
];

export interface AccessScope {
  allBrands: boolean;
  brandIds: string[];
  allCountries: boolean;
  countryIds: string[];
  allStores: boolean;
  storeIds: string[];
  allPartners: boolean;
  partnerIds: string[];
  allWarehouses: boolean;
  warehouseIds: string[];
}

export interface PortalAccess {
  storeApp: boolean;
  partnerPortal: boolean;
}

export interface AdminAccessUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastActive?: string;
  portalAccess: PortalAccess;
  scope: AccessScope;
}

export interface PartnerAccessUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastActive?: string;
  partnerId: string;
  partnerName: string;
  scope: AccessScope;
}

export const defaultAccessScope = (): AccessScope => ({
  allBrands: true,
  brandIds: [],
  allCountries: true,
  countryIds: [],
  allStores: true,
  storeIds: [],
  allPartners: true,
  partnerIds: [],
  allWarehouses: true,
  warehouseIds: []
});

export const mockAdminAccessUsers: AdminAccessUser[] = [
  {
    id: 'au-001',
    name: 'Jane Doe',
    email: 'jane.doe@hm.com',
    status: 'active',
    lastActive: '2024-01-16T08:30:00Z',
    portalAccess: { storeApp: true, partnerPortal: true },
    scope: defaultAccessScope()
  },
  {
    id: 'au-002',
    name: 'H&M Brand Admin',
    email: 'hm.brand.admin@hm.com',
    status: 'active',
    lastActive: '2024-01-15T16:00:00Z',
    portalAccess: { storeApp: true, partnerPortal: true },
    scope: {
      allBrands: false,
      brandIds: ['4'], // H&M
      allCountries: true,
      countryIds: [],
      allStores: true,
      storeIds: [],
      allPartners: true,
      partnerIds: [],
      allWarehouses: true,
      warehouseIds: []
    }
  },
  {
    id: 'au-003',
    name: 'Partner Portal Admin',
    email: 'partner.portal.admin@hm.com',
    status: 'inactive',
    lastActive: '2023-12-20T10:00:00Z',
    portalAccess: { storeApp: false, partnerPortal: true },
    scope: {
      allBrands: false,
      brandIds: ['1', '2'],
      allCountries: true,
      countryIds: [],
      allStores: true,
      storeIds: [],
      allPartners: false,
      partnerIds: ['1'],
      allWarehouses: true,
      warehouseIds: []
    }
  }
];

export const mockPartnerAccessUsers: PartnerAccessUser[] = [
  {
    id: 'pau-001',
    name: 'Johan Persson',
    email: 'johan.persson@sellpy.com',
    status: 'active',
    lastActive: '2024-01-16T07:30:00Z',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    scope: {
      allBrands: true,
      brandIds: [],
      allCountries: true,
      countryIds: [],
      allStores: true,
      storeIds: [],
      allPartners: false,
      partnerIds: ['1'],
      allWarehouses: true,
      warehouseIds: []
    }
  },
  {
    id: 'pau-002',
    name: 'Linda Eriksson',
    email: 'linda.eriksson@sellpy.com',
    status: 'active',
    lastActive: '2024-01-15T11:00:00Z',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    scope: {
      allBrands: true,
      brandIds: [],
      allCountries: true,
      countryIds: [],
      allStores: true,
      storeIds: [],
      allPartners: false,
      partnerIds: ['1'],
      allWarehouses: true,
      warehouseIds: []
    }
  },
  {
    id: 'pau-003',
    name: 'Erik Hansen',
    email: 'erik.hansen@thrifted.no',
    status: 'inactive',
    lastActive: '2023-11-20T12:00:00Z',
    partnerId: '2',
    partnerName: 'Thrifted',
    scope: {
      allBrands: false,
      brandIds: ['1', '3'],
      allCountries: true,
      countryIds: [],
      allStores: true,
      storeIds: [],
      allPartners: false,
      partnerIds: ['2'],
      allWarehouses: true,
      warehouseIds: []
    }
  }
];

