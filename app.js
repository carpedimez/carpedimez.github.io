(() => {
  'use strict';
  const app = document.querySelector('#app');
  const questions = window.SURVEY_QUESTIONS;
  let answers = Object.create(null), current = null, lastFocused = null, timer = null;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function intro() {
    clearTimeout(timer);current=null;
    app.innerHTML=`<section class="intro"><div><div class="eyebrow">一份关于社区生活的小调查</div><h1>从身边小事，<br><em>看见社区共治。</em></h1><p class="lede">党建引领基层治理的实践与成效<br>以本地社区居民参与社区事务为例</p><div class="meta"><span>预计 6–8 分钟</span><span>匿名、自愿填写</span><span>可随时停止</span></div><button class="btn" id="start">开始填写 <span aria-hidden="true">　→</span></button></div><aside class="intro-side"><div class="side-label">ABOUT THE SURVEY</div><h2>您的每一种体验，都值得被听见。</h2><p>本问卷了解居民参与社区事务的经历与对社区治理的评价。请根据实际情况作答，没有标准答案。我们不会询问姓名、电话或门牌号。</p><p>填写对象：年满18周岁、在本社区连续居住满6个月的居民。</p><p class="notice">本页面为独立前端演示，提交后不会保存或收集答卷，也无法用于后续统计。</p></aside></section>`;
    document.querySelector('#start').onclick = eligibility;
  }
  function eligibility() {
    current='eligibility';app.innerHTML=`<section class="question-shell"><div class="progress-line"><span>填写前确认</span><span>约需 6–8 分钟</span></div><div class="track"><span style="width:0%"></span></div><div class="panel"><div class="question-kicker">开始之前</div><h2 class="question-title">您是否年满18周岁，且已在本社区连续居住满6个月？</h2><p class="hint">本问卷面向符合以上两个条件的居民。</p><div class="options"><button class="option" data-eligible="yes"><span class="choice-icon"></span><span class="option-text">是，我符合条件</span></button><button class="option" data-eligible="no"><span class="choice-icon"></span><span class="option-text">否，我不符合条件</span></button></div><div class="nav"><button class="back" id="back-intro">← 返回首页</button></div></div></section>`;
    document.querySelector('#back-intro').onclick=intro;
    document.querySelectorAll('[data-eligible]').forEach(b=>b.onclick=()=>b.dataset.eligible==='yes'?showQuestion(visible()[0]):ineligible());
  }
  function ineligible(){app.innerHTML=`<section class="finish"><div class="mark">邻</div><h1>感谢您的关注</h1><p>本问卷的填写对象为年满18周岁且在本社区连续居住满6个月的居民。</p><button class="btn" id="return">返回首页</button></section>`;document.querySelector('#return').onclick=intro;}
  function visible(){return questions.filter(q=>!(['Q8','Q9','Q10'].includes(q.id)&&answers.Q7===1)&&!(q.id==='Q15'&&![1,2].includes(answers.Q14))&&!(q.id==='Q19'&&answers.Q4===1));}
  function clearInvisible(){const ids=new Set(visible().map(q=>q.id));for(const k of Object.keys(answers))if(!ids.has(k))delete answers[k];}
  function showQuestion(q, focus=true){
    clearTimeout(timer); if(!q)return;current=q.id;const list=visible(),index=list.findIndex(x=>x.id===q.id);const selected=answers[q.id];
    const hint=q.kind==='single'?'单选 · 选择后自动进入下一题':q.kind==='multi'?`多选${q.max?' · 最多选择 '+q.max+' 项':''} · 选好后点击下一题`:'选填 · 不方便填写可直接提交';
    const opts=q.options.map((o,i)=>{const active=q.kind==='multi'?Array.isArray(selected)&&selected.includes(o.value):selected===o.value;return `<button type="button" class="option ${active?'selected':''}" data-value="${o.value}" aria-pressed="${active}"><span class="choice-icon" aria-hidden="true"></span><span class="option-text">${escapeHtml(o.label)}</span></button>`}).join('');
    app.innerHTML=`<section class="question-shell"><div class="progress-line"><span>居民调查问卷</span><span>第 ${index+1} / ${list.length} 题</span></div><div class="track" role="progressbar" aria-valuenow="${index+1}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="答题进度"><span style="width:${(index/list.length)*100}%"></span></div><div class="panel"><div class="question-kicker">QUESTION ${escapeHtml(q.number)}</div><h2 class="question-title" id="question-heading" tabindex="-1">${escapeHtml(q.title)}</h2><p class="hint">${hint}</p>${q.kind==='text'?`<textarea id="answer-text" maxlength="1000" placeholder="写下您的建议（选填），请勿填写姓名、电话等个人信息">${escapeHtml(selected||'')}</textarea>`:`<div class="options ${q.kind==='multi'?'multi':''}">${opts}</div>`}<p class="error" role="status"></p><div class="nav"><button class="back" id="previous">← 上一题</button>${q.kind!=='single'?`<button class="btn" id="next">${q.kind==='text'?'提交问卷':'下一题'}　→</button>`:''}</div></div></section>`;
    document.querySelector('#previous').onclick=()=>{if(q.kind==='text')answers[q.id]=document.querySelector('#answer-text').value.trim();const before=visible(),i=before.findIndex(x=>x.id===q.id);if(i<=0)eligibility();else showQuestion(before[i-1]);};
    if(q.kind==='text')document.querySelector('#next').onclick=()=>{answers[q.id]=document.querySelector('#answer-text').value.trim();finish();};
    else if(q.kind==='multi'){
      document.querySelectorAll('[data-value]').forEach(el=>el.onclick=()=>{const val=+el.dataset.value;let arr=Array.isArray(answers[q.id])?[...answers[q.id]]:[];const exc=q.exclusive||[];if(arr.includes(val))arr=arr.filter(v=>v!==val);else if(exc.includes(val))arr=[val];else {arr=arr.filter(v=>!exc.includes(v));if(q.max&&arr.length>=q.max){document.querySelector('.error').textContent=`最多选择 ${q.max} 项，请先取消一项。`;return;}arr.push(val);}answers[q.id]=arr;lastFocused=val;showQuestion(q,false);const focused=document.querySelector(`[data-value="${lastFocused}"]`);if(focused)focused.focus();});
      document.querySelector('#next').onclick=()=>{if(!answers[q.id]?.length){document.querySelector('.error').textContent='请至少选择一项。';return;}advance(q.id);};
    }else document.querySelectorAll('[data-value]').forEach(el=>el.onclick=()=>{answers[q.id]=+el.dataset.value;clearInvisible();document.querySelectorAll('[data-value]').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false');});el.classList.add('selected');el.setAttribute('aria-pressed','true');timer=setTimeout(()=>advance(q.id),260);});
    if(focus)document.querySelector('#question-heading').focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});
  }
  function advance(id){const list=visible(),i=list.findIndex(q=>q.id===id);if(i>=0&&i<list.length-1)showQuestion(list[i+1]);else if(i===list.length-1)finish();}
  function finish(){clearTimeout(timer);answers=Object.create(null);current='done';app.innerHTML=`<section class="finish"><div class="mark">邻</div><div class="eyebrow" style="justify-content:center">调查完成</div><h1>感谢参与此次调查</h1><p>感谢您抽出时间完成问卷。<br>本页面不保存或收集您的回答。</p><button class="btn" id="restart">返回首页</button></section>`;document.querySelector('#restart').onclick=intro;window.scrollTo({top:0,behavior:'smooth'});}
  intro();
})();
