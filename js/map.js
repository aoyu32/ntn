const countryText = new Map();

countryText.set('holland', '荷兰');
countryText.set('hungary', '匈牙利');
countryText.set('sweden', '瑞典');
countryText.set('finland', '芬兰');
countryText.set('norway', '挪威');
countryText.set('germany', '德国');
countryText.set('italy', '意大利');
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
    console.log("map groups", groups);

    groups.forEach(group => {
        const paths = group.querySelectorAll('path');
        paths.forEach(path => {
            const originalColor = path.getAttribute('fill') ||
                getComputedStyle(path).fill ||
                '#E0E0E0';
            originalColors.set(path, originalColor);
        });
    });

    groups.forEach(group => {
        const paths = group.querySelectorAll('path');
        const groupId = group.id;
        if (groupId === 'sweden') {
            changeFill(paths, 'white')
        }
        group.addEventListener('click', (event) => {
            event.preventDefault();
            groups.forEach(g => {
                g.querySelectorAll('path').forEach(p => {
                    p.setAttribute('fill', originalColors.get(p));
                });
            });

            changeFill(paths, "white");
            changeContent(groupId);
        });
    });
}

function changeFill(paths, color) {
    paths.forEach(el => {
        el.setAttribute('fill', color);
    });
}

function changeContent(groupId) {
    const worldMap = document.querySelector('.world-map');
    const countryCh = document.querySelector('.world-map p');
    const countryEn = document.querySelector('.world-map span');
    const entries = Array.from(countryText);

    worldMap.style.transform = 'rotate(360deg)';
    // 添加退出动画
    countryCh.classList.add('text-exit');
    countryEn.classList.add('text-exit');

    // 动画结束后更新内容
    setTimeout(() => {
        entries.forEach(([key, value]) => {
            if (groupId === key) {
                countryCh.textContent = value;
                countryEn.textContent = key.charAt(0).toUpperCase() + key.slice(1);

                // 移除退出动画，添加进入动画
                countryCh.classList.remove('text-exit');
                countryEn.classList.remove('text-exit');
                countryCh.classList.add('text-enter');
                countryEn.classList.add('text-enter');
            }
        });

        // 进入动画结束后清理类
        setTimeout(() => {
            countryCh.classList.remove('text-enter');
            countryEn.classList.remove('text-enter');
            
        }, 500);
    }, 500);
}

// 调用函数
const mapContainer = document.querySelector('.national-map');
fetchMapSvg('../assets/imgs/svgs/map.svg', mapContainer);