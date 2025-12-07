
import { MoodType } from './types';
import { 
  Heart, Sun, Smile, Coffee, CloudRain, Star, Shield, Anchor, Feather,
  Zap, Music, Camera, Flame, Gift, Flower, Bird, Book
} from 'lucide-react';

export const APP_NAME = "值得日记";

// Base mood config (Legacy support)
export const MOOD_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  grateful: { label: '感激', color: 'text-amber-500', icon: Heart },
  happy: { label: '开心', color: 'text-rose-500', icon: Smile },
  calm: { label: '平静', color: 'text-teal-500', icon: Feather },
  proud: { label: '自豪', color: 'text-purple-500', icon: Star },
  loved: { label: '被爱', color: 'text-pink-500', icon: Heart },
  hopeful: { label: '希望', color: 'text-sky-500', icon: Sun },
  sad: { label: '难过', color: 'text-blue-400', icon: CloudRain },
  anxious: { label: '焦虑', color: 'text-orange-400', icon: Shield },
  neutral: { label: '一般', color: 'text-stone-400', icon: Anchor },
};

export const MOOD_ICONS: Record<string, any> = {
  Heart, Sun, Smile, Coffee, CloudRain, Star, Shield, Anchor, Feather,
  Zap, Music, Camera, Flame, Gift, Flower, Bird, Book
};

export const DEFAULT_TAGS = [
  '自我关怀', '陌生人的善意', '家人', '工作成就', 
  '自然', '小确幸', '友情', '学习成长', '休息'
];

// Helper to get color from score 0-100
// 0-35: Sadness (Blue)
// 36-65: Calm (Teal/Mint)
// 66-100: Joy (Amber/Yellow)
export const getMoodColorHex = (score: number) => {
  if (score <= 35) {
    // Blue gradient
    if (score <= 15) return '#3b82f6'; // Blue 500
    return '#60a5fa'; // Blue 400
  } 
  if (score <= 65) {
    // Teal/Mint for Calm
    if (score <= 50) return '#2dd4bf'; // Teal 400
    return '#34d399'; // Emerald 400
  }
  // Amber/Yellow for Joy
  if (score <= 85) return '#fbbf24'; // Amber 400
  return '#fcd34d'; // Amber 300
};

export const getMoodColorClass = (score: number) => {
  if (score <= 35) return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200';
  if (score <= 65) return 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200';
  return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200';
};

// 中文鼓励语库
export const AFFIRMATION_LIBRARY = {
  general: [
    "你仅仅是因为存在，就值得被爱。今天的记录就是最好的证明。",
    "记录下这些瞬间，是在为你的内心建造一座城堡。你做得很好。",
    "你收到的每一份善意，都是你在这个世界上散发光芒的反射。",
    "接受爱是安全的，你值得拥有这一份温暖。",
    "你的感受是真实的，你的经历很重要。谢谢你把它们记录下来。",
    "能发现生活中的美好是一种超能力，你正在心中培育一座花园。",
    "当下的你，就是最好的你，这就足够了。",
    "愿这份记忆成为你感到迷茫时的一个温柔锚点。",
    "因为有你，这个世界变得更好了。这一刻就是证明。",
    "你值得被爱，值得归属，值得快乐。"
  ],
  social: [
    "人与人的连接是珍贵的，很高兴看到你被支持着。",
    "你吸引了善意，是因为你内心本就充满善意。",
    "允许别人关心你，既是脆弱的展现，也是力量的象征。",
    "你是大家珍视的一员，这次互动证明了这一点。",
    "关系是镜子，这份爱反射出了你原本可爱的模样。",
    "珍惜这份羁绊，它是你美好人格的见证。",
    "依靠别人是可以的，你不需要独自承担所有重量。",
    "你的存在对他人产生了积极的影响，所以他们才会靠近。",
    "你被看见了，被听见了，也被欣赏着。",
    "把这份连接的温暖，好好收藏在心里吧。"
  ],
  achievement: [
    "你的努力被看见并得到了认可，为你感到骄傲。",
    "你拥有惊人的潜力，这只是其中一个小小的证明。",
    "你的价值不由产出定义，但庆祝自己的胜利真的很棒。",
    "花点时间，好好沉浸在这份成就感里吧。",
    "你每天都在成长，回头看看你已经走了多远。",
    "这次成功是你专注和精神的体现。",
    "庆祝一下吧！你理应为自己的所作所为感到高兴。",
    "你独特的才华为这个世界带来了价值。",
    "跬步千里，你正走在正确的道路上。",
    "相信你的能力，你处理得非常漂亮。"
  ],
  difficult: [
    "即使在艰难时刻，你也值得被温柔以待。",
    "这份韧性证明了你内心的力量。",
    "对自己温柔一点，你已经尽力在应对了。",
    "看见痛苦本身就是一种爱，谢谢你愿意面对它。",
    "给你一个大大的拥抱。面对这些的你，真的很勇敢。",
    "情绪是暂时的，但你的价值是永恒的。",
    "像对待最好的朋友那样对待自己吧，允许悲伤流淌。",
    "你是安全的，你是被爱的，你会度过难关的。",
    "这一切都会过去。现在，只需呼吸，知道你很重要。",
    "承认痛苦是疗愈的第一步，你正在做这件重要的事。"
  ],
  calm: [
    "在这份宁静中，你与自己完美的同在。",
    "平静不是空无一物，而是万物共存的和谐。",
    "你的呼吸就是此刻最好的锚点。",
    "享受这份安宁吧，这是你内心秩序的体现。",
    "不需要做任何事，只需要'存在'，这就很美。",
    "像平静的湖面一样，你拥有包容一切的深度。",
    "在喧嚣的世界里找到这份宁静，是你送给自己的礼物。",
    "平衡是一种动态的艺术，你掌握得很好。",
    "此刻，万物静默，你被温柔地托举着。",
    "这就是内心之家的感觉，安全、温暖、宁静。"
  ],
  image: [
    "这张照片定格了美好的瞬间，真好。",
    "图片让回忆变得鲜活，谢谢你记录下这一刻。",
    "看着这张照片，是不是还能感受到当时的温度？",
    "生活中的美，被你敏锐的眼睛捕捉到了。",
    "这一瞬间的光影，是你值得被爱的见证。"
  ],
  new_tag: [
    "探索新的体验是成长的标志，为你高兴！",
    "你正在拓展生命的宽度，真棒。",
    "新的标签，代表着你发现了新的被爱的方式。",
    "你的世界正在变得越来越丰富。"
  ]
};

// 随机短句
export const EXTRA_AFFIRMATIONS = Array.from({ length: 60 }, (_, i) => [
  "你是一件正在创作中的杰作。",
  "你的潜力是无限的。",
  "散发积极的光芒，它会回馈于你。",
  "你值得所有正在向你走来的美好。",
  "拥抱你的旅程，它是独一无二的。",
  "你比想象中更强大。",
  "让你的光芒闪耀吧。",
  "你被爱的程度超乎你想象。",
  "内心的平静始于自己。",
  "快乐非常适合你。"
][i % 10]);

export const GREETINGS = [
  "欢迎回来。今天内心的天气如何？",
  "嗨，朋友。每一种情绪都是生命的色彩。",
  "今天也是收集美好碎片的一天。",
  "深呼吸。在这里，所有的感受都被接纳。",
  "让我们一起记录真实的当下。",
  "你的内心是一座花园，今天开出了什么花？",
  "无论晴雨，你的存在本身就很美好。"
];
