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

    const timeSlots = ['8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00'];
    const daysVollmer = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const daysAlfaro = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let currentArrangement = null;
    let editingParticipantId = null;
    let participants = [];

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

    function getWeekDates(startDate) {
        const dates = [];
        const start = new Date(startDate + 'T00:00:00');
        const location = locationSelect.value;
        const numDays = location === 'av-vollmer' ? 5 : 7;

        for (let i = 0; i < numDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(formatDate(date));
        }
        return dates;
    }

    function loadParticipants() {
        participants = JSON.parse(localStorage.getItem('participants') || '[]');
        renderParticipants();
    }

    function saveParticipants() {
        localStorage.setItem('participants', JSON.stringify(participants));
    }

    function renderParticipants() {
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
                const id = parseInt(this.dataset.id);
                editParticipant(id);
            });
        });

        document.querySelectorAll('.participant-tag .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteParticipant(id);
            });
        });
    }

    function addParticipant() {
        const name = participantNameInput.value.trim();
        if (!name) {
            alert('Ingrese un nombre');
            return;
        }

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

        participants.push({
            id: Date.now(),
            name: name
        });

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
            if (editingParticipantId === id) {
                clearParticipantForm();
            }
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
        if (!startDate) {
            alert('Por favor seleccione una fecha de inicio de semana');
            return;
        }

        createDatalist();

        const location = locationSelect.value;
        const locationName = location === 'av-vollmer' ? 'Av. Vollmer' : 'Eloy Alfaro';
        const days = location === 'av-vollmer' ? daysVollmer : daysAlfaro;
        const dates = getWeekDates(startDate);

        const endDate = dates[dates.length - 1];
        const title = `Arreglo ${locationName} - ${formatDateDisplay(startDate)} al ${formatDateDisplay(endDate)}`;
        arrangementTitle.textContent = title;

        currentArrangement = {
            id: Date.now(),
            location: location,
            locationName: locationName,
            startDate: startDate,
            endDate: endDate,
            days: {}
        };

        arrangementGrid.innerHTML = '';

        days.forEach((day, index) => {
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

            inputs.forEach(input => {
                if (input.value.trim()) filled++;
            });

            count.textContent = `${filled}/3 participantes`;
        });
    }

    function generatePreviewHTML() {
        const days = currentArrangement.location === 'av-vollmer' ? daysVollmer : daysAlfaro;
        const dates = getWeekDates(currentArrangement.startDate);

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1a5276;">Arreglo de Predicación Pública</h2>
                <h3>${currentArrangement.locationName}</h3>
                <p><strong>Período:</strong> ${formatDateDisplay(currentArrangement.startDate)} al ${formatDateDisplay(currentArrangement.endDate)}</p>
            </div>
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Turno</th>
        `;

        days.forEach(day => {
            html += `<th>${day}</th>`;
        });

        html += `</tr></thead><tbody>`;

        timeSlots.forEach(slot => {
            html += `<tr><td><strong>${slot}</strong></td>`;

            days.forEach((day, index) => {
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
        if (!currentArrangement) {
            alert('Primero genere un arreglo');
            return;
        }

        updateArrangementData();
        previewContent.innerHTML = generatePreviewHTML();
        previewModal.classList.remove('hidden');
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

    function generatePDF() {
        if (!currentArrangement) {
            alert('Primero genere un arreglo');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [140, 216]
        });

        const pageWidth = 140;
        const pageHeight = 216;
        const margin = 5;

        const days = currentArrangement.location === 'av-vollmer' ? daysVollmer : daysAlfaro;
        const dates = getWeekDates(currentArrangement.startDate);

        doc.setFillColor(26, 82, 118);
        doc.rect(0, 0, pageWidth, 20, 'F');

        doc.setTextColor(255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('ARREGLO DE PREDICACIÓN PÚBLICA', pageWidth / 2, 8, { align: 'center' });

        doc.setFontSize(10);
        doc.text(currentArrangement.locationName, pageWidth / 2, 13, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${formatDateDisplay(currentArrangement.startDate)} al ${formatDateDisplay(currentArrangement.endDate)}`, pageWidth / 2, 18, { align: 'center' });

        const startY = 24;
        const timeColWidth = 20;
        const totalWidth = pageWidth - (margin * 2);
        const colWidth = (totalWidth - timeColWidth) / days.length;
        const rowHeight = 24;

        doc.setFillColor(26, 82, 118);
        doc.rect(margin, startY, totalWidth, 8, 'F');

        doc.setTextColor(255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('TURNO', margin + timeColWidth / 2, startY + 5.5, { align: 'center' });

        days.forEach((day, i) => {
            const x = margin + timeColWidth + i * colWidth;
            doc.setFontSize(6.5);
            doc.text(day, x + colWidth / 2, startY + 3, { align: 'center' });
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'normal');
            doc.text(formatDateDisplay(dates[i]), x + colWidth / 2, startY + 6.5, { align: 'center' });
        });

        let currentY = startY + 8;

        timeSlots.forEach((slot, slotIndex) => {
            doc.setFillColor(245, 248, 252);
            doc.rect(margin, currentY, totalWidth, rowHeight, 'F');

            doc.setDrawColor(180, 200, 220);
            doc.setLineWidth(0.3);
            doc.rect(margin, currentY, totalWidth, rowHeight);

            doc.setFillColor(26, 82, 118);
            doc.rect(margin, currentY, timeColWidth, rowHeight, 'F');

            doc.setDrawColor(26, 82, 118);
            doc.setLineWidth(0.5);
            doc.rect(margin, currentY, timeColWidth, rowHeight);

            doc.setTextColor(255);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.text(slot, margin + timeColWidth / 2, currentY + rowHeight / 2, { align: 'center' });

            days.forEach((day, dayIndex) => {
                const x = margin + timeColWidth + dayIndex * colWidth;
                const date = dates[dayIndex];
                const participants = currentArrangement.days[date]?.[slot] || [];
                const names = participants.filter(p => p && p.trim());

                doc.setDrawColor(180, 200, 220);
                doc.setLineWidth(0.2);
                doc.rect(x, currentY, colWidth, rowHeight);

                doc.setTextColor(30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6);

                const maxLineWidth = colWidth - 2;
                const startYNames = currentY + 3;
                const lineSpacing = 3.2;

                names.forEach((name, nameIndex) => {
                    if (nameIndex < 3) {
                        const splitName = doc.splitTextToSize(name, maxLineWidth);
                        const linesToShow = splitName.slice(0, 2);

                        linesToShow.forEach((line, lineIndex) => {
                            doc.text(line, x + colWidth / 2, startYNames + nameIndex * 7 + lineIndex * lineSpacing, { align: 'center' });
                        });
                    }
                });
            });

            currentY += rowHeight;
        });

        doc.setFillColor(26, 82, 118);
        doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');

        doc.setTextColor(255);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Generado por Aplicación de Arreglo de Exhibidores', pageWidth / 2, pageHeight - 2.5, { align: 'center' });

        const fileName = `Arreglo Exhibidor ${currentArrangement.locationName.replace(/\s+/g, '')} ${currentArrangement.startDate.replace(/-/g, '')}.pdf`;
        doc.save(fileName);

        previewModal.classList.add('hidden');
    }

    function saveArrangement() {
        if (!currentArrangement) {
            alert('Primero genere un arreglo');
            return;
        }

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
                    <button class="btn-secondary delete-btn" data-id="${arrangement.id}">Eliminar</button>
                </div>
            `;

            savedList.appendChild(item);
        });

        document.querySelectorAll('.saved-item-actions .load-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const arrangement = savedArrangements.find(a => a.id === id);
                if (arrangement) {
                    loadArrangement(arrangement);
                }
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

        arrangementTitle.textContent = `Arreglo ${arrangement.locationName} - ${formatDateDisplay(arrangement.startDate)} al ${formatDateDisplay(arrangement.endDate)}`;

        const days = arrangement.location === 'av-vollmer' ? daysVollmer : daysAlfaro;
        const dates = getWeekDates(arrangement.startDate);

        arrangementGrid.innerHTML = '';

        days.forEach((day, index) => {
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

        arrangementSection.classList.remove('hidden');
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

    setDefaultDate();
    loadParticipants();
    loadSavedArrangements();
    createDatalist();

    addParticipantBtn.addEventListener('click', addParticipant);
    cancelEditBtn.addEventListener('click', clearParticipantForm);

    participantNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });

    generateBtn.addEventListener('click', generateArrangement);
    previewBtn.addEventListener('click', showPreview);
    saveBtn.addEventListener('click', saveArrangement);
    pdfBtn.addEventListener('click', showPreview);
    confirmPdfBtn.addEventListener('click', generatePDF);

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal();
        }
    });

    arrangementGrid.addEventListener('input', function() {
        updateParticipantCounts();
    });

    // Backup and Share Functions
    const exportWhatsappBtn = document.getElementById('export-whatsapp-btn');
    const exportFileBtn = document.getElementById('export-file-btn');
    const importFileBtn = document.getElementById('import-file-btn');
    const importFileInput = document.getElementById('import-file-input');

    function getBackupData() {
        const savedParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
        const savedArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');

        return {
            participants: savedParticipants,
            arrangements: savedArrangements,
            exportDate: new Date().toISOString()
        };
    }

    function formatBackupForWhatsApp(data) {
        let message = 'ARREGLO DE EXHIBIDORES - RESPALDO\n';
        message += '================================\n\n';

        if (data.participants.length > 0) {
            message += 'PARTICIPANTES:\n';
            data.participants.forEach((p, i) => {
                message += `${i + 1}. ${p.name}\n`;
            });
            message += '\n';
        }

        if (data.arrangements.length > 0) {
            message += 'ARREGLOS GUARDADOS:\n';
            data.arrangements.forEach(a => {
                message += `\n- ${a.locationName}\n`;
                message += `  Período: ${a.startDate} al ${a.endDate}\n`;
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
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

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

    function importFromFile() {
        importFileInput.click();
    }

    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.participants && !data.arrangements) {
                    alert('Archivo de respaldo inválido');
                    return;
                }

                let importMessage = '¿Qué datos desea importar?\n\n';
                let hasParticipants = data.participants && data.participants.length > 0;
                let hasArrangements = data.arrangements && data.arrangements.length > 0;

                if (hasParticipants) {
                    importMessage += `• ${data.participants.length} participantes\n`;
                }
                if (hasArrangements) {
                    importMessage += `• ${data.arrangements.length} arreglos guardados\n`;
                }

                importMessage += '\n¿Desea continuar? (Los datos actuales se mantendrán)';

                if (confirm(importMessage)) {
                    if (hasParticipants) {
                        const currentParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
                        const mergedParticipants = [...currentParticipants];

                        data.participants.forEach(newP => {
                            if (!mergedParticipants.some(p => p.name.toLowerCase() === newP.name.toLowerCase())) {
                                mergedParticipants.push(newP);
                            }
                        });

                        localStorage.setItem('participants', JSON.stringify(mergedParticipants));
                        loadParticipants();
                    }

                    if (hasArrangements) {
                        const currentArrangements = JSON.parse(localStorage.getItem('arrangements') || '[]');
                        const mergedArrangements = [...currentArrangements];

                        data.arrangements.forEach(newA => {
                            if (!mergedArrangements.some(a => a.id === newA.id)) {
                                mergedArrangements.push(newA);
                            }
                        });

                        localStorage.setItem('arrangements', JSON.stringify(mergedArrangements));
                        loadSavedArrangements();
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
});
