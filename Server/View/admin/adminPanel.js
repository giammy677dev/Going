// Script Avvio Pagina

// Script Dati Utente

function drawSegnalazioni() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", '/getSegnalazioni', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok) {
      var table = document.createElement('table');
      const segnalazioni = r.data.segnalazioni;

      var tr = document.createElement('tr');

      for (const [key, value] of Object.entries(segnalazioni[0] || {})) {
        var td1 = document.createElement('th');
        var text1 = document.createTextNode(key);
        td1.appendChild(text1);
        tr.appendChild(td1);
      }
      var td1 = document.createElement('th');
      var text1 = document.createTextNode("accept");
      td1.appendChild(text1);
      tr.appendChild(td1);
      var td1 = document.createElement('th');
      var text1 = document.createTextNode("delete");
      td1.appendChild(text1);
      tr.appendChild(td1);

      table.appendChild(tr);
      

      segnalazioni.forEach(function (segnalazione) {
        var tr = document.createElement('tr');
        //segnalazione.motivazione = getTypeNameFromType(segnalazione.motivazione)

        for (const [key, value] of Object.entries(segnalazione)) {
          var td1 = document.createElement('td');
          var text1 = document.createTextNode(value);
          td1.appendChild(text1);
          tr.appendChild(td1);
        }

        var td1 = document.createElement('td');
        var radioButtonAccept = document.createElement("INPUT");
        radioButtonAccept.setAttribute("type", "radio");
        radioButtonAccept.setAttribute("name", segnalazione.idSegnalazione);
        radioButtonAccept.setAttribute("action", "accept");
        td1.appendChild(radioButtonAccept);
        tr.appendChild(td1);

        var td1 = document.createElement('td');
        var radioButtonDelete = document.createElement("INPUT");
        radioButtonDelete.setAttribute("type", "radio");
        radioButtonDelete.setAttribute("name", segnalazione.idSegnalazione);
        radioButtonDelete.setAttribute("action", "ignore");
        td1.appendChild(radioButtonDelete);
        tr.appendChild(td1);

        table.appendChild(tr);
      });
      document.getElementById("boxTable").appendChild(table);
    }
  }

  xhr.send();
}

function handleSegnalazioni() {
  var radios = document.getElementsByTagName('input');
  var body = []
  for (i = 0; i < radios.length; i++) {
    if (radios[i].type.toLowerCase() == 'radio' && radios[i].checked) {
      const action = radios[i].getAttribute('action');
      const idSegnalazione = radios[i].getAttribute('name');
      body.push({ idSegnalazione: Number(idSegnalazione), action: action })
    }
  }
  var xhr = new XMLHttpRequest();

  xhr.open("POST", '/updateSegnalazioni', true);

  xhr.onload = function (event) {
    const r = JSON.parse(event.target.responseText);

    if (r.ok) {
      //update page if everything goes well. f5
      window.alert("operazione eseguita!");
      location.href = "/adminPanel";
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(body));
  
}