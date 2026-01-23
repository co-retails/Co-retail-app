# Features Documentation

This document provides comprehensive explanations of three key features in the Digital Showroom MVP:
1. Portal Configuration - Attributes and Pricing
2. Sellpy Order Flow
3. Buyer Portal

---

## 1. Portal Configuration - Attributes and Pricing

The Portal Configuration system provides centralized management of product attributes, pricing rules, and data mappings. This is accessible through the Portal Configuration Manager, which serves as the landing page for all configuration features.

### 1.1 Attributes Management

Attributes define the structure and validation rules for product data across the system. The attributes system consists of three main components:

#### 1.1.1 Attribute Dictionary

**Purpose**: Define master attributes that exist in the system for each brand.

**Key Features**:
- **Brand-specific attributes**: Each attribute is associated with a specific brand (e.g., Weekday, Monki, Cheap Monday)
- **Attribute types**: Supports different data types:
  - `text` - Free text input
  - `list` - Predefined dropdown values
  - `number` - Numeric values
  - `date` - Date values
- **Input types**: Controls how attributes are displayed:
  - `free-text` - Text input field
  - `dropdown` - Select dropdown
  - `chips` - Multi-select chips
- **Mandatory fields**: Mark attributes as required or optional
- **Help text**: Provide guidance for users filling out forms
- **Status management**: Activate or deactivate attributes
- **Usage tracking**: Shows how many categories use each attribute

**Common Attributes**:
- Color
- Size
- Gender
- Category
- Subcategory
- Brand
- Material
- Care instructions

**Access**: Admin-only feature accessible from Portal Configuration Landing → Attributes → Dictionary

#### 1.1.2 Dropdown Values

**Purpose**: Configure the valid options for dropdown and chips input types.

**Key Features**:
- **Brand and attribute selection**: Choose which brand and attribute to configure
- **Value management**: Create, edit, and delete dropdown values
- **Value structure**:
  - `code` - Internal identifier (e.g., "black", "xl")
  - `label` - Display name (e.g., "Black", "Extra Large")
  - `description` - Optional detailed description
- **Hierarchical values**: Support parent-child relationships (e.g., "Tops" → "T-Shirts")
- **Sorting**: Manual ordering of values in dropdowns
- **Status management**: Activate or deactivate specific values
- **Bulk operations**: Import/export values via CSV

**Example Values**:
- **Color**: Black, White, Navy, Red, etc.
- **Size**: XS, S, M, L, XL, XXL, or numeric sizes (28-46)
- **Category**: Clothing, Shoes, Accessories
- **Gender**: Men, Women, Kids, Unisex

**Access**: Admin-only feature accessible from Portal Configuration Landing → Attributes → Dropdown values

#### 1.1.3 AI Attribute Mappings

**Purpose**: View and manage AI-generated mappings between partner API values and brand dropdown values.

**Key Features**:
- **Automatic mapping**: AI system automatically maps partner values (e.g., "Svart" from Sellpy) to brand values (e.g., "Black" for Weekday)
- **Confidence scores**: Each mapping includes a confidence percentage (0-100%)
- **Multi-partner support**: View mappings for different partners (Sellpy, Thrifted, Vinted, etc.)
- **Brand-specific**: Mappings are brand-specific (Weekday vs Monki may have different mappings)
- **Attribute filtering**: Filter by attribute type (Color, Size, Gender, Subcategory)
- **Search functionality**: Search for specific partner or brand values
- **Mapping details**:
  - Partner value (original from API)
  - Brand value (standardized dropdown value)
  - Confidence score
  - Last updated timestamp
  - Mapping source (AI or manual)

**Use Cases**:
- Verify AI mapping accuracy
- Identify low-confidence mappings that need review
- Understand how partner data is normalized
- Debug data quality issues

**Access**: Admin-only feature accessible from Portal Configuration Landing → Attributes → AI Attribute Mappings

### 1.2 Pricing Management

The pricing system manages how products are priced for different partners and currencies, including fixed pricing and AI-powered dynamic pricing.

#### 1.2.1 Partner Pricing

**Purpose**: Set fixed price points per currency for each partner-brand combination.

**Key Features**:
- **Partner selection**: Configure pricing for specific partners (Sellpy Operations, Thrifted, etc.)
- **Brand-specific pricing**: Different price books for each brand
- **Multi-currency support**: Define prices in multiple currencies (SEK, EUR, USD, GBP, NOK)
- **Price points**: Define valid price points for each partner-brand-currency combination
- **Price book structure**:
  - Each price book contains an array of valid prices
  - Prices are currency-specific
  - Example: Weekday + Sellpy + SEK = [49, 99, 149, 199, 249, ...]
- **CRUD operations**: Create, read, update, and delete price books
- **Bulk editing**: Edit multiple price points at once via text input

**Example Configuration**:
```
Partner: Sellpy Operations
Brand: Weekday
Currency: SEK
Price Points: [49, 99, 149, 199, 249, 299, 349, 399, 449, 499, 599, 699, 799, 899, 999]
```

**Access**: Available to all users from Portal Configuration Landing → Pricing → Partner pricing

#### 1.2.2 Price Fork Calibration

**Purpose**: Adjust AI pricing parameters for API-integrated order creation (primarily for Sellpy).

**Key Features**:
- **AI pricing logic**: The system uses AI to determine appropriate sale prices based on purchase prices
- **Calibration parameters**:
  - **Brand tier weights**: Different brands have different pricing tiers (Premium, Standard, Value)
  - **Category mappings**: Categories influence pricing decisions
  - **Price fork ranges**: Define acceptable price ranges based on purchase price
  - **Confidence thresholds**: Set minimum confidence levels for AI pricing
- **Test items**: Test pricing logic with sample items
- **Confidence scoring**: Each price suggestion includes a confidence score
- **Visual feedback**: Color-coded confidence indicators:
  - Red: Low confidence (< 60%)
  - Yellow: Medium confidence (60-75%)
  - Green: High confidence (> 75%)
- **Price point snapping**: Automatically snaps to nearest valid price point from partner pricing
- **Margin calculation**: Shows calculated margin for each price suggestion

**How It Works**:
1. System receives purchase price in EUR
2. AI analyzes item attributes (brand, category, condition, etc.)
3. AI suggests sale price based on calibrated parameters
4. Price is converted to sales currency using exchange rates
5. Price is snapped to nearest valid price point
6. Confidence score is calculated

**Access**: Available to all users from Portal Configuration Landing → Pricing → Price Fork calibration

#### 1.2.3 Purchase Price Currency Converter

**Purpose**: Convert purchase prices from EUR (standard purchase currency) to sales price currency.

**Key Features**:
- **Exchange rate management**: Define exchange rates for converting EUR to sales currencies
- **Supported currencies**: SEK, USD, GBP, NOK, DKK (EUR is the base purchase currency)
- **Rate configuration**: Set exchange rate for each sales currency
- **Example**: 
  - Purchase price: 10 EUR
  - Exchange rate: 11.5 SEK/EUR
  - Converted purchase price: 115 SEK
- **CRUD operations**: Create, edit, and delete currency converters
- **Audit trail**: Track who last edited each exchange rate and when

**Use Cases**:
- Convert purchase prices for margin calculations
- Display purchase prices in local currency
- Support multi-currency operations

**Access**: Admin-only feature accessible from Portal Configuration Landing → Pricing → Purchase price currency converter

### 1.3 Configuration Access

**User Roles**:
- **Admin**: Full access to all configuration features
- **Regular users**: Access to Partner Pricing and Price Fork Calibration only

**Navigation Path**:
1. Access Portal Configuration from admin settings or direct navigation
2. Portal Configuration Landing shows all available sections
3. Click on any section card to navigate to that configuration screen
4. Use back button to return to landing page

---

## 2. Sellpy Order Flow

The Sellpy Order Flow is a specialized order processing workflow designed for orders created via API integration from Sellpy's system. This flow includes mandatory retailer ID scanning and strict validation requirements.

### 2.1 Overview

**Key Characteristics**:
- Orders are created automatically via API (not manually)
- All items must have retailer IDs before order registration
- Items may arrive with validation errors that need fixing
- Two-step scanning process for retailer IDs
- Cannot create delivery notes without all retailer IDs

### 2.2 Flow Stages

#### Stage 1: Order Creation (API Integration)
**Status**: `pending`

**Process**:
1. Order is created automatically from Sellpy's system via API
2. Items come pre-populated with basic information
3. Some items may have validation errors (missing fields, invalid values)
4. Items do NOT have retailer IDs initially

**API Endpoint**: `POST /api/orders/sellpy`

**Required Data**:
- External order ID (unique identifier from Sellpy)
- Partner ID (must be "Sellpy Operations")
- Warehouse ID
- Receiving store ID
- Items array with:
  - Item ID
  - Brand, gender, category, subcategory (may be missing)
  - Size, color (may be missing)
  - Price (required, > 0, ≤ 99,999 SEK)
  - Purchase price (required, > 0)
  - Retailer item ID (typically missing initially)

**Validation**:
- External order ID must be unique
- Minimum 1 item required
- Price must be valid (> 0, ≤ 99,999 SEK)
- Purchase price must be > 0

#### Stage 2: Fix Validation Errors (Optional)
**Status**: `pending`

**Process**:
1. User reviews order details
2. Items with errors are marked with error status
3. User can edit items to fix validation errors
4. Must fix all required fields before proceeding

**Common Errors**:
- Missing brand
- Missing category
- Missing size
- Missing color
- Invalid price

**API Endpoint**: `PATCH /api/orders/{orderId}/items/{itemId}`

#### Stage 3: Add Retailer IDs (Scanning Flow)
**Status**: `pending` → `in-progress`

**Process**:
1. User clicks "Add Retailer IDs" button on order details
2. Opens retailer ID scan screen
3. **Two-step scanning process**:
   - **Step 1**: Scan partner QR code on item (identifies which item)
   - **Step 2**: Scan retailer's barcode/QR code (links retailer ID to item)
4. Repeat for all items
5. Can skip items and come back later
6. Progress tracked: "X of Y items have retailer IDs"

**API Endpoint**: `POST /api/orders/{orderId}/items/{itemId}/retailer-id`

**Requirements**:
- Retailer item ID must be unique across all items in the system
- Order status must be `pending` or `in-progress`

**Progress Tracking**:
- Order status changes to `in-progress` when first retailer ID is added
- Status remains `in-progress` until all items have retailer IDs

#### Stage 4: Register Order
**Status**: `in-progress` → `registered`

**Process**:
1. All items must have retailer IDs
2. All validation errors must be fixed
3. User clicks "Register Order" button
4. Order status changes to `registered`
5. Post-registration dialog appears with options:
   - "Create Delivery Note" - Opens delivery note creation
   - "View Order List" - Returns to orders list

**API Endpoint**: `POST /api/orders/{orderId}/register`

**Validation Rules**:
- Order status must be `pending` or `in-progress`
- All items must have `retailerItemId`
- All items must pass validation (no errors)
- At least 1 item required

**Cannot Register If**:
- Any item is missing retailer ID
- Any item has validation errors
- Order is empty

#### Stage 5: Create Delivery Note
**Status**: `registered`

**Process**:
1. Can be done immediately after registration or later
2. Opens delivery note creation screen
3. Shows all items from the order
4. **Add boxes**:
   - Scan box labels (QR codes/barcodes) OR enter manually
   - Each box must have unique label
   - Boxes start with status `pending`
5. **Assign items to boxes**:
   - Scan items into boxes OR select items and assign to box
   - Each item can only be in one box
   - Items must have retailer IDs (enforced)
6. **Register boxes**:
   - Mark boxes as `registered` when they contain items
   - Cannot register empty boxes
7. **Register delivery note**:
   - All items must be assigned to boxes
   - At least one box must be registered
   - Creates delivery note with status `registered`

**API Endpoint**: `POST /api/delivery-notes`

**Validation**:
- All items from order must be included
- Each item must have `retailerItemId`
- No item can be in multiple boxes
- At least 1 box required
- All boxes must have items

#### Stage 6: Shipment
**Status**: `registered` → `in-transit`

**Process**:
1. When physical shipment occurs, delivery note status changes to `in-transit`
2. Can be done manually or via integration
3. Delivery appears in "Shipments" tab

**API Endpoint**: `PATCH /api/delivery-notes/{deliveryNoteId}/ship`

**Validation**:
- Delivery note status must be `registered`
- All boxes must be registered
- All items must be assigned to boxes

#### Stage 7: Receive at Store (Inbound Boxes)
**Status**: `in-transit` → `delivered`

**Process**:
1. Delivery appears in "Inbound" tab for store staff
2. Shows list of boxes expected
3. **Scan boxes**:
   - Store staff scans box labels (QR codes/barcodes)
   - Boxes move from "Not scanned" to "Scanned" tab
   - Can scan individually or bulk mark as scanned
4. **Register delivery**:
   - When all boxes are scanned, can register delivery
   - Delivery status changes to `Delivered`
   - Boxes status changes to `Delivered`

**API Endpoints**:
- `POST /api/deliveries/{deliveryId}/boxes/{boxId}/scan` - Scan individual box
- `POST /api/deliveries/{deliveryId}/boxes/bulk-scan` - Bulk scan boxes
- `POST /api/deliveries/{deliveryId}/register` - Register delivery

**Validation**:
- All boxes must be scanned
- Delivery status must be `in-transit`

### 2.3 Order Statuses

1. **`pending`** - Order created, items may have errors, no retailer IDs
2. **`in-progress`** - Some items have retailer IDs, scanning in progress
3. **`registered`** - All items have retailer IDs, ready for delivery note
4. **`in-transit`** - Delivery note created and shipped
5. **`delivered`** - Boxes received at store

### 2.4 Key Differences from Thrifted Flow

- **Order creation**: Via API (not manual)
- **Retailer IDs**: Mandatory scanning step (Thrifted: optional, entered directly)
- **Validation**: Items may have errors from API (Thrifted: validated at creation)
- **Registration**: Cannot register without all retailer IDs (Thrifted: can register without)
- **Delivery notes**: Cannot create without all retailer IDs (Thrifted: can create without)
- **Purchase price**: Required field (Thrifted: not used)

### 2.5 User Interface

**Key Screens**:
- **ShippingScreen** - Orders tab showing pending Sellpy orders
- **OrderDetailsScreen** - Order details with items needing retailer IDs
- **RetailerIdScanScreen** - Two-step scanning interface
- **DeliveryNoteCreationScreen** - Box management and item assignment
- **ShippingScreen** - Shipments tab for in-transit deliveries
- **ReceiveDeliveryScreen** - Store staff scanning interface

---

## 3. Buyer Portal

The Buyer Portal is a dedicated interface for retail buyers to browse partner showrooms, request quotations, manage purchase orders, and track shipments. It provides a streamlined experience for buyers to discover and order products from verified partners.

### 3.1 Overview

**Purpose**: Enable retail buyers to browse and order products from partner showrooms.

**User Role**: `buyer`

**Key Features**:
- Browse partner showrooms
- Request quotations
- Manage purchase orders
- Track shipments
- Wishlist management

### 3.2 Buyer Dashboard

**Purpose**: Central hub for buyer activities and quick access to key features.

**Key Components**:

#### 3.2.1 Header
- **Logo**: Brand logo display
- **Title**: "Buyer portal" label
- **Retailer/Country Selector**: Filter view by brand and country
- **Admin Settings**: Access to admin settings (if applicable)

#### 3.2.2 Primary Action Card
- **Explore Partner Showrooms**: Prominent call-to-action to browse products
- **Description**: "Discover products from verified partners worldwide"
- **Browse Products Button**: Navigate to showroom browse screen

#### 3.2.3 Quick Actions
- **Wishlist**: 
  - View saved products
  - Shows count of wishlist items
  - Quick access to wishlist screen
- **Quotation Requests**:
  - View pending quotations
  - Shows count of pending quotations
  - Quick access to quotations screen

#### 3.2.4 Statistics Display
- **Active Orders**: Number of pending purchase orders
- **Pending Quotations**: Number of quotation requests awaiting response
- **Wishlist Items**: Number of products saved to wishlist
- **Shipments In Transit**: Number of shipments currently in transit

### 3.3 Showroom Browse

**Purpose**: Browse products from partner showrooms.

**Key Features**:
- **Product catalog**: View products from all available partner showrooms
- **Filtering**: Filter by brand, category, price range, etc.
- **Search**: Search for specific products
- **Product details**: View product information, images, pricing
- **Add to cart**: Add products to shopping cart
- **Add to wishlist**: Save products for later
- **Request quotation**: Request pricing for specific products

**Navigation**: Dashboard → Browse Products → Showroom Browse

### 3.4 Wishlist Management

**Purpose**: Save and manage favorite products.

**Key Features**:
- **View wishlist**: See all saved products
- **Remove items**: Remove products from wishlist
- **Add to cart**: Move products from wishlist to cart
- **Product details**: View detailed product information
- **Request quotation**: Request pricing for wishlist items

**Navigation**: Dashboard → Wishlist → Wishlist Screen

### 3.5 Quotation Management

**Purpose**: Request and manage product quotations from partners.

**Key Features**:

#### 3.5.1 Request Quotation
- **Product selection**: Select products from showroom or cart
- **Quantity specification**: Specify quantities for each product
- **Notes**: Add special instructions or requirements
- **Submit request**: Send quotation request to partner

#### 3.5.2 View Quotations
- **Quotation list**: View all quotation requests
- **Status filtering**: Filter by status (pending, approved, rejected, expired)
- **Status indicators**:
  - **Pending**: Awaiting partner response
  - **Approved**: Partner approved, ready to convert to order
  - **Rejected**: Partner declined quotation
  - **Expired**: Quotation validity period expired
- **Quotation details**: View full quotation with pricing, terms, messages

#### 3.5.3 Quotation Details
- **Product list**: All products in quotation with quantities
- **Pricing**: Individual and total pricing
- **Partner information**: Partner name, contact details
- **Messages**: Communication thread with partner
- **Actions**:
  - **Accept**: Accept quotation and create purchase order
  - **Decline**: Reject quotation
  - **Send message**: Communicate with partner
  - **Request changes**: Request modifications

**Navigation**: Dashboard → Quotation Requests → Quotations Screen → Quotation Details

### 3.6 Purchase Orders

**Purpose**: Manage purchase orders created from approved quotations.

**Key Features**:

#### 3.6.1 Order List
- **Order status**: View orders by status (pending, confirmed, shipped, delivered, cancelled)
- **Order details**: Order ID, partner, date, total amount
- **Status indicators**:
  - **Pending**: Order created, awaiting confirmation
  - **Confirmed**: Partner confirmed order
  - **Shipped**: Order shipped by partner
  - **Delivered**: Order received
  - **Cancelled**: Order cancelled

#### 3.6.2 Order Details
- **Product list**: All products in order with quantities and pricing
- **Shipping information**: Delivery address, estimated delivery date
- **Order timeline**: Status history and updates
- **Documents**: Invoices, packing slips, etc.
- **Actions**: Cancel order (if allowed), contact partner

**Navigation**: Dashboard → Purchase Orders → Orders Screen → Order Details

### 3.7 Shipment Tracking

**Purpose**: Track shipments from partners to stores.

**Key Features**:
- **Shipment list**: View all shipments
- **Status filtering**: Filter by status (in-transit, delivered, delayed)
- **Shipment details**:
  - Tracking number
  - Carrier information
  - Estimated delivery date
  - Current location (if available)
- **Delivery confirmation**: Confirm receipt of shipments
- **Issue reporting**: Report delivery issues or damages

**Navigation**: Dashboard → Shipments → Shipments Screen → Shipment Details

### 3.8 Retailer/Country Selection

**Purpose**: Filter buyer portal view by brand and country.

**Key Features**:
- **Brand selection**: Filter by brand (Weekday, Monki, etc.)
- **Country selection**: Filter by country
- **Combined filtering**: Select specific brand-country combinations
- **All retailers**: View all retailers (no filter)
- **Persistent selection**: Selection persists across sessions

**Use Cases**:
- View products specific to a brand
- Filter by country for local operations
- Switch between different retailer contexts

### 3.9 Navigation Structure

**Buyer Navigation** (from `navigationConfig.ts`):
- **Dashboard**: Buyer dashboard (home)
- **Browse**: Showroom browse screen
- **Quotations**: Quotations management screen

**Buyer-Only Screens**:
- `buyer-dashboard` - BuyerDashboard
- `buyer-wishlist` - BuyerWishlistScreen
- `buyer-quotations` - BuyerQuotationsScreen
- `buyer-orders` - BuyerPurchaseOrdersScreen
- `buyer-shipments` - BuyerShipmentsScreen
- `buyer-order-details` - BuyerOrderDetailsScreen
- `buyer-quotation-details` - BuyerQuotationDetailsScreen

**Shared Screens**:
- `showroom-browse` - BuyerShowroomBrowse (buyers browse, partners manage)

### 3.10 User Experience

**Design Principles**:
- **Material Design 3**: Follows M3 design system
- **Responsive**: Works on mobile and desktop
- **Intuitive navigation**: Clear paths to key features
- **Status visibility**: Clear status indicators throughout
- **Quick actions**: Easy access to common tasks

**Key Interactions**:
- **Browse → Wishlist**: Save products while browsing
- **Wishlist → Quotation**: Request quotations for wishlist items
- **Quotation → Order**: Convert approved quotations to orders
- **Order → Shipment**: Track orders through to delivery

### 3.11 Integration Points

**Partner Showrooms**:
- Buyers browse products from partner showrooms
- Products are managed by partners
- Real-time inventory and pricing

**Quotation System**:
- Buyers request quotations
- Partners respond with pricing
- Two-way communication

**Order Management**:
- Orders created from quotations
- Integrated with partner order systems
- Status updates from partners

**Shipping Integration**:
- Track shipments from partners
- Integration with carrier systems
- Delivery confirmation

---

## Summary

This documentation covers three major features of the Digital Showroom MVP:

1. **Portal Configuration** provides centralized management of attributes, pricing, and data mappings, enabling administrators to control how product data is structured and validated across the system.

2. **Sellpy Order Flow** is a specialized API-driven workflow that requires mandatory retailer ID scanning and strict validation, ensuring data quality for API-integrated orders.

3. **Buyer Portal** offers a complete buying experience with showroom browsing, quotation management, purchase orders, and shipment tracking, all designed for retail buyers to efficiently discover and order products from partners.

Each feature is designed to support different user roles and workflows within the larger digital showroom ecosystem.

