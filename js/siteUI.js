let contentScrollPosition = 0;
Init_UI();

async function Init_UI() {
    let bookmarks = await API_GetBookmarks();
    if (bookmarks) {
        let categories = [...new Set(bookmarks.map(bookmark => bookmark.Category))];
        updateDropDownMenu(categories);
    }

    renderBookmarks();
    
    $("#createBookmark").on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $("#abort").on("click", async function () {
        renderBookmarks();
    });
    $("#aboutCmd").on("click", function () {
        renderAbout();
    });
}
let selectedCategory = "";

function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
    `);
    DDMenu.append(`<div class="dropdown-divider"></div>`);
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append(`
            <div class="dropdown-item menuItemLayout category" data-category="${category}">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `);
    });
    DDMenu.append(`<div class="dropdown-divider"></div>`);
    DDMenu.append(`
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
    `);

    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        selectedCategory = "";
        renderBookmarks();
    });
    $('.category').on("click", function () {
        selectedCategory = $(this).data('category');
        renderBookmarks();
    });
}

function renderAbout() {
  saveContentScrollPosition();
  eraseContent();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("About...");
  $("#content").append(
    $(`<div class="aboutContainer">
                <h2>Favoris Manager</h2>
                <hr>
                <p>
                Labo1
                </p>
                <p>
                    Jacob Lebel-Frenette
                </p>
                <p>
                    2024
                </p>
            </div>`)
  );
}

async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();

    let bookmarks = await API_GetBookmarks();
    console.log("Bookmarks:", bookmarks); 

    eraseContent();
    
    if (bookmarks !== null && bookmarks.length > 0) {
        let filteredBookmarks = selectedCategory === "" ? bookmarks : bookmarks.filter(bookmark => bookmark.Category === selectedCategory);
        
        if (filteredBookmarks.length > 0) {
            filteredBookmarks.forEach((bookmark) => {
                $("#content").append(renderBookmark(bookmark));
            });
        } else {
            renderError("Aucun favoris trouver pour cette categorie");
        }

        restoreContentScrollPosition();
        
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) {
            e.preventDefault();
        });
    } else {
        renderError("Aucun favori");
    }
}

function showWaitingGif() {
  $("#content").empty();
  $("#content").append(
    $(
      "<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>"
    )
  );
}

function eraseContent() {
  $("#content").empty();
}

function saveContentScrollPosition() {
  contentScrollPosition = $("#content")[0].scrollTop;
}

function restoreContentScrollPosition() {
  $("#content")[0].scrollTop = contentScrollPosition;
}

function renderError(message) {
  eraseContent();
  $("#content").append($(`<div class="errorContainer">${message}</div>`));
}

function renderCreateBookmarkForm() {
  renderBookmarkForm();
}

async function renderEditBookmarkForm(id) {
  showWaitingGif();
  let bookmark = await API_GetBookmark(id);
  if (bookmark !== null) renderBookmarkForm(bookmark);
  else renderError("Bookmark not found!");
}

async function renderDeleteBookmarkForm(id) {
  showWaitingGif();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("Supprimer");
  let bookmark = await API_GetBookmark(id);
  eraseContent();
  if (bookmark !== null) {
    $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Supprimer le favori suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkIcon">
                <img src="https://www.google.com/s2/favicons?domain=${bookmark.URL}" alt="Site Icon">
            </div>
            <div class="bookmarkLayout">
                <span class="bookmarkTitle">${bookmark.Title}</span>
                <span class="bookmarkCategory">${bookmark.Category}</span> <!-- Blue category text -->
            </div>
        </div>
    </div>
            <br>
            <input type="button" value="Supprimer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
    $("#deleteBookmark").on("click", async function () {
      showWaitingGif();
      let result = await API_DeleteBookmark(bookmark.Id);
      if (result) renderBookmarks();
      else renderError("An error occurred!");
    });
    $("#cancel").on("click", function () {
      renderBookmarks();
    });
  } else {
    renderError("Bookmark not found!");
  }
}

function newBookmark() {
  return { Id: 0, Title: "", URL: "", Category: "" };
}

function renderBookmarkForm(bookmark = null) {
  $("#createBookmark").hide();
  $("#abort").show();
  eraseContent();
  let create = bookmark == null;
  if (create) bookmark = newBookmark();
  $("#actionTitle").text(create ? "Création" : "Modification");
  $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <label for="Title" class="form-label">Titre</label>
            <input 
                class="form-control"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                value="${bookmark.Title}"
            />
            <label for="URL" class="form-label">URL</label>
            <input 
                class="form-control"
                name="URL"
                id="URL"
                placeholder="URL"
                required
                value="${bookmark.URL}"
            />
            <label for="Category" class="form-label">Catégorie</label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
  $("#bookmarkForm").on("submit", async function (event) {
    event.preventDefault();
    let bookmark = getFormData($("#bookmarkForm"));
    bookmark.Id = parseInt(bookmark.Id);
    showWaitingGif();
    let result = await API_SaveBookmark(bookmark, create);
    if (result) renderBookmarks();
    else renderError("An error occurred!");
  });
  $("#cancel").on("click", function () {
    renderBookmarks();
  });
}

function getFormData($form) {
  const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
  var jsonObject = {};
  $.each($form.serializeArray(), (index, control) => {
    jsonObject[control.name] = control.value.replace(removeTag, "");
  });
  return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`<div class="bookmarkRow" bookmark_id=${bookmark.Id}>
        <div class="bookmarkContainer noselect">
            <div class="bookmarkIcon">
                <img src="https://www.google.com/s2/favicons?domain=${bookmark.URL}" alt="Site Icon">
            </div>
            <div class="bookmarkLayout">
                <span class="bookmarkTitle">${bookmark.Title}</span>
                <span class="bookmarkCategory">${bookmark.Category}</span> <!-- Category displayed here -->
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Supprimer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>`);
}
$('#allCatCmd').on("click", function () {
    selectedCategory = ""; 
    renderBookmarks();
});

$('.category').on("click", function () {
    selectedCategory = $(this).data('category');  
    renderBookmarks();
});
