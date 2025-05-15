
const KeyBindings = {
    keysPressed: {},
    
    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        const helpButton = document.getElementById('help-button');
        const shortcutsModal = document.getElementById('shortcuts-modal');
        const modalOverlay = document.getElementById('modal-overlay');
        const closeModal = document.getElementById('close-modal');
        const showAllShortcuts = document.getElementById('show-all-shortcuts');
        
        helpButton.addEventListener('click', () => {
            shortcutsModal.classList.remove('hidden');
        });
        
        closeModal.addEventListener('click', () => {
            shortcutsModal.classList.add('hidden');
        });
        
        modalOverlay.addEventListener('click', () => {
            shortcutsModal.classList.add('hidden');
        });
        
        showAllShortcuts.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAllShortcuts();
        });
    },
    
    toggleAllShortcuts() {
        const shortcutsContainer = document.querySelector('#shortcuts-modal .p-6');
        
        if (document.getElementById('all-shortcuts-container')) {
            shortcutsContainer.querySelector('.grid').classList.remove('hidden');
            document.getElementById('all-shortcuts-container').remove();
            document.getElementById('show-all-shortcuts').textContent = 'Show all shortcuts';
            return;
        }
        
        shortcutsContainer.querySelector('.grid').classList.add('hidden');
        
        const allShortcutsContainer = document.createElement('div');
        allShortcutsContainer.id = 'all-shortcuts-container';
        allShortcutsContainer.className = 'space-y-8';
        
        allShortcutsContainer.innerHTML = this.getAllShortcutsHTML();
        
        shortcutsContainer.insertBefore(allShortcutsContainer, shortcutsContainer.lastElementChild);
        document.getElementById('show-all-shortcuts').textContent = 'Show summary view';
    },
    
    getAllShortcutsHTML() {
        return `
            <div>
                <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Tools</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex justify-between"><span>Hand (panning tool)</span><span class="font-mono bg-gray-100 px-2 rounded">H</span></div>
                    <div class="flex justify-between"><span>Selection</span><span class="font-mono bg-gray-100 px-2 rounded">V or 1</span></div>
                    <div class="flex justify-between"><span>Rectangle</span><span class="font-mono bg-gray-100 px-2 rounded">R or 2</span></div>
                    <div class="flex justify-between"><span>Diamond</span><span class="font-mono bg-gray-100 px-2 rounded">D or 3</span></div>
                    <div class="flex justify-between"><span>Ellipse</span><span class="font-mono bg-gray-100 px-2 rounded">O or 4</span></div>
                    <div class="flex justify-between"><span>Arrow</span><span class="font-mono bg-gray-100 px-2 rounded">A or 5</span></div>
                    <div class="flex justify-between"><span>Line</span><span class="font-mono bg-gray-100 px-2 rounded">L or 6</span></div>
                    <div class="flex justify-between"><span>Draw</span><span class="font-mono bg-gray-100 px-2 rounded">P or 7</span></div>
                    <div class="flex justify-between"><span>Text</span><span class="font-mono bg-gray-100 px-2 rounded">T or 8</span></div>
                    <div class="flex justify-between"><span>Insert image</span><span class="font-mono bg-gray-100 px-2 rounded">9</span></div>
                    <div class="flex justify-between"><span>Eraser</span><span class="font-mono bg-gray-100 px-2 rounded">E or 0</span></div>
                    <div class="flex justify-between"><span>Frame tool</span><span class="font-mono bg-gray-100 px-2 rounded">F</span></div>
                    <div class="flex justify-between"><span>Laser pointer</span><span class="font-mono bg-gray-100 px-2 rounded">K</span></div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">View</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex justify-between"><span>Zoom in</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl +</span></div>
                    <div class="flex justify-between"><span>Zoom out</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl -</span></div>
                    <div class="flex justify-between"><span>Reset zoom</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl 0</span></div>
                    <div class="flex justify-between"><span>Zoom to fit all elements</span><span class="font-mono bg-gray-100 px-2 rounded">Shift 1</span></div>
                    <div class="flex justify-between"><span>Zoom to selection</span><span class="font-mono bg-gray-100 px-2 rounded">Shift 2</span></div>
                    <div class="flex justify-between"><span>Move page up/down</span><span class="font-mono bg-gray-100 px-2 rounded">PgUp/PgDn</span></div>
                    <div class="flex justify-between"><span>Move page left/right</span><span class="font-mono bg-gray-100 px-2 rounded">Shift PgUp/PgDn</span></div>
                    <div class="flex justify-between"><span>Zen mode</span><span class="font-mono bg-gray-100 px-2 rounded">Alt Z</span></div>
                    <div class="flex justify-between"><span>Snap to objects</span><span class="font-mono bg-gray-100 px-2 rounded">Alt S</span></div>
                    <div class="flex justify-between"><span>Toggle grid</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl '</span></div>
                    <div class="flex justify-between"><span>View mode</span><span class="font-mono bg-gray-100 px-2 rounded">Alt R</span></div>
                    <div class="flex justify-between"><span>Toggle light/dark theme</span><span class="font-mono bg-gray-100 px-2 rounded">Alt Shift D</span></div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Editor</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex justify-between"><span>Move canvas</span><span class="font-mono bg-gray-100 px-2 rounded">Space drag</span></div>
                    <div class="flex justify-between"><span>Reset the canvas</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Delete</span></div>
                    <div class="flex justify-between"><span>Delete</span><span class="font-mono bg-gray-100 px-2 rounded">Delete</span></div>
                    <div class="flex justify-between"><span>Cut</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl X</span></div>
                    <div class="flex justify-between"><span>Copy</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl C</span></div>
                    <div class="flex justify-between"><span>Paste</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl V</span></div>
                    <div class="flex justify-between"><span>Paste as plaintext</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Shift V</span></div>
                    <div class="flex justify-between"><span>Select all</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl A</span></div>
                    <div class="flex justify-between"><span>Undo</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Z</span></div>
                    <div class="flex justify-between"><span>Redo</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Y or Ctrl Shift Z</span></div>
                    <div class="flex justify-between"><span>Group selection</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl G</span></div>
                    <div class="flex justify-between"><span>Ungroup selection</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Shift G</span></div>
                    <div class="flex justify-between"><span>Duplicate</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl D</span></div>
                    <div class="flex justify-between"><span>Bring to front</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Shift ]</span></div>
                    <div class="flex justify-between"><span>Send to back</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl Shift [</span></div>
                    <div class="flex justify-between"><span>Bring forward</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl ]</span></div>
                    <div class="flex justify-between"><span>Send backward</span><span class="font-mono bg-gray-100 px-2 rounded">Ctrl [</span></div>
                </div>
            </div>
        `;
    },
    
    handleKeyDown(event) {
        this.keysPressed[event.key.toLowerCase()] = true;
        
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case 'h':
                    this.setActiveTool('hand');
                    break;
                case 'v':
                case '1':
                    this.setActiveTool('select');
                    break;
                case 'r':
                case '2':
                    this.setActiveTool('rect');
                    break;
                case 'd':
                case '3':
                    this.setActiveTool('diamond');
                    break;
                case 'o':
                case '4':
                    this.setActiveTool('ellipse');
                    break;
                case 'a':
                case '5':
                    this.setActiveTool('arrow');
                    break;
                case 'l':
                case '6':
                    this.setActiveTool('line');
                    break;
                case 'p':
                case '7':
                    this.setActiveTool('pencil');
                    break;
                case 't':
                case '8':
                    this.setActiveTool('text');
                    break;
                case '9':
                    this.setActiveTool('image');
                    break;
                case 'e':
                case '0':
                    this.setActiveTool('eraser');
                    break;
                case 'f':
                    this.setActiveTool('frame');
                    break;
                case 'k':
                    this.setActiveTool('laser');
                    break;
                case 'q':
                    this.toggleLockTool();
                    break;
                case 'delete':
                case 'backspace':
                    this.deleteSelected();
                    break;
            }
        }
        
        if (event.ctrlKey && !event.altKey) {
            switch (event.key) {
                case '+':
                case '=':
                    event.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                case '_':
                    event.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    event.preventDefault();
                    this.resetZoom();
                    break;
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
                case 'a':
                    event.preventDefault();
                    this.selectAll();
                    break;
                case 'c':
                    if (!event.shiftKey) {
                        this.copy();
                    }
                    break;
                case 'v':
                    if (!event.shiftKey) {
                        this.paste();
                    } else {
                    }
                    break;
                case 'x':
                    this.cut();
                    break;
                case 'd':
                    event.preventDefault();
                    this.duplicate();
                    break;
                case 'g':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.ungroup();
                    } else {
                        this.group();
                    }
                    break;
            }
        }
        
        if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            this.toggleTheme();
        }
    },
    
    handleKeyUp(event) {
        delete this.keysPressed[event.key.toLowerCase()];
    },
    
    setActiveTool(tool) {
        if (window.setTool) {
            window.setTool(tool);
        }
    },
    
    zoomIn() {
        zoomLevel = Math.min(zoomLevel * 1.2, 5);
        document.getElementById('zoom-level').textContent = `${Math.round(zoomLevel * 100)}%`;
    },
    
    zoomOut() {
        zoomLevel = Math.max(zoomLevel / 1.2, 0.1);
        document.getElementById('zoom-level').textContent = `${Math.round(zoomLevel * 100)}%`;
    },
    
    resetZoom() {
        zoomLevel = 1;
        document.getElementById('zoom-level').textContent = '100%';
    },
    
    toggleTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.click();
        }
    },
    
    toggleLockTool() {
        const lockToolButton = document.getElementById('lock-tool');
        if (lockToolButton) {
            lockToolButton.click();
        }
    },
    
    deleteSelected() {
        if (window.deleteSelected) {
            window.deleteSelected();
        }
    },
    
    undo() {
        document.getElementById('undo-button').click();
    },
    
    redo() {
        document.getElementById('redo-button').click();
    },
    
    selectAll() {
    },
    
    copy() {
    },
    
    paste() {
    },
    
    cut() {
    },
    
    duplicate() {
    },
    
    group() {
    },
    
    ungroup() {
    }
};

document.addEventListener('DOMContentLoaded', () => {
    KeyBindings.init();
});