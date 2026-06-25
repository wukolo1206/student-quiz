var assert = require('assert');
var H = require('../map_hierarchy_logic.js');

var indicators = {
  P1: {name:'前置一', grade:3, parents:[], questions:[{}]},
  P2: {name:'前置二', grade:3, parents:[], questions:[]},
  // ROOT 的前置 PMISS 故意不在 indicators 內 → 應產生灰色占位節點，不可消失
  ROOT: {name:'目前能力', grade:4, parents:['P1','P2','PMISS'], questions:[{}]},
  C1: {name:'後續一', grade:5, parents:['ROOT'], questions:[{}]},
  C2: {name:'後續二', grade:5, parents:['ROOT','OTHER'], questions:[]},
  GRAND: {name:'更後續', grade:6, parents:['C1'], questions:[{}]},
  LEAF: {name:'葉節點', grade:6, parents:[], questions:[{}]}
};
var records = {
  P1: {latest:90, best:90, sessions:[{}]},
  ROOT: {latest:75, best:80, sessions:[{},{}]},
  C1: {latest:40, best:40, sessions:[{}]},
  BADREC: {best:50}            // latest 缺失 → 視為 unseen，不可變紅
};

var model = H.buildDirectHierarchy(indicators, 'ROOT', records);

// 缺失前置仍在，且為灰色占位
assert.deepStrictEqual(model.parents.map(function(x){return x.id;}), ['P1','P2','PMISS']);
var pmiss = model.parents[2];
assert.strictEqual(pmiss.missing, true);
assert.strictEqual(pmiss.name, '能力資料尚未收錄');
assert.strictEqual(pmiss.state, 'unseen');
assert.strictEqual(pmiss.hasQuestions, false);

// 後續正確、不含孫節點
assert.deepStrictEqual(model.children.map(function(x){return x.id;}), ['C1','C2']);
assert.strictEqual(model.children.some(function(x){return x.id==='GRAND';}), false);

// 狀態色
assert.strictEqual(model.root.state, 'mid');
assert.strictEqual(model.parents[0].state, 'ok');     // P1 latest 90
assert.strictEqual(model.parents[1].state, 'unseen'); // P2 無紀錄
assert.strictEqual(model.children[0].state, 'bad');   // C1 latest 40
assert.strictEqual(model.children[1].hasQuestions, false); // C2 無題目

// 沒有前置
var noParent = H.buildDirectHierarchy(indicators, 'P1', records);
assert.deepStrictEqual(noParent.parents, []);

// 沒有後續（葉節點）
var leaf = H.buildDirectHierarchy(indicators, 'LEAF', records);
assert.deepStrictEqual(leaf.children, []);

// latest 異常 → unseen，且 sessionCount 為 0（無 sessions）
assert.strictEqual(H.stateOf(records.BADREC), 'unseen');
assert.strictEqual(H.stateOf({latest:'x'}), 'unseen');
var badNode = H.buildDirectHierarchy({Z:{name:'z',grade:1,parents:[],questions:[]}}, 'Z', {Z:{best:50}});
assert.strictEqual(badNode.root.sessionCount, 0);
assert.strictEqual(badNode.root.latest, null);

// 找不到根節點
assert.strictEqual(H.buildDirectHierarchy(indicators, 'MISSING', records), null);

console.log('all map hierarchy tests passed');
