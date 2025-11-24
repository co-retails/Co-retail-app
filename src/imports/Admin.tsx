import svgPaths from "./svg-hxa7jl3k8x";

function AndroidAppTopBar() {
  return (
    <div className="bg-surface box-border content-stretch flex gap-[8px] h-[48px] items-center justify-start px-[24px] py-0 relative shrink-0 w-[360px]" data-name="Android - AppTopBar">
      <div aria-hidden="true" className="absolute border-[#e4e4e4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="basis-0 flex flex-col font-['Roboto:Regular',_sans-serif] font-normal grow h-[24px] justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#1a1a1a] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[28px]">Admin</p>
      </div>
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function BuildingBlocksMonogram() {
  return (
    <div className="bg-secondary-container overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-name="Building Blocks/Monogram">
      <div className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] left-1/2 size-[40px] text-on-secondary-container text-[16px] text-center top-1/2 tracking-[0.15px] translate-x-[-50%] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">JD</p>
      </div>
    </div>
  );
}

function LeadingElement() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-start overflow-clip relative shrink-0" data-name="Leading element">
      <BuildingBlocksMonogram />
    </div>
  );
}

function Content() {
  return (
    <div className="basis-0 content-stretch flex flex-col font-['Roboto:Regular',_sans-serif] font-normal grow items-start justify-start leading-[0] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col justify-center relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Account</p>
      </div>
      <div className="leading-[20px] relative shrink-0 text-[#49454f] text-[14px] tracking-[0.25px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0">jane.doe@weekday.com</p>
        <p>AA123456</p>
      </div>
    </div>
  );
}

function StateLayer() {
  return (
    <div className="relative shrink-0 w-full" data-name="state-layer">
      <div className="relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start justify-start pl-[16px] pr-[24px] py-[12px] relative w-full">
          <LeadingElement />
          <Content />
          <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#f20054] text-[11px] text-nowrap text-right tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[16px] whitespace-pre">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density() {
  return (
    <div className="bg-neutral-100 content-stretch flex flex-col items-center justify-start relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled />
      <StateLayer />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled1() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function HelpOutline() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="help_outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="help_outline">
          <path d={svgPaths.pe593d70} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <HelpOutline />
    </div>
  );
}

function Content1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Help</p>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight />
    </div>
  );
}

function StateLayer1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement1 />
          <Content1 />
          <TrailingElement />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density1() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled1 />
      <StateLayer1 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled2() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function RadioButtonChecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_checked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_checked">
          <g id="Vector">
            <path d={svgPaths.p26f9ce00} fill="var(--fill-0, #1C1B1F)" />
            <path d={svgPaths.pee04100} fill="var(--fill-0, #1C1B1F)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeadingElement2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <RadioButtonChecked />
    </div>
  );
}

function Content2() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Status update</p>
      </div>
    </div>
  );
}

function ChevronRight1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, #1C1B1F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight1 />
    </div>
  );
}

function StateLayer2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement2 />
          <Content2 />
          <TrailingElement1 />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-[4px] relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 360 4">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #F5F5F5)" strokeWidth="4" x1="-1.74846e-07" x2="360" y1="2.00003" y2="2" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density2() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled2 />
      <StateLayer2 />
      <Divider />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled3() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content3() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-end min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] min-w-full relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.15px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Settings</p>
      </div>
    </div>
  );
}

function StateLayer3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-start pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content3 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density3() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled3 />
      <StateLayer3 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled4() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Flag() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="flag">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="flag">
          <path d={svgPaths.p20dfc440} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <Flag />
    </div>
  );
}

function Content4() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Notification settings</p>
      </div>
    </div>
  );
}

function ChevronRight2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight2 />
    </div>
  );
}

function StateLayer4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement3 />
          <Content4 />
          <TrailingElement2 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density4() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled4 />
      <StateLayer4 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled5() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Storefront() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="storefront">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p34769840} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <Storefront />
    </div>
  );
}

function Content5() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Partner settings</p>
      </div>
    </div>
  );
}

function ChevronRight3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight3 />
    </div>
  );
}

function StateLayer5() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement4 />
          <Content5 />
          <TrailingElement3 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density5() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled5 />
      <StateLayer5 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled6() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function ContactPage() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="contact_page">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="contact_page">
          <path d={svgPaths.p1657e600} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement5() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <ContactPage />
    </div>
  );
}

function Content6() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Private seller settings</p>
      </div>
    </div>
  );
}

function ChevronRight4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight4 />
    </div>
  );
}

function StateLayer6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement5 />
          <Content6 />
          <TrailingElement4 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density6() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled6 />
      <StateLayer6 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled7() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function CalendarMonth() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="calendar_month">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="calendar_month">
          <path d={svgPaths.p962bd00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <CalendarMonth />
    </div>
  );
}

function Content7() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Store calendar settings</p>
      </div>
    </div>
  );
}

function ChevronRight5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight5 />
    </div>
  );
}

function StateLayer7() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement6 />
          <Content7 />
          <TrailingElement5 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density7() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled7 />
      <StateLayer7 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled8() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content8() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-end min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] min-w-full relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.15px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Access</p>
      </div>
    </div>
  );
}

function StateLayer8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-start pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content8 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density8() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled8 />
      <StateLayer8 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled9() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Person() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="person">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="person">
          <path d={svgPaths.p263dbe00} fill="var(--fill-0, #1C1B1F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement7() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <Person />
    </div>
  );
}

function Content9() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">User accounts</p>
      </div>
    </div>
  );
}

function ChevronRight6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, #1C1B1F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight6 />
    </div>
  );
}

function StateLayer9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement7 />
          <Content9 />
          <TrailingElement6 />
        </div>
      </div>
    </div>
  );
}

function Divider1() {
  return (
    <div className="h-[4px] relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 360 4">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #F5F5F5)" strokeWidth="4" x1="-1.74846e-07" x2="360" y1="2.00003" y2="2" />
        </g>
      </svg>
    </div>
  );
}

function ListItemListItem0Density9() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled9 />
      <StateLayer9 />
      <Divider1 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled10() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Content10() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-end min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] min-w-full relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.15px]" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Reports</p>
      </div>
    </div>
  );
}

function StateLayer10() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-start pl-[16px] pr-[24px] py-[8px] relative size-full">
          <Content10 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density10() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled10 />
      <StateLayer10 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled11() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function Inventory() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="inventory">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="inventory">
          <g id="Vector">
            <path d={svgPaths.p3a434080} fill="var(--fill-0, black)" />
            <path d={svgPaths.p3538f80} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeadingElement8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <Inventory />
    </div>
  );
}

function Content11() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Stock check report</p>
      </div>
    </div>
  );
}

function ChevronRight7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight7 />
    </div>
  );
}

function StateLayer11() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement8 />
          <Content11 />
          <TrailingElement7 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density11() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled11 />
      <StateLayer11 />
    </div>
  );
}

function BuildingBlocksStateLayer1Enabled12() {
  return <div className="absolute inset-0" data-name="Building Blocks/state-layer/1. enabled" />;
}

function BarChart() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="bar_chart">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="bar_chart">
          <path d={svgPaths.p37d61080} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LeadingElement9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Leading element">
      <BarChart />
    </div>
  );
}

function Content12() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-full items-start justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Content">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1c1b1f] text-[16px] tracking-[0.5px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Sales dashboard</p>
      </div>
    </div>
  );
}

function ChevronRight8() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron_right">
          <path d={svgPaths.p2ded1f00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TrailingElement8() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="Trailing element">
      <ChevronRight8 />
    </div>
  );
}

function StateLayer12() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="state-layer">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
          <LeadingElement9 />
          <Content12 />
          <TrailingElement8 />
        </div>
      </div>
    </div>
  );
}

function ListItemListItem0Density12() {
  return (
    <div className="bg-surface content-stretch flex flex-col h-[56px] items-center justify-center relative shrink-0 w-[360px]" data-name="List item/List Item: 0 Density">
      <BuildingBlocksStateLayer1Enabled12 />
      <StateLayer12 />
    </div>
  );
}

function SettingsList() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-start left-0 top-[48px]" data-name="Settings list">
      <AndroidAppTopBar />
      <ListItemListItem0Density />
      <ListItemListItem0Density1 />
      <ListItemListItem0Density2 />
      <ListItemListItem0Density3 />
      <ListItemListItem0Density4 />
      <ListItemListItem0Density5 />
      <ListItemListItem0Density6 />
      <ListItemListItem0Density7 />
      <ListItemListItem0Density8 />
      <ListItemListItem0Density9 />
      <ListItemListItem0Density10 />
      <ListItemListItem0Density11 />
      <ListItemListItem0Density12 />
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

function StateLayer13() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center p-[8px] relative shrink-0" data-name="state-layer">
      <Close />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0" data-name="container">
      <StateLayer13 />
    </div>
  );
}

function TrailingIcon() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-center justify-center left-[308px] size-[48px] top-[16px]" data-name="trailing-icon">
      <Container />
    </div>
  );
}

export default function Admin() {
  return (
    <div className="bg-surface relative size-full" data-name="Admin">
      <SettingsList />
      <TrailingIcon />
    </div>
  );
}