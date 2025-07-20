/**
 * compiled-animations.js
 * 为 #compiled section 创建动画效果
 * 动画效果：整个content-wrapper从视口外下方向上移动到达布局好的位置
 */

class CompiledAnimations {
  constructor() {
    // 初始化 GSAP
    this.initGSAP();
    
    // 获取元素
    this.compiledSection = document.getElementById('compiled');
    this.contentWrapper = this.compiledSection.querySelector('.content-wrapper');
    this.contentItems = this.compiledSection.querySelectorAll('.content-item');
    
    // 设置动画参数
    this.params = {
      duration: 4,        // 动画持续时间（秒）
      startY: '120%',       // 开始位置（视口下方，使用百分比确保在视口外）
      initialDelay: 1,    // 初始延迟时间（秒）
      ease: "none"    // 缓动函数
    };
    
    // 创建主时间轴
    this.mainTimeline = gsap.timeline({
      paused: true,
      defaults: { ease: this.params.ease }
    });
    
    // 初始化动画
    this.setupAnimations();
    
    // 添加滚动触发器
    this.addScrollTrigger();
  }
  
  /**
   * 初始化 GSAP
   */
  initGSAP() {
    // 确保 GSAP 和 ScrollTrigger 已加载
    if (typeof gsap === 'undefined') {
      console.error('GSAP 未加载，动画将无法工作');
      return;
    }
    
    if (typeof ScrollTrigger === 'undefined') {
      console.error('ScrollTrigger 未加载，动画将无法工作');
      return;
    }
    
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);
  }
  
  /**
   * 设置初始状态和构建动画序列
   */
  setupAnimations() {
    // 设置内容包装器的初始状态 - 在视口下方
    gsap.set(this.contentWrapper, {
      y: this.params.startY,  // 设置在视口外下方
      opacity: 1              // 保持不透明，只是位置在视口外
    });
    
    // 添加初始延迟
    this.mainTimeline.delay(this.params.initialDelay);
    
    // 创建整个content-wrapper的动画 - 从视口下方移动到原位
    this.mainTimeline.to(this.contentWrapper, {
      y: 0,                  // 移动到原始位置
      duration: this.params.duration,
      ease: this.params.ease
    });
    
    console.log(`Compiled animations setup complete. Total duration: ${this.mainTimeline.duration() + this.params.initialDelay} seconds (including ${this.params.initialDelay}s delay)`);
  }
  
  /**
   * 添加滚动触发器
   */
  addScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.compiledSection,
      start: "top 100%", // 当 section 的顶部到达视口 80% 的位置时开始
      end: "bottom 20%", // 当 section 的底部到达视口 20% 的位置时结束
      onEnter: () => this.playAnimation(),
      onEnterBack: () => this.playAnimation(),
      markers: false // 设置为 true 可以在开发时查看触发点
    });
  }
  
  /**
   * 播放动画
   */
  playAnimation() {
    console.log('Playing compiled section animations');
    this.mainTimeline.restart();
  }
}

// 当 DOM 加载完成后初始化动画
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已经存在实例
  if (!window.compiledAnimations) {
    window.compiledAnimations = new CompiledAnimations();
  }
});

// 为 section 切换事件添加监听器
window.addEventListener('sectionChange', (e) => {
  // 如果当前 section 是 compiled
  if (e.detail && e.detail.currentSection && e.detail.currentSection.id === 'compiled') {
    // 播放动画
    if (window.compiledAnimations) {
      window.compiledAnimations.playAnimation();
    }
  }
}); 