import svgPaths from "./svg-tbsemp1sa3";

function NavigateBeforeBlack24Dp21() {
  return (
    <div className="absolute left-[287px] size-[24px] top-[926px]" data-name="navigate_before_black_24dp-2 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_12_10476)" id="navigate_before_black_24dp-2 1">
          <g id="Vector"></g>
          <path d={svgPaths.p2c27f300} fill="var(--fill-0, #666666)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_12_10476">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function KeyboardArrowRightBlack24Dp1() {
  return (
    <div className="absolute left-[331px] size-[24px] top-[926px]" data-name="keyboard_arrow_right_black_24dp 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_12_10480)" id="keyboard_arrow_right_black_24dp 1">
          <g id="Vector"></g>
          <path d={svgPaths.p10308e00} fill="var(--fill-0, #666666)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_12_10480">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Items() {
  return (
    <div className="absolute contents left-[140px] top-[920px]" data-name="Items">
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] left-[267px] text-[#666666] text-[16px] text-nowrap text-right top-[938px] translate-x-[-100%] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px] whitespace-pre">
          <span>{`1-20 of `}</span>
          <span className="font-['Roboto:Medium',_sans-serif] font-medium" style={{ fontVariationSettings: "'wdth' 100" }}>
            435
          </span>
          <span className="font-['Roboto:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'wdth' 100" }}>{` items`}</span>
        </p>
      </div>
      <div className="absolute left-[327px] size-[32px] top-[922px]" data-name="button bg">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path clipRule="evenodd" d={svgPaths.p1da38800} fill="var(--fill-0, #F0F0F0)" fillRule="evenodd" id="button bg" />
        </svg>
      </div>
      <div className="absolute left-[283px] size-[32px] top-[922px]" data-name="button bg">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path clipRule="evenodd" d={svgPaths.p1da38800} fill="var(--fill-0, #F0F0F0)" fillRule="evenodd" id="button bg" />
        </svg>
      </div>
      <NavigateBeforeBlack24Dp21 />
      <KeyboardArrowRightBlack24Dp1 />
    </div>
  );
}

function ButtonVariants() {
  return (
    <div className="absolute bg-error h-[32px] rounded-[16px] translate-x-[-50%] translate-y-[-50%]" data-name="Button / Variants" style={{ top: "calc(50% - 170px)", left: "calc(50% + 124px)" }}>
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[32px] items-center justify-center p-[30px] relative">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Scan</p>
          </div>
        </div>
      </div>
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

function StateLayer1() {
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
        <StateLayer1 />
      </div>
    </div>
  );
}

function TabContents1() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Not scanned</p>
      </div>
    </div>
  );
}

function StateLayer2() {
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
        <StateLayer2 />
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

function BuildingBlocksStateLayer1Enabled1() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-end justify-end min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#49454f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">1/10 boxes</p>
      </div>
    </div>
  );
}

function TrailingElement1() {
  return <div className="content-stretch flex gap-[10px] items-start justify-start shrink-0" data-name="Trailing element" />;
}

function StateLayer3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content1 />
          <TrailingElement1 />
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
          <line id="Divider_2" stroke="var(--stroke-0, #CAC4D0)" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density1() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[42px] items-center justify-center relative shrink-0 w-[375px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled1 />
      <StateLayer3 />
      <Divider1 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled2() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function StateLayer4() {
  return (
    <div className="box-border content-stretch flex items-center justify-center p-[11px] relative rounded-[100px] shrink-0" data-name="state-layer">
      <div className="relative rounded-[2px] shrink-0 size-[18px]" data-name="container">
        <div aria-hidden="true" className="absolute border-2 border-[#ffccd4] border-solid inset-0 pointer-events-none rounded-[2px]" />
      </div>
    </div>
  );
}

function Checkboxes() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="checkboxes">
      <StateLayer4 />
    </div>
  );
}

function LeadingElement() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0" data-name="Leading element">
      <Checkboxes />
    </div>
  );
}

function Content2() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Roboto:Regular',_sans-serif] font-normal gap-[2px] grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0 text-[#1c1b1f]" data-name="Content">
      <div className="flex flex-col justify-center relative shrink-0 text-[0px] tracking-[0.25px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Medium',_sans-serif] font-medium leading-[16px] mb-0 text-[#1c1b1f] text-[11px] tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          2024-04-27, In transit
        </p>
        <p className="leading-[20px] text-[14px]">
          <span className="font-['Roboto:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'wdth' 100" }}>
            Box ID: 12345678-1-12345678910
          </span>
          1
        </p>
      </div>
      <div className="flex flex-col justify-center leading-[16px] relative shrink-0 text-[12px] tracking-[0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0">Order nr: 100007</p>
        <p>External order: xZygTfDEX</p>
      </div>
    </div>
  );
}

function StateLayer5() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[8px] items-start justify-start pl-[16px] pr-[24px] py-[12px] relative w-full">
          <LeadingElement />
          <Content2 />
          <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[11px] text-nowrap text-right tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[16px] whitespace-pre">40 items</p>
          </div>
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

function ListItemListItem0Density2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled2 />
      <StateLayer5 />
      <Divider2 />
    </div>
  );
}

function ListItems() {
  return (
    <div className="absolute content-stretch flex flex-col h-[589px] items-start justify-start left-0 top-[255px]" data-name="list items">
      <Tabs />
      <ListItemListItem0Density1 />
      <ListItemListItem0Density2 />
    </div>
  );
}

function IconCheckOff() {
  return (
    <div className="absolute left-[7px] size-[44px] top-[213.5px]" data-name="icon_check_off">
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
    <div className="absolute contents left-[7px] top-[213.5px]" data-name="Select">
      <IconCheckOff />
    </div>
  );
}

function SelectAll() {
  return (
    <div className="absolute contents left-[7px] top-[213.5px]" data-name="Select All">
      <Select />
    </div>
  );
}

function IconMorePrimary() {
  return (
    <div className="absolute h-[32px] left-[14.67%] right-[76.8%] top-[219.5px]" data-name="icon_more_primary">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_more_primary">
          <path clipRule="evenodd" d={svgPaths.p22167000} fill="var(--fill-0, #FFF0F5)" fillRule="evenodd" id="path 32x32" />
          <path d={svgPaths.p1b4037f0} fill="var(--fill-0, #F20054)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled3() {
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

function LeadingElement1() {
  return (
    <div className="content-stretch flex h-[64px] items-start justify-start relative shrink-0" data-name="Leading element">
      <LocalShipping />
    </div>
  );
}

function Content3() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center relative shrink-0 text-[#49454f] text-[12px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">2024-05-01, New - in transit</p>
      </div>
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.15px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Delivery ID: 12345678-123456789102</p>
      </div>
      <div className="font-['Roboto:Regular',_sans-serif] font-normal relative shrink-0 text-[#49454f] text-[0px] tracking-[0.4px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] text-[12px]">
          Boxes<span className="tracking-[0.4px]">{`: `}</span>10, Items: 400
        </p>
      </div>
    </div>
  );
}

function StateLayer6() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start justify-start pb-0 pt-[8px] px-[16px] relative w-full">
          <LeadingElement1 />
          <Content3 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density3() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled3 />
      <StateLayer6 />
    </div>
  );
}

function Stores() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-center left-0 top-[84px] w-[375px]" data-name="stores">
      <ListItemListItem0Density3 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled4() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content4() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center leading-[0] min-h-px min-w-px overflow-clip relative shrink-0 tracking-[0.5px]" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center relative shrink-0 text-[#49454f] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Sender</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[#1c1b1f] text-[16px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Sellpy (PL000001)</p>
      </div>
    </div>
  );
}

function StateLayer7() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-start pl-[16px] pr-[24px] py-[8px] relative w-full">
          <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
            <Content4 />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-center justify-center right-0 top-[156px] w-[335px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled4 />
      <StateLayer7 />
    </div>
  );
}

function Divider3() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #CAC4D0)" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[10px] relative size-full">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-white tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[16px] whitespace-pre">REGISTER</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-error content-stretch flex flex-col gap-[8px] h-[42px] items-center justify-center opacity-50 overflow-clip relative rounded-[16px] shrink-0 w-[150px]" data-name="button">
      <StateLayer9 />
    </div>
  );
}

function Buttons() {
  return (
    <div className="relative shrink-0 w-full" data-name="buttons">
      <div className="flex flex-row items-center justify-end relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-end px-[16px] py-0 relative w-full">
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function AppButtons() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex flex-col gap-[16px] items-end justify-center left-0 pb-[20px] pt-0 px-0 w-[375px]" data-name="App - Buttons">
      <Divider3 />
      <Buttons />
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="close">
          <path d={svgPaths.p3fd9e500} fill="var(--fill-0, #1C1B1F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer11() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center p-[8px] relative shrink-0" data-name="state-layer">
      <Close />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0" data-name="container">
      <StateLayer11 />
    </div>
  );
}

function TrailingIcon() {
  return (
    <button className="box-border content-stretch cursor-pointer flex flex-col gap-[10px] items-center justify-center overflow-visible p-0 relative shrink-0 size-[48px]" data-name="trailing-icon">
      <Container1 />
    </button>
  );
}

function TopAppBar() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[6px] h-[44px] items-center justify-start left-0 pl-[16px] pr-[4px] py-[8px] top-[40px] w-[375px]" data-name="top-app-bar">
      <div className="basis-0 font-['Roboto:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[#1c1b1f] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Receive a delivery</p>
      </div>
      <TrailingIcon />
    </div>
  );
}

export default function ReceiveParcelToStore() {
  return (
    <div className="bg-white relative size-full" data-name="Receive parcel to store">
      <AppButtons />
      <TopAppBar />
      <Items />
      <ButtonVariants />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[20px] justify-center leading-[0] left-[190px] text-[#f20054] text-[12px] text-center top-[236px] tracking-[1px] translate-x-[-50%] translate-y-[-50%] uppercase w-[116px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">ENTER manually</p>
      </div>
      <ListItems />
      <SelectAll />
      <IconMorePrimary />
      <Stores />
      <ListItemListItem0Density4 />
    </div>
  );
}