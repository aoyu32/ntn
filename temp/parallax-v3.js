// 视差滚动效果配置参数
const PARALLAX_CONFIG = {
    // 背景层参数
    background: {
        height: '130%',        // 背景高度比例（需要比100%大以提供视差移动空间）
        topOffset: '-20%',     // 背景顶部偏移量
        scrollDistance: '5%',  // 背景滚动时的移动距离
        duration: 1.2,         // 背景动画持续时间
        easing: 'power1.out'   // 背景动画缓动函数
    },

    // 内容层参数
    content: {
        moveDistance: 50,      // 内容移动距离（像素）
        duration: 0.8,         // 内容动画持续时间
        fadeInEasing: 'power2.out',  // 内容淡入缓动函数
        fadeOutEasing: 'power2.in',  // 内容淡出缓动函数
        delayIn: 0.25         // 内容淡入延迟时间
    },

    // 页面切换参数 - 新的覆盖效果
    transition: {
        // 当前section轻微移动参数
        currentSectionMove: '0%',     // 当前section不移动（修改为0%）
        currentSectionDuration: 0.4,   // 当前section轻微移动持续时间
        currentSectionEasing: 'power2.out', // 当前section轻微移动缓动函数

        // 下一个section覆盖参数
        nextSectionDuration: 1.0,      // 下一个section覆盖动画持续时间
        nextSectionEasing: 'power2.inOut', // 下一个section覆盖缓动函数
        nextSectionDelay: 0.2,         // 下一个section开始覆盖的延迟时间

        // 整体动画时长
        totalDuration: 1.2             // 整个切换动画的总时长
    },

    // 背景特殊位置参数（用于向上滚动时的起始位置）
    upScroll: {
        bgStartY: '0%',      // 向上滚动时背景起始Y位置（修改为0%，保持不动）
        bgDuration: 1.1        // 向上滚动时背景动画持续时间
    }
};

// 创建一个可导出的初始化函数
function initParallax() {
    // 注册GSAP插件
    gsap.registerPlugin(ScrollTrigger);

    // 获取所有section
    const sections = document.querySelectorAll('section');
    // 当前活动section的索引
    let currentSection = 0;
    // 是否正在滚动中（防止连续触发）
    let isScrolling = false;
    // 总section数量
    const totalSections = sections.length;

    console.log("初始化视差滚动，发现", totalSections, "个sections");

    // 移除之前可能存在的section-bg元素
    document.querySelectorAll('.section-bg').forEach(el => el.remove());

    // 为每个section设置背景和内容
    sections.forEach((section, index) => {
        // 创建背景层以实现视差效果
        const bg = document.createElement('div');
        bg.className = 'section-bg';
        bg.style.position = 'absolute';
        bg.style.top = PARALLAX_CONFIG.background.topOffset;
        bg.style.left = '0';
        bg.style.width = '100%';
        bg.style.height = PARALLAX_CONFIG.background.height;

        const sectionId = section.id;
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
                console.warn(`未找到section "${sectionId}" 的背景图配置`);
                // 设置一个默认的黑色背景，确保即使没有找到合适的背景图也能全屏覆盖
                bg.style.backgroundColor = '#000';
                break;
        }

        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
        bg.style.backgroundRepeat = 'no-repeat';
        bg.style.zIndex = '1';
        bg.style.willChange = 'transform';

        // 确保section自身也有背景色，以防视差效果时出现间隙
        section.style.backgroundColor = '#000';

        section.appendChild(bg);

        // 移除section原有的背景，改为在背景层上显示
        section.style.background = 'none';

        // 提高内容层级，确保在背景之上
        const content = section.querySelector('.section-content');
        if (content) {
            content.style.zIndex = '2';
            content.style.position = 'relative';
        }

        // 初始化位置，只有第一个section显示，其他都隐藏在视口外
        if (index !== 0) {
            // 设置非首屏section的初始位置在屏幕下方
            gsap.set(section, { y: '100%', visibility: 'hidden' });
            if (content) {
                gsap.set(content, { opacity: 0 });
            }
        } else {
            // 确保第一个section可见
            gsap.set(section, { y: '0%', visibility: 'visible' });
            if (content) {
                gsap.set(content, { opacity: 1, y: 0 });
            }
        }

        // 输出日志确认背景已设置
        console.log(`为section "${sectionId}" 设置背景：`, bg.style.backgroundImage);
    });

    // 准备当前section之外的所有sections
    function prepareOtherSections() {
        sections.forEach((section, index) => {
            if (index !== currentSection) {
                // 重置所有非当前section的位置，为动画做准备
                if (index < currentSection) {
                    // 如果section索引小于当前索引，放置在上方（为向上滚动准备）
                    gsap.set(section, { y: '-100%', visibility: 'hidden' });
                } else {
                    // 如果section索引大于当前索引，放置在下方（为向下滚动准备）
                    gsap.set(section, { y: '100%', visibility: 'hidden' });
                }
                
                // 确保背景和内容元素准备就绪
                const bg = section.querySelector('.section-bg');
                const content = section.querySelector('.section-content');
                
                if (bg) {
                    gsap.set(bg, { y: '0%' });
                }
                
                if (content) {
                    if (index < currentSection) {
                        // 为向上滚动准备的内容初始位置
                        gsap.set(content, { y: -PARALLAX_CONFIG.content.moveDistance, opacity: 0 });
                    } else {
                        // 为向下滚动准备的内容初始位置
                        gsap.set(content, { y: PARALLAX_CONFIG.content.moveDistance, opacity: 0 });
                    }
                }
            }
        });
        
        console.log("已重置其他sections的位置");
    }

    // 增强视差效果的滚动函数
    function goToSection(index, direction) {
        // 检查是否正在滚动中或越界
        if (index < 0 || index >= totalSections || isScrolling) return;

        console.log(`滚动方向: ${direction}, 从section ${currentSection} 到 ${index}`);
        
        isScrolling = true;
        const prevIndex = currentSection;
        currentSection = index;

        // 更新导航项的active状态
        updateActiveNavItem();

        // 当前section和目标section
        const prevSection = sections[prevIndex];
        const nextSection = sections[currentSection];
        const prevContent = prevSection.querySelector('.section-content');
        const nextContent = nextSection.querySelector('.section-content');
        const prevBg = prevSection.querySelector('.section-bg');
        const nextBg = nextSection.querySelector('.section-bg');

        // 创建动画时间轴
        const tl = gsap.timeline({
            onComplete: () => {
                isScrolling = false;
                // 动画完成后重新准备其他sections，确保下一次滚动正常
                prepareOtherSections();
            }
        });

        if (direction === 'down') {
            // 阶段1：当前section不移动，背景也不移动
            tl.to(prevSection, {
                y: '0%', // 保持当前section位置不变
                duration: PARALLAX_CONFIG.transition.currentSectionDuration,
                ease: PARALLAX_CONFIG.transition.currentSectionEasing
            }, 0);

            // 阶段1：当前section背景保持不动
            tl.to(prevBg, {
                y: '0%', // 背景不移动
                duration: PARALLAX_CONFIG.background.duration,
                ease: PARALLAX_CONFIG.background.easing
            }, 0);

            // 阶段1：当前section内容淡出
            tl.to(prevContent, {
                y: -PARALLAX_CONFIG.content.moveDistance / 2, // 减少内容向上移动的距离
                opacity: 0,
                duration: PARALLAX_CONFIG.content.duration,
                ease: PARALLAX_CONFIG.content.fadeOutEasing
            }, 0);

            // 准备下一个section的初始位置
            gsap.set(nextSection, { y: '100%', visibility: 'visible' });
            gsap.set(nextBg, { y: '0%' });
            gsap.set(nextContent, { y: PARALLAX_CONFIG.content.moveDistance, opacity: 0 });

            // 阶段2：下一个section从下方覆盖当前section
            tl.to(nextSection, {
                y: '0%',
                duration: PARALLAX_CONFIG.transition.nextSectionDuration,
                ease: PARALLAX_CONFIG.transition.nextSectionEasing
            }, PARALLAX_CONFIG.transition.nextSectionDelay);

            // 阶段2：下一个section的背景保持固定位置
            tl.to(nextBg, {
                y: '0%',
                duration: PARALLAX_CONFIG.transition.nextSectionDuration,
                ease: PARALLAX_CONFIG.transition.nextSectionEasing
            }, PARALLAX_CONFIG.transition.nextSectionDelay);

            // 阶段2：下一个section的内容淡入
            tl.to(nextContent,
                {
                    y: 0,
                    opacity: 1,
                    duration: PARALLAX_CONFIG.content.duration,
                    ease: PARALLAX_CONFIG.content.fadeInEasing
                },
                PARALLAX_CONFIG.transition.nextSectionDelay + PARALLAX_CONFIG.content.delayIn
            );

        } else { // 向上滚动
            // 阶段1：当前section不移动，背景也不移动
            tl.to(prevSection, {
                y: '0%', // 保持当前section位置不变
                duration: PARALLAX_CONFIG.transition.currentSectionDuration,
                ease: PARALLAX_CONFIG.transition.currentSectionEasing
            }, 0);

            // 阶段1：当前section背景保持不动
            tl.to(prevBg, {
                y: '0%', // 背景不移动
                duration: PARALLAX_CONFIG.background.duration,
                ease: PARALLAX_CONFIG.background.easing
            }, 0);

            // 阶段1：当前section内容淡出
            tl.to(prevContent, {
                y: PARALLAX_CONFIG.content.moveDistance / 2, // 减少内容向下移动的距离
                opacity: 0,
                duration: PARALLAX_CONFIG.content.duration,
                ease: PARALLAX_CONFIG.content.fadeOutEasing
            }, 0);
            
            // 重要：必须先重置位置，然后在动画中使用，否则动画不会正确执行
            gsap.set(nextSection, { y: '-100%', visibility: 'visible' });
            gsap.set(nextBg, { y: '0%' });
            gsap.set(nextContent, { y: -PARALLAX_CONFIG.content.moveDistance, opacity: 0 });

            // 阶段2：上一个section从上方覆盖当前section
            tl.to(nextSection, {
                y: '0%',
                duration: PARALLAX_CONFIG.transition.nextSectionDuration,
                ease: PARALLAX_CONFIG.transition.nextSectionEasing
            }, PARALLAX_CONFIG.transition.nextSectionDelay);

            // 阶段2：上一个section的背景保持固定位置
            tl.to(nextBg, {
                y: '0%',
                duration: PARALLAX_CONFIG.transition.nextSectionDuration,
                ease: PARALLAX_CONFIG.transition.nextSectionEasing
            }, PARALLAX_CONFIG.transition.nextSectionDelay);

            // 阶段2：上一个section的内容淡入
            tl.to(nextContent,
                {
                    y: 0,
                    opacity: 1,
                    duration: PARALLAX_CONFIG.content.duration,
                    ease: PARALLAX_CONFIG.content.fadeInEasing
                },
                PARALLAX_CONFIG.transition.nextSectionDelay + PARALLAX_CONFIG.content.delayIn
            );
        }
    }

    // 更新导航项的active状态
    function updateActiveNavItem() {
        // 获取当前section的id
        const currentSectionId = sections[currentSection].id;

        // 移除所有导航项的active类
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.classList.remove('active');
        });

        // 为当前section对应的导航项添加active类
        const activeNavLink = document.querySelector(`.nav-list a[href="#${currentSectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        console.log(`当前section: ${currentSectionId}, 已更新导航active状态`);
    }

    // 初始化时设置第一个导航项为active
    updateActiveNavItem();
    
    // 初始化其他sections的位置，为后续滚动做准备
    prepareOtherSections();

    // 监听滚轮事件
    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;

        if (e.deltaY > 0) {
            // 向下滚动
            if (currentSection < totalSections - 1) {
                // 正常向下滚动到下一个section
                goToSection(currentSection + 1, 'down');
            } else {
                // 已经是最后一个section，回到第一个section
                goToSection(0, 'down');
                console.log("已到达最后一个section，循环回到第一个section");
            }
        } else {
            // 向上滚动
            if (currentSection > 0) {
                // 正常向上滚动到上一个section
                goToSection(currentSection - 1, 'up');
            } else {
                // 已经是第一个section，跳转到最后一个section
                goToSection(totalSections - 1, 'up');
                console.log("已到达第一个section，循环到最后一个section");
            }
        }
    });

    // 监听键盘上下键
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            // 向下滚动
            if (currentSection < totalSections - 1) {
                // 正常向下到下一个section
                goToSection(currentSection + 1, 'down');
            } else {
                // 已经是最后一个section，回到第一个section
                goToSection(0, 'down');
                console.log("已到达最后一个section，循环回到第一个section");
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            // 向上滚动
            if (currentSection > 0) {
                // 正常向上到上一个section
                goToSection(currentSection - 1, 'up');
            } else {
                // 已经是第一个section，跳转到最后一个section
                goToSection(totalSections - 1, 'up');
                console.log("已到达第一个section，循环到最后一个section");
            }
        }
    });

    // 设置导航点击事件
    document.querySelectorAll('.nav-list a').forEach((link) => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // 找到目标section的索引
            const targetIndex = Array.from(sections).findIndex(section => section.id === targetId);
            if (targetIndex !== -1 && targetIndex !== currentSection) {
                // 确定方向
                const direction = targetIndex > currentSection ? 'down' : 'up';
                goToSection(targetIndex, direction);
            }
        });
    });

    // 设置logo-name点击事件，滚动到#home
    const logoLink = document.querySelector('.logo-name a');
    if (logoLink) {
        logoLink.addEventListener('click', e => {
            e.preventDefault();

            // home section的索引应该是0，但为了确保正确，我们还是通过id查找
            const homeId = logoLink.getAttribute('href').substring(1);
            const homeIndex = Array.from(sections).findIndex(section => section.id === homeId);

            if (homeIndex !== -1 && homeIndex !== currentSection) {
                // 确定方向
                const direction = homeIndex > currentSection ? 'down' : 'up';
                goToSection(homeIndex, direction);
                console.log("点击logo，滚动到首页");
            }
        });
    } else {
        console.warn("未找到logo-name中的a标签");
    }

    // 添加触摸滑动支持
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (isScrolling) return;

        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;

        // 检测是否是有效的滑动
        if (Math.abs(deltaY) > 50) {
            if (deltaY < 0) {
                // 手指向上滑动（屏幕内容向下滚动），切换到下一页
                if (currentSection < totalSections - 1) {
                    // 正常向下到下一个section
                    goToSection(currentSection + 1, 'down');
                } else {
                    // 已经是最后一个section，回到第一个section
                    goToSection(0, 'down');
                    console.log("已到达最后一个section，循环回到第一个section");
                }
            } else {
                // 手指向下滑动（屏幕内容向上滚动），切换到上一页
                if (currentSection > 0) {
                    // 正常向上到上一个section
                    goToSection(currentSection - 1, 'up');
                } else {
                    // 已经是第一个section，跳转到最后一个section
                    goToSection(totalSections - 1, 'up');
                    console.log("已到达第一个section，循环到最后一个section");
                }
            }
        }
    }, { passive: true });

    // 添加窗口大小变化监听器，确保在窗口大小变化时能够正确适应视口
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // 使用防抖技术减少resize事件的频繁触发
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("窗口大小变化，重新调整视差效果");
            // 调整所有section和背景的大小
            sections.forEach((section, index) => {
                // 确保section占满视口高度
                section.style.height = '100vh';

                // 调整背景大小，确保没有间隙
                const bg = section.querySelector('.section-bg');
                if (bg) {
                    bg.style.height = PARALLAX_CONFIG.background.height;
                    bg.style.top = PARALLAX_CONFIG.background.topOffset;
                }
            });
        }, 200); // 200ms的延迟
    });
}

// 导出初始化函数，这样可以在Vue组件中使用
window.initParallax = initParallax;