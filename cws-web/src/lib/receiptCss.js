export const RECEIPT_CSS = `
  .rc { width: 300px; margin: 0 auto; background: #ffffff; color: #0f172a; padding: 20px 16px; font-family: 'Manrope', sans-serif; border-radius: 12px; }
  .rc * { box-sizing: border-box; margin: 0; }
  .rc-head { text-align: center; }
  .rc-logo { height: 42px; width: 42px; border-radius: 12px; object-fit: cover; margin: 0 auto 6px; display: block; }
  .rc-name { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; }
  .rc-sub { font-size: 10px; color: #64748b; margin-top: 3px; line-height: 1.5; }
  .rc-badge { display: inline-block; background: #f1f5f9; border-radius: 999px; padding: 2px 10px; font-size: 9px; font-weight: 800; color: #475569; margin-top: 6px; text-transform: uppercase; letter-spacing: .5px; }
  .rc-div { border: 0; border-top: 1.5px dashed #cbd5e1; margin: 12px 0; }
  .rc-meta { font-size: 11px; display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; }
  .rc-meta b { font-weight: 800; }
  .rc-mut { color: #64748b; }
  .rc-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .rc-table th { text-align: left; color: #94a3b8; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; padding: 0 0 4px; }
  .rc-table th.c, .rc-table td.c { text-align: center; }
  .rc-table th.r, .rc-table td.r { text-align: right; }
  .rc-table td { padding: 3px 0; border-bottom: 1px solid #f1f5f9; }
  .rc-table tr:last-child td { border-bottom: 0; }
  .rc-row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
  .rc-total { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff; border-radius: 10px; padding: 9px 12px; font-weight: 800; font-size: 13px; margin-top: 8px; }
  .rc-total span:last-child { color: #fbbf24; }
  .rc-foot { text-align: center; margin-top: 14px; }
  .rc-thanks { font-size: 11px; font-weight: 800; }
  .rc-powered { font-size: 9px; color: #94a3b8; margin-top: 4px; }
`