import svgPaths from "./svg-3mbe72s84l";

function IconSearch() {
  return (
    <div className="absolute right-[298px] size-[24px] top-[12px]" data-name="icon_search">
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
    <div className="absolute h-[49px] left-[24px] overflow-clip top-[112px] w-[327px]" data-name="First name - Start">
      <div className="absolute bg-white bottom-px left-0 right-0 top-0" data-name="Text Field" />
      <IconSearch />
      <div className="absolute bottom-0 left-0 right-0 top-[97.96%]" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
          <path clipRule="evenodd" d="M0 0V1H327V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal inset-[22.45%_4.66%_24.49%_11.64%] justify-center leading-[0] text-[#8d8d8d] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">Search for Item ID</p>
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
      <div className="basis-0 flex flex-col font-['Roboto:Medium',_sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#666666] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px]">
          <span style={{ fontVariationSettings: "'wdth' 100" }}>0 (3899)</span>
          <span style={{ fontVariationSettings: "'wdth' 100" }}>{` items`}</span>
        </p>
      </div>
    </div>
  );
}

function PendingItems() {
  return (
    <div className="absolute content-stretch flex flex-col h-[573px] items-start justify-start left-1/2 top-[171px] translate-x-[-50%]" data-name="pending items">
      <Pagerange />
      <div className="h-px relative shrink-0 w-full" data-name="line">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <path clipRule="evenodd" d="M0 0V1H375V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="line" />
        </svg>
      </div>
      <Pagerange1 />
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

export default function StatusUpdate() {
  return (
    <div className="bg-white relative shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2),0px_1px_5px_0px_rgba(0,0,0,0.13)] size-full" data-name="Status update">
      <IconClose />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[32px] justify-center leading-[0] left-[24px] text-[#212121] text-[24px] top-[77px] tracking-[-0.4px] translate-y-[-50%] w-[233px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Status update</p>
      </div>
      <FirstNameStart />
      <PendingItems />
    </div>
  );
}