import { Delivery, ReturnDelivery } from '../components/ShippingScreen';
import { Partner } from '../components/PartnerSelectionScreen';
import { ReturnItem, ReturnOrder } from '../components/ReturnManagementScreen';
import { Store, Country, Brand } from '../components/StoreSelector';
import { Partner as WarehousePartner, Warehouse } from '../components/PartnerWarehouseSelector';
import { ExtendedPartnerOrder, PartnerStats } from '../components/PartnerDashboard';
import { DeliveryNote } from '../components/BoxManagementScreen';
import { SellpyOrder } from '../components/ShippingScreen';
import { OrderItem } from '../components/OrderCreationScreen';
import { mockShowroomProducts, mockShowroomOrders, mockLineSheets } from '../components/ShowroomMockData';
import { QuotationRequest } from '../components/BuyerQuotationsScreen';
import { PurchaseOrder } from '../components/BuyerPurchaseOrdersScreen';
import { Shipment } from '../components/BuyerShipmentsScreen';
import { BuyerStats } from '../components/BuyerDashboard';
import { UserAccount } from '../components/AdminSettingsSheet';
import { ShowroomMessage } from '../components/ShowroomTypes';
import { SalesDataPoint } from '../components/PartnerSalesReport';
import { StockReportData } from '../components/PartnerStockReport';

// Deliveries mock data
export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    date: '2024-12-09',
    status: 'Pending',
    deliveryId: '122345678-3r890fhor8r4wrjf',
    orders: 1,
    items: 150,
    boxes: 4,
    sender: 'Thrifted',
    partnerId: '2',
    partnerName: 'Thrifted',
    warehouseId: '2',
    warehouseName: 'Thrifted Oslo Distribution'
  },
  {
    id: '2',
    date: '2024-12-09',
    status: 'In transit',
    deliveryId: '12345678-123456789653',
    orders: 2,
    items: 400,
    boxes: 10,
    sender: 'Sellpy',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    receivingStoreId: '1' // Drottninggatan 63 (default store)
  },
  {
    id: '3',
    date: '2024-12-08',
    status: 'Delivered',
    deliveryId: '87654321-abcdefgh12345',
    orders: 1,
    items: 75,
    boxes: 3,
    sender: 'Sellpy',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  }
];

// Partners mock data
export const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Sellpy',
    connectionStatus: 'connected',
    itemsToReturn: 15
  },
  {
    id: '2',
    name: 'Kinda Kinks',
    connectionStatus: 'connected',
    itemsToReturn: 0
  },
  {
    id: '3',
    name: 'Fashion Hub',
    connectionStatus: 'connected',
    itemsToReturn: 12
  },
  {
    id: '4',
    name: 'External Partner',
    connectionStatus: 'disconnected',
    itemsToReturn: 3
  }
];

// Return items mock data
export const mockReturnItems: ReturnItem[] = [
  {
    id: '1',
    itemId: 'ITM-12345',
    title: 'Vintage Denim Jacket',
    size: 'M',
    color: 'Blue',
    status: 'Expired B2B',
    partnerItemRef: 'SP-VDJ-001',
    selected: false,
    canExtend: true,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxMDcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    itemId: 'ITM-12346',
    title: 'Cotton Summer Dress',
    size: 'L',
    color: 'White',
    status: 'Rejected',
    partnerItemRef: 'SP-CSD-002',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    itemId: 'ITM-12347',
    title: 'Leather Boots',
    size: '39',
    color: 'Black',
    status: 'Expired B2B',
    partnerItemRef: 'SP-LB-003',
    selected: false,
    canExtend: true,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1652474590303-b4d72bf9f61a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTExODkzM3ww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    itemId: 'ITM-12348',
    title: 'Silk Scarf',
    color: 'Red',
    status: 'Rejected',
    partnerItemRef: 'SP-SS-004',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1633903422938-8291a4606408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWxrJTIwc2NhcmYlMjBhY2Nlc3Nvcnl8ZW58MXx8fHwxNzYxMDIyODExfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    itemId: 'ITM-12349',
    title: 'Wool Sweater',
    size: 'S',
    color: 'Gray',
    status: 'Expired B2B',
    partnerItemRef: 'SP-WS-005',
    selected: false,
    canExtend: true,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTEzNDA3MHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  // Demo items for Kinda Kinks partner - Weekday Sweden Drottninggatan
  {
    id: 'kk-1',
    itemId: 'KK-ITM-001',
    title: 'Vintage Denim Jacket',
    size: 'M',
    color: 'Blue',
    status: 'In store',
    partnerItemRef: 'KK-VDJ-001',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxMDcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxMDcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'kk-2',
    itemId: 'KK-ITM-002',
    title: 'Leather Boots',
    size: '39',
    color: 'Black',
    status: 'Broken',
    partnerItemRef: 'KK-LB-002',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1652474590303-b4d72bf9f61a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTExODkzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1652474590303-b4d72bf9f61a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTExODkzM3ww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'kk-3',
    itemId: 'KK-ITM-003',
    title: 'Cotton Summer Dress',
    size: 'L',
    color: 'White',
    status: 'Rejected',
    partnerItemRef: 'KK-CSD-003',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'kk-4',
    itemId: 'KK-ITM-004',
    title: 'Wool Sweater',
    size: 'S',
    color: 'Gray',
    status: 'In transit',
    partnerItemRef: 'KK-WS-004',
    selected: false,
    canExtend: false,
    scanned: false,
    image: 'https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTEzNDA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail: 'https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTEzNDA3MHww&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

// Export mock showroom data
export { mockShowroomProducts, mockShowroomOrders, mockLineSheets };

// User account mock data
export const mockUserAccount: UserAccount = {
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane.doe@weekday.com',
  userId: 'AA123456',
  role: {
    id: 'admin',
    name: 'Admin',
    permissions: ['view_items', 'manage_returns', 'access_reports', 'admin_access', 'portal_configuration']
  }
};

// Showroom messages mock data
export const mockShowroomMessages: Record<string, ShowroomMessage[]> = {
  'RFQ-2024-001': [
    {
      id: 'msg-1',
      threadId: 'RFQ-2024-001',
      author: 'Sarah Chen',
      authorRole: 'buyer',
      body: 'Hello! I\'m interested in these items for our Spring collection. Can you offer a better price for a bulk order of 500+ units?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-2',
      threadId: 'RFQ-2024-001',
      author: 'Partner Support',
      authorRole: 'partner',
      body: 'Thank you for your interest! For orders over 500 units, we can offer a 15% discount. Would you like us to prepare a formal quotation?',
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-3',
      threadId: 'RFQ-2024-001',
      author: 'Sarah Chen',
      authorRole: 'buyer',
      body: 'That sounds great! Yes, please send a formal quote. Also, what are the lead times for this quantity?',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  'RFQ-2024-002': [
    {
      id: 'msg-4',
      threadId: 'RFQ-2024-002',
      author: 'Michael Roberts',
      authorRole: 'buyer',
      body: 'Can you customize the colors for these items? We need them in our brand colors.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Brands, Countries, and Stores mock data
export const mockBrands: Brand[] = [
  { id: '1', name: 'WEEKDAY' },
  { id: '2', name: 'COS' },
  { id: '3', name: 'Monki' },
  { id: '4', name: 'H&M' }
];

export const mockCountries: Country[] = [
  // WEEKDAY countries
  { id: '1', name: 'Sweden', brandId: '1' },
  { id: '2', name: 'Denmark', brandId: '1' },
  { id: '3', name: 'Norway', brandId: '1' },
  { id: '4', name: 'Finland', brandId: '1' },
  { id: '5', name: 'Netherlands', brandId: '1' },
  { id: '6', name: 'Belgium', brandId: '1' },
  { id: '7', name: 'Austria', brandId: '1' },
  { id: '8', name: 'Switzerland', brandId: '1' },
  // COS countries
  { id: '9', name: 'Spain', brandId: '2' },
  { id: '10', name: 'France', brandId: '2' },
  { id: '11', name: 'Italy', brandId: '2' },
  { id: '12', name: 'Portugal', brandId: '2' },
  { id: '13', name: 'United Kingdom', brandId: '2' },
  { id: '14', name: 'Ireland', brandId: '2' },
  { id: '15', name: 'Germany', brandId: '2' },
  { id: '16', name: 'Poland', brandId: '2' },
  { id: '17', name: 'Czech Republic', brandId: '2' },
  // Monki countries
  { id: '18', name: 'Sweden', brandId: '3' },
  { id: '19', name: 'Denmark', brandId: '3' },
  { id: '20', name: 'Norway', brandId: '3' },
  { id: '21', name: 'Finland', brandId: '3' },
  { id: '22', name: 'Germany', brandId: '3' },
  { id: '23', name: 'Netherlands', brandId: '3' },
  { id: '24', name: 'Belgium', brandId: '3' },
  { id: '25', name: 'France', brandId: '3' },
  { id: '26', name: 'Spain', brandId: '3' },
  { id: '27', name: 'Italy', brandId: '3' },
  // H&M countries
  { id: '28', name: 'Germany', brandId: '4' },
  { id: '29', name: 'United States', brandId: '4' },
  { id: '30', name: 'Canada', brandId: '4' },
  { id: '31', name: 'United Kingdom', brandId: '4' },
  { id: '32', name: 'France', brandId: '4' },
  { id: '33', name: 'Spain', brandId: '4' },
  { id: '34', name: 'Italy', brandId: '4' },
  { id: '35', name: 'Netherlands', brandId: '4' },
  { id: '36', name: 'Sweden', brandId: '4' },
  { id: '37', name: 'Norway', brandId: '4' },
  { id: '38', name: 'Denmark', brandId: '4' },
  { id: '39', name: 'Finland', brandId: '4' },
  { id: '40', name: 'Poland', brandId: '4' },
  { id: '41', name: 'Russia', brandId: '4' },
  { id: '42', name: 'Japan', brandId: '4' },
  { id: '43', name: 'South Korea', brandId: '4' },
  { id: '44', name: 'China', brandId: '4' },
  { id: '45', name: 'Australia', brandId: '4' },
  { id: '46', name: 'Mexico', brandId: '4' },
  { id: '47', name: 'Brazil', brandId: '4' }
];

export const mockStores: Store[] = [
  // WEEKDAY stores
  { id: '1', name: 'Drottninggatan 63', code: 'SE0655', countryId: '1', brandId: '1' },
  { id: '2', name: 'Södermalm Store', code: 'SE0656', countryId: '1', brandId: '1' },
  { id: '3', name: 'Copenhagen Central', code: 'DK0123', countryId: '2', brandId: '1' },
  { id: '4', name: 'Oslo Main Street', code: 'NO0789', countryId: '3', brandId: '1' },
  { id: '5', name: 'Helsinki Center', code: 'FI0001', countryId: '4', brandId: '1' },
  { id: '6', name: 'Amsterdam Kalverstraat', code: 'NL0001', countryId: '5', brandId: '1' },
  { id: '7', name: 'Brussels Grand Place', code: 'BE0001', countryId: '6', brandId: '1' },
  { id: '8', name: 'Vienna Mariahilfer', code: 'AT0001', countryId: '7', brandId: '1' },
  { id: '9', name: 'Zurich Bahnhofstrasse', code: 'CH0001', countryId: '8', brandId: '1' },
  // COS stores
  { id: '10', name: 'Barcelona Passeig', code: 'ES0001', countryId: '9', brandId: '2' },
  { id: '11', name: 'Madrid Centro', code: 'ES0002', countryId: '9', brandId: '2' },
  { id: '12', name: 'Paris Marais', code: 'FR0001', countryId: '10', brandId: '2' },
  { id: '13', name: 'Milan Quadrilatero', code: 'IT0001', countryId: '11', brandId: '2' },
  { id: '14', name: 'Lisbon Chiado', code: 'PT0001', countryId: '12', brandId: '2' },
  { id: '15', name: 'London Regent Street', code: 'UK0001', countryId: '13', brandId: '2' },
  { id: '16', name: 'Dublin Grafton Street', code: 'IE0001', countryId: '14', brandId: '2' },
  { id: '17', name: 'Berlin Mitte', code: 'DE0001', countryId: '15', brandId: '2' },
  { id: '18', name: 'Warsaw Złote Tarasy', code: 'PL0001', countryId: '16', brandId: '2' },
  { id: '19', name: 'Prague Wenceslas Square', code: 'CZ0001', countryId: '17', brandId: '2' },
  // Monki stores
  { id: '20', name: 'Stockholm Östermalm', code: 'SE0333', countryId: '18', brandId: '3' },
  { id: '21', name: 'Copenhagen Strøget', code: 'DK0456', countryId: '19', brandId: '3' },
  { id: '22', name: 'Oslo Karl Johans gate', code: 'NO0456', countryId: '20', brandId: '3' },
  { id: '23', name: 'Helsinki Aleksanterinkatu', code: 'FI0002', countryId: '21', brandId: '3' },
  { id: '24', name: 'Berlin Hackescher Markt', code: 'DE0002', countryId: '22', brandId: '3' },
  { id: '25', name: 'Amsterdam Nieuwendijk', code: 'NL0002', countryId: '23', brandId: '3' },
  { id: '26', name: 'Brussels Rue Neuve', code: 'BE0002', countryId: '24', brandId: '3' },
  { id: '27', name: 'Paris Châtelet', code: 'FR0002', countryId: '25', brandId: '3' },
  { id: '28', name: 'Barcelona Portal de l\'Àngel', code: 'ES0003', countryId: '26', brandId: '3' },
  { id: '29', name: 'Milan Corso Buenos Aires', code: 'IT0002', countryId: '27', brandId: '3' },
  // H&M stores
  { id: '30', name: 'Berlin Alexanderplatz', code: 'DE0003', countryId: '28', brandId: '4' },
  { id: '31', name: 'New York Fifth Avenue', code: 'US0001', countryId: '29', brandId: '4' },
  { id: '32', name: 'Toronto Eaton Centre', code: 'CA0001', countryId: '30', brandId: '4' },
  { id: '33', name: 'London Oxford Street', code: 'UK0002', countryId: '31', brandId: '4' },
  { id: '34', name: 'Paris Champs-Élysées', code: 'FR0003', countryId: '32', brandId: '4' },
  { id: '35', name: 'Madrid Gran Vía', code: 'ES0004', countryId: '33', brandId: '4' },
  { id: '36', name: 'Rome Via del Corso', code: 'IT0003', countryId: '34', brandId: '4' },
  { id: '37', name: 'Amsterdam Dam Square', code: 'NL0003', countryId: '35', brandId: '4' },
  { id: '38', name: 'Stockholm Sergels Torg', code: 'SE0777', countryId: '36', brandId: '4' },
  { id: '39', name: 'Oslo Stortorvet', code: 'NO0777', countryId: '37', brandId: '4' },
  { id: '40', name: 'Copenhagen Amagertorv', code: 'DK0777', countryId: '38', brandId: '4' },
  { id: '41', name: 'Helsinki Kamppi', code: 'FI0003', countryId: '39', brandId: '4' },
  { id: '42', name: 'Warsaw Marszałkowska', code: 'PL0002', countryId: '40', brandId: '4' },
  { id: '43', name: 'Moscow Red Square', code: 'RU0001', countryId: '41', brandId: '4' },
  { id: '44', name: 'Tokyo Shibuya', code: 'JP0001', countryId: '42', brandId: '4' },
  { id: '45', name: 'Seoul Myeongdong', code: 'KR0001', countryId: '43', brandId: '4' },
  { id: '46', name: 'Shanghai Nanjing Road', code: 'CN0001', countryId: '44', brandId: '4' },
  { id: '47', name: 'Sydney Pitt Street', code: 'AU0001', countryId: '45', brandId: '4' },
  { id: '48', name: 'Mexico City Polanco', code: 'MX0001', countryId: '46', brandId: '4' },
  { id: '49', name: 'São Paulo Rua Augusta', code: 'BR0001', countryId: '47', brandId: '4' }
];

// Partner and warehouse data
export const mockWarehousePartners: WarehousePartner[] = [
  { id: '1', name: 'Sellpy Operations', code: 'SELLPY', productType: 'resale' },
  { id: '2', name: 'Thrifted', code: 'THRIFT', productType: 'resale' },
  { id: '6', name: 'Shenzhen Fashion Manufacturing', code: 'SFM', productType: 'white-label' }
];

export const mockWarehouses: Warehouse[] = [
  { id: '1', name: 'Stockholm Central Warehouse', code: 'SE-WH-001', location: 'Stockholm, Sweden', partnerId: '1' },
  { id: '2', name: 'Thrifted Oslo Distribution', code: 'NO-WH-001', location: 'Oslo, Norway', partnerId: '2' },
  { id: '3', name: 'Thrifted Copenhagen Hub', code: 'DK-WH-001', location: 'Copenhagen, Denmark', partnerId: '2' },
  { id: '13', name: 'Shenzhen Production Facility', code: 'SPF-001', location: 'Shenzhen, China', partnerId: '6' },
  { id: '14', name: 'Guangzhou Distribution Hub', code: 'GDH-002', location: 'Guangzhou, China', partnerId: '6' },
  { id: '15', name: 'Hong Kong Quality Control Center', code: 'HQC-003', location: 'Hong Kong, China', partnerId: '6' }
];

export const mockPartnerStats: PartnerStats = {
  pendingOrders: 8,
  registeredOrders: 12,
  inTransitDeliveries: 5,
  totalItemsThisMonth: 1247,
  inReviewOrders: 3
};

// Buyer quotations mock data
export const mockBuyerQuotations: QuotationRequest[] = [
  {
    id: 'QR-2024-001',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'negotiation',
    createdDate: '2024-11-28T10:30:00Z',
    responseDate: '2024-12-01T14:20:00Z',
    items: [
      {
        productId: 'WL-KNIT-001',
        productName: 'Merino Wool Blend Sweater',
        sku: 'SFM-KNT-MW-001',
        quantity: 500,
        specifications: 'Material: 70% Merino wool, 30% polyester blend. Colors: Navy, Charcoal, Cream. Size range: XS-XL. Weight: 280gsm.',
        imageUrl: 'https://images.unsplash.com/photo-1671461572819-0b426daa30eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGtuaXR3ZWFyfGVufDF8fHx8MTc2MjI2ODI3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'XS', quantity: 50 },
          { size: 'S', quantity: 100 },
          { size: 'M', quantity: 150 },
          { size: 'L', quantity: 150 },
          { size: 'XL', quantity: 50 }
        ]
      },
      {
        productId: 'WL-KNIT-002',
        productName: 'Cotton Cable Knit Cardigan',
        sku: 'SFM-KNT-CC-002',
        quantity: 300,
        specifications: 'Material: 100% organic cotton. Colors: Beige, Forest Green. Buttons: Horn buttons. Size range: S-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1633438584121-ec60a7d453d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaWdhbiUyMGtuaXR8ZW58MXx8fHwxNzYyMjY4Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'S', quantity: 60 },
          { size: 'M', quantity: 90 },
          { size: 'L', quantity: 90 },
          { size: 'XL', quantity: 60 }
        ]
      }
    ],
    message: 'Requesting quotation for winter knitwear collection. Please provide pricing for MOQ and bulk discount tiers.',
    quotedPrice: 28500,
    leadTime: 45,
    validUntil: '2024-12-15T23:59:59Z',
    messages: [
      {
        id: 'msg-001-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'Hi, I\'d like to request a quotation for our winter knitwear collection. We need competitive pricing as this is for multiple store locations across Europe.',
        createdAt: '2024-11-28T10:30:00Z'
      },
      {
        id: 'msg-001-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Thank you for your inquiry! We can definitely help with your winter collection. I\'ve reviewed your specifications and prepared a comprehensive quotation. The quoted price includes:\n\n- Premium Merino wool blend material\n- 3 color variations with consistent dyeing\n- Full size run packaging\n- Quality inspection before shipment\n\nWe can offer a 5% discount if you increase the order to 1000+ units total.',
        createdAt: '2024-12-01T14:20:00Z'
      },
      {
        id: 'msg-001-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Thank you for the detailed quote. The pricing looks competitive. Can you confirm if the lead time includes shipping to Sweden?',
        createdAt: '2024-12-02T09:15:00Z'
      },
      {
        id: 'msg-001-4',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'The 45-day lead time covers production only. Shipping to Sweden typically takes an additional 20-25 days by sea freight, or 5-7 days by air freight. We can arrange either option based on your preference.',
        createdAt: '2024-12-02T16:40:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-002',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'pending',
    createdDate: '2024-12-03T08:45:00Z',
    items: [
      {
        productId: 'WL-DENIM-001',
        productName: 'Slim Fit Stretch Jeans',
        sku: 'SFM-DNM-SF-001',
        quantity: 800,
        specifications: 'Material: 98% cotton, 2% elastane. Colors: Dark Indigo, Black, Light Wash. 5-pocket design. YKK zipper. Size range: 28-38 waist.',
        imageUrl: 'https://images.unsplash.com/photo-1655362258669-e230aacbd21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwc2xpbXxlbnwxfHx8fDE3NjIyNjgyNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: '28', quantity: 80 },
          { size: '30', quantity: 120 },
          { size: '32', quantity: 160 },
          { size: '34', quantity: 160 },
          { size: '36', quantity: 160 },
          { size: '38', quantity: 120 }
        ]
      },
      {
        productId: 'WL-DENIM-002',
        productName: 'Wide Leg Denim Trousers',
        sku: 'SFM-DNM-WL-002',
        quantity: 400,
        specifications: 'Material: 100% organic cotton denim. Colors: Ecru, Mid Blue. High-waisted design. Size range: 25-34 waist.',
        imageUrl: 'https://images.unsplash.com/photo-1750857739910-81dda820b067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWRlJTIwbGVnJTIwdHJvdXNlcnN8ZW58MXx8fHwxNzYyMTc3NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: '25', quantity: 60 },
          { size: '27', quantity: 80 },
          { size: '29', quantity: 100 },
          { size: '31', quantity: 100 },
          { size: '33', quantity: 60 }
        ]
      }
    ],
    message: 'Looking for premium denim products for Spring 2025 collection. Need samples before final order confirmation.',
    messages: [
      {
        id: 'msg-002-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re planning our Spring 2025 denim collection and would like to explore your denim manufacturing capabilities. Can you provide quotations for the attached specifications?\n\nAlso, is it possible to send samples of similar products before we finalize the order?',
        createdAt: '2024-12-03T08:45:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-003',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'accepted',
    createdDate: '2024-11-15T11:20:00Z',
    responseDate: '2024-11-18T15:30:00Z',
    items: [
      {
        productId: 'WL-TSHIRT-001',
        productName: 'Organic Cotton Basic T-Shirt',
        sku: 'SFM-TSH-OC-001',
        quantity: 2000,
        specifications: 'Material: 100% GOTS certified organic cotton, 180gsm. Colors: White, Black, Grey Melange, Navy. Crew neck. Regular fit. Size range: XS-XXL.',
        imageUrl: 'https://images.unsplash.com/photo-1759572095317-3a96f9a98e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNpYyUyMGNvdHRvbiUyMHRzaGlydHxlbnwxfHx8fDE3NjIyNjgyNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'XS', quantity: 200 },
          { size: 'S', quantity: 400 },
          { size: 'M', quantity: 600 },
          { size: 'L', quantity: 500 },
          { size: 'XL', quantity: 250 },
          { size: 'XXL', quantity: 50 }
        ]
      }
    ],
    message: 'Bulk order for basic organic cotton t-shirts. GOTS certification required.',
    quotedPrice: 8600,
    leadTime: 30,
    validUntil: '2024-11-30T23:59:59Z',
    messages: [
      {
        id: 'msg-003-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We need to restock our basic t-shirt range. Looking for GOTS certified organic cotton with competitive pricing for a large volume order.',
        createdAt: '2024-11-15T11:20:00Z'
      },
      {
        id: 'msg-003-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Perfect timing! We just completed GOTS certification renewal for our organic cotton line. For 2000 units, we can offer $4.30 per unit including all certifications and quality inspection.\n\nCertificate copies and fabric samples can be sent via courier within 3 business days.',
        createdAt: '2024-11-18T15:30:00Z'
      },
      {
        id: 'msg-003-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Excellent! The pricing works for our budget. Please proceed with the order. I\'ll send the official PO shortly.',
        createdAt: '2024-11-19T09:00:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-004',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'negotiation',
    createdDate: '2024-11-25T14:00:00Z',
    responseDate: '2024-11-29T10:15:00Z',
    items: [
      {
        productId: 'WL-JACKET-001',
        productName: 'Recycled Polyester Puffer Jacket',
        sku: 'SFM-JKT-RP-001',
        quantity: 600,
        specifications: 'Material: 100% recycled polyester shell with GRS certification. Fill: 80/20 duck down. Colors: Black, Khaki, Burgundy. Water-resistant coating. Size range: S-XXL.',
        imageUrl: 'https://images.unsplash.com/photo-1611025504703-8c143abe6996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWZmZXIlMjBqYWNrZXQlMjB3aW50ZXJ8ZW58MXx8fHwxNzYyMjY4Mjc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'S', quantity: 100 },
          { size: 'M', quantity: 150 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 100 },
          { size: 'XXL', quantity: 50 }
        ]
      },
      {
        productId: 'WL-JACKET-002',
        productName: 'Wool Blend Overshirt',
        sku: 'SFM-JKT-WO-002',
        quantity: 400,
        specifications: 'Material: 60% wool, 40% polyester. Colors: Camel, Charcoal. Patch pockets. Button closure. Size range: S-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1702628907361-818e77fc05c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwb3ZlcnNoaXJ0fGVufDF8fHx8MTc2MjI2ODI3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'S', quantity: 80 },
          { size: 'M', quantity: 120 },
          { size: 'L', quantity: 120 },
          { size: 'XL', quantity: 80 }
        ]
      }
    ],
    message: 'Winter outerwear collection - need sustainable materials with proper certifications.',
    quotedPrice: 42800,
    leadTime: 60,
    validUntil: '2024-12-10T23:59:59Z',
    messages: [
      {
        id: 'msg-004-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re focusing on sustainable outerwear for our winter collection. All materials must have proper environmental certifications (GRS for recycled polyester).',
        createdAt: '2024-11-25T14:00:00Z'
      },
      {
        id: 'msg-004-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We specialize in sustainable outerwear! Our recycled polyester is GRS certified and the down filling meets RDS standards. \n\nQuotation breakdown:\n- Puffer jackets: $58/unit (600 units)\n- Wool overshirts: $48/unit (400 units)\n- Total: $42,800\n\nPrice includes all certifications and third-party quality inspection.',
        createdAt: '2024-11-29T10:15:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-005',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'pending',
    createdDate: '2024-12-04T16:30:00Z',
    items: [
      {
        productId: 'WL-DRESS-001',
        productName: 'Linen Midi Dress',
        sku: 'SFM-DRS-LN-001',
        quantity: 350,
        specifications: 'Material: 100% European linen. Colors: Natural, Sage Green, Terracotta. A-line silhouette. Side zipper. Size range: XS-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1564139676155-afc1bb95745c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW5lbiUyMGRyZXNzJTIwbWlkaXxlbnwxfHx8fDE3NjIyNjgyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'XS', quantity: 50 },
          { size: 'S', quantity: 80 },
          { size: 'M', quantity: 100 },
          { size: 'L', quantity: 80 },
          { size: 'XL', quantity: 40 }
        ]
      }
    ],
    message: 'Summer collection - testing new supplier for linen products.',
    messages: [
      {
        id: 'msg-005-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re exploring linen products for our Summer 2025 collection. This would be our first order of linen garments from your facility. Do you have experience with European linen processing?',
        createdAt: '2024-12-04T16:30:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-006',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'declined',
    createdDate: '2024-11-10T09:00:00Z',
    responseDate: '2024-11-14T13:45:00Z',
    items: [
      {
        productId: 'WL-PANTS-001',
        productName: 'Tailored Wool Trousers',
        sku: 'SFM-PNT-WT-001',
        quantity: 300,
        specifications: 'Material: 100% virgin wool. Colors: Navy, Charcoal, Camel. Pleated front. Zip fly. Size range: 28-38 waist.',
        imageUrl: 'https://images.unsplash.com/photo-1738520420640-5818ce094b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwdHJvdXNlcnMlMjBmb3JtYWx8ZW58MXx8fHwxNzYyMjY4Mjc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: '28', quantity: 30 },
          { size: '30', quantity: 50 },
          { size: '32', quantity: 70 },
          { size: '34', quantity: 70 },
          { size: '36', quantity: 50 },
          { size: '38', quantity: 30 }
        ]
      }
    ],
    message: 'Formal trousers for workwear collection.',
    quotedPrice: 15600,
    leadTime: 50,
    validUntil: '2024-11-25T23:59:59Z',
    messages: [
      {
        id: 'msg-006-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'Looking for tailored wool trousers for our workwear collection. Quality and finishing are critical.',
        createdAt: '2024-11-10T09:00:00Z'
      },
      {
        id: 'msg-006-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We can produce these trousers with Italian virgin wool. Price is $52/unit for 300 pieces, lead time 50 days. Premium finishing included.',
        createdAt: '2024-11-14T13:45:00Z'
      },
      {
        id: 'msg-006-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Thank you for the quote, but the pricing is above our budget for this category. We\'ll explore other options for now.',
        createdAt: '2024-11-16T10:20:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-010',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'declined',
    createdDate: '2024-10-28T11:15:00Z',
    responseDate: '2024-11-02T09:30:00Z',
    items: [
      {
        productId: 'WL-BLAZER-001',
        productName: 'Structured Linen Blazer',
        sku: 'SFM-BLZ-LN-001',
        quantity: 400,
        specifications: 'Material: 100% European linen. Colors: Natural, Navy, Charcoal. Fully lined. Notch lapel. Two-button closure. Size range: 34-44.',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW5lbiUyMGJsYXplciUyMG1lbnxlbnwxfHx8fDE3NjIyNjgyODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: '34', quantity: 40 },
          { size: '36', quantity: 60 },
          { size: '38', quantity: 80 },
          { size: '40', quantity: 100 },
          { size: '42', quantity: 80 },
          { size: '44', quantity: 40 }
        ]
      }
    ],
    message: 'Summer tailoring capsule collection - need European linen expertise.',
    quotedPrice: 32400,
    leadTime: 65,
    validUntil: '2024-11-15T23:59:59Z',
    messages: [
      {
        id: 'msg-010-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re launching a summer tailoring line and need blazers made from European linen. Do you have experience working with this material? Construction quality is paramount.',
        createdAt: '2024-10-28T11:15:00Z'
      },
      {
        id: 'msg-010-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We can produce linen blazers, though we typically work with Chinese linen rather than European sourcing. For European linen specifically, we would need to import the fabric which adds 2-3 weeks to lead time.\\n\\nQuotation: $81/unit for 400 pieces\\nLead time: 65 days (includes fabric sourcing)\\n\\nFull canvas construction with premium finishing.',
        createdAt: '2024-11-02T09:30:00Z'
      },
      {
        id: 'msg-010-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Thank you for the detailed response. Unfortunately, the extended lead time doesn\'t work with our launch schedule, and we\'ve found a European supplier who can deliver faster with local linen sourcing. We\'ll pass on this one.',
        createdAt: '2024-11-05T14:45:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-011',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'declined',
    createdDate: '2024-10-15T08:20:00Z',
    responseDate: '2024-10-19T16:50:00Z',
    items: [
      {
        productId: 'WL-SWIMWEAR-001',
        productName: 'One-Piece Swimsuit',
        sku: 'SFM-SWM-OP-001',
        quantity: 600,
        specifications: 'Material: 82% recycled polyamide, 18% elastane. Colors: Black, Navy, Forest Green, Terracotta. UPF 50+ protection. Shelf bra with removable pads. Size range: XS-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmUlMjBwaWVjZSUyMHN3aW1zdWl0fGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 150 },
          { size: 'M', quantity: 180 },
          { size: 'L', quantity: 140 },
          { size: 'XL', quantity: 50 }
        ]
      },
      {
        productId: 'WL-SWIMWEAR-002',
        productName: 'Swim Shorts',
        sku: 'SFM-SWM-SH-002',
        quantity: 500,
        specifications: 'Material: 100% recycled polyester. Colors: Navy, Coral, Mint, Black. Quick-dry fabric. Elastic waistband with drawstring. Mesh lining. Size range: S-XXL.',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltJTIwc2hvcnRzJTIwbWVufGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: 'S', quantity: 80 },
          { size: 'M', quantity: 150 },
          { size: 'L', quantity: 150 },
          { size: 'XL', quantity: 80 },
          { size: 'XXL', quantity: 40 }
        ]
      }
    ],
    message: 'Sustainable swimwear collection for Summer 2025. Must meet strict fit and quality standards.',
    quotedPrice: 18500,
    leadTime: 55,
    validUntil: '2024-11-01T23:59:59Z',
    messages: [
      {
        id: 'msg-011-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re developing a sustainable swimwear line for next summer. The fit is extremely important - we need precise sizing and grading. Can you provide fit samples in all sizes before production?',
        createdAt: '2024-10-15T08:20:00Z'
      },
      {
        id: 'msg-011-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We produce swimwear with recycled materials and can meet your sustainability requirements. However, our standard process includes fit samples in 2 sizes (S and L) only. Full size run samples would require additional setup.\\n\\nPricing:\\n- One-piece suits: $24/unit (600 units)\\n- Swim shorts: $13/unit (500 units)\\n- Total: $18,500\\n\\nFull size samples available for additional $800 fee.',
        createdAt: '2024-10-19T16:50:00Z'
      },
      {
        id: 'msg-011-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'We appreciate the quote. Unfortunately, we\'ve had fit issues with swimwear in the past and really need to validate all sizes before committing. We\'ve decided to work with a specialist swimwear manufacturer who includes full size sampling in their process. Thank you anyway!',
        createdAt: '2024-10-22T10:15:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-012',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'declined',
    createdDate: '2024-09-30T13:40:00Z',
    responseDate: '2024-10-05T11:20:00Z',
    items: [
      {
        productId: 'WL-COAT-001',
        productName: 'Double-Breasted Wool Coat',
        sku: 'SFM-COT-WL-001',
        quantity: 250,
        specifications: 'Material: 80% virgin wool, 20% polyamide. Colors: Camel, Navy, Black. Full lining. Peak lapel. Six-button closure. Welt pockets. Size range: 34-44.',
        imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwY29hdCUyMGRvdWJsZSUyMGJyZWFzdGVkfGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: '34', quantity: 25 },
          { size: '36', quantity: 40 },
          { size: '38', quantity: 50 },
          { size: '40', quantity: 60 },
          { size: '42', quantity: 50 },
          { size: '44', quantity: 25 }
        ]
      }
    ],
    message: 'Heritage-style outerwear - premium construction required with hand-finished details.',
    quotedPrice: 31250,
    leadTime: 70,
    validUntil: '2024-10-20T23:59:59Z',
    messages: [
      {
        id: 'msg-012-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re creating a heritage outerwear collection with premium wool coats. We need hand-finished buttonholes, hand-sewn linings, and traditional tailoring techniques. Is this within your capabilities?',
        createdAt: '2024-09-30T13:40:00Z'
      },
      {
        id: 'msg-012-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We appreciate your inquiry. While we can produce high-quality wool coats, our facility specializes in industrial production methods rather than artisanal hand-finishing. For 250 units with your specifications:\\n\\nPrice: $125/unit\\nLead time: 70 days\\n\\nWe use machine buttonholes and standard construction. For hand-finishing at this price point, you may want to consider a smaller atelier-style manufacturer.',
        createdAt: '2024-10-05T11:20:00Z'
      },
      {
        id: 'msg-012-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Thanks for your honesty. You\'re right that we need a more specialized manufacturer for this project. The hand-finished details are essential to our brand positioning. We\'ll look for an atelier partner instead.',
        createdAt: '2024-10-07T09:35:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-013',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'declined',
    createdDate: '2024-09-18T10:05:00Z',
    responseDate: '2024-09-22T15:15:00Z',
    items: [
      {
        productId: 'WL-SKIRT-001',
        productName: 'Pleated Midi Skirt',
        sku: 'SFM-SKT-PM-001',
        quantity: 450,
        specifications: 'Material: 100% polyester crepe. Colors: Black, Navy, Burgundy, Forest Green. High-waisted. Accordion pleats. Side zip. Fully lined. Size range: XS-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGVhdGVkJTIwc2tpcnQlMjBtaWRpfGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: 'XS', quantity: 60 },
          { size: 'S', quantity: 110 },
          { size: 'M', quantity: 140 },
          { size: 'L', quantity: 100 },
          { size: 'XL', quantity: 40 }
        ]
      }
    ],
    message: 'Workwear collection - need sharp, permanent pleats that hold through multiple washes.',
    quotedPrice: 11700,
    leadTime: 45,
    validUntil: '2024-10-05T23:59:59Z',
    messages: [
      {
        id: 'msg-013-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We need pleated midi skirts for our professional workwear line. The pleats must be heat-set and permanent - they need to maintain their shape through at least 30 wash cycles. Can you guarantee this?',
        createdAt: '2024-09-18T10:05:00Z'
      },
      {
        id: 'msg-013-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We can produce pleated skirts with heat-setting, though our standard process guarantees pleat retention for approximately 15-20 washes with proper care (gentle cycle, hang dry). For 30+ washes, you would need premium pleat-setting which we currently don\'t offer.\\n\\nStandard pricing: $26/unit for 450 pieces\\nLead time: 45 days',
        createdAt: '2024-09-22T15:15:00Z'
      },
      {
        id: 'msg-013-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Thanks for clarifying. Our quality standards require the 30-wash guarantee as these are investment pieces for our customers. We\'ll need to find a manufacturer with advanced pleating capabilities.',
        createdAt: '2024-09-25T11:50:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-007',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'negotiation',
    createdDate: '2024-12-01T13:15:00Z',
    responseDate: '2024-12-03T16:00:00Z',
    items: [
      {
        productId: 'WL-SHIRT-001',
        productName: 'Oxford Button-Down Shirt',
        sku: 'SFM-SHT-OX-001',
        quantity: 700,
        specifications: 'Material: 100% cotton Oxford weave. Colors: White, Light Blue, Pink. Button-down collar. Chest pocket. Size range: S-XXL.',
        imageUrl: 'https://images.unsplash.com/photo-1760545183001-af3b64500b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxveGZvcmQlMjBzaGlydCUyMGJ1dHRvbnxlbnwxfHx8fDE3NjIyNjgyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'S', quantity: 100 },
          { size: 'M', quantity: 200 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 150 },
          { size: 'XXL', quantity: 50 }
        ]
      },
      {
        productId: 'WL-SHIRT-002',
        productName: 'Linen Blend Camp Collar Shirt',
        sku: 'SFM-SHT-LC-002',
        quantity: 450,
        specifications: 'Material: 55% linen, 45% cotton. Colors: Ecru, Sky Blue, Olive. Camp collar. Short sleeve. Size range: S-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1668959843026-1a3af00607ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW5lbiUyMGNhbXAlMjBzaGlydHxlbnwxfHx8fDE3NjIyNjgyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        sizeBreakdown: [
          { size: 'S', quantity: 90 },
          { size: 'M', quantity: 140 },
          { size: 'L', quantity: 140 },
          { size: 'XL', quantity: 80 }
        ]
      }
    ],
    message: 'Spring/Summer shirt collection - need fast turnaround.',
    quotedPrice: 19850,
    leadTime: 35,
    validUntil: '2024-12-17T23:59:59Z',
    messages: [
      {
        id: 'msg-007-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We need to replenish our shirt inventory quickly for the spring season. Can you accommodate a shorter lead time than usual?',
        createdAt: '2024-12-01T13:15:00Z'
      },
      {
        id: 'msg-007-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Yes, we can prioritize your order! We have the Oxford fabric in stock and can source the linen blend within a week. \n\nPricing:\n- Oxford shirts: $22/unit (700 units)\n- Linen camp collar: $26/unit (450 units)\n- Express production: 35 days\n\nWe\'ll waive the rush fee due to our existing partnership.',
        createdAt: '2024-12-03T16:00:00Z'
      },
      {
        id: 'msg-007-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'Excellent! Very competitive pricing. One question - can we add pink gingham as a 4th color option for the Oxford shirts? It performed well in our last season.',
        createdAt: '2024-12-04T10:25:00Z'
      },
      {
        id: 'msg-007-4',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Pink gingham is definitely possible! We can add it as an additional color at the same unit price. How many units would you like in gingham vs the solid colors?',
        createdAt: '2024-12-04T15:50:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-008',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'negotiation',
    createdDate: '2024-11-22T09:30:00Z',
    responseDate: '2024-11-26T11:45:00Z',
    items: [
      {
        productId: 'WL-ACTIVEWEAR-001',
        productName: 'Performance Leggings',
        sku: 'SFM-ACT-PL-001',
        quantity: 1000,
        specifications: 'Material: 78% polyester, 22% spandex with moisture-wicking technology. Colors: Black, Navy, Burgundy, Forest Green. High-waisted with phone pocket. Size range: XS-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdnaW5ncyUyMGFjdGl2ZXdlYXJ8ZW58MXx8fHwxNzYyMjY4Mjc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: 'XS', quantity: 100 },
          { size: 'S', quantity: 250 },
          { size: 'M', quantity: 350 },
          { size: 'L', quantity: 250 },
          { size: 'XL', quantity: 50 }
        ]
      },
      {
        productId: 'WL-ACTIVEWEAR-002',
        productName: 'Sports Bra',
        sku: 'SFM-ACT-SB-002',
        quantity: 800,
        specifications: 'Material: 85% nylon, 15% spandex with removable padding. Colors: Black, Navy, Burgundy, Forest Green. Medium support. Size range: XS-XL.',
        imageUrl: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBicmElMjBhY3RpdmV3ZWFyfGVufDF8fHx8MTc2MjI2ODI3OXww&ixlib=rb-4.1.0&q=80&w=1080',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 200 },
          { size: 'M', quantity: 280 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 40 }
        ]
      }
    ],
    message: 'Expanding into activewear category - need reliable supplier with quality technical fabrics.',
    quotedPrice: 24800,
    leadTime: 40,
    validUntil: '2024-12-20T23:59:59Z',
    messages: [
      {
        id: 'msg-008-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We\'re launching an activewear line and need a manufacturing partner experienced with technical performance fabrics. This is a test order with potential for much larger volumes if successful.',
        createdAt: '2024-11-22T09:30:00Z'
      },
      {
        id: 'msg-008-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Great to hear! We\'ve been manufacturing activewear for several international brands for the past 5 years. Our performance fabrics are moisture-wicking, 4-way stretch, and squat-proof tested.\\n\\nQuotation:\\n- Leggings: $18/unit (1000 units) = $18,000\\n- Sports bras: $8.50/unit (800 units) = $6,800\\n- Total: $24,800\\n\\nAll items include quality testing and we can provide fabric certifications (OEKO-TEX Standard 100).',
        createdAt: '2024-11-26T11:45:00Z'
      },
      {
        id: 'msg-008-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'This looks promising. Can you send us 2 sample sets in different sizes so our product team can test the fit and fabric performance? We\'ll need Medium and Large sizes.',
        createdAt: '2024-11-27T14:20:00Z'
      },
      {
        id: 'msg-008-4',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Absolutely! I\'ll arrange sample sets in M and L to be shipped today via DHL Express. You should receive them in 4-5 business days. The samples will be in Black colorway so you can properly assess the fabric quality.\\n\\nOnce you approve the samples, we can proceed with production. Would you also like fabric swatches for the other colors?',
        createdAt: '2024-11-27T16:35:00Z'
      },
      {
        id: 'msg-008-5',
        author: 'You',
        authorRole: 'buyer',
        body: 'Yes please, fabric swatches for all 4 colors would be helpful! Also, what is your policy on color matching? We have specific Pantone references for our brand colors.',
        createdAt: '2024-11-28T10:15:00Z'
      },
      {
        id: 'msg-008-6',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We offer free Pantone color matching for orders over 500 units per color. You can send us your Pantone references and we\'ll create lab dips for approval before production. This typically adds 7-10 days to the lead time but ensures perfect color accuracy.\\n\\nI\'ll include the swatches with your sample shipment!',
        createdAt: '2024-11-28T15:40:00Z'
      },
      {
        id: 'msg-008-7',
        author: 'You',
        authorRole: 'buyer',
        body: 'Perfect! That\'s exactly what we need. I\'ll wait for the samples to arrive and we\'ll schedule a fitting session with our team. Thanks for being so responsive!',
        createdAt: '2024-11-29T09:50:00Z'
      }
    ]
  },
  {
    id: 'QR-2024-009',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    status: 'negotiation',
    createdDate: '2024-11-20T15:45:00Z',
    responseDate: '2024-11-24T14:30:00Z',
    items: [
      {
        productId: 'WL-ACCESSORIES-001',
        productName: 'Cashmere Blend Scarf',
        sku: 'SFM-ACC-CS-001',
        quantity: 500,
        specifications: 'Material: 70% cashmere, 30% silk. Colors: Charcoal, Camel, Burgundy, Navy. Dimensions: 200cm x 70cm. Fringed edges.',
        imageUrl: 'https://images.unsplash.com/photo-1601924638867-4a2f94c6c5c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNobWVyZSUyMHNjYXJmJTIwbHV4dXJ5fGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        productId: 'WL-ACCESSORIES-002',
        productName: 'Wool Beanie',
        sku: 'SFM-ACC-WB-002',
        quantity: 800,
        specifications: 'Material: 100% Merino wool. Colors: Black, Grey, Navy, Camel. Ribbed knit. Folded cuff. One size fits most.',
        imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwYmVhbmllJTIwd2ludGVyfGVufDF8fHx8MTc2MjI2ODI4MHww&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ],
    message: 'Premium winter accessories collection. Quality and luxury materials are essential.',
    quotedPrice: 19400,
    leadTime: 42,
    validUntil: '2024-12-18T23:59:59Z',
    messages: [
      {
        id: 'msg-009-1',
        author: 'You',
        authorRole: 'buyer',
        body: 'We want to add premium accessories to complement our winter clothing line. The cashmere content must be genuine and certified. Can you provide material certifications?',
        createdAt: '2024-11-20T15:45:00Z'
      },
      {
        id: 'msg-009-2',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'We work with certified cashmere suppliers from Inner Mongolia. All our cashmere products come with authenticity certificates showing fiber content and origin.\\n\\nPricing:\\n- Cashmere scarves: $28/unit (500 units) = $14,000\\n- Merino beanies: $6.75/unit (800 units) = $5,400\\n- Total: $19,400\\n\\nEach scarf is individually wrapped with care instructions and certification card.',
        createdAt: '2024-11-24T14:30:00Z'
      },
      {
        id: 'msg-009-3',
        author: 'You',
        authorRole: 'buyer',
        body: 'The pricing is competitive. However, we\'ve had issues with pilling on cashmere products from other suppliers. What is your quality control process for preventing this?',
        createdAt: '2024-11-26T11:00:00Z'
      },
      {
        id: 'msg-009-4',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Excellent question! We use only Grade A cashmere fibers (longer fibers = less pilling). Our process includes:\\n\\n1. Fiber length selection (min 36mm)\\n2. Anti-pilling treatment during finishing\\n3. Quality inspection with Martindale abrasion testing\\n4. Individual inspection before packaging\\n\\nWe also offer a pilling test report with each shipment. Our defect rate is under 0.5%.',
        createdAt: '2024-11-26T16:20:00Z'
      },
      {
        id: 'msg-009-5',
        author: 'You',
        authorRole: 'buyer',
        body: 'That\'s reassuring. Can we start with samples of 2 scarves and 3 beanies in different colors? We need to test the hand feel and see the colors in person.',
        createdAt: '2024-11-27T09:45:00Z'
      },
      {
        id: 'msg-009-6',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'Of course! I\'ll send:\\n- Cashmere scarves: Charcoal + Camel\\n- Wool beanies: Black, Grey, Navy\\n\\nShipping via DHL today, expect delivery in 4-5 days. The scarf samples alone will give you a clear sense of our quality standards. They retail for €180-220 in European markets.',
        createdAt: '2024-11-27T14:15:00Z'
      },
      {
        id: 'msg-009-7',
        author: 'You',
        authorRole: 'buyer',
        body: 'Great! One more thing - is there a minimum order quantity if we want to reorder individual colors later?',
        createdAt: '2024-11-28T10:30:00Z'
      },
      {
        id: 'msg-009-8',
        author: 'Lin Wei',
        authorRole: 'partner',
        body: 'For reorders, our MOQ is 100 units per style per color. So you could order 100 burgundy scarves or 200 camel beanies separately. Pricing remains the same for any order over 100 total units across all products.',
        createdAt: '2024-11-28T15:55:00Z'
      }
    ]
  }
];

// Return deliveries mock data (for ShippingScreen)
export const mockReturnDeliveries: ReturnDelivery[] = [
  {
    id: 'RET-001',
    date: '2024-12-10',
    status: 'Pending',
    deliveryId: 'RET-001-20241210',
    items: 45,
    boxes: 2,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '1',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'RET-002',
    date: '2024-12-09',
    status: 'Returned',
    deliveryId: 'RET-002-20241209',
    items: 30,
    boxes: 1,
    storeName: 'Copenhagen Central',
    storeCode: 'DK0123',
    partnerId: '2',
    partnerName: 'Thrifted',
    storeId: '3',
    warehouseId: '3',
    warehouseName: 'Thrifted Copenhagen Hub'
  },
  {
    id: 'RET-003',
    date: '2024-12-08',
    status: 'Returned',
    deliveryId: 'RET-003-20241208',
    items: 60,
    boxes: 3,
    storeName: 'Oslo Main Street',
    storeCode: 'NO0789',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '4',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  // Weekday Sweden Drottninggatan returns with different statuses
  {
    id: 'RET-004',
    date: '2024-12-11',
    status: 'Pending',
    deliveryId: 'RET-004-20241211',
    items: 28,
    boxes: 1,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '1',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'RET-005',
    date: '2024-12-10',
    status: 'In transit',
    deliveryId: 'RET-005-20241210',
    items: 52,
    boxes: 2,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '1',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'RET-006',
    date: '2024-12-09',
    status: 'In transit',
    deliveryId: 'RET-006-20241209',
    items: 35,
    boxes: 1,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '2',
    partnerName: 'Thrifted',
    storeId: '1',
    warehouseId: '2',
    warehouseName: 'Thrifted Oslo Distribution'
  },
  {
    id: 'RET-007',
    date: '2024-12-07',
    status: 'Returned',
    deliveryId: 'RET-007-20241207',
    items: 42,
    boxes: 2,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '1',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'RET-008',
    date: '2024-12-06',
    status: 'Returned',
    deliveryId: 'RET-008-20241206',
    items: 19,
    boxes: 1,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '2',
    partnerName: 'Thrifted',
    storeId: '1',
    warehouseId: '2',
    warehouseName: 'Thrifted Oslo Distribution'
  },
  {
    id: 'RET-009',
    date: '2024-12-12',
    status: 'Pending',
    deliveryId: 'RET-009-20241212',
    items: 67,
    boxes: 3,
    storeName: 'Drottninggatan 63',
    storeCode: 'SE0655',
    partnerId: '1',
    partnerName: 'Sellpy',
    storeId: '1',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  }
];

// Sellpy Orders mock data
export const mockSellpyOrders: SellpyOrder[] = [
  {
    id: 'SEL-2024-001',
    createdDate: '2024-12-09',
    status: 'completed',
    totalItems: 2,
    itemsWithRetailerIds: 2,
    receivingStore: 'Stockholm Drottninggatan',
    storeCode: 'SE0655',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '1', // Drottninggatan 63
    items: [
      {
        id: 'SEL-ITEM-001',
        itemId: 'SEL-ITM-001',
        brand: 'H&M',
        gender: 'Unisex',
        category: 'Clothing',
        subcategory: 'Outerwear',
        size: 'M',
        color: 'Blue',
        price: 35.00,
        status: undefined,
        partnerItemId: 'VDJ-001',
        retailerItemId: 'RID-ABC123',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-002',
        itemId: 'SEL-ITM-002',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Shoes',
        subcategory: 'Boots',
        size: '42',
        color: 'Black',
        price: 45.00,
        status: undefined,
        partnerItemId: 'LBT-002',
        retailerItemId: 'RID-DEF456',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-002',
    createdDate: '2024-12-08',
    status: 'in-progress',
    totalItems: 3,
    itemsWithRetailerIds: 1,
    receivingStore: 'Malmö City Center',
    storeCode: 'SE0657',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '2', // Malmö Triangeln
    items: [
      {
        id: 'SEL-ITEM-101',
        itemId: 'SEL-ITM-101',
        brand: 'COS',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Dresses',
        size: 'L',
        color: 'White',
        price: 28.00,
        status: undefined,
        partnerItemId: 'CTD-101',
        retailerItemId: 'RID-GHI789',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-102',
        itemId: 'SEL-ITM-102',
        brand: 'Monki',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'S',
        color: 'Red',
        price: 15.00,
        status: undefined,
        partnerItemId: 'TPP-102',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-103',
        itemId: 'SEL-ITM-103',
        brand: 'H&M',
        gender: 'Men',
        category: 'Accessories',
        subcategory: 'Bags',
        size: 'One Size',
        color: 'Brown',
        price: 20.00,
        status: 'error',
        errors: ['Price is required'],
        partnerItemId: 'BAG-103',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-003',
    createdDate: '2024-12-07',
    status: 'pending',
    totalItems: 2,
    itemsWithRetailerIds: 0,
    receivingStore: 'Gothenburg Nordstan',
    storeCode: 'SE0658',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '3', // Gothenburg Nordstan
    items: [
      {
        id: 'SEL-ITEM-201',
        itemId: 'SEL-ITM-201',
        brand: 'WEEKDAY',
        gender: 'Unisex',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'S',
        color: 'Gray',
        price: 32.00,
        status: undefined,
        partnerItemId: 'WSW-201',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-202',
        itemId: 'SEL-ITM-202',
        brand: 'COS',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Bottoms',
        size: '32',
        color: 'Navy',
        price: 38.00,
        status: undefined,
        partnerItemId: 'PNT-202',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-004',
    createdDate: '2024-12-06',
    status: 'registered',
    totalItems: 1,
    itemsWithRetailerIds: 1,
    receivingStore: 'Stockholm Drottninggatan',
    storeCode: 'SE0655',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '1', // Drottninggatan 63
    items: [
      {
        id: 'SEL-ITEM-301',
        itemId: 'SEL-ITM-301',
        brand: 'H&M',
        gender: 'Women',
        category: 'Accessories',
        subcategory: 'Hats',
        size: 'One Size',
        color: 'Multi',
        price: 12.00,
        status: undefined,
        partnerItemId: 'SLK-301',
        retailerItemId: 'RID-JKL012',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-005',
    createdDate: '2024-12-05',
    status: 'in-progress',
    totalItems: 1,
    itemsWithRetailerIds: 0,
    receivingStore: 'Uppsala City',
    storeCode: 'SE0659',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '4', // Uppsala Gränby
    items: [
      {
        id: 'SEL-ITEM-401',
        itemId: 'SEL-ITM-401',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Accessories',
        subcategory: 'Bags',
        size: 'One Size',
        color: 'Brown',
        price: 42.00,
        status: undefined,
        partnerItemId: 'VHB-401',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-006',
    createdDate: '2024-12-10',
    status: 'pending',
    totalItems: 4,
    itemsWithRetailerIds: 0,
    receivingStore: 'Stockholm Drottninggatan',
    storeCode: 'SE0001',
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '1', // Drottninggatan 63
    items: [
      {
        id: 'SEL-ITEM-501',
        itemId: 'SEL-ITM-501',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Dresses',
        size: 'M',
        color: 'Black',
        price: 45.00,
        status: undefined,
        partnerItemId: 'WKD-501',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-502',
        itemId: 'SEL-ITM-502',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'S',
        color: 'White',
        price: 25.00,
        status: undefined,
        partnerItemId: 'WKD-502',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-503',
        itemId: 'SEL-ITM-503',
        brand: 'WEEKDAY',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'L',
        color: 'Navy',
        price: 30.00,
        status: undefined,
        partnerItemId: 'WKD-503',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-504',
        itemId: 'SEL-ITM-504',
        brand: 'WEEKDAY',
        gender: 'Unisex',
        category: 'Accessories',
        subcategory: 'Bags',
        size: 'One Size',
        color: 'Brown',
        price: 35.00,
        status: undefined,
        partnerItemId: 'WKD-504',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-007',
    createdDate: '2024-12-10',
    status: 'pending',
    totalItems: 3,
    itemsWithRetailerIds: 0,
    receivingStore: 'Copenhagen Central',
    storeCode: 'DK0123',
    brandId: '1', // WEEKDAY
    countryId: '2', // Denmark
    storeId: '5', // Copenhagen Strøget
    items: [
      {
        id: 'SEL-ITEM-601',
        itemId: 'SEL-ITM-601',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Bottoms',
        size: 'M',
        color: 'Blue',
        price: 40.00,
        status: undefined,
        partnerItemId: 'WKD-601',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-602',
        itemId: 'SEL-ITM-602',
        brand: 'WEEKDAY',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Outerwear',
        size: 'XL',
        color: 'Black',
        price: 65.00,
        status: undefined,
        partnerItemId: 'WKD-602',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-603',
        itemId: 'SEL-ITM-603',
        brand: 'WEEKDAY',
        gender: 'Women',
        category: 'Shoes',
        subcategory: 'Sneakers',
        size: '38',
        color: 'White',
        price: 50.00,
        status: undefined,
        partnerItemId: 'WKD-603',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-008',
    createdDate: '2024-12-09',
    status: 'pending',
    totalItems: 5,
    itemsWithRetailerIds: 0,
    receivingStore: 'Monki Stockholm Hamngatan',
    storeCode: 'SE0789',
    brandId: '2', // Monki
    countryId: '1', // Sweden
    storeId: '6', // Monki Hamngatan
    items: [
      {
        id: 'SEL-ITEM-701',
        itemId: 'SEL-ITM-701',
        brand: 'Monki',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Dresses',
        size: 'S',
        color: 'Pink',
        price: 35.00,
        status: undefined,
        partnerItemId: 'MKI-701',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-702',
        itemId: 'SEL-ITM-702',
        brand: 'Monki',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'M',
        color: 'Yellow',
        price: 22.00,
        status: undefined,
        partnerItemId: 'MKI-702',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-703',
        itemId: 'SEL-ITM-703',
        brand: 'Monki',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Bottoms',
        size: 'L',
        color: 'Blue',
        price: 28.00,
        status: undefined,
        partnerItemId: 'MKI-703',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-704',
        itemId: 'SEL-ITM-704',
        brand: 'Monki',
        gender: 'Women',
        category: 'Accessories',
        subcategory: 'Jewelry',
        size: 'One Size',
        color: 'Silver',
        price: 15.00,
        status: undefined,
        partnerItemId: 'MKI-704',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-705',
        itemId: 'SEL-ITM-705',
        brand: 'Monki',
        gender: 'Women',
        category: 'Shoes',
        subcategory: 'Sandals',
        size: '37',
        color: 'Brown',
        price: 32.00,
        status: undefined,
        partnerItemId: 'MKI-705',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-009',
    createdDate: '2024-12-09',
    status: 'pending',
    totalItems: 2,
    itemsWithRetailerIds: 0,
    receivingStore: 'Oslo Main Street',
    storeCode: 'NO0789',
    brandId: '1', // WEEKDAY
    countryId: '3', // Norway
    storeId: '7', // Oslo Karl Johans gate
    items: [
      {
        id: 'SEL-ITEM-801',
        itemId: 'SEL-ITM-801',
        brand: 'WEEKDAY',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Bottoms',
        size: '32',
        color: 'Gray',
        price: 38.00,
        status: undefined,
        partnerItemId: 'WKD-801',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-802',
        itemId: 'SEL-ITM-802',
        brand: 'WEEKDAY',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'M',
        color: 'Green',
        price: 28.00,
        status: undefined,
        partnerItemId: 'WKD-802',
        source: 'api-integration'
      }
    ]
  },
  {
    id: 'SEL-2024-010',
    createdDate: '2024-12-08',
    status: 'pending',
    totalItems: 6,
    itemsWithRetailerIds: 0,
    receivingStore: 'COS Berlin Mitte',
    storeCode: 'DE0456',
    brandId: '3', // COS
    countryId: '4', // Germany
    storeId: '8', // COS Berlin Mitte
    items: [
      {
        id: 'SEL-ITEM-901',
        itemId: 'SEL-ITM-901',
        brand: 'COS',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Dresses',
        size: 'M',
        color: 'Beige',
        price: 55.00,
        status: undefined,
        partnerItemId: 'COS-901',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-902',
        itemId: 'SEL-ITM-902',
        brand: 'COS',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Tops',
        size: 'L',
        color: 'White',
        price: 42.00,
        status: undefined,
        partnerItemId: 'COS-902',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-903',
        itemId: 'SEL-ITM-903',
        brand: 'COS',
        gender: 'Women',
        category: 'Clothing',
        subcategory: 'Bottoms',
        size: 'S',
        color: 'Navy',
        price: 48.00,
        status: undefined,
        partnerItemId: 'COS-903',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-904',
        itemId: 'SEL-ITM-904',
        brand: 'COS',
        gender: 'Men',
        category: 'Clothing',
        subcategory: 'Outerwear',
        size: 'XL',
        color: 'Black',
        price: 85.00,
        status: undefined,
        partnerItemId: 'COS-904',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-905',
        itemId: 'SEL-ITM-905',
        brand: 'COS',
        gender: 'Women',
        category: 'Accessories',
        subcategory: 'Scarves',
        size: 'One Size',
        color: 'Gray',
        price: 32.00,
        status: undefined,
        partnerItemId: 'COS-905',
        source: 'api-integration'
      },
      {
        id: 'SEL-ITEM-906',
        itemId: 'SEL-ITM-906',
        brand: 'COS',
        gender: 'Unisex',
        category: 'Accessories',
        subcategory: 'Bags',
        size: 'One Size',
        color: 'Brown',
        price: 62.00,
        status: undefined,
        partnerItemId: 'COS-906',
        source: 'api-integration'
      }
    ]
  }
];

// Delivery Notes mock data (for Sellpy partner shipments)
export const mockDeliveryNotes: DeliveryNote[] = [
  {
    id: 'DN-2024-001',
    orderId: 'SEL-2024-001',
    externalOrderId: 'SLPY-EXT-2024-001',
    boxes: [
      {
        id: 'BOX-001',
        qrLabel: 'QR-20251210-001',
        items: [
          {
            id: 'SEL-ITEM-001',
            itemId: 'SEL-ITM-001',
            brand: 'H&M',
            gender: 'Unisex',
            category: 'Clothing',
            subcategory: 'Outerwear',
            size: 'M',
            color: 'Blue',
            price: 35.00,
            status: undefined,
            partnerItemId: 'VDJ-001',
            retailerItemId: 'RID-ABC123',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-002',
            itemId: 'SEL-ITM-002',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Dresses',
            size: 'S',
            color: 'Black',
            price: 28.00,
            status: undefined,
            partnerItemId: 'SD-002',
            retailerItemId: 'RID-DEF456',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-10'
      }
    ],
    status: 'registered',
    createdDate: '2025-12-10',
    shipmentDate: '2025-12-11',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '1',
    storeCode: 'SE0655'
  },
  {
    id: 'DN-2024-002',
    orderId: 'SEL-2024-004',
    externalOrderId: 'SLPY-EXT-2024-004',
    boxes: [
      {
        id: 'BOX-002',
        qrLabel: 'QR-20241205-001',
        items: [
          {
            id: 'SEL-ITEM-301',
            itemId: 'SEL-ITM-301',
            brand: 'H&M',
            gender: 'Women',
            category: 'Accessories',
            subcategory: 'Hats',
            size: 'One Size',
            color: 'Multi',
            price: 12.00,
            status: undefined,
            partnerItemId: 'SLK-301',
            retailerItemId: 'RID-JKL012',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-25'
      }
    ],
    status: 'registered',
    createdDate: '2025-12-25',
    shipmentDate: '2025-12-26',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '2',
    storeCode: 'SE0520'
  },
  {
    id: 'DN-2024-003',
    orderId: 'SEL-2024-005',
    externalOrderId: 'SLPY-EXT-2024-005',
    boxes: [
      {
        id: 'BOX-003',
        qrLabel: 'QR-20251215-001',
        items: [
          {
            id: 'SEL-ITEM-401',
            itemId: 'SEL-ITM-401',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Accessories',
            subcategory: 'Bags',
            size: 'One Size',
            color: 'Brown',
            price: 42.00,
            status: undefined,
            partnerItemId: 'VHB-401',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-15'
      }
    ],
    status: 'registered',
    createdDate: '2025-12-15',
    shipmentDate: '2025-12-16',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '5',
    storeCode: 'SE0452'
  },
  {
    id: 'DN-2024-004',
    orderId: 'SEL-2024-007',
    externalOrderId: 'SLPY-EXT-2024-007',
    boxes: [
      {
        id: 'BOX-004',
        qrLabel: 'QR-20251220-002',
        items: [
          {
            id: 'SEL-ITEM-601',
            itemId: 'SEL-ITM-601',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Bottoms',
            size: 'M',
            color: 'Blue',
            price: 40.00,
            status: undefined,
            partnerItemId: 'WKD-601',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-602',
            itemId: 'SEL-ITM-602',
            brand: 'WEEKDAY',
            gender: 'Men',
            category: 'Clothing',
            subcategory: 'Outerwear',
            size: 'XL',
            color: 'Black',
            price: 65.00,
            status: undefined,
            partnerItemId: 'WKD-602',
            source: 'api-integration'
          }
        ],
        status: 'delivered',
        createdDate: '2025-12-20'
      },
      {
        id: 'BOX-005',
        qrLabel: 'QR-20251220-003',
        items: [
          {
            id: 'SEL-ITEM-603',
            itemId: 'SEL-ITM-603',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Shoes',
            subcategory: 'Sneakers',
            size: '38',
            color: 'White',
            price: 50.00,
            status: undefined,
            partnerItemId: 'WKD-603',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-20'
      }
    ],
    status: 'partially-delivered',
    createdDate: '2025-12-20',
    shipmentDate: '2025-12-21',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '5',
    storeCode: 'SE0452'
  },
  {
    id: 'DN-2024-005',
    orderId: 'SEL-2024-008',
    externalOrderId: 'SLPY-EXT-2024-008',
    boxes: [
      {
        id: 'BOX-006',
        qrLabel: 'QR-20251218-002',
        items: [
          {
            id: 'SEL-ITEM-701',
            itemId: 'SEL-ITM-701',
            brand: 'Monki',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Dresses',
            size: 'S',
            color: 'Pink',
            price: 35.00,
            status: undefined,
            partnerItemId: 'MKI-701',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-702',
            itemId: 'SEL-ITM-702',
            brand: 'Monki',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Tops',
            size: 'M',
            color: 'White',
            price: 22.00,
            status: undefined,
            partnerItemId: 'MKI-702',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-703',
            itemId: 'SEL-ITM-703',
            brand: 'Monki',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Bottoms',
            size: 'M',
            color: 'Black',
            price: 28.00,
            status: undefined,
            partnerItemId: 'MKI-703',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-18'
      },
      {
        id: 'BOX-007',
        qrLabel: 'QR-20251218-003',
        items: [
          {
            id: 'SEL-ITEM-704',
            itemId: 'SEL-ITM-704',
            brand: 'Monki',
            gender: 'Women',
            category: 'Accessories',
            subcategory: 'Jewelry',
            size: 'One Size',
            color: 'Gold',
            price: 18.00,
            status: undefined,
            partnerItemId: 'MKI-704',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-705',
            itemId: 'SEL-ITM-705',
            brand: 'Monki',
            gender: 'Women',
            category: 'Shoes',
            subcategory: 'Sandals',
            size: '37',
            color: 'Brown',
            price: 32.00,
            status: undefined,
            partnerItemId: 'MKI-705',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-18'
      }
    ],
    status: 'registered',
    createdDate: '2025-12-18',
    shipmentDate: '2025-12-19',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '2',
    storeCode: 'SE0520'
  },
  {
    id: 'DN-2024-010',
    orderId: 'SEL-2024-011',
    externalOrderId: 'SLPY-EXT-2024-011',
    boxes: [
      {
        id: 'BOX-012',
        qrLabel: 'QR-20251222-001',
        items: [
          {
            id: 'SEL-ITEM-801',
            itemId: 'SEL-ITM-801',
            brand: 'H&M',
            gender: 'Unisex',
            category: 'Clothing',
            subcategory: 'Tops',
            size: 'L',
            color: 'Gray',
            price: 25.00,
            status: undefined,
            partnerItemId: 'HM-801',
            source: 'api-integration'
          }
        ],
        status: 'delivered',
        createdDate: '2025-12-22'
      },
      {
        id: 'BOX-013',
        qrLabel: 'QR-20251222-002',
        items: [
          {
            id: 'SEL-ITEM-802',
            itemId: 'SEL-ITM-802',
            brand: 'COS',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Dresses',
            size: 'S',
            color: 'Black',
            price: 55.00,
            status: undefined,
            partnerItemId: 'COS-802',
            source: 'api-integration'
          }
        ],
        status: 'in-transit',
        createdDate: '2025-12-22'
      },
      {
        id: 'BOX-014',
        qrLabel: 'QR-20251222-003',
        items: [
          {
            id: 'SEL-ITEM-803',
            itemId: 'SEL-ITM-803',
            brand: 'H&M',
            gender: 'Men',
            category: 'Clothing',
            subcategory: 'Bottoms',
            size: '32',
            color: 'Navy',
            price: 30.00,
            status: undefined,
            partnerItemId: 'HM-803',
            source: 'api-integration'
          }
        ],
        status: 'delivered',
        createdDate: '2025-12-22'
      }
    ],
    status: 'partially-delivered',
    createdDate: '2025-12-22',
    shipmentDate: '2025-12-23',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '1',
    storeCode: 'SE0655'
  },
  // Pending delivery notes (Sellpy only)
  {
    id: 'DN-2024-006',
    orderId: 'SEL-ORD-2024-101',
    externalOrderId: 'SLPY-EXT-ORD-2024-101',
    boxes: [],
    status: 'pending',
    createdDate: '2024-12-11',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '1',
    storeCode: 'SE0655'
  },
  {
    id: 'DN-2024-007',
    orderId: 'SEL-ORD-2024-103',
    externalOrderId: 'SLPY-EXT-ORD-2024-103',
    boxes: [
      {
        id: 'BOX-008',
        qrLabel: 'QR-20241211-001',
        items: [
          {
            id: 'SEL-ITEM-PEND-001',
            itemId: 'SEL-ITM-PEND-001',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Tops',
            size: 'M',
            color: 'White',
            price: 35.00,
            status: undefined,
            partnerItemId: 'WKD-PEND-001',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-PEND-002',
            itemId: 'SEL-ITM-PEND-002',
            brand: 'H&M',
            gender: 'Unisex',
            category: 'Clothing',
            subcategory: 'Outerwear',
            size: 'L',
            color: 'Black',
            price: 48.00,
            status: undefined,
            partnerItemId: 'HM-PEND-002',
            source: 'api-integration'
          }
        ],
        status: 'pending',
        createdDate: '2024-12-11'
      }
    ],
    status: 'pending',
    createdDate: '2024-12-11',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '1',
    storeCode: 'SE0655'
  },
  // Packing delivery notes (Sellpy only)
  {
    id: 'DN-2024-008',
    orderId: 'SEL-ORD-2024-107',
    externalOrderId: 'SLPY-EXT-ORD-2024-107',
    boxes: [
      {
        id: 'BOX-009',
        qrLabel: 'QR-20241211-002',
        items: [
          {
            id: 'SEL-ITEM-PACK-001',
            itemId: 'SEL-ITM-PACK-001',
            brand: 'WEEKDAY',
            gender: 'Men',
            category: 'Clothing',
            subcategory: 'Tops',
            size: 'L',
            color: 'Navy',
            price: 38.00,
            status: undefined,
            partnerItemId: 'WKD-PACK-001',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-PACK-002',
            itemId: 'SEL-ITM-PACK-002',
            brand: 'COS',
            gender: 'Women',
            category: 'Clothing',
            subcategory: 'Dresses',
            size: 'S',
            color: 'Beige',
            price: 52.00,
            status: undefined,
            partnerItemId: 'COS-PACK-002',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-PACK-003',
            itemId: 'SEL-ITM-PACK-003',
            brand: 'Monki',
            gender: 'Women',
            category: 'Accessories',
            subcategory: 'Bags',
            size: 'One Size',
            color: 'Brown',
            price: 28.00,
            status: undefined,
            partnerItemId: 'MKI-PACK-003',
            source: 'api-integration'
          }
        ],
        status: 'pending',
        createdDate: '2024-12-11'
      },
      {
        id: 'BOX-010',
        qrLabel: 'QR-20241211-003',
        items: [
          {
            id: 'SEL-ITEM-PACK-004',
            itemId: 'SEL-ITM-PACK-004',
            brand: 'WEEKDAY',
            gender: 'Women',
            category: 'Shoes',
            subcategory: 'Boots',
            size: '39',
            color: 'Black',
            price: 65.00,
            status: undefined,
            partnerItemId: 'WKD-PACK-004',
            source: 'api-integration'
          }
        ],
        status: 'pending',
        createdDate: '2024-12-11'
      }
    ],
    status: 'packing',
    createdDate: '2024-12-11',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '2',
    storeCode: 'SE0656'
  },
  {
    id: 'DN-2024-009',
    orderId: 'SEL-ORD-2024-105',
    externalOrderId: 'SLPY-EXT-ORD-2024-105',
    boxes: [
      {
        id: 'BOX-011',
        qrLabel: 'QR-20241211-004',
        items: [
          {
            id: 'SEL-ITEM-PACK-005',
            itemId: 'SEL-ITM-PACK-005',
            brand: 'H&M',
            gender: 'Unisex',
            category: 'Accessories',
            subcategory: 'Hats',
            size: 'One Size',
            color: 'Multi',
            price: 18.00,
            status: undefined,
            partnerItemId: 'HM-PACK-005',
            source: 'api-integration'
          },
          {
            id: 'SEL-ITEM-PACK-006',
            itemId: 'SEL-ITM-PACK-006',
            brand: 'WEEKDAY',
            gender: 'Men',
            category: 'Clothing',
            subcategory: 'Bottoms',
            size: '32',
            color: 'Gray',
            price: 42.00,
            status: undefined,
            partnerItemId: 'WKD-PACK-006',
            source: 'api-integration'
          }
        ],
        status: 'pending',
        createdDate: '2024-12-11'
      }
    ],
    status: 'packing',
    createdDate: '2024-12-11',
    partnerId: '1',
    partnerName: 'Sellpy',
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse',
    storeId: '4',
    storeCode: 'NO0789'
  }
];

// Partner Orders mock data (for Sellpy and Thrifted partners)
export const mockPartnerOrders: ExtendedPartnerOrder[] = [
  // Thrifted orders
  {
    id: 'THR-ORD-2024-001',
    status: 'pending',
    createdDate: '2024-12-11',
    itemCount: 32,
    boxCount: 0,
    partnerId: '2',
    partnerName: 'Thrifted',
    receivingStoreId: '4',
    receivingStoreName: 'Oslo Main Street',
    warehouseId: '2',
    warehouseName: 'Thrifted Oslo Distribution'
  },
  {
    id: 'THR-ORD-2024-002',
    status: 'delivered',
    createdDate: '2024-12-10',
    itemCount: 48,
    boxCount: 2,
    deliveryNote: 'DN-THR-2024-001',
    partnerId: '2',
    partnerName: 'Thrifted',
    receivingStoreId: '3',
    receivingStoreName: 'Copenhagen Central',
    warehouseId: '3',
    warehouseName: 'Thrifted Copenhagen Hub'
  },
  {
    id: 'THR-ORD-2024-003',
    status: 'pending',
    createdDate: '2024-12-09',
    itemCount: 24,
    boxCount: 0,
    partnerId: '2',
    partnerName: 'Thrifted',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    warehouseId: '2',
    warehouseName: 'Thrifted Oslo Distribution'
  },
  // Sellpy orders
  // Approval orders (Sellpy only)
  {
    id: 'SEL-ORD-2024-APPROVAL-001',
    status: 'approval',
    createdDate: '2024-12-11',
    itemCount: 38,
    boxCount: 0,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-APPROVAL-001',
    orderValue: 2280.00,
    salesMargin: 43.0,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-APPROVAL-002',
    status: 'approval',
    createdDate: '2024-12-10',
    itemCount: 42,
    boxCount: 0,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '2',
    receivingStoreName: 'Södermalm Store',
    externalOrderId: 'SLPY-2024-APPROVAL-002',
    orderValue: 2520.00,
    salesMargin: 40.5,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-APPROVAL-003',
    status: 'approval',
    createdDate: '2024-12-10',
    itemCount: 31,
    boxCount: 0,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '3',
    receivingStoreName: 'Copenhagen Central',
    externalOrderId: 'SLPY-2024-APPROVAL-003',
    orderValue: 1860.00,
    salesMargin: 38.2,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-101',
    status: 'pending',
    createdDate: '2024-12-10',
    itemCount: 45,
    boxCount: 2,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-3421',
    orderValue: 2850.00,
    salesMargin: 42.5,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-102',
    status: 'registered',
    createdDate: '2024-12-09',
    itemCount: 32,
    boxCount: 1,
    deliveryNote: 'DN-2024-002',
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '2',
    receivingStoreName: 'Götgatan 25',
    externalOrderId: 'SLPY-2024-3420',
    orderValue: 1920.00,
    salesMargin: 38.2,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-103',
    status: 'pending',
    createdDate: '2024-12-09',
    itemCount: 28,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-3419',
    orderValue: 1680.00,
    salesMargin: 45.0,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-104',
    status: 'in-review',
    createdDate: '2024-12-08',
    itemCount: 52,
    boxCount: 2,
    deliveryNote: 'DN-2024-003',
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '3',
    receivingStoreName: 'Mall of Scandinavia',
    externalOrderId: 'SLPY-2024-3418',
    orderValue: 3120.00,
    salesMargin: 40.8,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-105',
    status: 'pending',
    createdDate: '2024-12-08',
    itemCount: 18,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '4',
    receivingStoreName: 'Nordstan Shopping Center',
    externalOrderId: 'SLPY-2024-3417',
    orderValue: 1080.00,
    salesMargin: 35.5,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-106',
    status: 'registered',
    createdDate: '2024-12-07',
    itemCount: 38,
    boxCount: 2,
    deliveryNote: 'DN-2024-005',
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-3416',
    orderValue: 2280.00,
    salesMargin: 43.2,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-107',
    status: 'pending',
    createdDate: '2024-12-07',
    itemCount: 24,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '2',
    receivingStoreName: 'Götgatan 25',
    externalOrderId: 'SLPY-2024-3415',
    orderValue: 1440.00,
    salesMargin: 39.0,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-108',
    status: 'in-review',
    createdDate: '2024-12-06',
    itemCount: 41,
    boxCount: 2,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '5',
    receivingStoreName: 'Triangeln Center',
    externalOrderId: 'SLPY-2024-3414',
    orderValue: 2460.00,
    salesMargin: 41.5,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-109',
    status: 'pending',
    createdDate: '2024-12-06',
    itemCount: 15,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '6',
    receivingStoreName: 'Emporia Shopping',
    externalOrderId: 'SLPY-2024-3413',
    orderValue: 900.00,
    salesMargin: 37.8,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-110',
    status: 'registered',
    createdDate: '2024-12-05',
    itemCount: 36,
    boxCount: 2,
    deliveryNote: 'DN-2024-001',
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-3412',
    orderValue: 2160.00,
    salesMargin: 44.0,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-111',
    status: 'registered',
    createdDate: '2024-12-11',
    itemCount: 22,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '1',
    receivingStoreName: 'Drottninggatan 63',
    externalOrderId: 'SLPY-2024-3423',
    orderValue: 1320.00,
    salesMargin: 41.5,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  },
  {
    id: 'SEL-ORD-2024-112',
    status: 'registered',
    createdDate: '2024-12-11',
    itemCount: 18,
    boxCount: 1,
    partnerId: '1',
    partnerName: 'Sellpy',
    receivingStoreId: '2',
    receivingStoreName: 'Götgatan 25',
    externalOrderId: 'SLPY-2024-3424',
    orderValue: 1080.00,
    salesMargin: 39.8,
    warehouseId: '1',
    warehouseName: 'Stockholm Central Warehouse'
  }
];

// Note: For brevity, large mock data arrays (partnerOrders, deliveryNotes, etc.)
// are truncated. Add them from the original App.tsx as needed.

// Sales Report mock data
export const mockSalesReportData: SalesDataPoint[] = [
  {
    month: '2024-08',
    totalSold: 1245,
    byStore: [
      { storeId: '1', storeName: 'Drottninggatan 63', sold: 456 },
      { storeId: '2', storeName: 'Götgatan 25', sold: 389 },
      { storeId: '3', storeName: 'Kungsgatan 18', sold: 400 }
    ],
    byBrand: [
      { brandId: '1', brandName: 'WEEKDAY', sold: 312 },
      { brandId: '2', brandName: 'COS', sold: 289 },
      { brandId: '3', brandName: 'ARKET', sold: 267 },
      { brandId: '4', brandName: 'Monki', sold: 198 },
      { brandId: '5', brandName: 'H&M', sold: 179 }
    ]
  },
  {
    month: '2024-09',
    totalSold: 1389,
    byStore: [
      { storeId: '1', storeName: 'Drottninggatan 63', sold: 512 },
      { storeId: '2', storeName: 'Götgatan 25', sold: 445 },
      { storeId: '3', storeName: 'Kungsgatan 18', sold: 432 }
    ],
    byBrand: [
      { brandId: '1', brandName: 'WEEKDAY', sold: 356 },
      { brandId: '2', brandName: 'COS', sold: 312 },
      { brandId: '3', brandName: 'ARKET', sold: 298 },
      { brandId: '4', brandName: 'Monki', sold: 223 },
      { brandId: '5', brandName: 'H&M', sold: 200 }
    ]
  },
  {
    month: '2024-10',
    totalSold: 1523,
    byStore: [
      { storeId: '1', storeName: 'Drottninggatan 63', sold: 567 },
      { storeId: '2', storeName: 'Götgatan 25', sold: 489 },
      { storeId: '3', storeName: 'Kungsgatan 18', sold: 467 }
    ],
    byBrand: [
      { brandId: '1', brandName: 'WEEKDAY', sold: 389 },
      { brandId: '2', brandName: 'COS', sold: 345 },
      { brandId: '3', brandName: 'ARKET', sold: 323 },
      { brandId: '4', brandName: 'Monki', sold: 245 },
      { brandId: '5', brandName: 'H&M', sold: 221 }
    ]
  },
  {
    month: '2024-11',
    totalSold: 1678,
    byStore: [
      { storeId: '1', storeName: 'Drottninggatan 63', sold: 623 },
      { storeId: '2', storeName: 'Götgatan 25', sold: 534 },
      { storeId: '3', storeName: 'Kungsgatan 18', sold: 521 }
    ],
    byBrand: [
      { brandId: '1', brandName: 'WEEKDAY', sold: 423 },
      { brandId: '2', brandName: 'COS', sold: 378 },
      { brandId: '3', brandName: 'ARKET', sold: 356 },
      { brandId: '4', brandName: 'Monki', sold: 267 },
      { brandId: '5', brandName: 'H&M', sold: 254 }
    ]
  },
  {
    month: '2024-12',
    totalSold: 1456,
    byStore: [
      { storeId: '1', storeName: 'Drottninggatan 63', sold: 542 },
      { storeId: '2', storeName: 'Götgatan 25', sold: 467 },
      { storeId: '3', storeName: 'Kungsgatan 18', sold: 447 }
    ],
    byBrand: [
      { brandId: '1', brandName: 'WEEKDAY', sold: 367 },
      { brandId: '2', brandName: 'COS', sold: 323 },
      { brandId: '3', brandName: 'ARKET', sold: 301 },
      { brandId: '4', brandName: 'Monki', sold: 234 },
      { brandId: '5', brandName: 'H&M', sold: 231 }
    ]
  }
];

// Stock Report mock data
export const mockStockReportData: StockReportData = {
  daily: [
    { category: 'Tops', storeId: '1', storeName: 'Drottninggatan 63', inStock: 45, sold: 12, expired: 6, inOrder: 7, averagePrice: 299, averageDaysToSell: 12 },
    { category: 'Tops', storeId: '2', storeName: 'Götgatan 25', inStock: 38, sold: 8, expired: 4, inOrder: 7 },
    { category: 'Tops', storeId: '3', storeName: 'Kungsgatan 18', inStock: 42, sold: 10, expired: 5, inOrder: 9 },
    { category: 'Jeans', storeId: '1', storeName: 'Drottninggatan 63', inStock: 32, sold: 15, expired: 1, inOrder: 5 },
    { category: 'Jeans', storeId: '2', storeName: 'Götgatan 25', inStock: 28, sold: 12, expired: 1, inOrder: 4 },
    { category: 'Jeans', storeId: '3', storeName: 'Kungsgatan 18', inStock: 35, sold: 14, expired: 2, inOrder: 3 },
    { category: 'Dresses', storeId: '1', storeName: 'Drottninggatan 63', inStock: 25, sold: 8, expired: 3, inOrder: 3 },
    { category: 'Dresses', storeId: '2', storeName: 'Götgatan 25', inStock: 22, sold: 6, expired: 1, inOrder: 2 },
    { category: 'Dresses', storeId: '3', storeName: 'Kungsgatan 18', inStock: 28, sold: 9, expired: 3, inOrder: 3 },
    { category: 'Shoes', storeId: '1', storeName: 'Drottninggatan 63', inStock: 18, sold: 5, expired: 2, inOrder: 2 },
    { category: 'Shoes', storeId: '2', storeName: 'Götgatan 25', inStock: 15, sold: 4, expired: 0, inOrder: 3 },
    { category: 'Shoes', storeId: '3', storeName: 'Kungsgatan 18', inStock: 20, sold: 6, expired: 2, inOrder: 4 },
    { category: 'Jackets', storeId: '1', storeName: 'Drottninggatan 63', inStock: 12, sold: 3, expired: 1, inOrder: 1 },
    { category: 'Jackets', storeId: '2', storeName: 'Götgatan 25', inStock: 10, sold: 2, expired: 1, inOrder: 1 },
    { category: 'Jackets', storeId: '3', storeName: 'Kungsgatan 18', inStock: 14, sold: 4, expired: 0, inOrder: 2 },
    { category: 'Trousers', storeId: '1', storeName: 'Drottninggatan 63', inStock: 28, sold: 9, expired: 1, inOrder: 4 },
    { category: 'Trousers', storeId: '2', storeName: 'Götgatan 25', inStock: 24, sold: 7, expired: 2, inOrder: 4 },
    { category: 'Trousers', storeId: '3', storeName: 'Kungsgatan 18', inStock: 30, sold: 10, expired: 2, inOrder: 7 },
    { category: 'Shorts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 15, sold: 4, expired: 2, inOrder: 1 },
    { category: 'Shorts', storeId: '2', storeName: 'Götgatan 25', inStock: 12, sold: 3, expired: 1, inOrder: 1 },
    { category: 'Shorts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 18, sold: 5, expired: 2, inOrder: 4 },
    { category: 'Skirts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 20, sold: 6, expired: 2, inOrder: 4 },
    { category: 'Skirts', storeId: '2', storeName: 'Götgatan 25', inStock: 17, sold: 5, expired: 1, inOrder: 1 },
    { category: 'Skirts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 22, sold: 7, expired: 1, inOrder: 2 },
    { category: 'Coats', storeId: '1', storeName: 'Drottninggatan 63', inStock: 8, sold: 2, expired: 0, inOrder: 1 },
    { category: 'Coats', storeId: '2', storeName: 'Götgatan 25', inStock: 7, sold: 1, expired: 0, inOrder: 0 },
    { category: 'Coats', storeId: '3', storeName: 'Kungsgatan 18', inStock: 10, sold: 3, expired: 1, inOrder: 1 },
    { category: 'Hoodies', storeId: '1', storeName: 'Drottninggatan 63', inStock: 22, sold: 7, expired: 2, inOrder: 2 },
    { category: 'Hoodies', storeId: '2', storeName: 'Götgatan 25', inStock: 19, sold: 6, expired: 1, inOrder: 3 },
    { category: 'Hoodies', storeId: '3', storeName: 'Kungsgatan 18', inStock: 25, sold: 8, expired: 2, inOrder: 5 },
    { category: 'Sweaters', storeId: '1', storeName: 'Drottninggatan 63', inStock: 30, sold: 10, expired: 1, inOrder: 5 },
    { category: 'Sweaters', storeId: '2', storeName: 'Götgatan 25', inStock: 26, sold: 8, expired: 1, inOrder: 4 },
    { category: 'Sweaters', storeId: '3', storeName: 'Kungsgatan 18', inStock: 33, sold: 11, expired: 4, inOrder: 3 },
    { category: 'Accessories', storeId: '1', storeName: 'Drottninggatan 63', inStock: 35, sold: 11, expired: 1, inOrder: 8 },
    { category: 'Accessories', storeId: '2', storeName: 'Götgatan 25', inStock: 30, sold: 9, expired: 2, inOrder: 5 },
    { category: 'Accessories', storeId: '3', storeName: 'Kungsgatan 18', inStock: 38, sold: 12, expired: 2, inOrder: 6 },
    { category: 'Other', storeId: '1', storeName: 'Drottninggatan 63', inStock: 10, sold: 3, expired: 1, inOrder: 2 },
    { category: 'Other', storeId: '2', storeName: 'Götgatan 25', inStock: 8, sold: 2, expired: 0, inOrder: 1 },
    { category: 'Other', storeId: '3', storeName: 'Kungsgatan 18', inStock: 12, sold: 4, expired: 1, inOrder: 2 }
  ],
  sevenDays: [
    { category: 'Tops', storeId: '1', storeName: 'Drottninggatan 63', inStock: 125, sold: 89, expired: 6, inOrder: 17 },
    { category: 'Tops', storeId: '2', storeName: 'Götgatan 25', inStock: 108, sold: 67, expired: 6, inOrder: 11 },
    { category: 'Tops', storeId: '3', storeName: 'Kungsgatan 18', inStock: 118, sold: 72, expired: 16, inOrder: 22 },
    { category: 'Jeans', storeId: '1', storeName: 'Drottninggatan 63', inStock: 95, sold: 112, expired: 6, inOrder: 22 },
    { category: 'Jeans', storeId: '2', storeName: 'Götgatan 25', inStock: 82, sold: 98, expired: 6, inOrder: 14 },
    { category: 'Jeans', storeId: '3', storeName: 'Kungsgatan 18', inStock: 102, sold: 105, expired: 5, inOrder: 13 },
    { category: 'Dresses', storeId: '1', storeName: 'Drottninggatan 63', inStock: 68, sold: 54, expired: 5, inOrder: 8 },
    { category: 'Dresses', storeId: '2', storeName: 'Götgatan 25', inStock: 59, sold: 48, expired: 3, inOrder: 10 },
    { category: 'Dresses', storeId: '3', storeName: 'Kungsgatan 18', inStock: 75, sold: 62, expired: 9, inOrder: 7 },
    { category: 'Shoes', storeId: '1', storeName: 'Drottninggatan 63', inStock: 52, sold: 38, expired: 3, inOrder: 10 },
    { category: 'Shoes', storeId: '2', storeName: 'Götgatan 25', inStock: 45, sold: 32, expired: 5, inOrder: 10 },
    { category: 'Shoes', storeId: '3', storeName: 'Kungsgatan 18', inStock: 58, sold: 42, expired: 6, inOrder: 11 },
    { category: 'Jackets', storeId: '1', storeName: 'Drottninggatan 63', inStock: 35, sold: 28, expired: 3, inOrder: 7 },
    { category: 'Jackets', storeId: '2', storeName: 'Götgatan 25', inStock: 29, sold: 22, expired: 2, inOrder: 4 },
    { category: 'Jackets', storeId: '3', storeName: 'Kungsgatan 18', inStock: 42, sold: 31, expired: 2, inOrder: 8 },
    { category: 'Trousers', storeId: '1', storeName: 'Drottninggatan 63', inStock: 78, sold: 65, expired: 5, inOrder: 12 },
    { category: 'Trousers', storeId: '2', storeName: 'Götgatan 25', inStock: 68, sold: 58, expired: 6, inOrder: 13 },
    { category: 'Trousers', storeId: '3', storeName: 'Kungsgatan 18', inStock: 84, sold: 72, expired: 5, inOrder: 11 },
    { category: 'Shorts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 42, sold: 28, expired: 3, inOrder: 10 },
    { category: 'Shorts', storeId: '2', storeName: 'Götgatan 25', inStock: 36, sold: 24, expired: 3, inOrder: 8 },
    { category: 'Shorts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 50, sold: 35, expired: 6, inOrder: 7 },
    { category: 'Skirts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 56, sold: 42, expired: 7, inOrder: 13 },
    { category: 'Skirts', storeId: '2', storeName: 'Götgatan 25', inStock: 48, sold: 36, expired: 4, inOrder: 10 },
    { category: 'Skirts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 62, sold: 48, expired: 3, inOrder: 11 },
    { category: 'Coats', storeId: '1', storeName: 'Drottninggatan 63', inStock: 22, sold: 18, expired: 2, inOrder: 5 },
    { category: 'Coats', storeId: '2', storeName: 'Götgatan 25', inStock: 19, sold: 15, expired: 2, inOrder: 3 },
    { category: 'Coats', storeId: '3', storeName: 'Kungsgatan 18', inStock: 28, sold: 22, expired: 3, inOrder: 5 },
    { category: 'Hoodies', storeId: '1', storeName: 'Drottninggatan 63', inStock: 62, sold: 49, expired: 5, inOrder: 13 },
    { category: 'Hoodies', storeId: '2', storeName: 'Götgatan 25', inStock: 54, sold: 42, expired: 4, inOrder: 7 },
    { category: 'Hoodies', storeId: '3', storeName: 'Kungsgatan 18', inStock: 70, sold: 56, expired: 8, inOrder: 12 },
    { category: 'Sweaters', storeId: '1', storeName: 'Drottninggatan 63', inStock: 84, sold: 68, expired: 8, inOrder: 16 },
    { category: 'Sweaters', storeId: '2', storeName: 'Götgatan 25', inStock: 73, sold: 59, expired: 10, inOrder: 11 },
    { category: 'Sweaters', storeId: '3', storeName: 'Kungsgatan 18', inStock: 92, sold: 77, expired: 11, inOrder: 18 },
    { category: 'Accessories', storeId: '1', storeName: 'Drottninggatan 63', inStock: 98, sold: 78, expired: 5, inOrder: 12 },
    { category: 'Accessories', storeId: '2', storeName: 'Götgatan 25', inStock: 85, sold: 68, expired: 6, inOrder: 16 },
    { category: 'Accessories', storeId: '3', storeName: 'Kungsgatan 18', inStock: 106, sold: 84, expired: 13, inOrder: 10 },
    { category: 'Other', storeId: '1', storeName: 'Drottninggatan 63', inStock: 28, sold: 22, expired: 3, inOrder: 3 },
    { category: 'Other', storeId: '2', storeName: 'Götgatan 25', inStock: 24, sold: 19, expired: 1, inOrder: 3 },
    { category: 'Other', storeId: '3', storeName: 'Kungsgatan 18', inStock: 34, sold: 28, expired: 3, inOrder: 3 }
  ],
  fourteenDays: [
    { category: 'Tops', storeId: '1', storeName: 'Drottninggatan 63', inStock: 245, sold: 178, expired: 20, inOrder: 60 },
    { category: 'Tops', storeId: '2', storeName: 'Götgatan 25', inStock: 212, sold: 134, expired: 17, inOrder: 51 },
    { category: 'Tops', storeId: '3', storeName: 'Kungsgatan 18', inStock: 231, sold: 145, expired: 25, inOrder: 39 },
    { category: 'Jeans', storeId: '1', storeName: 'Drottninggatan 63', inStock: 189, sold: 224, expired: 15, inOrder: 27 },
    { category: 'Jeans', storeId: '2', storeName: 'Götgatan 25', inStock: 164, sold: 196, expired: 22, inOrder: 34 },
    { category: 'Jeans', storeId: '3', storeName: 'Kungsgatan 18', inStock: 204, sold: 210, expired: 24, inOrder: 44 },
    { category: 'Dresses', storeId: '1', storeName: 'Drottninggatan 63', inStock: 136, sold: 108, expired: 11, inOrder: 22 },
    { category: 'Dresses', storeId: '2', storeName: 'Götgatan 25', inStock: 118, sold: 96, expired: 12, inOrder: 15 },
    { category: 'Dresses', storeId: '3', storeName: 'Kungsgatan 18', inStock: 150, sold: 124, expired: 17, inOrder: 18 },
    { category: 'Shoes', storeId: '1', storeName: 'Drottninggatan 63', inStock: 104, sold: 76, expired: 8, inOrder: 14 },
    { category: 'Shoes', storeId: '2', storeName: 'Götgatan 25', inStock: 90, sold: 64, expired: 13, inOrder: 17 },
    { category: 'Shoes', storeId: '3', storeName: 'Kungsgatan 18', inStock: 116, sold: 84, expired: 13, inOrder: 15 },
    { category: 'Jackets', storeId: '1', storeName: 'Drottninggatan 63', inStock: 70, sold: 56, expired: 5, inOrder: 9 },
    { category: 'Jackets', storeId: '2', storeName: 'Götgatan 25', inStock: 58, sold: 44, expired: 6, inOrder: 11 },
    { category: 'Jackets', storeId: '3', storeName: 'Kungsgatan 18', inStock: 84, sold: 62, expired: 10, inOrder: 16 },
    { category: 'Trousers', storeId: '1', storeName: 'Drottninggatan 63', inStock: 156, sold: 130, expired: 18, inOrder: 23 },
    { category: 'Trousers', storeId: '2', storeName: 'Götgatan 25', inStock: 136, sold: 116, expired: 10, inOrder: 14 },
    { category: 'Trousers', storeId: '3', storeName: 'Kungsgatan 18', inStock: 168, sold: 144, expired: 21, inOrder: 23 },
    { category: 'Shorts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 84, sold: 56, expired: 7, inOrder: 14 },
    { category: 'Shorts', storeId: '2', storeName: 'Götgatan 25', inStock: 72, sold: 48, expired: 10, inOrder: 15 },
    { category: 'Shorts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 100, sold: 70, expired: 10, inOrder: 17 },
    { category: 'Skirts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 112, sold: 84, expired: 15, inOrder: 27 },
    { category: 'Skirts', storeId: '2', storeName: 'Götgatan 25', inStock: 96, sold: 72, expired: 11, inOrder: 14 },
    { category: 'Skirts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 124, sold: 96, expired: 6, inOrder: 19 },
    { category: 'Coats', storeId: '1', storeName: 'Drottninggatan 63', inStock: 44, sold: 36, expired: 3, inOrder: 10 },
    { category: 'Coats', storeId: '2', storeName: 'Götgatan 25', inStock: 38, sold: 30, expired: 2, inOrder: 6 },
    { category: 'Coats', storeId: '3', storeName: 'Kungsgatan 18', inStock: 56, sold: 44, expired: 6, inOrder: 11 },
    { category: 'Hoodies', storeId: '1', storeName: 'Drottninggatan 63', inStock: 124, sold: 98, expired: 17, inOrder: 28 },
    { category: 'Hoodies', storeId: '2', storeName: 'Götgatan 25', inStock: 108, sold: 84, expired: 7, inOrder: 10 },
    { category: 'Hoodies', storeId: '3', storeName: 'Kungsgatan 18', inStock: 140, sold: 112, expired: 15, inOrder: 25 },
    { category: 'Sweaters', storeId: '1', storeName: 'Drottninggatan 63', inStock: 168, sold: 136, expired: 14, inOrder: 31 },
    { category: 'Sweaters', storeId: '2', storeName: 'Götgatan 25', inStock: 146, sold: 118, expired: 13, inOrder: 28 },
    { category: 'Sweaters', storeId: '3', storeName: 'Kungsgatan 18', inStock: 184, sold: 154, expired: 12, inOrder: 34 },
    { category: 'Accessories', storeId: '1', storeName: 'Drottninggatan 63', inStock: 196, sold: 156, expired: 26, inOrder: 37 },
    { category: 'Accessories', storeId: '2', storeName: 'Götgatan 25', inStock: 170, sold: 136, expired: 14, inOrder: 32 },
    { category: 'Accessories', storeId: '3', storeName: 'Kungsgatan 18', inStock: 212, sold: 168, expired: 13, inOrder: 52 },
    { category: 'Other', storeId: '1', storeName: 'Drottninggatan 63', inStock: 56, sold: 44, expired: 4, inOrder: 8 },
    { category: 'Other', storeId: '2', storeName: 'Götgatan 25', inStock: 48, sold: 38, expired: 2, inOrder: 8 },
    { category: 'Other', storeId: '3', storeName: 'Kungsgatan 18', inStock: 68, sold: 56, expired: 7, inOrder: 13 }
  ],
  thirtyDays: [
    { category: 'Tops', storeId: '1', storeName: 'Drottninggatan 63', inStock: 512, sold: 367, expired: 40, inOrder: 105 },
    { category: 'Tops', storeId: '2', storeName: 'Götgatan 25', inStock: 445, sold: 289, expired: 55, inOrder: 54 },
    { category: 'Tops', storeId: '3', storeName: 'Kungsgatan 18', inStock: 487, sold: 312, expired: 62, inOrder: 80 },
    { category: 'Jeans', storeId: '1', storeName: 'Drottninggatan 63', inStock: 389, sold: 456, expired: 34, inOrder: 69 },
    { category: 'Jeans', storeId: '2', storeName: 'Götgatan 25', inStock: 338, sold: 401, expired: 28, inOrder: 49 },
    { category: 'Jeans', storeId: '3', storeName: 'Kungsgatan 18', inStock: 423, sold: 432, expired: 36, inOrder: 55 },
    { category: 'Dresses', storeId: '1', storeName: 'Drottninggatan 63', inStock: 278, sold: 223, expired: 21, inOrder: 44 },
    { category: 'Dresses', storeId: '2', storeName: 'Götgatan 25', inStock: 241, sold: 198, expired: 34, inOrder: 45 },
    { category: 'Dresses', storeId: '3', storeName: 'Kungsgatan 18', inStock: 312, sold: 256, expired: 38, inOrder: 33 },
    { category: 'Shoes', storeId: '1', storeName: 'Drottninggatan 63', inStock: 215, sold: 156, expired: 15, inOrder: 43 },
    { category: 'Shoes', storeId: '2', storeName: 'Götgatan 25', inStock: 187, sold: 132, expired: 15, inOrder: 40 },
    { category: 'Shoes', storeId: '3', storeName: 'Kungsgatan 18', inStock: 241, sold: 174, expired: 13, inOrder: 57 },
    { category: 'Jackets', storeId: '1', storeName: 'Drottninggatan 63', inStock: 145, sold: 112, expired: 11, inOrder: 16 },
    { category: 'Jackets', storeId: '2', storeName: 'Götgatan 25', inStock: 126, sold: 98, expired: 8, inOrder: 20 },
    { category: 'Jackets', storeId: '3', storeName: 'Kungsgatan 18', inStock: 178, sold: 134, expired: 18, inOrder: 32 },
    { category: 'Trousers', storeId: '1', storeName: 'Drottninggatan 63', inStock: 325, sold: 268, expired: 48, inOrder: 48 },
    { category: 'Trousers', storeId: '2', storeName: 'Götgatan 25', inStock: 282, sold: 241, expired: 26, inOrder: 67 },
    { category: 'Trousers', storeId: '3', storeName: 'Kungsgatan 18', inStock: 348, sold: 298, expired: 34, inOrder: 57 },
    { category: 'Shorts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 175, sold: 118, expired: 25, inOrder: 31 },
    { category: 'Shorts', storeId: '2', storeName: 'Götgatan 25', inStock: 152, sold: 102, expired: 18, inOrder: 22 },
    { category: 'Shorts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 208, sold: 145, expired: 15, inOrder: 40 },
    { category: 'Skirts', storeId: '1', storeName: 'Drottninggatan 63', inStock: 234, sold: 176, expired: 26, inOrder: 33 },
    { category: 'Skirts', storeId: '2', storeName: 'Götgatan 25', inStock: 203, sold: 152, expired: 26, inOrder: 33 },
    { category: 'Skirts', storeId: '3', storeName: 'Kungsgatan 18', inStock: 258, sold: 198, expired: 20, inOrder: 56 },
    { category: 'Coats', storeId: '1', storeName: 'Drottninggatan 63', inStock: 92, sold: 75, expired: 13, inOrder: 12 },
    { category: 'Coats', storeId: '2', storeName: 'Götgatan 25', inStock: 80, sold: 63, expired: 9, inOrder: 19 },
    { category: 'Coats', storeId: '3', storeName: 'Kungsgatan 18', inStock: 116, sold: 92, expired: 17, inOrder: 21 },
    { category: 'Hoodies', storeId: '1', storeName: 'Drottninggatan 63', inStock: 258, sold: 204, expired: 31, inOrder: 35 },
    { category: 'Hoodies', storeId: '2', storeName: 'Götgatan 25', inStock: 224, sold: 176, expired: 28, inOrder: 39 },
    { category: 'Hoodies', storeId: '3', storeName: 'Kungsgatan 18', inStock: 292, sold: 234, expired: 35, inOrder: 60 },
    { category: 'Sweaters', storeId: '1', storeName: 'Drottninggatan 63', inStock: 348, sold: 282, expired: 44, inOrder: 42 },
    { category: 'Sweaters', storeId: '2', storeName: 'Götgatan 25', inStock: 302, sold: 245, expired: 44, inOrder: 58 },
    { category: 'Sweaters', storeId: '3', storeName: 'Kungsgatan 18', inStock: 382, sold: 318, expired: 42, inOrder: 68 },
    { category: 'Accessories', storeId: '1', storeName: 'Drottninggatan 63', inStock: 408, sold: 325, expired: 59, inOrder: 57 },
    { category: 'Accessories', storeId: '2', storeName: 'Götgatan 25', inStock: 354, sold: 283, expired: 34, inOrder: 68 },
    { category: 'Accessories', storeId: '3', storeName: 'Kungsgatan 18', inStock: 442, sold: 352, expired: 31, inOrder: 68 },
    { category: 'Other', storeId: '1', storeName: 'Drottninggatan 63', inStock: 116, sold: 92, expired: 11, inOrder: 12 },
    { category: 'Other', storeId: '2', storeName: 'Götgatan 25', inStock: 101, sold: 80, expired: 11, inOrder: 22 },
    { category: 'Other', storeId: '3', storeName: 'Kungsgatan 18', inStock: 142, sold: 116, expired: 8, inOrder: 14 }
  ],
  dailyStockByMonth: {
    currentMonth: [
      { date: '2024-12-01', totalStock: 12450 },
      { date: '2024-12-02', totalStock: 12380 },
      { date: '2024-12-03', totalStock: 12320 },
      { date: '2024-12-04', totalStock: 12250 },
      { date: '2024-12-05', totalStock: 12190 },
      { date: '2024-12-06', totalStock: 12130 },
      { date: '2024-12-07', totalStock: 12070 },
      { date: '2024-12-08', totalStock: 12010 },
      { date: '2024-12-09', totalStock: 11950 },
      { date: '2024-12-10', totalStock: 11890 },
      { date: '2024-12-11', totalStock: 11830 },
      { date: '2024-12-12', totalStock: 11770 },
      { date: '2024-12-13', totalStock: 11710 },
      { date: '2024-12-14', totalStock: 11650 },
      { date: '2024-12-15', totalStock: 11590 },
      { date: '2024-12-16', totalStock: 11530 },
      { date: '2024-12-17', totalStock: 11470 },
      { date: '2024-12-18', totalStock: 11410 },
      { date: '2024-12-19', totalStock: 11350 },
      { date: '2024-12-20', totalStock: 11290 },
      { date: '2024-12-21', totalStock: 11230 },
      { date: '2024-12-22', totalStock: 11170 },
      { date: '2024-12-23', totalStock: 11110 },
      { date: '2024-12-24', totalStock: 11050 },
      { date: '2024-12-25', totalStock: 10990 },
      { date: '2024-12-26', totalStock: 10930 },
      { date: '2024-12-27', totalStock: 10870 },
      { date: '2024-12-28', totalStock: 10810 },
      { date: '2024-12-29', totalStock: 10750 },
      { date: '2024-12-30', totalStock: 10690 },
      { date: '2024-12-31', totalStock: 10630 }
    ],
    previousMonth: [
      { date: '2024-11-01', totalStock: 11800 },
      { date: '2024-11-02', totalStock: 11730 },
      { date: '2024-11-03', totalStock: 11670 },
      { date: '2024-11-04', totalStock: 11600 },
      { date: '2024-11-05', totalStock: 11540 },
      { date: '2024-11-06', totalStock: 11480 },
      { date: '2024-11-07', totalStock: 11420 },
      { date: '2024-11-08', totalStock: 11360 },
      { date: '2024-11-09', totalStock: 11300 },
      { date: '2024-11-10', totalStock: 11240 },
      { date: '2024-11-11', totalStock: 11180 },
      { date: '2024-11-12', totalStock: 11120 },
      { date: '2024-11-13', totalStock: 11060 },
      { date: '2024-11-14', totalStock: 11000 },
      { date: '2024-11-15', totalStock: 10940 },
      { date: '2024-11-16', totalStock: 10880 },
      { date: '2024-11-17', totalStock: 10820 },
      { date: '2024-11-18', totalStock: 10760 },
      { date: '2024-11-19', totalStock: 10700 },
      { date: '2024-11-20', totalStock: 10640 },
      { date: '2024-11-21', totalStock: 10580 },
      { date: '2024-11-22', totalStock: 10520 },
      { date: '2024-11-23', totalStock: 10460 },
      { date: '2024-11-24', totalStock: 10400 },
      { date: '2024-11-25', totalStock: 10340 },
      { date: '2024-11-26', totalStock: 10280 },
      { date: '2024-11-27', totalStock: 10220 },
      { date: '2024-11-28', totalStock: 10160 },
      { date: '2024-11-29', totalStock: 10100 },
      { date: '2024-11-30', totalStock: 10040 }
    ]
  }
};
