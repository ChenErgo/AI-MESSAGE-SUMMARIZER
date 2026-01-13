# Prompt 模板与 JSON Schema

## 1. Prompt 模板

### 基础模板

```
你是一个专业的消息总结助手。请分析以下{场景}的聊天记录，提取关键信息并以严格的JSON格式返回。

【重要要求】：
1. 输出必须是纯JSON格式，不要包含任何Markdown标记、解释文字或多余字段
2. 所有字段必须严格按照Schema定义返回
3. 内容要客观、准确，不确定的信息标记为"未明确"
4. 不要编造不存在的信息或负责人
5. owner_hint只能填写"可能提及的人名/称呼"，不能强识别

【聊天记录】：
{文本内容}

【输出要求】：
- summary_points: 提取3-10个关键要点
- decisions: 提取已做出的决定或结论（0-10个）
- todos: 提取待办事项，每个包含task（任务描述）、owner_hint（负责人提示，如"未明确"、"可能的小王"）、due_hint（时间提示，如"未明确"、"可能的下周一"）
- open_questions: 提取未决问题（0-10个）
- disclaimer: 固定为"结果仅供参考"
- risk_flags: 标记风险因素，如"信息不足"、"时间不明确"、"负责人不明确"、"存在争议"等（0-10个）

【输出格式】（严格按此格式输出，不要有任何额外文字）：
{
  "summary_points": ["要点1", "要点2"],
  "decisions": ["决定1"],
  "todos": [
    {
      "task": "任务描述",
      "owner_hint": "未明确/可能的称呼",
      "due_hint": "未明确/可能的时间描述"
    }
  ],
  "open_questions": ["问题1"],
  "disclaimer": "结果仅供参考",
  "risk_flags": ["风险1"]
}
```

### 场景化 Prompt

#### 工作场景 Prompt

```
你是一个专业的消息总结助手。请分析以下工作场景的聊天记录，提取关键信息并以严格的JSON格式返回。

【重要要求】：
1. 输出必须是纯JSON格式，不要包含任何Markdown标记、解释文字或多余字段
2. 所有字段必须严格按照Schema定义返回
3. 内容要客观、准确，不确定的信息标记为"未明确"
4. 不要编造不存在的信息或负责人
5. owner_hint只能填写"可能提及的人名/称呼"，不能强识别

【聊天记录】：
{文本内容}

【输出要求】：
- summary_points: 提取3-10个关键要点，重点关注项目进度、会议结论、重要通知
- decisions: 提取已做出的决定或结论（0-10个），如任务分配、方案确定等
- todos: 提取待办事项，每个包含task（任务描述）、owner_hint（负责人提示）、due_hint（时间提示）
- open_questions: 提取未决问题（0-10个），如待确认事项、悬而未决的问题
- disclaimer: 固定为"结果仅供参考"
- risk_flags: 标记风险因素，如"信息不足"、"时间不明确"、"负责人不明确"、"存在争议"、"需要进一步确认"等（0-10个）

【输出格式】（严格按此格式输出，不要有任何额外文字）：
{
  "summary_points": ["要点1", "要点2"],
  "decisions": ["决定1"],
  "todos": [
    {
      "task": "任务描述",
      "owner_hint": "未明确/可能的称呼",
      "due_hint": "未明确/可能的时间描述"
    }
  ],
  "open_questions": ["问题1"],
  "disclaimer": "结果仅供参考",
  "risk_flags": ["风险1"]
}
```

#### 学习场景 Prompt

```
你是一个专业的消息总结助手。请分析以下学习场景的聊天记录，提取关键信息并以严格的JSON格式返回。

【重要要求】：
1. 输出必须是纯JSON格式，不要包含任何Markdown标记、解释文字或多余字段
2. 所有字段必须严格按照Schema定义返回
3. 内容要客观、准确，不确定的信息标记为"未明确"
4. 不要编造不存在的信息或负责人
5. owner_hint只能填写"可能提及的人名/称呼"，不能强识别

【聊天记录】：
{文本内容}

【输出要求】：
- summary_points: 提取3-10个关键要点，重点关注知识点、学习计划、作业安排
- decisions: 提取已做出的决定或结论（0-10个），如学习目标确定、课程选择等
- todos: 提取待办事项，每个包含task（任务描述）、owner_hint（负责人提示）、due_hint（时间提示）
- open_questions: 提取未决问题（0-10个），如待解答的疑问、需要进一步学习的内容
- disclaimer: 固定为"结果仅供参考"
- risk_flags: 标记风险因素，如"信息不足"、"时间不明确"、"负责人不明确"、"存在争议"等（0-10个）

【输出格式】（严格按此格式输出，不要有任何额外文字）：
{
  "summary_points": ["要点1", "要点2"],
  "decisions": ["决定1"],
  "todos": [
    {
      "task": "任务描述",
      "owner_hint": "未明确/可能的称呼",
      "due_hint": "未明确/可能的时间描述"
    }
  ],
  "open_questions": ["问题1"],
  "disclaimer": "结果仅供参考",
  "risk_flags": ["风险1"]
}
```

#### 家庭场景 Prompt

```
你是一个专业的消息总结助手。请分析以下家庭场景的聊天记录，提取关键信息并以严格的JSON格式返回。

【重要要求】：
1. 输出必须是纯JSON格式，不要包含任何Markdown标记、解释文字或多余字段
2. 所有字段必须严格按照Schema定义返回
3. 内容要客观、准确，不确定的信息标记为"未明确"
4. 不要编造不存在的信息或负责人
5. owner_hint只能填写"可能提及的人名/称呼"，不能强识别

【聊天记录】：
{文本内容}

【输出要求】：
- summary_points: 提取3-10个关键要点，重点关注家庭活动、重要通知、约定事项
- decisions: 提取已做出的决定或结论（0-10个），如活动安排、购物决定等
- todos: 提取待办事项，每个包含task（任务描述）、owner_hint（负责人提示）、due_hint（时间提示）
- open_questions: 提取未决问题（0-10个），如待确认的时间、待商议的事项
- disclaimer: 固定为"结果仅供参考"
- risk_flags: 标记风险因素，如"信息不足"、"时间不明确"、"负责人不明确"、"存在争议"等（0-10个）

【输出格式】（严格按此格式输出，不要有任何额外文字）：
{
  "summary_points": ["要点1", "要点2"],
  "decisions": ["决定1"],
  "todos": [
    {
      "task": "任务描述",
      "owner_hint": "未明确/可能的称呼",
      "due_hint": "未明确/可能的时间描述"
    }
  ],
  "open_questions": ["问题1"],
  "disclaimer": "结果仅供参考",
  "risk_flags": ["风险1"]
}
```

## 2. JSON Schema

### 完整 Schema（Draft-07）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "summary_points",
    "decisions",
    "todos",
    "open_questions",
    "disclaimer",
    "risk_flags"
  ],
  "properties": {
    "summary_points": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "minItems": 1,
      "maxItems": 10
    },
    "decisions": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "minItems": 0,
      "maxItems": 10
    },
    "todos": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "task",
          "owner_hint",
          "due_hint"
        ],
        "properties": {
          "task": {
            "type": "string",
            "minLength": 1
          },
          "owner_hint": {
            "type": "string",
            "minLength": 1
          },
          "due_hint": {
            "type": "string",
            "minLength": 1
          }
        },
        "additionalProperties": false
      },
      "minItems": 0,
      "maxItems": 20
    },
    "open_questions": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "minItems": 0,
      "maxItems": 10
    },
    "disclaimer": {
      "type": "string",
      "enum": [
        "结果仅供参考"
      ]
    },
    "risk_flags": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "minItems": 0,
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

## 3. 校验策略

### 3.1 校验流程

```
1. 接收 AI 返回的原始文本
   ↓
2. 清理 Markdown 标记（```json, ```）
   ↓
3. JSON 解析
   ↓
4. Ajv Schema 校验
   ↓
5a. 校验通过 → 返回结果
   ↓
5b. 校验失败 → 记录错误
   ↓
6. 检查重试次数（最多1次）
   ↓
7a. 未超过重试限制 → 重新调用 AI
   ↓
7b. 超过重试限制 → 返回错误
```

### 3.2 错误处理

#### 错误类型

1. **JSON 解析错误**
   - 错误码：`AI_BAD_JSON`
   - 处理：记录错误，重试一次

2. **Schema 校验错误**
   - 错误码：`SCHEMA_INVALID`
   - 处理：记录详细错误信息，重试一次

3. **AI 调用失败**
   - 错误码：`AI_FAILED`
   - 处理：返回错误，不重试

### 3.3 重试机制

```typescript
async function callAIWithRetry(prompt: string): Promise<AIResponse> {
  const MAX_RETRY = 1;

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    const response = await callAI(prompt);

    if (response.ok) {
      return response;
    }

    // 如果是 JSON 或 Schema 错误，且未超过重试次数，则重试
    if (
      (response.error.code === ErrorCode.AI_BAD_JSON ||
       response.error.code === ErrorCode.SCHEMA_INVALID) &&
      attempt < MAX_RETRY
    ) {
      console.log(`[AI] Retry attempt ${attempt + 1}`);
      continue;
    }

    // 其他错误或超过重试次数，直接返回
    return response;
  }

  // 理论上不会执行到这里
  return {
    ok: false,
    error: {
      code: ErrorCode.AI_FAILED,
      message: 'AI调用失败',
    },
  };
}
```

### 3.4 校验日志

所有校验失败都会记录详细日志：

```typescript
console.error('[AI] Schema validation failed:', {
  errors: validation.errors,
  data: JSON.stringify(parsedData).substring(0, 500),
  attempt: attempt + 1,
});
```

## 4. 示例输入与输出

### 示例 1：工作场景

#### 输入

```
张经理：大家好，今天开会讨论一下项目进度
小李：前端页面已经完成了80%，预计下周三可以全部完成
小王：后端接口开发完成了，正在和前端联调
张经理：好的，那我们定一下上线时间吧
小李：下周五可以上线吗？
小王：我觉得可以，但是需要测试两天
张经理：那就定下周五上线，测试工作由小王负责
小李：好的，那我这边继续完善剩余的功能
小王：收到，我会安排测试
张经理：另外，客户要求增加一个数据导出功能
小李：这个功能比较复杂，可能需要额外开发时间
张经理：那这个功能放到下个版本吧
小王：好的，那我们先把当前版本上线
```

#### 输出

```json
{
  "summary_points": [
    "项目前端进度80%，预计下周三完成",
    "后端接口开发完成，正在与前端联调",
    "确定下周五为上线时间",
    "测试工作由小王负责",
    "客户要求的数据导出功能推迟到下个版本"
  ],
  "decisions": [
    "下周五上线当前版本",
    "小王负责测试工作",
    "数据导出功能推迟到下个版本"
  ],
  "todos": [
    {
      "task": "完成前端剩余20%功能",
      "owner_hint": "可能的小李",
      "due_hint": "可能的下周三"
    },
    {
      "task": "完成前后端联调",
      "owner_hint": "可能的小王",
      "due_hint": "可能的下周三"
    },
    {
      "task": "执行项目测试",
      "owner_hint": "可能的小王",
      "due_hint": "可能的下周三至周五"
    }
  ],
  "open_questions": [
    "测试过程中发现的问题如何处理"
  ],
  "disclaimer": "结果仅供参考",
  "risk_flags": [
    "时间紧张",
    "可能存在未发现的bug"
  ]
}
```

### 示例 2：学习场景

#### 输入

```
老师：同学们，今天我们学习了Python的基础语法
小明：老师，作业是什么？
老师：完成第三章的练习题，下周一交
小红：老师，我有个问题，列表和元组的区别是什么？
老师：列表是可变的，元组是不可变的，这个很重要
小明：那什么时候用列表，什么时候用元组呢？
老师：需要修改数据时用列表，不需要修改时用元组
小红：明白了，谢谢老师
老师：另外，下节课我们会学习字典和集合
小明：好的，我会提前预习
```

#### 输出

```json
{
  "summary_points": [
    "学习了Python基础语法",
    "作业：完成第三章练习题，下周一提交",
    "列表可变，元组不可变",
    "下节课学习字典和集合"
  ],
  "decisions": [
    "下周一提交第三章练习题",
    "下节课学习字典和集合"
  ],
  "todos": [
    {
      "task": "完成第三章练习题",
      "owner_hint": "可能的小明",
      "due_hint": "可能的下周一"
    },
    {
      "task": "预习字典和集合",
      "owner_hint": "可能的小明",
      "due_hint": "可能的下节课前"
    }
  ],
  "open_questions": [],
  "disclaimer": "结果仅供参考",
  "risk_flags": [
    "信息不足"
  ]
}
```

### 示例 3：家庭场景

#### 输入

```
妈妈：周末我们去哪里玩？
爸爸：去公园野餐怎么样？
小明：我想去游乐园
妈妈：游乐园人太多了，而且门票也贵
爸爸：那我们去郊外的森林公园吧，那里空气好
小明：可以带风筝吗？
妈妈：可以，我们带上野餐垫和食物
爸爸：我开车，周六早上8点出发
小明：好的，我要准备风筝
妈妈：记得带上防晒霜和帽子
爸爸：天气预报说周六晴天，温度25度
小明：太好了，可以穿短袖
妈妈：好的，大家各自准备一下
```

#### 输出

```json
{
  "summary_points": [
    "周末计划去森林公园野餐",
    "周六早上8点出发",
    "天气晴朗，温度25度",
    "可以带风筝、野餐垫和食物"
  ],
  "decisions": [
    "周六去森林公园野餐",
    "早上8点出发",
    "爸爸负责开车"
  ],
  "todos": [
    {
      "task": "准备风筝",
      "owner_hint": "可能的小明",
      "due_hint": "可能的周六前"
    },
    {
      "task": "准备野餐垫和食物",
      "owner_hint": "可能的妈妈",
      "due_hint": "可能的周六前"
    },
    {
      "task": "准备好防晒霜和帽子",
      "owner_hint": "可能的妈妈",
      "due_hint": "可能的周六前"
    }
  ],
  "open_questions": [],
  "disclaimer": "结果仅供参考",
  "risk_flags": [
    "信息充足"
  ]
}
```

## 5. 注意事项

1. **严格 JSON**：AI 必须返回纯 JSON，不能有任何 Markdown 标记或解释文字
2. **字段限制**：所有数组字段都有最小和最大数量限制
3. **必填字段**：所有字段都是必填的，即使是空数组也必须返回
4. **免责声明**：`disclaimer` 字段必须固定为"结果仅供参考"
5. **风险提示**：`risk_flags` 应该客观反映总结中可能存在的问题
6. **不确定性处理**：不确定的信息必须标记为"未明确"，不能编造
7. **负责人识别**：只能使用"可能的XX"这种模糊表述，不能强识别

---

以上就是完整的 Prompt 模板、JSON Schema 和校验策略。在实际使用中，可以根据具体需求调整 Prompt 的细节，但必须保持 JSON Schema 的严格性。