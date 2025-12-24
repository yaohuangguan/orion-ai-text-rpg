import { Language } from '../types';

export const translations = {
  en: {
    statusTitle: "Status Monitor",
    hp: "HP",
    money: "Credits/Gold",
    location: "Location",
    inventoryTitle: "Inventory",
    emptyInventory: "Empty Storage",
    missionTitle: "Mission Log",
    noMissions: "No active missions",
    combatEngaged: "Combat Mode Engaged",
    inputPlaceholder: "What do you want to do?",
    waiting: "Waiting for response...",
    you: "YOU",
    system: "SYSTEM",
    // Setup
    gameTitle: "Infinite AI RPG",
    intro: "Experience an infinite text-based RPG powered by Gemini. Everything is generated in real-time.",
    selectLang: "Language / 语言",
    themeLabel: "Game Theme",
    charLabel: "Character Archetype",
    startBtn: "Start Adventure",
    loadBtn: "Load Save Game",
    saveBtn: "Save Game",
    saveSuccess: "Game State Saved",
    themes: {
      cyberpunk: "Cyberpunk (Neo-Shanghai)",
      medieval: "Medieval Fantasy (Witcher Style)",
      fantasy: "High Fantasy (Dungeons)",
      apocalypse: "Post-Apocalyptic (Wasteland)",
      custom: "Custom..."
    },
    chars: {
      mercenary: "Mercenary / Warrior",
      hacker: "Hacker / Mage",
      survivor: "Survivor / Rogue",
      custom: "Custom..."
    },
    customPlaceholder: "Enter custom...",
    // Auth & Limit
    loginBtn: "LOGIN / REGISTER",
    logoutBtn: "LOGOUT",
    guestWarning: "GUEST MODE: Limited to 5 actions.",
    limitReachedTitle: "Neural Link Depleted",
    limitReachedDesc: "Free trial actions exhausted. Establish a permanent connection (Login) to continue your journey.",
    auth: {
      loginTitle: "Access Neural Net",
      registerTitle: "New Identity Registration",
      emailPlace: "Email / Phone",
      passPlace: "Password",
      passConfPlace: "Confirm Password",
      namePlace: "Display Name",
      phonePlace: "Phone (Optional)",
      submitLogin: "Connect",
      submitRegister: "Register Identity",
      switchReg: "Need an account? Register",
      switchLog: "Have an account? Login",
      success: "Connection Established",
      actionCount: "Actions Remaining"
    }
  },
  zh: {
    statusTitle: "状态监测",
    hp: "生命值",
    money: "信用点/金币",
    location: "当前位置",
    inventoryTitle: "背包物品",
    emptyInventory: "背包为空",
    missionTitle: "任务日志",
    noMissions: "暂无活跃任务",
    combatEngaged: "战斗模式已启动",
    inputPlaceholder: "你想做什么？",
    waiting: "等待响应...",
    you: "你",
    system: "系统",
    // Setup
    gameTitle: "无限 AI RPG",
    intro: "体验由 Gemini 驱动的无尽冒险。每一个角色、物品和任务都是实时生成的。",
    selectLang: "Language / 语言",
    themeLabel: "游戏题材",
    charLabel: "角色设定",
    startBtn: "开始冒险",
    loadBtn: "读取存档",
    saveBtn: "保存进度",
    saveSuccess: "游戏进度已保存",
    themes: {
      cyberpunk: "赛博朋克 (新上海)",
      medieval: "中世纪奇幻 (巫师/博德之门风格)",
      fantasy: "奇幻史诗 (地下城)",
      apocalypse: "末日生存 (废土)",
      custom: "自定义..."
    },
    chars: {
      mercenary: "雇佣兵 / 战士",
      hacker: "黑客 / 法师",
      survivor: "幸存者 / 潜行者",
      custom: "自定义..."
    },
    customPlaceholder: "输入自定义内容...",
    // Auth & Limit
    loginBtn: "登录 / 注册",
    logoutBtn: "退出登录",
    guestWarning: "游客模式：仅限 5 次操作",
    limitReachedTitle: "神经链接耗尽",
    limitReachedDesc: "免费试用次数已用完。建立永久连接（登录）以继续您的冒险。",
    auth: {
      loginTitle: "接入神经网络",
      registerTitle: "注册新身份",
      emailPlace: "邮箱 / 手机号",
      passPlace: "密码",
      passConfPlace: "确认密码",
      namePlace: "显示名称",
      phonePlace: "手机号 (选填)",
      submitLogin: "连接",
      submitRegister: "注册身份",
      switchReg: "没有账号？去注册",
      switchLog: "已有账号？去登录",
      success: "连接建立成功",
      actionCount: "剩余行动点"
    }
  }
};

export const getText = (lang: Language, key: keyof typeof translations['en']) => {
  return translations[lang][key] || translations['en'][key];
};
