import manifest from './debugging-manifest.json' with { type: 'json' };

const guidance = {
  '边界': ['先找刚好落在区间端点的测试输入。', '比较条件是否意外排除了等于边界的情况。', '恢复包含端点的比较，同时保留其他输入的行为。'],
  '条件': ['找出只满足其中一个条件的输入。', '检查两个条件应当是“任一成立”还是“同时成立”。', '恢复符合业务规则的逻辑连接方式。'],
  '缺省值': ['找出值为 0、false 或空字符串的测试。', '区分“缺少值”和“值为假”。', '仅在 null 或 undefined 时使用后备值。'],
  '数组筛选': ['观察输出的数量与元素类型。', '筛选元素与转换元素是两种不同操作。', '保留满足条件的原元素，而不是把谓词结果组成数组。'],
  '数组映射': ['观察输出的数量与元素类型。', '转换每个元素不等于只保留返回真值的元素。', '保留每个输入对应的转换结果。'],
  '顺序': ['观察数组的第一项和最后一项。', '新元素应该加入结果的哪一端？', '恢复题目要求的稳定顺序。'],
  '起点': ['检查首个字符或首个元素是否丢失。', '切片起点是从 0 还是从 1 开始？', '把首项包含在结果内。'],
  '量词': ['构造部分满足、部分不满足的输入。', '题目要求所有项满足还是至少一项满足？', '使用与需求一致的数组量词方法。'],
  '预处理': ['尝试在输入两端加入空白。', '转换成字符串不等于移除空白。', '在验证或归一化前完成真正的去空白处理。'],
  '大小写': ['检查期望是统一大写还是统一小写。', '两种转换方向会产生不同的比较或展示结果。', '恢复与规则一致的大小写处理。'],
  '极值': ['检查结果是否越过上限或下限。', '比较取较大值和取较小值的作用。', '选择能保持题目边界约束的极值函数。'],
  '返回值': ['检查成功分支与失败分支的返回值。', '调用者依赖布尔值区分两种结果。', '恢复与该分支语义一致的布尔值。'],
  '前缀': ['构造包含目标片段但不以它开头的输入。', '包含关系比前缀关系更宽。', '只有目标出现在起点时才应通过。'],
  '包含': ['构造目标片段出现在中间的输入。', '前缀关系比包含关系更窄。', '允许片段出现在题目规定的任意位置。'],
  '展平': ['检查每次递归返回的数组如何合并。', '普通映射会保留额外一层数组。', '将各次递归返回的一层数组合并成最终结果。'],
  '存在性': ['让缓存中保存假值并观察行为。', '读取值与判断键是否存在并不相同。', '按题目要求检查键是否已经存在。'],
  '取值': ['检查这里需要的是保存的值还是布尔存在性。', '存在性查询不能代替读取原值。', '取回原值供后续计算或返回。'],
  '写入': ['检查状态在下一次调用后是否变化。', '读取容器不会保存新结果。', '计算后写回容器，供后续调用使用。'],
};

export function addDebuggingExercises({ questions }) {
  const originals = new Map(questions.map((question) => [question.id, question]));
  for (const item of manifest) {
    const original = originals.get(item.id);
    if (!original || original.kind !== 'code' || original.runtime === 'dom') throw new Error(`无效的调试题来源：${item.id}`);
    if (original.solution.slice(item.index, item.index + item.from.length) !== item.from) throw new Error(`调试题来源已改变：${item.id}`);
    const buggy = original.solution.slice(0, item.index) + item.to + original.solution.slice(item.index + item.from.length);
    const hints = guidance[item.type];
    if (!hints) throw new Error(`未知的调试题类型：${item.type}`);
    questions.push({
      ...original,
      id: `${original.id}-repair-01`,
      family: original.id,
      exerciseType: 'repair',
      title: `修复${item.type}错误：${original.title}`,
      prompt: [...original.prompt, '编辑器中的实现只有一处故障。请先运行测试定位失败场景，再修复代码；函数签名和其他正确行为都应保留。'],
      starter: buggy,
      hints,
      explanation: `这处故障把 ${item.from} 改成了 ${item.to}，使部分输入违反要求。${original.explanation}`,
      difficulty: '稍有难度',
    });
  }
}
