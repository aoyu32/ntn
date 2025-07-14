/**
 * circumstances-animations.js
 * 
 * 此文件管理情境(circumstances)部分内容的入场和退场动画
 * 使用GSAP动画库实现，为world-map和wrapper-right元素提供动画效果。
 */

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

/**
 * CircumstancesAnimations类用于管理情境部分的动画效果
 */
class CircumstancesAnimations {
    constructor(config = {}) {
        // 默认配置
        this.config = {
            duration: {
                enter: 1.2,    // 入场动画持续时间(秒)
                exit: 0.8,     // 退场动画持续时间(秒)
                delay: 0.2     // 动画延迟开始时间(秒)
            },
            ease: {
                enter: "power3.out", // 入场动画缓动效果
                exit: "power2.in"    // 退场动画缓动效果
            },
            ...config
        };
        
        this.initialized = false;
        this.animationTimeline = null;
        this.isAnimating = false; // 添加标志以跟踪动画状态
        
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
        
        // 获取情境部分
        this.section = document.getElementById('circumstances');
        
        if (!this.section) {
            console.warn('未找到情境部分');
            return;
        }
        
        // 获取需要动画的元素
        this.worldMap = this.section.querySelector('.world-map');
        this.wrapperRight = this.section.querySelector('.wrapper-right');
        
        if (!this.worldMap || !this.wrapperRight) {
            console.warn('未找到需要动画的元素');
            return;
        }
        
        // 设置初始状态
        this.setupInitialStates();
        
        // 监听来自主视差系统的部分切换事件
        window.addEventListener('sectionChange', this.handleSectionChange.bind(this));
        
        // 标记为已初始化
        this.initialized = true;
        console.log('情境动画已初始化');
    }
    
    /**
     * 设置元素的初始状态
     */
    setupInitialStates() {
        // 设置world-map初始状态 - 缩放为0
        gsap.set(this.worldMap, {
            scale: 0,
            transformOrigin: 'center center',
            opacity: 0
        });
        
        // 设置world-map内的p元素 - 从上方移入
        const pElement = this.worldMap.querySelector('p');
        if (pElement) {
            gsap.set(pElement, {
                y: -300,  // 从上方开始
                opacity: 0,
                transformOrigin: 'center center',
            });
        }
        
        // 设置world-map内的span元素 - 从下方移入
        const spanElement = this.worldMap.querySelector('span');
        if (spanElement) {
            gsap.set(spanElement, {
                y: 300,  // 从下方开始
                opacity: 0,
                transformOrigin: 'center center',
            });
        }
        
        // 设置wrapper-right初始状态 - 从右侧视口外移入
        gsap.set(this.wrapperRight, {
            x: 300,
            opacity: 0
        });
    }
    
    /**
     * 处理部分切换事件
     * @param {Event} event - 部分切换事件
     */
    handleSectionChange(event) {
        const { currentSection, previousSection } = event.detail || {};
        
        // 如果有正在进行的动画，先停止它
        if (this.animationTimeline) {
            this.animationTimeline.kill();
            this.animationTimeline = null;
        }
        
        if (currentSection && currentSection.id === 'circumstances') {
            // 当切换到情境部分时，重置元素状态并播放入场动画
            this.setupInitialStates();
            this.isAnimating = true; // 设置动画状态为正在执行
            
            setTimeout(() => {
                this.playEntranceAnimation();
            }, this.config.duration.delay * 1000);
        } else if (previousSection && previousSection.id === 'circumstances') {
            // 当离开情境部分时，播放退场动画
            console.log('离开circumstances部分，执行退场动画');
            this.isAnimating = true; // 设置动画状态为正在执行
            this.playExitAnimation();
        }
    }
    
    /**
     * 播放入场动画
     */
    playEntranceAnimation() {
        // 创建动画时间轴
        this.animationTimeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false; // 动画完成后重置状态
                console.log('入场动画完成');
            }
        });
        
        // 1. world-map从0缩放到1
        this.animationTimeline.to(this.worldMap, {
            scale: 1,
            opacity: 1,
            duration: this.config.duration.enter * 0.6, // 进一步缩短缩放时间
            ease: this.config.ease.enter,
            onComplete: () => console.log('world-map缩放完成')
        });
        
        // 2. world-map内的p元素从上方向下移动 - 在缩放接近完成时就开始
        const pElement = this.worldMap.querySelector('p');
        if (pElement) {
            this.animationTimeline.to(pElement, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.in",
                clearProps: "transform"
            }, "-=0.15"); // 提前0.15秒开始，与缩放动画有重叠
        }
        
        // 3. world-map内的span元素从下方向上移动，与p元素同步
        const spanElement = this.worldMap.querySelector('span');
        if (spanElement) {
            this.animationTimeline.to(spanElement, {
                y: 0,
                opacity: 1,
                duration: 0.5, // 与p元素相同的持续时间
                ease: "power2.in",
                clearProps: "transform"
            }, "<"); // 与p元素同时开始
        }
        
        // 4. wrapper-right从右侧视口外移入 - 与文本动画同时开始
        this.animationTimeline.to(this.wrapperRight, {
            x: 0,
            opacity: 1,
            duration: 0.5, // 缩短持续时间，使动画更快
            ease: this.config.ease.enter
        }, "<"); // 与文本动画同时开始
    }
    
    /**
     * 播放退场动画
     */
    playExitAnimation() {
        // 创建动画时间轴
        this.animationTimeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false; // 动画完成后重置状态
                console.log('退场动画完成');
            }
        });
        
        // 退场动画顺序与入场动画相反
        
        // 1. 首先，wrapper-right向右侧视口外移出
        this.animationTimeline.to(this.wrapperRight, {
            x: 300,
            opacity: 0,
            duration: 0.5,
            ease: this.config.ease.exit
        });
        
        // 2. 同时，world-map内的p元素向上方移出
        const pElement = this.worldMap.querySelector('p');
        if (pElement) {
            this.animationTimeline.to(pElement, {
                y: -300,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in"
            }, "<");
        }
        
        // 3. 同时，world-map内的span元素向下方移出
        const spanElement = this.worldMap.querySelector('span');
        if (spanElement) {
            this.animationTimeline.to(spanElement, {
                y: 300,
                opacity: 0,
                duration: 0.5, // 与p元素相同的持续时间
                ease: "power2.in"
            }, "<"); // 与p元素同时开始
        }
        
        // 4. 最后，world-map缩放回0
        this.animationTimeline.to(this.worldMap, {
            scale: 0,
            opacity: 0,
            duration: this.config.duration.exit * 0.6,
            ease: this.config.ease.exit
        }, ">");  // 在前面的动画完成后开始
    }
    
    /**
     * 更新动画配置
     * @param {Object} newConfig - 要合并的新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('动画配置已更新');
    }
}

// 当脚本加载时初始化动画
const circumstancesAnimations = new CircumstancesAnimations();

// 导出实例以供全局使用
window.circumstancesAnimations = circumstancesAnimations; 