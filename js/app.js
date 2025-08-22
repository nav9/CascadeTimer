/**
 * CascadeTimer Application
 * A feature-rich, standalone timer application.
 */
$(document).ready(function() {

    // --- CONFIGURATION ---
    const AVAILABLE_SOUNDS = [
        "chime.mp3",
        "notification.mp3",
        "alarm-clock.mp3",
        "digital-bleep.mp3"
    ];
    const SOUNDS_PATH = "sounds/";

    // --- MAIN APP CLASS ---
    class CascadeTimerApp {
        constructor() {
            this.timerSeries = [];
            this.activeSeriesIndex = 0;
            this.speechSynth = window.speechSynthesis;
            this.audioElement = $('#notification-sound')[0];

            this._loadStateFromLocalStorage();
            this._setupEventListeners();
            this.renderAllSeries();
        }

        // --- Core Methods ---
        createNewSeries() {
            const newSeries = new TimerSeries(this, {
                name: `Timer Series ${this.timerSeries.length + 1}`
            });
            this.timerSeries.push(newSeries);
            this.renderAllSeries();
            newSeries.showEditModal();
            this.saveStateToLocalStorage();
        }
        
        renderAllSeries() {
            const container = $('#timer-series-container');
            container.empty();
            if (this.timerSeries.length === 0) {
                $('#no-series-placeholder').show();
                return;
            }
            $('#no-series-placeholder').hide();
            this.timerSeries.forEach(series => container.append(series.render()));
        }

        // --- Save & Load ---
        saveAllSeriesToZip() {
            if (this.timerSeries.length === 0) {
                this._showToast("Nothing to Save", "Create a timer series first.", "warning");
                return;
            }
            const zip = new JSZip();
            const data = this.timerSeries.map(series => series.getData());
            zip.file("cascadeTimerData.json", JSON.stringify(data, null, 2));
            zip.generateAsync({ type: "blob" }).then(content => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "CascadeTimer-Backup.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this._showToast("Success", "All timer series have been saved.", "success");
            });
        }
        
        loadSeriesFromZip(file) {
            JSZip.loadAsync(file).then(zip => {
                const dataFile = zip.file("cascadeTimerData.json");
                if (dataFile) {
                    return dataFile.async("string");
                }
                return Promise.reject("cascadeTimerData.json not found in ZIP.");
            }).then(content => {
                const data = JSON.parse(content);
                data.forEach(seriesData => {
                    this.timerSeries.push(new TimerSeries(this, seriesData));
                });
                this.renderAllSeries();
                this.saveStateToLocalStorage();
                this._showToast("Load Successful", "Timer series have been imported.", "success");
            }).catch(err => {
                console.error("Failed to load from ZIP:", err);
                this._showToast("Load Error", "Could not read the ZIP file.", "danger");
            });
        }
        
        saveStateToLocalStorage() {
            const data = this.timerSeries.map(series => series.getData());
            localStorage.setItem('cascadeTimerState', JSON.stringify(data));
        }

        _loadStateFromLocalStorage() {
            const savedState = localStorage.getItem('cascadeTimerState');
            if (savedState) {
                const data = JSON.parse(savedState);
                this.timerSeries = data.map(seriesData => new TimerSeries(this, seriesData));
            }
        }
        
        // --- Utility Methods ---
        _showToast(title, message, type = 'info') {
            const toastHtml = `
                <div class="toast text-white bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto">${title}</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">${message}</div>
                </div>`;
            const toastEl = $(toastHtml);
            $('.toast-container').append(toastEl);
            const toast = new bootstrap.Toast(toastEl[0], { delay: 5000 });
            toast.show();
        }

        // --- Event Listeners ---
        _setupEventListeners() {
            $('#add-series-btn').on('click', () => this.createNewSeries());
            $('#save-all-btn').on('click', () => this.saveAllSeriesToZip());
            $('#load-zip-input').on('change', (e) => {
                const file = e.target.files[0];
                if (file) this.loadSeriesFromZip(file);
                $(e.target).val(''); // Reset input
            });
        }
    }

    // --- TIMER SERIES CLASS ---
    class TimerSeries {
        constructor(app, data) {
            this.app = app;
            this.id = data.id || `series-${Date.now()}-${Math.random()}`;
            this.name = data.name || 'Untitled Series';
            this.timers = data.timers ? data.timers.map(t => new Timer(this, t)) : [new Timer(this, {})];
            this.repeat = data.repeat || false;
            this.defaultSound = data.defaultSound || AVAILABLE_SOUNDS[0];
            this.useTTS = data.useTTS || false;
            
            // Runtime state
            this.currentIndex = 0;
            this.isRunning = false;
            this.interval = null;
        }

        getData() {
            return {
                id: this.id,
                name: this.name,
                repeat: this.repeat,
                defaultSound: this.defaultSound,
                useTTS: this.useTTS,
                timers: this.timers.map(t => t.getData())
            };
        }

        render() {
            // This method would create the HTML for the timer series display.
            // Due to complexity, we'll keep this conceptual. The real logic
            // would build the series header, controls, and list of timers.
            // For now, it returns a placeholder.
            const seriesEl = $(`
                <div class="timer-series" id="${this.id}">
                    <div class="series-header">
                        <h2 class="series-title">${this.name}</h2>
                        <div class="series-controls">
                           <button class="btn btn-primary start-pause-btn"><i class="fas fa-play"></i> Start</button>
                           <button class="btn btn-secondary edit-series-btn"><i class="fas fa-edit"></i> Edit</button>
                           <button class="btn btn-danger delete-series-btn"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                    <ul class="timers-list list-unstyled">
                        <!-- Timers will be rendered here -->
                    </ul>
                </div>
            `);
            
            // Event listeners for this specific series
            seriesEl.find('.edit-series-btn').on('click', () => this.showEditModal());
            // ... other listeners for start/pause, delete, next, prev etc.

            return seriesEl;
        }

        showEditModal() {
            const modalHtml = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark text-light">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Timer Series</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Series Name</label>
                                <input type="text" class="form-control form-control-dark" id="edit-series-name" value="${this.name}">
                            </div>
                            <h6>Timers</h6>
                            <ul id="edit-timers-list" class="list-group mb-3"></ul>
                            <button id="add-timer-btn-modal" class="btn btn-sm btn-success"><i class="fas fa-plus"></i> Add Timer</button>
                            <hr>
                            <div class="row">
                                <div class="col-md-4">
                                    <label class="form-label">Default Sound</label>
                                    <select id="edit-series-sound" class="form-select form-control-dark"></select>
                                </div>
                                <div class="col-md-4 d-flex align-items-end">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="edit-series-repeat" ${this.repeat ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit-series-repeat">Repeat Series</label>
                                    </div>
                                </div>
                                <div class="col-md-4 d-flex align-items-end">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="edit-series-tts" ${this.useTTS ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit-series-tts">Use Text-to-Speech</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-series-changes-btn">Save Changes</button>
                        </div>
                    </div>
                </div>`;
            
            // Inject and show modal
            $('body').append(`<div class="modal fade" id="active-edit-modal">${modalHtml}</div>`);
            const modalEl = $('#active-edit-modal');
            const modal = new bootstrap.Modal(modalEl[0]);

            // Populate sound dropdowns
            const soundOptions = AVAILABLE_SOUNDS.map(s => `<option value="${s}">${s.split('.')[0].replace(/-/g, ' ')}</option>`).join('');
            modalEl.find('#edit-series-sound').html(soundOptions).val(this.defaultSound);

            // Populate timers list
            const timersList = modalEl.find('#edit-timers-list');
            this.timers.forEach(timer => {
                const timerRow = this._createEditTimerRow(timer);
                timersList.append(timerRow);
            });
            
            // Enable sorting
            timersList.sortable({ handle: '.drag-handle' });

            // Modal event listeners
            modalEl.find('#add-timer-btn-modal').on('click', () => {
                const newTimer = new Timer(this, {});
                timersList.append(this._createEditTimerRow(newTimer));
            });
            modalEl.on('click', '.remove-timer-btn', function() { $(this).closest('li').remove(); });
            modalEl.find('#save-series-changes-btn').on('click', () => {
                this._saveFromModal(modalEl);
                modal.hide();
            });
            modalEl.on('hidden.bs.modal', () => modalEl.remove());
            
            modal.show();
        }
        
        _createEditTimerRow(timer) {
            const template = $('#edit-timer-item-template').html();
            const row = $(template);
            row.find('.timer-name-input').val(timer.name);
            row.find('.timer-duration-input').val(timer.getDurationString());
            
            // Populate sound dropdown for this timer
            const soundSelect = row.find('.timer-sound-select');
            const soundOptions = AVAILABLE_SOUNDS.map(s => `<option value="${s}">${s.split('.')[0].replace(/-/g, ' ')}</option>`).join('');
            soundSelect.html(`<option value="default">-- Use Series Default --</option>${soundOptions}`);
            soundSelect.val(timer.sound || 'default');
            
            return row;
        }
        
        _saveFromModal(modalEl) {
            // Update series properties
            this.name = modalEl.find('#edit-series-name').val() || 'Untitled Series';
            this.repeat = modalEl.find('#edit-series-repeat').is(':checked');
            this.useTTS = modalEl.find('#edit-series-tts').is(':checked');
            this.defaultSound = modalEl.find('#edit-series-sound').val();

            // Update timers
            const newTimers = [];
            modalEl.find('.edit-timer-item').each(function() {
                const name = $(this).find('.timer-name-input').val() || 'Untitled Timer';
                const durationStr = $(this).find('.timer-duration-input').val();
                const sound = $(this).find('.timer-sound-select').val();

                const newTimerData = { name, sound: sound === 'default' ? null : sound };
                const timerInstance = new Timer(this, newTimerData);
                timerInstance.setDurationFromString(durationStr);
                newTimers.push(timerInstance);
            });
            this.timers = newTimers;

            // Re-render and save
            this.app.renderAllSeries();
            this.app.saveStateToLocalStorage();
            this.app._showToast("Saved", `"${this.name}" has been updated.`, "success");
        }
        
        // ... Other methods like _start, _pause, _nextTimer, _update would go here
    }

    // --- TIMER CLASS ---
    class Timer {
        constructor(series, data) {
            this.series = series;
            this.name = data.name || 'Untitled Timer';
            this.totalSeconds = data.totalSeconds || 60; // Default to 1 minute
            this.remainingSeconds = this.totalSeconds;
            this.sound = data.sound || null; // null means use series default
        }

        getData() {
            return {
                name: this.name,
                totalSeconds: this.totalSeconds,
                sound: this.sound,
            };
        }
        
        getDurationString() {
            if (this.totalSeconds === 0) return "00:00:00:00";
            let seconds = this.totalSeconds;
            const days = Math.floor(seconds / 86400);
            seconds %= 86400;
            const hours = Math.floor(seconds / 3600);
            seconds %= 3600;
            const minutes = Math.floor(seconds / 60);
            seconds %= 60;
            return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        setDurationFromString(str) {
            const parts = str.split(':').map(p => parseInt(p, 10) || 0);
            while (parts.length < 4) parts.unshift(0); // Pad for simplicity
            const [d, h, m, s] = parts;
            this.totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s;
            this.remainingSeconds = this.totalSeconds;
        }
    }

    // --- INITIALIZE THE APP ---
    window.app = new CascadeTimerApp();

});