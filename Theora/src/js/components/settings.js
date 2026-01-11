import { appState } from '../state/appState';
import { CustomModeModal } from './customModeModal.js';

export class Settings {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'settings-page p-4';
        this.customModeModal = new CustomModeModal();
        this.render();
        appState.subscribe('customAiModesChanged', this.render.bind(this));
    }

    render() {
        this.element.innerHTML = `
            <div class="max-w-2xl mx-auto bg-bg-secondary p-6 rounded-lg shadow-md border border-border-color">
                <h2 class="text-2xl font-bold text-text-primary mb-6">AI Preferences</h2>

                <!-- AI Response Style Selection -->
                <div class="mb-6">
                    <h3 class="text-xl font-semibold text-text-primary mb-3">AI Response Style</h3>
                    <p class="text-text-secondary mb-4">Select how Theora should communicate with you.</p>
                    <div class="flex flex-col space-y-2">
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="normal" ${appState.aiResponseStyle === 'normal' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Normal (Standard responses)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="concise" ${appState.aiResponseStyle === 'concise' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Concise (Brief and to-the-point)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="sapa" ${appState.aiResponseStyle === 'sapa' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Sapa Mode (Low on money, Nigerian pidgin)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="hustle" ${appState.aiResponseStyle === 'hustle' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Hustle Mode (Productivity focus, Nigerian pidgin)</span>
                        </label>
                        ${appState.customAiModes.map(mode => `
                            <div class="flex items-center justify-between">
                                <label class="inline-flex items-center flex-grow">
                                    <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="${mode.name}" ${appState.aiResponseStyle === mode.name ? 'checked' : ''}>
                                    <span class="ml-2 text-text-secondary">${mode.name} (Custom)</span>
                                </label>
                                <button type="button" class="delete-custom-mode-btn text-error hover:text-red-700 text-sm ml-4" data-mode-name="${mode.name}">
                                    Delete
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Custom AI Modes -->
                <div>
                    <h3 class="text-xl font-semibold text-text-primary mb-3">Custom AI Modes</h3>
                    <p class="text-text-secondary mb-4">Define your own AI response styles.</p>
                    <button id="add-custom-mode-btn" class="btn-primary">Add Custom Mode</button>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        this.element.querySelectorAll('input[name="aiResponseStyle"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                appState.aiResponseStyle = e.target.value; // Directly update appState property
                appState.addNotification({ message: 'AI Response Style updated!', type: 'success' });
            });
        });

        const addCustomModeBtn = this.element.querySelector('#add-custom-mode-btn');
        if (addCustomModeBtn) {
            addCustomModeBtn.addEventListener('click', () => {
                this.customModeModal.open();
            });
        }

        this.element.querySelectorAll('.delete-custom-mode-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const modeName = e.currentTarget.dataset.modeName;
                if (confirm(`Are you sure you want to delete the custom mode '${modeName}'?`)) {
                    appState.removeCustomAiMode(modeName);
                    // If the deleted mode was the currently selected one, revert to 'normal'
                    if (appState.aiResponseStyle === modeName) {
                        appState.aiResponseStyle = 'normal';
                        appState.addNotification({ message: 'Deleted custom mode was active. Reverted to Normal.', type: 'info' });
                    }
                    appState.addNotification({ message: `Custom mode '${modeName}' deleted!`, type: 'success' });
                }
            });
        });
    }

    getHtml() {
        // Ensure the modal is in the DOM when the settings page is rendered
        if (!document.body.contains(this.customModeModal.element)) {
            document.body.appendChild(this.customModeModal.element);
        }
        return this.element;
    }
}
