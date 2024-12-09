const fs = require('fs');
const path = require('path');

// Получаем имя компонента из аргументов командной строки
const componentName = process.argv[2];

if (!componentName) {
    console.error('Пожалуйста, укажите имя компонента.');
    process.exit(1);
}

// Определяем путь к папке
const componentPath = path.join(__dirname, componentName);

// Шаблоны файлов
const files = {
    [`${componentName}-router.js`]: `
const Router = require('express').Router;
const ${componentName}Controller = require('./${componentName}-controller'); 
const router = new Router();

// router.post('/', ${componentName}Controller.set); 
// router.get('/', ${componentName}Controller.get); 

module.exports = router;
`,

    [`${componentName}-controller.js`]: `
const ${componentName}Service = require('./${componentName}-service');

class ${componentName}Controller {
    async set(req, res, next) {
        try {
            const { value } = req.body;
            const jsonString = atob(value);
            const obj = JSON.parse(jsonString);
            console.log(obj);

            await ${componentName}Service.set(obj);
            return res.json('ok');
        } catch (e) {
            next(e);
        }
    }

    async get(req, res, next) {
        try {
            const { type } = req.query;

            const scores = await ${componentName}Service.get(type);
            return res.json(scores);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ${componentName}Controller();
`,

    [`${componentName}-service.js`]: `
require('dotenv').config();
const ${componentName}Model = require('./${componentName}-model');

class ${componentName}Service {
    // async set(obj) {
    //     await ${componentName}Model.findOneAndUpdate(
    //         { meows: obj },
    //         {
    //             wallet: 123,
    //             balance: 321,
    //         },
    //         { upsert: true }
    //     );
    //     return true;
    // }

    // async get(type) {
    //     const games = await ${componentName}Model.find()
    //         .sort({
    //             snake: -1,
    //         })
    //         .limit(30);
    //     return games;
    // }
}

module.exports = new ${componentName}Service();
`,

    [`${componentName}-model.js`]: `
const { Schema, model } = require('mongoose');

const ${componentName}Schema = new Schema({
    // meows: String,
    // gavs: Number,
}, { timestamps: true });

module.exports = model('${componentName.charAt(0).toUpperCase() + componentName.slice(1)}', ${componentName}Schema);
`,
};

// Создание папки и файлов
fs.mkdir(componentPath, { recursive: true }, (err) => {
    if (err) {
        console.error('Ошибка при создании папки:', err);
        process.exit(1);
    }

    for (const [fileName, content] of Object.entries(files)) {
        const filePath = path.join(componentPath, fileName);
        fs.writeFile(filePath, content.trim(), (err) => {
            if (err) {
                console.error(`Ошибка при создании файла ${fileName}:`, err);
            } else {
                console.log(`Файл ${fileName} создан.`);
            }
        });
    }
});
