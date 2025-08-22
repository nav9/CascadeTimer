$(document).ready(function() {
    // --- Application State and Configuration ---
    let appState = {
        cascades: [],
        activeCascadeIndex: -1,
        globalMute: false,
        mutedByGlobal: new Set(),
        logs: {}
    };

    const soundLibrary = {
        'default': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADAA2ADgAOAA1ADYAOQA1ADgANgA0ADUAOQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'alert': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAADgA3ADkAOAA2ADgANgA5ADYANAA1ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'chime': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEAA5ADgANgA0ADUAOAA2ADgANgA0ADUAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'signal': 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Bpbmdlci8yAAAAAmluZm8AAAAPAAAAEgA1ADgANgA0ADUAOAA2ADgANgA0ADUAOAA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    };

    // --- Logger ---
    const logger = {
        log: function(cascadeId, message, type = 'info') {
            if (!appState.logs[cascadeId]) {
                appState.logs[cascadeId] = [];
            }
            const timestamp = new Date().toISOString();
            appState.logs[cascadeId].push({ timestamp, message, type });
            console.log(`[${type.toUpperCase()}] ${cascadeId}: ${message}`);
        }
    };

    // --- Core Classes ---
    class Timer {
        constructor(config = {}) {
            this.id = `timer-${Date.now()}-${Math.random()}`;
            this.name = config.name || 'New Timer';
            this.description = config.description || '';
            this.setDuration = config.setDuration || { d: 0, h: 0, m: 1, s: 0 };
            this.remainingTime = this.getTotalSeconds(this.setDuration); // in seconds
            this.state = 'idle'; // idle, running, paused, finished
            this.intervalId = null;
            this.notification = {
                sound: config.sound || 'default',
                repeats: config.repeats || 1,
                tts: config.tts || false
            };
            this.isMuted = config.isMuted || false;
        }

        getTotalSeconds(duration) {
            return (duration.d * 86400) + (duration.h * 3600) + (duration.m * 60) + duration.s;
        }
    }

    class Cascade {
        constructor(config = {}) {
            this.id = `cascade-${Date.now()}-${Math.random()}`;
            this.name = config.name || `Cascade ${appState.cascades.length + 1}`;
            this.timers = (config.timers || [new Timer()]).map(t => new Timer(t));
            this.activeTimerIndex = 0;
            this.repeat = config.repeat || false;
            this.isMuted = config.isMuted || false;
            this.defaultSound = config.defaultSound || 'default';
        }
    }

    // --- Initialization ---
    function init() {
        // Load from localStorage if available
        loadState();
        renderAll();
        // Add event listeners
        $('#add-cascade-btn').on('click', createNewCascade);
        $('#save-cascade-changes-btn').on('click', saveCascadeChanges);
        $('#editCascadeModal').on('hidden.bs.modal', () => $('#timers-editor-list').html(''));
        $('#add-timer-btn').on('click', () => {
             const cascadeId = $('#editCascadeModal').data('cascadeId');
             const cascade = findCascadeById(cascadeId);
             const newTimer = new Timer({sound: cascade.defaultSound});
             const editorHtml = createTimerEditorHtml(newTimer);
             $('#timers-editor-list').append(editorHtml);
        });
        $('#global-mute-btn').on('click', toggleGlobalMute);
        $('#save-all-btn').on('click', saveAllCascadesToZip);
        $('#load-file-input').on('change', loadFromFile);
        $('#view-logs-btn').on('click', renderLogs);
        
        populateSoundSelects();
        logger.log('system', 'Application initialized.', 'info');
    }
    
    // --- State Management ---
    function saveState() {
        try {
            const stateToSave = { ...appState };
            // Don't save interval IDs
            stateToSave.cascades = stateToSave.cascades.map(c => ({
                ...c,
                timers: c.timers.map(t => ({...t, intervalId: null }))
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
                appState.cascades = parsedState.cascades.map(c => new Cascade(c));
                appState.activeCascadeIndex = parsedState.activeCascadeIndex;
                appState.globalMute = parsedState.globalMute;
                // Initialize logs for existing cascades
                appState.cascades.forEach(c => {
                    if (!appState.logs[c.id]) appState.logs[c.id] = [];
                });
            }
        } catch (e) {
            logger.log('system', `Failed to load state from localStorage: ${e.message}`, 'error');
            appState.cascades = [];
        }
    }


    // --- UI Rendering ---
    function renderAll() {
        $('#cascade-container').empty();
        if (appState.cascades.length === 0) {
            $('#welcome-message').show();
            $('#main-header .header-container').css('max-width', '100%');
        } else {
            $('#welcome-message').hide();
            $('#main-header .header-container').css('max-width', '600px');
            appState.cascades.forEach((cascade, index) => {
                const cascadeHtml = createCascadeHtml(cascade, index);
                $('#cascade-container').append(cascadeHtml);
            });
            updateActiveCascade();
        }
        updateCascadeSwitcher();
        updateGlobalMuteButton();
    }
    
    function createCascadeHtml(cascade, index) {
        // ... build HTML for cascade and its timers ...
        return `<!-- HTML for cascade ${cascade.name} -->`;
    }

    function updateActiveCascade() {
        $('.cascade').removeClass('active');
        if (appState.activeCascadeIndex !== -1) {
            const activeCascade = appState.cascades[appState.activeCascadeIndex];
            $(`#${activeCascade.id}`).addClass('active');
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
                menu.append(`<li><a class="dropdown-item" href="#" data-cascade-index="${index}">${index + 1}. ${cascade.name}</a></li>`);
            }
        });
        
        menu.find('a').on('click', function(e) {
            e.preventDefault();
            const newIndex = parseInt($(this).data('cascade-index'));
            switchCascade(newIndex);
        });
    }

    // --- Cascade and Timer Logic ---
    function createNewCascade() {
        const newCascade = new Cascade();
        appState.cascades.push(newCascade);
        appState.activeCascadeIndex = appState.cascades.length - 1;
        logger.log(newCascade.id, `Cascade created with name: ${newCascade.name}.`, 'info');
        saveAndRender();
        openEditModal(newCascade.id);
    }
    
    function switchCascade(index) {
        if(index >= 0 && index < appState.cascades.length) {
            appState.activeCascadeIndex = index;
            logger.log(appState.cascades[index].id, 'Switched to this cascade.', 'info');
            saveAndRender();
            // Scroll active timer into view
            const activeCascade = appState.cascades[index];
            const activeTimer = activeCascade.timers[activeCascade.activeTimerIndex];
            const timerElement = $(`#${activeTimer.id}`);
            if (timerElement.length) {
                timerElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    function saveAndRender() {
        saveState();
        renderAll();
    }
    
    function openEditModal(cascadeId) {
        const cascade = findCascadeById(cascadeId);
        if(!cascade) return;

        $('#editCascadeModal').data('cascadeId', cascadeId);
        $('#editCascadeModalLabel').text(`Edit: ${cascade.name}`);
        $('#cascade-name-input').val(cascade.name);
        $('#cascade-repeat-toggle').prop('checked', cascade.repeat);
        $('#cascade-default-sound').val(cascade.defaultSound);

        const timersList = $('#timers-editor-list');
        timersList.empty();
        cascade.timers.forEach(timer => {
            timersList.append(createTimerEditorHtml(timer));
        });

        // Make timers draggable
        timersList.sortable({
            handle: '.timer-editor',
            axis: 'y',
            update: function() { /* Logic to reorder timers in the model will go here */ }
        });

        new bootstrap.Modal($('#editCascadeModal')).show();
    }

    function createTimerEditorHtml(timer) {
        // ... build HTML for the timer editor widget in the modal ...
        return `<!-- HTML for timer editor -->`;
    }
    
    function saveCascadeChanges() {
        // ... Logic to read values from the modal and update the cascade and its timers ...
        const cascadeId = $('#editCascadeModal').data('cascadeId');
        // ... update cascade properties ...
        
        // ... update timers from the editor list ...

        logger.log(cascadeId, 'Cascade changes saved.', 'info');
        saveAndRender();
        bootstrap.Modal.getInstance($('#editCascadeModal')).hide();
    }
    
    // Placeholder for other functions like toggleGlobalMute, saveAllCascadesToZip, loadFromFile, renderLogs etc.
    function toggleGlobalMute(){}
    function saveAllCascadesToZip(){}
    function loadFromFile(){}
    function renderLogs(){}
    function populateSoundSelects() {
        const soundOptions = Object.keys(soundLibrary).map(key => `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`).join('');
        $('#cascade-default-sound').html(soundOptions);
        // This will need to be done for individual timer sound selects as well.
    }
    function findCascadeById(id) {
        return appState.cascades.find(c => c.id === id);
    }


    // --- Start the application ---
    init();
});