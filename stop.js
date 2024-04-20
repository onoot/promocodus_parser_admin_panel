const { exec } = require('child_process');

// Найдите процесс 'npm run dev' и остановите его
exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка остановки процесса: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Ошибка при остановке процесса: ${stderr}`);
        return;
    }

    console.log(`Процесс npm run dev остановлен: ${stdout}`);

    // После завершения текущего процесса перезапустите npm run dev
    // Мы используем nohup и & чтобы запустить процесс независимо от терминала
    exec("nohup npm run dev &", (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка запуска скрипта: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Ошибка запуска скрипта: ${stderr}`);
            return;
        }

        console.log(`Процесс npm run dev запущен: ${stdout}`);
    });
});