// 视差滚动效果配置参数
const PARALLAX_CONFIG = {
    // 背景层参数
    background: {
        height: '130%',        // 背景高度比例（需要比100%大以提供视差移动空间）
        topOffset: '-10%',     // 背景顶部偏移量
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

    // 页面切换参数
    transition: {
        duration: 0.8,         // 页面切换动画持续时间
        easing: 'power2.inOut', // 页面切换缓动函数
        sectionDuration: 0.7,   // section移动持续时间
        sectionEasing: 'power2.inOut' // section移动缓动函数
    },

    // 背景特殊位置参数（用于向上滚动时的起始位置）
    upScroll: {
        bgStartY: '-20%',      // 向上滚动时背景起始Y位置
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

        // 初始化位置，除了第一个section外，其他都放在下面
        if (index !== 0) {
            gsap.set(section, { y: '100%' });
        }

        // 输出日志确认背景已设置
        console.log(`为section "${sectionId}" 设置背景：`, bg.style.backgroundImage);
    });

    // 增强视差效果的滚动函数
    function goToSection(index, direction) {
        // 检查是否正在滚动中或越界
        if (index < 0 || index >= totalSections || isScrolling) return;

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
            }
        });

        if (direction === 'down') {
            // 当前section的背景移动
            tl.to(prevBg, {
                y: `-${PARALLAX_CONFIG.background.scrollDistance}`,
                duration: PARALLAX_CONFIG.background.duration,
                ease: PARALLAX_CONFIG.background.easing
            }, 0);

            // 当前section移动
            tl.to(prevSection, {
                y: '-100%',
                duration: PARALLAX_CONFIG.transition.duration,
                ease: PARALLAX_CONFIG.transition.easing
            }, 0);

            // 当前section内容移动
            tl.to(prevContent, {
                y: -PARALLAX_CONFIG.content.moveDistance,
                opacity: 0,
                duration: PARALLAX_CONFIG.content.duration,
                ease: PARALLAX_CONFIG.content.fadeOutEasing
            }, 0);

            // 下一个section进入
            tl.fromTo(nextSection,
                { y: '100%' },
                {
                    y: '0%',
                    duration: PARALLAX_CONFIG.transition.sectionDuration,
                    ease: PARALLAX_CONFIG.transition.sectionEasing
                },
                0
            );

            // 下一个section背景进入
            tl.fromTo(nextBg,
                { y: '0%' },
                {
                    y: '0%',
                    duration: PARALLAX_CONFIG.upScroll.bgDuration,
                    ease: 'power1.inOut'
                },
                0
            );

            // 下一个section内容进入
            tl.fromTo(nextContent,
                { y: PARALLAX_CONFIG.content.moveDistance, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: PARALLAX_CONFIG.content.duration,
                    ease: PARALLAX_CONFIG.content.fadeInEasing
                },
                PARALLAX_CONFIG.content.delayIn
            );
        } else { // 向上滚动
            // 当前section的背景移动
            tl.to(prevBg, {
                y: PARALLAX_CONFIG.background.scrollDistance,
                duration: PARALLAX_CONFIG.background.duration,
                ease: PARALLAX_CONFIG.background.easing
            }, 0);

            // 当前section移动
            tl.to(prevSection, {
                y: '100%',
                duration: PARALLAX_CONFIG.transition.duration,
                ease: PARALLAX_CONFIG.transition.easing
            }, 0);

            // 当前section内容移动
            tl.to(prevContent, {
                y: PARALLAX_CONFIG.content.moveDistance,
                opacity: 0,
                duration: PARALLAX_CONFIG.content.duration,
                ease: PARALLAX_CONFIG.content.fadeOutEasing
            }, 0);

            // 上一个section进入
            tl.fromTo(nextSection,
                { y: '-100%' },
                {
                    y: '0%',
                    duration: PARALLAX_CONFIG.transition.sectionDuration,
                    ease: PARALLAX_CONFIG.transition.sectionEasing
                },
                0
            );

            // 上一个section背景进入
            tl.fromTo(nextBg,
                { y: PARALLAX_CONFIG.upScroll.bgStartY },
                {
                    y: '0',
                    duration: PARALLAX_CONFIG.upScroll.bgDuration,
                    ease: 'power1.inOut'
                },
                0
            );

            // 上一个section内容进入
            tl.fromTo(nextContent,
                { y: -PARALLAX_CONFIG.content.moveDistance, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: PARALLAX_CONFIG.content.duration,
                    ease: PARALLAX_CONFIG.content.fadeInEasing
                },
                PARALLAX_CONFIG.content.delayIn
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
                // 向上滑动，切换到下一页
                if (currentSection < totalSections - 1) {
                    // 正常向下到下一个section
                    goToSection(currentSection + 1, 'down');
                } else {
                    // 已经是最后一个section，回到第一个section
                    goToSection(0, 'down');
                    console.log("已到达最后一个section，循环回到第一个section");
                }
            } else {
                // 向下滑动，切换到上一页
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