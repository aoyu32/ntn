/**
 * compiled-animations.js
 * 为 #compiled section 创建动画效果
 * 动画效果：每个 content-item 依次执行动画
 * item-left 从左向右移动，完成后 item-right 从右向左移动
 * 整个过程持续 3 秒，开始前有 0.5 秒延迟
 */

class CompiledAnimations {
  constructor() {
    // 初始化 GSAP
    this.initGSAP();
    
    // 获取元素
    this.compiledSection = document.getElementById('compiled');
    this.contentItems = this.compiledSection.querySelectorAll('.content-item');
    
    // 设置动画参数
    // 为左侧和右侧元素分别设置参数
    this.leftParams = {
      duration: 0.2,       // 左侧元素动画持续时间
      distance: 400        // 左侧元素移动距离（像素）
    };
    
    this.rightParams = {
      duration: 0.7,       // 右侧元素动画持续时间
      distance: 600        // 右侧元素移动距离（像素）
    };
    
    this.staggerDelay = 0;     // 元素之间的延迟时间
    this.initialDelay = 0.2;      // 初始延迟时间（秒）
    this.betweenDelay = 0.1;      // item-left 和 item-right 之间的延迟时间
    
    // 创建主时间轴
    this.mainTimeline = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" }
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
    // 设置所有元素的初始状态
    gsap.set(this.contentItems, { opacity: 0 });
    this.contentItems.forEach(item => {
      const itemLeft = item.querySelector('.item-left');
      const itemRight = item.querySelector('.item-right');
      
      // 设置初始位置 - 左侧元素在左边视口外，右侧元素在右边视口外
      gsap.set(itemLeft, { 
        opacity: 0,
        x: -this.leftParams.distance
      });
      
      gsap.set(itemRight, { 
        opacity: 0,
        x: this.rightParams.distance
      });
    });
    
    // 添加初始延迟
    this.mainTimeline.delay(this.initialDelay);
    
    // 为每个 content-item 创建动画序列
    this.contentItems.forEach((item, index) => {
      const itemLeft = item.querySelector('.item-left');
      const itemRight = item.querySelector('.item-right');
      
      // 创建这个 content-item 的时间轴
      const itemTimeline = gsap.timeline({
        defaults: { ease: "power2.out" }
      });
      
      // 1. 首先显示整个 content-item
      itemTimeline.to(item, { 
        opacity: 1, 
        duration: 0.1
      });
      
      // 2. 左侧元素从左向右移动 - 使用左侧专用参数
      itemTimeline.to(itemLeft, { 
        opacity: 1, 
        x: 0, 
        duration: this.leftParams.duration
      });
      
      // 等待左侧动画完成后的延迟
      itemTimeline.to({}, { duration: this.betweenDelay });
      
      // 3. 右侧元素从右向左移动 - 使用右侧专用参数
      itemTimeline.to(itemRight, { 
        opacity: 1, 
        x: 0, 
        duration: this.rightParams.duration
      });
      
      // 将这个 content-item 的时间轴添加到主时间轴
      this.mainTimeline.add(itemTimeline, index > 0 ? "+=" + this.staggerDelay : 0);
    });
    
    console.log(`Compiled animations setup complete. Total duration: ${this.mainTimeline.duration()} seconds (including ${this.initialDelay}s delay)`);
  }
  
  /**
   * 添加滚动触发器
   */
  addScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.compiledSection,
      start: "top 80%", // 当 section 的顶部到达视口 80% 的位置时开始
      end: "bottom 20%", // 当 section 的底部到达视口 20% 的位置时结束
      onEnter: () => this.playAnimation(),
      onEnterBack: () => this.playAnimation(),
      onLeave: () => this.reverseAnimation(),
      onLeaveBack: () => this.reverseAnimation(),
      markers: false // 设置为 true 可以在开发时查看触发点
    });
  }
  
  /**
   * 播放动画
   */
  playAnimation() {
    console.log('Playing compiled section animations');
    this.mainTimeline.play(0);
  }
  
  /**
   * 反转动画
   */
  reverseAnimation() {
    console.log('Reversing compiled section animations');
    this.mainTimeline.reverse();
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