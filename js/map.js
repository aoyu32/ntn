const countryText = new Map();
countryText.set('holland', '荷兰');
countryText.set('hungary', '匈牙利');
countryText.set('sweden', '瑞典');
countryText.set('finland', '芬兰');
countryText.set('norway', '挪威');
countryText.set('germany', '德国');
countryText.set('italy', '意大利');

// 添加变量来跟踪当前选中的区域
let currentSelectedGroup = null;
let originalContent = { ch: '', en: '' };

function fetchMapSvg(url, container) {
    fetch(url)
        .then(res => res.text())
        .then(svg => {
            container.innerHTML = svg;
            // 在SVG加载完成后初始化交互功能
            initMapInteraction();
        })
        .catch(error => {
            console.error('加载地图失败,', error);
        });
}

function initMapInteraction() {
    const groups = document.querySelectorAll('#map g');
    const originalColors = new Map();
    const countryCh = document.querySelector('.world-map p');
    const countryEn = document.querySelector('.world-map span');
    
    // 保存初始文本内容
    originalContent.ch = countryCh.textContent;
    originalContent.en = countryEn.textContent;
    
    console.log("map groups", groups);
    
    groups.forEach(group => {
        const paths = group.querySelectorAll('path');
        paths.forEach(path => {
            const originalColor = path.getAttribute('fill') ||
                getComputedStyle(path).fill ||
                '#95A8B8';
            originalColors.set(path, originalColor);
        });
    });

    groups.forEach(group => {
        const paths = group.querySelectorAll('path');
        const groupId = group.id;
        
        // 点击事件 - 选中区域
        group.addEventListener('click', (event) => {
            event.preventDefault();
            
            // 重置所有区域颜色
            groups.forEach(g => {
                g.querySelectorAll('path').forEach(p => {
                    p.setAttribute('fill', originalColors.get(p));
                });
            });
            
            // 高亮当前选中区域
            changeFill(paths, "#CEE3F5");
            changeContentDirectly(groupId);
            
            // 更新当前选中的组
            currentSelectedGroup = groupId;
        });
        
        // 鼠标悬浮事件
        group.addEventListener('mouseenter', (event) => {
            // 如果当前区域不是已选中的区域，则显示悬浮效果
            if (currentSelectedGroup !== groupId) {
                changeContentWithFade(groupId);
            }
        });
        
        // 鼠标离开事件
        group.addEventListener('mouseleave', (event) => {
            // 如果当前区域不是已选中的区域，则恢复状态
            if (currentSelectedGroup !== groupId) {
                if (currentSelectedGroup) {
                    // 如果有选中的区域，恢复到选中区域的内容
                    changeContentWithFade(currentSelectedGroup);
                } else {
                    // 如果没有选中的区域，恢复到原始内容
                    restoreOriginalContentWithFade();
                }
            }
        });
    });
}

function changeFill(paths, color) {
    paths.forEach(el => {
        el.setAttribute('fill', color);
    });
}

// 点击时直接切换内容（无动画）
function changeContentDirectly(groupId) {
    const countryCh = document.querySelector('.world-map p');
    const countryEn = document.querySelector('.world-map span');
    const entries = Array.from(countryText);
    
    entries.forEach(([key, value]) => {
        if (groupId === key) {
            countryCh.textContent = value;
            countryEn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        }
    });
}

// 悬浮时的透明度过渡效果
function changeContentWithFade(groupId) {
    const countryCh = document.querySelector('.world-map p');
    const countryEn = document.querySelector('.world-map span');
    const entries = Array.from(countryText);
    
    // 先淡出
    countryCh.style.opacity = '0';
    countryEn.style.opacity = '0';
    
    // 等待淡出完成后更新内容并淡入
    setTimeout(() => {
        entries.forEach(([key, value]) => {
            if (groupId === key) {
                countryCh.textContent = value;
                countryEn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            }
        });
        
        // 淡入
        countryCh.style.opacity = '1';
        countryEn.style.opacity = '1';
    }, 300); // 与CSS transition时间匹配
}

// 恢复原始内容的透明度过渡效果
function restoreOriginalContentWithFade(groupId) {
    const countryCh = document.querySelector('.world-map p');
    const countryEn = document.querySelector('.world-map span');
    
    // 先淡出
    countryCh.style.opacity = '0';
    countryEn.style.opacity = '0';
    
    // 等待淡出完成后恢复原始内容并淡入
    setTimeout(() => {
        countryCh.textContent = originalContent.ch;
        countryEn.textContent = originalContent.en;
        
        // 淡入
        countryCh.style.opacity = '1';
        countryEn.style.opacity = '1';
    }, 300);
}

// 调用函数
const mapContainer = document.querySelector('.national-map');
fetchMapSvg('../assets/imgs/svgs/map.svg', mapContainer);