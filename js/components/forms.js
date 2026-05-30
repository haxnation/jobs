export function setupFormValidation(formElement, onSubmit) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    const submitBtn = formElement.querySelector('[type="submit"], .submit-btn');

    let formTouched = false;

    function checkValidity() {
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity() || (input.type === 'checkbox' && !input.checked)) {
                isValid = false;
            }
        });
        
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            
            let globalErrorEl = document.getElementById('global-submit-error');
            // Only show global error after the user has interacted with the form
            if (!isValid && formTouched) {
                if (!globalErrorEl) {
                    globalErrorEl = document.createElement('p');
                    globalErrorEl.id = 'global-submit-error';
                    globalErrorEl.className = 'text-danger font-mono text-[10px] mt-2 font-bold uppercase text-center';
                    globalErrorEl.textContent = '* Complete all required fields to proceed';
                    submitBtn.parentNode.insertBefore(globalErrorEl, submitBtn.nextSibling);
                }
            } else {
                if (globalErrorEl) globalErrorEl.remove();
            }
        }
    }

    inputs.forEach(input => {
        // Initial asterisk
        const label = document.querySelector(`label[for="${input.id}"]`) || input.closest('label');
        if (label && !label.innerHTML.includes('*')) {
            label.innerHTML += ' <span class="text-danger">*</span>';
        }

        // On Blur Validation
        input.addEventListener('blur', () => {
            formTouched = true;
            checkValidity();
            
            // Error indicator immediately
            const errorId = `${input.id}-error`;
            let errorEl = document.getElementById(errorId);
            
            if (!input.checkValidity()) {
                input.classList.add('border-danger', 'bg-red-50');
                if (!errorEl) {
                    errorEl = document.createElement('p');
                    errorEl.id = errorId;
                    errorEl.className = 'text-danger font-mono text-[10px] mt-1 font-bold uppercase';
                    input.parentNode.appendChild(errorEl);
                }
                errorEl.textContent = input.validationMessage || 'This field is required/invalid.';
            } else {
                input.classList.remove('border-danger', 'bg-red-50');
                if (errorEl) errorEl.remove();
            }
        });
        
        input.addEventListener('input', () => {
            formTouched = true;
            checkValidity();
        });
    });

    // Character Count for textareas
    const textareas = formElement.querySelectorAll('textarea');
    textareas.forEach(ta => {
        const maxLength = ta.getAttribute('maxlength') || 500; // Default max length
        ta.setAttribute('maxlength', maxLength);
        
        const countEl = document.createElement('div');
        countEl.className = 'text-[10px] font-mono text-gray-500 text-right mt-1';
        countEl.textContent = `0 / ${maxLength}`;
        ta.parentNode.insertBefore(countEl, ta.nextSibling);

        ta.addEventListener('input', () => {
            countEl.textContent = `${ta.value.length} / ${maxLength}`;
        });
    });

    // Character Count for single-line inputs with limit (>50%)
    const singleInputs = formElement.querySelectorAll('input[type="text"][maxlength], input[type="email"][maxlength]');
    singleInputs.forEach(input => {
        const maxLength = parseInt(input.getAttribute('maxlength'));
        
        const countEl = document.createElement('div');
        countEl.className = 'text-[10px] font-mono text-gray-500 text-right mt-1 hidden';
        countEl.textContent = `0 / ${maxLength}`;
        input.parentNode.insertBefore(countEl, input.nextSibling);

        input.addEventListener('input', () => {
            const currentLen = input.value.length;
            countEl.textContent = `${currentLen} / ${maxLength}`;
            if (currentLen >= maxLength * 0.5) {
                countEl.classList.remove('hidden');
            } else {
                countEl.classList.add('hidden');
            }
        });
    });

    // Initial check
    checkValidity();

    if (submitBtn && onSubmit) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!submitBtn.disabled) {
                onSubmit();
            }
        });
    }
}
