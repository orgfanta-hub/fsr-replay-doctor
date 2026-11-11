// rep.js — .rep 파싱/파일명 계획 (rep.rs의 JS 포팅, 브라우저·node 양용)
"use strict";
const REP = (() => {
  const MAGIC_OFF = 0x0c, TIME_OFF = 0x6c, BASE = 0xb0, STRIDE = 0xd40;
  const T_OFF = 0x22, S_OFF = 0x1a, LVL_OFF = 0x2a, F_OFF = 0x2e, MAX_REC = 12;
  let dec = null;
  for (const label of ["cp949", "euc-kr"]) { // WHATWG EUC-KR 디코더 = cp949 확장 포함
    try { dec = new TextDecoder(label); break; } catch (e) {}
  }
  let EUCKR = null; // Uint16Array(932*200*2/2) — setEuckr로 주입(node 폴백용)
  function setEuckr(buf) { EUCKR = new Uint16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2); }

  function u16(d, o) { return d[o] | (d[o + 1] << 8); }
  function u32(d, o) { return (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0; }

  // NUL 종료 닉필드 cp949 디코드 (제어문자 제거, Rust nick_decode와 동일 semantics)
  function nickDecode(bytes) {
    let end = bytes.indexOf(0); if (end < 0) end = bytes.length;
    const clean = bytes.subarray(0, end).filter(b => b >= 0x20 || b >= 0x80);
    if (!clean.length) return "";
    if (dec) return dec.decode(clean).replace(/\uFFFD/g, "").trim();
    return decodeEuckr(clean).trim(); // node 폴백: euckr.bin 표 경로(Rust와 동일)
  }

  // EUC-KR 2바이트 → codepoint(표) / 1바이트 ASCII. 미정의 페어는 선행바이트만 폐기(Rust와 동일)
  function decodeEuckr(b) {
    let out = "";
    for (let i = 0; i < b.length;) {
      const c = b[i];
      if (c < 0x80) { out += String.fromCharCode(c); i++; continue; }
      if (i + 1 >= b.length) break;
      const hi = b[i], lo = b[i + 1];
      let col;
      if (lo >= 0x30 && lo <= 0x39) col = lo - 0x30;
      else if (lo >= 0x41 && lo <= 0xfe) col = lo - 0x41 + 10;
      else { i++; continue; }
      if (hi >= 0x81 && hi <= 0xfe && EUCKR) {
        const cp = EUCKR[(hi - 0x81) * 200 + col];
        if (cp) { out += String.fromCharCode(cp); i += 2; continue; }
        i++; // 미정의: 선행바이트만 폐기
      } else i += 2;
    }
    return out;
  }

  function sanitize(s) { return s.replace(/[\\/:*?"<>|]/g, "").trim(); }

  // -> {y,mo,dd,h,mi,teams:[[names]]} | {err}
  function parse(d, map) {
    if (d.length < TIME_OFF + 14) return { err: "no magic" };
    const magic = String.fromCharCode(d[MAGIC_OFF], d[MAGIC_OFF + 1], d[MAGIC_OFF + 2],
      d[MAGIC_OFF + 3], d[MAGIC_OFF + 4], d[MAGIC_OFF + 5]);
    if (magic !== "Replay") return { err: "no magic" };
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    const y = dv.getUint16(TIME_OFF, true), mo = dv.getUint16(TIME_OFF + 2, true);
    const dd = dv.getUint16(TIME_OFF + 6, true), h = dv.getUint16(TIME_OFF + 8, true);
    const mi = dv.getUint16(TIME_OFF + 10, true);
    if (y < 2020 || y > 2099 || mo < 1 || mo > 12 || dd < 1 || dd > 31 || h > 23 || mi > 59)
      return { err: `bad time ${y}-${mo}-${dd} ${h}:${mi}` };
    const teams = new Map();
    for (let i = 0; i < MAX_REC; i++) {
      const b = BASE + i * STRIDE;
      if (b + F_OFF + 4 > d.length) break;
      const face = u32(d, b + F_OFF), side = d[b + S_OFF], slot = d[b + T_OFF];
      const lvl = u32(d, b + LVL_OFF);
      if (d[b + T_OFF + 1] !== 0 || d[b + T_OFF + 2] !== 0 || side > 1 || slot > 2 || lvl < 1 || lvl > 60) break;
      const ko = map.get(face);
      if (ko === undefined) break;
      const nick = nickDecode(d.subarray(b + 8, b + S_OFF));
      const name = nick === "" ? ko : nick;
      if (!teams.has(side)) teams.set(side, []);
      const v = teams.get(side);
      if (!v.some(e => e[0] === slot && e[1] === name)) v.push([slot, name]);
    }
    if (!teams.size) return { err: "no valid records" };
    const list = [...teams.keys()].sort((a, b) => a - b)
      .map(k => teams.get(k).sort((a, b) => a[0] - b[0]).map(e => e[1]));
    return { y, mo, dd, h, mi, teams: list };
  }

  function planName(old, d, map, used) {
    const p = parse(d, map);
    if (p.err) return { status: 2, note: p.err, new: "" };
    const base = p.teams.map(t => t.join(",")).join("_VS_");
    const pad = (n, w) => String(n).padStart(w, "0");
    let nn = `${sanitize(base)}_${pad(p.y % 100, 2)}${pad(p.mo, 2)}${pad(p.dd, 2)}_${pad(p.h, 2)}${pad(p.mi, 2)}.rep`;
    if (used.has(nn)) nn = nn.replace(".rep", "_2.rep");
    used.add(nn);
    return { status: old === nn ? 1 : 0, new: nn, note: "" };
  }

  // undo.json: Rust writer는 trailing comma를 내므로 파서는 관용 파싱, 쓰기는 정통 JSON
  function parseUndo(txt) {
    try { return Object.entries(JSON.parse(txt)); } catch (e) { /* legacy fallthrough */ }
    const pairs = []; const re = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let m; while ((m = re.exec(txt))) pairs.push([m[1].replace(/\\(.)/g, "$1"), m[2].replace(/\\(.)/g, "$1")]);
    return pairs;
  }
  function dumpUndo(pairs) {
    const o = {}; for (const [k, v] of pairs) o[k] = v;
    return JSON.stringify(o, null, 2) + "\n";
  }

  return { parse, planName, nickDecode, sanitize, parseUndo, dumpUndo, setEuckr,
           hasDecoder: () => !!dec || !!EUCKR, decOK: () => !!dec };
})();
if (typeof module !== "undefined") module.exports = REP;
