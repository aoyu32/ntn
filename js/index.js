const { createApp, ref, onMounted } = Vue

const app = createApp({
    setup() {
        // 左侧侧边栏导航
        const navList = ref([
            {
                name: "情境",
                point: "#circumstances"
            },
            {
                name: "编年",
                point: "#chronology-bydch"
            },
            {
                name: "会计",
                point: "#accounting"
            },
            {
                name: "收撰",
                point: "#compiled"
            }
        ])

        // 右下角文字
        const slitherText = ref("滑动\"新\"行")
        const isShowPolicy = ref(false)

        // 下拉相关状态
        const startY = ref(0)
        const currentY = ref(0)
        const isDragging = ref(false)
        const activeDropdown = ref(null) // 当前激活的下拉元素ID
        const dragThreshold = 20; // 拖动阈值，需要拖动超过这个距离才算是下拉操作
        const pullDownThreshold = 40; // pull-down区域被拉下的阈值，超过这个距离才开始显示下拉内容

        // 每个时间节点的下拉状态
        const dropdownStates = ref({
            'chronology-bydch': false,
            'chronology-cdz': false,
            'chronology-hl': false,
            'chronology-dm': false,
            'chronology-qcsc': false,
            'chronology-sjb': false,
            'chronology-mnhcz': false,
            'chronology-xylqyys': false,
            'chronology-omwyh': false,
            'chronology-ydl': false
        })

        // 重置所有下拉内容的状态
        function resetAllDropdownStates() {
            // 重置所有下拉状态
            Object.keys(dropdownStates.value).forEach(key => {
                dropdownStates.value[key] = false;
            });
            
            // 重置所有下拉内容的样式
            document.querySelectorAll('.pull-down-content').forEach(content => {
                content.style.height = '0px';
                content.style.display = '';
                content.style.visibility = '';
                
                // 隐藏pull-up区域
                hidePullUpArea(content);
            });
            
            // 重置所有下拉按钮的样式
            document.querySelectorAll('.pull-down').forEach(el => {
                el.classList.remove('active');
                el.classList.remove('pulling');
                el.classList.remove('ready-to-release');
                el.style.paddingBottom = '0px';
            });
            
            // 移除所有可能的事件监听器
            if (window._currentCloseDropdownHandler) {
                document.removeEventListener('click', window._currentCloseDropdownHandler);
                window._currentCloseDropdownHandler = null;
            }

            // 恢复所有pull-down区域的透明度
            document.querySelectorAll('.pull-down').forEach(el => {
                gsap.to(el, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out"
                });
            });
        }

        onMounted(() => {
            // 重置所有下拉内容的状态
            resetAllDropdownStates();
            
            // 添加侧边栏动画效果
            initSidebarAnimation();
            // 初始化下拉按钮事件
            initDropdownEvents();
            
            // 添加section切换事件监听器
            window.addEventListener('sectionChange', (e) => {
                // 关闭所有下拉内容
                closeAllDropdownsGlobal();
            });
        });

        // 全局关闭所有下拉内容的函数
        function closeAllDropdownsGlobal() {
            const pullDownElements = document.querySelectorAll('.pull-down');
            
            // 首先关闭所有已打开的下拉内容
            pullDownElements.forEach(el => {
                const sectionId = el.closest('section')?.id;
                
                if (dropdownStates.value[sectionId]) {
                    const content = document.querySelector(`.pull-down-content[data-section="${sectionId}"]`) || el.nextElementSibling;
                    
                    if (content && content.classList.contains('pull-down-content')) {
                        // 恢复pull-down区域的透明度
                        gsap.to(el, {
                            opacity: 1,
                            duration: 0.3,
                            ease: "power1.out"
                        });
                        
                        // 隐藏pull-up区域
                        hidePullUpArea(content);
                        
                        // 立即移除活动状态类和其他状态类，确保背景色立即消失
                        el.classList.remove('active');
                        el.classList.remove('pulling');
                        el.classList.remove('ready-to-release');
                        
                        dropdownStates.value[sectionId] = false;
                        
                        // 动画收起下拉内容
                        gsap.to(content, {
                            height: 0,
                            duration: 0.8, // 增加收起时间
                            ease: "power3.out",
                            onComplete: () => {
                                // 将下拉内容放回原位
                                if (content.parentNode !== el.parentNode) {
                                    el.parentNode.insertBefore(content, el.nextSibling);
                                }
                                
                                // 确保下拉内容的样式被重置
                                content.style.height = '0px';
                                
                                // 移除恢复导航栏z-index的代码
                            }
                        });
                    }
                }
            });
            
            // 完全重置所有下拉内容的状态
            setTimeout(resetAllDropdownStates, 1000);
        }

        function initDropdownEvents() {
            // 获取所有下拉按钮
            const pullDownElements = document.querySelectorAll('.pull-down');
            
            // 确保所有下拉内容都有正确的z-index
            document.querySelectorAll('.pull-down-content').forEach(content => {
                content.style.zIndex = '9999';
            });
            
            // 重置所有下拉内容的状态
            resetAllDropdownStates();
            
            pullDownElements.forEach(element => {
                const sectionId = element.closest('section').id;
                const pullDownContent = element.nextElementSibling; // 获取下拉内容元素
                const pullDownIcon = element.querySelector('.pull-down-icon .icon');
                const pullDownDot = element.querySelector('.pull-down-icon .dot');
                const pullDownDotSpans = element.querySelectorAll('.pull-down-icon .dot span');
                
                if (!pullDownContent || !pullDownContent.classList.contains('pull-down-content')) {
                    return;
                }
                
                // 给下拉内容添加data-section属性
                pullDownContent.setAttribute('data-section', sectionId);
                
                // 初始化下拉内容样式
                gsap.set(pullDownContent, {
                    height: 0,
                    display: 'none',
                    visibility: 'hidden'
                });
                
                // 不再需要创建pull-up区域，因为已经在HTML中添加了
                // 获取pull-up元素
                const pullUp = pullDownContent.querySelector('.pull-up');
                if (pullUp) {
                    // 初始化pull-up事件
                    initPullUpEvents(pullUp, pullDownContent);
                }
                
                // 鼠标按下事件
                element.addEventListener('mousedown', (e) => {
                    // 如果已经有其他下拉内容打开，先关闭它
                    closeAllDropdowns(sectionId);
                    
                    startY.value = e.clientY;
                    isDragging.value = true;
                    activeDropdown.value = sectionId;
                    
                    // 添加拖动状态类
                    element.classList.add('pulling');
                    
                    // 计算内容的实际高度
                    const contentHeight = pullDownContent.scrollHeight;
                    
                    // 添加鼠标移动和鼠标松开的全局事件监听
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                    
                    // 鼠标移动处理函数
                    function handleMouseMove(e) {
                        if (!isDragging.value) return;
                        
                        currentY.value = e.clientY;
                        const deltaY = Math.max(0, currentY.value - startY.value);
                        
                        // 只有当拖动距离超过阈值时才开始显示下拉效果
                        if (deltaY >= dragThreshold) {
                            const adjustedDeltaY = deltaY - dragThreshold;
                            
                            // 计算拉伸进度，最大为1
                            const stretchProgress = Math.min(1, adjustedDeltaY / 100);
                            
                            // 动态设置padding-bottom，产生拉伸效果
                            const paddingBottom = Math.min(30, adjustedDeltaY * 0.3);
                            element.style.paddingBottom = `${paddingBottom}px`;
                            
                            // 动态设置dot的间距和大小
                            const dotGap = 5 + (stretchProgress * 4); // 从5px增加到9px
                            const dotSize = 2 + (stretchProgress * 2); // 从2px增加到4px
                            const dotTranslateY = stretchProgress * 10; // 从0px增加到10px
                            
                            gsap.to(pullDownDot, {
                                gap: dotGap + 'px',
                                y: dotTranslateY,
                                duration: 0.1,
                                ease: "power1.out"
                            });
                            
                            pullDownDotSpans.forEach(span => {
                                gsap.to(span, {
                                    width: dotSize + 'px',
                                    height: dotSize + 'px',
                                    duration: 0.1,
                                    ease: "power1.out"
                                });
                            });
                            
                            // 动态设置icon的位置
                            gsap.to(pullDownIcon, {
                                y: dotTranslateY,
                                duration: 0.1,
                                ease: "power1.out"
                            });
                            
                            // 根据拖动进度添加或移除ready-to-release类
                            if (stretchProgress > 0.5) {
                                element.classList.add('ready-to-release');
                            } else {
                                element.classList.remove('ready-to-release');
                            }
                            
                            // 只有当拖动距离足够时，才开始显示下拉内容
                            if (adjustedDeltaY >= pullDownThreshold) {
                                // 确保下拉内容在DOM中的位置正确
                                if (pullDownContent.parentNode !== document.body) {
                                    document.body.appendChild(pullDownContent);
                                    // 重置下拉内容的样式，确保它可以正确显示
                                    pullDownContent.style.display = 'block';
                                    pullDownContent.style.visibility = 'visible';
                                    
                                    // 设置pull-down区域的透明度为0
                                    gsap.to(element, {
                                        opacity: 0,
                                        duration: 0.2,
                                        ease: "power1.out"
                                    });
                                }
                                
                                // 计算下拉内容的展开进度
                                const contentDeltaY = adjustedDeltaY - pullDownThreshold; // 调整为实际拖动距离
                                const contentProgress = Math.min(1, contentDeltaY / 200); // 增加到200px为完全展开的距离
                                
                                // 根据拖动距离设置下拉内容高度
                                const newHeight = contentProgress * contentHeight;
                                gsap.to(pullDownContent, {
                                    height: newHeight,
                                    duration: 0.1,
                                    ease: "power1.out"
                                });
                                
                                // 如果拖动超过50%，标记为已打开状态
                                if (contentProgress > 0.5) {
                                    dropdownStates.value[sectionId] = true;
                                } else {
                                    dropdownStates.value[sectionId] = false;
                                }
                            } else {
                                // 如果拖动距离不够，确保下拉内容是关闭的
                                gsap.to(pullDownContent, {
                                    height: 0,
                                    duration: 0.1,
                                    ease: "power1.out"
                                });
                                dropdownStates.value[sectionId] = false;
                            }
                        } else {
                            // 即使没有达到阈值，也给予一些视觉反馈
                            element.classList.remove('ready-to-release');
                            
                            // 小幅度拉伸
                            const smallPaddingBottom = Math.min(10, deltaY * 0.5);
                            element.style.paddingBottom = `${smallPaddingBottom}px`;
                            
                            // 小幅度移动dot和icon
                            const smallTranslateY = deltaY * 0.25; // 最大2.5px
                            
                            gsap.to(pullDownDot, {
                                y: smallTranslateY,
                                duration: 0.1,
                                ease: "power1.out"
                            });
                            
                            gsap.to(pullDownIcon, {
                                y: smallTranslateY,
                                duration: 0.1,
                                ease: "power1.out"
                            });
                        }
                        
                        // 阻止默认事件和事件冒泡，防止拖动过程中选中文本
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    
                    // 鼠标松开处理函数
                    function handleMouseUp(e) {
                        isDragging.value = false;
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        
                        // 移除拖动状态类
                        element.classList.remove('pulling');
                        element.classList.remove('ready-to-release');
                        
                        // 恢复padding-bottom
                        gsap.to(element, {
                            paddingBottom: 0,
                            duration: 0.5,
                            ease: "elastic.out(1, 0.5)"
                        });
                        
                        // 恢复dot和icon的位置和大小
                        gsap.to(pullDownDot, {
                            gap: '5px',
                            y: 0,
                            duration: 0.5,
                            ease: "elastic.out(1, 0.5)"
                        });
                        
                        pullDownDotSpans.forEach(span => {
                            gsap.to(span, {
                                width: '2px',
                                height: '2px',
                                duration: 0.5,
                                ease: "elastic.out(1, 0.5)"
                            });
                        });
                        
                        gsap.to(pullDownIcon, {
                            y: 0,
                            duration: 0.5,
                            ease: "elastic.out(1, 0.5)"
                        });
                        
                        // 计算拖动距离
                        const deltaY = Math.max(0, currentY.value - startY.value);
                        const adjustedDeltaY = deltaY - dragThreshold;
                        
                        // 只有当拖动距离超过阈值且足够距离时才考虑展开
                        if (deltaY >= dragThreshold && adjustedDeltaY >= pullDownThreshold) {
                            // 根据当前状态决定是展开还是收起
                            if (dropdownStates.value[sectionId]) {
                                // 确保下拉内容在DOM中的位置正确
                                if (pullDownContent.parentNode !== document.body) {
                                    document.body.appendChild(pullDownContent);
                                    // 重置下拉内容的样式，确保它可以正确显示
                                    pullDownContent.style.display = 'block';
                                    pullDownContent.style.visibility = 'visible';
                                }
                                
                                // 设置pull-down区域的透明度为0
                                gsap.to(element, {
                                    opacity: 0,
                                    duration: 0.2,
                                    ease: "power1.out"
                                });
                                
                                // 完全展开，放缓展开速度
                                gsap.to(pullDownContent, {
                                    height: '100vh',
                                    duration: 0.5, // 进一步增加展开时间
                                    ease: "power2.out", // 使用更平滑的缓动函数
                                    onComplete: () => {
                                        // 显示pull-up区域
                                        showPullUpArea(pullDownContent);
                                    }
                                });
                                
                                // 添加活动状态类
                                element.classList.add('active');
                                
                                // 添加点击其他区域关闭下拉内容的事件
                                setTimeout(() => {
                                    // 存储当前的closeDropdown处理函数
                                    window._currentCloseDropdownHandler = closeDropdown;
                                    document.addEventListener('click', closeDropdown);
                                }, 10);
                            } else {
                                // 完全收起
                                gsap.to(pullDownContent, {
                                    height: 0,
                                    duration: 0.6,
                                    ease: "power3.out",
                                    onComplete: () => {
                                        // 将下拉内容放回原位
                                        if (pullDownContent.parentNode !== element.parentNode) {
                                            element.parentNode.insertBefore(pullDownContent, element.nextSibling);
                                        }
                                        
                                        // 确保下拉内容的样式被重置
                                        pullDownContent.style.height = '0px';
                                        
                                        // 恢复pull-down区域的透明度
                                        gsap.to(element, {
                                            opacity: 1,
                                            duration: 0.3,
                                            ease: "power1.out"
                                        });
                                    }
                                });
                                
                                // 立即移除活动状态类和其他状态类，确保背景色立即消失
                                element.classList.remove('active');
                                element.classList.remove('pulling');
                                element.classList.remove('ready-to-release');
                            }
                        } else {
                            // 如果拖动距离不够，无论如何都收起
                            gsap.to(pullDownContent, {
                                height: 0,
                                duration: 0.6,
                                ease: "power3.out",
                                onComplete: () => {
                                    // 确保下拉内容的样式被重置
                                    pullDownContent.style.height = '0px';
                                    
                                    // 恢复pull-down区域的透明度
                                    gsap.to(element, {
                                        opacity: 1,
                                        duration: 0.3,
                                        ease: "power1.out"
                                    });
                                    
                                    // 移除恢复导航栏z-index的代码
                                }
                            });
                            
                            // 立即移除活动状态类和其他状态类，确保背景色立即消失
                            element.classList.remove('active');
                            element.classList.remove('pulling');
                            element.classList.remove('ready-to-release');
                            dropdownStates.value[sectionId] = false;
                        }
                        
                        // 阻止默认事件和事件冒泡
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    
                    // 关闭下拉内容的函数
                    function closeDropdown(e) {
                        // 如果点击的是当前下拉按钮或其内容，则不关闭
                        if (element.contains(e.target) || pullDownContent.contains(e.target)) {
                            return;
                        }
                        
                        // 恢复pull-down区域的透明度
                        gsap.to(element, {
                            opacity: 1,
                            duration: 0.3,
                            ease: "power1.out"
                        });
                        
                        // 隐藏pull-up区域
                        hidePullUpArea(pullDownContent);
                        
                        // 立即移除活动状态类和其他状态类，确保背景色立即消失
                        element.classList.remove('active');
                        element.classList.remove('pulling');
                        element.classList.remove('ready-to-release');
                        
                        // 动画收起下拉内容
                        gsap.to(pullDownContent, {
                            height: 0,
                            duration: 0.8, // 增加收起时间
                            ease: "power3.out",
                            onComplete: () => {
                                dropdownStates.value[sectionId] = false;
                                
                                // 将下拉内容放回原位
                                if (pullDownContent.parentNode !== element.parentNode) {
                                    element.parentNode.insertBefore(pullDownContent, element.nextSibling);
                                }
                                
                                // 确保下拉内容的样式被重置
                                pullDownContent.style.height = '0px';
                                
                                // 移除恢复导航栏z-index的代码
                            }
                        });
                        
                        // 移除事件监听
                        document.removeEventListener('click', closeDropdown);
                        window._currentCloseDropdownHandler = null;
                    }
                    
                    // 阻止默认事件和事件冒泡，防止拖动过程中选中文本
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // 阻止点击事件冒泡，确保只有下拉操作才能触发
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                
                // 阻止文本选择，防止拖动过程中选中文本
                element.addEventListener('selectstart', (e) => {
                    e.preventDefault();
                });
            });
            
            // 关闭所有其他下拉内容的函数
            function closeAllDropdowns(exceptId) {
                Object.keys(dropdownStates.value).forEach(key => {
                    if (key !== exceptId && dropdownStates.value[key]) {
                        const section = document.getElementById(key);
                        const pullDown = section?.querySelector('.pull-down');
                        const content = document.querySelector(`.pull-down-content[data-section="${key}"]`);
                        
                        if (pullDown && content) {
                            // 恢复pull-down区域的透明度
                            gsap.to(pullDown, {
                                opacity: 1,
                                duration: 0.3,
                                ease: "power1.out"
                            });
                            
                            // 隐藏pull-up区域
                            hidePullUpArea(content);
                            
                            // 立即移除活动状态类和其他状态类，确保背景色立即消失
                            pullDown.classList.remove('active');
                            pullDown.classList.remove('pulling');
                            pullDown.classList.remove('ready-to-release');
                            
                            dropdownStates.value[key] = false;
                            const pullDownIcon = pullDown.querySelector('.pull-down-icon .icon');
                            const pullDownDot = pullDown.querySelector('.pull-down-icon .dot');
                            const pullDownDotSpans = pullDown.querySelectorAll('.pull-down-icon .dot span');
                            
                            // 动画收起下拉内容
                            gsap.to(content, {
                                height: 0,
                                duration: 0.8,
                                ease: "power3.out",
                                onComplete: () => {
                                    // 将下拉内容放回原位
                                    if (content.parentNode !== pullDown.parentNode) {
                                        pullDown.parentNode.insertBefore(content, pullDown.nextSibling);
                                    }
                                    
                                    // 确保下拉内容的样式被重置
                                    content.style.height = '0px';
                                    content.style.display = 'none';
                                    content.style.visibility = 'hidden';
                                    
                                    // 移除恢复导航栏z-index的代码
                                }
                            });
                        }
                    }
                });
            }
        }

        // 显示pull-up区域
        function showPullUpArea(pullDownContent) {
            const pullUp = pullDownContent.querySelector('.pull-up');
            if (!pullUp) return;
            
            // 显示pull-up区域
            gsap.to(pullUp, {
                opacity: 1,
                visibility: 'visible',
                duration: 0.3,
                ease: "power1.out"
            });
        }
        
        // 隐藏pull-up区域
        function hidePullUpArea(pullDownContent) {
            const pullUp = pullDownContent.querySelector('.pull-up');
            if (!pullUp) return;
            
            // 隐藏pull-up区域
            gsap.to(pullUp, {
                opacity: 0,
                visibility: 'hidden',
                duration: 0.3,
                ease: "power1.out"
            });
        }
        
        // 初始化pull-up区域的事件
        function initPullUpEvents(pullUp, pullDownContent) {
            const sectionId = pullDownContent.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            const pullDown = section?.querySelector('.pull-down');
            
            const pullUpIcon = pullUp.querySelector('.pull-up-icon .icon');
            const pullUpDot = pullUp.querySelector('.pull-up-icon .dot');
            const pullUpDotSpans = pullUp.querySelectorAll('.pull-up-icon .dot span');
            
            // 上拉相关状态
            let isDraggingUp = false;
            let startYUp = 0;
            let currentYUp = 0;
            
            // 鼠标按下事件
            pullUp.addEventListener('mousedown', (e) => {
                isDraggingUp = true;
                startYUp = e.clientY;
                currentYUp = e.clientY;
                
                // 添加拖动状态类
                pullUp.classList.add('pulling');
                
                // 添加鼠标移动和松开事件
                document.addEventListener('mousemove', handleMouseMoveUp);
                document.addEventListener('mouseup', handleMouseUpUp);
                
                // 阻止默认事件和事件冒泡
                e.preventDefault();
                e.stopPropagation();
                
                // 处理鼠标移动
                function handleMouseMoveUp(e) {
                    if (!isDraggingUp) return;
                    
                    currentYUp = e.clientY;
                    
                    // 计算上拉距离（向上拉是负值，所以取反）
                    const deltaY = Math.max(0, startYUp - currentYUp);
                    
                    // 只有当拖动距离超过阈值时才开始显示上拉效果
                    if (deltaY >= dragThreshold) {
                        // 计算拉伸进度，最大为1
                        const stretchProgress = Math.min(1, deltaY / 100);
                        
                        // 根据拉伸进度调整padding-top
                        const paddingTop = 20 + stretchProgress * 10;
                        pullUp.style.paddingTop = `${paddingTop}px`;
                        
                        // 调整dot和icon的位置和大小
                        const translateY = -stretchProgress * 10;
                        
                        gsap.to(pullUpDot, {
                            y: translateY,
                            gap: 5 + stretchProgress * 4,
                            duration: 0.1,
                            ease: "power1.out"
                        });
                        
                        pullUpDotSpans.forEach(span => {
                            gsap.to(span, {
                                width: 2 + stretchProgress * 2,
                                height: 2 + stretchProgress * 2,
                                duration: 0.1,
                                ease: "power1.out"
                            });
                        });
                        
                        gsap.to(pullUpIcon, {
                            y: translateY,
                            duration: 0.1,
                            ease: "power1.out"
                        });
                        
                        // 如果拖动超过50%，添加可释放状态
                        if (stretchProgress > 0.5) {
                            pullUp.classList.add('ready-to-release');
                        } else {
                            pullUp.classList.remove('ready-to-release');
                        }
                    } else {
                        // 即使没有达到阈值，也给予一些视觉反馈
                        pullUp.classList.remove('ready-to-release');
                        
                        // 小幅度拉伸
                        const smallPaddingTop = Math.min(5, deltaY * 0.5);
                        pullUp.style.paddingTop = `${20 + smallPaddingTop}px`;
                        
                        // 小幅度移动dot和icon
                        const smallTranslateY = -deltaY * 0.25; // 最大2.5px
                        
                        gsap.to(pullUpDot, {
                            y: smallTranslateY,
                            duration: 0.1,
                            ease: "power1.out"
                        });
                        
                        gsap.to(pullUpIcon, {
                            y: smallTranslateY,
                            duration: 0.1,
                            ease: "power1.out"
                        });
                    }
                    
                    // 阻止默认事件和事件冒泡
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                // 处理鼠标松开
                function handleMouseUpUp(e) {
                    isDraggingUp = false;
                    document.removeEventListener('mousemove', handleMouseMoveUp);
                    document.removeEventListener('mouseup', handleMouseUpUp);
                    
                    // 移除拖动状态类
                    pullUp.classList.remove('pulling');
                    pullUp.classList.remove('ready-to-release');
                    
                    // 恢复padding-top
                    gsap.to(pullUp, {
                        paddingTop: '20px',
                        duration: 0.5,
                        ease: "elastic.out(1, 0.5)"
                    });
                    
                    // 恢复dot和icon的位置和大小
                    gsap.to(pullUpDot, {
                        gap: '5px',
                        y: 0,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.5)"
                    });
                    
                    pullUpDotSpans.forEach(span => {
                        gsap.to(span, {
                            width: '2px',
                            height: '2px',
                            duration: 0.5,
                            ease: "elastic.out(1, 0.5)"
                        });
                    });
                    
                    gsap.to(pullUpIcon, {
                        y: 0,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.5)"
                    });
                    
                    // 计算上拉距离
                    const deltaY = Math.max(0, startYUp - currentYUp);
                    
                    // 只有当上拉距离超过阈值时才收起内容
                    if (deltaY >= dragThreshold) {
                        // 隐藏pull-up区域
                        hidePullUpArea(pullDownContent);
                        
                        // 恢复pull-down区域的透明度
                        if (pullDown) {
                            gsap.to(pullDown, {
                                opacity: 1,
                                duration: 0.3,
                                ease: "power1.out"
                            });
                            
                            // 立即移除活动状态类和其他状态类，确保背景色立即消失
                            pullDown.classList.remove('active');
                            pullDown.classList.remove('pulling');
                            pullDown.classList.remove('ready-to-release');
                        }
                        
                        // 收起下拉内容
                        gsap.to(pullDownContent, {
                            height: 0,
                            duration: 0.6,
                            ease: "power3.out",
                            onComplete: () => {
                                // 重置下拉状态
                                dropdownStates.value[sectionId] = false;
                                
                                // 将下拉内容放回原位
                                if (pullDown && pullDownContent.parentNode !== pullDown.parentNode) {
                                    pullDown.parentNode.insertBefore(pullDownContent, pullDown.nextSibling);
                                }
                                
                                // 确保下拉内容的样式被重置
                                pullDownContent.style.height = '0px';
                                pullDownContent.style.display = 'none';
                                pullDownContent.style.visibility = 'hidden';
                                
                                // 移除活动状态类
                                if (pullDown) {
                                    pullDown.classList.remove('active');
                                }
                                
                                // 移除事件监听
                                if (window._currentCloseDropdownHandler) {
                                    document.removeEventListener('click', window._currentCloseDropdownHandler);
                                    window._currentCloseDropdownHandler = null;
                                }
                            }
                        });
                    }
                    
                    // 阻止默认事件和事件冒泡
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            // 阻止点击事件冒泡
            pullUp.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // 阻止文本选择
            pullUp.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });
        }


        // 初始化侧边栏动画
        function initSidebarAnimation() {
            // 设置初始状态 - 所有元素从左侧开始（不可见）
            gsap.set(".logo-name", {
                x: -100,
                opacity: 0
            });

            gsap.set(".nav-list li", {
                x: -100,
                opacity: 0,
                stagger: 0.1 // 每个元素之间的延迟
            });

            // 设置右下角滑动提示初始状态
            gsap.set(".slither", {
                y: 30,
                opacity: 0
            });

            // 创建动画时间轴
            const tl = gsap.timeline({ delay: 0.5 }); // 延迟0.5秒开始动画

            // Logo动画
            tl.to(".logo-name", {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            });

            // 导航项依次动画
            tl.to(".nav-list li", {
                x: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15, // 每个导航项之间的延迟
                ease: "power2.out"
            }, "-=0.4"); // 与前一个动画重叠0.4秒

            // 底部元素动画（如果有的话）
            tl.to(".nav-bottom", {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.2");

            // 右下角滑动提示动画
            tl.to(".slither", {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.3");
        }

        return {
            navList,
            slitherText,
            isShowPolicy,
            dropdownStates,
            closeAllDropdownsGlobal,
            resetAllDropdownStates
        }
    }
})

// 导出全局关闭所有下拉内容的函数
window.closeAllDropdownsGlobal = function() {
    if (app && app._instance) {
        const vm = app._instance.proxy;
        if (vm.closeAllDropdownsGlobal) {
            vm.closeAllDropdownsGlobal();
        }
    }
};

// 导出全局重置所有下拉内容状态的函数
window.resetAllDropdownStates = function() {
    if (app && app._instance) {
        const vm = app._instance.proxy;
        if (vm.resetAllDropdownStates) {
            vm.resetAllDropdownStates();
        }
    }
};

app.mount('#app')