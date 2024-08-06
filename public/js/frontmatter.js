function generateForm(data, parentKey = '', parentElement = null) {
    const formContainer = parentElement || document.getElementById('front-matter-form');
    if (!parentElement) formContainer.innerHTML = ''; // Clear the container if it's the main form container

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = fullKey;
            label.innerText = key;

            formGroup.appendChild(label);

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        generateForm(item, `${fullKey}[${index}]`, formGroup);
                    } else {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.id = `${fullKey}[${index}]`;
                        input.value = item;
                        input.oninput = updateFrontMatter;

                        formGroup.appendChild(input);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                generateForm(value, fullKey, formGroup);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = fullKey;
                input.value = value;
                input.oninput = updateFrontMatter;

                formGroup.appendChild(input);
            }

            formContainer.appendChild(formGroup);
        }
    }
}

function updateFrontMatter(event) {
    const input = event.target;
    const keys = input.id.split('.');

    let currentLevel = frontMatterData;
    for (let i = 0; i < keys.length - 1; i++) {
        const keyPart = keys[i].replace(/\[\d+\]/, ''); // Handle array index
        if (!currentLevel[keyPart]) {
            currentLevel[keyPart] = {};
        }
        currentLevel = currentLevel[keyPart];
    }
    currentLevel[keys[keys.length - 1].replace(/\[\d+\]/, '')] = input.value;

    console.log('Updated front matter:', frontMatterData);
}

document.addEventListener("DOMContentLoaded", () => {
    let data = document.getElementById('frontmatter-content').innerText;
    try {
        if (data) {
            frontMatterData = JSON.parse(data);
        }
        console.log(JSON.stringify(frontMatterData, null, 4));
        generateForm(frontMatterData);
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});
