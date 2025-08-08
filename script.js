document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const pages = document.querySelectorAll('.page');
    const loginBtn = document.getElementById('login-btn');
    const staffBtn = document.getElementById('staff-btn');
    const studentBtn = document.getElementById('student-btn');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const nextBtns = document.querySelectorAll('.next-btn');
    const submitEventBtn = document.getElementById('submit-event-btn');
    const calendarDates = document.getElementById('calendar-dates');
    const monthYearEl = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const modal = document.getElementById('event-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const allForms = document.querySelectorAll('.form-container');

    // --- State Variables ---
    let currentUserType = 'staff';
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const staffPassword = 'prince2025';
    const studentPassword = 'psvasc2025';

    // --- Page Navigation ---
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');
    }

    // --- Login Logic ---
    staffBtn.addEventListener('click', () => {
        currentUserType = 'staff';
        staffBtn.classList.add('active');
        studentBtn.classList.remove('active');
        passwordInput.placeholder = "Staff Password";
    });

    studentBtn.addEventListener('click', () => {
        currentUserType = 'student';
        studentBtn.classList.add('active');
        staffBtn.classList.remove('active');
        passwordInput.placeholder = "Student Password";
    });

    loginBtn.addEventListener('click', () => {
        const password = passwordInput.value;
        loginError.textContent = '';
        if (currentUserType === 'staff' && password === staffPassword) {
            showPage('staff-user-info-page');
        } else if (currentUserType === 'student' && password === studentPassword) {
            showPage('student-calendar-page');
            renderCalendar(currentMonth, currentYear);
        } else {
            loginError.textContent = 'Incorrect password.';
        }
        passwordInput.value = '';
    });

    // --- Form Validation & Navigation ---
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('form');
            if (form.checkValidity()) { // Uses built-in HTML5 validation
                const currentPageId = form.parentElement.id;
                if (currentPageId === 'staff-user-info-page') {
                    showPage('staff-event-details-page');
                } else if (currentPageId === 'staff-event-details-page') {
                    showPage('staff-resource-person-page');
                }
            } else {
                form.reportValidity(); // Shows validation messages to user
            }
        });
    });

    // --- File to Base64 Converter ---
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- Event Submission ---
    submitEventBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const form = event.target.closest('form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submitEventBtn.disabled = true;
        submitEventBtn.textContent = 'Submitting...';

        try {
            const photoFile = document.getElementById('resource-person-photo').files[0];
            const pdfFile = document.getElementById('resource-person-profile').files[0];

            if (!photoFile || !pdfFile) {
                alert("Please upload both the photo and the PDF file.");
                return;
            }

            const photoDataUrl = await readFileAsDataURL(photoFile);
            const pdfDataUrl = await readFileAsDataURL(pdfFile);

            const eventData = {
    // User Info
    userName: document.getElementById('user-name').value,
    contact: document.getElementById('contact-details').value,
    email: document.getElementById('email-id').value,
    userDepartment: document.getElementById('Department').value,
    userDesignation: document.getElementById('Designation').value,
    // Event Details
    eventTitle: document.getElementById('event-title').value,
    eventType: document.getElementById('Event Type').value,
    venue: document.getElementById('Event Venue').value,
    eventDate: document.getElementById('event-date').value,
    startTime: `${String(document.getElementById('start-hour').value).padStart(2, '0')}:${String(document.getElementById('start-minute').value).padStart(2, '0')} ${document.getElementById('start-ampm').value}`,
    endTime: `${String(document.getElementById('end-hour').value).padStart(2, '0')}:${String(document.getElementById('end-minute').value).padStart(2, '0')} ${document.getElementById('end-ampm').value}`,
    targetDepartment: document.getElementById('Target Department').value,
    audienceCount: document.getElementById('audience-count').value,
    // Resource Person
    resourcePersonName: document.getElementById('resource-person-name').value,
    resourcePersonDesignation: document.getElementById('resource-person-designation').value,
    resourcePersonDepartment: document.getElementById('resource-person-department').value,
    resourcePersonCollege: document.getElementById('resource-person-college').value,
    resourcePersonExperience: document.getElementById('resource-person-experience').value,
    resourcePersonPhoto: photoDataUrl,
    resourcePersonPdf: pdfDataUrl,
};
            
            const events = JSON.parse(localStorage.getItem('events')) || [];
            events.push(eventData);
            localStorage.setItem('events', JSON.stringify(events));

            alert('Event submitted successfully!');
            allForms.forEach(f => f.reset());
            showPage('login-page');

        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred. Please try again.');
        } finally {
            submitEventBtn.disabled = false;
            submitEventBtn.textContent = 'Submit';
        }
    });

    // --- Calendar Logic ---
    function renderCalendar(month, year) {
        calendarDates.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const events = JSON.parse(localStorage.getItem('events')) || [];
        monthYearEl.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        for (let i = 0; i < firstDay; i++) {
            calendarDates.appendChild(document.createElement('div')).classList.add('empty');
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.textContent = day;
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dateCell.classList.add('today');
            }
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const eventsOnDay = events.filter(event => event.eventDate === dateString);

            if (eventsOnDay.length > 0) {
                dateCell.classList.add('event');
                dateCell.addEventListener('click', () => showEventModal(eventsOnDay));
            }
            calendarDates.appendChild(dateCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
        if (currentMonth === 11) currentYear--;
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
        if (currentMonth === 0) currentYear++;
        renderCalendar(currentMonth, currentYear);
    });

    // --- Event Modal ---
    function showEventModal(events) {
        modalBody.innerHTML = '';
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            // Use event.eventType as the value for "Time" field as in your image
            card.innerHTML = `
                <img src="${event.resourcePersonPhoto}" alt="Resource Person" class="resource-person-img">
                <h3>Event on ${new Date(event.eventDate + 'T00:00:00').toLocaleDateString()}</h3>
                <p><strong>Name:</strong> ${event.eventTitle}</p>
                <p><strong>Time:</strong> ${event.eventType}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Check-in Time:</strong> ${event.startTime}</p>
                <p><strong>Department:</strong> ${event.targetDepartment}</p>
                <p><strong>Resource Person:</strong> ${event.resourcePersonName}</p>
                <p><strong>Designation:</strong> ${event.resourcePersonDesignation}</p>
                <p><strong>College:</strong> ${event.resourcePersonCollege}</p>
                <p><strong>Experience:</strong> ${event.resourcePersonExperience}</p>
                <p><strong>Attachment:</strong> <a href="${event.resourcePersonPdf}" download="${event.resourcePersonName}_Profile.pdf">View PDF</a></p>
            `;
            modalBody.appendChild(card);
        });
        modal.style.display = 'block';
    }

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // --- Initial Load ---
    showPage('login-page');
});