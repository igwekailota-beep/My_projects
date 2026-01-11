import { appState } from '../state/appState.js';
import { generateId } from '../utils/helpers.js';

export class CustomModeModal {
    constructor() {
        this.element = this.createModalElement();
        this.isOpen = false;
        this.addEventListeners();
    }

    createModalElement() {
        const modal = document.createElement('div');
        modal.id = 'custom-mode-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="bg-bg-secondary p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color">
                <h3 class="text-xl font-bold text-text-primary mb-4">Add Custom AI Mode</h3>
                <form id="custom-mode-form">
                    <div class="mb-4">
                        <label for="custom-mode-name" class="block text-text-secondary text-sm font-bold mb-2">Mode Name:</label>
                        <input type="text" id="custom-mode-name" class="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-bg-primary border-border-color" required>
                    </div>
                    <div class="mb-6">
                        <label for="custom-mode-instruction" class="block text-text-secondary text-sm font-bold mb-2">AI Instruction (Prompt):</label>
                        <textarea id="custom-mode-instruction" class="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-bg-primary border-border-color h-32" placeholder="e.g., 'As a pirate, respond in pirate speak.'" required></textarea>
                    </div>
                    <div class="flex items-center justify-between">
                        <button type="submit" class="btn-primary">Save Mode</button>
                        <button type="button" id="cancel-custom-mode" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        return modal;
    }

    addEventListeners() {
        this.element.querySelector('#custom-mode-form').addEventListener('submit', this.handleSave.bind(this));
        this.element.querySelector('#cancel-custom-mode').addEventListener('click', this.close.bind(this));
    }

    handleSave(event) {
        event.preventDefault();
        const nameInput = this.element.querySelector('#custom-mode-name');
        const instructionInput = this.element.querySelector('#custom-mode-instruction');

        const name = nameInput.value.trim();
        const instruction = instructionInput.value.trim();

        if (name && instruction) {
            // Check if a mode with the same name already exists
            if (appState.customAiModes.some(mode => mode.name.toLowerCase() === name.toLowerCase())) {
                appState.addNotification({ message: `Custom mode '${name}' already exists.`, type: 'error' });
                return;
            }

            appState.addCustomAiMode({ id: generateId(), name, instruction });
            appState.addNotification({ message: `Custom mode '${name}' added!`, type: 'success' });
            nameInput.value = '';
            instructionInput.value = '';
            this.close();
        } else {
            appState.addNotification({ message: 'Please fill in both mode name and instruction.', type: 'error' });
        }
    }

    open() {
        document.body.appendChild(this.element);
        this.element.classList.remove('hidden');
        this.isOpen = true;
    }

    close() {
        this.element.classList.add('hidden');
        this.isOpen = false;
        // Optional: Remove from DOM if not needed after closing
        // this.element.remove();
    }
}
