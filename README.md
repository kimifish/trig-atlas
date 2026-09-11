# Атлас углов

Устанавливаемое веб-приложение для изучения тригонометрии через единичную окружность, прямоугольный треугольник и синхронные графики функций.

Приложение: <https://kimifish.github.io/trig-atlas/>

## Разработка

Требуется Node.js 20.19 или новее.

```bash
npm install
npm run dev
```

## Проверка

```bash
npm run lint
npm test
npm run build
```

Production-сборка в `dist/` содержит manifest и service worker для установки приложения как PWA.
