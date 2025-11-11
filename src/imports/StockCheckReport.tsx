import svgPaths from "./svg-2up3u0gvco";

function IconArrowDown() {
  return (
    <div className="absolute contents right-0 top-[16px]" data-name="icon_arrow_down">
      <div className="absolute bg-white right-0 rounded-[7px] size-[32px] top-[16px]" data-name="path 32x32" />
      <div className="absolute h-[6px] right-[10px] top-[29px] w-[12px]" data-name="shape">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 6">
          <path clipRule="evenodd" d="M0 0L6 6L12 0H0Z" fill="var(--fill-0, #666666)" fillRule="evenodd" id="icon" />
        </svg>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-white h-[49px] left-0 right-0 top-0">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.06)] border-solid inset-0 pointer-events-none" />
      <IconArrowDown />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[28px] justify-end leading-[0] left-[8px] text-[16px] text-[rgba(0,0,0,0.9)] top-[48px] translate-y-[-100%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[26px]">2023-10-09 (today)</p>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[8px] text-[#666666] text-[12px] top-[10px] translate-y-[-50%] w-[228px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px]">Report date</p>
      </div>
    </div>
  );
}

function InputField() {
  return (
    <div className="h-[73px] overflow-clip relative shrink-0 w-[327px]" data-name="Input field">
      <Frame2 />
    </div>
  );
}

function ReportSummary() {
  return (
    <div className="box-border content-stretch flex flex-col h-[375px] items-start justify-center px-0 py-[24px] relative w-[121px]" data-name="Report summary">
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "120.984375", "--transform-inner-height": "121", height: "calc(1px * ((var(--transform-inner-width) * 1) + (var(--transform-inner-height) * 0)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg] w-full">
          <div className="font-['Roboto:Regular',_sans-serif] font-normal h-[121px] leading-[26px] relative text-[14px] text-black w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="mb-0">{`Total: `}</p>
            <p className="mb-0">Scanned:</p>
            <p className="mb-0">Not scanned:</p>
            <p>Scanned not found:</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "120.984375", "--transform-inner-height": "121", height: "calc(1px * ((var(--transform-inner-width) * 1) + (var(--transform-inner-height) * 0)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg] w-full">
          <div className="font-['Roboto:Regular',_sans-serif] font-normal h-[121px] leading-[26px] relative text-[14px] text-black w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="mb-0">250</p>
            <p className="mb-0">244</p>
            <p className="mb-0">6</p>
            <p>5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame625917() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-center justify-start left-0 top-[93px]">
      <div className="flex flex-col font-['Roboto:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#212121] text-[12px] w-[327px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">{`To handle mismatch between actual stock in store and stock check report completed in the app, please click ‘Review items’.  `}</p>
      </div>
      <InputField />
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#212121] text-[0px] w-[327px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">
          <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Report summary
          </span>
          <span className="text-[16px]"> </span>
          <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[11px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            (number of items)
          </span>
        </p>
      </div>
      <div className="flex h-[120.984px] items-center justify-center relative shrink-0 w-[375px]">
        <div className="flex-none rotate-[270deg]">
          <ReportSummary />
        </div>
      </div>
    </div>
  );
}

function BtnPrimarySave() {
  return (
    <div className="absolute bottom-[19px] contents left-[198px]" data-name="btn_primary_save">
      <div className="absolute bottom-[19px] h-[42px] left-[198px] w-[161px]" data-name="Button BG">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 161 42">
          <path clipRule="evenodd" d={svgPaths.p2bb2dd00} fill="var(--fill-0, #F20054)" fillRule="evenodd" id="Button BG" />
        </svg>
      </div>
      <div className="absolute bottom-[40px] flex flex-col font-['Roboto:Medium',_sans-serif] font-medium h-[42px] justify-center leading-[0] left-[278.5px] text-[12px] text-center text-white tracking-[1.4px] translate-x-[-50%] translate-y-[50%] w-[161px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">DONE</p>
      </div>
    </div>
  );
}

function ButtonVariants() {
  return (
    <button className="absolute bg-white bottom-[19px] cursor-pointer h-[42px] left-[16px] rounded-[16px] w-[161px]" data-name="Button / Variants">
      <div aria-hidden="true" className="absolute border border-[#f20054] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[15px] h-[42px] items-center justify-center p-[30px] relative w-[161px]">
          <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#212121] text-[12px] text-center text-nowrap tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px] whitespace-pre">Review items</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function AppButtons() {
  return (
    <div className="absolute bottom-[19px] contents left-0" data-name="App - Buttons">
      <div className="absolute bottom-[76px] h-px left-0 w-[375px]" data-name="divider">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <path clipRule="evenodd" d="M0 0V1H375V0H0Z" fill="var(--fill-0, #E0E0E0)" fillRule="evenodd" id="divider" />
        </svg>
      </div>
      <BtnPrimarySave />
      <ButtonVariants />
    </div>
  );
}

function BottomCtAs() {
  return (
    <div className="absolute bg-white h-[77px] left-0 top-[735px] w-[375px]" data-name="Bottom CTAs">
      <AppButtons />
    </div>
  );
}

export default function StockCheckReport() {
  return (
    <div className="bg-white relative size-full" data-name="Stock check report">
      <BottomCtAs />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] left-[24px] text-[#212121] text-[24px] text-nowrap top-[77px] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[32px] whitespace-pre">Stock check report</p>
      </div>
      <Frame625917 />
    </div>
  );
}