
    // const soundLibrary = {
    //     'default': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADAA2ADgAOAA1ADYAOQA1ADgANgA0ADUAOQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    //     'alert': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADgA3ADkAOAA2ADgANgA5ADYANAA1ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    //     'chime': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEAA5ADgANgA0ADUAOAA2ADgANgA0ADUAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    //     'signal': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEgA1ADgANgA0ADUAOAA2ADgANgA0ADUAOAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    // };

    $(document).ready(function() {
        // --- Application State and Configuration ---
        let appState = {
            cascades: [],
            activeCascadeIndex: -1,
            globalMute: false,
            mutedByGlobal: new Set(), // Stores timer IDs muted by the global mute button
            logs: { system: [] }
        };
    
        const soundLibrary = {
            'Mute': null,
            // 'Default': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT19JTklT', // Simple beep
            // 'Alert': 'data:audio/wav;base64,UklGRqRoT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaxoT19JTklT', // Another beep
            // 'Chime': 'data:audio/wav;base64,UklGRjRpT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQhpT19JTklT', // Chime sound
            // 'Signal': 'data:audio/wav;base64,UklGRoZoT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQZoT19JTklT' // Signal sound
        'default': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADAA2ADgAOAA1ADYAOQA1ADgANgA0ADUAOQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'alert': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADgA3ADkAOAA2ADgANgA5ADYANAA1ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'chime': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEAA5ADgANgA0ADUAOAA2ADgANgA0ADUAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'signal': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEgA1ADgANgA0ADUAOAA2ADgANgA0ADUAOAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='            
        };
    
        // --- Logger ---
        const logger = {
            log: function(cascadeId = 'system', message, type = 'info') {
                try {
                    if (!appState.logs[cascadeId]) {
                        appState.logs[cascadeId] = [];
                    }
                    const timestamp = new Date().toISOString();
                    appState.logs[cascadeId].push({ timestamp, message, type });
                    // Limit log size to prevent memory issues
                    if (appState.logs[cascadeId].length > 200) {
                        appState.logs[cascadeId].shift();
                    }
                } catch (e) {
                    console.error("Logging failed:", e);
                }
            }
        };
        
        // --- Confirmation Modal Helper ---
        function showConfirmation(title, body, onConfirm) {
            $('#confirmationModalLabel').text(title);
            $('#confirmationModalBody').text(body);
            $('#confirm-action-btn').off('click').on('click', () => {
                onConfirm();
                bootstrap.Modal.getInstance($('#confirmationModal')).hide();
            });
            new bootstrap.Modal($('#confirmationModal')).show();
        }
    
        // --- Core Classes ---
        class Timer {
            constructor(config = {}) {
                this.id = config.id || `timer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                this.name = config.name || 'New Timer';
                this.description = config.description || '';
                this.setDuration = config.setDuration || { d: 0, h: 0, m: 1, s: 0 };
                this.remainingTime = this.getTotalSeconds(config.remainingTime ? null : this.setDuration, config.remainingTime);
                this.state = config.state || 'idle'; // idle, running, paused, finished
                this.intervalId = null;
                this.notification = config.notification || {
                    sound: 'Default',
                    repeats: 1,
                    tts: false
                };
            }
    
            getTotalSeconds(duration, explicitSeconds) {
                if (explicitSeconds !== undefined) return explicitSeconds;
                if (!duration) return 0;
                return (duration.d * 86400) + (duration.h * 3600) + (duration.m * 60) + duration.s;
            }
        }
    
        class Cascade {
            constructor(config = {}) {
                this.id = config.id || `cascade-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                this.name = config.name || `Cascade ${appState.cascades.length + 1}`;
                this.timers = (config.timers ? config.timers.map(t => new Timer(t)) : [new Timer()]);
                this.activeTimerIndex = config.activeTimerIndex || 0;
                this.repeat = config.repeat || false;
                this.defaultSound = config.defaultSound || 'Default';
            }
        }
    
        // --- Initialization ---
        function init() {
            loadState();
            renderFAQ();
            renderAll();
            bindGlobalEvents();
            populateSoundSelects('#cascade-default-sound'); // For edit modal
            logger.log('system', 'Application initialized.', 'info');
        }
    
        // --- State Management ---
        function saveState() {
            try {
                const stateToSave = { ...appState };
                stateToSave.cascades = stateToSave.cascades.map(c => ({
                    ...c,
                    timers: c.timers.map(t => ({
                        ...t,
                        intervalId: null, // Don't save interval IDs
                        state: (t.state === 'running' ? 'paused' : t.state) // Save running timers as paused
                    }))
                }));
                localStorage.setItem('cascadeTimerState', JSON.stringify(stateToSave));
            } catch (e) {
                logger.log('system', `Failed to save state to localStorage: ${e.message}`, 'error');
            }
        }
    
        function loadState() {
            try {
                const savedState = localStorage.getItem('cascadeTimerState');
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    appState.cascades = parsedState.cascades.map(cData => new Cascade(cData));
                    appState.activeCascadeIndex = parsedState.activeCascadeIndex >= appState.cascades.length ? -1 : parsedState.activeCascadeIndex;
                    appState.globalMute = parsedState.globalMute || false;
                    appState.logs = parsedState.logs || { system: [] };
                    // Ensure all cascades have a log entry
                    appState.cascades.forEach(c => { if (!appState.logs[c.id]) appState.logs[c.id] = []; });
                }
            } catch (e) {
                logger.log('system', `Failed to load state from localStorage: ${e.message}`, 'error');
                appState.cascades = [];
            }
        }
    
        // --- UI Rendering ---
        function renderAll() {
            stopAllTimers(); // Prevent intervals from running after a re-render
            $('#cascade-container').empty();
            if (appState.cascades.length === 0) {
                $('#welcome-message').show();
                $('#main-header .header-container').css('max-width', '100%');
            } else {
                $('#welcome-message').hide();
                $('#main-header .header-container').css('max-width', '600px');
                appState.cascades.forEach((cascade, index) => {
                    $('#cascade-container').append(createCascadeHtml(cascade, index));
                });
                updateActiveCascade();
            }
            updateCascadeSwitcher();
            updateGlobalMuteButton();
            bindDynamicEvents();
        }
    
        function createCascadeHtml(cascade, index) {
            const isActive = index === appState.activeCascadeIndex;
            let timersHtml = cascade.timers.map((timer, timerIndex) => createTimerHtml(timer, cascade, timerIndex)).join('');
            
            return `
                <div class="cascade ${isActive ? 'active' : ''}" id="${cascade.id}" data-cascade-index="${index}">
                    <div class="cascade-header">
                        <h2 class="cascade-title"><span class="ordinal">#${index + 1}</span> ${cascade.name}</h2>
                        <div class="dropdown">
                            <button class="icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Cascade Options">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                                <li><a class="dropdown-item edit-cascade-btn" href="#"><i class="fas fa-edit fa-fw me-2"></i>Edit</a></li>
                                <li><a class="dropdown-item toggle-cascade-repeat-btn" href="#"><i class="fas fa-sync-alt fa-fw me-2"></i>${cascade.repeat ? 'Disable Repeat' : 'Enable Repeat'}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="cascade-body">${timersHtml}</div>
                </div>`;
        }
    
        function createTimerHtml(timer, cascade, timerIndex) {
            const isActiveTimer = timerIndex === cascade.activeTimerIndex;
            const timeParts = formatTime(timer.remainingTime);
            const isPaused = timer.state === 'paused' || timer.state === 'idle';
    
            return `
                <div class="timer-widget ${isActiveTimer ? 'active' : ''}" id="${timer.id}" data-timer-id="${timer.id}" data-cascade-id="${cascade.id}">
                    <div class="timer-header">
                        <h3 class="timer-title">${timer.name}</h3>
                        ${timer.description ? `<p class="timer-description">${timer.description}</p>` : ''}
                    </div>
                    <div class="timer-display">${timeParts.d} d : ${timeParts.h} h : ${timeParts.m} m : ${timeParts.s} s</div>
                    <div class="timer-controls">
                        <button class="icon-btn play-pause-btn" title="${isPaused ? 'Play' : 'Pause'}">
                            <i class="fas ${isPaused ? 'fa-play' : 'fa-pause'}"></i>
                        </button>
                        <div class="dropdown">
                            <button class="icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Timer Options">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                                <li><a class="dropdown-item prev-timer-btn ${timerIndex === 0 ? 'disabled' : ''}" href="#">Previous Timer</a></li>
                                <li><a class="dropdown-item next-timer-btn ${timerIndex === cascade.timers.length - 1 ? 'disabled' : ''}" href="#">Next Timer</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item reset-timer-btn" href="#">Reset Timer</a></li>
                            </ul>
                        </div>
                    </div>
                </div>`;
        }
    
        function updateActiveCascade() {
            $('.cascade').removeClass('active');
            if (appState.activeCascadeIndex > -1) {
                const activeCascade = appState.cascades[appState.activeCascadeIndex];
                if (activeCascade) {
                    const cascadeEl = $(`#${activeCascade.id}`);
                    cascadeEl.addClass('active');
                    // Ensure active timer is visible
                    const activeTimerEl = cascadeEl.find('.timer-widget.active');
                    if (activeTimerEl.length) {
                        activeTimerEl[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }
        }
    
        function updateCascadeSwitcher() {
            const menu = $('#cascade-switcher-menu');
            menu.empty();
            if (appState.cascades.length < 2) {
                $('#cascade-switcher-btn').prop('disabled', true);
                return;
            }
            $('#cascade-switcher-btn').prop('disabled', false);
            appState.cascades.forEach((cascade, index) => {
                if (index !== appState.activeCascadeIndex) {
                    menu.append(`<li><a class="dropdown-item switch-cascade-btn" href="#" data-cascade-index="${index}">${index + 1}. ${cascade.name}</a></li>`);
                }
            });
        }
    
        function updateGlobalMuteButton() {
            const btn = $('#global-mute-btn');
            if (appState.globalMute) {
                btn.html('<i class="fas fa-volume-mute"></i>').attr('title', 'Unmute All Sounds');
            } else {
                btn.html('<i class="fas fa-volume-up"></i>').attr('title', 'Mute All Sounds');
            }
        }
        
        function formatTime(totalSeconds) {
            const d = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
            totalSeconds %= 86400;
            const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            totalSeconds %= 3600;
            const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const s = String(totalSeconds % 60).padStart(2, '0');
            return { d, h, m, s };
        }
        
        function saveAndRender() {
            saveState();
            renderAll();
        }
        
        // --- Timer Logic ---
        function stopAllTimers() {
            appState.cascades.forEach(c => c.timers.forEach(t => {
                if (t.intervalId) clearInterval(t.intervalId);
            }));
        }
        
        function startTimer(timer, cascade) {
            if (timer.state === 'running') return;
            timer.state = 'running';
            
            const timerEl = $(`#${timer.id}`);
            timerEl.find('.play-pause-btn i').removeClass('fa-play').addClass('fa-pause');
    
            timer.intervalId = setInterval(() => {
                if (timer.remainingTime > 0) {
                    timer.remainingTime--;
                    const timeParts = formatTime(timer.remainingTime);
                    timerEl.find('.timer-display').text(`${timeParts.d} d : ${timeParts.h} h : ${timeParts.m} m : ${timeParts.s} s`);
                } else {
                    clearInterval(timer.intervalId);
                    timer.state = 'finished';
                    handleTimerFinished(timer, cascade);
                }
            }, 1000);
        }
        
        function pauseTimer(timer) {
            if (timer.state !== 'running') return;
            clearInterval(timer.intervalId);
            timer.state = 'paused';
            const timerEl = $(`#${timer.id}`);
            timerEl.find('.play-pause-btn i').removeClass('fa-pause').addClass('fa-play');
            saveState();
        }
        
        function handleTimerFinished(timer, cascade) {
            logger.log(cascade.id, `Timer "${timer.name}" finished.`, 'info');
            playNotification(timer, cascade);
    
            const nextTimerIndex = cascade.activeTimerIndex + 1;
            if (nextTimerIndex < cascade.timers.length) {
                // Move to next timer
                cascade.activeTimerIndex = nextTimerIndex;
                const nextTimer = cascade.timers[nextTimerIndex];
                nextTimer.remainingTime = nextTimer.getTotalSeconds(nextTimer.setDuration); // Reset next timer
                startTimer(nextTimer, cascade);
                saveAndRender();
            } else {
                // Last timer finished
                if (cascade.repeat) {
                    logger.log(cascade.id, `Cascade finished and is set to repeat.`, 'info');
                    cascade.timers.forEach(t => t.remainingTime = t.getTotalSeconds(t.setDuration));
                    cascade.activeTimerIndex = 0;
                    startTimer(cascade.timers[0], cascade);
                    saveAndRender();
                } else {
                    logger.log(cascade.id, `Cascade finished.`, 'info');
                    saveAndRender(); // Re-render to show finished state
                }
            }
        }
        
        // --- Event Handlers ---
        function bindGlobalEvents() {
            $('#add-cascade-btn').on('click', createNewCascade);
            $('#save-cascade-changes-btn').on('click', saveCascadeChangesFromModal);
            $('#global-mute-btn').on('click', toggleGlobalMute);
            $('#save-all-btn').on('click', saveAllCascadesToZip);
            $('#load-file-input').on('change', loadFromFile);
            $('#view-logs-btn').on('click', renderLogs);
            
            // Use delegated events for dynamically added elements in switcher
            $(document).on('click', '.switch-cascade-btn', function(e) {
                e.preventDefault();
                const newIndex = parseInt($(this).data('cascade-index'));
                switchCascade(newIndex);
            });
        }
        
        function bindDynamicEvents() {
            // --- Cascade Controls ---
            $('.edit-cascade-btn').on('click', function() {
                const cascadeId = $(this).closest('.cascade').attr('id');
                openEditModal(cascadeId);
            });
            $('.toggle-cascade-repeat-btn').on('click', function() {
                const cascadeId = $(this).closest('.cascade').attr('id');
                const cascade = findCascadeById(cascadeId);
                if(cascade) {
                    cascade.repeat = !cascade.repeat;
                    logger.log(cascadeId, `Repeat mode ${cascade.repeat ? 'enabled' : 'disabled'}.`, 'info');
                    saveAndRender();
                }
            });
            
            // --- Timer Controls ---
            $('.play-pause-btn').on('click', function() {
                const timerWidget = $(this).closest('.timer-widget');
                const timerId = timerWidget.data('timer-id');
                const cascadeId = timerWidget.data('cascade-id');
                const cascade = findCascadeById(cascadeId);
                const timer = findTimerById(cascade, timerId);
                if (timer) {
                    if(timer.state === 'running') {
                        pauseTimer(timer);
                    } else {
                        startTimer(timer, cascade);
                    }
                }
            });
    
            $('.reset-timer-btn').on('click', function() {
                const timerWidget = $(this).closest('.timer-widget');
                const timerId = timerWidget.data('timer-id');
                const cascadeId = timerWidget.data('cascade-id');
                const cascade = findCascadeById(cascadeId);
                const timer = findTimerById(cascade, timerId);
                if (timer) {
                    clearInterval(timer.intervalId);
                    timer.remainingTime = timer.getTotalSeconds(timer.setDuration);
                    timer.state = 'idle';
                    logger.log(cascade.id, `Timer "${timer.name}" was reset.`, 'info');
                    saveAndRender();
                }
            });
            
            $('.next-timer-btn').on('click', function() {
                if($(this).hasClass('disabled')) return;
                switchTimer(this, 1);
            });
            
            $('.prev-timer-btn').on('click', function() {
                if($(this).hasClass('disabled')) return;
                switchTimer(this, -1);
            });
        }
    
        // --- Core Logic Functions ---
        function createNewCascade() {
            const newCascade = new Cascade();
            appState.cascades.push(newCascade);
            appState.activeCascadeIndex = appState.cascades.length - 1;
            if (!appState.logs[newCascade.id]) appState.logs[newCascade.id] = [];
            logger.log(newCascade.id, `Cascade created.`, 'info');
            saveAndRender();
            openEditModal(newCascade.id);
        }
        
        function switchCascade(index) {
            if(index >= 0 && index < appState.cascades.length) {
                // Pause any running timer in the old cascade
                if (appState.activeCascadeIndex > -1) {
                    const oldCascade = appState.cascades[appState.activeCascadeIndex];
                    const activeTimer = oldCascade.timers[oldCascade.activeTimerIndex];
                    if (activeTimer && activeTimer.state === 'running') {
                        pauseTimer(activeTimer);
                    }
                }
                appState.activeCascadeIndex = index;
                logger.log(appState.cascades[index].id, 'Switched to this cascade.', 'info');
                saveAndRender();
            }
        }
        
        function switchTimer(buttonElement, direction) {
            const timerWidget = $(buttonElement).closest('.timer-widget');
            const cascadeId = timerWidget.data('cascade-id');
            const cascade = findCascadeById(cascadeId);
            
            if (cascade) {
                const currentTimer = cascade.timers[cascade.activeTimerIndex];
                if (currentTimer.state === 'running') {
                    pauseTimer(currentTimer);
                }
                
                const newIndex = cascade.activeTimerIndex + direction;
                if (newIndex >= 0 && newIndex < cascade.timers.length) {
                    cascade.activeTimerIndex = newIndex;
                    const newTimer = cascade.timers[newIndex];
                    startTimer(newTimer, cascade);
                    logger.log(cascade.id, `Switched to timer "${newTimer.name}".`, 'info');
                    saveAndRender();
                }
            }
        }
        
        // --- Edit Modal ---
        function openEditModal(cascadeId) {
            const cascade = findCascadeById(cascadeId);
            if (!cascade) return;
    
            const modal = $('#editCascadeModal');
            modal.data('cascadeId', cascadeId);
            modal.find('#editCascadeModalLabel').text(`Edit: ${cascade.name}`);
            modal.find('#cascade-name-input').val(cascade.name);
            modal.find('#cascade-repeat-toggle').prop('checked', cascade.repeat);
            modal.find('#cascade-default-sound').val(cascade.defaultSound);
    
            const timersList = modal.find('#timers-editor-list');
            timersList.empty();
            cascade.timers.forEach(timer => {
                timersList.append(createTimerEditorHtml(timer));
            });
    
            timersList.sortable({
                placeholder: "timer-editor-placeholder",
                handle: '.timer-editor-header',
                axis: 'y'
            });
    
            // Bind events specific to the modal content
            bindModalEvents();
    
            new bootstrap.Modal(modal[0]).show();
        }
    
        function createTimerEditorHtml(timer) {
            const soundOptionsHtml = Object.keys(soundLibrary).map(key => `<option value="${key}" ${timer.notification.sound === key ? 'selected' : ''}>${key}</option>`).join('');
            return `
                <div class="timer-editor" data-timer-id="${timer.id}">
                    <div class="timer-editor-header">
                        <div class="form-group flex-grow-1">
                            <input type="text" class="form-control timer-name-input" placeholder="Timer Name" value="${timer.name}">
                        </div>
                        <button class="icon-btn delete-timer-btn ms-2" title="Delete Timer"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    <div class="form-group my-2">
                        <textarea class="form-control timer-desc-input" rows="2" placeholder="Optional description...">${timer.description}</textarea>
                    </div>
                    
                    <label class="form-label mt-2">Duration</label>
                    <div class="time-input-group">
                        ${createTimeSpinner('d', timer.setDuration.d, 99)}
                        <span>:</span>
                        ${createTimeSpinner('h', timer.setDuration.h, 23)}
                        <span>:</span>
                        ${createTimeSpinner('m', timer.setDuration.m, 59)}
                        <span>:</span>
                        ${createTimeSpinner('s', timer.setDuration.s, 59)}
                    </div>
                    
                    <label class="form-label mt-3">Notification</label>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <select class="form-select timer-sound-select">${soundOptionsHtml}</select>
                        </div>
                        <div class="col-md-6 mb-2">
                             <div class="input-group">
                                <span class="input-group-text">Repeat</span>
                                <input type="number" class="form-control timer-repeats-input" min="1" max="10" value="${timer.notification.repeats}">
                            </div>
                        </div>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input timer-tts-toggle" type="checkbox" ${timer.notification.tts ? 'checked' : ''}>
                        <label class="form-check-label">Use Text-to-Speech</label>
                    </div>
                </div>`;
        }
    
        function createTimeSpinner(unit, value, max) {
            return `
                <div class="time-input-container">
                    <button class="time-spinner-btn" data-unit="${unit}" data-action="inc">&#9650;</button>
                    <input type="number" class="form-control time-input" data-unit="${unit}" value="${value}" min="0" max="${max}">
                    <button class="time-spinner-btn" data-unit="${unit}" data-action="dec">&#9660;</button>
                    <small class="text-muted text-uppercase">${unit}</small>
                </div>`;
        }
        
        function bindModalEvents() {
            // Unbind previous to prevent multiple fires
            $('#editCascadeModal').off('click');
    
            $('#delete-cascade-btn').on('click', function() {
                const cascadeId = $('#editCascadeModal').data('cascadeId');
                showConfirmation('Delete Cascade?', 'Are you sure you want to permanently delete this entire cascade and all its timers?', () => {
                    const cascadeIndex = appState.cascades.findIndex(c => c.id === cascadeId);
                    if (cascadeIndex > -1) {
                        delete appState.logs[cascadeId];
                        appState.cascades.splice(cascadeIndex, 1);
                        if (appState.activeCascadeIndex >= cascadeIndex) {
                            appState.activeCascadeIndex--;
                        }
                        if (appState.cascades.length === 0) appState.activeCascadeIndex = -1;
                        else if (appState.activeCascadeIndex < 0) appState.activeCascadeIndex = 0;
                        
                        saveAndRender();
                        bootstrap.Modal.getInstance($('#editCascadeModal')).hide();
                    }
                });
            });
    
            $('#add-timer-btn-footer').on('click', () => {
                 const cascadeId = $('#editCascadeModal').data('cascadeId');
                 const cascade = findCascadeById(cascadeId);
                 const newTimer = new Timer({ notification: { sound: cascade.defaultSound, repeats: 1, tts: false } });
                 const editorHtml = createTimerEditorHtml(newTimer);
                 $('#timers-editor-list').append(editorHtml);
            });
            
            $('#timers-editor-list').on('click', '.delete-timer-btn', function() {
                const timerEditor = $(this).closest('.timer-editor');
                showConfirmation('Delete Timer?', 'Are you sure you want to delete this timer?', () => {
                    timerEditor.remove();
                });
            });
            
            // Time spinner buttons
            $('#timers-editor-list').on('click', '.time-spinner-btn', function() {
                const action = $(this).data('action');
                const input = $(this).siblings('.time-input');
                let value = parseInt(input.val()) || 0;
                const max = parseInt(input.attr('max'));
                if (action === 'inc' && value < max) value++;
                if (action === 'dec' && value > 0) value--;
                input.val(value);
            });
    
            // Time input validation
            $('#timers-editor-list').on('change', '.time-input', function() {
                 let value = parseInt($(this).val()) || 0;
                 const max = parseInt($(this).attr('max'));
                 const min = parseInt($(this).attr('min'));
                 if (value > max) value = max;
                 if (value < min) value = min;
                 $(this).val(value);
            });
        }
        
        function saveCascadeChangesFromModal() {
            const modal = $('#editCascadeModal');
            const cascadeId = modal.data('cascadeId');
            const cascade = findCascadeById(cascadeId);
            if (!cascade) return;
    
            cascade.name = modal.find('#cascade-name-input').val() || 'Untitled Cascade';
            cascade.repeat = modal.find('#cascade-repeat-toggle').is(':checked');
            cascade.defaultSound = modal.find('#cascade-default-sound').val();
    
            const newTimers = [];
            modal.find('.timer-editor').each(function() {
                const editor = $(this);
                const timerId = editor.data('timer-id');
                const existingTimer = findTimerById(cascade, timerId);
    
                const setDuration = {
                    d: parseInt(editor.find('.time-input[data-unit="d"]').val()),
                    h: parseInt(editor.find('.time-input[data-unit="h"]').val()),
                    m: parseInt(editor.find('.time-input[data-unit="m"]').val()),
                    s: parseInt(editor.find('.time-input[data-unit="s"]').val())
                };
    
                const config = {
                    id: timerId,
                    name: editor.find('.timer-name-input').val() || 'Untitled Timer',
                    description: editor.find('.timer-desc-input').val(),
                    setDuration: setDuration,
                    notification: {
                        sound: editor.find('.timer-sound-select').val(),
                        repeats: parseInt(editor.find('.timer-repeats-input').val()),
                        tts: editor.find('.timer-tts-toggle').is(':checked')
                    },
                    // Preserve remaining time if duration hasn't changed
                    remainingTime: existingTimer && JSON.stringify(existingTimer.setDuration) === JSON.stringify(setDuration) ? existingTimer.remainingTime : undefined
                };
                newTimers.push(new Timer(config));
            });
            
            // Reset active timer index if it's now out of bounds
            if (cascade.activeTimerIndex >= newTimers.length) {
                cascade.activeTimerIndex = 0;
            }
    
            cascade.timers = newTimers;
            logger.log(cascade.id, 'Cascade changes saved.', 'info');
            saveAndRender();
            bootstrap.Modal.getInstance(modal[0]).hide();
        }
        
        // --- Audio ---
        function playNotification(timer, cascade) {
            if (appState.globalMute || timer.notification.sound === 'Mute') return;
    
            const audioSrc = soundLibrary[timer.notification.sound];
            if (!audioSrc) return;
            
            let playCount = 0;
            const audio = new Audio(audioSrc);
            audio.onended = () => {
                playCount++;
                if(playCount < timer.notification.repeats) {
                    audio.play();
                } else if (timer.notification.tts) {
                    speakNotification(timer, cascade);
                }
            };
            audio.play().catch(e => logger.log(cascade.id, `Audio play failed: ${e.message}`, 'error'));
        }
    
        function speakNotification(timer, cascade) {
            if (!('speechSynthesis' in window)) {
                logger.log(cascade.id, 'Text-to-speech not supported by this browser.', 'warn');
                return;
            }
            const text = `In cascade ${cascade.name}, timer ${timer.name} has completed. ${timer.description || ''}`;
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    
        function toggleGlobalMute() {
            appState.globalMute = !appState.globalMute;
            logger.log('system', `Global mute ${appState.globalMute ? 'enabled' : 'disabled'}.`, 'info');
            updateGlobalMuteButton();
            saveState();
        }
        
        // --- Save/Load ---
        function saveAllCascadesToZip() {
            try {
                const zip = new JSZip();
                const data = JSON.stringify(appState, (key, value) => (key === 'intervalId' ? undefined : value), 2);
                zip.file("cascade_timer_backup.json", data);
                zip.generateAsync({ type:"blob" }).then(function(content) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(content);
                    link.download = `cascade_timer_backup_${new Date().toISOString().slice(0,10)}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    logger.log('system', 'All cascades saved to zip.', 'info');
                });
            } catch(e) {
                logger.log('system', `Failed to save to zip: ${e.message}`, 'error');
                alert('Error creating zip file. See logs for details.');
            }
        }
        
        function loadFromFile(event) {
            const file = event.target.files[0];
            if (!file) return;
    
            const reader = new FileReader();
            if (file.name.endsWith('.zip')) {
                reader.onload = function(e) {
                    JSZip.loadAsync(e.target.result).then(function(zip) {
                        const jsonFile = zip.file("cascade_timer_backup.json");
                        if (jsonFile) {
                            jsonFile.async("string").then(processLoadedData);
                        } else {
                            alert('Error: The zip file does not contain "cascade_timer_backup.json".');
                        }
                    });
                };
                reader.readAsArrayBuffer(file);
            } else if (file.name.endsWith('.json')) {
                reader.onload = function(e) {
                    processLoadedData(e.target.result);
                };
                reader.readAsText(file);
            } else {
                alert('Unsupported file type. Please select a .json or .zip file.');
            }
            // Reset file input
            $(event.target).val('');
        }
    
        function processLoadedData(jsonData) {
            try {
                const loadedState = JSON.parse(jsonData);
                // Basic validation
                if (loadedState && Array.isArray(loadedState.cascades)) {
                    stopAllTimers();
                    appState = {
                        cascades: loadedState.cascades.map(c => new Cascade(c)),
                        activeCascadeIndex: loadedState.activeCascadeIndex || 0,
                        globalMute: loadedState.globalMute || false,
                        mutedByGlobal: new Set(),
                        logs: loadedState.logs || { system: [] }
                    };
                    if (appState.cascades.length === 0) appState.activeCascadeIndex = -1;
                    logger.log('system', 'Successfully loaded data from file.', 'info');
                    saveAndRender();
                } else {
                    throw new Error("Invalid data structure.");
                }
            } catch (e) {
                logger.log('system', `Failed to process loaded file: ${e.message}`, 'error');
                alert("Error: The file is corrupted or not a valid Cascade Timer backup.");
            }
        }
        
        // --- Misc Helpers ---
        function renderLogs() {
            const accordion = $('#logs-accordion');
            accordion.empty();
            
            Object.entries(appState.logs).forEach(([cascadeId, logs]) => {
                const cascade = findCascadeById(cascadeId);
                const title = cascade ? `${cascade.name} (#${appState.cascades.indexOf(cascade)+1})` : "System Logs";
                
                const logEntriesHtml = logs.slice().reverse().map(log => 
                    `<div class="log-entry log-${log.type}">
                        <span class="log-timestamp">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span>${log.message}</span>
                    </div>`
                ).join('');
    
                const accordionItemHtml = `
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${cascadeId}">
                                ${title}
                            </button>
                        </h2>
                        <div id="collapse-${cascadeId}" class="accordion-collapse collapse" data-bs-parent="#logs-accordion">
                            <div class="accordion-body">${logEntriesHtml || 'No logs for this entry.'}</div>
                        </div>
                    </div>`;
                accordion.append(accordionItemHtml);
            });
        }
    
        function renderFAQ() {
            $('#faq-content').html(`
                <h5>What is a Cascade?</h5>
                <p>A "Cascade" is a collection of timers that run one after another in a sequence. Once the first timer finishes, the second one automatically starts, and so on.</p>
                
                <h5>How do I create and edit timers?</h5>
                <p>Click the <i class="fas fa-plus-square"></i> icon in the top bar to create a new cascade. This will open the editor. To edit an existing cascade, click the three-dot menu (<i class="fas fa-ellipsis-v"></i>) on its header and select "Edit". In the editor, you can change the cascade's name, set it to repeat, and manage its timers. You can drag timers to reorder them.</p>
        
                <h5>How does the Global Mute button work?</h5>
                <p>The Global Mute button (<i class="fas fa-volume-up"></i> / <i class="fas fa-volume-mute"></i>) instantly silences all notification sounds across all cascades. It does not change the individual "Mute" setting on any timer. When you unmute, the timers will revert to their original sound settings. This is useful for temporarily silencing the app without losing your specific timer configurations.</p>
                
                <h5>How do I save and load my timers?</h5>
                <p>Use the Save (<i class="fas fa-save"></i>) and Load (<i class="fas fa-folder-open"></i>) icons in the top bar. Saving will package all your cascades and their settings into a single <code>.zip</code> file that you can download to your computer. Loading this file later will restore your entire setup. This is great for backups or moving your timers to another device.</p>
    
                <h5>What is Text-to-Speech (TTS)?</h5>
                <p>In the timer editor, you can enable the "Use Text-to-Speech" option. When a timer with this option enabled finishes, your browser will read out a sentence announcing which cascade and timer has completed, along with its description. This is an accessibility feature and requires a modern browser.</p>
            `);
        }
    
        function findCascadeById(id) {
            return appState.cascades.find(c => c.id === id);
        }
        function findTimerById(cascade, id) {
            if (!cascade) return null;
            return cascade.timers.find(t => t.id === id);
        }
    
        function populateSoundSelects(selector) {
            const soundOptionsHtml = Object.keys(soundLibrary).map(key => `<option value="${key}">${key}</option>`).join('');
            $(selector).html(soundOptionsHtml);
        }
    
        // --- Start the application ---
        init();
    });