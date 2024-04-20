const { exec } = require('child_process');
const fs = require('fs');
const cron = require('node-cron');

function runNextJs() {
    const logStream = fs.createWriteStream('nextjs_output.log', { flags: 'w' });

    // Запускаем процесс Next.js с помощью npm run dev
    const nextProcess = exec('next dev -p 80');

    nextProcess.stdout.pipe(process.stdout);
    nextProcess.stderr.pipe(process.stderr);
    nextProcess.stdout.pipe(logStream);
    nextProcess.stderr.pipe(logStream);
    nextProcess.on('close', (code) => {
        console.log(`Next.js process exited with code ${code}`);
    });
}

// Запускаем Next.js
runNextJs();

// Задаем расписание для очистки файла каждые 2 дня
cron.schedule('0 0 */2 * *', () => {
    fs.writeFileSync('nextjs_output.log', 'Файл очищен!');
    console.log('Файл очищен!');
});
