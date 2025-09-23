устанавливаете ноду отдельно Node.js

затем через цмд устанавливаете yarn - install yarn

заходим в проект
1.cd PetMatch-frontend
подкачиваем библиотеки в node-modules, т.к. в репозитории никто такой балласт не хранит
2.yarn
запускаем проект
3.yarn dev

вариант запуска через докер (тоже предварительно зайти в папку с проектом cd PetMatch-frontend)
docker build -t petmatch-frontend .
docker run -p 5173:5173 petmatch-frontend

