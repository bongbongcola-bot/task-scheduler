const API_URL = 'http://localhost:3000/api';

// 페이지 로드 시 작업 목록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // 폼 제출
    document.getElementById('taskForm').addEventListener('submit', addTask);
});

// 작업 목록 로드
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('작업 로드 실패:', error);
    }
}

// 작업 추가
async function addTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const startTime = document.getElementById('startTime').value;
    const order = document.getElementById('order').value;
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, startTime, order })
        });
        
        if (response.ok) {
            // 폼 초기화
            document.getElementById('taskForm').reset();
            // 작업 목록 새로고침
            loadTasks();
        }
    } catch (error) {
        console.error('작업 추가 실패:', error);
    }
}

// 작업 완료 처리
async function completeTask(id) {
    const completedDescription = prompt('완료 설명을 입력하세요:');
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'completed', 
                completedDescription: completedDescription || '' 
            })
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('작업 완료 실패:', error);
    }
}

// 작업 삭제
async function deleteTask(id) {
    if (confirm('이 작업을 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('작업 삭제 실패:', error);
        }
    }
}

// 작업 렌더링
function renderTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-message">등록된 작업이 없습니다.</div>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-order">순서: ${task.order}</div>
            </div>
            
            <div class="task-description">${task.description || '설명 없음'}</div>
            
            <div class="task-time">
                ⏰ 시작 시간: ${new Date(task.startTime).toLocaleString('ko-KR')}
            </div>
            
            <div class="task-status status-${task.status}">
                ${getStatusText(task.status)}
            </div>
            
            ${task.completedDescription ? `
                <div class="task-description" style="color: #28a745; margin-top: 10px;">
                    ✅ 완료 설명: ${task.completedDescription}
                </div>
            ` : ''}
            
            ${task.status !== 'completed' ? `
                <div class="task-actions">
                    <button class="complete-btn" onclick="completeTask('${task.id}')">✅ 완료</button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">🗑️ 삭제</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 상태 텍스트
function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ 대기 중',
        'running': '⚙️ 진행 중',
        'completed': '✅ 완료됨'
    };
    return statusMap[status] || status;
}
