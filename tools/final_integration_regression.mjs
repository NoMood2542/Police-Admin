import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = fs.readFileSync('index.html', 'utf8');
const results = [];
function check(cond, name, detail='') {
  results.push({name, pass: !!cond, detail});
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) throw new Error(name + (detail ? ': ' + detail : ''));
}

check(html.includes('UX v8.2 · L7 DAILY MISSION'), 'Version marker v8.2/L7');
check(html.includes('"activeQuestionOccurrences":1410'), 'E5 active occurrence metadata = 1410');
check(html.includes('"uniqueActiveStems":1350'), 'E5 unique stem metadata = 1350');

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
check(scripts.length === 2, 'Exactly 2 script blocks', String(scripts.length));
scripts.forEach((code, i) => {
  new Function(code);
  check(true, 'JavaScript syntax block ' + (i + 1));
});

const runtimeErrors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => runtimeErrors.push('jsdomError: ' + e.message));
vc.on('error', (...a) => runtimeErrors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://police-admin.test/',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.scrollTo = () => {};
    window.matchMedia = window.matchMedia || (() => ({
      matches: false, media: '', onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; }
    }));
    if (!window.CSS) window.CSS = {};
    if (!window.CSS.escape) window.CSS.escape = s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => '\\' + c);
  }
});
const w = dom.window;
await new Promise(r => w.setTimeout(r, 150));

const E = code => w.eval(code);
check(E('testDefs.reduce((n,d)=>n+d.questions.length,0)') === 1410, 'Runtime active question occurrences = 1410');
check(E('new Set(testDefs.flatMap(d=>d.questions.map(q=>normStem(q.q)))).size') === 1350, 'Runtime unique active stems = 1350');
check(E('KEY') === 'police69_pwa_v7', 'Progress storage key preserved');
check(E('SESSION_KEY') === 'police69_pwa_v7_session', 'Session storage key preserved');
check(E('state.learning.version') === 7, 'Learning state schema version = 7');
check(!!w.document.getElementById('dailyMissionPlanner'), 'Daily Mission container present');
check(!!w.document.getElementById('improvementEngine'), 'Improvement Engine container present');
check(!!w.document.getElementById('readinessEngine'), 'Readiness Engine container present');
check(!!w.document.getElementById('recoveryPlanner'), 'Recovery Planner container present');

function reset(extra='') {
  E(`
    state={completedDays:[],answers:{},errors:{},history:[],learning:{attempts:{},drills:[],lastDrillStems:[],mastery:{},retests:[],maintenance:[],recoveryHistory:[],dailyMinutes:45,version:7,bootstrapped:true}};
    localStorage.removeItem(KEY); localStorage.removeItem(SESSION_KEY);
    session=null; if(timerHandle) clearInterval(timerHandle); timerHandle=null;
    ${extra}
  `);
}

reset();
const freshMission = E('dailyMissionPlan(45)');
check(freshMission.tasks.length >= 1, 'Fresh learner gets a daily mission');
check(!freshMission.tasks.some(t => t.kind === 'mock'), 'Fresh 45m mission does not squeeze in Full Mock');
check(String(freshMission.deferred || '').includes('72'), 'Diagnostic deferred when 45m block is insufficient');

// Find a robust topic with enough transfer items for two 6-question mastery gates.
const target = E(`(()=>{
  const u=adaptiveQuestionUniverse(), g={};
  for(const c of u){const k=c.subject+'||'+c.topic;(g[k]||(g[k]=[])).push(c)}
  const rows=Object.entries(g).map(([key,items])=>({key,subject:items[0].subject,topic:items[0].topic,count:items.length}))
    .sort((a,b)=>b.count-a.count);
  return rows.find(x=>x.count>=12)||rows[0];
})()`);
check(target && target.count >= 12, 'Found mastery topic pool >= 12', target ? target.subject+' / '+target.topic+' / '+target.count : 'none');

E(`(()=>{
  const t=${JSON.stringify(target)}, u=adaptiveQuestionUniverse().filter(c=>c.subject===t.subject&&c.topic===t.topic);
  const seed={name:'Seed Weakness',type:'section',id:'seed'};
  const q0=u[0].q, wrong=Object.keys(q0.options).find(x=>x!==q0.answer);
  registerLearningAttempt(seed,q0,wrong,95000);
  registerLearningAttempt(seed,q0,wrong,96000);
  registerLearningAttempt(seed,u[1].q,Object.keys(u[1].q.options).find(x=>x!==u[1].q.answer),94000);
  refreshMasteryBaselines();
})()`);
let mstage = E(`state.learning.mastery[topicKey(${JSON.stringify(target.subject)},${JSON.stringify(target.topic)})]?.stage`);
check(mstage === 'repair', 'Repeated weakness creates Repair baseline', String(mstage));

E(`(()=>{
  const t=${JSON.stringify(target)}, u=adaptiveQuestionUniverse().filter(c=>c.subject===t.subject&&c.topic===t.topic);
  const d={name:'Adaptive Weakness Drill',type:'adaptive',id:'adaptive-drill'};
  for(let i=2;i<6;i++){const q={...u[i].q,subject:t.subject,topic:t.topic};registerLearningAttempt(d,q,q.answer,20000+i)}
  refreshMasteryBaselines();
})()`);
mstage = E(`state.learning.mastery[topicKey(${JSON.stringify(target.subject)},${JSON.stringify(target.topic)})]?.stage`);
check(mstage === 'ready', 'Four correct adaptive repairs unlock Mastery Retest', String(mstage));

const adaptive = E('adaptiveDrillPlan(10)');
check(adaptive && adaptive.questions.length === 10, 'Adaptive drill generates 10 questions');
check(new Set(adaptive.questions.map(q=>q.q.trim().toLowerCase().replace(/\s+/g,' '))).size === adaptive.questions.length, 'Adaptive drill has no duplicate stems');

const gate1 = E('masteryRetestPlan(6)');
check(gate1 && gate1.questions.length === 6, 'Mastery Gate 1 generates 6 transfer questions');
const gate1Stems = gate1.questions.map(q=>q.q.trim().toLowerCase().replace(/\s+/g,' '));
const out1 = E(`(()=>{
  const p=masteryRetestPlan(6);
  const d={questions:p.questions,masteryMeta:{key:p.key,subject:p.subject,topic:p.topic,requiredCorrect:p.requiredCorrect,gate:p.gate,baselineAccuracy:p.baselineAccuracy,createdAt:p.createdAt}};
  return applyMasteryRetest(d,p.questions.length,p.questions.length,0);
})()`);
check(out1.passed && out1.stage === 'confirming' && out1.gate === 1, 'Gate 1 passes but is not Mastered');

const gate2 = E('masteryRetestPlan(6)');
const gate2Stems = gate2.questions.map(q=>q.q.trim().toLowerCase().replace(/\s+/g,' '));
check(gate2Stems.filter(x=>gate1Stems.includes(x)).length === 0, 'Gate 2 transfer set has zero overlap with Gate 1');
const out2 = E(`(()=>{
  const p=masteryRetestPlan(6);
  const d={questions:p.questions,masteryMeta:{key:p.key,subject:p.subject,topic:p.topic,requiredCorrect:p.requiredCorrect,gate:p.gate,baselineAccuracy:p.baselineAccuracy,createdAt:p.createdAt}};
  return applyMasteryRetest(d,p.questions.length,p.questions.length,0);
})()`);
check(out2.passed && out2.stage === 'mastered' && out2.gate === 2, 'Gate 2 produces Mastered');

E(`state.learning.mastery[topicKey(${JSON.stringify(target.subject)},${JSON.stringify(target.topic)})].maintenanceDueAt=Date.now()-1000`);
const maint1 = E('maintenanceRetestPlan(5)');
check(maint1 && maint1.questions.length === 5 && maint1.requiredCorrect === 4, 'Retention gate = 5 questions, pass 4/5');
const mout1 = E(`(()=>{
  const p=maintenanceRetestPlan(5);
  const d={questions:p.questions,maintenanceMeta:{key:p.key,subject:p.subject,topic:p.topic,requiredCorrect:p.requiredCorrect,level:p.level,intervalDays:p.intervalDays,createdAt:p.createdAt}};
  return applyMaintenanceRetest(d,p.requiredCorrect,p.questions.length,0);
})()`);
check(mout1.passed && mout1.stage === 'mastered' && mout1.nextInterval === 7, 'Retention 4/5 preserves Mastery and advances to 7 days');

E(`state.learning.mastery[topicKey(${JSON.stringify(target.subject)},${JSON.stringify(target.topic)})].maintenanceDueAt=Date.now()-1000`);
const mout2 = E(`(()=>{
  const p=maintenanceRetestPlan(5);
  const d={questions:p.questions,maintenanceMeta:{key:p.key,subject:p.subject,topic:p.topic,requiredCorrect:p.requiredCorrect,level:p.level,intervalDays:p.intervalDays,createdAt:p.createdAt}};
  return applyMaintenanceRetest(d,p.requiredCorrect-1,p.questions.length,0);
})()`);
check(!mout2.passed && mout2.stage === 'repair', 'Retention failure reopens Repair');

// Regression: practice grading must not double-count on submit.
reset();
const practiceResult = E(`(()=>{
  const c=adaptiveQuestionUniverse()[0], q={...c.q,n:1,key:'reg:'+stableStemId(c.stem),subject:c.subject,topic:c.topic};
  const d={id:'reg-practice',name:'Regression Practice',questions:[q],mode:'practice',minutes:2,type:'adaptive',adaptiveMeta:{targets:[]}};
  const key=q.key;
  session={def:d,index:0,selections:{0:q.answer},remaining:100,submitted:false,flags:new Set(),paletteOpen:false,questionElapsed:{0:5000},answerMs:{0:5000},questionStartedAt:Date.now()};
  gradeOne(d,q,q.answer,key,5000);
  const stem=normStem(q.q), before=state.learning.attempts[stem].attempts;
  submitTest(false);
  const after=state.learning.attempts[stem].attempts;
  return {before,after,history:state.history.length,drills:state.learning.drills.length};
})()`);
check(practiceResult.before === 1 && practiceResult.after === 1, 'Practice submit does not double-grade', JSON.stringify(practiceResult));
check(practiceResult.history === 1 && practiceResult.drills === 1, 'Practice completion records history once');

// Session snapshot/resume across a normal test.
reset();
const resumed = E(`(()=>{
  const d=testDefs[0];
  session={def:d,index:2,selections:{0:d.questions[0].answer},remaining:321,submitted:false,flags:new Set([1]),paletteOpen:false,questionElapsed:{0:1500},answerMs:{0:1500},questionStartedAt:Date.now()};
  snapshotSession();
  session=null;
  resumeSavedSession();
  const out={index:session.index,remaining:session.remaining,selections:Object.keys(session.selections).length,flags:[...session.flags].length,id:session.def.id};
  if(timerHandle) clearInterval(timerHandle); timerHandle=null;
  return out;
})()`);
check(resumed.index === 2 && resumed.remaining === 321 && resumed.selections === 1 && resumed.flags === 1, 'Session snapshot/resume preserves progress', JSON.stringify(resumed));

// Readiness + Recovery synthetic evidence.
reset(`
  const old=Date.now()-3*DAY;
  state.history=[
    {id:'mock-1',test:'Full Mock 1',score:108,total:150,bySubject:{'ความสามารถทั่วไป':[14,20],'ภาษาไทย':[15,20],'IT/คอมพิวเตอร์':[28,40],'งานสารบรรณ':[22,30],'กฎหมายประชาชน':[18,25],'ภาษาอังกฤษ':[11,15]},unanswered:0,at:old,elapsedSec:10200,avgAnswerSec:68,completed:true},
    {id:'mock-2',test:'Full Mock 2',score:112,total:150,bySubject:{'ความสามารถทั่วไป':[15,20],'ภาษาไทย':[16,20],'IT/คอมพิวเตอร์':[29,40],'งานสารบรรณ':[23,30],'กฎหมายประชาชน':[18,25],'ภาษาอังกฤษ':[11,15]},unanswered:0,at:old+1000,elapsedSec:10140,avgAnswerSec:67.6,completed:true},
    {id:'mock-3',test:'Full Mock 3',score:115,total:150,bySubject:{'ความสามารถทั่วไป':[15,20],'ภาษาไทย':[16,20],'IT/คอมพิวเตอร์':[31,40],'งานสารบรรณ':[23,30],'กฎหมายประชาชน':[19,25],'ภาษาอังกฤษ':[11,15]},unanswered:0,at:old+2000,elapsedSec:10080,avgAnswerSec:67.2,completed:true}
  ];
`);
const readyLow = E('examReadiness()');
check(readyLow.n === 3 && readyLow.projected >= 108 && readyLow.projected < 120, 'Readiness projection uses recent Full Mocks', readyLow.projected.toFixed(2));
const rec = E('recoveryPlan()');
check(rec.mode === 'repair' && rec.steps.length >= 1, 'Below-target readiness creates Recovery plan', rec.steps.map(x=>x.subject+':+'+x.gain).join(', '));
const missionRecovery = E('dailyMissionPlan(45)');
check(missionRecovery.tasks.some(t=>t.kind==='recovery'), '45m mission routes into Recovery when score is below target');
check(!missionRecovery.tasks.some(t=>t.kind==='mock'), '45m Recovery mission still defers Full Mock');

// Stable 120+ evidence must switch to 180m validation instead of more broad repair.
reset(`
  const old=Date.now()-3*DAY;
  state.history=[
    {id:'mock-4',test:'Full Mock 4',score:122,total:150,bySubject:{'ความสามารถทั่วไป':[17,20],'ภาษาไทย':[17,20],'IT/คอมพิวเตอร์':[33,40],'งานสารบรรณ':[24,30],'กฎหมายประชาชน':[20,25],'ภาษาอังกฤษ':[11,15]},unanswered:0,at:old,elapsedSec:10140,avgAnswerSec:67.6,completed:true},
    {id:'mock-5',test:'Full Mock 5',score:124,total:150,bySubject:{'ความสามารถทั่วไป':[17,20],'ภาษาไทย':[17,20],'IT/คอมพิวเตอร์':[34,40],'งานสารบรรณ':[25,30],'กฎหมายประชาชน':[20,25],'ภาษาอังกฤษ':[11,15]},unanswered:0,at:old+1000,elapsedSec:10020,avgAnswerSec:66.8,completed:true},
    {id:'mock-6',test:'Full Mock 6',score:126,total:150,bySubject:{'ความสามารถทั่วไป':[17,20],'ภาษาไทย':[17,20],'IT/คอมพิวเตอร์':[35,40],'งานสารบรรณ':[25,30],'กฎหมายประชาชน':[20,25],'ภาษาอังกฤษ':[12,15]},unanswered:0,at:old+2000,elapsedSec:9900,avgAnswerSec:66,completed:true}
  ];
`);
const readyHigh = E('examReadiness()');
const recHigh = E('recoveryPlan()');
check(readyHigh.projected >= 123 && readyHigh.hits120 >= 2, 'Stable 120+ synthetic evidence reaches buffered readiness', readyHigh.projected.toFixed(2));
check(recHigh.mode === 'confirm', 'Buffered readiness exits broad Repair');
const mission180 = E('dailyMissionPlan(180)');
check(mission180.tasks.length === 1 && mission180.tasks[0].kind === 'mock' && mission180.tasks[0].minutes === 180, '180m stable mission becomes one Full Mock validation gate', JSON.stringify(mission180.tasks));

// Render all home engines after the synthetic flows.
E('renderHome()');
check(w.document.getElementById('dailyMissionPlanner').textContent.trim().length > 20, 'Daily Mission renders');
check(w.document.getElementById('readinessEngine').textContent.trim().length > 20, 'Readiness Engine renders');
check(w.document.getElementById('recoveryPlanner').textContent.trim().length > 20, 'Recovery Planner renders');
check(w.document.getElementById('improvementEngine').textContent.trim().length > 20, 'Improvement Engine renders');

await new Promise(r => w.setTimeout(r, 50));
check(runtimeErrors.length === 0, 'No runtime console/jsdom errors', runtimeErrors.join(' || '));

if (E('timerHandle')) E('clearInterval(timerHandle);timerHandle=null');
dom.window.close();

console.log('\nFINAL_INTEGRATION_PASS');
console.log(JSON.stringify({pass:true,checks:results.length,passed:results.filter(x=>x.pass).length,version:'UX v8.2 · L7 DAILY MISSION'},null,2));
