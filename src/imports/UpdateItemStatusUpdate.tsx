import svgPaths from "./svg-phv32rahtk";
import imgThumbnail from "figma:asset/bccf40ef0d51ade359900027c9bd416d09e9658d.png";

function BuildingBlocksImageThumbnail() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-start justify-start left-0 size-[55px] top-[9px]" data-name="Building Blocks/image-Thumbnail">
      <div className="basis-0 bg-center bg-cover bg-no-repeat grow h-[56px] min-h-px min-w-px shrink-0" data-name="Thumbnail" style={{ backgroundImage: `url('${imgThumbnail}')` }} />
    </div>
  );
}

function ItemCardImage() {
  return (
    <div className="h-[72px] opacity-50 relative shrink-0 w-[55px]" data-name="item card - image">
      <BuildingBlocksImageThumbnail />
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
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[26px] text-[14px] whitespace-pre">
          <span className="text-[#666666]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ID:
          </span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` 66420`}</span>
        </p>
      </div>
      <Status />
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

function ItemCardAllInfo() {
  return (
    <div className="absolute box-border content-stretch flex gap-[3px] items-center justify-start left-0 pl-[6px] pr-0 py-0 top-[2px]" data-name="item card all info">
      <ItemCardImage />
      <ListItemDetails />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[43px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">€40</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black w-[73px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">B2B</p>
      </div>
    </div>
  );
}

function ItemCardList() {
  return (
    <div className="bg-white h-[112px] relative shrink-0 w-full" data-name="Item card - list">
      <ItemCardAllInfo />
    </div>
  );
}

function SelectStoreVariants() {
  return (
    <div className="h-[49px] relative shrink-0 w-[326px]" data-name="Select store / Variants">
      <div className="absolute h-px left-0 top-[48px] w-[326px]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326 1">
          <path clipRule="evenodd" d="M0 0V1H326V0H0Z" fill="var(--fill-0, black)" fillOpacity="0.12" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[28px] justify-end leading-[0] left-[8px] text-[#1a1a1a] text-[16px] top-[48px] translate-y-[-100%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">In Store</p>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[8px] text-[#666666] text-[12px] top-[10px] translate-y-[-50%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Current status</p>
      </div>
    </div>
  );
}

function IconArrowDown() {
  return (
    <div className="absolute left-[294px] size-[32px] top-[17px]" data-name="icon_arrow_down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="icon_arrow_down">
          <g id="path 32x32"></g>
          <path clipRule="evenodd" d="M10 13L16 19L22 13H10Z" fill="var(--fill-0, #666666)" fillRule="evenodd" id="shape" />
        </g>
      </svg>
    </div>
  );
}

function SelectStoreVariants1() {
  return (
    <div className="h-[49px] relative shrink-0 w-[326px]" data-name="Select store / Variants">
      <div className="absolute h-px left-0 top-[48px] w-[326px]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326 1">
          <path clipRule="evenodd" d="M0 0V1H326V0H0Z" fill="var(--fill-0, black)" fillOpacity="0.12" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[28px] justify-end leading-[0] left-[8px] text-[#1a1a1a] text-[16px] top-[48px] translate-y-[-100%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Sold</p>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[8px] text-[#666666] text-[12px] top-[10px] translate-y-[-50%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">New status</p>
      </div>
      <IconArrowDown />
    </div>
  );
}

function StoreSelector() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[35px] items-start justify-start left-[24px] top-[109px]" data-name="store selector">
      <ItemCardList />
      <SelectStoreVariants />
      <SelectStoreVariants1 />
    </div>
  );
}

function BtnSecondaryCancel() {
  return (
    <button className="absolute block cursor-pointer h-[42px] overflow-visible translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="btn_secondary_cancel" style={{ top: "calc(50% - 1.5px)", left: "calc(50% - 91.524px)" }}>
      <div className="absolute h-[42px] right-0 top-0 w-[160px]" data-name="button bg">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 42">
          <path clipRule="evenodd" d={svgPaths.p231edb00} fill="var(--fill-0, #F0F0F0)" fillRule="evenodd" id="button bg" />
        </svg>
      </div>
      <div className="absolute bottom-0 flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[0.01%] right-[-0.01%] text-[#666666] text-[12px] text-center top-0 tracking-[1.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">CANCEL</p>
      </div>
    </button>
  );
}

function BtnPrimarySave() {
  return (
    <div className="absolute h-[42px] translate-x-[-50%] translate-y-[-50%] w-[161px]" data-name="btn_primary_save" style={{ top: "calc(50% - 1.5px)", left: "calc(50% + 91px)" }}>
      <div className="absolute bottom-0 left-[0.23%] right-[0.39%] top-0" data-name="Button BG">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 42">
          <path clipRule="evenodd" d={svgPaths.p231edb00} fill="var(--fill-0, #F20054)" fillRule="evenodd" id="Button BG" />
        </svg>
      </div>
      <div className="absolute bottom-0 flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[11.8%] right-[12.35%] text-[12px] text-center text-white top-0 tracking-[1.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">UPDATE</p>
      </div>
    </div>
  );
}

function AppButtons() {
  return (
    <div className="absolute bg-white h-[77px] left-0 top-[735px] w-[375px]" data-name="App - Buttons">
      <div className="absolute bottom-[98.44%] left-0 right-0 top-0" data-name="divider">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 2">
          <path clipRule="evenodd" d="M0 0V1.20312H375V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="divider" />
        </svg>
      </div>
      <BtnSecondaryCancel />
      <BtnPrimarySave />
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

export default function UpdateItemStatusUpdate() {
  return (
    <div className="bg-white relative shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2),0px_1px_5px_0px_rgba(0,0,0,0.13)] size-full" data-name="Update item status - update">
      <AppButtons />
      <IconClose />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[32px] justify-center leading-[0] left-[24px] text-[#212121] text-[24px] top-[77px] tracking-[-0.4px] translate-y-[-50%] w-[233px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Update item status</p>
      </div>
      <StoreSelector />
    </div>
  );
}