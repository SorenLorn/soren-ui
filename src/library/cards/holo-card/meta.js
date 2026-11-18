export default {
  name: 'Holo Card',
  description: '全息镭射卡：WebGL 纹理 + 指针倾斜，内置 12 种闪光花纹，支持双面翻转与静态降级；详情页内置换图 / 调光交互台。',
  icon: 'Sparkles',
  status: 'stable',
  since: '2026-11',
  related: ['cards/card', 'cards/metric-card'],
  notes: [
    {
      title: '替换卡牌',
      text: '三种投放方式共用同一条图片管线：拖拽图片到左侧卡牌区（拖入时出现蓝色虚线框与「松手替换卡面」提示）、点「选择图片」、或在页面内 Ctrl / ⌘ + V 粘贴。先做体积与魔数双校验，再解码并按 63 : 88 裁切、降采样到 2048px 以内，随后用新的 object URL 换掉卡面并递增 imageKey 强制重传纹理；成功后状态栏的文件名 / 纹理尺寸 / 上传体积 / 编码同步刷新。'
    },
    {
      title: '切换光影花纹',
      text: '下拉框分两组：「烟花纹 / OPCG 闪光」（bursts、crystal、grate、ripple、diagonal）与「原有其它预设」（stars、shards、cosmos、rainbow、swirl、glitter、gold）。选中即写入着色器参数，卡面立即变化，不会重新解码图片，也不重置已调整的强度与密度。'
    },
    {
      title: '加深光纹',
      text: '「箔面强度」0 ~ 1 控制全息箔的显影程度，数值越大高光与干涉色越重；「图案密度」0.5 ~ 2 控制花纹在卡面上的重复尺度，越大纹理越细密。两者都只更新着色器参数，实时生效，与当前卡面、当前预设互不影响。'
    },
    {
      title: '状态与联动',
      text: '状态胶囊由两侧共同决定：左侧是图片处理阶段（待投放 / 校验中 / 解码中 / 就绪），右侧是渲染状态（空卡 / 上传纹理 / 实时渲染 / 异常）；进度条在校验、解码或纹理上传期间走脉冲，渲染完成后填满。更换卡面只影响图片一侧，切换光纹与调整强度只影响着色器一侧；底部 Pikachu / Mew / Maushold 按钮会一次性同时切换卡面与预设（bursts / glitter / rainbow），顶部「重置」则还原整个示例。'
    }
  ],
  props: [
    { name: 'image', type: 'string', description: '卡面图片地址（http / blob / data URL）' },
    { name: 'backImage', type: 'string', description: '背面图片，传入后卡片可点击翻转' },
    { name: 'alt', type: 'string', default: "''", description: '无障碍名称' },
    {
      name: 'preset',
      type: "'bursts' | 'stars' | 'shards' | 'cosmos' | 'rainbow' | 'swirl' | 'glitter' | 'gold' | 'crystal' | 'grate' | 'ripple' | 'diagonal'",
      default: "'bursts'",
      description: '闪光花纹预设'
    },
    { name: 'intensity', type: 'number', default: '0.85', description: '箔面强度，0 ~ 1' },
    { name: 'scale', type: 'number', default: '1', description: '花纹密度，0.25 ~ 4' },
    { name: 'edgeSparkle', type: 'number', default: '0.8', description: '边缘闪光强度，0 ~ 1' },
    { name: 'frame', type: 'number', default: '4', description: '边框宽度（百分比，0 ~ 20）' },
    { name: 'glare', type: 'number', default: '0.5', description: '高光反光强度，0 ~ 1' },
    { name: 'foilColor', type: 'string', default: "'#e2e6ec'", description: '箔面基色' },
    { name: 'width', type: 'number', default: '320', description: '卡片宽度（px）' },
    { name: 'radius', type: 'number', default: '14', description: '圆角（px）' },
    { name: 'tiltMax', type: 'number', default: '14', description: '最大倾斜角度（度）' },
    { name: 'hoverScale', type: 'number', default: '1.04', description: '悬停放大比例' },
    { name: 'idle', type: 'boolean', default: 'true', description: '是否在无交互时播放缓慢自转' },
    { name: 'shadow', type: 'boolean', default: 'true', description: '是否显示投影' },
    { name: 'className', type: 'string', default: "''", description: '追加样式类' },
    { name: 'style', type: 'CSSProperties', description: '追加内联样式' },
    { name: 'imageKey', type: 'string | number', description: '同一地址需要强制重新加载纹理时传入' },
    {
      name: 'ratioMode',
      type: "'auto' | 'fixed'",
      default: "'auto'",
      description: 'auto 跟随图片比例，fixed 锁定卡面比例避免换图跳变'
    },
    { name: 'maxTexture', type: 'number', default: '2048', description: '纹理最长边上限，不超过 GPU 上限' },
    { name: 'onStateChange', type: 'HoloStatus => void', description: '渲染状态变化回调：idle / loading / ready / error' },
    { name: 'onError', type: 'HoloErrorInfo => void', description: '解码或 WebGL 失败时的回调' }
  ]
};
