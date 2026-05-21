# Тестовое Angular-приложение для работы со списком пользователей

[Открыть демо на GitHub Pages](https://drimkaa.github.io/yadro/)

## Возможности

- просмотр списка пользователей;
- пагинация и выбор количества пользователей на странице;
- фильтрация по имени и email;
- просмотр страницы пользователя;
- создание и редактирование пользователя;
- удаление пользователя с подтверждением;
- синхронизация фильтров и пагинации с query-параметрами;
- адаптивный интерфейс с использованием ng-zorro.

## API

Проект использует JSONPlaceholder:

- `GET /users`
- `GET /users/{id}`
- `POST /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`

Базовый URL:

```text
https://jsonplaceholder.typicode.com/users
```

## Установка и запуск

Склонировать репозиторий:

```bash
git clone git@github.com:Drimkaa/yadro.git
```

Перейти в папку проекта:

```bash
cd yadro
```

Установить зависимости:

```bash
npm i
```

Запустить проект в режиме разработки:

```bash
npm start
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:4200/
```

## Запуск собранной SSR-версии

Сначала нужно выполнить сборку:

```bash
npm run build
```

Результат сборки создается в папке:

```text
dist/yadro
```
Затем запустить собранную серверную версию:

```bash
npm run serve:ssr:yadro
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:4000/
```

## Деплой на GitHub Pages

Сохранить изменения в репозитории:

```bash
git status
git add .
git commit -m "Update project"
git push origin master
```

Опубликовать приложение на GitHub Pages:

```bash
ng deploy --base-href=/yadro/
```

