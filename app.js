// ================== Data & Storage ==================
const STORAGE_KEY = 'flashr-yna-v2';
const USER_KEY = 'flashrUser';
const USERS_KEY = 'flashrUsers';
const ADMIN_EMAIL = 'yassenhassouna39@gmail.com';

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const rid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);

function nowISO(){ return new Date().toISOString(); }

// initial sample
const sample = {
  courses:[{
    id: rid(),
    title:'مقدمة JavaScript',
    level:'مبتدئ',
    tags:['JS','Web','Basics'],
    description:'تعرّف على أساسيات جافاسكربت عبر بطاقات سريعة وتمارين قصيرة.',
    cover:'',
    lessons:[{
      id: rid(),
      title:'المتغيرات والقيم',
      flashcards:[
        {id:rid(),front:'ما هو المتغير؟',back:'مكان في الذاكرة نخزن فيه قيمة يمكن تغييرها لاحقًا.'},
        {id:rid(),front:'أنواع التعريف في JS؟',back:'let (متغير قابل للتغيير)، const (ثابت)، var (نطاق دالة/أقدم).'}
      ],
      quiz:[{id:rid(),q:'أي كلمة لتعريف ثابت؟',choices:['var','let','const'],answer:2}],
      code:"// جرّب\nconst name='YNA';\nconsole.log('Hello '+name);"
    },{
      id: rid(),
      title:'الدوال',
      flashcards:[{id:rid(),front:'ما هي الدالة؟',back:'كتلة كود قابلة لإعادة الاستخدام تُستدعى باسمها.'}],
      quiz:[{id:rid(),q:'أي صيغة صحيحة لتعريف دالة سهمية؟',choices:['function f(){}','const f=()=>{}','def f(): pass'],answer:1}],
      code:"const add=(a,b)=>a+b;\nconsole.log(add(2,3));"
    }]
  }]
};

let db = loadDB();
let role = 'learner';
let currentUser = loadCurrentUser();
let isAdmin = currentUser && currentUser.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase();
let activeCourseId = db.courses[0]?.id || null;
let activeLessonId = db.courses[0]?.lessons?.[0]?.id || null;

function loadDB(){
  try{ const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return structuredClone(sample); return JSON.parse(raw)}catch(e){return structuredClone(sample)}
}
function saveDB(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) }catch(e){} }

function loadCurrentUser(){
  try{ const raw = localStorage.getItem(USER_KEY); return raw? JSON.parse(raw): null }catch(e){ return null }
}
function saveCurrentUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }
function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY)||'[]') }catch(e){ return [] } }
function saveUsers(arr){ localStorage.setItem(USERS_KEY, JSON.stringify(arr)) }

// ================== Auth UI ==================
function showApp(){
  $('#authScreen').style.display='none';
  $('#app').style.display='grid';
  $('#logoutBtn').style.display='inline-block';
  $('#currentUserLabel').textContent = currentUser? (currentUser.name? currentUser.name : currentUser.email): '';
  role = isAdmin ? 'dev' : 'learner';
  render();
}
function showAuth(){
  $('#authScreen').style.display='flex';
  $('#app').style.display='none';
  $('#logoutBtn').style.display='none';
  $('#currentUserLabel').textContent = '';
}

// tabs switch between login & signup
$$('#authScreen .tabs .tab').forEach(b => {
  b.onclick = () => {
    $$('#authScreen .tabs .tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const which = b.dataset.auth;
    $('#loginForm').style.display = which==='login' ? 'block' : 'none';
    $('#signupForm').style.display = which==='signup' ? 'block' : 'none';
  };
});

$('#loginBtn').onclick = () => {
  const email = $('#loginEmail').value.trim();
  if(!email) return alert('أدخل بريدك الإلكتروني');
  // password optional now
  const users = getUsers();
  let u = users.find(x => x.email.toLowerCase()===email.toLowerCase());
  if(!u){
    // auto-provision a minimal account if not found
    u = { id: rid(), name: '', email, createdAt: nowISO() };
    users.unshift(u); saveUsers(users);
  }
  currentUser = u;
  isAdmin = email.toLowerCase()===ADMIN_EMAIL.toLowerCase();
  saveCurrentUser(currentUser);
  showApp();
};

$('#signupBtn').onclick = () => {
  const name = $('#signupName').value.trim();
  const email = $('#signupEmail').value.trim();
  if(!name || !email) return alert('أدخل الاسم والبريد');
  const users = getUsers();
  if(users.some(u => u.email.toLowerCase()===email.toLowerCase())){
    return alert('هذا البريد مسجل مسبقًا');
  }
  const u = { id: rid(), name, email, createdAt: nowISO() };
  users.unshift(u); saveUsers(users);
  currentUser = u; isAdmin = email.toLowerCase()===ADMIN_EMAIL.toLowerCase();
  saveCurrentUser(currentUser);
  showApp();
};

$('#logoutBtn').onclick = () => {
  localStorage.removeItem(USER_KEY);
  currentUser = null; isAdmin=false;
  showAuth();
};

// ================== Rendering ==================
function render(){
  // role segment
  $$('#roleSeg button').forEach(b=>{
    b.classList.toggle('active', b.dataset.role===role);
  });

  // admin-only UI
  $('#addCourseBtn').style.display = isAdmin ? 'inline-block' : 'none';
  $('#adminPanel').style.display = isAdmin ? 'block' : 'none';
  if(isAdmin) renderUsers();

  const q = $('#search').value.trim().toLowerCase();
  const list = q ? db.courses.filter(c=>[c.title,c.description,c.level,...(c.tags||[])].join(' ').toLowerCase().includes(q)) : db.courses;
  $('#courseCount').textContent = `عدد الكورسات: ${list.length}`;

  const coursesEl = $('#courses');
  coursesEl.innerHTML='';
  list.forEach(c=>{
    const card = document.createElement('div');
    card.className='course';
    card.innerHTML = `
      <div class="cover"></div>
      <div class="body">
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.description||'')}</p>
        <div class="tags"> ${[ `<span class='tag'>${escapeHtml(c.level)}</span>`, ...(c.tags||[]).slice(0,3).map(t=>`<span class='tag'>#${escapeHtml(t)}</span>` )].join(' ')} </div>
        ${isAdmin ? `
          <div class="toolbar" style="margin-top:10px">
            <input type="text" value="${escapeAttr(c.title)}" data-id="${c.id}" data-field="title" class="edit-course"/>
            <input type="text" value="${escapeAttr(c.description||'')}" data-id="${c.id}" data-field="description" class="edit-course"/>
            <button class="btn" data-remove="${c.id}">حذف</button>
          </div>` : ''}
      </div>`;
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.edit-course')|| e.target.closest('[data-remove]')) return;
      activeCourseId=c.id; activeLessonId=c.lessons[0]?.id||null; renderMain();
    });
    coursesEl.appendChild(card);
  });

  renderMain();
}

function renderMain(){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const header = $('#courseHeader');
  const tabs = $('#lessonTabs');
  const view = $('#view');
  if(!course){ header.innerHTML = `<div class='muted'>اختر كورسًا من القائمة أو أنشئ كورسًا جديدًا.</div>`; tabs.innerHTML=''; view.innerHTML=''; return; }

  header.innerHTML = `
    <div class="row">
      <h2 style="margin:0">${escapeHtml(course.title)}</h2>
      <span class="pill">${escapeHtml(course.level)}</span>
      <span class="spacer"></span>
      ${isAdmin ? `<button class="btn" id="addLessonBtn">درس جديد</button>`:''}
    </div>
    <div class="muted" style="margin-top:6px">${escapeHtml(course.description||'')}</div>`;

  tabs.innerHTML = `
    <button class="tab ${activeLessonId===null?'active':''}" data-lesson="">نظرة عامة</button>
    ${course.lessons.map(l=>`<button class="tab ${activeLessonId===l.id?'active':''}" data-lesson="${l.id}"> ${escapeHtml(l.title)} </button>`).join('')}
  `;

  if(activeLessonId===null){
    view.innerHTML = `
      <div class="grid" style="grid-template-columns:1fr 1fr; gap:16px">
        <div class="card3d">
          <div>
            <div class="card-meta">عدد الدروس</div>
            <div style="font-size:28px;font-weight:700">${course.lessons.length}</div>
          </div>
        </div>
        <div class="card3d">
          <div>
            <div class="card-meta">وسوم</div>
            <div class="tags">${(course.tags||[]).map(t=>`<span class='tag'>#${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </div>
      </div>`;
  } else {
    const lesson = course.lessons.find(l=>l.id===activeLessonId);
    view.innerHTML = `
      <div class="row">
        <h3 style="margin:0">${escapeHtml(lesson.title)}</h3>
        <span class="spacer"></span>
        ${isAdmin?`<button class="btn" id="removeLessonBtn">حذف الدرس</button>`:''}
      </div>
      <div class="tabs" style="margin:10px 0">
        <button class="tab active" data-subtab="cards">البطاقات</button>
        <button class="tab" data-subtab="quiz">اختبار سريع</button>
        <button class="tab" data-subtab="code">تجربة كود</button>
      </div>
      <div id="subView"></div>`;
    $$('#view .tabs .tab').forEach(b => b.onclick = () => renderSubTab(b.dataset.subtab));
    renderSubTab('cards');
  }

  // events
  $$('#lessonTabs .tab').forEach(b=>b.onclick = () => {
    const id = b.dataset.lesson || null; activeLessonId = id; renderMain();
  });
  const addLessonBtn = $('#addLessonBtn'); if(addLessonBtn) addLessonBtn.onclick = () => { addLesson(course.id) }
  const removeLessonBtn = $('#removeLessonBtn'); if(removeLessonBtn) removeLessonBtn.onclick = () => { removeLesson(course.id, activeLessonId) }
}

function renderSubTab(which){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const lesson = course.lessons.find(l=>l.id===activeLessonId);
  const sub = $('#subView');
  $$('#view .tabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.subtab===which));

  if(which==='cards'){
    sub.innerHTML = `
      <div class="flex">
        <div class="col">
          <div class="row" style="justify-content:space-between">
            <div class="muted">بطاقات: ${lesson.flashcards.length}</div>
            ${isAdmin?`<button class="btn" id="addCardBtn">بطاقة جديدة</button>`:''}
          </div>
          <div id="studyCard" class="card3d" style="min-height:180px"></div>
          <div class="row" style="justify-content:space-between">
            <button class="btn" id="prevCard">السابق</button>
            <button class="btn primary" id="flipCard">قلب البطاقة</button>
            <button class="btn" id="nextCard">التالي</button>
          </div>
        </div>
        <div class="col">
          <h4 style="margin:0 0 8px">إدارة البطاقات</h4>
          <div class="list" id="cardList"></div>
        </div>
      </div>`;
    cardIndex=0; renderCard(); renderCardList();
    if($('#addCardBtn')) $('#addCardBtn').onclick = () => addCard(course.id, lesson.id);
    $('#prevCard').onclick = ()=>{ shiftCard(-1) };
    $('#nextCard').onclick = ()=>{ shiftCard(1) };
    $('#flipCard').onclick = ()=>{ flipped=!flipped; renderCard() };
  }

  if(which==='quiz'){
    sub.innerHTML = `
      <div class="flex">
        <div class="col">
          <div id="quizPlay" class="panel pad"></div>
        </div>
        <div class="col">
          <h4 style="margin:0 0 8px">إدارة أسئلة الاختبار</h4>
          ${isAdmin?`<button class="btn" id="addQ">سؤال جديد</button>`:''}
          <div class="list" id="qList"></div>
        </div>
      </div>`;
    renderQuizPlayer(); renderQList();
    const addQ = $('#addQ'); if(addQ) addQ.onclick = ()=> addQuizQ(course.id, lesson.id);
  }

  if(which==='code'){
    sub.innerHTML = `
      <div class="flex">
        <div class="col">
          <h4 style="margin:0 0 8px">محرّر كود (JavaScript)</h4>
          <textarea id="codeArea">${escapeHtml(lesson.code||'')}</textarea>
          <div class="row" style="justify-content:flex-end;margin-top:8px">
            <button class="btn primary" id="runCode">تشغيل</button>
          </div>
          <div class="terminal" id="output">(لا يوجد)</div>
        </div>
        <div class="col">
          <div class="panel pad">
            <h4 style="margin:0 0 8px">نصائح</h4>
            <ul class="muted" style="margin:0; padding-right:18px">
              <li>ابدأ بمثال بسيط ثم طوّره خطوة بخطوة.</li>
              <li>اربط بين البطاقات النظرية والكود العملي.</li>
              <li>اجعل التمرين قصيرًا وهدفه واضح.</li>
            </ul>
          </div>
        </div>
      </div>`;
    $('#runCode').onclick = runCode;
    $('#codeArea').addEventListener('input', (e)=>{ lesson.code = e.target.value; saveDB(); });
  }
}

// ===== Cards state =====
let cardIndex=0; let flipped=false;
function renderCard(){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const lesson = course.lessons.find(l=>l.id===activeLessonId);
  const card = lesson.flashcards[cardIndex];
  const box = $('#studyCard');
  if(!card){ box.innerHTML = `<div class='muted'>لا توجد بطاقات بعد.</div>`; return; }
  box.innerHTML = `
    <div>
      <div class="card-meta">${flipped?'الإجابة':'السؤال'}</div>
      <div style="font-size:20px;font-weight:600;line-height:1.8">${escapeHtml(flipped?card.back:card.front)}</div>
    </div>`;
}
function shiftCard(dir){
  const lesson = db.courses.find(c=>c.id===activeCourseId).lessons.find(l=>l.id===activeLessonId);
  if(!lesson.flashcards.length) return; 
  cardIndex = (cardIndex + dir + lesson.flashcards.length) % lesson.flashcards.length;
  flipped=false; renderCard();
}

function renderCardList(){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const lesson = course.lessons.find(l=>l.id===activeLessonId);
  const list = $('#cardList');
  list.innerHTML='';
  lesson.flashcards.forEach((c,i)=>{
    const el = document.createElement('div');
    el.className='item';
    el.innerHTML = `
      <div class="row">
        <div class="muted">بطاقة #${i+1}</div>
        ${isAdmin?`<button class="btn" data-del="${c.id}">حذف</button>`:''}
      </div>
      ${isAdmin ? `
        <textarea data-id="${c.id}" data-field="front" class="edit-card">${escapeHtml(c.front)}</textarea>
        <textarea data-id="${c.id}" data-field="back" class="edit-card">${escapeHtml(c.back)}</textarea>
      ` : `
        <div>${escapeHtml(c.front)}</div>
        <div class="muted">${escapeHtml(c.back)}</div>
      `}`;
    list.appendChild(el);
  });
  if(isAdmin){
    $$('#cardList [data-del]').forEach(b=> b.onclick = ()=> removeCard(course.id, lesson.id, b.dataset.del));
    $$('#cardList .edit-card').forEach(t=> t.oninput = (e)=> updateCard(course.id, lesson.id, e.target.dataset.id, {[e.target.dataset.field]: e.target.value}));
  }
}

// ===== Quiz =====
let qi=0, selected=null, score=0, finished=false;
function renderQuizPlayer(){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const lesson = course.lessons.find(l=>l.id===activeLessonId);
  const box = $('#quizPlay');
  if(!lesson.quiz.length){ box.innerHTML = `<div class='muted'>لا توجد أسئلة بعد.</div>`; return; }
  if(finished){
    box.innerHTML = `
      <div class="center">
        <div style="font-size:24px;font-weight:700">نتيجتك: ${score} / ${lesson.quiz.length}</div>
        <button class="btn" id="restart">إعادة</button>
      </div>`;
    $('#restart').onclick = ()=>{ qi=0; selected=null; score=0; finished=false; renderQuizPlayer(); };
    return;
  }
  const q = lesson.quiz[qi];
  box.innerHTML = `
    <div class="muted">سؤال ${qi+1} من ${lesson.quiz.length}</div>
    <div style="font-weight:600;margin:8px 0">${escapeHtml(q.q)}</div>
    <div class="choices">
      ${q.choices.map((c,idx)=>`
        <label class="choice">
          <input type="radio" name="q${q.id}" ${selected===idx?'checked':''} data-idx="${idx}"/> ${escapeHtml(c||'')}
        </label>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:8px">
      <button class="btn primary" id="submitQ">إرسال</button>
    </div>`;
  $$('#quizPlay input[type=radio]').forEach(r=> r.onchange = ()=>{ selected=+r.dataset.idx });
  $('#submitQ').onclick = ()=>{
    if(selected===null) return;
    if(selected===q.answer) score++;
    if(qi+1<lesson.quiz.length){ qi++; selected=null; renderQuizPlayer(); }
    else { finished=true; renderQuizPlayer(); }
  };
}

function renderQList(){
  const course = db.courses.find(c=>c.id===activeCourseId);
  const lesson = course.lessons.find(l=>l.id===activeLessonId);
  const list = $('#qList'); list.innerHTML='';
  lesson.quiz.forEach((q,i)=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `
      <div class="row">
        <div class="muted">سؤال #${i+1}</div>
        ${isAdmin?`<button class="btn" data-delq="${q.id}">حذف</button>`:''}
      </div>
      ${isAdmin?`
        <input type="text" value="${escapeAttr(q.q)}" data-id="${q.id}" data-field="q" class="edit-q">
        ${[0,1,2,3].map(k=>`<div class="row"><span class="pill">اختيار ${k+1}</span><input type="text" value="${escapeAttr(q.choices[k]||'')}" data-id="${q.id}" data-idx="${k}" class="edit-choice"></div>`).join('')}
        <div class="row"><span class="pill">الإجابة الصحيحة</span><input type="number" min="0" max="3" value="${q.answer}" data-id="${q.id}" class="edit-ans" style="width:90px"></div>
      `: `
        <div>${escapeHtml(q.q)}</div>
      `}`;
    list.appendChild(el);
  });
  if(isAdmin){
    $$('#qList [data-delq]').forEach(b=> b.onclick = ()=> removeQuizQ(course.id, lesson.id, b.dataset.delq));
    $$('#qList .edit-q').forEach(inp=> inp.oninput = (e)=> updateQuizQ(course.id, lesson.id, e.target.dataset.id, {q:e.target.value}));
    $$('#qList .edit-choice').forEach(inp=> inp.oninput = (e)=>{
      const id=e.target.dataset.id, k=+e.target.dataset.idx; const q = getQuiz(course.id, lesson.id, id);
      q.choices[k]= e.target.value; saveDB();
    });
    $$('#qList .edit-ans').forEach(inp=> inp.oninput = (e)=> updateQuizQ(course.id, lesson.id, e.target.dataset.id, {answer: Math.max(0, Math.min(3, +e.target.value||0))}));
  }
}

// ================== Mutations ==================
function addCourse(){
  const c={id:rid(),title:'كورس جديد',level:'مبتدئ',tags:[],description:'',cover:'',lessons:[]};
  db.courses.unshift(c); saveDB(); activeCourseId=c.id; activeLessonId=null; render();
}
function removeCourse(id){ db.courses = db.courses.filter(c=>c.id!==id); if(activeCourseId===id){activeCourseId=null; activeLessonId=null} saveDB(); render(); }
function patchCourse(id, patch){ Object.assign(db.courses.find(c=>c.id===id), patch); saveDB(); render(); }

function addLesson(courseId){ const l={id:rid(),title:'درس جديد',flashcards:[],quiz:[],code:"// اكتب كودك هنا\nconsole.log('Ready!')"}; getCourse(courseId).lessons.unshift(l); saveDB(); activeLessonId=l.id; renderMain(); }
function removeLesson(courseId, lessonId){ const c=getCourse(courseId); c.lessons=c.lessons.filter(l=>l.id!==lessonId); saveDB(); activeLessonId=null; renderMain(); }

function addCard(courseId, lessonId){ getLesson(courseId, lessonId).flashcards.unshift({id:rid(),front:'سؤال جديد',back:'الإجابة'}); saveDB(); renderSubTab('cards'); }
function updateCard(courseId, lessonId, cardId, patch){ Object.assign(getLesson(courseId, lessonId).flashcards.find(x=>x.id===cardId), patch); saveDB(); }
function removeCard(courseId, lessonId, cardId){ const l=getLesson(courseId, lessonId); l.flashcards = l.flashcards.filter(x=>x.id!==cardId); saveDB(); renderSubTab('cards'); }

function addQuizQ(courseId, lessonId){ getLesson(courseId, lessonId).quiz.unshift({id:rid(),q:'سؤال اختيار من متعدد',choices:['A','B','C',''],answer:0}); saveDB(); renderSubTab('quiz'); }
function getQuiz(courseId, lessonId, qid){ return getLesson(courseId, lessonId).quiz.find(q=>q.id===qid) }
function updateQuizQ(courseId, lessonId, qid, patch){ Object.assign(getQuiz(courseId, lessonId, qid), patch); saveDB(); }
function removeQuizQ(courseId, lessonId, qid){ const l=getLesson(courseId, lessonId); l.quiz = l.quiz.filter(q=>q.id!==qid); saveDB(); renderSubTab('quiz'); }

function getCourse(id){ return db.courses.find(c=>c.id===id) }
function getLesson(cId,lId){ return getCourse(cId).lessons.find(l=>l.id===lId) }

// ================== Users (Admin Panel) ==================
function renderUsers(){
  const users = getUsers();
  const box = $('#usersList'); box.innerHTML='';
  if(!users.length){ box.innerHTML = `<div class="muted">لا يوجد مستخدمون بعد.</div>`; return; }
  users.forEach(u=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `
      <div class="row">
        <div>
          <div><strong>${escapeHtml(u.name||'(بدون اسم)')}</strong></div>
          <div class="muted">${escapeHtml(u.email)}</div>
        </div>
        <div class="pill">${new Date(u.createdAt).toLocaleString('ar-EG')}</div>
      </div>`;
    box.appendChild(el);
  });
}

// ================== Code Runner ==================
function runCode(){
  const code = $('#codeArea').value;
  let logs=[]; const original = console.log; console.log = (...a)=> logs.push(a.map(x=>String(x)).join(' '));
  try{ new Function(code)(); $('#output').textContent = logs.join('\n') || '(لا يوجد)'; }
  catch(e){ $('#output').textContent = 'خطأ: '+ e.message }
  finally{ console.log = original }
}

// ================== Utils & Events ==================
function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);
}
function escapeAttr(s=''){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;');
}

// header actions
$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(db,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href=url; a.download='flashr-cards-yna.json'; a.click(); URL.revokeObjectURL(url);
};
$('#importFile').onchange = async (e)=>{
  const f = e.target.files?.[0]; if(!f) return; const txt = await f.text();
  try{ const parsed=JSON.parse(txt); if(!Array.isArray(parsed.courses)) throw new Error('صيغة غير صالحة'); db=parsed; activeCourseId = db.courses[0]?.id||null; activeLessonId = db.courses[0]?.lessons?.[0]?.id||null; saveDB(); render(); }
  catch(err){ alert('تعذّر الاستيراد: '+ err.message) }
  finally{ e.target.value=''; }
};

// role switch (for preview only; admin overrides to dev automatically)
$$('#roleSeg button').forEach(b=> b.onclick = ()=>{ role = b.dataset.role; render(); });

// Sidebar inline edits & delete
document.addEventListener('input', (e)=>{
  const el=e.target;
  if(el.classList.contains('edit-course')){
    patchCourse(el.dataset.id, {[el.dataset.field]: el.value});
  }
});
document.addEventListener('click', (e)=>{
  const del = e.target.closest('[data-remove]'); if(del){ removeCourse(del.dataset.remove) }
});

// Add course button
$('#addCourseBtn').onclick = addCourse;
// Search
$('#search').oninput = render;

// ====== boot ======
if(currentUser){ showApp(); } else { showAuth(); }
