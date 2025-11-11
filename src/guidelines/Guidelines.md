1) Color & Theming
Adopt M3 color roles and dynamic color (optional).

M3 defines a baseline color system with 26+ color roles (primary, secondary, tertiary, error, surface variants, “on‑” roles) and provides built‑in light/dark themes; roles are mapped to UI elements to maintain accessible contrast automatically. 1
Color roles are the “connective tissue” between UI elements and their assigned colors—use them to keep mappings consistent (e.g., Primary for prominent actions; On‑Primary for text on primary surfaces). 2
Dynamic color can personalize the UI by deriving a palette from a user’s wallpaper or in‑app content (content‑based color); both approaches preserve contrast. Start with baseline, switch to dynamic later if needed. 31
Figma workflow

Use the official Material 3 Design Kit and the Material Theme Builder (Figma plugin) to generate tokens, preview light/dark, and export styles. 45
Practical mapping for Resell Store App

Primary → critical CTAs (Register, Return, Scan to receive). Secondary/Tertiary → secondary actions (filters, “Add items”). Error → destructive actions (reject item), validation. Surface/Surface‑container roles for pages, lists, cards, and sheets. 1
2) Typography
Use M3 type roles with clear hierarchy.

The M3 scale groups text into five roles (Display, Headline, Title, Body, Label), each with Large/Medium/Small sizes—apply roles based on content importance and screen size. 6
Display for occasional large moments (e.g., dashboard hero metrics), Headline for section titles, Title for sub‑section headers and cards, Body for content, Label for component text (buttons, chips). 6
Reference the Typography overview for spacing, line height, and readability tips. 7
3) Shape
Leverage M3 shape scale for brand expression.

M3 supports a rich shape set with rounded corner scales and shape morphing guidance; use consistent rounding across containers to express brand while maintaining hierarchy. 8
Default rectangular shapes with rounded corners are common; adjust selectively (e.g., more rounded on FABs, moderate on cards/lists). 9
4) Elevation & Surfaces
Communicate depth with tonal surfaces and limited levels.

M3 uses six elevation levels (0 to +5). Prefer tonal surface differences (surface/surface‑container roles) and scrims to separate layers; reserve higher levels for interaction states (hover/drag). 10
Ensure contrast between overlapping surfaces so edges and hierarchy are clear. 10
5) Motion & Transitions
Use motion to reinforce relationships, not decorate.

Apply transition patterns: Container Transform (card → details), Forward/Backward (hierarchical nav), Lateral (peers), Enter/Exit, and Skeleton loaders for perceived performance. 11
Pick patterns based on relationship: persistent container → Container Transform; peer destinations → Lateral; simple overlay → Enter/Exit (Fade). 12
6) Navigation Choices
Choose by window size and task.

Navigation bar: phones / compact & medium widths; 3–5 stable top‑level destinations. (M3 “flexible” nav bar updates: no shadow, active indicator pill, dynamic‑color friendly.) 13
Navigation rail: tablets / mid‑sized devices; 3–7 destinations; can include FAB. 14
Resell Store App mapping

Phone (compact): Bottom Navigation bar with Home, Items, Sellers, Scan, Shipping. 13
Tablet (medium): Navigation rail on the left + top app bar; content panes for lists/details. 14
7) Core Components to Prefer
App bars: top app bar with search/filter where applicable; use medium/large variants when scannability benefits. 15
Lists (single/two/three‑line) for inventories, deliveries, and seller items; keep visuals aligned, use dividers and spacing for scannability. 1617
Cards for groupings like delivery summaries or return orders (outlined/filled/elevated depending on emphasis). 15
Buttons: Primary (filled) for commits (REGISTER, RETURN), Tonal/Outlined for secondary actions, Icon buttons for quick utilities. 15
Chips (filter/assist) for quick filters on Items and Expired lists. 15
Dialogs for confirmation (reject item, finalize return), Snackbars for short success/fail updates. 15
Sheets: bottom sheet for scan tips or batch actions; side sheet for filters on larger screens. 15
8) Accessibility (must‑do)
Color contrast: follow M3’s guidance for accessible contrast; the color system and Theme Builder help generate accessible pairs. 1819
States: ensure visible focus, hover, pressed, and disabled states across components (M3 components include these out of the box). 15
Disabled controls have different contrast considerations (WCAG exceptions for inactive components), but still maintain clarity in context. 20
9) Figma Setup & Handoff Tips
Start from the official M3 Design Kit; enable the library and use variables/modes for light/dark and token aliasing. 4
Generate a theme with Material Theme Builder (Figma): define source color(s), preview tokens, and export to code when needed. 5
Use component properties and variants (from the kit) for states (enabled/disabled/hover/pressed), density, and leading/trailing icons. 4
10) App‑Specific Patterns (apply M3 to your flows)
Home

Top app bar + cards for “Items to return,” “In‑transit deliveries,” quick links (To Return, Scan to receive). Lists for tabs (Pre‑registered, Pending, Expired, Storage). 1516
Shipping (Receive Deliveries & Boxes)

Lists + cards for deliveries; primary button SCAN TO RECEIVE; Snackbars for success/error. Use Container Transform when opening delivery detail from a card. 151611
Return flow

Filter chips to segment Expired vs Rejected; multi‑select lists; confirm with Dialog; Sheet for parcel label scan/entry; Snackbar on register. 15
Items & Sellers

Two‑line lists with thumbnails and metadata; chips for filters; outlined cards for item detail preview. 1615
Scan

Full‑bleed sheet/dialog for permissions and “how to scan”; Snackbars for scan result status. 15
11) Token Starter (copy to team notes)
Use role‑based tokens instead of hardcoded hex:

Color
- Primary / On-Primary / Primary-Container / On-Primary-Container
- Secondary / On-Secondary / Secondary-Container / On-Secondary-Container
- Tertiary / On-Tertiary / Tertiary-Container / On-Tertiary-Container
- Error / On-Error / Error-Container / On-Error-Container
- Surface / On-Surface / Surface-Variant / On-Surface-Variant
- Surface-Container / Low / High / Highest (for sectioned surfaces)

Type
- Display (L/M/S), Headline (L/M/S), Title (L/M/S), Body (L/M/S), Label (L/M/S)

Shape
- ExtraSmall, Small, Medium, Large, ExtraLarge (plus expressive larger scales if needed)

Elevation
- Level 0…+5 (use tonal surfaces & scrims first; shadows sparingly)



Plain Text
Color
- Primary / On-Primary / Primary-Container / On-Primary-Container
- Secondary / On-Secondary / Secondary-Container / On-Secondary-Container
- Tertiary / On-Tertiary / Tertiary-Container / On-Tertiary-Container
- Error / On-Error / Error-Container / On-Error-Container
- Surface / On-Surface / Surface-Variant / On-Surface-Variant
- Surface-Container / Low / High / Highest (for sectioned surfaces)

Type
- Display (L/M/S), Headline (L/M/S), Title (L/M/S), Body (L/M/S), Label (L/M/S)

Shape
- ExtraSmall, Small, Medium, Large, ExtraLarge (plus expressive larger scales if needed)

Elevation
- Level 0…+5 (use tonal surfaces & scrims first; shadows sparingly)


Show more lines
(Use the Material 3 Design Kit + Theme Builder to instantiate these as Figma variables and styles.) 45110

12) Quality Bar & Reviews
Contrast check with Theme Builder/kit before handoff. 19
Motion lint: every screen‑to‑screen jump uses a named transition pattern (document the chosen pattern in notes). 11
Responsive nav: verify Navigation bar on phones and Navigation rail on tablets. 1314