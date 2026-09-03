# SOYAL MSG Viewer

純前端 SOYAL 701Server / 701Client `.msg` 解析器。檔案只在瀏覽器本機讀取，不上傳伺服器。

## 第一版功能
- 拖放/選取一個或多個 `.msg`
- 依 100 bytes / record 解析
- 顯示事件時間、Source Node、Door、User Address、Function Code、701 接收時間
- Node / Function Code 篩選與全文搜尋
- 單筆 100-byte HEX/Offset 檢視
- 匯出 CSV
- GitHub Pages workflow

## 格式依據
SOYAL 官方 FAQ 指出 `.msg` 每筆固定 100 Bytes，701Server/Client 以日期 `.msg` 保存事件；公開資料可辨識 TM_EVENT、TM_REC、CTL_NODE、DOORNO、LOG_CODE、USER_ADDR 等欄位。未公開 Offset 在 UI 中標記為「未確認」。

參考：
- https://soyal.com/faq.php?act=view&id=814
- https://www.soyal.com.tw/faq.php?act=view&id=566
- https://files.soyal.com.tw/TW/download/Cross-System%20Integration/SOYAL%20INTEGRATION%20-%20TWO%20WAY%20HOSTING.pdf

## 本機測試
```bash
npm test
```
測試預設使用 `/mnt/data/20260901.msg`，也可：
```bash
node tests/parser.test.mjs /path/to/YYYYMMDD.msg
```

## GitHub Pages
`main` 分支每次 push 都會由 `.github/workflows/pages.yml` 自動部署 GitHub Pages。
