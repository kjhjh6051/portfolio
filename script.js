// DOM 요소 선택
const newProjectBtn = document.getElementById('newProjectBtn');
const viewProjectsBtn = document.getElementById('viewProjectsBtn');
const projectForm = document.getElementById('projectForm');
const projectList = document.getElementById('projectList');
const uploadForm = document.getElementById('uploadForm');
const projectsContainer = document.getElementById('projects');
const commentModal = document.getElementById('commentModal');
const closeModal = document.querySelector('.close');
const commentForm = document.getElementById('commentForm');
const projectDetails = document.getElementById('projectDetails');
const commentsContainer = document.getElementById('comments');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const projectIdInput = document.getElementById('projectId');

// 로컬 스토리지에서 프로젝트와 댓글 데이터 가져오기
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || {};
let projectToDelete = null;

// 이벤트 리스너 등록
newProjectBtn.addEventListener('click', showProjectForm);
viewProjectsBtn.addEventListener('click', showProjectList);
uploadForm.addEventListener('submit', handleProjectSubmit);
closeModal.addEventListener('click', closeCommentModal);
commentForm.addEventListener('submit', handleCommentSubmit);
confirmDelete.addEventListener('click', handleDeleteConfirm);
cancelDelete.addEventListener('click', closeDeleteModal);
cancelBtn.addEventListener('click', cancelEdit);

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === commentModal) {
        closeCommentModal();
    }
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// ESC 키로 모달 닫기
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!commentModal.classList.contains('hidden')) {
            closeCommentModal();
        }
        if (!deleteModal.classList.contains('hidden')) {
            closeDeleteModal();
        }
    }
});

// 초기 화면 설정
document.addEventListener('DOMContentLoaded', () => {
    projectForm.classList.add('hidden');
    projectList.classList.remove('hidden');
    commentModal.classList.add('hidden');
    deleteModal.classList.add('hidden');
    displayProjects();
});

// 프로젝트 폼 표시
function showProjectForm(e) {
    e.preventDefault();
    resetForm();
    projectForm.classList.remove('hidden');
    projectList.classList.add('hidden');
}

// 프로젝트 목록 표시
function showProjectList(e) {
    e.preventDefault();
    resetForm();
    projectForm.classList.add('hidden');
    projectList.classList.remove('hidden');
}

// 폼 초기화
function resetForm() {
    uploadForm.reset();
    projectIdInput.value = '';
    submitBtn.textContent = '등록하기';
    cancelBtn.classList.add('hidden');
    projectForm.classList.remove('editing');
}

// 새 프로젝트 제출 처리
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        id: projectIdInput.value || Date.now(),
        studentName: document.getElementById('studentName').value,
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        date: new Date().toLocaleDateString()
    };

    if (projectIdInput.value) {
        // 프로젝트 수정
        const index = projects.findIndex(p => p.id == projectIdInput.value);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData };
        }
    } else {
        // 새 프로젝트 추가
        projects.push(projectData);
    }

    localStorage.setItem('projects', JSON.stringify(projects));
    resetForm();
    showProjectList(e);
    displayProjects();
}

// 프로젝트 수정 시작
function startEdit(projectId) {
    const project = projects.find(p => p.id == projectId);
    if (!project) return;

    projectIdInput.value = project.id;
    document.getElementById('studentName').value = project.studentName;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDescription').value = project.description;

    submitBtn.textContent = '수정하기';
    cancelBtn.classList.remove('hidden');
    projectForm.classList.add('editing');
    projectForm.classList.remove('hidden');
    projectList.classList.add('hidden');
}

// 프로젝트 수정 취소
function cancelEdit() {
    resetForm();
    showProjectList({ preventDefault: () => {} });
}

// 프로젝트 삭제 모달 표시
function showDeleteModal(projectId) {
    projectToDelete = projectId;
    deleteModal.classList.remove('hidden');
}

// 프로젝트 삭제 모달 닫기
function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    projectToDelete = null;
}

// 프로젝트 삭제 확인
function handleDeleteConfirm() {
    if (projectToDelete === null) return;

    // 프로젝트 삭제
    projects = projects.filter(p => p.id != projectToDelete);
    // 관련 댓글 삭제
    delete comments[projectToDelete];

    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('comments', JSON.stringify(comments));
    
    closeDeleteModal();
    displayProjects();
}

// 프로젝트 목록 화면에 표시
function displayProjects() {
    projectsContainer.innerHTML = '';
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = '<p>등록된 프로젝트가 없습니다.</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <div class="project-meta">
                <p>작성자: ${project.studentName}</p>
                <p>등록일: ${project.date}</p>
            </div>
            <p>${project.description}</p>
            <div class="project-actions">
                <button onclick="openComments(${project.id})">댓글 보기/작성</button>
                <button onclick="startEdit(${project.id})" class="secondary">수정</button>
                <button onclick="showDeleteModal(${project.id})" class="danger">삭제</button>
            </div>
        `;
        projectsContainer.appendChild(projectCard);
    });
}

// 댓글 모달 열기
function openComments(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    projectDetails.innerHTML = `
        <h4>${project.title}</h4>
        <p>${project.description}</p>
    `;

    displayComments(projectId);
    commentForm.dataset.projectId = projectId;
    commentModal.classList.remove('hidden');
}

// 댓글 모달 닫기
function closeCommentModal() {
    commentModal.classList.add('hidden');
    commentForm.reset(); // 폼 초기화
}

// 댓글 제출 처리
function handleCommentSubmit(e) {
    e.preventDefault();
    
    const projectId = parseInt(commentForm.dataset.projectId);
    const commentText = document.getElementById('commentText').value;
    
    if (!commentText.trim()) return; // 빈 댓글 방지
    
    if (!comments[projectId]) {
        comments[projectId] = [];
    }
    
    const comment = {
        id: Date.now(),
        text: commentText,
        date: new Date().toLocaleDateString()
    };
    
    comments[projectId].push(comment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    commentForm.reset();
    displayComments(projectId);
}

// 댓글 목록 표시
function displayComments(projectId) {
    commentsContainer.innerHTML = '';
    
    const projectComments = comments[projectId] || [];
    
    if (projectComments.length === 0) {
        commentsContainer.innerHTML = '<p>아직 댓글이 없습니다.</p>';
        return;
    }
    
    projectComments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-meta">
                <span>${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });
} 