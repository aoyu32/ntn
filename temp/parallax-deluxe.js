/**
 * Parallax Deluxe - 高级丝滑无限视差滚动效果
 * 
 * 特点:
 * 1. 丝滑的Section过渡效果
 * 2. 背景和内容独立的视差动画
 * 3. 无限循环滚动支持
 * 4. 针对不同方向滚动优化的动画效果
 * 5. 支持鼠标滚轮、触摸滑动和键盘导航
 * 6. 可自定义配置的动画参数
 */

// 高级视差滚动配置参数
const DELUXE_CONFIG = {
    // 动画持续时间与缓动
    animation: {
        duration: 1.2,            // 基础动画持续时间(秒)
        contentDuration: 0.8,     // 内容动画持续时间(秒)
        easing: "power3.out",     // 基础缓动函数
        contentInEasing: "power2.out",  // 内容淡入缓动
        contentOutEasing: "power1.in",  // 内容淡出缓动
        overlapDelay: 0.15,       // 重叠动画延迟
        stagger: 0.08             // 交错动画间隔
    },

    // 背景设置
    background: {
        height: "140%",           // 背景高度比例
        top: "-20%",              // 背景初始偏移量
        parallaxAmount: "30%",    // 背景视差移动量
        scale: {
            from: 1,              // 缩放起始值
            to: 1.1               // 缩放结束值
        }
    },

    // 内容动画设置
    content: {
        translateY: 60,           // Y轴位移像素值
        opacity: {
            out: 0,               // 淡出透明度
            in: 1                 // 淡入透明度
        },
        elementStagger: 0.05      // 内容元素交错动画间隔
    },

    // 滚动设置
    scroll: {
        wheelThreshold: 15,       // 滚轮触发阈值，降低以提高响应速度
        touchThreshold: 40,       // 触摸触发阈值，降低以提高响应速度
        debounceDelay: 700,       // 防抖延迟(毫秒)，降低以提高响应速度
        preventScroll: true       // 是否阻止默认滚动
    },
    
    // 向上和向下滚动的不同参数
    upDirection: {
        bgMovement: "-7%",        // 向上滚动时背景移动量
        bgScale: 1.08,            // 向上滚动时背景缩放
        contentMovement: -40      // 向上滚动时内容移动量
    },
    downDirection: {
        bgMovement: "7%",         // 向下滚动时背景移动量
        bgScale: 1.12,            // 向下滚动时背景缩放
        contentMovement: 40       // 向下滚动时内容移动量
    }
};

// 主函数 - 初始化高级视差滚动
function initParallaxDeluxe() {
    // 使用GSAP插件
    gsap.registerPlugin(ScrollTrigger);

    // DOM元素
    const sections = document.querySelectorAll('section');
    const totalSections = sections.length;
    
    // 状态变量
    let currentIndex = 0;
    let isAnimating = false;
    let lastTime = 0;
    const debounceTime = DELUXE_CONFIG.scroll.debounceDelay;
    
    console.log(`Parallax Deluxe: 初始化 ${totalSections} 个页面区块`);
    
    // 创建和准备视差元素
    prepareParallaxElements();
    
    // 设置初始状态
    setupInitialState();
    
    // 初始化导航状态
    updateNavigation(currentIndex);
    
    // 添加事件监听器
    setupEventListeners();
    
    /**
     * 创建和准备所有视差元素
     */
    function prepareParallaxElements() {
        console.log("准备视差元素...");
        
        // 清理可能存在的旧元素
        document.querySelectorAll('.parallax-bg, .parallax-overlay').forEach(el => el.remove());
        
        // 处理每个section
        sections.forEach((section, index) => {
            // 获取ID以确定背景图
            const sectionId = section.id;
            
            // 创建视差背景容器
            const bgContainer = document.createElement('div');
            bgContainer.className = 'parallax-bg-container';
            bgContainer.style.position = 'absolute';
            bgContainer.style.top = '0';
            bgContainer.style.left = '0';
            bgContainer.style.width = '100%';
            bgContainer.style.height = '100%';
            bgContainer.style.overflow = 'hidden';
            bgContainer.style.zIndex = '1';
            
            // 创建视差背景元素
            const bg = document.createElement('div');
            bg.className = 'parallax-bg';
            bg.style.position = 'absolute';
            bg.style.top = DELUXE_CONFIG.background.top;
            bg.style.left = '0';
            bg.style.width = '100%';
            bg.style.height = DELUXE_CONFIG.background.height;
            bg.style.zIndex = '1';
            bg.style.transformOrigin = 'center center';
            
            // 设置背景图
            switch (sectionId) {
                case 'home':
                    bg.style.backgroundImage = 'var(--bg-index)';
                    break;
                case 'circumstances':
                    bg.style.backgroundImage = 'var(--bg-circumstances)';
                    break;
                case 'chronology':
                    bg.style.backgroundImage = 'var(--bg-chronology)';
                    break;
                case 'accounting':
                    bg.style.backgroundImage = 'var(--bg-accounting)';
                    break;
                case 'compiled':
                    bg.style.backgroundImage = 'var(--bg-compiled)';
                    break;
                default:
                    console.warn(`未找到section "${sectionId}" 的背景图配置，使用默认黑色背景`);
                    bg.style.backgroundColor = '#000';
                    break;
            }
            
            // 完善背景样式
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
            bg.style.backgroundRepeat = 'no-repeat';
            bg.style.willChange = 'transform, opacity';
            
            // 创建叠加层(用于过渡效果)
            const overlay = document.createElement('div');
            overlay.className = 'parallax-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0)';
            overlay.style.zIndex = '3';
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            
            // 组装元素
            bgContainer.appendChild(bg);
            section.insertBefore(bgContainer, section.firstChild);
            section.appendChild(overlay);
            
            // 处理内容层
            const content = section.querySelector('.section-content');
            if (content) {
                content.style.position = 'relative';
                content.style.zIndex = '2';
                
                // 获取所有一级子元素
                const contentChildren = content.children;
                Array.from(contentChildren).forEach(child => {
                    child.classList.add('content-element');
                    child.style.willChange = 'transform, opacity';
                });
            }
            
            // 设置section整体样式
            section.style.position = 'absolute';
            section.style.top = '0';
            section.style.left = '0';
            section.style.width = '100%';
            section.style.height = '100vh';
            section.style.overflow = 'hidden';
            
            // 移除原背景
            section.style.background = 'none';
            
            console.log(`处理完成: Section "${sectionId}"`);
        });
    }
    
    /**
     * 设置初始状态
     */
    function setupInitialState() {
        console.log("设置初始状态...");
        
        // 设置当前section
        gsap.set(sections[currentIndex], {
            visibility: 'visible',
            zIndex: 2
        });
        
        // 隐藏其他sections
        sections.forEach((section, index) => {
            if (index !== currentIndex) {
                gsap.set(section, {
                    y: index < currentIndex ? '-100%' : '100%',
                    visibility: 'hidden',
                    zIndex: 1
                });
                
                // 隐藏内容
                const content = section.querySelector('.section-content');
                if (content) {
                    gsap.set(content, { opacity: 0 });
                }
            }
        });
        
        // 预加载下一个和上一个section
        preloadAdjacentSections();
    }
    
    /**
     * 预加载相邻sections
     */
    function preloadAdjacentSections() {
        // 预加载下一个section
        const nextIndex = (currentIndex + 1) % totalSections;
        const prevIndex = (currentIndex - 1 + totalSections) % totalSections;
        
        // 预加载下一个section
        gsap.set(sections[nextIndex], {
            y: '100%',
            visibility: 'hidden',
            zIndex: 0
        });
        
        // 预加载上一个section
        gsap.set(sections[prevIndex], {
            y: '-100%',
            visibility: 'hidden',
            zIndex: 0
        });
    }
    
    /**
     * 执行滚动切换动画
     * @param {number} targetIndex 目标section索引
     * @param {string} direction 滚动方向 ('up' 或 'down')
     */
    function animateScroll(targetIndex, direction) {
        if (isAnimating || targetIndex === currentIndex) return;
        
        isAnimating = true;
        const prevIndex = currentIndex;
        currentIndex = targetIndex;
        
        console.log(`滚动: ${direction}, 从 ${prevIndex} 到 ${currentIndex}`);
        
        // 获取当前和目标section
        const currentSection = sections[prevIndex];
        const targetSection = sections[targetIndex];
        
        // 获取相关元素
        const currentBg = currentSection.querySelector('.parallax-bg');
        const currentContent = currentSection.querySelector('.section-content');
        const currentOverlay = currentSection.querySelector('.parallax-overlay');
        
        const targetBg = targetSection.querySelector('.parallax-bg');
        const targetContent = targetSection.querySelector('.section-content');
        const targetOverlay = targetSection.querySelector('.parallax-overlay');
        
        // 根据滚动方向获取对应的参数
        const dirParams = direction === 'down' ? 
            DELUXE_CONFIG.downDirection : DELUXE_CONFIG.upDirection;
        
        // 确保目标section可见且位于正确的起始位置
        gsap.set(targetSection, {
            y: direction === 'down' ? '100%' : '-100%',
            visibility: 'visible',
            zIndex: 3
        });
        
        // 为内容动画准备元素
        const currentElements = currentContent ? Array.from(currentContent.querySelectorAll('.content-element')) : [];
        const targetElements = targetContent ? Array.from(targetContent.querySelectorAll('.content-element')) : [];
        
        // 重置目标内容初始状态
        gsap.set(targetContent, { opacity: 1 });
        gsap.set(targetElements, { 
            y: direction === 'down' ? dirParams.contentMovement : -dirParams.contentMovement,
            opacity: 0 
        });
        
        // 创建主时间轴
        const tl = gsap.timeline({
            defaults: { ease: DELUXE_CONFIG.animation.easing },
            onComplete: () => {
                isAnimating = false;
                
                // 重置当前section
                gsap.set(currentSection, {
                    visibility: 'hidden',
                    zIndex: 1
                });
                
                // 更新导航
                updateNavigation(currentIndex);
                
                // 预加载下一个可能的sections
                preloadAdjacentSections();
                
                console.log(`动画完成: 当前索引 ${currentIndex}`);
            }
        });
        
        // 1. 当前section的叠加层淡入
        tl.to(currentOverlay, {
            opacity: direction === 'down' ? 0.15 : 0.25,
            duration: DELUXE_CONFIG.animation.duration * 0.4
        }, 0);
        
        // 2. 当前section的内容淡出
        tl.to(currentElements, {
            y: direction === 'down' ? -30 : 30,
            opacity: 0,
            duration: DELUXE_CONFIG.animation.contentDuration * 0.8,
            stagger: DELUXE_CONFIG.content.elementStagger,
            ease: DELUXE_CONFIG.animation.contentOutEasing
        }, 0);
        
        // 3. 当前背景微小移动和缩放 - 方向特定效果
        tl.to(currentBg, {
            y: direction === 'down' ? '-10%' : '10%',
            scale: dirParams.bgScale,
            duration: DELUXE_CONFIG.animation.duration,
            ease: "power1.inOut"
        }, 0);
        
        // 4. 目标section滑入 - 方向特定效果
        tl.to(targetSection, {
            y: '0%',
            duration: DELUXE_CONFIG.animation.duration,
            ease: "power2.out"
        }, DELUXE_CONFIG.animation.overlapDelay);
        
        // 5. 目标内容元素逐个淡入 - 交错动画增强
        tl.to(targetElements, {
            y: 0,
            opacity: 1,
            duration: DELUXE_CONFIG.animation.contentDuration,
            stagger: {
                each: DELUXE_CONFIG.content.elementStagger,
                from: direction === 'down' ? "start" : "end",
                ease: DELUXE_CONFIG.animation.contentInEasing
            }
        }, DELUXE_CONFIG.animation.overlapDelay + DELUXE_CONFIG.animation.duration * 0.3);
        
        // 6. 目标背景从起始位置微调 - 方向特定效果
        tl.fromTo(targetBg, 
            {
                y: direction === 'down' ? '5%' : '-5%',
                scale: 1.1
            },
            {
                y: '0%',
                scale: 1,
                duration: DELUXE_CONFIG.animation.duration * 1.1,
                ease: "power1.out"
            }, 
            DELUXE_CONFIG.animation.overlapDelay
        );
        
        // 7. 目标叠加层淡出 - 方向特定效果
        tl.fromTo(targetOverlay,
            { opacity: direction === 'down' ? 0.2 : 0.35 },
            { opacity: 0, duration: DELUXE_CONFIG.animation.duration * 0.7 },
            DELUXE_CONFIG.animation.overlapDelay
        );
        
        // 8. 处理循环情况的特殊效果
        if ((targetIndex === 0 && prevIndex === totalSections - 1) || 
            (targetIndex === totalSections - 1 && prevIndex === 0)) {
            // 循环滚动时的特殊效果
            tl.to(targetBg, {
                scale: 1.05,
                duration: 0.4,
                yoyo: true,
                repeat: 1
            }, DELUXE_CONFIG.animation.overlapDelay + DELUXE_CONFIG.animation.duration * 0.5);
        }
    }
    
    /**
     * 更新导航状态
     * @param {number} activeIndex 当前活动section的索引
     */
    function updateNavigation(activeIndex) {
        // 获取当前section的ID
        const activeId = sections[activeIndex].id;
        
        // 更新导航项的active状态
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * 切换到指定索引的section
     * @param {number} index 目标索引
     */
    function goToSection(index) {
        // 确保索引有效
        if (index < 0) index = totalSections - 1;
        if (index >= totalSections) index = 0;
        
        // 确定滚动方向
        let direction;
        
        // 处理循环情况 - 增强对循环滚动的处理
        if (index === 0 && currentIndex === totalSections - 1) {
            // 从最后一个到第一个 - 视为向下滚动
            direction = 'down';
            console.log("循环：从最后到第一 - 向下滚动");
        } else if (index === totalSections - 1 && currentIndex === 0) {
            // 从第一个到最后一个 - 视为向上滚动
            direction = 'up';
            console.log("循环：从第一到最后 - 向上滚动");
        } else {
            // 常规判断
            direction = index > currentIndex ? 'down' : 'up';
        }
        
        // 执行动画
        animateScroll(index, direction);
    }
    
    /**
     * 设置所有事件监听器
     */
    function setupEventListeners() {
        // 鼠标滚轮事件
        window.addEventListener('wheel', (e) => {
            // 阻止默认滚动
            if (DELUXE_CONFIG.scroll.preventScroll) {
                e.preventDefault();
            }
            
            // 防抖处理
            const now = Date.now();
            if (now - lastTime < debounceTime) return;
            lastTime = now;
            
            // 检查滚动方向并执行动画
            if (Math.abs(e.deltaY) > DELUXE_CONFIG.scroll.wheelThreshold) {
                const direction = e.deltaY > 0 ? 'down' : 'up';
                const targetIndex = direction === 'down' 
                    ? (currentIndex + 1) % totalSections 
                    : (currentIndex - 1 + totalSections) % totalSections;
                
                goToSection(targetIndex);
                console.log(`滚轮滚动 ${direction}，切换到 section: ${targetIndex}`);
            }
        }, { passive: false }); // passive: false 允许我们阻止默认滚动
        
        // 触摸事件支持
        let touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        window.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaY) > DELUXE_CONFIG.scroll.touchThreshold) {
                const direction = deltaY < 0 ? 'down' : 'up';
                const targetIndex = direction === 'down' 
                    ? (currentIndex + 1) % totalSections 
                    : (currentIndex - 1 + totalSections) % totalSections;
                
                goToSection(targetIndex);
            }
        }, { passive: true });
        
        // 键盘导航
        window.addEventListener('keydown', (e) => {
            const now = Date.now();
            if (now - lastTime < debounceTime) return;
            lastTime = now;
            
            switch (e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    goToSection((currentIndex + 1) % totalSections);
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    goToSection((currentIndex - 1 + totalSections) % totalSections);
                    break;
            }
        });
        
        // 导航菜单点击
        document.querySelectorAll('.nav-list a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetIndex = Array.from(sections).findIndex(section => section.id === targetId);
                
                if (targetIndex !== -1 && targetIndex !== currentIndex) {
                    goToSection(targetIndex);
                }
            });
        });
        
        // Logo点击导航到首页
        const logoLink = document.querySelector('.logo-name a');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = logoLink.getAttribute('href').substring(1);
                const targetIndex = Array.from(sections).findIndex(section => section.id === targetId);
                
                if (targetIndex !== -1 && targetIndex !== currentIndex) {
                    goToSection(targetIndex);
                }
            });
        }
        
        // 窗口大小调整
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("窗口大小变化，调整布局");
                
                // 确保当前section正确显示
                sections.forEach((section, index) => {
                    if (index === currentIndex) {
                        gsap.set(section, {
                            y: '0%',
                            visibility: 'visible',
                            zIndex: 2
                        });
                    }
                });
            }, 200);
        });
    }
}

// 导出初始化函数，这样可以在HTML中使用
window.initParallaxDeluxe = initParallaxDeluxe; 