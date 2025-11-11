import svgPaths from "./svg-uvbj8etlds";

function IconSearch() {
  return (
    <div className="absolute right-[308px] size-[24px] top-[12px]" data-name="icon_search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon_search">
          <g id="Path"></g>
          <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--fill-0, #666666)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function FirstNameStart() {
  return (
    <div className="h-[49px] overflow-clip relative shrink-0 w-[343px]" data-name="First name - Start">
      <div className="absolute bg-white bottom-px left-0 right-0 top-0" data-name="Text Field" />
      <IconSearch />
      <div className="absolute bottom-0 left-0 right-0 top-[97.96%]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 343 1">
          <path clipRule="evenodd" d="M0 0V1H343V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal inset-[22.45%_4.66%_24.49%_11.64%] justify-center leading-[0] text-[#8d8d8d] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Search for delivery ID or return ID</p>
      </div>
    </div>
  );
}

function Search() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-start pb-[16px] pt-0 px-0 relative shrink-0 w-full" data-name="search">
      <FirstNameStart />
    </div>
  );
}

function ButtonVariants() {
  return (
    <div className="bg-error h-[32px] relative rounded-[16px] shrink-0" data-name="Button / Variants">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[32px] items-center justify-center p-[30px] relative">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Scan to RECEIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagerange() {
  return (
    <div className="box-border content-stretch flex gap-[16px] items-end justify-end pb-[2px] pt-0 px-[16px] relative shrink-0 w-[375px]" data-name="Pagerange">
      <ButtonVariants />
    </div>
  );
}

function Indicator() {
  return (
    <div className="h-[14px] relative shrink-0 w-full" data-name="Indicator">
      <div className="absolute bg-error bottom-0 h-[3px] left-[2px] right-[2px] rounded-tl-[100px] rounded-tr-[100px]" data-name="Shape" />
    </div>
  );
}

function TabContents1() {
  return (
    <div className="content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#212121] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">New</p>
      </div>
      <Indicator />
    </div>
  );
}

function StateLayer1() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
          <TabContents1 />
        </div>
      </div>
    </div>
  );
}

function Tab6() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 2">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer1 />
      </div>
    </div>
  );
}

function TabContents2() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Returns</p>
      </div>
    </div>
  );
}

function StateLayer2() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
          <TabContents2 />
        </div>
      </div>
    </div>
  );
}

function Tab3() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 3">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer2 />
      </div>
    </div>
  );
}

function TabContents3() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">All</p>
      </div>
    </div>
  );
}

function StateLayer3() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
          <TabContents3 />
        </div>
      </div>
    </div>
  );
}

function Tab4() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 4">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer3 />
      </div>
    </div>
  );
}

function TabGroup() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0 w-full" data-name="Tab group">
      <Tab6 />
      <Tab3 />
      <Tab4 />
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #E7E0EC)" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[375px]" data-name="Tabs">
      <TabGroup />
      <Divider />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-end justify-end min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#49454f] text-[14px] tracking-[0.25px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">2 deliveries</p>
      </div>
    </div>
  );
}

function TrailingElement() {
  return <div className="content-stretch flex gap-[10px] items-start justify-start shrink-0" data-name="Trailing element" />;
}

function StateLayer4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-end justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-end justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content />
          <TrailingElement />
        </div>
      </div>
    </div>
  );
}

function Divider1() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #79747E)" strokeOpacity="0.12" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[42px] items-center justify-center relative shrink-0 w-[375px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled />
      <StateLayer4 />
      <Divider1 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled1() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function LocalShipping() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="local_shipping">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="local_shipping">
          <path d={svgPaths.p3d94fd00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0" data-name="Leading element">
      <LocalShipping />
    </div>
  );
}

function Content1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#1c1b1f] text-[0px] tracking-[0.25px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Medium',_sans-serif] font-medium leading-[16px] mb-0 text-[11px] tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          2024-12-09, In transit
        </p>
        <p className="leading-[20px] text-[14px]">
          <span className="text-[#1c1b1f] tracking-[0.25px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Delivery ID: 122345678-
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>3r890fhor8r4wrjf</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#1c1b1f] text-[12px] tracking-[0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Orders: 1, Items: 150</p>
      </div>
      <div className="font-['Roboto:Medium',_sans-serif] font-medium relative shrink-0 text-[#79747e] text-[11px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Sender: Kinda Kinks</p>
      </div>
    </div>
  );
}

function IconsMore24Px() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons/more_24px">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons/more_24px">
          <path clipRule="evenodd" d={svgPaths.p1914b670} fill="var(--fill-0, #1C1B1F)" fillRule="evenodd" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#49454f] text-[11px] text-nowrap tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] whitespace-pre">Boxes: 4</p>
      </div>
      <IconsMore24Px />
    </div>
  );
}

function StateLayer5() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start justify-start px-[16px] py-[12px] relative w-full">
          <LeadingElement />
          <Content1 />
          <TrailingElement1 />
        </div>
      </div>
    </div>
  );
}

function Divider2() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #79747E)" strokeOpacity="0.12" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled1 />
      <StateLayer5 />
      <Divider2 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled2() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function LocalShipping1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="local_shipping">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="local_shipping">
          <path d={svgPaths.p3d94fd00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement1() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0" data-name="Leading element">
      <LocalShipping1 />
    </div>
  );
}

function Content2() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#1c1b1f] text-[0px] tracking-[0.25px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Medium',_sans-serif] font-medium leading-[16px] mb-0 text-[11px] tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          2024-12-09, In transit
        </p>
        <p className="leading-[20px] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Delivery ID: 12345678-123456789653
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#1c1b1f] text-[12px] tracking-[0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Orders: 2, Items: 400</p>
      </div>
      <div className="font-['Roboto:Medium',_sans-serif] font-medium relative shrink-0 text-[#79747e] text-[11px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Sender: Sellpy</p>
      </div>
    </div>
  );
}

function IconsMore24Px1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons/more_24px">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons/more_24px">
          <path clipRule="evenodd" d={svgPaths.p1914b670} fill="var(--fill-0, #1C1B1F)" fillRule="evenodd" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#49454f] text-[11px] text-nowrap tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] whitespace-pre">Boxes: 10</p>
      </div>
      <IconsMore24Px1 />
    </div>
  );
}

function StateLayer6() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start justify-start px-[16px] py-[12px] relative w-full">
          <LeadingElement1 />
          <Content2 />
          <TrailingElement2 />
        </div>
      </div>
    </div>
  );
}

function Divider3() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #79747E)" strokeOpacity="0.12" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled2 />
      <StateLayer6 />
      <Divider3 />
    </div>
  );
}

function Pagerange1() {
  return <div className="bg-white box-border content-stretch flex gap-[16px] h-[365px] items-end justify-end pb-[24px] pt-0 px-[16px] shrink-0 w-[375px]" data-name="Pagerange" />;
}

function ListItems() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 pb-0 pt-[16px] px-0 top-[73px]" data-name="list items">
      <Search />
      <Pagerange />
      <Tabs />
      <ListItemListItem0Density />
      <ListItemListItem0Density1 />
      <ListItemListItem0Density2 />
      <Pagerange1 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p34769840} fill="var(--fill-0, #1C1B1F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer7() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon />
    </div>
  );
}

function IconContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer7 />
    </div>
  );
}

function Segment1() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 1">
      <IconContainer />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100", width: "min-content" }}>
        <p className="leading-[16px]">Home</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p3882d700} fill="var(--fill-0, black)" />
            <path d={svgPaths.p1246ad00} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function StateLayer8() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon1 />
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer8 />
    </div>
  );
}

function Segment2() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 2">
      <IconContainer1 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100", width: "min-content" }}>
        <p className="leading-[16px]">Items</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p34fc5000} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer9() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon2 />
    </div>
  );
}

function IconContainer2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer9 />
    </div>
  );
}

function Segment3() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 3">
      <IconContainer2 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100", width: "min-content" }}>
        <p className="leading-[16px]">Scan</p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p2f742f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer10() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon3 />
    </div>
  );
}

function IconContainer3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer10 />
    </div>
  );
}

function Segment4() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 4">
      <IconContainer3 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100", width: "min-content" }}>
        <p className="leading-[16px]">Sellers</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p20e0b980} fill="var(--fill-0, #F20054)" />
            <path d="M15 12H9V14H15V12Z" fill="var(--fill-0, #F20054)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function StateLayer11() {
  return (
    <div className="box-border content-stretch flex h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon4 />
    </div>
  );
}

function IconContainer4() {
  return (
    <div className="bg-[rgba(121,116,126,0.12)] content-stretch flex items-center justify-center overflow-clip relative rounded-[16px] shrink-0" data-name="icon-container">
      <StateLayer11 />
    </div>
  );
}

function Segment5() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 5">
      <IconContainer4 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#1c1b1f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Shipping</p>
      </div>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[8px] items-start justify-start left-0 px-[8px] py-0 w-[375px]" data-name="navigation-bar">
      <div aria-hidden="true" className="absolute border-[#d0d0d0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Segment1 />
      <Segment2 />
      <Segment3 />
      <Segment4 />
      <Segment5 />
    </div>
  );
}

export default function OrdersNavigationBarIfOnlyB2B() {
  return (
    <div className="bg-neutral-50 relative size-full" data-name="Orders - navigation bar - if only B2B">
      <ListItems />
      <NavigationBar />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] text-[#212121] text-[24px] text-nowrap top-[58px] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100", left: "calc(50% - 171.5px)" }}>
        <p className="leading-[32px] whitespace-pre">Shipping</p>
      </div>
    </div>
  );
}