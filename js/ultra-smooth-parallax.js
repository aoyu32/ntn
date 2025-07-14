/**
 * Ultra Smooth Parallax - 现代化无限视差滚动效果
 * 特点:
 * 1. 平滑的无限循环滚动
 * 2. 多层次视差效果
 * 3. 丝滑的转场动画
 * 4. 与侧边栏导航完美联动
 * 5. 支持鼠标滚轮、触摸和键盘导航
 */
// 背景配置映射
const backgroundConfigs = {
    'home': {
        backgroundImage: 'var(--bg-index)',
    },
    'circumstances': {
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },
    'chronology-bydch': {
        backgroundImage: 'var(--bg-chronology-bydch)',
    },
    'chronology-cdz': {
        backgroundImage: 'var(--bg-chronology-cdz)',
    },
    'chronology-hl': {
        backgroundImage: 'var(--bg-chronology-hl)',
    },
    'chronology-dm': {
        backgroundImage: 'var(--bg-chronology-dm)',
    },
    'chronology-qcsc': {
        backgroundImage: 'var(--bg-chronology-qcsc)',
    },
    'chronology-sjb': {
        backgroundImage: 'var(--bg-chronology-sjb)',
    },
    'chronology-mnhcz': {
        backgroundImage: 'var(--bg-chronology-mnhcz)',
    },
    'chronology-xylqyys': {
        backgroundImage: 'var(--bg-chronology-xylqyys)',
    },
    'chronology-omwyh': {
        backgroundImage: 'var(--bg-chronology-omwyh)',
    },
    'chronology-ydl': {
        backgroundImage: 'var(--bg-chronology-ydl)',
    },
    'accounting': {
        backgroundImage: 'var(--bg-accounting)',
    },
    'compiled': {
        backgroundImage: 'var(--bg-compiled)',
    },
};

// 视差滚动配置参数
const ULTRA_SMOOTH_CONFIG = {
    // 动画控制
    animation: {
        mainDuration: 0.8,        // 主要动画持续时间
        bgDuration: 1.0,          // 背景动画持续时间
        staggerDelay: 0.03,       // 元素动画错开时间
        mainEase: "power2.inOut", // 主要动画缓动函数
        bgEase: "power2.out",     // 背景动画缓动函数 (改为power2.out更平滑)
        contentEase: "back.out(1.5)" // 内容动画缓动函数（调整弹性系数）
    },

    // 视觉效果
    visuals: {
        bgParallaxDepth: 100,      // 背景视差深度百分比
        contentShift: 0,         // 内容移动距离(px)
        darkOverlay: 0,         // 暗色覆盖层不透明度
        blurEffect: '0px',        // 模糊效果强度
        bgSize: '150%',           // 背景尺寸（增大确保占满视口）
        bgOffset: '-50%',         // 背景顶部偏移量
        scale: {
            from: 1,           // 缩放开始值（统一缩放，减少差异）
            to: 1                  // 缩放结束值
        }
    },

    // 控制选项
    controls: {
        wheelSensitivity: 1,     // 滚轮灵敏度（越小越灵敏）
        touchSensitivity: 40,     // 触摸灵敏度（越小越灵敏）
        preventDefaultScroll: true, // 是否阻止默认滚动
        debounceTime: 500,         // 防抖间隔时间（毫秒）
        showProgressIndicator: true // 是否显示侧边进度指示器
    },

    // 循环滚动设置
    loopScroll: {
        enableLoop: true,         // 开启无限循环
        loopTransitionSpeed: 1.0, // 循环切换速度（与其他动画保持一致）
        useConsistentAnimation: true // 循环和非循环使用一致的动画效果
    },

    // 导航联动
    navigation: {
        highlightActiveNav: true,  // 高亮当前导航项
        scrollToSectionOnClick: true, // 点击导航时滚动到对应section
        smoothScrollToSection: true,   // 平滑滚动到指定section
        navUnderlineAnimation: {       // 导航下划线动画配置
            enabled: true,             // 启用下划线动画
            duration: 0.6,             // 持续时间（秒）
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)' // 缓动函数
        }
    }
};

// 设置背景的函数
function setBackground(sectionId, bg) {
    const config = backgroundConfigs[sectionId];

    if (config) {
        if (config.backgroundImage) {
            bg.style.backgroundImage = config.backgroundImage;
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
        }
        if (config.backgroundColor) {
            bg.style.backgroundColor = config.backgroundColor;
        }
    } else {
        console.warn(`未找到 section "${sectionId}" 的背景配置，使用默认黑色背景`);
        bg.style.backgroundColor = '#000';
    }
}


// 主函数：初始化无限视差滚动
function initUltraSmoothParallax() {
    console.log("初始化Ultra Smooth Parallax效果...");

    // 全局禁用文本选择
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // 注册GSAP插件
    gsap.registerPlugin(ScrollTrigger);

    // 获取页面元素
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-list a');

    // 设置状态变量
    let currentSectionIndex = 0;
    let isAnimating = false;
    let lastScrollTime = 0;
    let totalSections = sections.length;

    // 创建进度指示器
    if (ULTRA_SMOOTH_CONFIG.controls.showProgressIndicator) {
        createProgressIndicator();
    }

    // 准备视差元素
    prepareElements();

    // 调整背景尺寸以适应当前屏幕
    adjustBackgroundSizes();

    // 初始化导航状态
    updateNavigation(currentSectionIndex);

    // 设置事件监听器
    setupEventListeners();

    /**
     * 准备所有视差元素
     */
    function prepareElements() {
        console.log(`准备 ${totalSections} 个视差区块...`);

        // 清除可能存在的旧元素
        document.querySelectorAll('.parallax-bg, .section-overlay, .content-wrapper').forEach(el => {
            if (el.classList.contains('content-wrapper') && el.parentElement.classList.contains('section-content')) {
                // 不删除内容包装元素
            } else {
                el.remove();
            }
        });

        // 处理每个section
        sections.forEach((section, index) => {
            // 设置section基本样式
            section.style.position = 'absolute';
            section.style.width = '100vw';
            section.style.height = '100vh';
            section.style.overflow = 'hidden';
            section.style.top = '0';
            section.style.left = '0';
            section.style.zIndex = index === 0 ? '2' : '1';
            section.style.visibility = index === 0 ? 'visible' : 'hidden';

            // 获取section ID以匹配背景
            const sectionId = section.id || section.className;

            // 创建多层次视差背景
            const bgContainer = document.createElement('div');
            bgContainer.className = 'parallax-bg-container';
            bgContainer.style.position = 'absolute';
            bgContainer.style.width = '100vw'; // 使用视口宽度而不是百分比
            bgContainer.style.height = '100vh'; // 使用视口高度
            bgContainer.style.left = '0'; // 从页面最左侧开始
            bgContainer.style.top = '0';
            bgContainer.style.overflow = 'hidden';
            bgContainer.style.zIndex = '-1';
            bgContainer.style.pointerEvents = 'none'

            // 创建主背景层
            const bg = document.createElement('div');
            bg.className = 'parallax-bg';
            bg.style.willChange = 'transform';

            // 设置背景图片
            // setBackground(sectionId,bg)


            // 设置背景图片样式
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
            bg.style.backgroundRepeat = 'no-repeat';

            // 创建渐变叠加层（增强视差效果）
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'gradient-overlay';
            gradientOverlay.style.position = 'absolute';
            gradientOverlay.style.top = '0';
            gradientOverlay.style.left = '0';
            gradientOverlay.style.width = '100%';
            gradientOverlay.style.height = '100%';
            gradientOverlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%)';
            gradientOverlay.style.opacity = '0.7';
            gradientOverlay.style.zIndex = '10';

            // 创建暗色叠加层（用于过渡）
            // const darkOverlay = document.createElement('div');
            // darkOverlay.className = 'section-overlay';
            // darkOverlay.style.position = 'absolute';
            // darkOverlay.style.top = '0';
            // darkOverlay.style.left = '0';
            // darkOverlay.style.width = '100%';
            // darkOverlay.style.height = '100%';
            // darkOverlay.style.backgroundColor = '#000';
            // darkOverlay.style.opacity = '0';
            // darkOverlay.style.zIndex = '3';
            // darkOverlay.style.pointerEvents = 'none';

            // 组装背景层
            bgContainer.appendChild(bg);
            bgContainer.appendChild(gradientOverlay);
            section.insertBefore(bgContainer, section.firstChild);
            // section.appendChild(darkOverlay);

            // // 处理内容层
            // const content = section.querySelector('.section-content');
            // if (content) {
            //     // 设置内容层样式
            //     content.style.position = 'relative';
            //     content.style.zIndex = '100';
            //     content.style.height = '100%';
            //     content.style.width = '100%';
            //     content.style.display = 'flex';
            //     content.style.flexDirection = 'column';
            //     content.style.justifyContent = 'center';
            //     darkOverlay.style.pointerEvents = 'auto';

            //     // 获取所有内容元素并添加动画类
            //     const contentElements = content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div.content-wrapper, img');
            //     contentElements.forEach(el => {
            //         el.classList.add('animate-element');
            //         el.style.willChange = 'transform, opacity';

            //         // 非第一个section的元素初始隐藏
            //         if (index !== 0) {
            //             el.style.opacity = '0';
            //         }
            //     });
            // }

            // 设置初始位置
            if (index !== 0) {
                // 非当前section隐藏在下方
                gsap.set(section, { y: '100%' });
            } else {
                // 当前section初始化
                gsap.set(section, { y: '0%' });
            }

            console.log(`Section "${sectionId}" 准备完成`);
        });
    }

    /**
     * 创建侧边进度指示器
     */
    function createProgressIndicator() {
        // 检查是否已存在
        if (document.querySelector('.page-progress-indicator')) {
            return;
        }

        // 创建进度指示器容器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'page-progress-indicator';
        progressContainer.style.position = 'fixed';
        progressContainer.style.right = '5px';
        progressContainer.style.top = '50%';
        progressContainer.style.transform = 'translateY(-50%)';
        progressContainer.style.zIndex = '1001';
        progressContainer.style.display = 'flex';
        progressContainer.style.flexDirection = 'column';
        progressContainer.style.alignItems = 'center';
        progressContainer.style.gap = '10px';

        // 默认显示或隐藏指示器，基于配置
        if (!ULTRA_SMOOTH_CONFIG.controls.showProgressIndicator) {
            progressContainer.style.display = 'none';
        }

        // 定义不同类别section的颜色
        const sectionColors = {
            'default': 'rgba(255,255,255,0.7)', // 默认为白色半透明
            'active': '#fff',                   // 当前活动项为纯白色
            'home': '#64ffda',                  // 首页颜色
            'chronology': '#ff7e79',            // chronology类别颜色
            'accounting': '#ff5410ff',            // accounting类别颜色
            'compiled': '#ffb74d'               // compiled类别颜色
        };

        // 获取当前section的类别
        const currentSection = sections[currentSectionIndex];
        const currentSectionId = currentSection.id;
        const currentSectionClass = currentSection.className;

        // 确定当前section的类别
        let currentCategory = 'default';
        if (currentSectionId === 'home') {
            currentCategory = 'home';
        } else if (currentSectionClass && currentSectionClass.includes('chronology')) {
            currentCategory = 'chronology';
        } else if (currentSectionId === 'accounting' || currentSectionClass && currentSectionClass.includes('accounting')) {
            currentCategory = 'accounting';
        } else if (currentSectionId === 'compiled') {
            currentCategory = 'compiled';
        }

        // 为每个section创建指示点
        sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.dataset.index = index;
            dot.dataset.section = section.id || section.className;
            dot.style.width = '5px';
            dot.style.height = '5px';
            dot.style.borderRadius = '50%';

            // 确定点的颜色类别
            let dotCategory = 'default';
            const sectionId = section.id;
            const sectionClass = section.className;

            if (sectionId === 'home') {
                dotCategory = 'home';
            } else if (sectionClass && sectionClass.includes('chronology')) {
                dotCategory = 'chronology';
            } else if (sectionId === 'accounting' || sectionClass && sectionClass.includes('accounting')) {
                dotCategory = 'accounting';
            } else if (sectionId === 'compiled') {
                dotCategory = 'compiled';
            }

            // 默认所有点为白色
            let dotColor = sectionColors.default;
            let dotOpacity = 0.7;

            // 如果点所属类别与当前section类别相同，则使用该类别的颜色
            if (dotCategory === currentCategory) {
                dotColor = sectionColors[currentCategory];
                dotOpacity = 0.8;
            }

            // 设置点的样式
            if (index === currentSectionIndex) {
                // 当前活动的点
                dot.style.backgroundColor = sectionColors.active;
                dot.style.transform = 'scale(1.5)';
                dot.style.boxShadow = '0 0 10px rgba(255,255,255,0.7)';
                dot.style.opacity = '1';
            } else {
                // 非活动的点
                dot.style.backgroundColor = dotColor;
                dot.style.opacity = dotOpacity;
                dot.style.transform = 'scale(1)';
                dot.style.boxShadow = 'none';
            }

            dot.style.transition = 'all 0.3s ease';
            dot.style.cursor = 'pointer';

            // 添加点击事件
            dot.addEventListener('click', () => {
                if (!isAnimating && currentSectionIndex !== index) {
                    const direction = index > currentSectionIndex ? 'down' : 'up';
                    scrollToSection(index, direction);
                }
            });

            progressContainer.appendChild(dot);
        });

        // 添加到文档
        document.body.appendChild(progressContainer);
    }

    /**
     * 更新进度指示器状态
     */
    function updateProgressIndicator() {
        const dots = document.querySelectorAll('.progress-dot');
        if (!dots.length) return;

        // 定义不同类别section的颜色
        const sectionColors = {
            'default': 'rgba(255,255,255,0.7)', // 默认为白色半透明
            'active': '#fff',                   // 当前活动项为纯白色
            'home': '#64ffda',                  // 首页颜色
            'chronology': '#ff312aff',            // chronology类别颜色
            'accounting': '#00ffd0ff',            // accounting类别颜色
            'compiled': '#ffb74d'               // compiled类别颜色
        };

        // 获取当前section的类别
        const currentSection = sections[currentSectionIndex];
        const currentSectionId = currentSection.id;
        const currentSectionClass = currentSection.className;

        // 确定当前section的类别
        let currentCategory = 'default';
        if (currentSectionId === 'home') {
            currentCategory = 'home';
        } else if (currentSectionClass && currentSectionClass.includes('chronology')) {
            currentCategory = 'chronology';
        } else if (currentSectionId === 'accounting' || currentSectionClass && currentSectionClass.includes('accounting')) {
            currentCategory = 'accounting';
        } else if (currentSectionId === 'compiled') {
            currentCategory = 'compiled';
        }

        // 根据类别颜色更新所有点
        dots.forEach((dot, index) => {
            // 获取这个点对应的section
            const dotSection = sections[index];
            const dotSectionId = dotSection.id;
            const dotSectionClass = dotSection.className;

            // 确定这个点对应section的类别
            let dotCategory = 'default';
            if (dotSectionId === 'home') {
                dotCategory = 'home';
            } else if (dotSectionClass && dotSectionClass.includes('chronology')) {
                dotCategory = 'chronology';
            } else if (dotSectionId === 'accounting' || dotSectionClass && dotSectionClass.includes('accounting')) {
                dotCategory = 'accounting';
            } else if (dotSectionId === 'compiled') {
                dotCategory = 'compiled';
            }

            // 默认所有点为白色
            let dotColor = sectionColors.default;
            let dotOpacity = 0.7;

            // 如果点所属类别与当前section类别相同，则使用该类别的颜色
            if (dotCategory === currentCategory) {
                dotColor = sectionColors[currentCategory];
                dotOpacity = 0.8;
            }

            // 设置点的样式
            if (index === currentSectionIndex) {
                // 当前活动的点 - 白色高亮
                dot.style.backgroundColor = sectionColors.active;
                dot.style.transform = 'scale(1.5)';
                dot.style.boxShadow = '0 0 10px rgba(255,255,255,0.7)';
                dot.style.opacity = '1';
            } else {
                // 非活动的点 - 根据上面的逻辑设置颜色
                dot.style.backgroundColor = dotColor;
                dot.style.opacity = dotOpacity;
                dot.style.transform = 'scale(1)';
                dot.style.boxShadow = 'none';
            }
        });
    }

    /**
     * 切换进度指示器显示/隐藏
     */
    function toggleProgressIndicator() {
        const indicator = document.querySelector('.page-progress-indicator');
        if (!indicator) return;

        if (indicator.style.display === 'none') {
            indicator.style.display = 'flex';
            console.log('显示页数指示器');
        } else {
            indicator.style.display = 'none';
            console.log('隐藏页数指示器');
        }
    }

    /**
     * 完成导航下划线动画
     */
    function finishNavigationAnimation(targetIndex) {
        const targetSection = sections[targetIndex];
        const targetId = targetSection.id || targetSection.className;

        // 获取目标section的类名
        const targetClassName = targetSection.className;

        // 移除所有临时动画类
        navLinks.forEach(link => {
            link.classList.remove('animating-in', 'animating-out');
        });

        // 获取当前活跃的导航链接
        const prevActiveLink = document.querySelector('.nav-list a.active');

        // 检查是否在同一类别的section之间切换
        if (prevActiveLink) {
            const prevActiveLinkHref = prevActiveLink.getAttribute('href').substring(1); // 去掉#
            const prevActiveSection = Array.from(sections).find(section =>
                (section.id || section.className) === prevActiveLinkHref
            );

            // 如果上一个section和当前section都是同一个类别，保持相同的active链接
            if (prevActiveSection && prevActiveSection.className &&
                targetClassName && prevActiveSection.className === targetClassName) {
                console.log(`保持相同的active链接，section类别: ${targetClassName}`);
                return; // 保持当前active状态不变
            }
        }

        // 如果是不同类别的section之间切换，找到目标导航链接并设置为active
        let targetLink = null;

        // 首先尝试精确匹配ID
        targetLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${targetId}`);

        // 如果没有精确匹配，则尝试匹配类别
        // 这对于从其他section回到chronology section特别重要
        if (!targetLink && targetClassName) {
            // 查找导航中指向该类别的第一个链接
            for (const link of navLinks) {
                const linkHref = link.getAttribute('href').substring(1); // 去掉#
                const linkedSection = Array.from(sections).find(section =>
                    (section.id || section.className) === linkHref
                );

                if (linkedSection && linkedSection.className === targetClassName) {
                    targetLink = link;
                    console.log(`找到匹配类别的链接: ${linkHref} 对应类别: ${targetClassName}`);
                    break;
                }
            }
        }

        if (targetLink) {
            // 移除所有链接的active类
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            // 给目标链接添加active类
            targetLink.classList.add('active');
            console.log(`设置链接为active: ${targetLink.getAttribute('href')}`);
        } else {
            console.warn(`未找到匹配的导航链接: ${targetId}`);
        }
    }

    /**
     * 更新导航状态
     */
    function updateNavigation(activeIndex) {
        if (!ULTRA_SMOOTH_CONFIG.navigation.highlightActiveNav) {
            return;
        }

        const activeSection = sections[activeIndex];
        const activeId = activeSection.id || activeSection.className;
        const activeClass = activeSection.className;

        // 获取当前活跃的导航链接
        const prevActiveLink = document.querySelector('.nav-list a.active');

        // 检查是否在同一类别的section之间切换
        if (prevActiveLink) {
            const prevActiveLinkHref = prevActiveLink.getAttribute('href').substring(1); // 去掉#
            const prevActiveSection = Array.from(sections).find(section =>
                (section.id || section.className) === prevActiveLinkHref
            );

            // 如果上一个section和当前section都是同一个类别，保持相同的active链接
            if (prevActiveSection && prevActiveSection.className &&
                activeClass && prevActiveSection.className === activeClass) {
                console.log(`保持相同的active链接，section类别: ${activeClass}`);

                // 移除动画类，保持active状态
                navLinks.forEach(link => {
                    link.classList.remove('animating-in', 'animating-out');
                });

                // 更新进度指示器
                if (ULTRA_SMOOTH_CONFIG.controls.showProgressIndicator) {
                    updateProgressIndicator();
                }

                return;
            }
        }

        // 尝试找到精确匹配的导航链接
        let activeLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${activeId}`);

        // 如果没有找到精确匹配，尝试找到匹配类别的链接
        if (!activeLink && activeClass) {
            for (const link of navLinks) {
                const linkHref = link.getAttribute('href').substring(1); // 去掉#
                const linkedSection = Array.from(sections).find(section =>
                    (section.id || section.className) === linkHref
                );

                if (linkedSection && linkedSection.className === activeClass) {
                    activeLink = link;
                    console.log(`找到匹配类别的链接: ${linkHref} 对应类别: ${activeClass}`);
                    break;
                }
            }
        }

        // 更新导航项激活状态
        navLinks.forEach(link => {
            // 移除所有过渡动画类
            link.classList.remove('animating-in', 'animating-out');
            // 移除所有active类
            link.classList.remove('active');
        });

        // 如果找到了匹配的链接，设置为active
        if (activeLink) {
            activeLink.classList.add('active');
            console.log(`设置链接为active: ${activeLink.getAttribute('href')}`);
        } else {
            console.warn(`未找到匹配的导航链接: ${activeId}`);
        }

        // 更新进度指示器
        if (ULTRA_SMOOTH_CONFIG.controls.showProgressIndicator) {
            updateProgressIndicator();
        }

        console.log(`已更新导航状态: ${activeId}`);
    }

    /**
     * 开始导航下划线动画
     */
    function animateNavigation(prevIndex, targetIndex) {
        if (!ULTRA_SMOOTH_CONFIG.navigation.navUnderlineAnimation.enabled) {
            return;
        }

        const prevSection = sections[prevIndex];
        const targetSection = sections[targetIndex];

        // 获取section ID
        const prevId = prevSection.id || prevSection.className;
        const targetId = targetSection.id || targetSection.className;

        // 获取section类名
        const prevClass = prevSection.className;
        const targetClass = targetSection.className;

        // 如果两个section都属于同一个类别，跳过下划线动画
        if (prevClass && targetClass && prevClass === targetClass) {
            console.log(`Section ${prevId} 和 ${targetId} 属于同一类别 (${prevClass})，跳过下划线动画`);
            return;
        }

        console.log("prevId", prevId);
        console.log("targetId", targetId);

        // 找到对应的导航链接
        let prevLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${prevId}`);
        let targetLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${targetId}`);

        // 如果没有找到精确匹配的链接，尝试找到匹配类别的链接
        if (!prevLink && prevClass) {
            for (const link of navLinks) {
                const linkHref = link.getAttribute('href').substring(1); // 去掉#
                const linkedSection = Array.from(sections).find(section =>
                    (section.id || section.className) === linkHref
                );

                if (linkedSection && linkedSection.className === prevClass) {
                    prevLink = link;
                    console.log(`为前一个section找到匹配类别的链接: ${linkHref}`);
                    break;
                }
            }
        }

        if (!targetLink && targetClass) {
            for (const link of navLinks) {
                const linkHref = link.getAttribute('href').substring(1); // 去掉#
                const linkedSection = Array.from(sections).find(section =>
                    (section.id || section.className) === linkHref
                );

                if (linkedSection && linkedSection.className === targetClass) {
                    targetLink = link;
                    console.log(`为目标section找到匹配类别的链接: ${linkHref}`);
                    break;
                }
            }
        }

        // 获取动画配置
        const duration = ULTRA_SMOOTH_CONFIG.navigation.navUnderlineAnimation.duration;
        const ease = ULTRA_SMOOTH_CONFIG.navigation.navUnderlineAnimation.easing;

        // 创建自定义GSAP时间轴来控制下划线
        const navTl = gsap.timeline();

        if (prevLink) {
            // 移除active类，但保留当前样式状态
            prevLink.classList.remove('active');

            // 获取下划线元素
            const prevUnderline = prevLink.querySelector('::after') || prevLink;

            // 动画淡出前一个导航项下划线
            navTl.to(prevLink, {
                onStart: () => {
                    prevLink.classList.add('animating-out');
                },
                duration: duration * 0.7, // 稍快一些
                ease: ease
            });
        }

        if (targetLink) {
            // 移除active类，但准备添加动画类
            targetLink.classList.remove('active');

            // 获取下划线元素
            const targetUnderline = targetLink.querySelector('::after') || targetLink;

            // 动画淡入目标导航项下划线
            navTl.to(targetLink, {
                onStart: () => {
                    targetLink.classList.add('animating-in');
                },
                duration: duration,
                ease: ease
            }, duration * 0.3); // 稍微延迟开始
        }

        // 为动画添加调试日志
        console.log(`开始导航动画: 从 ${prevId} 到 ${targetId}`);
    }

    /**
     * 滚动到指定section
     */
    function scrollToSection(targetIndex, direction) {
        // 防止无效滚动
        if (isAnimating || targetIndex === currentSectionIndex || targetIndex < 0 || targetIndex >= totalSections) {
            return;
        }

        isAnimating = true;

        // 保存原索引和更新当前索引
        const prevIndex = currentSectionIndex;
        currentSectionIndex = targetIndex;

        // 触发section切换事件
        window.dispatchEvent(new CustomEvent('sectionChange', {
            detail: {
                prevIndex,
                currentIndex: targetIndex,
                direction,
                prevSection: sections[prevIndex],
                currentSection: sections[targetIndex]
            }
        }));

        // 检测是否是循环滚动情况（最后一个→第一个或第一个→最后一个）
        if (ULTRA_SMOOTH_CONFIG.loopScroll.enableLoop) {
            if (prevIndex === totalSections - 1 && targetIndex === 0) {
                direction = 'down'; // 从最后一个到第一个，方向是向下
                console.log('循环滚动: 最后→第一');
            } else if (prevIndex === 0 && targetIndex === totalSections - 1) {
                direction = 'up'; // 从第一个到最后一个，方向是向上
                console.log('循环滚动: 第一→最后');
            }
        }

        console.log(`滚动: ${direction}, 从 ${prevIndex} 到 ${targetIndex}`);

        // 开始导航下划线动画
        animateNavigation(prevIndex, targetIndex);

        // 获取相关元素
        const currentSection = sections[prevIndex];
        const targetSection = sections[targetIndex];

        const currentBg = currentSection.querySelector('.parallax-bg');
        const targetBg = targetSection.querySelector('.parallax-bg');

        const currentOverlay = currentSection.querySelector('.section-overlay');
        const targetOverlay = targetSection.querySelector('.section-overlay');

        const currentContent = currentSection.querySelector('.section-content');
        const targetContent = targetSection.querySelector('.section-content');

        // 获取动画元素
        const currentElements = currentContent ? Array.from(currentContent.querySelectorAll('.animate-element')) : [];
        const targetElements = targetContent ? Array.from(targetContent.querySelectorAll('.animate-element')) : [];

        // 准备目标section - 保持一致的起始位置
        gsap.set(targetSection, {
            y: direction === 'down' ? '100%' : '-100%',
            visibility: 'visible',
            zIndex: 3
        });

        // 准备目标元素的初始状态 - 保持一致的元素初始状态
        gsap.set(targetElements, {
            y: direction === 'down' ? 30 : -30,
            opacity: 0
        });

        // 确保初始背景状态一致
        const initialScale = ULTRA_SMOOTH_CONFIG.visuals.scale.from;

        // 为当前背景设置初始状态 - 确保一致性
        gsap.set(currentBg, {
            y: '0vh',
            scale: 1,
            opacity: 1,
            transformOrigin: 'center center'
        });

        // 为目标背景设置初始状态 - 确保一致性
        gsap.set(targetBg, {
            y: direction === 'down' ? '5vh' : '-5vh',
            scale: initialScale,
            opacity: 1,
            transformOrigin: 'center center'
        });

        // 创建主时间轴 - 使用一致的时间轴配置
        const tl = gsap.timeline({
            defaults: { ease: ULTRA_SMOOTH_CONFIG.animation.mainEase },
            onComplete: () => {
                // 动画完成后重置状态
                isAnimating = false;

                // 隐藏当前section
                gsap.set(currentSection, {
                    visibility: 'hidden',
                    zIndex: 1
                });

                // 设置目标section为当前section
                gsap.set(targetSection, {
                    zIndex: 2
                });

                // 完成导航下划线动画
                finishNavigationAnimation(targetIndex);

                // 更新导航
                updateNavigation(currentSectionIndex);

                // 重置所有下拉内容的状态
                if (window.resetAllDropdownStates) {
                    window.resetAllDropdownStates();
                }

                console.log(`动画完成: 当前索引 ${currentSectionIndex}`);
            }
        });

        // 使用统一的动画效果 - 无论是否循环滚动
        // 1. 当前section的叠加层淡入
        tl.to(currentOverlay, {
            opacity: 0.3,
            duration: ULTRA_SMOOTH_CONFIG.animation.mainDuration * 0.5
        }, 0);

        // 2. 当前section内容元素动画
        tl.to(currentElements, {
            y: direction === 'down' ? -30 : 30,
            opacity: 0,
            stagger: ULTRA_SMOOTH_CONFIG.animation.staggerDelay,
            duration: ULTRA_SMOOTH_CONFIG.animation.mainDuration * 0.6
        }, 0);

        // 3. 当前section背景视差移动 - 保持一致的视差效果
        tl.to(currentBg, {
            y: direction === 'down' ? '-5vh' : '5vh',
            scale: initialScale,
            duration: ULTRA_SMOOTH_CONFIG.animation.bgDuration,
            ease: ULTRA_SMOOTH_CONFIG.animation.bgEase
        }, 0);

        // 4. 目标section滑入 - 保持一致的过渡动画
        tl.to(targetSection, {
            y: '0%',
            duration: ULTRA_SMOOTH_CONFIG.animation.mainDuration,
            ease: "power2.out"
        }, 0.1);

        // 5. 目标section背景反向视差 - 保持一致的视差效果
        tl.to(targetBg, {
            y: '0vh',
            scale: 1,
            duration: ULTRA_SMOOTH_CONFIG.animation.bgDuration,
            ease: ULTRA_SMOOTH_CONFIG.animation.bgEase
        }, 0.1);

        // 6. 目标section叠加层淡出
        tl.fromTo(targetOverlay,
            { opacity: 0.4 },
            { opacity: 0, duration: ULTRA_SMOOTH_CONFIG.animation.mainDuration * 0.8 },
            0.2
        );

        // 7. 目标内容元素顺序进入
        tl.to(targetElements, {
            y: 0,
            opacity: 1,
            stagger: ULTRA_SMOOTH_CONFIG.animation.staggerDelay,
            duration: ULTRA_SMOOTH_CONFIG.animation.mainDuration * 0.8,
            ease: ULTRA_SMOOTH_CONFIG.animation.contentEase
        }, 0.35);
    }

    /**
     * 设置所有事件监听器
     */
    function setupEventListeners() {
        // 鼠标滚轮事件
        window.addEventListener('wheel', (e) => {
            // 阻止默认滚动行为
            if (ULTRA_SMOOTH_CONFIG.controls.preventDefaultScroll) {
                e.preventDefault();
            }

            // 防抖处理
            const now = Date.now();
            if (now - lastScrollTime < ULTRA_SMOOTH_CONFIG.controls.debounceTime) {
                return;
            }

            lastScrollTime = now;

            // 检测滚动方向
            if (Math.abs(e.deltaY) > ULTRA_SMOOTH_CONFIG.controls.wheelSensitivity) {
                const direction = e.deltaY > 0 ? 'down' : 'up';

                // 计算目标索引
                let targetIndex;
                if (direction === 'down') {
                    targetIndex = (currentSectionIndex + 1) % totalSections;
                } else {
                    targetIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
                }

                // 执行滚动
                scrollToSection(targetIndex, direction);
            }
        }, { passive: !ULTRA_SMOOTH_CONFIG.controls.preventDefaultScroll });

        // 鼠标按下拖动事件
        let isDragging = false;
        let mouseStartY = 0;
        let mouseMoveThreshold = 100; // 鼠标移动阈值（像素）
        let userSelectStyle = '';

        // 禁用文本选择
        function disableTextSelection() {
            // 保存原始用户选择样式
            userSelectStyle = document.body.style.userSelect;

            // 禁用文本选择
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.mozUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
        }

        // 恢复文本选择
        function enableTextSelection() {
            // 恢复原始用户选择样式
            document.body.style.userSelect = userSelectStyle;
            document.body.style.webkitUserSelect = userSelectStyle;
            document.body.style.mozUserSelect = userSelectStyle;
            document.body.style.msUserSelect = userSelectStyle;
        }

        // 鼠标按下时记录起始位置
        window.addEventListener('mousedown', (e) => {
            isDragging = true;
            mouseStartY = e.clientY;
            document.body.style.cursor = 'grabbing'; // 改变鼠标指针样式
            disableTextSelection(); // 禁用文本选择
        });

        // 鼠标移动时检测拖动距离和方向
        window.addEventListener('mousemove', (e) => {
            if (!isDragging || isAnimating) return;

            const currentY = e.clientY;
            const deltaY = currentY - mouseStartY;

            // 如果移动距离超过阈值，触发section切换
            if (Math.abs(deltaY) > mouseMoveThreshold) {
                isDragging = false;
                document.body.style.cursor = ''; // 恢复鼠标指针样式
                enableTextSelection(); // 恢复文本选择

                // 确定方向并计算目标索引
                const direction = deltaY < 0 ? 'down' : 'up';
                let targetIndex;

                if (direction === 'down') {
                    targetIndex = (currentSectionIndex + 1) % totalSections;
                } else {
                    targetIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
                }

                // 执行滚动
                scrollToSection(targetIndex, direction);
            }
        });

        // 鼠标松开时重置状态
        window.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = ''; // 恢复鼠标指针样式
            enableTextSelection(); // 恢复文本选择
        });

        // 鼠标离开窗口时重置状态
        window.addEventListener('mouseleave', () => {
            isDragging = false;
            document.body.style.cursor = ''; // 恢复鼠标指针样式
            enableTextSelection(); // 恢复文本选择
        });

        // 触摸事件
        let touchStartY = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (isAnimating) return;

            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY;

            // 检测是否有效滑动
            if (Math.abs(deltaY) > ULTRA_SMOOTH_CONFIG.controls.touchSensitivity) {
                const direction = deltaY < 0 ? 'down' : 'up';

                // 计算目标索引
                let targetIndex;
                if (direction === 'down') {
                    targetIndex = (currentSectionIndex + 1) % totalSections;
                } else {
                    targetIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
                }

                // 执行滚动
                scrollToSection(targetIndex, direction);
            }
        }, { passive: true });

        // 键盘导航
        window.addEventListener('keydown', (e) => {
            if (isAnimating) return;

            // 防抖
            const now = Date.now();
            if (now - lastScrollTime < ULTRA_SMOOTH_CONFIG.controls.debounceTime) {
                return;
            }

            lastScrollTime = now;

            let targetIndex;
            let direction;

            switch (e.key) {
                case 'ArrowDown':
                case 'PageDown':
                case 'Space':
                    direction = 'down';
                    targetIndex = (currentSectionIndex + 1) % totalSections;
                    scrollToSection(targetIndex, direction);
                    break;

                case 'ArrowUp':
                case 'PageUp':
                    direction = 'up';
                    targetIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
                    scrollToSection(targetIndex, direction);
                    break;
            }
        });

        // 导航点击事件
        if (ULTRA_SMOOTH_CONFIG.navigation.scrollToSectionOnClick) {
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    if (isAnimating) return;

                    const targetId = link.getAttribute('href').substring(1);
                    const targetIndex = Array.from(sections).findIndex(section => section.id === targetId);

                    if (targetIndex !== -1 && targetIndex !== currentSectionIndex) {
                        const direction = targetIndex > currentSectionIndex ? 'down' : 'up';
                        scrollToSection(targetIndex, direction);
                    }
                });
            });
        }

        // Logo点击事件
        const logoLink = document.querySelector('.logo-name a');
        if (logoLink && ULTRA_SMOOTH_CONFIG.navigation.scrollToSectionOnClick) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();

                if (isAnimating) return;

                const targetId = logoLink.getAttribute('href').substring(1);
                const targetIndex = Array.from(sections).findIndex(section => section.id === targetId);

                if (targetIndex !== -1 && targetIndex !== currentSectionIndex) {
                    const direction = targetIndex > currentSectionIndex ? 'down' : 'up';
                    scrollToSection(targetIndex, direction);
                }
            });
        }

        // 自定义滚动事件 - 用于滑动"新"行文本返回首页功能
        window.addEventListener('scrollToSection', (e) => {
            if (isAnimating) return;

            const targetIndex = e.detail.targetIndex;

            if (targetIndex !== -1 && targetIndex !== currentSectionIndex) {
                const direction = targetIndex > currentSectionIndex ? 'down' : 'up';
                scrollToSection(targetIndex, direction);
            }
        });

        // 窗口大小变化事件
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("窗口大小变化，调整布局");

                // 调整所有背景尺寸
                adjustBackgroundSizes();

                // 确保当前section正确显示
                sections.forEach((section, index) => {
                    if (index === currentSectionIndex) {
                        gsap.set(section, {
                            y: '0%',
                            visibility: 'visible',
                            zIndex: 2
                        });
                    }
                });
            }, 200);
        });

        // 添加Ctrl+Shift+D快捷键监听器
        document.addEventListener('keydown', (e) => {
            // 防止与浏览器快捷键冲突
            if (e.key.toLowerCase() === 'd' && e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                toggleProgressIndicator();
            }
        });
    }

    /**
     * 调整所有背景尺寸以适应当前屏幕
     */
    function adjustBackgroundSizes() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const aspectRatio = windowWidth / windowHeight;

        // 根据屏幕宽高比例动态调整背景大小
        let bgHeightVh = 110; // 默认为110vh

        // 根据宽高比调整高度
        if (aspectRatio > 1.5) {
            // 宽屏设备，增加高度
            bgHeightVh = 120;
        } else if (aspectRatio < 0.8) {
            // 窄屏设备，更多增加高度
            bgHeightVh = 130;
        }

        // 应用到所有背景
        document.querySelectorAll('.parallax-bg').forEach(bg => {
            bg.style.width = '100vw'; // 始终是100%视口宽度
            bg.style.height = `${bgHeightVh}vh`; // 动态调整视口高度
            bg.style.top = `-${(bgHeightVh - 100) / 2}vh`; // 居中对齐
            bg.style.left = '0'; // 从左侧开始
        });

        console.log(`调整背景大小: ${bgHeightVh}vh, 宽高比: ${aspectRatio.toFixed(2)}`);
    }
}

// 导出初始化函数
window.initUltraSmoothParallax = initUltraSmoothParallax; 