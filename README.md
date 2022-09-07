
# Software Architecture Design Project

Repository del progetto realizzato per l'esame di Software Architecture Design, per il corso di Laurea Magistrale in Ingegneria Informatica dell'Università Federico II di Napoli.

### Sviluppatori

- Matteo Maraniello ([@matemmequadro](https://github.com/matemmequadro))
- Valerio Mennillo ([@valeriomennillo](https://github.com/valeriomennillo))
- Gian Marco Orlando ([@giammy677dev](https://github.com/giammy677dev)), ([@giammy677](https://github.com/giammy677))
- Marco Perillo ([@Mav3rick26](https://github.com/Mav3rick26))
- Diego Russo ([@diegorusso95](https://github.com/diegorusso95))

## Obiettivo del Progetto 🚩

L'obiettivo è creare una Web App che permetta agli Utenti Non Registrati di cercare Roadmap create dagli Utenti Registrati e poi visualizzarle. Gli Utenti Non Registrati potranno effettuare tale ricerca dall’apposita barra presente direttamente in Homepage oppure visitando la pagina “Esplora”. Sarà possibile visitare la pagina “Esplora” anche non effettuando alcuna ricerca. In questo caso verranno mostrate alcune Roadmap suggerite selezionate in base ad alcuni criteri di qualità tra quelle presenti nella piattaforma. Effettuando, invece, una ricerca per parole chiave, verranno mostrate tutte le Roadmap ed i profili degli Utenti Registrati che corrispondono a tali parametri. Tramite gli appositi campi presenti subito sotto la barra di ricerca, sarà possibile filtrare i risultati inserendo ulteriori parametri. Quando si farà riferimento ad alcune funzionalità riservate agli utenti registrati, il sistema rileva che l’Utente non è attualmente Autenticato all’interno del sistema ed apparirà a video un popup che invita ad effettuare il login o la registrazione. L’Utente Non Registrato potrà, dunque, decidere di iscriversi premendo sull’apposito bottone. Si verrà, dunque, re-indirizzati alla pagina di registrazione nella quale sarà possibile inserire i propri dati. Una volta completata la fase di registrazione, il sito effettuerà il redirect sulla homepage. Da qui, tramite l’apposito bottone, sarà possibile effettuare il login.

Il sistema, a valle del login, permetterà di creare una Roadmap visitando l’apposita pagina "Crea" accessibile tramite Homepage o, ancora, tramite la barra di navigazione presente nelle altre pagine. L'Utente inserirà titolo, visibilità (pubblica di default o privata) e modalità di percorrenza (a piedi di default o in macchina); tramite poi un tasto "salva impostazioni" permetterà l'accesso alla descrizione (facoltativa) ed alla mappa.

Interagendo con la mappa sarà possibile aggiungere Stage alla propria Roadmap. Uno Stage è punto di interesse già presente su Google Maps oppure punti di interesse creati ex-novo. Per entrambi si dovrà inserire obbligatoriamente la durata di sosta. Una volta terminata la propria Roadmap, l’Utente Autenticato potrà pubblicarla tramite l’apposito bottone di conferma. Alla pressione di tale bottone, l’Utente Autenticato sarà automaticamente indirizzato alla pagina di visualizzazione della Roadmap appena creata.

Ulteriori funzionalità esclusive degli Utenti Autenticati che il sistema dovrà offrire è quella di aggiungere una Roadmap al proprio elenco di Roadmap Preferite e/o Seguite, di pubblicare un commento o una recensione ad una Roadmap nella pagina di visualizzazione di una Roadmap. Interagendo in questi ed altri modi, gli Utenti Autenticati potranno guadagnare diversi achievement relativi, ad esempio, alla pubblicazione di un certo numero di nuove Roadmap, all’aggiunta di un certo numero di Roadmap ai Preferiti o ai Seguiti o alla pubblicazione di un certo numero di commenti o recensioni. Inoltre - accedendo al proprio profilo premendo sul proprio avatar presente in alto a destra su qualsiasi pagina del sito una volta che si è effettuato l’accesso - ogni Utente Autenticato potrà visualizzare le proprie Roadmap private o, ancora, modificare il proprio avatar facendo click su quello corrente.


## Tecnologie Utilizzate ⚙

| Backend   |                                               |
| --------- | --------------------------------------------- |
| Language  | JavaScript  |
| Framework | Express            |
| Testing   | Jest                    |
| | Postman
| Database  | Azure Database MySQL|
| Hosting   | Azure Hosting
| API esterne|Google Maps API

|  Frontend      |                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Language      | JavaScript  
| |HTML
| |CSS 


| Tools                  |                                    |
| ---------------------- | ---------------------------------- |
| Code Editor            |Visual Studio Code|
| UML Design             | VisualParadigm|
| Graphic Design         | Photoshop

## Documentazione 📄

Il documento prodotto è stato suddiviso in capitoli:
Nel <b>capitolo 1</b> si ha una descrizione riguardante l'avvio del progetto, il glossario dei termini, le parti interessate nell'applicazione, la tabella Attori-Obiettivi, le storie Utente, requisiti generali e di qualità, i vincoli, la stima dei costi e il System Context Diagram;<br>
Nel <b>capitolo 2</b> riportiamo il processo di sviluppo tra cui UP (Unified Process), eXtreme Programming, Scrum ed i tool utilizzati per la condivisione del lavoro ed tool e le tecnologie utilizzate per lo sviluppo;<br> 
Nel <b>capitolo 3</b> riportiamo la fase di analisi, si è esposta l'Analisi e Specifica dei Requisiti, il  Modello dei Casi d’Uso, il Diagramma delle Classi ed i System Sequence Diagram dei casi d'uso più rilevanti;<br> 
Nel <b>capitolo 4</b>, Architettura e Progettazione, andiamo ad esporre i Pattern Architetturali e gli Stili Architetturali utilizzati, con la Vista Componenti e Connettori e la Dinamica dei componenti, i System Sequence Diagram raffinati, il Diagramma delle Classi raffinato ed il Context Diagram with Boundary;<br> 
Nel <b>capitolo 5</b> descriviamo la fase di Implementazione ed in particolare abbiamo esposto come abbiamo organizzato il codice, la descrizione dei file realizzati uno per uno, i Design Pattern utilizzati, le motivazioni e l'uso di AJAX, Google Maps API e le relative key, il diagramma Entità Relazione ed un manuale di utilizzo corredato da immagini ed un video demo su Youtube;<br>
Nel <b>capitolo 6</b> infine, si è esposto il Testing, il Test suite ed i risultati ottenuti.

[//link doc caricato](https://github.com/mconti99/Software_Architecture_Design_2022/blob/main/Documentazione_SAD.pdf)

## Link al nosto sito 🌐
[Going](https://going-app.azurewebsites.net/)

## Video Demo 📹
[YouTube Link](https://www.youtube.com/watch?v=pHQr3rZmKuY)
