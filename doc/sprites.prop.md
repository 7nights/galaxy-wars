各个 Sprites 具有的属性
======

基本属性略过(例如`x`, `y`, `owner`)，下面的属性只列出在绘制时可能会用到的.

Sprites 的一些 API
------
  - `getSprite(id)` 通过整数 id 获取对应的 sprite
  - `getSpritesByType(type)` 通过 type（例如'SHIP', 'PLANET'） 获取所有的 sprite

#### PLANET
  - `army` 军队数量
  - `capacity` 产能。行星的 width 和 height 会根据产能变化
  - `drawPlayerFoucs()` 绘制玩家选中边框
  - `removePlayerFocus()` 取消玩家选中边框
  - `drawAttackLine(target)` 绘制到 target 的线条
  - `removeAttackLine()` 取消之前绘制的线条

#### SHIP
  - `speed`
  - `towards`
  - `explode()` 飞船爆炸