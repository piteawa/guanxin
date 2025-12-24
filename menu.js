// menu.js - 支持外链的菜单交互
document.addEventListener('DOMContentLoaded', function() {
    // 元素选择器
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const dropdowns = document.querySelectorAll('.dropdown');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 移动端菜单切换
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // 汉堡菜单动画
        const lines = this.querySelectorAll('.hamburger-line');
        if (navMenu.classList.contains('active')) {
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    });
    
    // 移动端遮罩点击关闭菜单
    mobileOverlay.addEventListener('click', function() {
        navMenu.classList.remove('active');
        this.classList.remove('active');
        hamburger.classList.remove('active');
        
        const lines = hamburger.querySelectorAll('.hamburger-line');
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
        
        // 关闭所有下拉菜单
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
    
    // 移动端下拉菜单切换（只处理没有外链的下拉菜单）
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            // 检查是否有外链（href不为#且不是锚点链接）
            const hasExternalLink = link.getAttribute('href') && 
                                   !link.getAttribute('href').startsWith('#') && 
                                   link.getAttribute('href') !== '#';
            
            if (!hasExternalLink) {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // 关闭其他打开的下拉菜单
                        dropdowns.forEach(other => {
                            if (other !== dropdown) {
                                other.classList.remove('active');
                            }
                        });
                        
                        // 切换当前下拉菜单
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
    }
    
    // 点击导航链接时更新激活状态（处理内链和外链）
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是外链，直接跳转
            if (this.getAttribute('href') && 
                !this.getAttribute('href').startsWith('#') && 
                this.getAttribute('href') !== '#') {
                return; // 让浏览器处理跳转
            }
            
            if (window.innerWidth <= 768) {
                // 移动端点击非下拉菜单项时关闭菜单
                if (!this.closest('.dropdown')) {
                    navMenu.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                    hamburger.classList.remove('active');
                    
                    const lines = hamburger.querySelectorAll('.hamburger-line');
                    lines[0].style.transform = 'none';
                    lines[1].style.opacity = '1';
                    lines[2].style.transform = 'none';
                }
            }
            
            // 如果是锚点链接，更新激活状态
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // 平滑滚动到目标位置
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新激活状态
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            } else if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                // 空链接或#链接，只更新激活状态
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // 窗口大小改变时重置菜单状态
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburger.classList.remove('active');
            
            const lines = hamburger.querySelectorAll('.hamburger-line');
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
            
            // 重置下拉菜单状态
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // 页面加载时根据当前URL设置激活状态
    function setActiveLinkByUrl() {
        const currentUrl = window.location.pathname;
        const currentHash = window.location.hash;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // 匹配页面路径
            if (link.getAttribute('href') === currentUrl || 
                (currentUrl === '/' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
            
            // 匹配锚点
            if (currentHash && link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            }
        });
    }
    
    // 初始设置激活状态
    setActiveLinkByUrl();
});
