# Clash Party Custom Override

这个仓库会定时拉取上游 `ClashParty(mihomo-smart).js`，把 `custom-pre-rules.js` 里的自定义规则插入到 `function injectRules(config) { config.rules = [` 的最前面，然后生成 Clash Party 可导入的 JS 覆写文件。

## 使用方法

1. 修改 `custom-pre-rules.js`，维护你自己的前置规则。
2. 推送到 GitHub。
3. 打开 GitHub 仓库的 `Actions`，手动运行一次 `Update Clash Party Override`。
4. 在 Clash Party 覆写页面导入下面这个 Raw 地址：

```text
https://raw.githubusercontent.com/xiaoksks/Smart-Clash-Party-Config/main/dist/Smart-Override.js
```

也可以使用 jsDelivr：

```text
https://cdn.jsdelivr.net/gh/xiaoksks/Smart-Clash-Party-Config@main/dist/Smart-Override.js
```

## 本地生成

```bash
npm run build
```

生成文件：

```text
dist/ClashParty-mihomo-smart-custom.js
```

## 更新频率

GitHub Actions 默认每天北京时间 12:20 自动拉取上游并重新生成。如果上游没有变化，Action 不会产生新提交。
