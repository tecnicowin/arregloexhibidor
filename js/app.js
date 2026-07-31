document.addEventListener('DOMContentLoaded', function() {
    const locationSelect = document.getElementById('location');
    const weekStartInput = document.getElementById('week-start');
    const generateBtn = document.getElementById('generate-btn');
    const arrangementSection = document.getElementById('arrangement-section');
    const arrangementTitle = document.getElementById('arrangement-title');
    const arrangementGrid = document.getElementById('arrangement-grid');
    const previewBtn = document.getElementById('preview-btn');
    const saveBtn = document.getElementById('save-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const previewModal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    const confirmPdfBtn = document.getElementById('confirm-pdf-btn');
    const savedList = document.getElementById('saved-list');

    const participantNameInput = document.getElementById('participant-name');
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const participantsList = document.getElementById('participants-list');
    const participantEditing = document.getElementById('participant-editing');
    const editingNameSpan = document.getElementById('editing-name');
    const toggleListBtn = document.getElementById('toggle-list-btn');
    const toggleIcon = document.getElementById('toggle-icon');
    const participantCountSpan = document.getElementById('participant-count');

    const locationNameInput = document.getElementById('location-name');
    const locationDaysCheckboxes = document.querySelectorAll('.location-day-checkbox');
    const addLocationBtn = document.getElementById('add-location-btn');
    const cancelLocationBtn = document.getElementById('cancel-location-btn');
    const locationsList = document.getElementById('locations-list');
    const locationEditingDiv = document.getElementById('location-editing');
    const editingLocationNameSpan = document.getElementById('editing-location-name');

    const slotStartInput = document.getElementById('slot-start');
    const slotEndInput = document.getElementById('slot-end');
    const addSlotBtn = document.getElementById('add-slot-btn');
    const cancelSlotBtn = document.getElementById('cancel-slot-btn');
    const slotsList = document.getElementById('slots-list');
    const slotEditingDiv = document.getElementById('slot-editing');
    const editingSlotNameSpan = document.getElementById('editing-slot-name');

    const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const DEFAULT_TIME_SLOTS = ['8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00'];

    const DEFAULT_LOCATIONS = {
        'av-vollmer': { name: 'Av. Vollmer', days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
        'paseo-marquez': { name: 'Paseo Marquez del Toro', days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
    };

    let currentArrangement = null;
    let editingParticipantId = null;
    let editingLocationId = null;
    let editingSlotId = null;
    let participants = [];
    let locations = {};
    let timeSlots = [];

    function loadLocations() {
        const saved = localStorage.getItem('locations');
        if (saved) {
            locations = JSON.parse(saved);
        } else {
            locations = JSON.parse(JSON.stringify(DEFAULT_LOCATIONS));
            saveLocations();
        }
    }

    function saveLocations() {
        localStorage.setItem('locations', JSON.stringify(locations));
    }

    function renderLocationSelect() {
        const currentValue = locationSelect.value;
        locationSelect.innerHTML = '';
        Object.keys(locations).forEach(key => {
            const loc = locations[key];
            const option = document.createElement('option');
            option.value = key;
            const dayRange = loc.days.length === 7 ? 'Lunes a Domingo' :
                             loc.days.length === 5 ? 'Lunes a Viernes' :
                             loc.days.join(', ');
            option.textContent = `${loc.name} (${dayRange})`;
            locationSelect.appendChild(option);
        });
        if (locations[currentValue]) {
            locationSelect.value = currentValue;
        }
    }

    function renderLocationsList() {
        const keys = Object.keys(locations);
        if (keys.length === 0) {
            locationsList.innerHTML = '<p class="empty-message">No hay ubicaciones configuradas</p>';
            return;
        }

        locationsList.innerHTML = '';
        keys.forEach(key => {
            const loc = locations[key];
            const item = document.createElement('div');
            item.className = 'location-item';
            const dayRange = loc.days.length === 7 ? 'Lun-Dom' :
                             loc.days.length === 5 ? 'Lun-Vie' :
                             loc.days.map(d => d.substring(0, 3)).join(', ');
            item.innerHTML = `
                <div class="location-item-info">
                    <span class="location-item-name">${loc.name}</span>
                    <span class="location-item-days">${dayRange} (${loc.days.length} días)</span>
                </div>
                <div class="location-item-actions">
                    <button class="btn-secondary btn-sm edit-location-btn" data-key="${key}" title="Editar">&#9998;</button>
                    <button class="btn-secondary btn-sm delete-location-btn" data-key="${key}" title="Eliminar">&times;</button>
                </div>
            `;
            locationsList.appendChild(item);
        });

        document.querySelectorAll('.edit-location-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editLocation(this.dataset.key);
            });
        });

        document.querySelectorAll('.delete-location-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteLocation(this.dataset.key);
            });
        });
    }

    function addLocation() {
        const name = locationNameInput.value.trim();
        if (!name) {
            alert('Ingrese un nombre para la ubicación');
            return;
        }

        const selectedDays = [];
        locationDaysCheckboxes.forEach(cb => {
            if (cb.checked) selectedDays.push(cb.value);
        });

        if (selectedDays.length === 0) {
            alert('Seleccione al menos un día');
            return;
        }

        const key = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (editingLocationId !== null) {
            if (key !== editingLocationId && locations[key]) {
                alert('Ya existe una ubicación con ese nombre');
                return;
            }
            const oldData = locations[editingLocationId];
            delete locations[editingLocationId];
            locations[key] = { name: name, days: selectedDays };

            const savedArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');
            savedArrangements.forEach(a => {
                if (a.location === editingLocationId) {
                    a.location = key;
                    a.locationName = name;
                }
            });
            localStorage.setItem('arrangements', JSON.stringify(savedArrangements));

            saveLocations();
            renderLocationsList();
            renderLocationSelect();
            clearLocationForm();
            return;
        }

        if (locations[key]) {
            alert('Ya existe una ubicación con ese nombre');
            return;
        }

        locations[key] = { name: name, days: selectedDays };
        saveLocations();
        renderLocationsList();
        renderLocationSelect();
        clearLocationForm();
    }

    function editLocation(key) {
        const loc = locations[key];
        if (!loc) return;

        editingLocationId = key;
        locationNameInput.value = loc.name;
        editingLocationNameSpan.textContent = loc.name;
        locationEditingDiv.classList.remove('hidden');
        cancelLocationBtn.classList.remove('hidden');
        addLocationBtn.textContent = 'Actualizar';

        locationDaysCheckboxes.forEach(cb => {
            cb.checked = loc.days.includes(cb.value);
        });

        locationNameInput.focus();
    }

    function deleteLocation(key) {
        const loc = locations[key];
        if (!loc) return;

        if (Object.keys(locations).length <= 1) {
            alert('Debe haber al menos una ubicación');
            return;
        }

        if (confirm(`¿Eliminar la ubicación "${loc.name}"?`)) {
            delete locations[key];
            saveLocations();
            renderLocationsList();
            renderLocationSelect();
            if (editingLocationId === key) clearLocationForm();
        }
    }

    function clearLocationForm() {
        editingLocationId = null;
        locationNameInput.value = '';
        locationDaysCheckboxes.forEach(cb => cb.checked = false);
        locationEditingDiv.classList.add('hidden');
        cancelLocationBtn.classList.add('hidden');
        addLocationBtn.textContent = 'Agregar';
    }

    function loadTimeSlots() {
        const saved = localStorage.getItem('timeSlots');
        if (saved) {
            timeSlots = JSON.parse(saved);
        } else {
            timeSlots = [...DEFAULT_TIME_SLOTS];
            saveTimeSlots();
        }
    }

    function saveTimeSlots() {
        localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
    }

    function formatTimeSlot(start, end) {
        function fmt(t) {
            const [h, m] = t.split(':');
            return `${parseInt(h)}:${m}`;
        }
        return `${fmt(start)} - ${fmt(end)}`;
    }

    function parseTimeSlot(slot) {
        const parts = slot.split(' - ');
        return { start: parts[0], end: parts[1] };
    }

    function timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    function renderSlotsList() {
        if (timeSlots.length === 0) {
            slotsList.innerHTML = '<p class="empty-message">No hay turnos definidos</p>';
            return;
        }

        slotsList.innerHTML = '';
        timeSlots.forEach((slot, index) => {
            const item = document.createElement('div');
            item.className = 'location-item';
            item.innerHTML = `
                <div class="location-item-info">
                    <span class="location-item-name">${slot}</span>
                </div>
                <div class="location-item-actions">
                    <button class="btn-secondary btn-sm edit-slot-btn" data-index="${index}" title="Editar">&#9998;</button>
                    <button class="btn-secondary btn-sm delete-slot-btn" data-index="${index}" title="Eliminar">&times;</button>
                </div>
            `;
            slotsList.appendChild(item);
        });

        document.querySelectorAll('.edit-slot-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editTimeSlot(parseInt(this.dataset.index));
            });
        });

        document.querySelectorAll('.delete-slot-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteTimeSlot(parseInt(this.dataset.index));
            });
        });
    }

    function addTimeSlot() {
        const start = slotStartInput.value;
        const end = slotEndInput.value;

        if (!start || !end) {
            alert('Ingrese hora de inicio y fin');
            return;
        }

        if (start >= end) {
            alert('La hora de fin debe ser posterior a la de inicio');
            return;
        }

        const slotText = formatTimeSlot(start, end);

        if (editingSlotId !== null) {
            timeSlots[editingSlotId] = slotText;
            saveTimeSlots();
            renderSlotsList();
            clearSlotForm();
            return;
        }

        if (timeSlots.some(s => s === slotText)) {
            alert('Este turno ya existe');
            return;
        }

        timeSlots.push(slotText);
        timeSlots.sort((a, b) => {
            return timeToMinutes(parseTimeSlot(a).start) - timeToMinutes(parseTimeSlot(b).start);
        });

        saveTimeSlots();
        renderSlotsList();
        clearSlotForm();
    }

    function editTimeSlot(index) {
        const slot = timeSlots[index];
        const parsed = parseTimeSlot(slot);

        editingSlotId = index;
        slotStartInput.value = parsed.start;
        slotEndInput.value = parsed.end;
        editingSlotNameSpan.textContent = slot;
        slotEditingDiv.classList.remove('hidden');
        cancelSlotBtn.classList.remove('hidden');
        addSlotBtn.textContent = 'Actualizar';
    }

    function deleteTimeSlot(index) {
        if (timeSlots.length <= 1) {
            alert('Debe haber al menos un turno');
            return;
        }

        if (confirm(`¿Eliminar el turno "${timeSlots[index]}"?`)) {
            timeSlots.splice(index, 1);
            saveTimeSlots();
            renderSlotsList();
            if (editingSlotId === index) clearSlotForm();
        }
    }

    function clearSlotForm() {
        editingSlotId = null;
        slotStartInput.value = '';
        slotEndInput.value = '';
        slotEditingDiv.classList.add('hidden');
        cancelSlotBtn.classList.add('hidden');
        addSlotBtn.textContent = 'Agregar';
    }

    function getLocationConfig(key) {
        return locations[key] || locations[Object.keys(locations)[0]];
    }

    function getWeekDates(startDate, locationKey) {
        const dates = [];
        const start = new Date(startDate + 'T00:00:00');
        const loc = getLocationConfig(locationKey || locationSelect.value);

        for (let i = 0; i < loc.days.length; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(formatDate(date));
        }
        return dates;
    }

    function setDefaultDate() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        weekStartInput.value = formatDate(monday);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateDisplay(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    function loadParticipants() {
        participants = JSON.parse(localStorage.getItem('participants') || '[]');
        renderParticipants();
    }

    function saveParticipants() {
        localStorage.setItem('participants', JSON.stringify(participants));
    }

    function renderParticipants() {
        participantCountSpan.textContent = participants.length;

        if (participants.length === 0) {
            participantsList.innerHTML = '<p class="empty-message">No hay participantes registrados</p>';
            return;
        }

        participantsList.innerHTML = '';
        participants.forEach(participant => {
            const tag = document.createElement('div');
            tag.className = 'participant-tag';
            tag.innerHTML = `
                <span class="name">${participant.name}</span>
                <button class="edit-btn" data-id="${participant.id}" title="Editar">&#9998;</button>
                <button class="delete-btn" data-id="${participant.id}" title="Eliminar">&times;</button>
            `;
            participantsList.appendChild(tag);
        });

        document.querySelectorAll('.participant-tag .edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editParticipant(parseInt(this.dataset.id));
            });
        });

        document.querySelectorAll('.participant-tag .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteParticipant(parseInt(this.dataset.id));
            });
        });
    }

    function addParticipant() {
        const name = participantNameInput.value.trim();
        if (!name) { alert('Ingrese un nombre'); return; }

        if (editingParticipantId !== null) {
            const participant = participants.find(p => p.id === editingParticipantId);
            if (participant) {
                participant.name = name;
                saveParticipants();
                renderParticipants();
                createDatalist();
                clearParticipantForm();
                return;
            }
        }

        if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Este participante ya existe');
            return;
        }

        participants.push({ id: Date.now(), name: name });
        saveParticipants();
        renderParticipants();
        createDatalist();
        clearParticipantForm();
    }

    function editParticipant(id) {
        const participant = participants.find(p => p.id === id);
        if (participant) {
            editingParticipantId = id;
            participantNameInput.value = participant.name;
            editingNameSpan.textContent = participant.name;
            participantEditing.classList.remove('hidden');
            cancelEditBtn.classList.remove('hidden');
            addParticipantBtn.textContent = 'Actualizar';
            participantNameInput.focus();
        }
    }

    function deleteParticipant(id) {
        const participant = participants.find(p => p.id === id);
        if (participant && confirm(`¿Eliminar a "${participant.name}"?`)) {
            participants = participants.filter(p => p.id !== id);
            saveParticipants();
            renderParticipants();
            createDatalist();
            if (editingParticipantId === id) clearParticipantForm();
        }
    }

    function clearParticipantForm() {
        editingParticipantId = null;
        participantNameInput.value = '';
        participantEditing.classList.add('hidden');
        cancelEditBtn.classList.add('hidden');
        addParticipantBtn.textContent = 'Agregar';
    }

    function generateArrangement() {
        const startDate = weekStartInput.value;
        if (!startDate) { alert('Seleccione una fecha de inicio de semana'); return; }

        createDatalist();

        const location = locationSelect.value;
        const loc = getLocationConfig(location);
        const dates = getWeekDates(startDate, location);
        const endDate = dates[dates.length - 1];

        arrangementTitle.textContent = `Arreglo ${loc.name} - ${formatDateDisplay(startDate)} al ${formatDateDisplay(endDate)}`;

        currentArrangement = {
            id: Date.now(),
            location: location,
            locationName: loc.name,
            startDate: startDate,
            endDate: endDate,
            days: {}
        };

        arrangementGrid.innerHTML = '';

        loc.days.forEach((day, index) => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `${day}<br><span class="date">${formatDateDisplay(dates[index])}</span>`;
            dayColumn.appendChild(dayHeader);

            currentArrangement.days[dates[index]] = {};

            timeSlots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot';

                const slotTime = document.createElement('div');
                slotTime.className = 'slot-time';
                slotTime.textContent = slot;
                slotDiv.appendChild(slotTime);

                const participants = document.createElement('div');
                participants.className = 'participants';

                currentArrangement.days[dates[index]][slot] = [];

                for (let i = 0; i < 3; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'participant-input';
                    input.placeholder = `Participante ${i + 1}`;
                    input.dataset.date = dates[index];
                    input.dataset.slot = slot;
                    input.dataset.index = i;
                    input.setAttribute('list', 'participants-datalist');

                    input.addEventListener('input', function() {
                        const date = this.dataset.date;
                        const slotTime = this.dataset.slot;
                        const idx = parseInt(this.dataset.index);
                        const value = this.value.trim();
                        if (value) {
                            currentArrangement.days[date][slotTime][idx] = value;
                        } else {
                            delete currentArrangement.days[date][slotTime][idx];
                        }
                    });

                    participants.appendChild(input);
                }

                const count = document.createElement('div');
                count.className = 'participant-count';
                count.textContent = '0/3 participantes';
                participants.appendChild(count);

                slotDiv.appendChild(participants);
                dayColumn.appendChild(slotDiv);
            });

            arrangementGrid.appendChild(dayColumn);
        });

        arrangementSection.classList.remove('hidden');
        updateParticipantCounts();
    }

    function updateParticipantCounts() {
        document.querySelectorAll('.slot').forEach(slot => {
            const inputs = slot.querySelectorAll('.participant-input');
            const count = slot.querySelector('.participant-count');
            let filled = 0;
            inputs.forEach(input => { if (input.value.trim()) filled++; });
            count.textContent = `${filled}/3 participantes`;
        });
    }

    function updateArrangementData() {
        document.querySelectorAll('.participant-input').forEach(input => {
            const date = input.dataset.date;
            const slot = input.dataset.slot;
            const index = parseInt(input.dataset.index);
            const value = input.value.trim();
            if (value) {
                currentArrangement.days[date][slot][index] = value;
            } else {
                delete currentArrangement.days[date][slot][index];
            }
        });
    }

    function generatePreviewHTML() {
        const loc = getLocationConfig(currentArrangement.location);
        const dates = getWeekDates(currentArrangement.startDate, currentArrangement.location);

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1a5276;">Arreglo de Predicación Pública</h2>
                <h3>${currentArrangement.locationName}</h3>
                <p><strong>Período:</strong> ${formatDateDisplay(currentArrangement.startDate)} al ${formatDateDisplay(currentArrangement.endDate)}</p>
            </div>
            <table class="preview-table">
                <thead><tr><th>Turno</th>`;

        loc.days.forEach(day => { html += `<th>${day}</th>`; });
        html += `</tr></thead><tbody>`;

        timeSlots.forEach(slot => {
            html += `<tr><td><strong>${slot}</strong></td>`;
            loc.days.forEach((day, index) => {
                const date = dates[index];
                const participants = currentArrangement.days[date]?.[slot] || [];
                const names = participants.filter(p => p && p.trim()).join('<br>') || '-';
                html += `<td>${names}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        return html;
    }

    function showPreview() {
        if (!currentArrangement) { alert('Primero genere un arreglo'); return; }
        updateArrangementData();
        previewContent.innerHTML = generatePreviewHTML();
        previewModal.classList.remove('hidden');
    }

    function generatePDF() {
        if (!currentArrangement) { alert('Primero genere un arreglo'); return; }

        const { jsPDF } = window.jspdf;

        const pageWidth = 279;
        const pageHeight = 216;
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'letter'
        });

        const loc = getLocationConfig(currentArrangement.location);
        const dates = getWeekDates(currentArrangement.startDate, currentArrangement.location);
        const numDays = loc.days.length;

        const headerHeight = 28;
        const footerHeight = 12;
        const tableHeaderHeight = 12;
        const tableTopY = margin + headerHeight + 2;
        const availableHeight = pageHeight - margin * 2 - headerHeight - footerHeight - tableHeaderHeight - 4;
        const rowHeight = Math.floor(availableHeight / timeSlots.length);
        const timeColWidth = 28;
        const colWidth = (contentWidth - timeColWidth) / numDays;
        const cellPadding = 2;

        doc.setFillColor(26, 82, 118);
        doc.rect(0, 0, pageWidth, margin + headerHeight, 'F');

        doc.setTextColor(255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('ARREGLO DE PREDICACIÓN PÚBLICA', pageWidth / 2, margin + 10, { align: 'center' });

        doc.setFontSize(16);
        doc.text(currentArrangement.locationName, pageWidth / 2, margin + 18, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${formatDateDisplay(currentArrangement.startDate)} al ${formatDateDisplay(currentArrangement.endDate)}`, pageWidth / 2, margin + 24, { align: 'center' });

        doc.setFillColor(26, 82, 118);
        doc.rect(margin, tableTopY, contentWidth, tableHeaderHeight, 'F');

        doc.setTextColor(255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TURNO', margin + timeColWidth / 2, tableTopY + 8, { align: 'center' });

        loc.days.forEach((day, i) => {
            const x = margin + timeColWidth + i * colWidth;
            doc.setFontSize(9);
            doc.text(day, x + colWidth / 2, tableTopY + 5, { align: 'center' });
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(formatDateDisplay(dates[i]), x + colWidth / 2, tableTopY + 10, { align: 'center' });
        });

        let currentY = tableTopY + tableHeaderHeight;

        timeSlots.forEach((slot, slotIndex) => {
            const bgColor = slotIndex % 2 === 0 ? [240, 245, 252] : [255, 255, 255];
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

            doc.setDrawColor(180, 195, 210);
            doc.setLineWidth(0.4);
            doc.rect(margin, currentY, contentWidth, rowHeight);

            doc.setFillColor(26, 82, 118);
            doc.rect(margin, currentY, timeColWidth, rowHeight, 'F');

            doc.setDrawColor(26, 82, 118);
            doc.setLineWidth(0.6);
            doc.rect(margin, currentY, timeColWidth, rowHeight);

            doc.setTextColor(255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(slot, margin + timeColWidth / 2, currentY + rowHeight / 2 + 1.5, { align: 'center' });

            loc.days.forEach((day, dayIndex) => {
                const x = margin + timeColWidth + dayIndex * colWidth;
                const date = dates[dayIndex];
                const participants = currentArrangement.days[date]?.[slot] || [];
                const names = participants.filter(p => p && p.trim());

                doc.setDrawColor(180, 195, 210);
                doc.setLineWidth(0.3);
                doc.rect(x, currentY, colWidth, rowHeight);

                const maxLineWidth = colWidth - cellPadding * 2;
                const fontSize = 8;
                const lineHeight = 4.2;
                const maxLines = Math.floor((rowHeight - 4) / lineHeight);
                const totalNames = Math.min(names.length, 3);

                let textBlockHeight = 0;
                const nameLines = [];
                names.slice(0, 3).forEach((name) => {
                    const lines = doc.splitTextToSize(name, maxLineWidth);
                    const shown = lines.slice(0, Math.min(2, maxLines));
                    nameLines.push(shown);
                    textBlockHeight += shown.length * lineHeight;
                });

                const startYNames = currentY + (rowHeight - textBlockHeight) / 2 + 1;

                doc.setTextColor(30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(fontSize);

                let yOffset = startYNames;
                nameLines.forEach((lines) => {
                    lines.forEach((line) => {
                        doc.text(line, x + colWidth / 2, yOffset, { align: 'center' });
                        yOffset += lineHeight;
                    });
                    yOffset += 1.5;
                });
            });

            currentY += rowHeight;
        });

        doc.setFillColor(26, 82, 118);
        doc.rect(0, pageHeight - margin - footerHeight, pageWidth, footerHeight, 'F');

        doc.setTextColor(255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Generado por Aplicación de Arreglo de Exhibidores', pageWidth / 2, pageHeight - margin - footerHeight / 2 + 2.5, { align: 'center' });

        const fileName = `Arreglo Exhibidor ${currentArrangement.locationName.replace(/\s+/g, '')} ${currentArrangement.startDate.replace(/-/g, '')}.pdf`;
        doc.save(fileName);
        previewModal.classList.add('hidden');
    }

    function saveArrangement() {
        if (!currentArrangement) { alert('Primero genere un arreglo'); return; }
        updateArrangementData();

        const savedArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');
        const existingIndex = savedArrangements.findIndex(a => a.id === currentArrangement.id);

        if (existingIndex >= 0) {
            savedArrangements[existingIndex] = currentArrangement;
        } else {
            savedArrangements.push(currentArrangement);
        }

        localStorage.setItem('arrangements', JSON.stringify(savedArrangements));
        loadSavedArrangements();
        alert('Arreglo guardado exitosamente');
    }

    function loadSavedArrangements() {
        const savedArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');

        if (savedArrangements.length === 0) {
            savedList.innerHTML = '<p class="empty-message">No hay arreglos guardados</p>';
            return;
        }

        savedList.innerHTML = '';
        savedArrangements.forEach(arrangement => {
            const item = document.createElement('div');
            item.className = 'saved-item';
            item.innerHTML = `
                <div class="saved-item-info">
                    <div class="saved-item-location">${arrangement.locationName}</div>
                    <div class="saved-item-dates">${formatDateDisplay(arrangement.startDate)} al ${formatDateDisplay(arrangement.endDate)}</div>
                </div>
                <div class="saved-item-actions">
                    <button class="btn-secondary load-btn" data-id="${arrangement.id}">Cargar</button>
                    <button class="btn-secondary copy-btn" data-id="${arrangement.id}">Copiar</button>
                    <button class="btn-secondary delete-btn" data-id="${arrangement.id}">Eliminar</button>
                </div>
            `;
            savedList.appendChild(item);
        });

        document.querySelectorAll('.saved-item-actions .load-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const arrangement = savedArrangements.find(a => a.id === id);
                if (arrangement) loadArrangement(arrangement);
            });
        });

        document.querySelectorAll('.saved-item-actions .copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const arrangement = savedArrangements.find(a => a.id === id);
                if (arrangement) copyArrangement(arrangement);
            });
        });

        document.querySelectorAll('.saved-item-actions .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                if (confirm('¿Está seguro de eliminar este arreglo?')) {
                    const filtered = savedArrangements.filter(a => a.id !== id);
                    localStorage.setItem('arrangements', JSON.stringify(filtered));
                    loadSavedArrangements();
                }
            });
        });
    }

    function loadArrangement(arrangement) {
        createDatalist();
        currentArrangement = JSON.parse(JSON.stringify(arrangement));
        locationSelect.value = arrangement.location;
        weekStartInput.value = arrangement.startDate;

        const loc = getLocationConfig(arrangement.location);
        const dates = getWeekDates(arrangement.startDate, arrangement.location);

        arrangementTitle.textContent = `Arreglo ${arrangement.locationName} - ${formatDateDisplay(arrangement.startDate)} al ${formatDateDisplay(arrangement.endDate)}`;

        renderArrangementGrid(loc, dates, arrangement);
        arrangementSection.classList.remove('hidden');
    }

    function copyArrangement(arrangement) {
        createDatalist();
        currentArrangement = JSON.parse(JSON.stringify(arrangement));
        currentArrangement.id = Date.now();
        locationSelect.value = arrangement.location;
        weekStartInput.value = arrangement.startDate;

        const loc = getLocationConfig(arrangement.location);
        const dates = getWeekDates(arrangement.startDate, arrangement.location);

        arrangementTitle.textContent = `Arreglo ${arrangement.locationName} - ${formatDateDisplay(arrangement.startDate)} al ${formatDateDisplay(endDate)}`;

        renderArrangementGrid(loc, dates, currentArrangement);
        arrangementSection.classList.remove('hidden');
        alert('Arreglo copiado. Modifique la fecha de inicio si desea, luego guarde como nuevo.');
    }

    function renderArrangementGrid(loc, dates, arrangement) {
        arrangementGrid.innerHTML = '';

        loc.days.forEach((day, index) => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `${day}<br><span class="date">${formatDateDisplay(dates[index])}</span>`;
            dayColumn.appendChild(dayHeader);

            timeSlots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot';

                const slotTime = document.createElement('div');
                slotTime.className = 'slot-time';
                slotTime.textContent = slot;
                slotDiv.appendChild(slotTime);

                const participants = document.createElement('div');
                participants.className = 'participants';

                const savedParticipants = arrangement.days[dates[index]]?.[slot] || [];

                for (let i = 0; i < 3; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'participant-input';
                    input.placeholder = `Participante ${i + 1}`;
                    input.dataset.date = dates[index];
                    input.dataset.slot = slot;
                    input.dataset.index = i;
                    input.value = savedParticipants[i] || '';
                    input.setAttribute('list', 'participants-datalist');

                    input.addEventListener('input', function() {
                        const date = this.dataset.date;
                        const slotTime = this.dataset.slot;
                        const idx = parseInt(this.dataset.index);
                        const value = this.value.trim();
                        if (value) {
                            currentArrangement.days[date][slotTime][idx] = value;
                        } else {
                            delete currentArrangement.days[date][slotTime][idx];
                        }
                        updateParticipantCounts();
                    });

                    participants.appendChild(input);
                }

                const count = document.createElement('div');
                count.className = 'participant-count';
                const filled = savedParticipants.filter(p => p && p.trim()).length;
                count.textContent = `${filled}/3 participantes`;
                participants.appendChild(count);

                slotDiv.appendChild(participants);
                dayColumn.appendChild(slotDiv);
            });

            arrangementGrid.appendChild(dayColumn);
        });
    }

    function closeModal() {
        previewModal.classList.add('hidden');
    }

    function createDatalist() {
        let datalist = document.getElementById('participants-datalist');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'participants-datalist';
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = '';
        participants.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            datalist.appendChild(option);
        });
    }

    // Init
    loadLocations();
    loadTimeSlots();
    renderLocationSelect();
    renderLocationsList();
    renderSlotsList();
    setDefaultDate();
    loadParticipants();
    loadSavedArrangements();
    createDatalist();

    // Location events
    addLocationBtn.addEventListener('click', addLocation);
    cancelLocationBtn.addEventListener('click', clearLocationForm);

    // Time slot events
    addSlotBtn.addEventListener('click', addTimeSlot);
    cancelSlotBtn.addEventListener('click', clearSlotForm);
    slotStartInput.addEventListener('change', function() {
        if (slotStartInput.value && !slotEndInput.value) {
            const [h, m] = slotStartInput.value.split(':');
            slotEndInput.value = `${String(parseInt(h) + 2).padStart(2, '0')}:${m}`;
        }
    });

    // Participant events
    addParticipantBtn.addEventListener('click', addParticipant);
    cancelEditBtn.addEventListener('click', clearParticipantForm);
    participantNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addParticipant();
    });

    // Arrangement events
    generateBtn.addEventListener('click', generateArrangement);
    previewBtn.addEventListener('click', showPreview);
    saveBtn.addEventListener('click', saveArrangement);
    pdfBtn.addEventListener('click', showPreview);
    confirmPdfBtn.addEventListener('click', generatePDF);

    // Modal events
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) closeModal();
    });

    // Grid events
    arrangementGrid.addEventListener('input', function() {
        updateParticipantCounts();
    });

    // Backup functions
    const exportWhatsappBtn = document.getElementById('export-whatsapp-btn');
    const exportFileBtn = document.getElementById('export-file-btn');
    const importFileBtn = document.getElementById('import-file-btn');
    const importFileInput = document.getElementById('import-file-input');

    function getBackupData() {
        return {
            participants: JSON.parse(localStorage.getItem('participants') || '[]'),
            arrangements: JSON.parse(localStorage.getItem('arrangements') || '[]'),
            locations: JSON.parse(localStorage.getItem('locations') || '{}'),
            timeSlots: JSON.parse(localStorage.getItem('timeSlots') || '[]'),
            exportDate: new Date().toISOString()
        };
    }

    function formatBackupForWhatsApp(data) {
        let message = 'ARREGLO DE EXHIBIDORES - RESPALDO\n';
        message += '================================\n\n';

        if (data.timeSlots && data.timeSlots.length > 0) {
            message += 'TURNOS:\n';
            data.timeSlots.forEach((s, i) => { message += `${i + 1}. ${s}\n`; });
            message += '\n';
        }

        if (data.participants.length > 0) {
            message += 'PARTICIPANTES:\n';
            data.participants.forEach((p, i) => { message += `${i + 1}. ${p.name}\n`; });
            message += '\n';
        }

        if (data.arrangements.length > 0) {
            message += 'ARREGLOS GUARDADOS:\n';
            data.arrangements.forEach(a => {
                message += `\n- ${a.locationName}\n  Período: ${a.startDate} al ${a.endDate}\n`;
            });
        }

        message += '\n================================\n';
        message += 'Para restaurar, usa la opción "Cargar Archivo" en la app.';
        return message;
    }

    function exportToWhatsApp() {
        const data = getBackupData();
        if (data.participants.length === 0 && data.arrangements.length === 0) {
            alert('No hay datos para respaldar');
            return;
        }
        const message = formatBackupForWhatsApp(data);
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        exportBackupFile(data);
    }

    function exportBackupFile(data) {
        const backupData = JSON.stringify(data, null, 2);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respaldo-exhibidores-${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportToFile() {
        const data = getBackupData();
        if (data.participants.length === 0 && data.arrangements.length === 0) {
            alert('No hay datos para respaldar');
            return;
        }
        exportBackupFile(data);
        alert('Archivo de respaldo descargado');
    }

    function importFromFile() { importFileInput.click(); }

    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.participants && !data.arrangements && !data.locations && !data.timeSlots) {
                    alert('Archivo de respaldo inválido');
                    return;
                }

                let importMessage = '¿Qué datos desea importar?\n\n';
                if (data.timeSlots?.length > 0) importMessage += `• ${data.timeSlots.length} turnos\n`;
                if (data.participants?.length > 0) importMessage += `• ${data.participants.length} participantes\n`;
                if (data.arrangements?.length > 0) importMessage += `• ${data.arrangements.length} arreglos guardados\n`;
                if (data.locations && Object.keys(data.locations).length > 0) importMessage += `• ${Object.keys(data.locations).length} ubicaciones\n`;
                importMessage += '\n¿Desea continuar? (Los datos actuales se mantendrán)';

                if (confirm(importMessage)) {
                    if (data.timeSlots?.length > 0) {
                        const currentSlots = JSON.parse(localStorage.getItem('timeSlots') || '[]');
                        const merged = [...currentSlots];
                        data.timeSlots.forEach(newS => {
                            if (!merged.includes(newS)) merged.push(newS);
                        });
                        merged.sort((a, b) => {
                            return timeToMinutes(parseTimeSlot(a).start) - timeToMinutes(parseTimeSlot(b).start);
                        });
                        localStorage.setItem('timeSlots', JSON.stringify(merged));
                        loadTimeSlots();
                        renderSlotsList();
                    }

                    if (data.participants?.length > 0) {
                        const currentParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
                        const merged = [...currentParticipants];
                        data.participants.forEach(newP => {
                            if (!merged.some(p => p.name.toLowerCase() === newP.name.toLowerCase())) {
                                merged.push(newP);
                            }
                        });
                        localStorage.setItem('participants', JSON.stringify(merged));
                        loadParticipants();
                    }

                    if (data.arrangements?.length > 0) {
                        const currentArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');
                        const merged = [...currentArrangements];
                        data.arrangements.forEach(newA => {
                            if (!merged.some(a => a.id === newA.id)) merged.push(newA);
                        });
                        localStorage.setItem('arrangements', JSON.stringify(merged));
                        loadSavedArrangements();
                    }

                    if (data.locations && Object.keys(data.locations).length > 0) {
                        const currentLocations = JSON.parse(localStorage.getItem('locations') || '{}');
                        Object.assign(currentLocations, data.locations);
                        localStorage.setItem('locations', JSON.stringify(currentLocations));
                        loadLocations();
                        renderLocationSelect();
                        renderLocationsList();
                    }

                    createDatalist();
                    alert('Datos importados exitosamente');
                }
            } catch (error) {
                alert('Error al leer el archivo: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    exportWhatsappBtn.addEventListener('click', exportToWhatsApp);
    exportFileBtn.addEventListener('click', exportToFile);
    importFileBtn.addEventListener('click', importFromFile);
    importFileInput.addEventListener('change', handleFileImport);

    // Toggle participants list
    toggleListBtn.addEventListener('click', function() {
        const isHidden = participantsList.classList.contains('hidden');
        if (isHidden) {
            participantsList.classList.remove('hidden');
            toggleIcon.textContent = '▼';
            toggleIcon.classList.add('active');
        } else {
            participantsList.classList.add('hidden');
            toggleIcon.textContent = '▶';
            toggleIcon.classList.remove('active');
        }
    });
});
