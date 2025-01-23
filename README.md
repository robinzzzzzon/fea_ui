## The FEA APP

# General description for users:
This is a free application witch provides an ability to improve your english level via a few following types of the trainings:

* vocabulary memorization block:
- writing;
- puzzle training;
- choosing a correct option from the option list;

* active practicing block:
- speaking about random topic;
- writing essay;

The trainings of the last one are validated by chat-gpt so that after providing your own gpt api-key you will be able to set up a configuration for the chat-gpt behavior and giving a feedback after sending an essay.

In the next version of this app it's going to be equipped by the new additional features such as:
* srs-algorythm as the best approach of recalling words you've already studied.
* an ability to customize your own local example of the fea through addition any other decks which can significantly boost your memorization trainings.

# For developers:
Fea was created as a typical client-server application and has the next logical parts:
- Frontend layer (Vanilla JS/Webpack/SPA)
- Backend layer (Vanilla JS/Node/Express)
- MongoDB (database)
- Mongo-express (as a db-client)

All these parts of the app have been published as docker-images which you can find here: https://hub.docker.com/repositories/feelmax

# How it can actually be used:
<b>Important!</b> For the correct usage at first you have to make sure that you've already installed Docker as a container working tool. If not, please install it before you continue;

* Firstly you need to find a docker-compose.yml file which is in ./.user_artifacts and then copy it to your local machine.
* Now, by using terminal and be in the same directory where you copied .yml file, execute the follow command: <b>docker-compose up -d</b>. This command will download all the images you need and after pulling it will up the examples of these images(containers) which will work properly thanks to docker network.
After ending the process you can check that it works fine by entering the next command <b>docker ps -a</b>

* Now, go to the http://localhost:8081/ in your browser. Here you can see ui-client for MongoDB-interaction. In another words by using this way you will be able to manage your own database directly.
So, you need to find database called <b>fea_test</b> and after finding click on it. As a result you will see two collections: <b>allwords</b> and <b>studywords</b> and at the same time you can find here an "Import" - buttons for each of them which allows you to import any dictionary-file. Let's do it for the "allwords"-collection. But before doing that please copy initialDictionary.json file which you can find at the same place: ./.user_artifacts.
Now click the import button and in the system window choose .json file you've just copied on your local machine.

* And as the last step you should go to the http://localhost:3000/. This is an entry-point of your application.
As a first step you should choose some words from the dictionary by following as <b>Vocabulary > Choose words</b>.
Right after that you can use it in the correct way.

* <b>Important!</b> After usage you can stop all those containers by using a command <b>docker compose stop</b>. It saves your containers alive just shutting it down without deleting so that the next time you are going to use it, you would just execute <b>docker compose up -d</b> and that's it.
