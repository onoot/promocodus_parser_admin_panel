import { promises as fs } from 'fs';

interface RunStatus {
    run: boolean;
}

const filename = 'shop.json';

// Функция для создания файла JSON с полем run
export async function createJSONFile(runValue: boolean = true): Promise<RunStatus> {
    const runStatus: RunStatus = { run: runValue };
    const data = JSON.stringify(runStatus, null, 2);

    try {
        await fs.writeFile(filename, data, 'utf8');
        console.log(`File ${filename} has been created with run value ${runValue}`);
        return runStatus; // Return the created object
    } catch (error) {
        console.error(`Error creating file: ${error}`);
        throw error; // Propagate the error
    }
}

export async function readJSONFile(): Promise<RunStatus | null> { // Adjusted return type
    try {
        const data = await fs.readFile(filename, 'utf8');
        const runStatus: RunStatus = JSON.parse(data);
        return runStatus; // Correctly return
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`File not found. Creating a new file.`);
            return createJSONFile(); // Default to true if file does not exist
        } else {
            console.error(`Error reading file: ${error}`);
            return null; // Return null if another error occurred
        }
    }
}

// Функция асинхронно читает файл, обновляет поле run и перезаписывает файл
export async function updateRunInJSONFile(runValue: boolean): Promise<void> {
    try {
        const data = await fs.readFile(filename, 'utf8');
        const runStatus: RunStatus = JSON.parse(data);

        runStatus.run = runValue;

        const updatedData = JSON.stringify(runStatus, null, 2);

        await fs.writeFile(filename, updatedData, 'utf8');
        console.log(`File ${filename} has been updated with new run value: ${runValue}`);
    } catch (error) {
        console.error(`Error updating file: ${error}`);
    }
}