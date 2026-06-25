const fs = require('fs');

const file = 'neighborhoods/westchester.html';
let html = fs.readFileSync(file, 'utf8');

const oldGrid = `    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:28px 0 36px 0">
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">90045</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Westchester focus</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">SFR</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Single-family emphasis</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">Local</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Street-by-street context</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">Offer</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Financing must support terms</div>
      </div>
    </div>`;

const newGrid = `    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:28px 0 18px 0">
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">$1.775M</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Median listing price</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">$892</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Median price per sq ft</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">99</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Active homes for sale</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">39 days</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Median days on market</div>
      </div>
    </div>
    <p style="font-weight:200;font-size:0.78rem;color:var(--muted);line-height:1.7;margin:0 0 36px 0">Source: Realtor.com Economic Research, Westchester market indicators as of March 2026. Realtor.com also reported a 99% sale-to-list ratio and classified Westchester as a buyer's market in February 2026.</p>`;

if (!html.includes(oldGrid)) {
  throw new Error('Could not find the generic Westchester market card grid to replace.');
}

html = html.replace(oldGrid, newGrid);
fs.writeFileSync(file, html);

console.log('Westchester market data cards updated.');
