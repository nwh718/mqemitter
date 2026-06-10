# [OPEN] emit-null-validation

## 问题
- `mqemitter.test-d.ts` 第 24-28 行通过 `expectError(emit(null))` 期望类型层面报错。
- 运行时 `emit(null)` 可能未被正确拦截，导致未捕获异常。

## 假设
1. `emit` 只校验了参数是否为 `undefined` 或非对象，但遗漏了 `null`，因为 `typeof null === 'object'`。
2. `emit` 在访问 `message.topic` 前没有统一兜底，导致非法输入可能以同步异常形式泄漏。
3. `emit` 的参数规范化顺序错误，先做断言再默认回调，导致无回调场景也可能同步抛错。
4. 现有测试只覆盖类型检查，没有覆盖运行时 `null` 输入，因此缺少回归保护。

## 证据
- 上游 `mqemitter@7.1.0` 的 `emit` 先执行 `assert(message)`，随后才做 `cb = cb || noop`；这会把 `null` 当作断言失败直接抛出。
- 本地仓库缺少运行时 `emit(null)` 回归测试，只在 `mqemitter.test-d.ts` 中有类型层面的 `expectError`。
- 当前执行环境无法正常启动调试命令或测试命令，命令调用被 `bwrap: No permissions to create a new namespace` 阻断，因此无法采集额外运行时日志。

## 修复
1. 将 `emit` 的回调规范化提前到参数校验之前。
2. 对 `null` / `undefined` 返回 `TypeError('message cannot be null or undefined')`。
3. 对非对象参数返回 `TypeError('message must be an object with a topic property')`。
4. 新增运行时测试，覆盖 `emit(null)` 有回调和无回调两种路径。

## 验证
- 已通过静态检查确认 `mqemitter.js` 与新增测试语法完整。
- 已尝试执行 `npm run unit`，但运行环境的 sandbox 限制阻止了实际命令执行。
