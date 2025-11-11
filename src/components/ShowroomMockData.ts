import { ShowroomProduct, ShowroomOrder, ShowroomAnalytics, CartItem, LineSheet } from './ShowroomTypes';

export const mockShowroomProducts: ShowroomProduct[] = [
  {
    id: 'prod-001',
    partnerId: 'partner-001',
    partnerName: 'Sellpy',
    productType: 'resell',
    sku: 'SP-VDJ-001',
    title: 'Vintage Levi\'s Denim Jacket',
    description: 'Classic vintage Levi\'s trucker jacket in excellent condition. Perfect for layering.',
    brand: 'Levi\'s',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?w=800',
      'https://images.unsplash.com/photo-1761245046147-0db73dad8e16?w=800',
      'https://images.unsplash.com/photo-1759602820949-4cfa360a9c33?w=800'
    ],
    color: 'Blue',
    size: 'M',
    season: 'All Season',
    condition: 'Excellent',
    fabric: 'Denim',
    sustainabilityFlags: ['Pre-owned', 'Circular'],
    msrp: 150,
    wholesalePrice: 75,
    priceTiers: [
      { minQuantity: 1, maxQuantity: 9, price: 75 },
      { minQuantity: 10, maxQuantity: 49, price: 65 },
      { minQuantity: 50, price: 55 }
    ],
    moq: 5,
    leadTime: 7,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    stock: 50,
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'prod-002',
    partnerId: 'partner-001',
    partnerName: 'Sellpy',
    productType: 'resell',
    sku: 'SP-CSD-002',
    title: 'Cotton Summer Dress',
    description: 'Light and airy cotton dress perfect for warm weather.',
    brand: 'H&M',
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1578404449256-0de908ee34ca?w=800',
      'https://images.unsplash.com/photo-1564587081321-62723533e3c0?w=800'
    ],
    color: 'White',
    size: 'L',
    season: 'Summer',
    condition: 'Good',
    fabric: 'Cotton',
    sustainabilityFlags: ['Pre-owned'],
    msrp: 80,
    wholesalePrice: 35,
    priceTiers: [
      { minQuantity: 1, maxQuantity: 19, price: 35 },
      { minQuantity: 20, price: 28 }
    ],
    moq: 3,
    leadTime: 5,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    stock: 120,
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'prod-003',
    partnerId: 'partner-002',
    partnerName: 'Nordic Textiles',
    productType: 'external',
    sku: 'NT-WOOL-001',
    gtin: '7350123456789',
    title: 'Merino Wool Sweater',
    description: 'Premium merino wool sweater, ethically sourced from Nordic farms.',
    brand: 'Nordic Textiles',
    category: 'Knitwear',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1731399211410-e3ffe1560310?w=800',
      'https://images.unsplash.com/photo-1601006696507-29aae73629ae?w=800'
    ],
    color: 'Gray',
    size: 'Various',
    season: 'Fall/Winter',
    fabric: 'Merino Wool',
    sustainabilityFlags: ['Ethically sourced', 'Natural materials'],
    msrp: 180,
    wholesalePrice: 90,
    priceTiers: [
      { minQuantity: 10, maxQuantity: 49, price: 90 },
      { minQuantity: 50, maxQuantity: 99, price: 80 },
      { minQuantity: 100, price: 70 }
    ],
    moq: 10,
    leadTime: 14,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    stock: 500,
    status: 'active',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'prod-004',
    partnerId: 'partner-003',
    partnerName: 'EcoFashion Co',
    productType: 'produce_on_demand',
    sku: 'EF-ORG-TSHIRT',
    title: 'Organic Cotton T-Shirt',
    description: 'Made to order organic cotton t-shirt. Available in multiple colors.',
    brand: 'EcoFashion',
    category: 'Basics',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1643286131725-5e0ad3b3ca02?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Organic Cotton',
    sustainabilityFlags: ['Organic', 'Made to order', 'Carbon neutral'],
    msrp: 45,
    wholesalePrice: 20,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 199, price: 20 },
      { minQuantity: 200, maxQuantity: 499, price: 18 },
      { minQuantity: 500, price: 15 }
    ],
    moq: 50,
    leadTime: 21,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-12T10:00:00Z'
  },
  {
    id: 'prod-005',
    partnerId: 'partner-003',
    partnerName: 'EcoFashion Co',
    productType: 'white_label',
    sku: 'EF-WL-HOODIE',
    title: 'Premium Hoodie',
    description: 'High-quality hoodie ready for your brand customization. Includes custom labeling options.',
    brand: 'Your Brand',
    category: 'Loungewear',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Cotton Blend',
    sustainabilityFlags: ['Ethical production'],
    msrp: 120,
    wholesalePrice: 45,
    priceTiers: [
      { minQuantity: 25, maxQuantity: 99, price: 45 },
      { minQuantity: 100, maxQuantity: 249, price: 40 },
      { minQuantity: 250, price: 35 }
    ],
    moq: 25,
    leadTime: 28,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z'
  },
  {
    id: 'prod-006',
    partnerId: 'partner-001',
    partnerName: 'Sellpy',
    productType: 'resell',
    sku: 'SP-SNK-003',
    title: 'Designer Sneakers',
    description: 'Gently used designer sneakers in great condition.',
    brand: 'Nike',
    category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1651371409956-20e79c06a8bb?w=800'
    ],
    color: 'White',
    size: '42',
    season: 'All Season',
    condition: 'Good',
    sustainabilityFlags: ['Pre-owned'],
    msrp: 200,
    wholesalePrice: 80,
    priceTiers: [
      { minQuantity: 1, maxQuantity: 9, price: 80 },
      { minQuantity: 10, price: 70 }
    ],
    moq: 2,
    leadTime: 7,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    stock: 25,
    status: 'active',
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z'
  },
  // Chinese Partner Products (Shenzhen Fashion Manufacturing)
  {
    id: 'prod-007',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'produce_on_demand',
    sku: 'SFM-POLO-001',
    title: 'Performance Polo Shirt',
    description: 'High-quality moisture-wicking polo shirt with custom embroidery options. Perfect for corporate wear.',
    brand: 'Custom Brand',
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
      'https://images.unsplash.com/photo-1720514496503-c399e2af61d2?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Polyester Blend',
    msrp: 65,
    wholesalePrice: 22,
    priceTiers: [
      { minQuantity: 100, maxQuantity: 499, price: 22 },
      { minQuantity: 500, maxQuantity: 999, price: 19 },
      { minQuantity: 1000, price: 16 }
    ],
    moq: 100,
    leadTime: 35,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'prod-008',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-ACT-002',
    title: 'Athletic Leggings',
    description: 'Premium stretch leggings with moisture-wicking technology. Ready for your brand customization.',
    brand: 'Your Brand',
    category: 'Activewear',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
      'https://images.unsplash.com/photo-1626444231642-6bd985bca16a?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Nylon/Spandex',
    msrp: 85,
    wholesalePrice: 28,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 199, price: 28 },
      { minQuantity: 200, maxQuantity: 499, price: 25 },
      { minQuantity: 500, price: 22 }
    ],
    moq: 50,
    leadTime: 42,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z'
  },
  {
    id: 'prod-009',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'produce_on_demand',
    sku: 'SFM-JAC-003',
    title: 'Packable Rain Jacket',
    description: 'Lightweight, waterproof rain jacket with custom branding options. Compact and portable design.',
    brand: 'Custom Brand',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1635968691555-cb542a102cc9?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Waterproof Nylon',
    sustainabilityFlags: ['Recycled materials'],
    msrp: 120,
    wholesalePrice: 42,
    priceTiers: [
      { minQuantity: 100, maxQuantity: 299, price: 42 },
      { minQuantity: 300, maxQuantity: 599, price: 38 },
      { minQuantity: 600, price: 34 }
    ],
    moq: 100,
    leadTime: 45,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-18T10:00:00Z'
  },
  // More Chinese Partner Pick & Buy Products
  {
    id: 'prod-010',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-TANK-004',
    title: 'Athletic Tank Top',
    description: 'Breathable performance tank with custom printing capability. Perfect for fitness brands and activewear collections.',
    brand: 'Your Brand',
    category: 'Activewear',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
      'https://images.unsplash.com/photo-1758289863455-f5b1c8c76857?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Performance Mesh',
    msrp: 55,
    wholesalePrice: 18,
    priceTiers: [
      { minQuantity: 100, maxQuantity: 499, price: 18 },
      { minQuantity: 500, maxQuantity: 999, price: 15 },
      { minQuantity: 1000, price: 13 }
    ],
    moq: 100,
    leadTime: 38,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-19T10:00:00Z',
    updatedAt: '2025-01-19T10:00:00Z'
  },
  {
    id: 'prod-011',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-SHORT-005',
    title: 'Premium Shorts',
    description: 'Versatile athletic shorts with moisture-wicking fabric. Ready for your logo and branding.',
    brand: 'Your Brand',
    category: 'Activewear',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
      'https://images.unsplash.com/photo-1761483987072-87d19e89d13e?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Polyester Blend',
    msrp: 65,
    wholesalePrice: 22,
    priceTiers: [
      { minQuantity: 100, maxQuantity: 299, price: 22 },
      { minQuantity: 300, maxQuantity: 599, price: 19 },
      { minQuantity: 600, price: 17 }
    ],
    moq: 100,
    leadTime: 40,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'prod-012',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-TEE-006',
    title: 'Classic Cotton Tee',
    description: 'Premium cotton t-shirt with superior fabric quality. Ideal for screen printing and heat transfer.',
    brand: 'Your Brand',
    category: 'Basics',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Premium Cotton',
    msrp: 45,
    wholesalePrice: 14,
    priceTiers: [
      { minQuantity: 200, maxQuantity: 499, price: 14 },
      { minQuantity: 500, maxQuantity: 999, price: 12 },
      { minQuantity: 1000, price: 10 }
    ],
    moq: 200,
    leadTime: 35,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-21T10:00:00Z',
    updatedAt: '2025-01-21T10:00:00Z'
  },
  {
    id: 'prod-013',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-ZIP-007',
    title: 'Track Jacket',
    description: 'Full-zip track jacket with custom embroidery and patch options. Perfect for team wear and corporate branding.',
    brand: 'Your Brand',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1715609104589-97585b210c6e?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Polyester',
    msrp: 95,
    wholesalePrice: 32,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 199, price: 32 },
      { minQuantity: 200, maxQuantity: 499, price: 28 },
      { minQuantity: 500, price: 25 }
    ],
    moq: 50,
    leadTime: 42,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z'
  },
  {
    id: 'prod-014',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    productType: 'white_label',
    sku: 'SFM-CREW-008',
    title: 'Crewneck Sweatshirt',
    description: 'Classic crewneck sweatshirt with soft fleece interior. Ready for customization with your brand identity.',
    brand: 'Your Brand',
    category: 'Loungewear',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1760551732429-8a748fc471af?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'Fall/Winter',
    fabric: 'Cotton/Polyester Fleece',
    msrp: 85,
    wholesalePrice: 28,
    priceTiers: [
      { minQuantity: 100, maxQuantity: 299, price: 28 },
      { minQuantity: 300, maxQuantity: 599, price: 25 },
      { minQuantity: 600, price: 22 }
    ],
    moq: 100,
    leadTime: 38,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-23T10:00:00Z',
    updatedAt: '2025-01-23T10:00:00Z'
  },
  // New Supplier: Vietnam Textile Group (Pick & Buy specialist)
  {
    id: 'prod-015',
    partnerId: 'partner-007',
    partnerName: 'Vietnam Textile Group',
    productType: 'white_label',
    sku: 'VTG-DRESS-001',
    title: 'Cotton Summer Dress',
    description: 'Lightweight cotton dress with custom label options. Perfect for resort and summer collections.',
    brand: 'Your Brand',
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1578404449256-0de908ee34ca?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'Spring/Summer',
    fabric: 'Cotton',
    sustainabilityFlags: ['Ethical production'],
    msrp: 95,
    wholesalePrice: 32,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 199, price: 32 },
      { minQuantity: 200, maxQuantity: 499, price: 28 },
      { minQuantity: 500, price: 25 }
    ],
    moq: 50,
    leadTime: 40,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: 'prod-016',
    partnerId: 'partner-007',
    partnerName: 'Vietnam Textile Group',
    productType: 'white_label',
    sku: 'VTG-BLOUSE-002',
    title: 'Silk Blend Blouse',
    description: 'Elegant silk blend blouse ready for private label. Premium quality with custom tag and packaging.',
    brand: 'Your Brand',
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1564257631407-0aa8c46114be?w=800',
      'https://images.unsplash.com/photo-1761117228880-df2425bd70da?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'All Season',
    fabric: 'Silk Blend',
    msrp: 110,
    wholesalePrice: 38,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 149, price: 38 },
      { minQuantity: 150, maxQuantity: 349, price: 34 },
      { minQuantity: 350, price: 30 }
    ],
    moq: 50,
    leadTime: 45,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-25T10:00:00Z'
  },
  {
    id: 'prod-017',
    partnerId: 'partner-007',
    partnerName: 'Vietnam Textile Group',
    productType: 'white_label',
    sku: 'VTG-PANT-003',
    title: 'Linen Trousers',
    description: 'Comfortable linen trousers with custom branding. Perfect for boutique and lifestyle brands.',
    brand: 'Your Brand',
    category: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1715233749622-3216fe49e682?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'Spring/Summer',
    fabric: 'Linen',
    sustainabilityFlags: ['Natural materials', 'Ethical production'],
    msrp: 120,
    wholesalePrice: 42,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 149, price: 42 },
      { minQuantity: 150, maxQuantity: 299, price: 38 },
      { minQuantity: 300, price: 34 }
    ],
    moq: 50,
    leadTime: 42,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-26T10:00:00Z',
    updatedAt: '2025-01-26T10:00:00Z'
  },
  // New Supplier: Istanbul Fashion Hub (Pick & Buy)
  {
    id: 'prod-018',
    partnerId: 'partner-008',
    partnerName: 'Istanbul Fashion Hub',
    productType: 'white_label',
    sku: 'IFH-KNIT-001',
    title: 'Cashmere Blend Sweater',
    description: 'Luxurious cashmere blend knitwear ready for your brand. Premium quality with European standards.',
    brand: 'Your Brand',
    category: 'Knitwear',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800'
    ],
    color: 'Various',
    size: 'Various',
    season: 'Fall/Winter',
    fabric: 'Cashmere Blend',
    msrp: 180,
    wholesalePrice: 65,
    priceTiers: [
      { minQuantity: 30, maxQuantity: 99, price: 65 },
      { minQuantity: 100, maxQuantity: 199, price: 58 },
      { minQuantity: 200, price: 52 }
    ],
    moq: 30,
    leadTime: 35,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z'
  },
  {
    id: 'prod-019',
    partnerId: 'partner-008',
    partnerName: 'Istanbul Fashion Hub',
    productType: 'white_label',
    sku: 'IFH-CARD-002',
    title: 'Merino Cardigan',
    description: 'Premium merino wool cardigan with custom label service. Perfect for premium lifestyle brands.',
    brand: 'Your Brand',
    category: 'Knitwear',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    color: 'Various',
    size: 'Various',
    season: 'Fall/Winter',
    fabric: 'Merino Wool',
    sustainabilityFlags: ['Natural materials'],
    msrp: 165,
    wholesalePrice: 58,
    priceTiers: [
      { minQuantity: 30, maxQuantity: 99, price: 58 },
      { minQuantity: 100, maxQuantity: 199, price: 52 },
      { minQuantity: 200, price: 48 }
    ],
    moq: 30,
    leadTime: 38,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-28T10:00:00Z'
  },
  {
    id: 'prod-020',
    partnerId: 'partner-008',
    partnerName: 'Istanbul Fashion Hub',
    productType: 'white_label',
    sku: 'IFH-SCARF-003',
    title: 'Wool Scarf',
    description: 'Handcrafted wool scarf with custom weaving and branding options. Artisan quality for premium brands.',
    brand: 'Your Brand',
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800',
      'https://images.unsplash.com/photo-1633903422938-8291a4606408?w=800'
    ],
    color: 'Various',
    size: 'One Size',
    season: 'Fall/Winter',
    fabric: 'Wool',
    sustainabilityFlags: ['Handcrafted', 'Natural materials'],
    msrp: 75,
    wholesalePrice: 26,
    priceTiers: [
      { minQuantity: 50, maxQuantity: 149, price: 26 },
      { minQuantity: 150, maxQuantity: 299, price: 23 },
      { minQuantity: 300, price: 20 }
    ],
    moq: 50,
    leadTime: 30,
    availabilityWindow: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    status: 'active',
    createdAt: '2025-01-29T10:00:00Z',
    updatedAt: '2025-01-29T10:00:00Z'
  }
];

export const mockShowroomOrders: ShowroomOrder[] = [
  {
    id: 'ORD-2025-001',
    buyerId: 'buyer-001',
    buyerName: 'John Smith',
    buyerCompany: 'Fashion Retail AB',
    partnerId: 'partner-001',
    partnerName: 'Sellpy',
    type: 'po',
    status: 'in_review',
    items: [
      {
        productId: 'prod-001',
        sku: 'SP-VDJ-001',
        title: 'Vintage Levi\'s Denim Jacket',
        quantity: 10,
        pricePerUnit: 65,
        subtotal: 650,
        image: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?w=200'
      },
      {
        productId: 'prod-002',
        sku: 'SP-CSD-002',
        title: 'Cotton Summer Dress',
        quantity: 20,
        pricePerUnit: 28,
        subtotal: 560,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200'
      }
    ],
    subtotal: 1210,
    shippingTerms: 'DDP',
    requestedDeliveryDate: '2025-02-15',
    notes: 'Please ensure items are properly folded and packaged.',
    createdAt: '2025-01-20T10:30:00Z',
    updatedAt: '2025-01-20T10:30:00Z'
  },
  {
    id: 'ORD-2025-002',
    buyerId: 'buyer-002',
    buyerName: 'Anna Andersson',
    buyerCompany: 'Stockholm Fashion',
    partnerId: 'partner-002',
    partnerName: 'Nordic Textiles',
    type: 'po',
    status: 'approved',
    items: [
      {
        productId: 'prod-003',
        sku: 'NT-WOOL-001',
        title: 'Merino Wool Sweater',
        quantity: 50,
        pricePerUnit: 80,
        subtotal: 4000
      }
    ],
    subtotal: 4000,
    shippingTerms: 'FOB',
    requestedDeliveryDate: '2025-02-28',
    createdAt: '2025-01-18T14:00:00Z',
    updatedAt: '2025-01-19T09:15:00Z'
  },
  {
    id: 'ORD-2025-003',
    buyerId: 'buyer-001',
    buyerName: 'John Smith',
    buyerCompany: 'Fashion Retail AB',
    partnerId: 'partner-003',
    partnerName: 'EcoFashion Co',
    type: 'rfq',
    status: 'negotiation',
    items: [
      {
        productId: 'prod-004',
        sku: 'EF-ORG-TSHIRT',
        title: 'Organic Cotton T-Shirt',
        quantity: 200,
        pricePerUnit: 18,
        subtotal: 3600
      }
    ],
    subtotal: 3600,
    shippingTerms: 'To be negotiated',
    notes: 'Looking for best pricing on first order. Potential for recurring orders.',
    createdAt: '2025-01-21T11:00:00Z',
    updatedAt: '2025-01-21T15:30:00Z'
  },
  // Chinese Partner (Shenzhen Fashion Manufacturing) Orders
  {
    id: 'ORD-2025-101',
    buyerId: 'buyer-003',
    buyerName: 'Maria Garcia',
    buyerCompany: 'European Fashion Retail',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'po',
    status: 'in_review',
    items: [
      {
        productId: 'prod-013',
        sku: 'SFM-ZIP-007',
        title: 'Track Jacket',
        quantity: 500,
        pricePerUnit: 28,
        subtotal: 14000,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 50 },
          { size: 'S', quantity: 100 },
          { size: 'M', quantity: 150 },
          { size: 'L', quantity: 125 },
          { size: 'XL', quantity: 75 }
        ]
      },
      {
        productId: 'prod-012',
        sku: 'SFM-TEE-006',
        title: 'Classic Cotton Tee',
        quantity: 800,
        pricePerUnit: 12,
        subtotal: 9600,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 160 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 120 }
        ]
      }
    ],
    subtotal: 23600,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-03-15',
    notes: 'First order - please ensure quality standards are met. Custom labeling required with our brand logo.',
    createdAt: '2025-01-22T08:00:00Z',
    updatedAt: '2025-01-22T08:00:00Z'
  },
  {
    id: 'ORD-2025-102',
    buyerId: 'buyer-004',
    buyerName: 'Lars Petersen',
    buyerCompany: 'Nordic Retail Group',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'po',
    status: 'approved',
    items: [
      {
        productId: 'prod-007',
        sku: 'SFM-POLO-001',
        title: 'Performance Polo Shirt',
        quantity: 600,
        pricePerUnit: 35,
        subtotal: 21000,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 100 },
          { size: 'M', quantity: 200 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 100 }
        ]
      },
      {
        productId: 'prod-014',
        sku: 'SFM-CREW-008',
        title: 'Crewneck Sweatshirt',
        quantity: 400,
        pricePerUnit: 25,
        subtotal: 10000,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 40 },
          { size: 'S', quantity: 80 },
          { size: 'M', quantity: 120 },
          { size: 'L', quantity: 100 },
          { size: 'XL', quantity: 60 }
        ]
      }
    ],
    subtotal: 31000,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-02-28',
    notes: 'Repeat order - same specifications as previous batch. Embroidery on left chest.',
    createdAt: '2025-01-18T12:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  },
  // Chinese Partner RFQ (Quotation Requests)
  {
    id: 'RFQ-2025-101',
    buyerId: 'buyer-005',
    buyerName: 'Sophie Chen',
    buyerCompany: 'Urban Streetwear Brand',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-010',
        sku: 'SFM-TANK-004',
        title: 'Athletic Tank Top',
        quantity: 1000,
        pricePerUnit: 15,
        subtotal: 15000,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 100 },
          { size: 'S', quantity: 250 },
          { size: 'M', quantity: 300 },
          { size: 'L', quantity: 250 },
          { size: 'XL', quantity: 100 }
        ]
      },
      {
        productId: 'prod-011',
        sku: 'SFM-SHORT-005',
        title: 'Premium Shorts - Pick & Buy',
        quantity: 800,
        pricePerUnit: 19,
        subtotal: 15200,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 200 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 80 }
        ]
      }
    ],
    subtotal: 30200,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-04-01',
    notes: 'Looking for best pricing for initial order. Planning quarterly reorders if quality meets expectations. Need custom hang tags and poly bags.',
    createdAt: '2025-01-23T14:30:00Z',
    updatedAt: '2025-01-23T14:30:00Z'
  },
  {
    id: 'RFQ-2025-102',
    buyerId: 'buyer-006',
    buyerName: 'Michael Brown',
    buyerCompany: 'Fitness Apparel Co',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'negotiation',
    items: [
      {
        productId: 'prod-012',
        sku: 'SFM-TEE-006',
        title: 'Classic Cotton Tee - Pick & Buy',
        quantity: 2000,
        pricePerUnit: 10,
        subtotal: 20000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 200 },
          { size: 'S', quantity: 400 },
          { size: 'M', quantity: 600 },
          { size: 'L', quantity: 500 },
          { size: 'XL', quantity: 300 }
        ]
      }
    ],
    subtotal: 20000,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-03-20',
    notes: 'Bulk order for summer collection launch. Requesting sample before full production. Need competitive pricing for 2000+ unit orders.',
    createdAt: '2025-01-19T09:00:00Z',
    updatedAt: '2025-01-21T16:45:00Z'
  },
  {
    id: 'RFQ-2025-103',
    buyerId: 'buyer-007',
    buyerName: 'Emma Wilson',
    buyerCompany: 'Boutique Fashion Group',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'accepted',
    items: [
      {
        productId: 'prod-013',
        sku: 'SFM-ZIP-007',
        title: 'Track Jacket - Pick & Buy',
        quantity: 300,
        pricePerUnit: 28,
        subtotal: 8400,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 60 },
          { size: 'M', quantity: 120 },
          { size: 'L', quantity: 90 },
          { size: 'XL', quantity: 30 }
        ]
      },
      {
        productId: 'prod-014',
        sku: 'SFM-CREW-008',
        title: 'Crewneck Sweatshirt - Pick & Buy',
        quantity: 250,
        pricePerUnit: 25,
        subtotal: 6250,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 25 },
          { size: 'S', quantity: 50 },
          { size: 'M', quantity: 75 },
          { size: 'L', quantity: 75 },
          { size: 'XL', quantity: 25 }
        ]
      }
    ],
    subtotal: 14650,
    shippingTerms: 'DDP to UK warehouse',
    requestedDeliveryDate: '2025-02-25',
    notes: 'Quote approved. Ready to convert to PO. Please proceed with production samples for approval.',
    createdAt: '2025-01-17T11:20:00Z',
    updatedAt: '2025-01-24T13:00:00Z'
  },
  {
    id: 'RFQ-2025-104',
    buyerId: 'buyer-008',
    buyerName: 'David Martinez',
    buyerCompany: 'Active Life Sports',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-008',
        sku: 'SFM-ACT-002',
        title: 'Athletic Leggings - White Label',
        quantity: 1500,
        pricePerUnit: 25,
        subtotal: 37500,
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 150 },
          { size: 'S', quantity: 300 },
          { size: 'M', quantity: 450 },
          { size: 'L', quantity: 400 },
          { size: 'XL', quantity: 200 }
        ]
      },
      {
        productId: 'prod-010',
        sku: 'SFM-TANK-004',
        title: 'Athletic Tank Top - Pick & Buy',
        quantity: 1200,
        pricePerUnit: 15,
        subtotal: 18000,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 120 },
          { size: 'S', quantity: 240 },
          { size: 'M', quantity: 360 },
          { size: 'L', quantity: 320 },
          { size: 'XL', quantity: 160 }
        ]
      }
    ],
    subtotal: 55500,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-04-10',
    notes: 'New athletic brand launch. Looking for competitive pricing and quality samples. Interested in long-term partnership with quarterly orders.',
    createdAt: '2025-01-24T10:15:00Z',
    updatedAt: '2025-01-24T10:15:00Z'
  },
  {
    id: 'RFQ-2025-105',
    buyerId: 'buyer-009',
    buyerName: 'Lisa Andersson',
    buyerCompany: 'Nordic Style Co',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'negotiation',
    items: [
      {
        productId: 'prod-009',
        sku: 'SFM-JAC-003',
        title: 'Packable Rain Jacket',
        quantity: 600,
        pricePerUnit: 38,
        subtotal: 22800,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 120 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 180 },
          { size: 'XL', quantity: 60 }
        ]
      }
    ],
    subtotal: 22800,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-03-30',
    notes: 'Requesting better pricing for 600+ units. Also need custom branding on chest and back. Can we discuss fabric upgrade options?',
    createdAt: '2025-01-20T15:00:00Z',
    updatedAt: '2025-01-23T09:30:00Z'
  },
  {
    id: 'RFQ-2025-106',
    buyerId: 'buyer-010',
    buyerName: 'James Thompson',
    buyerCompany: 'Urban Wear Ltd',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-007',
        sku: 'SFM-POLO-001',
        title: 'Performance Polo Shirt',
        quantity: 1000,
        pricePerUnit: 19,
        subtotal: 19000,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 200 },
          { size: 'M', quantity: 400 },
          { size: 'L', quantity: 300 },
          { size: 'XL', quantity: 100 }
        ]
      }
    ],
    subtotal: 19000,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-03-15',
    notes: 'Corporate order for company uniforms. Need embroidery on left chest with company logo. Requesting samples in navy, black, and white.',
    createdAt: '2025-01-25T08:45:00Z',
    updatedAt: '2025-01-25T08:45:00Z'
  },
  {
    id: 'RFQ-2025-107',
    buyerId: 'buyer-011',
    buyerName: 'Anna Kowalski',
    buyerCompany: 'Premium Basics',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'accepted',
    items: [
      {
        productId: 'prod-012',
        sku: 'SFM-TEE-006',
        title: 'Classic Cotton Tee - Pick & Buy',
        quantity: 1500,
        pricePerUnit: 10,
        subtotal: 15000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 150 },
          { size: 'S', quantity: 300 },
          { size: 'M', quantity: 450 },
          { size: 'L', quantity: 400 },
          { size: 'XL', quantity: 200 }
        ]
      },
      {
        productId: 'prod-014',
        sku: 'SFM-CREW-008',
        title: 'Crewneck Sweatshirt - Pick & Buy',
        quantity: 800,
        pricePerUnit: 25,
        subtotal: 20000,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 160 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 120 }
        ]
      }
    ],
    subtotal: 35000,
    shippingTerms: 'DDP to Poland warehouse',
    requestedDeliveryDate: '2025-02-28',
    notes: 'Quote approved at proposed pricing. Ready to proceed with order. Please send production timeline and sample for final approval.',
    createdAt: '2025-01-16T12:00:00Z',
    updatedAt: '2025-01-24T16:20:00Z'
  },
  {
    id: 'RFQ-2025-108',
    buyerId: 'buyer-012',
    buyerName: 'Pierre Dubois',
    buyerCompany: 'Parisian Fashion House',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'negotiation',
    items: [
      {
        productId: 'prod-011',
        sku: 'SFM-SHORT-005',
        title: 'Premium Shorts - Pick & Buy',
        quantity: 900,
        pricePerUnit: 19,
        subtotal: 17100,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 90 },
          { size: 'S', quantity: 225 },
          { size: 'M', quantity: 270 },
          { size: 'L', quantity: 225 },
          { size: 'XL', quantity: 90 }
        ]
      },
      {
        productId: 'prod-013',
        sku: 'SFM-ZIP-007',
        title: 'Track Jacket - Pick & Buy',
        quantity: 600,
        pricePerUnit: 28,
        subtotal: 16800,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 120 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 180 },
          { size: 'XL', quantity: 60 }
        ]
      }
    ],
    subtotal: 33900,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-03-25',
    notes: 'Discussing volume discount for combined order. Also interested in custom label and packaging options. Can you provide eco-friendly packaging alternatives?',
    createdAt: '2025-01-22T11:30:00Z',
    updatedAt: '2025-01-24T14:15:00Z'
  },
  {
    id: 'RFQ-2025-109',
    buyerId: 'buyer-013',
    buyerName: 'Sarah Kim',
    buyerCompany: 'Global Sportswear',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'accepted',
    items: [
      {
        productId: 'prod-008',
        sku: 'SFM-ACT-002',
        title: 'Athletic Leggings - White Label',
        quantity: 2000,
        pricePerUnit: 22,
        subtotal: 44000,
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 200 },
          { size: 'S', quantity: 400 },
          { size: 'M', quantity: 600 },
          { size: 'L', quantity: 500 },
          { size: 'XL', quantity: 300 }
        ]
      },
      {
        productId: 'prod-010',
        sku: 'SFM-TANK-004',
        title: 'Athletic Tank Top - Pick & Buy',
        quantity: 1800,
        pricePerUnit: 13,
        subtotal: 23400,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 180 },
          { size: 'S', quantity: 360 },
          { size: 'M', quantity: 540 },
          { size: 'L', quantity: 450 },
          { size: 'XL', quantity: 270 }
        ]
      }
    ],
    subtotal: 67400,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-02-20',
    notes: 'Converted to PO-2025-103. Production started. Samples approved. Custom hang tags ordered.',
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z'
  },
  {
    id: 'RFQ-2025-110',
    buyerId: 'buyer-014',
    buyerName: 'Marco Rossi',
    buyerCompany: 'Italian Fashion Imports',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'declined',
    items: [
      {
        productId: 'prod-007',
        sku: 'SFM-POLO-001',
        title: 'Performance Polo Shirt',
        quantity: 150,
        pricePerUnit: 22,
        subtotal: 3300,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 30 },
          { size: 'M', quantity: 60 },
          { size: 'L', quantity: 45 },
          { size: 'XL', quantity: 15 }
        ]
      }
    ],
    subtotal: 3300,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-03-01',
    notes: 'Order quantity below MOQ. Unable to proceed at this time. Customer declined to increase order size.',
    createdAt: '2025-01-21T13:45:00Z',
    updatedAt: '2025-01-23T11:00:00Z'
  },
  // Additional Pending RFQs for Demo (Approve/Reject workflow)
  {
    id: 'RFQ-2025-111',
    buyerId: 'buyer-015',
    buyerName: 'Christina Larsson',
    buyerCompany: 'Scandinavian Apparel AB',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-012',
        sku: 'SFM-TEE-006',
        title: 'Classic Cotton Tee - Pick & Buy',
        quantity: 3000,
        pricePerUnit: 9,
        subtotal: 27000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 300 },
          { size: 'S', quantity: 600 },
          { size: 'M', quantity: 900 },
          { size: 'L', quantity: 750 },
          { size: 'XL', quantity: 450 }
        ]
      },
      {
        productId: 'prod-011',
        sku: 'SFM-SHORT-005',
        title: 'Premium Shorts - Pick & Buy',
        quantity: 2000,
        pricePerUnit: 17,
        subtotal: 34000,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 200 },
          { size: 'S', quantity: 500 },
          { size: 'M', quantity: 600 },
          { size: 'L', quantity: 500 },
          { size: 'XL', quantity: 200 }
        ]
      }
    ],
    subtotal: 61000,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-04-15',
    notes: 'Large order for spring/summer collection. Need competitive pricing for 5000+ total units. Interested in establishing long-term partnership with quarterly orders. Require custom woven labels and individual poly bag packaging.',
    createdAt: '2025-01-26T09:15:00Z',
    updatedAt: '2025-01-26T09:15:00Z'
  },
  {
    id: 'RFQ-2025-112',
    buyerId: 'buyer-016',
    buyerName: 'Tom Anderson',
    buyerCompany: 'Fitness First Brands',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-008',
        sku: 'SFM-ACT-002',
        title: 'Athletic Leggings - White Label',
        quantity: 800,
        pricePerUnit: 25,
        subtotal: 20000,
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 80 },
          { size: 'S', quantity: 160 },
          { size: 'M', quantity: 240 },
          { size: 'L', quantity: 200 },
          { size: 'XL', quantity: 120 }
        ]
      },
      {
        productId: 'prod-010',
        sku: 'SFM-TANK-004',
        title: 'Athletic Tank Top - Pick & Buy',
        quantity: 600,
        pricePerUnit: 15,
        subtotal: 9000,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 60 },
          { size: 'S', quantity: 120 },
          { size: 'M', quantity: 180 },
          { size: 'L', quantity: 150 },
          { size: 'XL', quantity: 90 }
        ]
      }
    ],
    subtotal: 29000,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-03-28',
    notes: 'New activewear line launch. Need samples within 10 days for quality review. Looking for moisture-wicking fabric upgrade if possible. Custom silicone logo print on waistband for leggings.',
    createdAt: '2025-01-26T14:30:00Z',
    updatedAt: '2025-01-26T14:30:00Z'
  },
  {
    id: 'RFQ-2025-113',
    buyerName: 'Rachel Green',
    buyerCompany: 'Urban Lifestyle Boutique',
    buyerId: 'buyer-017',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-013',
        sku: 'SFM-ZIP-007',
        title: 'Track Jacket - Pick & Buy',
        quantity: 450,
        pricePerUnit: 28,
        subtotal: 12600,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 90 },
          { size: 'M', quantity: 180 },
          { size: 'L', quantity: 135 },
          { size: 'XL', quantity: 45 }
        ]
      },
      {
        productId: 'prod-014',
        sku: 'SFM-CREW-008',
        title: 'Crewneck Sweatshirt - Pick & Buy',
        quantity: 550,
        pricePerUnit: 24,
        subtotal: 13200,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 55 },
          { size: 'S', quantity: 110 },
          { size: 'M', quantity: 165 },
          { size: 'L', quantity: 138 },
          { size: 'XL', quantity: 82 }
        ]
      }
    ],
    subtotal: 25800,
    shippingTerms: 'DDP to Los Angeles warehouse',
    requestedDeliveryDate: '2025-03-10',
    notes: 'Boutique chain expansion order. Need custom embroidered logo on left chest (will provide artwork). Prefer brushed fleece interior for sweatshirts. Can you provide Pantone color matching?',
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z'
  },
  {
    id: 'RFQ-2025-114',
    buyerId: 'buyer-018',
    buyerName: 'Hans Mueller',
    buyerCompany: 'German Sports Retail GmbH',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-007',
        sku: 'SFM-POLO-001',
        title: 'Performance Polo Shirt',
        quantity: 1200,
        pricePerUnit: 18,
        subtotal: 21600,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 240 },
          { size: 'M', quantity: 480 },
          { size: 'L', quantity: 360 },
          { size: 'XL', quantity: 120 }
        ]
      }
    ],
    subtotal: 21600,
    shippingTerms: 'To be negotiated',
    requestedDeliveryDate: '2025-04-05',
    notes: 'Corporate uniforms for retail chain staff. Need consistent color matching across all units. Require UV-protective fabric if available. Custom screen print logo on back collar. Volume discounts for 1200+ units?',
    createdAt: '2025-01-27T16:20:00Z',
    updatedAt: '2025-01-27T16:20:00Z'
  },
  {
    id: 'RFQ-2025-115',
    buyerId: 'buyer-019',
    buyerName: 'Maria Santos',
    buyerCompany: 'Latin America Fashion Co',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    type: 'rfq',
    status: 'pending',
    items: [
      {
        productId: 'prod-009',
        sku: 'SFM-JAC-003',
        title: 'Packable Rain Jacket',
        quantity: 750,
        pricePerUnit: 36,
        subtotal: 27000,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
        sizeBreakdown: [
          { size: 'S', quantity: 150 },
          { size: 'M', quantity: 300 },
          { size: 'L', quantity: 225 },
          { size: 'XL', quantity: 75 }
        ]
      },
      {
        productId: 'prod-012',
        sku: 'SFM-TEE-006',
        title: 'Classic Cotton Tee - Pick & Buy',
        quantity: 1000,
        pricePerUnit: 10,
        subtotal: 10000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
        sizeBreakdown: [
          { size: 'XS', quantity: 100 },
          { size: 'S', quantity: 200 },
          { size: 'M', quantity: 300 },
          { size: 'L', quantity: 250 },
          { size: 'XL', quantity: 150 }
        ]
      }
    ],
    subtotal: 37000,
    shippingTerms: 'FOB Shanghai',
    requestedDeliveryDate: '2025-04-20',
    notes: 'Multi-market distribution across 5 countries. Need certification documentation for import compliance. Interested in water-repellent upgrade for jackets. Custom heat transfer labels preferred over woven tags.',
    createdAt: '2025-01-28T11:45:00Z',
    updatedAt: '2025-01-28T11:45:00Z'
  }
];

export const mockShowroomAnalytics: ShowroomAnalytics = {
  views: 2543,
  productDetailViews: 847,
  addToCart: 156,
  rfqSubmitted: 12,
  poSubmitted: 28,
  conversionRate: 4.7,
  topProducts: [
    { productId: 'prod-001', title: 'Vintage Levi\'s Denim Jacket', views: 234 },
    { productId: 'prod-003', title: 'Merino Wool Sweater', views: 189 },
    { productId: 'prod-002', title: 'Cotton Summer Dress', views: 156 }
  ],
  topCategories: [
    { category: 'Outerwear', views: 456 },
    { category: 'Knitwear', views: 342 },
    { category: 'Dresses', views: 298 }
  ]
};

export const mockLineSheets: LineSheet[] = [
  {
    id: 'ls-001',
    partnerId: '6',
    name: 'Spring 2025 Collection',
    productIds: ['prod-007', 'prod-008', 'prod-009'],
    availabilityWindow: {
      start: '2025-02-01',
      end: '2025-05-31'
    },
    markets: ['SE', 'NO', 'DK', 'FI', 'DE', 'CN', 'IN'],
    visibility: 'public',
    createdAt: '2025-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'ls-002',
    partnerId: '6',
    name: 'Summer Essentials',
    productIds: ['prod-007', 'prod-008'],
    availabilityWindow: {
      start: '2025-06-01',
      end: '2025-08-31'
    },
    markets: ['UK', 'FR', 'ES', 'IT'],
    visibility: 'private',
    shareToken: 'abc123def456',
    createdAt: '2025-01-18T14:00:00Z',
    status: 'active'
  }
];