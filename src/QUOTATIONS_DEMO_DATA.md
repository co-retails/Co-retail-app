# Buyer Quotations Demo Data

## Overview
Added comprehensive demo data for the Buyer Portal's Quotation Requests feature, showcasing the full quotation workflow from request to acceptance/decline.

## Data Added

### Location
- **File**: `/data/mockData.ts`
- **Export**: `mockBuyerQuotations: QuotationRequest[]`
- **State**: Initialized in `/hooks/useAppState.ts`

### Quotation Requests (7 total)

#### 1. QR-2024-001 - Winter Knitwear Collection
- **Status**: Received (awaiting buyer decision)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**: 
  - 500x Merino Wool Blend Sweaters (5 sizes)
  - 300x Cotton Cable Knit Cardigans (4 sizes)
- **Quoted Price**: $28,500
- **Lead Time**: 45 days
- **Valid Until**: Dec 15, 2024
- **Messages**: 4 messages (negotiation about pricing and shipping)

#### 2. QR-2024-002 - Spring Denim Collection
- **Status**: Pending (awaiting partner response)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**:
  - 800x Slim Fit Stretch Jeans (6 sizes)
  - 400x Wide Leg Denim Trousers (5 sizes)
- **Messages**: 1 message (initial request with sample inquiry)

#### 3. QR-2024-003 - Basic Organic T-Shirts
- **Status**: Accepted (deal closed)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**: 2000x Organic Cotton Basic T-Shirts (6 sizes, 4 colors)
- **Quoted Price**: $8,600 ($4.30/unit)
- **Lead Time**: 30 days
- **Valid Until**: Nov 30, 2024
- **Messages**: 3 messages (GOTS certification discussion and acceptance)

#### 4. QR-2024-004 - Winter Outerwear
- **Status**: Received (awaiting buyer decision)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**:
  - 600x Recycled Polyester Puffer Jackets (5 sizes, GRS certified)
  - 400x Wool Blend Overshirts (4 sizes)
- **Quoted Price**: $42,800
- **Lead Time**: 60 days
- **Valid Until**: Dec 10, 2024
- **Messages**: 2 messages (sustainability certifications discussion)

#### 5. QR-2024-005 - Summer Linen Dresses
- **Status**: Pending (awaiting partner response)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**: 350x Linen Midi Dresses (5 sizes, 3 colors)
- **Messages**: 1 message (testing new supplier for linen)

#### 6. QR-2024-006 - Tailored Wool Trousers
- **Status**: Declined (buyer rejected due to pricing)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**: 300x Tailored Wool Trousers (6 sizes, 3 colors)
- **Quoted Price**: $15,600 ($52/unit)
- **Lead Time**: 50 days
- **Messages**: 3 messages (price too high, declined)

#### 7. QR-2024-007 - Spring/Summer Shirts
- **Status**: Received (awaiting buyer decision)
- **Partner**: Shenzhen Fashion Manufacturing
- **Items**:
  - 700x Oxford Button-Down Shirts (5 sizes, 3 colors)
  - 450x Linen Blend Camp Collar Shirts (4 sizes, 3 colors)
- **Quoted Price**: $19,850
- **Lead Time**: 35 days (express production)
- **Valid Until**: Dec 17, 2024
- **Messages**: 2 messages (fast turnaround request, rush fee waived)

## Features Demonstrated

### Product Details
- Realistic SKUs (e.g., SFM-KNT-MW-001)
- Detailed specifications (materials, colors, features)
- Size breakdowns with quantities per size
- Total quantities ranging from 300 to 2,000 units

### Pricing & Terms
- Competitive B2B pricing ($4.30 - $58 per unit)
- Lead times (30-60 days)
- Quote validity periods
- Bulk discount mentions

### Message Threads
- Buyer-Partner conversations
- Negotiation discussions
- Technical questions about materials and certifications
- Timeline clarifications
- Acceptance/decline reasoning

### Status Coverage
- **Pending** (2): Awaiting partner response
- **Received** (3): Partner quoted, buyer needs to decide
- **Accepted** (1): Deal closed, moving to PO
- **Declined** (1): Buyer rejected the quote

## UI Features Supported

### BuyerQuotationsScreen
- Filterable tabs (All, Pending, Received, Accepted, Declined)
- List view with status badges
- Quick action buttons (View details, Edit, Accept, Decline)
- Real-time message threading
- Quote details display (price, lead time, validity)

### Design System Compliance
- Uses Material 3 color tokens (primary-container, tertiary-container, error-container, etc.)
- Typography follows M3 type scale (title-large, title-medium, body-small, etc.)
- Status badges with appropriate semantic colors
- Responsive layout (mobile and desktop views)

## Integration Points

The demo data automatically populates:
1. Quotation list counts in navigation
2. Status filter counts
3. Message thread UI
4. Edit quotation dialog
5. Accept/Decline actions
6. Partner information display

## Testing Scenarios

Users can now:
- Browse quotations by status
- View detailed product specifications
- Read conversation history
- See pricing and lead time information
- Test accept/decline flows
- Experience the edit functionality (for pending quotations)
- Send messages within quotation threads
