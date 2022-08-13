function tagList() {
    const tag = ["Cultura", "Tracking", "Sport", "Aria Aperta", "tag1", "tag2", "tag3", "tag1", "tag2", "tag3"]

    const root = document.getElementById("lista_tag")
    for (var i = 0; i < tag.length; i++) {
      let now = tag[i]
      let html_code = '<option value="' + now + '">' + now + '</option>'
      root.insertAdjacentHTML("beforeend", html_code)
    }

  }