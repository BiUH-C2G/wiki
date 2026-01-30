(function() {
    const LIGHT_THEME_NAME = 'zinc-light'; 
    const DARK_THEME_NAME = 'zinc-dark';

    async function doRender() {
        const { renderMermaid, THEMES } = beautifulMermaid;
        
        const scheme = document.body.getAttribute("data-md-color-scheme");
        const isDark = scheme === "slate";
        const themeObject = isDark ? THEMES[DARK_THEME_NAME] : THEMES[LIGHT_THEME_NAME];

        // 找到所有 mermaid 代码块
        const blocks = document.querySelectorAll('pre code.language-mermaid');

        for (const block of blocks) {
            const preElement = block.parentElement;
            
            // 1. 备份源码
            if (!preElement.dataset.rawCode) {
                preElement.dataset.rawCode = block.innerText;
            }
            const rawCode = preElement.dataset.rawCode;

            // 2. 获取或创建容器
            let container = preElement.nextElementSibling;
            if (!container || !container.classList.contains('beautiful-mermaid-container')) {
                container = document.createElement('div');
                container.className = 'beautiful-mermaid-container is-loading';
                container.innerHTML = '<span>正在加载 Mermaid 流程图...</span>';
                
                // 确保原 pre 隐藏
                preElement.style.display = 'none';
                preElement.parentNode.insertBefore(container, preElement.nextSibling);
            }

            // 如果是切换主题触发的重绘，可以加个透明度动画
            container.style.opacity = "0.6";

            try {
                // 3. 渲染 SVG
                // 注意：根据你之前的截图，这里直接传入 themeObject
                const svg = await renderMermaid(rawCode, themeObject);
                
                // 4. 渲染成功，移除加载状态并显示 SVG
                container.classList.remove('is-loading');
                container.innerHTML = svg;
                container.style.opacity = "1";
            } catch (error) {
                console.error("Mermaid 渲染失败:", error);
                container.innerHTML = '<span style="color:red;">图表渲染失败，请检查语法</span>';
            }
        }
    }

    // --- 监听逻辑 ---

    // 监听主题切换
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === "data-md-color-scheme") {
                doRender();
                break;
            }
        }
    });
    observer.observe(document.body, { attributes: true });

    // 初始加载
    if (document.readyState === "complete") {
        doRender();
    } else {
        window.addEventListener("load", doRender);
    }

    // 适配 MkDocs Instant Loading (核心：解决翻页不刷新问题)
    if (typeof subscribe !== 'undefined') {
        subscribe("locationChange$", () => {
            // 翻页后 DOM 重新生成，需要稍微延迟执行
            setTimeout(doRender, 100);
        });
    }
})();

