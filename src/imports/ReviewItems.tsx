import svgPaths from "./svg-76u0v4an4n";
import imgRectangle55 from "figma:asset/91aae0881b4de478c432bd663b59bca268df6dec.png";
import imgRectangle54 from "figma:asset/23b3e3e209f94ca75138170170d2cb9e94d43304.png";
import imgRectangle56 from "figma:asset/a3d724d72dde4a46e02daa7ef171eff42c4ef9ba.png";
import imgRectangle57 from "figma:asset/b3d1ddd5e2f45e0b9bc268fdce137872ef362a36.png";
import imgThumbnail from "figma:asset/bccf40ef0d51ade359900027c9bd416d09e9658d.png";

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
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#1c1b1f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Not scanned</p>
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
        <p className="leading-[20px] whitespace-pre">Not found</p>
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

function TabContents2() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">All included</p>
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
        <p className="leading-[20px] whitespace-pre">Scanned</p>
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
      <Tab1 />
      <Tab2 />
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
        <p className="leading-[24px]">6 items</p>
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
      <StateLayer4 />
    </div>
  );
}

function MoreHoriz() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
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
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff />
    </div>
  );
}

function SelectAll() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select />
    </div>
  );
}

function ItemCardImage() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle55}')` }} />
    </div>
  );
}

function IconStatusNew5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F8CC00)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F8CC00)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew5 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34784558`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Flamingo
        </p>
      </div>
      <Status />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{`2022-06-10 `}</span>
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Order:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 100005`}</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll />
      <ItemCardImage />
      <ListItemDetails />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, black)" strokeOpacity="0.12" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz />
      <ItemCardAllInfo />
    </div>
  );
}

function MoreHoriz1() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff1() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff1 />
    </div>
  );
}

function SelectAll1() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select1 />
    </div>
  );
}

function ItemCardImage1() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle54}')` }} />
    </div>
  );
}

function IconStatusNew6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F8CC00)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F8CC00)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew6 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34784578`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Flamingo
        </p>
      </div>
      <Status1 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{`2022-06-10 `}</span>
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Order:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 100005`}</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo1() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll1 />
      <ItemCardImage1 />
      <ListItemDetails1 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList1() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz1 />
      <ItemCardAllInfo1 />
    </div>
  );
}

function MoreHoriz2() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff2() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff2 />
    </div>
  );
}

function SelectAll2() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select2 />
    </div>
  );
}

function ItemCardImage2() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle56}')` }} />
    </div>
  );
}

function IconStatusNew7() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F8CC00)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F8CC00)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status2() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew7 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails2() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34894357`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Flamingo
        </p>
      </div>
      <Status2 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{`2022-06-10 `}</span>
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Order:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 1000004`}</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo2() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll2 />
      <ItemCardImage2 />
      <ListItemDetails2 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList2() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz2 />
      <ItemCardAllInfo2 />
    </div>
  );
}

function MoreHoriz3() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff3() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff3 />
    </div>
  );
}

function SelectAll3() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select3 />
    </div>
  );
}

function ItemCardImage3() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[73px] left-0 top-0 w-[56px]" style={{ backgroundImage: `url('${imgRectangle57}')` }} />
    </div>
  );
}

function IconStatusNew8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F8CC00)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F8CC00)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status3() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew8 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails3() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34894575`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Lucy Wood
        </p>
      </div>
      <Status3 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">2022-06-10</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo3() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll3 />
      <ItemCardImage3 />
      <ListItemDetails3 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList3() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz3 />
      <ItemCardAllInfo3 />
    </div>
  );
}

function MoreHoriz4() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff4() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff4 />
    </div>
  );
}

function SelectAll4() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select4 />
    </div>
  );
}

function BuildingBlocksImageThumbnail() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-start justify-start left-0 size-[55px] top-[9px]" data-name="Building Blocks/image-Thumbnail">
      <div className="basis-0 bg-center bg-cover bg-no-repeat grow h-[56px] min-h-px min-w-px shrink-0" data-name="Thumbnail" style={{ backgroundImage: `url('${imgThumbnail}')` }} />
    </div>
  );
}

function ItemCardImage4() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <BuildingBlocksImageThumbnail />
    </div>
  );
}

function IconStatusNew9() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F60051)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F60051)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status4() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew9 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">Expired</p>
      </div>
    </div>
  );
}

function ListItemDetails4() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34894575`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Lucy Wood
        </p>
      </div>
      <Status4 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">2022-06-10</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo4() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll4 />
      <ItemCardImage4 />
      <ListItemDetails4 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList4() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz4 />
      <ItemCardAllInfo4 />
    </div>
  );
}

function MoreHoriz5() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1px)", left: "calc(50% + 162.5px)" }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_horiz">
          <path d={svgPaths.p1aa02900} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOff5() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff5 />
    </div>
  );
}

function SelectAll5() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select5 />
    </div>
  );
}

function BuildingBlocksImageThumbnail1() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-start justify-start left-0 size-[55px] top-[9px]" data-name="Building Blocks/image-Thumbnail">
      <div className="basis-0 bg-center bg-cover bg-no-repeat grow h-[56px] min-h-px min-w-px shrink-0" data-name="Thumbnail" style={{ backgroundImage: `url('${imgThumbnail}')` }} />
    </div>
  );
}

function ItemCardImage5() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <BuildingBlocksImageThumbnail1 />
    </div>
  );
}

function IconStatusNew10() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icon_status_new 5">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icon_status_new 5">
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F8CC00)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F8CC00)" id="Oval" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Status5() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew10 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store 2nd try</p>
      </div>
    </div>
  );
}

function ListItemDetails5() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-['Roboto:Regular',_sans-serif] font-medium font-normal justify-center leading-[26px] relative shrink-0 text-[0px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0 text-[14px]">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 34894575`}</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Lucy Wood
        </p>
      </div>
      <Status5 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">2022-06-10</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo5() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll5 />
      <ItemCardImage5 />
      <ListItemDetails5 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
    </div>
  );
}

function ItemCardList5() {
  return (
    <div className="bg-white h-[132px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <MoreHoriz5 />
      <ItemCardAllInfo5 />
    </div>
  );
}

function ItemList() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-start left-0 top-[180px]" data-name="item list">
      <Tabs />
      <ListItemListItem0Density />
      <ItemCardList />
      <ItemCardList1 />
      <ItemCardList2 />
      <ItemCardList3 />
      <ItemCardList4 />
      <ItemCardList5 />
    </div>
  );
}

function IconCheckOff6() {
  return (
    <div className="absolute left-[17px] size-[44px] top-[141px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select6() {
  return (
    <div className="absolute contents left-[17px] top-[141px]" data-name="Select">
      <IconCheckOff6 />
    </div>
  );
}

function SelectAll6() {
  return (
    <div className="absolute contents left-[17px] top-[141px]" data-name="Select All">
      <Select6 />
    </div>
  );
}

function IconMorePrimary() {
  return (
    <div className="absolute h-[32px] left-[17.33%] right-[74.13%] top-[147px]" data-name="icon_more_primary">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_more_primary">
          <path clipRule="evenodd" d={svgPaths.p22167000} fill="var(--fill-0, #FFF0F5)" fillRule="evenodd" id="path 32x32" />
          <path d={svgPaths.p1b4037f0} fill="var(--fill-0, #F20054)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function IconClose() {
  return (
    <button className="absolute block cursor-pointer left-[327px] size-[32px] top-[26px]" data-name="icon_close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_close">
          <rect fill="var(--fill-0, white)" height="32" id="path 32x32" opacity="0.601935" rx="4" width="32" />
          <path d={svgPaths.p1196ff0} fill="var(--fill-0, #212121)" id="icon " opacity="0.8" />
        </g>
      </svg>
    </button>
  );
}

export default function ReviewItems() {
  return (
    <div className="bg-white relative size-full" data-name="Review items">
      <IconClose />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[24px] text-[#212121] text-[24px] text-nowrap top-[77px] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] whitespace-pre">Review items</p>
      </div>
      <ItemList />
      <SelectAll6 />
      <IconMorePrimary />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[24px] text-[#212121] text-[14px] text-nowrap top-[127px] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre">Report date: 2023-10-19</p>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Light',_sans-serif] font-light justify-center leading-[0] left-[24px] text-[12px] text-[rgba(0,0,0,0.9)] top-[100px] translate-y-[-50%] w-[327px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Investigate and update item status below where needed</p>
      </div>
    </div>
  );
}