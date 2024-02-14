const fs = require('fs').promises;

function modifyString(address) {
    address = address.trim().substring(2);
    while (address.length < 64) {
        address = "0" + address;
    }
    return '0x' + address.toLowerCase();
}

(async () => {
    try {
        const walsData = await fs.readFile('./wals.txt', 'utf-8');
        const wals = walsData.trim().split('\n');

        const files = Array.from({ length: 7 }, (_, i) => `./jsons/starknet-${i}.json`);
        const promises = files.map(file => fs.readFile(file, 'utf-8'));
        const parsedFiles = await Promise.all(promises);

        let amount = 0;
        let walsEligible = '';

        for (const walNotEdited of wals) {
            const wal = modifyString(walNotEdited);
            let found = false;

            // Итерация по загруженным JSON файлам
            for (const file of parsedFiles) {
                const jsonData = JSON.parse(file);
                const eligible = jsonData.eligibles.find(data => data.identity === wal);
                if (eligible) {
                    amount += parseInt(eligible.amount);
                    walsEligible += `${wal}\n`;
                    console.log(`eligible: ${wal} amount: ${eligible.amount}`);
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log(`Not eligible: ${wal}`);
            }
        }

        console.log(`Total drop: ${amount}`);
        await fs.writeFile('./walsEligible.txt', walsEligible, 'utf-8');
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
