// i18n.js — ko/en/ja/zh. 우선순위: ?lang= > localStorage > 브라우저 언어 > ko
"use strict";
window.I18N = {
  ko: {
    title: "FSR Replay Doctor — 온라인 변환기",
    sub: "리플레이 닉네임 변환기 · 브라우저에서 안전하게, 파일은 PC를 떠나지 않습니다",
    badge: "⚡ 온라인 · 설치 없음",
    pick: "📁 리플레이 폴더 선택", demo: "시연 데이터", refresh: "↺ 새로고침",
    nopath: "아직 폴더를 선택하지 않았습니다",
    cTotal: "전체 파일", cNeed: "변환 대기", cDone: "이미 변환", cSkip: "스킵",
    thNow: "현재 파일명", thNew: "변환 후", thStatus: "상태",
    empty: "폴더를 선택하면 파일 목록이 여기에 표시됩니다",
    selAll: "전체 선택", selNone: "전체 해제", convSel: "선택 변환", convAll: "전체 변환", undo: "↶ 원복",
    note: "변환은 이 브라우저 안에서만 수행됩니다 — 리플레이 파일이 외부 서버로 전송되지 않습니다.<br>Program Files 폴더는 Windows 권한상 브라우저가 직접 이름을 바꿀 수 없어, 그 경우 안내 배너가 표시됩니다.",
    foot: "제작자 <b>Ghost 클럽 Tangerine</b> · FSR Replay Doctor v1.0 (web)",
    pillP: "변환 대기", pillOk: "이미 변환", pillSk: "스킵",
    noFS: "이 브라우저는 File System Access API를 지원하지 않습니다. <b>Chrome</b> 또는 <b>Edge</b>를 사용해 주세요.",
    denied: "폴더 접근 권한이 거부되었습니다. 다시 폴더를 선택해 주세요.",
    connOk: "✓ <b>로컬 커넥터 연결됨</b> — 이 폴더의 이름 바꾸기는 커넥터(관리자 권한)로 안전하게 실행됩니다.",
    connHint: "⚠ 이 폴더는 <b>Windows 권한(관리자 필요)</b> 때문에 브라우저가 직접 이름을 바꿀 수 없습니다.<br>미리보기는 동작합니다. <a href='fsrep-rename.exe' download style='color:var(--brand2);text-decoration:underline'>fsrep-rename.exe</a>를 내려받아 관리자 권한으로(--serve 자동) 실행하면 여기서 바로 변환할 수 있습니다.",
    pathLocal: "{name} (로컬)", pathDemo: "시연 데이터 (실제 파일 아님)",
    aDemo: "시연 데이터입니다. 실제 변환은 폴더를 선택해 주세요.",
    aPick: "먼저 리플레이 폴더를 선택해 주세요.", aNone: "변환할 파일이 없습니다.",
    aDone: "{n}개 변환 완료", coll: " (건너뜀 {c}개)",
    cUndo: "변환한 파일들을 원래 이름으로 되돌립니다. 계속할까요?",
    aUndo: "{n}개 원복했습니다", aUndoVia: "{n}개 원복했습니다 (커넥터)",
    aUndoFail: "커넥터 원복 실패: ", readFail: "읽기 실패", pickFail: "폴더 선택 실패: ",
    aConn: " — 커넥터 실행 폴더 기준입니다.",
  },
  en: {
    title: "FSR Replay Doctor — Online Converter",
    sub: "Replay nickname renamer · Runs safely in your browser — files never leave your PC",
    badge: "⚡ Online · No install",
    pick: "📁 Select Replay Folder", demo: "Demo data", refresh: "↺ Refresh",
    nopath: "No folder selected yet",
    cTotal: "Total files", cNeed: "Pending", cDone: "Converted", cSkip: "Skipped",
    thNow: "Current name", thNew: "New name", thStatus: "Status",
    empty: "Select a folder and the file list will appear here",
    selAll: "Select all", selNone: "Deselect all", convSel: "Convert selected", convAll: "Convert all", undo: "↶ Undo",
    note: "All conversion happens inside this browser — replay files are never sent to any server.<br>For Program Files folders Windows prevents the browser from renaming directly; a banner will guide you when that happens.",
    foot: "Made by <b>Ghost Club Tangerine</b> · FSR Replay Doctor v1.0 (web)",
    pillP: "Pending", pillOk: "Converted", pillSk: "Skip",
    noFS: "This browser does not support the File System Access API. Please use <b>Chrome</b> or <b>Edge</b>.",
    denied: "Folder access was denied. Please select the folder again.",
    connOk: "✓ <b>Local connector connected</b> — renames in this folder run safely through it (admin rights).",
    connHint: "⚠ Windows permissions prevent this browser from renaming files in this folder (Program Files).<br>Preview works fine. Download <a href='fsrep-rename.exe' download style='color:var(--brand2);text-decoration:underline'>fsrep-rename.exe</a> and run it as administrator to convert right here.",
    pathLocal: "{name} (local)", pathDemo: "Demo data (not real files)",
    aDemo: "This is demo data. Select a folder to convert real files.",
    aPick: "Select a replay folder first.", aNone: "Nothing to convert.",
    aDone: "{n} converted", coll: " ({c} skipped)",
    cUndo: "Restore converted files to their original names. Continue?",
    aUndo: "{n} files restored", aUndoVia: "{n} files restored (via connector)",
    aUndoFail: "Connector undo failed: ", readFail: "read failed", pickFail: "Could not open folder: ",
    aConn: " — paths are relative to the connector's folder.",
  },
  ja: {
    title: "FSR Replay Doctor — オンラインコンバーター",
    sub: "リプレイニックネーム変換 · ブラウザ内で安全に実行、ファイルはPCから出ません",
    badge: "⚡ オンライン · インストール不要",
    pick: "📁 リプレイフォルダを選択", demo: "デモデータ", refresh: "↺ 更新",
    nopath: "フォルダが未選択です",
    cTotal: "総ファイル数", cNeed: "変換待ち", cDone: "変換済み", cSkip: "スキップ",
    thNow: "現在のファイル名", thNew: "変換後", thStatus: "状態",
    empty: "フォルダを選択すると、ここにファイル一覧が表示されます",
    selAll: "すべて選択", selNone: "選択解除", convSel: "選択を変換", convAll: "すべて変換", undo: "↶ 元に戻す",
    note: "変換はこのブラウザ内だけで実行されます — リプレイファイルが外部サーバーに送られることはありません。<br>Program FilesフォルダはWindowsの権限によりブラウザから直接名前変更できない場合、案内バナーが表示されます。",
    foot: "制作 <b>Ghost クラブ Tangerine</b> · FSR Replay Doctor v1.0 (web)",
    pillP: "変換待ち", pillOk: "変換済み", pillSk: "スキップ",
    noFS: "このブラウザはFile System Access APIに対応していません。<b>Chrome</b>または<b>Edge</b>をご利用ください。",
    denied: "フォルダへのアクセスが拒否されました。再度フォルダを選択してください。",
    connOk: "✓ <b>ローカルコネクタ接続済み</b> — このフォルダの名前変更はコネクタ（管理者権限）で安全に実行されます。",
    connHint: "⚠ Windowsの権限により、このフォルダのファイルはブラウザで直接名前変更できません。<br>プレビューは動作します。<a href='fsrep-rename.exe' download style='color:var(--brand2);text-decoration:underline'>fsrep-rename.exe</a> をダウンロードして管理者として実行するとここで変換できます。",
    pathLocal: "{name}（ローカル）", pathDemo: "デモデータ（実ファイルではありません）",
    aDemo: "これはデモデータです。実際のフォルダを選択してください。",
    aPick: "まずリプレイフォルダを選択してください。", aNone: "変換できるファイルがありません。",
    aDone: "{n}件変換完了", coll: "（{c}件スキップ）",
    cUndo: "変換したファイルをもとの名前に戻します。続行しますか？",
    aUndo: "{n}件戻しました", aUndoVia: "{n}件戻しました（コネクタ）",
    aUndoFail: "コネクタでの復元に失敗: ", readFail: "読み取り失敗", pickFail: "フォルダを開けませんでした: ",
    aConn: " — コネクタ起動フォルダが対象です。",
  },
  zh: {
    title: "FSR Replay Doctor — 在线转换器",
    sub: "回放昵称改名器 · 在浏览器内安全运行，文件不会离开您的电脑",
    badge: "⚡ 在线 · 免安装",
    pick: "📁 选择回放文件夹", demo: "演示数据", refresh: "↺ 刷新",
    nopath: "尚未选择文件夹",
    cTotal: "文件总数", cNeed: "待转换", cDone: "已转换", cSkip: "已跳过",
    thNow: "当前文件名", thNew: "转换后", thStatus: "状态",
    empty: "选择文件夹后，文件列表将显示在此处",
    selAll: "全选", selNone: "取消全选", convSel: "转换所选", convAll: "全部转换", undo: "↶ 撤销",
    note: "所有转换仅在本浏览器内完成 — 回放文件绝不会发送到任何服务器。<br>对于 Program Files 文件夹，Windows 权限限制浏览器直接改名，届时将显示引导横幅。",
    foot: "制作 <b>Ghost 俱乐部 Tangerine</b> · FSR Replay Doctor v1.0 (web)",
    pillP: "待转换", pillOk: "已转换", pillSk: "跳过",
    noFS: "此浏览器不支持 File System Access API，请使用 <b>Chrome</b> 或 <b>Edge</b>。",
    denied: "文件夹访问被拒绝，请重新选择文件夹。",
    connOk: "✓ <b>已连接本地连接器</b> — 此文件夹的改名将通过连接器（管理员权限）安全执行。",
    connHint: "⚠ 受 Windows 权限限制，浏览器无法直接重命名此文件夹中的文件。<br>预览可用。下载 <a href='fsrep-rename.exe' download style='color:var(--brand2);text-decoration:underline'>fsrep-rename.exe</a> 并以管理员身份运行即可在此直接转换。",
    pathLocal: "{name}（本地）", pathDemo: "演示数据（非真实文件）",
    aDemo: "这是演示数据。请选择文件夹以转换真实文件。",
    aPick: "请先选择回放文件夹。", aNone: "没有可转换的文件。",
    aDone: "已转换 {n} 个", coll: "（跳过 {c} 个）",
    cUndo: "将把已转换的文件恢复为原名。是否继续？",
    aUndo: "已恢复 {n} 个", aUndoVia: "已恢复 {n} 个（通过连接器）",
    aUndoFail: "连接器撤销失败：", readFail: "读取失败", pickFail: "无法打开文件夹：",
    aConn: " — 以连接器所在文件夹为准。",
  },
};
window.T = (function () {
  const m = location.search.match(/[?&]lang=(\w\w)/);
  const saved = localStorage.getItem("fsr-lang");
  const nav = (navigator.language || "ko").slice(0, 2).toLowerCase();
  let lang = m ? m[1] : (saved && I18N[saved] ? saved : (I18N[nav] ? nav : "ko"));
  if (!I18N[lang]) lang = "ko";
  function t(k, vars) {
    let s = (I18N[lang] && I18N[lang][k]) != null ? I18N[lang][k] : (I18N.ko[k] != null ? I18N.ko[k] : k);
    if (vars) for (const v in vars) s = s.split("{" + v + "}").join(vars[v]);
    return s;
  }
  function apply() {
    document.documentElement.lang = lang;
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    const sel = document.getElementById("lang");
    if (sel) sel.value = lang;
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  function set(l) { if (I18N[l]) { lang = l; localStorage.setItem("fsr-lang", l); apply(); } }
  return { t, set, apply, get: () => lang };
})();
