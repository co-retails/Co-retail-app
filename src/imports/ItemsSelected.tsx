import svgPaths from "./svg-7un8q74kd7";
import imgRectangle54 from "figma:asset/23b3e3e209f94ca75138170170d2cb9e94d43304.png";
import imgRectangle55 from "figma:asset/a3d724d72dde4a46e02daa7ef171eff42c4ef9ba.png";
import imgRectangle56 from "figma:asset/91aae0881b4de478c432bd663b59bca268df6dec.png";

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

function Tune() {
  return (
    <div className="absolute left-[310px] size-[24px] top-[12px]" data-name="Tune">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_8_3363)" id="Tune">
          <g id="Vector"></g>
          <path d={svgPaths.pe90e900} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_8_3363">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function FirstNameStart() {
  return (
    <div className="absolute h-[49px] left-[16px] overflow-clip top-[80px] w-[343px]" data-name="First name - Start">
      <div className="absolute bg-white bottom-px left-0 right-0 top-0" data-name="Text Field" />
      <IconSearch />
      <div className="absolute bottom-0 left-0 right-0 top-[97.96%]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 343 1">
          <path clipRule="evenodd" d="M0 0V1H343V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal inset-[22.45%_4.66%_24.49%_11.64%] justify-center leading-[0] text-[#8d8d8d] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Search for Item ID, Brand, Price</p>
      </div>
      <Tune />
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

function IconCheckOn() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[44px]" data-name="icon_check_on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_on">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p181a1800} fill="var(--fill-0, #F20052)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Select">
      <IconCheckOff />
      <IconCheckOn />
    </div>
  );
}

function SelectAll() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select All">
      <Select />
    </div>
  );
}

function IconMorePrimary() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="icon_more_primary">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_more_primary">
          <path clipRule="evenodd" d={svgPaths.p22167000} fill="var(--fill-0, #FFF0F5)" fillRule="evenodd" id="path 32x32" />
          <path d={svgPaths.p1b4037f0} fill="var(--fill-0, #F20054)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Multiselect() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-start relative shrink-0" data-name="multiselect">
      <SelectAll />
      <IconMorePrimary />
    </div>
  );
}

function ButtonVariants() {
  return (
    <button className="bg-error cursor-pointer h-[32px] relative rounded-[16px] shrink-0" data-name="Button / Variants">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[32px] items-center justify-center p-[30px] relative">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Return to seller</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Pagerange() {
  return (
    <div className="box-border content-stretch flex gap-[16px] h-[49px] items-center justify-start px-[16px] py-0 relative shrink-0 w-[375px]" data-name="Pagerange">
      <Multiselect />
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

function TabContents() {
  return (
    <div className="content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#212121] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">All</p>
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
        <p className="leading-[20px] whitespace-pre">Pending</p>
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
        <p className="leading-[20px] whitespace-pre">In store</p>
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
        <p className="leading-[20px] whitespace-pre">To return</p>
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

function TabContents4() {
  return (
    <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[14px] text-center text-nowrap tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Archived</p>
      </div>
    </div>
  );
}

function StateLayer4() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
          <TabContents4 />
        </div>
      </div>
    </div>
  );
}

function Tab5() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 5">
      <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
        <StateLayer4 />
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
      <Tab5 />
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
    <div className="bg-neutral-50 content-stretch flex flex-col items-start justify-start relative shrink-0 w-[375px]" data-name="Tabs">
      <TabGroup />
      <Divider />
    </div>
  );
}

function Pagerange1() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] h-[49px] items-center justify-center relative shrink-0 w-[375px]" data-name="Pagerange">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#666666] text-[16px] w-[317px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">100 items</p>
      </div>
    </div>
  );
}

function MoreHoriz() {
  return (
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1.5px)", left: "calc(50% + 162.5px)" }}>
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
    <div className="[grid-area:1_/_1] ml-0 mt-[0.625px] relative size-[44px]" data-name="icon_check_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_off">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="var(--fill-0, #FFCCD4)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function IconCheckOn1() {
  return (
    <div className="[grid-area:1_/_1] ml-[0.133%] mt-0 relative size-[44px]" data-name="icon_check_on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="icon_check_on">
          <g id="path 32"></g>
          <path clipRule="evenodd" d={svgPaths.p10e86e80} fill="var(--fill-0, #F20052)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Select1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff1 />
      <IconCheckOn1 />
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

function ItemCardImage() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle54}')` }} />
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
          <span style={{ fontVariationSettings: "'wdth' 100" }}>Item ID:</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 684755`}</span>
        </p>
        <p className="text-[#212121] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          The bread and butter collection
        </p>
      </div>
      <Status />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#1c1b1f]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{`: 2022-06-09, `}</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>Delivery: 10000005</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">{`H&M, Hoodie, M`}</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo() {
  return (
    <div className="absolute content-stretch flex items-center justify-start left-0 top-[2px]" data-name="item card all info">
      <SelectAll1 />
      <ItemCardImage />
      <ListItemDetails />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€10</p>
      </div>
    </div>
  );
}

function ItemCardList() {
  return (
    <div className="bg-white h-[133px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
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
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1.5px)", left: "calc(50% + 162.5px)" }}>
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

function ItemCardImage1() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle55}')` }} />
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
          <span style={{ fontVariationSettings: "'wdth' 100" }}>Item ID:</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>684754</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          The bread and butter collection
        </p>
      </div>
      <Status1 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#1c1b1f]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{`: 2022-06-09, `}</span>
          <span className="text-[#1c1b1f]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Delivery:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 100005 `}</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">American Eagle Outfitters, Dresses, 36</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo1() {
  return (
    <div className="absolute content-stretch flex items-center justify-start left-0 top-[2px]" data-name="item card all info">
      <SelectAll2 />
      <ItemCardImage1 />
      <ListItemDetails1 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€12</p>
      </div>
    </div>
  );
}

function ItemCardList1() {
  return (
    <div className="bg-white h-[133px] relative shrink-0 w-[375px]" data-name="Item card - list">
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
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1.5px)", left: "calc(50% + 162.5px)" }}>
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
          <span style={{ fontVariationSettings: "'wdth' 100" }}>Item ID:</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>684753</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Lucy Wood
        </p>
      </div>
      <Status2 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-09</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo2() {
  return (
    <div className="absolute content-stretch flex items-center justify-start left-0 top-[2px]" data-name="item card all info">
      <SelectAll3 />
      <ItemCardImage2 />
      <ListItemDetails2 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€8</p>
      </div>
    </div>
  );
}

function ItemCardList2() {
  return (
    <div className="bg-white h-[133px] relative shrink-0 w-[375px]" data-name="Item card - list">
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
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1.5px)", left: "calc(50% + 162.5px)" }}>
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

function ItemCardImage3() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle56}')` }} />
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
        <p className="leading-[40px]">In Store 2nd try</p>
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
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>684752</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          John Smith
        </p>
      </div>
      <Status3 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-10</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo3() {
  return (
    <div className="absolute content-stretch flex items-center justify-start left-0 top-[2px]" data-name="item card all info">
      <SelectAll4 />
      <ItemCardImage3 />
      <ListItemDetails3 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€5</p>
      </div>
    </div>
  );
}

function ItemCardList3() {
  return (
    <div className="bg-white h-[133px] relative shrink-0 w-[375px]" data-name="Item card - list">
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
    <div className="absolute size-[24px] translate-x-[-50%] translate-y-[-50%]" data-name="more_horiz" style={{ top: "calc(50% + 1.5px)", left: "calc(50% + 162.5px)" }}>
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

function ItemCardImage4() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle56}')` }} />
    </div>
  );
}

function IconStatusNew9() {
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

function Status4() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew9 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
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
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>684751</span>
        </p>
        <p className="text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Thrifted
        </p>
      </div>
      <Status4 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-10</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo4() {
  return (
    <div className="absolute content-stretch flex items-center justify-start left-0 top-[2px]" data-name="item card all info">
      <SelectAll5 />
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
    <div className="bg-white h-[133px] relative shrink-0 w-[375px]" data-name="Item card - list">
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

function IconCheckOff6() {
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

function Select6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff6 />
    </div>
  );
}

function SelectAll6() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select6 />
    </div>
  );
}

function ItemCardImage5() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle56}')` }} />
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
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails5() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>684750</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}> </span>
        </p>
      </div>
      <Status5 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-12</span>
        </p>
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
      <SelectAll6 />
      <ItemCardImage5 />
      <ListItemDetails5 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€20</p>
      </div>
    </div>
  );
}

function ItemCardList5() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
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

function IconCheckOff7() {
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

function Select7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Select">
      <IconCheckOff7 />
    </div>
  );
}

function SelectAll7() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-start justify-start pl-[11px] pr-[7px] py-0 relative shrink-0" data-name="Select All">
      <Select7 />
    </div>
  );
}

function ItemCardImage6() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle56}')` }} />
    </div>
  );
}

function IconStatusNew11() {
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

function Status6() {
  return (
    <div className="content-stretch flex gap-[10px] h-[24px] items-center justify-start relative shrink-0 w-[103px]" data-name="Status">
      <IconStatusNew11 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[87px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[40px]">In Store</p>
      </div>
    </div>
  );
}

function ListItemDetails6() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` - `}</span>
        </p>
      </div>
      <Status6 />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-12</span>
        </p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px] whitespace-pre">Weekday, Shorts, M</p>
      </div>
    </div>
  );
}

function ItemCardAllInfo6() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <SelectAll7 />
      <ItemCardImage6 />
      <ListItemDetails6 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€15</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[73px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Pickup</p>
      </div>
    </div>
  );
}

function ItemCardList6() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo6 />
    </div>
  );
}

function PendingItems() {
  return (
    <div className="absolute content-stretch flex flex-col gap-px h-[573px] items-start justify-start left-1/2 top-[181px] translate-x-[-50%]" data-name="pending items">
      <Pagerange />
      <Tabs />
      <Pagerange1 />
      <ItemCardList />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[17px] justify-center leading-[0] left-[320px] text-[#666666] text-[11px] top-[164.5px] translate-y-[-50%] w-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">37 days</p>
      </div>
      <ItemCardList1 />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[17px] justify-center leading-[0] left-[320px] text-[#666666] text-[11px] top-[297.5px] translate-y-[-50%] w-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">37 days</p>
      </div>
      <ItemCardList2 />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[17px] justify-center leading-[0] left-[320px] text-[#666666] text-[11px] top-[430.5px] translate-y-[-50%] w-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">37 days</p>
      </div>
      <ItemCardList3 />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[17px] justify-center leading-[0] left-[320px] text-[#666666] text-[11px] top-[563.5px] translate-y-[-50%] w-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">30 days</p>
      </div>
      <ItemCardList4 />
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[17px] justify-center leading-[0] left-[320px] text-[#666666] text-[11px] top-[700.5px] translate-y-[-50%] w-[42px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">30 days</p>
      </div>
      <ItemCardList5 />
      <ItemCardList6 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p34769840} fill="var(--fill-0, #212121)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function StateLayer5() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon />
    </div>
  );
}

function IconContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer5 />
    </div>
  );
}

function Segment1() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 1">
      <IconContainer />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
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
            <path d={svgPaths.p3882d700} fill="var(--fill-0, #F20054)" />
            <path d={svgPaths.p1246ad00} fill="var(--fill-0, #F20054)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function StateLayer6() {
  return (
    <div className="box-border content-stretch flex h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon1 />
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="bg-surface-container content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[16px] shrink-0" data-name="icon-container">
      <StateLayer6 />
    </div>
  );
}

function Segment2() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 2">
      <IconContainer1 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#1c1b1f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
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

function StateLayer7() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon2 />
    </div>
  );
}

function IconContainer2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer7 />
    </div>
  );
}

function Segment3() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 3">
      <IconContainer2 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
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

function StateLayer8() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon3 />
    </div>
  );
}

function IconContainer3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer8 />
    </div>
  );
}

function Segment4() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 4">
      <IconContainer3 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
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
            <path d={svgPaths.p20e0b980} fill="var(--fill-0, black)" />
            <path d="M15 12H9V14H15V12Z" fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function StateLayer9() {
  return (
    <div className="box-border content-stretch flex gap-[10px] h-[32px] items-center justify-center px-[20px] py-[4px] relative shrink-0 w-[64px]" data-name="state-layer">
      <Icon4 />
    </div>
  );
}

function IconContainer4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 w-[32px]" data-name="icon-container">
      <StateLayer9 />
    </div>
  );
}

function Segment5() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[4px] grow items-center justify-center min-h-px min-w-px pb-[16px] pt-[12px] px-0 relative shrink-0" data-name="Segment 5">
      <IconContainer4 />
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] min-w-full relative shrink-0 text-[#49454f] text-[11px] text-center tracking-[0.5px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Orders</p>
      </div>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="absolute bg-white bottom-[24px] box-border content-stretch flex gap-[8px] items-start justify-start left-0 px-[8px] py-0 w-[375px]" data-name="navigation-bar">
      <div aria-hidden="true" className="absolute border-[#d0d0d0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Segment1 />
      <Segment2 />
      <Segment3 />
      <Segment4 />
      <Segment5 />
    </div>
  );
}

function CheckMarks1() {
  return (
    <div className="relative shrink-0 size-[33px]" data-name="Check marks">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 33">
        <g id="Check marks">
          <path d={svgPaths.p3e813500} fill="var(--fill-0, #FFCCD4)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function HmVerified1() {
  return (
    <div className="box-border content-stretch flex gap-[4px] items-center justify-start overflow-clip px-0 py-px relative shrink-0" data-name="HM Verified">
      <CheckMarks1 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.9)] w-[60px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Private</p>
      </div>
    </div>
  );
}

function CheckMarks2() {
  return (
    <div className="relative shrink-0 size-[33px]" data-name="Check marks">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 33">
        <g id="Check marks">
          <path d={svgPaths.p3e813500} fill="var(--fill-0, #FFCCD4)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function HmVerified2() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center justify-start overflow-clip top-px translate-x-[-50%]" data-name="HM Verified" style={{ left: "calc(50% - 73.5px)" }}>
      <CheckMarks2 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.9)] w-[34px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">B2B</p>
      </div>
    </div>
  );
}

function CheckMarks3() {
  return (
    <div className="relative shrink-0 size-[33px]" data-name="Check marks">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 33">
        <g id="Check marks">
          <path d={svgPaths.p3e813500} fill="var(--fill-0, #FFCCD4)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function HmVerified3() {
  return (
    <div className="absolute box-border content-stretch flex gap-[4px] items-center justify-start left-[87px] overflow-clip px-0 py-px top-0" data-name="HM Verified">
      <CheckMarks3 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.9)] w-[94px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">In store long</p>
      </div>
    </div>
  );
}

function B2BSelect() {
  return (
    <div className="h-[35px] relative shrink-0 w-[218px]" data-name="B2B select">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.12)] border-solid inset-0 pointer-events-none" />
      <HmVerified2 />
      <HmVerified3 />
    </div>
  );
}

function Pagerange2() {
  return (
    <div className="absolute bottom-[944px] content-stretch flex gap-[16px] h-[49px] items-center justify-start right-[20px] w-[335px]" data-name="Pagerange">
      <HmVerified1 />
      <B2BSelect />
    </div>
  );
}

function RightSide() {
  return (
    <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.661px]" data-name="Right Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
        <g id="Right Side">
          <g id="Battery">
            <path d={svgPaths.p18c81cf0} fill="var(--fill-0, #212121)" id="Rectangle" opacity="0.35" stroke="var(--stroke-0, white)" />
            <path d={svgPaths.p3d3cbf00} fill="var(--fill-0, #212121)" id="Combined Shape" opacity="0.4" />
            <path d={svgPaths.p3cceaf80} fill="var(--fill-0, #212121)" id="Rectangle_2" />
          </g>
          <path clipRule="evenodd" d={svgPaths.p1d7c8600} fill="var(--fill-0, #212121)" fillRule="evenodd" id="Wifi" />
          <path clipRule="evenodd" d={svgPaths.p3e2de00} fill="var(--fill-0, #212121)" fillRule="evenodd" id="Mobile Signal" />
        </g>
      </svg>
    </div>
  );
}

function Time() {
  return (
    <div className="absolute h-[21px] left-[24px] rounded-[24px] top-[12px] w-[54px]" data-name="_Time">
      <div className="absolute font-['Roboto:Regular',_sans-serif] font-normal h-[20px] leading-[0] left-[27px] text-[#212121] text-[15px] text-center top-px tracking-[-0.5px] translate-x-[-50%] w-[54px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">9:41</p>
      </div>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[24px] top-[12px]" data-name="Left Side">
      <Time />
    </div>
  );
}

function StatusBarIPhone1313Pro() {
  return (
    <div className="absolute h-[44px] left-0 overflow-clip top-0 w-[375px]" data-name="Status Bar / iPhone 13 & 13 Pro">
      <RightSide />
      <LeftSide />
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[10px] h-[24px] items-center justify-center left-0 p-[10px] w-[376px]" data-name="Home Indicator">
      <div className="bg-on-surface h-[5px] rounded-[100px] shrink-0 w-[136px]" data-name="Line" />
    </div>
  );
}

export default function ItemsSelected() {
  return (
    <div className="bg-neutral-50 relative size-full" data-name="Items - selected">
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[16px] text-[#212121] text-[24px] text-nowrap top-[58px] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] whitespace-pre">Items</p>
      </div>
      <FirstNameStart />
      <PendingItems />
      <NavigationBar />
      <Pagerange2 />
      <StatusBarIPhone1313Pro />
      <HomeIndicator />
    </div>
  );
}