export const EXPORT_STYLES=`
.dse-trigger{font:inherit}
.dse-backdrop{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.28);color:var(--dsw-alias-label-primary,#262a32);font:inherit;line-height:1.5}
.dse-backdrop *{box-sizing:border-box}
.dse-dialog{width:min(680px,100%);max-height:calc(100dvh - 40px);display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#e3e5e9);border-radius:16px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 20px 72px #0003;outline:0;overflow:hidden}
.dse-header{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:24px 26px 20px;border-bottom:1px solid var(--dsw-alias-border-l2,#e3e5e9)}
.dse-header h2{font:inherit;font-weight:650;font-size:1.28em;margin:0;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.dse-header h2 span{font-size:.65em;font-weight:450;color:var(--dsw-alias-label-secondary,#687080)}
.dse-header p,.dse-footer p{margin:5px 0 0;color:var(--dsw-alias-label-secondary,#687080);font-size:.86em}
.dse-body{padding:4px 26px 18px;overflow:auto;overscroll-behavior:contain;min-height:0}
.dse-group{padding:18px 0;border-bottom:1px solid var(--dsw-alias-border-l2,#e3e5e9)}
.dse-group h3{font:inherit;font-weight:600;margin:0 0 12px}
.dse-backdrop button,.dse-backdrop input,.dse-backdrop select{font:inherit;color:inherit}
.dse-backdrop button{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#d9dce3);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:8px;min-height:36px;padding:7px 12px;line-height:1.35;flex-shrink:0}
.dse-backdrop button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#f2f4f8)}
.dse-backdrop button:disabled{cursor:default;opacity:.45}
.dse-backdrop :focus-visible{outline:2px solid var(--dsw-alias-accent-primary,#4569d4);outline-offset:3px}
.dse-header .dse-icon{border:0;background:transparent;font-size:1.5em;line-height:1;padding:5px 9px;min-height:32px}
.dse-backdrop input:not([type=checkbox]),.dse-backdrop select{min-width:0;border:1px solid var(--dsw-alias-border-l2,#d9dce3);border-radius:8px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1,#fff));padding:9px 11px;min-height:38px;width:100%}
.dse-session,.dse-location{display:flex;gap:8px;align-items:center}.dse-session select{flex:1}.dse-location input{flex:1}
.dse-field{display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:center;margin-top:14px}.dse-field>span{display:flex;flex-direction:column}.dse-field small{font-size:.8em;color:var(--dsw-alias-label-secondary,#687080)}
.dse-formats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.dse-format{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;align-items:center;border:1px solid var(--dsw-alias-border-l2,#e0e3e9);border-radius:10px;padding:12px;cursor:pointer}
.dse-format.is-selected{border-color:var(--dsw-alias-accent-primary,#4569d4);background:color-mix(in srgb,var(--dsw-alias-accent-primary,#4569d4) 5%,transparent)}
.dse-format span{font-weight:600}.dse-format small{grid-column:2;color:var(--dsw-alias-label-secondary,#687080);font-size:.78em;overflow-wrap:anywhere}
.dse-backdrop input[type=checkbox]{width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-accent-primary,#4569d4);flex-shrink:0}
.dse-checks{display:flex;gap:20px;flex-wrap:wrap;margin-top:14px}.dse-checks label,.dse-alert label{display:flex;gap:8px;align-items:center}
.dse-note{margin:9px 0 0;color:var(--dsw-alias-label-secondary,#687080);font-size:.82em;overflow-wrap:anywhere}
.dse-details{margin-top:14px;font-size:.86em}.dse-details summary,.dse-alert summary{cursor:pointer;color:var(--dsw-alias-label-secondary,#687080)}.dse-details summary span{margin-left:7px}
.dse-backdrop pre{font:inherit;font-size:.9em;white-space:pre-wrap;overflow-wrap:anywhere;max-height:200px;overflow:auto;margin:10px 0 0;padding:12px;border-radius:8px;background:var(--dsw-alias-bg-base,#f5f6f8)}
.dse-alert{margin:16px 0 0;border-left:3px solid var(--dsw-alias-state-error-primary,#bd4e5c);padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd4e5c) 7%,transparent);border-radius:0 8px 8px 0;font-size:.9em;overflow-wrap:anywhere}
.dse-alert p{margin:5px 0 10px}.dse-status{margin-top:14px;font-size:.86em;color:var(--dsw-alias-label-secondary,#687080);overflow-wrap:anywhere;min-height:1.5em}
.dse-footer{padding:16px 26px 20px;border-top:1px solid var(--dsw-alias-border-l2,#e3e5e9);flex-shrink:0}.dse-footer p{margin:0 0 12px}.dse-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.dse-actions .dse-primary{background:var(--dsw-alias-accent-primary,#4569d4);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff);font-weight:600;padding-inline:22px}.dse-actions .dse-primary:hover:not(:disabled){background:var(--dsw-alias-accent-primary,#4569d4);filter:brightness(1.05)}
.dse-sr{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:560px){.dse-backdrop{padding:10px}.dse-dialog{max-height:calc(100dvh - 20px);border-radius:12px}.dse-header{padding:18px}.dse-body{padding:0 18px 14px}.dse-footer{padding:14px 18px}.dse-session{flex-wrap:wrap}.dse-session select{flex-basis:100%}.dse-field{grid-template-columns:1fr;gap:6px}.dse-format{padding:9px;gap:3px 5px}.dse-actions button{flex:1}.dse-header p{font-size:.82em}}
@media(max-width:400px){.dse-formats{grid-template-columns:1fr}.dse-format{grid-template-columns:auto 1fr auto}.dse-format small{grid-column:3}}
@media(prefers-reduced-motion:reduce){.dse-backdrop *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
