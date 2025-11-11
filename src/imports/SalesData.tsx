function Frame625906() {
  return (
    <div className="box-border content-stretch flex gap-[6px] h-[26px] items-center justify-start px-0 py-px relative shrink-0 w-full">
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-black w-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Jeans</p>
      </div>
      <div className="bg-accent h-[12px] shrink-0 w-[188px]" />
      <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre">55</p>
      </div>
    </div>
  );
}

function Frame625905() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[6px] items-center justify-start pl-0 pr-[39px] py-px relative w-full">
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-black w-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal]">{`Hoodies & Sweatshirts`}</p>
          </div>
          <div className="bg-accent h-[12px] shrink-0 w-[164px]" />
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre">49</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame625904() {
  return (
    <div className="h-[26px] relative shrink-0 w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[26px] items-center justify-start pl-0 pr-[50px] py-px relative w-full">
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-black w-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal]">Tops</p>
          </div>
          <div className="bg-accent h-[12px] shrink-0 w-[146px]" />
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre">45</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame625907() {
  return (
    <div className="h-[26px] relative shrink-0 w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[26px] items-center justify-start pl-0 pr-[34px] py-px relative w-full">
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-black w-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal]">{`Jackets & Coats`}</p>
          </div>
          <div className="bg-accent h-[12px] shrink-0 w-[146px]" />
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre">45</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame625908() {
  return (
    <div className="h-[26px] relative shrink-0 w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[26px] items-center justify-start pl-0 pr-[42px] py-px relative w-full">
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-black w-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal]">Pants</p>
          </div>
          <div className="bg-accent h-[12px] shrink-0 w-[119px]" />
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre">35</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame625909() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-start justify-start left-[20px] top-[97px] w-[303px]">
      <Frame625906 />
      <Frame625905 />
      <Frame625904 />
      <Frame625907 />
      <Frame625908 />
    </div>
  );
}

function Indicator1() {
  return (
    <div className="h-[14px] relative shrink-0 w-full" data-name="Indicator">
      <div className="absolute bg-accent bottom-0 h-[3px] left-[2px] right-[2px] rounded-tl-[100px] rounded-tr-[100px]" data-name="Shape" />
    </div>
  );
}

function TabContents1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-end overflow-clip relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#212121] text-[11px] text-center text-nowrap tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] whitespace-pre">Yesterday</p>
      </div>
      <Indicator1 />
    </div>
  );
}

function StateLayer1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative w-full">
          <TabContents1 />
        </div>
      </div>
    </div>
  );
}

function Tab2() {
  return (
    <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 2">
      <StateLayer1 />
    </div>
  );
}

function TabContents2() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[11px] text-center text-nowrap tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] whitespace-pre">7 days</p>
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
    <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip pb-[14px] pt-0 px-0 relative shrink-0" data-name="Tab Contents">
      <div className="font-['Roboto:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#49454f] text-[11px] text-center text-nowrap tracking-[0.5px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[16px] whitespace-pre">30 days</p>
      </div>
    </div>
  );
}

function StateLayer3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="State-layer">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-[16px] py-0 relative w-full">
          <TabContents3 />
        </div>
      </div>
    </div>
  );
}

function Tab4() {
  return (
    <div className="basis-0 content-stretch flex grow items-center justify-center min-h-px min-w-px overflow-clip relative shrink-0" data-name="Tab 4">
      <StateLayer3 />
    </div>
  );
}

function TabGroup() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0 w-full" data-name="Tab group">
      <Tab2 />
      <Tab3 />
      <Tab4 />
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 303 1">
        <g id="Divider">
          <line id="Divider_2" stroke="var(--stroke-0, #E7E0EC)" x1="-4.37114e-08" x2="303" y1="0.500026" y2="0.5" />
        </g>
      </svg>
    </div>
  );
}

function Tabs() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-start left-[20px] top-[54px] w-[303px]" data-name="Tabs">
      <TabGroup />
      <Divider />
    </div>
  );
}

function DashboardBg() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-start relative shrink-0 w-[343px]" data-name="Dashboard BG">
      <div className="bg-white h-[263px] rounded-[6px] shrink-0 w-full" />
      <Frame625909 />
      <div className="absolute flex flex-col font-['Roboto:Regular',_sans-serif] font-normal inset-[7.61%_6.12%_83.27%_5.83%] justify-center leading-[0] text-[#212121] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Top 5 categories - sold resell items</p>
      </div>
      <Tabs />
    </div>
  );
}

export default function SalesData() {
  return (
    <div className="relative size-full" data-name="Sales data">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start px-[16px] py-0 relative size-full">
          <div className="flex flex-col font-['Roboto:Regular',_sans-serif] font-normal h-[32px] justify-center leading-[0] relative shrink-0 text-[#1a1a1a] text-[14px] w-[123px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[32px]">Sales data</p>
          </div>
          <DashboardBg />
        </div>
      </div>
    </div>
  );
}