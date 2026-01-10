// 获取Canvas元素和上下文
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// 鼠标设置 - 只在按住时吸引（降低强度和范围）
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 120,           // 减小作用范围
    strength: 0.0004,      // 降低吸引强度
    isActive: false,
    isPressed: false
};

// 粒子数组 - 固定120个粒子
let particles = [];

// 定义红蓝紫白四种颜色 (RGB格式)
const colors = [
    { r: 255, g: 107, b: 107 }, // 红色
    { r: 51, g: 154, b: 240 },  // 蓝色
    { r: 204, g: 93, b: 232 },  // 紫色
    { r: 255, g: 255, b: 255 }  // 白色
];

// 粒子类
class Particle {
    constructor() {
        // 随机初始位置
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        // 极慢速：初始速度范围 (0.1-0.5 px/帧)
        this.vx = (Math.random() - 0.5) * 0.4 + 0.05;
        this.vy = (Math.random() - 0.5) * 0.4 + 0.05;
        
        // 随机大小
        this.size = Math.random() * 2.5 + 1;
        this.baseSize = this.size;
        
        // 极慢速：极小随机加速度 (±0.01)
        this.ax = 0;
        this.ay = 0;
        
        // 强摩擦力 (0.94)
        this.friction = 0.94;
        
        // 低最大速度 (1.8 px/帧)
        this.maxSpeed = 1.8;
        
        // 颜色相关
        this.colorIndex = Math.floor(Math.random() * colors.length);
        this.targetColorIndex = (this.colorIndex + 1) % colors.length;
        this.colorProgress = Math.random();
        this.colorSpeed = Math.random() * 0.0002 + 0.0002;
        
        // 极慢摆动参数
        this.wobbleX = Math.random() * Math.PI * 2;
        this.wobbleY = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.005 + 0.003;
        this.wobbleAmount = Math.random() * 0.15 + 0.05;
    }
    
    // 获取当前颜色
    getCurrentColor() {
        const fromColor = colors[this.colorIndex];
        const toColor = colors[this.targetColorIndex];
        
        const r = Math.floor(fromColor.r + (toColor.r - fromColor.r) * this.colorProgress);
        const g = Math.floor(fromColor.g + (toColor.g - fromColor.g) * this.colorProgress);
        const b = Math.floor(fromColor.b + (toColor.b - fromColor.b) * this.colorProgress);
        
        return { r, g, b };
    }
    
    // 更新颜色
    updateColor() {
        this.colorProgress += this.colorSpeed;
        
        if (this.colorProgress >= 1) {
            this.colorProgress = 0;
            this.colorIndex = this.targetColorIndex;
            this.targetColorIndex = (this.targetColorIndex + 1) % colors.length;
        }
    }
    
    // 更新粒子位置和状态
    update() {
        // 更新颜色
        this.updateColor();
        
        // 更新摆动
        this.wobbleX += this.wobbleSpeed;
        this.wobbleY += this.wobbleSpeed;
        
        // 极小随机加速度
        this.ax += (Math.random() - 0.5) * 0.01;
        this.ay += (Math.random() - 0.5) * 0.01;
        
        // 应用加速度到速度
        this.vx += this.ax;
        this.vy += this.ay;
        
        // 应用摆动
        this.x += Math.sin(this.wobbleX) * this.wobbleAmount;
        this.y += Math.cos(this.wobbleY) * this.wobbleAmount;
        
        // 关键修改：只在鼠标按下时计算吸引力（更温和的吸引力）
        if (mouse.isPressed && mouse.isActive) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // 更温和的衰减曲线
                const force = Math.pow((mouse.radius - distance) / mouse.radius, 1.2);
                
                // 降低吸引力强度
                this.vx += dx * mouse.strength * force * 0.8;
                this.vy += dy * mouse.strength * force * 0.8;
                
                // 被吸引的粒子稍微变大（更轻微）
                this.size = Math.min(this.baseSize * 1.3, this.size + force * 0.05);
                
                // 轻微降低摩擦力
                this.vx *= 0.98;
                this.vy *= 0.98;
            } else {
                // 不在吸引范围内的粒子恢复大小
                this.size = Math.max(this.baseSize, this.size * 0.99);
            }
        } else {
            // 鼠标未按下时，恢复原始大小和正常摩擦力
            this.size = Math.max(this.baseSize, this.size * 0.99);
            this.vx *= this.friction;
            this.vy *= this.friction;
        }
        
        // 限制最大速度
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        // 应用加速度衰减
        this.ax *= 0.9;
        this.ay *= 0.9;
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 边界反弹
        const bounceDamping = 0.9;
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx) * bounceDamping;
        } else if (this.x > canvas.width) {
            this.x = canvas.width;
            this.vx = -Math.abs(this.vx) * bounceDamping;
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy) * bounceDamping;
        } else if (this.y > canvas.height) {
            this.y = canvas.height;
            this.vy = -Math.abs(this.vy) * bounceDamping;
        }
    }
    
    // 绘制粒子
    draw() {
        const color = this.getCurrentColor();
        
        // 绘制粒子发光效果
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
        glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // 绘制粒子主体
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fill();
    }
}

// 初始化120个粒子
function initParticles() {
    particles = [];
    const particleCount = 120;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// 绘制连接线
function drawConnections() {
    const maxDistance = 120; // 减小连接距离
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const opacity = 0.25 * (1 - distance / maxDistance); // 降低不透明度
                const lineWidth = 0.4 * (1 - distance / maxDistance); // 减小线宽
                
                const color1 = particles[i].getCurrentColor();
                const color2 = particles[j].getCurrentColor();
                
                // 创建渐变连接线
                const gradient = ctx.createLinearGradient(
                    particles[i].x, particles[i].y,
                    particles[j].x, particles[j].y
                );
                
                gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${opacity})`);
                gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${opacity})`);
                
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        }
    }
}

// 动画循环
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = currentTime - lastTime;
    if (deltaTime < interval) return;
    lastTime = currentTime - (deltaTime % interval);
    
    // 清除画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 增加拖尾效果
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 更新和绘制所有粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // 绘制粒子之间的连接线
    drawConnections();
}

// 事件监听
window.addEventListener('mousedown', () => {
    mouse.isPressed = true;
});

window.addEventListener('mouseup', () => {
    mouse.isPressed = false;
});

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    mouse.isActive = true;
});

// 触摸事件
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mouse.isPressed = true;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.isActive = true;
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', () => {
    mouse.isPressed = false;
});

window.addEventListener('touchcancel', () => {
    mouse.isPressed = false;
});

// 鼠标离开/进入窗口
window.addEventListener('mouseout', () => {
    mouse.isActive = false;
    mouse.isPressed = false;
});

window.addEventListener('mouseenter', () => {
    mouse.isActive = true;
});

window.addEventListener('resize', () => {
    resizeCanvas();
    particles = [];
    initParticles();
});

// 鼠标光环效果（可选）
function createMouseHalo() {
    const halo = document.getElementById('mouseHalo');
    if (!halo) return;
    
    document.addEventListener('mousemove', (e) => {
        halo.style.left = e.clientX + 'px';
        halo.style.top = e.clientY + 'px';
        halo.style.width = '100px';
        halo.style.height = '100px';
    });
    
    document.addEventListener('mouseleave', () => {
        halo.style.width = '0px';
        halo.style.height = '0px';
    });
    
    document.addEventListener('mouseenter', () => {
        halo.style.width = '100px';
        halo.style.height = '100px';
    });
}

// 初始化
function init() {
    initParticles();
    createMouseHalo();
    animate(0);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

