import svgPaths from "./svg-51ccwiv5v1";

function Indicator() {
  return (
    <div className="h-[14px] relative shrink-0 w-full" data-name="Indicator">
      <div className="absolute bg-error bottom-0 h-[3px] left-[2px] right-[2px] rounded-tl-[100px] rounded-tr-[100px]" data-name="Shape" />
    </div>
  );
}

function TabContents() {
  return (
    <div className="content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#212121] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Scanned</p>
      </div>
      <Indicator />
    </div>
  );
}

function StateLayer() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
          <TabContents />
        </div>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 1">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer />
      </div>
    </div>
  );
}

function TabContents1() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">To return - not scanned</p>
      </div>
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

function Tab2() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 2">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer1 />
      </div>
    </div>
  );
}

function TabGroup() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0 w-full" data-name="Tab group">
      <Tab1 />
      <Tab2 />
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, black)" strokeOpacity="0.12" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
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
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#49454f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">0 items</p>
      </div>
    </div>
  );
}

function TrailingElement() {
  return <div className="content-stretch flex gap-[10px] items-start justify-start shrink-0" data-name="Trailing element" />;
}

function StateLayer2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content />
          <TrailingElement />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[42px] items-center justify-center relative shrink-0 w-[375px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled />
      <StateLayer2 />
    </div>
  );
}

function Frame73() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0">
      <Tabs />
      <ListItemListItem0Density />
    </div>
  );
}

function ListItems() {
  return (
    <div className="absolute content-stretch flex flex-col h-[589px] items-center justify-start left-0 top-[203px]" data-name="list items">
      <Frame73 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[281px] justify-center leading-[0] relative shrink-0 text-[#8d8d8d] text-[14px] text-center w-[335px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Scan QR on hang tags to include items in return</p>
      </div>
    </div>
  );
}

function IconCheckOff() {
  return (
    <div className="absolute left-[11px] size-[44px] top-[161px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select() {
  return (
    <div className="absolute contents left-[11px] top-[161px]" data-name="Select">
      <IconCheckOff />
    </div>
  );
}

function SelectAll() {
  return (
    <div className="absolute contents left-[11px] top-[161px]" data-name="Select All">
      <Select />
    </div>
  );
}

function IconMorePrimary() {
  return (
    <div className="absolute h-[32px] left-[15.73%] right-[75.73%] top-[167px]" data-name="icon_more_primary">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_more_primary">
          <path clipRule="evenodd" d={svgPaths.p22167000} fill="var(--fill-0, #FFF0F5)" fillRule="evenodd" id="path 32x32" />
          <path d={svgPaths.p1b4037f0} fill="var(--fill-0, #F20054)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonVariants() {
  return (
    <button className="absolute bg-error cursor-pointer h-[32px] rounded-[16px] translate-x-[-50%] translate-y-[-50%]" data-name="Button / Variants" style={{ top: "calc(50% - 225px)", left: "calc(50% + 120px)" }}>
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[32px] items-center justify-center p-[30px] relative">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Scan</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function BuildingBlocksStateLayer1Enabled1() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function AssignmentReturn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="assignment_return">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="assignment_return">
          <path d={svgPaths.p11b7e400} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0" data-name="Leading element">
      <AssignmentReturn />
    </div>
  );
}

function Content1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center relative shrink-0 text-[#49454f] text-[12px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Created 2024-05-01</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.15px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Return order nr: 1000007</p>
      </div>
      <div className="font-['Roboto:Regular',_sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1c1b1f] text-[12px] tracking-[0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0">Receiver: Flamingo</p>
        <p>Status: Pending</p>
      </div>
    </div>
  );
}

function IconsMoreVert24Px() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons/more_vert_24px">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons/more_vert_24px">
          <path clipRule="evenodd" d={svgPaths.pa015900} fill="var(--fill-0, #1C1B1F)" fillRule="evenodd" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <IconsMoreVert24Px />
    </div>
  );
}

function StateLayer3() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start justify-start pb-0 pt-[8px] px-[16px] relative w-full">
          <LeadingElement />
          <Content1 />
          <TrailingElement1 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled1 />
      <StateLayer3 />
    </div>
  );
}

function Stores() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-center left-0 top-[70px] w-[376px]" data-name="stores">
      <ListItemListItem0Density1 />
    </div>
  );
}

function ButtonVariants1() {
  return (
    <button className="bg-white cursor-pointer h-[42px] relative rounded-[16px] shrink-0 w-[160px]" data-name="Button / Variants">
      <div aria-hidden="true" className="absolute border border-[#1c1b1f] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[42px] items-center justify-center p-[30px] relative w-[160px]">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#212121] text-[12px] text-center text-nowrap tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">{`Save & close`}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function ButtonVariants2() {
  return (
    <button className="bg-error cursor-pointer h-[42px] opacity-50 relative rounded-[16px] shrink-0 w-[160px]" data-name="Button / Variants">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[42px] items-center justify-center p-[30px] relative w-[160px]">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Return</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function BottomCtAs() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[16px] items-center justify-center left-0 px-0 py-[20px] w-[375px]" data-name="Bottom CTAs">
      <div aria-hidden="true" className="absolute border-[#cac4d0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <ButtonVariants1 />
      <ButtonVariants2 />
    </div>
  );
}

function TopAppBar() {
  return (
    <div className="absolute box-border content-stretch flex gap-[6px] h-[44px] items-center justify-start left-1/2 pl-[16px] pr-[4px] py-[8px] top-[26px] translate-x-[-50%] w-[375px]" data-name="top-app-bar">
      <div className="basis-0 font-['Roboto:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#1c1b1f] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Return details</p>
      </div>
    </div>
  );
}

export default function ReturnDetailsInReturn0() {
  return (
    <div className="bg-white relative size-full" data-name="Return details - in return 0">
      <BottomCtAs />
      <TopAppBar />
      <ListItems />
      <SelectAll />
      <IconMorePrimary />
      <ButtonVariants />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[20px] justify-center leading-[0] left-[194px] text-[#f20054] text-[12px] text-center top-[181px] tracking-[1px] translate-x-[-50%] translate-y-[-50%] uppercase w-[108px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Add manually</p>
      </div>
      <Stores />
    </div>
  );
}