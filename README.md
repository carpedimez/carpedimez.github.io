# 社区居民调查问卷

静态网站，打开 `index.html` 即可填写；单选后自动进入下一题，多选确认后继续。问卷内容来自项目中的《居民调研问卷_空白版.pdf》，保留多选限制、排他选项与不适用题目的跳转逻辑。

此版本没有后端：答卷只在当前页面内暂存，提交时清空，不保存、不收集，无法事后查看或统计。

## 发布到 GitHub Pages

1. 在 GitHub 创建仓库，将 `index.html`、`styles.css`、`app.js`、`questions.js` 和本文件放在仓库根目录。
2. 在仓库的 Settings → Pages 中，选择从默认分支根目录发布。
3. 等待 Pages 构建完成，在 Settings → Pages 查看实际网址。

问卷数据由 `make_questions.py` 从本项目中现有的 Markdown 问卷源生成；公开网站运行时无需该脚本或 Python。
