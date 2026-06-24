(function(root){
  'use strict';

  function stateOf(rec){
    if(!rec)return 'unseen';
    var v=rec.latest;
    if(typeof v!=='number'||isNaN(v))return 'unseen';
    if(v>=80)return 'ok';
    if(v>=50)return 'mid';
    return 'bad';
  }

  // 缺失節點（indicators 沒收錄）回傳灰色占位，而非 null
  function missingNode(id){
    return {
      id:id,
      name:'能力資料尚未收錄',
      grade:null,
      state:'unseen',
      latest:null,
      best:null,
      sessionCount:0,
      hasQuestions:false,
      missing:true
    };
  }

  function toNode(id, indicators, records){
    var ind=indicators[id];
    if(!ind)return missingNode(id);
    var rec=records[id]||null;
    var latest=(rec&&typeof rec.latest==='number'&&!isNaN(rec.latest))?rec.latest:null;
    var best=(rec&&typeof rec.best==='number'&&!isNaN(rec.best))?rec.best:null;
    return {
      id:id,
      name:ind.name||id,
      grade:ind.grade,
      state:stateOf(rec),
      latest:latest,
      best:best,
      sessionCount:rec&&rec.sessions?rec.sessions.length:0,
      hasQuestions:!!(ind.questions&&ind.questions.length),
      missing:false
    };
  }

  function buildDirectHierarchy(indicators, rootId, records){
    indicators=indicators||{};
    records=records||{};
    if(!indicators[rootId])return null;

    var parentIds=(indicators[rootId].parents||[]).slice().sort();
    var childIds=[];
    Object.keys(indicators).forEach(function(id){
      if((indicators[id].parents||[]).indexOf(rootId)>=0)childIds.push(id);
    });
    childIds.sort();

    return {
      root:toNode(rootId,indicators,records),
      // 不 filter：缺失前置以占位節點保留
      parents:parentIds.map(function(id){return toNode(id,indicators,records);}),
      children:childIds.map(function(id){return toNode(id,indicators,records);})
    };
  }

  var api={stateOf:stateOf,buildDirectHierarchy:buildDirectHierarchy};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.MapHierarchy=api;
})(typeof window!=='undefined'?window:this);
