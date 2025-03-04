<template>
  <Transition name="fade">
    <div
      v-show="showBackTop"
      class="vitepress-backTop-main"
      title="返回顶部"
      @click="scrollToTop()"
    >
      <svg class="progress-ring" width="72" height="72">
        <circle
          class="progress-ring-background"
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          stroke-width="5"
        />
        <circle
          class="progress-ring-progress"
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke="#fff"
          stroke-width="5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
        />
      </svg>

      <img src="/icon/backtotop.svg" alt="ICO 图标" class="icon-img">
    </div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

// 是否显示返回顶部按钮
const showBackTop = ref(false);

const scrollProgress = ref(0);
const radius = 30;
const circumference = 2 * Math.PI * radius; 
const progressOffset = ref(circumference);

// 滚动事件（更新进度条 & 控制按钮显示）
const onScroll = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = scrollTop / scrollHeight;
  progressOffset.value = circumference * (1 - scrollProgress.value);
  showBackTop.value = scrollTop > 100;
};


function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
/* 返回顶部按钮 */
.vitepress-backTop-main {
  z-index: 999;
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #3eaf7c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 10px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
}

/* 圆形图标 */
.icon-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

/* 悬停效果 */
.vitepress-backTop-main:hover {
  background-color: #2c8c5a;
  box-shadow: 4px 4px 14px 6px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

/* 点击效果 */
.vitepress-backTop-main:active {
  transform: scale(0.9);
}

/* 进度条 SVG */
.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}


.progress-ring-background {
  stroke-width: 5;
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.2s linear;
}
</style>
