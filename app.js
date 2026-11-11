// app.js — 게이트웨이 로직: 폴더 권한 → 파싱(클라이언트) →改名(move/copy) → undo.json
"use strict";
(() => {
  const $ = s => document.querySelector(s);
  const els = {
    pick: $("#pick"), demo: $("#demo"), refresh: $("#refresh"), path: $("#path"),
    rows: $("#rows"), all: $("#all"), prog: $("#prog"), banner: $("#banner"),
    cTotal: $("#cTotal"), cNeed: $("#cNeed"), cDone: $("#cDone"), cSkip: $("#cSkip"),
  };
  let dirHandle = null, items = [], faceMap = new Map(), demoMode = false;
  let connector = null; // 로컬 커넥터(fsrep-rename --serve) 감지 결과

  const CONN = "http://127.0.0.1:46123";
  async function probeConnector() {
    try {
      const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 700);
      const r = await fetch(CONN + "/ping", { signal: ac.signal }); clearTimeout(t);
      const j = await r.json();
      connector = j && j.app === "fsrep-doctor-connector" ? j : null;
    } catch (e) { connector = null; }
    return connector;
  }

  (async () => {
    const j = await (await fetch("face_ko.json")).json();
    faceMap = new Map(Object.entries(j).map(([k, v]) => [Number(k), String(v)]));
    if (!REP.decOK()) { // cp949/euc-kr 라벨 없는 브라우저: euckr.bin 표 폴백(스캔 전 필수)
      try { REP.setEuckr(new Uint8Array(await (await fetch("euckr.bin")).arrayBuffer())); } catch (e) {}
    }
    if (location.search.includes("real=")) realScan(+location.search.split("real=")[1] || 1103);
    else if (location.search.includes("demo=1")) setTimeout(() => els.demo.click(), 400);
  })();

  // dev 전용: ?real=N — 서버 마운트된 실제 .rep N개 대상 파싱(스냅샷/검수용, rename 없음)
  async function realScan(N) {
    els.path.textContent = "C:\\Program Files\\JOYCITY\\FreeStyleReboot\\replay (실데이터 · 읽기 전용 미리보기)";
    const names = await (await fetch("/replay/_list.json")).json();
    items = []; const used = new Set();
    for (const name of names.slice(0, N)) {
      let rec;
      try {
        const r = await fetch("/replay/" + encodeURIComponent(name), { headers: { Range: "bytes=0-65535" } });
        rec = REP.planName(name, new Uint8Array(await r.arrayBuffer()), faceMap, used);
      } catch (e) { rec = { status: 2, new: "", note: "fetch fail" }; }
      items.push({ old: name, new: rec.new, status: rec.status, note: rec.note, checked: rec.status === 0 });
    }
    render();
  }

  // ---- IndexedDB: 폴더 핸들 영속화(세션 재개) ----
  function idb() {
    return new Promise(res => {
      const rq = indexedDB.open("fsr-doctor", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
      rq.onsuccess = () => res(rq.result);
    });
  }
  async function idbSet(k, v) {
    const db = await idb();
    return new Promise(r => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = r; });
  }
  async function idbGet(k) {
    const db = await idb();
    return new Promise(r => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => r(q.result); });
  }

  const canFS = "showDirectoryPicker" in window;
  let bannerKey = null;
  if (!canFS) showBanner(T.t("noFS"), "noFS");

  function showBanner(html, key) { els.banner.innerHTML = html; els.banner.classList.add("on"); bannerKey = key || null; }
  function hideBanner() { els.banner.classList.remove("on"); bannerKey = null; }

  els.pick.onclick = async () => {
    if (!canFS) return;
    try {
      dirHandle = await showDirectoryPicker({ id: "fsr-replay", mode: "readwrite" });
      await idbSet("dir", dirHandle);
      hideBanner();
      await scan();
    } catch (e) { if (e.name !== "AbortError") alert(T.t("pickFail") + e.message); }
  };

  els.demo.onclick = async () => {
    demoMode = true; dirHandle = null;
    els.path.textContent = T.t("pathDemo");
    items = DEMO.map(([old, st, note]) => ({ old, new: st === 0 ? synthNew(old) : (st === 1 ? old : ""), status: st, note: note || "", checked: st === 0 }));
    render();
  };
  function synthNew(old) {
    const m = old.match(/_VS_([^_]+)_20(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})/);
    return m ? old.replace(/^.*?_VS_/, "팀A,팀B_VS_" + m[1] + "_").replace(/_20\d{6}_\d{4}/, `_261111_0000`) : old;
  }
  const DEMO = [
    ["3점은운빨_XORA_한가인_VS_ZerOs_Tangerine_261101_2216.rep", 1],
    ["Abka_HeeKong_쿠쿠루삥뽕_VS_만다린_칼립C_EdiYa_261004_0151.rep", 1],
    ["replay_20261110_231405.rep", 0], ["replay_20261110_235011.rep", 0],
    ["replay_20261111_003127.rep", 0], ["FsbReplay_2026_08_24_22_17_0928.rep", 2, "no valid records"],
    ["replay_20261111_011902.rep", 0], ["AEBR_따뭇_산소_VS_줄린_개포드_Tangerine_261027_0130.rep", 1],
  ];

  // ---- 스캔: 각 .rep 앞 64KB만 읽어 파싱(전체 읽기 불필요) ----
  async function scan() {
    if (!dirHandle) return;
    const p = await dirHandle.queryPermission({ mode: "readwrite" });
    if (p !== "granted") {
      const q = await dirHandle.requestPermission({ mode: "readwrite" });
      if (q !== "granted") { showBanner(T.t("denied"), "denied"); return; }
    }
    els.path.textContent = T.t("pathLocal", { name: dirHandle.name });
    els.refresh.disabled = false;
    const names = [];
    for await (const [name, h] of dirHandle.entries()) if (h.kind === "file" && /\.rep$/i.test(name)) names.push(name);
    names.sort();
    items = []; const used = new Set();
    for (const name of names) {
      let rec;
      try {
        const fh = await dirHandle.getFileHandle(name);
        const file = await fh.getFile();
        const buf = await file.slice(0, 65536).arrayBuffer();
        rec = REP.planName(name, new Uint8Array(buf), faceMap, used);
      } catch (e) { rec = { status: 2, new: "", note: T.t("readFail") }; }
      items.push({ old: name, new: rec.new, status: rec.status, note: rec.note, checked: rec.status === 0 });
    }
    await writabilityCheck();
    render();
  }

  // 쓰기 가능 여부: .fsr_wtest 생성 시도 (Rust writable() 동일)
  async function writableNow() {
    try {
      const fh = await dirHandle.getFileHandle(".fsr_wtest", { create: true });
      const w = await fh.createWritable(); await w.close();
      await dirHandle.removeEntry(".fsr_wtest");
      return true;
    } catch (e) { return false; }
  }
  async function writabilityCheck() {
    if (await writableNow()) { hideBanner(); return true; }
    if (await probeConnector()) {
      showBanner(T.t("connOk"), "connOk");
    } else {
      showBanner(T.t("connHint"), "connHint");
    }
    return false;
  }

  // ---- 렌더 ----
  function render() {
    const n = items.length, need = items.filter(i => i.status === 0).length;
    const done = items.filter(i => i.status === 1).length, skip = items.filter(i => i.status === 2).length;
    countUp(els.cTotal, n); countUp(els.cNeed, need); countUp(els.cDone, done); countUp(els.cSkip, skip);
    els.rows.innerHTML = "";
    const frag = document.createDocumentFragment();
    items.forEach((it, i) => {
      const tr = document.createElement("tr");
      const pill = it.status === 0 ? `<span class="pill p">${T.t("pillP")}</span>`
        : it.status === 1 ? `<span class="pill ok">${T.t("pillOk")}</span>`
        : `<span class="pill sk">${T.t("pillSk")}</span>`;
      const note = it.status === 2 && it.note ? ` <span style="color:var(--skip);font-size:11px">${esc(it.note)}</span>` : "";
      tr.innerHTML = `<td><input type="checkbox" data-i="${i}" ${it.checked ? "checked" : ""} ${it.status !== 0 ? "disabled" : ""}></td>` +
        `<td class="old">${esc(it.old)}</td><td class="arrow">→</td>` +
        `<td class="new">${it.new ? esc(it.new) : "—"}</td><td>${pill}${note}</td>`;
      frag.appendChild(tr);
      requestAnimationFrame(() => setTimeout(() => tr.classList.add("in"), Math.min(i, 40) * 18));
    });
    els.rows.appendChild(frag);
    els.rows.querySelectorAll("input[type=checkbox][data-i]").forEach(cb =>
      cb.onchange = () => items[+cb.dataset.i].checked = cb.checked);
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function countUp(el, to) {
    const t0 = performance.now(), from = +el.textContent || 0;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // ---- 변환 ----
  async function convert(which) {
    if (demoMode) { alert(T.t("aDemo")); return; }
    if (!dirHandle) { alert(T.t("aPick")); return; }
    const todo = items.filter(i => i.status === 0 && which !== "all" ? i.checked : i.status === 0);
    if (!todo.length) { alert(T.t("aNone")); return; }
    // 커넥터 경로: 브라우저 직접 쓰기가 막힌 폴더(Program Files 등)
    if (!(await writableNow()) && await probeConnector()) {
      let done = 0, coll = 0;
      for (let k = 0; k < todo.length; k += 200) {
        const batch = todo.slice(k, k + 200).map(i => [i.old, i.new]);
        try {
          const r = await fetch(CONN + "/rename", { method: "POST",
            headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pairs: batch }) });
          const j = await r.json(); done += j.done || 0; coll += j.skipped || 0;
        } catch (e) { coll += batch.length; }
        els.prog.style.width = Math.min(100, (k + 200) / todo.length * 100) + "%";
      }
      await scan();
      setTimeout(() => els.prog.style.width = "0", 600);
      alert(T.t("aDone", { n: done }) + (coll ? T.t("coll", { c: coll }) : "") + T.t("aConn"));
      return;
    }
    let done = 0, coll = 0;
    const undo = await loadUndo();
    for (let k = 0; k < todo.length; k++) {
      const it = todo[k];
      try {
        const fh = await dirHandle.getFileHandle(it.old);
        if (typeof fh.move === "function") { fh.move(it.new); }
        else { // 폴백: 복사+삭제
          let exists = false;
          try { await dirHandle.getFileHandle(it.new); exists = true; } catch (e) {}
          if (exists) { coll++; continue; }
          const file = await fh.getFile();
          const nh = await dirHandle.getFileHandle(it.new, { create: true });
          const w = await nh.createWritable(); await w.write(file); await w.close();
          await dirHandle.removeEntry(it.old);
        }
        undo[it.new] = undo[it.old] || it.old; delete undo[it.old];
        done++;
      } catch (e) { if (e.name === "NoModificationAllowedError" || e.name === "NotAllowedError") { coll++; } }
      els.prog.style.width = ((k + 1) / todo.length * 100) + "%";
      await new Promise(r => setTimeout(r));
    }
    await saveUndo(undo);
    await scan();
    setTimeout(() => els.prog.style.width = "0", 600);
    alert(T.t("aDone", { n: done }) + (coll ? T.t("coll", { c: coll }) : ""));
  }

  async function loadUndo() {
    try {
      const fh = await dirHandle.getFileHandle("undo.json");
      return Object.fromEntries(REP.parseUndo(await (await fh.getFile()).text()));
    } catch (e) { return {}; }
  }
  async function saveUndo(map) {
    const fh = await dirHandle.getFileHandle("undo.json", { create: true });
    const w = await fh.createWritable(); await w.write(REP.dumpUndo(Object.entries(map))); await w.close();
  }

  $("#undo").onclick = async () => {
    if (demoMode || !dirHandle) { alert(T.t("aPick")); return; }
    if (!confirm(T.t("cUndo"))) return;
    if (!(await writableNow()) && await probeConnector()) {
      try {
        const r = await fetch(CONN + "/undo", { method: "POST", body: "{}" });
        const j = await r.json();
        await scan(); alert(T.t("aUndoVia", { n: j.undone || 0 }));
      } catch (e) { alert(T.t("aUndoFail") + e.message); }
      return;
    }
    const undo = await loadUndo(); let n = 0;
    for (const [now, orig] of Object.entries(undo)) {
      try {
        const fh = await dirHandle.getFileHandle(now);
        if (typeof fh.move === "function") fh.move(orig); else {
          const file = await fh.getFile();
          const nh = await dirHandle.getFileHandle(orig, { create: true });
          const w = await nh.createWritable(); await w.write(file); await w.close();
          await dirHandle.removeEntry(now);
        }
        delete undo[now]; n++;
      } catch (e) {}
    }
    await saveUndo(undo); await scan();
    alert(T.t("aUndo", { n }));
  };

  els.refresh.onclick = () => !demoMode && scan();
  $("#selAll").onclick = () => { items.forEach(i => i.checked = i.status === 0); render(); };
  $("#selNone").onclick = () => { items.forEach(i => i.checked = false); render(); };
  $("#convSel").onclick = () => convert("sel");
  $("#convAll").onclick = () => convert("all");
  els.all.onchange = () => { items.forEach(i => i.checked = i.status === 0 && els.all.checked); render(); };

  // ---- 언어 전환 ----
  document.getElementById("lang").onchange = e => T.set(e.target.value);
  document.addEventListener("langchange", () => {
    if (bannerKey) showBanner(T.t(bannerKey), bannerKey);
    if (dirHandle) els.path.textContent = T.t("pathLocal", { name: dirHandle.name });
    else if (demoMode) els.path.textContent = T.t("pathDemo");
    if (items.length) render();
  });
  T.apply();

  // 세션 재개: 이전 폴더 핸들 자동 연결
  (async () => {
    if (!canFS) return;
    const h = await idbGet("dir");
    if (!h) return;
    const p = await h.queryPermission({ mode: "readwrite" });
    if (p === "granted") { dirHandle = h; await scan(); }
  })();
})();
