// An authorization file is separate from loading or serving advertisements.
export function adsTxt(publisherId='') {
 if(!publisherId)return null;
 if(!/^pub-\d{16}$/.test(publisherId)||publisherId==='pub-0000000000000000')throw Error('Use the real pub- ID from the AdSense account; placeholders are not accepted.');
 return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
}
