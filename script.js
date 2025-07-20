let courses = JSON.parse(localStorage.getItem('courses')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

const gradeScale = [
  { min: 95, point: 4.0 },
  { min: 85, point: 4.0 },
  { min: 80, point: 3.75 },
  { min: 75, point: 3.5 },
  { min: 70, point: 3.0 },
  { min: 65, point: 2.75 },
  { min: 60, point: 2.5 },
  { min: 50, point: 2.0 },
  { min: 40, point: 1.0 },
  { min: 0,  point: 0.0 },
];

function renderCourses() {
  const tbody = document.querySelector('#courseTable tbody');
  tbody.innerHTML = '';
  courses.forEach((course, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input value="${course.name}" onchange="updateCourse(${i}, 'name', this.value)" /></td>
      <td><input type="number" value="${course.credit}" onchange="updateCourse(${i}, 'credit', this.value)" /></td>
      <td><input type="number" value="${course.score}" onchange="updateCourse(${i}, 'score', this.value)" /></td>
      <td><button onclick="deleteCourse(${i})">❌</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updateCourse(index, field, value) {
  courses[index][field] = field === 'credit' || field === 'score' ? parseFloat(value) : value;
  saveCourses();
}

function deleteCourse(index) {
  courses.splice(index, 1);
  saveCourses();
}

function addCourse() {
  courses.push({ name: '', credit: 3, score: 70 });
  saveCourses();
}

function saveCourses() {
  localStorage.setItem('courses', JSON.stringify(courses));
  renderCourses();
}

function calculateGPA() {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const course of courses) {
    const point = gradeScale.find(g => course.score >= g.min).point;
    totalCredits += course.credit;
    totalPoints += course.credit * point;
  }
  const sgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
  document.getElementById('sgpaDisplay').textContent = `Your SGPA: ${sgpa}`;
  history.push({ sgpa: parseFloat(sgpa), credits: totalCredits });
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
  renderBadges();
}

function renderHistory() {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '';
  let totalCredits = 0;
  let totalPoints = 0;
  history.forEach((h, i) => {
    const p = document.createElement('p');
    p.textContent = `Semester ${i + 1}: SGPA ${h.sgpa} - Credits ${h.credits}`;
    historyDiv.appendChild(p);
    totalCredits += h.credits;
    totalPoints += h.sgpa * h.credits;
  });
  const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
  const cgpaText = document.createElement('h3');
  cgpaText.textContent = `Your CGPA: ${cgpa}`;
  historyDiv.appendChild(cgpaText);
}

function renderBadges() {
  const badgeDiv = document.getElementById('badges');
  badgeDiv.innerHTML = '';
  if (history.length > 0) badgeDiv.innerHTML += '<div class="badge">🎉 First Semester Complete</div>';
  const cgpa = history.reduce((acc, h) => acc + h.sgpa * h.credits, 0) / history.reduce((acc, h) => acc + h.credits, 0);
  if (cgpa >= 3.5) badgeDiv.innerHTML += '<div class="badge">🏅 CGPA 3.5+</div>';
  if (cgpa === 4.0) badgeDiv.innerHTML += '<div class="badge">🌟 Perfect CGPA</div>';
  if (history.length >= 2 && history[history.length - 1].sgpa > history[history.length - 2].sgpa) {
    badgeDiv.innerHTML += '<div class="badge">📈 Improving GPA</div>';
  }
}

// Initialize everything
renderCourses();
renderHistory();
renderBadges();
