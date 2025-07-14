/**
 * home-animations.js
 * 
 * 此文件管理首页(home)部分内容的动画效果
 * 使用GSAP动画库实现，主要实现打字机效果
 */

// 注册GSAP插件
gsap.registerPlugin(TextPlugin);

/**
 * HomeAnimations类用于管理首页的动画效果
 */
class HomeAnimations {
    constructor(config = {}) {
        // 默认配置
        this.config = {
            typingDuration: 1.5, // 整个打字过程持续时间(秒)
            typingEase: "none", // 打字动画的缓动效果，通常为线性
            typingStagger: 0.05, // 字符间的错开时间(秒)
            lineDelay: 0.1, // 行与行之间的延迟(秒)
            sectionDelay: 0.3, // section滚动完成后延迟执行动画的时间(秒)
            ...config
        };
        
        this.initialized = false;
        
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
        
        // 获取home部分
        this.homeSection = document.getElementById('home');
        
        if (!this.homeSection) {
            console.warn('未找到home部分');
            return;
        }
        
        // 获取所有需要打字效果的文本元素
        this.enTextLines = this.homeSection.querySelectorAll('.en-text p');
        this.chTextLine = this.homeSection.querySelector('.ch-text p');
        
        // 准备打字机动画
        this.prepareTypingAnimation();
        
        // 监听来自主视差系统的部分切换事件
        window.addEventListener('sectionChange', this.handleSectionChange.bind(this));
        
        // 标记为已初始化
        this.initialized = true;
        console.log('首页动画已初始化');
        
        // 如果home部分可见，立即播放动画
        if (this.homeSection.style.visibility !== 'hidden') {
            setTimeout(() => {
                this.playTypingAnimation();
            }, this.config.sectionDelay * 1000);
        }
    }
    
    /**
     * 准备打字机动画
     */
    prepareTypingAnimation() {
        // 存储原始文本内容
        this.originalTexts = [];
        
        // 存储英文文本
        this.enTextLines.forEach(line => {
            this.originalTexts.push(line.textContent);
            line.textContent = ''; // 清空文本，等待动画
        });
        
        // 存储中文文本
        if (this.chTextLine) {
            this.originalTexts.push(this.chTextLine.textContent);
            this.chTextLine.textContent = ''; // 清空文本，等待动画
        }
        
        // 创建动画时间轴
        this.typingTimeline = gsap.timeline({
            paused: true,
            onComplete: () => console.log('打字机动画完成')
        });
        
        // 计算每行文本的打字时间，确保总时间为typingDuration
        const totalChars = this.originalTexts.reduce((sum, text) => sum + text.length, 0);
        const timePerChar = this.config.typingDuration / totalChars;
        
        // 为每行文本添加打字动画
        let currentPosition = 0;
        
        // 添加英文文本动画
        this.enTextLines.forEach((line, index) => {
            const text = this.originalTexts[index];
            const duration = text.length * timePerChar;
            
            this.typingTimeline.to(line, {
                text: text,
                duration: duration,
                ease: this.config.typingEase,
            }, currentPosition);
            
            currentPosition += duration + this.config.lineDelay;
        });
        
        // 添加中文文本动画
        if (this.chTextLine) {
            const text = this.originalTexts[this.originalTexts.length - 1];
            const duration = text.length * timePerChar;
            
            this.typingTimeline.to(this.chTextLine, {
                text: text,
                duration: duration,
                ease: this.config.typingEase,
            }, currentPosition);
        }
    }
    
    /**
     * 播放打字机动画
     */
    playTypingAnimation() {
        if (this.typingTimeline) {
            // 重置动画
            this.typingTimeline.restart();
        }
    }
    
    /**
     * 处理部分切换事件
     * @param {Event} event - 部分切换事件
     */
    handleSectionChange(event) {
        const { currentSection } = event.detail || {};
        
        if (currentSection && currentSection.id === 'home') {
            // 当切换到home部分时，添加延迟后播放打字机动画
            setTimeout(() => {
                this.playTypingAnimation();
            }, this.config.sectionDelay * 1000);
        }
    }
    
    /**
     * 更新动画配置
     * @param {Object} newConfig - 要合并的新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // 重新准备动画
        this.prepareTypingAnimation();
        
        console.log('动画配置已更新');
    }
}

// 当脚本加载时初始化动画
const homeAnimations = new HomeAnimations();

// 导出实例以供全局使用
window.homeAnimations = homeAnimations; 