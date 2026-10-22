(function(){
  if(window.console) console.log('LeCavist quiz: init starting');

  // Click delegation is attached FIRST — before any data parsing or matrix
  // setup that could (in theory) throw — so the option cards always respond
  // as soon as lcPick/lcPickC exist. Document-level so it survives theme-
  // editor section re-renders. Idempotent + guarded against double-binding.
  if(!window.__lcQuizDelegated){
    window.__lcQuizDelegated = true;
    document.addEventListener('click', function(e){
      var t = e.target;
      if(!t || !t.closest) return;
      if(!t.closest('.lc-quiz-wrap')) return;
      var opt = t.closest('.opt');
      if(opt && typeof opt.dataset.s !== 'undefined' && typeof window.lcPick === 'function'){
        try { window.lcPick(opt); } catch(err){ if(window.console) console.error('lcPick failed', err); }
        return;
      }
      var copt = t.closest('.copt');
      if(copt && typeof copt.dataset.s !== 'undefined' && typeof window.lcPickC === 'function'){
        try { window.lcPickC(copt); } catch(err){ if(window.console) console.error('lcPickC failed', err); }
        return;
      }
    });
  }

  try {
  const A = {};

  // Catalog data is delivered as a non-executable JSON island (above) and
  // parsed safely here. This guarantees that no product title, price or spec
  // value can ever break the quiz's JavaScript — a malformed value at worst
  // yields empty data, never a dead page.
  var LCDATA = { PROD:{}, DUO:{}, CAB:[] };
  try {
    var lcDataEl = document.getElementById('lc-quiz-data');
    if(lcDataEl){ LCDATA = JSON.parse(lcDataEl.textContent) || LCDATA; }
  } catch(lcErr){ if(window.console) console.error('LeCavist quiz: catalog data parse failed —', lcErr); }
  window.LCPROD = LCDATA.PROD || {};
  window.LCDUO  = LCDATA.DUO  || {};
  window.LCCAB  = LCDATA.CAB  || [];

  // Live catalog data (price / title / image / url / availability) is injected
  // from Shopify by Liquid into window.LCPROD + window.LCDUO — nothing here is
  // hardcoded. This matrix holds only curation: which product (by handle) is
  // recommended for each answer combo, plus editorial copy (why / tags).
  const PROD = window.LCPROD || {};
  const DUO  = window.LCDUO  || {};

  const P = {
    small_free_single_black:[
      {h:"lecavist-63-bottle-wine-fridge-single-zone-lkcv63n",t:["63 bottles","Single zone","Freestanding"],f:"black",w:"Compact and quiet — ideal for a kitchen corner or under a bench with 200 mm clearance.",top:1},
      {h:"lecavist-56-bottle-wine-fridge-dual-zone-black-lks56vn2z",t:["56 bottles","Dual zone","Freestanding"],f:"black",w:"Step up for dual-zone flexibility if you ever want whites chilled and reds at serving temp simultaneously."}
    ],
    small_free_single_steel: null,
    small_free_dual_black:[
      {h:"lecavist-56-bottle-wine-fridge-dual-zone-black-lks56vn2z",t:["56 bottles","Dual zone","Freestanding"],f:"black",w:"Our most popular small cabinet — reds above, whites chilled below. Beech shelves, silent compressor.",top:1}
    ],
    small_free_dual_steel: null,
    small_free_triple_black:[
      {h:"lecavist-56-bottle-wine-fridge-dual-zone-black-lks56vn2z",t:["56 bottles","Dual zone","Freestanding"],f:"black",w:"Best match in this size range. Triple zone is available from 140 bottles if you need three chambers.",top:1}
    ],
    small_free_triple_steel: null,
    small_built_single_black:[
      {h:"lecavist-52-bottle-wine-cabinet-single-zone-lj52vnbu",t:["52 bottles","Single zone","Built-in"],f:"black",w:"Front-vented for flush cabinetry — no side clearance needed. Elegant glass door.",top:1}
    ],
    small_built_single_steel: null,
    small_built_dual_black:[
      {h:"lecavist-44-bottle-wine-cabinet-dual-zone-lj44vn2zbu",t:["44 bottles","Dual zone","Built-in"],f:"black",w:"Front-vented for flush installation. Two independent zones — the ideal under-bench wine cabinet.",top:1},
      {h:"lecavist-52-bottle-wine-cabinet-single-zone-lj52vnbu",t:["52 bottles","Single zone","Built-in"],f:"black",w:"More bottle capacity if budget is a priority — same sleek built-in finish, single temperature."}
    ],
    small_built_dual_steel: null,
    small_built_triple_black:[
      {h:"lecavist-44-bottle-wine-cabinet-dual-zone-lj44vn2zbu",t:["44 bottles","Dual zone","Built-in"],f:"black",w:"Best built-in match at this size. Triple zone available from 140 bottles if you need three chambers.",top:1}
    ],
    small_built_triple_steel: null,

    medium_free_single_black:[
      {h:"lecavist-168-bottle-wine-cabinet-single-zone-black-lek168pv",t:["168 bottles","Single zone","Freestanding"],f:"black",w:"A statement piece for the serious ager — full-height display, label-view shelving, UV glass.",top:1}
    ],
    medium_free_single_steel:[
      {h:"lecavist-168-bottle-wine-cabinet-single-zone-stainless-steet-lek168pvx-copy",t:["168 bottles","Single zone","Freestanding"],f:"steel",w:"The same full-height cabinet in a premium stainless finish — pairs beautifully with modern kitchen appliances.",top:1}
    ],
    medium_free_dual_black:[
      {h:"lecavist-140-bottle-wine-cabinet-triple-zone-stainless-steel-lek1403zpvx",t:["140 bottles","Triple zone","Freestanding"],f:"black",w:"Three independent temperature zones — store reds, whites and sparkling each in their ideal environment.",top:1},
      {h:"lecavist-168-bottle-wine-cabinet-single-zone-black-lek168pv",t:["168 bottles","Single zone","Freestanding"],f:"black",w:"More capacity if you mainly age reds — label-view shelving, full-height display."}
    ],
    medium_free_dual_steel:[
      {h:"lecavist-140-bottle-wine-cabinet-triple-zone-stainless-steel-lek1403zpvx",t:["140 bottles","Triple zone","Freestanding"],f:"steel",w:"Three independent chambers in a premium stainless finish — the most versatile mid-range cabinet.",top:1},
      {h:"lecavist-168-bottle-wine-cabinet-single-zone-stainless-steet-lek168pvx-copy",t:["168 bottles","Single zone","Freestanding"],f:"steel",w:"If single-zone suits your collection better — same stainless finish with more bottle capacity."}
    ],
    medium_free_triple_black:[
      {h:"lecavist-140-bottle-wine-cabinet-triple-zone-stainless-steel-lek1403zpvx",t:["140 bottles","Triple zone","Freestanding"],f:"black",w:"Three independent chambers — reds, whites and sparkling each at their ideal temperature.",top:1}
    ],
    medium_free_triple_steel:[
      {h:"lecavist-140-bottle-wine-cabinet-triple-zone-stainless-steel-lek1403zpvx",t:["140 bottles","Triple zone","Freestanding"],f:"steel",w:"Three independent chambers in stainless — the definitive mid-range cabinet for the serious collector.",top:1}
    ],
    medium_built_single_black:[
      {h:"lecavist-195-bottle-professional-wine-fridge-lcs300vx1zpro",t:["195 bottles","Single zone","Built-in","Professional"],f:"black",w:"Flagship built-in — commercial-grade compressor, stainless and glass for a showroom finish.",top:1}
    ],
    medium_built_single_steel: null,
    medium_built_dual_black:[
      {h:"lecavist-188-bottle-wine-fridge-dual-zone-side-by-side-black-lcs200vn2z",t:["188 bottles","Dual zone","Built-in","Side by side"],f:"black",w:"Wide side-by-side format for large integrated niches — two independent zones, striking full-height glass.",top:1}
    ],
    medium_built_dual_steel: null,
    medium_built_triple_black:[
      {h:"lecavist-188-bottle-wine-fridge-dual-zone-side-by-side-black-lcs200vn2z",t:["188 bottles","Dual zone","Built-in"],f:"black",w:"Best built-in match in this range. Contact our team to discuss a three-zone configuration.",top:1}
    ],
    medium_built_triple_steel: null,

    large_free_single_black:[
      {h:"lecavist-248-bottle-wine-fridge-single-zone-lcs240vn1z1d",t:["248 bottles","Single zone","Freestanding"],f:"black",w:"Serious collector's cabinet — label-view shelves, no-frost, near-silent at 45 dB.",top:1}
    ],
    large_free_single_steel: null,
    large_free_dual_black:[
      {h:"lecavist-268-bottle-dual-zone-lj268vn2z",t:["268 bottles","Dual zone","Freestanding"],f:"black",w:"Floor-to-ceiling elegance — 268 Bordeaux bottles across two independent zones. The centrepiece cabinet.",top:1},
      {h:"lecavist-248-bottle-wine-fridge-single-zone-lcs240vn1z1d",t:["248 bottles","Single zone","Freestanding"],f:"black",w:"More affordable option if your collection trends toward reds aged at one consistent temperature."}
    ],
    large_free_dual_steel: null,
    large_free_triple_black:[
      {h:"lecavist-268-bottle-dual-zone-lj268vn2z",t:["268 bottles","Dual zone","Freestanding"],f:"black",w:"Best freestanding match at this capacity. Contact us to discuss a triple-zone configuration.",top:1}
    ],
    large_free_triple_steel: null,
    large_built_single_black:[
      {h:"lecavist-195-bottle-professional-wine-fridge-lcs300vx1zpro",t:["195 bottles","Single zone","Built-in","Professional"],f:"black",w:"Commercial-grade built-in — contact our team for multi-unit configurations for large spaces.",top:1}
    ],
    large_built_single_steel: null,
    large_built_dual_black:[
      {h:"lecavist-188-bottle-wine-fridge-dual-zone-side-by-side-black-lcs200vn2z",t:["188 bottles","Dual zone","Built-in Duo"],f:"black",w:"Architect-grade side-by-side built-in — two independent zones for a spectacular kitchen integration.",top:1}
    ],
    large_built_dual_steel: null,
    large_built_triple_black:[
      {h:"lecavist-195-bottle-professional-wine-fridge-lcs300vx1zpro",t:["195 bottles","Built-in","Professional"],f:"black",w:"Flagship built-in — our commercial team can configure a triple-zone multi-unit solution.",top:1}
    ],
    large_built_triple_steel: null,

    xl_free_single_black:[
      {h:"lecavist-248-bottle-wine-fridge-single-zone-lcs240vn1z1d",t:["248 bottles","Single zone","Freestanding"],f:"black",w:"Start here — or pair two for 496+ bottles using our Signature Duo range.",top:1},
      {col:"duo",t:["Matched pair","Side by side","Double capacity"],f:"black",w:"Two matched cabinets side by side — maximum capacity and exceptional visual impact."}
    ],
    xl_free_single_steel: null,
    xl_free_dual_black:[
      {h:"lecavist-268-bottle-dual-zone-lj268vn2z",t:["268 bottles","Dual zone","Freestanding"],f:"black",w:"Our largest dual-zone freestanding cabinet — or pair two for a 500+ bottle cellar.",top:1},
      {col:"duo",t:["Matched pair","Side by side"],f:"black",w:"Matched pairs designed to stand side by side for maximum capacity and visual impact."}
    ],
    xl_free_dual_steel: null,
    xl_free_triple_black:[
      {h:"lecavist-268-bottle-dual-zone-lj268vn2z",t:["268 bottles","Dual zone","Freestanding"],f:"black",w:"For 260+ bottles with multiple zones, contact our team — we can configure a bespoke solution.",top:1}
    ],
    xl_free_triple_steel: null,
    xl_built_single_black:[
      {h:"lecavist-195-bottle-professional-wine-fridge-lcs300vx1zpro",t:["195 bottles","Built-in","Professional"],f:"black",w:"For large built-in projects our commercial team can specify a multi-unit configuration.",top:1}
    ],
    xl_built_single_steel: null,
    xl_built_dual_black:[
      {h:"lecavist-188-bottle-wine-fridge-dual-zone-side-by-side-black-lcs200vn2z",t:["188 bottles","Dual zone","Built-in Duo"],f:"black",w:"For 260+ built-in bottles, our B2B team specialises in multi-unit configurations for large projects.",top:1}
    ],
    xl_built_dual_steel: null,
    xl_built_triple_black:[
      {h:"lecavist-195-bottle-professional-wine-fridge-lcs300vx1zpro",t:["195 bottles","Built-in","Professional"],f:"black",w:"Flagship built-in — our team can configure a triple-zone multi-unit solution for large spaces.",top:1}
    ],
    xl_built_triple_steel: null
  };

  // Standard loading is assumed by default — visitors don't need to pick a
  // loading style during the quiz. They can refine to Comfort or Max on the
  // results page if they want a different ranking.
  A.load = 'standard';

  // Dynamic per-step H1 — each step feels like progress rather than repetition.
  var TITLES = {
    0: 'Tell us about your collection',
    1: 'Tell us about your space',
    2: 'Tell us about your wines',
    R: 'Your perfect match'
  };
  function setStepTitle(key){
    var el = document.getElementById('lc-step-title');
    if(el && TITLES[key]) el.textContent = TITLES[key];
  }

  // Step 1 (install + finish combined) needs BOTH picks before Continue enables.
  function lcCheckN1(){
    document.getElementById('n1').disabled = !(A[1] && A[3]);
  }

  window.lcPick = function(el){
    const s = el.dataset.s;
    document.querySelectorAll('.lc-quiz-wrap .opt[data-s="'+s+'"]').forEach(o=>o.classList.remove('sel'));
    el.classList.add('sel');
    A[s] = el.dataset.v;
    if(s === '1'){ lcCheckN1(); }
    else { document.getElementById('n'+s).disabled = false; }
  };

  // Results-page refinement — switching pill updates the capacity estimate and
  // re-ranks the recommendations + matrix without restarting the quiz.
  window.lcRefineLoad = function(load){
    if(!load) return;
    A.load = load;
    document.querySelectorAll('.lc-quiz-wrap .refine-pill').forEach(function(p){
      p.classList.toggle('is-active', p.dataset.load === load);
    });
    lcCalcCapacity();   // recompute the minimum-capacity estimate + re-rank
  };

  // ── Capacity calculator (results page) ──────────────────────────────
  // Visitor enters how many bottles they want to store and picks a loading
  // style; we show the minimum advertised cabinet capacity that fits, using
  // the same loading thresholds as the "find my perfect capacity" tool:
  //   Comfort ≈ 65% full · Standard ≈ 85% full · Max = 100% full.
  // When a count is entered we also use it as the precise capacity target so
  // the recommendations + comparison re-rank to cabinets that actually fit.
  var LC_LOAD_FACTOR = { comfort: 0.65, standard: 0.85, max: 1.0 };
  window.lcCalcCapacity = function(){
    var input = document.getElementById('lc-cap-input');
    var out   = document.getElementById('lc-cap-output');
    var f     = LC_LOAD_FACTOR[A.load] || 0.85;
    var bottles = input ? parseInt(input.value, 10) : NaN;
    if(bottles && bottles > 0){
      var minCap = Math.ceil(bottles / f);
      lcManualMin = minCap;
      if(out){
        var loadName = { comfort:'Comfort', standard:'Standard', max:'Max' }[A.load] || 'Standard';
        var pct = Math.round(f * 100);
        out.hidden = false;
        out.innerHTML =
          'To store <b>' + bottles + ' bottles</b> at <b>' + loadName + '</b> loading (≈ ' + pct + '% full), ' +
          'choose a cabinet rated for <b>≈ ' + minCap + ' bottles</b> or more.';
      }
    } else {
      lcManualMin = null;
      if(out){ out.hidden = true; }
    }
    lcShowR();   // re-rank using lcManualMin (when set)
  };

  window.lcPickC = function(el){
    document.querySelectorAll('.lc-quiz-wrap .copt').forEach(o=>o.classList.remove('sel'));
    el.classList.add('sel');
    A[3] = el.dataset.v;
    lcCheckN1();   // finish lives inside the combined step-1 nav
    // Surface the stainless-availability note only when the visitor explicitly
    // demands stainless-only (the new "Either" choice doesn't need the note).
    document.getElementById('cnote').classList.toggle('on', el.dataset.v==='steel');
  };

  // Single source of truth for step switching: hide every step (including
  // results) then reveal the target. Works identically forward and back.
  window.lcGo = function(n){
    ['s0','s1','s2','sR'].forEach(function(id){
      var el = document.getElementById(id); if(el) el.classList.remove('on');
    });
    var target = document.getElementById('s'+n); if(target) target.classList.add('on');
    lcProg(n);
    setStepTitle(n);
  };

  // "Adjust my answers" — back to step 0 without destroying A. The previous
  // picks are remembered so the visitor can refine, not start over.
  window.lcAdjust = function(ev){
    if(ev && ev.preventDefault) ev.preventDefault();
    document.getElementById('sR').classList.remove('on');
    document.getElementById('s0').classList.add('on');
    lcProg(0);
    setStepTitle(0);
    // Re-apply visible selection state so the visitor sees what they had picked.
    document.querySelectorAll('.lc-quiz-wrap .opt').forEach(function(o){
      o.classList.toggle('sel', A[o.dataset.s] === o.dataset.v);
    });
    document.querySelectorAll('.lc-quiz-wrap .copt').forEach(function(o){
      o.classList.toggle('sel', A[3] === o.dataset.v);
    });
    // Re-enable Continue buttons for any step whose answers are already set.
    if(A[0]) document.getElementById('n0').disabled = false;
    if(A[2]) document.getElementById('n2').disabled = false;
    lcCheckN1();
  };

  // "Download as PDF" — opens a new browser tab containing a fully styled,
  // print-optimized summary of the visitor's recommendations: answers, top
  // matches (with product photos), the full comparison table, clearance and
  // temperature guidance, "how we count" notes. After all images have loaded,
  // the new tab auto-triggers window.print() — the visitor can pick "Save as
  // PDF" in the print dialog (built into every modern browser) or print it
  // directly. No backend / external library needed.
  window.lcDownloadPDF = function(){
    var sizeLabels = {
      small:  'Compact (up to 63 bottles)',
      medium: 'Mid-range (64–168 bottles)',
      large:  'Large (169–260 bottles)',
      xl:     'Flagship (260+ bottles)'
    };
    var instLabels = { free: 'Freestanding', built: 'Built-in / under-bench' };
    var zoneLabels = { single: 'Single zone — one temperature', dual: 'Dual zone — two temperatures', triple: 'Triple zone — three temperatures' };
    var colLabels  = { black: 'Black', either: 'No preference (black or stainless)', steel: 'Stainless steel only' };
    var loadLabels = { comfort: 'Comfort (~70% — roomy)', standard: 'Standard (~85% — balanced)', max: 'Max (advertised capacity)' };

    // Build the answers list
    var answersRows = '';
    if(A[0])   answersRows += '<dt>Collection size</dt><dd>' + lcEsc(sizeLabels[A[0]] || A[0]) + '</dd>';
    if(A[1])   answersRows += '<dt>Installation</dt><dd>'   + lcEsc(instLabels[A[1]] || A[1]) + '</dd>';
    if(A[2])   answersRows += '<dt>Cooling zones</dt><dd>'  + lcEsc(zoneLabels[A[2]] || A[2]) + '</dd>';
    if(A[3])   answersRows += '<dt>Finish</dt><dd>'         + lcEsc(colLabels[A[3]]  || A[3]) + '</dd>';
    if(A.load) answersRows += '<dt>Loading style</dt><dd>'  + lcEsc(loadLabels[A.load] || A.load) + '</dd>';

    // Best-match cards from the live results
    var cardsHtml = '';
    var cards = document.querySelectorAll('.lc-quiz-wrap .pcards a.pc');
    cards.forEach(function(a, i){
      var imgEl = a.querySelector('.pimg img');
      var imgSrc = imgEl ? imgEl.getAttribute('src') : '';
      var name   = ((a.querySelector('.pname')  || {}).textContent || '').trim();
      var price  = ((a.querySelector('.pprice') || {}).textContent || '').trim();
      var why    = ((a.querySelector('.pwhy')   || {}).textContent || '').trim();
      var miss   = ((a.querySelector('.pmiss')  || {}).textContent || '').trim();
      var url    = a.getAttribute('href') || '';
      if(url && url.indexOf('http') !== 0) url = window.location.origin + url;
      cardsHtml +=
        '<div class="match' + (i === 0 ? ' is-best' : '') + '">' +
          (imgSrc ? '<div class="match-img"><img src="'+lcEsc(imgSrc)+'" alt=""></div>' : '<div class="match-img"></div>') +
          '<div class="match-body">' +
            '<h3>' + lcEsc(name) + (i === 0 ? '<span class="pdf-badge">Best match</span>' : '') + '</h3>' +
            (price ? '<p class="match-price">' + lcEsc(price) + '</p>' : '') +
            (why   ? '<p class="match-why">'   + lcEsc(why)   + '</p>' : '') +
            (miss  ? '<p class="match-miss">'  + lcEsc(miss)  + '</p>' : '') +
            (url   ? '<p class="match-url">'   + lcEsc(url)   + '</p>' : '') +
          '</div>' +
        '</div>';
    });

    // Side-by-side comparison table (real HTML table, not a list)
    var cmpHtml = '';
    if(lastCmp && lastCmp.length){
      var rows = [
        { lbl: 'Price',              fn: function(c){ return c.av === false ? 'Sold out' : (c.p || '—'); } },
        { lbl: 'Capacity',           fn: function(c){ return c.cap ? c.cap + ' bottles' : '—'; } },
        { lbl: 'Cooling zones',      fn: function(c){ return c.z || '—'; } },
        { lbl: 'Dimensions (W×H×D)', fn: function(c){ return (c.w && c.ht && c.d) ? (c.w + ' × ' + c.ht + ' × ' + c.d + ' mm') : '—'; } },
        { lbl: 'Energy use',         fn: function(c){ return c.kwh ? (c.kwh + ' kWh / yr') : '—'; } },
        { lbl: 'Noise level',        fn: function(c){ return c.db ? (c.db + ' dB') : '—'; } },
        { lbl: 'Installation',       fn: function(c){ return lcNormInst(c.inst); } },
        { lbl: 'Rating',             fn: function(c){
            if(!c.rt) return '—';
            var rt = Math.round(c.rt * 10) / 10;
            return '★ ' + rt + (c.rc ? ' (' + c.rc + ')' : '');
        } }
      ];

      var theadImg = '<tr><th></th>';
      var theadTitle = '<tr><th></th>';
      lastCmp.forEach(function(c){
        var bestCls = c._best ? ' class="best"' : '';
        theadImg += '<th'+bestCls+'>' + (c.img ? '<img src="'+lcEsc(c.img)+'" alt="">' : '') + '</th>';
        var label = (c.disp || c.n || '') + (c.sku ? ' (' + c.sku + ')' : '');
        theadTitle += '<th'+bestCls+'>' +
          (c._best ? '<span class="pdf-badge">Best match</span>' : '') +
          '<div class="cmp-h-name">' + lcEsc(label) + '</div>' +
        '</th>';
      });
      theadImg += '</tr>';
      theadTitle += '</tr>';

      var tbody = '';
      rows.forEach(function(r){
        tbody += '<tr><th>' + lcEsc(r.lbl) + '</th>';
        lastCmp.forEach(function(c){
          tbody += '<td' + (c._best ? ' class="best"' : '') + '>' + lcEsc(r.fn(c)) + '</td>';
        });
        tbody += '</tr>';
      });

      cmpHtml =
        '<section class="pdf-cmp">' +
          '<h2>Side-by-side comparison</h2>' +
          '<table class="pdf-cmp-table">' +
            '<thead>' + theadImg + theadTitle + '</thead>' +
            '<tbody>' + tbody + '</tbody>' +
          '</table>' +
        '</section>';
    }

    var today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

    // Print-optimized stylesheet — A4, generous margins, accent coral, the
    // best-match column tinted, page-break-inside avoided per section.
    var pdfCss =
      '@page { size: A4 portrait; margin: 16mm; }' +
      'html, body { background: #fff; }' +
      'body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; font-size: 11.5pt; line-height: 1.55; max-width: 900px; margin: 0 auto; padding: 20px 28px 40px; }' +
      '.pdf-toolbar { position: sticky; top: 0; z-index: 10; display: flex; gap: 10px; justify-content: center; padding: 12px; margin: -20px -28px 24px; background: #f5f0e8; border-bottom: 1px solid #d8cdb8; }' +
      '.pdf-toolbar button { padding: 10px 22px; background: #c97a7a; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: system-ui, sans-serif; }' +
      '.pdf-toolbar button.ghost { background: #fff; color: #444; border: 1px solid #d0c8b8; }' +
      '.pdf-hdr { text-align: center; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 2px solid #7c3030; }' +
      '.pdf-brand { font-family: system-ui, sans-serif; font-size: 12pt; letter-spacing: 0.3em; color: #7c3030; margin-bottom: 8px; }' +
      '.pdf-hdr h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300; font-size: 26pt; color: #1a1a1a; margin: 0; line-height: 1.1; }' +
      '.pdf-date { font-size: 10pt; color: #777; margin-top: 8px; font-family: system-ui, sans-serif; }' +
      'h2 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 400; font-size: 17pt; color: #7c3030; margin: 26px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e0d6c8; page-break-after: avoid; }' +
      'h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 400; font-size: 14pt; color: #1a1a1a; margin: 0 0 4px; }' +
      'section { page-break-inside: avoid; margin-bottom: 22px; }' +
      'dl.pdf-answers { display: grid; grid-template-columns: 200px 1fr; gap: 6px 16px; margin: 0; }' +
      'dl.pdf-answers dt { font-weight: 600; color: #555; font-family: system-ui, sans-serif; font-size: 10.5pt; }' +
      'dl.pdf-answers dd { margin: 0; font-size: 11pt; }' +
      '.match { display: grid; grid-template-columns: 110px 1fr; gap: 18px; align-items: start; padding: 14px 0; border-bottom: 1px solid #ece5d5; }' +
      '.match:last-child { border-bottom: none; }' +
      '.match.is-best { background: #fdf6f6; padding: 14px; border-radius: 6px; border: 1px solid #f0d8d8; border-bottom: 1px solid #f0d8d8; margin-bottom: 12px; }' +
      '.match-img { width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; background: #f5f0e8; border: 1px solid #e8dec8; border-radius: 4px; }' +
      '.match-img img { max-width: 96px; max-height: 96px; object-fit: contain; }' +
      '.match-body h3 { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }' +
      '.pdf-badge { display: inline-block; background: #c97a7a; color: #fff; padding: 3px 9px; font-size: 9pt; letter-spacing: 0.08em; font-family: system-ui, sans-serif; font-weight: 600; text-transform: uppercase; border-radius: 4px; vertical-align: middle; }' +
      '.match-price { font-weight: 700; color: #7c3030; font-size: 14pt; margin: 4px 0; font-family: system-ui, sans-serif; }' +
      '.match-why { margin: 6px 0; font-size: 11pt; color: #333; }' +
      '.match-miss { margin: 6px 0; font-size: 10.5pt; color: #7c3030; background: #fdf0f2; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #c97a7a; }' +
      '.match-url { font-size: 9pt; color: #888; word-break: break-all; margin: 6px 0 0; font-family: system-ui, sans-serif; }' +
      'table.pdf-cmp-table { width: 100%; border-collapse: collapse; font-size: 10pt; font-family: system-ui, sans-serif; margin-top: 6px; }' +
      'table.pdf-cmp-table th, table.pdf-cmp-table td { padding: 8px 6px; text-align: center; border: 1px solid #dcd3bf; vertical-align: middle; }' +
      'table.pdf-cmp-table thead th img { width: 84px; height: 84px; object-fit: contain; display: block; margin: 0 auto; }' +
      'table.pdf-cmp-table thead th .cmp-h-name { font-weight: 600; font-size: 10pt; padding-top: 4px; line-height: 1.25; }' +
      'table.pdf-cmp-table tbody th { text-align: left; font-weight: 600; background: #f5f0e8; color: #4a4030; width: 150px; }' +
      'table.pdf-cmp-table th.best, table.pdf-cmp-table td.best { background: #fdf6f6; }' +
      'table.pdf-cmp-table thead th.best { background: #fbe9ec; }' +
      'ul.pdf-list { margin: 0; padding-left: 22px; }' +
      'ul.pdf-list li { margin: 6px 0; }' +
      'ul.pdf-list strong { color: #1a1a1a; }' +
      'table.pdf-temps { width: 100%; border-collapse: collapse; font-size: 11pt; margin: 8px 0; }' +
      'table.pdf-temps td { padding: 6px 8px; border-bottom: 1px solid #ece5d5; vertical-align: top; }' +
      'table.pdf-temps td:first-child { width: 90px; font-weight: 700; color: #7c3030; font-family: system-ui, sans-serif; }' +
      '.pdf-footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e0d6c8; font-size: 10pt; color: #666; text-align: center; }' +
      '.pdf-footer a { color: #7c3030; }' +
      '@media print { .pdf-toolbar { display: none !important; } body { padding: 0; max-width: none; } .match.is-best { background: #fdf6f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table.pdf-cmp-table th.best, table.pdf-cmp-table td.best { background: #fdf6f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';

    var body =
      '<div class="pdf-toolbar">' +
        '<button onclick="window.print()">Print / Save as PDF</button>' +
        '<button class="ghost" onclick="window.close()">Close</button>' +
      '</div>' +
      '<header class="pdf-hdr">' +
        '<div class="pdf-brand">LECAVIST</div>' +
        '<h1>Your wine cabinet recommendations</h1>' +
        '<p class="pdf-date">Generated ' + lcEsc(today) + '</p>' +
      '</header>' +
      '<section><h2>Your answers</h2><dl class="pdf-answers">' + answersRows + '</dl></section>' +
      (cardsHtml ? '<section><h2>Your best matches</h2>' + cardsHtml + '</section>' : '') +
      cmpHtml +
      '<section><h2>Installation &amp; clearance</h2>' +
        '<ul class="pdf-list">' +
          '<li><strong>Freestanding</strong> — allow at least <strong>10 cm clearance</strong> on each side, top and back for ventilation. Without it, cooling efficiency drops and the compressor works harder.</li>' +
          '<li><strong>Built-in</strong> — only requires a <strong>3 cm clearance</strong> on all sides. Ventilation is made through the vent at the bottom, so the cabinet sits flush in cabinetry or a niche.</li>' +
        '</ul>' +
      '</section>' +
      '<section><h2>Wine temperature guide</h2>' +
        '<p style="margin:4px 0 8px">Different wines serve best at different temperatures:</p>' +
        '<table class="pdf-temps">' +
          '<tr><td>6 °C</td><td>Champagne, Bordeaux Blanc, sweet sparkling, Passito di Pantelleria</td></tr>' +
          '<tr><td>8 °C</td><td>Dry whites, Verdicchio, fruity dry whites, Passito Liqueur</td></tr>' +
          '<tr><td>10–11 °C</td><td>White Burgundy, Trentino, Franciacorta, Friulano, Loire dry whites, aromatic whites</td></tr>' +
          '<tr><td>12–13 °C</td><td>Provence rosé, New Wine, Beaujolais, Languedoc-Roussillon</td></tr>' +
          '<tr><td>14–15 °C</td><td>Loire reds, light reds with malt tannins, Rodano white</td></tr>' +
          '<tr><td>16 °C</td><td>Chianti Classico, structured reds with tannins</td></tr>' +
          '<tr><td>17–18 °C</td><td>Bordeaux Red, Amarone, Barbaresco, Barolo, Brunello, Red Burgundy</td></tr>' +
        '</table>' +
        '<p style="margin-top:14px"><strong>LeCavist cabinet temperature ranges</strong></p>' +
        '<ul class="pdf-list">' +
          '<li><strong>Single zone</strong> — constant 5–20 °C (ideal for long-term ageing)</li>' +
          '<li><strong>Dual zone</strong> — 5–12 °C chilled + 12–18 °C serving</li>' +
          '<li><strong>Triple zone</strong> — 5–12 °C / 8–12 °C / 12–18 °C</li>' +
        '</ul>' +
      '</section>' +
      '<section><h2>How we count bottles</h2>' +
        '<p>All LeCavist capacities are calculated using the international <strong>750 mL Bordeaux bottle</strong>, with shelves removed and bottles stacked end-to-end. In real-world use you\'ll typically fit <strong>around 80%</strong> of the advertised maximum, depending on:</p>' +
        '<ul class="pdf-list">' +
          '<li><strong>Bottle shape</strong> — Burgundy and Champagne bottles are wider than Bordeaux and take more space.</li>' +
          '<li><strong>How many shelves you keep in</strong> — more shelves means easier access but lower total capacity.</li>' +
        '</ul>' +
      '</section>' +
      '<footer class="pdf-footer">' +
        'Live comparison: <a href="' + lcEsc(window.location.href) + '">' + lcEsc(window.location.href) + '</a><br>' +
        'Questions? Visit <a href="https://lecavist.com">lecavist.com</a>' +
      '</footer>';

    // NOTE: we deliberately do NOT inject a script element into the generated
    // document. Building a literal script open/close tag inside this inline
    // code can prematurely terminate the parent script element in the HTML
    // parser — which is exactly what broke the quiz. Printing is driven from
    // THIS window after the child loads (same-origin, written via document.write).
    var docHtml =
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      '<title>LeCavist — Your wine cabinet recommendations</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<style>' + pdfCss + '</style>' +
      '</head><body>' + body + '</body></html>';

    var w = window.open('', '_blank');
    if(!w){
      alert('Please allow pop-ups for this site so we can open your printable summary.');
      return;
    }
    w.document.open();
    w.document.write(docHtml);
    w.document.close();

    // Wait for the child's images to finish (so the print preview isn't blank),
    // then trigger its print dialog from here. The in-document "Print / Save as
    // PDF" button is the fallback if anything blocks this.
    try {
      var imgs = w.document.images, total = imgs.length, done = 0;
      var fire = function(){ try { w.focus(); w.print(); } catch(e){} };
      if(total === 0){ setTimeout(fire, 300); }
      else {
        var tick = function(){ if(++done >= total){ setTimeout(fire, 300); } };
        for(var i = 0; i < total; i++){
          var im = imgs[i];
          if(im.complete){ tick(); }
          else { im.addEventListener('load', tick); im.addEventListener('error', tick); }
        }
      }
    } catch(e){ /* cross-origin or blocked — the in-document button still works */ }
  };

  function lcProg(n){
    ['d0','d1','d2'].forEach(function(id,i){
      const d = document.getElementById(id);
      if(!d) return;
      d.className = 'dot';
      if(i===n) d.classList.add('active');
      else if(i<n) d.classList.add('done');
    });
    var ctr = document.getElementById('ctr');
    if(ctr) ctr.textContent = n < 3 ? 'Step '+(n+1)+' of 3' : 'Your matches';
  }

  window.lcShowR = function(){
    const size=A[0], inst=A[1], zone=A[2], col=A[3];
    // The curated recommendation matrix is keyed black/steel only. "Either"
    // collapses to the black variant (which is always populated) without
    // triggering the stainless-unavailable fallback note.
    const colKey = col === 'either' ? 'black' : col;
    const key = size+'_'+inst+'_'+zone+'_'+colKey;
    let recs = P[key], fb = false;
    let triedFallback = false;
    if(!recs){ recs = P[size+'_'+inst+'_'+zone+'_black']; triedFallback = true; fb = (col==='steel'); }
    if(!recs){ recs = P[size+'_free_single_black']; triedFallback = true; }

    // ── Steel-only override ──────────────────────────────────────────────
    // When the visitor explicitly chose "Only stainless steel" we never
    // surface a black product in the best-matches block — even if it would
    // otherwise be the closest curated pick. Replace recs with the closest
    // *stainless* cabinets from the live catalogue, scored against the same
    // size/install/zone/loading answers. If there are genuinely no steel
    // matches, the empty-list message below explains why.
    if(col === 'steel' && triedFallback){
      var steelPool = (window.LCCAB || []).filter(function(c){ return /stainless/i.test(c.n); });
      if(steelPool.length){
        var bucket  = { small:[0,63], medium:[64,168], large:[169,260], xl:[261,100000] };
        var br      = bucket[size] || [0,100000];
        var baseTgt = size==='xl' ? 320 : (br[0]+br[1])/2;
        var loadMl  = { comfort:1.4, standard:1.15, max:1.0 };
        var stTgt   = baseTgt * (loadMl[A.load] || 1.15);
        var stInst  = inst==='built' ? 'built-in' : 'freestanding';
        var stZone  = zone==='single' ? 'single' : (zone==='dual' ? 'dual' : 'triple');
        steelPool.forEach(function(c){
          var capN = lcNum(c.cap) || 0, s = 0;
          if(String(c.inst||'').toLowerCase().indexOf(stInst) > -1) s += 40;
          if(String(c.z   ||'').toLowerCase().indexOf(stZone) > -1) s += 25;
          if(capN >= br[0] && capN <= br[1]) s += 20;
          s += Math.max(0, 25 - Math.abs(capN - stTgt) / 8);
          c._steelScore = s;
        });
        steelPool.sort(function(a,b){ return b._steelScore - a._steelScore; });
        recs = steelPool.slice(0, 2).map(function(c, i){
          return {
            h: c.h,
            t: [c.cap ? (c.cap + ' bottles') : '', c.z || '', lcNormInst(c.inst)].filter(Boolean),
            f: 'steel',
            w: (c.cap || '') + '-bottle ' + (c.z || '') + ' cabinet in stainless steel — closest match to your selection.',
            top: i === 0 ? 1 : 0
          };
        });
      } else {
        recs = [];   // empty-list fallback below handles UX
      }
      fb = false;    // never show the "showing black instead" footnote in steel-only mode
    }

    // ── Capacity-floor override ──────────────────────────────────────────
    // When the visitor entered an exact bottle count on the results page,
    // source the best-match cards from the same fitting pool as the comparison
    // (which already excludes cabinets below the required capacity) so the two
    // never disagree and nothing under-capacity is shown.
    if(lcManualMin && lcManualMin > 0){
      var fitPool = lcPickCabinets(size, inst, zone, col, recs);
      if(col === 'steel'){ fitPool = fitPool.filter(function(c){ return /stainless/i.test(c.n); }); }
      if(fitPool.length){
        var loadWord = { comfort:'comfort', standard:'standard', max:'max' }[A.load] || 'standard';
        recs = fitPool.slice(0, 3).map(function(c, i){
          return {
            h: c.h,
            t: [c.cap ? (c.cap + ' bottles') : '', c.z || '', lcNormInst(c.inst)].filter(Boolean),
            f: (/stainless/i.test(c.n) ? 'steel' : 'black'),
            w: 'Rated ' + (c.cap || '?') + ' bottles — fits your collection at ' + loadWord + ' loading.',
            top: i === 0 ? 1 : 0
          };
        });
      } else {
        recs = [];   // nothing big enough → empty-state below
      }
      fb = false;
    }

    const esc = function(s){
      return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    };

    const list = document.getElementById('plist');
    list.innerHTML = '';
    recs.forEach(function(r){
      // Resolve live catalog data injected by Shopify. Product entries first
      // try the curated LCPROD lookup, then fall back to the broader LCCAB
      // dataset (needed for steel-only dynamic recs whose handles may sit
      // outside the curated 11). The Signature Duo entry keys off LCDUO.
      const live = r.col ? DUO : (PROD[r.h] || lcSpecFor(r.h));
      if(!live || !live.u){ return; }   // product unpublished/removed — skip, never render a dead card

      const a = document.createElement('a');
      a.href = live.u;
      a.className = 'pc' + (r.top ? ' top' : '');
      const fc = r.f==='steel' ? 'tsteel' : 'tblack';
      const fl = r.f==='steel' ? 'Stainless steel' : 'Black';
      const nm = live.n || '';
      const priceHtml = r.col
        ? '<div class="pprice">View range</div>'
        : (live.av === false
            ? '<div class="pprice">Sold out</div>'
            : '<div class="pprice">'+esc(live.p)+'</div>');
      // Bold note that calls out any spec on this card that doesn't line up
      // with what the visitor answered (capacity range, install, zone, finish).
      var miss = lcMismatchHtml(r, size, inst, zone, col);

      a.innerHTML =
        (r.top ? '<span class="tbadge">Best match</span>' : '') +
        '<div class="pimg">' + (live.img ? '<img src="'+esc(live.img)+'" alt="'+esc(nm)+'" loading="lazy">' : '🍷') + '</div>' +
        '<div class="pinfo">' +
          '<div class="pname">'+esc(nm)+'</div>' +
          '<div class="ptags">'+r.t.map(function(x){ return '<span class="tag">'+esc(x)+'</span>'; }).join('')+'<span class="tag '+fc+'">'+fl+'</span></div>' +
          '<div class="pwhy">'+esc(r.w)+'</div>' +
          miss +
        '</div>' +
        '<div class="pright">'+priceHtml+'<div class="parrow">→</div></div>';
      list.appendChild(a);
    });

    // Resilience: if every matched product is currently unpublished/removed
    // from the catalogue (or no stainless model fits the visitor's combo when
    // they asked for steel-only), never show an empty result — explain it.
    if(!list.children.length){
      var emptyName, emptyWhy;
      if(lcManualMin && lcManualMin > 0){
        emptyName = 'No single cabinet holds that many bottles';
        emptyWhy  = 'Your target needs a cabinet rated for <strong>≈ ' + lcManualMin + ' bottles</strong> or more — beyond our largest single unit. Try <strong>Max</strong> loading or a lower count, or talk to us about a paired Signature Duo for double the capacity.';
      } else if(col === 'steel'){
        emptyName = 'No stainless steel cabinet matches this combination';
        emptyWhy  = 'Stainless steel is available on a small selection of freestanding models only. Go back and pick <strong>Either is fine</strong> on the finish step to see the closest match in black, or browse our full range.';
      } else {
        emptyName = 'Browse our wine cabinets';
        emptyWhy  = 'Our team can help you find the perfect match for your collection.';
      }
      list.innerHTML =
        '<a href="/collections/all-cabinets" class="pc top">' +
          '<div class="pimg">🍷</div>' +
          '<div class="pinfo">' +
            '<div class="pname">'+emptyName+'</div>' +
            '<div class="pwhy">'+emptyWhy+'</div>' +
          '</div>' +
          '<div class="pright"><div class="parrow">→</div></div>' +
        '</a>';
    }

    document.getElementById('fnote').classList.toggle('on', fb);

    // Build the side-by-side comparison matrix from the live cabinet feed.
    lcRenderCompare(size, inst, zone, col, recs);

    const subs = {small:"Compact cabinets — up to 63 bottles.",medium:"Mid-range cabinets — 64 to 168 bottles.",large:"Full-height cabinets — 169 to 260 bottles.",xl:"Flagship capacity — paired and professional solutions."};
    document.getElementById('rsub').textContent = subs[size] || '';

    ['s0','s1','s2'].forEach(function(id){
      var el = document.getElementById(id); if(el) el.classList.remove('on');
    });
    document.getElementById('sR').classList.add('on');
    lcProg(3);
    setStepTitle('R');
  };

  // ── Side-by-side comparison matrix ──────────────────────────────────────
  function lcEsc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function lcNum(v){ var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g,'')); return isFinite(n) ? n : null; }

  // Normalize installation_type for display: "Built-in or Freestanding" → "Built-in"
  // (per product, if a cabinet supports built-in we label it built-in).
  function lcNormInst(s){
    if(!s) return '—';
    if(/built[\s\-]?in/i.test(s)) return 'Built-in';
    if(/freestanding/i.test(s))   return 'Freestanding';
    return s;
  }

  // Resolve live specs for a handle: prefer LCCAB (full specs), fall back to LCPROD (curated subset).
  function lcSpecFor(h){
    var cab = (window.LCCAB || []).filter(function(c){ return c.h === h; })[0];
    if(cab) return cab;
    var prod = (window.LCPROD || {})[h];
    return prod ? Object.assign({h:h}, prod) : null;
  }

  // Build the "what does NOT match your answers" note for a recommendation card.
  // Returns '' when everything lines up. Returns HTML otherwise.
  function lcMismatchHtml(r, size, inst, zone, col){
    if(!r || r.col) return '';                 // skip non-product entries (Duo collection)
    var spec = lcSpecFor(r.h);
    if(!spec) return '';
    var notes = [];
    // Capacity-range mismatch is intentionally not flagged here — the cabinet
    // capacity is already on the card and in the comparison table; flagging
    // every neighbouring size as a "miss" was noisy. We only call out the
    // hard-fact mismatches (install, zones, finish) in the same short style.

    var instStr = String(spec.inst || '').toLowerCase();
    var wantInstWord = inst === 'built' ? 'built-in' : 'freestanding';
    if(instStr && instStr.indexOf(wantInstWord) === -1){
      var actual = /built[\s\-]?in/i.test(spec.inst) ? 'built-in' : 'freestanding';
      notes.push('This cabinet is <b>' + actual + ' only</b> — you asked for ' + wantInstWord);
    }

    var wantZoneWord = zone === 'single' ? 'single' : (zone === 'dual' ? 'dual' : 'triple');
    var zStr = String(spec.z || '').toLowerCase();
    if(zStr && zStr.indexOf(wantZoneWord) === -1){
      notes.push('<b>' + lcEsc(spec.z) + '</b> — not the ' + wantZoneWord + ' zone you chose');
    }

    // Finish mismatch is only relevant when the visitor explicitly chose one;
    // "either is fine" never triggers a finish note.
    var isSteelProduct = /stainless/i.test(spec.n || '');
    if(col === 'steel' && !isSteelProduct){
      notes.push('Comes in <b>black</b>, not stainless steel');
    } else if(col === 'black' && isSteelProduct){
      notes.push('<b>Stainless steel</b> finish (you chose black)');
    }

    if(!notes.length) return '';
    return '<div class="pmiss"><strong>Doesn’t match:</strong>' + notes.join(' &nbsp;·&nbsp; ') + '</div>';
  }

  // Score every live cabinet against the answers and return the closest set
  // (always >= 5 columns when the catalogue has them), best match pinned first.
  function lcPickCabinets(size, inst, zone, col, recs){
    var CAB = (window.LCCAB || []).slice();
    if(!CAB.length) return [];

    // Hard capacity floor: when the visitor entered an exact bottle count +
    // loading on the results page, never surface a cabinet that holds fewer
    // bottles than the computed minimum. Applies to both desktop and mobile.
    if(lcManualMin && lcManualMin > 0){
      CAB = CAB.filter(function(c){ return (lcNum(c.cap) || 0) >= lcManualMin; });
      if(!CAB.length) return [];   // nothing big enough → callers show an empty state
    }

    var bucket = { small:[0,63], medium:[64,168], large:[169,260], xl:[261,100000] };
    var br = bucket[size] || [0,100000];
    // Loading style biases the target capacity. Comfort = lots of headroom, so
    // we steer toward bigger cabinets; Max = packed to the advertised maximum.
    var baseTarget = size==='xl' ? 320 : (br[0]+br[1])/2;
    var loadMult = { comfort: 1.4, standard: 1.15, max: 1.0 };
    var target = baseTarget * (loadMult[A.load] || 1.15);
    // If the visitor typed an exact bottle count on the results page, use the
    // computed minimum capacity as the precise target instead of the bucket.
    if(lcManualMin && lcManualMin > 0){ target = lcManualMin; }

    var wantInst = inst==='built' ? 'built-in' : 'freestanding';
    var wantZone = zone==='single' ? 'single' : (zone==='dual' ? 'dual' : 'triple');
    var wantSteel = (col==='steel');

    CAB.forEach(function(c){
      var capN = lcNum(c.cap) || 0;
      var s = 0;
      var instStr = String(c.inst||'').toLowerCase();
      if(instStr.indexOf(wantInst) > -1) s += 40;            // freestanding / built-in
      if(String(c.z||'').toLowerCase().indexOf(wantZone) > -1) s += 25;   // zone match
      if(capN >= br[0] && capN <= br[1]) s += 20;             // inside size bracket
      s += Math.max(0, 25 - Math.abs(capN - target) / 8);     // capacity proximity
      // (Under-capacity cabinets are already filtered out above when a manual
      // minimum is set, so no extra capacity penalty is needed here.)
      // Finish preference: explicit black / steel choice nudges score; "either"
      // is neutral so we don't penalise mixed results.
      if(col === 'either'){
        /* no finish bias */
      } else if((/stainless/i.test(c.n)) === wantSteel){
        s += 8;
      }
      c._score = s;
      c._capN = capN;
    });

    // Curated best-match handles (from the recommendation cards) get pinned.
    var bestHandles = (recs || []).filter(function(r){ return r && r.h; }).map(function(r){ return r.h; });

    CAB.sort(function(a,b){ return b._score - a._score; });

    var out = [], seen = {};
    bestHandles.forEach(function(h){
      var hit = CAB.filter(function(c){ return c.h === h; })[0];
      if(hit && !seen[h]){ hit._best = true; out.push(hit); seen[h] = 1; }
    });
    CAB.forEach(function(c){
      if(out.length >= 6) return;
      if(!seen[c.h]){ seen[c.h] = 1; out.push(c); }
    });
    return out.slice(0, 6);   // 5–6 columns
  }

  // Module-level cache of the most recently rendered comparison cabs, so the
  // email handler can build a full text snapshot without re-running the picker.
  var lastCmp = null;

  // Results-page capacity calculator: when the visitor enters an exact bottle
  // count, this holds the computed minimum cabinet capacity (target override).
  var lcManualMin = null;

  window.lcRenderCompare = function(size, inst, zone, col, recs){
    var wrap = document.getElementById('cmpwrap');
    var tbl  = document.getElementById('cmptable');
    if(!wrap || !tbl) return;
    var cabs = lcPickCabinets(size, inst, zone, col, recs);
    lastCmp = cabs;   // cache for lcEmailRecs
    if(cabs.length < 2){ wrap.hidden = true; return; }   // nothing useful to compare

    // Row definitions. dir:'min' => lowest value wins ★, 'max' => highest wins.
    var rows = [
      { label:'Price',            dir:'min',
        cell:function(c){ return c.av === false ? '<span class="cmp-soldout">Sold out</span>' : '<span class="cmp-price">'+lcEsc(c.p)+'</span>'; },
        val:function(c){ return c.av === false ? null : lcNum(c.pc); } },
      { label:'Bottle capacity',  text:function(c){ return c._capN ? c._capN + ' bottles' : '—'; } },
      { label:'Cooling zones',    text:function(c){ return c.z || '—'; } },
      { label:'Dimensions (W×H×D)', text:function(c){ return (c.w && c.ht && c.d) ? (c.w+' × '+c.ht+' × '+c.d+' mm') : '—'; } },
      { label:'Energy use',       dir:'min', val:function(c){ return lcNum(c.kwh); },
        text:function(c){ return c.kwh ? (c.kwh + ' kWh/yr') : '—'; } },
      { label:'Noise level',      dir:'min', val:function(c){ return lcNum(c.db); },
        text:function(c){ return c.db ? (c.db + ' dB') : '—'; } },
      { label:'Installation',     text:function(c){ return lcNormInst(c.inst); } },
      { label:'Customer rating',  dir:'max', val:function(c){ return lcNum(c.rt); },
        text:function(c){ return c.rt ? ('★ ' + (Math.round(c.rt*10)/10) + (c.rc ? ' ('+c.rc+')' : '')) : '—'; } }
    ];

    // Header is split into two rows so the product image gets its own cell —
    // bigger picture, cleaner separation from the title/price. Row 1: images
    // only. Row 2: PDP-style title + SKU + best-match badge + price.
    var imgRow   = '<tr class="cmp-imgrow"><th scope="row" aria-hidden="true"></th>';
    var titleRow = '<tr class="cmp-titlerow"><th scope="row">Specification</th>';
    cabs.forEach(function(c){
      var label = (c.disp || c.n || '');
      if(c.sku){ label += ' (' + c.sku + ')'; }
      var bestCls = c._best ? ' is-best' : '';
      imgRow += '<th class="cmp-col cmp-imgcell'+bestCls+'">'
        + (c.img
            ? '<img class="cmp-pimg" src="'+lcEsc(c.img)+'" alt="'+lcEsc(c.n)+'" loading="lazy">'
            : '<span class="cmp-pimg-fallback">🍷</span>')
        + '</th>';
      titleRow += '<th class="cmp-col cmp-titlecell'+bestCls+'">'
        + (c._best ? '<div class="cmp-badge">Best match</div>' : '')
        + '<div class="cmp-pname">'+lcEsc(label)+'</div>'
        + (c.av === false ? '<div class="cmp-soldout">Sold out</div>' : '<div class="cmp-price">'+lcEsc(c.p)+'</div>')
        + '</th>';
    });
    var thead = '<thead>' + imgRow + '</tr>' + titleRow + '</tr></thead>';

    // Body — for win rows, find the best numeric value across shown columns.
    var tbody = '<tbody>';
    rows.forEach(function(row){
      var winIdx = -1;
      if(row.dir && row.val){
        var best = null;
        cabs.forEach(function(c,i){
          var v = row.val(c);
          if(v == null) return;
          if(best == null || (row.dir==='min' ? v < best : v > best)){ best = v; winIdx = i; }
        });
      }
      tbody += '<tr><td class="cmp-rowlabel">'+lcEsc(row.label)+'</td>';
      cabs.forEach(function(c,i){
        var content = row.cell ? row.cell(c) : lcEsc(row.text(c));
        var cls = 'cmp-col' + (c._best?' is-best':'') + (i===winIdx?' cmp-win':'');
        tbody += '<td class="'+cls+'">'+content+'</td>';
      });
      tbody += '</tr>';
    });
    // CTA row — Best Match gets the primary coral button, alternatives ghost.
    tbody += '<tr><td class="cmp-rowlabel"></td>';
    cabs.forEach(function(c){
      var ctaCls = 'cmp-cta' + (c._best ? ' cmp-cta--primary' : '');
      var label  = c._best ? 'View this cabinet →' : 'View →';
      tbody += '<td class="cmp-col'+(c._best?' is-best':'')+'">'
        + (c.u ? '<a class="'+ctaCls+'" href="'+lcEsc(c.u)+'">'+label+'</a>' : '')
        + '</td>';
    });
    tbody += '</tr></tbody>';

    tbl.innerHTML = (tbl.querySelector('caption') ? tbl.querySelector('caption').outerHTML : '') + thead + tbody;

    // ── Mobile view ──────────────────────────────────────────────────────
    // Same cabinets, restructured: hero best-match card + horizontally-snapping
    // alternative cards + a collapsed "Compare full specs" panel re-using the
    // desktop table for the engaged reader.
    var mobile = document.getElementById('cmpmobile');
    if(mobile){
      // Every cabinet (best match first) is a uniform swipeable card — no
      // separate hero, so the layout is consistent and can't collapse. The
      // best match gets an inline badge + primary CTA.
      var altsHtml = '<p class="cmp-alts-lead">Swipe to compare your closest matches →</p>';
      altsHtml += '<div class="cmp-alts">';
      cabs.forEach(function(c){
        var lbl = (c.disp || c.n || '') + (c.sku ? ' ('+c.sku+')' : '');
        var specs = [
          { lbl:'Capacity',     val: c.cap ? (c.cap + ' bottles') : '—' },
          { lbl:'Zones',        val: c.z || '—' },
          { lbl:'Dimensions',   val: (c.w && c.ht && c.d) ? (c.w+' × '+c.ht+' × '+c.d+' mm') : '—' },
          { lbl:'Energy use',   val: c.kwh ? (c.kwh + ' kWh/yr') : '—' },
          { lbl:'Noise',        val: c.db ? (c.db + ' dB') : '—' },
          { lbl:'Installation', val: lcNormInst(c.inst) }
        ];
        altsHtml +=
          '<article class="cmp-alt' + (c._best ? ' is-best' : '') + '">' +
            (c._best ? '<div class="cmp-alt-badge">Best match</div>' : '') +
            '<div class="cmp-alt-imgwrap">' + (c.img ? '<img src="'+lcEsc(c.img)+'" alt="'+lcEsc(c.n)+'" loading="lazy">' : '🍷') + '</div>' +
            '<h4 class="cmp-alt-name">'+lcEsc(lbl)+'</h4>' +
            '<div class="cmp-alt-price">' + (c.av === false ? 'Sold out' : lcEsc(c.p)) + '</div>' +
            '<ul class="cmp-alt-specs">' +
              specs.map(function(r){ return '<li><span class="lbl">'+lcEsc(r.lbl)+'</span><span class="val">'+lcEsc(r.val)+'</span></li>'; }).join('') +
            '</ul>' +
            (c.u ? '<a class="cmp-cta' + (c._best ? ' cmp-cta--primary' : '') + '" href="'+lcEsc(c.u)+'">' + (c._best ? 'View this cabinet →' : 'View →') + '</a>' : '') +
          '</article>';
      });
      altsHtml += '</div>';

      // Collapsed "Compare full specs" reuses the same table markup — clone
      // so we don't end up with two elements sharing id="cmptable".
      var tblClone = tbl.cloneNode(true);
      tblClone.removeAttribute('id');
      var fullTableHtml =
        '<details class="cmp-table-details">' +
          '<summary>Compare full specs</summary>' +
          '<div class="cmp-scroll-inner">' + tblClone.outerHTML + '</div>' +
        '</details>';

      mobile.innerHTML = altsHtml + fullTableHtml;
    }

    wrap.hidden = false;
  };

  // Close the quiz and return to where the visitor came from. Preference order:
  //  1) an explicit ?return= URL on the quiz link
  //  2) the same-origin referring page (the product they clicked from)
  //  3) browser back (covers stripped-path referrers)
  //  4) the homepage
  window.lcClose = function(){
    try {
      var rp = new URLSearchParams(window.location.search).get('return');
      if(rp){ window.location.href = rp; return; }
    } catch(e){}
    try {
      if(document.referrer){
        var ref = new URL(document.referrer);
        if(ref.origin === window.location.origin && ref.pathname !== window.location.pathname){
          window.location.href = document.referrer; return;
        }
      }
    } catch(e){}
    if(window.history.length > 1){ window.history.back(); return; }
    window.location.href = '/';
  };

  window.lcRestart = function(){
    Object.keys(A).forEach(function(k){ delete A[k]; });
    A.load = 'standard';   // re-apply the default loading assumption
    document.querySelectorAll('.lc-quiz-wrap .opt').forEach(function(o){ o.classList.remove('sel'); });
    document.querySelectorAll('.lc-quiz-wrap .copt').forEach(function(o){ o.classList.remove('sel'); });
    document.querySelectorAll('.lc-quiz-wrap .bnext').forEach(function(b){ b.disabled = true; });
    // Reset the results-page refine pills to Standard and clear the calculator.
    document.querySelectorAll('.lc-quiz-wrap .refine-pill').forEach(function(p){
      p.classList.toggle('is-active', p.dataset.load === 'standard');
    });
    lcManualMin = null;
    var capIn = document.getElementById('lc-cap-input'); if(capIn) capIn.value = '';
    var capOut = document.getElementById('lc-cap-output'); if(capOut) capOut.hidden = true;
    var cn = document.getElementById('cnote'); if(cn) cn.classList.remove('on');
    document.getElementById('sR').classList.remove('on');
    document.getElementById('s0').classList.add('on');
    lcProg(0);
    setStepTitle(0);
  };

  if(window.console) console.log('LeCavist quiz: init complete — lcPick is', typeof window.lcPick);
  } catch(__lcInitErr){
    // If anything above threw, the click delegation attached at the top still
    // works the moment the core handlers exist. Log so we can see the cause.
    if(window.console) console.error('LeCavist quiz: INIT FAILED —', __lcInitErr);
  }
})();