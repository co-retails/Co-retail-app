import svgPaths from "./svg-wj1z1xxhnf";
import imgRectangle55 from "figma:asset/91aae0881b4de478c432bd663b59bca268df6dec.png";
import imgThumbnail from "figma:asset/bccf40ef0d51ade359900027c9bd416d09e9658d.png";

function IconClose() {
  return (
    <div className="absolute left-[293px] size-[22px] top-[12px]" data-name="icon_close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="icon_close">
          <rect fill="var(--fill-0, #F20054)" height="22" id="path 32x32" rx="11" width="22" />
          <path d={svgPaths.pa388680} fill="var(--fill-0, white)" id="icon " />
        </g>
      </svg>
    </div>
  );
}

function FirstNameStart() {
  return (
    <div className="absolute h-[49px] left-[24px] overflow-clip top-[112px] w-[327px]" data-name="First name - Start">
      <IconClose />
      <div className="absolute bg-white bottom-px left-0 right-0 top-0" data-name="Text Field" />
      <div className="absolute bottom-0 left-0 right-0 top-[97.96%]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
          <path clipRule="evenodd" d="M0 0V1H327V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal inset-[22.45%_12.54%_24.49%_3.67%] justify-center leading-[0] text-[#1a1a1a] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">66</p>
      </div>
    </div>
  );
}

function ButtonVariants() {
  return (
    <button className="bg-error cursor-pointer h-[32px] relative rounded-[16px] shrink-0" data-name="Button / Variants">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[32px] items-center justify-center p-[30px] relative">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-center text-nowrap text-on-error tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Scan Price tag</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Pagerange() {
  return (
    <div className="box-border content-stretch flex gap-[16px] items-center justify-start pb-[16px] pt-[12px] px-[24px] relative shrink-0 w-[375px]" data-name="Pagerange">
      <ButtonVariants />
    </div>
  );
}

function Pagerange1() {
  return (
    <div className="box-border content-stretch flex gap-[16px] h-[49px] items-center justify-center px-[24px] py-0 relative shrink-0 w-[375px]" data-name="Pagerange">
      <div className="basis-0 flex flex-col font-['Roboto:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#666666] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[36px]">5 items</p>
      </div>
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
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F60051)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F60051)" id="Oval" r="4" />
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
        <p className="leading-[40px]">Pendning</p>
      </div>
    </div>
  );
}

function ListItemDetails() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 665342`}</span>
        </p>
      </div>
      <Status />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[12px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Date
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>: 2022-06-09</span>
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
      <ItemCardImage />
      <ListItemDetails />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€30</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[73px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">B2B</p>
      </div>
    </div>
  );
}

function ItemCardList() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo />
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
          <path clipRule="evenodd" d={svgPaths.p3f4cd700} fill="var(--fill-0, #F60051)" fillRule="evenodd" id="Shape" />
          <circle cx="9" cy="9" fill="var(--fill-0, #F60051)" id="Oval" r="4" />
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
        <p className="leading-[40px]">Pendning</p>
      </div>
    </div>
  );
}

function ListItemDetails1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-[16px] pr-0 py-0 relative shrink-0 w-[133px]" data-name="list item details">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 665341`}</span>
        </p>
      </div>
      <Status1 />
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

function ItemCardAllInfo1() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <ItemCardImage1 />
      <ListItemDetails1 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€10</p>
      </div>
    </div>
  );
}

function ItemCardList1() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo1 />
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

function ItemCardImage2() {
  return (
    <div className="h-[72px] opacity-50 relative shrink-0 w-[55px]" data-name="item card - image">
      <BuildingBlocksImageThumbnail />
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
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 66420`}</span>
        </p>
      </div>
      <Status2 />
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

function ItemCardAllInfo2() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <ItemCardImage2 />
      <ListItemDetails2 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[73px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">B2B</p>
      </div>
    </div>
  );
}

function ItemCardList2() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo2 />
    </div>
  );
}

function ItemCardImage3() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle55}')` }} />
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
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 66417`}</span>
        </p>
      </div>
      <Status3 />
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

function ItemCardAllInfo3() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <ItemCardImage3 />
      <ListItemDetails3 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€20</p>
      </div>
    </div>
  );
}

function ItemCardList3() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo3 />
    </div>
  );
}

function ItemCardImage4() {
  return (
    <div className="h-[72px] relative shrink-0 w-[55px]" data-name="item card - image">
      <div className="absolute bg-surface-variant bg-[position:50%_50%,_0%_0%] bg-size-[cover,auto] h-[72px] left-0 top-0 w-[55px]" style={{ backgroundImage: `url('${imgRectangle55}')` }} />
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
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 66416`}</span>
        </p>
      </div>
      <Status4 />
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

function ItemCardAllInfo4() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <ItemCardImage4 />
      <ListItemDetails4 />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€15</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[73px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">B2B</p>
      </div>
    </div>
  );
}

function ItemCardList4() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-[375px]" data-name="Item card - list">
      <div className="absolute h-0 left-0 top-px w-[375px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
            <line id="Line 3" stroke="var(--stroke-0, #E0E0E0)" x2="375" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <ItemCardAllInfo4 />
    </div>
  );
}

function PendingItems() {
  return (
    <div className="absolute content-stretch flex flex-col gap-px h-[551px] items-start justify-start left-1/2 top-[171px] translate-x-[-50%]" data-name="pending items">
      <Pagerange />
      <div className="h-px relative shrink-0 w-full" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <path clipRule="evenodd" d="M0 0V1H375V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <Pagerange1 />
      <ItemCardList />
      <ItemCardList1 />
      <ItemCardList2 />
      <ItemCardList3 />
      <ItemCardList4 />
    </div>
  );
}

function IconClose1() {
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

export default function StatusUpdateSearch() {
  return (
    <div className="bg-white relative shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2),0px_1px_5px_0px_rgba(0,0,0,0.13)] size-full" data-name="Status update - search">
      <IconClose1 />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[32px] justify-center leading-[0] left-[24px] text-[#212121] text-[24px] top-[77px] tracking-[-0.4px] translate-y-[-50%] w-[233px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Status update</p>
      </div>
      <FirstNameStart />
      <PendingItems />
    </div>
  );
}