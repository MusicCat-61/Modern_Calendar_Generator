document.addEventListener('DOMContentLoaded', function() {
    // Инициализация переменных
    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let exportType = 'png'; // По умолчанию PNG
    let isExporting = false; // Флаг процесса экспорта
    
    // Элементы DOM
    const yearElement = document.getElementById('current-year');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const monthSelect = document.getElementById('month-select');
    const remainingMonthsBtn = document.getElementById('remaining-months');
    const wholeYearBtn = document.getElementById('whole-year');
    const exportButton = document.getElementById('export-button');
    const calendarPreview = document.getElementById('calendar-preview');
    const fontSelect = document.getElementById('font-select');
    const yearSizeInput = document.getElementById('year-size');
    const monthSizeInput = document.getElementById('month-size');
    const daysSizeInput = document.getElementById('days-size');
    const yearSizeValue = document.getElementById('year-size-value');
    const monthSizeValue = document.getElementById('month-size-value');
    const daysSizeValue = document.getElementById('days-size-value');
    const exportPngRadio = document.getElementById('export-png');
    const exportPdfRadio = document.getElementById('export-pdf');
    const paperSizeSelect = document.getElementById('paper-size');
    const orientationSelect = document.getElementById('orientation');

    // Инициализация цветовых пикеров
    const yearColorPicker = new iro.ColorPicker('#year-color-picker', {
        width: 150,
        color: '#4a6fa5'
    });

    const monthColorPicker = new iro.ColorPicker('#month-color-picker', {
        width: 150,
        color: '#166088'
    });

    const daysColorPicker = new iro.ColorPicker('#days-color-picker', {
        width: 150,
        color: '#333333'
    });

    const weekendColorPicker = new iro.ColorPicker('#weekend-color-picker', {
        width: 150,
        color: '#e53935'
    });

    // Размеры бумаги в мм (ширина x высота)
    const paperSizes = {
        a5: { portrait: [148, 210], landscape: [210, 148] },
        a4: { portrait: [210, 297], landscape: [297, 210] },
        a3: { portrait: [297, 420], landscape: [420, 297] },
        a2: { portrait: [420, 594], landscape: [594, 420] },
        a1: { portrait: [594, 841], landscape: [841, 594] }
    };

    // Блокировка кнопок
    function setButtonsDisabled(state) {
        isExporting = state;
        exportButton.disabled = state;
        remainingMonthsBtn.disabled = state;
        wholeYearBtn.disabled = state;
        prevYearBtn.disabled = state;
        nextYearBtn.disabled = state;
        monthSelect.disabled = state;
    }

    // Обновление года
    function updateYearDisplay() {
        yearElement.textContent = currentYear;
        generateCalendar(currentYear, currentMonth);
    }

    // Генерация календаря
    function generateCalendar(year, month) {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const orientation = orientationSelect.value;
        const paperSize = paperSizeSelect.value;

        // Получаем первый день месяца и количество дней в месяце
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        // Корректируем первый день (Пн = 0, Вс = 6)
        let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        // Создаем массив для календаря
        let calendar = [];
        let week = [];

        // Добавляем пустые ячейки для первого дня
        for (let i = 0; i < firstDayIndex; i++) {
            week.push('');
        }

        // Заполняем календарь днями
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);

            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }

        // Добавляем последнюю неделю
        if (week.length > 0) {
            while (week.length < 7) {
                week.push('');
            }
            calendar.push(week);
        }

        // Генерируем HTML для календаря
        let calendarHTML = `
            <div class="calendar ${orientation} ${paperSize}" style="font-family: ${fontSelect.value}">
                <div class="calendar-title">
                    <span class="calendar-year" style="color: ${yearColorPicker.color.hexString}; font-size: ${yearSizeInput.value}px">${year}</span>
                    <span class="calendar-month" style="color: ${monthColorPicker.color.hexString}; font-size: ${monthSizeInput.value}px">${monthNames[month - 1]}</span>
                </div>
                <table class="calendar-grid">
                    <thead>
                        <tr>
                            ${dayNames.map(day => `
                                <th style="font-size: ${daysSizeInput.value}px">${day}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${calendar.map(week => `
                            <tr>
                                ${week.map((day, index) => {
                                    if (day === '') {
                                        return '<td></td>';
                                    } else {
                                        const isWeekend = index === 5 || index === 6;
                                        const dayColor = isWeekend ? weekendColorPicker.color.hexString : daysColorPicker.color.hexString;
                                        return `<td style="color: ${dayColor}; font-size: ${daysSizeInput.value}px">${day}</td>`;
                                    }
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        calendarPreview.innerHTML = calendarHTML;
    }

    // Генерация PDF для всего года
    async function generateYearPdf() {
        const { jsPDF } = window.jspdf;
        const orientation = orientationSelect.value;
        const paperSize = paperSizeSelect.value;
        const dimensions = paperSizes[paperSize][orientation];

        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: paperSize.toUpperCase()
        });

        for (let month = 1; month <= 12; month++) {
            if (month > 1) {
                pdf.addPage(paperSize.toUpperCase(), orientation);
            }

            // Генерируем календарь для текущего месяца
            generateCalendar(currentYear, month);

            // Ждем обновления DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Конвертируем в canvas
            const calendarElement = document.querySelector('.calendar');
            const canvas = await html2canvas(calendarElement, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Рассчитываем размеры для вставки в PDF
            const imgWidth = dimensions[0] - 20; // -20 для отступов
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Добавляем изображение в PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }

        pdf.save(`calendar_${currentYear}_full.pdf`);
    }

    // Генерация PDF для оставшихся месяцев
    async function generateRemainingMonthsPdf() {
        const { jsPDF } = window.jspdf;
        const orientation = orientationSelect.value;
        const paperSize = paperSizeSelect.value;
        const dimensions = paperSizes[paperSize][orientation];
        const startMonth = currentDate.getMonth() + 1;

        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: paperSize.toUpperCase()
        });

        for (let month = startMonth; month <= 12; month++) {
            if (month > startMonth) {
                pdf.addPage(paperSize.toUpperCase(), orientation);
            }

            // Генерируем календарь для текущего месяца
            generateCalendar(currentYear, month);

            // Ждем обновления DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Конвертируем в canvas
            const calendarElement = document.querySelector('.calendar');
            const canvas = await html2canvas(calendarElement, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Рассчитываем размеры для вставки в PDF
            const imgWidth = dimensions[0] - 20; // -20 для отступов
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Добавляем изображение в PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }

        pdf.save(`calendar_${currentYear}_remaining.pdf`);
    }

    // Генерация архива PNG для всего года
    async function generateYearPngArchive() {
        for (let month = 1; month <= 12; month++) {
            // Генерируем календарь для текущего месяца
            generateCalendar(currentYear, month);

            // Ждем обновления DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Конвертируем в canvas
            const calendarElement = document.querySelector('.calendar');
            const canvas = await html2canvas(calendarElement, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `calendar_${currentYear}_${month}.png`;
            link.href = canvas.toDataURL('image/png');

            // Имитируем клик для скачивания
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Небольшая задержка между скачиваниями
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        alert(`Архив с календарями на ${currentYear} год успешно скачан!`);
    }

    // Генерация архива PNG для оставшихся месяцев
    async function generateRemainingMonthsPngArchive() {
        const startMonth = currentDate.getMonth() + 1;

        for (let month = startMonth; month <= 12; month++) {
            // Генерируем календарь для текущего месяца
            generateCalendar(currentYear, month);

            // Ждем обновления DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Конвертируем в canvas
            const calendarElement = document.querySelector('.calendar');
            const canvas = await html2canvas(calendarElement, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `calendar_${currentYear}_${month}.png`;
            link.href = canvas.toDataURL('image/png');

            // Имитируем клик для скачивания
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Небольшая задержка между скачиваниями
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        alert(`Архив с календарями с ${startMonth} по 12 месяц ${currentYear} года успешно скачан!`);
    }

    // Экспорт текущего месяца
    async function exportCurrentMonth() {
        if (isExporting) return;

        setButtonsDisabled(true);

        try {
            if (exportType === 'png') {
                const calendarElement = document.querySelector('.calendar');
                const canvas = await html2canvas(calendarElement, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `calendar_${currentYear}_${currentMonth}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else {
                const { jsPDF } = window.jspdf;
                const orientation = orientationSelect.value;
                const paperSize = paperSizeSelect.value;
                const dimensions = paperSizes[paperSize][orientation];

                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: paperSize.toUpperCase()
                });

                const calendarElement = document.querySelector('.calendar');
                const canvas = await html2canvas(calendarElement, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                });

                // Рассчитываем размеры для вставки в PDF
                const imgWidth = dimensions[0] - 20; // -20 для отступов
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save(`calendar_${currentYear}_${currentMonth}.pdf`);
            }
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Произошла ошибка при экспорте');
        } finally {
            setButtonsDisabled(false);
        }
    }

    // Обработчики событий
    prevYearBtn.addEventListener('click', () => {
        if (isExporting) return;
        currentYear--;
        updateYearDisplay();
    });

    nextYearBtn.addEventListener('click', () => {
        if (isExporting) return;
        currentYear++;
        updateYearDisplay();
    });

    monthSelect.addEventListener('change', () => {
        if (isExporting) return;
        currentMonth = parseInt(monthSelect.value);
        generateCalendar(currentYear, currentMonth);
    });

    remainingMonthsBtn.addEventListener('click', async () => {
        if (isExporting) return;

        setButtonsDisabled(true);

        try {
            if (exportType === 'png') {
                await generateRemainingMonthsPngArchive();
            } else {
                await generateRemainingMonthsPdf();
            }
        } catch (error) {
            console.error('Ошибка при генерации:', error);
            alert('Произошла ошибка при генерации');
        } finally {
            setButtonsDisabled(false);
        }
    });

    wholeYearBtn.addEventListener('click', async () => {
        if (isExporting) return;

        setButtonsDisabled(true);

        try {
            if (exportType === 'png') {
                await generateYearPngArchive();
            } else {
                await generateYearPdf();
            }
        } catch (error) {
            console.error('Ошибка при генерации:', error);
            alert('Произошла ошибка при генерации');
        } finally {
            setButtonsDisabled(false);
        }
    });

    exportButton.addEventListener('click', async () => {
        await exportCurrentMonth();
    });

    exportPngRadio.addEventListener('change', () => {
        exportType = 'png';
    });

    exportPdfRadio.addEventListener('change', () => {
        exportType = 'pdf';
    });

    paperSizeSelect.addEventListener('change', () => {
        generateCalendar(currentYear, currentMonth);
    });

    orientationSelect.addEventListener('change', () => {
        generateCalendar(currentYear, currentMonth);
    });

    // Обработчики изменений настроек
    fontSelect.addEventListener('change', () => {
        generateCalendar(currentYear, currentMonth);
    });

    yearColorPicker.on('color:change', () => {
        document.querySelector('.calendar-year').style.color = yearColorPicker.color.hexString;
    });

    monthColorPicker.on('color:change', () => {
        document.querySelector('.calendar-month').style.color = monthColorPicker.color.hexString;
    });

    daysColorPicker.on('color:change', () => {
        document.querySelectorAll('.calendar-grid td:not(.weekend)').forEach(td => {
            td.style.color = daysColorPicker.color.hexString;
        });
    });
    
    weekendColorPicker.on('color:change', () => {
        document.querySelectorAll('.calendar-grid td:nth-child(6), .calendar-grid td:nth-child(7)').forEach(td => {
            if (td.textContent.trim() !== '') {
                td.style.color = weekendColorPicker.color.hexString;
            }
        });
    });
    
    yearSizeInput.addEventListener('input', () => {
        document.querySelector('.calendar-year').style.fontSize = `${yearSizeInput.value}px`;
        yearSizeValue.textContent = yearSizeInput.value;
    });
    
    monthSizeInput.addEventListener('input', () => {
        document.querySelector('.calendar-month').style.fontSize = `${monthSizeInput.value}px`;
        monthSizeValue.textContent = monthSizeInput.value;
    });
    
    daysSizeInput.addEventListener('input', () => {
        const size = `${daysSizeInput.value}px`;
        document.querySelectorAll('.calendar-grid td').forEach(td => {
            td.style.fontSize = size;
        });
        document.querySelectorAll('.calendar-grid th').forEach(th => {
            th.style.fontSize = size;
        });
        daysSizeValue.textContent = daysSizeInput.value;
    });
    
    // Инициализация
    monthSelect.value = currentMonth;
    updateYearDisplay();
});