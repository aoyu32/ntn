/**
 * chronology-animations.js
 * 
 * 此文件管理编年史(chronology)部分内容的入场和退场动画
 * 使用GSAP动画库实现，为每个编年史部分的wrapper-left和
 * wrapper-right元素提供可配置的动画效果。
 */

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

// 动画配置 - 可以自定义不同效果
const animConfig = {
    // 默认动画持续时间
    duration: {
        enter: 1.2,    // 入场动画持续时间(秒)，值越大动画越慢
        exit: 0.8,     // 退场动画持续时间(秒)，值越大动画越慢
        textExit: 0.5, // 文本退场动画持续时间(秒)，比普通退场更快
        stagger: 0.15, // 元素之间的错开时间(秒)，控制文本和图片动画的时间差
        delay: 0.2     // 动画延迟开始时间(秒)
    },

    // 默认动画移动距离
    distance: {
        x: 150,       // X轴方向移动距离(像素)，正值向右，负值向左
        y: 120,       // Y轴方向移动距离(像素)，正值向下，负值向上
        rotation: 5   // 旋转角度(度)，正值顺时针，负值逆时针
    },

    // 默认缓动函数
    ease: {
        enter: "power3.out", // 入场动画缓动效果，可选值如："power1.out", "back.out", "elastic.out", "bounce.out"等
        exit: "power2.in"    // 退场动画缓动效果，可选值如："power1.in", "back.in", "elastic.in", "bounce.in"等
    },

    // 不同部分的动画变体
    variations: {
        // 每个部分可以有自定义的动画参数
        // 格式: 'section-id': { left: {...}, right: {...} }
        // 每个部分都有：
        //   - left/right: 左侧/右侧内容的动画配置
        //   - enterFrom: 入场动画的起始状态 (元素从这个状态动画到正常显示状态)
        //   - exitTo: 退场动画的结束状态 (元素从正常显示状态动画到这个状态)
        // 
        // 可配置的动画参数包括:
        // x: X轴位移(像素)，正值向右，负值向左
        // y: Y轴位移(像素)，正值向下，负值向上
        // opacity: 透明度，0完全透明，1完全不透明
        // rotation: 旋转角度(度)，正值顺时针，负值逆时针
        // scale: 缩放比例，1为原始大小，小于1缩小，大于1放大
        'chronology-bydch': {
            left: {
                enterFrom: { x: 0, y: 400, opacity: 1, rotation: 0 }, // 左侧文本从更远下方视口外向上移动，不带透明度过渡
                exitTo: { x: 0, y: 400, opacity: 1, rotation: 0 }     // 左侧文本向下方视口外滑出（与入场方向相同），不带透明度过渡
            },
            right: {
                enterFrom: { x: 1200, y: 0, opacity: 1, rotation: 0 },  // 右侧图片从更远右侧视口外向左移动，不带透明度过渡
                exitTo: { x: 1200, y: 0, opacity: 1, rotation: 0 }      // 右侧图片向右侧视口外滑出（与入场方向相同），不带透明度过渡
            }
        },
        'chronology-cdz': {
            left: {
                // 不再为整个left设置统一动画，将分别为图片和文本设置
                enterFrom: {},
                exitTo: {}
            },
            right: {
                enterFrom: { x: 0, y: 120, opacity: 0, rotation: 0, scale: 0.9 }, // 右侧内容从下方滑入，同时缩小
                exitTo: { x: 0, y: 120, opacity: 0, rotation: 0 }                // 右侧内容向下方滑出
            }
        },
        'chronology-hl': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 },     // 左侧内容从左下方滑入，带轻微逆时针旋转
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }         // 左侧内容向左下方滑出（与入场方向相同）
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 },        // 右侧内容不再使用默认动画，将在playEntranceAnimation中特殊处理
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }            // 右侧内容不再使用默认动画，将在playExitAnimation中特殊处理
            }
        },
        'chronology-dm': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 0, scale: 0.7 },
                exitTo: { x: 0, y: 0, opacity: 0, scale: 0.7 }
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-qcsc': {
            left: {
                enterFrom: { x: -120, y: 80, opacity: 0, rotation: 0 },
                exitTo: { x: -120, y: 80, opacity: 0, rotation: 0 }
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-sjb': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 }, // 修改为从小到大缩放
                exitTo: { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 }     // 退场时缩小到消失
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-mnhcz': {
            left: {
                enterFrom: { x: -120, y: -100, opacity: 0, rotation: -2 },
                exitTo: { x: -120, y: -100, opacity: 0, rotation: -2 }
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-xylqyys': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 }, // 修改为从小到大缩放
                exitTo: { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 }     // 退场时缩小到消失
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-omwyh': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        },
        'chronology-ydl': {
            left: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            },
            right: {
                enterFrom: { x: 0, y: 0, opacity: 1, rotation: 0 }, // 修改为默认值，将在特殊处理中设置
                exitTo: { x: 0, y: 0, opacity: 1, rotation: 0 }     // 修改为默认值，将在特殊处理中设置
            }
        }
    }
};

/**
 * ChronologyAnimations类用于管理所有编年史部分的动画效果
 */
class ChronologyAnimations {
    constructor(config = {}) {
        // 将默认配置与提供的配置合并
        this.config = { ...animConfig, ...config };
        this.initialized = false;
        this.activeSection = null;
        this.animations = {};
        this.sectionChangeDelay = 0.1; // section切换后延迟执行动画的时间(秒)

        // 当DOM准备就绪时初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * 初始化动画
     */
    init() {
        if (this.initialized) return;

        // 获取所有编年史部分
        this.sections = document.querySelectorAll('section.chronology');

        if (!this.sections.length) {
            console.warn('未找到编年史部分');
            return;
        }

        // 为所有部分设置初始状态
        this.setupInitialStates();

        // 监听来自主视差系统的部分切换事件
        window.addEventListener('sectionChange', this.handleSectionChange.bind(this));

        // 标记为已初始化
        this.initialized = true;
        console.log('编年史动画已初始化');

        // 如果有可见部分，设置初始部分
        const visibleSection = Array.from(this.sections).find(
            section => section.style.visibility !== 'hidden'
        );

        if (visibleSection) {
            this.playEntranceAnimation(visibleSection.id);
        }
    }

    /**
     * 为所有部分设置初始状态
     */
    setupInitialStates() {
        this.sections.forEach(section => {
            const sectionId = section.id;
            const wrapperLeft = section.querySelector('.wrapper-left');
            const wrapperRight = section.querySelector('.wrapper-right');

            // 如果部分没有所需元素，则跳过
            if (!wrapperLeft && !wrapperRight) return;

            // 获取此部分的变体配置
            const variation = this.config.variations[sectionId] || {
                left: { enterFrom: { x: -50, opacity: 0 }, exitTo: { x: -30, opacity: 0 } },
                right: { enterFrom: { x: 50, opacity: 0 }, exitTo: { x: 30, opacity: 0 } }
            };

            // 特殊处理 chronology-cdz 部分
            if (sectionId === 'chronology-cdz') {
                if (wrapperLeft) {
                    const leftText = wrapperLeft.querySelector('.text');
                    const leftImage = wrapperLeft.querySelector('img') ||
                        wrapperLeft.querySelector('.cards') ||
                        wrapperLeft.querySelector('div:not(.text)');

                    // 文本从下方进入
                    if (leftImage) gsap.set(leftText, { y: 1000, opacity: 1 });

                    // 图片从上方进入
                    if (leftText) gsap.set(leftImage, { y: -1000, opacity: 1 });
                }

                if (wrapperRight) {
                    const rightElements = wrapperRight.querySelectorAll('*');
                    if (rightElements.length) {
                        gsap.set(rightElements, { ...variation.right.enterFrom });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-hl 部分
            if (sectionId === 'chronology-hl') {
                if (wrapperRight) {
                    const rightText = wrapperRight.querySelector('.text');
                    const leftImage = wrapperLeft.querySelector('img');

                    if (leftImage) {
                        gsap.set(leftImage, {
                            opacity: 1,
                            x: -1200,
                            y: 0,
                        });
                    }

                    if (rightText) {
                        gsap.set(rightText, {
                            opacity: 1,
                            x: 1200,
                            y: 0
                        });
                    }
                }

                // if (wrapperLeft) {
                //     const leftElements = wrapperLeft.querySelectorAll('*');
                //     if (leftElements.length) {
                //         gsap.set(leftElements, { ...variation.left.enterFrom });
                //     }
                // }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-dm 部分
            if (sectionId === 'chronology-dm') {
                if (wrapperRight) {
                    const rightText = wrapperRight.querySelector('.text');
                    const rightImage = wrapperRight.querySelector('img') ||
                        wrapperRight.querySelector('.foreground') ||
                        wrapperRight.querySelector('div:not(.text)');

                    // 设置图片的初始状态：从下方进入，完全在视口外
                    if (rightImage) {
                        gsap.set(rightImage, {
                            opacity: 1,
                            y: 1200,  // 更大的y轴偏移，确保完全在视口外
                            x: 0
                        });
                    }

                    // 设置文本的初始状态：从右侧进入，完全在视口外
                    if (rightText) {
                        gsap.set(rightText, {
                            opacity: 1,
                            x: 1200,  // 更大的x轴偏移，确保完全在视口外
                            y: 0
                        });
                    }
                }

                if (wrapperLeft) {
                    const leftElements = wrapperLeft.querySelectorAll('*');
                    if (leftElements.length) {
                        gsap.set(leftElements, { ...variation.left.enterFrom });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-qcsc 部分
            if (sectionId === 'chronology-qcsc') {
                const leftText = wrapperLeft.querySelector('.text');
                const rightImage = wrapperRight.querySelector('img') ||
                    wrapperRight.querySelector('.foreground') ||
                    wrapperRight.querySelector('div:not(.text)');

                // 设置图片的初始状态：从右侧视口外进入
                if (rightImage) {
                    gsap.set(rightImage, {
                        opacity: 1,
                        x: 1200,  // 增加位移距离，确保完全在视口外
                        y: 0
                    });
                }

                // 设置文本的初始状态：从右侧视口外进入
                if (leftText) {
                    gsap.set(leftText, {
                        opacity: 1,
                        x: -1200,  // 增加位移距离，确保完全在视口外
                        y: 0
                    });
                }

                // if (wrapperLeft) {
                //     const leftElements = wrapperLeft.querySelectorAll('*');
                //     if (leftElements.length) {
                //         gsap.set(leftElements, { ...variation.left.enterFrom });
                //     }
                // }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-sjb 部分
            if (sectionId === 'chronology-sjb') {
                if (wrapperLeft) {
                    const leftImage = wrapperLeft.querySelector('img') ||
                        wrapperLeft.querySelector('.foreground') ||
                        wrapperLeft.querySelector('div:not(.text)');

                    // 设置图片的初始状态：从小到大缩放
                    if (leftImage) {
                        gsap.set(leftImage, {
                            opacity: 1,
                            x: -1500,
                            y: 0,  // 初始状态为很小的尺寸
                            transformOrigin: "center center" // 从中心点缩放
                        });
                    }
                }

                if (wrapperRight) {
                    const rightText = wrapperRight.querySelector('.text');

                    // 设置文本的初始状态：从右侧视口外进入
                    if (rightText) {
                        gsap.set(rightText, {
                            opacity: 1,
                            x: 1500,  // 从右侧视口外开始
                            y: 0
                        });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-mnhcz 部分
            if (sectionId === 'chronology-mnhcz') {
                const leftText = wrapperLeft.querySelector('.text');
                const rightImage = wrapperRight.querySelector('img') ||
                    wrapperRight.querySelector('.foreground') ||
                    wrapperRight.querySelector('div:not(.text)');

                // 设置图片的初始状态：从右侧视口外进入
                if (rightImage) {
                    gsap.set(rightImage, {
                        opacity: 1,
                        x: 1200,  // 从右侧视口外开始
                        y: 0
                    });
                }

                // 设置文本的初始状态：从右侧视口外进入
                if (leftText) {
                    gsap.set(leftText, {
                        opacity: 1,
                        x: -1200,  // 从右侧视口外开始
                        y: 0
                    });
                }

                // if (wrapperLeft) {
                //     const leftElements = wrapperLeft.querySelectorAll('*');
                //     if (leftElements.length) {
                //         gsap.set(leftElements, { ...variation.left.enterFrom });
                //     }
                // }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-xylqyys 部分
            if (sectionId === 'chronology-xylqyys') {
                if (wrapperLeft) {
                    const leftImage = wrapperLeft.querySelector('img') ||
                        wrapperLeft.querySelector('.foreground') ||
                        wrapperLeft.querySelector('div:not(.text)');

                    // 设置图片的初始状态：从左下角缩放
                    if (leftImage) {
                        gsap.set(leftImage, {
                            opacity: 1,
                            scale: 0,  // 初始状态为完全缩小
                            transformOrigin: "left bottom" // 从左下角缩放
                        });
                    }
                }

                if (wrapperRight) {
                    const rightText = wrapperRight.querySelector('.text');

                    // 设置文本的初始状态：从右侧视口外进入
                    if (rightText) {
                        gsap.set(rightText, {
                            opacity: 1,
                            x: 1000,  // 从右侧视口外开始
                            y: 0
                        });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-omwyh 部分
            if (sectionId === 'chronology-omwyh') {
                if (wrapperLeft) {
                    const leftImage = wrapperLeft.querySelector('img') ||
                        wrapperLeft.querySelector('.foreground') ||
                        wrapperLeft.querySelector('div:not(.text)');

                    // 设置图片的初始状态：从下方视口外进入
                    if (leftImage) {
                        gsap.set(leftImage, {
                            opacity: 1,
                            y: 800,  // 从下方视口外开始
                            x: 0
                        });
                    }
                }

                if (wrapperRight) {
                    const rightText = wrapperRight.querySelector('.text');

                    // 设置文本的初始状态：从右侧视口外进入
                    if (rightText) {
                        gsap.set(rightText, {
                            opacity: 1,
                            x: 1000,  // 从右侧视口外开始
                            y: 0
                        });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 特殊处理 chronology-ydl 部分
            if (sectionId === 'chronology-ydl') {
                if (wrapperLeft) {
                    const leftText = wrapperLeft.querySelector('.text');

                    // 设置文本的初始状态：从左侧视口外进入
                    if (leftText) {
                        gsap.set(leftText, {
                            opacity: 1,
                            x: -900,  // 从左侧视口外开始
                            y: 0
                        });
                    }
                }

                if (wrapperRight) {
                    const rightImage = wrapperRight.querySelector('img') ||
                        wrapperRight.querySelector('.foreground') ||
                        wrapperRight.querySelector('div:not(.text)');

                    // 设置图片的初始状态：从右侧视口外进入
                    if (rightImage) {
                        gsap.set(rightImage, {
                            opacity: 1,
                            x: 1000,  // 从右侧视口外开始
                            y: 0
                        });
                    }
                }

                return; // 提前返回，跳过通用逻辑
            }

            // 其他部分的通用设置
            // 设置左侧包装内容的初始状态
            if (wrapperLeft) {
                const leftText = wrapperLeft.querySelector('.text');
                const leftImage = wrapperLeft.querySelector('img') ||
                    wrapperLeft.querySelector('.cards') ||
                    wrapperLeft.querySelector('div:not(.text)');

                if (leftText) gsap.set(leftText, { ...variation.left.enterFrom });
                if (leftImage) gsap.set(leftImage, {
                    ...variation.left.enterFrom,
                    delay: 0.1 // 相比文本，图片有轻微延迟
                });
            }

            // 设置右侧包装内容的初始状态
            if (wrapperRight) {
                const rightText = wrapperRight.querySelector('.text');
                const rightImage = wrapperRight.querySelector('img') ||
                    wrapperRight.querySelector('.foreground') ||
                    wrapperRight.querySelector('div:not(.text)');

                if (rightText) gsap.set(rightText, { ...variation.right.enterFrom });
                if (rightImage) gsap.set(rightImage, {
                    ...variation.right.enterFrom,
                    delay: 0.1 // 相比文本，图片有轻微延迟
                });
            }
        });
    }

    /**
     * 处理部分切换事件
     * @param {Event} event - 部分切换事件
     */
    handleSectionChange(event) {
        const { prevSection, currentSection } = event.detail || {};

        if (prevSection && prevSection.classList.contains('chronology')) {
            // 确保先执行退场动画
            this.playExitAnimation(prevSection.id);
        }

        if (currentSection && currentSection.classList.contains('chronology')) {
            // 在退场动画完成后执行入场动画，增加延迟确保滚动完成
            setTimeout(() => {
                this.playEntranceAnimation(currentSection.id);
            }, this.sectionChangeDelay * 1000); // 将秒转换为毫秒
        }
    }

    /**
     * 播放部分的入场动画
     * @param {string} sectionId - 要动画的部分ID
     */
    playEntranceAnimation(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        this.activeSection = sectionId;

        const wrapperLeft = section.querySelector('.wrapper-left');
        const wrapperRight = section.querySelector('.wrapper-right');

        // 获取此部分的变体配置
        const variation = this.config.variations[sectionId] || {
            left: { enterFrom: { x: -50, opacity: 0 }, exitTo: { x: -30, opacity: 0 } },
            right: { enterFrom: { x: 50, opacity: 0 }, exitTo: { x: 30, opacity: 0 } }
        };

        // 为此动画创建时间轴
        const timeline = gsap.timeline({
            delay: this.sectionChangeDelay // 添加全局延迟，确保滚动完成后再开始动画
        });

        // 针对 chronology-bydch 部分的特殊处理
        if (sectionId === 'chronology-bydch') {
            // 先播放右侧图片动画，再播放左侧文本动画
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const leftText = wrapperLeft?.querySelector('.text');

            // 创建先后顺序的动画
            if (rightImage) {
                timeline.fromTo(rightImage,
                    { ...variation.right.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: 1.4, // 增加图片动画时间以适应更长的移动距离
                        ease: "power2.out" // 使用缓动效果让动画更流畅
                    },
                    0 // 图片动画立即开始（已经有全局延迟）
                );
            }

            if (leftText) {
                timeline.fromTo(leftText,
                    { ...variation.left.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: 0.9, // 加快文本动画速度
                        ease: "power3.out" // 使用更强的缓动效果让动画更快更流畅
                    },
                    0.8 // 图片动画开始后延迟开始文本动画
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = timeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-cdz 部分的特殊处理
        if (sectionId === 'chronology-cdz') {
            const leftText = wrapperLeft?.querySelector('.text');
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.cards') ||
                wrapperLeft?.querySelector('div:not(.text)');

            // 创建动画时间轴，添加全局延迟0.1秒
            const cdzTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });
            if (leftImage) {
                cdzTimeline.fromTo(leftImage,
                    { y: 1000, opacity: 1 }, // 文本从更远下方视口外向上移动
                    {
                        y: 0, opacity: 1,
                        duration: 1.2,
                        ease: "power3.out"
                    },
                    0 // 图片动画开始后延迟开始文本动画
                );
            }
            // 创建先后顺序的动画
            if (leftText) {
                cdzTimeline.fromTo(leftText,
                    { y: -1000, opacity: 1 }, // 图片从更远上方视口外向下移动
                    {
                        y: 0, opacity: 1,
                        duration: 0.9,
                        ease: "power2.out"
                    },
                    0.2 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }



            // 处理右侧内容（如果有）
            if (wrapperRight) {
                const rightElements = wrapperRight.querySelectorAll('*');
                if (rightElements.length) {
                    cdzTimeline.fromTo(rightElements,
                        { ...variation.right.enterFrom },
                        {
                            x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                            duration: this.config.duration.enter,
                            ease: this.config.ease.enter
                        },
                        1.0 // 右侧内容最后开始动画
                    );
                }
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = cdzTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-hl 部分的特殊处理
        if (sectionId === 'chronology-hl') {
            // 找到右侧包装内的图片和文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const hlTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });

            // 分别处理图片和文本的动画，因为它们的旋转方向不同
            if (leftImage) {
                hlTimeline.to(leftImage, {
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out"
                }, 0); // 立即开始动画（已经有0.1秒全局延迟）
            }

            if (rightText) {
                hlTimeline.to(rightText, {
                    x: 0,
                    y: 0,
                    duration: 1.5,
                    ease: "power2.out"
                }, 0.5); // 同时开始动画（已经有0.1秒全局延迟）
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = hlTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-dm 部分的特殊处理
        if (sectionId === 'chronology-dm') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const dmTimeline = gsap.timeline({
                delay: 0.1 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (rightImage) {
                // 图片从下方向上移动
                dmTimeline.fromTo(rightImage,
                    { y: 1200, opacity: 1, x: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }

            if (rightText) {
                // 文本从右侧向左移动
                dmTimeline.fromTo(rightText,
                    { x: 1200, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out"
                    },
                    0.7 // 文本动画在图片动画开始后0.7秒开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = dmTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-qcsc 部分的特殊处理
        if (sectionId === 'chronology-qcsc') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const leftText = wrapperLeft?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const qcscTimeline = gsap.timeline({
                delay: 0.1 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (rightImage) {
                // 图片从右侧向左移动
                qcscTimeline.fromTo(rightImage,
                    { x: 1200, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }

            if (leftText) {
                // 文本从右侧向左移动，在图片动画完成后开始
                qcscTimeline.fromTo(leftText,
                    { x: -1200, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0.7 // 文本动画在图片动画完成后开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = qcscTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-sjb 部分的特殊处理
        if (sectionId === 'chronology-sjb') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.2秒
            const sjbTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.2秒再开始动画
            });

            // 创建先后顺序的动画
            if (leftImage) {
                // 图片从小到大缩放，去掉弹性效果
                sjbTimeline.to(leftImage, {
                    x: 0,  // 缩放到原始大小
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out" // 使用普通缓动效果，没有弹性抖动
                }, 0); // 图片动画立即开始（已经有0.2秒全局延迟）
            }

            if (rightText) {
                // 文本从右侧向左移动，在图片动画完成后开始
                sjbTimeline.fromTo(rightText,
                    { x: 1500, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0.5 // 文本动画在图片动画完成后开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = sjbTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-mnhcz 部分的特殊处理
        if (sectionId === 'chronology-mnhcz') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const leftText = wrapperLeft?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const mnhczTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (rightImage) {
                // 图片从右侧向左移动
                mnhczTimeline.fromTo(rightImage,
                    { x: 1200, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }

            if (leftText) {
                // 文本从右侧向左移动，在图片动画完成后开始
                mnhczTimeline.fromTo(leftText,
                    { x: -1200, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0.5 // 文本动画在图片动画完成后开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = mnhczTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-xylqyys 部分的特殊处理
        if (sectionId === 'chronology-xylqyys') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const xylqyysTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (leftImage) {
                // 图片从左下角缩放到原始大小
                xylqyysTimeline.to(leftImage, {
                    scale: 1,  // 缩放到原始大小
                    duration: 1.2,
                    ease: "power2.out"
                }, 0); // 图片动画立即开始（已经有0.1秒全局延迟）
            }

            if (rightText) {
                // 文本从右侧向左移动，在图片动画完成后开始
                xylqyysTimeline.fromTo(rightText,
                    { x: 1000, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0.6 // 文本动画在图片动画开始后0.5秒开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = xylqyysTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-omwyh 部分的特殊处理
        if (sectionId === 'chronology-omwyh') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建动画时间轴，添加全局延迟0.1秒
            const omwyhTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (leftImage) {
                // 图片从下方向上移动
                omwyhTimeline.fromTo(leftImage,
                    { y: 800, opacity: 1, x: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }

            if (rightText) {
                // 文本从右侧向左移动，在图片动画完成后开始
                omwyhTimeline.fromTo(rightText,
                    { x: 1000, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0.6 // 文本动画在图片动画完成后开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = omwyhTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-ydl 部分的特殊处理
        if (sectionId === 'chronology-ydl') {
            // 找到左侧包装内的文本和右侧包装内的图片元素
            const leftText = wrapperLeft?.querySelector('.text');
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            // 创建动画时间轴，添加全局延迟0.1秒
            const ydlTimeline = gsap.timeline({
                delay: 0.2 // section滚动完成后延迟0.1秒再开始动画
            });

            // 创建先后顺序的动画
            if (rightImage) {
                // 图片从右侧向左移动
                ydlTimeline.fromTo(rightImage,
                    { x: 1000, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0 // 图片动画立即开始（已经有0.1秒全局延迟）
                );
            }

            if (leftText) {
                // 文本从左侧向右移动，在图片动画完成后开始
                ydlTimeline.fromTo(leftText,
                    { x: -900, opacity: 1, y: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: "power2.out"
                    },
                    0 // 文本动画在图片动画完成后开始
                );
            }

            // 存储动画以供将来参考
            this.animations[sectionId] = ydlTimeline;
            return; // 提前返回，不执行下面的通用逻辑
        }

        // 其他部分的通用动画逻辑
        // 动画左侧包装内容
        if (wrapperLeft) {
            const leftText = wrapperLeft.querySelector('.text');
            const leftImage = wrapperLeft.querySelector('img') ||
                wrapperLeft.querySelector('.cards') ||
                wrapperLeft.querySelector('div:not(.text)');

            if (leftText) {
                timeline.fromTo(leftText,
                    { ...variation.left.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: this.config.duration.enter,
                        ease: this.config.ease.enter
                    },
                    0 // 开始时间位置
                );
            }

            if (leftImage) {
                timeline.fromTo(leftImage,
                    { ...variation.left.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: this.config.duration.enter,
                        ease: this.config.ease.enter
                    },
                    this.config.duration.stagger // 错开动画时间
                );
            }
        }

        // 动画右侧包装内容
        if (wrapperRight) {
            const rightText = wrapperRight.querySelector('.text');
            const rightImage = wrapperRight.querySelector('img') ||
                wrapperRight.querySelector('.foreground') ||
                wrapperRight.querySelector('div:not(.text)');

            if (rightText) {
                timeline.fromTo(rightText,
                    { ...variation.right.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: this.config.duration.enter,
                        ease: this.config.ease.enter
                    },
                    this.config.duration.stagger * 2 // 错开动画时间
                );
            }

            if (rightImage) {
                timeline.fromTo(rightImage,
                    { ...variation.right.enterFrom },
                    {
                        x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                        duration: this.config.duration.enter,
                        ease: this.config.ease.enter
                    },
                    this.config.duration.stagger * 3 // 错开动画时间
                );
            }
        }

        // 存储动画以供将来参考
        this.animations[sectionId] = timeline;
    }

    /**
     * 播放部分的退场动画
     * @param {string} sectionId - 要动画的部分ID
     */
    playExitAnimation(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const wrapperLeft = section.querySelector('.wrapper-left');
        const wrapperRight = section.querySelector('.wrapper-right');

        // 获取此部分的变体配置
        const variation = this.config.variations[sectionId] || {
            left: { enterFrom: { x: -50, opacity: 0 }, exitTo: { x: -30, opacity: 0 } },
            right: { enterFrom: { x: 50, opacity: 0 }, exitTo: { x: 30, opacity: 0 } }
        };

        // 为此动画创建时间轴
        const timeline = gsap.timeline();

        // 针对 chronology-bydch 部分的特殊处理
        if (sectionId === 'chronology-bydch') {
            // 先执行文本退场，再执行图片退场动画
            const leftText = wrapperLeft?.querySelector('.text');
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            if (leftText) {
                timeline.to(leftText, {
                    ...variation.left.exitTo,
                    duration: this.config.duration.textExit, // 使用更快的文本退场速度
                    ease: "power3.in" // 使用更强的缓动效果让动画更快更流畅
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                timeline.to(rightImage, {
                    ...variation.right.exitTo,
                    duration: this.config.duration.exit, // 使用标准退场速度
                    ease: "power2.in" // 使用缓动效果让动画更流畅
                }, 0); // 图片稍后开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-cdz 部分的特殊处理
        if (sectionId === 'chronology-cdz') {
            const leftText = wrapperLeft?.querySelector('.text');
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.cards') ||
                wrapperLeft?.querySelector('div:not(.text)');

            // 创建退场动画
            if (leftImage) {
                timeline.to(leftImage, {
                    y: 1000, // 文本向下方视口外退出
                    opacity: 1,
                    duration: this.config.duration.textExit, // 使用更快的文本退场速度
                    ease: "power3.in"
                }, 0); // 文本立即开始退场
            }

            if (leftText) {
                timeline.to(leftText, {
                    y: -1000, // 图片向上方视口外退出
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片稍后开始退场
            }

            // 处理右侧内容（如果有）
            if (wrapperRight) {
                const rightElements = wrapperRight.querySelectorAll('*');
                if (rightElements.length) {
                    timeline.to(rightElements, {
                        ...variation.right.exitTo,
                        duration: this.config.duration.exit,
                        ease: this.config.ease.exit
                    }, 0); // 右侧内容同时开始退场
                }
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-hl 部分的特殊处理
        if (sectionId === 'chronology-hl') {
            // 找到右侧包装内的图片和文本元素
            const leftImage = wrapperLeft?.querySelector('img')

            const rightText = wrapperRight?.querySelector('.text');

            // 分别处理图片和文本的退场动画，因为它们的旋转方向不同
            if (leftImage) {
                // 图片退场：顺时针旋转回90度
                timeline.to(leftImage, {
                    x: -1200,
                    y: 0,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 立即开始退场动画
            }

            if (rightText) {
                // 文本退场：逆时针旋转回-90度
                timeline.to(rightText, {
                    x: 1200,
                    y: 0,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 同时开始退场动画
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-dm 部分的特殊处理
        if (sectionId === 'chronology-dm') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建先后顺序的退场动画
            if (rightText) {
                // 文本先退场：向右侧移动
                timeline.to(rightText, {
                    x: 1200,  // 更大的x轴偏移，确保完全在视口外
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                // 图片后退场：向下方移动，更大的位移和更快的速度
                timeline.to(rightImage, {
                    y: 1200,  // 进一步增加y轴偏移，使位移更加明显
                    opacity: 1,
                    duration: 0.7,  // 减少动画时间，使动画更快
                    ease: "power3.in"  // 使用更强的缓动效果，使动画更加迅速
                }, 0); // 稍早开始退场动画
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-qcsc 部分的特殊处理
        if (sectionId === 'chronology-qcsc') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const leftText = wrapperLeft?.querySelector('.text');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (leftText) {
                // 文本先退场：向右侧移动
                timeline.to(leftText, {
                    x: -1200,  // 增加位移距离，确保完全在视口外
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                // 图片后退场：向右侧移动
                timeline.to(rightImage, {
                    x: 1200,  // 增加位移距离，确保完全在视口外
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片稍后开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-sjb 部分的特殊处理
        if (sectionId === 'chronology-sjb') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (rightText) {
                // 文本先退场：向右侧移动
                timeline.to(rightText, {
                    x: 1500,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (leftImage) {
                // 图片退场：缩小到消失，调整为更明显的效果
                timeline.to(leftImage, {
                    x: -1500,  // 缩小到更小的尺寸，使效果更明显
                    y:0,
                    opacity: 1,  // 保持完全不透明
                    duration: 1.0,  // 增加动画时间，让缩放过程更明显
                    ease: "power2.in"  // 使用普通缓动效果，没有弹性抖动
                }, 0); // 图片稍后开始退场，确保能看到缩放效果
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-mnhcz 部分的特殊处理
        if (sectionId === 'chronology-mnhcz') {
            // 找到右侧包装内的图片和文本元素
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            const leftText = wrapperLeft?.querySelector('.text');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (leftText) {
                // 文本先退场：向右侧移动
                timeline.to(leftText, {
                    x: -1200,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                // 图片后退场：向右侧移动
                timeline.to(rightImage, {
                    x: 700,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片同时开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-xylqyys 部分的特殊处理
        if (sectionId === 'chronology-xylqyys') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (rightText) {
                // 文本先退场：向右侧移动
                timeline.to(rightText, {
                    x: 1000,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (leftImage) {
                // 图片退场：缩小到消失
                timeline.to(leftImage, {
                    scale: 0,  // 缩小到消失
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片同时开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-omwyh 部分的特殊处理
        if (sectionId === 'chronology-omwyh') {
            // 找到左侧包装内的图片和右侧包装内的文本元素
            const leftImage = wrapperLeft?.querySelector('img') ||
                wrapperLeft?.querySelector('.foreground') ||
                wrapperLeft?.querySelector('div:not(.text)');

            const rightText = wrapperRight?.querySelector('.text');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (rightText) {
                // 文本先退场：向右侧移动
                timeline.to(rightText, {
                    x: 1000,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (leftImage) {
                // 图片后退场：向下方移动
                timeline.to(leftImage, {
                    y: 800,  // 向下方视口外移动
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片同时开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 针对 chronology-ydl 部分的特殊处理
        if (sectionId === 'chronology-ydl') {
            // 找到左侧包装内的文本和右侧包装内的图片元素
            const leftText = wrapperLeft?.querySelector('.text');
            const rightImage = wrapperRight?.querySelector('img') ||
                wrapperRight?.querySelector('.foreground') ||
                wrapperRight?.querySelector('div:not(.text)');

            // 创建先后顺序的退场动画
            const timeline = gsap.timeline();

            if (leftText) {
                // 文本先退场：向左侧移动
                timeline.to(leftText, {
                    x: -900,  // 向左侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.textExit,
                    ease: "power2.in"
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                // 图片后退场：向右侧移动
                timeline.to(rightImage, {
                    x: 1000,  // 向右侧视口外移动
                    opacity: 1,
                    duration: this.config.duration.exit,
                    ease: "power2.in"
                }, 0); // 图片同时开始退场
            }

            return; // 提前返回，不执行下面的通用逻辑
        }

        // 动画左侧包装内容
        if (wrapperLeft) {
            const leftText = wrapperLeft.querySelector('.text');
            const leftImage = wrapperLeft.querySelector('img') ||
                wrapperLeft.querySelector('.cards') ||
                wrapperLeft.querySelector('div:not(.text)');

            if (leftText) {
                timeline.to(leftText, {
                    ...variation.left.exitTo,
                    duration: this.config.duration.textExit, // 使用更快的文本退场速度
                    ease: this.config.ease.exit
                }, 0); // 文本立即开始退场
            }

            if (leftImage) {
                timeline.to(leftImage, {
                    ...variation.left.exitTo,
                    duration: this.config.duration.exit,
                    ease: this.config.ease.exit
                }, 0); // 图片稍后开始退场
            }
        }

        // 动画右侧包装内容
        if (wrapperRight) {
            const rightText = wrapperRight.querySelector('.text');
            const rightImage = wrapperRight.querySelector('img') ||
                wrapperRight.querySelector('.foreground') ||
                wrapperRight.querySelector('div:not(.text)');

            if (rightText) {
                timeline.to(rightText, {
                    ...variation.right.exitTo,
                    duration: this.config.duration.textExit, // 使用更快的文本退场速度
                    ease: this.config.ease.exit
                }, 0); // 文本立即开始退场
            }

            if (rightImage) {
                timeline.to(rightImage, {
                    ...variation.right.exitTo,
                    duration: this.config.duration.exit,
                    ease: this.config.ease.exit
                }, 0); // 图片稍后开始退场
            }
        }
    }

    /**
     * 更新动画配置
     * @param {Object} newConfig - 要合并的新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // 如果要特别更新变体
        if (newConfig.variations) {
            this.config.variations = { ...this.config.variations, ...newConfig.variations };
        }

        console.log('动画配置已更新');
    }

    /**
     * 更新特定部分的动画配置
     * @param {string} sectionId - 要更新的部分ID
     * @param {Object} config - 新的动画配置
     * @example
     * // 示例：更新特定部分的动画效果
     * chronologyAnimations.updateSectionConfig('chronology-bydch', {
     *   left: {
     *     enterFrom: { x: -100, y: 20, opacity: 0, rotation: -5 },
     *     exitTo: { x: -80, y: 0, opacity: 0, rotation: 0 }
     *   },
     *   right: {
     *     enterFrom: { x: 100, y: 0, opacity: 0, scale: 0.8 },
     *     exitTo: { x: 80, y: 30, opacity: 0, scale: 1.1 }
     *   }
     * });
     */
    updateSectionConfig(sectionId, config) {
        if (!this.config.variations[sectionId]) {
            this.config.variations[sectionId] = {};
        }

        this.config.variations[sectionId] = {
            ...this.config.variations[sectionId],
            ...config
        };

        console.log(`部分 ${sectionId} 的动画配置已更新`);
    }
}

// 当脚本加载时初始化动画
const chronologyAnimations = new ChronologyAnimations();

// 导出实例以供全局使用
window.chronologyAnimations = chronologyAnimations; 