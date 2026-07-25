(function(root, factory) {
    const library = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = library;
    }
    root.HANZI_LIBRARY = library;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    return [
    // 4-1
    { char: '豆', type: 'noun', word: '豆', emoji: '🫘', hint: '颗颗豆子' },
    { char: '用', type: 'verb', word: '使用', emoji: '🛠️', hint: '学会使用' },
    { char: '力', type: 'noun', word: '力', emoji: '💪', hint: '力气' },
    { char: '办', type: 'verb', word: '办法', emoji: '💡', hint: '想个办法' },
    { char: '法', type: 'noun', word: '方法', emoji: '💡', hint: '找到方法' },
    { char: '请', type: 'verb', word: '请坐', emoji: '🪑', hint: '有礼貌地请坐' },
    // 4-2
    { char: '才', type: 'noun', word: '刚才', emoji: '⏱️', hint: '就在刚才' },
    { char: '睡', type: 'verb', word: '睡觉', emoji: '😴', hint: '安心睡' },
    { char: '左', type: 'noun', word: '左', emoji: '⬅️', hint: '左边' },
    { char: '右', type: 'noun', word: '右', emoji: '➡️', hint: '右边' },
    { char: '只', type: 'noun', word: '一只', emoji: '🐦', hint: '一只小鸟' },
    { char: '旁', type: 'noun', word: '旁边', emoji: '↔️', hint: '就在旁边' },
    // 4-3
    { char: '龟', type: 'noun', word: '龟', emoji: '🐢', hint: '慢慢乌龟' },
    { char: '脖', type: 'noun', word: '脖子', emoji: '🧣', hint: '围住脖子' },
    { char: '壳', type: 'noun', word: '贝壳', emoji: '🐚', hint: '漂亮贝壳' },
    { char: '安', type: 'noun', word: '安全', emoji: '🛡️', hint: '平平安安' },
    { char: '事', type: 'noun', word: '事情', emoji: '📋', hint: '做好事情' },
    { char: '命', type: 'noun', word: '生命', emoji: '🌱', hint: '珍爱生命' },
    // 4-4
    { char: '睛', type: 'noun', word: '眼睛', emoji: '👀', hint: '明亮眼睛' },
    { char: '嘴', type: 'noun', word: '嘴巴', emoji: '👄', hint: '小小嘴巴' },
    { char: '肚', type: 'noun', word: '肚子', emoji: '🤰', hint: '圆圆肚子' },
    { char: '害', type: 'verb', word: '害怕', emoji: '😨', hint: '不用害怕' },
    { char: '保', type: 'verb', word: '保护', emoji: '🛡️', hint: '保护自己' },
    { char: '找', type: 'verb', word: '寻找', emoji: '🔍', hint: '仔细寻找' },
    // 4-5
    { char: '冠', type: 'noun', word: '皇冠', emoji: '👑', hint: '闪亮皇冠' },
    { char: '裁', type: 'verb', word: '裁剪', emoji: '✂️', hint: '小心裁剪' },
    { char: '雪', type: 'noun', word: '雪', emoji: '❄️', hint: '洁白雪花' },
    { char: '生', type: 'verb', word: '生长', emoji: '🌱', hint: '小苗生长' },
    { char: '语', type: 'noun', word: '语言', emoji: '💬', hint: '学习语言' },
    { char: '门', type: 'noun', word: '门', emoji: '🚪', hint: '一扇大门' },
    // 4-6
    { char: '没', type: 'verb', word: '没有', emoji: '🙅', hint: '这里没有' },
    { char: '腿', type: 'noun', word: '大腿', emoji: '🦵', hint: '有力双腿' },
    { char: '南', type: 'noun', word: '南方', emoji: '⬇️', hint: '温暖南方' },
    { char: '北', type: 'noun', word: '北方', emoji: '⬆️', hint: '寒冷北方' },
    { char: '拍', type: 'verb', word: '拍手', emoji: '👏', hint: '拍拍手' },
    { char: '做', type: 'verb', word: '做事', emoji: '🙌', hint: '认真做事' },
    // 4-7
    { char: '瓜', type: 'noun', word: '瓜', emoji: '🍉', hint: '圆圆西瓜' },
    { char: '挂', type: 'verb', word: '挂画', emoji: '🖼️', hint: '墙上挂画' },
    { char: '呆', type: 'verb', word: '发呆', emoji: '😶', hint: '坐着发呆' },
    { char: '当', type: 'verb', word: '当心', emoji: '⚠️', hint: '走路当心' },
    { char: '叔', type: 'noun', word: '叔叔', emoji: '👨', hint: '亲切叔叔' },
    { char: '说', type: 'verb', word: '说话', emoji: '🗣️', hint: '大声说' },
    // 4-8
    { char: '同', type: 'noun', word: '相同', emoji: '🟰', hint: '两个相同' },
    { char: '相', type: 'noun', word: '相同', emoji: '🟰', hint: '一模一样' },
    { char: '鼻', type: 'noun', word: '鼻', emoji: '👃', hint: '高高鼻子' },
    { char: '眉', type: 'noun', word: '眉', emoji: '😊', hint: '弯弯眉毛' },
    { char: '双', type: 'noun', word: '一双', emoji: '👟', hint: '一双鞋子' },
    { char: '进', type: 'verb', word: '进门', emoji: '🚪', hint: '走进门里' },
    // 4-9
    { char: '医', type: 'noun', word: '医生', emoji: '🧑‍⚕️', hint: '医生看病' },
    { char: '钱', type: 'noun', word: '钱币', emoji: '🪙', hint: '一枚钱币' },
    { char: '主', type: 'noun', word: '主人', emoji: '🏠', hint: '热情主人' },
    { char: '方', type: 'noun', word: '方', emoji: '🟫', hint: '方方的' },
    { char: '答', type: 'verb', word: '回答', emoji: '🙋', hint: '认真回答' },
    { char: '姓', type: 'noun', word: '姓名', emoji: '📛', hint: '说出姓名' },
    // 4-10
    { char: '女', type: 'noun', word: '女孩', emoji: '👧', hint: '可爱女孩' },
    { char: '孩', type: 'noun', word: '孩子', emoji: '🧒', hint: '快乐孩子' },
    { char: '快', type: 'verb', word: '快跑', emoji: '🏃‍➡️', hint: '跑得飞快' },
    { char: '步', type: 'noun', word: '脚步', emoji: '👣', hint: '轻轻脚步' },
    { char: '很', type: 'noun', word: '很好', emoji: '👍', hint: '做得很好' },
    { char: '肉', type: 'noun', word: '肉', emoji: '🥩', hint: '一块肉肉' },
    // 4-11
    { char: '身', type: 'noun', word: '身体', emoji: '🧍', hint: '健康身体' },
    { char: '借', type: 'verb', word: '借书', emoji: '📖', hint: '礼貌借书' },
    { char: '问', type: 'verb', word: '问好', emoji: '🙋', hint: '见面问好' },
    { char: '招', type: 'verb', word: '招手', emoji: '👋', hint: '挥手招呼' },
    { char: '怕', type: 'verb', word: '害怕', emoji: '😟', hint: '别害怕' },
    { char: '惊', type: 'verb', word: '惊讶', emoji: '😲', hint: '感到惊讶' },
    // 4-12
    { char: '遍', type: 'noun', word: '一遍', emoji: '🔁', hint: '再读一遍' },
    { char: '原', type: 'noun', word: '草原', emoji: '🏞️', hint: '辽阔草原' },
    { char: '川', type: 'noun', word: '山川', emoji: '🏔️', hint: '美丽山川' },
    { char: '规', type: 'noun', word: '规则', emoji: '📏', hint: '遵守规则' },
    { char: '蚕', type: 'noun', word: '蚕宝宝', emoji: '🐛', hint: '白白的蚕' },
    { char: '插', type: 'verb', word: '插花', emoji: '💐', hint: '花瓶插花' },
    // 4-13
    { char: '周', type: 'noun', word: '四周', emoji: '🔄', hint: '看看四周' },
    { char: '发', type: 'noun', word: '发', emoji: '💇', hint: '头发飘飘' },
    { char: '臂', type: 'noun', word: '手臂', emoji: '💪', hint: '伸出手臂' },
    { char: '给', type: 'verb', word: '给予', emoji: '🎁', hint: '送礼物' },
    { char: '孙', type: 'noun', word: '孙子', emoji: '👦', hint: '可爱孙子' },
    { char: '军', type: 'noun', word: '军人', emoji: '🪖', hint: '勇敢军人' },
    // 4-14
    { char: '夏', type: 'noun', word: '夏天', emoji: '☀️', hint: '炎热夏天' },
    { char: '果', type: 'noun', word: '果', emoji: '🍎', hint: '甜甜水果' },
    { char: '西', type: 'noun', word: '西边', emoji: '⬅️', hint: '太阳西下' },
    { char: '边', type: 'noun', word: '旁边', emoji: '↔️', hint: '站在旁边' },
    { char: '欢', type: 'noun', word: '欢乐', emoji: '🎉', hint: '欢乐时光' },
    { char: '正', type: 'noun', word: '正好', emoji: '✅', hint: '大小正好' },
    // 4-15
    { char: '泉', type: 'noun', word: '泉', emoji: '⛲', hint: '清澈泉水' },
    { char: '眼', type: 'noun', word: '眼', emoji: '👁️', hint: '明亮眼睛' },
    { char: '睛', type: 'noun', word: '眼睛', emoji: '👀', hint: '明亮眼睛' },
    { char: '荷', type: 'noun', word: '荷花', emoji: '🪷', hint: '美丽荷花' },
    { char: '尖', type: 'noun', word: '尖尖', emoji: '🔺', hint: '尖尖山顶' },
    { char: '早', type: 'noun', word: '早上', emoji: '🌅', hint: '早上好' },
    // 4-16
    { char: '夜', type: 'noun', word: '夜晚', emoji: '🌙', hint: '安静夜晚' },
    { char: '所', type: 'noun', word: '一所', emoji: '🏫', hint: '一所学校' },
    { char: '黑', type: 'noun', word: '黑', emoji: '⚫', hint: '黑黑的' },
    { char: '光', type: 'noun', word: '光', emoji: '✨', hint: '闪闪光芒' },
    { char: '点', type: 'noun', word: '点心', emoji: '🍪', hint: '美味点心' },
    { char: '浪', type: 'noun', word: '海浪', emoji: '🌊', hint: '翻滚海浪' },
    // 4-17
    { char: '和', type: 'noun', word: '和好', emoji: '🤝', hint: '友好相处' },
    { char: '姐', type: 'noun', word: '姐', emoji: '👧', hint: '姐姐' },
    { char: '群', type: 'noun', word: '一群', emoji: '👥', hint: '一群朋友' },
    { char: '听', type: 'verb', word: '听歌', emoji: '🎧', hint: '仔细听' },
    { char: '男', type: 'noun', word: '男孩', emoji: '👦', hint: '活泼男孩' },
    { char: '向', type: 'noun', word: '方向', emoji: '🧭', hint: '认清方向' },
    // 4-18
    { char: '几', type: 'noun', word: '几个', emoji: '❓', hint: '数数几个' },
    { char: '条', type: 'noun', word: '一条', emoji: '🐟', hint: '一条小鱼' },
    { char: '久', type: 'noun', word: '长久', emoji: '⌛', hint: '时间长久' },
    { char: '半', type: 'noun', word: '一半', emoji: '◐', hint: '分成一半' },
    { char: '候', type: 'noun', word: '时候', emoji: '🕰️', hint: '这个时候' },
    { char: '公', type: 'noun', word: '公园', emoji: '🏞️', hint: '美丽公园' },
    ];
});
