// Copy and paste this entire code into the Firebase Console browser console (F12)
// while viewing a Firestore document

(function debugFirestoreConsole() {
    console.clear();
    console.log('%c=== FIRESTORE CONSOLE DOM DEBUG ===', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('URL:', window.location.href);

    // Check if we're on the right page
    if (!window.location.href.includes('/firestore/data/')) {
        console.log('%c❌ Not on a Firestore document page!', 'color: red; font-weight: bold');
        return;
    }

    console.log('%c✅ On a Firestore document page', 'color: green; font-weight: bold');

    console.log('\n%c--- Testing Selectors ---', 'color: orange; font-weight: bold');

    const selectors = [
        'tr[class*="field"]',
        'div[class*="field-row"]',
        'div[class*="document-field"]',
        '[data-testid*="field"]',
        '.cdk-row',
        'tr.mat-row',
        'tr.mat-mdc-row',
        'mat-row',
        'table tr',
        'tbody tr',
        '.mat-mdc-table tr',
        '[role="row"]',
        'tr',
        'div[class*="row"]',
        'input[type="text"]',
        'textarea',
    ];

    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`%c✓ ${selector}`, 'color: green', `found ${elements.length} elements`);
                console.log('  First element:', elements[0]);
                console.log('  Classes:', elements[0].className);
                console.log('  HTML preview:', elements[0].outerHTML.substring(0, 150) + '...');

                // Try to find text content
                const cells = elements[0].querySelectorAll('td, th, div, span');
                if (cells.length > 0) {
                    console.log('  Cell contents:', Array.from(cells).slice(0, 5).map(c => c.textContent.trim().substring(0, 30)));
                }
            }
        } catch (e) {
            console.log(`%c✗ ${selector}`, 'color: gray', 'error:', e.message);
        }
    });

    console.log('\n%c--- Looking for Tables ---', 'color: orange; font-weight: bold');
    const tables = document.querySelectorAll('table');
    console.log(`Found ${tables.length} table(s)`);
    tables.forEach((table, i) => {
        console.log(`Table ${i}:`, table);
        console.log('  Rows:', table.querySelectorAll('tr').length);
        console.log('  Classes:', table.className);
        const firstRow = table.querySelector('tr');
        if (firstRow) {
            console.log('  First row HTML:', firstRow.outerHTML.substring(0, 200));
        }
    });

    console.log('\n%c--- Looking for Input Fields ---', 'color: orange; font-weight: bold');
    const inputs = document.querySelectorAll('input, textarea');
    console.log(`Found ${inputs.length} input/textarea elements`);
    Array.from(inputs).slice(0, 10).forEach((input, i) => {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        const parent = input.parentElement;
        console.log(`Input ${i}:`, {
            type: input.type,
            name: input.name,
            placeholder: input.placeholder,
            value: input.value?.substring(0, 50) || '',
            label: label?.textContent?.trim() || 'no label',
            parentClass: parent?.className || ''
        });
    });

    console.log('\n%c--- Main Container ---', 'color: orange; font-weight: bold');
    const mainContainers = document.querySelectorAll('main, [role="main"], [class*="content"]');
    console.log(`Found ${mainContainers.length} main container(s)`);
    mainContainers.forEach((container, i) => {
        console.log(`Container ${i}:`, container);
        console.log('  Classes:', container.className);
        console.log('  Direct children:', container.children.length);
    });

    console.log('\n%c--- All Text Content (first 500 chars) ---', 'color: orange; font-weight: bold');
    const bodyText = document.body.innerText.substring(0, 500);
    console.log(bodyText);

    console.log('\n%c=== INSTRUCTIONS ===', 'color: blue; font-size: 14px; font-weight: bold');
    console.log('1. Look for selectors that found elements (marked with ✓)');
    console.log('2. Check if those elements contain field data');
    console.log('3. Share the output with me so I can update the extension');

    return 'Debug complete! Check the output above.';
})();
