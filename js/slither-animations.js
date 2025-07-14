/**
 * slither-animations.js
 * 处理滑动"新"行文本的动画变化
 * 当滚动到最后一个section时，文本从"滑动"新"行"变为"返回首页"
 * 添加点击事件返回第一个section
 */

class SlitherAnimations {
  constructor() {
    // 初始化GSAP
    this.initGSAP();
    
    // 获取元素
    this.slitherElement = document.querySelector('.slither span');
    this.originalText = this.slitherElement.textContent;
    this.targetText = "返回首页";
    
    // 设置动画参数
    this.animationDuration = 0.8; // 动画持续时间
    
    // 添加事件监听
    this.setupEventListeners();
  }
  
  /**
   * 初始化GSAP
   */
  initGSAP() {
    // 确保GSAP已加载
    if (typeof gsap === 'undefined') {
      console.error('GSAP未加载，文本动画将无法工作');
      return;
    }
    
    // 注册TextPlugin插件
    if (typeof TextPlugin === 'undefined') {
      console.error('TextPlugin未加载，文本动画将无法工作');
      return;
    }
    
    gsap.registerPlugin(TextPlugin);
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听section变化事件
    window.addEventListener('sectionChange', (e) => {
      if (e.detail && e.detail.currentSection) {
        // 检查是否为最后一个section
        const isLastSection = e.detail.currentSection.id === 'compiled';
        this.updateText(isLastSection);
      }
    });
    
    // 为slither元素添加点击事件
    this.slitherElement.parentElement.addEventListener('click', () => {
      // 如果当前文本是"返回首页"，滚动到首页
      if (this.slitherElement.textContent === this.targetText) {
        this.scrollToHome();
      }
    });

    // 修改鼠标样式，当文本为"返回首页"时显示为指针
    this.slitherElement.parentElement.addEventListener('mouseover', () => {
      if (this.slitherElement.textContent === this.targetText) {
        this.slitherElement.parentElement.style.cursor = 'pointer';
      } else {
        this.slitherElement.parentElement.style.cursor = 'default';
      }
    });
  }
  
  /**
   * 更新文本内容
   * @param {boolean} isLastSection - 是否为最后一个section
   */
  updateText(isLastSection) {
    if (isLastSection) {
      // 如果是最后一个section，将文本变为"返回首页"
      this.animateTextChange(this.originalText, this.targetText);
    } else {
      // 如果不是最后一个section，将文本变回原始文本
      if (this.slitherElement.textContent === this.targetText) {
        this.animateTextChange(this.targetText, this.originalText);
      }
    }
  }
  
  /**
   * 文本变化动画
   * @param {string} fromText - 起始文本
   * @param {string} toText - 目标文本
   */
  animateTextChange(fromText, toText) {
    // 创建动画时间轴
    const timeline = gsap.timeline();
    
    // 第一步：淡出并向上位移
    timeline.to(this.slitherElement, {
      opacity: 0,
      y: -30, // 向上位移30px
      duration: this.animationDuration / 2,
      ease: "power2.in"
    });
    
    // 第二步：更改文本并准备从下方进入
    timeline.to(this.slitherElement, {
      text: toText,
      y: 30, // 位置设置在下方30px处
      duration: 0.1
    });
    
    // 第三步：淡入并位移回原位
    timeline.to(this.slitherElement, {
      opacity: 1,
      y: 0, // 回到原始位置
      duration: this.animationDuration / 2,
      ease: "power2.out"
    });
  }
  
  /**
   * 滚动到首页
   */
  scrollToHome() {
    // 查找首页section索引
    const sections = document.querySelectorAll('section');
    let homeIndex = 0;
    
    sections.forEach((section, index) => {
      if (section.id === 'home') {
        homeIndex = index;
      }
    });
    
    // 触发滚动事件
    window.dispatchEvent(new CustomEvent('scrollToSection', {
      detail: {
        targetIndex: homeIndex
      }
    }));
  }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已经存在实例
  if (!window.slitherAnimations) {
    window.slitherAnimations = new SlitherAnimations();
  }
}); 