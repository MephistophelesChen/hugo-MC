// 开场动画控制脚本
class OpeningAnimation {
  constructor() {
    this.animationContainer = document.getElementById('opening-animation');
    this.skipButton = document.getElementById('skip-animation');
    // no separate sun element any more; orbitCircle will do both jobs
    this.orbitCircle = null;        // the bottom-left day/night indicator
    this.themeToggle = null;        // fallback for visibility control
    this.animationTimer = null;
    this.isAnimating = false;
    this.started = false;          // user clicked to start
    this.init();
  }

  init() {
    // 不再检查历史观看状态，始终显示开场，单击后开始动画

    // grab orbit circle and fallback toggle
    this.orbitCircle = document.getElementById('orbit-circle');
    this.themeToggle = document.getElementById('theme-toggle');

    // if an old #sun-moon exists inside the SVG, remove it (legacy)
    const old = document.getElementById('sun-moon');
    if (old) old.remove();

    // 绑定事件
    this.bindEvents();

    // 显示遮罩层但不开始动画
    this.showStatic();
  }

  bindEvents() {
    if (this.skipButton) {
      this.skipButton.addEventListener('click', () => {
        this.skipAnimation();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.skipAnimation();
      }
    });

    if (this.animationContainer) {
      // clicking anywhere on container begins animation (if not started) or skips
      this.animationContainer.addEventListener('mousedown', (e) => {
        if (!this.started) {
          this.triggerAnimation();
        } else {
          this.skipAnimation();
        }
      });
      this.animationContainer.addEventListener('touchstart', (e) => {
        if (!this.started) {
          this.triggerAnimation();
        } else {
          this.skipAnimation();
        }
      });
    }
  }

  showStatic() {
    // only initialise mask-related layout if container exists
    if (this.animationContainer) {
      // display the cover layer but don't run any movement yet
      this.animationContainer.style.display = 'flex';
      this.animationContainer.classList.remove('play');
      this.animationContainer.style.opacity = '1';

      // position orbit circle in the centre and make sure it is visible
      if (this.orbitCircle) {
        this.moveOrbitToCenter();
        this.orbitCircle.style.opacity = '1';
      }

    }
  }

  moveOrbitToCenter() {
    if (!this.orbitCircle) return;
    const rect = this.orbitCircle.getBoundingClientRect();
    const dx = window.innerWidth/2 - (rect.left + rect.width/2);
    const dy = window.innerHeight/2 - (rect.top + rect.height/2);
    // start smaller so it scales up as it moves
    this.orbitCircle.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
  }

  triggerAnimation() {
    if (this.isAnimating) return;
    this.started = true;
    this.isAnimating = true;

    // make container visible and mark as playing
    this.animationContainer.style.display = 'flex';
    this.animationContainer.classList.add('play');

    // animate orbit circle from its centred start to the resting position
    if (this.orbitCircle) {
      this.orbitCircle.animate([
        {transform: this.orbitCircle.style.transform || 'none'},
        {transform: 'translate(0, 0) scale(1)'}
      ], {duration: 1500, easing: 'ease-in-out', fill: 'forwards'});
    }

    // animate each group downward with depth-based durations
    const groups = document.querySelectorAll('#landscape-scroll g[data-depth]');
    let maxDuration = 0;
    groups.forEach(g => {
      const depth = parseFloat(g.getAttribute('data-depth')) || 1;
      const distance = window.innerHeight + 200;
      // depth value: larger = visually closer, so should move faster (shorter duration)
      // use a simple mapping where far objects (depth<1) take longer
      const duration = 2000 + (2 - depth) * 1500;
      if (duration > maxDuration) maxDuration = duration;
      g.animate([
        {transform: 'translateY(0)'},
        {transform: `translateY(${distance}px)`}
      ], {duration, easing: 'ease-out', fill: 'forwards'});
    });

    // begin fading the mask to match group motion duration
    if (this.animationContainer) {
      this.animationContainer.style.transition = `opacity ${maxDuration}ms ease-out`;
      this.animationContainer.style.opacity = '0';
    }

    // schedule cleanup after the full motion interval
    this.animationTimer = setTimeout(() => {
      this.completeAnimation();
    }, maxDuration + 100);
  }

  skipAnimation() {
    if (!this.isAnimating) return;

    clearTimeout(this.animationTimer);
    // ensure any overlay removal
    if (this.animationContainer) {
      this.animationContainer.classList.remove('play');
      this.animationContainer.style.opacity = '0';
    }
    this.completeAnimation();
  }

  completeAnimation() {
    this.isAnimating = false;
    this.animationContainer.style.display = 'none';
    this.animationContainer.classList.remove('play');
    document.body.classList.add('loaded');

    if (this.orbitCircle) {
      this.orbitCircle.style.opacity = '';
    }

    // 保存已看过动画的状态
    this.saveAnimationStatus();
  }

  // persistence methods retained if needed
  hasSeenAnimation() {
    return false; // disabled
  }

  saveAnimationStatus() {
    // no-op
  }

  dispatchEvent(eventName) {
    const event = new CustomEvent(eventName, {
      detail: {
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
  }

  // 公共方法
  showAnimation() {
    // expose manually starting the animation if needed
    this.triggerAnimation();
  }

  hideAnimation() {
    this.completeAnimation();
  }

  isAnimationVisible() {
    return this.animationContainer.style.display !== 'none';
  }
}

// 页面加载时初始化
window.addEventListener('load', () => {
  new OpeningAnimation();
});

// 提供全局访问
window.OpeningAnimation = OpeningAnimation;