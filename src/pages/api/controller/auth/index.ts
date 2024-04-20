export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { password } = req.body;

        // Здесь вы должны проверить пароль и, при необходимости, генерировать токен
        if (password === 'qwerty') {
            const token = 'a$@64643s235afq35484432dssdg423$#@)(sd';
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Неверный пароль' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Метод не разрешен' });
    }
}
