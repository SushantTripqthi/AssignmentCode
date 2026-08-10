'use strict';

const API='http://127.0.0.1:8000';
const TASKS=`${API}/tasks/`, PROJECTS=`${API}/projects/`, USERS=`${API}/users/`;
const QUICK=`${API}/tasks/quick-add`, SEARCH=`${API}/tasks/search`;
let tasks=[],projects=[],users=[],editing=null,modalMode=null;

const $=id=>document.getElementById(id);
document.addEventListener('DOMContentLoaded',init);

async function init(){
 document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
 $('menuBtn').onclick=()=>$('sidebar').classList.toggle('open');
 $('taskForm').onsubmit=saveTask; $('cancelEdit').onclick=resetTask;
 $('quickForm').onsubmit=e=>quickAdd(e,$('quickText'),$('quickProject'),'quickMsg',e.submitter);
 $('quickPageForm').onsubmit=e=>quickAdd(e,$('quickPageText'),$('quickPageProject'),'quickPageMsg',e.submitter);
 $('refreshTasks').onclick=loadTasks; $('refreshProjects').onclick=loadProjects; $('refreshUsers').onclick=loadUsers;
 $('apply').onclick=applySearch; $('search').onkeydown=e=>{if(e.key==='Enter')applySearch()};
 $('sort').onchange=applySearch; $('order').onchange=applySearch; $('projectFilter').onchange=filterProject;
 $('addProject').onclick=$('addProjectTop').onclick=()=>openProjectModal();
 $('addUser').onclick=()=>openUserModal(); $('goAddTask').onclick=()=>{showPage('dashboard');$('taskTitle').focus()};
 $('modalClose').onclick=$('modalCancel').onclick=closeModal; $('modalForm').onsubmit=saveModal;
 await Promise.allSettled([loadTasks(),loadProjects(),loadUsers()]);
}

function showPage(page){
 document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active')); $(page).classList.add('active');
 const info={dashboard:['Dashboard','Overview of tasks and projects'],projects:['Projects','Create and manage projects'],tasks:['Tasks','View and manage all tasks'],users:['Users','Manage users and project owners'],quick:['AI Quick Add','Create tasks using natural language'],stats:['Statistics','Live TaskFlow statistics'],about:['About','TaskFlow application information']}[page];
 $('pageTitle').textContent=info[0];$('pageSub').textContent=info[1];
 if(innerWidth<=850)$('sidebar').classList.remove('open');
}

async function loadTasks(){
 try{let r=await fetch(TASKS);if(!r.ok)throw Error(await apiError(r));tasks=await r.json();if(!Array.isArray(tasks))tasks=[];renderTasks(tasks);stats();$('taskStatus').textContent=`${tasks.length} task(s) loaded`;connected(true)}
 catch(e){connected(false);$('taskStatus').textContent='Unable to load tasks.';toast(e.message,'error')}
}
async function loadProjects(){
 try{let r=await fetch(PROJECTS);if(!r.ok)throw Error(await apiError(r));projects=await r.json();if(!Array.isArray(projects))projects=[];populateProjects();renderProjects();stats();$('projectStatus').textContent=`${projects.length} project(s) loaded`}
 catch(e){$('projectStatus').textContent='Unable to load projects.';toast(e.message,'error')}
}
async function loadUsers(){
 try{let r=await fetch(USERS);if(!r.ok)throw Error(await apiError(r));users=await r.json();if(!Array.isArray(users))users=[];renderUsers();stats();$('userStatus').textContent=`${users.length} user(s) loaded`}
 catch(e){$('userStatus').textContent='Unable to load users.';toast(e.message,'error')}
}
function connected(ok){$('connection').textContent=ok?'Backend: Connected':'Backend: Offline';$('sideStatus').textContent=ok?'Backend connected':'Backend offline';$('sideDot').parentElement.classList.toggle('online',ok);$('sideDot').parentElement.classList.toggle('offline',!ok)}
function populateProjects(){
 ['projectFilter','taskProject','quickProject','quickPageProject'].forEach(id=>{
  let s=$(id),old=s.value;s.innerHTML='';let first=document.createElement('option');first.value='';first.textContent=id==='projectFilter'?'All Projects':'Select project';s.append(first);
  projects.forEach(p=>{let o=document.createElement('option');o.value=p.id;o.textContent=`${p.name} (#${p.id})`;s.append(o)});if([...s.options].some(o=>o.value===old))s.value=old;
 });
}
function priority(v){return String(v&&typeof v==='object'?v.value:v||'medium').toLowerCase()}
function projectName(id){let p=projects.find(x=>+x.id===+id);return p?`${p.name} (#${p.id})`:`Project #${id||'—'}`}
function userName(id){let u=users.find(x=>+x.id===+id);return u?`${u.name} (#${u.id})`:`User #${id||'—'}`}
function cell(row,val){let c=document.createElement('td');c.textContent=val??'—';row.append(c)}
function actionCell(row,task){
 let c=document.createElement('td'),box=document.createElement('div');box.className='row-actions';
 let e=document.createElement('button');e.className='icon-btn edit';e.textContent='✎';e.title='Edit';e.onclick=()=>editTask(task);
 let d=document.createElement('button');d.className='icon-btn delete';d.textContent='×';d.title='Delete';d.onclick=()=>deleteTask(task.id);box.append(e,d);c.append(box);row.append(c)
}
function renderTaskTable(body,list){
 body.innerHTML='';
 list.forEach(t=>{let r=document.createElement('tr');cell(r,t.id);cell(r,t.title||'Untitled');cell(r,t.description||'—');let pc=document.createElement('td'),b=document.createElement('span');b.className=`badge ${priority(t.priority)}`;b.textContent=priority(t.priority);pc.append(b);r.append(pc);cell(r,t.due_date||'—');cell(r,projectName(t.project_id));actionCell(r,t);body.append(r)});
}
function renderTasks(list){renderTaskTable($('taskBody'),list);renderTaskTable($('allTaskBody'),list);$('emptyTasks').hidden=list.length!==0}
function renderProjects(){
 let b=$('projectBody');b.innerHTML='';projects.forEach(p=>{let r=document.createElement('tr');cell(r,p.id);cell(r,p.name);cell(r,p.description||'—');cell(r,userName(p.owner_id));let c=document.createElement('td'),box=document.createElement('div');box.className='row-actions';
 let v=document.createElement('button');v.className='icon-btn edit';v.textContent='↗';v.onclick=()=>projectDetails(p.id);
 let d=document.createElement('button');d.className='icon-btn delete';d.textContent='×';d.onclick=()=>deleteProject(p.id);box.append(v,d);c.append(box);r.append(c);b.append(r)})
}
function renderUsers(){
 let b=$('userBody');b.innerHTML='';users.forEach(u=>{let r=document.createElement('tr');cell(r,u.id);cell(r,u.name);cell(r,u.email);let c=document.createElement('td'),box=document.createElement('div');box.className='row-actions';
 let v=document.createElement('button');v.className='icon-btn edit';v.textContent='↗';v.onclick=()=>userDetails(u.id);
 let d=document.createElement('button');d.className='icon-btn delete';d.textContent='×';d.onclick=()=>deleteUser(u.id);box.append(v,d);c.append(box);r.append(c);b.append(r)})
}
function stats(){
 let c={low:0,medium:0,high:0};tasks.forEach(t=>{let p=priority(t.priority);if(c[p]!=null)c[p]++});
 ['total','bigTotal'].forEach(id=>$(id).textContent=tasks.length);['low','bigLow'].forEach(id=>$(id).textContent=c.low);['medium','bigMedium'].forEach(id=>$(id).textContent=c.medium);['high','bigHigh'].forEach(id=>$(id).textContent=c.high);
 $('projectCount').textContent=projects.length;$('userCount').textContent=users.length;$('sumHigh').textContent=c.high;$('sumMedium').textContent=c.medium;$('sumLow').textContent=c.low
}
async function saveTask(e){
 e.preventDefault();let title=$('taskTitle').value.trim(),pid=+$('taskProject').value;$('titleError').textContent='';
 if(title.length<2||title.length>200){$('titleError').textContent='Title must contain 2 to 200 characters.';return}if(!pid){msg('taskMsg','Please select a project.','err');return}
 let payload={title,description:$('taskDescription').value.trim(),priority:$('taskPriority').value,due_date:$('taskDue').value.trim()||null,project_id:pid};
 $('taskSubmit').disabled=true;
 try{let url=editing?`${TASKS}${editing}`:TASKS,r=await fetch(url,{method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error(await apiError(r));msg('taskMsg',editing?'Task updated successfully.':'Task created successfully.','ok');resetTask();await loadTasks()}catch(e){msg('taskMsg',e.message,'err')}finally{$('taskSubmit').disabled=false}
}
function editTask(t){editing=t.id;$('taskTitle').value=t.title||'';$('taskDescription').value=t.description||'';$('taskPriority').value=priority(t.priority);$('taskDue').value=t.due_date||'';$('taskProject').value=t.project_id||'';$('taskSubmit').textContent='Update Task';$('cancelEdit').hidden=false;showPage('dashboard');window.scrollTo({top:0,behavior:'smooth'})}
function resetTask(){$('taskForm').reset();$('taskPriority').value='medium';$('taskSubmit').textContent='＋ Add Task';$('cancelEdit').hidden=true;$('titleError').textContent='';editing=null}
async function deleteTask(id){if(!confirm(`Delete task #${id}?`))return;try{let r=await fetch(`${TASKS}${id}`,{method:'DELETE'});if(!r.ok)throw Error(await apiError(r));toast('Task deleted successfully.','success');loadTasks()}catch(e){toast(e.message,'error')}}
async function applySearch(){
 let q=$('search').value.trim(),sort=$('sort').value,order=$('order').value;
 if(q){let algo=document.querySelector('input[name=algo]:checked').value;try{let r=await fetch(`${SEARCH}?title=${encodeURIComponent(q)}&algo=${algo}`);if(r.status===404){renderTasks([]);$('taskStatus').textContent='No matching task found.';return}if(!r.ok)throw Error(await apiError(r));let x=await r.json();renderTasks(Array.isArray(x)?x:[x]);$('taskStatus').textContent=`Search completed using ${algo} search.`}catch(e){toast(e.message,'error')}return}
 let list=[...tasks];if(sort){list.sort((a,b)=>{if(sort==='priority'){let o={low:1,medium:2,high:3};return(o[priority(a.priority)]||99)-(o[priority(b.priority)]||99)}return String(a[sort]||'').localeCompare(String(b[sort]||''),undefined,{numeric:true})});if(order==='desc')list.reverse()}renderTasks(list);$('taskStatus').textContent=sort?`Sorted by ${sort} (${order}).`:`${list.length} task(s) loaded`
}
function filterProject(){let id=$('projectFilter').value;let list=id?tasks.filter(t=>String(t.project_id)===id):tasks;renderTasks(list);$('taskStatus').textContent=`${list.length} task(s) shown`}
async function quickAdd(e,text,select,msgId,button){e.preventDefault();if(!text.value.trim()||!select.value){msg(msgId,'Please enter a description and select a project.','err');return}button.disabled=true;try{let r=await fetch(QUICK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:text.value.trim(),project_id:+select.value})});if(!r.ok)throw Error(await apiError(r));msg(msgId,'Task created successfully using Quick Add.','ok');e.target.reset();await loadTasks()}catch(x){msg(msgId,x.message,'err')}finally{button.disabled=false}}
function openUserModal(){modalMode='user';$('modalTitle').textContent='Add User';$('modalSub').textContent='Create a new TaskFlow user.';$('modalFields').innerHTML=`<label>Name<input id="mName" minlength="2" maxlength="100" required placeholder="Enter name"></label><label>Email<input id="mEmail" type="email" required placeholder="Enter email"></label>`;openModal()}
function openProjectModal(){modalMode='project';$('modalTitle').textContent='Add Project';$('modalSub').textContent='Create a project and assign an owner.';let opts=users.map(u=>`<option value="${u.id}">${u.name} (#${u.id})</option>`).join('');$('modalFields').innerHTML=`<label>Project Name<input id="mProjectName" minlength="2" maxlength="100" required placeholder="Enter project name"></label><label>Description<textarea id="mProjectDesc" rows="3" placeholder="Enter description"></textarea></label><label>Owner<select id="mOwner" required><option value="">Select owner</option>${opts}</select></label>`;openModal()}
function openModal(){$('modalMsg').textContent='';$('modalBg').hidden=false}
function closeModal(){$('modalBg').hidden=true;$('modalFields').innerHTML='';modalMode=null}
async function saveModal(e){e.preventDefault();$('modalSave').disabled=true;try{let url=modalMode==='user'?USERS:PROJECTS,payload=modalMode==='user'?{name:$('mName').value.trim(),email:$('mEmail').value.trim()}:{name:$('mProjectName').value.trim(),description:$('mProjectDesc').value.trim()||null,owner_id:+$('mOwner').value};if(modalMode==='project'&&!payload.owner_id)throw Error('Please select an owner.');let r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error(await apiError(r));closeModal();toast(modalMode==='user'?'User created successfully.':'Project created successfully.','success');await (modalMode==='user'?loadUsers():loadProjects())}catch(x){msg('modalMsg',x.message,'err')}finally{$('modalSave').disabled=false}}
async function deleteProject(id){if(!confirm(`Delete project #${id}?`))return;try{let r=await fetch(`${PROJECTS}${id}`,{method:'DELETE'});if(!r.ok)throw Error(await apiError(r));toast('Project deleted successfully.','success');await loadProjects();await loadTasks()}catch(e){toast(e.message,'error')}}
async function deleteUser(id){if(!confirm(`Delete user #${id}?`))return;try{let r=await fetch(`${USERS}${id}`,{method:'DELETE'});if(!r.ok)throw Error(await apiError(r));toast('User deleted successfully.','success');await loadUsers();await loadProjects()}catch(e){toast(e.message,'error')}}
async function projectDetails(id){try{let r=await fetch(`${PROJECTS}${id}`);if(!r.ok)throw Error(await apiError(r));let p=await r.json();alert(`Project #${p.id}\n\nName: ${p.name}\nDescription: ${p.description||'—'}\nOwner: ${userName(p.owner_id)}`)}catch(e){toast(e.message,'error')}}
async function userDetails(id){try{let r=await fetch(`${USERS}${id}`);if(!r.ok)throw Error(await apiError(r));let u=await r.json();alert(`User #${u.id}\n\nName: ${u.name}\nEmail: ${u.email}`)}catch(e){toast(e.message,'error')}}
async function apiError(r){try{let d=await r.json();if(d.detail)return Array.isArray(d.detail)?d.detail.map(x=>x.msg||'Validation error').join(', '):String(d.detail)}catch{}return`Request failed with HTTP ${r.status}.`}
function msg(id,text,type){$(id).textContent=text;$(id).className=`msg ${type}`}
let timer;function toast(text,type=''){let t=$('toast');t.textContent=text;t.className=`toast show ${type}`;clearTimeout(timer);timer=setTimeout(()=>t.className='toast',3000)}
