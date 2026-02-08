const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 작업 파일 경로
const getTasksDir = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join('/Users/bongbong/etc/작업스케줄러/tasks', dateStr);
};

const getTasksFile = () => path.join(getTasksDir(), 'tasks.json');

// 디렉토리 생성
const ensureDir = () => {
  const dir = getTasksDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 작업 파일 읽기
const loadTasks = () => {
  ensureDir();
  const file = getTasksFile();
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return [];
};

// 작업 파일 저장
const saveTasks = (tasks) => {
  ensureDir();
  const file = getTasksFile();
  fs.writeFileSync(file, JSON.stringify(tasks, null, 2), 'utf8');
};

// API: 모든 작업 조회
app.get('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

// API: 새 작업 추가
app.post('/api/tasks', (req, res) => {
  const { title, description, startTime, order } = req.body;
  const tasks = loadTasks();
  
  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    startTime,
    order: parseInt(order),
    status: 'pending', // pending, running, completed
    completedAt: null,
    completedDescription: '',
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  tasks.sort((a, b) => a.order - b.order); // 순서로 정렬
  saveTasks(tasks);
  
  res.json(newTask);
});

// API: 작업 업데이트 (완료 처리)
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status, completedDescription } = req.body;
  
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: '작업을 찾을 수 없습니다' });
  }
  
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date().toISOString();
    task.completedDescription = completedDescription || '';
  }
  
  saveTasks(tasks);
  res.json(task);
});

// API: 대기 중인 작업 조회 (OpenClaw용)
app.get('/api/tasks/pending', (req, res) => {
  const tasks = loadTasks();
  const now = new Date();
  
  // 시작 시간이 지났거나 같은 pending 작업들
  const pending = tasks.filter(task => {
    if (task.status !== 'pending') return false;
    const taskTime = new Date(task.startTime);
    return taskTime <= now;
  });
  
  pending.sort((a, b) => a.order - b.order);
  res.json(pending);
});

app.listen(PORT, () => {
  console.log(`✅ 작업 스케줄러 서버 실행 중: http://localhost:${PORT}`);
});
