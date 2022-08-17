function rating(value){
    var points = value
    alert("Punteggio: "+value)
}

function heart(){
    const button = document.querySelector(".heart-like-button");
      var point =0;
  
    if (button.classList.contains("liked")) {
      button.classList.remove("liked");
      point=0
      alert("Non mi piace più, Punteggio="+point)
    } else {
      button.classList.add("liked");
      point=1
      alert("Mi piace, Punteggio="+point)
    }
  };