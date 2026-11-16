/** Shared sizes for admin search/filter toolbars, so every list page matches. */
const CONTROL = "h-12 rounded-full text-[15px] transition";

export const toolbarInputClass = `${CONTROL} border border-gray-200 bg-white px-5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20`;

/** Native select with the browser arrow removed; pair with <ToolbarSelect> for the chevron. */
export const toolbarSelectClass = `${CONTROL} w-full appearance-none border border-gray-200 bg-white pl-5 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20`;

export const toolbarPrimaryButtonClass = `${CONTROL} inline-flex items-center justify-center bg-primary px-7 font-medium text-white hover:bg-gray-800`;

export const toolbarSecondaryButtonClass = `${CONTROL} inline-flex items-center justify-center border border-gray-200 bg-white px-6 font-medium text-gray-900 hover:bg-gray-50`;
