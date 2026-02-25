# ArrivoHub — готовый ZIP (MVP)

## Запуск
```bash
npm install
npm run dev
```

Открой: http://localhost:3000

## MOCK MODE
Если `.env.local` не настроен (по умолчанию) — всё работает на демо-данных в браузере (localStorage).
Это сделано специально, чтобы после распаковки ZIP ты сразу увидел готовый UI.

## Что реализовано
- Главная: 3 блока логина (Agency / Assistant / Guide), top-bar языков, header + contacts, footer + legal.
- Liquid Glass стиль: градиент небесно-голубой, белый текст, стеклянные кнопки + hover/press.
- Кабинет Agency:
  - Home: 2 большие кнопки создания запросов (assistant/guide)
  - Active Pending: раскрывающиеся карточки + applicants list (до 5) + confirm / change price / change details
  - Active Confirmed: add driver&transport details + change details + finish->archive
  - Archive / Credits / Profile / Statistics locked
- Кабинет Assistant:
  - Feed: открытые assistant-requests, ACCEPT / Offer your price
  - Pending / Confirmed (FINISH) / Archive / Subscription / Profile / Statistics locked
- Кабинет Guide: аналогично (feed/pending/confirmed/archive/subscription/profile)

## Supabase
`.env.example` лежит в корне. Подключение Supabase сделаем следующим шагом (таблицы + RLS + realtime).
