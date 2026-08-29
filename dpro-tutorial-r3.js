/* DPRO TUTORIAL / DISPOSAL / BATCH-09 / R3 / STANDARD V1.2 / KEYBOARD-FOCUS FIX */
(() => {
  'use strict';
  const VERSION = 'DPRO-TUTORIAL-DISPOSAL-B09-R3-V1.0-20260829';
  const STORAGE_KEY = 'dpro_tutorial_disposal_b09_v1';
  const POS_KEY = STORAGE_KEY + '_position';
  const PAGE = 'owner.html';
  const steps = Object.freeze([
    {id:'disposal-b09-ft10-01',title:'管理画面の入口',copy:'オーナー管理画面全体と現在のダッシュボード入口を確認。保存・送信は行いません。',view:'dashboard',primary:'#view-dashboard .view-head',fallback:['#view-dashboard','.topbar','#appView']},
    {id:'disposal-b09-ft10-02',title:'ダッシュボード指標',copy:'受付・見積・作業などの主要指標（KPI）の確認場所を案内します。',view:'dashboard',primary:'#view-dashboard .kpis',fallback:['#view-dashboard','.kpi']},
    {id:'disposal-b09-ft10-03',title:'優先対応と本日の予定',copy:'優先対応と本日の予定を確認する場所だけを案内します。案件更新はしません。',view:'dashboard',primary:'#view-dashboard .grid2',fallback:['#priorityList','#todayPreview','#view-dashboard .card']},
    {id:'disposal-b09-ft10-04',title:'案件一覧の入口',copy:'管理メニューの「案件一覧」の位置を確認します。クリックはローカル画面切替のみです。',view:'dashboard',primary:'#nav button[data-view="cases"]',fallback:['#nav','.sidebar']},
    {id:'disposal-b09-ft10-05',title:'案件検索・絞り込み',copy:'受付番号・氏名・電話番号・相談内容と状態で探す検索欄の場所を確認します。実データは入力しません。',view:'cases',primary:'#view-cases .filters',fallback:['#caseSearch','#caseStatusFilter','#view-cases .card']},
    {id:'disposal-b09-ft10-06',title:'顧客検索の入口',copy:'管理メニューの「顧客検索」の位置を確認します。業務データは変更しません。',view:'cases',primary:'#nav button[data-view="customers"]',fallback:['#nav','.sidebar']},
    {id:'disposal-b09-ft10-07',title:'顧客検索画面',copy:'氏名・電話番号・顧客番号の検索画面を確認します。実在個人情報は入力しません。',view:'customers',primary:'#customerSearch',fallback:['#view-customers .filters','#view-customers .card']},
    {id:'disposal-b09-ft10-08',title:'電話・店頭受付の入口',copy:'「電話・店頭受付」タブの位置を確認します。新規受付登録は行いません。',view:'customers',primary:'#nav button[data-view="intake"]',fallback:['#nav','.sidebar']},
    {id:'disposal-b09-ft10-09',title:'受付フォーム',copy:'既存顧客検索と受付内容フォームの配置を確認します。入力・登録・送信は行いません。',view:'intake',primary:'#intakeForm',fallback:['#view-intake .card','#view-intake']},
    {id:'disposal-b09-ft10-10',title:'訪問・作業予定',copy:'訪問・作業予定の日別確認画面を案内してFirst10完了。予定の登録・変更は行いません。',view:'schedule',primary:'#view-schedule .view-head',fallback:['#scheduleDate','#scheduleList','#view-schedule']}
  ]);

  if (!/owner\.html$/i.test((location.pathname.split('/').pop() || PAGE))) return;

  const style = document.createElement('style');
  style.id = 'dproTutorialR3Style';
  style.textContent = `
    #dproTutLauncher{position:fixed;right:14px;bottom:14px;z-index:2147483000;border:0;border-radius:999px;padding:11px 16px;min-height:44px;background:#123f3b;color:#fff;font:900 14px/1.2 system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif;box-shadow:0 10px 28px rgba(18,63,59,.28);cursor:pointer}
    #dproTutLauncher:focus-visible,#dproTutCard button:focus-visible,#dproTutHandle:focus-visible{outline:3px solid #ffbf47;outline-offset:3px}
    #dproTutHighlight{position:fixed;z-index:2147482997;pointer-events:none;border:3px solid #1a806f;border-radius:12px;box-shadow:0 0 0 9999px rgba(8,35,32,.18),0 0 0 5px rgba(56,181,155,.18);transition:left .15s,top .15s,width .15s,height .15s;display:none}
    #dproTutCard{position:fixed;z-index:2147482999;width:min(390px,calc(100vw - 16px));max-height:min(560px,calc(100vh - 16px));overflow:auto;background:#fff;color:#172d2a;border:1px solid #cdded9;border-radius:18px;box-shadow:0 22px 70px rgba(8,35,32,.30);font-family:system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif;display:none;overscroll-behavior:contain}
    #dproTutHandle{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:0;border-bottom:1px solid #d8e4e1;border-radius:18px 18px 0 0;background:linear-gradient(135deg,#123f3b,#286d65);color:#fff;padding:11px 14px;cursor:grab;touch-action:none;user-select:none;text-align:left}
    #dproTutHandle:active{cursor:grabbing}.dproTutHandleLabel{font-weight:900;font-size:13px}.dproTutGrip{font-size:18px;letter-spacing:2px;opacity:.9}
    .dproTutBody{padding:16px}.dproTutMeta{display:flex;justify-content:space-between;gap:8px;align-items:center;color:#5d716e;font-size:12px;font-weight:900}.dproTutStepId{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:230px}.dproTutBody h2{font-size:22px;line-height:1.4;margin:8px 0 7px}.dproTutBody p{margin:0;color:#405652;font-size:14px;line-height:1.7}.dproTutSafety{margin-top:12px;padding:9px 10px;border-radius:11px;background:#f1f8f6;color:#31544d;font-size:12px;font-weight:750}.dproTutTargetNote{margin-top:8px;color:#6b7c79;font-size:11px}
    .dproTutActions{display:grid;grid-template-columns:auto 1fr 1fr;gap:7px;margin-top:15px}.dproTutActions button,.dproTutClose{min-height:42px;border-radius:11px;border:1px solid #d3e0dd;background:#fff;color:#173b36;font-weight:900;padding:8px 11px;cursor:pointer}.dproTutActions .primary{background:#123f3b;color:#fff;border-color:#123f3b}.dproTutActions .skip{grid-column:1/-1;background:#f8faf9;color:#667673}.dproTutClose{min-width:42px;padding:6px 10px;background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.35);color:#fff}
    .dproTutComplete{text-align:center;padding:10px 0 2px}.dproTutComplete strong{display:block;font-size:21px}.dproTutComplete p{margin-top:7px}.dproTutComplete .replay{width:100%;margin-top:14px;min-height:44px;border:0;border-radius:11px;background:#123f3b;color:#fff;font-weight:900;cursor:pointer}
    @media(max-width:640px){#dproTutLauncher{right:8px;bottom:8px}#dproTutCard{width:calc(100vw - 16px)}.dproTutBody{padding:14px}.dproTutBody h2{font-size:20px}.dproTutActions{grid-template-columns:1fr 1fr}.dproTutActions .back{grid-column:1}.dproTutActions .primary{grid-column:2}.dproTutActions .skip{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  const highlight = document.createElement('div');
  highlight.id = 'dproTutHighlight';
  highlight.setAttribute('aria-hidden','true');

  const launcher = document.createElement('button');
  launcher.id = 'dproTutLauncher';
  launcher.type = 'button';
  launcher.textContent = '操作ガイド';
  launcher.setAttribute('aria-haspopup','dialog');

  const card = document.createElement('section');
  card.id = 'dproTutCard';
  card.setAttribute('role','dialog');
  card.setAttribute('aria-modal','false');
  card.setAttribute('aria-label','DPRO 操作ガイド First10');
  card.innerHTML = `<button id="dproTutHandle" type="button" aria-label="操作ガイドを移動"><span class="dproTutHandleLabel">DPRO 操作ガイド</span><span class="dproTutGrip" aria-hidden="true">⠿</span></button><div class="dproTutBody" id="dproTutBody"></div>`;
  document.body.append(highlight, card, launcher);

  const body = card.querySelector('#dproTutBody');
  const handle = card.querySelector('#dproTutHandle');
  let currentTarget = null;
  let lastFocus = null;
  let drag = null;

  const safeParse = (raw, fallback) => { try { return JSON.parse(raw) ?? fallback; } catch (_) { return fallback; } };
  const readState = () => {
    const v = safeParse(localStorage.getItem(STORAGE_KEY), null);
    if (!v || !Number.isInteger(v.step) || v.step < 0 || v.step >= steps.length) return {step:0,status:'new',page:PAGE};
    return v;
  };
  const writeState = (patch) => {
    const next = Object.assign({}, readState(), patch, {page:PAGE,version:VERSION,updatedAt:new Date().toISOString()});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    syncLauncher();
    return next;
  };
  const syncLauncher = () => {
    const s = readState();
    launcher.textContent = s.status === 'in_progress' ? `操作ガイドを再開 (${s.step + 1}/10)` : (s.status === 'completed' || s.status === 'skipped' ? '操作ガイドをもう一度' : '操作ガイド');
  };
  const isVisible = (el) => {
    if (!el || !el.isConnected) return false;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const setView = (view) => {
    const active = document.querySelector(`#view-${CSS.escape(view)}.active`);
    if (active) return;
    const nav = document.querySelector(`#nav button[data-view="${CSS.escape(view)}"]`);
    if (nav) nav.click();
  };
  const findTarget = (step) => {
    setView(step.view);
    const candidates = [step.primary, ...step.fallback];
    for (const selector of candidates) {
      const el = document.querySelector(selector);
      if (isVisible(el)) return {el, selector, fallback: selector !== step.primary};
    }
    return {el: document.querySelector('#appView') || document.body, selector:'#appView', fallback:true};
  };
  const clampCard = (left, top) => {
    const gap = 8, w = card.offsetWidth || Math.min(390, innerWidth - 16), h = card.offsetHeight || 360;
    return {left:Math.max(gap,Math.min(left,innerWidth-w-gap)),top:Math.max(gap,Math.min(top,innerHeight-h-gap))};
  };
  const applyCardPosition = (left, top, save=true) => {
    const p = clampCard(left, top);
    card.style.left = `${p.left}px`; card.style.top = `${p.top}px`; card.style.right = 'auto'; card.style.bottom = 'auto';
    if (save) localStorage.setItem(POS_KEY, JSON.stringify(p));
    return p;
  };
  const restorePosition = () => {
    const p = safeParse(localStorage.getItem(POS_KEY), null);
    if (p && Number.isFinite(p.left) && Number.isFinite(p.top)) return applyCardPosition(p.left,p.top,false);
    card.style.left = 'auto'; card.style.top = '90px'; card.style.right = '14px'; card.style.bottom = 'auto';
    requestAnimationFrame(() => {
      const r=card.getBoundingClientRect(); applyCardPosition(r.left,r.top,false);
    });
  };
  const updateHighlight = () => {
    if (!currentTarget || !isVisible(currentTarget)) { highlight.style.display='none'; return; }
    const r = currentTarget.getBoundingClientRect(), pad=5;
    const left=Math.max(3,r.left-pad), top=Math.max(3,r.top-pad), right=Math.min(innerWidth-3,r.right+pad), bottom=Math.min(innerHeight-3,r.bottom+pad);
    highlight.style.left=`${left}px`;highlight.style.top=`${top}px`;highlight.style.width=`${Math.max(0,right-left)}px`;highlight.style.height=`${Math.max(0,bottom-top)}px`;highlight.style.display='block';
  };
  const placeTarget = (found) => {
    currentTarget = found.el;
    try { found.el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}); } catch (_) { found.el.scrollIntoView({block:'center',inline:'center'}); }
    requestAnimationFrame(updateHighlight);
    return found;
  };
  const renderStep = (index, focus=true) => {
    index = Math.max(0,Math.min(index,steps.length-1));
    const s = steps[index];
    writeState({step:index,status:'in_progress'});
    const found = placeTarget(findTarget(s));
    body.innerHTML = `<div class="dproTutMeta"><span>STEP ${index+1} / ${steps.length}</span><span class="dproTutStepId">${s.id}</span></div><h2>${s.title}</h2><p>${s.copy}</p><div class="dproTutSafety">見るだけのガイドです。保存・送信・登録・削除などの業務操作は実行しません。</div><div class="dproTutTargetNote">${found.fallback?'安全な代替位置を表示中':'対象位置を表示中'}</div><div class="dproTutActions"><button type="button" class="back" ${index===0?'disabled':''}>戻る</button><button type="button" class="primary">${index===steps.length-1?'完了':'次へ'}</button><button type="button" class="skip">今回はスキップ</button></div>`;
    body.querySelector('.back').onclick = () => renderStep(index-1);
    body.querySelector('.primary').onclick = () => index === steps.length-1 ? complete(false) : renderStep(index+1);
    body.querySelector('.skip').onclick = () => complete(true);
    card.style.display='block'; highlight.style.display='block'; launcher.style.display='none'; restorePosition();
    if (focus) body.querySelector('.primary')?.focus({preventScroll:true});
  };
  const renderComplete = (skipped=false, focus=true) => {
    currentTarget=null;highlight.style.display='none';
    body.innerHTML=`<div class="dproTutComplete"><strong>${skipped?'ガイドをスキップしました':'First10 完了'}</strong><p>いつでも最初から再生できます。</p><button class="replay" type="button">最初からもう一度見る</button></div>`;
    body.querySelector('.replay').onclick=()=>replay();card.style.display='block';launcher.style.display='none';restorePosition();if(focus)body.querySelector('.replay')?.focus({preventScroll:true});
  };
  const open = () => {
    lastFocus = document.activeElement;
    const s=readState();
    if (s.status==='completed'||s.status==='skipped') renderComplete(s.status==='skipped'); else renderStep(s.status==='in_progress'?s.step:0);
  };
  const close = () => {
    card.style.display='none';highlight.style.display='none';currentTarget=null;launcher.style.display='block';syncLauncher();launcher.focus({preventScroll:true});
  };
  const complete = (skipped) => { writeState({status:skipped?'skipped':'completed',step:steps.length-1}); renderComplete(skipped); };
  const replay = () => { writeState({status:'in_progress',step:0}); renderStep(0); };
  const start = () => { lastFocus=document.activeElement; writeState({status:'in_progress',step:0}); renderStep(0); };
  const resume = () => { lastFocus=document.activeElement; const s=readState(); renderStep(s.status==='in_progress'?s.step:0); };

  launcher.addEventListener('click',()=>{const s=readState(); if(s.status==='completed'||s.status==='skipped') replay(); else if(s.status==='in_progress') resume(); else start();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&card.style.display==='block'){e.preventDefault();close();}});
  addEventListener('scroll',()=>requestAnimationFrame(updateHighlight),true);
  addEventListener('resize',()=>{requestAnimationFrame(()=>{const r=card.getBoundingClientRect();if(card.style.display==='block')applyCardPosition(r.left,r.top,false);updateHighlight();});});

  handle.addEventListener('pointerdown',e=>{
    if (e.button !== undefined && e.button !== 0) return;
    const r=card.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    try{handle.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault();
  });
  handle.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;applyCardPosition(e.clientX-drag.dx,e.clientY-drag.dy,true);e.preventDefault();});
  const endDrag=e=>{if(!drag||e.pointerId!==drag.id)return;try{handle.releasePointerCapture(e.pointerId);}catch(_){}drag=null;};
  handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);

  window.DPRO_DISPOSAL_TUTORIAL_R3 = Object.freeze({VERSION,STORAGE_KEY,steps,start,resume,replay,open,close,goTo:(n)=>renderStep(Math.max(0,Math.min(steps.length-1,Number(n)||0))),getState:readState});
  document.documentElement.dataset.dproTutorialR3=VERSION;
  syncLauncher();
})();
